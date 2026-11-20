import React, { useEffect } from 'react';
import { Trophy, Skull, Handshake, RotateCcw, Sparkles, Swords, Share2, Home, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio.js';

export function GameOverModal({
  isOpen,
  status, // 'checkmate', 'stalemate', 'timeout', 'resigned', 'draw', 'abandoned'
  winner, // 'white' | 'black' | 'draw'
  winReason,
  playerColor, // 'w' | 'b'
  whitePlayer,
  blackPlayer,
  whiteEloChange = 0,
  blackEloChange = 0,
  onRematch,
  onAnalyze,
  onNewGame,
  onClose
}) {
  if (!isOpen) return null;

  const isWhite = playerColor === 'w';
  const isWinner = (winner === 'white' && isWhite) || (winner === 'black' && !isWhite);
  const isDraw = winner === 'draw' || status === 'stalemate' || status === 'draw';
  const isDefeat = !isWinner && !isDraw;

  // Trigger celebration effects on mount
  useEffect(() => {
    if (isWinner) {
      sound.playVictory();
      // Burst celebratory confetti
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#ffffff']
      });
      const timer = setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 350);
      return () => clearTimeout(timer);
    } else if (isDefeat) {
      sound.playGameOver();
    }
  }, [isWinner, isDefeat]);

  // Construct clean human-readable end title and reason
  let resultTitle = 'Game Over';
  let titleColor = 'text-white';
  let badgeIcon = <Trophy className="w-8 h-8 text-amber-400" />;
  let badgeBg = 'bg-amber-500/20 border-amber-500/40';

  if (isWinner) {
    resultTitle = 'VICTORY!';
    titleColor = 'text-amber-400';
    badgeIcon = <Trophy className="w-10 h-10 text-amber-400" />;
    badgeBg = 'bg-amber-500/20 border-amber-500/40 shadow-lg shadow-amber-500/20';
  } else if (isDefeat) {
    resultTitle = 'DEFEAT';
    titleColor = 'text-rose-400';
    badgeIcon = <Skull className="w-10 h-10 text-rose-400" />;
    badgeBg = 'bg-rose-500/20 border-rose-500/40 shadow-lg shadow-rose-500/20';
  } else if (isDraw) {
    resultTitle = 'DRAW';
    titleColor = 'text-slate-200';
    badgeIcon = <Handshake className="w-10 h-10 text-slate-300" />;
    badgeBg = 'bg-slate-700/30 border-slate-600';
  }

  // Exact reason description
  let detailReason = winReason;
  if (!detailReason) {
    if (status === 'checkmate') {
      detailReason = isWinner ? 'Won by Checkmate' : 'Lost by Checkmate';
    } else if (status === 'timeout') {
      detailReason = isWinner ? 'Won on Time (Opponent Flagged)' : 'Lost on Time (Clock Expired)';
    } else if (status === 'resigned') {
      detailReason = isWinner ? 'Opponent Resigned' : 'You Resigned';
    } else if (status === 'stalemate') {
      detailReason = 'Drawn by Stalemate (No Legal Moves)';
    } else {
      detailReason = 'Game Concluded';
    }
  }

  const myEloDiff = isWhite ? whiteEloChange : blackEloChange;
  const oppEloDiff = isWhite ? blackEloChange : whiteEloChange;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-6 md:p-8 max-w-md w-full space-y-6 shadow-2xl relative text-center">
        {/* Top Trophy / Badge Icon */}
        <div className="flex justify-center">
          <div className={`w-20 h-20 rounded-3xl border-2 flex items-center justify-center transform transition-transform hover:scale-105 ${badgeBg}`}>
            {badgeIcon}
          </div>
        </div>

        {/* Title & Detailed Reason */}
        <div className="space-y-1.5">
          <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${titleColor}`}>
            {resultTitle}
          </h2>
          <p className="text-sm font-semibold text-slate-300">
            {detailReason}
          </p>
        </div>

        {/* Players ELO Summary Box */}
        <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl">
          {/* You */}
          <div className="flex flex-col items-center gap-1 p-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400">You ({isWhite ? 'White' : 'Black'})</span>
            <span className="text-sm font-bold text-white truncate max-w-[120px]">
              {isWhite ? whitePlayer?.username : blackPlayer?.username}
            </span>
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold mt-0.5">
              <span className="text-slate-300">
                {(isWhite ? whitePlayer?.elo : blackPlayer?.elo) || 1200}
              </span>
              {myEloDiff !== 0 && (
                <span className={`px-1.5 py-0.5 rounded text-[11px] ${
                  myEloDiff > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {myEloDiff > 0 ? `+${myEloDiff}` : myEloDiff}
                </span>
              )}
            </div>
          </div>

          {/* Opponent */}
          <div className="flex flex-col items-center gap-1 p-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400">Opponent ({isWhite ? 'Black' : 'White'})</span>
            <span className="text-sm font-bold text-white truncate max-w-[120px]">
              {isWhite ? blackPlayer?.username : whitePlayer?.username}
            </span>
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold mt-0.5">
              <span className="text-slate-300">
                {(isWhite ? blackPlayer?.elo : whitePlayer?.elo) || 1200}
              </span>
              {oppEloDiff !== 0 && (
                <span className={`px-1.5 py-0.5 rounded text-[11px] ${
                  oppEloDiff > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {oppEloDiff > 0 ? `+${oppEloDiff}` : oppEloDiff}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Primary Action Buttons - Clearly Arranged by Priority */}
        <div className="space-y-2.5 pt-1">
          {/* 1. Rematch / Play Again (Hero Action) */}
          <button
            onClick={onRematch}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm rounded-2xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transform active:scale-98"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rematch (Swap Sides)</span>
          </button>

          {/* 2. Stockfish Game Review (High Value) */}
          <button
            onClick={onAnalyze}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-300" />
            <span>Stockfish Game Review</span>
          </button>

          {/* 3. New Opponent & Home Button in clean 2-column row */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={onNewGame}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              <span>New Match</span>
            </button>

            <button
              onClick={onClose}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Arena Lobby</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
