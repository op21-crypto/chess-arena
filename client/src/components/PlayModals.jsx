import React, { useState, useEffect, useMemo } from 'react';
import {
  Zap, Clock, Shield, Sparkles, Copy, Check, Share2, Bot, Users, X,
  UserPlus, Search, Circle, Swords, Trash2, LogIn, Send, AlertCircle,
  Cpu, Crown, Dices, Flame, Trophy, Sliders
} from 'lucide-react';
import { safeStorage } from '../utils/storage.js';
import { triggerHaptic } from '../utils/device.js';
import { sound } from '../utils/audio.js';

// Disciplined time presets for rated global matchmaking
const TIME_PRESETS = [
  { id: '1m', name: '1 min', format: 'bullet', baseMinutes: 1, incrementSeconds: 0 },
  { id: '2+1', name: '2 | 1', format: 'bullet', baseMinutes: 2, incrementSeconds: 1 },
  { id: '3m', name: '3 min', format: 'blitz', baseMinutes: 3, incrementSeconds: 0 },
  { id: '3+2', name: '3 | 2', format: 'blitz', baseMinutes: 3, incrementSeconds: 2 },
  { id: '5m', name: '5 min', format: 'blitz', baseMinutes: 5, incrementSeconds: 0 },
  { id: '10m', name: '10 min', format: 'rapid', baseMinutes: 10, incrementSeconds: 0 },
  { id: '15+10', name: '15 | 10', format: 'rapid', baseMinutes: 15, incrementSeconds: 10 },
  { id: '30m', name: '30 min', format: 'classical', baseMinutes: 30, incrementSeconds: 0 }
];

const PRESET_CONFIG = {
  bullet: {
    icon: Zap,
    color: 'text-amber-500 dark:text-amber-400',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
  },
  blitz: {
    icon: Flame,
    color: 'text-orange-500 dark:text-orange-400',
    badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
  },
  rapid: {
    icon: Clock,
    color: 'text-emerald-500 dark:text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
  },
  classical: {
    icon: Trophy,
    color: 'text-blue-500 dark:text-blue-400',
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
  }
};

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
      const matched = TIME_PRESETS.find(
        p => p.baseMinutes === initialPreset.baseMinutes && p.incrementSeconds === (initialPreset.incrementSeconds || 0)
      ) || initialPreset;
      setSelectedPreset(matched);
    }
  }, [initialPreset, isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in transition-all ${
      isLight ? 'bg-slate-900/40 backdrop-blur-xs' : 'bg-slate-950/80 backdrop-blur-md'
    }`}>
      <div className={`border rounded-3xl p-4 sm:p-5 max-w-sm sm:max-w-md w-full space-y-3.5 shadow-2xl relative transition-all ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-slate-900/15'
          : 'bg-[#0B0F19] border-slate-800 text-slate-100 shadow-black/80'
      }`}>
        {/* Top Header */}
        <div className={`flex items-center justify-between pb-2.5 border-b ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
              isLight
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
            }`}>
              <Swords className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className={`text-sm sm:text-base font-black tracking-tight leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Play Online
              </h3>
              <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Rated Matchmaking • Worldwide Arena
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className={`p-1.5 rounded-full border transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-200'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSearching ? (
          <div className="py-7 flex flex-col items-center justify-center space-y-3.5">
            <div className="relative w-18 h-18 flex items-center justify-center">
              <span className={`absolute inset-0 rounded-full border-4 animate-ping ${
                isLight ? 'border-amber-500/40' : 'border-amber-500/30'
              }`} />
              <span className={`w-14 h-14 rounded-full border flex items-center justify-center text-2xl shadow-inner ${
                isLight ? 'bg-amber-100/90 border-amber-300' : 'bg-slate-800 border-amber-500/40'
              }`}>
                ♟️
              </span>
            </div>
            <div className="text-center space-y-0.5">
              <span className={`text-base font-black block tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Finding Opponent...
              </span>
              <span className={`text-xs font-mono font-bold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                {selectedPreset.name} • {selectedPreset.format.toUpperCase()}
              </span>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                triggerHaptic('move');
                onCancelMatchmaking();
              }}
              className={`px-5 py-2 font-black text-xs rounded-xl transition-all cursor-pointer border shadow-xs ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 active:scale-95'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 active:scale-95'
              }`}
            >
              Cancel Queue
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Header label */}
            <div className="flex items-center justify-between px-0.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Select Time Control
              </span>
              <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                {selectedPreset.name} ({selectedPreset.format.toUpperCase()})
              </span>
            </div>

            {/* Compact, Sleek 4x2 Time Grid (Tailored & High Contrast) */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {TIME_PRESETS.map((p) => {
                const isSelected = selectedPreset.id === p.id;
                const cfg = PRESET_CONFIG[p.format] || PRESET_CONFIG.blitz;
                const IconComponent = cfg.icon;

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      triggerHaptic('move');
                      setSelectedPreset(p);
                    }}
                    className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer select-none active:scale-95 ${
                      isSelected
                        ? isLight
                          ? 'bg-gradient-to-b from-amber-50 via-amber-100/70 to-amber-50 border-amber-500 text-amber-950 shadow-xs ring-2 ring-amber-400/50'
                          : 'bg-gradient-to-b from-amber-500/20 via-amber-500/10 to-transparent border-amber-400 text-white shadow-md ring-2 ring-amber-400/40'
                        : isLight
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 hover:border-slate-300 shadow-2xs'
                        : 'bg-slate-950/60 hover:bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-0.5">
                      <IconComponent className={`w-3 h-3 shrink-0 ${
                        isSelected
                          ? isLight ? 'text-amber-700' : 'text-amber-400'
                          : cfg.color
                      }`} />
                      <span className={`text-[9px] uppercase tracking-wider font-extrabold ${
                        isSelected
                          ? isLight ? 'text-amber-900' : 'text-amber-300'
                          : isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        {p.format}
                      </span>
                    </div>

                    <span className={`text-xs sm:text-sm font-mono font-black tracking-tight leading-none ${
                      isSelected
                        ? isLight ? 'text-amber-950 font-black' : 'text-white font-black'
                        : isLight ? 'text-slate-900 font-bold' : 'text-slate-200 font-bold'
                    }`}>
                      {p.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Premium Championship CTA Button */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => {
                  sound.playMove();
                  triggerHaptic('impact');
                  onStartMatchmaking(selectedPreset);
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:via-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide rounded-2xl transition-all duration-200 shadow-md shadow-amber-500/25 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <Swords className="w-4 h-4 stroke-[2.5]" />
                <span>Find Opponent ({selectedPreset.name})</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { FriendRoomModal } from "./FriendRoomModal.jsx";

export function PlayAIModal({ isOpen, onClose, onStartAIGame, isLight = false, customBots = null }) {
  const [selectedLevel, setSelectedLevel] = useState(3); // Master level by default
  const [selectedTime, setSelectedTime] = useState(10); // minutes (0 = unlimited)

  // Clean, executive difficulty tiers with distinct vibrant colors & zero bulky text
  const AI_LEVELS = useMemo(() => {
    const palettes = [
      {
        icon: Shield,
        accentBorder: 'border-emerald-500',
        accentRing: 'ring-emerald-400/40',
        activeBgLight: 'bg-emerald-50/90',
        activeBgDark: 'bg-emerald-500/15',
        iconColorLight: 'text-emerald-700',
        iconColorDark: 'text-emerald-400',
        iconBgLight: 'bg-emerald-100 border-emerald-300',
        iconBgDark: 'bg-emerald-500/20 border-emerald-500/40',
        badgeLight: 'bg-emerald-100 text-emerald-950 border-emerald-300',
        badgeDark: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        radioActive: 'bg-emerald-500 text-white',
        accentTextLight: 'text-emerald-700',
        accentTextDark: 'text-emerald-400',
        btnGradient: 'from-emerald-500 via-emerald-600 to-emerald-500 hover:from-emerald-400 hover:to-emerald-400 text-white shadow-emerald-500/25'
      },
      {
        icon: Zap,
        accentBorder: 'border-sky-500',
        accentRing: 'ring-sky-400/40',
        activeBgLight: 'bg-sky-50/90',
        activeBgDark: 'bg-sky-500/15',
        iconColorLight: 'text-sky-700',
        iconColorDark: 'text-sky-400',
        iconBgLight: 'bg-sky-100 border-sky-300',
        iconBgDark: 'bg-sky-500/20 border-sky-500/40',
        badgeLight: 'bg-sky-100 text-sky-950 border-sky-300',
        badgeDark: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        radioActive: 'bg-sky-500 text-white',
        accentTextLight: 'text-sky-700',
        accentTextDark: 'text-sky-400',
        btnGradient: 'from-sky-500 via-sky-600 to-sky-500 hover:from-sky-400 hover:to-sky-400 text-white shadow-sky-500/25'
      },
      {
        icon: Swords,
        accentBorder: 'border-amber-500',
        accentRing: 'ring-amber-400/40',
        activeBgLight: 'bg-amber-50/90',
        activeBgDark: 'bg-amber-500/15',
        iconColorLight: 'text-amber-700',
        iconColorDark: 'text-amber-400',
        iconBgLight: 'bg-amber-100 border-amber-300',
        iconBgDark: 'bg-amber-500/20 border-amber-500/40',
        badgeLight: 'bg-amber-100 text-amber-950 border-amber-300',
        badgeDark: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        radioActive: 'bg-amber-500 text-slate-950',
        accentTextLight: 'text-amber-700',
        accentTextDark: 'text-amber-400',
        btnGradient: 'from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-400 text-slate-950 shadow-amber-500/25'
      },
      {
        icon: Trophy,
        accentBorder: 'border-purple-500',
        accentRing: 'ring-purple-400/40',
        activeBgLight: 'bg-purple-50/90',
        activeBgDark: 'bg-purple-500/15',
        iconColorLight: 'text-purple-700',
        iconColorDark: 'text-purple-400',
        iconBgLight: 'bg-purple-100 border-purple-300',
        iconBgDark: 'bg-purple-500/20 border-purple-500/40',
        badgeLight: 'bg-purple-100 text-purple-950 border-purple-300',
        badgeDark: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        radioActive: 'bg-purple-500 text-white',
        accentTextLight: 'text-purple-700',
        accentTextDark: 'text-purple-400',
        btnGradient: 'from-purple-500 via-purple-600 to-purple-500 hover:from-purple-400 hover:to-purple-400 text-white shadow-purple-500/25'
      },
      {
        icon: Crown,
        accentBorder: 'border-rose-500',
        accentRing: 'ring-rose-400/40',
        activeBgLight: 'bg-rose-50/90',
        activeBgDark: 'bg-rose-500/15',
        iconColorLight: 'text-rose-700',
        iconColorDark: 'text-rose-400',
        iconBgLight: 'bg-rose-100 border-rose-300',
        iconBgDark: 'bg-rose-500/20 border-rose-500/40',
        badgeLight: 'bg-rose-100 text-rose-950 border-rose-300',
        badgeDark: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        radioActive: 'bg-rose-500 text-white',
        accentTextLight: 'text-rose-700',
        accentTextDark: 'text-rose-400',
        btnGradient: 'from-rose-500 via-rose-600 to-rose-500 hover:from-rose-400 hover:to-rose-400 text-white shadow-rose-500/25'
      }
    ];

    const sourceBots = Array.isArray(customBots) && customBots.length > 0 ? customBots : [
      { level: 1, name: 'Beginner', elo: '800 ELO' },
      { level: 2, name: 'Casual', elo: '1200 ELO' },
      { level: 3, name: 'Master', elo: '1600 ELO' },
      { level: 4, name: 'FIDE Master', elo: '2100 ELO' },
      { level: 5, name: 'Grandmaster', elo: '2600+ ELO' }
    ];

    return sourceBots.map((bot, index) => {
      const palette = palettes[index % palettes.length];
      return {
        level: bot.level || index + 1,
        name: bot.name || `Bot Level ${index + 1}`,
        elo: bot.elo || `${800 + index * 400} ELO`,
        iconEmoji: bot.icon || null,
        ...palette
      };
    });
  }, [customBots]);

  const TIME_OPTIONS = [
    { minutes: 10, label: '10 min', sub: 'Rapid', icon: Clock },
    { minutes: 5, label: '5 min', sub: 'Blitz', icon: Flame },
    { minutes: 3, label: '3 min', sub: 'Fast', icon: Zap },
    { minutes: 0, label: 'No Clock', sub: 'Casual', icon: Trophy }
  ];

  if (!isOpen) return null;

  const currentLevelObj = AI_LEVELS.find((l) => l.level === selectedLevel) || AI_LEVELS[2];

  const handlePlay = (lvl = selectedLevel) => {
    sound.playMove();
    triggerHaptic('impact');
    const chosenBot = AI_LEVELS.find(l => l.level === lvl) || currentLevelObj;
    onStartAIGame({
      level: lvl,
      color: 'random',
      timeMinutes: selectedTime,
      customOpponent: {
        username: chosenBot.name,
        elo: parseInt(chosenBot.elo, 10) || (700 + lvl * 200),
        title: chosenBot.name
      }
    });
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in transition-all ${
      isLight ? 'bg-slate-900/40 backdrop-blur-xs' : 'bg-slate-950/80 backdrop-blur-md'
    }`}>
      <div className={`border rounded-3xl p-4 sm:p-5 max-w-sm sm:max-w-md w-full shadow-2xl relative space-y-3.5 transition-all ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-slate-900/15'
          : 'bg-[#0B0F19] border-slate-800 text-slate-100 shadow-black/80'
      }`}>
        {/* Top Header */}
        <div className={`flex items-center justify-between pb-2.5 border-b ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
              isLight
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
            }`}>
              <Bot className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className={`text-sm sm:text-base font-black tracking-tight leading-tight ${
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
            className={`p-1.5 rounded-full border transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-200'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 5 Difficulty Tiers (Clean, Bold Names, Elo Badge & Little Gap) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Select Difficulty
            </span>
            <span className={`text-[10px] font-mono font-black ${
              isLight ? currentLevelObj.accentTextLight : currentLevelObj.accentTextDark
            }`}>
              {currentLevelObj.name} • {currentLevelObj.elo}
            </span>
          </div>

          <div className="space-y-2.5">
            {AI_LEVELS.map((item) => {
              const isSelected = selectedLevel === item.level;
              const IconComponent = item.icon;

              return (
                <div
                  key={item.level}
                  onClick={() => {
                    sound.playClick();
                    triggerHaptic('move');
                    setSelectedLevel(item.level);
                  }}
                  className={`px-3 py-2.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer select-none active:scale-[0.99] ${
                    isSelected
                      ? isLight
                        ? `${item.activeBgLight} ${item.accentBorder} text-slate-900 shadow-sm ring-2 ${item.accentRing}`
                        : `${item.activeBgDark} ${item.accentBorder} text-white shadow-md ring-2 ${item.accentRing}`
                      : isLight
                      ? 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-800'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? (isLight ? item.iconBgLight : item.iconBgDark)
                        : (isLight ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-slate-900 border-slate-800 text-slate-400')
                    }`}>
                      {item.iconEmoji ? (
                        <span className="text-sm select-none">{item.iconEmoji}</span>
                      ) : (
                        <IconComponent className={`w-4 h-4 ${
                          isSelected
                            ? (isLight ? item.iconColorLight : item.iconColorDark)
                            : (isLight ? 'text-slate-600' : 'text-slate-400')
                        }`} />
                      )}
                    </div>
                    <span className={`text-sm sm:text-base tracking-tight leading-none ${
                      isSelected
                        ? isLight ? 'text-slate-950 font-black' : 'text-white font-black'
                        : isLight ? 'text-slate-800 font-bold' : 'text-slate-200 font-bold'
                    }`}>
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className={`text-[11px] font-mono font-black px-2.5 py-1 rounded-lg border tracking-tight ${
                      isSelected
                        ? (isLight ? item.badgeLight : item.badgeDark)
                        : (isLight ? 'bg-white text-slate-700 border-slate-200' : 'bg-slate-900 text-slate-400 border-slate-800')
                    }`}>
                      {item.elo}
                    </span>
                    <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? `${item.radioActive} shadow-xs ring-2 ${item.accentRing}`
                        : isLight
                        ? 'border-2 border-slate-300 bg-white'
                        : 'border-2 border-slate-700 bg-transparent'
                    }`}>
                      {isSelected ? <Check className="w-2.5 h-2.5 stroke-[3.5]" /> : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Control Selection (Compact, Sleek, High Contrast) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-0.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Time Control
            </span>
            <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
              {selectedTime === 0 ? 'No clock' : `${selectedTime} min`}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {TIME_OPTIONS.map((t) => {
              const isSelected = selectedTime === t.minutes;
              const IconComponent = t.icon;

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
                      ? isLight
                        ? 'bg-gradient-to-b from-amber-50 via-amber-100/70 to-amber-50 border-amber-500 text-amber-950 font-black shadow-xs ring-2 ring-amber-400/50'
                        : 'bg-gradient-to-b from-amber-500/20 via-amber-500/10 to-transparent border-amber-400 text-white font-black shadow-sm ring-2 ring-amber-400/40'
                      : isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <IconComponent className={`w-2.5 h-2.5 ${
                      isSelected
                        ? isLight ? 'text-amber-700' : 'text-amber-400'
                        : isLight ? 'text-slate-500' : 'text-slate-400'
                    }`} />
                    <span className="text-[11px] font-bold block truncate leading-tight">
                      {t.label}
                    </span>
                  </div>
                  <span className={`text-[9px] block uppercase font-bold tracking-wider truncate ${
                    isSelected
                      ? isLight ? 'text-amber-900 font-extrabold' : 'text-amber-300 font-extrabold'
                      : isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {t.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Premium Championship CTA Button */}
        <div className="pt-0.5">
          <button
            type="button"
            onClick={() => handlePlay(selectedLevel)}
            className={`w-full py-3 px-4 rounded-2xl bg-gradient-to-r ${currentLevelObj.btnGradient} font-black text-xs sm:text-sm tracking-wide shadow-md transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer`}
          >
            <Swords className="w-4 h-4 stroke-[2.5]" />
            <span>Play vs {currentLevelObj.name} ({currentLevelObj.elo})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
