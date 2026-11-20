// Lightweight ECO Opening Recognizer for Chess Arena

const OPENING_PATTERNS = [
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'], name: 'Ruy Lopez (Spanish Opening)', eco: 'C60' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'], name: 'Italian Game (Giuoco Piano)', eco: 'C50' },
  { moves: ['e4', 'e5', 'Nf3', 'Nf6'], name: "Petrov's Defense", eco: 'C42' },
  { moves: ['e4', 'e5', 'f4'], name: "King's Gambit", eco: 'C30' },
  { moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'], name: 'Sicilian Defense: Najdorf', eco: 'B90' },
  { moves: ['e4', 'c5', 'Nf3', 'Nc6'], name: 'Sicilian Defense: Open', eco: 'B30' },
  { moves: ['e4', 'c5'], name: 'Sicilian Defense', eco: 'B20' },
  { moves: ['e4', 'e6', 'd4', 'd5'], name: 'French Defense', eco: 'C00' },
  { moves: ['e4', 'c6', 'd4', 'd5'], name: 'Caro-Kann Defense', eco: 'B12' },
  { moves: ['e4', 'd5'], name: 'Scandinavian Defense', eco: 'B01' },
  { moves: ['e4', 'Nf6'], name: "Alekhine's Defense", eco: 'B02' },
  { moves: ['d4', 'd5', 'c4', 'e6'], name: "Queen's Gambit Declined", eco: 'D30' },
  { moves: ['d4', 'd5', 'c4', 'c6'], name: 'Slav Defense', eco: 'D10' },
  { moves: ['d4', 'd5', 'c4', 'dxc4'], name: "Queen's Gambit Accepted", eco: 'D20' },
  { moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7'], name: "King's Indian Defense", eco: 'E60' },
  { moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4'], name: 'Nimzo-Indian Defense', eco: 'E20' },
  { moves: ['d4', 'Nf6', 'c4', 'c5'], name: 'Benoni Defense', eco: 'A56' },
  { moves: ['d4', 'f5'], name: 'Dutch Defense', eco: 'A80' },
  { moves: ['d4', 'd5', 'Bf4'], name: 'London System', eco: 'D02' },
  { moves: ['c4'], name: 'English Opening', eco: 'A10' },
  { moves: ['Nf3'], name: 'Réti Opening', eco: 'A04' },
  { moves: ['e4', 'e5'], name: "King's Pawn Game", eco: 'C20' },
  { moves: ['d4', 'd5'], name: "Queen's Pawn Game", eco: 'D00' }
];

export function getOpeningName(moveHistory = []) {
  if (!moveHistory || moveHistory.length === 0) return null;
  const sanList = moveHistory.map(m => (typeof m === 'string' ? m : m.san));

  // Find longest matching opening sequence
  let bestMatch = null;
  for (const op of OPENING_PATTERNS) {
    if (op.moves.length <= sanList.length) {
      const match = op.moves.every((mv, idx) => mv === sanList[idx]);
      if (match) {
        if (!bestMatch || op.moves.length > bestMatch.moves.length) {
          bestMatch = op;
        }
      }
    }
  }

  return bestMatch;
}
