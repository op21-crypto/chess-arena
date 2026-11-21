import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import https from 'https';
import { Database, getProgressionTier } from '../db/database.js';
import { aiEngine } from '../engine/aiEngine.js';
import { CHESS_PUZZLES, PUZZLE_THEMES, PUZZLE_OPENINGS_LIST, CHESS_LESSONS } from '../puzzles/puzzleData.js';
import { tournamentManager } from '../tournaments/tournamentManager.js';
import { firestoreRestService } from '../services/firestoreRestService.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'chess-arena-super-secure-key-2026';

// Middleware: Authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
    } else {
      const dbUser = Database.getUserById(user.id);
      const userEmail = (user.email || dbUser?.email || '').toLowerCase().trim();
      if (userEmail === 'op21plus@gmail.com') {
        user.role = 'admin';
      } else {
        user.role = dbUser?.role === 'guest' ? 'guest' : 'user';
      }
      req.user = user;
    }
    next();
  });
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

router.use(authenticateToken);

// ================= GLOBAL APP CONFIGURATION =================
router.get('/config', (req, res) => {
  res.json({ config: Database.getAppConfig() });
});

// ================= AUTHENTICATION =================

// Register
router.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password, country, avatar } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === 'op21plus@gmail.com') {
      return res.status(400).json({ error: 'This account already exists. Please sign in via Google or password.' });
    }
    if (Database.getUserByUsername(username)) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    if (Database.getUserByEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const userId = `u_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const user = Database.createUser({
      id: userId,
      username,
      email,
      passwordHash,
      country: country || 'US',
      avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`
    });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const { passwordHash: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // username or email
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username/email and password required' });
    }

    const user = Database.getUserByUsername(identifier) || Database.getUserByEmail(identifier);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (user.banned) {
      return res.status(403).json({ error: 'This account has been suspended by an administrator' });
    }

    const isOp = (user.email && user.email.toLowerCase().trim() === 'op21plus@gmail.com');
    if (isOp) {
      // Verify against password or Master Admin PIN (default: 212121)
      const pinMatch = Database.verifyAdminPin(password);
      const passMatch = user.passwordHash ? bcrypt.compareSync(password, user.passwordHash) : false;
      if (!pinMatch && !passMatch) {
        return res.status(403).json({ error: 'Master Admin Identity Verification Failed: Invalid Master Security PIN or Password.' });
      }
    } else {
      const isMatch = bcrypt.compareSync(password, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
    }

    user.role = isOp ? 'admin' : (user.role === 'guest' ? 'guest' : 'user');

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const { passwordHash: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Guest Mode
router.post('/auth/guest', (req, res) => {
  const guestNum = Math.floor(1000 + Math.random() * 9000);
  const guestId = `guest_${Date.now()}_${guestNum}`;
  const username = `Guest_${guestNum}`;

  const user = Database.createUser({
    id: guestId,
    username,
    email: `guest_${guestNum}@chessarena.local`,
    passwordHash: '',
    role: 'guest',
    country: 'UN',
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`
  });

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { passwordHash: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// Google / Gmail Authentication
router.post('/auth/google', async (req, res) => {
  try {
    const { email, name, avatar } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required for Google sign in' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const isOp = cleanEmail === 'op21plus@gmail.com';

    // Strict identity verification for op21plus@gmail.com: require Master Admin PIN
    if (isOp) {
      const { adminPin } = req.body;
      if (!adminPin || !Database.verifyAdminPin(adminPin)) {
        return res.status(403).json({
          error: 'Master Admin Identity Verification Failed: Valid 6-digit Master PIN is required to verify ownership of op21plus@gmail.com'
        });
      }
    }

    let user = Database.getUserByEmail(cleanEmail);

    if (!user) {
      const baseName = (name || cleanEmail.split('@')[0]).replace(/[^a-zA-Z0-9_]/g, '_');
      const uniqueSuffix = Math.floor(100 + Math.random() * 900);
      let username = isOp ? 'op21plus' : baseName;
      if (!isOp && Database.getUserByUsername(username)) {
        username = `${baseName}_${uniqueSuffix}`;
      }

      const userId = isOp ? 'admin_op21' : `g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      user = Database.createUser({
        id: userId,
        username,
        email: cleanEmail,
        passwordHash: '',
        role: isOp ? 'admin' : 'user',
        provider: 'google',
        country: isOp ? 'IN' : 'US',
        countryName: isOp ? 'India' : 'United States',
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`
      });
    } else {
      user.role = isOp ? 'admin' : 'user';
      Database.updateUser(user.id, { role: user.role, provider: 'google', ...(avatar ? { avatar } : {}) });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const { passwordHash: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Current User Profile
router.get('/auth/me', requireAuth, (req, res) => {
  const user = Database.getUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const cleanEmail = (user.email || '').toLowerCase().trim();
  user.role = cleanEmail === 'op21plus@gmail.com' ? 'admin' : (user.role === 'guest' ? 'guest' : 'user');
  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

// ================= PROFILES & LEADERBOARDS =================

router.get('/users/:id', (req, res) => {
  const user = Database.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const recentGames = Database.getUserGames(user.id, 10);
  const { passwordHash: _, ...safeUser } = user;
  const progression = getProgressionTier(user.ratings.rapid || 1200);

  res.json({
    user: safeUser,
    progression,
    recentGames
  });
});

router.post('/users/:id/update', requireAuth, (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Permission denied' });
  }

  const { avatar, country, countryName } = req.body;
  const updated = Database.updateUser(req.params.id, {
    ...(avatar && { avatar }),
    ...(country && { country }),
    ...(countryName && { countryName })
  });

  const { passwordHash: _, ...safeUser } = updated;
  res.json({ user: safeUser });
});

router.get('/leaderboard', (req, res) => {
  const format = req.query.format || 'rapid';
  const country = req.query.country || 'world';
  let allUsers = Database.getAllUsers().filter(u => !u.banned && u.role !== 'guest');

  if (country && country !== 'world' && country !== 'all') {
    allUsers = allUsers.filter(u => u.country?.toUpperCase() === country.toUpperCase());
  }

  // Sort by selected format rating
  const sorted = allUsers.sort((a, b) => {
    const rA = a.ratings?.[format] || 1200;
    const rB = b.ratings?.[format] || 1200;
    return rB - rA;
  });

  const limit = (country && country !== 'world' && country !== 'all') ? 20 : 50;
  const leaderboard = sorted.slice(0, limit).map((u, idx) => ({
    rank: idx + 1,
    id: u.id,
    username: u.username,
    avatar: u.avatar,
    country: u.country,
    countryName: u.countryName,
    rating: u.ratings?.[format] || 1200,
    progression: getProgressionTier(u.ratings?.[format] || 1200),
    stats: u.stats,
    puzzles: u.stats?.puzzles || Math.floor((idx + 1) * 12 + 45),
    isOnline: Boolean(u.isOnline)
  }));

  res.json({ format, country, leaderboard });
});

// ================= GAME ANALYSIS & AI =================

// Stockfish AI Move calculation
router.post('/ai/move', async (req, res) => {
  try {
    const { fen, level = 2 } = req.body;
    if (!fen) return res.status(400).json({ error: 'FEN string required' });

    const move = await aiEngine.getAIMove(fen, level);
    res.json(move);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Move-by-move game analysis with Stockfish
router.post('/games/analyze', async (req, res) => {
  try {
    const { moves } = req.body;
    if (!moves || !Array.isArray(moves)) {
      return res.status(400).json({ error: 'Moves array required' });
    }

    const analysis = await aiEngine.analyzeGame(moves);
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Game by ID
router.get('/games/:id', (req, res) => {
  const game = Database.getGameById(req.params.id);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  res.json({ game });
});

// ================= ROOMS (FRIEND PLAY & CENTRALIZED FIRESTORE SYNC) =================

router.post('/rooms/create', async (req, res) => {
  const { roomId, timeControl, colorPreference, user } = req.body;
  const id = roomId || `arena_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const baseMinutes = timeControl?.baseMinutes || 10;
  
  const hostPlayer = user || {
    id: `guest_${Date.now()}`,
    username: 'Host_Player',
    role: 'guest',
    elo: 1200
  };

  // Strictly random 50/50 color allocation for private rooms
  const isWhite = Math.random() > 0.5;

  const room = {
    id,
    whitePlayer: isWhite ? hostPlayer : null,
    blackPlayer: isWhite ? null : hostPlayer,
    timeControl: { baseMinutes, incrementSeconds: timeControl?.incrementSeconds || 0 },
    whiteTime: baseMinutes * 60 * 1000,
    blackTime: baseMinutes * 60 * 1000,
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    status: 'waiting',
    moveHistory: [],
    capturedPieces: { white: [], black: [] },
    chatMessages: [],
    typingUsers: {},
    voiceCall: null,
    voiceSignals: [],
    createdAt: new Date().toISOString(),
    lastUpdated: Date.now()
  };

  Database.saveGame(room);
  await firestoreRestService.saveRoom(room);
  res.json({ success: true, room });
});

// Universal Get Room (supports both ?id=... and /rooms/:id)
router.get(['/rooms/get', '/rooms/:id'], async (req, res) => {
  const roomId = req.query.id || req.params.id;
  if (!roomId) return res.status(400).json({ error: 'Room ID required' });
  
  // Try getting from Firestore first for authoritative multi-instance state
  let room = await firestoreRestService.getRoom(roomId);
  if (!room) {
    room = Database.getGameById(roomId);
  }

  if (!room) {
    room = {
      id: roomId,
      whitePlayer: { id: `host_${roomId}`, username: 'Host Player', elo: 1200 },
      blackPlayer: null,
      timeControl: { baseMinutes: 10, incrementSeconds: 0 },
      whiteTime: 600000,
      blackTime: 600000,
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      status: 'waiting',
      moveHistory: [],
      capturedPieces: { white: [], black: [] },
      chatMessages: [],
      typingUsers: {},
      voiceCall: null,
      voiceSignals: [],
      createdAt: new Date().toISOString(),
      lastUpdated: Date.now()
    };
    await firestoreRestService.saveRoom(room);
  } else {
    // Ensure room fields are initialized
    if (!room.chatMessages) room.chatMessages = [];
    if (!room.typingUsers) room.typingUsers = {};
    if (!room.voiceSignals) room.voiceSignals = [];
  }

  Database.saveGame(room);
  res.json({ room });
});

// Universal Join Room (supports both POST /rooms/join with body.roomId and POST /rooms/:id/join)
router.post(['/rooms/join', '/rooms/:id/join'], async (req, res) => {
  const roomId = req.body.roomId || req.params.id;
  if (!roomId) return res.status(400).json({ error: 'Room ID required' });
  
  const { user } = req.body;
  const joiningPlayer = user || {
    id: `guest_${Date.now()}`,
    username: 'Guest_Opponent',
    role: 'guest',
    elo: 1200
  };

  // Authoritative check from Firestore
  let room = await firestoreRestService.getRoom(roomId);
  if (!room) {
    room = Database.getGameById(roomId);
  }

  if (!room) {
    room = {
      id: roomId,
      whitePlayer: { id: `host_${roomId}`, username: 'Host Player', elo: 1200 },
      blackPlayer: joiningPlayer,
      timeControl: { baseMinutes: 10, incrementSeconds: 0 },
      whiteTime: 600000,
      blackTime: 600000,
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      status: 'active',
      moveHistory: [],
      capturedPieces: { white: [], black: [] },
      chatMessages: [],
      typingUsers: {},
      voiceCall: null,
      voiceSignals: [],
      createdAt: new Date().toISOString(),
      lastUpdated: Date.now()
    };
    Database.saveGame(room);
    await firestoreRestService.saveRoom(room);
    return res.json({ success: true, room });
  }

  if (!room.chatMessages) room.chatMessages = [];
  if (!room.typingUsers) room.typingUsers = {};
  if (!room.voiceSignals) room.voiceSignals = [];

  // Slot the joining player into the open seat
  if (!room.whitePlayer && (!room.blackPlayer || room.blackPlayer.id !== joiningPlayer.id)) {
    room.whitePlayer = joiningPlayer;
    room.status = 'active';
  } else if (!room.blackPlayer && (!room.whitePlayer || room.whitePlayer.id !== joiningPlayer.id)) {
    room.blackPlayer = joiningPlayer;
    room.status = 'active';
  } else if (room.whitePlayer && room.blackPlayer) {
    // Both seats occupied; activate room
    room.status = 'active';
  }

  room.lastUpdated = Date.now();
  Database.saveGame(room);
  await firestoreRestService.saveRoom(room);
  res.json({ success: true, room });
});

// Universal Room Chat (supports both POST /rooms/chat and POST /rooms/:id/chat)
router.post(['/rooms/chat', '/rooms/:id/chat'], async (req, res) => {
  const roomId = req.body.roomId || req.body.gameId || req.params.id;
  const { text, emoji, sender } = req.body;
  if (!roomId || (!text && !emoji)) return res.status(400).json({ error: 'Room ID and message required' });
  
  let room = await firestoreRestService.getRoom(roomId);
  if (!room) {
    room = Database.getGameById(roomId);
  }

  if (!room) {
    room = {
      id: roomId,
      whitePlayer: null,
      blackPlayer: null,
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      status: 'active',
      moveHistory: [],
      capturedPieces: { white: [], black: [] },
      chatMessages: [],
      typingUsers: {},
      voiceCall: null,
      voiceSignals: [],
      createdAt: new Date().toISOString(),
      lastUpdated: Date.now()
    };
  }
  if (!room.chatMessages) room.chatMessages = [];
  const newMsg = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    sender: sender || { username: 'Guest' },
    text,
    emoji,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  room.chatMessages.push(newMsg);
  if (room.chatMessages.length > 100) room.chatMessages = room.chatMessages.slice(-100);
  room.lastUpdated = Date.now();
  Database.saveGame(room);
  await firestoreRestService.saveRoom(room);
  res.json({ success: true, message: newMsg, chatMessages: room.chatMessages });
});

// Universal Room Typing status
router.post(['/rooms/typing', '/rooms/:id/typing'], async (req, res) => {
  const roomId = req.body.roomId || req.body.gameId || req.params.id;
  const { user, isTyping } = req.body;
  if (!roomId || !user) return res.status(400).json({ error: 'Room ID and user required' });
  
  let room = await firestoreRestService.getRoom(roomId);
  if (!room) {
    room = Database.getGameById(roomId);
  }

  if (room) {
    if (!room.typingUsers) room.typingUsers = {};
    const userId = user.id || user.username;
    if (isTyping) {
      room.typingUsers[userId] = {
        id: userId,
        username: user.username,
        timestamp: Date.now()
      };
    } else {
      delete room.typingUsers[userId];
    }
    // Clean expired typing (> 4 seconds)
    const now = Date.now();
    Object.keys(room.typingUsers).forEach(k => {
      if (now - (room.typingUsers[k]?.timestamp || 0) > 4000) delete room.typingUsers[k];
    });
    room.lastUpdated = Date.now();
    Database.saveGame(room);
    await firestoreRestService.saveRoom(room);
  }
  res.json({ success: true });
});

// Universal Room Voice Signaling Fallback
router.post(['/rooms/voice', '/rooms/:id/voice'], async (req, res) => {
  const roomId = req.body.roomId || req.body.gameId || req.params.id;
  const { action, from, by, accept, signal } = req.body;
  if (!roomId) return res.status(400).json({ error: 'Room ID required' });
  
  let room = await firestoreRestService.getRoom(roomId);
  if (!room) {
    room = Database.getGameById(roomId);
  }

  if (room) {
    if (action === 'request') {
      room.voiceCall = { status: 'requesting', from, requestedAt: Date.now() };
    } else if (action === 'respond') {
      room.voiceCall = { status: accept ? 'connected' : 'declined', by: by || from, respondedAt: Date.now() };
    } else if (action === 'end') {
      room.voiceCall = null;
      room.voiceSignals = [];
    } else if (action === 'signal' && signal) {
      if (!room.voiceSignals) room.voiceSignals = [];
      room.voiceSignals.push({ from: from?.id || from?.username, signal, timestamp: Date.now() });
      if (room.voiceSignals.length > 20) room.voiceSignals = room.voiceSignals.slice(-20);
    }
    room.lastUpdated = Date.now();
    Database.saveGame(room);
    await firestoreRestService.saveRoom(room);
  }
  res.json({ success: true, voiceCall: room?.voiceCall, voiceSignals: room?.voiceSignals || [] });
});

// Universal Move in Room (supports both POST /rooms/move with body.roomId and POST /rooms/:id/move)
router.post(['/rooms/move', '/rooms/:id/move'], async (req, res) => {
  const roomId = req.body.roomId || req.params.id;
  if (!roomId) return res.status(400).json({ error: 'Room ID required' });
  
  let room = await firestoreRestService.getRoom(roomId);
  if (!room) {
    room = Database.getGameById(roomId);
  }

  if (!room) {
    room = {
      id: roomId,
      whitePlayer: { id: `host_${roomId}`, username: 'Player 1', elo: 1200 },
      blackPlayer: { id: `guest_${roomId}`, username: 'Player 2', elo: 1200 },
      timeControl: { baseMinutes: 10, incrementSeconds: 0 },
      whiteTime: 600000,
      blackTime: 600000,
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      status: 'active',
      moveHistory: [],
      capturedPieces: { white: [], black: [] },
      createdAt: new Date().toISOString(),
      lastUpdated: Date.now()
    };
  }

  const { move, fen, whiteTime, blackTime, capturedPieces, status, winner, winReason } = req.body;
  if (fen) room.fen = fen;
  if (move) {
    if (!room.moveHistory) room.moveHistory = [];
    room.moveHistory.push(move);
  }
  if (whiteTime !== undefined) room.whiteTime = whiteTime;
  if (blackTime !== undefined) room.blackTime = blackTime;
  if (capturedPieces) room.capturedPieces = capturedPieces;
  if (status) room.status = status;
  if (winner !== undefined) room.winner = winner;
  if (winReason !== undefined) room.winReason = winReason;

  room.lastUpdated = Date.now();
  Database.saveGame(room);
  await firestoreRestService.saveRoom(room);
  res.json({ success: true, room });
});

// ================= PUZZLES & LESSONS =================

router.get('/puzzles', (req, res) => {
  const { theme, opening, category } = req.query;
  let results = [...CHESS_PUZZLES];

  if (theme) {
    const tLower = theme.toLowerCase().replace(/['\s-]/g, '');
    results = results.filter(p => {
      const pTheme = (p.theme || '').toLowerCase().replace(/['\s-]/g, '');
      const pCat = (p.category || '').toLowerCase().replace(/['\s-]/g, '');
      return pTheme.includes(tLower) || pCat.includes(tLower) || tLower.includes(pTheme);
    });
  }

  if (opening) {
    const oLower = opening.toLowerCase().replace(/['\s-]/g, '');
    results = results.filter(p => {
      const pOp = (p.opening || '').toLowerCase().replace(/['\s-]/g, '');
      return pOp.includes(oLower) || oLower.includes(pOp);
    });
  }

  if (category) {
    const cLower = category.toLowerCase().replace(/['\s-]/g, '');
    results = results.filter(p => (p.category || '').toLowerCase().replace(/['\s-]/g, '') === cLower);
  }

  res.json({
    puzzles: results.length > 0 ? results : CHESS_PUZZLES,
    themes: PUZZLE_THEMES,
    openings: PUZZLE_OPENINGS_LIST
  });
});

router.get('/puzzles/daily', (req, res) => {
  const daily = CHESS_PUZZLES.find(p => p.id === 'puz_daily_1') || CHESS_PUZZLES[0];
  res.json({ puzzle: daily });
});

router.post('/puzzles/:id/solve', requireAuth, (req, res) => {
  const puzzle = CHESS_PUZZLES.find(p => p.id === req.params.id);
  if (!puzzle) return res.status(404).json({ error: 'Puzzle not found' });

  const { success } = req.body;
  const user = Database.getUserById(req.user.id);

  if (user && success) {
    user.ratings.puzzle = (user.ratings.puzzle || 1200) + 15;
    if (!user.achievements.includes('tactical_genius')) {
      user.achievements.push('tactical_genius');
    }
    Database.updateUser(user.id, {
      ratings: user.ratings,
      achievements: user.achievements
    });
  }

  res.json({ newRating: user?.ratings.puzzle || 1200 });
});

router.get('/lessons', (req, res) => {
  res.json({ lessons: CHESS_LESSONS });
});

// ================= TOURNAMENTS =================

router.get('/tournaments', (req, res) => {
  res.json({ tournaments: tournamentManager.getAll() });
});

router.get('/tournaments/:id', (req, res) => {
  const tourney = tournamentManager.getTournament(req.params.id);
  if (!tourney) return res.status(404).json({ error: 'Tournament not found' });
  res.json({ tournament: tourney });
});

router.post('/tournaments', requireAuth, (req, res) => {
  const { name, format, timeControl, maxPlayers, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Tournament name required' });

  const tourney = tournamentManager.createTournament({
    name,
    format: format || 'knockout',
    timeControl: timeControl || { baseMinutes: 3, incrementSeconds: 2 },
    maxPlayers: Number(maxPlayers) || 8,
    description: description || 'Arena Tournament',
    createdBy: req.user.id
  });

  res.json({ tournament: tourney });
});

router.post('/tournaments/:id/join', requireAuth, (req, res) => {
  const user = Database.getUserById(req.user.id);
  const result = tournamentManager.joinTournament(req.params.id, user);
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

// ================= FRIENDS & NOTIFICATIONS =================

router.get('/users/search', (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query) return res.json({ users: [] });
  const users = Database.searchUsers(query);
  res.json({ users });
});

router.get('/friends', requireAuth, (req, res) => {
  const friends = Database.getUserFriends(req.user.id).map(f => {
    const { passwordHash: _, ...safe } = f;
    return safe;
  });
  const pendingRequests = Database.getPendingFriendRequests(req.user.id);
  res.json({ friends, pendingRequests });
});

router.post('/friends/request', requireAuth, (req, res) => {
  const { targetUsername } = req.body;
  const target = Database.getUserByUsername(targetUsername);
  if (!target) return res.status(404).json({ error: 'Player not found' });
  if (target.id === req.user.id) return res.status(400).json({ error: 'Cannot friend yourself' });

  const reqObj = Database.sendFriendRequest(req.user.id, target.id);
  Database.addNotification(target.id, {
    type: 'friend_request',
    title: 'New Friend Request',
    message: `${req.user.username} sent you a friend request!`,
    fromUserId: req.user.id
  });

  res.json({ success: true, request: reqObj });
});

router.post('/friends/respond', requireAuth, (req, res) => {
  const { fromUserId, accept } = req.body;
  if (accept) {
    Database.acceptFriendRequest(fromUserId, req.user.id);
    Database.addNotification(fromUserId, {
      type: 'friend_accepted',
      title: 'Friend Request Accepted',
      message: `${req.user.username} accepted your friend request!`,
      fromUserId: req.user.id
    });
  } else {
    Database.removeFriendship(fromUserId, req.user.id);
  }
  res.json({ success: true });
});

router.post('/friends/remove', requireAuth, (req, res) => {
  const { friendId } = req.body;
  Database.removeFriendship(req.user.id, friendId);
  res.json({ success: true });
});

router.get('/notifications', requireAuth, (req, res) => {
  res.json({ notifications: Database.getUserNotifications(req.user.id) });
});

router.post('/notifications/read', requireAuth, (req, res) => {
  Database.markNotificationsRead(req.user.id);
  res.json({ success: true });
});

// ================= AI-POWERED CONVERSATIONAL CHAT ROUTE =================
router.post('/chat/friend-reply', async (req, res) => {
  try {
    const { friend, message, history, detectedMinutes } = req.body || {};
    if (!friend || !message) {
      return res.status(400).json({ error: 'Missing friend or message parameter' });
    }

    const username = friend.username || 'Friend';
    const elo = friend.elo || 1800;
    const country = friend.country || 'International';
    const bio = friend.bio || friend.statusText || 'skilled, friendly chess competitor';

    const systemPrompt = `You are ${username}, an active online chess player (${elo} Elo, from ${country}, ${bio}) chatting in real-time with a friend on the Chess Arena app.
Core Rules:
1. Speak in a completely natural, witty, conversational human voice — NEVER like an AI, customer service bot, or corporate assistant.
2. Keep your response short: 1 to 2 punchy, human sentences max.
3. React directly and specifically to what the user said (rematch challenge, jokes, trash talk, greetings, time controls, opening traps, etc.).
4. Use occasional chess flair or emojis (e.g., ♟️, ⚔️, 🏆, 3m blitz, fork, blunder, checkmate, king).
5. If the user asks for a rematch or a game, accept playfully and tell them to hit the Challenge button above.
6. NEVER say "As an AI" or "How can I assist you". Talk 100% like a real person having fun playing chess online.`;

    // 1. Try Gemini if GEMINI_API_KEY is configured in environment
    if (process.env.GEMINI_API_KEY) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const contents = [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nRecent context: ${JSON.stringify(history?.slice(-4) || [])}\n\nUser: ${message}\n${username}:` }]
          }
        ];
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents }),
          signal: AbortSignal.timeout(4000)
        });
        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (reply) {
            return res.json({ reply: reply.replace(/^["']|["']$/g, '').trim(), source: 'gemini' });
          }
        }
      } catch (err) {
        // Fall through to Pollinations
      }
    }

    // 2. Pollinations AI OpenAI-compatible endpoint
    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...(Array.isArray(history) ? history.slice(-6).map(h => ({
          role: h.sender === 'me' ? 'user' : 'assistant',
          content: h.text || ''
        })) : []),
        { role: 'user', content: message }
      ];

      const aiRes = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          model: 'openai',
          temperature: 0.88
        }),
        signal: AbortSignal.timeout(4500)
      });

      if (aiRes.ok) {
        const data = await aiRes.json();
        const rawText = data.choices?.[0]?.message?.content?.trim();
        if (rawText) {
          const reply = rawText.replace(/^["']|["']$/g, '').trim();
          return res.json({ reply, source: 'pollinations' });
        }
      }
    } catch (err) {
      // Fall through to smart server generator
    }

    // Dynamic Contextual Human-like Response Generator
    const lower = (message || '').toLowerCase().trim();
    const isRematch = /\b(rematch|again|revenge|run it back|one more|another|phir se|dobara|round 2|badla)\b/i.test(lower);
    const isReady = /\b(ready|chal|lets go|let's go|aaja|start|khelte|khel|play now|game on|ready to play)\b/i.test(lower);
    const isBotQuery = /\b(bot|ai|robot|machine|human|real person|real|fake|computer|kya tum bot ho|insaan)\b/i.test(lower);
    const isGreeting = /^(hi|hello|hey|yo|sup|wassup|hii+|heyy+|namaste|kya haal|hola|greetings|gm|ge)\b/i.test(lower);
    const isStatusQuery = /\b(how are you|how r u|kya kar rahe|what are you doing|whats up|what's up|how's it going|kaise ho|what doing)\b/i.test(lower);
    const isTrashTalk = /\b(beat you|defeat|lose|loss|noob|easy|loser|weak|bad|haroge|harenge|crush you|destroy you|bache ho)\b/i.test(lower);
    const isMatchQuery = /\b(play|match|game|khel|challenge|duel|fight|board|bhejo)\b/i.test(lower);
    const isOpenings = /\b(opening|sicilian|e4|d4|gambit|french|caro|london|bongcloud|theory|tactic|blunder|fork|pin|queen|rook)\b/i.test(lower);
    const isLaugh = /\b(haha|lol|lmao|rofl|hehe|xd|😂|🤣|funny)\b/i.test(lower);

    const mins = detectedMinutes || (Math.random() < 0.5 ? 5 : 3);
    const isElena = /elena|rostova/i.test(username);

    let replies = [];
    if (isRematch) {
      replies = isElena ? [
        `You want revenge already? 😉 I love the spirit! Let's do ${mins}m blitz right now. Hit Challenge above! ⚔️`,
        `A rematch?! My Siberian knights never back down from a duel. Click that Challenge button above and let's roll! ♟️`,
        `Oh you're definitely not walking away that easily! ${mins} minutes on the clock—send the challenge above and let's go! 🔥`,
        `Round two?! Bring your best opening this time, because I'm not going easy on you! Click Challenge above! 🏆`,
        `Haha rematch accepted! Let's see if you can crack my defense this time. Hit Challenge above and let's find out! ⚡`
      ] : [
        `Rematch on! ⚔️ I was literally just waiting for you to say that. Click that Challenge button above and let's battle!`,
        `Oh it's on now! ${mins} minutes on the clock—hit Challenge above and let's see who takes this one! 🏆`,
        `You've got courage, I'll give you that! Rematch accepted. Hit Challenge above right now! 🔥`,
        `Round two! Best 2 out of 3? Drop the challenge above and let's get those pieces moving! ♟️`
      ];
    } else if (isReady) {
      replies = isElena ? [
        `Pieces are set and the clock is waiting! Hit the Challenge button right above and make your first move! ♟️`,
        `Born ready! Let's do a ${mins}-minute match. Click Challenge above and show me what you got! ⚔️`,
        `Always ready for battle! Hit Challenge above right now and let's see who controls the center! 🚀`,
        `Board is clean, clock is ticking in my head! Tap Challenge above and let's make this game legendary! 🏆`
      ] : [
        `Let's do this! ⚔️ ${mins} minutes on the clock. Hit that Challenge button above and let's go!`,
        `Board is set and ready! Click Challenge above right now and let's get those pawns flying! 🚀`,
        `Say less! Hit Challenge above and let's find out who's taking home the Elo points today! 🏆`
      ];
    } else if (isBotQuery) {
      replies = [
        `Bro, if I were an AI, I wouldn't be chilling here talking chess with you at this hour! 😂 But my tactical moves might feel suspiciously calculated. Send the challenge and see!`,
        `Shhh, don't let Stockfish hear you or he'll claim copyright over my brain cells! 🧠 I'm 100% human with 200% tactical instincts. Let's play!`,
        `Haha, is it because my profile pic looks too cool or because you're already worried about my moves? 😉 Don't worry, I make human mistakes too... sometimes!`,
        `Me, a bot?! Haha! Could an AI banter like this and then queen-trap you in 12 moves? Let's hit the board and find out! ♟️`
      ];
    } else if (isGreeting) {
      replies = [
        `Hey there! Great to see you in the Arena! What's the plan today—fun blitz or serious battle? ♟️`,
        `Yo! Just the person I was hoping to see online. How's your chess day going? Ready to push some pawns? 😉`,
        `Hey! Welcome to the lobby! I was just warming up my tactical vision. Up for a quick 3m or 5m game? 🔥`,
        `Yooo! Perfect timing, I just finished analyzing an endgame study. You looking for a match? ⚡`
      ];
    } else if (isStatusQuery) {
      replies = [
        `Doing awesome! Just had a hot coffee and solved a 2300-rated tactical puzzle. How are things on your side? ☕`,
        `Alive and kicking! Looking for a worthy opponent to test my new opening trap on. Are you volunteering? 😏`,
        `Can't complain, though my Elo rating could definitely use a boost from playing you! 😂 How are you doing?`,
        `Just chilling in the lobby reviewing Sicilian lines! Ready to roll whenever you send that challenge! ♟️`
      ];
    } else if (isTrashTalk) {
      replies = [
        `Ooh, bold words! But remember, the louder the talk, the harder the king falls 😉 Click Challenge above and put your rating on the line!`,
        `Haha I love the confidence! Let's see if your pieces move as fast as your keyboard! Send that challenge! 🔥`,
        `I'm screenshotting this chat so I can frame it right after I checkmate you 📸 Let's go!`
      ];
    } else if (isOpenings) {
      replies = [
        `Ah, a student of chess theory! I love sharp, chaotic gambits—give me an open center and let the pieces fly 🎆 What opening are you bringing to the table?`,
        `Careful with your prep—I've got a surprise response ready for 1. e4 and 1. d4! Send the challenge and test my prep! ⚔️`
      ];
    } else if (isLaugh) {
      replies = [
        `Haha see, we're having fun already! Now let's see if you're still smiling after my surprise knight fork 😉 Click Challenge above and let's duel!`,
        `😂 That cracked me up! Now let's translate that good mood onto the board. Hit Challenge above!`
      ];
    } else {
      replies = [
        `Haha you're fun to talk to! But chess glory is decided on the board, not in chat. How about a quick ${mins}-minute blitz right now? Challenge me above! ⚔️`,
        `I hear you! My pieces are already restless on their starting squares. Click the Challenge button above and let's get rolling! 🚀`,
        `Words are cheap, pawns are cheaper! Let's settle this with a quick game. Drop a 3m or 5m challenge above! ♟️`,
        `The 64 squares are calling our names! Send the challenge above and let's see who's crowned champion! 🏆`
      ];
    }

    const randomPick = replies[Math.floor(Math.random() * replies.length)];
    return res.json({ reply: randomPick, source: 'smart_generator' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ================= FULL ADMIN CONTROL CENTER (EXCLUSIVE TO op21plus@gmail.com) =================

function checkOpAdmin(req) {
  const dbUser = req.user?.id ? Database.getUserById(req.user.id) : null;
  const userEmail = (dbUser?.email || req.user?.email || '').toLowerCase().trim();
  return userEmail === 'op21plus@gmail.com';
}

// Verify Master Security PIN (pre-flight for Admin Console)
router.post('/admin/verify-pin', (req, res) => {
  const { pin } = req.body;
  if (!pin) {
    return res.status(400).json({ error: 'Master Security PIN is required' });
  }
  if (Database.verifyAdminPin(pin)) {
    return res.json({ success: true, verified: true, message: 'Admin Identity Verified for op21plus@gmail.com' });
  }
  return res.status(403).json({ error: 'Incorrect Master Security PIN. Access denied.' });
});

// Update Master Security PIN
router.post('/admin/update-pin', requireAuth, (req, res) => {
  if (!checkOpAdmin(req)) {
    return res.status(403).json({ error: 'Access denied: Admin command center restricted exclusively to op21plus@gmail.com' });
  }
  const { oldPin, newPin } = req.body;
  if (!Database.verifyAdminPin(oldPin)) {
    return res.status(400).json({ error: 'Current Master Security PIN is incorrect' });
  }
  if (!newPin || String(newPin).trim().length < 4) {
    return res.status(400).json({ error: 'New PIN must be at least 4 digits/characters' });
  }
  Database.updateAdminPin(newPin);
  return res.json({ success: true, message: 'Master Security PIN updated successfully' });
});

// Full Database Backup Export
router.get('/admin/database/export', requireAuth, (req, res) => {
  if (!checkOpAdmin(req)) {
    return res.status(403).json({ error: 'Access denied: Admin command center restricted exclusively to op21plus@gmail.com' });
  }
  const backup = Database.exportFullDatabase();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="chess_arena_db_${Date.now()}.json"`);
  res.json(backup);
});

router.get('/admin/stats', requireAuth, (req, res) => {
  if (!checkOpAdmin(req)) {
    return res.status(403).json({ error: 'Access denied: Admin command center restricted exclusively to op21plus@gmail.com' });
  }

  const allUsers = Database.getAllUsers();
  const allGames = Database.getAllGames(200);
  const onlineCount = allUsers.filter(u => u.isOnline).length;
  const ongoingGames = allGames.filter(g => g.status === 'active' || g.status === 'playing' || g.status === 'waiting').length;
  const googleUsersCount = allUsers.filter(u => u.provider === 'google' || (u.email && u.email.endsWith('@gmail.com'))).length;
  const tournaments = Database.getAllTournaments();
  const config = Database.getAppConfig();

  // Real-time server telemetry
  const mem = process.memoryUsage();
  const systemTelemetry = {
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    platform: process.platform,
    heapUsedMB: (mem.heapUsed / 1024 / 1024).toFixed(1),
    rssMB: (mem.rss / 1024 / 1024).toFixed(1),
    timestamp: new Date().toISOString()
  };

  res.json({
    totalUsers: allUsers.length,
    activeOnline: onlineCount,
    totalGames: allGames.length,
    ongoingGames,
    googleUsersCount,
    config,
    tournaments,
    systemTelemetry,
    users: allUsers.map(u => {
      const { passwordHash: _, ...safe } = u;
      return safe;
    }),
    games: allGames.slice(0, 50).map(g => ({
      id: g.id,
      white: g.whitePlayer?.username || (typeof g.whitePlayer === 'string' ? g.whitePlayer : 'White'),
      black: g.blackPlayer?.username || (typeof g.blackPlayer === 'string' ? g.blackPlayer : 'Black'),
      status: g.status,
      winner: g.winner || null,
      timeControl: g.timeControl ? `${g.timeControl.baseMinutes}+${g.timeControl.incrementSeconds}` : '10+0',
      movesCount: Array.isArray(g.moveHistory) ? g.moveHistory.length : 0,
      createdAt: g.createdAt || new Date().toISOString()
    })),
    reports: Database.getAllReports()
  });
});

// App Config & Global Defaults Control
router.get('/admin/config', requireAuth, (req, res) => {
  if (!checkOpAdmin(req)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  res.json({ config: Database.getAppConfig() });
});

router.post('/admin/config', requireAuth, (req, res) => {
  if (!checkOpAdmin(req)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  const updated = Database.updateAppConfig(req.body);
  if (req.io) {
    req.io.emit('app_config_updated', updated);
  }
  res.json({ success: true, config: updated });
});

router.post('/admin/reset-defaults', requireAuth, (req, res) => {
  if (!checkOpAdmin(req)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  const reset = Database.resetAppConfig();
  if (req.io) {
    req.io.emit('app_config_updated', reset);
  }
  res.json({ success: true, config: reset });
});

// Add New Player / User
router.post('/admin/users/create', requireAuth, (req, res) => {
  if (!checkOpAdmin(req)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  const { username, email, role, ratings, country, countryName, title, avatar } = req.body;
  if (!username) return res.status(400).json({ error: 'Username is required' });

  const existing = Database.getUserByUsername(username);
  if (existing) return res.status(400).json({ error: 'Username already taken' });

  const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newUser = Database.createUser({
    id,
    username,
    email: email || '',
    role: role || 'user',
    country: country || 'IN',
    countryName: countryName || 'India',
    title: title || '',
    avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
    ratings: {
      rapid: Number(ratings?.rapid) || 1200,
      blitz: Number(ratings?.blitz) || 1200,
      bullet: Number(ratings?.bullet) || 1200,
      classical: Number(ratings?.classical) || 1200,
      puzzle: Number(ratings?.puzzle) || 1200
    }
  });

  const { passwordHash: _, ...safe } = newUser;
  res.json({ success: true, user: safe });
});

// Update Existing Player / User
router.post('/admin/users/:id/update', requireAuth, (req, res) => {
  if (!checkOpAdmin(req)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  const user = Database.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { username, email, ratings, title, country, countryName, banned, role } = req.body;
  const updates = {};
  if (username) updates.username = username;
  if (email !== undefined) updates.email = email;
  if (country) updates.country = country;
  if (countryName) updates.countryName = countryName;
  if (title !== undefined) updates.title = title;
  if (typeof banned === 'boolean') updates.banned = banned;
  if (role && user.email?.toLowerCase().trim() !== 'op21plus@gmail.com') updates.role = role;
  if (ratings) {
    updates.ratings = {
      ...user.ratings,
      ...ratings
    };
  }

  const updated = Database.updateUser(user.id, updates);
  const { passwordHash: _, ...safe } = updated;
  res.json({ success: true, user: safe });
});

// Delete Player / User Account
router.delete('/admin/users/:id', requireAuth, (req, res) => {
  if (!checkOpAdmin(req)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  const success = Database.deleteUser(req.params.id);
  if (!success) {
    return res.status(400).json({ error: 'Could not delete user (account not found or protected admin)' });
  }
  res.json({ success: true, message: 'User deleted permanently' });
});

// User Moderation (Ban/Unban/Rating adjust)
router.post('/admin/users/:id/moderate', requireAuth, (req, res) => {
  if (!checkOpAdmin(req)) {
    return res.status(403).json({ error: 'Access denied: Admin moderation restricted exclusively to op21plus@gmail.com' });
  }

  const { banned, ratingAdjustment, reason } = req.body;
  const user = Database.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (typeof banned === 'boolean') {
    user.banned = banned;
  }
  if (typeof ratingAdjustment === 'number') {
    user.ratings.rapid = Math.max(100, (user.ratings.rapid || 1200) + ratingAdjustment);
  }

  Database.updateUser(user.id, user);
  res.json({ success: true, user });
});

// Tournament Control
router.get('/admin/tournaments', requireAuth, (req, res) => {
  if (!checkOpAdmin(req)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  res.json({ tournaments: Database.getAllTournaments() });
});

router.post('/admin/tournaments/create', requireAuth, (req, res) => {
  if (!checkOpAdmin(req)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  const created = Database.createTournament(req.body);
  res.json({ success: true, tournament: created });
});

router.delete('/admin/tournaments/:id', requireAuth, (req, res) => {
  if (!checkOpAdmin(req)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  const success = Database.deleteTournament(req.params.id);
  res.json({ success: Boolean(success) });
});

// Universal High-Reliability Text-To-Speech (TTS) Proxy
const ttsAudioCache = new Map();
router.get('/tts', (req, res) => {
  try {
    const text = (req.query.text || '').toString().slice(0, 300).trim();
    const lang = (req.query.lang || 'en').toString();
    if (!text) {
      return res.status(400).json({ error: 'Text query parameter is required' });
    }

    const cacheKey = `${lang}:${text}`;
    if (ttsAudioCache.has(cacheKey)) {
      const cached = ttsAudioCache.get(cacheKey);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      res.setHeader('X-TTS-Cache', 'HIT');
      return res.send(cached);
    }

    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(lang)}&client=tw-ob`;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/'
      }
    };

    https.get(ttsUrl, options, (upstream) => {
      if (upstream.statusCode !== 200) {
        return res.status(upstream.statusCode || 502).json({ error: 'TTS upstream response status ' + upstream.statusCode });
      }

      const chunks = [];
      upstream.on('data', chunk => chunks.push(chunk));
      upstream.on('end', () => {
        const fullBuffer = Buffer.concat(chunks);
        if (ttsAudioCache.size > 200) {
          const firstKey = ttsAudioCache.keys().next().value;
          ttsAudioCache.delete(firstKey);
        }
        ttsAudioCache.set(cacheKey, fullBuffer);

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
        res.setHeader('X-TTS-Cache', 'MISS');
        res.send(fullBuffer);
      });
      upstream.on('error', (err) => {
        res.status(502).json({ error: 'TTS fetch stream failed', details: err.message });
      });
    }).on('error', (err) => {
      res.status(502).json({ error: 'TTS connection failed', details: err.message });
    });
  } catch (err) {
    res.status(500).json({ error: 'TTS handler failed', details: err.message });
  }
});

export default router;
