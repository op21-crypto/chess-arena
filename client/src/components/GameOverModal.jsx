import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy, Shield, Handshake, RotateCcw, Sparkles, Swords,
  Home, ArrowRight, Lightbulb, Copy, Check, Quote, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio.js';
import { triggerHaptic } from '../utils/device.js';

const GRANDMASTER_ENCOURAGEMENTS = [
  {
    quote: "Even Magnus Carlsen lost thousands of games to become World Champion.",
    author: "Magnus Carlsen",
    tip: "Study the turning point with Stockfish. Every mistake holds a master lesson."
  },
  {
    quote: "You learn far more from a defeat than from a victory.",
    author: "José Raúl Capablanca",
    tip: "Review your critical moves below to turn this battle into lasting rating gains."
  },
  {
    quote: "A blunder is merely a tactical puzzle in reverse.",
    author: "Garry Kasparov",
    tip: "Find the exact move where evaluation shifted and master the counter-tactic."
  },
  {
    quote: "Every master was once a beginner who refused to surrender.",
    author: "Bobby Fischer",
    tip: "Analyze your blunders, swap sides for a rematch, and conquer!"
  },
  {
    quote: "Defeat is the stepping stone of true champions.",
    author: "Viswanathan Anand",
    tip: "Stockfish 19 engine is ready to reveal the hidden winning lines."
  }
];

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
  moveHistory = [],
  pgn = '',
  onRematch,
  onAnalyze,
  onNewGame,
  onClose
}) {
  const [copiedPgn, setCopiedPgn] = useState(false);

  const isWhite = playerColor === 'w';
  const isWinner = (winner === 'white' && isWhite) || (winner === 'black' && !isWhite);
  const isDraw = winner === 'draw' || status === 'stalemate' || status === 'draw';
  const isDefeat = !isWinner && !isDraw;

  // Pick a random encouraging grandmaster insight on defeat
  const encouragement = useMemo(() => {
    const idx = Math.floor(Math.random() * GRANDMASTER_ENCOURAGEMENTS.length);
    return GRANDMASTER_ENCOURAGEMENTS[idx];
  }, [isOpen]);

  // Trigger audio & celebratory visual effects on game end
  useEffect(() => {
    if (!isOpen) return;

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
      // Warm, dignified acoustic chime - NOT harsh or depressing
      sound.playGameOver();
    } else if (isDraw) {
      sound.playClick();
    }
  }, [isOpen, isWinner, isDefeat, isDraw]);

  if (!isOpen) return null;

  // Exact reason description
  let detailReason = winReason;
  if (!detailReason) {
    if (status === 'checkmate') {
      detailReason = isWinner ? 'Won by Checkmate' : 'Defeat by Checkmate';
    } else if (status === 'timeout') {
      detailReason = isWinner ? 'Won on Time (Opponent Flagged)' : 'Time Expired (Clock Ran Out)';
    } else if (status === 'resigned') {
      detailReason = isWinner ? 'Opponent Resigned' : 'You Resigned';
    } else if (status === 'stalemate') {
      detailReason = 'Drawn by Stalemate (No Legal Moves)';
    } else {
      detailReason = 'Match Concluded';
    }
  }

  const myEloDiff = isWhite ? whiteEloChange : blackEloChange;
  const oppEloDiff = isWhite ? blackEloChange : whiteEloChange;
  const totalMoves = moveHistory?.length ? Math.ceil(moveHistory.length / 2) : 0;

  const handleCopyPgn = () => {
    sound.playClick();
    triggerHaptic('move');
    const textToCopy = pgn || (moveHistory?.length
      ? moveHistory.map((m, i) => `${i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ''}${m.san || m}`).join(' ')
      : '1. e4 e5');
    navigator.clipboard?.writeText(textToCopy);
    setCopiedPgn(true);
    setTimeout(() => setCopiedPgn(false), 2200);
  };

  const handleReviewClick = () => {
    sound.playReviewOpen();
    triggerHaptic('move');
    if (onAnalyze) onAnalyze();
  };

  const handleRematchClick = () => {
    sound.playClick();
    triggerHaptic('move');
    if (onRematch) onRematch();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl p-5 sm:p-6 max-w-md w-full space-y-4 sm:space-y-5 shadow-2xl relative text-center backdrop-blur-xl my-auto">
        {/* Ambient Top Glow */}
        <div className={`absolute top-0 inset-x-0 h-32 rounded-t-3xl blur-2xl pointer-events-none ${
          isWinner ? 'bg-amber-500/15' : isDefeat ? 'bg-rose-500/10' : 'bg-slate-500/10'
        }`} />

        {/* Top Trophy / Shield Crest Icon */}
        <div className="flex justify-center relative z-10 pt-1">
          {isWinner ? (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 border-2 border-amber-300 flex items-center justify-center shadow-xl shadow-amber-500/30 transform transition-transform hover:scale-105">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 fill-slate-950" />
            </div>
          ) : isDefeat ? (
            // Dignified Knight / Shield Crest for Defeat (Honorable, inspiring - NOT a scary skull)
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-amber-400 border-2 border-amber-500/40 flex items-center justify-center shadow-xl shadow-amber-500/15 transform transition-transform hover:scale-105">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 stroke-[2.2]" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center justify-center text-xs shadow">
                <Swords className="w-3.5 h-3.5" />
              </div>
            </div>
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-slate-800/80 border-2 border-slate-600 text-slate-200 flex items-center justify-center shadow-lg">
              <Handshake className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
          )}
        </div>

        {/* Title & Detailed Match Status */}
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs mb-0.5">
            {isWinner ? (
              <span className="bg-amber-500/15 text-amber-400 border-amber-500/30">
                🏆 Victory Achieved
              </span>
            ) : isDefeat ? (
              <span className="bg-amber-500/10 text-amber-300 border-amber-500/30 flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-400" />
                <span>Valiant Effort • Battle Complete</span>
              </span>
            ) : (
              <span className="bg-slate-700/30 text-slate-300 border-slate-600">
                🤝 Match Drawn
              </span>
            )}
          </div>

          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${
            isWinner ? 'text-amber-400' : isDefeat ? 'text-white' : 'text-slate-100'
          }`}>
            {isWinner ? 'VICTORY!' : isDefeat ? 'Good Effort!' : 'GAME DRAWN'}
          </h2>

          <p className="text-xs sm:text-sm font-semibold text-slate-300">
            {detailReason} {totalMoves > 0 && `• ${totalMoves} moves played`}
          </p>
        </div>

        {/* Grandmaster Wisdom & Encouragement Card (Losing Side Inspiration) */}
        {isDefeat && encouragement && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900/90 to-slate-950 border border-amber-500/30 text-left space-y-2 relative shadow-md backdrop-blur-md">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 mt-0.5">
                <Quote className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-1 min-w-0">
                <p className="text-xs text-amber-100 font-medium italic leading-relaxed">
                  "{encouragement.quote}"
                </p>
                <div className="text-[10px] font-bold text-amber-400/90 tracking-wide uppercase">
                  — {encouragement.author}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-amber-500/20 flex items-center gap-1.5 text-[11px] text-slate-300 font-semibold">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{encouragement.tip}</span>
            </div>
          </div>
        )}

        {/* Players ELO Summary Box */}
        <div className="grid grid-cols-2 gap-2.5 p-3 bg-slate-950/80 border border-slate-800 rounded-2xl relative z-10">
          {/* You */}
          <div className="flex flex-col items-center gap-1 p-2 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              You ({isWhite ? 'White' : 'Black'})
            </span>
            <span className="text-xs sm:text-sm font-black text-white truncate max-w-[130px]">
              {isWhite ? whitePlayer?.username : blackPlayer?.username}
            </span>
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold mt-0.5">
              <span className="text-slate-300">
                {(isWhite ? whitePlayer?.elo : blackPlayer?.elo) || 1200}
              </span>
              {myEloDiff !== 0 && (
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                  myEloDiff > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {myEloDiff > 0 ? `+${myEloDiff}` : myEloDiff}
                </span>
              )}
            </div>
          </div>

          {/* Opponent */}
          <div className="flex flex-col items-center gap-1 p-2 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Opponent ({isWhite ? 'Black' : 'White'})
            </span>
            <span className="text-xs sm:text-sm font-black text-white truncate max-w-[130px]">
              {isWhite ? blackPlayer?.username : whitePlayer?.username}
            </span>
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold mt-0.5">
              <span className="text-slate-300">
                {(isWhite ? blackPlayer?.elo : whitePlayer?.elo) || 1200}
              </span>
              {oppEloDiff !== 0 && (
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                  oppEloDiff > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {oppEloDiff > 0 ? `+${oppEloDiff}` : oppEloDiff}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Primary Action Buttons: Clear, High-Value, and Easy to Navigate */}
        <div className="space-y-2 pt-1 relative z-10">
          {/* 1. HERO BUTTON: Stockfish Game Review (Review Best Moves & Blunders) */}
          <button
            onClick={handleReviewClick}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm rounded-2xl transition-all shadow-xl shadow-indigo-600/25 flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-98 group border border-indigo-400/30"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Review Best Moves & Blunders</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
            <span className="text-[10px] text-indigo-200 font-normal">
              Move-by-move Stockfish 19 engine evaluation & accuracy analysis
            </span>
          </button>

          {/* 2. SECONDARY HERO BUTTON: Rematch / Swap Sides */}
          <button
            onClick={handleRematchClick}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>Rematch (Swap Sides)</span>
          </button>

          {/* 3. Action Row: New Match, Copy PGN, Arena Lobby */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => {
                sound.playClick();
                triggerHaptic('move');
                if (onNewGame) onNewGame();
              }}
              className="py-2.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-slate-700/80 hover:border-amber-500/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
              title="Play against another opponent or bot"
            >
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              <span className="truncate">New Match</span>
            </button>

            <button
              onClick={handleCopyPgn}
              className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-sm ${
                copiedPgn
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-slate-600'
              }`}
              title="Copy match PGN notation"
            >
              {copiedPgn ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                  <span className="truncate">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">Copy PGN</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                sound.playClick();
                triggerHaptic('move');
                if (onClose) onClose();
              }}
              className="py-2.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-slate-700/80 hover:border-slate-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
              title="Return to Arena Main Lobby"
            >
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">Lobby</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
