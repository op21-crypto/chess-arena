import React, { useState, useMemo } from 'react';
import { Award, Trophy, Zap, Shield, Flame, X, Check, Edit2, Crown, Globe, ArrowRight, Sparkles } from 'lucide-react';
import { safeStorage } from '../utils/storage.js';
import { calculateUserRanking } from '../data/leaderboardData.js';
import { FAMOUS_AVATARS, AVATAR_CATEGORIES, ANIME_AVATARS } from '../data/avatarData.js';

export { ANIME_AVATARS, FAMOUS_AVATARS, AVATAR_CATEGORIES };

export const ACHIEVEMENTS_DATA = [
  { id: 'first_win', name: 'First Victory', desc: 'Won your first chess match in the arena', icon: '🏆' },
  { id: 'checkmate_pro', name: 'Master Checkmate', desc: 'Finished an opponent with an official checkmate', icon: '⚔️' },
  { id: 'wins_10', name: 'Decathlete', desc: 'Achieved 10 career victories', icon: '⭐' },
  { id: 'games_100', name: 'Century Club', desc: 'Played 100 competitive games', icon: '🛡️' },
  { id: 'streak_master', name: 'On Fire', desc: 'Maintained a 3+ game win streak', icon: '🔥' },
  { id: 'tactical_genius', name: 'Tactical Genius', desc: 'Solved complex chess puzzles', icon: '💡' },
  { id: 'blitz_master', name: 'Blitz Master', desc: 'Attained 1500+ Blitz rating', icon: '⚡' },
  { id: 'rapid_master', name: 'Rapid Master', desc: 'Attained 1500+ Rapid rating', icon: '⏳' },
  { id: 'chess_champion', name: 'Chess Champion', desc: 'Attained 2000+ Master Elo rating', icon: '👑' },
  { id: 'queen_badge', name: 'Queen Ascension', desc: 'Promoted a pawn to queen in rated play', icon: '👸' },
  { id: 'knight_badge', name: 'Tricky Steed', desc: 'Delivered an en prise knight fork', icon: '🐴' }
];

export function ProfileModal({ user, isOpen, onClose, onUpdateUser, onNavigateToRankings, onOpenStreak, onOpenAdmin }) {
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '');
  const [isEditing, setIsEditing] = useState(false);
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

  if (!isOpen || !user) return null;

  const unlockedSet = new Set(user.achievements || []);
  const winRate = user.stats?.played > 0
    ? Math.round(((user.stats.won || 0) / user.stats.played) * 100)
    : 0;

  const handleSaveAvatar = () => {
    // Immediate local optimistic update
    const updatedUser = { ...user, avatar: selectedAvatar };
    if (onUpdateUser) onUpdateUser(updatedUser);
    setIsEditing(false);

    // Save to server
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
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 max-w-xl w-full space-y-5 shadow-2xl relative my-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Hero Banner */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pb-4 border-b border-slate-800">
          <div className="relative group">
            <img
              src={selectedAvatar || user.avatar}
              alt={user.username}
              className="w-20 h-20 rounded-full object-cover border-4 border-amber-500 shadow-xl bg-slate-950"
            />
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="absolute bottom-0 right-0 p-1.5 rounded-full bg-amber-500 border-2 border-slate-900 text-slate-950 font-bold hover:scale-110 transition-transform shadow-md"
              title="Change avatar"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-white">{user.username}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold">
                {user.role === 'admin' ? 'Arena Admin' : 'Arena Competitor'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Country: <span className="font-semibold text-slate-200">{user.countryName || user.country || 'India 🇮🇳'}</span>
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-0.5">
              <button
                onClick={() => {
                  if (onOpenStreak) onOpenStreak();
                }}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-[11px] font-bold hover:bg-orange-500/30 transition-colors"
              >
                <Flame className="w-3.5 h-3.5 fill-orange-400" />
                <span>7 Day Streak</span>
              </button>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Better than {percentile}%
              </span>
            </div>

            {(user.role === 'admin' || user.email?.toLowerCase() === 'op21plus@gmail.com') && onOpenAdmin && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdmin();
                }}
                className="w-full mt-2 py-2 px-3 bg-gradient-to-r from-amber-500/25 via-purple-500/25 to-indigo-500/25 hover:from-amber-500/35 border border-amber-500/40 text-amber-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Open Administrator Command Center</span>
              </button>
            )}
          </div>
        </div>

        {/* Famous Avatars Selector Drawer (Across Categories) */}
        {isEditing && (
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 animate-fade-in shadow-xl">
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
                    onClick={() => setAvatarCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    <span className={`px-1 py-0.2 rounded-full text-[9px] ${
                      isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Grid of Avatars */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-1.5 border border-slate-800/80 rounded-xl bg-slate-900/60 custom-scrollbar">
              {filteredAvatars.map((av, idx) => {
                const isSelected = selectedAvatar === av.url;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedAvatar(av.url)}
                    className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
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

            <div className="flex justify-end gap-2 pt-1 border-t border-slate-800">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAvatar}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Apply Avatar
              </button>
            </div>
          </div>
        )}

        {/* Dedicated Player Ranking Section (Requested by User) */}
        <div className="p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Player Rankings & Standing</span>
            </span>
            {onNavigateToRankings && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToRankings();
                }}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline"
              >
                <span>View Full Board</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">World Standing</span>
              <div className="text-lg font-black font-mono text-white">
                #{userRank.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500 block">of {totalPlayers.toLocaleString()} players</span>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">National Rank</span>
              <div className="text-lg font-black font-mono text-amber-300">
                #{countryRank.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500 block">in {user.countryName || 'India 🇮🇳'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs">
            <span className="text-slate-400">Competitive Percentile:</span>
            <span className="font-bold text-emerald-400 font-mono">Top {((100 - parseFloat(percentile))).toFixed(1)}% ({percentile}% ahead)</span>
          </div>
        </div>

        {/* Ratings Breakdown Grid */}
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: 'Bullet', rating: user.ratings?.bullet || 1050 },
            { label: 'Blitz', rating: user.ratings?.blitz || 1120 },
            { label: 'Rapid', rating: user.ratings?.rapid || 1078 },
            { label: 'Classical', rating: user.ratings?.classical || 1190 }
          ].map((item) => (
            <div key={item.label} className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-500 uppercase font-semibold block">{item.label}</span>
              <span className="text-base font-bold font-mono text-amber-400">{item.rating}</span>
            </div>
          ))}
        </div>

        {/* Career Stats */}
        <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-950/40 border border-slate-800 rounded-2xl text-center">
          <div>
            <span className="text-xs text-slate-400 block">Matches</span>
            <span className="text-lg font-bold font-mono text-white">{user.stats?.played || 18}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Win Rate</span>
            <span className="text-lg font-bold font-mono text-emerald-400">{winRate || 68}%</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Best Streak</span>
            <span className="text-lg font-bold font-mono text-orange-400">{user.stats?.winStreak || 5} 🔥</span>
          </div>
        </div>

        {/* Achievements Shelf */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Unlocked Achievements ({unlockedSet.size} / {ACHIEVEMENTS_DATA.length})
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
            {ACHIEVEMENTS_DATA.map((ach) => {
              const unlocked = unlockedSet.has(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                    unlocked
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-600 opacity-60'
                  }`}
                >
                  <span className="text-lg">{ach.icon}</span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold block truncate">{ach.name}</span>
                    <span className="text-[9px] text-slate-400 block truncate">{ach.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
