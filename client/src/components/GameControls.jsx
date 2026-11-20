import React, { useState } from 'react';
import { Flag, Handshake, RotateCcw, Share2, Sparkles, RefreshCw, Trophy, Swords, Check, X, PhoneCall } from 'lucide-react';

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
  onFlipBoard,
  onAnalyze,
  onShareRoom,
  onViewResult,
  onVoiceCall
}) {
  const [showResignModal, setShowResignModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    onShareRoom?.();
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-2.5">
      {/* Voice Call Quick Connect Banner for Playing with Friends */}
      {onVoiceCall && !isGameOver && (
        <button
          onClick={onVoiceCall}
          className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-950/60 via-indigo-950/40 to-slate-900 border border-emerald-500/40 hover:border-emerald-400 rounded-2xl text-emerald-300 font-bold text-xs flex items-center justify-between transition-all group shadow-md"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span>Voice Call Friend</span>
          </div>
          <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
            Live Audio
          </span>
        </button>
      )}

      {/* Draw Offer Notification Banner */}
      {drawOfferedBy && !isGameOver && (
        <div className="p-3 bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/50 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
            <Handshake className="w-4 h-4 text-amber-400 shrink-0" />
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
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept</span>
              </button>
              <button
                onClick={() => onRespondDraw(false)}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all active:scale-95"
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
        <div className="p-3 bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/50 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
            <RefreshCw className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
            <span>Opponent requests a rematch!</span>
          </div>
          <button
            onClick={onRequestRematch}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-md transition-all active:scale-95"
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
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent hover:bg-amber-500/30 border border-amber-500/40 rounded-2xl text-amber-300 font-bold text-xs flex items-center justify-between transition-all group shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>View Match Celebration & Result</span>
            </div>
            <span className="text-[11px] font-mono bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded-full">
              Scorecard
            </span>
          </button>

          {/* Action Button Grid */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={onRequestRematch}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-amber-200 transition-all text-xs font-bold gap-1 shadow-sm"
              title="Request a rematch"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Rematch</span>
            </button>

            <button
              onClick={onAnalyze}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/40 text-indigo-300 hover:text-indigo-200 transition-all text-xs font-bold gap-1 shadow-sm"
              title="Stockfish 19 Game Review"
            >
              <Sparkles className="w-4 h-4" />
              <span>Review</span>
            </button>

            <button
              onClick={onFlipBoard}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all text-xs font-medium gap-1"
              title="Flip chessboard orientation"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Flip</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-all text-xs font-medium gap-1"
              title="Share match link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Active Game Controls */
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={onFlipBoard}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all text-xs font-medium gap-1 shadow-sm"
              title="Flip chessboard orientation"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Flip</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-all text-xs font-medium gap-1 shadow-sm"
              title="Share room link with friends"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>

            {isPlayer && (
              <>
                <button
                  onClick={onOfferDraw}
                  disabled={Boolean(drawOfferedBy)}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 disabled:opacity-40 transition-all text-xs font-medium gap-1 shadow-sm"
                  title="Offer a draw"
                >
                  <Handshake className="w-4 h-4" />
                  <span>Draw</span>
                </button>

                <button
                  onClick={() => setShowResignModal(true)}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 text-slate-300 hover:text-rose-400 transition-all text-xs font-medium gap-1 shadow-sm"
                  title="Resign match"
                >
                  <Flag className="w-4 h-4" />
                  <span>Resign</span>
                </button>
              </>
            )}
          </div>

          {/* Resign Safety Modal Confirmation */}
          {showResignModal && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-2xl space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
                <Flag className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Are you sure you want to resign this game?</span>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowResignModal(false)}
                  className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
                >
                  Keep Playing
                </button>
                <button
                  onClick={() => {
                    setShowResignModal(false);
                    onResign();
                  }}
                  className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-md transition-colors"
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
