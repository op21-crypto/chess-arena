import React, { useState, useEffect } from 'react';
import {
  Zap, Clock, Shield, Sparkles, Copy, Check, Share2, Bot, Users, X,
  UserPlus, Search, Circle, Swords, Trash2, LogIn, Send, AlertCircle,
  Cpu, Crown, Dices, Flame, Trophy
} from 'lucide-react';
import { safeStorage } from '../utils/storage.js';
import { triggerHaptic } from '../utils/device.js';
import { sound } from '../utils/audio.js';

const TIME_PRESETS = [
  { id: '1m', name: '1 min', format: 'bullet', baseMinutes: 1, incrementSeconds: 0, icon: '⚡' },
  { id: '2+1', name: '2 | 1', format: 'bullet', baseMinutes: 2, incrementSeconds: 1, icon: '⚡' },
  { id: '3m', name: '3 min', format: 'blitz', baseMinutes: 3, incrementSeconds: 0, icon: '🔥' },
  { id: '3+2', name: '3 | 2', format: 'blitz', baseMinutes: 3, incrementSeconds: 2, icon: '🔥' },
  { id: '5m', name: '5 min', format: 'blitz', baseMinutes: 5, incrementSeconds: 0, icon: '🔥' },
  { id: '10m', name: '10 min', format: 'rapid', baseMinutes: 10, incrementSeconds: 0, icon: '⏳' },
  { id: '15+10', name: '15 | 10', format: 'rapid', baseMinutes: 15, incrementSeconds: 10, icon: '⏳' },
  { id: '30m', name: '30 min', format: 'classical', baseMinutes: 30, incrementSeconds: 0, icon: '🏛️' }
];

export function MatchmakingModal({
  isOpen,
  onClose,
  onStartMatchmaking,
  isSearching,
  onCancelMatchmaking,
  initialPreset,
  isLight = false
}) {
  const [selectedPreset, setSelectedPreset] = useState(() => initialPreset || TIME_PRESETS[2]); // Default 3 min Blitz

  useEffect(() => {
    if (initialPreset) {
      const matched = TIME_PRESETS.find(p => p.baseMinutes === initialPreset.baseMinutes && p.incrementSeconds === (initialPreset.incrementSeconds || 0)) || initialPreset;
      setSelectedPreset(matched);
    }
  }, [initialPreset, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className={`border rounded-3xl p-5 sm:p-6 max-w-sm sm:max-w-md w-full space-y-4 shadow-2xl relative transition-all ${
        isLight
          ? 'bg-white border-slate-200/90 text-slate-900 shadow-slate-900/10'
          : 'bg-slate-900 border-slate-800 text-slate-100 shadow-black/50'
      }`}>
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className={`absolute top-4 right-4 p-1.5 rounded-xl border transition-colors cursor-pointer ${
            isLight
              ? 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1 pr-6">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
              isLight ? 'bg-amber-500/10 border-amber-500/30 text-amber-600' : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
            }`}>
              <Swords className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className={`text-base font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Play Online
              </h3>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Rated Matchmaking • Worldwide Arena
              </p>
            </div>
          </div>
        </div>

        {isSearching ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full border-4 border-amber-500/30 animate-ping" />
              <span className={`w-16 h-16 rounded-full border flex items-center justify-center text-2xl shadow-inner ${
                isLight ? 'bg-amber-50 border-amber-300' : 'bg-slate-800 border-amber-500/40'
              }`}>
                ♟️
              </span>
            </div>
            <div className="text-center space-y-1">
              <span className={`text-sm font-extrabold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Finding Match...
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-mono font-bold">
                {selectedPreset.name} • {selectedPreset.format.toUpperCase()}
              </span>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                triggerHaptic('move');
                onCancelMatchmaking();
              }}
              className={`px-5 py-2 font-bold text-xs rounded-xl transition-colors cursor-pointer border ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              Cancel Queue
            </button>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-4 gap-2">
              {TIME_PRESETS.map((p) => {
                const isSelected = selectedPreset.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      sound.playClick();
                      triggerHaptic('move');
                      setSelectedPreset(p);
                    }}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md shadow-amber-500/20 ring-2 ring-amber-400/30'
                        : isLight
                        ? 'bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-white text-slate-700 shadow-2xs'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="text-base">{p.icon}</span>
                    <span className="text-xs font-mono font-bold leading-tight">{p.name}</span>
                    <span className={`text-[9px] uppercase font-semibold ${
                      isSelected ? 'text-slate-950/80 font-bold' : isLight ? 'text-slate-500' : 'text-slate-500'
                    }`}>
                      {p.format}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                sound.playMove();
                triggerHaptic('impact');
                onStartMatchmaking(selectedPreset);
              }}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-2xl transition-all shadow-md shadow-amber-500/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <Swords className="w-4.5 h-4.5" />
              <span>Find Opponent ({selectedPreset.name})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export { FriendRoomModal } from "./FriendRoomModal.jsx";

export function PlayAIModal({ isOpen, onClose, onStartAIGame, isLight = false }) {
  const [selectedLevel, setSelectedLevel] = useState(2);
  const [selectedTime, setSelectedTime] = useState(10); // minutes (0 = unlimited)

  if (!isOpen) return null;

  // Clean, professional AI difficulty tiers without cluttered anime subtitle noise
  const AI_LEVELS = [
    { level: 1, name: 'Beginner Sensei', elo: '800 ELO', icon: '🐣', desc: 'Learning & fundamental tactics' },
    { level: 2, name: 'Casual Tactician', elo: '1200 ELO', icon: '🛡️', desc: 'Solid play with occasional errors' },
    { level: 3, name: 'Master Strategist', elo: '1600 ELO', icon: '⚔️', desc: 'Strong tactical calculation & defense' },
    { level: 4, name: 'FIDE Mastermind', elo: '2000 ELO', icon: '💎', desc: 'Expert positioning & endgame depth' },
    { level: 5, name: 'Grandmaster Deity', elo: '2500+ ELO', icon: '👑', desc: 'Ultra-fast Stockfish 19 engine speed' }
  ];

  const TIME_OPTIONS = [
    { minutes: 10, label: '10 min', sub: 'Rapid' },
    { minutes: 5, label: '5 min', sub: 'Blitz' },
    { minutes: 3, label: '3 min', sub: 'Fast' },
    { minutes: 0, label: 'No Clock', sub: 'Casual' }
  ];

  const currentLevelObj = AI_LEVELS.find((l) => l.level === selectedLevel) || AI_LEVELS[1];

  const handlePlay = (lvl = selectedLevel) => {
    sound.playMove();
    triggerHaptic('impact');
    onStartAIGame({
      level: lvl,
      color: 'random',
      timeMinutes: selectedTime
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className={`border rounded-3xl p-4 sm:p-5 max-w-sm sm:max-w-md w-full shadow-2xl relative space-y-3.5 transition-all ${
        isLight
          ? 'bg-white border-slate-200/90 text-slate-900 shadow-slate-900/10'
          : 'bg-slate-900 border-slate-800 text-slate-100 shadow-black/50'
      }`}>
        {/* Top Header */}
        <div className={`flex items-center justify-between pb-2.5 border-b ${isLight ? 'border-slate-150' : 'border-slate-800'}`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
              isLight ? 'bg-amber-500/10 border-amber-500/30 text-amber-600' : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
            }`}>
              <Bot className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className={`text-sm sm:text-base font-extrabold tracking-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                Play Stockfish AI
              </h3>
              <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Choose difficulty & start playing instantly
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 5 Difficulty Tiers (Clean, Elegant, Executive) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Select Difficulty
            </span>
            <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
              {currentLevelObj.name} • {currentLevelObj.elo}
            </span>
          </div>

          <div className="space-y-1.5">
            {AI_LEVELS.map((item) => {
              const isSelected = selectedLevel === item.level;
              return (
                <div
                  key={item.level}
                  onClick={() => {
                    sound.playClick();
                    triggerHaptic('move');
                    setSelectedLevel(item.level);
                  }}
                  className={`px-3 py-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer select-none active:scale-[0.99] ${
                    isSelected
                      ? isLight
                        ? 'bg-amber-500/10 border-amber-500 text-slate-950 font-bold shadow-xs ring-1 ring-amber-400/40'
                        : 'bg-amber-500/15 border-amber-500/60 text-white font-bold shadow-sm ring-1 ring-amber-400/30'
                      : isLight
                      ? 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300 hover:bg-slate-100/70 text-slate-800'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base">{item.icon}</span>
                    <div className="min-w-0">
                      <span className={`text-xs sm:text-sm block truncate ${
                        isSelected
                          ? isLight ? 'text-slate-950 font-black' : 'text-white font-black'
                          : isLight ? 'text-slate-800 font-bold' : 'text-slate-200 font-bold'
                      }`}>
                        {item.name}
                      </span>
                      <span className={`text-[10px] block truncate ${
                        isSelected
                          ? isLight ? 'text-amber-800 font-medium' : 'text-amber-300 font-medium'
                          : isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        {item.desc}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                      isSelected
                        ? isLight
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : isLight
                        ? 'bg-white text-slate-600 border-slate-200'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}>
                      {item.elo}
                    </span>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : isLight
                        ? 'border border-slate-300 bg-white'
                        : 'border border-slate-700 bg-slate-950'
                    }`}>
                      {isSelected ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Control Selection (Cohesive Styling) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Time Control
            </span>
            <span className={`text-[10px] font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {selectedTime === 0 ? 'No clock' : `${selectedTime} min`}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {TIME_OPTIONS.map((t) => {
              const isSelected = selectedTime === t.minutes;
              return (
                <button
                  key={t.minutes}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    triggerHaptic('move');
                    setSelectedTime(t.minutes);
                  }}
                  className={`py-1.5 px-1 rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-xs ring-1 ring-amber-400/30'
                      : isLight
                      ? 'bg-slate-50/80 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className="text-[11px] font-bold block truncate leading-tight">
                    {t.label}
                  </span>
                  <span className={`text-[9px] block truncate ${isSelected ? 'text-slate-950/80 font-bold' : (isLight ? 'text-slate-500' : 'text-slate-500')}`}>
                    {t.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Click & Play Premium Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => handlePlay(selectedLevel)}
            className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-md shadow-amber-500/20 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Swords className="w-4 h-4 stroke-[2.5]" />
            <span>Play vs {currentLevelObj.name} ({currentLevelObj.elo})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
