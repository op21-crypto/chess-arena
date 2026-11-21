import https from 'https';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'arena-e49f1';
const API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyCt1mVfba7ydMIzUOwgJLPX-xBKdIsn5YY';
const BASE_HOST = 'firestore.googleapis.com';
const BASE_PATH = `/v1/projects/${PROJECT_ID}/databases/(default)/documents/rooms`;

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
    return (val.arrayValue.values || []).map(fromFirestoreValue);
  }
  if ('mapValue' in val) {
    const res = {};
    for (const [k, v] of Object.entries(val.mapValue.fields || {})) {
      res[k] = fromFirestoreValue(v);
    }
    return res;
  }
  return null;
}

function httpsRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(4000, () => {
      req.destroy();
      reject(new Error('Firestore REST request timeout'));
    });
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

export const firestoreRestService = {
  async getRoom(roomId) {
    if (!roomId) return null;
    try {
      const path = `${BASE_PATH}/${encodeURIComponent(roomId)}?key=${API_KEY}`;
      const res = await httpsRequest({
        hostname: BASE_HOST,
        path,
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (res.status === 200 && res.data?.fields) {
        const doc = {};
        for (const [k, v] of Object.entries(res.data.fields)) {
          doc[k] = fromFirestoreValue(v);
        }
        return doc;
      }
      return null;
    } catch (err) {
      console.warn(`[Firestore REST] getRoom(${roomId}) fallback:`, err.message);
      return null;
    }
  },

  async saveRoom(room) {
    if (!room?.id) return false;
    try {
      const path = `${BASE_PATH}/${encodeURIComponent(room.id)}?key=${API_KEY}`;
      const fields = {};
      for (const [k, v] of Object.entries(room)) {
        if (v !== undefined) {
          fields[k] = toFirestoreValue(v);
        }
      }
      const res = await httpsRequest({
        hostname: BASE_HOST,
        path,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }, { fields });
      return res.status >= 200 && res.status < 300;
    } catch (err) {
      console.warn(`[Firestore REST] saveRoom(${room.id}) fallback:`, err.message);
      return false;
    }
  },

  async updateRoom(roomId, updates) {
    if (!roomId || !updates) return null;
    try {
      let room = await this.getRoom(roomId);
      if (!room) {
        room = { id: roomId, ...updates };
      } else {
        room = { ...room, ...updates, lastUpdated: Date.now() };
      }
      await this.saveRoom(room);
      return room;
    } catch (err) {
      console.warn(`[Firestore REST] updateRoom(${roomId}) fallback:`, err.message);
      return null;
    }
  }
};
