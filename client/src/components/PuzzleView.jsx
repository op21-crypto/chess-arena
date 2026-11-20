import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from './Chessboard.jsx';
import { Lightbulb, Trophy, RotateCcw, CheckCircle2, XCircle, ArrowRight, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio.js';
import { safeStorage } from '../utils/storage.js';
import { CHESS_PUZZLES as DEFAULT_PUZZLES } from '../data/puzzleData.js';

export function PuzzleView({ currentUser, onUpdateRating }) {
  const [puzzles, setPuzzles] = useState(DEFAULT_PUZZLES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentFen, setCurrentFen] = useState(DEFAULT_PUZZLES[0]?.fen || '');
  const [solutionStep, setSolutionStep] = useState(0);
  const [status, setStatus] = useState('playing'); // 'playing', 'correct_step', 'solved', 'failed'
  const [hintShown, setHintShown] = useState(false);
  const [streak, setStreak] = useState(0);
  const [puzzleRating, setPuzzleRating] = useState(currentUser?.ratings?.puzzle || 1200);

  useEffect(() => {
    fetch('/api/puzzles')
      .then(res => res.json())
      .then(data => {
        if (data.puzzles && data.puzzles.length > 0) {
          setPuzzles(data.puzzles);
          loadPuzzle(data.puzzles[0]);
        }
      })
      .catch(() => {
        setPuzzles(DEFAULT_PUZZLES);
        loadPuzzle(DEFAULT_PUZZLES[0]);
      });
  }, []);

  const loadPuzzle = (puzzle) => {
    setCurrentFen(puzzle.fen);
    setSolutionStep(0);
    setStatus('playing');
    setHintShown(false);
  };

  const currentPuzzle = puzzles[currentIndex];

  const handleMove = (moveObj) => {
    if (!currentPuzzle || status === 'solved') return;

    const uciMove = `${moveObj.from}${moveObj.to}${moveObj.promotion || ''}`;
    const expectedMove = currentPuzzle.solution[solutionStep];

    if (uciMove === expectedMove) {
      const nextStep = solutionStep + 1;
      const chess = new Chess(currentFen);
      chess.move(moveObj);
      setCurrentFen(chess.fen());

      if (nextStep >= currentPuzzle.solution.length) {
        // Entire puzzle solved!
        setStatus('solved');
        setStreak(prev => prev + 1);
        setPuzzleRating(prev => prev + 15);
        sound.playVictory();
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });

        // Update rating in backend
        fetch(`/api/puzzles/${currentPuzzle.id}/solve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${safeStorage.getItem('token')}`
          },
          body: JSON.stringify({ success: true })
        }).catch(() => {});

        if (onUpdateRating) onUpdateRating(puzzleRating + 15);
      } else {
        // Puzzle opponent replies automatically with the next solution step
        setStatus('correct_step');
        setSolutionStep(nextStep);

        const oppUci = currentPuzzle.solution[nextStep];
        setTimeout(() => {
          const oppFrom = oppUci.substring(0, 2);
          const oppTo = oppUci.substring(2, 4);
          const oppProm = oppUci.length > 4 ? oppUci.substring(4, 5) : undefined;
          
          chess.move({ from: oppFrom, to: oppTo, promotion: oppProm });
          setCurrentFen(chess.fen());
          setSolutionStep(nextStep + 1);
          setStatus('playing');
          sound.playMove();
        }, 500);
      }
    } else {
      setStatus('failed');
      setStreak(0);
      sound.playGameOver();
    }
  };

  const handleNextPuzzle = () => {
    const nextIdx = (currentIndex + 1) % puzzles.length;
    setCurrentIndex(nextIdx);
    loadPuzzle(puzzles[nextIdx]);
  };

  const handleRetry = () => {
    if (currentPuzzle) {
      loadPuzzle(currentPuzzle);
    }
  };

  if (!currentPuzzle) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        Loading tactical puzzles...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Banner Stats */}
      <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{currentPuzzle.title}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700 font-mono">
                {currentPuzzle.rating} ELO
              </span>
            </h2>
            <p className="text-xs text-slate-400">{currentPuzzle.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-950/40 border border-orange-500/30 text-orange-400 text-xs font-bold font-mono">
            <Flame className="w-4 h-4 fill-orange-400" />
            <span>Streak: {streak}</span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Your Rating</span>
            <span className="text-base font-bold text-amber-400 font-mono">{puzzleRating}</span>
          </div>
        </div>
      </div>

      {/* Main Board & Puzzle Status */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-7 flex justify-center">
          <div className="w-full max-w-[460px]">
            <Chessboard
              fen={currentFen}
              playerColor={currentPuzzle.turn}
              onMove={handleMove}
              disabled={status === 'solved'}
            />
          </div>
        </div>

        <div className="md:col-span-5 space-y-4">
          {/* Tactical Motif / Theme Badge */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tactical Theme</span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs border border-indigo-500/30">
                {currentPuzzle.theme}
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300">
              <span className="font-semibold text-amber-400">
                {currentPuzzle.turn === 'w' ? 'White to move and win material.' : 'Black to move and deliver tactics.'}
              </span>
            </div>

            {/* Status Feedback Banners */}
            {status === 'solved' && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-emerald-300 text-xs font-bold animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>Brilliant! Puzzle Solved (+15 ELO)</span>
              </div>
            )}

            {status === 'failed' && (
              <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl flex items-center gap-2 text-red-300 text-xs font-bold animate-fade-in">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span>That move is not best. Try again!</span>
              </div>
            )}

            {/* Hint Panel */}
            {hintShown && (
              <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-200">
                <strong>Hint:</strong> {currentPuzzle.hint}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setHintShown(true)}
                disabled={hintShown || status === 'solved'}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
              >
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>{hintShown ? 'Hint Revealed' : 'Get Hint'}</span>
              </button>

              <button
                onClick={handleRetry}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                title="Retry puzzle"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleNextPuzzle}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-colors shadow-lg shadow-amber-500/10"
              >
                <span>Next Puzzle</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
