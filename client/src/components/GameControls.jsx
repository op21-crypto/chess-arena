import React, { useState } from 'react';
import { Flag, Handshake, RotateCcw, Share2, Sparkles, RefreshCw } from 'lucide-react';

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
  onShareRoom
}) {
  const [showResignModal, setShowResignModal] = useState(false);

  return (
    <div className="space-y-3">
      {/* Draw Offer Notification Banner */}
      {drawOfferedBy && (
        <div className="p-3 bg-slate-900 border border-amber-500/50 rounded-xl shadow-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-medium">
            <Handshake className="w-4 h-4" />
            <span>
              {drawOfferedBy === currentUserColor
                ? 'Draw offer sent to opponent...'
                : 'Opponent offers a draw!'}
            </span>
          </div>

          {drawOfferedBy !== currentUserColor && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRespondDraw(true)}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Accept
              </button>
              <button
                onClick={() => onRespondDraw(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-colors"
              >
                Decline
              </button>
            </div>
          )}
        </div>
      )}

      {/* Primary Game Action Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={onFlipBoard}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 transition-all text-xs font-medium gap-1"
          title="Flip board orientation"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Flip</span>
        </button>

        {isPlayer && !isGameOver && (
          <>
            <button
              onClick={onOfferDraw}
              disabled={Boolean(drawOfferedBy)}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 disabled:opacity-40 transition-all text-xs font-medium gap-1"
              title="Offer a draw"
            >
              <Handshake className="w-4 h-4" />
              <span>Draw</span>
            </button>

            <button
              onClick={() => setShowResignModal(true)}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/80 hover:bg-red-950/40 border border-slate-800 hover:border-red-500/50 text-slate-300 hover:text-red-400 transition-all text-xs font-medium gap-1"
              title="Resign game"
            >
              <Flag className="w-4 h-4" />
              <span>Resign</span>
            </button>
          </>
        )}

        {isGameOver && (
          <>
            <button
              onClick={onRequestRematch}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 transition-all text-xs font-bold gap-1 animate-pulse"
              title="Request Rematch"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{rematchRequestedBy ? 'Accept Rematch' : 'Rematch'}</span>
            </button>

            <button
              onClick={onAnalyze}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 transition-all text-xs font-bold gap-1"
              title="Run Stockfish analysis"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analyze</span>
            </button>
          </>
        )}

        <button
          onClick={onShareRoom}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-all text-xs font-medium gap-1"
          title="Share room link"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Resignation Confirmation Modal */}
      {showResignModal && (
        <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl space-y-2">
          <p className="text-xs text-red-200 font-medium">Are you sure you want to resign this match?</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowResignModal(false)}
              className="px-3 py-1 text-xs bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowResignModal(false);
                onResign();
              }}
              className="px-3 py-1 text-xs bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold"
            >
              Confirm Resign
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
