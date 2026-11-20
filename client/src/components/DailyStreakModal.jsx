import React, { useState, useEffect } from 'react';
import { Flame, Shield, Trophy, Check, Calendar, Sparkles, X, ChevronRight } from 'lucide-react';
import { safeStorage } from '../utils/storage.js';
import { triggerHaptic } from '../utils/device.js';
import { sound } from '../utils/audio.js';

export function DailyStreakModal({ isOpen, onClose }) {
  const [streakDays, setStreakDays] = useState(7);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(true);
  const [claimedStreakReward, setClaimedStreakReward] = useState(false);

  useEffect(() => {
    const saved = safeStorage.getItem('chess_streak_count');
    if (saved) {
      setStreakDays(parseInt(saved, 10) || 7);
    }
  }, []);

  if (!isOpen) return null;

  const handleClaimReward = () => {
    triggerHaptic('success');
    sound.playGameEnd('win');
    setClaimedStreakReward(true);
    const newStreak = streakDays + 1;
    setStreakDays(newStreak);
    safeStorage.setItem('chess_streak_count', String(newStreak));
  };

  const DAYS_OF_WEEK = [
    { day: 'Mon', completed: true, label: 'Day 1' },
    { day: 'Tue', completed: true, label: 'Day 2' },
    { day: 'Wed', completed: true, label: 'Day 3' },
    { day: 'Thu', completed: true, label: 'Day 4' },
    { day: 'Fri', completed: true, label: 'Day 5' },
    { day: 'Sat', completed: true, label: 'Day 6' },
    { day: 'Sun', completed: true, isToday: true, label: 'Today' }
  ];

  const MILESTONES = [
    { days: 3, title: 'Bronze Flame', icon: '🥉', unlocked: true },
    { days: 7, title: 'Silver Flame', icon: '🥈', unlocked: true },
    { days: 14, title: 'Golden Knight', icon: '🥇', unlocked: false },
    { days: 30, title: 'Phoenix Champion', icon: '👑', unlocked: false }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Flame Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 via-orange-500/30 to-amber-500/10 border border-amber-500/40 shadow-xl shadow-orange-500/10 relative">
            <Flame className="w-12 h-12 text-orange-400 fill-orange-500 animate-pulse" />
            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
              Active
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            <span>{streakDays} Day Streak!</span>
            <span className="text-2xl">🔥</span>
          </h2>

          <p className="text-xs text-amber-300 font-medium max-w-xs mx-auto">
            You are on fire! Play 1 match or solve 1 puzzle every day to keep your streak alive.
          </p>
        </div>

        {/* 7-Day Week Calendar Strip */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Weekly Streak Tracker</span>
            </span>
            <span className="text-emerald-400 font-mono">7/7 Days</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {DAYS_OF_WEEK.map((item, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-center border transition-all ${
                  item.isToday
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                    : item.completed
                    ? 'bg-slate-900 border-slate-800 text-slate-300'
                    : 'bg-slate-950/50 border-slate-900 text-slate-600'
                }`}
              >
                <span className="text-[10px] font-bold">{item.day}</span>
                <div className="my-1">
                  {item.completed ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-mono">
                      •
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Streak Freeze & Perks */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">1 Freeze Active</div>
              <div className="text-[10px] text-slate-400">Protects 1 missed day</div>
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">+50 XP / Match</div>
              <div className="text-[10px] text-slate-400">Streak XP multiplier</div>
            </div>
          </div>
        </div>

        {/* Milestone Unlocks */}
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-3 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Milestone Rewards
          </span>

          <div className="grid grid-cols-2 gap-2">
            {MILESTONES.map((m, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-xl border flex items-center gap-2 text-xs ${
                  m.unlocked
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <span className="text-base">{m.icon}</span>
                <div className="min-w-0">
                  <div className="truncate font-bold">{m.title}</div>
                  <div className="text-[10px] opacity-75">{m.days} Days {m.unlocked ? '✓' : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          {claimedStreakReward ? (
            <div className="w-full py-3 bg-emerald-600/30 border border-emerald-500 text-emerald-300 font-bold text-xs rounded-2xl text-center flex items-center justify-center gap-2">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Today's Streak Maintained! +25 XP Claimed</span>
            </div>
          ) : (
            <button
              onClick={handleClaimReward}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-orange-500/20 transition-all transform active:scale-98 flex items-center justify-center gap-2"
            >
              <Flame className="w-4 h-4 fill-slate-950" />
              <span>Claim Today's Streak Bonus (+25 XP)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
