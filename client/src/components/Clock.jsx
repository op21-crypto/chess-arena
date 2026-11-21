import React, { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';
import { sound } from '../utils/audio.js';

export function Clock({ timeMs, isTurn, isActive, isLight = false }) {
  const [displayTime, setDisplayTime] = useState(timeMs);

  useEffect(() => {
    setDisplayTime(timeMs);
  }, [timeMs]);

  // Local tick interpolation
  useEffect(() => {
    if (!isTurn || !isActive || displayTime <= 0) return;

    const interval = setInterval(() => {
      setDisplayTime((prev) => {
        const next = Math.max(0, prev - 100);
        if (next === 10000 || next === 5000) {
          sound.playLowTime();
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isTurn, isActive]);

  const totalSeconds = Math.floor(displayTime / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((displayTime % 1000) / 100);

  const isLowTime = displayTime <= 30000 && displayTime > 0;
  const isCritical = displayTime <= 10000 && displayTime > 0;

  let bgClasses = isLight
    ? 'bg-slate-100 border-slate-300 text-slate-800 shadow-xs'
    : 'bg-slate-900/80 border-slate-700 text-slate-300';

  if (isTurn) {
    if (isCritical) {
      bgClasses = isLight
        ? 'bg-rose-100 border-rose-500 text-rose-800 ring-2 ring-rose-400 animate-pulse shadow-md'
        : 'bg-red-950/90 border-red-500 text-red-200 animate-pulse shadow-lg shadow-red-500/20';
    } else if (isLowTime) {
      bgClasses = isLight
        ? 'bg-amber-100 border-amber-500 text-amber-900 ring-2 ring-amber-400 shadow-md'
        : 'bg-amber-950/90 border-amber-500 text-amber-200 shadow-lg shadow-amber-500/20';
    } else {
      bgClasses = isLight
        ? 'bg-amber-500 border-amber-600 text-slate-950 font-black ring-2 ring-amber-300 shadow-md'
        : 'bg-slate-800 border-amber-400 text-white shadow-md shadow-amber-500/10 ring-1 ring-amber-400/50';
    }
  }

  const timerIconClass = isTurn
    ? (isCritical
        ? (isLight ? 'text-rose-600' : 'text-red-400')
        : (isLight ? 'text-slate-950' : 'text-amber-400'))
    : (isLight ? 'text-slate-500' : 'text-slate-500');

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl border font-mono font-bold transition-all duration-200 ${bgClasses}`}>
      <Timer className={`w-4 h-4 md:w-5 md:h-5 ${timerIconClass}`} />
      <span className="text-base md:text-xl tracking-wider">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        {totalSeconds < 20 && (
          <span className="text-xs md:text-sm opacity-80">.{tenths}</span>
        )}
      </span>
    </div>
  );
}
