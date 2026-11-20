import fs from 'fs';
import path from 'path';

// Complete dataset for all 64 chess lessons
const LESSON_CATEGORIES = [
  {
    name: "The board and the pieces",
    color: "emerald",
    lessons: [
      {
        num: 1,
        title: "The chessboard",
        steps: [
          {
            title: "Welcome to Chess",
            speech: "This is a chessboard. It has 64 squares: 32 light and 32 dark. Two players sit on opposite sides: White and Black.",
            fen: "8/8/8/8/8/8/8/8 w - - 0 1",
            highlightSquares: []
          },
          {
            title: "Ranks: The Horizontal Rows",
            speech: "The board has 8 horizontal rows called ranks. They are numbered from 1 at White's side to 8 at Black's side.",
            fen: "8/8/8/8/8/8/8/8 w - - 0 1",
            highlightSquares: ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"]
          },
          {
            title: "Files: The Vertical Columns",
            speech: "The vertical columns are called files. They are lettered from left to right as a, b, c, d, e, f, g, and h.",
            fen: "8/8/8/8/8/8/8/8 w - - 0 1",
            highlightSquares: ["e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8"]
          },
          {
            title: "Diagonals: Slanted Lines",
            speech: "Diagonals run diagonally across squares of the exact same color. Bishops move strictly along diagonals!",
            fen: "8/8/8/8/8/8/8/8 w - - 0 1",
            highlightSquares: ["a1", "b2", "c3", "d4", "e5", "f6", "g7", "h8"]
          },
          {
            title: "The Center",
            speech: "The four squares right in the middle (e4, d4, e5, d5) form the center. Controlling the center is the key to chess strategy!",
            fen: "8/8/8/8/8/8/8/8 w - - 0 1",
            highlightSquares: ["e4", "d4", "e5", "d5"]
          },
          {
            title: "White on Right",
            speech: "Before starting, always make sure the bottom-right corner square is a light square. 'White on right' is the golden rule!",
            fen: "8/8/8/8/8/8/8/8 w - - 0 1",
            highlightSquares: ["h1", "a8"]
          },
          {
            title: "Kingside and Queenside",
            speech: "The board is split into two halves: the Kingside (files e-h) and the Queenside (files a-d).",
            fen: "8/8/8/8/8/8/8/8 w - - 0 1",
            highlightSquares: ["e4", "f4", "g4", "h4"]
          },
          {
            title: "Ready to Learn Coordinates!",
            speech: "Now that you know ranks, files, and diagonals, you are ready to identify every single square by its unique name!",
            fen: "8/8/8/8/8/8/8/8 w - - 0 1",
            highlightSquares: ["e4"]
          }
        ]
      },
      {
        num: 2,
        title: "Names of the squares",
        steps: [
          {
            title: "Coordinates System",
            speech: "Every square on the board has a unique coordinate name, formed by combining its file letter and rank number.",
            fen: "8/8/8/8/8/8/8/8 w - - 0 1",
            highlightSquares: ["e4"]
          },
          {
            title: "The Square e4",
            speech: "Look at the e-file and the 4th rank. Where they cross is the famous square e4, one of the most common opening moves!",
            fen: "8/8/8/8/4P3/8/8/8 w - - 0 1",
            highlightSquares: ["e4"]
          },
          {
            title: "The Four Corners",
            speech: "The four corners of the board are a1, h1, a8, and h8. Rooks start the battle on these corner squares.",
            fen: "8/8/8/8/8/8/8/8 w - - 0 1",
            highlightSquares: ["a1", "h1", "a8", "h8"]
          },
          {
            title: "Reading Notation",
            speech: "When grandmasters read moves like 'Nf3', the 'N' means Knight and 'f3' tells you the destination square!",
            fen: "8/8/8/8/8/5N2/8/8 w - - 0 1",
            highlightSquares: ["f3"]
          }
        ]
      },
      {
        num: 3,
        title: "The rook",
        steps: [
          {
            title: "The Heavy Artillery",
            speech: "The rook is a powerful major piece worth 5 points. It moves in straight lines as far as it wants, vertically or horizontally.",
            fen: "8/8/8/8/4R3/8/8/8 w - - 0 1",
            highlightSquares: ["e1", "e2", "e3", "e5", "e6", "e7", "e8", "a4", "b4", "c4", "d4", "f4", "g4", "h4"]
          },
          {
            title: "Controlling Open Files",
            speech: "Because rooks move along straight files, placing them on open files with no pawns maximizes their firepower.",
            fen: "8/8/8/8/4R3/8/8/8 w - - 0 1",
            highlightSquares: ["e1", "e8"]
          },
          {
            title: "Capturing with the Rook",
            speech: "A rook captures an enemy piece by moving into its square and removing it from the board. It cannot jump over other pieces!",
            fen: "8/4p3/8/8/4R3/8/8/8 w - - 0 1",
            highlightSquares: ["e4", "e7"]
          }
        ]
      },
      {
        num: 4,
        title: "The bishop",
        steps: [
          {
            title: "Diagonal Snipers",
            speech: "Bishops move diagonally as far as they want. Each player starts with two bishops: one light-squared and one dark-squared.",
            fen: "8/8/8/8/4B3/8/8/8 w - - 0 1",
            highlightSquares: ["b1", "c2", "d3", "f5", "g6", "h7", "a8", "b7", "c6", "d5", "f3", "g2", "h1"]
          },
          {
            title: "The Color Complex",
            speech: "A bishop that starts on a light square can NEVER step on a dark square during the entire game!",
            fen: "8/8/8/8/4B3/8/8/8 w - - 0 1",
            highlightSquares: ["c6", "d5", "f5", "g6"]
          },
          {
            title: "The Bishop Pair",
            speech: "Together, your two bishops complement each other perfectly, slicing across both light and dark diagonals.",
            fen: "8/8/8/8/3BB3/8/8/8 w - - 0 1",
            highlightSquares: ["d4", "e4"]
          }
        ]
      },
      {
        num: 5,
        title: "The queen",
        steps: [
          {
            title: "The Mightiest Piece",
            speech: "The Queen is the most powerful piece on the board, valued at 9 points! She combines the powers of the Rook and Bishop.",
            fen: "8/8/8/8/4Q3/8/8/8 w - - 0 1",
            highlightSquares: ["e1", "e8", "a4", "h4", "a8", "h1", "b1", "h7"]
          },
          {
            title: "Multi-Directional Range",
            speech: "The queen can move in any straight line: up, down, left, right, or diagonally, as many vacant squares as she likes.",
            fen: "8/8/8/8/4Q3/8/8/8 w - - 0 1",
            highlightSquares: ["e5", "f5", "d5", "e3", "d3", "f3"]
          },
          {
            title: "Protect Your Queen!",
            speech: "Because she is so valuable, bringing the Queen out too early can allow the opponent to attack her with less valuable pieces.",
            fen: "8/8/8/8/4Q3/5N2/8/8 w - - 0 1",
            highlightSquares: ["e4"]
          }
        ]
      },
      {
        num: 6,
        title: "The knight",
        steps: [
          {
            title: "The Tricky Jumper",
            speech: "The Knight moves in a unique 'L-shape': two squares in one direction and then one square perpendicular.",
            fen: "8/8/8/8/4N3/8/8/8 w - - 0 1",
            highlightSquares: ["d6", "f6", "c5", "g5", "c3", "g3", "d2", "f2"]
          },
          {
            title: "Jumping Over Pieces",
            speech: "The Knight is the ONLY piece on the chessboard that can jump over other pieces, friendly or enemy!",
            fen: "8/8/8/3ppp2/3pNp2/3ppp2/8/8 w - - 0 1",
            highlightSquares: ["e4", "d6", "f6"]
          },
          {
            title: "Color Alternation",
            speech: "Notice a fun secret: every single time a knight moves, it changes square color from light to dark or dark to light!",
            fen: "8/8/8/8/4N3/8/8/8 w - - 0 1",
            highlightSquares: ["e4", "f6"]
          }
        ]
      },
      {
        num: 7,
        title: "The king",
        steps: [
          {
            title: "The Royal Ruler",
            speech: "The King is the most important piece in the game. If your king is checkmated, you lose! He moves one square in any direction.",
            fen: "8/8/8/8/4K3/8/8/8 w - - 0 1",
            highlightSquares: ["d5", "e5", "f5", "d4", "f4", "d3", "e3", "f3"]
          },
          {
            title: "Royal Boundaries",
            speech: "Kings can never step onto a square attacked by an enemy piece, and opposing kings can never touch or stand next to each other.",
            fen: "8/8/8/4k3/8/4K3/8/8 w - - 0 1",
            highlightSquares: ["e4"]
          },
          {
            title: "Endgame Leader",
            speech: "In the opening, protect your king! But in the endgame with fewer pieces, the king becomes a fighting hero.",
            fen: "8/8/4k3/8/8/4K3/8/8 w - - 0 1",
            highlightSquares: ["e3", "e4", "e5"]
          }
        ]
      },
      {
        num: 8,
        title: "The pawn: moving",
        steps: [
          {
            title: "The Brave Foot Soldier",
            speech: "Pawns march forward only and never step backward! Normally, a pawn steps forward one square at a time.",
            fen: "8/8/8/8/8/8/4P3/8 w - - 0 1",
            highlightSquares: ["e3"]
          },
          {
            title: "The First Move Boost",
            speech: "On its very first move from its starting rank, a pawn has the special superpower to move either one square or two squares forward!",
            fen: "8/8/8/8/8/8/4P3/8 w - - 0 1",
            highlightSquares: ["e3", "e4"]
          },
          {
            title: "Blocked Pawns",
            speech: "If another piece stands directly in front of a pawn, the pawn is blocked and cannot move forward.",
            fen: "8/8/8/8/4p3/8/4P3/8 w - - 0 1",
            highlightSquares: ["e4"]
          }
        ]
      },
      {
        num: 9,
        title: "The pawn: capturing",
        steps: [
          {
            title: "Diagonal Strike",
            speech: "Unlike other pieces, pawns capture differently than they move! Pawns capture diagonally forward one square.",
            fen: "8/8/8/3p4/4P3/8/8/8 w - - 0 1",
            highlightSquares: ["d5"]
          },
          {
            title: "Pawn Chains",
            speech: "When pawns protect each other diagonally, they form a strong 'pawn chain' that shields your king and army.",
            fen: "8/8/8/8/3P4/2P5/1P6/8 w - - 0 1",
            highlightSquares: ["b2", "c3", "d4"]
          },
          {
            title: "The Soul of Chess",
            speech: "Grandmaster Philidor famously said: 'Pawns are the soul of chess.' Their placement decides where the battle unfolds!",
            fen: "8/pppppppp/8/8/8/8/PPPPPPPP/8 w - - 0 1",
            highlightSquares: ["e4", "d4"]
          }
        ]
      },
      {
        num: 10,
        title: "Setting up the board",
        steps: [
          {
            title: "The Starting Army",
            speech: "Here is the starting position of chess! 32 pieces arranged across the 1st, 2nd, 7th, and 8th ranks.",
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            highlightSquares: []
          },
          {
            title: "Corners to Center",
            speech: "Rooks go in the corners. Next come the Knights, then Bishops. Pawns stand boldly across the front ranks.",
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            highlightSquares: ["a1", "h1", "b1", "g1", "c1", "f1"]
          },
          {
            title: "Queen on Her Own Color",
            speech: "Remember this golden rule: The White Queen always starts on a light square (d1), and the Black Queen on a dark square (d8)!",
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            highlightSquares: ["d1", "d8"]
          }
        ]
      }
    ]
  },
  {
    name: "The goal and special rules",
    color: "emerald",
    lessons: [
      {
        num: 11,
        title: "Check",
        steps: [
          {
            title: "Danger to the King!",
            speech: "When an enemy piece directly attacks your King, your King is in 'Check'. You must immediately get out of check!",
            fen: "4k3/8/8/8/8/8/4R3/4K3 b - - 0 1",
            highlightSquares: ["e8", "e2"]
          },
          {
            title: "You Must Respond",
            speech: "You cannot ignore check, and you cannot make any move that leaves your King still under attack.",
            fen: "4k3/8/8/8/8/8/4R3/4K3 b - - 0 1",
            highlightSquares: ["e8"]
          }
        ]
      },
      {
        num: 12,
        title: "Getting out of check",
        steps: [
          {
            title: "The CPR Rule",
            speech: "Remember CPR to escape check: C = Capture the attacker, P = Protect (block) the line, R = Run away with the King!",
            fen: "4k3/4r3/8/8/8/8/4Q3/4K3 w - - 0 1",
            highlightSquares: ["e2", "e7"]
          },
          {
            title: "C: Capture the Attacker",
            speech: "If you can safely capture the checking piece with any of your units, the check is immediately neutralized.",
            fen: "4k3/4r3/8/8/8/4B3/4Q3/4K3 b - - 0 1",
            highlightSquares: ["e3", "e7"]
          },
          {
            title: "P: Protect (Block the Check)",
            speech: "Slide a friendly piece between the checking piece and your king to block the line of fire.",
            fen: "r3k3/8/8/8/8/8/4R3/4K3 b - - 0 1",
            highlightSquares: ["e7"]
          },
          {
            title: "R: Run to Safety",
            speech: "Move your king to an adjacent square that is completely safe and not attacked by any enemy piece.",
            fen: "4k3/8/8/8/8/8/4R3/4K3 b - - 0 1",
            highlightSquares: ["d8", "f8", "d7", "f7"]
          }
        ]
      },
      {
        num: 13,
        title: "Checkmate",
        steps: [
          {
            title: "Game Over - Checkmate!",
            speech: "When the King is in check and has NO way to escape (cannot Capture, Protect, or Run), it is Checkmate! The game is won!",
            fen: "6k1/5ppp/8/8/8/8/8/4R1K1 b - - 0 1",
            highlightSquares: ["g8", "e1"]
          },
          {
            title: "The Ultimate Goal",
            speech: "Checkmate ends the game instantly. You don't need to capture the king; simply trapping him with no escape wins!",
            fen: "r1bqkb1r/pppp1Qpp/2n5/4p3/2B1n3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4",
            highlightSquares: ["f7", "e8"]
          }
        ]
      },
      {
        num: 14,
        title: "Stalemate",
        steps: [
          {
            title: "The Surprise Draw",
            speech: "Stalemate occurs when a player's King is NOT in check, but that player has NO legal moves anywhere on the board! It's a draw!",
            fen: "7k/5K2/6Q1/8/8/8/8/8 b - - 0 1",
            highlightSquares: ["h8"]
          },
          {
            title: "Always Leave a Square",
            speech: "When you have extra queens or rooks, always make sure every move gives check or leaves the enemy king an escape square to avoid stalemate.",
            fen: "7k/6p1/5K2/6Q1/8/8/8/8 b - - 0 1",
            highlightSquares: ["g7"]
          }
        ]
      },
      {
        num: 15,
        title: "Castling",
        steps: [
          {
            title: "The Double Move",
            speech: "Castling is the only move where two pieces move in the same turn! The King moves two squares toward a rook, and the rook hops over.",
            fen: "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1",
            highlightSquares: ["e1", "g1", "c1"]
          },
          {
            title: "Kingside Castling (0-0)",
            speech: "The King moves two squares to the right (to g1) and the rook slides to f1. This tucks the king safely into the corner.",
            fen: "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R4RK1 w kq - 0 1",
            highlightSquares: ["g1", "f1"]
          },
          {
            title: "Queenside Castling (0-0-0)",
            speech: "The King moves two squares to the left (to c1) and the a1 rook slides to d1. This also brings the rook into central play!",
            fen: "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/2KR3R w kq - 0 1",
            highlightSquares: ["c1", "d1"]
          }
        ]
      },
      {
        num: 16,
        title: "When you cannot castle",
        steps: [
          {
            title: "Pieces in the Way",
            speech: "You cannot castle if there are any pieces between the king and the rook. Clear the path first!",
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQK2R w KQkq - 0 1",
            highlightSquares: ["f1", "g1"]
          },
          {
            title: "Pieces Have Already Moved",
            speech: "If either your King or the Rook you want to castle with has already moved during the game, castling with that rook is forbidden.",
            fen: "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K1R1 w Qkq - 0 1",
            highlightSquares: ["g1"]
          },
          {
            title: "In Check or Passing Through Check",
            speech: "You cannot castle while in check, nor can the king pass through or land on a square attacked by an enemy piece!",
            fen: "4k3/8/8/8/8/5b2/4P3/R3K2R w KQ - 0 1",
            highlightSquares: ["f1", "f3"]
          }
        ]
      },
      {
        num: 17,
        title: "Pawn promotion",
        steps: [
          {
            title: "Reaching the Dream Rank",
            speech: "When a pawn successfully marches all the way to the 8th rank, it promotes immediately into a Queen, Rook, Bishop, or Knight!",
            fen: "8/4P3/8/8/8/8/8/4K2k w - - 0 1",
            highlightSquares: ["e7", "e8"]
          },
          {
            title: "Crown a Queen",
            speech: "Almost always, players choose a Queen because she is the most powerful piece. You can have multiple Queens on the board!",
            fen: "4Q3/8/8/8/8/8/8/4K2k w - - 0 1",
            highlightSquares: ["e8"]
          },
          {
            title: "Underpromotion",
            speech: "Rarely, promoting to a Knight delivers an instant checkmate or avoids a stalemate that a Queen would cause!",
            fen: "8/5P1k/8/8/8/8/8/6K1 w - - 0 1",
            highlightSquares: ["f8"]
          }
        ]
      },
      {
        num: 18,
        title: "En passant",
        steps: [
          {
            title: "The French Secret",
            speech: "'En passant' is French for 'in passing'. It is a special capturing rule created to prevent pawns from sneaking past enemy pawns.",
            fen: "8/8/8/3Pp3/8/8/8/4K2k w - e6 0 1",
            highlightSquares: ["d5", "e5", "e6"]
          },
          {
            title: "How It Works",
            speech: "If an enemy pawn moves two squares forward and lands right next to your pawn, you can capture it diagonally as if it had only moved one square!",
            fen: "8/8/4P3/8/8/8/8/4K2k w - - 0 1",
            highlightSquares: ["e6"]
          },
          {
            title: "Now or Never",
            speech: "En passant must be played on the very next turn immediately after the two-square jump. If you make another move, the right is lost forever!",
            fen: "8/8/8/3Pp3/8/8/8/4K2k w - e6 0 1",
            highlightSquares: ["e6"]
          }
        ]
      },
      {
        num: 19,
        title: "Draws and repetition",
        steps: [
          {
            title: "Sharing the Point",
            speech: "A chess game doesn't always end with a winner. A draw gives 1/2 point to each player.",
            fen: "8/8/4k3/8/8/4K3/8/8 w - - 0 1",
            highlightSquares: ["e3", "e6"]
          },
          {
            title: "Threefold Repetition",
            speech: "If the exact same board position with the exact same legal moves is repeated three times, either player can claim a draw.",
            fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
            highlightSquares: []
          },
          {
            title: "The 50-Move Rule",
            speech: "If 50 full turns pass with no pawn moves and no captures, either player can claim a draw.",
            fen: "8/8/4k3/8/8/4K3/8/8 w - - 0 1",
            highlightSquares: []
          }
        ]
      },
      {
        num: 20,
        title: "Basic game rules",
        steps: [
          {
            title: "The Touch-Move Rule",
            speech: "In tournament chess, if you touch a piece with the intention of moving it, you MUST move that piece if it has a legal move!",
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            highlightSquares: ["e2"]
          },
          {
            title: "Clock and Turn Etiquette",
            speech: "After you complete your move on the board, press the chess clock button with the SAME hand you used to make the move.",
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            highlightSquares: []
          },
          {
            title: "Sportsmanship",
            speech: "Always shake hands or tap 'Good luck' before the game and congratulate your opponent after. Win with grace, learn from losses!",
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            highlightSquares: ["e4", "e5"]
          }
        ]
      }
    ]
  },
  {
    name: "First checkmates",
    color: "amber",
    lessons: [
      {
        num: 21,
        title: "Checkmate with two rooks",
        steps: [
          {
            title: "The Ladder Mate",
            speech: "Checkmating with two rooks is often called the 'lawnmower' or 'ladder' mate. The rooks take turns cutting off ranks like a ladder!",
            fen: "4k3/8/8/8/8/R7/1R6/4K3 w - - 0 1",
            highlightSquares: ["a3", "b2"]
          },
          {
            title: "Step 1: Build the Wall",
            speech: "One rook guards the rank right in front of the enemy King, preventing him from coming forward.",
            fen: "4k3/8/8/8/8/R7/1R6/4K3 w - - 0 1",
            highlightSquares: ["a3", "e3"]
          },
          {
            title: "Step 2: Check and Push Back",
            speech: "The second rook delivers check from the next rank up, forcing the king backward toward the edge of the board.",
            fen: "4k3/8/8/8/1R6/R7/8/4K3 w - - 0 1",
            highlightSquares: ["b4"]
          },
          {
            title: "Final Rank: Mate!",
            speech: "When the King is driven onto the 8th rank, the ladder closes with an unavoidable checkmate!",
            fen: "R3k3/1R6/8/8/8/8/8/4K3 b - - 0 1",
            highlightSquares: ["a8", "b7"]
          }
        ]
      },
      {
        num: 22,
        title: "Checkmate with the queen",
        steps: [
          {
            title: "The Kiss of Death",
            speech: "The most famous queen mate happens when the Queen steps right next to the enemy King, protected by a friendly piece!",
            fen: "6k1/5Q2/6K1/8/8/8/8/8 b - - 0 1",
            highlightSquares: ["f7", "g6", "g8"]
          },
          {
            title: "The Knight's Distance Box",
            speech: "To trap a lone king with queen and king, place your queen a knight's move away from the king to shrink his box.",
            fen: "4k3/8/8/8/8/8/8/4KQ2 w - - 0 1",
            highlightSquares: ["f1", "e8"]
          },
          {
            title: "Bring Up Your King",
            speech: "Once the enemy king is stuck on the edge, bring your king close to support the queen for the final checkmate strike.",
            fen: "k7/8/1K6/8/8/8/8/7Q w - - 0 1",
            highlightSquares: ["b6", "h1"]
          }
        ]
      },
      {
        num: 23,
        title: "Beware of stalemate",
        steps: [
          {
            title: "The Heartbreaking Mistake",
            speech: "You are up a queen and rook, but suddenly the game is a draw! Stalemate is the #1 mistake beginner players make.",
            fen: "k7/2Q5/1K6/8/8/8/8/8 b - - 0 1",
            highlightSquares: ["a8", "c7"]
          },
          {
            title: "The Golden Rule",
            speech: "Always ask yourself before playing a move: 'Does my move give check? If not, does the enemy king have at least one legal square?'",
            fen: "k7/8/1K6/8/8/8/8/7Q w - - 0 1",
            highlightSquares: ["a8"]
          }
        ]
      },
      {
        num: 24,
        title: "Checkmate with a rook",
        steps: [
          {
            title: "The King and Rook Duo",
            speech: "A lone rook cannot mate by itself; it needs its own king to stand in direct opposition to deliver checkmate on the edge.",
            fen: "4k3/8/4K3/8/8/8/8/R7 w - - 0 1",
            highlightSquares: ["e6", "e8", "a1"]
          },
          {
            title: "Opposition",
            speech: "When both kings face each other with one square between them, your king covers the escape squares d7, e7, and f7.",
            fen: "4k3/8/4K3/8/8/8/8/R7 w - - 0 1",
            highlightSquares: ["d7", "e7", "f7"]
          },
          {
            title: "Rook to the 8th Rank: Mate!",
            speech: "Ra8# delivers check along the edge. The enemy king cannot advance because of your king, and checkmate is delivered!",
            fen: "R3k3/8/4K3/8/8/8/8/8 b - - 0 1",
            highlightSquares: ["a8", "e8"]
          }
        ]
      }
    ]
  },
  {
    name: "Material",
    color: "amber",
    lessons: [
      {
        num: 25,
        title: "The value of the pieces",
        steps: [
          {
            title: "The Point System",
            speech: "In chess, pieces have point values to help evaluate trades: Pawn = 1, Knight = 3, Bishop = 3, Rook = 5, Queen = 9!",
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            highlightSquares: ["d1", "a1", "c1", "b1", "e2"]
          },
          {
            title: "Minor vs Major Pieces",
            speech: "Knights and Bishops (3 pts) are called Minor Pieces. Rooks (5 pts) and Queens (9 pts) are called Major Pieces.",
            fen: "8/8/8/8/8/8/8/8 w - - 0 1",
            highlightSquares: []
          },
          {
            title: "The King is Priceless",
            speech: "The King has no numerical point value because losing him loses the game instantly. Guard him with your life!",
            fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
            highlightSquares: ["e1", "e8"]
          }
        ]
      },
      {
        num: 26,
        title: "Hanging pieces",
        steps: [
          {
            title: "Free Gifts on the Board",
            speech: "A 'hanging piece' is an undefended piece that your opponent left unprotected. Capturing hanging pieces wins games!",
            fen: "r1bqkbnr/pppp1ppp/2n5/4p3/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq - 0 1",
            highlightSquares: ["e5"]
          },
          {
            title: "Scan Before Every Move",
            speech: "Before you make a move, scan the whole board: 'Did my opponent leave anything hanging? Did I leave anything hanging?'",
            fen: "r1bqk2r/pppp1ppp/2n5/4p3/1b1P4/5N2/PPP1PPPP/RNBQKB1R w KQkq - 0 1",
            highlightSquares: ["b4"]
          }
        ]
      },
      {
        num: 27,
        title: "Attack and defence",
        steps: [
          {
            title: "Counting Defenders",
            speech: "When deciding whether to capture a piece, count how many attackers you have versus how many defenders your opponent has.",
            fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1",
            highlightSquares: ["e5", "f3", "c6"]
          },
          {
            title: "Equal or Favorable Trades",
            speech: "If you have more attackers than they have defenders, you can safely win the piece or win the exchange!",
            fen: "r1bqkbnr/pppp1ppp/2n5/4N3/4P3/8/PPPP1PPP/RNBQKB1R b KQkq - 0 1",
            highlightSquares: ["e5"]
          }
        ]
      },
      {
        num: 28,
        title: "Trading pieces",
        steps: [
          {
            title: "When to Trade",
            speech: "When you are ahead in material (up a rook or a piece), trade pieces (not pawns) to simplify into an easy winning endgame!",
            fen: "4k3/4r3/8/8/8/8/4R3/4K3 w - - 0 1",
            highlightSquares: ["e2", "e7"]
          },
          {
            title: "When NOT to Trade",
            speech: "When you are behind in material or attacking the enemy king, avoid trading your active pieces.",
            fen: "r1bq1rk1/pppp1ppp/2n5/2b1p3/2B1P1n1/2NP1N2/PPP2PPP/R1BQK2R w KQ - 0 1",
            highlightSquares: []
          }
        ]
      },
      {
        num: 29,
        title: "What is your opponent threatening?",
        steps: [
          {
            title: "The Golden Question",
            speech: "Never just look at your own ideas. Every single turn, ask yourself first: 'What is my opponent threatening with their last move?'",
            fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 0 1",
            highlightSquares: ["c4", "f7"]
          },
          {
            title: "Stop Blunders Early",
            speech: "By identifying their threat (a fork, a checkmate, or winning a piece), you can easily prevent it and stay ahead!",
            fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 0 1",
            highlightSquares: ["f6"]
          }
        ]
      }
    ]
  },
  {
    name: "How to start a game",
    color: "amber",
    lessons: [
      {
        num: 30,
        title: "The center",
        steps: [
          {
            title: "The Four Central Squares",
            speech: "The squares e4, d4, e5, and d5 form the vital heart of the chessboard. Whoever controls the center controls the game!",
            fen: "8/8/8/8/3PP3/8/8/8 w - - 0 1",
            highlightSquares: ["e4", "d4", "e5", "d5"]
          },
          {
            title: "Control with Pawns",
            speech: "Opening with 1.e4 or 1.d4 stakes an immediate claim in the center and opens diagonal highways for your Queen and Bishop.",
            fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
            highlightSquares: ["e4"]
          }
        ]
      },
      {
        num: 31,
        title: "Developing pieces",
        steps: [
          {
            title: "Bring Out Your Army",
            speech: "Developing means moving your minor pieces (knights and bishops) off the back rank and onto active squares.",
            fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
            highlightSquares: ["f3", "e5"]
          },
          {
            title: "Knights Before Bishops",
            speech: "It's usually wise to develop knights before bishops, because knights belong naturally on f3 and c3 controlling center squares.",
            fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
            highlightSquares: ["f3", "c6"]
          }
        ]
      },
      {
        num: 32,
        title: "A safe king",
        steps: [
          {
            title: "Castle Early!",
            speech: "A King trapped in the center is an easy target for enemy rooks and queens. Castle within your first 7 to 10 moves!",
            fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 b kq - 0 5",
            highlightSquares: ["g1", "f1"]
          },
          {
            title: "The Pawn Shield",
            speech: "Once you castle kingside, avoid pushing the pawns in front of your King (f2, g2, h2) unnecessarily. They are his bodyguards!",
            fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 b kq - 0 5",
            highlightSquares: ["f2", "g2", "h2"]
          }
        ]
      },
      {
        num: 33,
        title: "Opening mistakes",
        steps: [
          {
            title: "Mistake 1: Moving Same Piece Twice",
            speech: "Don't move the same piece multiple times in the opening while your other pieces are still asleep on the back rank.",
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            highlightSquares: []
          },
          {
            title: "Mistake 2: Premature Queen Raids",
            speech: "Don't bring your Queen out on move 2! Enemy knights and pawns will attack her, forcing her to run while they develop for free.",
            fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/Q7/PPPP1PPP/RNB1KBNR b KQkq - 1 2",
            highlightSquares: ["a3"]
          }
        ]
      },
      {
        num: 34,
        title: "Scholar's mate",
        steps: [
          {
            title: "The 4-Move Trap",
            speech: "Scholar's Mate is the famous attack where White teams up Queen and Bishop to deliver checkmate on the tender f7 square.",
            fen: "r1bqkb1r/pppp1Qpp/2n5/4p3/2B1n3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4",
            highlightSquares: ["f7", "c4"]
          },
          {
            title: "How to Stop It Easily",
            speech: "When White plays 2.Qh5 or 2.Bc4, play 2...Nc6 to defend the e5 pawn, and meet Qh5 with 3...g6! The Queen is kicked away safely.",
            fen: "r1bqkb1r/pppp1p1p/2n3p1/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 4",
            highlightSquares: ["g6", "h5"]
          }
        ]
      }
    ]
  },
  {
    name: "Tactics",
    color: "amber",
    lessons: [
      {
        num: 35,
        title: "Checks, captures and threats",
        steps: [
          {
            title: "The Forcing Moves",
            speech: "In every tactical position, always calculate candidate moves in this exact order: 1. Checks, 2. Captures, 3. Threats!",
            fen: "r1b1k2r/pppp1ppp/2n5/4P3/1bB1n3/2N2N2/PPP2PPP/R1BQK2R w KQkq - 0 8",
            highlightSquares: ["b4", "e4", "c4"]
          },
          {
            title: "Checks Limit Choices",
            speech: "A check severely restricts what your opponent can play, making your calculations clean and predictable.",
            fen: "r1bqk2r/pppp1ppp/2n5/4P3/1bB1n3/2N2N2/PPP2PPP/R1BQK2R w KQkq - 0 8",
            highlightSquares: ["b4"]
          }
        ]
      },
      {
        num: 36,
        title: "Double attack",
        steps: [
          {
            title: "Two Targets at Once",
            speech: "A double attack occurs when one move creates two simultaneous threats. The opponent can usually only defend one!",
            fen: "r1bqk2r/ppp2ppp/2n5/3np3/8/2PP1Q2/PP3PPP/RNB1KBNR w KQkq - 0 8",
            highlightSquares: ["f3", "d5", "f7"]
          },
          {
            title: "Queen Double Attacks",
            speech: "Queens are famous for double attacks because they can hit pieces on completely different sides of the board.",
            fen: "r1bqk2r/ppp2ppp/2n5/3np3/8/2PP1Q2/PP3PPP/RNB1KBNR w KQkq - 0 8",
            highlightSquares: ["f3"]
          }
        ]
      },
      {
        num: 37,
        title: "Knight forks",
        steps: [
          {
            title: "The Deadly Fork",
            speech: "Because knights jump in an L-shape, they can attack two high-value pieces at the same time without being captured back!",
            fen: "r1bqk2r/pppp1ppp/8/4N3/1n2n3/8/PPPP1PPP/R1BQKB1R w KQkq - 0 7",
            highlightSquares: ["c7"]
          },
          {
            title: "The Royal Fork",
            speech: "Forking the King and Queen wins the Queen outright! Always watch out for knight jumping squares like c7 and f7.",
            fen: "r1b1k2r/ppN2ppp/8/8/8/8/PPPP1PPP/R1BQKB1R b KQkq - 0 8",
            highlightSquares: ["c7", "e8", "a8"]
          }
        ]
      },
      {
        num: 38,
        title: "The pin",
        steps: [
          {
            title: "Frozen in Place",
            speech: "A pin occurs when an attacking piece targets a defender that cannot move because doing so would expose a more valuable piece behind it.",
            fen: "r1bqk2r/pppp1ppp/2n2n2/4p3/1b2P3/2NP1N2/PPP2PPP/R1BQKB1R w KQkq - 1 5",
            highlightSquares: ["b4", "c3", "e1"]
          },
          {
            title: "Absolute vs Relative Pin",
            speech: "An Absolute Pin is against the King: the pinned piece is legally forbidden to move! A Relative Pin is against the Queen or Rook.",
            fen: "r1bqk2r/pppp1ppp/2n2n2/4p3/1b2P3/2NP1N2/PPP2PPP/R1BQKB1R w KQkq - 1 5",
            highlightSquares: ["c3"]
          }
        ]
      },
      {
        num: 39,
        title: "Attacking a pinned piece",
        steps: [
          {
            title: "Pile On the Pressure!",
            speech: "The golden rule of pins: 'Put your pawns and pieces on the pinned piece!' Since it cannot run away, attack it until it falls.",
            fen: "r1bqk2r/pppp1ppp/2n5/4p3/1b2P3/2NP1N2/PPP2PPP/R1BQKB1R w KQkq - 1 5",
            highlightSquares: ["c3", "a3"]
          },
          {
            title: "Pawn Attacks on Pinned Pieces",
            speech: "Attacking a pinned minor piece with a lowly pawn is one of the most effective ways to win material.",
            fen: "r1bqk2r/pppp1ppp/2n5/4p3/1b1PP3/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 0 6",
            highlightSquares: ["d5"]
          }
        ]
      },
      {
        num: 40,
        title: "The skewer",
        steps: [
          {
            title: "The Reverse Pin",
            speech: "A skewer is like a pin, but the more valuable piece is in FRONT! When it steps aside to save itself, the piece behind is captured.",
            fen: "4k3/8/8/8/8/8/r7/4K2R w K - 0 1",
            highlightSquares: ["h1", "e1", "a1"]
          },
          {
            title: "X-Ray Laser",
            speech: "Rh8+ forces the king to run away, exposing the unprotected rook on a8 to be scooped up!",
            fen: "R6k/8/8/8/8/8/8/7K b - - 0 1",
            highlightSquares: ["a8"]
          }
        ]
      },
      {
        num: 41,
        title: "Discovered attack",
        steps: [
          {
            title: "The Hidden Ambush",
            speech: "A discovered attack happens when one piece moves, unleashing an attack from a friendly piece hiding behind it!",
            fen: "r1bqk2r/pppp1ppp/2n5/3Np3/4P3/3P1N2/PPP2PPP/R1BQK2R w KQkq - 0 7",
            highlightSquares: ["d5", "f3"]
          },
          {
            title: "Discovered Check",
            speech: "If the hidden piece gives check, the moving piece can capture anything it wants with complete impunity!",
            fen: "r1b1k2r/pppp1ppp/8/3Np3/4P3/3P1N2/PPP2PPP/R1BQK2R w KQkq - 0 7",
            highlightSquares: ["d5"]
          }
        ]
      },
      {
        num: 42,
        title: "Double check",
        steps: [
          {
            title: "The Most Lethal Check",
            speech: "When two pieces check the King at the same time, the king CANNOT block and CANNOT capture both! The king MUST run!",
            fen: "r1b1k2r/pppp1Npp/8/4p3/2B1n2q/8/PPPP2PP/RNBQ2KR b kq - 0 8",
            highlightSquares: ["f7", "c4", "e8"]
          },
          {
            title: "King on the Run",
            speech: "Because double check forces the king to move, it often leads directly to breathtaking checkmates.",
            fen: "r1b1k2r/pppp1Npp/8/4p3/2B1n2q/8/PPPP2PP/RNBQ2KR b kq - 0 8",
            highlightSquares: ["e8"]
          }
        ]
      },
      {
        num: 43,
        title: "Removing the defender",
        steps: [
          {
            title: "Eliminate the Guard",
            speech: "If an enemy piece is bravely guarding a valuable prize, capture or deflect the guard first, then take the prize!",
            fen: "r1bqk2r/ppp2ppp/2n5/3p4/1b1P4/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 0 7",
            highlightSquares: ["c6", "e5"]
          },
          {
            title: "The Domino Effect",
            speech: "Once the defender falls, their entire defensive wall collapses.",
            fen: "r1bqk2r/ppp2ppp/2n5/3p4/1b1P4/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 0 7",
            highlightSquares: ["d5"]
          }
        ]
      },
      {
        num: 44,
        title: "Deflection",
        color: "rose",
        steps: [
          {
            title: "Luring Away the Guard",
            speech: "Deflection forces an enemy piece to leave an important square or defensive duty by dangling a juicy temptation.",
            fen: "5rk1/5ppp/8/8/8/8/4QPPP/5RK1 w - - 0 1",
            highlightSquares: ["e2", "e8"]
          },
          {
            title: "Overworked Pieces",
            speech: "If a rook is guarding against back rank mate, deflecting it away allows an immediate mate on the 8th rank!",
            fen: "5rk1/5ppp/8/8/8/8/4QPPP/5RK1 w - - 0 1",
            highlightSquares: ["f8"]
          }
        ]
      },
      {
        num: 45,
        title: "In-between moves",
        color: "rose",
        steps: [
          {
            title: "The Zwischenzug Surprise",
            speech: "Zwischenzug is German for 'in-between move'. Instead of making the expected recapture, you insert a sharp intermediate check or threat first!",
            fen: "r2qkb1r/pp2pppp/2n2n2/3p4/3P2b1/2NB1N2/PPP2PPP/R1BQK2R w KQkq - 0 7",
            highlightSquares: ["d3", "f6"]
          },
          {
            title: "Turning the Tables",
            speech: "An unexpected check in the middle of a trade sequence completely blows up your opponent's calculations.",
            fen: "r2qkb1r/pp2pppp/2n2n2/3p4/3P2b1/2NB1N2/PPP2PPP/R1BQK2R w KQkq - 0 7",
            highlightSquares: ["d3"]
          }
        ]
      },
      {
        num: 46,
        title: "Decoy",
        color: "rose",
        steps: [
          {
            title: "The Fatal Trap",
            speech: "A decoy tactic lures an enemy piece (often the king or queen) onto a poisoned square where it falls into a fork or pin.",
            fen: "r4rk1/5ppp/8/8/8/8/5PPP/R4RK1 w - - 0 1",
            highlightSquares: ["a8", "f8"]
          },
          {
            title: "Sacrifice for Positioning",
            speech: "Giving up a rook or pawn to drag the enemy king into the open can set up an immediate checkmate.",
            fen: "5rk1/5ppp/8/8/8/8/5PPP/5RK1 w - - 0 1",
            highlightSquares: ["g8"]
          }
        ]
      },
      {
        num: 47,
        title: "Clearance sacrifice",
        color: "rose",
        steps: [
          {
            title: "Clear the Runway",
            speech: "Sometimes your own piece is in the way of a brilliant checkmate. Sacrifice it to clear the square or diagonal for your queen or rook!",
            fen: "r1b2rk1/pp3ppp/2n5/2p5/3p4/5N2/PPP2PPP/R1BQR1K1 w - - 0 13",
            highlightSquares: ["e8", "f3"]
          },
          {
            title: "Opening the Line",
            speech: "Clearing a path with a check guarantees your attacking pieces flood in before the opponent can react.",
            fen: "r1b2rk1/pp3ppp/2n5/2p5/3p4/5N2/PPP2PPP/R1BQR1K1 w - - 0 13",
            highlightSquares: ["e1"]
          }
        ]
      },
      {
        num: 48,
        title: "Overloaded pieces",
        color: "rose",
        steps: [
          {
            title: "Too Many Jobs",
            speech: "An overloaded piece is tasked with defending two different things at once. Attack one, and the other falls!",
            fen: "r1b1k2r/pppp1ppp/8/4n3/1b2P3/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 0 7",
            highlightSquares: ["f3", "e5", "d4"]
          },
          {
            title: "Break the Camel's Back",
            speech: "Identify which enemy piece is overworked and force it to make an impossible choice between two vital duties.",
            fen: "r1b1k2r/pppp1ppp/8/4n3/1b2P3/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 0 7",
            highlightSquares: ["c3"]
          }
        ]
      }
    ]
  },
  {
    name: "Checkmate patterns",
    color: "rose",
    lessons: [
      {
        num: 49,
        title: "Back rank mate",
        steps: [
          {
            title: "The Pawn Prison",
            speech: "When a castled king is trapped behind his own pawns on f7, g7, and h7, a rook or queen delivering check on the 8th rank is instantly fatal!",
            fen: "6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1",
            highlightSquares: ["e8", "g8"]
          },
          {
            title: "Create 'Luft' (Breathing Room)",
            speech: "To prevent back rank mate, always consider pushing h3 or g3 to give your king an escape hatch in the endgame.",
            fen: "6k1/5ppp/8/8/8/7P/8/4R1K1 b - - 0 1",
            highlightSquares: ["h3", "h2"]
          }
        ]
      },
      {
        num: 50,
        title: "The supported queen",
        steps: [
          {
            title: "Queen & Helper",
            speech: "A queen delivers check right against the enemy king, supported by a bishop, knight, or pawn from afar. The king cannot capture her!",
            fen: "6k1/5Q2/6B1/8/8/8/8/6K1 b - - 0 1",
            highlightSquares: ["f7", "g6", "g8"]
          },
          {
            title: "The Ultimate Finisher",
            speech: "Supported queen checkmates account for more than 40% of all checkmates in beginner and intermediate chess games!",
            fen: "r1bqkb1r/pppp1Qpp/2n5/4p3/2B1n3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4",
            highlightSquares: ["f7", "c4"]
          }
        ]
      },
      {
        num: 51,
        title: "Smothered mate",
        steps: [
          {
            title: "Choked by His Own Army",
            speech: "Smothered Mate is one of the most beautiful checkmates in history! The enemy king is completely surrounded by friendly pieces and cannot move.",
            fen: "6rk/5Npp/8/8/8/8/8/7K w - - 0 1",
            highlightSquares: ["f7", "h8", "g8"]
          },
          {
            title: "The Knight's Exclusive Power",
            speech: "Because knights jump over other pieces, the friendly pieces surrounding the king trap him instead of helping him!",
            fen: "6rk/5Npp/8/8/8/8/8/7K w - - 0 1",
            highlightSquares: ["f7"]
          }
        ]
      },
      {
        num: 52,
        title: "The Arabian mate",
        steps: [
          {
            title: "Rook and Knight Teamwork",
            speech: "The Arabian mate is an ancient mating pattern dating back over a thousand years! The knight protects the rook on the corner square.",
            fen: "7k/5R2/5N2/8/8/8/8/7K w - - 0 1",
            highlightSquares: ["f7", "f6", "h8"]
          },
          {
            title: "No Escape",
            speech: "The knight covers g8 and h7, while the rook delivers the checkmate blow along the 7th or 8th rank.",
            fen: "7k/5R2/5N2/8/8/8/8/7K w - - 0 1",
            highlightSquares: ["h7"]
          }
        ]
      },
      {
        num: 53,
        title: "Mate with two bishops",
        steps: [
          {
            title: "Diagonal Crossfire",
            speech: "Two coordinated bishops control adjacent diagonals like laser beams, cornering the enemy king against the edge of the board.",
            fen: "7k/8/5K2/8/8/8/5B2/6B1 w - - 0 1",
            highlightSquares: ["f2", "g1", "h8"]
          },
          {
            title: "Corner Trap",
            speech: "One bishop seals the escape squares on light diagonals while the other delivers the final checkmate on dark diagonals.",
            fen: "7k/8/5K2/8/8/8/5B2/6B1 w - - 0 1",
            highlightSquares: ["g1", "f2"]
          }
        ]
      },
      {
        num: 54,
        title: "Mate in two",
        color: "orange",
        steps: [
          {
            title: "Calculating the Finish",
            speech: "Mate in two puzzles teach you to calculate a forcing check or quiet killer move followed by an unavoidable checkmate.",
            fen: "r1b2r1k/pp3ppp/2n5/2p5/3p4/5N2/PPP2PPP/R1BQR1K1 w - - 0 1",
            highlightSquares: ["e8"]
          },
          {
            title: "Look for Forcing Moves",
            speech: "Start by checking every check! Is there a check that forces the enemy king into a fatal mating net?",
            fen: "r1b2r1k/pp3ppp/2n5/2p5/3p4/5N2/PPP2PPP/R1BQR1K1 w - - 0 1",
            highlightSquares: []
          }
        ]
      }
    ]
  },
  {
    name: "Planning",
    color: "orange",
    lessons: [
      {
        num: 55,
        title: "Rooks on open files",
        steps: [
          {
            title: "Open Corridors",
            speech: "An open file is a vertical column with no pawns on it. Rooks love open files because they have full board mobility!",
            fen: "r4rk1/ppp2ppp/2n5/3p4/3P4/2N5/PPP2PPP/R4RK1 w - - 0 1",
            highlightSquares: ["e1", "e8"]
          },
          {
            title: "Invading the 7th Rank",
            speech: "A rook on the 7th rank (the 'pig on the 7th') attacks enemy base pawns and restricts the enemy king fatally.",
            fen: "5rk1/1R3ppp/8/8/8/8/5PPP/5RK1 w - - 0 1",
            highlightSquares: ["b7", "f7", "g7", "h7"]
          }
        ]
      },
      {
        num: 56,
        title: "Outposts for knights",
        steps: [
          {
            title: "The Unshakeable Fortress",
            speech: "An outpost is a square on the 4th, 5th, or 6th rank protected by your pawn that cannot be attacked by any enemy pawns.",
            fen: "r1bq1rk1/pppp1ppp/2n5/2b1N3/4P3/3P4/PPP2PPP/RNBQ1RK1 b - - 0 6",
            highlightSquares: ["e5"]
          },
          {
            title: "Octopus Knight",
            speech: "A knight planted firmly on a central outpost radiates immense tactical power in all 8 directions!",
            fen: "r1bq1rk1/pppp1ppp/2n5/2b1N3/4P3/3P4/PPP2PPP/RNBQ1RK1 b - - 0 6",
            highlightSquares: ["d7", "f7", "c6", "g6", "c4", "g4", "d3", "f3"]
          }
        ]
      },
      {
        num: 57,
        title: "Good and bad bishops",
        steps: [
          {
            title: "Tall Pawns vs Active Bishops",
            speech: "A 'bad bishop' is blocked by its own pawns fixed on the same color. A 'good bishop' roams freely around pawns on the opposite color.",
            fen: "8/4p3/4p3/4p3/8/8/4B3/4K3 w - - 0 1",
            highlightSquares: ["e2", "e5", "e6", "e7"]
          },
          {
            title: "Pawn Harmony",
            speech: "When you have a light-squared bishop, try to place your central pawns on dark squares to give your bishop maximum freedom.",
            fen: "8/8/8/3p1p2/4P3/8/4B3/4K3 w - - 0 1",
            highlightSquares: ["e4", "e2"]
          }
        ]
      },
      {
        num: 58,
        title: "Pawn structures and weaknesses",
        steps: [
          {
            title: "Doubled Pawns",
            speech: "Doubled pawns occur when two pawns of the same color stand on the same file. They cannot protect each other and are often weak.",
            fen: "8/8/8/4p3/4p3/8/8/4K2k w - - 0 1",
            highlightSquares: ["e4", "e5"]
          },
          {
            title: "Isolated Pawns",
            speech: "An isolated pawn has no friendly pawns on adjacent files. It must be defended by pieces, which ties down your army.",
            fen: "8/8/8/3P4/8/8/8/4K2k w - - 0 1",
            highlightSquares: ["d5"]
          }
        ]
      },
      {
        num: 59,
        title: "King activity in the endgame",
        steps: [
          {
            title: "The King Becomes a Warrior",
            speech: "Once queens are traded and the board clears, the King transforms from a vulnerable target into your most active fighting piece!",
            fen: "8/8/4k3/8/8/4K3/8/8 w - - 0 1",
            highlightSquares: ["e3", "e6"]
          },
          {
            title: "March Toward the Center",
            speech: "In the endgame, rush your king toward the center and enemy pawns to escort your own pawns to promotion.",
            fen: "8/4p3/8/3P4/4K3/8/8/4k3 w - - 0 1",
            highlightSquares: ["e4", "d5"]
          }
        ]
      },
      {
        num: 60,
        title: "Passed pawns",
        steps: [
          {
            title: "The Future Queen",
            speech: "A passed pawn is a pawn that has no enemy pawns in front of it or on adjacent files to stop its march to the 8th rank!",
            fen: "8/8/8/3P4/8/8/8/4K2k w - - 0 1",
            highlightSquares: ["d5", "d6", "d7", "d8"]
          },
          {
            title: "Passed Pawns Must Be Pushed!",
            speech: "As the famous chess saying goes: 'Passed pawns must be pushed!' They tie down enemy pieces and create queens.",
            fen: "8/3P4/8/8/8/8/8/4K2k w - - 0 1",
            highlightSquares: ["d7", "d8"]
          }
        ]
      },
      {
        num: 61,
        title: "The square of the pawn",
        steps: [
          {
            title: "The Magic Calculation Box",
            speech: "You don't need to count moves one by one! Draw a visual square from the passed pawn to the promotion rank.",
            fen: "8/8/8/3P4/8/8/8/7k w - - 0 1",
            highlightSquares: ["d5", "d8", "g8", "g5"]
          },
          {
            title: "Inside or Outside the Box?",
            speech: "If the enemy king can step inside the square on their turn, they can catch the pawn. If they cannot, the pawn promotes untouched!",
            fen: "8/8/8/3P4/8/8/8/7k b - - 0 1",
            highlightSquares: ["d8"]
          }
        ]
      },
      {
        num: 62,
        title: "Opposition and key squares",
        steps: [
          {
            title: "Direct Opposition",
            speech: "Opposition is when kings stand opposite each other with one square between them. Whoever does NOT have to move holds the opposition!",
            fen: "4k3/8/4K3/8/8/8/8/8 w - - 0 1",
            highlightSquares: ["e6", "e8"]
          },
          {
            title: "Outflanking the Defense",
            speech: "Holding opposition forces the enemy king to step aside, allowing your king to outflank and escort your pawn to victory.",
            fen: "4k3/8/4K3/4P3/8/8/8/8 w - - 0 1",
            highlightSquares: ["e5"]
          }
        ]
      },
      {
        num: 63,
        title: "Defending tough positions",
        steps: [
          {
            title: "Never Give Up!",
            speech: "Even in worse positions, resilient defense can save half a point. Look for stalemate traps, fortresses, and perpetual check!",
            fen: "7k/5Q2/8/8/8/8/8/7K b - - 0 1",
            highlightSquares: ["h8"]
          },
          {
            title: "Perpetual Check",
            speech: "If you can check the enemy king endlessly with no way for him to escape the cycle, the game is declared a draw by repetition.",
            fen: "6k1/6p1/5p2/8/8/8/6q1/4K2R b - - 0 1",
            highlightSquares: ["g2"]
          }
        ]
      },
      {
        num: 64,
        title: "Master checklist and thinking process",
        steps: [
          {
            title: "The Grandmaster Mental Routine",
            speech: "Congratulations on reaching Lesson 64! Let's review the grandmaster thinking process for every single turn.",
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            highlightSquares: []
          },
          {
            title: "Step 1: Check Threats First",
            speech: "What did my opponent just do? Are there any immediate checks, captures, or threats against my pieces?",
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            highlightSquares: []
          },
          {
            title: "Step 2: Candidate Moves",
            speech: "Calculate 2 to 3 candidate moves. Check forcing lines (checks, captures, threats) before quiet positional moves.",
            fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
            highlightSquares: ["e4", "d4", "c4"]
          },
          {
            title: "Step 3: Blunder Check & Play!",
            speech: "Before you let go of your piece, take one final 2-second blunder check: 'Is my destination square safe?' You are now ready to conquer the arena!",
            fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
            highlightSquares: ["e4"]
          }
        ]
      }
    ]
  }
];

// Flatten and assemble all 64 lessons
export const ALL_LESSONS = [];

let globalIndex = 1;
for (const cat of LESSON_CATEGORIES) {
  for (const lesson of cat.lessons) {
    ALL_LESSONS.push({
      id: lesson.num,
      num: lesson.num,
      category: cat.name,
      title: lesson.title,
      color: lesson.color || cat.color,
      steps: lesson.steps
    });
    globalIndex++;
  }
}

export { LESSON_CATEGORIES };
