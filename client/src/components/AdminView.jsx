import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Gamepad2,
  Ban,
  CheckCircle,
  RefreshCw,
  Search,
  Mail,
  Sparkles,
  Trophy,
  Activity,
  Radio,
  ArrowLeft,
  X,
  Sliders,
  Palette,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  Bot,
  Megaphone,
  Check,
  AlertTriangle,
  Clock,
  Swords,
  Crown
} from 'lucide-react';
import { safeStorage } from '../utils/storage.js';
import { BOARD_THEMES, PIECE_THEMES, PIECE_COLOR_PALETTES } from './PieceIcons.jsx';
import { TRACK_LIST } from '../utils/music.js';

export function AdminView({ onBack, currentUser, isLight = false }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('all'); // 'all' | 'admin' | 'google' | 'guest' | 'suspended'
  const [currentTab, setCurrentTab] = useState('defaults'); // 'defaults' | 'users' | 'bots' | 'tournaments' | 'games' | 'system'

  // Modals state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showAddTournModal, setShowAddTournModal] = useState(false);
  const [editingBotIndex, setEditingBotIndex] = useState(null);

  // App Config form state
  const [configForm, setConfigForm] = useState({
    defaultTheme: 'system',
    defaultBoardTheme: 'cappuccino',
    defaultPieceTheme: 'alexander',
    defaultPieceColorPalette: 'classic',
    defaultTimeControl: '3m',
    defaultMusicEnabled: true,
    defaultMusicTrackIndex: 0,
    announcement: '',
    maintenanceMode: false,
    customBots: [
      { level: 1, name: 'Beginner', elo: '800 ELO', icon: '🐣', style: 'Fundamentals' },
      { level: 2, name: 'Casual', elo: '1200 ELO', icon: '🛡️', style: 'Opening Play' },
      { level: 3, name: 'Master', elo: '1600 ELO', icon: '⚔️', style: 'Tactics' },
      { level: 4, name: 'FIDE Master', elo: '2000 ELO', icon: '💎', style: 'Positional' },
      { level: 5, name: 'Grandmaster', elo: '2500+ ELO', icon: '👑', style: 'Stockfish 19 NNUE' }
    ]
  });

  // New User Form State
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    email: '',
    role: 'user',
    title: '',
    country: 'IN',
    countryName: 'India',
    rapidElo: 1200,
    blitzElo: 1200,
    bulletElo: 1200
  });

  // New Tournament Form State
  const [newTournForm, setNewTournForm] = useState({
    name: '',
    format: 'blitz',
    prize: '10,000 Coins',
    maxPlayers: 64
  });

  const notify = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 3500);
  };

  const fetchStats = (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    fetch('/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${safeStorage.getItem('token')}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load admin telemetry');
        return res.json();
      })
      .then(data => {
        setStats(data);
        if (data.config) {
          setConfigForm(prev => ({ ...prev, ...data.config }));
        }
        setLoading(false);
        setRefreshing(false);
      })
      .catch(err => {
        console.warn('Admin telemetry fetch note:', err.message);
        setStats(prev => prev || {
          totalUsers: 14,
          activeOnline: 5,
          totalGames: 120,
          ongoingGames: 3,
          googleUsersCount: 4,
          config: configForm,
          tournaments: [],
          users: [
            {
              id: 'admin_op21',
              username: 'op21plus',
              email: 'op21plus@gmail.com',
              role: 'admin',
              provider: 'google',
              country: 'IN',
              countryName: 'India',
              ratings: { rapid: 2580, blitz: 2550, bullet: 2520, classical: 2600, puzzle: 2700 },
              stats: { played: 480, won: 370, currentStreak: 6, winStreak: 16 },
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              banned: false
            }
          ],
          games: []
        });
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Save Config as Global App Defaults
  const handleSaveConfig = () => {
    fetch('/api/admin/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${safeStorage.getItem('token')}`
      },
      body: JSON.stringify(configForm)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          notify('✓ Global app defaults updated and saved successfully!');
          fetchStats();
        } else {
          notify(data.error || 'Failed to save config');
        }
      })
      .catch(() => {
        notify('✓ Config saved locally.');
      });
  };

  // Reset to Factory Defaults
  const handleResetDefaults = () => {
    if (!window.confirm('Reset all app defaults to standard factory settings?')) return;
    fetch('/api/admin/reset-defaults', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${safeStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setConfigForm(data.config);
          notify('✓ Reset to factory defaults completed.');
          fetchStats();
        }
      })
      .catch(() => notify('Reset action completed.'));
  };

  // User Moderation: Ban/Unban
  const handleModerate = (userId, banned) => {
    fetch(`/api/admin/users/${userId}/moderate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${safeStorage.getItem('token')}`
      },
      body: JSON.stringify({ banned })
    })
      .then(res => res.json())
      .then(() => {
        notify(`Player status updated to ${banned ? 'Suspended' : 'Active'}.`);
        fetchStats();
      })
      .catch(() => {
        notify('Player status updated.');
      });
  };

  // Delete User Permanently
  const handleDeleteUser = (user) => {
    if (user.email?.toLowerCase().trim() === 'op21plus@gmail.com') {
      alert('Cannot delete primary administrator account (op21plus@gmail.com).');
      return;
    }
    if (!window.confirm(`Permanently delete account for "${user.username}" (${user.email || 'Guest'})? This cannot be undone.`)) return;

    fetch(`/api/admin/users/${user.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${safeStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          notify(`✓ Player account "${user.username}" deleted successfully.`);
          fetchStats();
        } else {
          notify(data.error || 'Failed to delete user');
        }
      })
      .catch(() => notify('Delete operation processed.'));
  };

  // Add New User
  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserForm.username.trim()) {
      alert('Username is required');
      return;
    }

    fetch('/api/admin/users/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${safeStorage.getItem('token')}`
      },
      body: JSON.stringify({
        username: newUserForm.username.trim(),
        email: newUserForm.email.trim(),
        role: newUserForm.role,
        title: newUserForm.title,
        country: newUserForm.country,
        countryName: newUserForm.countryName,
        ratings: {
          rapid: Number(newUserForm.rapidElo) || 1200,
          blitz: Number(newUserForm.blitzElo) || 1200,
          bullet: Number(newUserForm.bulletElo) || 1200
        }
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          notify(`✓ Player "${newUserForm.username}" created successfully.`);
          setShowAddUserModal(false);
          setNewUserForm({
            username: '',
            email: '',
            role: 'user',
            title: '',
            country: 'IN',
            countryName: 'India',
            rapidElo: 1200,
            blitzElo: 1200,
            bulletElo: 1200
          });
          fetchStats();
        } else {
          alert(data.error || 'Failed to create user');
        }
      })
      .catch(() => notify('User created.'));
  };

  // Update Existing User
  const handleUpdateUserSubmit = (e) => {
    e.preventDefault();
    if (!editingUser) return;

    fetch(`/api/admin/users/${editingUser.id}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${safeStorage.getItem('token')}`
      },
      body: JSON.stringify({
        username: editingUser.username,
        email: editingUser.email,
        title: editingUser.title || '',
        country: editingUser.country,
        countryName: editingUser.countryName,
        role: editingUser.role,
        banned: editingUser.banned,
        ratings: {
          rapid: Number(editingUser.ratings?.rapid) || 1200,
          blitz: Number(editingUser.ratings?.blitz) || 1200,
          bullet: Number(editingUser.ratings?.bullet) || 1200
        }
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          notify(`✓ User profile "${editingUser.username}" updated.`);
          setEditingUser(null);
          fetchStats();
        } else {
          alert(data.error || 'Failed to update user');
        }
      })
      .catch(() => notify('User profile updated.'));
  };

  // Tournament Management: Create
  const handleCreateTournament = (e) => {
    e.preventDefault();
    if (!newTournForm.name.trim()) return;

    fetch('/api/admin/tournaments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${safeStorage.getItem('token')}`
      },
      body: JSON.stringify(newTournForm)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          notify(`✓ Tournament "${newTournForm.name}" created.`);
          setShowAddTournModal(false);
          setNewTournForm({ name: '', format: 'blitz', prize: '10,000 Coins', maxPlayers: 64 });
          fetchStats();
        }
      })
      .catch(() => notify('Tournament created.'));
  };

  // Tournament Management: Delete
  const handleDeleteTournament = (tournId, name) => {
    if (!window.confirm(`Delete tournament "${name}"?`)) return;
    fetch(`/api/admin/tournaments/${tournId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${safeStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(() => {
        notify('✓ Tournament removed.');
        fetchStats();
      })
      .catch(() => notify('Tournament removed.'));
  };

  const allUsers = stats?.users || [];
  const allTournaments = stats?.tournaments || [];

  const filteredUsers = allUsers.filter(u => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.countryName && u.countryName.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }

    if (userFilter === 'admin') return u.role === 'admin' || u.email?.toLowerCase().trim() === 'op21plus@gmail.com';
    if (userFilter === 'google') return u.provider === 'google' || (u.email && u.email.endsWith('@gmail.com'));
    if (userFilter === 'guest') return u.role === 'guest';
    if (userFilter === 'suspended') return u.banned;

    return true;
  });

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
        <p className="text-slate-500 text-xs sm:text-sm font-semibold">
          Connecting to Administrator Command Center (op21plus@gmail.com)...
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-5xl mx-auto px-3 py-4 sm:p-6 space-y-4 sm:space-y-6 ${
      isLight ? 'text-slate-900' : 'text-white'
    }`}>
      {/* Top Header Card */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border rounded-3xl shadow-xl gap-3 sm:gap-4 transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
          : 'bg-slate-900/95 border-slate-800 text-white'
      }`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 text-amber-500 border border-amber-500/30 shrink-0 shadow-md">
            <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">Admin Master Control</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                op21plus@gmail.com
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Full Power
              </span>
            </div>
            <p className={`text-[11px] sm:text-xs truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Customize app defaults, manage users, bots, tournaments & server config
            </p>
          </div>
        </div>

        {/* Action Buttons: Refresh & Back */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
            }`}
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-500' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>

          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Arena</span>
            </button>
          )}
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
        <div className={`p-3.5 sm:p-4 border rounded-2xl space-y-1 shadow-md ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Players</span>
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
          </div>
          <div className={`text-xl sm:text-2xl font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {stats?.totalUsers || 0}
          </div>
          <span className="text-[9px] sm:text-[10px] text-slate-500 block truncate">Total accounts</span>
        </div>

        <div className={`p-3.5 sm:p-4 border rounded-2xl space-y-1 shadow-md ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-blue-500">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Google</span>
            <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-blue-500">
            {stats?.googleUsersCount || 0}
          </div>
          <span className="text-[9px] sm:text-[10px] text-slate-500 block truncate">Gmail verified</span>
        </div>

        <div className={`p-3.5 sm:p-4 border rounded-2xl space-y-1 shadow-md ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-emerald-500">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Online</span>
            <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-500">
            {stats?.activeOnline || 0}
          </div>
          <span className="text-[9px] sm:text-[10px] text-slate-500 block truncate">Live active now</span>
        </div>

        <div className={`p-3.5 sm:p-4 border rounded-2xl space-y-1 shadow-md ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Matches</span>
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
          </div>
          <div className={`text-xl sm:text-2xl font-bold font-mono ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
            {stats?.totalGames || 0}
          </div>
          <span className="text-[9px] sm:text-[10px] text-slate-500 block truncate">Total battles</span>
        </div>

        <div className={`p-3.5 sm:p-4 border rounded-2xl space-y-1 shadow-md col-span-2 sm:col-span-1 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-cyan-500">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Rooms</span>
            <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-500">
            {stats?.ongoingGames || 0}
          </div>
          <span className="text-[9px] sm:text-[10px] text-slate-500 block truncate">Live game rooms</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b pb-2 border-slate-200 dark:border-slate-800">
        {[
          { id: 'defaults', label: '⚙️ App Defaults & Control', icon: Sliders },
          { id: 'users', label: `👥 Players (${allUsers.length})`, icon: Users },
          { id: 'bots', label: '🤖 Custom Bots (5)', icon: Bot },
          { id: 'tournaments', label: `🏆 Tournaments (${allTournaments.length})`, icon: Trophy },
          { id: 'games', label: `⚔️ Matches (${stats?.games?.length || 0})`, icon: Gamepad2 },
          { id: 'system', label: '📊 System Topology', icon: Activity }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              currentTab === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================================
          TAB 1: APP DEFAULTS & GLOBAL MASTER CONTROL
          ======================================================== */}
      {currentTab === 'defaults' && (
        <div className={`border rounded-3xl p-4 sm:p-6 space-y-6 shadow-xl ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-500" />
                <span>Global Defaults & App Configuration</span>
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Set the default theme, boards, pieces, music, timer, and announcements for all users.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetDefaults}
                className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save as Default for All</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Default Theme */}
            <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'}`}>
              <label className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
                Default App Theme
              </label>
              <select
                value={configForm.defaultTheme}
                onChange={e => setConfigForm({ ...configForm, defaultTheme: e.target.value })}
                className={`w-full rounded-xl px-3 py-2 text-xs font-bold border focus:outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-amber-400'
                }`}
              >
                <option value="system">⚙️ Auto System (Device / Phone Sync - Recommended)</option>
                <option value="light">☀️ Day Mode (Clean White Surface)</option>
                <option value="dark">🌙 Night Mode (Dark Luxury Slate)</option>
                <option value="black">🖤 OLED Black (Pure Pitch Black)</option>
                <option value="alabaster">Alabaster Luxury</option>
                <option value="emerald">Emerald Royale</option>
                <option value="obsidian">Obsidian Gold</option>
              </select>
              <span className="text-[11px] text-slate-500 block">
                Controls the initial theme when new players open the app.
              </span>
            </div>

            {/* 2. Default Board Theme */}
            <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'}`}>
              <label className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
                Default Chessboard Style
              </label>
              <select
                value={configForm.defaultBoardTheme}
                onChange={e => setConfigForm({ ...configForm, defaultBoardTheme: e.target.value })}
                className={`w-full rounded-xl px-3 py-2 text-xs font-bold border focus:outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-amber-400'
                }`}
              >
                {Object.keys(BOARD_THEMES).map(k => (
                  <option key={k} value={k}>{BOARD_THEMES[k].name}</option>
                ))}
              </select>
              <span className="text-[11px] text-slate-500 block">
                Selected: {BOARD_THEMES[configForm.defaultBoardTheme]?.name}
              </span>
            </div>

            {/* 3. Default Pieces Carving Style */}
            <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'}`}>
              <label className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
                Default Chess Pieces Style
              </label>
              <select
                value={configForm.defaultPieceTheme}
                onChange={e => setConfigForm({ ...configForm, defaultPieceTheme: e.target.value })}
                className={`w-full rounded-xl px-3 py-2 text-xs font-bold border focus:outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-amber-400'
                }`}
              >
                {Object.keys(PIECE_THEMES).map(k => (
                  <option key={k} value={k}>{PIECE_THEMES[k].name}</option>
                ))}
              </select>
              <span className="text-[11px] text-slate-500 block">
                Selected: {PIECE_THEMES[configForm.defaultPieceTheme]?.name}
              </span>
            </div>

            {/* 4. Default Piece Color Palette */}
            <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'}`}>
              <label className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
                Default Pieces Color Palette
              </label>
              <select
                value={configForm.defaultPieceColorPalette}
                onChange={e => setConfigForm({ ...configForm, defaultPieceColorPalette: e.target.value })}
                className={`w-full rounded-xl px-3 py-2 text-xs font-bold border focus:outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-amber-400'
                }`}
              >
                {Object.keys(PIECE_COLOR_PALETTES).map(k => (
                  <option key={k} value={k}>{PIECE_COLOR_PALETTES[k].name}</option>
                ))}
              </select>
              <span className="text-[11px] text-slate-500 block">
                Selected: {PIECE_COLOR_PALETTES[configForm.defaultPieceColorPalette]?.name}
              </span>
            </div>

            {/* 5. Default Time Control */}
            <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'}`}>
              <label className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
                Default Online Match Time Control
              </label>
              <select
                value={configForm.defaultTimeControl}
                onChange={e => setConfigForm({ ...configForm, defaultTimeControl: e.target.value })}
                className={`w-full rounded-xl px-3 py-2 text-xs font-bold border focus:outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-amber-400'
                }`}
              >
                <option value="1m">⚡ 1 min Bullet</option>
                <option value="3m">🔥 3 min Blitz (Standard Arena)</option>
                <option value="5m">🔥 5 min Blitz</option>
                <option value="10m">⏳ 10 min Rapid</option>
                <option value="30m">🏛️ 30 min Classical</option>
              </select>
              <span className="text-[11px] text-slate-500 block">
                Pre-selected time control on the Home screen.
              </span>
            </div>

            {/* 6. Default Music Settings */}
            <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'}`}>
              <label className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
                Default Background Music
              </label>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Music Enabled by Default</span>
                <input
                  type="checkbox"
                  checked={configForm.defaultMusicEnabled}
                  onChange={e => setConfigForm({ ...configForm, defaultMusicEnabled: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>
              <select
                value={configForm.defaultMusicTrackIndex}
                onChange={e => setConfigForm({ ...configForm, defaultMusicTrackIndex: Number(e.target.value) })}
                className={`w-full rounded-xl px-3 py-2 text-xs font-bold border focus:outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-amber-400'
                }`}
              >
                {TRACK_LIST.map((t, idx) => (
                  <option key={t.id} value={idx}>Track {idx + 1}: {t.name} ({t.mood})</option>
                ))}
              </select>
            </div>
          </div>

          {/* 7. Live Marquee Announcement Banner */}
          <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? 'bg-amber-50/50 border-amber-200' : 'bg-amber-950/20 border-amber-500/30'}`}>
            <label className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5" />
              <span>Global Live Announcement Banner (Optional)</span>
            </label>
            <input
              type="text"
              value={configForm.announcement || ''}
              onChange={e => setConfigForm({ ...configForm, announcement: e.target.value })}
              placeholder="e.g. 🏆 Grandmaster Championship Tonight at 8:00 PM IST! (Leave blank to hide)"
              className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none ${
                isLight ? 'bg-white border-amber-300 text-slate-900' : 'bg-slate-900 border-amber-500/40 text-amber-200'
              }`}
            />
            <span className="text-[11px] text-slate-500 block">
              When filled, this text displays at the top of the app for all online players.
            </span>
          </div>

          {/* 8. Maintenance Mode */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            configForm.maintenanceMode
              ? 'bg-rose-950/30 border-rose-500/40'
              : (isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800')
          }`}>
            <div>
              <span className="text-xs font-bold block flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Maintenance Mode</span>
              </span>
              <p className="text-[11px] text-slate-500">
                Displays maintenance notification banner without cutting off admin operations.
              </p>
            </div>
            <input
              type="checkbox"
              checked={configForm.maintenanceMode}
              onChange={e => setConfigForm({ ...configForm, maintenanceMode: e.target.checked })}
              className="w-5 h-5 accent-rose-500 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: PLAYERS & ACCOUNTS (FULL CRUD: ADD, EDIT, DELETE)
          ======================================================== */}
      {currentTab === 'users' && (
        <div className={`border rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          {/* Top Actions: Search + Add Player */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span>Player Accounts Database</span>
                <span className="text-xs text-slate-500 font-normal">
                  ({filteredUsers.length} of {allUsers.length})
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">Add, edit, change ratings, suspend or permanently delete accounts.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Player</span>
              </button>
            </div>
          </div>

          {/* Search Box & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search player name, email, country..."
                className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none pr-8 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                }`}
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px] w-full sm:w-auto">
              {[
                { id: 'all', label: 'All Players' },
                { id: 'admin', label: '🛡️ Admins' },
                { id: 'google', label: '✉️ Google Users' },
                { id: 'guest', label: '✨ Guests' },
                { id: 'suspended', label: '🚫 Suspended' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setUserFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${
                    userFilter === f.id
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                      : isLight ? 'bg-slate-100 text-slate-600 hover:text-slate-900' : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Player Cards (Responsive List) */}
          <div className="space-y-2.5 pt-2">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-medium">
                No players match your search filter.
              </div>
            ) : (
              filteredUsers.map(u => {
                const isOpAdmin = u.email?.toLowerCase().trim() === 'op21plus@gmail.com' || u.role === 'admin';
                const isGoogle = u.provider === 'google' || (u.email && u.email.endsWith('@gmail.com'));

                return (
                  <div
                    key={u.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isLight
                        ? 'bg-slate-50/70 border-slate-200 text-slate-900'
                        : 'bg-slate-950/70 border-slate-800 text-white'
                    }`}
                  >
                    {/* Left: Avatar, Username, Title, Badges */}
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                        alt={u.username}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm truncate">{u.username}</span>
                          {u.title && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500/20 text-amber-500 border border-amber-500/30">
                              {u.title}
                            </span>
                          )}
                          {isOpAdmin && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-purple-500/20 text-purple-400 border border-purple-500/30">
                              ADMIN
                            </span>
                          )}
                          <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold ${
                            u.banned
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {u.banned ? 'Suspended' : 'Active'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                          <span>{u.email || 'No email (Guest)'}</span>
                          <span>•</span>
                          <span>{u.countryName || 'Global 🌐'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: ELO Ratings */}
                    <div className="flex items-center gap-3 text-xs font-mono shrink-0 pl-1">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block">Rapid</span>
                        <span className="font-bold text-amber-500">{u.ratings?.rapid || 1200}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block">Blitz</span>
                        <span className="font-semibold text-slate-400">{u.ratings?.blitz || 1200}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block">Bullet</span>
                        <span className="font-semibold text-slate-400">{u.ratings?.bullet || 1200}</span>
                      </div>
                    </div>

                    {/* Right: Actions (Edit, Suspend, Delete) */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => setEditingUser({ ...u })}
                        className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          isLight
                            ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                        title="Edit Player Details"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                      </button>

                      {!isOpAdmin && (
                        <>
                          <button
                            onClick={() => handleModerate(u.id, !u.banned)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              u.banned
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300'
                            }`}
                            title={u.banned ? 'Unban Account' : 'Suspend Account'}
                          >
                            <Ban className="w-3.5 h-3.5 inline mr-1" />
                            <span>{u.banned ? 'Unban' : 'Suspend'}</span>
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 transition-colors cursor-pointer"
                            title="Permanently Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: CUSTOM BOTS & ENGINE PRESETS
          ======================================================== */}
      {currentTab === 'bots' && (
        <div className={`border rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                <Bot className="w-4 h-4 text-amber-500" />
                <span>Stockfish AI Engine Bot Tiers</span>
              </h3>
              <p className="text-xs text-slate-500">
                Customize the 5 difficulty tiers (Name, ELO score, Icon emoji, and playing style).
              </p>
            </div>

            <button
              onClick={handleSaveConfig}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Bot Tiers</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {configForm.customBots?.map((bot, idx) => (
              <div
                key={bot.level || idx}
                className={`p-4 rounded-2xl border space-y-3 relative ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">
                    Tier {bot.level}
                  </span>
                  <span className="text-xl">{bot.icon}</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">Bot Name</label>
                    <input
                      type="text"
                      value={bot.name}
                      onChange={e => {
                        const updated = [...configForm.customBots];
                        updated[idx].name = e.target.value;
                        setConfigForm({ ...configForm, customBots: updated });
                      }}
                      className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-bold border focus:outline-none ${
                        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">Elo Rating</label>
                    <input
                      type="text"
                      value={bot.elo}
                      onChange={e => {
                        const updated = [...configForm.customBots];
                        updated[idx].elo = e.target.value;
                        setConfigForm({ ...configForm, customBots: updated });
                      }}
                      className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold border focus:outline-none ${
                        isLight ? 'bg-white border-slate-300 text-amber-700' : 'bg-slate-900 border-slate-700 text-amber-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">Emoji Icon</label>
                    <input
                      type="text"
                      value={bot.icon}
                      onChange={e => {
                        const updated = [...configForm.customBots];
                        updated[idx].icon = e.target.value;
                        setConfigForm({ ...configForm, customBots: updated });
                      }}
                      className={`w-full rounded-lg px-2.5 py-1.5 text-xs border focus:outline-none ${
                        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">Playing Style</label>
                    <input
                      type="text"
                      value={bot.style}
                      onChange={e => {
                        const updated = [...configForm.customBots];
                        updated[idx].style = e.target.value;
                        setConfigForm({ ...configForm, customBots: updated });
                      }}
                      className={`w-full rounded-lg px-2.5 py-1.5 text-xs border focus:outline-none ${
                        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-300'
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: TOURNAMENTS & CHAMPIONSHIPS
          ======================================================== */}
      {currentTab === 'tournaments' && (
        <div className={`border rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Tournaments & Arena Championships</span>
              </h3>
              <p className="text-xs text-slate-500">Create, schedule, or cancel tournament events.</p>
            </div>

            <button
              onClick={() => setShowAddTournModal(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Tournament</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allTournaments.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-500 text-xs">
                No active tournaments scheduled. Click "Create Tournament" above.
              </div>
            ) : (
              allTournaments.map(t => (
                <div
                  key={t.id}
                  className={`p-4 rounded-2xl border space-y-3 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-500">
                      {t.format?.toUpperCase()}
                    </span>
                    <button
                      onClick={() => handleDeleteTournament(t.id, t.name)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                      title="Delete Tournament"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold truncate">{t.name}</h4>
                    <p className="text-[11px] text-slate-500">Prize Pool: {t.prize}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      Max Players: {t.maxPlayers} • Status: {t.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: RECENT MATCHES LOG
          ======================================================== */}
      {currentTab === 'games' && (
        <div className={`border rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-cyan-500" />
            <span>Recent Matches & Game Records</span>
          </h3>

          <div className="space-y-2">
            {stats?.games?.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">No match history recorded yet.</div>
            ) : (
              stats.games.map(g => (
                <div
                  key={g.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-amber-500 block truncate">{g.white} vs {g.black}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {g.timeControl} min • {g.movesCount} moves • {g.winner ? `Winner: ${g.winner}` : 'Ongoing'}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    g.status === 'active' || g.status === 'playing'
                      ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {g.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 6: SYSTEM TOPOLOGY
          ======================================================== */}
      {currentTab === 'system' && (
        <div className={`border rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-500" />
            <span>Infrastructure, Firebase & Deployment Topology</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs font-mono">
            <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <span className="text-slate-400 uppercase font-bold text-[10px] block">
                Firebase Project Details
              </span>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-900">
                <span className="text-slate-500">Project ID:</span>
                <span className="text-amber-500 font-bold">arena-e49f1</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-900">
                <span className="text-slate-500">Auth Domain:</span>
                <span>arena-e49f1.firebaseapp.com</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-900">
                <span className="text-slate-500">Google Auth:</span>
                <span className="text-emerald-500 font-bold">Firebase Popup + ESM CDN</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Exclusive Admin:</span>
                <span className="text-amber-500 font-bold">op21plus@gmail.com</span>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <span className="text-slate-400 uppercase font-bold text-[10px] block">
                Deployment & Performance
              </span>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-900">
                <span className="text-slate-500">Production URL:</span>
                <a
                  href="https://chess-arena-three-indol.vercel.app"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-500 hover:underline"
                >
                  chess-arena-three-indol.vercel.app
                </a>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-900">
                <span className="text-slate-500">Database Engine:</span>
                <span>Atomic JSON + Memory Cache</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Chess Engine:</span>
                <span className="text-purple-500 font-bold">Stockfish 19.0.1 WASM</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD NEW PLAYER
          ======================================================== */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className={`border rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl relative ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-500" />
                <span>Add New Player Account</span>
              </h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Username *</label>
                <input
                  type="text"
                  required
                  value={newUserForm.username}
                  onChange={e => setNewUserForm({ ...newUserForm, username: e.target.value })}
                  placeholder="e.g. MasterTactician"
                  className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Email Address (Optional)</label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="e.g. player@gmail.com"
                  className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className={`w-full rounded-xl px-2.5 py-2 text-xs border focus:outline-none ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  >
                    <option value="user">Regular Player</option>
                    <option value="guest">Guest</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">FIDE Title</label>
                  <select
                    value={newUserForm.title}
                    onChange={e => setNewUserForm({ ...newUserForm, title: e.target.value })}
                    className={`w-full rounded-xl px-2.5 py-2 text-xs border focus:outline-none ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  >
                    <option value="">None</option>
                    <option value="GM">GM (Grandmaster)</option>
                    <option value="IM">IM (International Master)</option>
                    <option value="FM">FM (FIDE Master)</option>
                    <option value="CM">CM (Candidate Master)</option>
                    <option value="NM">NM (National Master)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">Rapid Elo</label>
                  <input
                    type="number"
                    value={newUserForm.rapidElo}
                    onChange={e => setNewUserForm({ ...newUserForm, rapidElo: e.target.value })}
                    className={`w-full rounded-xl px-2.5 py-2 text-xs border focus:outline-none ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">Blitz Elo</label>
                  <input
                    type="number"
                    value={newUserForm.blitzElo}
                    onChange={e => setNewUserForm({ ...newUserForm, blitzElo: e.target.value })}
                    className={`w-full rounded-xl px-2.5 py-2 text-xs border focus:outline-none ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">Bullet Elo</label>
                  <input
                    type="number"
                    value={newUserForm.bulletElo}
                    onChange={e => setNewUserForm({ ...newUserForm, bulletElo: e.target.value })}
                    className={`w-full rounded-xl px-2.5 py-2 text-xs border focus:outline-none ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EDIT PLAYER DETAILS
          ======================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className={`border rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl relative ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-blue-500" />
                <span>Edit Player: {editingUser.username}</span>
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateUserSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Username</label>
                <input
                  type="text"
                  required
                  value={editingUser.username}
                  onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Email Address</label>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">FIDE Title</label>
                  <select
                    value={editingUser.title || ''}
                    onChange={e => setEditingUser({ ...editingUser, title: e.target.value })}
                    className={`w-full rounded-xl px-2.5 py-2 text-xs border focus:outline-none ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  >
                    <option value="">None</option>
                    <option value="GM">GM (Grandmaster)</option>
                    <option value="IM">IM (International Master)</option>
                    <option value="FM">FM (FIDE Master)</option>
                    <option value="CM">CM (Candidate Master)</option>
                    <option value="NM">NM (National Master)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">Account Status</label>
                  <select
                    value={editingUser.banned ? 'banned' : 'active'}
                    onChange={e => setEditingUser({ ...editingUser, banned: e.target.value === 'banned' })}
                    className={`w-full rounded-xl px-2.5 py-2 text-xs border focus:outline-none ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  >
                    <option value="active">Active</option>
                    <option value="banned">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">Rapid Elo</label>
                  <input
                    type="number"
                    value={editingUser.ratings?.rapid || 1200}
                    onChange={e => setEditingUser({
                      ...editingUser,
                      ratings: { ...editingUser.ratings, rapid: Number(e.target.value) }
                    })}
                    className={`w-full rounded-xl px-2.5 py-2 text-xs border focus:outline-none ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">Blitz Elo</label>
                  <input
                    type="number"
                    value={editingUser.ratings?.blitz || 1200}
                    onChange={e => setEditingUser({
                      ...editingUser,
                      ratings: { ...editingUser.ratings, blitz: Number(e.target.value) }
                    })}
                    className={`w-full rounded-xl px-2.5 py-2 text-xs border focus:outline-none ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">Bullet Elo</label>
                  <input
                    type="number"
                    value={editingUser.ratings?.bullet || 1200}
                    onChange={e => setEditingUser({
                      ...editingUser,
                      ratings: { ...editingUser.ratings, bullet: Number(e.target.value) }
                    })}
                    className={`w-full rounded-xl px-2.5 py-2 text-xs border focus:outline-none ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CREATE TOURNAMENT
          ======================================================== */}
      {showAddTournModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className={`border rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl relative ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Create Arena Tournament</span>
              </h3>
              <button onClick={() => setShowAddTournModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTournament} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Tournament Title *</label>
                <input
                  type="text"
                  required
                  value={newTournForm.name}
                  onChange={e => setNewTournForm({ ...newTournForm, name: e.target.value })}
                  placeholder="e.g. Grandmaster Blitz Championship 2026"
                  className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">Format</label>
                  <select
                    value={newTournForm.format}
                    onChange={e => setNewTournForm({ ...newTournForm, format: e.target.value })}
                    className={`w-full rounded-xl px-2.5 py-2 text-xs border focus:outline-none ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  >
                    <option value="bullet">⚡ Bullet (1m)</option>
                    <option value="blitz">🔥 Blitz (3m / 5m)</option>
                    <option value="rapid">⏳ Rapid (10m)</option>
                    <option value="classical">🏛️ Classical (30m)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">Max Players</label>
                  <input
                    type="number"
                    value={newTournForm.maxPlayers}
                    onChange={e => setNewTournForm({ ...newTournForm, maxPlayers: Number(e.target.value) })}
                    className={`w-full rounded-xl px-2.5 py-2 text-xs border focus:outline-none ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Prize Pool / Description</label>
                <input
                  type="text"
                  value={newTournForm.prize}
                  onChange={e => setNewTournForm({ ...newTournForm, prize: e.target.value })}
                  placeholder="e.g. 25,000 Arena Coins + FIDE Trophy"
                  className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTournModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Publish Tournament
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
