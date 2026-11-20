import React, { useState, useMemo } from 'react';
import {
  User, Trophy, Settings, Award, Shield, Flame, Sparkles,
  Edit2, Check, ArrowRight, LogOut, LogIn, ChevronRight, Globe
} from 'lucide-react';
import { calculateUserRanking } from '../data/leaderboardData.js';
import { safeStorage } from '../utils/storage.js';
import { LeaderboardView } from './LeaderboardView.jsx';
import { SettingsModal } from './SettingsModal.jsx';
import { ACHIEVEMENTS_DATA } from './ProfileModal.jsx';
import { FAMOUS_AVATARS, AVATAR_CATEGORIES, ANIME_AVATARS } from '../data/avatarData.js';
import { triggerHaptic } from '../utils/device.js';

export function ProfileView({
  user,
  onUpdateUser,
  settings,
  onUpdateSettings,
  initialSubTab = 'overview',
  onOpenStreak,
  onOpenAdmin,
  onSignOut,
  onSignIn
}) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab); // 'overview' | 'rankings' | 'settings'
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

  const handleSubTabChange = (tab) => {
    triggerHaptic('move');
    setActiveSubTab(tab);
  };

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
    <div className="max-w-5xl w-full mx-auto p-3 sm:p-6 space-y-6 animate-fade-in pb-16">
      {/* Top Profile Header Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 relative z-10">
          {/* Avatar & User Details */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="relative group">
              <img
                src={selectedAvatar || user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Guest'}
                alt={user?.username || 'Player'}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-amber-500 shadow-xl bg-slate-950"
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

            {user ? (
              <button
                onClick={() => {
                  triggerHaptic('move');
                  if (onSignOut) onSignOut();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/40 text-slate-300 hover:text-red-400 text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  triggerHaptic('move');
                  if (onSignIn) onSignIn();
                }}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-transform active:scale-95 flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
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

      {/* Sub-Navigation Tabs: Overview & Stats | Rankings & Leaderboard | Settings | Sign In / Sign Out at the last */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
        {[
          { id: 'overview', label: 'Stats', icon: User },
          { id: 'rankings', label: 'Rankings', icon: Trophy },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSubTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}

        {/* Dedicated Sign In / Sign Out Tab at the Last */}
        {user ? (
          <button
            onClick={() => {
              triggerHaptic('move');
              if (onSignOut) onSignOut();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer"
            title="Sign Out of account"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="truncate">Sign Out</span>
          </button>
        ) : (
          <button
            onClick={() => {
              triggerHaptic('move');
              if (onSignIn) onSignIn();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-300 transition-all cursor-pointer"
            title="Sign In with Google / Gmail"
          >
            <LogIn className="w-4 h-4 shrink-0" />
            <span className="truncate">Sign In</span>
          </button>
        )}
      </div>

      {/* ================= VIEW 1: OVERVIEW & STATS ================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Quick Player Ranking Standing Banner */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Player Standing & Global Rank</span>
              </span>
              <button
                onClick={() => handleSubTabChange('rankings')}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline"
              >
                <span>Open Full Leaderboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">World Standing</span>
                <div className="text-xl font-black font-mono text-white">
                  #{userRank.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-500 block">of {totalPlayers.toLocaleString()} players</span>
              </div>

              <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">National Rank</span>
                <div className="text-xl font-black font-mono text-amber-300">
                  #{countryRank.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-500 block">in {user?.countryName || user?.country || 'India 🇮🇳'}</span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-0.5 flex flex-col justify-center">
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[
                { label: 'Bullet', rating: user?.ratings?.bullet || 1050, icon: '⚡' },
                { label: 'Blitz', rating: user?.ratings?.blitz || 1120, icon: '🔥' },
                { label: 'Rapid', rating: user?.ratings?.rapid || 1078, icon: '⏳' },
                { label: 'Classical', rating: user?.ratings?.classical || 1190, icon: '🏛️' }
              ].map((item) => (
                <div key={item.label} className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] uppercase font-bold">{item.label}</span>
                    <span className="text-sm">{item.icon}</span>
                  </div>
                  <div className="text-2xl font-black font-mono text-amber-400">{item.rating}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Career Stats */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Career Performance Record
            </h3>
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-3xl text-center shadow-md">
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Total Matches</span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-white">{user?.stats?.played || 18}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Win Rate</span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">{winRate || 68}%</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Best Streak</span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-orange-400">{user?.stats?.winStreak || 5} 🔥</span>
              </div>
            </div>
          </div>

          {/* Unlocked Achievements Shelf */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Unlocked Achievements ({unlockedSet.size} / {ACHIEVEMENTS_DATA.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {ACHIEVEMENTS_DATA.map((ach) => {
                const unlocked = unlockedSet.has(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                      unlocked
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-sm'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-600 opacity-60'
                    }`}
                  >
                    <span className="text-2xl">{ach.icon}</span>
                    <div className="min-w-0">
                      <span className="text-xs font-bold block truncate">{ach.name}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{ach.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 2: RANKINGS & LEADERBOARD ================= */}
      {activeSubTab === 'rankings' && (
        <div className="animate-fade-in">
          <LeaderboardView currentUser={user} />
        </div>
      )}

      {/* ================= VIEW 3: SETTINGS ================= */}
      {activeSubTab === 'settings' && (
        <div className="animate-fade-in">
          <SettingsModal
            isOpen={true}
            isEmbedded={true}
            settings={settings}
            onUpdateSettings={onUpdateSettings}
          />
        </div>
      )}

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
