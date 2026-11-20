import React, { useState } from 'react';
import {
  Swords, Zap, Flame, Clock, Shield, Bot, Users, Copy,
  Check, ArrowRight, Play, RefreshCw, Sparkles, ChevronRight
} from 'lucide-react';
import { triggerHaptic } from '../utils/device.js';
import { sound } from '../utils/audio.js';

export const TIME_PRESETS = [
  { id: '1m', name: '1 min', format: 'bullet', baseMinutes: 1, incrementSeconds: 0, icon: '⚡', label: 'Bullet' },
  { id: '2+1', name: '2 | 1', format: 'bullet', baseMinutes: 2, incrementSeconds: 1, icon: '⚡', label: 'Bullet' },
  { id: '3m', name: '3 min', format: 'blitz', baseMinutes: 3, incrementSeconds: 0, icon: '🔥', label: 'Blitz' },
  { id: '3+2', name: '3 | 2', format: 'blitz', baseMinutes: 3, incrementSeconds: 2, icon: '🔥', label: 'Blitz' },
  { id: '5m', name: '5 min', format: 'blitz', baseMinutes: 5, incrementSeconds: 0, icon: '🔥', label: 'Blitz' },
  { id: '10m', name: '10 min', format: 'rapid', baseMinutes: 10, incrementSeconds: 0, icon: '⏳', label: 'Rapid' },
  { id: '15+10', name: '15 | 10', format: 'rapid', baseMinutes: 15, incrementSeconds: 10, icon: '⏳', label: 'Rapid' },
  { id: '30m', name: '30 min', format: 'classical', baseMinutes: 30, incrementSeconds: 0, icon: '🏛️', label: 'Classical' }
];

const BOT_PRESETS = [
  { level: 1, name: 'Friendly Owl', rating: 600, icon: '🦉', desc: 'Patient beginner tutor' },
  { level: 2, name: 'Tactical Cadet', rating: 1100, icon: '⚔️', desc: 'Casual club player' },
  { level: 3, name: 'Arena Master', rating: 1600, icon: '🛡️', desc: 'Aggressive attacking bot' },
  { level: 4, name: 'Cyber Grandmaster', rating: 2100, icon: '🤖', desc: 'Deep tactical calculator' },
  { level: 5, name: 'Magnus Bot', rating: 2500, icon: '👑', desc: 'Peak World Champion AI' }
];

export function PlayView({
  currentUser,
  onStartMatchmaking,
  isSearchingMatch,
  onCancelMatchmaking,
  onOpenFriendRoom,
  onStartAIGame,
  onOpenOfflineBoard,
  activeGameSession,
  onReturnToGame
}) {
  const [selectedPreset, setSelectedPreset] = useState(TIME_PRESETS[5]); // Default 10 min Rapid
  const [selectedBot, setSelectedBot] = useState(BOT_PRESETS[1]);
  const [botColor, setBotColor] = useState('w');

  const handlePresetSelect = (preset) => {
    sound.playSelect();
    triggerHaptic('move');
    setSelectedPreset(preset);
  };

  const handleLaunchMatch = () => {
    sound.playClick();
    triggerHaptic('move');
    if (onStartMatchmaking) {
      onStartMatchmaking(selectedPreset);
    }
  };

  const handleBotSelect = (bot) => {
    sound.playSelect();
    triggerHaptic('move');
    setSelectedBot(bot);
  };

  const handleBotColorSelect = (color) => {
    sound.playClick();
    triggerHaptic('move');
    setBotColor(color);
  };

  const handleLaunchBot = () => {
    sound.playClick();
    triggerHaptic('move');
    if (onStartAIGame) {
      onStartAIGame(selectedBot.level, botColor);
    }
  };

  const handleOpenFriendRoom = () => {
    sound.playClick();
    triggerHaptic('move');
    if (onOpenFriendRoom) {
      onOpenFriendRoom();
    }
  };

  const handleOpenOfflineBoard = () => {
    sound.playClick();
    triggerHaptic('move');
    if (onOpenOfflineBoard) {
      onOpenOfflineBoard();
    }
  };

  const handleCancelMatchmaking = () => {
    sound.playClick();
    triggerHaptic('move');
    if (onCancelMatchmaking) {
      onCancelMatchmaking();
    }
  };

  return (
    <div className="max-w-5xl w-full mx-auto px-3 py-4 sm:p-6 space-y-5 animate-fade-in">
      {/* Banner: Active Live Game in Progress (if any) */}
      {activeGameSession && !activeGameSession.isGameOver && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/10 border-2 border-amber-500/50 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-2xl shadow-lg">
              ♟️
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Live Match In Progress</h3>
              <p className="text-xs text-amber-300">
                Turn: <span className="font-bold">{activeGameSession.turn === 'w' ? 'White' : 'Black'}</span> • Move #{activeGameSession.moveHistory?.length || 0}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              triggerHaptic('move');
              if (onReturnToGame) onReturnToGame();
            }}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span>Return to Board</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Play Arena Header - Clean & Mobile-Optimized */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10 shrink-0">
            <Swords className="w-5 h-5" />
          </div>
          <div className="truncate">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Online Arena
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Matchmaking
              </span>
              <span>•</span>
              <span className="font-medium">Rated</span>
            </div>
          </div>
        </div>

        {currentUser && (
          <div className="px-3 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-2 shadow-xs shrink-0">
            <span className="text-slate-500 text-[11px] hidden sm:inline">Rating:</span>
            <span className="font-mono text-amber-400 font-black text-sm">
              {currentUser.ratings?.[selectedPreset.format] || currentUser.elo || 1200}
            </span>
            <span className="uppercase text-[9px] bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded-md font-black tracking-wider">
              {selectedPreset.format}
            </span>
          </div>
        )}
      </div>

      {/* SECTION 1: RATED MATCHMAKING & TIME CONTROLS */}
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/75 to-slate-950/90 border border-slate-800/80 rounded-3xl p-3.5 sm:p-6 space-y-4 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <h2 className="text-sm sm:text-base font-extrabold text-white">Select Time Control</h2>
          </div>
          <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/25">
            ⚡ Instant Pairing
          </span>
        </div>

        {/* Time Presets Grid (All 8 Presets 100% Selectable with Premium Tactile Sound) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {TIME_PRESETS.map((preset) => {
            const isSelected = selectedPreset.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`relative p-3 sm:p-3.5 rounded-2xl transition-all duration-200 text-left flex flex-col justify-between h-20 sm:h-24 cursor-pointer select-none overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black shadow-xl shadow-amber-500/30 ring-2 ring-amber-300 scale-[1.02] border border-amber-300'
                    : 'bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-800/70 text-slate-200 hover:scale-[1.01] active:scale-95 shadow-md shadow-black/30'
                }`}
              >
                {/* Active Glow Accent for Selected Card */}
                {isSelected && (
                  <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-white/20 blur-md pointer-events-none" />
                )}

                <div className="flex items-center justify-between w-full relative z-10">
                  <span className="text-xl sm:text-2xl filter drop-shadow-xs">{preset.icon}</span>
                  <span
                    className={`text-[9px] sm:text-[10px] uppercase font-black px-2 py-0.5 rounded-full tracking-wider transition-colors ${
                      isSelected
                        ? 'bg-slate-950/25 text-slate-950 border border-slate-950/10'
                        : 'bg-slate-800/80 text-slate-400 border border-slate-700/50'
                    }`}
                  >
                    {preset.label}
                  </span>
                </div>

                <div className="relative z-10">
                  <div
                    className={`text-base sm:text-lg font-black font-mono leading-tight tracking-tight ${
                      isSelected ? 'text-slate-950' : 'text-white'
                    }`}
                  >
                    {preset.name}
                  </div>
                  <div
                    className={`text-[10px] sm:text-[11px] font-medium leading-none mt-0.5 ${
                      isSelected ? 'text-slate-900/90 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {preset.baseMinutes} min {preset.incrementSeconds > 0 ? `+ ${preset.incrementSeconds}s` : ''}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Button / Active Matchmaking Radar */}
        {isSearchingMatch ? (
          <div className="py-6 px-4 bg-slate-950/80 rounded-2xl border border-amber-500/40 flex flex-col items-center justify-center space-y-3">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full border-4 border-amber-500/30 animate-ping" />
              <span className="w-14 h-14 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-2xl">
                ♟️
              </span>
            </div>
            <div className="text-center">
              <span className="text-sm font-bold text-white block">Searching for an opponent...</span>
              <span className="text-xs text-amber-400 font-mono font-bold">
                {selectedPreset.name} • {selectedPreset.format.toUpperCase()}
              </span>
            </div>
            <button
              onClick={handleCancelMatchmaking}
              className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer active:scale-95"
            >
              Cancel Matchmaking
            </button>
          </div>
        ) : (
          <button
            onClick={handleLaunchMatch}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm sm:text-base rounded-2xl transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5 active:scale-[0.98] cursor-pointer"
          >
            <Swords className="w-5 h-5 text-slate-950" />
            <span>Play {selectedPreset.name} ({selectedPreset.label})</span>
          </button>
        )}
      </div>

      {/* SECTION 2: PLAY WITH FRIENDS & PLAY VS BOT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Play with Friends Card */}
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 border border-slate-800/80 rounded-3xl p-4 sm:p-5 space-y-3 shadow-xl flex flex-col justify-between backdrop-blur-xl">
          <div className="space-y-1.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-white">Play with a Friend</h3>
            <p className="text-xs text-slate-400">
              Create a private room, invite via link or code, and enjoy real-time chess with live voice calls.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleOpenFriendRoom}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-slate-800 via-slate-800 to-slate-900 hover:from-amber-500/20 hover:to-amber-500/10 border border-slate-700 hover:border-amber-500/50 text-white font-extrabold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>Create or Join Custom Room</span>
            </button>
          </div>
        </div>

        {/* Play vs AI Bot Card */}
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 border border-slate-800/80 rounded-3xl p-4 sm:p-5 space-y-3 shadow-xl flex flex-col justify-between backdrop-blur-xl">
          <div className="space-y-1.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-white">Play vs Computer AI</h3>
            <p className="text-xs text-slate-400">
              Practice against offline bots ranging from friendly beginner to Magnus Carlsen level.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {/* Bot selector pills */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {BOT_PRESETS.map((bot) => (
                <button
                  key={bot.level}
                  type="button"
                  onClick={() => handleBotSelect(bot)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    selectedBot.level === bot.level
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/50'
                      : 'bg-slate-950/70 text-slate-400 hover:text-white border border-slate-800/80'
                  }`}
                >
                  <span>{bot.icon}</span>
                  <span>{bot.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* Play as White/Black selector and Launch button */}
            <div className="flex gap-2">
              <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800/80">
                <button
                  type="button"
                  onClick={() => handleBotColorSelect('w')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    botColor === 'w' ? 'bg-slate-800 text-amber-400 shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Play as White"
                >
                  White ♔
                </button>
                <button
                  type="button"
                  onClick={() => handleBotColorSelect('b')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    botColor === 'b' ? 'bg-slate-800 text-amber-400 shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Play as Black"
                >
                  Black ♚
                </button>
              </div>

              <button
                type="button"
                onClick={handleLaunchBot}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-extrabold text-xs transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play {selectedBot.name}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Play Offline Board Card (Pass & Play on 1 Device) */}
        {onOpenOfflineBoard && (
          <div className="md:col-span-2 bg-gradient-to-r from-amber-500/15 via-slate-900/90 to-amber-500/10 border border-amber-500/30 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0 shadow-md">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h3 className="text-sm sm:text-base font-extrabold text-white">Play Offline Board</h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-extrabold">
                    Pass & Play 👥
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Two players on 1 device with auto board flipping, legal move dots, and move history.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenOfflineBoard}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all active:scale-95 shadow-lg shadow-amber-500/20 flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>Launch Offline Board</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
