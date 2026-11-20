import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { PieceIcon, BOARD_THEMES } from './PieceIcons.jsx';
import { sound } from '../utils/audio.js';
import { triggerHaptic } from '../utils/device.js';

export function Chessboard({
  fen,
  onMove,
  playerColor = 'w', // 'w' | 'b' | 'spectator'
  flipped = false,
  boardTheme = 'cappuccino',
  pieceTheme = 'alexander',
  inCheck = false,
  lastMove = null,
  disabled = false,
  // Game Option toggles from Settings
  highlightSquares = [],
  showLegalMoves = true,
  highlightLastMove = true,
  showCoordinates = true,
  kingInCheckIndicator = true,
  alwaysPromoteToQueen = false,
  enablePremoves = true
}) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [promotionPending, setPromotionPending] = useState(null); // { from, to }
  const [premove, setPremove] = useState(null); // { from, to }

  let chess = null;
  try {
    chess = new Chess(fen);
  } catch (e) {
    chess = null;
  }

  // Parse board pieces directly as fallback for incomplete educational FENs
  const boardPieces = React.useMemo(() => {
    const pieces = {};
    if (!fen) return pieces;
    const boardPart = fen.split(' ')[0];
    const rows = boardPart.split('/');
    const filesList = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    for (let r = 0; r < 8; r++) {
      const rank = 8 - r;
      const row = rows[r] || '8';
      let fIdx = 0;
      for (const char of row) {
        if (char >= '1' && char <= '8') {
          fIdx += parseInt(char, 10);
        } else {
          const file = filesList[fIdx];
          if (file) {
            const isWhite = char === char.toUpperCase();
            pieces[`${file}${rank}`] = {
              type: char.toLowerCase(),
              color: isWhite ? 'w' : 'b'
            };
          }
          fIdx++;
        }
      }
    }
    return pieces;
  }, [fen]);

  const theme = BOARD_THEMES[boardTheme] || BOARD_THEMES.cappuccino;

  // Determine board orientation
  const isFlipped = playerColor === 'b' ? !flipped : flipped;

  // Ranks and files based on orientation
  const files = isFlipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = isFlipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];

  // Clear selection if fen changes & execute premove if queued
  useEffect(() => {
    setSelectedSquare(null);
    setLegalMoves([]);

    // Check if queued premove is now valid and playable
    if (premove && chess && chess.turn() === playerColor) {
      const moves = chess.moves({ square: premove.from, verbose: true });
      const valid = moves.find(m => m.to === premove.to);
      if (valid) {
        const isPromotion = valid.piece === 'p' && (premove.to.endsWith('8') || premove.to.endsWith('1'));
        executeMove({
          from: premove.from,
          to: premove.to,
          promotion: isPromotion ? 'q' : 'q'
        });
      }
      setPremove(null);
    }
  }, [fen]);

  // Find King square for check highlight
  let checkSquare = null;
  if (inCheck && kingInCheckIndicator && chess) {
    const turn = chess.turn();
    for (let r = 1; r <= 8; r++) {
      for (const f of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
        const sq = `${f}${r}`;
        const p = chess.get(sq);
        if (p && p.type === 'k' && p.color === turn) {
          checkSquare = sq;
          break;
        }
      }
      if (checkSquare) break;
    }
  }

  const handleSquareClick = (square) => {
    if (disabled || playerColor === 'spectator' || !chess) return;

    const pieceAtSquare = chess.get(square);
    const isPlayerTurn = chess.turn() === playerColor;

    // Handle premove input when not player turn
    if (!isPlayerTurn && enablePremoves) {
      if (pieceAtSquare && pieceAtSquare.color === playerColor) {
        setSelectedSquare(square);
      } else if (selectedSquare) {
        setPremove({ from: selectedSquare, to: square });
        setSelectedSquare(null);
        triggerHaptic('move');
      }
      return;
    }

    if (!isPlayerTurn) return;

    // 1. If clicking on one's own piece, select it and compute legal moves
    if (pieceAtSquare && pieceAtSquare.color === playerColor) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setLegalMoves([]);
      } else {
        setSelectedSquare(square);
        const moves = chess.moves({ square, verbose: true });
        setLegalMoves(moves);
      }
      return;
    }

    // 2. If a piece was selected and clicking on a target destination
    if (selectedSquare) {
      const matchMove = legalMoves.find(m => m.to === square);
      if (matchMove) {
        const selectedPiece = chess.get(selectedSquare);
        const isPromotion = selectedPiece?.type === 'p' && (square.endsWith('8') || square.endsWith('1'));

        if (isPromotion && !alwaysPromoteToQueen) {
          setPromotionPending({ from: selectedSquare, to: square });
        } else {
          executeMove({ from: selectedSquare, to: square, promotion: 'q' });
        }
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    }
  };

  const executeMove = ({ from, to, promotion = 'q' }) => {
    setSelectedSquare(null);
    setLegalMoves([]);
    setPromotionPending(null);

    const moveObj = { from, to, promotion };
    const tempChess = new Chess(fen);
    const result = tempChess.move(moveObj);

    if (result) {
      // Trigger haptic and sound
      if (result.captured) {
        sound.playCapture();
        triggerHaptic('capture');
      } else if (result.san.includes('O-O')) {
        sound.playCastle();
        triggerHaptic('move');
      } else {
        sound.playMove();
        triggerHaptic('move');
      }

      if (tempChess.inCheck()) {
        setTimeout(() => {
          sound.playCheck();
          triggerHaptic('check');
        }, 60);
      }

      if (onMove) {
        onMove(moveObj);
      }
    }
  };

  return (
    <div className="relative select-none flex flex-col items-center">
      {/* Promotion Modal Overlay */}
      {promotionPending && (
        <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-xl p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-2xl shadow-2xl flex flex-col items-center gap-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Promote Pawn</span>
            <div className="flex gap-2">
              {['q', 'r', 'b', 'n'].map((pType) => (
                <button
                  key={pType}
                  onClick={() => executeMove({ ...promotionPending, promotion: pType })}
                  className="p-3 bg-slate-800 hover:bg-amber-500/20 hover:border-amber-400 border border-slate-700 rounded-xl transition-all duration-150 transform hover:scale-105 active:scale-95"
                >
                  <PieceIcon piece={pType} color={playerColor === 'b' ? 'b' : 'w'} size={44} theme={pieceTheme} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chessboard Grid Container */}
      <div 
        className="w-full max-w-[520px] aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 transition-colors duration-200"
        style={{ borderColor: theme.border }}
      >
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
          {ranks.map((rank, rankIdx) => {
            return files.map((file, fileIdx) => {
              const square = `${file}${rank}`;
              const isDark = (rankIdx + fileIdx) % 2 === 1;
              const piece = chess ? chess.get(square) : boardPieces[square];
              const isSelected = selectedSquare === square;
              const isLastMove = highlightLastMove && lastMove && (lastMove.from === square || lastMove.to === square);
              const isCheck = isCheckSquare(checkSquare, square);
              const isPremoveSquare = premove && (premove.from === square || premove.to === square);
              const legalMoveTarget = showLegalMoves && legalMoves.find(m => m.to === square);
              const isCustomHighlight = highlightSquares && highlightSquares.includes(square);

              let bgColor = isDark ? theme.dark : theme.light;

              return (
                <div
                  key={square}
                  onClick={() => handleSquareClick(square)}
                  className="relative flex items-center justify-center cursor-pointer transition-colors duration-150"
                  style={{ backgroundColor: bgColor }}
                >
                  {/* Custom Educational Highlight */}
                  {isCustomHighlight && (
                    <div className="absolute inset-0 bg-sky-400/40 ring-2 ring-sky-500 pointer-events-none z-10 animate-pulse" />
                  )}

                  {/* Last Move Indicator */}
                  {isLastMove && (
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{ backgroundColor: theme.highlight }}
                    />
                  )}

                  {/* Selected Square Glow */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-amber-400/50 ring-2 ring-amber-400 pointer-events-none" />
                  )}

                  {/* Premove Highlight (Rose Red glow from Screenshot 6) */}
                  {isPremoveSquare && (
                    <div className="absolute inset-0 bg-rose-500/40 ring-2 ring-rose-500 pointer-events-none" />
                  )}

                  {/* In-Check King Glow */}
                  {isCheck && (
                    <div className="absolute inset-0 in-check-glow pointer-events-none" />
                  )}

                  {/* Legal Move Indicators */}
                  {legalMoveTarget && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      {piece ? (
                        <div className="w-full h-full border-4 border-amber-400/80 rounded-full animate-pulse" />
                      ) : (
                        <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-slate-900/40 backdrop-blur-xs shadow-inner" />
                      )}
                    </div>
                  )}

                  {/* Piece Rendering */}
                  {piece && (
                    <div className="z-10 transition-transform duration-150 transform hover:scale-105 active:scale-95">
                      <PieceIcon 
                        piece={piece.type} 
                        color={piece.color} 
                        size={typeof window !== 'undefined' && window.innerWidth < 450 ? 36 : 48} 
                        theme={pieceTheme} 
                      />
                    </div>
                  )}

                  {/* File & Rank Coordinate Labels (Toggleable) */}
                  {showCoordinates && rankIdx === 7 && (
                    <span 
                      className="absolute bottom-0.5 right-1 text-[9px] md:text-[10px] font-bold opacity-60 select-none pointer-events-none"
                      style={{ color: isDark ? theme.light : theme.dark }}
                    >
                      {file}
                    </span>
                  )}
                  {showCoordinates && fileIdx === 0 && (
                    <span 
                      className="absolute top-0.5 left-1 text-[9px] md:text-[10px] font-bold opacity-60 select-none pointer-events-none"
                      style={{ color: isDark ? theme.light : theme.dark }}
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
  );
}

function isCheckSquare(checkSquare, square) {
  return checkSquare === square;
}
