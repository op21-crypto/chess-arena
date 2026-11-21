import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Database, getProgressionTier } from '../db/database.js';
import { aiEngine } from '../engine/aiEngine.js';
import { CHESS_PUZZLES, PUZZLE_THEMES, PUZZLE_OPENINGS_LIST, CHESS_LESSONS } from '../puzzles/puzzleData.js';
import { tournamentManager } from '../tournaments/tournamentManager.js';

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

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isOp = (user.email && user.email.toLowerCase().trim() === 'op21plus@gmail.com');
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

// ================= ROOMS (FRIEND PLAY & SERVERLESS SYNC) =================

router.post('/rooms/create', (req, res) => {
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
    createdAt: new Date().toISOString(),
    lastUpdated: Date.now()
  };

  Database.saveGame(room);
  res.json({ success: true, room });
});

// Universal Get Room (supports both ?id=... and /rooms/:id)
router.get(['/rooms/get', '/rooms/:id'], (req, res) => {
  const roomId = req.query.id || req.params.id;
  if (!roomId) return res.status(400).json({ error: 'Room ID required' });
  let room = Database.getGameById(roomId);
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
      createdAt: new Date().toISOString(),
      lastUpdated: Date.now()
    };
    Database.saveGame(room);
  }
  res.json({ room });
});

// Universal Join Room (supports both POST /rooms/join with body.roomId and POST /rooms/:id/join)
router.post(['/rooms/join', '/rooms/:id/join'], (req, res) => {
  const roomId = req.body.roomId || req.params.id;
  if (!roomId) return res.status(400).json({ error: 'Room ID required' });
  let room = Database.getGameById(roomId);
  const { user } = req.body;
  const joiningPlayer = user || {
    id: `guest_${Date.now()}`,
    username: 'Guest_Opponent',
    role: 'guest',
    elo: 1200
  };

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
      createdAt: new Date().toISOString(),
      lastUpdated: Date.now()
    };
    Database.saveGame(room);
    return res.json({ success: true, room });
  }

  if (!room.whitePlayer) {
    room.whitePlayer = joiningPlayer;
    room.status = 'active';
  } else if (!room.blackPlayer && room.whitePlayer.id !== joiningPlayer.id) {
    room.blackPlayer = joiningPlayer;
    room.status = 'active';
  }

  room.lastUpdated = Date.now();
  Database.saveGame(room);
  res.json({ success: true, room });
});

// Universal Move in Room (supports both POST /rooms/move with body.roomId and POST /rooms/:id/move)
router.post(['/rooms/move', '/rooms/:id/move'], (req, res) => {
  const roomId = req.body.roomId || req.params.id;
  if (!roomId) return res.status(400).json({ error: 'Room ID required' });
  let room = Database.getGameById(roomId);
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
  if (move) room.moveHistory.push(move);
  if (whiteTime !== undefined) room.whiteTime = whiteTime;
  if (blackTime !== undefined) room.blackTime = blackTime;
  if (capturedPieces) room.capturedPieces = capturedPieces;
  if (status) room.status = status;
  if (winner) room.winner = winner;
  if (winReason) room.winReason = winReason;

  room.lastUpdated = Date.now();
  Database.saveGame(room);
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

// ================= FULL ADMIN CONTROL CENTER (EXCLUSIVE TO op21plus@gmail.com) =================

function checkOpAdmin(req) {
  const dbUser = req.user?.id ? Database.getUserById(req.user.id) : null;
  const userEmail = (dbUser?.email || req.user?.email || '').toLowerCase().trim();
  return userEmail === 'op21plus@gmail.com';
}

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

  res.json({
    totalUsers: allUsers.length,
    activeOnline: onlineCount,
    totalGames: allGames.length,
    ongoingGames,
    googleUsersCount,
    config,
    tournaments,
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
  res.json({ success: true, config: updated });
});

router.post('/admin/reset-defaults', requireAuth, (req, res) => {
  if (!checkOpAdmin(req)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  const reset = Database.resetAppConfig();
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

export default router;
