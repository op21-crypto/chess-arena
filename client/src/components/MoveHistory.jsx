import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check } from 'lucide-react';

export function MoveHistory({ moves = [], currentMoveIndex = -1, onSelectMove }) {
  const containerRef = useRef(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [moves.length]);

  // Group moves into pairs (White & Black)
  const movePairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: moves[i],
      whiteIdx: i,
      black: moves[i + 1] || null,
      blackIdx: i + 1
    });
  }

  const exportPGN = () => {
    let pgn = '';
    movePairs.forEach((pair) => {
      pgn += `${pair.moveNumber}. ${pair.white.san} `;
      if (pair.black) {
        pgn += `${pair.black.san} `;
      }
    });
    navigator.clipboard.writeText(pgn.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden h-44 md:h-52">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/60 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <span>Move History</span>
        <button
          onClick={exportPGN}
          disabled={moves.length === 0}
          className="flex items-center gap-1 text-[11px] hover:text-amber-400 transition-colors disabled:opacity-40"
          title="Copy PGN to clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'PGN'}</span>
        </button>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs md:text-sm">
        {movePairs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 italic">
            No moves played yet
          </div>
        ) : (
          movePairs.map((pair) => (
            <div key={pair.moveNumber} className="grid grid-cols-12 py-0.5 px-2 rounded hover:bg-slate-800/50">
              <span className="col-span-2 text-slate-500 font-bold">{pair.moveNumber}.</span>
              <button
                onClick={() => onSelectMove && onSelectMove(pair.whiteIdx)}
                className={`col-span-5 text-left px-1 rounded transition-colors ${
                  currentMoveIndex === pair.whiteIdx
                    ? 'bg-amber-500/20 text-amber-300 font-bold'
                    : 'text-slate-200 hover:text-amber-400'
                }`}
              >
                {pair.white.san}
              </button>
              {pair.black ? (
                <button
                  onClick={() => onSelectMove && onSelectMove(pair.blackIdx)}
                  className={`col-span-5 text-left px-1 rounded transition-colors ${
                    currentMoveIndex === pair.blackIdx
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'text-slate-300 hover:text-amber-400'
                  }`}
                >
                  {pair.black.san}
                </button>
              ) : (
                <span className="col-span-5" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
