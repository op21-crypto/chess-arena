import { ALL_LESSONS } from '../../client/src/data/lessonsData.js';

export const CHESS_PUZZLES = [
  {
    id: 'puz_001',
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5',
    title: 'Bishop Sacrifice Attack',
    rating: 1250,
    theme: 'Attacking f7',
    description: 'Black left the f7 square weak. Find the devastating tactical blow.',
    turn: 'w',
    solution: ['c4f7', 'e8f7', 'f3e5'], // Bxf7+ Kxf7 Nxe5+
    hint: 'Target the weakest square on black board: f7.'
  },
  {
    id: 'puz_002',
    fen: 'r1b2rk1/pp3ppp/2n1p3/q2p4/3PnB2/P1PB1N2/2PQ1PPP/R3K2R w KQ - 4 11',
    title: 'The Greek Gift Sacrifice',
    rating: 1480,
    theme: 'Greek Gift',
    description: 'White has ideal piece coordination against the black king. Initiate the classic attack.',
    turn: 'w',
    solution: ['d3h7', 'g8h7', 'f3g5'],
    hint: 'Sacrifice the bishop on h7!'
  },
  {
    id: 'puz_003',
    fen: '6k1/5ppp/8/8/8/8/4QPPP/6K1 w - - 0 1',
    title: 'Back Rank Checkmate',
    rating: 900,
    theme: 'Back Rank Mate',
    description: 'The opposing king is trapped by its own pawns. Deliver checkmate.',
    turn: 'w',
    solution: ['e2e8'],
    hint: 'Checkmate on the 8th rank.'
  },
  {
    id: 'puz_004',
    fen: 'r1b1k2r/ppppqppp/2n5/4P3/1bP2Bn1/5N2/PP1NPPPP/R2QKB1R w KQkq - 4 7',
    title: 'Trapped Queen or Knight Fork',
    rating: 1350,
    theme: 'Fork',
    description: 'Find the tactic that wins material or stabilizes advantage.',
    turn: 'w',
    solution: ['a2a3', 'g4e5', 'a3b4'],
    hint: 'Put pressure on the bishop with a3.'
  },
  {
    id: 'puz_005',
    fen: 'r2qkb1r/pp2pppp/2n2n2/3p4/3P2b1/3BPN2/PP3PPP/RNBQK2R w KQkq - 1 7',
    title: 'Pin Exploitation',
    rating: 1100,
    theme: 'Pin',
    description: 'Break the pin or win tempo in the center.',
    turn: 'w',
    solution: ['d3b5', 'e7e6', 'b5c6'],
    hint: 'Develop the bishop with a pin.'
  },
  {
    id: 'puz_006',
    fen: '3r2k1/p4ppp/1p6/8/2Q5/8/PP3PPP/6K1 b - - 0 1',
    title: 'Counter Back Rank Mate',
    rating: 980,
    theme: 'Back Rank Mate',
    description: 'White ignored their own back rank vulnerabilities.',
    turn: 'b',
    solution: ['d8d1', 'c4f1', 'd1f1'],
    hint: 'Rook down to d1!'
  },
  {
    id: 'puz_007',
    fen: 'r1b2rk1/2q1bppp/p2p1n2/np2p3/4P3/1BN2N2/PPP2PPP/R1BQR1K1 w - - 0 12',
    title: 'Positional Outpost Knight',
    rating: 1600,
    theme: 'Outpost',
    description: 'Cement the knight on the strong central outpost.',
    turn: 'w',
    solution: ['c3d5', 'f6d5', 'b3d5'],
    hint: 'Nd5 seizes the central outpost.'
  },
  {
    id: 'puz_008',
    fen: 'r4rk1/ppp2ppp/2n5/3q4/3P4/5N2/PP1Q1PPP/R3R1K1 w - - 0 14',
    title: 'Central Dominance',
    rating: 1420,
    theme: 'Rook on Open File',
    description: 'Double rooks on the open e-file to apply immense pressure.',
    turn: 'w',
    solution: ['a1d1', 'f8e8', 'e1e8'],
    hint: 'Centralize rooks.'
  }
];

export const CHESS_LESSONS = ALL_LESSONS;
