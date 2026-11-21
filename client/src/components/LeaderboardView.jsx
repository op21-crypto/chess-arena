import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Globe, User, Shield, Flame, Sparkles, ChevronRight, Zap, Clock, Rocket, Award, Medal } from 'lucide-react';
import {
  COUNTRY_NAMES,
  COUNTRY_FLAGS,
  getLeaderboard,
  calculateUserRanking
} from '../data/leaderboardData.js';
import { sound } from '../utils/audio.js';
import { triggerHaptic } from '../utils/device.js';

const AVAILABLE_COUNTRIES = [
  { code: 'world', label: 'Global', flag: '🌐' },
  { code: 'IN', label: 'India', flag: '🇮🇳' },
  { code: 'US', label: 'USA', flag: '🇺🇸' },
  { code: 'NO', label: 'Norway', flag: '🇳🇴' },
  { code: 'ES', label: 'Spain', flag: '🇪🇸' },
  { code: 'DE', label: 'Germany', flag: '🇩🇪' },
  { code: 'FR', label: 'France', flag: '🇫🇷' },
  { code: 'GB', label: 'UK', flag: '🇬🇧' },
  { code: 'JP', label: 'Japan', flag: '🇯🇵' },
  { code: 'BR', label: 'Brazil', flag: '🇧🇷' },
  { code: 'CA', label: 'Canada', flag: '🇨🇦' }
];

const FORMAT_CONFIG = [
  { id: 'rapid', label: 'Rapid', icon: Zap },
  { id: 'blitz', label: 'Blitz', icon: Flame },
  { id: 'bullet', label: 'Bullet', icon: Rocket },
  { id: 'classical', label: 'Classic', icon: Clock }
];

export function LeaderboardView({ currentUser, onBack, isLight = false, isOled = false }) {
  const isLightMode = isLight || (!isOled && typeof document !== 'undefined' && !document.documentElement.classList.contains('dark'));
  const [selectedCountry, setSelectedCountry] = useState('world');
  const [viewFilter, setViewFilter] = useState('leaders'); // 'leaders' | 'my_rank'
  const [format, setFormat] = useState('rapid'); // 'bullet' | 'blitz' | 'rapid' | 'classical'
  const [leaderboard, setLeaderboard] = useState(() => getLeaderboard('world', 'rapid'));

  // Sync leaderboard when format or country changes
  useEffect(() => {
    const localData = getLeaderboard(selectedCountry, format);
    setLeaderboard(localData);

    fetch(`/api/leaderboard?format=${format}&country=${selectedCountry}`)
      .then(res => res.json())
      .then(data => {
        if (data.leaderboard && data.leaderboard.length > 0) {
          setLeaderboard(data.leaderboard);
        }
      })
      .catch(() => {});
  }, [format, selectedCountry]);

  // Current user's ELO and accurate rank & percentile calculation
  const userElo = currentUser?.ratings?.[format] || currentUser?.elo || 1078;
  const { rank: userRank, totalPlayers, percentile, countryRank } = useMemo(
    () => calculateUserRanking(userElo),
    [userElo]
  );

  const activeCountryName = COUNTRY_NAMES[selectedCountry] || 'Worldwide';
  const isWorld = selectedCountry === 'world';

  // Neighbor brackets for "Your ranking" view
  const userBrackets = useMemo(() => {
    const baseRank = isWorld ? userRank : countryRank;
    const currentUsername = currentUser?.username || 'You';
    const currentAvatar = currentUser?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=You';
    const currentCountry = currentUser?.country || 'IN';

    return [
      {
        rank: baseRank - 2,
        id: 'bracket_above_2',
        username: 'Challenger_Pro',
        country: 'US',
        rating: userElo + 8,
        wins: 142,
        puzzles: 68,
        tier: 'Skilled'
      },
      {
        rank: baseRank - 1,
        id: 'bracket_above_1',
        username: 'PawnPusher99',
        country: 'DE',
        rating: userElo + 4,
        wins: 139,
        puzzles: 65,
        tier: 'Skilled'
      },
      {
        rank: baseRank,
        id: currentUser?.id || 'current_user_row',
        username: `${currentUsername} (You)`,
        country: currentCountry,
        rating: userElo,
        wins: currentUser?.stats?.won || 14,
        puzzles: 58,
        avatar: currentAvatar,
        tier: 'Intermediate',
        isCurrent: true
      },
      {
        rank: baseRank + 1,
        id: 'bracket_below_1',
        username: 'KnightRider77',
        country: 'FR',
        rating: userElo - 3,
        wins: 128,
        puzzles: 55,
        tier: 'Intermediate'
      },
      {
        rank: baseRank + 2,
        id: 'bracket_below_2',
        username: 'BishopFianchetto',
        country: 'IN',
        rating: userElo - 7,
        wins: 120,
        puzzles: 52,
        tier: 'Intermediate'
      }
    ];
  }, [userRank, countryRank, userElo, currentUser, isWorld]);

  const displayList = viewFilter === 'my_rank' ? userBrackets : leaderboard;

  return (
    <div className="max-w-md mx-auto px-3 py-3 space-y-3 pb-24 text-slate-900 dark:text-slate-100">
      {/* Android Native App Top Bar */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-tight">Rankings</h1>
            <p className="text-[11px] text-slate-400 font-medium">Global & Regional Leaders</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-amber-500">
          <Globe className="w-3 h-3" />
          <span className="truncate max-w-[90px]">{activeCountryName}</span>
        </div>
      </div>

      {/* Time Controls Segmented Control: Bullet, Blitz, Rapid, Classical */}
      <div className={`grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl border transition-all ${
        isLightMode
          ? 'bg-white border-slate-200/90 shadow-sm'
          : 'bg-slate-900/90 border-slate-800 shadow-md'
      }`}>
        {FORMAT_CONFIG.map((fmt) => {
          const Icon = fmt.icon;
          const isActive = format === fmt.id;
          return (
            <button
              key={fmt.id}
              onClick={() => {
                sound.playClick();
                triggerHaptic('move');
                setFormat(fmt.id);
              }}
              className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/30'
                  : isLightMode
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{fmt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Horizontal Scroll Region Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {AVAILABLE_COUNTRIES.map((c) => {
          const isSelected = selectedCountry === c.code;
          return (
            <button
              key={c.code}
              onClick={() => {
                sound.playClick();
                triggerHaptic('move');
                setSelectedCountry(c.code);
              }}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-all cursor-pointer active:scale-95 ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/25 border border-amber-400'
                  : isLightMode
                  ? 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-xs'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span className="text-sm">{c.flag}</span>
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2-Way Tab Switch: Top Leaders vs My Ranking */}
      <div className={`grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl border transition-all ${
        isLightMode
          ? 'bg-white border-slate-200/90 shadow-sm'
          : 'bg-slate-900/90 border-slate-800 shadow-md'
      }`}>
        <button
          onClick={() => {
            sound.playClick();
            triggerHaptic('move');
            setViewFilter('leaders');
          }}
          className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
            viewFilter === 'leaders'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/30'
              : isLightMode
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Top Leaders (50)</span>
        </button>
        <button
          onClick={() => {
            sound.playClick();
            triggerHaptic('move');
            setViewFilter('my_rank');
          }}
          className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
            viewFilter === 'my_rank'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/30'
              : isLightMode
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>My Ranking</span>
        </button>
      </div>

      {/* Android Hero Card: Current User Rank Card */}
      <div className={`p-4 border rounded-3xl shadow-md space-y-3 transition-all ${
        isLightMode
          ? 'bg-white border-amber-300/80 shadow-slate-200/50 text-slate-900'
          : 'bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border-amber-500/25 dark:border-slate-800 text-white'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={currentUser?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=You'}
              alt="You"
              className={`w-10 h-10 rounded-full border object-cover ${
                isLightMode ? 'border-amber-400 bg-amber-50' : 'border-amber-500/40 bg-slate-800'
              }`}
            />
            <div>
              <div className={`text-xs font-black flex items-center gap-1 ${
                isLightMode ? 'text-slate-900' : 'text-white'
              }`}>
                <span>{currentUser?.username || 'You'}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isLightMode ? 'bg-amber-100 text-amber-800 font-bold border border-amber-300' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  YOU
                </span>
              </div>
              <div className={`text-[11px] font-mono mt-0.5 ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {activeCountryName} • {format.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className={`text-[10px] uppercase font-bold block ${isLightMode ? 'text-slate-500' : 'text-slate-500'}`}>Rating</span>
            <span className={`text-xl font-black font-mono ${isLightMode ? 'text-amber-700' : 'text-amber-400'}`}>{userElo}</span>
          </div>
        </div>

        {/* Rank & Percentile row */}
        <div className={`flex items-center justify-between pt-1 border-t text-xs font-semibold ${
          isLightMode ? 'border-slate-200' : 'border-slate-800/80'
        }`}>
          <div className={isLightMode ? 'text-slate-700' : 'text-slate-300'}>
            <span>Rank: </span>
            <span className={`font-black font-mono ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
              #{isWorld ? userRank.toLocaleString() : countryRank.toLocaleString()}
            </span>
            <span className={`text-[10px] font-normal ml-1 ${isLightMode ? 'text-slate-500' : 'text-slate-500'}`}>
              of {totalPlayers.toLocaleString()}
            </span>
          </div>
          <div className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
            isLightMode
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
          }`}>
            Top {100 - percentile}% ({percentile}% beat)
          </div>
        </div>
      </div>

      {/* Android Leaderboard List View (Clean mobile card rows, zero table squish) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md divide-y divide-slate-100 dark:divide-slate-800/70">
        {displayList.map((player, idx) => {
          const isCurrentUser = player.isCurrent || player.id === currentUser?.id;
          const flag = COUNTRY_FLAGS[player.country] || '🌐';
          const rankNum = player.rank || idx + 1;
          const wins = player.wins || Math.floor(rankNum * 3 + 12);

          return (
            <div
              key={player.id || idx}
              className={`flex items-center justify-between p-3 transition-colors ${
                isCurrentUser
                  ? 'bg-amber-500/10 dark:bg-amber-500/15 border-l-4 border-amber-500'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              {/* Left: Rank Badge + Avatar + Name */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Rank Badge */}
                <div className="w-7 text-center font-mono text-xs font-bold shrink-0">
                  {rankNum === 1 ? (
                    <span className="text-lg">🥇</span>
                  ) : rankNum === 2 ? (
                    <span className="text-lg">🥈</span>
                  ) : rankNum === 3 ? (
                    <span className="text-lg">🥉</span>
                  ) : (
                    <span className={`text-xs ${isCurrentUser ? 'text-amber-500 font-black' : 'text-slate-400'}`}>
                      #{rankNum}
                    </span>
                  )}
                </div>

                {/* Avatar with flag overlay */}
                <div className="relative shrink-0">
                  <img
                    src={player.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.username}`}
                    alt={player.username}
                    className="w-9 h-9 rounded-xl bg-slate-800 object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <span className="absolute -bottom-1 -right-1 text-xs">{flag}</span>
                </div>

                {/* Username + Title */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold truncate block ${isCurrentUser ? 'text-amber-500 font-black' : 'text-slate-900 dark:text-white'}`}>
                      {player.username}
                    </span>
                    {player.title && (
                      <span className="px-1 py-0.2 text-[9px] font-black rounded bg-amber-500/20 text-amber-500 border border-amber-500/30">
                        {player.title}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {wins} Wins • {player.tier || 'Master'}
                  </div>
                </div>
              </div>

              {/* Right: ELO Rating */}
              <div className="text-right shrink-0 pl-2">
                <span className={`text-sm font-black font-mono block ${isCurrentUser ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
                  {player.rating || player.ratings?.[format] || 1200}
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                  {format}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
