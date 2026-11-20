import React, { useState } from 'react';
import { Award, Trophy, Zap, Shield, Flame, X, Check, Edit2, Crown } from 'lucide-react';
import { safeStorage } from '../utils/storage.js';

const ACHIEVEMENTS_DATA = [
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

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  'https://api.dicebear.com/7.x/bottts/svg?seed=GrandmasterAlpha',
  'https://api.dicebear.com/7.x/bottts/svg?seed=CyberKnight'
];

export function ProfileModal({ user, isOpen, onClose, onUpdateUser }) {
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '');
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen || !user) return null;

  const unlockedSet = new Set(user.achievements || []);
  const winRate = user.stats?.played > 0
    ? Math.round(((user.stats.won || 0) / user.stats.played) * 100)
    : 0;

  const handleSaveAvatar = () => {
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
          setIsEditing(false);
        }
      });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-xl w-full space-y-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Hero Banner */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pb-4 border-b border-slate-800">
          <div className="relative">
            <img
              src={selectedAvatar || user.avatar}
              alt={user.username}
              className="w-20 h-20 rounded-full object-cover border-4 border-amber-500 shadow-xl"
            />
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="absolute bottom-0 right-0 p-1.5 rounded-full bg-slate-800 border border-slate-600 text-slate-200 hover:text-amber-400"
              title="Change avatar"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-white">{user.username}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700 text-xs font-bold">
                {user.role === 'admin' ? 'Arena Admin' : 'Arena Player'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Country: <span className="font-semibold text-slate-200">{user.countryName || user.country}</span>
            </p>
          </div>
        </div>

        {/* Avatar Picker Drawer */}
        {isEditing && (
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2 animate-fade-in">
            <span className="text-xs font-semibold text-slate-400 block">Choose Grandmaster Avatar</span>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {AVATAR_OPTIONS.map((av, idx) => (
                <img
                  key={idx}
                  src={av}
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-12 h-12 rounded-full cursor-pointer object-cover border-2 transition-all ${
                    selectedAvatar === av ? 'border-amber-400 scale-105' : 'border-slate-700 hover:border-slate-500'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAvatar}
                className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg"
              >
                Apply Avatar
              </button>
            </div>
          </div>
        )}

        {/* Ratings Breakdown Grid */}
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: 'Bullet', rating: user.ratings?.bullet || 1200 },
            { label: 'Blitz', rating: user.ratings?.blitz || 1200 },
            { label: 'Rapid', rating: user.ratings?.rapid || 1200 },
            { label: 'Classical', rating: user.ratings?.classical || 1200 }
          ].map((item) => (
            <div key={item.label} className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-500 uppercase font-semibold block">{item.label}</span>
              <span className="text-base font-bold font-mono text-amber-400">{item.rating}</span>
            </div>
          ))}
        </div>

        {/* Career Stats */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950/40 border border-slate-800 rounded-2xl text-center">
          <div>
            <span className="text-xs text-slate-400 block">Played</span>
            <span className="text-lg font-bold font-mono text-white">{user.stats?.played || 0}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Win Rate</span>
            <span className="text-lg font-bold font-mono text-emerald-400">{winRate}%</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Best Streak</span>
            <span className="text-lg font-bold font-mono text-orange-400">{user.stats?.winStreak || 0} 🔥</span>
          </div>
        </div>

        {/* Achievements Shelf */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Unlocked Achievements ({unlockedSet.size} / {ACHIEVEMENTS_DATA.length})
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {ACHIEVEMENTS_DATA.map((ach) => {
              const unlocked = unlockedSet.has(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                    unlocked
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-600 opacity-60'
                  }`}
                >
                  <span className="text-xl">{ach.icon}</span>
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
    </div>
  );
}
