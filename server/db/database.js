import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { RAW_LEADERBOARD_PLAYERS } from '../data/leaderboardData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect serverless environment (Vercel / Lambda) where only /tmp is writable
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const SEED_FILE = path.join(__dirname, 'data', 'chess_arena.json');
const DATA_DIR = isServerless ? '/tmp' : path.join(__dirname, 'data');
const DB_FILE = isServerless ? path.join('/tmp', 'chess_arena.json') : SEED_FILE;

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn('Could not create DATA_DIR:', err.message);
  }
}

// In-memory state backed by atomic disk persistence
let db = {
  users: {},
  games: {},
  tournaments: {},
  friendships: [], // { id, user1, user2, status: 'pending'|'accepted', requestedBy }
  notifications: {}, // userId -> [notifications]
  reports: []
};

function saveDb() {
  try {
    const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  } catch (err) {
    console.error('Failed to save database:', err.message);
  }
}

function ensureAdminUser() {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('chessarena123', salt);

  // Check if op21plus@gmail.com exists
  let opUser = Object.values(db.users).find(u => u.email && u.email.toLowerCase() === 'op21plus@gmail.com');
  if (opUser) {
    opUser.role = 'admin';
    if (!opUser.passwordHash) opUser.passwordHash = passwordHash;
  } else {
    const opId = 'admin_op21';
    db.users[opId] = {
      id: opId,
      username: 'op21plus',
      email: 'op21plus@gmail.com',
      passwordHash,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      country: 'IN',
      countryName: 'India',
      ratings: {
        bullet: 2520,
        blitz: 2550,
        rapid: 2580,
        classical: 2600,
        puzzle: 2700
      },
      highestRating: 2600,
      stats: {
        played: 480,
        won: 370,
        lost: 65,
        drawn: 45,
        winStreak: 16,
        currentStreak: 6
      },
      ratingHistory: [
        { date: '2026-01-01', rating: 2400, format: 'rapid' },
        { date: '2026-02-01', rating: 2480, format: 'rapid' },
        { date: '2026-03-01', rating: 2530, format: 'rapid' },
        { date: '2026-04-01', rating: 2580, format: 'rapid' }
      ],
      achievements: [
        'first_win', 'checkmate_pro', 'wins_10', 'games_100', 'streak_master', 'tactical_genius', 'blitz_master', 'rapid_master', 'king_badge', 'queen_badge'
      ],
      createdAt: '2026-01-01T00:00:00.000Z',
      isOnline: false,
      banned: false
    };
  }

  if (db.users['admin_001']) {
    db.users['admin_001'].role = 'admin';
  }

  if (!db.users['player_magnus']) {
    db.users['player_magnus'] = {
      id: 'player_magnus',
      username: 'VikingKing',
      email: 'magnus@chessarena.com',
      passwordHash,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      country: 'NO',
      countryName: 'Norway',
      ratings: { bullet: 2850, blitz: 2890, rapid: 2840, classical: 2860, puzzle: 2950 },
      highestRating: 2890,
      stats: { won: 195, lost: 55, played: 280, drawn: 30, winStreak: 14, currentStreak: 5 },
      achievements: ['first_win', 'checkmate_pro', 'wins_10', 'games_100', 'streak_master'],
      createdAt: '2026-01-01T00:00:00.000Z',
      isOnline: false,
      banned: false
    };
  }
}

function loadDb() {
  // First check if writable DB_FILE exists (e.g. /tmp/chess_arena.json on Vercel)
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(raw);
      ensureAdminUser();
      return;
    } catch (err) {
      console.error('Error loading DB file:', err.message);
    }
  }

  // Next check if packaged seed file exists
  if (fs.existsSync(SEED_FILE)) {
    try {
      const raw = fs.readFileSync(SEED_FILE, 'utf-8');
      db = JSON.parse(raw);
      if (!db.users || Object.keys(db.users).length < 50) {
        seedDatabase();
      }
      ensureAdminUser();
      saveDb();
      return;
    } catch (err) {
      console.error('Error loading SEED file:', err.message);
    }
  }

  // Fallback to fresh seed
  seedDatabase();
  ensureAdminUser();
  saveDb();
}

// Helper: Progression Badge from Elo
export function getProgressionTier(elo) {
  if (elo >= 2300) return { title: 'Elite', color: 'from-purple-500 to-pink-500', icon: 'Crown' };
  if (elo >= 2000) return { title: 'Master', color: 'from-amber-400 to-amber-600', icon: 'Award' };
  if (elo >= 1800) return { title: 'Expert', color: 'from-red-500 to-rose-600', icon: 'ShieldAlert' };
  if (elo >= 1600) return { title: 'Advanced', color: 'from-blue-500 to-indigo-600', icon: 'Zap' };
  if (elo >= 1400) return { title: 'Skilled', color: 'from-cyan-400 to-blue-500', icon: 'Target' };
  if (elo >= 1200) return { title: 'Intermediate', color: 'from-emerald-400 to-teal-500', icon: 'TrendingUp' };
  if (elo >= 1000) return { title: 'Learner', color: 'from-green-500 to-emerald-600', icon: 'BookOpen' };
  return { title: 'Beginner', color: 'from-slate-400 to-slate-500', icon: 'Smile' };
}

function seedDatabase() {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('chessarena123', salt);

  // Admin user
  const adminId = 'admin_001';
  db.users[adminId] = {
    id: adminId,
    username: 'GrandmasterAdmin',
    email: 'admin@chessarena.com',
    passwordHash,
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    country: 'IS', // Iceland (Fischer-Spassky)
    countryName: 'Iceland',
    ratings: {
      bullet: 2420,
      blitz: 2480,
      rapid: 2510,
      classical: 2550,
      puzzle: 2600
    },
    highestRating: 2550,
    stats: {
      played: 420,
      won: 310,
      lost: 75,
      drawn: 35,
      winStreak: 12,
      currentStreak: 4
    },
    ratingHistory: [
      { date: '2026-01-01', rating: 2350, format: 'rapid' },
      { date: '2026-02-01', rating: 2410, format: 'rapid' },
      { date: '2026-03-01', rating: 2480, format: 'rapid' },
      { date: '2026-04-01', rating: 2510, format: 'rapid' }
    ],
    achievements: [
      'first_win', 'checkmate_pro', 'wins_10', 'games_100', 'streak_master', 'tactical_genius', 'blitz_master', 'rapid_master', 'king_badge', 'queen_badge'
    ],
    createdAt: new Date().toISOString(),
    isOnline: false,
    banned: false
  };

  // Seed competitive leaderboard players (72 Grandmasters across 10 Countries, 7+ per country)
  const seedPlayers = Array.isArray(RAW_LEADERBOARD_PLAYERS) && RAW_LEADERBOARD_PLAYERS.length > 0
    ? RAW_LEADERBOARD_PLAYERS
    : [
        { id: 'player_magnus', username: 'VikingKing', email: 'magnus@chessarena.com', country: 'NO', countryName: 'Norway', ratings: { bullet: 2850, blitz: 2890, rapid: 2840, classical: 2860 }, stats: { won: 195, lost: 55, played: 280 }, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
        { id: 'player_hikaru', username: 'SpeedDemon', email: 'hikaru@chessarena.com', country: 'US', countryName: 'United States', ratings: { bullet: 2920, blitz: 2870, rapid: 2790, classical: 2780 }, stats: { won: 190, lost: 60, played: 275 }, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
        { id: 'player_gukesh', username: 'YouthMaster', email: 'gukesh@chessarena.com', country: 'IN', countryName: 'India', ratings: { bullet: 2710, blitz: 2750, rapid: 2810, classical: 2830 }, stats: { won: 185, lost: 45, played: 250 }, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
        { id: 'player_judit', username: 'TacticalQueen', email: 'judit@chessarena.com', country: 'ES', countryName: 'Spain', ratings: { bullet: 2680, blitz: 2720, rapid: 2750, classical: 2760 }, stats: { won: 175, lost: 65, played: 260 }, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
        { id: 'player_anna', username: 'ChessQueenAnna', email: 'anna@chessarena.com', country: 'CA', countryName: 'Canada', ratings: { bullet: 2280, blitz: 2310, rapid: 2350, classical: 2320 }, stats: { won: 160, lost: 70, played: 250 }, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
        { id: 'player_fabiano', username: 'DeepCalculator', email: 'fabi@chessarena.com', country: 'US', countryName: 'United States', ratings: { bullet: 2730, blitz: 2790, rapid: 2810, classical: 2840 }, stats: { won: 180, lost: 50, played: 250 }, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' }
      ];

  seedPlayers.forEach(p => {
    const bullet = p.ratings?.bullet || p.bullet || 2400;
    const blitz = p.ratings?.blitz || p.blitz || 2400;
    const rapid = p.ratings?.rapid || p.rapid || 2400;
    const classical = p.ratings?.classical || p.classical || 2400;
    const wonCount = p.stats?.won || 150;
    const lostCount = p.stats?.lost || 50;
    const playedCount = p.stats?.played || wonCount + lostCount;

    db.users[p.id] = {
      id: p.id,
      username: p.username,
      email: p.email || `${p.username.toLowerCase()}@chessarena.com`,
      passwordHash,
      role: 'user',
      avatar: p.avatar,
      country: p.country,
      countryName: p.countryName,
      ratings: {
        bullet,
        blitz,
        rapid,
        classical,
        puzzle: rapid + 100
      },
      highestRating: Math.max(bullet, blitz, rapid, classical),
      stats: {
        played: playedCount,
        won: wonCount,
        lost: lostCount,
        drawn: Math.max(0, playedCount - wonCount - lostCount),
        winStreak: 8,
        currentStreak: 3
      },
      ratingHistory: [
        { date: '2026-02-10', rating: rapid - 60, format: 'rapid' },
        { date: '2026-03-15', rating: rapid - 20, format: 'rapid' },
        { date: '2026-04-20', rating: rapid, format: 'rapid' }
      ],
      achievements: ['first_win', 'checkmate_pro', 'wins_10', 'games_100', 'streak_master', 'tactical_genius', 'rapid_master', 'queen_badge', 'knight_badge'],
      createdAt: new Date().toISOString(),
      isOnline: Boolean(p.isOnline),
      banned: false
    };
  });
}

// Load database on import
loadDb();

export const Database = {
  // Users
  getUserById(id) {
    return db.users[id] || null;
  },

  getUserByUsername(username) {
    if (!username) return null;
    const lower = username.toLowerCase();
    return Object.values(db.users).find(u => u.username && u.username.toLowerCase() === lower) || null;
  },

  getUserByEmail(email) {
    if (!email) return null;
    const lower = email.toLowerCase();
    return Object.values(db.users).find(u => u.email && u.email.toLowerCase() === lower) || null;
  },

  createUser(userData) {
    const isOpAdmin = (userData.email && userData.email.toLowerCase().trim() === 'op21plus@gmail.com');
    db.users[userData.id] = {
      role: isOpAdmin ? 'admin' : (userData.role || 'user'),
      country: isOpAdmin ? 'IN' : 'US',
      countryName: isOpAdmin ? 'India' : 'United States',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${userData.username}`,
      ratings: {
        bullet: isOpAdmin ? 2520 : 1200,
        blitz: isOpAdmin ? 2550 : 1200,
        rapid: isOpAdmin ? 2580 : 1200,
        classical: isOpAdmin ? 2600 : 1200,
        puzzle: isOpAdmin ? 2700 : 1200
      },
      highestRating: isOpAdmin ? 2600 : 1200,
      stats: {
        played: isOpAdmin ? 480 : 0,
        won: isOpAdmin ? 370 : 0,
        lost: isOpAdmin ? 65 : 0,
        drawn: isOpAdmin ? 45 : 0,
        winStreak: isOpAdmin ? 16 : 0,
        currentStreak: isOpAdmin ? 6 : 0
      },
      ratingHistory: [
        { date: new Date().toISOString().split('T')[0], rating: isOpAdmin ? 2580 : 1200, format: 'rapid' }
      ],
      achievements: isOpAdmin ? ['first_win', 'checkmate_pro', 'wins_10', 'games_100', 'streak_master', 'tactical_genius', 'blitz_master', 'rapid_master', 'king_badge', 'queen_badge'] : [],
      createdAt: new Date().toISOString(),
      isOnline: false,
      banned: false,
      ...userData
    };
    if (isOpAdmin) {
      db.users[userData.id].role = 'admin';
    }
    saveDb();
    return db.users[userData.id];
  },

  updateUser(id, updates) {
    if (!db.users[id]) return null;
    const isOpAdmin = (db.users[id].email && db.users[id].email.toLowerCase().trim() === 'op21plus@gmail.com') ||
                      (updates.email && updates.email.toLowerCase().trim() === 'op21plus@gmail.com');
    if (isOpAdmin) {
      updates.role = 'admin';
    } else if (updates.role === 'admin') {
      updates.role = 'user';
    }
    db.users[id] = { ...db.users[id], ...updates };
    saveDb();
    return db.users[id];
  },

  getAllUsers() {
    return Object.values(db.users);
  },

  // Games
  saveGame(gameRecord) {
    db.games[gameRecord.id] = gameRecord;
    saveDb();
    return gameRecord;
  },

  getGameById(id) {
    return db.games[id] || null;
  },

  getUserGames(userId, limit = 20) {
    return Object.values(db.games)
      .filter(g => g.whitePlayer?.id === userId || g.blackPlayer?.id === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  },

  getAllGames(limit = 100) {
    return Object.values(db.games)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  },

  // Tournaments
  saveTournament(tournament) {
    db.tournaments[tournament.id] = tournament;
    saveDb();
    return tournament;
  },

  getTournamentById(id) {
    return db.tournaments[id] || null;
  },

  getAllTournaments() {
    return Object.values(db.tournaments);
  },

  // Friends & Social
  getFriendship(user1, user2) {
    return db.friendships.find(f => 
      (f.user1 === user1 && f.user2 === user2) || 
      (f.user1 === user2 && f.user2 === user1)
    ) || null;
  },

  sendFriendRequest(fromUserId, toUserId) {
    const existing = this.getFriendship(fromUserId, toUserId);
    if (existing) return existing;
    const req = {
      id: `fr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user1: fromUserId,
      user2: toUserId,
      status: 'pending',
      requestedBy: fromUserId,
      createdAt: new Date().toISOString()
    };
    db.friendships.push(req);
    saveDb();
    return req;
  },

  acceptFriendRequest(fromUserId, toUserId) {
    const fr = this.getFriendship(fromUserId, toUserId);
    if (fr && fr.status === 'pending') {
      fr.status = 'accepted';
      fr.acceptedAt = new Date().toISOString();
      saveDb();
      return fr;
    }
    return null;
  },

  removeFriendship(user1, user2) {
    db.friendships = db.friendships.filter(f => 
      !((f.user1 === user1 && f.user2 === user2) || (f.user1 === user2 && f.user2 === user1))
    );
    saveDb();
  },

  getUserFriends(userId) {
    const list = [];
    for (const f of db.friendships) {
      if (f.status === 'accepted') {
        const friendId = f.user1 === userId ? f.user2 : (f.user2 === userId ? f.user1 : null);
        if (friendId && db.users[friendId]) {
          list.push(db.users[friendId]);
        }
      }
    }
    return list;
  },

  getPendingFriendRequests(userId) {
    const incoming = [];
    for (const f of db.friendships) {
      if (f.status === 'pending' && f.user2 === userId) {
        const sender = db.users[f.user1];
        if (sender) incoming.push({ requestId: f.id, user: sender, createdAt: f.createdAt });
      }
    }
    return incoming;
  },

  // Notifications
  addNotification(userId, notification) {
    if (!db.notifications[userId]) db.notifications[userId] = [];
    const item = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      timestamp: new Date().toISOString(),
      ...notification
    };
    db.notifications[userId].unshift(item);
    if (db.notifications[userId].length > 50) db.notifications[userId].pop();
    saveDb();
    return item;
  },

  getUserNotifications(userId) {
    return db.notifications[userId] || [];
  },

  markNotificationsRead(userId) {
    if (db.notifications[userId]) {
      db.notifications[userId].forEach(n => n.read = true);
      saveDb();
    }
  },

  // Moderation & Reports
  createReport(report) {
    const item = {
      id: `rep_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      ...report
    };
    db.reports.push(item);
    saveDb();
    return item;
  },

  getAllReports() {
    return db.reports;
  },

  updateReport(id, updates) {
    const rep = db.reports.find(r => r.id === id);
    if (rep) {
      Object.assign(rep, updates);
      saveDb();
    }
    return rep;
  }
};
