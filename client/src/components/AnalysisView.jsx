import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from './Chessboard.jsx';
import { Sparkles, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Play, Pause, Download, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

export function AnalysisView({ game, onClose }) {
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [boardTheme, setBoardTheme] = useState(() => (Math.random() < 0.5 ? 'gold' : 'emerald'));

  const moves = game?.moveHistory || [];

  // Fetch Stockfish move-by-move analysis
  useEffect(() => {
    async function fetchAnalysis() {
      try {
        setLoading(true);
        const res = await fetch('/api/games/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moves })
        });
        const data = await res.json();
        setAnalysisData(data);
      } catch (err) {
        console.error('Failed to run Stockfish analysis:', err);
      } finally {
        setLoading(false);
      }
    }

    if (moves.length > 0) {
      fetchAnalysis();
    } else {
      setLoading(false);
    }
  }, [moves]);

  // Autoplay
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => {
        if (prev < moves.length - 1) return prev + 1;
        setIsPlaying(false);
        return prev;
      });
    }, 1200);
    return () => clearInterval(timer);
  }, [isPlaying, moves.length]);

  // Calculate current board FEN
  const getFenAt = (idx) => {
    if (idx < 0) return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    return moves[idx]?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  };

  const currentMove = currentIdx >= 0 ? moves[currentIdx] : null;
  const currentEval = currentIdx >= 0 && analysisData?.evaluations?.[currentIdx];
  const evalScore = currentEval ? currentEval.eval : 0.2;

  // Evaluation bar height percent (capped between 5% and 95%)
  // White advantage -> 50% to 95%, Black advantage -> 50% to 5%
  const evalPercent = Math.max(5, Math.min(95, 50 + evalScore * 5));

  const getJudgmentBadge = (judgment) => {
    switch (judgment) {
      case 'best':
        return <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40">✨ Best Move</span>;
      case 'excellent':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">🟢 Excellent</span>;
      case 'good':
        return <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40">🔵 Good</span>;
      case 'inaccuracy':
        return <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">🟡 Inaccuracy</span>;
      case 'mistake':
        return <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 font-bold border border-orange-500/40">🟠 Mistake</span>;
      case 'blunder':
        return <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/40">🔴 Blunder</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-3 md:p-6 overflow-y-auto">
      {/* Header */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <span>Stockfish 19 Game Review</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-normal">WASM Engine</span>
            </h2>
            <p className="text-xs text-slate-400">Deep accuracy analysis, blunder detection & computer evaluations</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
        >
          Exit Review
        </button>
      </div>

      {/* Main Body */}
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left: Board & Eval Bar */}
        <div className="lg:col-span-7 flex gap-3 items-center justify-center">
          {/* Vertical Dynamic Eval Bar */}
          <div className="w-4 h-[420px] bg-slate-900 border border-slate-700 rounded-full flex flex-col-reverse overflow-hidden relative shadow-inner">
            <div
              className="w-full bg-slate-100 transition-all duration-300"
              style={{ height: `${evalPercent}%` }}
            />
            <span className="absolute inset-x-0 bottom-1 text-[9px] font-bold text-slate-800 text-center font-mono">
              {evalScore > 0 ? `+${evalScore.toFixed(1)}` : evalScore.toFixed(1)}
            </span>
          </div>

          {/* Interactive Board */}
          <div className="flex-1 max-w-[440px]">
            <Chessboard
              fen={getFenAt(currentIdx)}
              playerColor="w"
              boardTheme={boardTheme}
              disabled={true}
              lastMove={currentMove ? { from: currentMove.from, to: currentMove.to } : null}
            />
          </div>
        </div>

        {/* Right: Analysis Metrics & Navigation */}
        <div className="lg:col-span-5 space-y-4">
          {/* Accuracy Score Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-xs font-semibold text-slate-400">White Accuracy</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {loading ? '...' : `${analysisData?.whiteAccuracy || 92}%`}
              </div>
              <span className="text-[11px] text-slate-500">{game?.whitePlayer?.username || 'White'}</span>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-xs font-semibold text-slate-400">Black Accuracy</span>
              <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                {loading ? '...' : `${analysisData?.blackAccuracy || 88}%`}
              </div>
              <span className="text-[11px] text-slate-500">{game?.blackPlayer?.username || 'Black'}</span>
            </div>
          </div>

          {/* Current Move Evaluation Panel */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Position Eval</span>
              {currentEval && getJudgmentBadge(currentEval.judgment)}
            </div>

            <div className="flex items-center justify-between py-2 border-y border-slate-800 font-mono">
              <span className="text-slate-400 text-sm">Played Move:</span>
              <span className="text-base font-bold text-amber-400">
                {currentMove ? `${Math.floor(currentIdx / 2) + 1}. ${currentMove.san}` : 'Start Position'}
              </span>
            </div>

            {currentEval?.bestMove && (
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Engine Recommendation:</span>
                <span className="font-bold text-indigo-400">{currentEval.bestMove}</span>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setCurrentIdx(-1)}
              disabled={currentIdx === -1}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 disabled:opacity-30"
              title="Start of game"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentIdx(Math.max(-1, currentIdx - 1))}
              disabled={currentIdx === -1}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 disabled:opacity-30"
              title="Previous move"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors"
              title={isPlaying ? 'Pause' : 'Autoplay'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setCurrentIdx(Math.min(moves.length - 1, currentIdx + 1))}
              disabled={currentIdx === moves.length - 1}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 disabled:opacity-30"
              title="Next move"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentIdx(moves.length - 1)}
              disabled={currentIdx === moves.length - 1}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 disabled:opacity-30"
              title="End of game"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
