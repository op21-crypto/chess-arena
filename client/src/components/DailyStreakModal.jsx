import React, { useState, useEffect, useMemo } from 'react';
import { Flame, Shield, Trophy, Check, Calendar, Sparkles, X, ChevronRight } from 'lucide-react';
import { triggerHaptic } from '../utils/device.js';
import { sound } from '../utils/audio.js';
import { getStreakInfo, claimDailyStreakReward, getWeeklyDaysStatus } from '../utils/streak.js';

export function DailyStreakModal({ isOpen, onClose, isLight = false }) {
  const [streakData, setStreakData] = useState(() => getStreakInfo());
  const [claimedReward, setClaimedReward] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const info = getStreakInfo();
      setStreakData(info);
      setClaimedReward(info.claimedToday);
    }
  }, [isOpen]);

  const weeklyDays = useMemo(() => getWeeklyDaysStatus(), [isOpen, streakData.streak]);

  if (!isOpen) return null;

  const handleClaimReward = () => {
    triggerHaptic('success');
    sound.playGameEnd('win');
    const updated = claimDailyStreakReward();
    setStreakData(updated);
    setClaimedReward(true);
  };

  const streakDays = streakData.streak || 1;

  const MILESTONES = [
    { days: 3, title: 'Bronze Flame', icon: '🥉', unlocked: streakDays >= 3 },
    { days: 7, title: 'Silver Flame', icon: '🥈', unlocked: streakDays >= 7 },
    { days: 14, title: 'Golden Knight', icon: '🥇', unlocked: streakDays >= 14 },
    { days: 30, title: 'Phoenix Champion', icon: '👑', unlocked: streakDays >= 30 }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className={`border rounded-3xl p-5 sm:p-6 max-w-md w-full space-y-5 shadow-2xl relative transition-colors ${
        isLight
          ? 'bg-white border-amber-300 text-slate-900'
          : 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-amber-500/30 text-white'
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            isLight
              ? 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Close Streak"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Flame Header */}
        <div className="text-center space-y-2 pt-1">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 via-orange-500/30 to-amber-500/10 border border-amber-500/40 shadow-xl shadow-orange-500/10 relative">
            <Flame className="w-12 h-12 text-orange-500 fill-orange-500 animate-pulse" />
            <div className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider shadow">
              Active
            </div>
          </div>

          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight flex items-center justify-center gap-2 ${
            isLight ? 'text-slate-950' : 'text-white'
          }`}>
            <span>{streakDays} Day Streak!</span>
            <span className="text-2xl">🔥</span>
          </h2>

          <p className={`text-xs font-semibold max-w-xs mx-auto ${
            isLight ? 'text-amber-800' : 'text-amber-300'
          }`}>
            Play 1 match or solve 1 puzzle every day to keep your genuine daily streak alive!
          </p>
        </div>

        {/* 7-Day Week Calendar Strip */}
        <div className={`border rounded-2xl p-3.5 space-y-2 ${
          isLight ? 'bg-amber-50/50 border-amber-200/80' : 'bg-slate-950/80 border-slate-800/80'
        }`}>
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
            <span className={`flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>Weekly Streak Tracker</span>
            </span>
            <span className="text-emerald-500 font-mono font-bold">
              {weeklyDays.filter(d => d.completed).length}/7 Active
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {weeklyDays.map((item, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-center border transition-all ${
                  item.isToday
                    ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-300 ring-2 ring-amber-500/40'
                    : item.completed
                    ? isLight
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                    : isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-400'
                    : 'bg-slate-950/50 border-slate-900 text-slate-600'
                }`}
              >
                <span className="text-[10px] font-bold">{item.day}</span>
                <div className="my-1">
                  {item.completed ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-mono">
                      •
                    </div>
                  )}
                </div>
                <span className={`text-[9px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {item.isToday ? 'Today' : item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Streak Freeze & Perks */}
        <div className="grid grid-cols-2 gap-2">
          <div className={`p-3 border rounded-2xl flex items-center gap-2.5 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
          }`}>
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-500 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>1 Freeze Active</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Protects 1 missed day</div>
            </div>
          </div>

          <div className={`p-3 border rounded-2xl flex items-center gap-2.5 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
          }`}>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>+50 XP / Match</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Streak XP multiplier</div>
            </div>
          </div>
        </div>

        {/* Milestone Unlocks */}
        <div className={`border rounded-2xl p-3 space-y-2 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800/60'
        }`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider block ${
            isLight ? 'text-slate-600' : 'text-slate-400'
          }`}>
            Milestone Rewards
          </span>

          <div className="grid grid-cols-2 gap-2">
            {MILESTONES.map((m, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-xl border flex items-center gap-2 text-xs transition-all ${
                  m.unlocked
                    ? isLight
                      ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-bold'
                    : isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-70'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-60'
                }`}
              >
                <span className="text-base">{m.icon}</span>
                <div className="min-w-0">
                  <div className="truncate font-bold">{m.title}</div>
                  <div className="text-[10px] opacity-75">{m.days} Days {m.unlocked ? '✓ Unlocked' : 'Locked'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          {claimedReward ? (
            <div className="w-full py-3 bg-emerald-500/20 border border-emerald-500 text-emerald-600 dark:text-emerald-300 font-bold text-xs rounded-2xl text-center flex items-center justify-center gap-2">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Today's Streak Maintained! +25 XP Claimed</span>
            </div>
          ) : (
            <button
              onClick={handleClaimReward}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-orange-500/20 transition-all transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
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
