import React, { useState, useEffect, useMemo } from 'react';
import {
  User, Trophy, Settings, Award, Shield, Flame, Sparkles,
  Edit2, Check, ArrowRight, LogOut, LogIn, ChevronRight, ChevronDown, Globe,
  BarChart3, Sun, Moon, SunMoon, Contrast, Monitor
} from 'lucide-react';
import { calculateUserRanking } from '../data/leaderboardData.js';
import { safeStorage } from '../utils/storage.js';
import { LeaderboardView } from './LeaderboardView.jsx';
import { SettingsModal } from './SettingsModal.jsx';
import { ACHIEVEMENTS_DATA } from './ProfileModal.jsx';
import { FAMOUS_AVATARS, AVATAR_CATEGORIES, ANIME_AVATARS } from '../data/avatarData.js';
import { triggerHaptic } from '../utils/device.js';
import { sound } from '../utils/audio.js';

export function ProfileView({
  user,
  onUpdateUser,
  settings,
  onUpdateSettings,
  onOpenStreak,
  onOpenAdmin,
  onSignOut,
  onSignIn
}) {
  // Accordion state: by default ALL 3 buttons are strictly CLOSED
  const [openSections, setOpenSections] = useState({
    stats: false,
    rankings: false,
    settings: false,
  });

  // Achievements section inside Statistics is closed by default
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);

  const toggleSection = (sectionKey) => {
    sound.playClick();
    triggerHaptic('move');
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '');
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarCategory, setAvatarCategory] = useState('all');

  const filteredAvatars = useMemo(() => {
    if (avatarCategory === 'all') return FAMOUS_AVATARS;
    return FAMOUS_AVATARS.filter(a => a.category === avatarCategory);
  }, [avatarCategory]);

  // Current ranking calculation
  const userElo = user?.ratings?.rapid || user?.elo || 1078;
  const { rank: userRank, totalPlayers, percentile, countryRank } = useMemo(
    () => calculateUserRanking(userElo),
    [userElo]
  );

  const unlockedSet = useMemo(() => new Set(user?.achievements || []), [user?.achievements]);
  const winRate = user?.stats?.played > 0
    ? Math.round(((user?.stats?.won || 0) / user.stats.played) * 100)
    : 0;

  const handleSaveAvatar = () => {
    triggerHaptic('move');
    const updatedUser = { ...user, avatar: selectedAvatar };
    if (onUpdateUser) onUpdateUser(updatedUser);
    setIsEditingAvatar(false);

    // Save to backend
    if (user?.id) {
      fetch(`/api/users/${user.id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${safeStorage.getItem('token')}`
        },
        body: JSON.stringify({ avatar: selectedAvatar })
      })
        .then(res => res.json())
        .then(data => {
          if (data.user && onUpdateUser) {
            onUpdateUser(data.user);
          }
        })
        .catch(() => {});
    }
  };

  return (
    <div className="max-w-5xl w-full mx-auto p-3 sm:p-6 space-y-3 sm:space-y-4 animate-fade-in pb-16">
      {/* Top Profile Header Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 relative z-10">
          {/* Avatar & User Details */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="relative group shrink-0">
              <img
                src={selectedAvatar || user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Guest'}
                alt={user?.username || 'Player'}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 sm:border-3 border-amber-500 shadow-lg bg-slate-950"
              />
              <button
                onClick={() => {
                  triggerHaptic('move');
                  setIsEditingAvatar(!isEditingAvatar);
                }}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-amber-500 border-2 border-slate-900 text-slate-950 font-bold hover:scale-110 transition-transform shadow-md"
                title="Change Avatar (32 Anime & Classic GM avatars)"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {user?.username || 'Guest Player'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold">
                  {user?.role === 'admin' ? '🛡️ Arena Admin' : '⚔️ Arena Competitor'}
                </span>
              </div>

              <p className="text-xs text-slate-400">
                Country: <span className="font-semibold text-slate-200">{user?.countryName || user?.country || 'India 🇮🇳'}</span>
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-2 pt-0.5 flex-wrap">
                <button
                  onClick={() => {
                    triggerHaptic('move');
                    if (onOpenStreak) onOpenStreak();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-bold hover:bg-orange-500/30 transition-colors shadow-xs"
                >
                  <Flame className="w-3.5 h-3.5 fill-orange-400 animate-pulse" />
                  <span>7 Day Streak</span>
                </button>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Better than {percentile}% of players
                </span>
              </div>
            </div>
          </div>

          {/* Quick Right Actions (Sign out / Sign In / Admin trigger) */}
          <div className="flex items-center gap-2 self-center sm:self-start">
            {(user?.role === 'admin' || user?.email?.toLowerCase() === 'op21plus@gmail.com') && onOpenAdmin && (
              <button
                onClick={() => {
                  triggerHaptic('move');
                  onOpenAdmin();
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Admin Command Center"
              >
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Admin Hub</span>
              </button>
            )}

            {user && (
              <button
                onClick={() => {
                  triggerHaptic('move');
                  if (onSignOut) onSignOut();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/40 text-slate-300 hover:text-red-400 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Famous Avatars Selector Drawer (Across Categories) */}
        {isEditingAvatar && (
          <div className="mt-5 p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 animate-fade-in shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Choose Your Avatar ({FAMOUS_AVATARS.length} Famous Characters)</span>
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {AVATAR_CATEGORIES.map(cat => {
                const count = cat.id === 'all'
                  ? FAMOUS_AVATARS.length
                  : FAMOUS_AVATARS.filter(a => a.category === cat.id).length;
                const isActive = avatarCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      triggerHaptic('move');
                      setAvatarCategory(cat.id);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Grid of Avatars */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 max-h-60 overflow-y-auto p-2 border border-slate-800/80 rounded-xl bg-slate-900/60 custom-scrollbar">
              {filteredAvatars.map((av, idx) => {
                const isSelected = selectedAvatar === av.url;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      triggerHaptic('move');
                      setSelectedAvatar(av.url);
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 scale-105'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-600 hover:bg-slate-900/80'
                    }`}
                    title={`${av.name} (${av.series})`}
                  >
                    <div className="relative">
                      <img
                        src={av.url}
                        alt={av.name}
                        className="w-12 h-12 rounded-full bg-slate-800 object-cover shadow-xs"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 rounded-full p-0.5 shadow">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-slate-200 truncate w-full text-center">
                      {av.name}
                    </span>
                    <span className="text-[8px] text-slate-500 truncate w-full text-center -mt-0.5">
                      {av.series}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsEditingAvatar(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAvatar}
                className="px-5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Apply Avatar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= DAY & NIGHT THEME SWITCH (SLIDING TOGGLE AAGE-PICHE) ================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-md">
        <div className="flex items-center justify-between gap-3">
          {/* Label & Active State */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              (settings?.appTheme || 'dark') === 'light'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
            }`}>
              {(settings?.appTheme || 'dark') === 'light' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-300" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">
                  {(settings?.appTheme || 'dark') === 'light'
                    ? 'Day Mode (Light)'
                    : (settings?.appTheme || 'dark') === 'black'
                    ? 'OLED Black'
                    : (settings?.appTheme || 'dark') === 'system'
                    ? 'Auto System'
                    : 'Night Mode (Dark)'}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                  {settings?.appTheme || 'dark'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                Slide switch for Day ☀️ & Night 🌙
              </p>
            </div>
          </div>

          {/* Interactive Sliding Switch: Left = Day ☀️ (piche) | Right = Night 🌙 (aage) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              role="switch"
              aria-checked={(settings?.appTheme || 'dark') !== 'light'}
              onClick={() => {
                const current = (settings?.appTheme || 'dark').toLowerCase();
                const nextTheme = current === 'light' ? 'dark' : 'light';
                sound.playClick();
                triggerHaptic('move');
                if (onUpdateSettings) {
                  onUpdateSettings({ ...settings, appTheme: nextTheme });
                }
              }}
              className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-300 ease-in-out focus:outline-none select-none ${
                (settings?.appTheme || 'dark') === 'light'
                  ? 'bg-amber-500/25 border-amber-400/60'
                  : 'bg-indigo-600/30 border-indigo-500/60'
              }`}
              title="Slide switch forward/backward for Day & Night"
            >
              {/* Day sun indicator on left */}
              <span className="absolute inset-y-0 left-1.5 flex items-center text-[10px] pointer-events-none select-none">
                ☀️
              </span>
              {/* Night moon indicator on right */}
              <span className="absolute inset-y-0 right-1.5 flex items-center text-[10px] pointer-events-none select-none">
                🌙
              </span>

              {/* Sliding Knob: Left (translate-x-0.5) for Day, Right (translate-x-8.5) for Night */}
              <span
                className={`pointer-events-none inline-block h-6.5 w-6.5 transform rounded-full shadow-md ring-0 transition duration-300 ease-in-out flex items-center justify-center my-auto ${
                  (settings?.appTheme || 'dark') === 'light'
                    ? 'translate-x-0.5 bg-amber-400 text-slate-950 shadow-amber-400/40'
                    : 'translate-x-8.5 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-indigo-500/40'
                }`}
              >
                {(settings?.appTheme || 'dark') === 'light' ? (
                  <Sun className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <Moon className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Compact Chip Row for OLED Black & Device Auto Sync */}
        <div className="flex items-center justify-end gap-1.5 mt-2 pt-2 border-t border-slate-800/80">
          <span className="text-[10px] text-slate-500 font-medium mr-auto">Options:</span>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              triggerHaptic('move');
              if (onUpdateSettings) onUpdateSettings({ ...settings, appTheme: 'light' });
            }}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
              (settings?.appTheme || 'dark') === 'light'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            ☀️ Day
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              triggerHaptic('move');
              if (onUpdateSettings) onUpdateSettings({ ...settings, appTheme: 'dark' });
            }}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
              (settings?.appTheme || 'dark') === 'dark'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🌙 Night
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              triggerHaptic('move');
              if (onUpdateSettings) onUpdateSettings({ ...settings, appTheme: 'black' });
            }}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
              (settings?.appTheme || 'dark') === 'black'
                ? 'bg-zinc-700 text-white border border-zinc-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🌑 OLED
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              triggerHaptic('move');
              if (onUpdateSettings) onUpdateSettings({ ...settings, appTheme: 'system' });
            }}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
              (settings?.appTheme || 'dark') === 'system'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            ⚙️ Auto
          </button>
        </div>
      </div>

      {/* ================= 3 INLINE ACCORDION OPTIONS ================= */}
      <div className="space-y-3">
        {/* ----------------- 1. STATISTICS & RECORDS ----------------- */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-md transition-all">
          <button
            type="button"
            onClick={() => toggleSection('stats')}
            className={`w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer select-none active:scale-[0.99] ${
              openSections.stats
                ? 'bg-amber-500/10 border-b border-amber-500/25'
                : 'hover:bg-slate-850'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                openSections.stats
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}>
                <BarChart3 className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                    Statistics & Records
                  </span>
                  <span className="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                    {userElo} Elo
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  Win rate {winRate}% • {unlockedSet.size} achievements
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                openSections.stats ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
              }`}>
                {openSections.stats ? 'Opened' : 'Closed'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                openSections.stats ? 'text-amber-400 rotate-180' : 'text-slate-500'
              }`} />
            </div>
          </button>

          {/* Expanded Content directly under Statistics & Records button */}
          {openSections.stats && (
            <div className="p-3.5 sm:p-5 space-y-4 bg-slate-950/60 animate-fade-in border-t border-slate-800/80">
              {/* Quick Player Ranking Standing Banner */}
              <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Player Standing & Global Rank</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      triggerHaptic('move');
                      setOpenSections(prev => ({ ...prev, rankings: true }));
                    }}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>View in Leaderboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">World Standing</span>
                    <div className="text-lg sm:text-xl font-black font-mono text-white">
                      #{userRank.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-500 block">of {totalPlayers.toLocaleString()} players</span>
                  </div>

                  <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">National Rank</span>
                    <div className="text-lg sm:text-xl font-black font-mono text-amber-300">
                      #{countryRank.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-500 block">in {user?.countryName || user?.country || 'India 🇮🇳'}</span>
                  </div>

                  <div className="col-span-2 sm:col-span-1 p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-0.5 flex flex-col justify-center">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Competitive Tier</span>
                    <div className="text-base font-black text-emerald-400">
                      Top {((100 - parseFloat(percentile))).toFixed(1)}%
                    </div>
                    <span className="text-[10px] text-slate-500 block">{percentile}% global lead</span>
                  </div>
                </div>
              </div>

              {/* Ratings Breakdown Grid */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                  Elo Ratings by Time Control
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  {[
                    { label: 'Bullet', rating: user?.ratings?.bullet || 1050, icon: '⚡' },
                    { label: 'Blitz', rating: user?.ratings?.blitz || 1120, icon: '🔥' },
                    { label: 'Rapid', rating: user?.ratings?.rapid || 1078, icon: '⏳' },
                    { label: 'Classical', rating: user?.ratings?.classical || 1190, icon: '🏛️' }
                  ].map((item) => (
                    <div key={item.label} className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl shadow-xs">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[10px] uppercase font-bold">{item.label}</span>
                        <span className="text-xs">{item.icon}</span>
                      </div>
                      <div className="text-xl font-black font-mono text-amber-400">{item.rating}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Career Stats */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                  Career Performance Record
                </h3>
                <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-center shadow-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-semibold">Total Matches</span>
                    <span className="text-lg sm:text-xl font-bold font-mono text-white">{user?.stats?.played || 18}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-semibold">Win Rate</span>
                    <span className="text-lg sm:text-xl font-bold font-mono text-emerald-400">{winRate || 68}%</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-semibold">Best Streak</span>
                    <span className="text-lg sm:text-xl font-bold font-mono text-orange-400">{user?.stats?.winStreak || 5} 🔥</span>
                  </div>
                </div>
              </div>

              {/* Collapsible Achievements Section (Closed by default) */}
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    triggerHaptic('move');
                    setIsAchievementsOpen(prev => !prev);
                  }}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors cursor-pointer select-none active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-sm shadow-xs">
                      🏆
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-white block">
                          Achievements & Badges
                        </span>
                        <span className="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {unlockedSet.size}/{ACHIEVEMENTS_DATA.length}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Tap to {isAchievementsOpen ? 'collapse' : 'view full achievements shelf'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border transition-colors ${
                      isAchievementsOpen
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {isAchievementsOpen ? 'Hide' : 'Open Achievements'}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                      isAchievementsOpen ? 'text-amber-400 rotate-180' : 'text-slate-400'
                    }`} />
                  </div>
                </button>

                {isAchievementsOpen && (
                  <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/60 animate-fade-in space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {ACHIEVEMENTS_DATA.map((ach) => {
                        const unlocked = unlockedSet.has(ach.id);
                        return (
                          <div
                            key={ach.id}
                            className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                              unlocked
                                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-xs'
                                : 'bg-slate-950/40 border-slate-800/80 text-slate-600 opacity-60'
                            }`}
                          >
                            <span className="text-xl shrink-0">{ach.icon}</span>
                            <div className="min-w-0">
                              <span className="text-xs font-bold block truncate">{ach.name}</span>
                              <span className="text-[9px] text-slate-400 block truncate">{ach.desc}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ----------------- 2. RANKINGS & LEADERBOARD ----------------- */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-md transition-all">
          <button
            type="button"
            onClick={() => toggleSection('rankings')}
            className={`w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer select-none active:scale-[0.99] ${
              openSections.rankings
                ? 'bg-emerald-500/10 border-b border-emerald-500/25'
                : 'hover:bg-slate-850'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                openSections.rankings
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}>
                <Trophy className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                    Rankings & Leaderboard
                  </span>
                  <span className="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                    #{userRank.toLocaleString()}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  Top {((100 - parseFloat(percentile))).toFixed(1)}% worldwide
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                openSections.rankings ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
              }`}>
                {openSections.rankings ? 'Opened' : 'Closed'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                openSections.rankings ? 'text-emerald-400 rotate-180' : 'text-slate-500'
              }`} />
            </div>
          </button>

          {/* Expanded Content directly under Rankings & Leaderboard button */}
          {openSections.rankings && (
            <div className="p-2.5 sm:p-4 bg-slate-950/60 animate-fade-in border-t border-slate-800/80">
              <LeaderboardView currentUser={user} />
            </div>
          )}
        </div>

        {/* ----------------- 3. SETTINGS & PREFERENCES ----------------- */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-md transition-all">
          <button
            type="button"
            onClick={() => toggleSection('settings')}
            className={`w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer select-none active:scale-[0.99] ${
              openSections.settings
                ? 'bg-sky-500/10 border-b border-sky-500/25'
                : 'hover:bg-slate-850'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                openSections.settings
                  ? 'bg-sky-500/20 border-sky-500/50 text-sky-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}>
                <Settings className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                    Settings & Preferences
                  </span>
                  <span className="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 capitalize shrink-0">
                    {settings?.appTheme || 'dark'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  Board styles, pieces, audio & clocks
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                openSections.settings ? 'bg-sky-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
              }`}>
                {openSections.settings ? 'Opened' : 'Closed'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                openSections.settings ? 'text-sky-400 rotate-180' : 'text-slate-500'
              }`} />
            </div>
          </button>

          {/* Expanded Content directly under Settings & Preferences button */}
          {openSections.settings && (
            <div className="p-2 sm:p-4 bg-slate-950/60 animate-fade-in border-t border-slate-800/80">
              <SettingsModal
                isOpen={true}
                isEmbedded={true}
                settings={settings}
                onUpdateSettings={onUpdateSettings}
              />
            </div>
          )}
        </div>
      </div>

      {/* ================= DEDICATED ACCOUNT AUTH SECTION AT THE VERY LAST ================= */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden mt-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
              user ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}>
              {user ? <Check className="w-6 h-6 text-emerald-400" /> : <LogIn className="w-6 h-6 text-amber-400" />}
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white flex items-center justify-center sm:justify-start gap-2">
                <span>{user ? 'Account Connected' : 'Google & Gmail Authentication'}</span>
                {user && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                    Active
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {user ? (
                  <span>Signed in as <strong className="text-slate-200">{user.username}</strong> ({user.email || 'Gmail Account'})</span>
                ) : (
                  <span>Sign in with Google / Gmail to save your ratings, climb leaderboards, and sync progress across devices.</span>
                )}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto shrink-0">
            {user ? (
              <button
                onClick={() => {
                  triggerHaptic('move');
                  if (onSignOut) onSignOut();
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/50 text-slate-200 hover:text-rose-300 font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                title="Sign Out of Account"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  triggerHaptic('move');
                  if (onSignIn) onSignIn();
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                title="Sign In with Google / Gmail"
              >
                <LogIn className="w-4 h-4 text-slate-950" />
                <span>Sign In with Gmail</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
