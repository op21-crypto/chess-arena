import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Database, getProgressionTier } from '../db/database.js';
import { aiEngine } from '../engine/aiEngine.js';
import { CHESS_PUZZLES, CHESS_LESSONS } from '../puzzles/puzzleData.js';
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
    if (err) req.user = null;
    else req.user = user;
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

// ================= AUTHENTICATION =================

// Register
router.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password, country, avatar } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }

    if (Database.getUserByUsername(username)) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    if (Database.getUserByEmail(email)) {
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
    let user = Database.getUserByEmail(cleanEmail);

    if (!user) {
      const baseName = (name || cleanEmail.split('@')[0]).replace(/[^a-zA-Z0-9_]/g, '_');
      const uniqueSuffix = Math.floor(100 + Math.random() * 900);
      let username = baseName;
      if (Database.getUserByUsername(username)) {
        username = `${baseName}_${uniqueSuffix}`;
      }

      const userId = `g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      user = Database.createUser({
        id: userId,
        username,
        email: cleanEmail,
        passwordHash: '',
        role: 'user',
        provider: 'google',
        country: 'US',
        countryName: 'United States',
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`
      });
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
  const allUsers = Database.getAllUsers().filter(u => !u.banned && u.role !== 'guest');

  // Sort by selected format rating
  const sorted = allUsers.sort((a, b) => {
    const rA = a.ratings?.[format] || 1200;
    const rB = b.ratings?.[format] || 1200;
    return rB - rA;
  });

  const leaderboard = sorted.slice(0, 50).map((u, idx) => ({
    rank: idx + 1,
    id: u.id,
    username: u.username,
    avatar: u.avatar,
    country: u.country,
    countryName: u.countryName,
    rating: u.ratings?.[format] || 1200,
    progression: getProgressionTier(u.ratings?.[format] || 1200),
    stats: u.stats,
    isOnline: Boolean(u.isOnline)
  }));

  res.json({ format, leaderboard });
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

  const isWhite = colorPreference === 'white' || (colorPreference === 'random' && Math.random() > 0.5);

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

router.get('/rooms/:id', (req, res) => {
  const room = Database.getGameById(req.params.id);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json({ room });
});

router.post('/rooms/:id/join', (req, res) => {
  const room = Database.getGameById(req.params.id);
  if (!room) return res.status(404).json({ error: 'Room not found' });

  const { user } = req.body;
  const joiningPlayer = user || {
    id: `guest_${Date.now()}`,
    username: 'Guest_Opponent',
    role: 'guest',
    elo: 1200
  };

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

router.post('/rooms/:id/move', (req, res) => {
  const room = Database.getGameById(req.params.id);
  if (!room) return res.status(404).json({ error: 'Room not found' });

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
  res.json({ puzzles: CHESS_PUZZLES });
});

router.get('/puzzles/daily', (req, res) => {
  // Rotate based on day of year
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % CHESS_PUZZLES.length;
  res.json({ puzzle: CHESS_PUZZLES[dayIndex] });
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

// ================= ADMIN DASHBOARD =================

router.get('/admin/stats', requireAuth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const allUsers = Database.getAllUsers();
  const allGames = Database.getAllGames();
  const onlineCount = allUsers.filter(u => u.isOnline).length;
  const ongoingGames = allGames.filter(g => g.status === 'active').length;

  res.json({
    totalUsers: allUsers.length,
    activeOnline: onlineCount,
    totalGames: allGames.length,
    ongoingGames,
    users: allUsers.map(u => {
      const { passwordHash: _, ...safe } = u;
      return safe;
    }),
    reports: Database.getAllReports()
  });
});

router.post('/admin/users/:id/moderate', requireAuth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
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

export default router;
