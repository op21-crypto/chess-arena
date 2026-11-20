import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Globe, User, Shield, Flame, Sparkles } from 'lucide-react';
import {
  COUNTRY_NAMES,
  COUNTRY_FLAGS,
  getLeaderboard,
  calculateUserRanking
} from '../data/leaderboardData.js';

const AVAILABLE_COUNTRIES = [
  { code: 'world', label: 'Worldwide', flag: '🌐' },
  { code: 'IN', label: 'India', flag: '🇮🇳' },
  { code: 'US', label: 'United States', flag: '🇺🇸' },
  { code: 'NO', label: 'Norway', flag: '🇳🇴' },
  { code: 'ES', label: 'Spain', flag: '🇪🇸' },
  { code: 'DE', label: 'Germany', flag: '🇩🇪' },
  { code: 'FR', label: 'France', flag: '🇫🇷' },
  { code: 'GB', label: 'United Kingdom', flag: '🇬🇧' },
  { code: 'JP', label: 'Japan', flag: '🇯🇵' },
  { code: 'BR', label: 'Brazil', flag: '🇧🇷' },
  { code: 'CA', label: 'Canada', flag: '🇨🇦' }
];

export function LeaderboardView({ currentUser }) {
  const [selectedCountry, setSelectedCountry] = useState('world');
  const [viewFilter, setViewFilter] = useState('leaders'); // 'leaders' | 'my_rank'
  const [format, setFormat] = useState('rapid'); // 'bullet' | 'blitz' | 'rapid' | 'classical'
  const [leaderboard, setLeaderboard] = useState(() => getLeaderboard('world', 'rapid'));

  // Sync leaderboard when format or country changes
  useEffect(() => {
    // Immediate synchronous fallback from rich local dataset (76 players)
    const localData = getLeaderboard(selectedCountry, format);
    setLeaderboard(localData);

    // Also fetch from API endpoint if online
    fetch(`/api/leaderboard?format=${format}&country=${selectedCountry}`)
      .then(res => res.json())
      .then(data => {
        if (data.leaderboard && data.leaderboard.length > 0) {
          setLeaderboard(data.leaderboard);
        }
      })
      .catch(() => {
        // Keeps localData
      });
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
    <div className="max-w-4xl mx-auto p-3 md:p-6 space-y-4">
      {/* Country Selection Scroll Bar (Worldwide + 10 Countries with 7+ users each) */}
      <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl shadow-lg">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5">
          {AVAILABLE_COUNTRIES.map((c) => {
            const isSelected = selectedCountry === c.code;
            return (
              <button
                key={c.code}
                onClick={() => setSelectedCountry(c.code)}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
                    : 'bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800/80'
                }`}
              >
                <span className="text-sm">{c.flag}</span>
                <span>{c.label}</span>
                {c.code === 'world' ? (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-amber-400'
                  }`}>50</span>
                ) : (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>7+</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Filter: Your Ranking vs Leaders Toggle */}
      <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
        <button
          onClick={() => setViewFilter('my_rank')}
          className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            viewFilter === 'my_rank'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Your ranking</span>
        </button>

        <button
          onClick={() => setViewFilter('leaders')}
          className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            viewFilter === 'leaders'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Leaders ({isWorld ? 'Top 50' : `${activeCountryName} Top 7`})</span>
        </button>
      </div>

      {/* Your Ranking Hero Card (Accurate Math Matching Screenshot) */}
      <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl shadow-xl text-center space-y-3 relative overflow-hidden">
        <div className="absolute top-3 right-4 flex items-center gap-1 text-[11px] font-bold text-amber-400/90 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
          <Globe className="w-3 h-3" />
          <span>{activeCountryName}</span>
        </div>

        <div className="space-y-0.5 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Elo Level</span>
          <div className="text-4xl md:text-5xl font-extrabold text-white font-mono tracking-tight">
            {userElo}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Your Ranking</span>
          <div className="text-xl md:text-2xl font-extrabold text-slate-200 font-mono">
            {isWorld ? (
              <>
                {userRank.toLocaleString()}{' '}
                <span className="text-xs text-slate-500 font-normal">
                  of {totalPlayers.toLocaleString()}
                </span>
              </>
            ) : (
              <>
                #{countryRank.toLocaleString()}{' '}
                <span className="text-xs text-slate-500 font-normal">
                  in {activeCountryName}
                </span>
              </>
            )}
          </div>
          <p className="text-xs font-semibold text-emerald-400">
            You are better than {percentile}% of the players
          </p>
        </div>

        {/* Format Selector Pills (Bullet, Blitz, Rapid, Classical) */}
        <div className="flex items-center justify-center gap-1.5 pt-2 flex-wrap">
          {['bullet', 'blitz', 'rapid', 'classical'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormat(fmt)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all tracking-wider ${
                format === fmt
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table (Player, ELO, WINS, PUZZ matching screenshot) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="grid grid-cols-12 px-4 py-3 bg-slate-950/70 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <span className="col-span-2 md:col-span-1 text-center">#</span>
          <span className="col-span-5 md:col-span-5">Player</span>
          <span className="col-span-2 text-center font-mono">Elo</span>
          <span className="col-span-2 md:col-span-2 text-center font-mono">Wins</span>
          <span className="col-span-1 md:col-span-2 text-right font-mono">Puzz</span>
        </div>

        <div className="divide-y divide-slate-800/60 max-h-[640px] overflow-y-auto">
          {displayList.map((player, idx) => {
            const isCurrentUser = player.isCurrent || player.id === currentUser?.id;
            const flag = COUNTRY_FLAGS[player.country] || '🌐';
            const rankNum = player.rank || idx + 1;
            const wins = player.wins || Math.floor(rankNum * 3 + 12);
            const puzzles = player.puzzles || Math.floor(rankNum * 15 + 40);

            return (
              <div
                key={player.id || idx}
                className={`grid grid-cols-12 items-center px-4 py-3 hover:bg-slate-800/40 transition-colors ${
                  isCurrentUser
                    ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-l-4 border-amber-500 font-bold shadow-inner'
                    : ''
                }`}
              >
                {/* Rank number or medal */}
                <div className="col-span-2 md:col-span-1 text-center font-mono text-xs font-bold">
                  {rankNum === 1 ? (
                    <span className="text-amber-400 text-base" title="Gold Medal">🥇</span>
                  ) : rankNum === 2 ? (
                    <span className="text-slate-300 text-base" title="Silver Medal">🥈</span>
                  ) : rankNum === 3 ? (
                    <span className="text-amber-600 text-base" title="Bronze Medal">🥉</span>
                  ) : (
                    <span className={isCurrentUser ? 'text-amber-400 font-black' : 'text-slate-500'}>
                      {rankNum.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Player info */}
                <div className="col-span-5 md:col-span-5 flex items-center gap-2.5 min-w-0">
                  <span className="text-base shrink-0" title={player.countryName || player.country}>
                    {flag}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold truncate block ${isCurrentUser ? 'text-amber-300 font-black' : 'text-white'}`}>
                        {player.username}
                      </span>
                      {player.title && (
                        <span className="px-1 py-0.2 text-[9px] font-black rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          {player.title}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {player.tier || 'Master'}
                    </span>
                  </div>
                </div>

                {/* ELO */}
                <div className={`col-span-2 text-center font-mono text-xs font-bold ${
                  isCurrentUser ? 'text-amber-300 font-black text-sm' : 'text-amber-400'
                }`}>
                  {player.rating || player.ratings?.[format] || 1200}
                </div>

                {/* WINS */}
                <div className="col-span-2 md:col-span-2 text-center font-mono text-xs text-slate-300">
                  {wins}
                </div>

                {/* PUZZ */}
                <div className="col-span-1 md:col-span-2 text-right font-mono text-xs text-indigo-300 font-semibold">
                  {puzzles}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
