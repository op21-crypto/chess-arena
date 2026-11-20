import React, { useState } from 'react';
import {
  Swords, Zap, Flame, Clock, Shield, Bot, Users, Check,
  ArrowRight, Play, Sparkles, ChevronRight, ChevronDown,
  X, Smartphone, Mic
} from 'lucide-react';
import { triggerHaptic } from '../utils/device.js';
import { sound } from '../utils/audio.js';

export const TIME_PRESETS = [
  { id: '1m', name: '1 min', format: 'bullet', baseMinutes: 1, incrementSeconds: 0, icon: '⚡', label: 'Bullet', desc: '1 min per player' },
  { id: '2+1', name: '2 | 1', format: 'bullet', baseMinutes: 2, incrementSeconds: 1, icon: '⚡', label: 'Bullet', desc: '2 min + 1s per move' },
  { id: '3m', name: '3 min', format: 'blitz', baseMinutes: 3, incrementSeconds: 0, icon: '🔥', label: 'Blitz', popular: true, desc: '3 min per player' },
  { id: '3+2', name: '3 | 2', format: 'blitz', baseMinutes: 3, incrementSeconds: 2, icon: '🔥', label: 'Blitz', desc: '3 min + 2s per move' },
  { id: '5m', name: '5 min', format: 'blitz', baseMinutes: 5, incrementSeconds: 0, icon: '🔥', label: 'Blitz', desc: '5 min per player' },
  { id: '10m', name: '10 min', format: 'rapid', baseMinutes: 10, incrementSeconds: 0, icon: '⏳', label: 'Rapid', popular: true, desc: '10 min per player' },
  { id: '15+10', name: '15 | 10', format: 'rapid', baseMinutes: 15, incrementSeconds: 10, icon: '⏳', label: 'Rapid', desc: '15 min + 10s per move' },
  { id: '30m', name: '30 min', format: 'classical', baseMinutes: 30, incrementSeconds: 0, icon: '🏛️', label: 'Classical', desc: '30 min per player' }
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
  onOpenAIModal,
  onOpenOfflineBoard,
  activeGameSession,
  onReturnToGame
}) {
  const [selectedPreset, setSelectedPreset] = useState(TIME_PRESETS[5]); // Default 10 min Rapid
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedBot, setSelectedBot] = useState(BOT_PRESETS[1]);
  const [botColor, setBotColor] = useState('w'); // 'w' | 'b' | 'random'

  const handlePresetSelect = (preset) => {
    sound.playSelect();
    triggerHaptic('move');
    setSelectedPreset(preset);
    setShowTimeModal(false);
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
      const finalColor = botColor === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : botColor;
      onStartAIGame({ level: selectedBot.level, color: finalColor });
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
    <div className="max-w-3xl w-full mx-auto px-3.5 py-4 sm:p-6 space-y-4 sm:space-y-5 animate-fade-in">
      {/* Banner: Active Live Game in Progress (if any) */}
      {activeGameSession && !activeGameSession.isGameOver && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/10 border-2 border-amber-500/50 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-2xl shadow-lg">
              ♟️
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">Live Match In Progress</h3>
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
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span>Return to Board</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Play View Header */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Play Arena</span>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400">
              Season 2026
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Choose your game mode to begin
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 text-[11px] hidden sm:inline">Matchmaking:</span>
            <span className="font-bold text-emerald-400 text-[11px]">Online</span>
          </div>

          {currentUser && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-1.5 shadow-sm">
              <span className="text-slate-400 text-[11px] hidden sm:inline">Rating:</span>
              <span className="font-mono text-amber-400 font-black text-xs">
                {currentUser.ratings?.[selectedPreset.format] || currentUser.elo || 1200}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 1. ONLINE ARENA (Rated Matchmaking with Clean Consolidated Time Slot Button) */}
      <div className="bg-gradient-to-br from-amber-950/35 via-slate-900/95 to-orange-950/35 border border-amber-500/30 rounded-3xl p-4 sm:p-6 space-y-3.5 shadow-xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md shrink-0">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">Online Arena</h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                  Rated FIDE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Instant rated matchmaking with players worldwide
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/25 shrink-0 hidden xs:inline">
            ⚡ Live
          </span>
        </div>

        {/* The Single Consolidated Time Slot Button */}
        <div className="space-y-1 relative z-10 pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
            Time Control Slot
          </span>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              triggerHaptic('move');
              setShowTimeModal(true);
            }}
            className="w-full p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-950 border border-slate-750 hover:border-amber-400 text-left flex items-center justify-between group transition-all duration-200 cursor-pointer shadow-md active:scale-99"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl shrink-0 border border-amber-500/35 group-hover:scale-105 transition-transform">
                {selectedPreset.icon}
              </div>
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                    {selectedPreset.name} • {selectedPreset.label}
                  </span>
                  {selectedPreset.popular && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-medium truncate">
                  {selectedPreset.desc} • {selectedPreset.format.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 group-hover:bg-amber-500 group-hover:text-slate-950 font-black text-xs transition-colors shrink-0 ml-2">
              <span>Change Slot</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>

        {/* Action Button: Matchmaking or Active Radar */}
        <div className="relative z-10 pt-1">
          {isSearchingMatch ? (
            <div className="py-5 px-4 bg-slate-950/90 rounded-2xl border border-amber-500/40 flex flex-col items-center justify-center space-y-3">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <span className="absolute inset-0 rounded-full border-4 border-amber-500/30 animate-ping" />
                <span className="w-12 h-12 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-2xl">
                  ⚔️
                </span>
              </div>
              <div className="text-center">
                <span className="text-sm font-bold text-white block">Searching for an opponent...</span>
                <span className="text-xs text-amber-400 font-mono font-bold">
                  {selectedPreset.name} ({selectedPreset.label})
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
              className="w-full py-4 px-4 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm sm:text-base rounded-2xl transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5 active:scale-[0.98] cursor-pointer"
            >
              <Swords className="w-5 h-5 fill-slate-950" />
              <span>Play Online ({selectedPreset.name} {selectedPreset.label})</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. PLAY VS COMPUTER AI (Stockfish Engine) */}
      <div className="bg-gradient-to-br from-indigo-950/35 via-slate-900/95 to-purple-950/35 border border-indigo-500/30 rounded-3xl p-4 sm:p-6 space-y-3.5 shadow-xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-md shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">Play vs Computer AI</h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider">
                  Stockfish 16
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Practice against engine bots from beginner to grandmaster
              </p>
            </div>
          </div>
        </div>

        {/* Bot Level Selector Chips */}
        <div className="space-y-2 relative z-10 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Difficulty Bot
            </span>
            <span className="text-xs text-indigo-300 font-mono font-bold">
              {selectedBot.name} (~{selectedBot.rating} Elo)
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {BOT_PRESETS.map((bot) => {
              const isSelected = selectedBot.level === bot.level;
              return (
                <button
                  key={bot.level}
                  type="button"
                  onClick={() => handleBotSelect(bot)}
                  className={`p-2 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 text-white font-black border border-indigo-300 shadow-md shadow-indigo-500/30'
                      : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                  title={`${bot.name} (${bot.rating} Elo)`}
                >
                  <span className="text-base sm:text-lg">{bot.icon}</span>
                  <span className="text-[10px] font-bold truncate mt-0.5 max-w-full">
                    {bot.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Picker + Play Action */}
        <div className="flex flex-col sm:flex-row gap-2 relative z-10 pt-1">
          {/* Color Selector */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            {[
              { id: 'w', label: 'White ♔' },
              { id: 'random', label: 'Random 🎲' },
              { id: 'b', label: 'Black ♚' }
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleBotColorSelect(c.id)}
                className={`flex-1 sm:flex-initial px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  botColor === c.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Primary Play Bot CTA */}
          <button
            type="button"
            onClick={handleLaunchBot}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black text-xs sm:text-sm transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Play vs {selectedBot.name}</span>
          </button>
        </div>

        {/* Custom Stockfish Modal Link */}
        {onOpenAIModal && (
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              triggerHaptic('move');
              onOpenAIModal();
            }}
            className="w-full py-2 px-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer relative z-10"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Custom Stockfish Difficulty & Deep Engine Hub (Levels 1–8)</span>
          </button>
        )}
      </div>

      {/* 3. PLAY WITH FRIENDS (Voice Room) */}
      <div className="bg-gradient-to-br from-emerald-950/35 via-slate-900/95 to-teal-950/35 border border-emerald-500/30 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md shrink-0">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">Play Friends (Voice 🎙️)</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                  Live Audio
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Create a private room, share your invite link, and talk in real-time
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenFriendRoom}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/25 active:scale-98 cursor-pointer relative z-10"
        >
          <Users className="w-4 h-4" />
          <span>Create or Join Custom Room</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4. OFFLINE CHESS BOARD (Pass & Play on 1 Device) */}
      {onOpenOfflineBoard && (
        <div className="bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-amber-400 shadow-md shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white">Offline Chess Board</h2>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold uppercase tracking-wider">
                    Pass & Play 👥
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Two players face-to-face on 1 phone • Vertical full screen board
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenOfflineBoard}
            className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white hover:text-amber-300 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer relative z-10"
          >
            <span>Launch Offline Board</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      )}

      {/* TIME CONTROL SELECTION MODAL */}
      {showTimeModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>Choose Time Control</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select your preferred time slot for online matchmaking
                </p>
              </div>
              <button
                onClick={() => setShowTimeModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets Grid Grouped by Speed */}
            <div className="space-y-3">
              {[
                { category: 'Bullet (Fast & Sharp)', icon: '⚡', formats: ['bullet'] },
                { category: 'Blitz (Most Popular)', icon: '🔥', formats: ['blitz'] },
                { category: 'Rapid (Standard)', icon: '⏳', formats: ['rapid'] },
                { category: 'Classical (Deep)', icon: '🏛️', formats: ['classical'] }
              ].map((cat) => {
                const presetsInCat = TIME_PRESETS.filter(p => cat.formats.includes(p.format));
                if (presetsInCat.length === 0) return null;

                return (
                  <div key={cat.category} className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                      {cat.icon} {cat.category}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {presetsInCat.map((preset) => {
                        const isSelected = selectedPreset.id === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handlePresetSelect(preset)}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden active:scale-95 ${
                              isSelected
                                ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black border-amber-300 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400'
                                : 'bg-slate-950/80 border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 text-slate-200'
                            }`}
                          >
                            {isSelected && (
                              <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-slate-950 text-amber-400 font-black text-[10px] flex items-center justify-center">
                                ✓
                              </span>
                            )}
                            {preset.popular && !isSelected && (
                              <span className="absolute top-2 right-2 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[8px] font-black uppercase">
                                Hot
                              </span>
                            )}

                            <div className="flex items-center gap-1.5">
                              <span className="text-lg">{preset.icon}</span>
                              <span className={`text-sm font-black ${isSelected ? 'text-slate-950' : 'text-white'}`}>
                                {preset.name}
                              </span>
                            </div>

                            <p className={`text-[10px] mt-0.5 font-medium ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                              {preset.desc}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Close Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowTimeModal(false)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
