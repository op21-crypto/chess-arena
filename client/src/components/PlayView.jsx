import React from 'react';
import {
  Swords, Bot, Users, ArrowRight,
  ChevronRight, Trophy, Flame, BookOpen, Clock, Loader2
} from 'lucide-react';
import { triggerHaptic } from '../utils/device.js';
import { sound } from '../utils/audio.js';

export const TIME_PRESETS = [
  { id: '1m', name: '1 min', format: 'bullet', baseMinutes: 1, incrementSeconds: 0, icon: '⚡', label: 'Bullet' },
  { id: '3m', name: '3 min', format: 'blitz', baseMinutes: 3, incrementSeconds: 0, icon: '🔥', label: 'Blitz' },
  { id: '5m', name: '5 min', format: 'blitz', baseMinutes: 5, incrementSeconds: 0, icon: '🔥', label: 'Blitz' },
  { id: '10m', name: '10 min', format: 'rapid', baseMinutes: 10, incrementSeconds: 0, icon: '⏳', label: 'Rapid' }
];

export function PlayView({
  currentUser,
  onStartMatchmaking,
  isSearchingMatch,
  onCancelMatchmaking,
  onOpenMatchmakingModal,
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
  return (
    <div className="max-w-2xl w-full mx-auto px-3.5 py-3 sm:py-5 space-y-4 animate-fade-in pb-16">
      {/* Banner: Active Live Game in Progress (if any) */}
      {activeGameSession && !activeGameSession.isGameOver && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/10 border-2 border-amber-500/50 shadow-xl flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xl shadow-lg shrink-0">
              ♟️
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-extrabold text-white truncate">Live Match In Progress</h3>
              <p className="text-xs text-amber-300 truncate">
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
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Return</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Matchmaking Radar Banner (if actively searching) */}
      {isSearchingMatch && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-orange-950/80 border-2 border-amber-500/60 shadow-xl flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
              <span className="absolute inset-0 rounded-full border-2 border-amber-400 animate-ping" />
              <span className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-lg">
                ⚔️
              </span>
            </div>
            <div>
              <span className="text-sm font-black text-white block">Searching for Opponent...</span>
              <span className="text-[11px] text-amber-400 font-mono">Worldwide Rated Pairing Active</span>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              triggerHaptic('move');
              if (onCancelMatchmaking) onCancelMatchmaking();
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 active:scale-95 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Grandmaster Arena Hub Container (Identical Sleek, Premium Style to Home Screen) */}
      <div className="relative rounded-3xl p-4 sm:p-6 md:p-7 border border-amber-500/20 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 shadow-2xl shadow-amber-500/10 overflow-hidden backdrop-blur-xl">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="space-y-4 relative z-10">
          {/* Sleek Title Bar */}
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Play Arena</span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  Season 2026
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Select your game mode to start playing
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono font-bold text-white">18,450</span>
              <span className="text-slate-400 hidden xs:inline">online</span>
            </div>
          </div>

          {/* 4 Unified, Sleek, Professional Game Mode Cards */}
          <div className="space-y-2.5 pt-1">
            {/* 1st: Play with Stockfish */}
            <button
              onClick={() => {
                sound.playClick();
                triggerHaptic('move');
                if (onOpenAIModal) onOpenAIModal();
              }}
              className="w-full text-left p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-purple-950/50 hover:from-indigo-900/80 hover:via-purple-900/60 hover:to-indigo-850/80 active:from-indigo-900/95 active:to-purple-900/90 border border-indigo-500/35 hover:border-indigo-400/70 shadow-lg shadow-indigo-950/30 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.985] group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/25 transition-all duration-300" />
              <div className="flex items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                  {/* Stockfish AI Neural Bot Avatar Profile Picture */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-indigo-900/80 via-slate-950 to-purple-950/90 border border-indigo-400/50 p-1.5 shadow-md flex flex-col items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-indigo-300 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.35)] transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:6px_6px] pointer-events-none" />
                    <div className="relative z-10 flex flex-col items-center">
                      <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-300 drop-shadow-[0_0_6px_rgba(99,102,241,0.7)] group-hover:text-indigo-200 transition-colors" />
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_4px_#22d3ee] animate-pulse" />
                        <span className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_4px_#22d3ee] animate-pulse" style={{ animationDelay: '200ms' }} />
                      </div>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-indigo-950/95 border-t border-indigo-500/40 py-0.5 flex justify-center items-center">
                      <span className="text-[7px] sm:text-[8px] font-black tracking-widest text-indigo-300 uppercase">AI BOT</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-black text-white group-hover:text-indigo-200 transition-colors leading-tight">
                        Play with Stockfish
                      </h3>
                      <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] sm:text-[10px] font-black uppercase tracking-wider shrink-0 shadow-sm">
                        AI Bot 🤖
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-1 font-medium leading-tight">
                      Practice against engine bots (800–2500+ Elo)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-indigo-400 text-xs font-bold shrink-0">
                  <span className="hidden md:inline">Play AI</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 group-hover:text-indigo-300 transition-all" />
                </div>
              </div>
            </button>

            {/* 2nd: Play with Friends (Chat & Voice Room) */}
            <button
              onClick={() => {
                sound.playClick();
                triggerHaptic('move');
                if (onOpenFriendRoom) onOpenFriendRoom();
              }}
              className="w-full text-left p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-teal-950/50 hover:from-emerald-900/80 hover:via-teal-900/60 hover:to-emerald-850/80 active:from-emerald-900/95 active:to-teal-900/90 border border-emerald-500/35 hover:border-emerald-400/70 shadow-lg shadow-emerald-950/30 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.985] group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/25 transition-all duration-300" />
              <div className="flex items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                  {/* Friends & Live Voice Audio Wave Avatar Profile Picture */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-900/80 via-slate-950 to-teal-950/90 border border-emerald-400/50 p-1.5 shadow-md flex flex-col items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-emerald-300 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all duration-300 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="flex items-center justify-center -space-x-1.5">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 border border-emerald-200/50 flex items-center justify-center text-[8px] font-black text-white shadow-sm">
                          ♔
                        </div>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border border-amber-200/50 flex items-center justify-center text-[8px] font-black text-white shadow-sm">
                          ♚
                        </div>
                      </div>
                      <div className="flex items-end gap-0.5 justify-center mt-1">
                        <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-0.5 h-3 bg-emerald-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-0.5 h-1.5 bg-teal-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span className="w-0.5 h-2.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                      </div>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-emerald-950/95 border-t border-emerald-500/40 py-0.5 flex justify-center items-center">
                      <span className="text-[7px] sm:text-[8px] font-black tracking-widest text-emerald-300 uppercase">VOICE</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-black text-white group-hover:text-emerald-200 transition-colors leading-tight">
                        Play with Friends
                      </h3>
                      <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] sm:text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-sm">
                        <span>Chat & Voice</span>
                        <span className="text-[10px]">🎙️</span>
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-1 font-medium leading-tight">
                      Private rooms with live chat, voice & invites
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold shrink-0">
                  <span className="hidden md:inline">Join Room</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 group-hover:text-emerald-300 transition-all" />
                </div>
              </div>
            </button>

            {/* 3rd: Play Online (Rated FIDE) */}
            <button
              onClick={() => {
                sound.playClick();
                triggerHaptic('move');
                if (onOpenMatchmakingModal) {
                  onOpenMatchmakingModal();
                } else if (onStartMatchmaking) {
                  onStartMatchmaking(TIME_PRESETS[1]);
                }
              }}
              className="w-full text-left p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900/90 to-orange-950/50 hover:from-amber-900/80 hover:via-orange-900/60 hover:to-amber-850/80 active:from-amber-900/95 active:to-orange-900/90 border border-amber-500/35 hover:border-amber-400/70 shadow-lg shadow-amber-950/30 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.985] group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/25 transition-all duration-300" />
              <div className="flex items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                  {/* Global Arena Matchmaking Profile Picture with Crossed Swords */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-900/80 via-slate-950 to-orange-950/90 border border-amber-500/50 p-1.5 shadow-md flex flex-col items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-amber-300 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-all duration-300 relative overflow-hidden">
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
                    <div className="relative z-10 flex flex-col items-center">
                      <Swords className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.7)] group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-amber-950/95 border-t border-amber-500/40 py-0.5 flex justify-center items-center">
                      <span className="text-[7px] sm:text-[8px] font-black tracking-widest text-amber-300 uppercase">ONLINE</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-black text-white group-hover:text-amber-200 transition-colors leading-tight">
                        Play Online
                      </h3>
                      <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] sm:text-[10px] font-black uppercase tracking-wider shrink-0 shadow-sm">
                        Rated FIDE ⚔️
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-1 font-medium leading-tight">
                      Choose time control & match with global players
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold shrink-0">
                  <span className="hidden md:inline">Choose Time</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 group-hover:text-amber-300 transition-all" />
                </div>
              </div>
            </button>

            {/* 4th: Offline Chess Board */}
            <button
              onClick={() => {
                sound.playClick();
                triggerHaptic('move');
                if (onOpenOfflineBoard) onOpenOfflineBoard();
              }}
              className="w-full text-left p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-amber-950/25 to-slate-950/90 hover:from-slate-850 hover:via-amber-950/40 hover:to-amber-900/30 active:from-amber-950/60 active:to-slate-900/95 border border-amber-500/30 hover:border-amber-400/60 shadow-lg shadow-slate-950/30 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.985] group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-300" />
              <div className="flex items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                  {/* 4x4 Mini Chessboard Picture */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-950/90 border border-amber-500/50 p-1 shadow-md flex flex-col items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-amber-300 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-all duration-300 relative overflow-hidden">
                    <div className="w-full h-[32px] sm:h-[36px] grid grid-cols-4 grid-rows-4 rounded-sm overflow-hidden border border-amber-900/80 shadow-inner">
                      {[
                        0, 1, 0, 1,
                        1, 0, 1, 0,
                        0, 1, 0, 1,
                        1, 0, 1, 0
                      ].map((val, idx) => {
                        const isDark = val === 1;
                        return (
                          <div
                            key={idx}
                            className={`w-full h-full flex items-center justify-center ${
                              isDark ? 'bg-amber-900' : 'bg-amber-100'
                            }`}
                          >
                            {idx === 9 && (
                              <span className="text-[7px] leading-none select-none text-slate-900 font-bold">♟</span>
                            )}
                            {idx === 6 && (
                              <span className="text-[7px] leading-none select-none text-amber-950 font-bold">♙</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-stone-950/95 border-t border-amber-600/40 py-0.5 flex justify-center items-center">
                      <span className="text-[7px] sm:text-[8px] font-black tracking-widest text-amber-300 uppercase">BOARD</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-black text-white group-hover:text-amber-200 transition-colors leading-tight">
                        Offline Chess Board
                      </h3>
                      <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[9px] sm:text-[10px] font-black uppercase tracking-wider shrink-0 shadow-sm">
                        Pass & Play 👥
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-1 font-medium leading-tight">
                      Play face-to-face on 1 phone (No internet needed)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-slate-400 group-hover:text-amber-400 text-xs font-bold shrink-0">
                  <span className="hidden md:inline">Pass & Play</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 group-hover:text-amber-300 transition-all" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Arena Modules Exploration (Compact & Sleek) */}
      <div className="pt-1">
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1 mb-2">
          Explore Other Arena Modules
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* 1. Tournaments */}
          {onNavigateToTournaments && (
            <div
              onClick={() => {
                sound.playClick();
                triggerHaptic('move');
                onNavigateToTournaments();
              }}
              className="p-3 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 rounded-2xl cursor-pointer transition-all active:scale-[0.98] flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">Tournaments</span>
                  <span className="text-[10px] text-slate-400 block truncate">Live Swiss & Blitz</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0" />
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
              className="p-3 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 rounded-2xl cursor-pointer transition-all active:scale-[0.98] flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">Tactics Puzzles</span>
                  <span className="text-[10px] text-slate-400 block truncate">Streak, Storm & Daily</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0" />
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
              className="p-3 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 rounded-2xl cursor-pointer transition-all active:scale-[0.98] flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">Chess Academy</span>
                  <span className="text-[10px] text-slate-400 block truncate">64 master lessons</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
