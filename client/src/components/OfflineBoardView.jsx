import React, { useState, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import {
  ArrowLeft, RotateCw, Undo, Lightbulb, Settings, X, Check,
  Volume2, VolumeX, Eye, Camera, User, HelpCircle, Bell, Trophy
} from 'lucide-react';
import { PieceIcon } from './PieceIcons.jsx';
import { sound } from '../utils/audio.js';
import { triggerHaptic } from '../utils/device.js';

// Realistic wooden themes matching Screenshot 1 & 2
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
  const [moveHistory, setMoveHistory] = useState([]); // List of { from, to, san, piece, color, captured }
  const [lastMove, setLastMove] = useState(null); // { from, to }
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [promotionPending, setPromotionPending] = useState(null);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);

  // Offline Settings State (matching Screenshot 2)
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

      // Check if clicked square is a legal destination
      const validMove = legalMoves.find(m => m.to === square);
      if (validMove) {
        const isPromotion = validMove.piece === 'p' && (square.endsWith('8') || square.endsWith('1'));
        if (isPromotion) {
          setPromotionPending({ from: selectedSquare, to: square });
          return;
        }

        executeMove({ from: selectedSquare, to: square });
        return;
      }

      // If user clicked another own piece, switch selection
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

        // Audio & Haptics
        if (soundEnabled) {
          if (moveResult.captured) {
            sound.playCapture();
          } else if (chess.inCheck()) {
            sound.playCheck();
          } else {
            sound.playMove();
          }
        }
        if (notificationEnabled) {
          triggerHaptic(moveResult.captured ? 'capture' : 'move');
        }

        // Check for Game Over
        if (chess.isGameOver()) {
          setShowGameOverModal(true);
        }
      }
    } catch (err) {
      // Invalid move
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

  // Turn announcement text matching Screenshot 1: e.g. "4.White's Move"
  const moveNumber = Math.floor(moveHistory.length / 2) + 1;
  const turnLabel = `${moveNumber}.${turn === 'w' ? "White's Move" : "Black's Move"}`;

  return (
    <div
      className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden select-none"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl p-5 shadow-2xl flex flex-col items-center gap-4">
            <span className="text-sm font-black text-amber-400 uppercase tracking-wider">Promote Pawn</span>
            <div className="flex gap-3">
              {['q', 'r', 'b', 'n'].map((pType) => (
                <button
                  key={pType}
                  onClick={() => executeMove({ ...promotionPending, promotion: pType })}
                  className="p-3 bg-slate-800 hover:bg-amber-500/20 hover:border-amber-400 border border-slate-700 rounded-2xl transition-transform hover:scale-110 active:scale-95"
                >
                  <PieceIcon piece={pType} color={turn} size={48} />
                </button>
              ))}
            </div>
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
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleResetGame}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20"
              >
                New Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Dialog */}
      {showGameOverModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40 text-3xl">
              🏆
            </div>
            <div>
              <h3 className="text-xl font-black text-white">
                {chess.isCheckmate()
                  ? `Checkmate! ${turn === 'w' ? 'Black' : 'White'} Wins!`
                  : chess.isDraw()
                  ? 'Game Drawn!'
                  : 'Game Over!'}
              </h3>
              <p className="text-xs text-amber-300 mt-1">
                {chess.isCheckmate()
                  ? 'Official FIDE Checkmate Victory'
                  : chess.isStalemate()
                  ? 'Stalemate - No legal moves left'
                  : 'Match concluded'}
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowGameOverModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Review Board
              </button>
              <button
                onClick={handleResetGame}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Playing Area with Left Toolbar and Center Chessboard */}
      <div className="flex-1 flex items-center justify-center relative p-2 sm:p-4">
        {/* Left Circular Floating Toolbar (matching Screenshot 1) */}
        <div className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3.5 sm:gap-4 z-30">
          {/* 1. Back / Exit */}
          <button
            onClick={onBack}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/85 border-2 border-amber-400/90 text-amber-400 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
            title="Back to Home Screen"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* 2. Restart / New Match */}
          <button
            onClick={() => setShowRestartConfirm(true)}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/85 border-2 border-amber-400/90 text-amber-400 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
            title="Restart Match"
          >
            <RotateCw className="w-5 h-5" />
          </button>

          {/* 3. Undo Move */}
          <button
            onClick={handleUndo}
            disabled={moveHistory.length === 0}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/85 border-2 flex items-center justify-center shadow-2xl transition-all ${
              moveHistory.length > 0
                ? 'border-amber-400/90 text-amber-400 hover:scale-110 active:scale-95 cursor-pointer'
                : 'border-slate-700/60 text-slate-600 opacity-40 cursor-not-allowed'
            }`}
            title="Undo Move"
          >
            <Undo className="w-5 h-5" />
          </button>

          {/* 4. Help / Toggle Legal Moves */}
          <button
            onClick={() => {
              setHelpEnabled(!helpEnabled);
              triggerHaptic('move');
            }}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/85 border-2 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all ${
              helpEnabled
                ? 'border-amber-400 text-amber-300 shadow-amber-500/20'
                : 'border-slate-700/80 text-slate-500'
            }`}
            title={helpEnabled ? 'Legal Moves Hints ON' : 'Legal Moves Hints OFF'}
          >
            <Lightbulb className="w-5 h-5" />
          </button>

          {/* 5. Settings Gear (Opens Screenshot 2 Drawer) */}
          <button
            onClick={() => setShowSettingsDrawer(true)}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/85 border-2 border-amber-400/90 text-amber-400 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
            title="Board Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Center Chessboard Container (Matching Screenshot 1 & 2) */}
        <div className="flex flex-col items-center justify-center my-auto ml-12 sm:ml-0">
          <div
            className="relative rounded-2xl overflow-hidden shadow-2xl border-8 sm:border-12 transition-colors duration-200"
            style={{
              borderColor: activeTheme.border,
              width: 'min(calc(100vw - 80px), 520px)',
              height: 'min(calc(100vw - 80px), 520px)',
              aspectRatio: '1 / 1'
            }}
          >
            {/* Outer Wood Bevel Frame Accent */}
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

                  // Face-to-Face Rotation Logic (matching Screenshot 1: Black pieces face top player!)
                  const isRotated = viewMode === 'face-to-face' && piece && piece.color === 'b';

                  const squareBg = isDark ? activeTheme.dark : activeTheme.light;

                  return (
                    <div
                      key={square}
                      onClick={() => handleSquareClick(square)}
                      className="relative flex items-center justify-center cursor-pointer select-none transition-colors duration-150"
                      style={{ backgroundColor: squareBg }}
                    >
                      {/* Last Move Corner Brackets (Exact feature shown in Screenshot 1!) */}
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

                      {/* Legal Move Indicators */}
                      {legalMoveTarget && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                          {piece ? (
                            <div className="w-full h-full border-4 border-amber-400/80 rounded-full animate-pulse" />
                          ) : (
                            <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-amber-400/70 shadow-md ring-2 ring-amber-500/50" />
                          )}
                        </div>
                      )}

                      {/* Piece Rendering (With Face-to-Face rotation if enabled!) */}
                      {piece && (
                        <div
                          className={`z-10 transition-transform duration-200 transform ${
                            isRotated ? 'rotate-180 scale-100' : 'rotate-0'
                          } hover:scale-105 active:scale-95`}
                        >
                          <PieceIcon
                            piece={piece.type}
                            color={piece.color}
                            size={typeof window !== 'undefined' && window.innerWidth < 450 ? 36 : 48}
                          />
                        </div>
                      )}

                      {/* Coordinates (A-H on bottom/top rank, 1-8 on left/right edge) */}
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
      </div>

      {/* Bottom Bar matching Screenshot 1 ("Two Players" on left, Move indicator on right) */}
      <div className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold z-20">
        {/* Left Badge: "Two Players" */}
        <div className="px-3.5 py-1.5 rounded-xl bg-black/75 border border-slate-700/60 text-slate-300 font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Two Players</span>
        </div>

        {/* Right Info: Turn Status + Captured Pieces (e.g. "4.White's Move") */}
        <div className="flex items-center gap-3 bg-black/75 border border-slate-700/60 px-4 py-1.5 rounded-xl shadow-lg backdrop-blur-xs">
          {/* Small Captured Pieces Indicator */}
          {capturedPieces[turn === 'w' ? 'w' : 'b'].length > 0 && (
            <div className="flex items-center gap-0.5 text-slate-400 text-xs mr-1">
              <span>+{capturedPieces[turn === 'w' ? 'w' : 'b'].length}</span>
              <span className="text-[10px]">♟</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-white font-mono font-bold text-xs">
            <span className={`w-2.5 h-2.5 rounded-full border ${turn === 'w' ? 'bg-white border-slate-400' : 'bg-slate-900 border-white'}`} />
            <span>{turnLabel}</span>
          </div>
        </div>
      </div>

      {/* Settings Drawer (Exact replica of Screenshot 2) */}
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
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Row 1: Theme (Horizontal scroll of board styles with checkmark) */}
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
                      {/* Mini chessboard pattern */}
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

            {/* Row 2: View (Face-to-Face | Auto Flip | Standard 2D) */}
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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

            {/* Row 3: Play As (White | Black | By turns) */}
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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

            {/* Row 4: Sound / Vibe (On | Off) */}
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
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    soundEnabled ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'
                  }`}
                >
                  On
                </button>
                <button
                  onClick={() => setSoundEnabled(false)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    !soundEnabled ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'
                  }`}
                >
                  Off
                </button>
              </div>
            </div>

            {/* Row 5: Help / Move Hints (On | Off) */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Help</span>
              </div>

              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => {
                    setHelpEnabled(true);
                    triggerHaptic('move');
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    helpEnabled ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'
                  }`}
                >
                  On
                </button>
                <button
                  onClick={() => setHelpEnabled(false)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    !helpEnabled ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'
                  }`}
                >
                  Off
                </button>
              </div>
            </div>

            {/* Row 6: Notification / Turn Alert (On | Off) */}
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
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    notificationEnabled ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'
                  }`}
                >
                  On
                </button>
                <button
                  onClick={() => setNotificationEnabled(false)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95"
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
