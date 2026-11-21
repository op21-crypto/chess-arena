import React, { useState } from 'react';
import { Flag, Handshake, Palette, LogOut, RefreshCw, Trophy, Sparkles, Check, X, PhoneCall } from 'lucide-react';

export function GameControls({
  isGameOver,
  isPlayer,
  drawOfferedBy,
  rematchRequestedBy,
  currentUserColor,
  onResign,
  onOfferDraw,
  onRespondDraw,
  onRequestRematch,
  onOpenDesign,
  onExit,
  onAnalyze,
  onViewResult,
  onVoiceCall,
  isAIGame = false,
  isLight = false
}) {
  const [showResignModal, setShowResignModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const handleExitClick = () => {
    if (isGameOver) {
      onExit?.();
    } else {
      setShowExitModal(true);
    }
  };

  const btnBaseClass = isLight
    ? 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 shadow-xs'
    : 'bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white';

  return (
    <div className="space-y-2.5">
      {/* Voice Call Quick Connect Banner: ONLY FOR PVP MATCHES (Friends & Online Worldwide) */}
      {onVoiceCall && !isGameOver && !isAIGame && (
        <button
          onClick={onVoiceCall}
          className={`w-full py-2.5 px-3.5 rounded-2xl font-bold text-xs flex items-center justify-between transition-all group shadow-sm border ${
            isLight
              ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border-emerald-300/80 text-emerald-900 hover:border-emerald-400'
              : 'bg-gradient-to-r from-emerald-950/60 via-indigo-950/40 to-slate-900 border-emerald-500/40 hover:border-emerald-400 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform ${
              isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              <PhoneCall className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="font-extrabold leading-tight">Voice Call Opponent</div>
              <div className={`text-[10px] ${isLight ? 'text-emerald-700' : 'text-emerald-400/80'}`}>Real-time low-latency audio</div>
            </div>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
            isLight ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            Live Audio 🎙️
          </span>
        </button>
      )}

      {/* Draw Offer Notification Banner */}
      {drawOfferedBy && !isGameOver && (
        <div className={`p-3 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-fade-in border ${
          isLight
            ? 'bg-amber-50 border-amber-300 text-amber-950'
            : 'bg-gradient-to-r from-amber-950/60 to-slate-900 border-amber-500/50 text-amber-300'
        }`}>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Handshake className={`w-4 h-4 shrink-0 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
            <span>
              {drawOfferedBy === currentUserColor
                ? 'Draw proposal sent to opponent...'
                : 'Opponent proposes a peaceful draw!'}
            </span>
          </div>

          {drawOfferedBy !== currentUserColor && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onRespondDraw(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept</span>
              </button>
              <button
                onClick={() => onRespondDraw(false)}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer ${
                  isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <X className="w-3.5 h-3.5" />
                <span>Decline</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Rematch Offered Banner */}
      {rematchRequestedBy && isGameOver && rematchRequestedBy !== currentUserColor && (
        <div className={`p-3 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-fade-in border ${
          isLight
            ? 'bg-amber-50 border-amber-300 text-amber-950'
            : 'bg-gradient-to-r from-amber-950/60 to-slate-900 border-amber-500/50 text-amber-300'
        }`}>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <RefreshCw className={`w-4 h-4 shrink-0 animate-spin ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
            <span>Opponent requests a rematch!</span>
          </div>
          <button
            onClick={onRequestRematch}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Accept Rematch
          </button>
        </div>
      )}

      {/* Post-Game Controls (Game Over State) */}
      {isGameOver ? (
        <div className="space-y-2">
          {/* Re-Open Celebration / Result Card */}
          <button
            onClick={onViewResult}
            className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-between transition-all group shadow-sm border ${
              isLight
                ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-950'
                : 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent hover:bg-amber-500/30 border border-amber-500/40 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
              <span>View Match Scorecard & Celebration</span>
            </div>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
              isLight ? 'bg-amber-200 text-amber-900' : 'bg-amber-500/30 text-amber-200'
            }`}>
              Result
            </span>
          </button>

          {/* Action Button Grid: Rematch, Review, Design, Exit */}
          <div className="grid grid-cols-4 gap-2">
            {/* 1. Rematch */}
            <button
              onClick={onRequestRematch}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all text-xs font-bold gap-1 shadow-sm cursor-pointer ${
                isLight
                  ? 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300 hover:text-amber-200'
              }`}
              title="Start a new game or rematch"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Rematch</span>
            </button>

            {/* 2. Review (Analysis) */}
            <button
              onClick={onAnalyze}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all text-xs font-bold gap-1 shadow-sm cursor-pointer ${
                isLight
                  ? 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-900'
                  : 'bg-indigo-500/15 hover:bg-indigo-500/25 border-indigo-500/40 text-indigo-300 hover:text-indigo-200'
              }`}
              title="Stockfish 19 Game Review"
            >
              <Sparkles className="w-4 h-4" />
              <span>Review</span>
            </button>

            {/* 3. Design (Customizer) */}
            <button
              onClick={onOpenDesign}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all text-xs font-bold gap-1 shadow-sm cursor-pointer ${
                isLight
                  ? 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-900'
                  : 'bg-purple-500/15 hover:bg-purple-500/25 border-purple-500/40 text-purple-300 hover:text-purple-200'
              }`}
              title="In-Game Design Studio"
            >
              <Palette className="w-4 h-4" />
              <span>Design</span>
            </button>

            {/* 4. Exit */}
            <button
              onClick={handleExitClick}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all text-xs font-bold gap-1 shadow-sm cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Exit to Home"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      ) : (
        /* Active In-Game Controls: Exit, Draw, Design, Resign */
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-2">
            {/* 1. Exit Button */}
            <button
              onClick={handleExitClick}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all text-xs font-semibold gap-1 cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs'
                  : 'bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white'
              }`}
              title="Leave game and return to Home"
            >
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-400 transition-colors" />
              <span>Exit</span>
            </button>

            {/* 2. Draw Button */}
            <button
              onClick={onOfferDraw}
              disabled={Boolean(drawOfferedBy)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl disabled:opacity-40 transition-all text-xs font-semibold gap-1 cursor-pointer ${btnBaseClass}`}
              title="Offer or propose a draw"
            >
              <Handshake className="w-4 h-4 text-amber-500" />
              <span>Draw</span>
            </button>

            {/* 3. Design Studio Button */}
            <button
              onClick={onOpenDesign}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all text-xs font-semibold gap-1 cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-800 hover:text-purple-700 shadow-xs'
                  : 'bg-slate-900/90 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-purple-300'
              }`}
              title="In-Game Board & Piece Design Studio"
            >
              <Palette className="w-4 h-4 text-purple-400" />
              <span>Design</span>
            </button>

            {/* 4. Resign Button */}
            {isPlayer && (
              <button
                onClick={() => setShowResignModal(true)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all text-xs font-semibold gap-1 cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-800 hover:text-rose-600 shadow-xs'
                    : 'bg-slate-900/90 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 text-slate-300 hover:text-rose-400'
                }`}
                title="Resign match"
              >
                <Flag className="w-4 h-4 text-rose-500" />
                <span>Resign</span>
              </button>
            )}
          </div>

          {/* Active Game Exit Confirmation Dialog */}
          {showExitModal && (
            <div className={`p-3.5 rounded-2xl space-y-2.5 animate-fade-in border shadow-lg ${
              isLight
                ? 'bg-white border-amber-200 text-slate-900 shadow-amber-100'
                : 'bg-slate-900/95 border-amber-500/40 text-slate-100'
            }`}>
              <div className={`flex items-center gap-2 text-xs font-bold ${
                isLight ? 'text-amber-800' : 'text-amber-300'
              }`}>
                <LogOut className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Leave this game and return to the main lobby?</span>
              </div>
              <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {isAIGame
                  ? 'Your progress in this AI match will be saved to history.'
                  : 'Leaving an active multiplayer game counts as a forfeit.'}
              </p>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowExitModal(false)}
                  className={`px-3 py-1.5 text-xs rounded-xl font-bold transition-colors cursor-pointer ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Stay in Game
                </button>
                <button
                  onClick={() => {
                    setShowExitModal(false);
                    onExit?.();
                  }}
                  className="px-3.5 py-1.5 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black shadow-md transition-colors cursor-pointer"
                >
                  Exit to Home
                </button>
              </div>
            </div>
          )}

          {/* Resign Safety Modal Confirmation */}
          {showResignModal && (
            <div className={`p-3.5 rounded-2xl space-y-2.5 animate-fade-in border shadow-lg ${
              isLight
                ? 'bg-white border-rose-200 text-slate-900 shadow-rose-100'
                : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
            }`}>
              <div className={`flex items-center gap-2 text-xs font-bold ${
                isLight ? 'text-rose-700' : 'text-rose-300'
              }`}>
                <Flag className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Are you sure you want to resign this game?</span>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowResignModal(false)}
                  className={`px-3 py-1.5 text-xs rounded-xl font-bold transition-colors cursor-pointer ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Keep Playing
                </button>
                <button
                  onClick={() => {
                    setShowResignModal(false);
                    onResign();
                  }}
                  className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black shadow-md transition-colors cursor-pointer"
                >
                  Confirm Resign
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
