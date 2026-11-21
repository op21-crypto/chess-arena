import React, { useState, useEffect, useMemo } from 'react';
import {
  User, Trophy, Settings, Award, Shield, Flame, Sparkles,
  Edit2, Check, ArrowRight, LogOut, LogIn, ChevronRight, ChevronDown, Globe,
  BarChart3, Sun, Moon, SunMoon, Contrast, Monitor, Crown, Search, X, Lock, Zap
} from 'lucide-react';
import { calculateUserRanking } from '../data/leaderboardData.js';
import { WORLD_COUNTRIES, getCountryByCode, getCountryFlag } from '../data/countries.js';
import { safeStorage } from '../utils/storage.js';
import { LeaderboardView } from './LeaderboardView.jsx';
import { SettingsModal } from './SettingsModal.jsx';
import { ACHIEVEMENTS_DATA } from './ProfileModal.jsx';
import { FAMOUS_AVATARS, AVATAR_CATEGORIES, getRandomAnimeAvatar } from '../data/avatarData.js';
import { triggerHaptic } from '../utils/device.js';
import { sound } from '../utils/audio.js';
import { STARTING_ELO_OPTIONS, getRankTier } from '../utils/elo.js';
import { getStreakInfo } from '../utils/streak.js';
import { EloSelectionModal } from './EloSelectionModal.jsx';

export function ProfileView({
  user,
  onUpdateUser,
  settings,
  onUpdateSettings,
  onOpenStreak,
  onOpenAdmin,
  onNavigateToLeaderboard,
  onSignOut,
  onSignIn,
  isLight,
  isOled
}) {
  const isLightMode = isLight !== undefined
    ? isLight
    : ((settings?.appTheme || 'system') === 'light' ||
       ((settings?.appTheme || 'system') === 'system' &&
        typeof window !== 'undefined' &&
        window.matchMedia &&
        !window.matchMedia('(prefers-color-scheme: dark)').matches));

  // Accordion state: by default ALL 3 sections are strictly closed
  const [openSections, setOpenSections] = useState({
    stats: false,
    rankings: false,
    settings: false,
  });

  // Achievements section inside Statistics is closed by default
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  const toggleSection = (sectionKey) => {
    sound.playClick();
    triggerHaptic('move');
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Avatar Drawer State
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || getRandomAnimeAvatar());
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarCategory, setAvatarCategory] = useState('all');

  // Keep selectedAvatar in sync with user.avatar
  useEffect(() => {
    if (user?.avatar) {
      setSelectedAvatar(user.avatar);
    }
  }, [user?.avatar]);

  const filteredAvatars = useMemo(() => {
    if (avatarCategory === 'all') return FAMOUS_AVATARS;
    return FAMOUS_AVATARS.filter(a => a.category === avatarCategory);
  }, [avatarCategory]);

  // Country Picker Modal State
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');

  const currentCountry = useMemo(() => {
    return getCountryByCode(user?.country || 'IN');
  }, [user?.country]);

  const POPULAR_COUNTRIES = useMemo(() => [
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
    { code: 'NO', name: 'Norway', flag: '🇳🇴' },
    { code: 'RU', name: 'Russia', flag: '🇷🇺' }
  ], []);

  const filteredCountries = useMemo(() => {
    const q = countrySearchQuery.trim().toLowerCase();
    if (!q) return WORLD_COUNTRIES;
    return WORLD_COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [countrySearchQuery]);

  const handleSelectCountry = (countryObj) => {
    sound.playClick();
    triggerHaptic('move');
    const updatedUser = {
      ...user,
      country: countryObj.code,
      countryName: countryObj.name,
      countryFlag: countryObj.flag
    };
    if (onUpdateUser) onUpdateUser(updatedUser);
    safeStorage.setItem('chess_arena_user_profile', JSON.stringify(updatedUser));
    safeStorage.setItem('chess_arena_user', JSON.stringify(updatedUser));

    if (user?.id) {
      fetch(`/api/users/${user.id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${safeStorage.getItem('token')}`
        },
        body: JSON.stringify({
          country: countryObj.code,
          countryName: countryObj.name
        })
      }).catch(() => {});
    }

    setIsCountryPickerOpen(false);
    setCountrySearchQuery('');
  };

  // Genuine Statistics & Records Tracking (100% Genuine, No Fake Fallbacks)
  const userElo = user?.ratings?.rapid || user?.elo || 1200;
  const bulletElo = user?.ratings?.bullet || 1200;
  const blitzElo = user?.ratings?.blitz || 1200;
  const rapidElo = user?.ratings?.rapid || 1200;
  const classicalElo = user?.ratings?.classical || 1200;

  const totalMatches = user?.stats?.played ?? 0;
  const wonMatches = user?.stats?.won ?? 0;
  const lostMatches = user?.stats?.lost ?? 0;
  const drawnMatches = user?.stats?.drawn ?? 0;
  const winStreak = user?.stats?.winStreak ?? 0;
  const winRate = totalMatches > 0
    ? Math.round((wonMatches / totalMatches) * 100)
    : 0;

  // Genuine Ranking & Percentile Calculation
  const { rank: userRank, totalPlayers, percentile, countryRank } = useMemo(
    () => calculateUserRanking(userElo, 1042040, user?.country || 'IN'),
    [userElo, user?.country]
  );

  const rankTier = useMemo(() => getRankTier(userElo), [userElo]);
  const [streakInfo, setStreakInfo] = useState(() => getStreakInfo());
  const [isEloModalOpen, setIsEloModalOpen] = useState(false);

  useEffect(() => {
    setStreakInfo(getStreakInfo());
  }, []);

  const hasSelectedInitialElo = Boolean(
    user?.initialEloSelected ||
    safeStorage.getItem('chess_arena_initial_elo_chosen')
  );

  const handleSelectInitialElo = (chosenElo) => {
    sound.playClick();
    triggerHaptic('success');
    const updatedUser = {
      ...user,
      elo: chosenElo,
      initialElo: chosenElo,
      initialEloSelected: true,
      ratings: {
        bullet: chosenElo,
        blitz: chosenElo,
        rapid: chosenElo,
        classical: chosenElo,
        puzzle: user?.ratings?.puzzle || chosenElo
      }
    };
    safeStorage.setItem('chess_arena_initial_elo_chosen', String(chosenElo));
    safeStorage.setItem('chess_arena_user', JSON.stringify(updatedUser));
    safeStorage.setItem('chess_arena_user_profile', JSON.stringify(updatedUser));
    if (onUpdateUser) onUpdateUser(updatedUser);

    if (user?.id) {
      fetch(`/api/users/${user.id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${safeStorage.getItem('token')}`
        },
        body: JSON.stringify({
          elo: chosenElo,
          initialElo: chosenElo,
          initialEloSelected: true,
          ratings: updatedUser.ratings
        })
      }).catch(() => {});
    }
  };

  const unlockedSet = useMemo(() => new Set(user?.achievements || []), [user?.achievements]);

  const handleSaveAvatar = () => {
    sound.playClick();
    triggerHaptic('move');
    const updatedUser = { ...user, avatar: selectedAvatar };
    if (onUpdateUser) onUpdateUser(updatedUser);
    setIsEditingAvatar(false);

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

  const handleNavigateToLeaderboard = () => {
    sound.playClick();
    triggerHaptic('move');
    setOpenSections(prev => ({ ...prev, rankings: true }));
    setTimeout(() => {
      const el = document.getElementById('profile-rankings-accordion');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
    if (onNavigateToLeaderboard) {
      onNavigateToLeaderboard();
    }
  };

  return (
    <div className={`max-w-5xl w-full mx-auto p-3 sm:p-6 space-y-3 sm:space-y-4 animate-fade-in pb-16 ${
      isLightMode ? 'text-slate-900' : 'text-slate-100'
    }`}>
      {/* Top Profile Header Hero */}
      <div className={`border rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden transition-colors ${
        isLightMode
          ? 'bg-white border-slate-200/90 shadow-slate-200/50'
          : 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-800'
      }`}>
        {/* Ambient background glow */}
        <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
          isLightMode ? 'bg-amber-400/10' : 'bg-amber-500/5'
        }`} />

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 relative z-10">
          {/* Avatar & User Details */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 text-center sm:text-left w-full sm:w-auto">
            <div className="relative group shrink-0">
              <img
                src={selectedAvatar || user?.avatar || getRandomAnimeAvatar()}
                alt={user?.username || 'Player'}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 sm:border-3 border-amber-500 shadow-lg ${
                  isLightMode ? 'bg-amber-100' : 'bg-slate-900'
                }`}
                onError={(e) => {
                  e.currentTarget.src = FAMOUS_AVATARS[0].url;
                }}
              />
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  triggerHaptic('move');
                  setIsEditingAvatar(!isEditingAvatar);
                }}
                className={`absolute bottom-0 right-0 p-2 rounded-full bg-amber-500 border-2 font-bold hover:scale-110 active:scale-95 transition-transform shadow-md cursor-pointer ${
                  isLightMode ? 'border-white text-slate-950' : 'border-slate-900 text-slate-950'
                }`}
                title="Change Avatar (32 Anime & Classic GM avatars)"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${
                  isLightMode ? 'text-slate-950' : 'text-white'
                }`}>
                  {user?.username || 'Guest Player'}
                </h1>
                {user?.role === 'admin' && (
                  <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${
                    isLightMode
                      ? 'bg-purple-100 text-purple-900 border-purple-300'
                      : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  }`}>
                    🛡️ Arena Admin
                  </span>
                )}
                {/* Prestige Rank Tier Pill */}
                <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold flex items-center gap-1 shadow-2xs ${rankTier.badgeClass}`}>
                  <span>{rankTier.icon}</span>
                  <span>{rankTier.name}</span>
                </span>
              </div>

              {/* Country & Streak Options Row */}
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                {/* Interactive Country Picker Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    triggerHaptic('move');
                    setIsCountryPickerOpen(true);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 ${
                    isLightMode
                      ? 'bg-amber-50 hover:bg-amber-100/90 border-amber-300 text-slate-900'
                      : 'bg-slate-800 hover:bg-slate-750 border-slate-750 text-slate-100 hover:border-amber-500/50'
                  }`}
                  title="Choose your country & flag from all 195+ world countries"
                >
                  <span className="text-sm leading-none">{currentCountry.flag}</span>
                  <span className="font-extrabold">{user?.countryName || currentCountry.name}</span>
                  <Edit2 className="w-3 h-3 text-amber-500 ml-0.5" />
                </button>

                {/* Genuine Daily Streak Trigger (Starts at 1) */}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    triggerHaptic('move');
                    if (onOpenStreak) onOpenStreak();
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 ${
                    isLightMode
                      ? 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-800'
                      : 'bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/40 text-orange-400'
                  }`}
                  title="View Daily Login Streak Rewards (Starts at Day 1)"
                >
                  <Flame className="w-3.5 h-3.5 fill-orange-500 animate-pulse text-orange-500" />
                  <span>{streakInfo.streak} Day Streak</span>
                </button>
              </div>

              {/* Dynamic Live Elo Rating & Starting Tier Row */}
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-0.5 flex-wrap">
                {hasSelectedInitialElo ? (
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold shadow-2xs ${
                    isLightMode
                      ? 'bg-amber-50 border-amber-300 text-amber-950'
                      : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  }`}>
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-mono font-black text-sm">{userElo}</span>
                    <span>Elo</span>
                    <span className="text-[10px] opacity-75 flex items-center gap-0.5 ml-1 border-l pl-1.5 border-amber-500/30">
                      <Lock className="w-2.5 h-2.5 text-amber-500" />
                      <span>Permanent Rating</span>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        triggerHaptic('move');
                        setIsEloModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer animate-pulse"
                      title="Select your starting Elo rating tier (800, 1200, 1600, 2000, 2500)"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      <span>Choose Elo Level</span>
                    </button>
                    <div className="flex items-center gap-1">
                      {[800, 1200, 1600, 2000, 2500].map(tierElo => (
                        <button
                          key={tierElo}
                          type="button"
                          onClick={() => handleSelectInitialElo(tierElo)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-black border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                            isLightMode
                              ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
                              : 'bg-slate-800 hover:bg-amber-500/20 border-slate-700 hover:border-amber-500/40 text-amber-400'
                          }`}
                          title={`Permanently lock starting Elo at ${tierElo}`}
                        >
                          {tierElo}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  isLightMode
                    ? 'text-emerald-900 bg-emerald-50 border-emerald-300'
                    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                }`}>
                  {totalMatches === 0 ? 'Live Rating Enabled' : `Better than ${percentile}% of players`}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Right Actions (Admin Hub trigger if admin, NO Sign Out button in box!) */}
          <div className="flex items-center gap-2 self-center sm:self-start">
            {(user?.email?.toLowerCase().trim() === 'op21plus@gmail.com' || user?.role === 'admin') && onOpenAdmin && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  triggerHaptic('move');
                  onOpenAdmin();
                }}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                  isLightMode
                    ? 'bg-purple-100 border-purple-300 text-purple-900 hover:bg-purple-200 shadow-xs'
                    : 'bg-purple-500/20 border-purple-500/40 text-purple-300 hover:text-white'
                }`}
                title="Admin Command Center"
              >
                <Shield className="w-3.5 h-3.5 text-purple-500" />
                <span className="hidden sm:inline">Admin Hub</span>
              </button>
            )}
          </div>
        </div>

        {/* Professional Quick Stats Strip (Premium, Compact & Meaningful) */}
        <div className={`mt-4 pt-3 border-t grid grid-cols-3 gap-2 text-center relative z-10 ${
          isLightMode ? 'border-slate-200/80' : 'border-slate-800/80'
        }`}>
          <div className={`p-2 rounded-2xl border transition-colors ${
            isLightMode ? 'bg-slate-50/80 border-slate-200/80' : 'bg-slate-950/60 border-slate-800'
          }`}>
            <div className={`text-[10px] font-bold uppercase tracking-wider ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Matches
            </div>
            <div className={`text-sm sm:text-base font-black ${isLightMode ? 'text-slate-950' : 'text-white'}`}>
              {totalMatches}
            </div>
          </div>

          <div className={`p-2 rounded-2xl border transition-colors ${
            isLightMode ? 'bg-slate-50/80 border-slate-200/80' : 'bg-slate-950/60 border-slate-800'
          }`}>
            <div className={`text-[10px] font-bold uppercase tracking-wider ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Record (W-L-D)
            </div>
            <div className={`text-sm sm:text-base font-black font-mono ${isLightMode ? 'text-slate-950' : 'text-white'}`}>
              <span className="text-emerald-500">{wonMatches}</span>
              <span className="text-slate-400 mx-0.5">-</span>
              <span className="text-rose-500">{lostMatches}</span>
              <span className="text-slate-400 mx-0.5">-</span>
              <span className="text-amber-500">{drawnMatches}</span>
            </div>
          </div>

          <div className={`p-2 rounded-2xl border transition-colors ${
            isLightMode ? 'bg-slate-50/80 border-slate-200/80' : 'bg-slate-950/60 border-slate-800'
          }`}>
            <div className={`text-[10px] font-bold uppercase tracking-wider ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Win Rate
            </div>
            <div className="text-sm sm:text-base font-black text-amber-500">
              {winRate}%
            </div>
          </div>
        </div>

        {/* Famous Avatars Selector Drawer */}
        {isEditingAvatar && (
          <div className={`mt-5 p-4 rounded-2xl space-y-3 animate-fade-in shadow-xl border ${
            isLightMode ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold flex items-center gap-1.5 ${
                isLightMode ? 'text-amber-700' : 'text-amber-400'
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
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
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      triggerHaptic('move');
                      setAvatarCategory(cat.id);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : isLightMode
                        ? 'bg-white border border-slate-300 text-slate-700 hover:text-slate-950 hover:border-slate-400'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive
                        ? 'bg-slate-950/20 text-slate-950'
                        : isLightMode
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Grid of Avatars */}
            <div className={`grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 max-h-60 overflow-y-auto p-2 border rounded-xl custom-scrollbar ${
              isLightMode
                ? 'border-slate-200 bg-white'
                : 'border-slate-800/80 bg-slate-900/60'
            }`}>
              {filteredAvatars.map((av, idx) => {
                const isSelected = selectedAvatar === av.url;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      sound.playClick();
                      triggerHaptic('move');
                      setSelectedAvatar(av.url);
                      const updatedUser = { ...user, avatar: av.url };
                      onUpdateUser(updatedUser);
                      safeStorage.setItem('chess_arena_user', JSON.stringify(updatedUser));
                      fetch('/api/users/profile', {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${safeStorage.getItem('token') || ''}`
                        },
                        body: JSON.stringify({ avatar: av.url })
                      }).catch(() => {});
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 scale-105'
                        : isLightMode
                        ? 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-600 hover:bg-slate-900/80'
                    }`}
                    title={`${av.name} (${av.series})`}
                  >
                    <div className="relative">
                      <img
                        src={av.url}
                        alt={av.name}
                        className={`w-12 h-12 rounded-full object-cover shadow-xs ${
                          isLightMode ? 'bg-slate-200' : 'bg-slate-800'
                        }`}
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 rounded-full p-0.5 shadow">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold truncate w-full text-center ${
                      isLightMode ? 'text-slate-900' : 'text-slate-200'
                    }`}>
                      {av.name}
                    </span>
                    <span className={`text-[8px] truncate w-full text-center -mt-0.5 ${
                      isLightMode ? 'text-slate-600' : 'text-slate-500'
                    }`}>
                      {av.series}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className={`flex justify-end gap-2 pt-2 border-t ${isLightMode ? 'border-slate-200' : 'border-slate-800'}`}>
              <button
                type="button"
                onClick={() => setIsEditingAvatar(false)}
                className={`px-4 py-1.5 text-xs rounded-xl font-semibold cursor-pointer ${
                  isLightMode
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAvatar}
                className="px-5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Apply Avatar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= COMPREHENSIVE COUNTRY PICKER MODAL ================= */}
      {isCountryPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className={`border rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up ${
            isLightMode
              ? 'bg-white border-slate-200 text-slate-900'
              : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            {/* Modal Header */}
            <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
              isLightMode ? 'border-slate-200 bg-slate-50/90' : 'border-slate-800 bg-slate-950/60'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30 text-lg">
                  🌐
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-1.5">
                    <span>Select Your Country</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      isLightMode ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {WORLD_COUNTRIES.length} Countries
                    </span>
                  </h3>
                  <p className={`text-[11px] font-medium ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                    Displays on profile, leaderboards, match cards & national ranks
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  triggerHaptic('move');
                  setIsCountryPickerOpen(false);
                }}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  isLightMode ? 'text-slate-500 hover:text-slate-950 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input Bar */}
            <div className={`p-3 border-b shrink-0 ${isLightMode ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900'}`}>
              <div className="relative">
                <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                  isLightMode ? 'text-slate-500' : 'text-slate-400'
                }`} />
                <input
                  type="text"
                  value={countrySearchQuery}
                  onChange={(e) => setCountrySearchQuery(e.target.value)}
                  placeholder="Search country name or code (e.g. India, USA, ES, NO)..."
                  autoFocus
                  className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm font-semibold border outline-none transition-all ${
                    isLightMode
                      ? 'bg-slate-50 border-slate-300 text-slate-950 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20'
                      : 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus:border-amber-500 focus:bg-slate-950 focus:ring-2 focus:ring-amber-500/20'
                  }`}
                />
                {countrySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setCountrySearchQuery('')}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full cursor-pointer ${
                      isLightMode ? 'text-slate-400 hover:text-slate-700' : 'text-slate-500 hover:text-slate-200'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick popular countries horizontal list */}
              {!countrySearchQuery && (
                <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  <span className={`text-[10px] font-bold uppercase tracking-wider shrink-0 mr-1 ${
                    isLightMode ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    Frequent:
                  </span>
                  {POPULAR_COUNTRIES.map((c) => {
                    const isSelected = (user?.country || 'IN').toUpperCase() === c.code.toUpperCase();
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => handleSelectCountry(c)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer active:scale-95 ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                            : isLightMode
                            ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                            : 'bg-slate-800 hover:bg-slate-750 border-slate-750 text-slate-200'
                        }`}
                      >
                        <span>{c.flag}</span>
                        <span>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Country List Items */}
            <div className={`flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar ${
              isLightMode ? 'bg-slate-50/60' : 'bg-slate-950/40'
            }`}>
              {filteredCountries.length === 0 ? (
                <div className="p-8 text-center space-y-1">
                  <span className="text-2xl">🌍</span>
                  <p className={`text-xs font-bold ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>No countries found</p>
                  <p className={`text-[11px] ${isLightMode ? 'text-slate-600' : 'text-slate-500'}`}>Try searching with another name or code</p>
                </div>
              ) : (
                filteredCountries.map((c) => {
                  const isSelected = (user?.country || 'IN').toUpperCase() === c.code.toUpperCase();
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleSelectCountry(c)}
                      className={`w-full px-3 py-2 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                        isSelected
                          ? isLightMode
                            ? 'bg-amber-100/90 border-amber-400 text-slate-950 font-bold shadow-xs'
                            : 'bg-amber-500/20 border-amber-500/50 text-amber-200 font-bold shadow-xs'
                          : isLightMode
                          ? 'bg-white hover:bg-slate-100/90 border-slate-200 text-slate-900'
                          : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800/90 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl shrink-0 leading-none">{c.flag}</span>
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-semibold truncate block">
                            {c.name}
                          </span>
                          <span className={`text-[10px] uppercase font-mono block ${
                            isLightMode ? 'text-slate-600' : 'text-slate-400'
                          }`}>
                            {c.code}
                          </span>
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 text-xs font-bold shrink-0">
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span className="hidden sm:inline text-[11px]">Selected</span>
                        </div>
                      ) : (
                        <span className={`text-[11px] font-medium shrink-0 ${
                          isLightMode ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          Select
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className={`p-3 border-t flex items-center justify-between shrink-0 ${
              isLightMode ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900'
            }`}>
              <span className={`text-[11px] ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                Active: <strong>{currentCountry.flag} {user?.countryName || currentCountry.name}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  triggerHaptic('move');
                  setIsCountryPickerOpen(false);
                }}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isLightMode
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PERMANENT ELO SELECTION MODAL ================= */}
      <EloSelectionModal
        isOpen={isEloModalOpen}
        onClose={() => setIsEloModalOpen(false)}
        onSelectElo={handleSelectInitialElo}
        isLight={isLightMode}
      />

      {/* ================= ACHIEVEMENT DETAILS MODAL ================= */}
      {selectedAchievement && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className={`border rounded-3xl max-w-sm w-full p-5 shadow-2xl relative animate-scale-up text-center space-y-4 ${
            isLightMode ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="relative inline-block">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto shadow-md border ${
                selectedAchievement.unlocked
                  ? isLightMode
                    ? 'bg-amber-100 border-amber-300 shadow-amber-300/40'
                    : 'bg-amber-500/20 border-amber-500/40 shadow-amber-500/20'
                  : isLightMode
                  ? 'bg-slate-100 border-slate-200'
                  : 'bg-slate-800 border-slate-700'
              }`}>
                {selectedAchievement.icon}
              </div>
              <span className={`absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full text-[10px] font-black border ${
                selectedAchievement.unlocked
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : isLightMode
                  ? 'bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {selectedAchievement.unlocked ? 'Unlocked 🏆' : 'Locked 🔒'}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black tracking-tight">{selectedAchievement.name}</h3>
              <p className={`text-xs ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                {selectedAchievement.desc}
              </p>
            </div>

            <div className={`p-3 rounded-2xl border text-xs text-left ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <span className={`text-[10px] uppercase font-bold block mb-1 ${
                isLightMode ? 'text-slate-600' : 'text-slate-400'
              }`}>
                How to unlock:
              </span>
              <p className={`font-semibold ${
                selectedAchievement.unlocked
                  ? isLightMode ? 'text-emerald-800' : 'text-emerald-400'
                  : isLightMode ? 'text-slate-750' : 'text-slate-300'
              }`}>
                {selectedAchievement.unlocked
                  ? '🎉 Completed! You have earned this achievement in the arena.'
                  : (selectedAchievement.desc || 'Complete competitive arena requirements to unlock.')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                triggerHaptic('move');
                setSelectedAchievement(null);
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* ================= MASTER ADMIN COMMAND CENTER (EXCLUSIVE TO op21plus@gmail.com) ================= */}
      {(user?.email?.toLowerCase().trim() === 'op21plus@gmail.com' || user?.role === 'admin') && onOpenAdmin && (
        <div className={`border rounded-2xl p-4 shadow-xl transition-all relative overflow-hidden ${
          isLightMode
            ? 'bg-gradient-to-r from-amber-50 via-purple-50 to-amber-50 border-amber-300 shadow-amber-200/50 text-slate-900'
            : 'bg-gradient-to-r from-purple-950/80 via-slate-900 to-amber-950/60 border-amber-500/40 shadow-purple-950/50 text-white'
        }`}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/30 shrink-0">
                <Crown className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black tracking-tight flex items-center gap-1.5">
                    <span>Admin Master Control Suite</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500 text-slate-950">
                      op21plus
                    </span>
                  </h3>
                </div>
                <p className={`text-xs mt-0.5 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  Manage global app defaults, player accounts, custom bots, tournaments & announcements
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                triggerHaptic('move');
                onOpenAdmin();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 flex items-center gap-1.5 active:scale-95 transition-transform cursor-pointer shrink-0"
            >
              <span>Open Admin Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ================= DAY & NIGHT THEME SWITCH (SLIDING TOGGLE) ================= */}
      <div className={`border rounded-2xl p-3 shadow-md transition-colors ${
        isLightMode
          ? 'bg-white border-slate-200/90 shadow-slate-200/40 text-slate-900'
          : 'bg-slate-900/90 border-slate-800 text-white'
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              isLightMode
                ? 'bg-amber-100 text-amber-600 border border-amber-300'
                : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
            }`}>
              {isLightMode ? (
                <Sun className="w-4 h-4 text-amber-600" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-300" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-black ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                  {isLightMode
                    ? 'Day Mode (Light)'
                    : (settings?.appTheme || 'system') === 'black'
                    ? 'OLED Black'
                    : (settings?.appTheme || 'system') === 'system'
                    ? 'Auto System'
                    : 'Night Mode (Dark)'}
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold uppercase border ${
                  isLightMode
                    ? 'bg-amber-100 border-amber-300 text-amber-800'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}>
                  {settings?.appTheme || 'system'}
                </span>
              </div>
              <p className={`text-[10px] font-medium truncate ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                Slide switch for Day ☀️ & Night 🌙
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              role="switch"
              aria-checked={!isLightMode}
              onClick={() => {
                const nextTheme = isLightMode ? 'dark' : 'light';
                sound.playClick();
                triggerHaptic('move');
                if (onUpdateSettings) {
                  onUpdateSettings({ ...settings, appTheme: nextTheme });
                }
              }}
              className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-300 ease-in-out focus:outline-none select-none ${
                isLightMode
                  ? 'bg-amber-100 border-amber-400'
                  : 'bg-indigo-600/30 border-indigo-500/60'
              }`}
              title="Slide switch for Day & Night"
            >
              <span className="absolute inset-y-0 left-1.5 flex items-center text-[10px] pointer-events-none select-none">
                ☀️
              </span>
              <span className="absolute inset-y-0 right-1.5 flex items-center text-[10px] pointer-events-none select-none">
                🌙
              </span>

              <span
                className={`pointer-events-none inline-block h-6.5 w-6.5 transform rounded-full shadow-md ring-0 transition duration-300 ease-in-out flex items-center justify-center my-auto ${
                  isLightMode
                    ? 'translate-x-0.5 bg-amber-400 text-slate-950 shadow-amber-400/40'
                    : 'translate-x-8.5 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-indigo-500/40'
                }`}
              >
                {isLightMode ? (
                  <Sun className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <Moon className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Compact Chip Row for OLED Black & Device Auto Sync */}
        <div className={`flex items-center justify-end gap-1.5 mt-2 pt-2 border-t ${
          isLightMode ? 'border-slate-200' : 'border-slate-800/80'
        }`}>
          <span className={`text-[10px] font-semibold mr-auto ${
            isLightMode ? 'text-slate-600' : 'text-slate-400'
          }`}>Presets:</span>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              triggerHaptic('move');
              if (onUpdateSettings) onUpdateSettings({ ...settings, appTheme: 'light' });
            }}
            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              (settings?.appTheme || 'system') === 'light'
                ? isLightMode
                  ? 'bg-amber-100 text-amber-900 border border-amber-400 font-extrabold'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-extrabold'
                : isLightMode
                ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-transparent'
                : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
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
            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              (settings?.appTheme || 'system') === 'dark'
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 font-extrabold'
                : isLightMode
                ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-transparent'
                : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
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
            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              (settings?.appTheme || 'system') === 'black'
                ? 'bg-zinc-700 text-white border border-zinc-500 font-extrabold'
                : isLightMode
                ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-transparent'
                : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
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
            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              (settings?.appTheme || 'system') === 'system'
                ? isLightMode
                  ? 'bg-teal-100 text-teal-900 border border-teal-300 font-extrabold'
                  : 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-extrabold'
                : isLightMode
                ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-transparent'
                : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
            }`}
          >
            ⚙️ Auto
          </button>
        </div>
      </div>

      {/* ================= 3 INLINE ACCORDION OPTIONS ================= */}
      <div className="space-y-3">
        {/* ----------------- 1. STATISTICS & RECORDS ----------------- */}
        <div className={`border rounded-2xl overflow-hidden shadow-md transition-all ${
          isLightMode
            ? 'bg-white border-slate-200/90 shadow-slate-200/40 text-slate-900'
            : 'bg-slate-900/90 border-slate-800 text-white'
        }`}>
          <button
            type="button"
            onClick={() => toggleSection('stats')}
            className={`w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer select-none active:scale-[0.99] ${
              openSections.stats
                ? isLightMode
                  ? 'bg-amber-50/80 border-b border-amber-200'
                  : 'bg-amber-500/10 border-b border-amber-500/25'
                : isLightMode
                ? 'hover:bg-slate-50'
                : 'hover:bg-slate-850'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                openSections.stats
                  ? isLightMode
                    ? 'bg-amber-100 border-amber-300 text-amber-700'
                    : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  : isLightMode
                  ? 'bg-slate-100 border-slate-300 text-slate-600'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}>
                <BarChart3 className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs sm:text-sm font-black tracking-tight truncate ${
                    isLightMode ? 'text-slate-950' : 'text-white'
                  }`}>
                    Statistics & Records
                  </span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold border shrink-0 ${
                    isLightMode
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {userElo} Elo
                  </span>
                </div>
                <p className={`text-[10px] font-medium truncate ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  Win rate {winRate}% • {unlockedSet.size} achievements
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                openSections.stats
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : isLightMode
                  ? 'bg-slate-100 text-slate-700 border border-slate-200'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {openSections.stats ? 'Opened' : 'Closed'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                openSections.stats
                  ? 'text-amber-500 rotate-180'
                  : isLightMode
                  ? 'text-slate-500'
                  : 'text-slate-400'
              }`} />
            </div>
          </button>

          {/* Expanded Content directly under Statistics & Records button */}
          {openSections.stats && (
            <div className={`p-3.5 sm:p-5 space-y-4 animate-fade-in border-t ${
              isLightMode
                ? 'bg-slate-50/80 border-slate-200 text-slate-900'
                : 'bg-slate-950/60 border-slate-800/80 text-slate-100'
            }`}>
              {/* Player Ranking Standing Banner */}
              <div className={`p-4 border rounded-2xl space-y-3 shadow-md ${
                isLightMode
                  ? 'bg-white border-slate-200 text-slate-900'
                  : 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    isLightMode ? 'text-amber-800' : 'text-amber-400'
                  }`}>
                    <Trophy className={`w-4 h-4 ${isLightMode ? 'text-amber-600' : 'text-amber-400'}`} />
                    <span>Player Standing & Global Rank</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleNavigateToLeaderboard}
                    className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all cursor-pointer active:scale-95 ${
                      isLightMode
                        ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900 shadow-xs'
                        : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-300'
                    }`}
                    title="View Full Ranking Leaderboard"
                  >
                    <span>View in Leaderboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className={`p-3 border rounded-xl space-y-0.5 ${
                    isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800/80'
                  }`}>
                    <span className={`text-[10px] uppercase font-bold block ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>World Standing</span>
                    <div className={`text-lg sm:text-xl font-black font-mono ${isLightMode ? 'text-slate-950' : 'text-white'}`}>
                      #{userRank.toLocaleString()}
                    </div>
                    <span className={`text-[10px] font-medium block ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>of {totalPlayers.toLocaleString()} players</span>
                  </div>

                  <div className={`p-3 border rounded-xl space-y-0.5 ${
                    isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800/80'
                  }`}>
                    <span className={`text-[10px] uppercase font-bold block ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>National Rank</span>
                    <div className={`text-lg sm:text-xl font-black font-mono ${isLightMode ? 'text-amber-800' : 'text-amber-300'}`}>
                      #{countryRank.toLocaleString()}
                    </div>
                    <span className={`text-[10px] font-medium block ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                      in {currentCountry.flag} {user?.countryName || currentCountry.name}
                    </span>
                  </div>

                  <div className={`col-span-2 sm:col-span-1 p-3 border rounded-xl space-y-0.5 flex flex-col justify-center ${
                    isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800/80'
                  }`}>
                    <span className={`text-[10px] uppercase font-bold block ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>Competitive Tier</span>
                    <div className={`text-base font-black ${isLightMode ? 'text-emerald-700' : 'text-emerald-400'}`}>
                      Top {((100 - parseFloat(percentile))).toFixed(1)}%
                    </div>
                    <span className={`text-[10px] font-medium block ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>{percentile}% global lead</span>
                  </div>
                </div>
              </div>

              {/* Ratings Breakdown Grid */}
              <div className="space-y-2">
                <h3 className={`text-xs font-bold uppercase tracking-wider px-1 ${
                  isLightMode ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  Elo Ratings by Time Control
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  {[
                    { label: 'Bullet', rating: bulletElo, icon: '⚡' },
                    { label: 'Blitz', rating: blitzElo, icon: '🔥' },
                    { label: 'Rapid', rating: rapidElo, icon: '⏳' },
                    { label: 'Classical', rating: classicalElo, icon: '🏛️' }
                  ].map((item) => (
                    <div key={item.label} className={`p-3 border rounded-xl shadow-xs ${
                      isLightMode ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-white'
                    }`}>
                      <div className={`flex items-center justify-between mb-1 ${
                        isLightMode ? 'text-slate-700 font-bold' : 'text-slate-300'
                      }`}>
                        <span className="text-[10px] uppercase font-bold">{item.label}</span>
                        <span className="text-xs">{item.icon}</span>
                      </div>
                      <div className={`text-xl font-black font-mono ${
                        isLightMode ? 'text-amber-800' : 'text-amber-400'
                      }`}>{item.rating}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Career Stats (100% Genuine Tracking) */}
              <div className="space-y-2">
                <h3 className={`text-xs font-bold uppercase tracking-wider px-1 ${
                  isLightMode ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  Career Performance Record
                </h3>
                <div className={`grid grid-cols-3 gap-2.5 p-3.5 border rounded-2xl text-center shadow-xs ${
                  isLightMode ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-white'
                }`}>
                  <div>
                    <span className={`text-[11px] block font-bold ${isLightMode ? 'text-slate-650' : 'text-slate-300'}`}>Total Matches</span>
                    <span className={`text-lg sm:text-xl font-bold font-mono ${isLightMode ? 'text-slate-950' : 'text-white'}`}>{totalMatches}</span>
                  </div>
                  <div>
                    <span className={`text-[11px] block font-bold ${isLightMode ? 'text-slate-650' : 'text-slate-300'}`}>Win Rate</span>
                    <span className={`text-lg sm:text-xl font-bold font-mono ${isLightMode ? 'text-emerald-700 font-black' : 'text-emerald-400 font-black'}`}>{winRate}%</span>
                  </div>
                  <div>
                    <span className={`text-[11px] block font-bold ${isLightMode ? 'text-slate-650' : 'text-slate-300'}`}>Best Streak</span>
                    <span className={`text-lg sm:text-xl font-bold font-mono ${isLightMode ? 'text-orange-700 font-black' : 'text-orange-400 font-black'}`}>{winStreak} 🔥</span>
                  </div>
                </div>
              </div>

              {/* Collapsible Achievements Section (Closed by default) */}
              <div className={`border rounded-2xl overflow-hidden shadow-xs ${
                isLightMode ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900/90 border-slate-800/80 text-white'
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    triggerHaptic('move');
                    setIsAchievementsOpen(prev => !prev);
                  }}
                  className={`w-full p-3.5 flex items-center justify-between text-left transition-colors cursor-pointer select-none active:scale-[0.99] ${
                    isLightMode ? 'hover:bg-slate-50' : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center text-sm shadow-xs ${
                      isLightMode
                        ? 'bg-amber-100 border-amber-300 text-amber-800'
                        : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    }`}>
                      🏆
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs sm:text-sm font-black block ${
                          isLightMode ? 'text-slate-950' : 'text-white'
                        }`}>
                          Achievements & Badges
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                          isLightMode
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {unlockedSet.size}/{ACHIEVEMENTS_DATA.length}
                        </span>
                      </div>
                      <span className={`text-[10px] font-medium block ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                        Tap to {isAchievementsOpen ? 'collapse' : 'view full achievements shelf'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border transition-colors ${
                      isAchievementsOpen
                        ? isLightMode
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : isLightMode
                        ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {isAchievementsOpen ? 'Hide' : 'Open Achievements'}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                      isAchievementsOpen
                        ? 'text-amber-500 rotate-180'
                        : isLightMode
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }`} />
                  </div>
                </button>

                {isAchievementsOpen && (
                  <div className={`p-3.5 border-t animate-fade-in space-y-2.5 ${
                    isLightMode ? 'border-slate-200 bg-slate-50/70' : 'border-slate-800/80 bg-slate-950/60'
                  }`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {ACHIEVEMENTS_DATA.map((ach) => {
                        const unlocked = unlockedSet.has(ach.id);
                        return (
                          <div
                            key={ach.id}
                            onClick={() => {
                              sound.playClick();
                              triggerHaptic('move');
                              setSelectedAchievement({ ...ach, unlocked });
                            }}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all cursor-pointer active:scale-98 ${
                              unlocked
                                ? isLightMode
                                  ? 'bg-amber-50/90 hover:bg-amber-100/90 border-amber-300 text-amber-950 shadow-xs'
                                  : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-xs'
                                : isLightMode
                                ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                                : 'bg-slate-950/60 hover:bg-slate-900/80 border-slate-800/80 text-slate-300'
                            }`}
                            title="Click to view unlock requirements"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-xl shrink-0">{ach.icon}</span>
                              <div className="min-w-0">
                                <span className="text-xs font-bold block truncate">{ach.name}</span>
                                <span className={`text-[10px] block truncate font-medium ${
                                  unlocked
                                    ? isLightMode ? 'text-amber-800' : 'text-amber-400/80'
                                    : isLightMode ? 'text-slate-600' : 'text-slate-400'
                                }`}>
                                  {ach.desc}
                                </span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                              unlocked
                                ? isLightMode
                                  ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                : isLightMode
                                ? 'bg-slate-100 border-slate-200 text-slate-500'
                                : 'bg-slate-900 border-slate-800 text-slate-500'
                            }`}>
                              {unlocked ? '✓ Unlocked' : 'Locked'}
                            </span>
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
        <div id="profile-rankings-accordion" className={`border rounded-2xl overflow-hidden shadow-md transition-all ${
          isLightMode
            ? 'bg-white border-slate-200/90 shadow-slate-200/40 text-slate-900'
            : 'bg-slate-900/90 border-slate-800 text-white'
        }`}>
          <button
            type="button"
            onClick={() => toggleSection('rankings')}
            className={`w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer select-none active:scale-[0.99] ${
              openSections.rankings
                ? isLightMode
                  ? 'bg-emerald-50/80 border-b border-emerald-200'
                  : 'bg-emerald-500/10 border-b border-emerald-500/25'
                : isLightMode
                ? 'hover:bg-slate-50'
                : 'hover:bg-slate-850'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                openSections.rankings
                  ? isLightMode
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                    : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : isLightMode
                  ? 'bg-slate-100 border-slate-300 text-slate-600'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}>
                <Trophy className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs sm:text-sm font-black tracking-tight truncate ${
                    isLightMode ? 'text-slate-950' : 'text-white'
                  }`}>
                    Rankings & Leaderboard
                  </span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold border shrink-0 ${
                    isLightMode
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    #{userRank.toLocaleString()}
                  </span>
                </div>
                <p className={`text-[10px] font-medium truncate ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  Top {((100 - parseFloat(percentile))).toFixed(1)}% worldwide
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                openSections.rankings
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : isLightMode
                  ? 'bg-slate-100 text-slate-700 border border-slate-200'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {openSections.rankings ? 'Opened' : 'Closed'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                openSections.rankings
                  ? 'text-emerald-500 rotate-180'
                  : isLightMode
                  ? 'text-slate-500'
                  : 'text-slate-400'
              }`} />
            </div>
          </button>

          {/* Expanded Content directly under Rankings & Leaderboard button */}
          {openSections.rankings && (
            <div className={`p-2.5 sm:p-4 animate-fade-in border-t ${
              isLightMode ? 'bg-slate-50/80 border-slate-200 text-slate-900' : 'bg-slate-950/60 border-slate-800/80 text-slate-100'
            }`}>
              <LeaderboardView isLight={isLightMode} currentUser={user} />
            </div>
          )}
        </div>

        {/* ----------------- 3. SETTINGS & PREFERENCES ----------------- */}
        <div className={`border rounded-2xl overflow-hidden shadow-md transition-all ${
          isLightMode
            ? 'bg-white border-slate-200/90 shadow-slate-200/40 text-slate-900'
            : 'bg-slate-900/90 border-slate-800 text-white'
        }`}>
          <button
            type="button"
            onClick={() => toggleSection('settings')}
            className={`w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer select-none active:scale-[0.99] ${
              openSections.settings
                ? isLightMode
                  ? 'bg-sky-50/80 border-b border-sky-200'
                  : 'bg-sky-500/10 border-b border-sky-500/25'
                : isLightMode
                ? 'hover:bg-slate-50'
                : 'hover:bg-slate-850'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                openSections.settings
                  ? isLightMode
                    ? 'bg-sky-100 border-sky-300 text-sky-700'
                    : 'bg-sky-500/20 border-sky-500/50 text-sky-400'
                  : isLightMode
                  ? 'bg-slate-100 border-slate-300 text-slate-600'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}>
                <Settings className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs sm:text-sm font-black tracking-tight truncate ${
                    isLightMode ? 'text-slate-950' : 'text-white'
                  }`}>
                    Settings & Preferences
                  </span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold border capitalize shrink-0 ${
                    isLightMode
                      ? 'bg-sky-100 text-sky-900 border-sky-300'
                      : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                  }`}>
                    {settings?.appTheme || 'system'}
                  </span>
                </div>
                <p className={`text-[10px] font-medium truncate ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  Board styles, pieces, audio & clocks
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                openSections.settings
                  ? 'bg-sky-500 text-slate-950 font-black'
                  : isLightMode
                  ? 'bg-slate-100 text-slate-700 border border-slate-200'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {openSections.settings ? 'Opened' : 'Closed'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                openSections.settings
                  ? 'text-sky-500 rotate-180'
                  : isLightMode
                  ? 'text-slate-500'
                  : 'text-slate-400'
              }`} />
            </div>
          </button>

          {/* Expanded Content directly under Settings & Preferences button */}
          {openSections.settings && (
            <div className={`p-2 sm:p-4 animate-fade-in border-t ${
              isLightMode ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-950/60 border-slate-800/80'
            }`}>
              <SettingsModal
                isOpen={true}
                isEmbedded={true}
                isLight={isLightMode}
                settings={settings}
                onUpdateSettings={onUpdateSettings}
              />
            </div>
          )}
        </div>
      </div>

      {/* ================= DEDICATED ACCOUNT AUTH SECTION ================= */}
      <div className={`border rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden mt-6 transition-colors ${
        isLightMode
          ? 'bg-white border-slate-200 shadow-slate-200/50 text-slate-900'
          : 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border-slate-800 text-white'
      }`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
              user
                ? isLightMode
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : isLightMode
                ? 'bg-amber-50 text-amber-700 border border-amber-300'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}>
              {user ? <Check className="w-6 h-6 text-emerald-500 stroke-[2.5]" /> : <LogIn className="w-6 h-6 text-amber-500" />}
            </div>
            <div>
              <h4 className={`text-sm font-extrabold flex items-center justify-center sm:justify-start gap-2 ${
                isLightMode ? 'text-slate-950' : 'text-white'
              }`}>
                <span>{user ? 'Account Connected' : 'Google & Gmail Authentication'}</span>
                {user && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                    isLightMode ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}>
                    Active
                  </span>
                )}
              </h4>
              <p className={`text-xs mt-0.5 ${isLightMode ? 'text-slate-650' : 'text-slate-400'}`}>
                {user ? (
                  <span>Signed in as <strong className={isLightMode ? 'text-slate-950' : 'text-slate-200'}>{user.username}</strong> ({user.email || 'Gmail Connected'})</span>
                ) : (
                  <span>Sign in with Google / Gmail to save your ratings, climb leaderboards, and sync progress across devices.</span>
                )}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto shrink-0">
            {user ? (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  triggerHaptic('move');
                  if (onSignOut) onSignOut();
                }}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl border font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                  isLightMode
                    ? 'bg-slate-100 hover:bg-rose-50 border-slate-300 hover:border-rose-300 text-slate-800 hover:text-rose-600'
                    : 'bg-slate-800 hover:bg-rose-500/20 border-slate-700 hover:border-rose-500/50 text-slate-200 hover:text-rose-300'
                }`}
                title="Sign Out of Account"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
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
