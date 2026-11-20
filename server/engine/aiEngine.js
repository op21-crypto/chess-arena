import stockfishFactory from 'stockfish';
import { getLocalAIMove } from '../../client/src/utils/aiEngine.js';

class StockfishEngine {
  constructor() {
    this.engine = null;
    this.isReady = false;
    this.queue = [];
    this.currentTask = null;
    this.init();
  }

  init() {
    try {
      this.engine = stockfishFactory();
      this.engine.listener = (line) => {
        this.handleOutput(line);
      };
      this.sendCommand('uci');
      this.sendCommand('isready');
    } catch (err) {
      console.error('Error initializing Stockfish engine:', err);
    }
  }

  sendCommand(cmd) {
    if (this.engine && typeof this.engine.processCommand === 'function') {
      this.engine.processCommand(cmd);
    }
  }

  handleOutput(line) {
    if (line.includes('readyok')) {
      this.isReady = true;
      this.processNextInQueue();
      return;
    }

    if (this.currentTask) {
      this.currentTask.onLine(line);
    }
  }

  processNextInQueue() {
    if (this.currentTask || this.queue.length === 0 || !this.isReady) return;
    this.currentTask = this.queue.shift();
    this.currentTask.start();
  }

  // Get best move for a given FEN and AI difficulty level (1 to 5)
  getAIMove(fen, level = 2) {
    return new Promise((resolve) => {
      let isResolved = false;

      // Safety timeout: If Stockfish does not respond within 1200ms, use fast local minimax
      const timer = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          this.currentTask = null;
          const fallback = getLocalAIMove(fen, level);
          resolve(fallback || { from: 'e2', to: 'e4', uci: 'e2e4' });
          this.processNextInQueue();
        }
      }, 1200);

      // Skill level mapping (0 to 20 in UCI)
      const uciSkills = [0, 4, 10, 15, 20];
      const depths = [2, 4, 8, 12, 16];
      const skill = uciSkills[Math.max(0, Math.min(4, level - 1))];
      const depth = depths[Math.max(0, Math.min(4, level - 1))];

      let bestMove = null;

      const task = {
        start: () => {
          this.sendCommand(`setoption name Skill Level value ${skill}`);
          this.sendCommand(`position fen ${fen}`);
          this.sendCommand(`go depth ${depth}`);
        },
        onLine: (line) => {
          if (line.startsWith('bestmove') && !isResolved) {
            clearTimeout(timer);
            isResolved = true;
            const parts = line.split(' ');
            bestMove = parts[1];
            this.currentTask = null;
            resolve({
              from: bestMove.substring(0, 2),
              to: bestMove.substring(2, 4),
              promotion: bestMove.length > 4 ? bestMove.substring(4, 5) : undefined,
              uci: bestMove
            });
            this.processNextInQueue();
          }
        }
      };

      this.queue.push(task);
      this.processNextInQueue();
    });
  }

  // Evaluate a single position
  evaluatePosition(fen, depth = 8) {
    return new Promise((resolve) => {
      let score = 0;
      let mate = null;
      let bestMove = null;

      const task = {
        start: () => {
          this.sendCommand(`position fen ${fen}`);
          this.sendCommand(`go depth ${depth}`);
        },
        onLine: (line) => {
          if (line.includes('score cp')) {
            const match = line.match(/score cp (-?\d+)/);
            if (match) score = parseInt(match[1], 10) / 100;
          } else if (line.includes('score mate')) {
            const match = line.match(/score mate (-?\d+)/);
            if (match) mate = parseInt(match[1], 10);
          }

          if (line.startsWith('bestmove')) {
            const parts = line.split(' ');
            bestMove = parts[1];
            this.currentTask = null;
            resolve({
              eval: mate !== null ? (mate > 0 ? 100 : -100) : score,
              score,
              mate,
              bestMove
            });
            this.processNextInQueue();
          }
        }
      };

      this.queue.push(task);
      this.processNextInQueue();
    });
  }

  // Move-by-move game analysis with blunder detection and accuracy
  async analyzeGame(moves) {
    if (!moves || moves.length === 0) {
      return { evaluations: [], whiteAccuracy: 100, blackAccuracy: 100, summary: {} };
    }

    const evaluations = [];
    let prevEval = 0.2; // starting position slight advantage

    let whiteMistakes = 0, whiteBlunders = 0, whiteInaccuracies = 0;
    let blackMistakes = 0, blackBlunders = 0, blackInaccuracies = 0;
    let whiteTotalLoss = 0, blackTotalLoss = 0;
    let whiteMoveCount = 0, blackMoveCount = 0;

    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      const result = await this.evaluatePosition(move.fen, 6);
      
      const currentEval = result.score;
      const turn = move.color; // 'w' or 'b'
      
      // Calculate centipawn loss from previous position
      let cpLoss = 0;
      if (turn === 'w') {
        cpLoss = Math.max(0, prevEval - currentEval);
        whiteTotalLoss += cpLoss;
        whiteMoveCount++;
      } else {
        cpLoss = Math.max(0, currentEval - prevEval);
        blackTotalLoss += cpLoss;
        blackMoveCount++;
      }

      // Classification
      let judgment = 'good';
      if (cpLoss <= 0.2) {
        judgment = 'best';
      } else if (cpLoss <= 0.5) {
        judgment = 'excellent';
      } else if (cpLoss <= 1.0) {
        judgment = 'good';
      } else if (cpLoss <= 1.8) {
        judgment = 'inaccuracy';
        if (turn === 'w') whiteInaccuracies++; else blackInaccuracies++;
      } else if (cpLoss <= 3.0) {
        judgment = 'mistake';
        if (turn === 'w') whiteMistakes++; else blackMistakes++;
      } else {
        judgment = 'blunder';
        if (turn === 'w') whiteBlunders++; else blackBlunders++;
      }

      evaluations.push({
        moveIndex: i,
        san: move.san,
        color: move.color,
        eval: result.score,
        mate: result.mate,
        bestMove: result.bestMove,
        judgment,
        cpLoss: Number(cpLoss.toFixed(2))
      });

      prevEval = currentEval;
    }

    // Accurate CAPS style percentage
    const calcAccuracy = (totalLoss, count) => {
      if (count === 0) return 100;
      const avgLoss = totalLoss / count;
      // Formula mapping 0 loss -> 100%, 1.0 loss -> 75%, 2.5 loss -> 50%
      const acc = Math.max(25, Math.min(100, Math.round(103.1668 * Math.exp(-0.04354 * avgLoss * 10) - 3.1669)));
      return acc;
    };

    const whiteAccuracy = calcAccuracy(whiteTotalLoss, whiteMoveCount);
    const blackAccuracy = calcAccuracy(blackTotalLoss, blackMoveCount);

    return {
      evaluations,
      whiteAccuracy,
      blackAccuracy,
      summary: {
        white: { inaccuracies: whiteInaccuracies, mistakes: whiteMistakes, blunders: whiteBlunders },
        black: { inaccuracies: blackInaccuracies, mistakes: blackMistakes, blunders: blackBlunders }
      }
    };
  }
}

export const aiEngine = new StockfishEngine();
