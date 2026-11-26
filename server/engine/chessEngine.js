import { Chess } from 'chess.js';

export class ChessGameSession {
  constructor({ id, whitePlayer, blackPlayer, timeControl, isRated = true, format = 'rapid', isRoom = false }) {
    this.id = id;
    this.isRoom = Boolean(isRoom);
    this.whitePlayer = whitePlayer; // { id, username, avatar, elo, country }
    this.blackPlayer = blackPlayer;
    this.chess = new Chess();
    this.isRated = isRated;
    this.format = format; // bullet, blitz, rapid, classical
    
    // Time control: { baseMinutes, incrementSeconds }
    this.baseMinutes = timeControl.baseMinutes || 10;
    this.incrementSeconds = timeControl.incrementSeconds || 0;

    // Remaining time in milliseconds
    this.whiteTime = this.baseMinutes * 60 * 1000;
    this.blackTime = this.baseMinutes * 60 * 1000;
    this.lastMoveTime = Date.now();
    this.timerStarted = false;

    // Game state
    this.status = 'active'; // 'active', 'checkmate', 'stalemate', 'draw', 'resigned', 'timeout', 'abandoned'
    this.winner = null; // 'white' | 'black' | 'draw'
    this.winReason = null;
    
    // Draw and Rematch negotiations
    this.drawOfferedBy = null; // 'white' | 'black'
    this.rematchRequestedBy = null;

    // Move history with full details
    this.moveHistory = []; // { from, to, piece, san, fen, timeSpent, captured }
    this.capturedPieces = { white: [], black: [] };
    this.spectators = new Map(); // socketId -> user info

    this.createdAt = new Date().toISOString();
  }

  startClock() {
    this.timerStarted = true;
    this.lastMoveTime = Date.now();
  }

  // Update clocks based on current time
  updateClocks() {
    if (!this.timerStarted || this.status !== 'active') return;

    const now = Date.now();
    const elapsed = now - this.lastMoveTime;
    const currentTurn = this.chess.turn(); // 'w' or 'b'

    if (currentTurn === 'w') {
      this.whiteTime = Math.max(0, this.whiteTime - elapsed);
      if (this.whiteTime === 0) {
        this.endGame('timeout', 'black', 'White ran out of time');
      }
    } else {
      this.blackTime = Math.max(0, this.blackTime - elapsed);
      if (this.blackTime === 0) {
        this.endGame('timeout', 'white', 'Black ran out of time');
      }
    }

    this.lastMoveTime = now;
  }

  // Make a move
  makeMove(moveObj, playerId) {
    this.updateClocks();
    if (this.status !== 'active') {
      return { success: false, error: 'Game is not active' };
    }

    const currentTurn = this.chess.turn();
    const isWhite = playerId === this.whitePlayer.id;
    const isBlack = playerId === this.blackPlayer.id;

    if ((currentTurn === 'w' && !isWhite) || (currentTurn === 'b' && !isBlack)) {
      return { success: false, error: 'Not your turn' };
    }

    try {
      // Execute move with chess.js
      const result = this.chess.move({
        from: moveObj.from,
        to: moveObj.to,
        promotion: moveObj.promotion || 'q'
      });

      if (!result) {
        return { success: false, error: 'Illegal move' };
      }

      if (!this.timerStarted) {
        this.startClock();
      } else {
        // Add increment to the player who just moved
        if (currentTurn === 'w') {
          this.whiteTime += this.incrementSeconds * 1000;
        } else {
          this.blackTime += this.incrementSeconds * 1000;
        }
      }

      // Track captured pieces
      if (result.captured) {
        if (result.color === 'w') {
          this.capturedPieces.white.push(result.captured);
        } else {
          this.capturedPieces.black.push(result.captured);
        }
      }

      // Record move
      this.moveHistory.push({
        from: result.from,
        to: result.to,
        piece: result.piece,
        color: result.color,
        san: result.san,
        captured: result.captured || null,
        fen: this.chess.fen(),
        timestamp: Date.now()
      });

      // Clear any pending draw offer on move
      this.drawOfferedBy = null;

      // Check game terminal states
      if (this.chess.isCheckmate()) {
        const winner = currentTurn === 'w' ? 'white' : 'black';
        this.endGame('checkmate', winner, `${winner === 'white' ? 'White' : 'Black'} wins by checkmate`);
      } else if (this.chess.isStalemate()) {
        this.endGame('stalemate', 'draw', 'Game drawn by stalemate');
      } else if (this.chess.isThreefoldRepetition()) {
        this.endGame('draw', 'draw', 'Game drawn by threefold repetition');
      } else if (this.chess.isInsufficientMaterial()) {
        this.endGame('draw', 'draw', 'Game drawn by insufficient material');
      } else if (this.chess.isDraw()) {
        this.endGame('draw', 'draw', 'Game drawn by 50-move rule');
      }

      return {
        success: true,
        move: result,
        fen: this.chess.fen(),
        inCheck: this.chess.inCheck(),
        status: this.status,
        winner: this.winner,
        winReason: this.winReason,
        whiteTime: this.whiteTime,
        blackTime: this.blackTime
      };
    } catch (err) {
      return { success: false, error: err.message || 'Invalid move' };
    }
  }

  resign(playerId) {
    if (this.status !== 'active') return;
    const isWhite = playerId === this.whitePlayer.id;
    const winner = isWhite ? 'black' : 'white';
    this.endGame('resigned', winner, `${isWhite ? 'White' : 'Black'} resigned`);
  }

  offerDraw(playerId) {
    if (this.status !== 'active') return false;
    const side = playerId === this.whitePlayer.id ? 'white' : 'black';
    this.drawOfferedBy = side;
    return true;
  }

  acceptDraw(playerId) {
    if (this.status !== 'active' || !this.drawOfferedBy) return false;
    const side = playerId === this.whitePlayer.id ? 'white' : 'black';
    if (side !== this.drawOfferedBy) {
      this.endGame('draw', 'draw', 'Draw agreed by mutual agreement');
      return true;
    }
    return false;
  }

  declineDraw(playerId) {
    const side = playerId === this.whitePlayer.id ? 'white' : 'black';
    if (side !== this.drawOfferedBy) {
      this.drawOfferedBy = null;
      return true;
    }
    return false;
  }

  endGame(status, winner, reason) {
    this.status = status;
    this.winner = winner;
    this.winReason = reason;
    this.endedAt = new Date().toISOString();
  }

  getState() {
    this.updateClocks();
    return {
      id: this.id,
      isRoom: this.isRoom,
      whitePlayer: this.whitePlayer,
      blackPlayer: this.blackPlayer,
      fen: this.chess.fen(),
      turn: this.chess.turn(),
      inCheck: this.chess.inCheck(),
      isGameOver: this.status !== 'active',
      status: this.status,
      winner: this.winner,
      winReason: this.winReason,
      whiteTime: this.whiteTime,
      blackTime: this.blackTime,
      timeControl: {
        baseMinutes: this.baseMinutes,
        incrementSeconds: this.incrementSeconds
      },
      format: this.format,
      isRated: this.isRated,
      moveHistory: this.moveHistory,
      capturedPieces: this.capturedPieces,
      drawOfferedBy: this.drawOfferedBy,
      rematchRequestedBy: this.rematchRequestedBy,
      spectatorCount: this.spectators.size
    };
  }

  // Calculate official Elo rating changes
  calculateEloChanges() {
    if (!this.isRated || !this.winner) {
      return { whiteDiff: 0, blackDiff: 0 };
    }

    const whiteElo = this.whitePlayer.elo || 1200;
    const blackElo = this.blackPlayer.elo || 1200;

    // Expected score
    const expectedWhite = 1 / (1 + Math.pow(10, (blackElo - whiteElo) / 400));
    const expectedBlack = 1 - expectedWhite;

    // Actual score
    let actualWhite = 0.5;
    let actualBlack = 0.5;
    if (this.winner === 'white') {
      actualWhite = 1;
      actualBlack = 0;
    } else if (this.winner === 'black') {
      actualWhite = 0;
      actualBlack = 1;
    }

    const getK = (rating) => {
      if (rating < 1600) return 32;
      if (rating < 2200) return 24;
      return 16;
    };

    const whiteK = getK(whiteElo);
    const blackK = getK(blackElo);

    const whiteDiff = Math.round(whiteK * (actualWhite - expectedWhite));
    const blackDiff = Math.round(blackK * (actualBlack - expectedBlack));

    return { whiteDiff, blackDiff };
  }
}
