import React, { useState, useEffect } from 'react';
import {
  Swords, Zap, Flame, Clock, Shield, Bot, Users, Check,
  ArrowRight, Play, Sparkles, ChevronRight, ChevronDown,
  X, Smartphone, Mic, Radio, Trophy, BookOpen, RotateCw
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
  { level: 1, name: 'Friendly Sensei', rating: 600, icon: '🌸', desc: 'Patient beginner mentor, makes fun blunders' },
  { level: 2, name: 'Tactical Cadet', rating: 1100, icon: '⚔️', desc: 'Casual club player, basic tactics vision' },
  { level: 3, name: 'Arena Master', rating: 1600, icon: '🛡️', desc: 'Aggressive attacking bot with solid defense' },
  { level: 4, name: 'Cyber Grandmaster', rating: 2100, icon: '🤖', desc: 'Deep calculation, near-zero tactical mistakes' },
  { level: 5, name: 'Magnus Bot', rating: 2500, icon: '👑', desc: 'Peak World Champion AI, ruthless endgame master' }
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
  onNavigateToPuzzles,
  onNavigateToLessons,
  onNavigateToTournaments,
  activeGameSession,
  onReturnToGame
}) {
  // Accordion state: by default ALL 4 game mode buttons are CLOSED
  const [openSections, setOpenSections] = useState({
    online: false,
    ai: false,
    friends: false,
    offline: false,
  });

  const [selectedPreset, setSelectedPreset] = useState(TIME_PRESETS[5]); // Default 10 min Rapid
  const [selectedBot, setSelectedBot] = useState(BOT_PRESETS[1]);
  const [botColor, setBotColor] = useState('w'); // 'w' | 'b' | 'random'

  // If actively searching match, ensure online section is open so radar is visible
  useEffect(() => {
    if (isSearchingMatch) {
      setOpenSections(prev => ({ ...prev, online: true }));
    }
  }, [isSearchingMatch]);

  const toggleSection = (sectionKey) => {
    sound.playClick();
    triggerHaptic('move');
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

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
    <div className="max-w-3xl w-full mx-auto px-3.5 py-3 sm:p-6 space-y-3 sm:space-y-4 animate-fade-in pb-16">
      {/* Banner: Active Live Game in Progress (if any) */}
      {activeGameSession && !activeGameSession.isGameOver && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/10 border-2 border-amber-500/50 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xl shadow-lg">
              ♟️
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Live Match In Progress</h3>
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
            Select any game mode below to view options & start playing
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

      {/* ================= 4 PLAY MODE ACCORDION CARDS ================= */}
      <div className="space-y-3">
        {/* ================= 1. ONLINE ARENA (RATED MATCHMAKING) ================= */}
        <div className="bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950 border border-amber-500/30 rounded-2xl overflow-hidden shadow-lg transition-all">
          <button
            type="button"
            onClick={() => toggleSection('online')}
            className={`w-full p-4 sm:p-5 flex items-center justify-between text-left transition-colors cursor-pointer select-none active:scale-[0.99] ${
              openSections.online ? 'bg-amber-500/10 border-b border-amber-500/30' : 'hover:bg-slate-850/80'
            }`}
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-xl shrink-0 shadow-md">
                <Swords className="w-6 h-6" />
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                    Online Arena
                  </h2>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
                    Rated FIDE
                  </span>
                  <span className="px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono">
                    Selected: {selectedPreset.name} {selectedPreset.label}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Play rated 1v1 live chess against players worldwide matched to your Elo rating with anti-cheat.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-3">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-colors ${
                openSections.online
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {openSections.online ? 'Close Options' : 'Choose Time & Play'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                openSections.online ? 'text-amber-400 rotate-180' : 'text-slate-400'
              }`} />
            </div>
          </button>

          {/* Expanded Online Arena Choosing Options */}
          {openSections.online && (
            <div className="p-4 sm:p-5 space-y-4 bg-slate-950/70 border-t border-slate-800/80 animate-fade-in">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Choose Your Preferred Speed / Time Control:</span>
                </span>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  {selectedPreset.name} ({selectedPreset.label})
                </span>
              </div>

              {/* 8 Clean Time Preset Cards (2x4 Grid) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {TIME_PRESETS.map((preset) => {
                  const isSelected = selectedPreset.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden active:scale-95 ${
                        isSelected
                          ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black border-amber-300 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400'
                          : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 text-slate-200'
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

              {/* Action Button: Matchmaking or Active Radar */}
              <div className="pt-1">
                {isSearchingMatch ? (
                  <div className="py-5 px-4 bg-slate-950 rounded-2xl border border-amber-500/50 flex flex-col items-center justify-center space-y-3 shadow-xl">
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
                    <span>Start Rated Match ({selectedPreset.name} {selectedPreset.label})</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ================= 2. PLAY VS COMPUTER AI (STOCKFISH ENGINE) ================= */}
        <div className="bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950 border border-indigo-500/30 rounded-2xl overflow-hidden shadow-lg transition-all">
          <button
            type="button"
            onClick={() => toggleSection('ai')}
            className={`w-full p-4 sm:p-5 flex items-center justify-between text-left transition-colors cursor-pointer select-none active:scale-[0.99] ${
              openSections.ai ? 'bg-indigo-500/10 border-b border-indigo-500/30' : 'hover:bg-slate-850/80'
            }`}
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center text-xl shrink-0 shadow-md">
                <Bot className="w-6 h-6" />
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                    Play vs Computer AI
                  </h2>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider">
                    Stockfish 19
                  </span>
                  <span className="px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono">
                    Tier: {selectedBot.name} (~{selectedBot.rating})
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Practice offline or online against Stockfish engine bots from beginner tutor (600) to World Champion (2500).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-3">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-colors ${
                openSections.ai
                  ? 'bg-indigo-500 text-white border-indigo-400 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {openSections.ai ? 'Close Options' : 'Choose Bot & Play'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                openSections.ai ? 'text-indigo-400 rotate-180' : 'text-slate-400'
              }`} />
            </div>
          </button>

          {/* Expanded AI Choosing Options */}
          {openSections.ai && (
            <div className="p-4 sm:p-5 space-y-4 bg-slate-950/70 border-t border-slate-800/80 animate-fade-in">
              {/* Option 1: Choose Bot Tier */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block px-1">
                  1. Choose Bot Difficulty & Strength:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {BOT_PRESETS.map((bot) => {
                    const isSelected = selectedBot.level === bot.level;
                    return (
                      <button
                        key={bot.level}
                        type="button"
                        onClick={() => handleBotSelect(bot)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-black border-indigo-300 shadow-md shadow-indigo-500/30'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xl">{bot.icon}</span>
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                              isSelected ? 'bg-slate-950/40 text-white' : 'bg-slate-800 text-indigo-300'
                            }`}>
                              ~{bot.rating}
                            </span>
                          </div>
                          <span className="text-xs font-bold block mt-1 truncate">
                            {bot.name}
                          </span>
                        </div>
                        <p className={`text-[9px] mt-1 line-clamp-2 leading-tight ${
                          isSelected ? 'text-indigo-100' : 'text-slate-400'
                        }`}>
                          {bot.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Option 2: Choose Piece Color */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block px-1">
                  2. Choose Your Playing Side:
                </span>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'w', label: 'Play White', icon: '♔', desc: 'Move first & attack' },
                    { id: 'random', label: 'Random Color', icon: '🎲', desc: '50% White / 50% Black' },
                    { id: 'b', label: 'Play Black', icon: '♚', desc: 'Defend & counter' }
                  ].map((c) => {
                    const isSelected = botColor === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleBotColorSelect(c.id)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-black border-indigo-400 shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="text-lg block">{c.icon}</span>
                        <span className="text-xs font-bold block">{c.label}</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">{c.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleLaunchBot}
                  className="w-full py-4 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm sm:text-base rounded-2xl transition-all shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2.5 active:scale-[0.98] cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>Start Game vs {selectedBot.name} (~{selectedBot.rating} Elo)</span>
                </button>
              </div>

              {/* Deep Stockfish Engine Hub Link */}
              {onOpenAIModal && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    triggerHaptic('move');
                    onOpenAIModal();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Custom Stockfish Neural Engine Hub (Levels 1–8 with Time Controls)</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* ================= 3. PLAY WITH FRIENDS (PRIVATE ROOM & LIVE VOICE) ================= */}
        <div className="bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950 border border-emerald-500/30 rounded-2xl overflow-hidden shadow-lg transition-all">
          <button
            type="button"
            onClick={() => toggleSection('friends')}
            className={`w-full p-4 sm:p-5 flex items-center justify-between text-left transition-colors cursor-pointer select-none active:scale-[0.99] ${
              openSections.friends ? 'bg-emerald-500/10 border-b border-emerald-500/30' : 'hover:bg-slate-850/80'
            }`}
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xl shrink-0 shadow-md">
                <Mic className="w-6 h-6" />
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                    Play with Friends
                  </h2>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                    Live Audio 🎙️
                  </span>
                  <span className="px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono">
                    Private Room
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Create a custom match room, send a shareable link or room code, and talk live in real-time voice chat.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-3">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-colors ${
                openSections.friends
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {openSections.friends ? 'Close Options' : 'Room Options'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                openSections.friends ? 'text-emerald-400 rotate-180' : 'text-slate-400'
              }`} />
            </div>
          </button>

          {/* Expanded Friends Choosing Options */}
          {openSections.friends && (
            <div className="p-4 sm:p-5 space-y-4 bg-slate-950/70 border-t border-slate-800/80 animate-fade-in">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block px-1">
                Choose How to Connect with Your Friend:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option A: Create Custom Room */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span>Create New Room</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Generates a private room with a shareable URL and 6-letter room code. You choose the time control.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenFriendRoom}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Users className="w-4 h-4" />
                    <span>Create Room & Invite</span>
                  </button>
                </div>

                {/* Option B: Join via Room Code */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
                      <Radio className="w-4 h-4 text-emerald-400" />
                      <span>Join Friend's Room</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Received a 6-letter room code or challenge from a friend? Enter it to jump directly into the game.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenFriendRoom}
                    className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border border-slate-700 active:scale-95 cursor-pointer"
                  >
                    <span>Enter Room Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= 4. OFFLINE CHESS BOARD (PASS & PLAY ON 1 DEVICE) ================= */}
        {onOpenOfflineBoard && (
          <div className="bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all">
            <button
              type="button"
              onClick={() => toggleSection('offline')}
              className={`w-full p-4 sm:p-5 flex items-center justify-between text-left transition-colors cursor-pointer select-none active:scale-[0.99] ${
                openSections.offline ? 'bg-amber-500/10 border-b border-amber-500/30' : 'hover:bg-slate-850/80'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-amber-400 flex items-center justify-center text-xl shrink-0 shadow-md">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                      Offline Chess Board
                    </h2>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-black uppercase tracking-wider">
                      Pass & Play 👥
                    </span>
                    <span className="px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono">
                      No Internet
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Play face-to-face on 1 smartphone without internet. Includes dual digital clocks, board flipping, and move undo.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-3">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-colors ${
                  openSections.offline
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {openSections.offline ? 'Close Setup' : 'Board Setup'}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                  openSections.offline ? 'text-amber-400 rotate-180' : 'text-slate-400'
                }`} />
              </div>
            </button>

            {/* Expanded Offline Board Setup Options */}
            {openSections.offline && (
              <div className="p-4 sm:p-5 space-y-4 bg-slate-950/70 border-t border-slate-800/80 animate-fade-in">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block px-1">
                  Offline Pass & Play Features:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
                    <span className="text-xl">👥</span>
                    <div>
                      <span className="text-xs font-bold text-white block">2 Players Local</span>
                      <span className="text-[10px] text-slate-400 block">Pass phone or lay flat</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
                    <span className="text-xl">⏱️</span>
                    <div>
                      <span className="text-xs font-bold text-white block">Dual Clocks</span>
                      <span className="text-[10px] text-slate-400 block">Casual, Rapid or Blitz</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
                    <span className="text-xl">🔄</span>
                    <div>
                      <span className="text-xs font-bold text-white block">Auto Flip</span>
                      <span className="text-[10px] text-slate-400 block">Board rotates per turn</span>
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleOpenOfflineBoard}
                    className="w-full py-4 px-4 bg-gradient-to-r from-slate-800 via-slate-750 to-slate-800 hover:from-amber-500 hover:to-amber-400 text-white hover:text-slate-950 border border-slate-700 hover:border-amber-400 font-black text-sm sm:text-base rounded-2xl transition-all shadow-lg active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Launch Fullscreen Offline Board</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= QUICK PRACTICE & CHAMPIONSHIP HUBS ================= */}
      <div className="pt-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1 mb-2">
          Explore Other Arena Modules
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* 1. Tournaments Championship */}
          {onNavigateToTournaments && (
            <div
              onClick={() => {
                sound.playClick();
                triggerHaptic('move');
                onNavigateToTournaments();
              }}
              className="p-3.5 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 rounded-2xl cursor-pointer transition-all active:scale-[0.98] flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">Arena Tournaments</span>
                  <span className="text-[10px] text-slate-400 block truncate">Live Swiss & Blitz events</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
            </div>
          )}

          {/* 2. Tactics Puzzles */}
          {onNavigateToPuzzles && (
            <div
              onClick={() => {
                sound.playClick();
                triggerHaptic('move');
                onNavigateToPuzzles();
              }}
              className="p-3.5 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 rounded-2xl cursor-pointer transition-all active:scale-[0.98] flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">Tactics Puzzles</span>
                  <span className="text-[10px] text-slate-400 block truncate">Streak, Storm & Daily</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
            </div>
          )}

          {/* 3. Chess Academy Lessons */}
          {onNavigateToLessons && (
            <div
              onClick={() => {
                sound.playClick();
                triggerHaptic('move');
                onNavigateToLessons();
              }}
              className="p-3.5 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 rounded-2xl cursor-pointer transition-all active:scale-[0.98] flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">Chess Academy</span>
                  <span className="text-[10px] text-slate-400 block truncate">64 master lessons & tutor</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
