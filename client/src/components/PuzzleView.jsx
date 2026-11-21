import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from './Chessboard.jsx';
import { PieceIcon } from './PieceIcons.jsx';
import {
  ArrowLeft,
  Search,
  ChevronRight,
  ChevronDown,
  Volume2,
  VolumeX,
  Settings,
  X,
  RotateCcw,
  Lightbulb,
  Flag,
  ChevronLeft,
  Flame,
  Zap,
  Trophy,
  CheckCircle2,
  XCircle,
  Calendar,
  Crosshair,
  BookOpen,
  Info,
  Clock,
  Sparkles,
  Play,
  RotateCw,
  Trash2,
  Award,
  Layers,
  ArrowRight,
  Eye,
  Crown,
  Swords,
  Shield
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio.js';
import { safeStorage } from '../utils/storage.js';
import { triggerHaptic } from '../utils/device.js';
import {
  THEME_CATEGORIES,
  PUZZLE_OPENINGS,
  ALL_PUZZLES,
  getPuzzlesByTheme,
  getPuzzlesByOpening,
  getDailyPuzzle,
  getStreakPuzzles,
  getStormPuzzles
} from '../data/puzzleDatabase.js';

// Calculate captured pieces dynamically from FEN
function getCapturedPieces(currentFen) {
  const STARTING_PIECES = {
    w: { p: 8, r: 2, n: 2, b: 2, q: 1 },
    b: { p: 8, r: 2, n: 2, b: 2, q: 1 }
  };
  const currentCount = {
    w: { p: 0, r: 0, n: 0, b: 0, q: 0 },
    b: { p: 0, r: 0, n: 0, b: 0, q: 0 }
  };

  const boardPart = (currentFen || '').split(' ')[0] || '';
  for (const char of boardPart) {
    if (char === '/' || (char >= '1' && char <= '8')) continue;
    const isWhite = char === char.toUpperCase();
    const type = char.toLowerCase();
    if (type === 'k') continue;
    const color = isWhite ? 'w' : 'b';
    if (currentCount[color][type] !== undefined) {
      currentCount[color][type]++;
    }
  }

  const capturedByWhite = [];
  const capturedByBlack = [];
  const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9 };
  let whiteMaterial = 0;
  let blackMaterial = 0;

  for (const type of ['q', 'r', 'b', 'n', 'p']) {
    const missingBlack = Math.max(0, STARTING_PIECES.b[type] - currentCount.b[type]);
    for (let i = 0; i < missingBlack; i++) {
      capturedByWhite.push(type);
      whiteMaterial += PIECE_VALUES[type] || 0;
    }

    const missingWhite = Math.max(0, STARTING_PIECES.w[type] - currentCount.w[type]);
    for (let i = 0; i < missingWhite; i++) {
      capturedByBlack.push(type);
      blackMaterial += PIECE_VALUES[type] || 0;
    }
  }

  const materialDiff = whiteMaterial - blackMaterial;

  return {
    white: capturedByWhite,
    black: capturedByBlack,
    whiteAdvantage: materialDiff > 0 ? `+${materialDiff}` : null,
    blackAdvantage: materialDiff < 0 ? `+${Math.abs(materialDiff)}` : null
  };
}

// MiniBoard preview for Hub cards
function MiniBoard({ fen, flipped = false }) {
  const pieces = React.useMemo(() => {
    const map = {};
    if (!fen) return map;
    const boardPart = fen.split(' ')[0];
    const rows = boardPart.split('/');
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    for (let r = 0; r < 8; r++) {
      const rank = 8 - r;
      const row = rows[r] || '8';
      let fIdx = 0;
      for (const char of row) {
        if (char >= '1' && char <= '8') {
          fIdx += parseInt(char, 10);
        } else {
          const file = files[fIdx];
          if (file) {
            map[`${file}${rank}`] = {
              type: char.toLowerCase(),
              color: char === char.toUpperCase() ? 'w' : 'b'
            };
          }
          fIdx++;
        }
      }
    }
    return map;
  }, [fen]);

  const ranks = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const files = flipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  return (
    <div className="w-20 h-20 sm:w-24 sm:h-24 grid grid-cols-8 grid-rows-8 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 shadow-xs shrink-0">
      {ranks.map((rank, rIdx) =>
        files.map((file, fIdx) => {
          const sq = `${file}${rank}`;
          const isLight = (rIdx + fIdx) % 2 === 0;
          const piece = pieces[sq];
          return (
            <div
              key={sq}
              className={`flex items-center justify-center ${
                isLight ? 'bg-[#dee3e6]' : 'bg-[#8ca2be]'
              }`}
            >
              {piece && (
                <div className="w-full h-full flex items-center justify-center p-0.5">
                  <PieceIcon piece={piece.type} color={piece.color} size={10} />
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export function PuzzleView({ currentUser, onUpdateRating, isLight = false, isOled = false }) {
  const isLightMode = isLight || (!isOled && typeof document !== 'undefined' && !document.documentElement.classList.contains('dark'));
  // Navigation View State: 'hub' | 'themes' | 'openings' | 'streak' | 'storm' | 'trainer'
  const [viewState, setViewState] = useState('hub');
  const [activeThemeTitle, setActiveThemeTitle] = useState('Chess tactics trainer');

  // Active Puzzles Queue & Session
  const [puzzles, setPuzzles] = useState(ALL_PUZZLES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentFen, setCurrentFen] = useState(ALL_PUZZLES[0].fen);
  const [solutionStep, setSolutionStep] = useState(0);
  const [status, setStatus] = useState('playing'); // 'playing' | 'correct_step' | 'solved' | 'failed'
  const [hintShown, setHintShown] = useState(false);
  const [revealedSolution, setRevealedSolution] = useState(false);
  const [lastMove, setLastMove] = useState(null);

  // Settings
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [puzzleSettings, setPuzzleSettings] = useState(() => {
    try {
      const saved = safeStorage.getItem('arena_puzzle_settings');
      return saved ? JSON.parse(saved) : { sound: true, autoJump: false };
    } catch {
      return { sound: true, autoJump: false };
    }
  });

  // Puzzle Streak Mode State
  const [streakCount, setStreakCount] = useState(0);
  const [streakRating, setStreakRating] = useState(1016);
  const [streakGameOver, setStreakGameOver] = useState(false);
  const [streakPuzzlesList, setStreakPuzzlesList] = useState([]);
  const [streakIdx, setStreakIdx] = useState(0);
  const [streakHighScore, setStreakHighScore] = useState(() => {
    try {
      return Number(safeStorage.getItem('arena_streak_highscore')) || 0;
    } catch {
      return 0;
    }
  });

  // Puzzle Storm Mode State
  const [stormScore, setStormScore] = useState(0);
  const [stormCombo, setStormCombo] = useState(0);
  const [stormTimeRemaining, setStormTimeRemaining] = useState(180); // 3:00 min
  const [stormActive, setStormActive] = useState(false);
  const [stormFinished, setStormFinished] = useState(false);
  const [stormHighScore, setStormHighScore] = useState(() => {
    try {
      return Number(safeStorage.getItem('arena_storm_highscore')) || 0;
    } catch {
      return 0;
    }
  });
  const stormTimerRef = useRef(null);

  // Solved Puzzles Set
  const [solvedPuzzles, setSolvedPuzzles] = useState(() => {
    try {
      const saved = safeStorage.getItem('arena_solved_puzzles');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Themes Search & Accordion State
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({
    phases: true,
    motifs: false,
    advanced: false,
    mates: false,
    mate_themes: false,
    special_moves: false,
    goals: false,
    lengths: false,
    origin: false
  });
  const [openingsSortBy, setOpeningsSortBy] = useState('count'); // 'count' | 'name'

  // User Rating
  const [puzzleRating, setPuzzleRating] = useState(currentUser?.ratings?.puzzle || 1200);

  // Save Settings
  const updateSettings = (key, val) => {
    const next = { ...puzzleSettings, [key]: val };
    setPuzzleSettings(next);
    safeStorage.setItem('arena_puzzle_settings', JSON.stringify(next));
    if (key === 'sound') {
      sound.enabled = val;
    }
  };

  // Current Puzzle
  const currentPuzzle = puzzles[currentIndex] || ALL_PUZZLES[0];
  const sideToMove = currentPuzzle?.turn === 'b' ? 'black' : 'white';
  const shouldFlipBoard = currentPuzzle?.turn === 'b';

  // Load Puzzle Helper
  const loadPuzzle = (puz) => {
    if (!puz) return;
    setCurrentFen(puz.fen);
    setSolutionStep(0);
    setStatus('playing');
    setHintShown(false);
    setRevealedSolution(false);
    setLastMove(null);
  };

  // Launch Trainer with custom set
  const startTrainerWithTheme = (themeName, puzzleSubset) => {
    const list = puzzleSubset && puzzleSubset.length > 0 ? puzzleSubset : ALL_PUZZLES;
    setPuzzles(list);
    setCurrentIndex(0);
    setActiveThemeTitle(themeName);
    loadPuzzle(list[0]);
    setViewState('trainer');
  };

  // Handle User Move
  const handleMove = (moveObj) => {
    if (!currentPuzzle || status === 'solved' || (viewState === 'storm' && !stormActive && stormFinished)) return;

    // Validate and sanitize promotion: ONLY pawn moves landing on rank 8 or 1 can promote
    let promo = '';
    try {
      const tempC = new Chess(currentFen);
      const piece = tempC.get(moveObj.from);
      if (piece?.type === 'p' && (moveObj.to.endsWith('8') || moveObj.to.endsWith('1'))) {
        promo = (moveObj.promotion || 'q').toLowerCase();
      }
    } catch (e) {
      if (moveObj.promotion) promo = moveObj.promotion.toLowerCase();
    }

    const uciMove = `${moveObj.from}${moveObj.to}${promo}`.toLowerCase();
    const expectedMove = (currentPuzzle.solution?.[solutionStep] || '').toLowerCase().trim();

    if (uciMove === expectedMove) {
      const nextStep = solutionStep + 1;
      const chess = new Chess(currentFen);
      const cleanMove = promo
        ? { from: moveObj.from, to: moveObj.to, promotion: promo }
        : { from: moveObj.from, to: moveObj.to };
      const moveRes = chess.move(cleanMove);
      setCurrentFen(chess.fen());
      setLastMove({ from: moveObj.from, to: moveObj.to });

      // Audio & Haptics for Player Move
      if (moveRes?.captured) {
        if (puzzleSettings.sound) sound.playCapture();
        triggerHaptic('capture');
      } else if (chess.inCheck()) {
        if (puzzleSettings.sound) sound.playCheck();
        triggerHaptic('check');
      } else {
        if (puzzleSettings.sound) sound.playMove();
        triggerHaptic('move');
      }

      if (nextStep >= currentPuzzle.solution.length) {
        // Complete solve!
        setStatus('solved');
        if (puzzleSettings.sound) sound.playVictory();

        if (viewState === 'streak') {
          setStreakCount(prev => {
            const next = prev + 1;
            if (next > streakHighScore) {
              setStreakHighScore(next);
              safeStorage.setItem('arena_streak_highscore', String(next));
            }
            return next;
          });
          setStreakRating(prev => prev + 15);
          confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
          setTimeout(() => {
            handleNextStreakPuzzle();
          }, 800);
        } else if (viewState === 'storm') {
          setStormScore(prev => {
            const next = prev + 1;
            if (next > stormHighScore) {
              setStormHighScore(next);
              safeStorage.setItem('arena_storm_highscore', String(next));
            }
            return next;
          });
          setStormCombo(prev => {
            const nextCombo = prev + 1;
            // Bonus time for combos
            if (nextCombo === 5) setStormTimeRemaining(t => t + 3);
            if (nextCombo === 10) setStormTimeRemaining(t => t + 5);
            return nextCombo;
          });
          setTimeout(() => {
            handleNextStormPuzzle();
          }, 300);
        } else {
          // Standard trainer solve
          setPuzzleRating(prev => prev + 15);
          setSolvedPuzzles(prev => {
            const next = new Set(prev);
            next.add(currentPuzzle.id);
            safeStorage.setItem('arena_solved_puzzles', JSON.stringify([...next]));
            return next;
          });
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          if (onUpdateRating) onUpdateRating(puzzleRating + 15);

          // Backend save
          fetch(`/api/puzzles/${currentPuzzle.id}/solve`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${safeStorage.getItem('token')}`
            },
            body: JSON.stringify({ success: true })
          }).catch(() => {});

          if (puzzleSettings.autoJump) {
            setTimeout(() => {
              handleNextPuzzle();
            }, 1000);
          }
        }
      } else {
        // Correct step: opponent replies automatically
        setStatus('correct_step');
        setSolutionStep(nextStep);

        const oppUci = currentPuzzle?.solution?.[nextStep];
        setTimeout(() => {
          if (!oppUci) return;
          const oppFrom = oppUci.substring(0, 2);
          const oppTo = oppUci.substring(2, 4);
          const oppProm = oppUci.length > 4 ? oppUci.substring(4, 5).toLowerCase() : undefined;

          try {
            const oppMove = oppProm ? { from: oppFrom, to: oppTo, promotion: oppProm } : { from: oppFrom, to: oppTo };
            const oppRes = chess.move(oppMove);
            setCurrentFen(chess.fen());
            setLastMove({ from: oppFrom, to: oppTo });
            setSolutionStep(nextStep + 1);
            setStatus('playing');

            if (oppRes?.captured) {
              if (puzzleSettings.sound) sound.playCapture();
              triggerHaptic('capture');
            } else if (chess.inCheck()) {
              if (puzzleSettings.sound) sound.playCheck();
              triggerHaptic('check');
            } else {
              if (puzzleSettings.sound) sound.playMove();
              triggerHaptic('move');
            }
          } catch (e) {
            console.error('Opponent move execution failed:', e);
          }
        }, viewState === 'storm' ? 250 : 500);
      }
    } else {
      // Wrong Move
      setStatus('failed');
      setLastMove({ from: moveObj.from, to: moveObj.to });
      if (puzzleSettings.sound) sound.playGameOver();
      triggerHaptic('error');

      if (viewState === 'streak') {
        setStreakGameOver(true);
      } else if (viewState === 'storm') {
        setStormCombo(0); // Reset combo
      }
    }
  };

  const handleNextPuzzle = () => {
    const nextIdx = (currentIndex + 1) % puzzles.length;
    setCurrentIndex(nextIdx);
    loadPuzzle(puzzles[nextIdx]);
  };

  const handlePrevPuzzle = () => {
    const prevIdx = (currentIndex - 1 + puzzles.length) % puzzles.length;
    setCurrentIndex(prevIdx);
    loadPuzzle(puzzles[prevIdx]);
  };

  const handleShowSolution = () => {
    setRevealedSolution(true);
    setStatus('failed');
  };

  // Streak Mode Handlers
  const startStreakMode = () => {
    const streakList = getStreakPuzzles();
    setStreakPuzzlesList(streakList);
    setStreakIdx(0);
    setStreakCount(0);
    setStreakRating(1016);
    setStreakGameOver(false);
    setPuzzles(streakList);
    setCurrentIndex(0);
    loadPuzzle(streakList[0]);
    setViewState('streak');
  };

  const handleNextStreakPuzzle = () => {
    const next = streakIdx + 1;
    if (next < streakPuzzlesList.length) {
      setStreakIdx(next);
      setCurrentIndex(next);
      loadPuzzle(streakPuzzlesList[next]);
    } else {
      // Completed all streak puzzles
      setStreakGameOver(true);
    }
  };

  const handleSkipStreak = () => {
    handleNextStreakPuzzle();
  };

  // Storm Mode Handlers
  const startStormMode = () => {
    const stormList = getStormPuzzles();
    setPuzzles(stormList);
    setCurrentIndex(0);
    setStormScore(0);
    setStormCombo(0);
    setStormTimeRemaining(180);
    setStormActive(true);
    setStormFinished(false);
    loadPuzzle(stormList[0]);
    setViewState('storm');

    if (stormTimerRef.current) clearInterval(stormTimerRef.current);
    stormTimerRef.current = setInterval(() => {
      setStormTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(stormTimerRef.current);
          setStormActive(false);
          setStormFinished(true);
          if (puzzleSettings.sound) sound.playGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleNextStormPuzzle = () => {
    const next = (currentIndex + 1) % puzzles.length;
    setCurrentIndex(next);
    loadPuzzle(puzzles[next]);
  };

  const handleEndStorm = () => {
    if (stormTimerRef.current) clearInterval(stormTimerRef.current);
    setStormActive(false);
    setStormFinished(true);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (stormTimerRef.current) clearInterval(stormTimerRef.current);
    };
  }, []);

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  // Filter Themes by search query
  const filteredCategories = THEME_CATEGORIES.map(cat => {
    if (!searchQuery.trim()) return cat;
    const q = searchQuery.toLowerCase();
    const matchingItems = cat.items.filter(
      item => item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
    );
    return { ...cat, items: matchingItems };
  }).filter(cat => cat.items.length > 0);

  // Filter Openings by search query and sort
  const filteredOpenings = PUZZLE_OPENINGS.filter(op => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return op.name.toLowerCase().includes(q) || (op.code && op.code.toLowerCase().includes(q));
  }).sort((a, b) => {
    if (openingsSortBy === 'name') return a.name.localeCompare(b.name);
    return b.count - a.count;
  });

  // Format Storm Time mm:ss
  const formatStormTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Board theme resolution for light/dark
  const activeBoardTheme = safeStorage.getItem('arena_board_theme') || (isLightMode ? 'greenwich' : 'amoled');

  // ================= VIEW 1: THEMES DIRECTORY =================
  if (viewState === 'themes') {
    return (
      <div className={`max-w-md mx-auto w-full px-3.5 py-4 min-h-screen pb-24 space-y-4 animate-fade-in ${
        isLightMode ? 'text-slate-900' : 'text-slate-100'
      }`}>
        {/* Top Header */}
        <div className={`flex items-center gap-3 py-2 border-b ${isLightMode ? 'border-slate-200' : 'border-slate-800'}`}>
          <button
            onClick={() => {
              sound.playClick();
              triggerHaptic('move');
              setViewState('hub');
            }}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isLightMode
                ? 'bg-white border border-slate-250 text-slate-700 hover:bg-slate-100 shadow-xs'
                : 'bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-base sm:text-lg font-black tracking-tight ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
              Puzzle Themes
            </h1>
            <p className={`text-[11px] font-medium ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Drill tactical motifs, pins, forks & mates
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLightMode ? 'text-slate-400' : 'text-slate-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tactical motifs (e.g. Pin, Fork)..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 border transition-all ${
              isLightMode
                ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-xs'
                : 'bg-slate-900/90 border-slate-800 text-slate-100 placeholder:text-slate-500'
            }`}
          />
        </div>

        {/* By Openings Row */}
        <div className={`border-b pb-2 ${isLightMode ? 'border-slate-200' : 'border-slate-800/80'}`}>
          <button
            onClick={() => {
              sound.playClick();
              triggerHaptic('move');
              setViewState('openings');
            }}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all group cursor-pointer ${
              isLightMode
                ? 'bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 shadow-xs'
                : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base shadow-xs ${
                isLightMode
                  ? 'bg-amber-100 border border-amber-300 text-amber-800'
                  : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
              }`}>
                📖
              </div>
              <div className="text-left">
                <span className={`text-xs font-bold block transition-colors ${
                  isLightMode
                    ? 'text-slate-900 group-hover:text-amber-700'
                    : 'text-white group-hover:text-amber-400'
                }`}>
                  By openings
                </span>
                <span className={`text-[11px] font-medium ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Sicilian, French, Caro-Kann & more
                </span>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
              isLightMode ? 'text-slate-400 group-hover:text-amber-700' : 'text-slate-400 group-hover:text-amber-400'
            }`} />
          </button>
        </div>

        {/* Accordion Categories */}
        <div className={`space-y-1 divide-y ${isLightMode ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
          {filteredCategories.map(cat => {
            const isExpanded = expandedCategories[cat.id] ?? false;
            return (
              <div key={cat.id} className="pt-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    triggerHaptic('move');
                    toggleCategory(cat.id);
                  }}
                  className={`w-full flex items-center justify-between py-2.5 px-2 rounded-xl transition-colors cursor-pointer ${
                    isLightMode ? 'hover:bg-slate-100' : 'hover:bg-slate-900/60'
                  }`}
                >
                  <span className={`text-xs sm:text-sm font-bold ${isLightMode ? 'text-slate-900' : 'text-slate-200'}`}>
                    {cat.name}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-amber-500" />
                  ) : (
                    <ChevronRight className={`w-4 h-4 ${isLightMode ? 'text-slate-400' : 'text-slate-400'}`} />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-1 mb-2 space-y-1 pl-2">
                    {cat.items.map(item => (
                      <div
                        key={item.id}
                        onClick={() => {
                          sound.playClick();
                          triggerHaptic('move');
                          const subset = getPuzzlesByTheme(item.name);
                          startTrainerWithTheme(item.name, subset);
                        }}
                        className={`flex items-start justify-between py-2.5 px-3 rounded-xl cursor-pointer transition-colors group border border-transparent ${
                          isLightMode
                            ? 'hover:bg-amber-50 hover:border-amber-300'
                            : 'hover:bg-amber-500/10 hover:border-amber-500/20'
                        }`}
                      >
                        <div className="flex gap-2.5 min-w-0">
                          <div className={`mt-0.5 shrink-0 transition-colors ${
                            isLightMode
                              ? 'text-slate-400 group-hover:text-amber-700'
                              : 'text-slate-400 group-hover:text-amber-400'
                          }`}>
                            <BookOpen className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className={`text-xs font-semibold truncate ${
                              isLightMode
                                ? 'text-slate-800 group-hover:text-amber-800'
                                : 'text-slate-200 group-hover:text-amber-300'
                            }`}>
                              {item.name}
                            </div>
                            <div className={`text-[10px] mt-0.5 leading-relaxed line-clamp-1 ${
                              isLightMode ? 'text-slate-500' : 'text-slate-400'
                            }`}>
                              {item.desc}
                            </div>
                          </div>
                        </div>
                        <div className={`text-[11px] font-mono font-bold ml-2 shrink-0 ${
                          isLightMode ? 'text-amber-800' : 'text-amber-400/80'
                        }`}>
                          {item.count.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ================= VIEW 2: PUZZLES BY OPENINGS =================
  if (viewState === 'openings') {
    return (
      <div className={`max-w-md mx-auto w-full px-3.5 py-4 min-h-screen pb-24 space-y-4 animate-fade-in ${
        isLightMode ? 'text-slate-900' : 'text-slate-100'
      }`}>
        {/* Top Header */}
        <div className={`flex items-center justify-between py-2 border-b ${isLightMode ? 'border-slate-200' : 'border-slate-800'}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                triggerHaptic('move');
                setViewState('themes');
              }}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isLightMode
                  ? 'bg-white border border-slate-250 text-slate-700 hover:bg-slate-100 shadow-xs'
                  : 'bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className={`text-base sm:text-lg font-black tracking-tight ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                Puzzles by Openings
              </h1>
              <p className={`text-[11px] font-medium ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Opening refutations & traps
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              triggerHaptic('move');
              setOpeningsSortBy(prev => (prev === 'count' ? 'name' : 'count'));
            }}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isLightMode
                ? 'bg-white border border-slate-250 text-slate-600 hover:text-amber-700 shadow-xs'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400'
            }`}
            title="Toggle sort"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLightMode ? 'text-slate-400' : 'text-slate-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search openings (e.g. Sicilian, French)..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 border transition-all ${
              isLightMode
                ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-xs'
                : 'bg-slate-900/90 border-slate-800 text-slate-100 placeholder:text-slate-500'
            }`}
          />
        </div>

        {/* Openings List */}
        <div className={`space-y-1 divide-y ${isLightMode ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
          {filteredOpenings.map(op => (
            <div
              key={op.id}
              onClick={() => {
                sound.playClick();
                triggerHaptic('move');
                const subset = getPuzzlesByOpening(op.name);
                startTrainerWithTheme(op.name, subset);
              }}
              className={`flex items-center justify-between py-2.5 px-3 rounded-xl cursor-pointer transition-colors group border border-transparent ${
                isLightMode
                  ? 'hover:bg-amber-50/70 hover:border-amber-300'
                  : 'hover:bg-slate-900/80 hover:border-slate-800'
              }`}
            >
              <div className="min-w-0">
                <div className={`text-xs font-bold truncate transition-colors ${
                  isLightMode
                    ? 'text-slate-800 group-hover:text-amber-800'
                    : 'text-slate-200 group-hover:text-amber-400'
                }`}>
                  {op.name}
                </div>
                {op.code && (
                  <div className={`text-[10px] font-mono font-medium ${isLightMode ? 'text-slate-500' : 'text-slate-500'}`}>{op.code}</div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[11px] font-mono font-bold ${isLightMode ? 'text-amber-800' : 'text-amber-400/80'}`}>
                  {op.count.toLocaleString()}
                </span>
                <ChevronRight className={`w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform ${
                  isLightMode ? 'text-slate-400 group-hover:text-amber-700' : 'text-slate-500 group-hover:text-amber-400'
                }`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ================= VIEW 3: PUZZLE STREAK =================
  if (viewState === 'streak') {
    const capturedPieces = getCapturedPieces(currentFen);

    return (
      <div className={`max-w-md mx-auto w-full px-3 py-2 min-h-screen flex flex-col gap-2 pb-24 ${
        isLightMode ? 'text-slate-900' : 'text-slate-100'
      }`}>
        {/* Top Header */}
        <div className={`flex items-center justify-between py-1 border-b ${isLightMode ? 'border-slate-200' : 'border-slate-800'}`}>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setViewState('hub')}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                isLightMode
                  ? 'bg-white border border-slate-250 text-slate-700 hover:bg-slate-100 shadow-xs'
                  : 'bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className={`text-sm font-black flex items-center gap-1.5 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                <span>Puzzle Streak</span>
                <span className="text-xs">🏹🍎</span>
              </h1>
              <p className={`text-[10px] font-medium ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>One life, how far can you go?</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSettingsOpen(true)}
              className={`p-1.5 rounded-xl transition-colors ${
                isLightMode
                  ? 'bg-white border border-slate-250 text-slate-600 hover:text-slate-900 shadow-xs'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Info className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateSettings('sound', !puzzleSettings.sound)}
              className={`p-1.5 rounded-xl transition-colors ${
                isLightMode
                  ? 'bg-white border border-slate-250 text-slate-600 hover:text-slate-900 shadow-xs'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {puzzleSettings.sound ? (
                <Volume2 className={`w-4 h-4 ${isLightMode ? 'text-amber-700' : 'text-amber-400'}`} />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Streak Score & Rating Bar */}
        <div className={`flex items-center justify-between px-3 py-2 rounded-2xl border shadow-sm ${
          isLightMode
            ? 'bg-white/95 border-amber-300/80 shadow-xs'
            : 'bg-slate-900/90 border-slate-800 shadow-md'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏹🍎</span>
            <div>
              <span className={`text-[10px] uppercase font-mono font-bold tracking-wider block leading-tight ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}>Streak</span>
              <span className={`text-xl font-black font-mono leading-tight ${
                isLightMode ? 'text-amber-700' : 'text-amber-400'
              }`}>
                {streakCount}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-[10px] uppercase font-mono font-bold tracking-wider block leading-tight ${
              isLightMode ? 'text-slate-500' : 'text-slate-400'
            }`}>Rating</span>
            <span className={`text-sm font-black font-mono leading-tight ${
              isLightMode ? 'text-slate-900' : 'text-white'
            }`}>
              {streakRating}
            </span>
          </div>
        </div>

        {/* Opponent Card & Captured Tray (Above Board) */}
        <div className={`flex items-center justify-between px-3 py-1.5 rounded-2xl border ${
          isLightMode
            ? 'bg-white/95 border-slate-200 shadow-xs'
            : 'bg-slate-900/90 border-slate-800/90 shadow-md'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
              isLightMode ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-700'
            }`}>
              <PieceIcon piece="k" color={sideToMove === 'white' ? 'b' : 'w'} size={18} />
            </div>
            <div>
              <span className={`text-xs font-bold block leading-tight ${
                isLightMode ? 'text-slate-800' : 'text-slate-300'
              }`}>
                Opponent ({sideToMove === 'white' ? 'Black' : 'White'})
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              {(sideToMove === 'white' ? capturedPieces.black : capturedPieces.white).map((pType, idx) => (
                <div key={idx} className="shrink-0">
                  <PieceIcon
                    piece={pType}
                    color={sideToMove === 'white' ? 'w' : 'b'}
                    size={16}
                  />
                </div>
              ))}
            </div>
            {(sideToMove === 'white' ? capturedPieces.blackAdvantage : capturedPieces.whiteAdvantage) && (
              <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20 font-mono">
                {sideToMove === 'white' ? capturedPieces.blackAdvantage : capturedPieces.whiteAdvantage}
              </span>
            )}
          </div>
        </div>

        {/* Turn Status Banner */}
        <div className={`px-3 py-2 rounded-2xl border flex items-center gap-2.5 ${
          isLightMode
            ? 'bg-amber-50 border-amber-300/80 shadow-xs'
            : 'bg-amber-500/10 border-amber-500/20'
        }`}>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${
            isLightMode ? 'bg-white border-amber-300' : 'bg-slate-950 border-amber-500/30'
          }`}>
            <PieceIcon piece="k" color={sideToMove === 'white' ? 'w' : 'b'} size={18} />
          </div>
          <div>
            <div className={`text-xs font-black ${isLightMode ? 'text-slate-900' : 'text-white'}`}>Your turn</div>
            <div className={`text-[10px] font-medium ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
              Find the best move for {sideToMove}.
            </div>
          </div>
        </div>

        {/* Interactive Chessboard */}
        <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-2xl relative my-auto">
          <Chessboard
            fen={currentFen}
            boardTheme={activeBoardTheme}
            playerColor="auto"
            flipped={shouldFlipBoard}
            onMove={handleMove}
            lastMove={lastMove}
            disabled={status === 'solved' || streakGameOver}
          />
        </div>

        {/* Player Card & Captured Tray (Below Board) */}
        <div className={`flex items-center justify-between px-3 py-1.5 rounded-2xl border ${
          isLightMode
            ? 'bg-white/95 border-slate-200 shadow-xs'
            : 'bg-slate-900/90 border-slate-800/90 shadow-md'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center overflow-hidden shrink-0 ${
              isLightMode ? 'bg-slate-100 border-amber-500' : 'bg-slate-950 border-amber-400/80'
            }`}>
              <img
                src={currentUser?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser?.username || 'You'}`}
                alt="You"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className={`text-xs font-bold block leading-tight ${
                isLightMode ? 'text-slate-900' : 'text-white'
              }`}>
                {currentUser?.username || 'You'} ({sideToMove === 'white' ? 'White' : 'Black'})
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              {(sideToMove === 'white' ? capturedPieces.white : capturedPieces.black).map((pType, idx) => (
                <div key={idx} className="shrink-0">
                  <PieceIcon
                    piece={pType}
                    color={sideToMove === 'white' ? 'b' : 'w'}
                    size={16}
                  />
                </div>
              ))}
            </div>
            {(sideToMove === 'white' ? capturedPieces.whiteAdvantage : capturedPieces.blackAdvantage) && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 font-mono">
                {sideToMove === 'white' ? capturedPieces.whiteAdvantage : capturedPieces.blackAdvantage}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className={`p-2 rounded-2xl border shadow-lg flex items-center justify-between gap-2 ${
          isLightMode
            ? 'bg-white/95 border-slate-200'
            : 'bg-slate-900/95 border-slate-800 shadow-xl'
        }`}>
          <button
            onClick={handleSkipStreak}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs ${
              isLightMode
                ? 'bg-slate-100 text-slate-800 border border-slate-250 hover:bg-slate-200'
                : 'bg-slate-950/80 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            <ChevronRight className="w-4 h-4 text-amber-500" />
            <span>Skip this move</span>
          </button>
        </div>

        {/* Streak Over Modal */}
        {streakGameOver && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 text-center space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center text-3xl">
                🏹🍎
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Streak Ended</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  You reached a streak of {streakCount} puzzles!
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 font-mono text-sm space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Streak Rating:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{streakRating}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Puzzles Solved:</span>
                  <span className="font-bold text-sky-500">{streakCount}</span>
                </div>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    triggerHaptic('move');
                    setViewState('hub');
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-bold text-xs transition-all active:scale-95 shadow-md"
                >
                  Exit to Hub
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    triggerHaptic('move');
                    startStreakMode();
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all active:scale-95"
                >
                  New Streak 🏹
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ================= VIEW 4: PUZZLE STORM =================
  if (viewState === 'storm') {
    const capturedPieces = getCapturedPieces(currentFen);

    return (
      <div className={`max-w-md mx-auto w-full px-3 py-2 min-h-screen flex flex-col gap-2 pb-24 ${
        isLightMode ? 'text-slate-900' : 'text-slate-100'
      }`}>
        {/* Top Header */}
        <div className={`flex items-center justify-between py-1 border-b ${isLightMode ? 'border-slate-200' : 'border-slate-800'}`}>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                handleEndStorm();
                setViewState('hub');
              }}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                isLightMode
                  ? 'bg-white border border-slate-250 text-slate-700 hover:bg-slate-100 shadow-xs'
                  : 'bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className={`text-sm font-black flex items-center gap-1.5 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                <span>Puzzle Storm</span>
                <span className="text-xs">🌪️</span>
              </h1>
              <p className={`text-[10px] font-medium ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Solve as many puzzles as you can in 3 min
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSettingsOpen(true)}
              className={`p-1.5 rounded-xl transition-colors ${
                isLightMode
                  ? 'bg-white border border-slate-250 text-slate-600 hover:text-slate-900 shadow-xs'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Score & Timer Header Bar */}
        <div className={`flex items-center justify-between px-3 py-2 rounded-2xl border shadow-sm ${
          isLightMode
            ? 'bg-white/95 border-slate-250 shadow-xs'
            : 'bg-slate-900/90 border-slate-800 shadow-md'
        }`}>
          {/* Tornado Score Badge */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌪️</span>
            <div>
              <span className={`text-[10px] uppercase font-mono font-bold tracking-wider block leading-tight ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}>Score</span>
              <span className={`text-xl font-black font-mono leading-tight ${
                isLightMode ? 'text-sky-700' : 'text-sky-400'
              }`}>
                {stormScore}
              </span>
            </div>
          </div>

          {/* Countdown Clock */}
          <div
            className={`px-4 py-1.5 rounded-xl font-mono text-lg font-black border ${
              stormTimeRemaining < 30
                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40 animate-pulse'
                : isLightMode
                ? 'bg-slate-50 text-amber-700 border-amber-300 shadow-xs'
                : 'bg-slate-950 text-amber-400 border-slate-800 shadow-xs'
            }`}
          >
            {formatStormTime(stormTimeRemaining)}
          </div>
        </div>

        {/* Opponent Card & Captured Tray (Above Board) */}
        <div className={`flex items-center justify-between px-3 py-1.5 rounded-2xl border ${
          isLightMode
            ? 'bg-white/95 border-slate-200 shadow-xs'
            : 'bg-slate-900/90 border-slate-800/90 shadow-md'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
              isLightMode ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-700'
            }`}>
              <PieceIcon piece="k" color={sideToMove === 'white' ? 'b' : 'w'} size={18} />
            </div>
            <div>
              <span className={`text-xs font-bold block leading-tight ${
                isLightMode ? 'text-slate-800' : 'text-slate-300'
              }`}>
                Opponent ({sideToMove === 'white' ? 'Black' : 'White'})
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              {(sideToMove === 'white' ? capturedPieces.black : capturedPieces.white).map((pType, idx) => (
                <div key={idx} className="shrink-0">
                  <PieceIcon
                    piece={pType}
                    color={sideToMove === 'white' ? 'w' : 'b'}
                    size={16}
                  />
                </div>
              ))}
            </div>
            {(sideToMove === 'white' ? capturedPieces.blackAdvantage : capturedPieces.whiteAdvantage) && (
              <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20 font-mono">
                {sideToMove === 'white' ? capturedPieces.blackAdvantage : capturedPieces.whiteAdvantage}
              </span>
            )}
          </div>
        </div>

        {/* Interactive Chessboard */}
        <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-2xl relative my-auto">
          <Chessboard
            fen={currentFen}
            boardTheme={activeBoardTheme}
            playerColor="auto"
            flipped={shouldFlipBoard}
            onMove={handleMove}
            lastMove={lastMove}
            disabled={!stormActive}
          />
        </div>

        {/* Player Card & Captured Tray (Below Board) */}
        <div className={`flex items-center justify-between px-3 py-1.5 rounded-2xl border ${
          isLightMode
            ? 'bg-white/95 border-slate-200 shadow-xs'
            : 'bg-slate-900/90 border-slate-800/90 shadow-md'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center overflow-hidden shrink-0 ${
              isLightMode ? 'bg-slate-100 border-amber-500' : 'bg-slate-950 border-amber-400/80'
            }`}>
              <img
                src={currentUser?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser?.username || 'You'}`}
                alt="You"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className={`text-xs font-bold block leading-tight ${
                isLightMode ? 'text-slate-900' : 'text-white'
              }`}>
                {currentUser?.username || 'You'} ({sideToMove === 'white' ? 'White' : 'Black'})
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              {(sideToMove === 'white' ? capturedPieces.white : capturedPieces.black).map((pType, idx) => (
                <div key={idx} className="shrink-0">
                  <PieceIcon
                    piece={pType}
                    color={sideToMove === 'white' ? 'b' : 'w'}
                    size={16}
                  />
                </div>
              ))}
            </div>
            {(sideToMove === 'white' ? capturedPieces.whiteAdvantage : capturedPieces.blackAdvantage) && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 font-mono">
                {sideToMove === 'white' ? capturedPieces.whiteAdvantage : capturedPieces.blackAdvantage}
              </span>
            )}
          </div>
        </div>

        {/* Combo Multiplier Bar */}
        <div className="space-y-1 px-1">
          <div className={`flex items-center justify-between text-xs font-semibold ${
            isLightMode ? 'text-slate-600' : 'text-slate-400'
          }`}>
            <span className={`font-bold ${isLightMode ? 'text-sky-700' : 'text-sky-400'}`}>{stormCombo} Combo</span>
            <div className="flex gap-4 font-mono text-[10px]">
              <span>3s</span>
              <span>5s</span>
              <span>6s</span>
              <span>10s</span>
            </div>
          </div>
          <div className={`w-full h-2.5 rounded-full overflow-hidden p-0.5 ${
            isLightMode ? 'bg-slate-200' : 'bg-slate-800'
          }`}>
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (stormCombo / 10) * 100)}%` }}
            />
          </div>
        </div>

        {/* Bottom Run Controls */}
        <div className={`p-2 rounded-2xl border shadow-lg flex items-center justify-around gap-2 ${
          isLightMode
            ? 'bg-white/95 border-slate-200'
            : 'bg-slate-900/95 border-slate-800 shadow-xl'
        }`}>
          <button
            onClick={startStormMode}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs ${
              isLightMode
                ? 'bg-slate-100 text-slate-700 border border-slate-250 hover:bg-slate-200'
                : 'bg-slate-950/80 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            <Trash2 className={`w-3.5 h-3.5 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`} />
            <span>New run</span>
          </button>
          <button
            onClick={handleEndStorm}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs ${
              isLightMode
                ? 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
            }`}
          >
            <Flag className={`w-3.5 h-3.5 ${isLightMode ? 'text-rose-600' : 'text-rose-400'}`} />
            <span>End run</span>
          </button>
        </div>

        {/* Storm Finished Modal */}
        {stormFinished && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 text-center space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-500/20 text-sky-500 flex items-center justify-center text-3xl">
                🌪️
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Run Complete!</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  You scored {stormScore} in 3 minutes!
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 font-mono text-sm space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Score:</span>
                  <span className="font-bold text-sky-500 text-lg">{stormScore}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Max Combo:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{stormCombo}</span>
                </div>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    triggerHaptic('move');
                    setViewState('hub');
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-bold text-xs transition-all active:scale-95 shadow-md"
                >
                  Exit to Hub
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    triggerHaptic('move');
                    startStormMode();
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all active:scale-95"
                >
                  Play Again 🌪️
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ================= VIEW 5: TACTICS TRAINER (BOARD VIEW) =================
  if (viewState === 'trainer') {
    const capturedPieces = getCapturedPieces(currentFen);

    return (
      <div className={`max-w-md mx-auto w-full px-3 py-2 min-h-screen flex flex-col gap-2 pb-24 ${
        isLightMode ? 'text-slate-900' : 'text-slate-100'
      }`}>
        {/* Top Header */}
        <div className={`flex items-center justify-between py-1 border-b ${isLightMode ? 'border-slate-200' : 'border-slate-800'}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setViewState('hub')}
              className={`p-2 rounded-xl transition-colors shrink-0 active:scale-95 cursor-pointer ${
                isLightMode
                  ? 'bg-white border border-slate-250 text-slate-700 hover:bg-slate-100 shadow-xs'
                  : 'bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white text-slate-300 shadow-xs'
              }`}
              title="Back to Puzzle Hub"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="truncate">
              <h1 className={`text-sm sm:text-base font-extrabold truncate leading-tight ${
                isLightMode ? 'text-slate-900' : 'text-white'
              }`}>
                {activeThemeTitle || currentPuzzle.title || currentPuzzle.theme || 'Tactics Trainer'}
              </h1>
              <div className={`flex items-center gap-2 text-[10px] font-mono ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}>
                <span className={`font-bold ${isLightMode ? 'text-amber-800' : 'text-amber-400'}`}>{currentPuzzle.rating || 1350} ELO</span>
                <span>•</span>
                <span>{currentPuzzle.theme || 'Tactics'}</span>
                <span>•</span>
                <span className={`font-semibold ${isLightMode ? 'text-emerald-700' : 'text-emerald-400'}`}>+15 on solve</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => updateSettings('sound', !puzzleSettings.sound)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isLightMode
                  ? 'bg-white border border-slate-250 text-slate-600 hover:text-amber-700 shadow-xs'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 shadow-xs'
              }`}
              title={puzzleSettings.sound ? 'Mute sound' : 'Enable sound'}
            >
              {puzzleSettings.sound ? <Volume2 className={`w-4 h-4 ${isLightMode ? 'text-amber-700' : 'text-amber-400'}`} /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isLightMode
                  ? 'bg-white border border-slate-250 text-slate-600 hover:text-slate-900 shadow-xs'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white shadow-xs'
              }`}
              title="Puzzle Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Opponent Card & Captured Tray (Above Board) */}
        <div className={`flex items-center justify-between px-3 py-1.5 rounded-2xl border ${
          isLightMode
            ? 'bg-white/95 border-slate-200 shadow-xs'
            : 'bg-slate-900/90 border-slate-800/90 shadow-md'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center overflow-hidden shrink-0 ${
              isLightMode ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-700'
            }`}>
              <img
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=TrainerOpponent_${currentPuzzle.id}`}
                alt="Opponent"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className={`text-xs font-bold block leading-tight ${
                isLightMode ? 'text-slate-900' : 'text-white'
              }`}>
                Opponent ({sideToMove === 'white' ? 'Black' : 'White'})
              </span>
              <span className={`text-[10px] font-mono ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {currentPuzzle.rating || 1400} ELO
              </span>
            </div>
          </div>

          {/* Captured Pieces by Opponent */}
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              {(sideToMove === 'white' ? capturedPieces.black : capturedPieces.white).map((pType, idx) => (
                <div key={idx} className="shrink-0">
                  <PieceIcon
                    piece={pType}
                    color={sideToMove === 'white' ? 'w' : 'b'}
                    size={16}
                  />
                </div>
              ))}
            </div>
            {(sideToMove === 'white' ? capturedPieces.blackAdvantage : capturedPieces.whiteAdvantage) && (
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20 font-mono">
                {sideToMove === 'white' ? capturedPieces.blackAdvantage : capturedPieces.whiteAdvantage}
              </span>
            )}
          </div>
        </div>

        {/* Turn Status Banner */}
        <div className={`p-2.5 rounded-2xl border shadow-sm flex items-center justify-between transition-all ${
          status === 'solved'
            ? (isLightMode ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300')
            : status === 'failed'
            ? (isLightMode ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-rose-500/15 border-rose-500/50 text-rose-300')
            : status === 'correct_step'
            ? (isLightMode ? 'bg-amber-100 border-amber-300 text-amber-950' : 'bg-amber-500/15 border-amber-500/50 text-amber-300')
            : (isLightMode ? 'bg-white/95 border-amber-300/80 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-white')
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
              sideToMove === 'white'
                ? (isLightMode ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-white/10 border-white/30 text-white')
                : (isLightMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-black/40 border-slate-700 text-slate-300')
            }`}>
              <PieceIcon piece="k" color={sideToMove === 'white' ? 'w' : 'b'} size={20} />
            </div>
            <div className="truncate">
              <div className="text-xs font-black flex items-center gap-1.5 truncate">
                <span>
                  {status === 'solved'
                    ? '🎉 Puzzle Solved! (+15 ELO)'
                    : status === 'failed'
                    ? '❌ Incorrect move — Try again'
                    : status === 'correct_step'
                    ? '✓ Best move! Opponent replying...'
                    : `${sideToMove === 'white' ? 'White' : 'Black'} to move`}
                </span>
              </div>
              <div className={`text-[10px] truncate font-medium ${
                isLightMode ? 'text-slate-600' : 'text-slate-400'
              }`}>
                {status === 'solved'
                  ? 'Excellent calculation! Click Next for more.'
                  : status === 'failed'
                  ? 'Not the winning line. Tap Retry or Solution.'
                  : (currentPuzzle.hint ? 'Find the winning continuation.' : `Find the best move for ${sideToMove}.`)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {status === 'solved' && (
              <button
                onClick={handleNextPuzzle}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1 active:scale-95 cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {status === 'failed' && (
              <button
                onClick={() => {
                  loadPuzzle(currentPuzzle);
                  sound.playMove();
                }}
                className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1 active:scale-95 cursor-pointer"
              >
                <span>Retry</span>
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Hint Box if triggered */}
        {hintShown && currentPuzzle.hint && (
          <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 shadow-xs animate-fade-in ${
            isLightMode
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
          }`}>
            <Lightbulb className={`w-4 h-4 shrink-0 ${isLightMode ? 'text-amber-700' : 'text-amber-400'}`} />
            <span className="font-semibold">{currentPuzzle.hint}</span>
          </div>
        )}

        {/* Revealed Solution */}
        {revealedSolution && currentPuzzle.solution && (
          <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 font-mono shadow-xs animate-fade-in ${
            isLightMode
              ? 'bg-sky-50 border-sky-300 text-sky-950 font-bold'
              : 'bg-sky-500/15 border-sky-500/40 text-sky-300'
          }`}>
            <Eye className={`w-4 h-4 shrink-0 ${isLightMode ? 'text-sky-700' : 'text-sky-400'}`} />
            <span>Winning moves: <strong>{currentPuzzle.solution.join(' ')}</strong></span>
          </div>
        )}

        {/* Interactive Chessboard */}
        <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-2xl relative my-auto">
          <Chessboard
            fen={currentFen}
            boardTheme={activeBoardTheme}
            playerColor="auto"
            flipped={shouldFlipBoard}
            onMove={handleMove}
            lastMove={lastMove}
            highlightSquares={hintShown && currentPuzzle.solution ? [currentPuzzle.solution[solutionStep]?.substring(0, 2)] : []}
            errorSquares={status === 'failed' && lastMove ? [lastMove.to] : []}
            disabled={status === 'solved'}
          />
        </div>

        {/* Player Card & Captured Tray (Below Board) */}
        <div className={`flex items-center justify-between px-3 py-1.5 rounded-2xl border ${
          isLightMode
            ? 'bg-white/95 border-slate-200 shadow-xs'
            : 'bg-slate-900/90 border-slate-800/90 shadow-md'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center overflow-hidden shrink-0 ${
              isLightMode ? 'bg-slate-100 border-amber-500' : 'bg-slate-950 border-amber-400/80'
            }`}>
              <img
                src={currentUser?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser?.username || 'You'}`}
                alt="You"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className={`text-xs font-bold block leading-tight ${
                isLightMode ? 'text-slate-900' : 'text-white'
              }`}>
                {currentUser?.username || 'You'} ({sideToMove === 'white' ? 'White' : 'Black'})
              </span>
              <span className={`text-[10px] font-mono font-bold ${
                isLightMode ? 'text-amber-800' : 'text-amber-400'
              }`}>
                {puzzleRating} ELO
              </span>
            </div>
          </div>

          {/* Captured Pieces by You */}
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              {(sideToMove === 'white' ? capturedPieces.white : capturedPieces.black).map((pType, idx) => (
                <div key={idx} className="shrink-0">
                  <PieceIcon
                    piece={pType}
                    color={sideToMove === 'white' ? 'b' : 'w'}
                    size={16}
                  />
                </div>
              ))}
            </div>
            {(sideToMove === 'white' ? capturedPieces.whiteAdvantage : capturedPieces.blackAdvantage) && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 font-mono">
                {sideToMove === 'white' ? capturedPieces.whiteAdvantage : capturedPieces.blackAdvantage}
              </span>
            )}
          </div>
        </div>

        {/* Premium Puzzle Controls Toolbar */}
        <div className={`p-2 rounded-2xl border shadow-lg flex items-center justify-between gap-1.5 flex-wrap ${
          isLightMode
            ? 'bg-white/95 border-slate-200'
            : 'bg-slate-900/95 border-slate-800 shadow-xl'
        }`}>
          {/* Hint Button */}
          <button
            onClick={() => {
              setHintShown(true);
              sound.playMove();
            }}
            className={`flex-1 min-w-[70px] py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer ${
              hintShown
                ? (isLightMode ? 'bg-amber-100 text-amber-900 border border-amber-400' : 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-amber-500/10')
                : (isLightMode ? 'bg-slate-100 text-slate-700 border border-slate-250 hover:bg-slate-200 hover:text-amber-800' : 'bg-slate-950/80 text-slate-300 border border-slate-800 hover:border-amber-500/40 hover:text-amber-300')
            }`}
            title="Show hint"
          >
            <Lightbulb className={`w-3.5 h-3.5 ${isLightMode ? 'text-amber-700' : 'text-amber-400'}`} />
            <span>Hint</span>
          </button>

          {/* Retry Button */}
          <button
            onClick={() => {
              loadPuzzle(currentPuzzle);
              sound.playMove();
            }}
            className={`flex-1 min-w-[70px] py-2 px-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer ${
              isLightMode
                ? 'bg-slate-100 text-slate-700 border-slate-250 hover:bg-slate-200 hover:text-slate-900'
                : 'bg-slate-950/80 text-slate-300 border border-slate-800 hover:border-slate-600 hover:text-white'
            }`}
            title="Reset position"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`} />
            <span>Retry</span>
          </button>

          {/* Solution Button */}
          <button
            onClick={() => {
              handleShowSolution();
              sound.playCheck();
            }}
            className={`flex-1 min-w-[75px] py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer ${
              revealedSolution
                ? (isLightMode ? 'bg-sky-100 text-sky-900 border border-sky-400' : 'bg-sky-500/20 text-sky-300 border border-sky-500/60')
                : (isLightMode ? 'bg-slate-100 text-slate-700 border border-slate-250 hover:bg-slate-200 hover:text-sky-800' : 'bg-slate-950/80 text-slate-300 border border-slate-800 hover:border-sky-500/40 hover:text-sky-300')
            }`}
            title="View solution"
          >
            <Eye className={`w-3.5 h-3.5 ${isLightMode ? 'text-sky-700' : 'text-sky-400'}`} />
            <span>Solution</span>
          </button>

          {/* Previous Button */}
          <button
            onClick={handlePrevPuzzle}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer ${
              isLightMode
                ? 'bg-slate-100 text-slate-600 border-slate-250 hover:bg-slate-200 hover:text-slate-900'
                : 'bg-slate-950/80 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
            title="Previous puzzle"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Next Puzzle Button */}
          <button
            onClick={handleNextPuzzle}
            className="flex-1 min-w-[105px] py-2 px-3 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 flex items-center justify-center gap-1 transition-all active:scale-95 shadow-lg shadow-amber-500/20 cursor-pointer"
            title="Next puzzle"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Settings Modal */}
        {settingsOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Settings</h3>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Sound Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Sound
                  </span>
                  <button
                    onClick={() => updateSettings('sound', !puzzleSettings.sound)}
                    className={`w-12 h-7 rounded-full p-1 transition-colors ${
                      puzzleSettings.sound ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        puzzleSettings.sound ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Jump to next puzzle immediately */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Jump to next puzzle immediately
                  </span>
                  <button
                    onClick={() => updateSettings('autoJump', !puzzleSettings.autoJump)}
                    className={`w-12 h-7 rounded-full p-1 transition-colors ${
                      puzzleSettings.autoJump ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        puzzleSettings.autoJump ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ================= VIEW 6: MAIN PUZZLE HUB (DEFAULT) =================
  const dailyPuzzle = getDailyPuzzle();

  return (
    <div className={`max-w-md mx-auto w-full px-3.5 py-4 min-h-screen pb-24 space-y-4 animate-fade-in transition-colors ${
      isLightMode ? 'text-slate-900' : 'text-slate-100'
    }`}>
      {/* 1. Sleek Compact Header Card */}
      <div className={`p-3.5 rounded-2xl border flex flex-col gap-3 transition-colors ${
        isLightMode
          ? 'bg-white border-slate-200/90 shadow-sm text-slate-900'
          : 'bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-950/95 border-amber-500/30 shadow-lg text-white'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0">
              <Flame className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-base font-black tracking-tight ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                  Tactics & Puzzles
                </h1>
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${
                  isLightMode
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                }`}>
                  FIDE Rated
                </span>
              </div>
              <p className={`text-[11px] font-medium ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Sharpen calculation with daily challenges & speed rush
              </p>
            </div>
          </div>
        </div>

        {/* 3 Status Capsules */}
        <div className={`grid grid-cols-3 gap-2 pt-1 border-t ${isLightMode ? 'border-slate-200' : 'border-slate-800/80'}`}>
          <div className={`px-2 py-1.5 rounded-xl border text-center shadow-xs ${
            isLightMode ? 'bg-slate-50 border-amber-300/80' : 'bg-slate-950/90 border-amber-500/30'
          }`}>
            <span className={`text-[9px] uppercase tracking-wider block font-bold ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Rating</span>
            <span className={`text-xs font-black font-mono ${isLightMode ? 'text-amber-700' : 'text-amber-400'}`}>{puzzleRating}</span>
          </div>

          <div className={`px-2 py-1.5 rounded-xl border text-center shadow-xs ${
            isLightMode ? 'bg-slate-50 border-orange-300/80' : 'bg-slate-950/90 border-orange-500/30'
          }`}>
            <span className={`text-[9px] uppercase tracking-wider block font-bold ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Best Streak</span>
            <span className={`text-xs font-black font-mono ${isLightMode ? 'text-orange-600' : 'text-orange-400'}`}>{streakHighScore || 0}</span>
          </div>

          <div className={`px-2 py-1.5 rounded-xl border text-center shadow-xs ${
            isLightMode ? 'bg-slate-50 border-emerald-300/80' : 'bg-slate-950/90 border-emerald-500/30'
          }`}>
            <span className={`text-[9px] uppercase tracking-wider block font-bold ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Solved</span>
            <span className={`text-xs font-black font-mono ${isLightMode ? 'text-emerald-700' : 'text-emerald-400'}`}>{solvedPuzzles?.size || 0}</span>
          </div>
        </div>
      </div>

      {/* 2. Featured: Daily Tactical Challenge (Hero Card) */}
      <div className={`p-4 rounded-2xl border flex flex-col gap-3 relative overflow-hidden group transition-all ${
        isLightMode
          ? 'bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 border-amber-300/80 shadow-md text-slate-900'
          : 'bg-gradient-to-br from-amber-500/15 via-slate-900/95 to-slate-950 border-amber-500/40 shadow-xl shadow-amber-950/20 text-white'
      }`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
            isLightMode
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}>
            <Crown className="w-3 h-3 text-amber-500" />
            <span>Daily Tactical Challenge</span>
          </span>
          <span className={`text-[10px] font-mono font-bold ${isLightMode ? 'text-amber-800' : 'text-amber-400/90'}`}>
            {dailyPuzzle.rating || 1750} Elo
          </span>
        </div>

        <div className="flex items-center gap-3.5 relative z-10">
          {/* Mini Board Preview */}
          <div className="relative shrink-0">
            <div className={`w-16 h-16 rounded-xl overflow-hidden border shadow-md ${isLightMode ? 'border-amber-300' : 'border-amber-400/50'}`}>
              <MiniBoard fen={dailyPuzzle.fen} flipped={dailyPuzzle.turn === 'b'} />
            </div>
            <span className={`absolute -bottom-1.5 inset-x-0 mx-auto text-center px-1.5 py-0.2 rounded-full border font-mono text-[8px] font-black uppercase shadow w-fit ${
              isLightMode
                ? 'bg-white text-amber-900 border-amber-400'
                : 'bg-slate-950 text-amber-400 border-amber-400/60'
            }`}>
              {dailyPuzzle.turn === 'b' ? '⚫ Black' : '⚪ White'}
            </span>
          </div>

          <div className="min-w-0">
            <h3 className={`text-sm font-black transition-colors ${
              isLightMode ? 'text-slate-900 group-hover:text-amber-700' : 'text-white group-hover:text-amber-200'
            }`}>
              Puzzle of the Day
            </h3>
            <p className={`text-xs mt-0.5 font-medium ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
              Curated official FIDE endgame & tactical motif
            </p>
            <div className={`flex items-center gap-1.5 mt-1 text-[10px] font-bold ${isLightMode ? 'text-emerald-700' : 'text-emerald-400'}`}>
              <Sparkles className="w-3 h-3" />
              <span>+15 Rating Points on Solve</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            triggerHaptic('move');
            setPuzzles([dailyPuzzle, ...ALL_PUZZLES]);
            setCurrentIndex(0);
            setActiveThemeTitle("Puzzle of the day");
            loadPuzzle(dailyPuzzle);
            setViewState('trainer');
          }}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:scale-[0.985] flex items-center justify-center gap-2 cursor-pointer relative z-10"
        >
          <Swords className="w-4 h-4 fill-slate-950" />
          <span>Solve Today's Puzzle</span>
        </button>
      </div>

      {/* 3. Core Tactical Modes (3 Sleek Action Cards, Stacked Vertically, Unified with PlayView) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Tactical Game Modes</span>
          </span>
          <span className={`text-[10px] font-mono ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`}>3 Modes</span>
        </div>

        {/* Mode 1: Puzzle Streak */}
        <button
          onClick={() => {
            sound.playClick();
            triggerHaptic('move');
            startStreakMode();
          }}
          className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 transform hover:-translate-y-0.5 active:scale-[0.985] group cursor-pointer relative overflow-hidden ${
            isLightMode
              ? 'bg-gradient-to-r from-orange-50/90 via-white to-white border-orange-200 hover:border-orange-400 shadow-sm text-slate-900'
              : 'bg-gradient-to-r from-orange-950/60 via-slate-900/90 to-slate-950/90 hover:from-orange-900/60 hover:to-slate-900 border-orange-500/30 hover:border-orange-400/60 shadow-lg shadow-orange-950/20 text-white'
          }`}
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0 ${
                isLightMode ? 'bg-orange-100 border-orange-300 text-orange-700' : 'bg-orange-500/15 border-orange-500/40 text-orange-400 group-hover:bg-orange-500/25'
              }`}>
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-black truncate transition-colors ${
                    isLightMode ? 'text-slate-900 group-hover:text-orange-700' : 'text-white group-hover:text-orange-200'
                  }`}>
                    Puzzle Streak
                  </span>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                    isLightMode
                      ? 'bg-orange-100 text-orange-800 border-orange-300'
                      : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                  }`}>
                    🔥 1 Life
                  </span>
                </div>
                <p className={`text-xs mt-0.5 font-medium truncate ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Escalating difficulty • One mistake ends run
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[10px] font-mono font-bold hidden sm:inline ${isLightMode ? 'text-orange-700' : 'text-orange-400'}`}>
                Best: {streakHighScore || 0}
              </span>
              <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-0.5 ${
                isLightMode ? 'text-slate-400 group-hover:text-orange-600' : 'text-slate-500 group-hover:text-orange-400'
              }`} />
            </div>
          </div>
        </button>

        {/* Mode 2: Puzzle Storm */}
        <button
          onClick={() => {
            sound.playClick();
            triggerHaptic('move');
            startStormMode();
          }}
          className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 transform hover:-translate-y-0.5 active:scale-[0.985] group cursor-pointer relative overflow-hidden ${
            isLightMode
              ? 'bg-gradient-to-r from-sky-50/90 via-white to-white border-sky-200 hover:border-sky-400 shadow-sm text-slate-900'
              : 'bg-gradient-to-r from-sky-950/60 via-slate-900/90 to-slate-950/90 hover:from-sky-900/60 hover:to-slate-900 border-sky-500/30 hover:border-sky-400/60 shadow-lg shadow-sky-950/20 text-white'
          }`}
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0 ${
                isLightMode ? 'bg-sky-100 border-sky-300 text-sky-700' : 'bg-sky-500/15 border-sky-500/40 text-sky-400 group-hover:bg-sky-500/25'
              }`}>
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-black truncate transition-colors ${
                    isLightMode ? 'text-slate-900 group-hover:text-sky-700' : 'text-white group-hover:text-sky-200'
                  }`}>
                    Puzzle Storm
                  </span>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                    isLightMode
                      ? 'bg-sky-100 text-sky-800 border-sky-300'
                      : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                  }`}>
                    ⚡ 3:00 Rush
                  </span>
                </div>
                <p className={`text-xs mt-0.5 font-medium truncate ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  3-minute blitz rush against ticking clock
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[10px] font-mono font-bold hidden sm:inline ${isLightMode ? 'text-sky-700' : 'text-sky-400'}`}>
                Best: {stormHighScore || 0}
              </span>
              <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-0.5 ${
                isLightMode ? 'text-slate-400 group-hover:text-sky-600' : 'text-slate-500 group-hover:text-sky-400'
              }`} />
            </div>
          </div>
        </button>

        {/* Mode 3: Themes & Openings */}
        <button
          onClick={() => {
            sound.playClick();
            triggerHaptic('move');
            setViewState('themes');
          }}
          className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 transform hover:-translate-y-0.5 active:scale-[0.985] group cursor-pointer relative overflow-hidden ${
            isLightMode
              ? 'bg-gradient-to-r from-purple-50/90 via-white to-white border-purple-200 hover:border-purple-400 shadow-sm text-slate-900'
              : 'bg-gradient-to-r from-purple-950/60 via-slate-900/90 to-slate-950/90 hover:from-purple-900/60 hover:to-slate-900 border-purple-500/30 hover:border-purple-400/60 shadow-lg shadow-purple-950/20 text-white'
          }`}
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0 ${
                isLightMode ? 'bg-purple-100 border-purple-300 text-purple-700' : 'bg-purple-500/15 border-purple-500/40 text-purple-400 group-hover:bg-purple-500/25'
              }`}>
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-black truncate transition-colors ${
                    isLightMode ? 'text-slate-900 group-hover:text-purple-700' : 'text-white group-hover:text-purple-200'
                  }`}>
                    Themes & Openings
                  </span>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                    isLightMode
                      ? 'bg-purple-100 text-purple-800 border-purple-300'
                      : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  }`}>
                    📚 60+ Motifs
                  </span>
                </div>
                <p className={`text-xs mt-0.5 font-medium truncate ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Pins, forks, skewers, checkmates & traps
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-0.5 ${
                isLightMode ? 'text-slate-400 group-hover:text-purple-600' : 'text-slate-500 group-hover:text-purple-400'
              }`} />
            </div>
          </div>
        </button>
      </div>

      {/* 4. Popular Tactical Motifs (Quick Drill Chips) */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Popular Tactical Motifs</span>
          </span>
          <button
            onClick={() => {
              sound.playClick();
              triggerHaptic('move');
              setViewState('themes');
            }}
            className={`text-[11px] font-bold flex items-center gap-1 hover:underline cursor-pointer ${
              isLightMode ? 'text-amber-700 hover:text-amber-900' : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <span>View All 60+</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { name: "Anastasia's mate", theme: "Anastasia's mate", tag: "Mate", icon: "👑", border: "border-rose-400/40 hover:border-rose-500" },
            { name: "Attraction", theme: "Attraction", tag: "Sacrifice", icon: "💎", border: "border-amber-400/40 hover:border-amber-500" },
            { name: "Advanced pawn", theme: "Advanced pawn", tag: "Promotion", icon: "👸", border: "border-emerald-400/40 hover:border-emerald-500" },
            { name: "Discovered attack", theme: "Discovered attack", tag: "Battery", icon: "⚡", border: "border-sky-400/40 hover:border-sky-500" },
            { name: "Rook endgame", theme: "Rook endgame", tag: "Endgame", icon: "🏰", border: "border-indigo-400/40 hover:border-indigo-500" },
            { name: "Middlegame", theme: "Middlegame", tag: "Strategy", icon: "🧠", border: "border-purple-400/40 hover:border-purple-500" }
          ].map(feat => (
            <button
              key={feat.name}
              onClick={() => {
                sound.playClick();
                triggerHaptic('move');
                const subset = getPuzzlesByTheme(feat.theme);
                startTrainerWithTheme(feat.name, subset);
              }}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer group flex items-center justify-between text-left active:scale-[0.98] ${
                isLightMode
                  ? `bg-white ${feat.border} hover:bg-slate-50 shadow-xs text-slate-900`
                  : `bg-slate-900/90 ${feat.border} hover:bg-slate-850 text-white`
              }`}
            >
              <div className="min-w-0 pr-1">
                <div className={`text-[10px] font-medium flex items-center gap-1 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  <span>{feat.icon}</span>
                  <span className="truncate">{feat.tag}</span>
                </div>
                <h4 className={`text-xs font-bold transition-colors truncate ${
                  isLightMode ? 'text-slate-900 group-hover:text-amber-700' : 'text-white group-hover:text-amber-300'
                }`}>
                  {feat.name}
                </h4>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 shrink-0 ${
                isLightMode ? 'text-slate-400 group-hover:text-amber-600' : 'text-slate-500 group-hover:text-amber-400'
              }`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
