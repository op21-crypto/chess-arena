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

export const CHESS_LESSONS = [
  {
    id: 'lesson_pieces_01',
    category: 'Beginner',
    title: 'The Royal Pieces: King & Queen',
    summary: 'Master the crown jewels of chess - the mighty Queen and the irreplaceable King.',
    steps: [
      {
        title: 'The King',
        content: 'The King can move one square in any direction (horizontal, vertical, diagonal). It is the most important piece: if your King is checkmated, you lose!',
        fen: '8/8/8/4K3/8/8/8/8 w - - 0 1',
        highlightSquares: ['d4', 'd5', 'd6', 'e4', 'e6', 'f4', 'f5', 'f6']
      },
      {
        title: 'The Queen',
        content: 'The Queen is the most powerful attacking piece! She can move any number of vacant squares in any direction: horizontally, vertically, or diagonally.',
        fen: '8/8/8/4Q3/8/8/8/8 w - - 0 1',
        highlightSquares: ['e1', 'e2', 'e3', 'e4', 'e6', 'e7', 'e8', 'a5', 'b5', 'c5', 'd5', 'f5', 'g5', 'h5', 'a1', 'b2', 'c3', 'd4', 'f6', 'g7', 'h8']
      }
    ]
  },
  {
    id: 'lesson_pieces_02',
    category: 'Beginner',
    title: 'The Army: Rooks, Bishops, Knights & Pawns',
    summary: 'Learn how the heavy artillery and minor pieces coordinate.',
    steps: [
      {
        title: 'The Rook',
        content: 'Rooks move in straight horizontal and vertical lines. They control open files and rank sweeps.',
        fen: '8/8/8/4R3/8/8/8/8 w - - 0 1',
        highlightSquares: ['e1', 'e2', 'e3', 'e4', 'e6', 'e7', 'e8', 'a5', 'b5', 'c5', 'd5', 'f5', 'g5', 'h5']
      },
      {
        title: 'The Bishop',
        content: 'Bishops move along diagonals. A light-squared bishop stays on light squares forever!',
        fen: '8/8/8/4B3/8/8/8/8 w - - 0 1',
        highlightSquares: ['a1', 'b2', 'c3', 'd4', 'f6', 'g7', 'h8', 'h2', 'g3', 'f4', 'd6', 'c7', 'b8']
      },
      {
        title: 'The Knight',
        content: 'The tricky Knight jumps in an L-shape (2 squares one way, 1 square perpendicular). It is the only piece that can jump over others!',
        fen: '8/8/8/4N3/8/8/8/8 w - - 0 1',
        highlightSquares: ['d7', 'f7', 'c6', 'g6', 'c4', 'g4', 'd3', 'f3']
      },
      {
        title: 'The Pawn & En Passant',
        content: 'Pawns move forward 1 square (or 2 squares on their first move) and capture diagonally 1 square forward. If a pawn reaches the 8th rank, it promotes!',
        fen: '8/4p3/8/3P4/8/8/8/8 w - - 0 1',
        highlightSquares: ['d6', 'e6']
      }
    ]
  },
  {
    id: 'lesson_openings_01',
    category: 'Openings',
    title: 'Classical Openings & Golden Principles',
    summary: 'The 3 golden rules: Control the Center, Develop Minor Pieces, Castle Early to safety.',
    steps: [
      {
        title: 'Italian Game (Giuoco Piano)',
        content: '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5. White aims for rapid kingside castling and eyes the tender f7 vulnerability.',
        fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4'
      },
      {
        title: 'Sicilian Defense',
        content: '1. e4 c5. Black immediately fights for central asymmetrical counterplay with the c-pawn.',
        fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2'
      },
      {
        title: "Queen's Gambit",
        content: '1. d4 d5 2. c4. White offers the c-pawn to divert black central d5 pawn and seize total center domination.',
        fen: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2'
      }
    ]
  },
  {
    id: 'lesson_checkmates_01',
    category: 'Checkmates',
    title: 'Essential Checkmate Patterns',
    summary: 'Recognize lethal checkmate geometric traps in your games.',
    steps: [
      {
        title: 'Back-Rank Mate',
        content: 'When the enemy king is blocked by its own pawns on f7, g7, and h7, a rook or queen on the 8th rank finishes the game instantly.',
        fen: '6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1'
      },
      {
        title: "Scholar's Mate",
        content: 'The 4-move attack targeting the fragile f7 square with Queen and Bishop coordination. Learn how to punish it and prevent it!',
        fen: 'r1bqkb1r/pppp1Qpp/2n5/4p3/2B1n3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4'
      },
      {
        title: 'Smothered Mate',
        content: 'A breathtaking checkmate where the Knight delivers check while the enemy king is completely choked by its own friendly pieces.',
        fen: '6rk/5Npp/8/8/8/8/8/7K w - - 0 1'
      }
    ]
  }
];
