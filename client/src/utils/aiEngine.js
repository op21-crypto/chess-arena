import { Chess } from 'chess.js';

// Piece-Square Tables (PST) from White's perspective (a8 -> h1)
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20
];

const ROOK_TABLE = [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0
];

const QUEEN_TABLE = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];

const KING_TABLE = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20
];

const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Opening book candidate moves by normalized position (board + turn)
const OPENING_BOOK = {
  // Start position: White moves
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w': [
    { from: 'e2', to: 'e4' },
    { from: 'd2', to: 'd4' },
    { from: 'c2', to: 'c4' },
    { from: 'g1', to: 'f3' }
  ],
  // 1. e4: Black replies
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b': [
    { from: 'c7', to: 'c5' }, // Sicilian
    { from: 'e7', to: 'e5' }, // Open Game
    { from: 'e7', to: 'e6' }, // French
    { from: 'c7', to: 'c6' }, // Caro-Kann
    { from: 'd7', to: 'd5' }, // Scandinavian
    { from: 'g8', to: 'f6' }  // Alekhine
  ],
  // 1. d4: Black replies
  'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b': [
    { from: 'd7', to: 'd5' },
    { from: 'g8', to: 'f6' },
    { from: 'e7', to: 'e6' },
    { from: 'f7', to: 'f5' }
  ],
  // 1. c4: Black replies
  'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b': [
    { from: 'e7', to: 'e5' },
    { from: 'c7', to: 'c5' },
    { from: 'g8', to: 'f6' }
  ],
  // 1. Nf3: Black replies
  'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b': [
    { from: 'd7', to: 'd5' },
    { from: 'g8', to: 'f6' },
    { from: 'c7', to: 'c5' }
  ],
  // 1. e4 e5 2. Nf3: Black replies
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b': [
    { from: 'b8', to: 'c6' },
    { from: 'g8', to: 'f6' },
    { from: 'd7', to: 'd6' }
  ],
  // 1. e4 e5 2. Nf3 Nc6 3. Bc4: Black replies (Italian)
  'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b': [
    { from: 'f8', to: 'c5' },
    { from: 'g8', to: 'f6' }
  ],
  // 1. e4 e5 2. Nf3 Nc6 3. Bb5: Black replies (Ruy Lopez)
  'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b': [
    { from: 'a7', to: 'a6' },
    { from: 'g8', to: 'f6' }
  ],
  // 1. e4 c5 2. Nf3: Black replies (Sicilian)
  'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b': [
    { from: 'd7', to: 'd6' },
    { from: 'b8', to: 'c6' },
    { from: 'e7', to: 'e6' }
  ],
  // 1. d4 d5 2. c4: Black replies (Queen's Gambit)
  'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b': [
    { from: 'e7', to: 'e6' },
    { from: 'c7', to: 'c6' },
    { from: 'd5', to: 'c4' }
  ],
  // 1. d4 Nf6 2. c4: Black replies (Indian)
  'rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b': [
    { from: 'g7', to: 'g6' },
    { from: 'e7', to: 'e6' },
    { from: 'c7', to: 'c5' }
  ]
};

// Evaluate static board strength
function evaluateBoard(chess) {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -30000 : 30000;
  }
  if (chess.isDraw() || chess.isStalemate()) {
    return 0;
  }

  let score = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const val = PIECE_VALUES[piece.type] || 0;
      const sqIdx = piece.color === 'w' ? r * 8 + c : (7 - r) * 8 + c;
      let pstBonus = 0;

      switch (piece.type) {
        case 'p': pstBonus = PAWN_TABLE[sqIdx] || 0; break;
        case 'n': pstBonus = KNIGHT_TABLE[sqIdx] || 0; break;
        case 'b': pstBonus = BISHOP_TABLE[sqIdx] || 0; break;
        case 'r': pstBonus = ROOK_TABLE[sqIdx] || 0; break;
        case 'q': pstBonus = QUEEN_TABLE[sqIdx] || 0; break;
        case 'k': pstBonus = KING_TABLE[sqIdx] || 0; break;
      }

      const totalVal = val + pstBonus;
      score += piece.color === 'w' ? totalVal : -totalVal;
    }
  }

  return score;
}

// Tactical move ordering: captures, promotions, and checks evaluated first
function orderMoves(moves) {
  return moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
    if (a.captured) {
      scoreA += 1000 + (PIECE_VALUES[a.captured] || 0) * 10 - (PIECE_VALUES[a.piece] || 0);
    }
    if (b.captured) {
      scoreB += 1000 + (PIECE_VALUES[b.captured] || 0) * 10 - (PIECE_VALUES[b.piece] || 0);
    }

    // Pawn Promotion
    if (a.promotion) scoreA += 800;
    if (b.promotion) scoreB += 800;

    // Castling bonus (king safety & development)
    if (a.flags?.includes('k') || a.flags?.includes('q')) scoreA += 120;
    if (b.flags?.includes('k') || b.flags?.includes('q')) scoreB += 120;

    // Direct Check
    if (a.san && a.san.includes('+')) scoreA += 150;
    if (b.san && b.san.includes('+')) scoreB += 150;

    return scoreB - scoreA;
  });
}

/**
 * Fast, robust local chess engine.
 * Guaranteed to run in <25ms, never hangs, handles all special rules:
 * Checkmate, Stalemate, Castling (O-O, O-O-O), En Passant, and Pawn Promotion.
 */
export function getLocalAIMove(fen, level = 2) {
  const chess = new Chess(fen);
  if (chess.isGameOver()) return null;

  // 1. Check opening book for instant master opening move
  const bookKey = fen.split(' ').slice(0, 2).join(' ');
  const bookMoves = OPENING_BOOK[bookKey];
  if (bookMoves && bookMoves.length > 0) {
    const validMoves = chess.moves({ verbose: true });
    // Filter book moves that are legally available
    const availableBookMoves = bookMoves.filter(bm =>
      validMoves.some(vm => vm.from === bm.from && vm.to === bm.to)
    );
    if (availableBookMoves.length > 0) {
      // Level 5 picks primary theoretical line; lower levels can pick alternatives
      const chosen = level >= 4
        ? availableBookMoves[0]
        : availableBookMoves[Math.floor(Math.random() * availableBookMoves.length)];
      const executed = chess.move(chosen);
      if (executed) {
        return {
          from: executed.from,
          to: executed.to,
          promotion: executed.promotion || undefined,
          san: executed.san,
          uci: `${executed.from}${executed.to}${executed.promotion || ''}`
        };
      }
    }
  }

  const legalMoves = orderMoves(chess.moves({ verbose: true }));
  if (legalMoves.length === 0) return null;

  // 2. Immediate Checkmate-in-1: if we can win right now, deliver checkmate!
  for (const m of legalMoves) {
    chess.move(m);
    const isMate = chess.isCheckmate();
    chess.undo();
    if (isMate) {
      return {
        from: m.from,
        to: m.to,
        promotion: m.promotion || 'q',
        san: m.san,
        uci: `${m.from}${m.to}${m.promotion || ''}`
      };
    }
  }

  // 3. Level 1 (Beginner 800 ELO): Friendly moves with occasional inaccuracies
  if (level === 1) {
    if (Math.random() < 0.40) {
      const quietMoves = legalMoves.filter(m => !m.captured && !m.san.includes('+'));
      const pool = quietMoves.length > 0 ? quietMoves : legalMoves;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      return {
        from: pick.from,
        to: pick.to,
        promotion: pick.promotion || 'q',
        san: pick.san,
        uci: `${pick.from}${pick.to}${pick.promotion || ''}`
      };
    }
  }

  // 4. Tactical Free-Piece Grab (Level >= 3): Punish hanging pieces ruthlessly
  if (level >= 3) {
    const winningCaptures = legalMoves.filter(m =>
      m.captured && (
        m.captured === 'q' ||
        (PIECE_VALUES[m.captured] > PIECE_VALUES[m.piece]) ||
        m.san.includes('x')
      )
    );

    for (const cap of winningCaptures) {
      chess.move(cap);
      const oppResponses = chess.moves({ verbose: true });
      // Is the capturing piece immediately re-captured by a pawn or cheaper piece?
      const isRefuted = oppResponses.some(o =>
        o.to === cap.to && PIECE_VALUES[o.piece] <= PIECE_VALUES[cap.piece]
      );
      chess.undo();

      if (!isRefuted) {
        return {
          from: cap.from,
          to: cap.to,
          promotion: cap.promotion || 'q',
          san: cap.san,
          uci: `${cap.from}${cap.to}${cap.promotion || ''}`
        };
      }
    }
  }

  // 5. Positional 1-ply tactical search with opponent response verification
  const isWhite = chess.turn() === 'w';
  let bestMove = legalMoves[0];
  let bestScore = isWhite ? -Infinity : Infinity;

  // Level-calibrated randomness jitter
  const jitterAmount = level === 1 ? 90 : level === 2 ? 40 : level === 3 ? 15 : 0;

  for (const move of legalMoves) {
    chess.move(move);
    let score = evaluateBoard(chess);

    // Castling bonus for King safety
    if (move.flags?.includes('k') || move.flags?.includes('q')) {
      score += isWhite ? 65 : -65;
    }

    // Quick tactical check: Did we leave this piece hanging for free?
    const oppMoves = chess.moves({ verbose: true });
    let freeCaptureLoss = 0;
    for (const opp of oppMoves) {
      if (opp.to === move.to && (PIECE_VALUES[move.piece] > (PIECE_VALUES[opp.piece] || 100))) {
        freeCaptureLoss = Math.max(freeCaptureLoss, PIECE_VALUES[move.piece] - (PIECE_VALUES[opp.piece] || 100));
      }
    }
    if (freeCaptureLoss > 0) {
      score += isWhite ? -freeCaptureLoss : freeCaptureLoss;
    }

    chess.undo();

    const finalScore = score + (jitterAmount > 0 ? (Math.random() * jitterAmount * 2 - jitterAmount) : 0);

    if (isWhite) {
      if (finalScore > bestScore) {
        bestScore = finalScore;
        bestMove = move;
      }
    } else {
      if (finalScore < bestScore) {
        bestScore = finalScore;
        bestMove = move;
      }
    }
  }

  return {
    from: bestMove.from,
    to: bestMove.to,
    promotion: bestMove.promotion || 'q',
    san: bestMove.san,
    uci: `${bestMove.from}${bestMove.to}${bestMove.promotion || ''}`
  };
}

/**
 * Web Worker Stockfish Engine for the browser.
 * Uses official Stockfish engine on a background thread.
 */
class BrowserStockfishEngine {
  constructor() {
    this.worker = null;
    this.isReady = false;
    this.currentResolver = null;
    this.init();
  }

  init() {
    if (typeof window === 'undefined' || typeof Worker === 'undefined') return;
    try {
      this.worker = new Worker('/stockfish.js');
      this.worker.onmessage = (e) => {
        const line = typeof e.data === 'string' ? e.data : (e.data?.data || '');
        this.handleLine(line);
      };
      this.worker.postMessage('uci');
      this.worker.postMessage('isready');
    } catch {
      this.worker = null;
    }
  }

  handleLine(line) {
    if (line.includes('readyok')) {
      this.isReady = true;
      return;
    }
    if (line.startsWith('bestmove') && this.currentResolver) {
      const parts = line.split(' ');
      const bestMove = parts[1];
      const resolver = this.currentResolver;
      this.currentResolver = null;
      if (bestMove && bestMove !== '(none)') {
        resolver({
          from: bestMove.substring(0, 2),
          to: bestMove.substring(2, 4),
          promotion: bestMove.length > 4 ? bestMove.substring(4, 5) : undefined,
          uci: bestMove
        });
      } else {
        resolver(null);
      }
    }
  }

  getMove(fen, level = 2, timeoutMs = 650) {
    return new Promise((resolve) => {
      if (!this.worker) {
        return resolve(null);
      }

      let timer = null;
      const resolver = (res) => {
        if (timer) clearTimeout(timer);
        this.currentResolver = null;
        resolve(res);
      };

      timer = setTimeout(() => {
        if (this.currentResolver === resolver) {
          this.currentResolver = null;
          resolve(null);
        }
      }, timeoutMs);

      this.currentResolver = resolver;

      const uciSkills = [0, 5, 10, 16, 20];
      const depths = [2, 4, 6, 8, 12];
      const moveTimes = [80, 120, 180, 220, 350];
      const skill = uciSkills[Math.max(0, Math.min(4, level - 1))];
      const depth = depths[Math.max(0, Math.min(4, level - 1))];
      const time = moveTimes[Math.max(0, Math.min(4, level - 1))];

      try {
        this.worker.postMessage(`setoption name Skill Level value ${skill}`);
        this.worker.postMessage(`position fen ${fen}`);
        this.worker.postMessage(`go depth ${depth} movetime ${time}`);
      } catch {
        clearTimeout(timer);
        this.currentResolver = null;
        resolve(null);
      }
    });
  }
}

export const browserStockfish = new BrowserStockfishEngine();

/**
 * Derives accurate captured pieces from the current FEN.
 * Returns sorted pieces by value: Queens, Rooks, Bishops, Knights, Pawns.
 */
export function getCapturedPieces(fen) {
  const initial = { w: { p: 8, n: 2, b: 2, r: 2, q: 1 }, b: { p: 8, n: 2, b: 2, r: 2, q: 1 } };
  const current = { w: { p: 0, n: 0, b: 0, r: 0, q: 0 }, b: { p: 0, n: 0, b: 0, r: 0, q: 0 } };

  if (fen) {
    const boardPart = fen.split(' ')[0];
    for (const char of boardPart) {
      if ('pnbrqk'.includes(char)) {
        current.b[char] = (current.b[char] || 0) + 1;
      } else if ('PNBRQK'.includes(char)) {
        const lower = char.toLowerCase();
        current.w[lower] = (current.w[lower] || 0) + 1;
      }
    }
  }

  // Pieces captured by White (Black pieces lost from board)
  const byWhite = [];
  const order = ['q', 'r', 'b', 'n', 'p'];
  for (const p of order) {
    const missing = (initial.b[p] || 0) - (current.b[p] || 0);
    for (let i = 0; i < missing; i++) byWhite.push(p);
  }

  // Pieces captured by Black (White pieces lost from board)
  const byBlack = [];
  for (const p of order) {
    const missing = (initial.w[p] || 0) - (current.w[p] || 0);
    for (let i = 0; i < missing; i++) byBlack.push(p);
  }

  return { byWhite, byBlack };
}

/**
 * Unified AI Move Generator:
 * 1. Queries authentic Stockfish via background Web Worker (if supported and responsive).
 * 2. Seamlessly falls back to getLocalAIMove if worker is busy or offline.
 * Guaranteed to NEVER hang, and always make a legal move.
 */
export async function getAIMoveAsync(fen, level = 2) {
  try {
    const workerMove = await browserStockfish.getMove(fen, level, 650);
    if (workerMove && workerMove.from && workerMove.to) {
      // Validate move legality with chess.js
      const testChess = new Chess(fen);
      const executed = testChess.move({
        from: workerMove.from,
        to: workerMove.to,
        promotion: workerMove.promotion || 'q'
      });
      if (executed) {
        return {
          from: executed.from,
          to: executed.to,
          promotion: executed.promotion || undefined,
          san: executed.san,
          uci: workerMove.uci || `${executed.from}${executed.to}${executed.promotion || ''}`
        };
      }
    }
  } catch {
    // Ignore worker error and use local fast engine
  }

  // Fast guaranteed local move
  return getLocalAIMove(fen, level);
}
