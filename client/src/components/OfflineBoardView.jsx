import React, { useState, useMemo, useEffect } from 'react';
import { Chess } from 'chess.js';
import confetti from 'canvas-confetti';
import {
  ArrowLeft, RotateCw, Undo, Lightbulb, Settings, X, Check,
  Volume2, VolumeX, Eye, Camera, User, HelpCircle, Bell,
  Trophy, Sparkles, Crown, Swords, RotateCcw
} from 'lucide-react';
import { PieceIcon } from './PieceIcons.jsx';
import { sound } from '../utils/audio.js';
import { triggerHaptic } from '../utils/device.js';

// Realistic wooden and stone themes
const OFFLINE_THEMES = [
  {
    id: 'wood_walnut',
    name: 'Classic Walnut',
    light: '#ecdab9',
    dark: '#583617',
    border: '#3c220d',
    previewLight: '#ecdab9',
    previewDark: '#583617'
  },
  {
    id: 'table_wood',
    name: 'Golden Oak',
    light: '#f5e4c3',
    dark: '#8b5a2b',
    border: '#5c3818',
    previewLight: '#f5e4c3',
    previewDark: '#8b5a2b'
  },
  {
    id: 'greenwich',
    name: 'Emerald Club',
    light: '#ebecd0',
    dark: '#5a7a3e',
    border: '#384f25',
    previewLight: '#ebecd0',
    previewDark: '#5a7a3e'
  },
  {
    id: 'dark_marble',
    name: 'Dark Slate',
    light: '#94a3b8',
    dark: '#263345',
    border: '#111827',
    previewLight: '#94a3b8',
    previewDark: '#263345'
  },
  {
    id: 'alabaster',
    name: 'Ivory Royale',
    light: '#fbfaf8',
    dark: '#d6c6b2',
    border: '#a38f75',
    previewLight: '#fbfaf8',
    previewDark: '#d6c6b2'
  }
];

export function OfflineBoardView({ onBack }) {
  // Game State
  const [chess, setChess] = useState(() => new Chess());
  const [fen, setFen] = useState(() => chess.fen());
  const [moveHistory, setMoveHistory] = useState([]); // List of move objects
  const [lastMove, setLastMove] = useState(null); // { from, to }
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [promotionPending, setPromotionPending] = useState(null);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);

  // Offline Settings State
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [themeId, setThemeId] = useState('wood_walnut');
  const [viewMode, setViewMode] = useState('face-to-face'); // 'face-to-face' | 'auto-flip' | '2d'
  const [playAs, setPlayAs] = useState('by_turns'); // 'white' | 'black' | 'by_turns'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [helpEnabled, setHelpEnabled] = useState(true); // Legal move hints
  const [notificationEnabled, setNotificationEnabled] = useState(true); // Turn alert

  const activeTheme = useMemo(() => {
    return OFFLINE_THEMES.find(t => t.id === themeId) || OFFLINE_THEMES[0];
  }, [themeId]);

  const turn = chess.turn(); // 'w' | 'b'
  const isGameOver = chess.isGameOver();

  // Handle board flip based on view mode and playAs
  const isFlipped = useMemo(() => {
    if (viewMode === 'auto-flip') {
      return turn === 'b';
    }
    if (playAs === 'black') {
      return true;
    }
    return false;
  }, [viewMode, turn, playAs]);

  const files = isFlipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = isFlipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];

  // Captured pieces calculation
  const capturedPieces = useMemo(() => {
    const captured = { w: [], b: [] }; // Pieces captured BY white and BY black
    moveHistory.forEach(m => {
      if (m.captured) {
        if (m.color === 'w') {
          captured.w.push(m.captured);
        } else {
          captured.b.push(m.captured);
        }
      }
    });
    return captured;
  }, [moveHistory]);

  // Material advantage score calculation
  const materialScore = useMemo(() => {
    const values = { p: 1, n: 3, b: 3, r: 5, q: 9 };
    let whiteScore = 0;
    let blackScore = 0;
    capturedPieces.w.forEach(p => { whiteScore += values[p] || 0; });
    capturedPieces.b.forEach(p => { blackScore += values[p] || 0; });
    return {
      whiteAdvantage: whiteScore - blackScore,
      blackAdvantage: blackScore - whiteScore,
      whiteScore,
      blackScore
    };
  }, [capturedPieces]);

  // Trigger celebration effects helper
  const triggerCelebration = () => {
    try {
      if (soundEnabled) {
        sound.playVictory();
      }
      if (notificationEnabled) {
        triggerHaptic('gameover');
      }

      // 1. Center burst
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#f59e0b', '#fbbf24', '#10b981', '#3b82f6', '#ec4899', '#ffffff']
      });

      // 2. Left side cannon
      const timer1 = setTimeout(() => {
        confetti({
          particleCount: 75,
          angle: 60,
          spread: 60,
          origin: { x: 0.05, y: 0.65 },
          colors: ['#f59e0b', '#fbbf24', '#10b981', '#ffffff']
        });
      }, 300);

      // 3. Right side cannon
      const timer2 = setTimeout(() => {
        confetti({
          particleCount: 75,
          angle: 120,
          spread: 60,
          origin: { x: 0.95, y: 0.65 },
          colors: ['#3b82f6', '#ec4899', '#f59e0b', '#ffffff']
        });
      }, 550);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } catch (e) {}
  };

  // Trigger celebration on match conclusion
  useEffect(() => {
    if (showGameOverModal && chess.isCheckmate()) {
      triggerCelebration();
    }
  }, [showGameOverModal]);

  // Handle Square Selection and Moves
  const handleSquareClick = (square) => {
    if (isGameOver) return;

    const pieceOnSquare = chess.get(square);

    // If a piece is already selected
    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // 1. Direct valid move destination (handles moves, captures, en passant, standard castling)
      const validMove = legalMoves.find(m => m.to === square);
      if (validMove) {
        const isPromotion = Boolean(validMove.promotion || (validMove.piece === 'p' && (square.endsWith('8') || square.endsWith('1'))));
        if (isPromotion) {
          setPromotionPending({ from: selectedSquare, to: square, color: turn });
          return;
        }

        executeMove({ from: selectedSquare, to: square });
        return;
      }

      // 2. Intuitive Castling: If user selected King and tapped the corresponding Rook
      const selectedPiece = chess.get(selectedSquare);
      if (selectedPiece && selectedPiece.type === 'k' && selectedPiece.color === turn) {
        // White Kingside: King e1 tapped Rook h1 -> castle to g1
        if (selectedSquare === 'e1' && square === 'h1') {
          const kCastle = legalMoves.find(m => m.to === 'g1' && (m.flags.includes('k') || m.san === 'O-O'));
          if (kCastle) {
            executeMove({ from: 'e1', to: 'g1' });
            return;
          }
        }
        // White Queenside: King e1 tapped Rook a1 -> castle to c1
        if (selectedSquare === 'e1' && square === 'a1') {
          const qCastle = legalMoves.find(m => m.to === 'c1' && (m.flags.includes('q') || m.san === 'O-O-O'));
          if (qCastle) {
            executeMove({ from: 'e1', to: 'c1' });
            return;
          }
        }
        // Black Kingside: King e8 tapped Rook h8 -> castle to g8
        if (selectedSquare === 'e8' && square === 'h8') {
          const kCastle = legalMoves.find(m => m.to === 'g8' && (m.flags.includes('k') || m.san === 'O-O'));
          if (kCastle) {
            executeMove({ from: 'e8', to: 'g8' });
            return;
          }
        }
        // Black Queenside: King e8 tapped Rook a8 -> castle to c8
        if (selectedSquare === 'e8' && square === 'a8') {
          const qCastle = legalMoves.find(m => m.to === 'c8' && (m.flags.includes('q') || m.san === 'O-O-O'));
          if (qCastle) {
            executeMove({ from: 'e8', to: 'c8' });
            return;
          }
        }
      }

      // 3. If user clicked another own piece, switch selection smoothly
      if (pieceOnSquare && pieceOnSquare.color === turn) {
        setSelectedSquare(square);
        const moves = chess.moves({ square, verbose: true });
        setLegalMoves(moves);
        return;
      }

      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // New selection: must be current player's piece
    if (pieceOnSquare && pieceOnSquare.color === turn) {
      setSelectedSquare(square);
      const moves = chess.moves({ square, verbose: true });
      setLegalMoves(moves);
    }
  };

  const executeMove = ({ from, to, promotion = 'q' }) => {
    try {
      const moveResult = chess.move({ from, to, promotion });
      if (moveResult) {
        const newFen = chess.fen();
        setFen(newFen);
        setLastMove({ from, to });
        setSelectedSquare(null);
        setLegalMoves([]);
        setPromotionPending(null);

        // Update history
        setMoveHistory(prev => [...prev, moveResult]);

        // Check if game is over after this move
        const isGameOverNow = chess.isGameOver();

        // Audio & Haptics
        if (soundEnabled) {
          if (isGameOverNow) {
            if (chess.isCheckmate()) {
              sound.playVictory();
            } else {
              sound.playGameOver();
            }
          } else if (moveResult.captured) {
            sound.playCapture();
            if (chess.inCheck()) {
              setTimeout(() => sound.playCheck(), 140);
            }
          } else if (
            moveResult.flags.includes('k') ||
            moveResult.flags.includes('q') ||
            moveResult.san === 'O-O' ||
            moveResult.san === 'O-O-O'
          ) {
            sound.playCastle();
          } else if (moveResult.promotion) {
            sound.playPromotion();
          } else if (chess.inCheck()) {
            sound.playCheck();
          } else {
            sound.playMove();
          }
        }

        if (notificationEnabled) {
          if (isGameOverNow) {
            triggerHaptic('gameover');
          } else if (moveResult.captured) {
            triggerHaptic('capture');
          } else if (chess.inCheck()) {
            triggerHaptic('check');
          } else {
            triggerHaptic('move');
          }
        }

        // Trigger Game Over modal
        if (isGameOverNow) {
          setShowGameOverModal(true);
        }
      }
    } catch {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  // Undo Move
  const handleUndo = () => {
    if (moveHistory.length === 0) return;
    chess.undo();
    setFen(chess.fen());
    const newHistory = moveHistory.slice(0, -1);
    setMoveHistory(newHistory);
    setSelectedSquare(null);
    setLegalMoves([]);
    setShowGameOverModal(false);

    if (newHistory.length > 0) {
      const prev = newHistory[newHistory.length - 1];
      setLastMove({ from: prev.from, to: prev.to });
    } else {
      setLastMove(null);
    }

    if (soundEnabled) sound.playMove();
    if (notificationEnabled) triggerHaptic('move');
  };

  // Restart / New Game
  const handleResetGame = () => {
    const newGame = new Chess();
    setChess(newGame);
    setFen(newGame.fen());
    setMoveHistory([]);
    setLastMove(null);
    setSelectedSquare(null);
    setLegalMoves([]);
    setShowRestartConfirm(false);
    setShowGameOverModal(false);
    if (soundEnabled) sound.playMove();
  };

  // Check square for king in check
  const checkSquare = useMemo(() => {
    if (!chess.inCheck()) return null;
    const currentTurn = chess.turn();
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === currentTurn) {
          const filesMap = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
          return `${filesMap[c]}${8 - r}`;
        }
      }
    }
    return null;
  }, [fen, chess]);

  // Turn announcement text
  const moveNumber = Math.floor(moveHistory.length / 2) + 1;
  const turnLabel = `${moveNumber}.${turn === 'w' ? "White's Move" : "Black's Move"}`;

  return (
    <div
      className="relative h-screen h-[100dvh] w-full flex flex-col justify-between overflow-hidden select-none"
      style={{
        backgroundColor: '#2b2724',
        backgroundImage: `
          repeating-linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.45) 0px,
            rgba(0, 0, 0, 0.45) 2px,
            rgba(255, 255, 255, 0.05) 3px,
            rgba(48, 43, 38, 0.95) 4px,
            rgba(38, 33, 29, 0.95) 45px,
            rgba(26, 23, 20, 0.95) 88px,
            rgba(0, 0, 0, 0.6) 90px
          )
        `
      }}
    >
      {/* Promotion Dialog Overlay */}
      {promotionPending && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 max-w-xs w-full text-center">
            <div>
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest block">
                Pawn Promotion
              </span>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                Choose promotion piece for {promotionPending.color === 'w' ? 'White' : 'Black'}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2 w-full pt-1">
              {[
                { type: 'q', name: 'Queen', val: 9 },
                { type: 'r', name: 'Rook', val: 5 },
                { type: 'b', name: 'Bishop', val: 3 },
                { type: 'n', name: 'Knight', val: 3 }
              ].map(({ type, name, val }) => (
                <button
                  key={type}
                  onClick={() => executeMove({ ...promotionPending, promotion: type })}
                  className="p-2.5 bg-slate-800 hover:bg-amber-500/20 hover:border-amber-400 border border-slate-700 rounded-2xl flex flex-col items-center gap-1 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
                >
                  <PieceIcon piece={type} color={promotionPending.color || turn} size={42} />
                  <span className="text-[10px] font-bold text-white group-hover:text-amber-300">
                    {name}
                  </span>
                  <span className="text-[8px] font-mono font-bold text-amber-400/80">
                    +{val}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setPromotionPending(null)}
              className="text-xs text-slate-400 hover:text-white pt-1 transition-colors cursor-pointer"
            >
              Cancel Move
            </button>
          </div>
        </div>
      )}

      {/* Restart Game Confirmation Dialog */}
      {showRestartConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40">
              <RotateCw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Restart Game?</h3>
              <p className="text-xs text-slate-400 mt-1">This will clear the current board and start a new two-player offline match.</p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowRestartConfirm(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResetGame}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                New Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Celebration Dialog */}
      {showGameOverModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative overflow-hidden">
            {/* Ambient gold celebration glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Glowing Trophy with pulse */}
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/25 to-amber-600/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-400/50 shadow-lg shadow-amber-500/30 text-3xl animate-bounce">
                🏆
              </div>
            </div>

            <div className="relative z-10 space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>
                  {chess.isCheckmate() ? 'Match Victory' : chess.isDraw() ? 'Match Drawn' : 'Game Finished'}
                </span>
              </div>

              <h3 className="text-2xl font-black text-white tracking-tight">
                {chess.isCheckmate()
                  ? `Checkmate! ${turn === 'w' ? 'Black' : 'White'} Wins!`
                  : chess.isDraw()
                  ? 'Game Drawn!'
                  : 'Game Over!'}
              </h3>
              <p className="text-xs text-amber-300 font-medium">
                {chess.isCheckmate()
                  ? 'Official FIDE Checkmate Victory'
                  : chess.isStalemate()
                  ? 'Stalemate • No legal moves remaining'
                  : 'Match concluded'}
              </p>
            </div>

            {/* Match Stats Pill */}
            <div className="relative z-10 grid grid-cols-3 gap-2 py-2 px-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Moves</span>
                <span className="font-mono font-black text-white">{Math.floor(moveHistory.length / 2) + 1}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">White Captures</span>
                <span className="font-mono font-black text-amber-300">{capturedPieces.w.length}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Black Captures</span>
                <span className="font-mono font-black text-white">{capturedPieces.b.length}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="relative z-10 space-y-2 pt-1">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowGameOverModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  Review Board
                </button>
                <button
                  onClick={handleResetGame}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 cursor-pointer transition-transform active:scale-95"
                >
                  Play Again
                </button>
              </div>

              {/* Fire More Celebration Confetti */}
              <button
                onClick={triggerCelebration}
                className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Celebrate Again 🎉</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. TOP APP BAR (Exit, Turn Status Pill, Quick Controls) */}
      <header className="w-full max-w-md mx-auto px-3 pt-2 pb-1 flex items-center justify-between z-30 shrink-0">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-black/75 border border-amber-400/80 text-amber-400 hover:text-white flex items-center gap-1.5 shadow-md active:scale-95 transition-transform cursor-pointer"
          title="Exit to Lobby"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-[11px] font-black uppercase">Exit</span>
        </button>

        {/* Turn Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/85 border border-amber-500/50 shadow-lg">
          <span className={`w-2.5 h-2.5 rounded-full border ${turn === 'w' ? 'bg-white border-slate-300 shadow-xs' : 'bg-slate-900 border-white shadow-xs'}`} />
          <span className="text-white font-mono font-bold text-xs">
            {turnLabel}
          </span>
          {chess.inCheck() && (
            <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white font-black text-[9px] animate-pulse">
              CHECK
            </span>
          )}
        </div>

        {/* Top Right Quick Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              triggerHaptic('move');
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-black/60 border-slate-700 text-slate-500'
            }`}
            title={soundEnabled ? 'Sound ON' : 'Sound OFF'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowSettingsDrawer(true)}
            className="p-2 rounded-xl bg-black/75 border border-amber-400/80 text-amber-400 hover:text-white flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
            title="Settings & Themes"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. TOP OPPONENT PLAYER BAR (Black) - Rotated 180° in Face-to-Face Mode */}
      <div
        className={`w-full max-w-md mx-auto px-3 py-1 flex items-center justify-between text-xs z-20 shrink-0 transition-transform ${
          viewMode === 'face-to-face' ? 'rotate-180' : ''
        }`}
      >
        <div className="flex items-center gap-2 bg-black/75 border border-slate-700/80 px-2.5 py-1 rounded-xl shadow-xs">
          <div className={`w-6 h-6 rounded-lg bg-slate-900 border flex items-center justify-center text-sm ${turn === 'b' ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-slate-700'}`}>
            ♚
          </div>
          <div>
            <span className="text-white font-bold text-xs block leading-tight">
              {viewMode === 'face-to-face' ? 'Player 2' : (playAs === 'black' ? 'You (Black)' : 'Black')}
            </span>
            <span className="text-[10px] text-slate-400 block leading-none">
              {turn === 'b' ? 'Thinking...' : 'Waiting'}
            </span>
          </div>
        </div>

        {/* Captured Pieces by Black */}
        <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-lg border border-slate-800 min-h-[26px]">
          {capturedPieces.b.length > 0 ? (
            <div className="flex items-center gap-0.5 flex-wrap max-w-[150px]">
              {capturedPieces.b.map((p, idx) => (
                <span key={idx} className="text-white font-mono text-[11px] drop-shadow-xs">
                  {p === 'p' ? '♟' : p === 'n' ? '♞' : p === 'b' ? '♝' : p === 'r' ? '♜' : '♛'}
                </span>
              ))}
              {materialScore.blackAdvantage > 0 && (
                <span className="text-[10px] font-black text-emerald-400 font-mono ml-1">
                  +{materialScore.blackAdvantage}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[10px] text-slate-500 italic">No captures</span>
          )}
        </div>
      </div>

      {/* 3. CENTER CHESSBOARD (Maximized for Vertical Android Screen, Edge-to-Edge) */}
      <div className="flex-1 w-full flex items-center justify-center px-1.5 py-1 z-10 overflow-hidden">
        <div
          className="relative rounded-2xl overflow-hidden shadow-2xl transition-colors duration-200"
          style={{
            borderColor: activeTheme.border,
            borderWidth: 'min(10px, 2.2vw)',
            borderStyle: 'solid',
            width: 'min(calc(100vw - 12px), calc(100dvh - 220px))',
            height: 'min(calc(100vw - 12px), calc(100dvh - 220px))',
            aspectRatio: '1 / 1'
          }}
        >
          <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
            {ranks.map((rank, rankIdx) => {
              return files.map((file, fileIdx) => {
                const square = `${file}${rank}`;
                const isDark = (rankIdx + fileIdx) % 2 === 1;
                const piece = chess.get(square);
                const isSelected = selectedSquare === square;
                const isCheck = checkSquare === square;
                const isLastMoveSquare = lastMove && (lastMove.from === square || lastMove.to === square);
                const legalMoveTarget = helpEnabled && legalMoves.find(m => m.to === square);

                // Face-to-Face Rotation: Black pieces face top player
                const isRotated = viewMode === 'face-to-face' && piece && piece.color === 'b';
                const squareBg = isDark ? activeTheme.dark : activeTheme.light;

                return (
                  <div
                    key={square}
                    onClick={() => handleSquareClick(square)}
                    className="relative flex items-center justify-center cursor-pointer select-none transition-colors duration-150"
                    style={{ backgroundColor: squareBg }}
                  >
                    {/* Last Move Corner Brackets */}
                    {isLastMoveSquare && (
                      <div className="absolute inset-1 pointer-events-none z-20 flex flex-col justify-between">
                        <div className="flex justify-between">
                          <span className="w-2.5 h-2.5 border-t-2 border-l-2 border-white/95 rounded-tl-xs shadow-xs" />
                          <span className="w-2.5 h-2.5 border-t-2 border-r-2 border-white/95 rounded-tr-xs shadow-xs" />
                        </div>
                        <div className="flex justify-between">
                          <span className="w-2.5 h-2.5 border-b-2 border-l-2 border-white/95 rounded-bl-xs shadow-xs" />
                          <span className="w-2.5 h-2.5 border-b-2 border-r-2 border-white/95 rounded-br-xs shadow-xs" />
                        </div>
                      </div>
                    )}

                    {/* Selected Square Highlight */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-amber-400/40 ring-2 ring-amber-400 pointer-events-none z-10" />
                    )}

                    {/* In-Check King Glow */}
                    {isCheck && (
                      <div className="absolute inset-0 bg-rose-600/50 ring-4 ring-rose-500 animate-pulse pointer-events-none z-10" />
                    )}

                    {/* Legal Move Indicators (Distinguishes moves vs captures/en passant) */}
                    {legalMoveTarget && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                        {piece || legalMoveTarget.captured ? (
                          <div className="w-full h-full border-4 border-amber-400/90 rounded-full animate-pulse shadow-sm" />
                        ) : (
                          <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-amber-400/75 shadow-md ring-2 ring-amber-500/50" />
                        )}
                      </div>
                    )}

                    {/* Piece Rendering */}
                    {piece && (
                      <div
                        className={`z-10 transition-transform duration-200 transform ${
                          isRotated ? 'rotate-180 scale-100' : 'rotate-0'
                        } hover:scale-105 active:scale-95`}
                      >
                        <PieceIcon
                          piece={piece.type}
                          color={piece.color}
                          size={typeof window !== 'undefined' && window.innerWidth < 450 ? 38 : 48}
                        />
                      </div>
                    )}

                    {/* Coordinates */}
                    {rankIdx === 7 && (
                      <span
                        className={`absolute bottom-0.5 right-1 text-[9px] font-bold opacity-60 select-none pointer-events-none ${
                          isDark ? 'text-amber-100' : 'text-stone-900'
                        }`}
                      >
                        {file}
                      </span>
                    )}
                    {fileIdx === 0 && (
                      <span
                        className={`absolute top-0.5 left-1 text-[9px] font-bold opacity-60 select-none pointer-events-none ${
                          isDark ? 'text-amber-100' : 'text-stone-900'
                        }`}
                      >
                        {rank}
                      </span>
                    )}
                  </div>
                );
              });
            })}
          </div>
        </div>
      </div>

      {/* 4. BOTTOM USER PLAYER BAR (White) */}
      <div className="w-full max-w-md mx-auto px-3 py-1 flex items-center justify-between text-xs z-20 shrink-0">
        <div className="flex items-center gap-2 bg-black/75 border border-slate-700/80 px-2.5 py-1 rounded-xl shadow-xs">
          <div className={`w-6 h-6 rounded-lg bg-white border flex items-center justify-center text-sm ${turn === 'w' ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-slate-300'}`}>
            ♔
          </div>
          <div>
            <span className="text-white font-bold text-xs block leading-tight">
              {viewMode === 'face-to-face' ? 'Player 1' : (playAs === 'white' ? 'You (White)' : 'White')}
            </span>
            <span className="text-[10px] text-slate-400 block leading-none">
              {turn === 'w' ? 'Thinking...' : 'Waiting'}
            </span>
          </div>
        </div>

        {/* Captured Pieces by White */}
        <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-lg border border-slate-800 min-h-[26px]">
          {capturedPieces.w.length > 0 ? (
            <div className="flex items-center gap-0.5 flex-wrap max-w-[150px]">
              {capturedPieces.w.map((p, idx) => (
                <span key={idx} className="text-amber-200 font-mono text-[11px] drop-shadow-xs">
                  {p === 'p' ? '♟' : p === 'n' ? '♞' : p === 'b' ? '♝' : p === 'r' ? '♜' : '♛'}
                </span>
              ))}
              {materialScore.whiteAdvantage > 0 && (
                <span className="text-[10px] font-black text-amber-400 font-mono ml-1">
                  +{materialScore.whiteAdvantage}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[10px] text-slate-500 italic">No captures</span>
          )}
        </div>
      </div>

      {/* 5. BOTTOM HORIZONTAL ACTION BAR (Thumb-friendly control bar) */}
      <footer className="w-full max-w-md mx-auto px-3 pt-1.5 pb-3 flex items-center justify-around gap-2 z-30 shrink-0">
        {/* Restart / New Match */}
        <button
          onClick={() => setShowRestartConfirm(true)}
          className="flex-1 max-w-[70px] h-11 rounded-2xl bg-black/85 border border-amber-400/80 hover:border-amber-300 text-amber-400 flex flex-col items-center justify-center gap-0.5 shadow-lg active:scale-95 transition-transform cursor-pointer"
          title="Restart Match"
        >
          <RotateCw className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-wider">New</span>
        </button>

        {/* Undo Move */}
        <button
          onClick={handleUndo}
          disabled={moveHistory.length === 0}
          className={`flex-1 max-w-[70px] h-11 rounded-2xl bg-black/85 border flex flex-col items-center justify-center gap-0.5 shadow-lg transition-transform ${
            moveHistory.length > 0
              ? 'border-amber-400/80 text-amber-400 hover:border-amber-300 active:scale-95 cursor-pointer'
              : 'border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
          }`}
          title="Undo Move"
        >
          <Undo className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-wider">Undo</span>
        </button>

        {/* Legal Move Hints */}
        <button
          onClick={() => {
            setHelpEnabled(!helpEnabled);
            triggerHaptic('move');
          }}
          className={`flex-1 max-w-[70px] h-11 rounded-2xl border flex flex-col items-center justify-center gap-0.5 shadow-lg transition-transform cursor-pointer ${
            helpEnabled
              ? 'bg-amber-500/20 border-amber-400 text-amber-300 active:scale-95'
              : 'bg-black/85 border-slate-700/80 text-slate-500'
          }`}
          title="Toggle Legal Move Hints"
        >
          <Lightbulb className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-wider">Hints</span>
        </button>

        {/* Flip Board Orientation */}
        <button
          onClick={() => {
            setPlayAs(playAs === 'black' ? 'white' : 'black');
            triggerHaptic('move');
          }}
          className="flex-1 max-w-[70px] h-11 rounded-2xl bg-black/85 border border-amber-400/80 hover:border-amber-300 text-amber-400 flex flex-col items-center justify-center gap-0.5 shadow-lg active:scale-95 transition-transform cursor-pointer"
          title="Flip Board Orientation"
        >
          <span className="text-sm leading-none">🔁</span>
          <span className="text-[9px] font-black uppercase tracking-wider">Flip</span>
        </button>

        {/* Board Settings & Themes */}
        <button
          onClick={() => setShowSettingsDrawer(true)}
          className="flex-1 max-w-[70px] h-11 rounded-2xl bg-black/85 border border-amber-400/80 hover:border-amber-300 text-amber-400 flex flex-col items-center justify-center gap-0.5 shadow-lg active:scale-95 transition-transform cursor-pointer"
          title="Board Settings & Themes"
        >
          <Settings className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-wider">Themes</span>
        </button>
      </footer>

      {/* Settings Drawer */}
      {showSettingsDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in">
          {/* Backdrop close area */}
          <div className="flex-1" onClick={() => setShowSettingsDrawer(false)} />

          {/* Drawer container */}
          <div className="w-full max-w-md bg-slate-900/98 border-l border-slate-800 shadow-2xl h-full flex flex-col p-5 space-y-6 overflow-y-auto animate-slide-left">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-400">
                <Settings className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-extrabold uppercase tracking-wider text-white">Settings</h2>
              </div>
              <button
                onClick={() => setShowSettingsDrawer(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Row 1: Theme */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Theme</span>
              </div>

              <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
                {OFFLINE_THEMES.map((th) => {
                  const isSelected = themeId === th.id;
                  return (
                    <div
                      key={th.id}
                      onClick={() => {
                        setThemeId(th.id);
                        triggerHaptic('move');
                      }}
                      className={`relative w-24 h-16 rounded-xl border-2 cursor-pointer transition-all shrink-0 overflow-hidden flex flex-col justify-between p-1.5 ${
                        isSelected
                          ? 'border-emerald-400 ring-2 ring-emerald-400/40 scale-102 shadow-lg'
                          : 'border-slate-700 hover:border-slate-500'
                      }`}
                      style={{ backgroundColor: th.border }}
                    >
                      <div className="w-full h-8 rounded grid grid-cols-4 grid-rows-2 overflow-hidden border border-black/20">
                        {[0, 1, 0, 1, 1, 0, 1, 0].map((val, idx) => (
                          <div
                            key={idx}
                            style={{ backgroundColor: val === 0 ? th.previewLight : th.previewDark }}
                          />
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-bold text-white truncate">
                        <span className="truncate">{th.name.split(' ')[0]}</span>
                        {isSelected && (
                          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Row 2: View */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>View</span>
              </div>

              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                {[
                  { id: 'face-to-face', label: 'Face to Face' },
                  { id: 'auto-flip', label: 'Auto Flip' },
                  { id: '2d', label: '2D' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setViewMode(mode.id);
                      triggerHaptic('move');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === mode.id
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 3: Play As */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
                <User className="w-4 h-4 text-amber-400" />
                <span>Play As</span>
              </div>

              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                {[
                  { id: 'white', label: 'White' },
                  { id: 'black', label: 'Black' },
                  { id: 'by_turns', label: 'By turns' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setPlayAs(mode.id);
                      triggerHaptic('move');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      playAs === mode.id
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 4: Sound / Vibe */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>Sound/Vibe</span>
              </div>

              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => {
                    setSoundEnabled(true);
                    triggerHaptic('move');
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    soundEnabled ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'
                  }`}
                >
                  On
                </button>
                <button
                  onClick={() => setSoundEnabled(false)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !soundEnabled ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'
                  }`}
                >
                  Off
                </button>
              </div>
            </div>

            {/* Row 5: Help / Move Hints */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Hints</span>
              </div>

              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => {
                    setHelpEnabled(true);
                    triggerHaptic('move');
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    helpEnabled ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'
                  }`}
                >
                  On
                </button>
                <button
                  onClick={() => setHelpEnabled(false)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !helpEnabled ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'
                  }`}
                >
                  Off
                </button>
              </div>
            </div>

            {/* Row 6: Notification / Turn Alert */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Notification</span>
              </div>

              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => {
                    setNotificationEnabled(true);
                    triggerHaptic('move');
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    notificationEnabled ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'
                  }`}
                >
                  On
                </button>
                <button
                  onClick={() => setNotificationEnabled(false)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !notificationEnabled ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'
                  }`}
                >
                  Off
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowSettingsDrawer(false)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
