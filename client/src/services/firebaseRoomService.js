import { firebaseConfig, loadFirebaseModules } from '../utils/firebase.js';

let firestoreInstance = null;
let firestoreSdk = null;

const REST_BASE = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/rooms`;
const API_KEY = firebaseConfig.apiKey;

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return { integerValue: String(val) };
    return { doubleValue: val };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function fromFirestoreValue(val) {
  if (!val) return null;
  if ('nullValue' in val) return null;
  if ('booleanValue' in val) return val.booleanValue;
  if ('integerValue' in val) return parseInt(val.integerValue, 10);
  if ('doubleValue' in val) return val.doubleValue;
  if ('stringValue' in val) return val.stringValue;
  if ('timestampValue' in val) return val.timestampValue;
  if ('arrayValue' in val) {
    return (val.arrayValue?.values || []).map(fromFirestoreValue);
  }
  if ('mapValue' in val) {
    const res = {};
    for (const [k, v] of Object.entries(val.mapValue?.fields || {})) {
      res[k] = fromFirestoreValue(v);
    }
    return res;
  }
  return null;
}

export async function getFirestoreInstance() {
  if (firestoreInstance && firestoreSdk) {
    return { db: firestoreInstance, ...firestoreSdk };
  }

  try {
    const { app } = await loadFirebaseModules();
    const sdk = await import(
      /* @vite-ignore */ 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js'
    );
    firestoreInstance = sdk.getFirestore(app);
    firestoreSdk = sdk;
    return { db: firestoreInstance, ...firestoreSdk };
  } catch (err) {
    console.warn('[FirebaseRoomService] Firestore SDK dynamic load failed, utilizing robust REST bridge:', err);
    return null;
  }
}

// REST fallback implementations
async function restGetRoom(roomId) {
  try {
    const res = await fetch(`${REST_BASE}/${encodeURIComponent(roomId)}?key=${API_KEY}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (json?.fields) {
      const room = {};
      for (const [k, v] of Object.entries(json.fields)) {
        room[k] = fromFirestoreValue(v);
      }
      return room;
    }
    return null;
  } catch (err) {
    console.warn('[FirebaseRoomService REST] get error:', err);
    return null;
  }
}

async function restSaveRoom(room) {
  if (!room?.id) return null;
  try {
    const fields = {};
    for (const [k, v] of Object.entries(room)) {
      if (v !== undefined) {
        fields[k] = toFirestoreValue(v);
      }
    }
    const res = await fetch(`${REST_BASE}/${encodeURIComponent(room.id)}?key=${API_KEY}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });
    return res.ok;
  } catch (err) {
    console.warn('[FirebaseRoomService REST] save error:', err);
    return false;
  }
}

export const firebaseRoomService = {
  async createRoom(room) {
    if (!room?.id) return false;
    const cleanRoom = {
      ...room,
      chatMessages: room.chatMessages || [],
      moveHistory: room.moveHistory || [],
      capturedPieces: room.capturedPieces || { white: [], black: [] },
      typingUsers: room.typingUsers || {},
      voiceSignals: room.voiceSignals || [],
      createdAt: room.createdAt || new Date().toISOString(),
      lastUpdated: Date.now()
    };

    try {
      const inst = await getFirestoreInstance();
      if (inst) {
        const { db, doc, setDoc } = inst;
        const ref = doc(db, 'rooms', room.id);
        await setDoc(ref, cleanRoom, { merge: true });
        return true;
      }
    } catch (e) {
      console.warn('[FirebaseRoomService] createRoom SDK fallback:', e);
    }
    return await restSaveRoom(cleanRoom);
  },

  async getRoom(roomId) {
    if (!roomId) return null;
    try {
      const inst = await getFirestoreInstance();
      if (inst) {
        const { db, doc, getDoc } = inst;
        const ref = doc(db, 'rooms', roomId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          return snap.data();
        }
      }
    } catch (e) {
      console.warn('[FirebaseRoomService] getRoom SDK fallback:', e);
    }
    return await restGetRoom(roomId);
  },

  async joinRoom(roomId, activeUser) {
    if (!roomId || !activeUser) return null;
    const current = (await this.getRoom(roomId)) || {
      id: roomId,
      whitePlayer: null,
      blackPlayer: null,
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      status: 'active',
      moveHistory: [],
      capturedPieces: { white: [], black: [] },
      chatMessages: [],
      typingUsers: {},
      createdAt: new Date().toISOString(),
      lastUpdated: Date.now()
    };

    let updated = { ...current };
    if (!updated.chatMessages) updated.chatMessages = [];
    if (!updated.moveHistory) updated.moveHistory = [];
    if (!updated.typingUsers) updated.typingUsers = {};
    if (!updated.voiceSignals) updated.voiceSignals = [];

    // Assign open player seat
    if (!updated.whitePlayer && (!updated.blackPlayer || updated.blackPlayer.id !== activeUser.id)) {
      updated.whitePlayer = activeUser;
      updated.status = 'active';
    } else if (!updated.blackPlayer && (!updated.whitePlayer || updated.whitePlayer.id !== activeUser.id)) {
      updated.blackPlayer = activeUser;
      updated.status = 'active';
    } else if (updated.whitePlayer && updated.blackPlayer) {
      updated.status = 'active';
    }

    updated.lastUpdated = Date.now();
    await this.createRoom(updated);
    return updated;
  },

  async updateRoomMove(roomId, { fen, move, turn, status, winner, winReason, whiteTime, blackTime, capturedPieces }) {
    if (!roomId) return false;
    try {
      const current = await this.getRoom(roomId);
      if (!current) return false;

      const history = current.moveHistory ? [...current.moveHistory] : [];
      if (move) history.push(move);

      const updates = {
        ...current,
        fen: fen || current.fen,
        turn: turn || current.turn,
        status: status || current.status,
        winner: winner !== undefined ? winner : current.winner,
        winReason: winReason !== undefined ? winReason : current.winReason,
        moveHistory: history,
        whiteTime: whiteTime !== undefined ? whiteTime : current.whiteTime,
        blackTime: blackTime !== undefined ? blackTime : current.blackTime,
        capturedPieces: capturedPieces || current.capturedPieces,
        lastUpdated: Date.now()
      };

      return await this.createRoom(updates);
    } catch (e) {
      console.warn('[FirebaseRoomService] updateRoomMove error:', e);
      return false;
    }
  },

  async sendRoomChat(roomId, message) {
    if (!roomId || !message) return false;
    try {
      const current = await this.getRoom(roomId);
      if (!current) return false;
      const msgs = current.chatMessages ? [...current.chatMessages] : [];
      msgs.push(message);
      if (msgs.length > 100) msgs.splice(0, msgs.length - 100);
      return await this.createRoom({
        ...current,
        chatMessages: msgs,
        lastUpdated: Date.now()
      });
    } catch (e) {
      console.warn('[FirebaseRoomService] sendRoomChat error:', e);
      return false;
    }
  },

  async sendRoomTyping(roomId, user, isTyping) {
    if (!roomId || !user) return false;
    try {
      const current = await this.getRoom(roomId);
      if (!current) return false;
      const typing = { ...(current.typingUsers || {}) };
      const uid = user.id || user.username;
      if (isTyping) {
        typing[uid] = { id: uid, username: user.username, timestamp: Date.now() };
      } else {
        delete typing[uid];
      }
      return await this.createRoom({
        ...current,
        typingUsers: typing,
        lastUpdated: Date.now()
      });
    } catch (e) {
      console.warn('[FirebaseRoomService] sendRoomTyping error:', e);
      return false;
    }
  },

  async sendRoomVoice(roomId, { action, from, by, accept, signal }) {
    if (!roomId) return false;
    try {
      const current = await this.getRoom(roomId);
      if (!current) return false;
      let voiceCall = current.voiceCall;
      let voiceSignals = current.voiceSignals ? [...current.voiceSignals] : [];

      if (action === 'request') {
        voiceCall = { status: 'requesting', from, requestedAt: Date.now() };
      } else if (action === 'respond') {
        voiceCall = { status: accept ? 'connected' : 'declined', by: by || from, respondedAt: Date.now() };
      } else if (action === 'end') {
        voiceCall = null;
        voiceSignals = [];
      } else if (action === 'signal' && signal) {
        voiceSignals.push({ from: from?.id || from?.username, signal, timestamp: Date.now() });
        if (voiceSignals.length > 20) voiceSignals = voiceSignals.slice(-20);
      }

      return await this.createRoom({
        ...current,
        voiceCall,
        voiceSignals,
        lastUpdated: Date.now()
      });
    } catch (e) {
      console.warn('[FirebaseRoomService] sendRoomVoice error:', e);
      return false;
    }
  },

  subscribeToRoom(roomId, onUpdate) {
    if (!roomId || typeof onUpdate !== 'function') return () => {};

    let unsubscribeSnapshot = null;
    let pollInterval = null;
    let isCleanedUp = false;

    // Attach real-time Firestore onSnapshot listener
    getFirestoreInstance()
      .then(inst => {
        if (isCleanedUp || !inst) return;
        const { db, doc, onSnapshot } = inst;
        const ref = doc(db, 'rooms', roomId);
        unsubscribeSnapshot = onSnapshot(
          ref,
          (snap) => {
            if (snap.exists()) {
              onUpdate(snap.data());
            }
          },
          (err) => {
            console.warn('[FirebaseRoomService] onSnapshot error:', err);
          }
        );
      })
      .catch(err => {
        console.warn('[FirebaseRoomService] onSnapshot setup error:', err);
      });

    // Also maintain a resilient HTTP poll every 1200ms
    pollInterval = setInterval(async () => {
      if (isCleanedUp) return;
      try {
        const room = await this.getRoom(roomId);
        if (room && !isCleanedUp) {
          onUpdate(room);
        }
      } catch {}
    }, 1200);

    return () => {
      isCleanedUp = true;
      if (unsubscribeSnapshot) {
        try {
          unsubscribeSnapshot();
        } catch {}
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }
};
