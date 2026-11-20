import React, { useState } from 'react';
import {
  Swords, Zap, Flame, Clock, Shield, Bot, Users, Copy,
  Check, ArrowRight, Play, RefreshCw, Sparkles, ChevronRight
} from 'lucide-react';
import { triggerHaptic } from '../utils/device.js';

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
  activeGameSession,
  onReturnToGame
}) {
  const [selectedPreset, setSelectedPreset] = useState(TIME_PRESETS[5]); // Default 10 min Rapid
  const [selectedBot, setSelectedBot] = useState(BOT_PRESETS[1]);
  const [botColor, setBotColor] = useState('w');

  const handlePresetSelect = (preset) => {
    triggerHaptic('move');
    setSelectedPreset(preset);
  };

  const handleLaunchMatch = () => {
    triggerHaptic('move');
    if (onStartMatchmaking) {
      onStartMatchmaking(selectedPreset);
    }
  };

  const handleLaunchBot = () => {
    triggerHaptic('move');
    if (onStartAIGame) {
      onStartAIGame(selectedBot.level, botColor);
    }
  };

  return (
    <div className="max-w-5xl w-full mx-auto p-3 sm:p-6 space-y-6 animate-fade-in">
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
            onClick={onReturnToGame}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
          >
            <span>Return to Board</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Play Arena Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Swords className="w-7 h-7 text-amber-400" />
            <span>Play Online Arena</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time multiplayer matchmaking with Elo rating updates & anti-cheat
          </p>
        </div>

        {currentUser && (
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-2">
            <span className="text-slate-500">Your Rating:</span>
            <span className="font-mono font-bold text-amber-400">
              {currentUser.ratings?.[selectedPreset.format] || currentUser.elo || 1200}
            </span>
            <span className="uppercase text-[10px] text-slate-400 font-bold">
              {selectedPreset.format}
            </span>
          </div>
        )}
      </div>

      {/* SECTION 1: RATED MATCHMAKING */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h2 className="text-base font-extrabold text-white">Select Time Control</h2>
          </div>
          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            ⚡ Rated Matchmaking
          </span>
        </div>

        {/* Time Presets Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {TIME_PRESETS.map((preset) => {
            const isSelected = selectedPreset.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between h-24 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xl shadow-amber-500/20 scale-[1.02] font-bold'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xl">{preset.icon}</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {preset.label}
                  </span>
                </div>
                <div>
                  <div className="text-lg font-black font-mono leading-tight">{preset.name}</div>
                  <div className={`text-[10px] ${isSelected ? 'text-slate-800' : 'text-slate-400'}`}>
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
              <span className="text-xs text-amber-400 font-mono">
                {selectedPreset.name} • {selectedPreset.format.toUpperCase()}
              </span>
            </div>
            <button
              onClick={onCancelMatchmaking}
              className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Cancel Matchmaking
            </button>
          </div>
        ) : (
          <button
            onClick={handleLaunchMatch}
            className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base rounded-2xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transform active:scale-98"
          >
            <Swords className="w-5 h-5" />
            <span>Find Opponent ({selectedPreset.name} {selectedPreset.label})</span>
          </button>
        )}
      </div>

      {/* SECTION 2: PLAY WITH FRIENDS & PLAY VS BOT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Play with Friends Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-extrabold text-white">Play with a Friend</h3>
            <p className="text-xs text-slate-400">
              Create a private room, share your invite link or code, and play casually or rated.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenFriendRoom}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>Create or Join Custom Room</span>
            </button>
          </div>
        </div>

        {/* Play vs AI Bot Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-extrabold text-white">Play vs Computer AI</h3>
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
                  onClick={() => {
                    triggerHaptic('move');
                    setSelectedBot(bot);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    selectedBot.level === bot.level
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-950/70 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{bot.icon}</span>
                  <span>{bot.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* Play as White/Black selector and Launch button */}
            <div className="flex gap-2">
              <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800">
                <button
                  onClick={() => setBotColor('w')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    botColor === 'w' ? 'bg-slate-800 text-white' : 'text-slate-400'
                  }`}
                  title="Play as White"
                >
                  White ♔
                </button>
                <button
                  onClick={() => setBotColor('b')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    botColor === 'b' ? 'bg-slate-800 text-white' : 'text-slate-400'
                  }`}
                  title="Play as Black"
                >
                  Black ♚
                </button>
              </div>

              <button
                onClick={handleLaunchBot}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play {selectedBot.name}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
