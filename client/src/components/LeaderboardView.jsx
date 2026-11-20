import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Flame, Globe } from 'lucide-react';
import { DEFAULT_LEADERBOARD } from '../data/puzzleData.js';

const COUNTRY_FLAGS = {
  US: '🇺🇸', NO: '🇳🇴', IN: '🇮🇳', HU: '🇭🇺', CA: '🇨🇦', IS: '🇮🇸',
  GB: '🇬🇧', FR: '🇫🇷', DE: '🇩🇪', BR: '🇧🇷', ES: '🇪🇸', JP: '🇯🇵', UN: '🌐'
};

export function LeaderboardView({ currentUser }) {
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

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Global Arena Leaderboards</h2>
            <p className="text-xs text-slate-400">Top grandmasters, rated players and arena champions</p>
          </div>
        </div>

        {/* Format Selector Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
          {['bullet', 'blitz', 'rapid', 'classical'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormat(fmt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                format === fmt
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="grid grid-cols-12 px-4 py-3 bg-slate-950/60 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span className="col-span-1 text-center">Rank</span>
          <span className="col-span-6 md:col-span-5">Player</span>
          <span className="col-span-3 text-center">Tier</span>
          <span className="col-span-2 md:col-span-3 text-right">Rating</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 italic">
            Updating leaderboard rankings...
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {leaderboard.map((player) => {
              const isCurrentUser = player.id === currentUser?.id;
              const flag = COUNTRY_FLAGS[player.country] || '🌐';

              return (
                <div
                  key={player.id}
                  className={`grid grid-cols-12 items-center px-4 py-3 hover:bg-slate-800/40 transition-colors ${
                    isCurrentUser ? 'bg-amber-500/10 border-l-4 border-amber-500' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-1 text-center font-bold font-mono">
                    {player.rank === 1 ? (
                      <span className="text-amber-400 text-base">🥇</span>
                    ) : player.rank === 2 ? (
                      <span className="text-slate-300 text-base">🥈</span>
                    ) : player.rank === 3 ? (
                      <span className="text-amber-600 text-base">🥉</span>
                    ) : (
                      <span className="text-slate-500 text-xs">{player.rank}</span>
                    )}
                  </div>

                  {/* Player info */}
                  <div className="col-span-6 md:col-span-5 flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <img
                        src={player.avatar}
                        alt={player.username}
                        className="w-9 h-9 rounded-full object-cover border border-slate-700"
                      />
                      {player.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900" />
                      )}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-bold text-white text-xs md:text-sm truncate">
                          {player.username}
                        </span>
                        <span className="text-xs" title={player.countryName}>{flag}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {player.stats?.won || 0}W / {player.stats?.lost || 0}L
                      </span>
                    </div>
                  </div>

                  {/* Progression Badge Tier */}
                  <div className="col-span-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold bg-slate-800 text-amber-400 border border-slate-700">
                      {player.progression?.title || 'Beginner'}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="col-span-2 md:col-span-3 text-right">
                    <span className="text-sm md:text-base font-bold font-mono text-amber-400">
                      {player.rating}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
