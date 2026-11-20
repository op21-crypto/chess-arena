import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Globe, User, Shield, CheckCircle } from 'lucide-react';
import { DEFAULT_LEADERBOARD } from '../data/puzzleData.js';

const COUNTRY_FLAGS = {
  US: '🇺🇸', NO: '🇳🇴', IN: '🇮🇳', HU: '🇭🇺', CA: '🇨🇦', IS: '🇮🇸',
  GB: '🇬🇧', FR: '🇫🇷', DE: '🇩🇪', BR: '🇧🇷', ES: '🇪🇸', JP: '🇯🇵', UN: '🌐'
};

export function LeaderboardView({ currentUser }) {
  const [region, setRegion] = useState('world'); // 'world' | 'india'
  const [viewFilter, setViewFilter] = useState('leaders'); // 'leaders' | 'my_rank'
  const [format, setFormat] = useState('rapid');
  const [leaderboard, setLeaderboard] = useState(DEFAULT_LEADERBOARD);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/leaderboard?format=${format}`)
      .then(res => res.json())
      .then(data => {
        if (data.leaderboard && data.leaderboard.length > 0) {
          setLeaderboard(data.leaderboard);
        }
      })
      .catch(() => {
        setLeaderboard(DEFAULT_LEADERBOARD);
      });
  }, [format]);

  const userElo = currentUser?.ratings?.[format] || currentUser?.elo || 1200;
  const userRank = currentUser?.rank || 284;
  const totalPlayers = 1042040;
  const percentile = ((1 - userRank / 1000) * 100).toFixed(1);

  // Filter leaderboard by region if national selected
  const filteredList = leaderboard.filter(p => {
    if (region === 'india') return p.country === 'IN';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto p-3 md:p-6 space-y-5">
      {/* Top Region Toggle (Matching Screenshot 3) */}
      <div className="grid grid-cols-2 gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => setRegion('india')}
          className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            region === 'india'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="text-base">🇮🇳</span>
          <span>India</span>
        </button>

        <button
          onClick={() => setRegion('world')}
          className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            region === 'world'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="text-base">🌐</span>
          <span>World</span>
        </button>
      </div>

      {/* Secondary Filter: Your Ranking vs Leaders (Screenshot 3) */}
      <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
        <button
          onClick={() => setViewFilter('my_rank')}
          className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            viewFilter === 'my_rank'
              ? 'bg-slate-800 text-amber-400 font-bold border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Your ranking</span>
        </button>

        <button
          onClick={() => setViewFilter('leaders')}
          className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            viewFilter === 'leaders'
              ? 'bg-slate-800 text-amber-400 font-bold border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Leaders</span>
        </button>
      </div>

      {/* Your Ranking Hero Card (Screenshot 3) */}
      <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl shadow-xl text-center space-y-3">
        <div className="space-y-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Elo Level</span>
          <div className="text-4xl md:text-5xl font-extrabold text-white font-mono tracking-tight">
            {userElo}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Your Ranking</span>
          <div className="text-xl md:text-2xl font-extrabold text-slate-200 font-mono">
            {userRank.toLocaleString()} <span className="text-xs text-slate-500 font-normal">of {totalPlayers.toLocaleString()}</span>
          </div>
          <p className="text-xs font-semibold text-emerald-400">
            You are better than {percentile}% of the players
          </p>
        </div>

        {/* Format Selector Pills */}
        <div className="flex items-center justify-center gap-1.5 pt-2 flex-wrap">
          {['bullet', 'blitz', 'rapid', 'classical'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormat(fmt)}
              className={`px-3 py-1 rounded-xl text-xs font-bold uppercase transition-all ${
                format === fmt
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table (Screenshot 3 Columns: Player, ELO, WINS, PUZZ) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="grid grid-cols-12 px-4 py-3 bg-slate-950/70 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <span className="col-span-2 md:col-span-1 text-center">#</span>
          <span className="col-span-5 md:col-span-5">Player</span>
          <span className="col-span-2 text-center font-mono">Elo</span>
          <span className="col-span-1 md:col-span-2 text-center font-mono">Wins</span>
          <span className="col-span-2 text-right font-mono">Puzz</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {filteredList.map((player, idx) => {
            const isCurrentUser = player.id === currentUser?.id;
            const flag = COUNTRY_FLAGS[player.country] || '🌐';
            const rankNum = player.rank || idx + 1;
            const wins = player.wins || Math.floor(rankNum * 3 + 12);
            const puzzles = player.puzzles || Math.floor(rankNum * 15 + 40);

            return (
              <div
                key={player.id}
                className={`grid grid-cols-12 items-center px-4 py-3 hover:bg-slate-800/40 transition-colors ${
                  isCurrentUser ? 'bg-amber-500/15 border-l-4 border-amber-500 font-bold' : ''
                }`}
              >
                {/* Rank number */}
                <div className="col-span-2 md:col-span-1 text-center font-mono text-xs font-bold">
                  {rankNum === 1 ? (
                    <span className="text-amber-400 text-sm">🥇</span>
                  ) : rankNum === 2 ? (
                    <span className="text-slate-300 text-sm">🥈</span>
                  ) : rankNum === 3 ? (
                    <span className="text-amber-600 text-sm">🥉</span>
                  ) : (
                    <span className="text-slate-500">{rankNum}</span>
                  )}
                </div>

                {/* Player info */}
                <div className="col-span-5 md:col-span-5 flex items-center gap-2.5 min-w-0">
                  <span className="text-base shrink-0" title={player.country}>
                    {flag}
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white truncate block">
                      {player.username}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {player.tier || 'Master'}
                    </span>
                  </div>
                </div>

                {/* ELO */}
                <div className="col-span-2 text-center font-mono text-xs font-bold text-amber-400">
                  {player.rating || player.ratings?.[format] || 1200}
                </div>

                {/* WINS */}
                <div className="col-span-1 md:col-span-2 text-center font-mono text-xs text-slate-300">
                  {wins}
                </div>

                {/* PUZZ */}
                <div className="col-span-2 text-right font-mono text-xs text-indigo-300 font-semibold">
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
