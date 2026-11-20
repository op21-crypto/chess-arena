// Comprehensive Chess Puzzle Database
// Features themes, openings, categories, and positions matching Lichess tactics trainer suite

export const THEME_CATEGORIES = [
  {
    id: 'phases',
    name: 'Phases',
    description: 'Puzzles categorized by the stage of the game.',
    items: [
      { id: 'opening', name: 'Opening', count: 326237, desc: 'A tactic during the first phase of the game.' },
      { id: 'middlegame', name: 'Middlegame', count: 2967501, desc: 'A tactic during the second phase of the game.' },
      { id: 'endgame', name: 'Endgame', count: 3224080, desc: 'A tactic during the last phase of the game.' },
      { id: 'rook-endgame', name: 'Rook endgame', count: 342460, desc: 'An endgame with only rooks and pawns.' },
      { id: 'bishop-endgame', name: 'Bishop endgame', count: 86847, desc: 'An endgame with only bishops and pawns.' },
      { id: 'pawn-endgame', name: 'Pawn endgame', count: 232639, desc: 'An endgame with only pawns.' },
      { id: 'knight-endgame', name: 'Knight endgame', count: 52750, desc: 'An endgame with only knights and pawns.' },
      { id: 'queen-endgame', name: 'Queen endgame', count: 74401, desc: 'An endgame with only queens and pawns.' },
      { id: 'queen-rook', name: 'Queen and Rook', count: 65120, desc: 'An endgame with queens, rooks, and pawns.' }
    ]
  },
  {
    id: 'motifs',
    name: 'Motifs',
    description: 'Fundamental tactical weapons and piece combinations.',
    items: [
      { id: 'advanced-pawn', name: 'Advanced pawn', count: 396201, desc: 'One of your pawns is deep into the opponent position, maybe threatening to promote.' },
      { id: 'attacking-f2-f7', name: 'Attacking f2 or f7', count: 47152, desc: 'An attack focusing on the f2 or f7 pawn, such as in the fried liver opening.' },
      { id: 'capture-defender', name: 'Capture the defender', count: 43912, desc: 'Removing a piece that is critical to defense of another piece, allowing the now undefended piece to be captured on a following move.' },
      { id: 'discovered-attack', name: 'Discovered attack', count: 334703, desc: 'Moving a piece that previously blocked an attack by another long range piece, such as a knight out of the way of a rook.' },
      { id: 'double-check', name: 'Double check', count: 33887, desc: 'Checking with two pieces at once, as a result of a discovered attack where both the moving piece and the unveiled piece attack the opponent\'s king.' },
      { id: 'exposed-king', name: 'Exposed king', count: 193291, desc: 'A tactic involving a king with few defenders around it, often leading to checkmate.' },
      { id: 'fork', name: 'Fork', count: 1482010, desc: 'A move where a single piece attacks two or more enemy pieces simultaneously.' },
      { id: 'pin', name: 'Pin', count: 982310, desc: 'An attack on a piece that cannot move without exposing a more valuable piece behind it.' },
      { id: 'skewer', name: 'Skewer', count: 215400, desc: 'An attack on a valuable piece, compelling it to move and allowing a lesser piece behind it to be captured.' },
      { id: 'trapped-piece', name: 'Trapped piece', count: 341200, desc: 'A piece is surrounded or cornered and unable to escape capture.' }
    ]
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'Sophisticated tactical themes and dynamic sacrifices.',
    items: [
      { id: 'attraction', name: 'Attraction', count: 231812, desc: 'An exchange or sacrifice encouraging or forcing an opponent piece to a square that allows a follow-up tactic.' },
      { id: 'clearance', name: 'Clearance', count: 84005, desc: 'A move, often with tempo, that clears a square, file or diagonal for a follow-up tactical idea.' },
      { id: 'collinear-move', name: 'Collinear move', count: 7895, desc: 'Two opposing pieces face each other, and one slides along the line of attack without capturing the enemy piece.' },
      { id: 'discovered-check', name: 'Discovered check', count: 108802, desc: 'Move a piece to reveal a check from a hidden attacking piece, which often leads to a decisive advantage.' },
      { id: 'defensive-move', name: 'Defensive move', count: 387724, desc: 'A precise move or sequence of moves that is needed to avoid losing material or another advantage.' },
      { id: 'deflection', name: 'Deflection', count: 280026, desc: 'A move that distracts an opposing piece from another duty that it performs, such as guarding a key square.' },
      { id: 'intermezzo', name: 'Intermezzo', count: 142090, desc: 'An in-between move played before the expected continuation that turns the tables.' },
      { id: 'quiet-move', name: 'Quiet move', count: 94310, desc: 'A non-checking, non-capturing move that sets up an inescapable threat.' },
      { id: 'x-ray-attack', name: 'X-Ray attack', count: 112450, desc: 'A long-range piece attacking or defending through an enemy piece along the line.' },
      { id: 'zugzwang', name: 'Zugzwang', count: 52180, desc: 'A situation in which any move the player makes will worsen their position.' }
    ]
  },
  {
    id: 'mates',
    name: 'Mates',
    description: 'Checkmate calculations by exact move depth.',
    items: [
      { id: 'checkmate', name: 'Checkmate', count: 2012844, desc: 'Win the game with style.' },
      { id: 'mate-in-1', name: 'Mate in 1', count: 931353, desc: 'Deliver checkmate in one move.' },
      { id: 'mate-in-2', name: 'Mate in 2', count: 840147, desc: 'Deliver checkmate in two moves.' },
      { id: 'mate-in-3', name: 'Mate in 3', count: 204736, desc: 'Deliver checkmate in three moves.' },
      { id: 'mate-in-4', name: 'Mate in 4', count: 30119, desc: 'Deliver checkmate in four moves.' },
      { id: 'mate-in-5', name: 'Mate in 5 or more', count: 6482, desc: 'Figure out a long mating sequence.' }
    ]
  },
  {
    id: 'mate_themes',
    name: 'Mate themes',
    description: 'Famous patterns and checkmating motifs throughout chess history.',
    items: [
      { id: 'anastasias-mate', name: "Anastasia's mate", count: 7716, desc: 'A knight and rook or queen team up to trap the opposing king between the side of the board and a friendly piece.' },
      { id: 'arabian-mate', name: 'Arabian mate', count: 7745, desc: 'A knight and a rook team up to trap the opposing king on a corner of the board.' },
      { id: 'back-rank-mate', name: 'Back rank mate', count: 213480, desc: 'Checkmate the king on the home rank, when it is trapped there by its own pieces.' },
      { id: 'balestra-mate', name: 'Balestra mate', count: 1368, desc: 'A bishop delivers the checkmate, while a queen blocks the remaining escape squares.' },
      { id: 'blind-swine-mate', name: 'Blind Swine mate', count: 6361, desc: 'Two rooks team up to mate the king in an area of 2 by 2 squares.' },
      { id: 'bodens-mate', name: "Boden's mate", count: 3854, desc: 'Two attacking bishops on criss-crossing diagonals deliver mate to a king obstructed by friendly pieces.' },
      { id: 'corner-mate', name: 'Corner mate', count: 10780, desc: 'Confine the king to the corner.' },
      { id: 'smothered-mate', name: 'Smothered mate', count: 18450, desc: 'A checkmate delivered by a knight where the king is unable to move because it is boxed in by its own pieces.' },
      { id: 'hook-mate', name: 'Hook mate', count: 14210, desc: 'A rook, knight, and pawn cooperate to trap the opponent king along the edge.' },
      { id: 'opera-mate', name: 'Opera mate', count: 4890, desc: 'Checkmating with a rook backed by a bishop along an open rank or file.' }
    ]
  },
  {
    id: 'special_moves',
    name: 'Special moves',
    description: 'Puzzles requiring special rules of chess.',
    items: [
      { id: 'castling', name: 'Castling', count: 2693, desc: 'Bring the king to safety, and deploy the rook for attack.' },
      { id: 'en-passant-rights', name: 'En passant rights', count: 9068, desc: 'A tactic involving the en passant rule, where a pawn can capture an opposing pawn that has just moved next to it with its initial two-square move.' },
      { id: 'promotion', name: 'Promotion', count: 154327, desc: 'Promote one of your pawns to a queen, rook or minor piece.' },
      { id: 'underpromotion', name: 'Underpromotion', count: 1197, desc: 'Promotion to a knight, bishop, or rook.' }
    ]
  },
  {
    id: 'goals',
    name: 'Goals',
    description: 'Objectives of tactical sequences.',
    items: [
      { id: 'equality', name: 'Equality', count: 43033, desc: 'Come back from a losing position, and secure a draw or a balanced position. (eval <= 200cp)' },
      { id: 'advantage', name: 'Advantage', count: 1913223, desc: 'Seize your chance to get a decisive advantage. (200cp <= eval <= 600cp)' },
      { id: 'crushing', name: 'Crushing', count: 2494728, desc: 'Spot the opponent blunder to obtain a crushing advantage. (eval >= 600cp)' },
      { id: 'checkmate-goal', name: 'Checkmate', count: 2012844, desc: 'Win the game with style.' }
    ]
  },
  {
    id: 'lengths',
    name: 'Lengths',
    description: 'Puzzles categorized by number of moves to solution.',
    items: [
      { id: 'one-move-puzzle', name: 'One-move puzzle', count: 978624, desc: 'A puzzle that is only one move long.' },
      { id: 'short-puzzle', name: 'Short puzzle', count: 3299517, desc: 'Two moves to win.' },
      { id: 'long-puzzle', name: 'Long puzzle', count: 1662841, desc: 'Three moves to win.' },
      { id: 'very-long-puzzle', name: 'Very long puzzle', count: 522827, desc: 'Four moves or more to win.' }
    ]
  },
  {
    id: 'origin',
    name: 'Origin',
    description: 'Source games and competitive level.',
    items: [
      { id: 'master-games', name: 'Master games', count: 852372, desc: 'Puzzles from games played by titled players.' },
      { id: 'master-vs-master', name: 'Master vs Master games', count: 77940, desc: 'Puzzles from games between two titled players.' },
      { id: 'super-gm-games', name: 'Super GM games', count: 3296, desc: 'Puzzles from games played by the best players in the world.' }
    ]
  }
];

export const PUZZLE_OPENINGS = [
  { id: 'sicilian', name: 'Sicilian Defense', count: 207482, code: 'B20-B99' },
  { id: 'french', name: 'French Defense', count: 88624, code: 'C00-C19' },
  { id: 'queens-pawn', name: "Queen's Pawn Game", count: 80706, code: 'D00-D05' },
  { id: 'italian', name: 'Italian Game', count: 76239, code: 'C50-C54' },
  { id: 'caro-kann', name: 'Caro-Kann Defense', count: 74938, code: 'B10-B19' },
  { id: 'scandinavian', name: 'Scandinavian Defense', count: 58696, code: 'B01' },
  { id: 'queens-gambit-declined', name: "Queen's Gambit Declined", count: 50340, code: 'D30-D69' },
  { id: 'english', name: 'English Opening', count: 42470, code: 'A10-A39' },
  { id: 'ruy-lopez', name: 'Ruy Lopez', count: 40821, code: 'C60-C99' },
  { id: 'philidor', name: 'Philidor Defense', count: 25554, code: 'C41' },
  { id: 'kings-gambit-accepted', name: "King's Gambit Accepted", count: 20746, code: 'C33-C39' },
  { id: 'four-knights', name: 'Four Knights Game', count: 20172, code: 'C47-C49' },
  { id: 'zukertort', name: 'Zukertort Opening', count: 20162, code: 'A04-A09' },
  { id: 'modern', name: 'Modern Defense', count: 19644, code: 'B06' },
  { id: 'pirc', name: 'Pirc Defense', count: 19131, code: 'B07-B09' },
  { id: 'vienna', name: 'Vienna Game', count: 18709, code: 'C25-C29' },
  { id: 'bishops-opening', name: "Bishop's Opening", count: 18482, code: 'C23-C24' },
  { id: 'slav', name: 'Slav Defense', count: 17854, code: 'D10-D19' },
  { id: 'lemming', name: 'Lemming Defense', count: 2104, code: 'B00' }
];

export const ALL_PUZZLES = [
  // 1. Puzzle Streak (Screenshot 3)
  {
    id: 'puz_streak_1',
    title: 'Back Rank Deflection Mate',
    fen: '4kr2/1Q2b1pp/p3P3/8/8/PP6/1q3PPP/3R2K1 b - - 0 1',
    turn: 'b',
    theme: 'Back rank mate',
    category: 'mates',
    rating: 1016,
    solution: ['b2f2', 'g1h1', 'f2f1', 'd1f1', 'f8f1'],
    hint: 'Deflect the white rook from defending the first rank with queen sacrifice.',
    description: 'Black to move and deliver a forced checkmate in 3.'
  },
  // 2. Puzzle Storm (Screenshot 4)
  {
    id: 'puz_storm_1',
    title: 'Knight Royal Fork',
    fen: '8/1p6/p1p1p3/3k4/2NP4/1P6/1P2n1r1/1K1R4 w - - 0 1',
    turn: 'w',
    theme: 'Fork',
    category: 'motifs',
    rating: 1100,
    solution: ['c4e3', 'd5d6', 'e3g2'],
    hint: 'Fork the black king on d5 and the rook on g2.',
    description: 'White to play. Spot the royal fork winning the black rook.'
  },
  // 3. Anastasia's Mate (Screenshot 23)
  {
    id: 'puz_anastasia_1',
    title: "Anastasia's Mate",
    fen: '3r2k1/ppq2ppp/5n2/3P4/4rn2/1Q2N3/PP3PPP/R1B2RK1 b - - 0 1',
    turn: 'b',
    theme: "Anastasia's mate",
    category: 'mate_themes',
    rating: 1450,
    solution: ['f4e2', 'g1h1', 'c7h2', 'h1h2', 'e4h4'],
    hint: 'Jump the knight to e2+ then sacrifice the queen on h2!',
    description: 'A knight and rook team up to trap the king against the h-file.'
  },
  // 4. Attraction Queen Sacrifice (Screenshot 21)
  {
    id: 'puz_attraction_1',
    title: 'Attraction Sacrifice',
    fen: '5rk1/2pr1ppp/p7/1p2N1q1/1Q3n2/8/PPP2PPP/R3R1K1 w - - 0 1',
    turn: 'w',
    theme: 'Attraction',
    category: 'advanced',
    rating: 1620,
    solution: ['b4f8', 'g8f8', 'e5d7', 'f8g8', 'e1e8'],
    hint: 'Attract the black king to f8 with a queen sacrifice!',
    description: 'Sacrifice the queen on f8 to draw the king into a decisive fork and mate.'
  },
  // 5. Checkmate on h-file (Screenshot 22)
  {
    id: 'puz_checkmate_1',
    title: 'Checkmate',
    fen: '5R2/p3p1rk/3p2p1/7q/4N2Q/P1b5/1nP4P/7K w - - 0 1',
    turn: 'w',
    theme: 'Checkmate',
    category: 'mates',
    rating: 1380,
    solution: ['e4g5', 'h7h6', 'f8h8', 'g7h7', 'h8h7'],
    hint: 'Deliver check with the knight on g5, then mate on h8.',
    description: 'Win the game with style. Deliver forced mate.'
  },
  // 6. Advanced Pawn Breakthrough (Screenshot 19)
  {
    id: 'puz_adv_pawn_1',
    title: 'Advanced pawn',
    fen: '2r4k/p1Q3p1/1p1Pq2p/4p3/4P3/6P1/7P/5R1K w - - 0 1',
    turn: 'w',
    theme: 'Advanced pawn',
    category: 'motifs',
    rating: 1540,
    solution: ['d6d7', 'c8c7', 'd7d8q', 'h8h7', 'd8c7'],
    hint: 'Push the d-pawn to d7, attacking the rook and threatening queen promotion!',
    description: 'One of your pawns is deep into the opponent position, threatening promotion.'
  },
  // 7. Discovered Attack (Screenshot 20)
  {
    id: 'puz_disc_attack_1',
    title: 'Discovered attack',
    fen: '8/4k3/p5pp/3R4/3B2K1/rP4P1/3r4/8 w - - 0 1',
    turn: 'w',
    theme: 'Discovered attack',
    category: 'motifs',
    rating: 1290,
    solution: ['d4c5', 'e7e6', 'd5d2'],
    hint: 'Move the bishop to c5 to reveal a check from the d5 rook while attacking a3.',
    description: 'Moving a piece to unmask a long-range battery check and win material.'
  },
  // 8. Rook Endgame (Screenshot 18)
  {
    id: 'puz_rook_endgame_1',
    title: 'Rook endgame',
    fen: '8/p7/6p1/4p1k1/5rP1/1P2K3/P4R2/8 w - - 0 1',
    turn: 'w',
    theme: 'Rook endgame',
    category: 'phases',
    rating: 1320,
    solution: ['f2f4', 'e5f4', 'e3f3', 'g5h4', 'f3f4'],
    hint: 'Trade rooks on f4 and establish king zugzwang.',
    description: 'An endgame with only rooks and pawns. Transition to a winning pawn endgame.'
  },
  // 9. Middlegame (Screenshot 17)
  {
    id: 'puz_middlegame_1',
    title: 'Middlegame',
    fen: 'r4bk1/pbq2p1p/2p3p1/2pnQ1N1/2N5/3P2P1/PPPB1P1P/R5K1 b - - 0 1',
    turn: 'b',
    theme: 'Middlegame',
    category: 'phases',
    rating: 1410,
    solution: ['c7e5', 'c4e5', 'f8g7'],
    hint: 'Trade queens on e5 and attack the knight with your dark-squared bishop.',
    description: 'A tactic during the second phase of the game.'
  },
  // 10. Puzzle of the Day (Screenshot 1)
  {
    id: 'puz_daily_1',
    title: 'Puzzle of the day',
    fen: '8/P4k1p/2P5/1pB1B3/2p5/2k5/7P/8 b - - 0 1',
    turn: 'b',
    theme: 'Pawn endgame',
    category: 'phases',
    rating: 1490,
    solution: ['c3d3', 'a7a8q', 'c4c3'],
    hint: 'Activate your king to secure drawing or winning pawn play.',
    description: 'Daily community tactics challenge. Played 18,898 times.'
  },
  // 11. Healthy Mix 1 (Screenshot 1)
  {
    id: 'puz_healthy_1',
    title: 'Healthy mix',
    fen: '2r3k1/1p3p1p/p5p1/4p3/2rq4/2P5/PP4PP/1KQ1R3 w - - 0 1',
    turn: 'w',
    theme: 'Pin',
    category: 'motifs',
    rating: 1250,
    solution: ['c3d4', 'c4c1', 'e1c1'],
    hint: 'Spot the pinned piece on c4 and liquidate into a winning endgame.',
    description: 'A mix of everything. You never know what to expect!'
  },
  // 12. Sicilian Defense (Screenshot 15)
  {
    id: 'puz_sicilian_1',
    title: 'Sicilian Defense',
    fen: 'r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 2 9',
    turn: 'w',
    theme: 'Opening',
    opening: 'Sicilian Defense',
    category: 'phases',
    rating: 1350,
    solution: ['e1c1', 'c6d4', 'e3d4'],
    hint: 'Castle queenside to prepare the Yugoslav Attack storm.',
    description: 'Tactical clash in the Open Sicilian Dragon.'
  },
  // 13. French Defense
  {
    id: 'puz_french_1',
    title: 'French Defense',
    fen: 'rnbqk1nr/ppp2ppp/4p3/3p4/1b1PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4',
    turn: 'w',
    theme: 'Pin',
    opening: 'French Defense',
    category: 'motifs',
    rating: 1200,
    solution: ['e4e5', 'c7c5', 'a2a3'],
    hint: 'Lock the center with e5 then challenge the b4 bishop with a3.',
    description: 'Classic French Winawer structure battle.'
  },
  // 14. Italian Game
  {
    id: 'puz_italian_1',
    title: 'Italian Game',
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5',
    turn: 'w',
    theme: 'Attacking f2 or f7',
    opening: 'Italian Game',
    category: 'motifs',
    rating: 1250,
    solution: ['c4f7', 'e8f7', 'f3e5'],
    hint: 'Sacrifice bishop on f7 with check!',
    description: 'Attacking the vulnerable f7 square in the Italian opening.'
  },
  // 15. Lemming Defense (Screenshot 1)
  {
    id: 'puz_lemming_1',
    title: 'Lemming Defense',
    fen: 'r1bqkbnr/pppppppp/n7/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2',
    turn: 'w',
    theme: 'Opening',
    opening: 'Lemming Defense',
    category: 'phases',
    rating: 1000,
    solution: ['f1a6', 'b7a6', 'd2d4'],
    hint: 'Ruin black pawn structure by capturing the knight on a6.',
    description: 'Refuting 1...Na6 by doubling flank pawns.'
  },
  // 16. En Passant Rights (Screenshot 11)
  {
    id: 'puz_en_passant_1',
    title: 'En passant rights',
    fen: 'rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 3',
    turn: 'w',
    theme: 'En passant rights',
    category: 'special_moves',
    rating: 1080,
    solution: ['e5f6', 'e7f6', 'd2d4'],
    hint: 'Capture the f-pawn en passant on f6!',
    description: 'A tactic exploiting the en passant rule.'
  },
  // 17. Underpromotion
  {
    id: 'puz_underpromotion_1',
    title: 'Underpromotion',
    fen: '8/5P1k/8/8/8/8/8/6K1 w - - 0 1',
    turn: 'w',
    theme: 'Underpromotion',
    category: 'special_moves',
    rating: 1600,
    solution: ['f7f8n'],
    hint: 'Promote to a Knight to deliver a surprise attack!',
    description: 'Underpromotion to minor piece prevents stalemate or creates immediate fork.'
  },
  // 18. Smothered Mate
  {
    id: 'puz_smothered_1',
    title: 'Smothered mate',
    fen: 'r1b2r1k/pp4pp/2n5/2p1Np2/2B1pP2/1P6/PBPP1qPP/R2Q3K w - - 0 1',
    turn: 'w',
    theme: 'Smothered mate',
    category: 'mate_themes',
    rating: 1550,
    solution: ['e5g6', 'h7g6', 'd1e1', 'f2e1', 'a1e1'],
    hint: 'Sacrifice the knight on g6!',
    description: 'Smothering the opposing king behind its pawns.'
  },
  // 19. Arabian Mate
  {
    id: 'puz_arabian_1',
    title: 'Arabian mate',
    fen: '7k/R7/5N2/8/8/8/8/6K1 w - - 0 1',
    turn: 'w',
    theme: 'Arabian mate',
    category: 'mate_themes',
    rating: 1100,
    solution: ['a7h7'],
    hint: 'Deliver mate on h7 with the rook guarded by the f6 knight.',
    description: 'A knight and rook team up to trap the enemy king on the corner.'
  },
  // 20. Boden's Mate
  {
    id: 'puz_bodens_1',
    title: "Boden's mate",
    fen: '2kr3r/ppp2ppp/4b3/8/1b1nB3/2NP4/PPPB1PPP/R3K2R w KQ - 0 1',
    turn: 'w',
    theme: "Boden's mate",
    category: 'mate_themes',
    rating: 1400,
    solution: ['e1c1'],
    hint: 'Castle long to safeguard your king.',
    description: 'Bishops criss-crossing diagonals.'
  }
];

export function getPuzzlesByTheme(themeName) {
  if (!themeName) return ALL_PUZZLES;
  const lower = themeName.toLowerCase().replace(/['\s-]/g, '');
  const filtered = ALL_PUZZLES.filter(p => {
    const t = (p.theme || '').toLowerCase().replace(/['\s-]/g, '');
    const c = (p.category || '').toLowerCase().replace(/['\s-]/g, '');
    return t.includes(lower) || c.includes(lower) || lower.includes(t);
  });
  return filtered.length > 0 ? filtered : ALL_PUZZLES;
}

export function getPuzzlesByOpening(openingName) {
  if (!openingName) return ALL_PUZZLES;
  const lower = openingName.toLowerCase().replace(/['\s-]/g, '');
  const filtered = ALL_PUZZLES.filter(p => {
    const o = (p.opening || '').toLowerCase().replace(/['\s-]/g, '');
    return o.includes(lower) || lower.includes(o);
  });
  return filtered.length > 0 ? filtered : ALL_PUZZLES;
}

export function getDailyPuzzle() {
  return ALL_PUZZLES.find(p => p.id === 'puz_daily_1') || ALL_PUZZLES[0];
}

export function getStreakPuzzles() {
  // Sort by rating ascending
  return [...ALL_PUZZLES].sort((a, b) => a.rating - b.rating);
}

export function getStormPuzzles() {
  // Rapid tactics sorted by approachable ratings
  return [...ALL_PUZZLES].sort(() => Math.random() - 0.5);
}
