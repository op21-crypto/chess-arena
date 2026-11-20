import React, { useState, useEffect, useRef } from 'react';
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
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio.js';
import { safeStorage } from '../utils/storage.js';
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

export function PuzzleView({ currentUser, onUpdateRating }) {
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

  // Puzzle Storm Mode State
  const [stormScore, setStormScore] = useState(0);
  const [stormCombo, setStormCombo] = useState(0);
  const [stormTimeRemaining, setStormTimeRemaining] = useState(180); // 3:00 min
  const [stormActive, setStormActive] = useState(false);
  const [stormFinished, setStormFinished] = useState(false);
  const stormTimerRef = useRef(null);

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

    const uciMove = `${moveObj.from}${moveObj.to}${moveObj.promotion || ''}`;
    const expectedMove = currentPuzzle.solution[solutionStep];

    if (uciMove === expectedMove) {
      const nextStep = solutionStep + 1;
      const chess = new Chess(currentFen);
      chess.move(moveObj);
      setCurrentFen(chess.fen());
      setLastMove({ from: moveObj.from, to: moveObj.to });

      if (nextStep >= currentPuzzle.solution.length) {
        // Complete solve!
        setStatus('solved');
        if (puzzleSettings.sound) sound.playVictory();

        if (viewState === 'streak') {
          setStreakCount(prev => prev + 1);
          setStreakRating(prev => prev + 15);
          confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
          setTimeout(() => {
            handleNextStreakPuzzle();
          }, 800);
        } else if (viewState === 'storm') {
          setStormScore(prev => prev + 1);
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
        if (puzzleSettings.sound) sound.playMove();

        const oppUci = currentPuzzle.solution[nextStep];
        setTimeout(() => {
          const oppFrom = oppUci.substring(0, 2);
          const oppTo = oppUci.substring(2, 4);
          const oppProm = oppUci.length > 4 ? oppUci.substring(4, 5) : undefined;

          chess.move({ from: oppFrom, to: oppTo, promotion: oppProm });
          setCurrentFen(chess.fen());
          setLastMove({ from: oppFrom, to: oppTo });
          setSolutionStep(nextStep + 1);
          setStatus('playing');
          if (puzzleSettings.sound) sound.playMove();
        }, viewState === 'storm' ? 250 : 500);
      }
    } else {
      // Wrong Move
      setStatus('failed');
      if (puzzleSettings.sound) sound.playGameOver();

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

  // ================= VIEW 1: THEMES DIRECTORY =================
  if (viewState === 'themes') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-4 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24">
        {/* Top Header */}
        <div className="flex items-center gap-3 py-3 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setViewState('hub')}
            className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold tracking-tight">Puzzle Themes</h1>
        </div>

        {/* Search Input */}
        <div className="mt-4 relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full pl-11 pr-4 py-3 bg-slate-200/60 dark:bg-slate-900/80 rounded-2xl text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/50 border border-transparent dark:border-slate-800"
          />
        </div>

        {/* By Openings Row */}
        <div className="mt-6 border-b border-slate-200 dark:border-slate-800/60">
          <button
            onClick={() => setViewState('openings')}
            className="w-full flex items-center justify-between py-4 px-2 hover:bg-slate-100 dark:hover:bg-slate-900/50 rounded-xl transition-colors group"
          >
            <span className="text-base font-semibold text-slate-800 dark:text-slate-200 group-hover:text-sky-500">
              By openings
            </span>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-sky-500 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Accordion Categories */}
        <div className="space-y-1 divide-y divide-slate-200 dark:divide-slate-800/60">
          {filteredCategories.map(cat => {
            const isExpanded = expandedCategories[cat.id] ?? false;
            return (
              <div key={cat.id} className="pt-2">
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full flex items-center justify-between py-3.5 px-2 hover:bg-slate-100 dark:hover:bg-slate-900/50 rounded-xl transition-colors"
                >
                  <span className="text-base font-semibold text-slate-800 dark:text-slate-200">
                    {cat.name}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-sky-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-1 mb-3 space-y-1 pl-2">
                    {cat.items.map(item => (
                      <div
                        key={item.id}
                        onClick={() => {
                          const subset = getPuzzlesByTheme(item.name);
                          startTrainerWithTheme(item.name, subset);
                        }}
                        className="flex items-start justify-between py-3 px-3 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-950/30 cursor-pointer transition-colors group"
                      >
                        <div className="flex gap-3">
                          <div className="mt-0.5 text-slate-400 group-hover:text-sky-500 transition-colors">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-sky-500">
                              {item.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-0.5 leading-relaxed">
                              {item.desc}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs font-mono text-slate-400 font-medium ml-2">
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
      <div className="max-w-2xl mx-auto px-4 py-4 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24">
        {/* Top Header */}
        <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewState('themes')}
              className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold tracking-tight">Puzzles by openings</h1>
          </div>
          <button
            onClick={() => setOpeningsSortBy(prev => (prev === 'count' ? 'name' : 'count'))}
            className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-sky-500 transition-colors"
            title="Toggle sort"
          >
            <Layers className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="mt-4 relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search openings"
            className="w-full pl-11 pr-4 py-3 bg-slate-200/60 dark:bg-slate-900/80 rounded-2xl text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/50 border border-transparent dark:border-slate-800"
          />
        </div>

        {/* Openings List */}
        <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800/60">
          {filteredOpenings.map(op => (
            <div
              key={op.id}
              onClick={() => {
                const subset = getPuzzlesByOpening(op.name);
                startTrainerWithTheme(op.name, subset);
              }}
              className="flex items-center justify-between py-4 px-2 hover:bg-slate-100 dark:hover:bg-slate-900/50 rounded-xl cursor-pointer transition-colors group"
            >
              <div>
                <div className="text-base font-semibold text-slate-800 dark:text-slate-200 group-hover:text-sky-500">
                  {op.name}
                </div>
                {op.code && (
                  <div className="text-xs font-mono text-slate-400">{op.code}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-slate-400 font-medium">
                  {op.count.toLocaleString()}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400 -rotate-90 group-hover:text-sky-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ================= VIEW 3: PUZZLE STREAK =================
  if (viewState === 'streak') {
    return (
      <div className="max-w-md mx-auto px-4 py-3 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between pb-20">
        {/* Top Header */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewState('hub')}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold tracking-tight">Puzzle Streak</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              <Info className="w-5 h-5" />
            </button>
            <button
              onClick={() => updateSettings('sound', !puzzleSettings.sound)}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              {puzzleSettings.sound ? (
                <Volume2 className="w-5 h-5 text-sky-500" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Turn Status Banner */}
        <div className="my-2 p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center border border-sky-500/30 shrink-0">
            <PieceIcon piece="k" color={sideToMove === 'white' ? 'w' : 'b'} size={24} />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">Your turn</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Find the best move for {sideToMove}.
            </div>
          </div>
        </div>

        {/* Interactive Chessboard */}
        <div className="my-auto">
          <Chessboard
            fen={currentFen}
            flipped={shouldFlipBoard}
            onMove={handleMove}
            lastMove={lastMove}
            disabled={status === 'solved' || streakGameOver}
          />
        </div>

        {/* Streak Score & Rating Bar */}
        <div className="my-3 flex items-center justify-between px-2">
          {/* Apple Streak Counter Badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xl">🏹🍎</span>
            <span className="text-2xl font-black font-mono text-sky-600 dark:text-sky-400">
              {streakCount}
            </span>
          </div>

          {/* Rating */}
          <div className="text-sm font-bold text-slate-600 dark:text-slate-400 font-mono">
            Rating: <span className="text-slate-900 dark:text-white font-bold">{streakRating}</span>
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-center">
          <button
            onClick={handleSkipStreak}
            className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
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
              <div className="flex gap-2">
                <button
                  onClick={() => setViewState('hub')}
                  className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs"
                >
                  Exit
                </button>
                <button
                  onClick={startStreakMode}
                  className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md"
                >
                  New Streak
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
    return (
      <div className="max-w-md mx-auto px-4 py-3 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between pb-20">
        {/* Top Header */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                handleEndStorm();
                setViewState('hub');
              }}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold tracking-tight">Puzzle Storm</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Score & Timer Header Bar */}
        <div className="my-2 flex items-center justify-between px-1">
          {/* Tornado Score Badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-2xl">🌪️</span>
            <span className="text-2xl font-black font-mono text-sky-600 dark:text-sky-400">
              {stormScore}
            </span>
          </div>

          {/* Countdown Clock */}
          <div
            className={`px-4 py-2 rounded-2xl font-mono text-xl font-black border ${
              stormTimeRemaining < 30
                ? 'bg-rose-500/20 text-rose-500 border-rose-500/40 animate-pulse'
                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 shadow-xs'
            }`}
          >
            {formatStormTime(stormTimeRemaining)}
          </div>
        </div>

        {/* Interactive Chessboard */}
        <div className="my-auto">
          <Chessboard
            fen={currentFen}
            flipped={shouldFlipBoard}
            onMove={handleMove}
            lastMove={lastMove}
            disabled={!stormActive}
          />
        </div>

        {/* Combo Multiplier Bar */}
        <div className="my-3 space-y-1 px-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{stormCombo} Combo</span>
            <div className="flex gap-4 font-mono text-[10px]">
              <span>3s</span>
              <span>5s</span>
              <span>6s</span>
              <span>10s</span>
            </div>
          </div>
          <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-linear-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (stormCombo / 10) * 100)}%` }}
            />
          </div>
        </div>

        {/* Bottom Run Controls */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around">
          <button
            onClick={startStormMode}
            className="flex flex-col items-center gap-1 py-1 px-4 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>New run</span>
          </button>
          <button
            onClick={handleEndStorm}
            className="flex flex-col items-center gap-1 py-1 px-4 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-500 transition-colors"
          >
            <Flag className="w-4 h-4" />
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
              <div className="flex gap-2">
                <button
                  onClick={() => setViewState('hub')}
                  className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs"
                >
                  Exit
                </button>
                <button
                  onClick={startStormMode}
                  className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md"
                >
                  Play Again
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
    return (
      <div className="max-w-md mx-auto px-4 py-3 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between pb-20">
        {/* Top Header */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewState('hub')}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold tracking-tight truncate max-w-[220px]">
              {activeThemeTitle || currentPuzzle.theme || 'Tactics Trainer'}
            </h1>
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Turn Status Banner */}
        <div className="my-2 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 flex items-center justify-center border border-sky-500/30 shrink-0">
              <PieceIcon piece="k" color={sideToMove === 'white' ? 'w' : 'b'} size={24} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {status === 'solved'
                  ? 'Puzzle solved!'
                  : status === 'failed'
                  ? 'Incorrect move'
                  : 'Your turn'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {status === 'solved'
                  ? 'Well played! +15 Rating'
                  : status === 'failed'
                  ? 'Try again or view solution'
                  : `Find the best move for ${sideToMove}.`}
              </div>
            </div>
          </div>
          {status === 'solved' && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
          {status === 'failed' && <XCircle className="w-6 h-6 text-rose-500" />}
        </div>

        {/* Hint Box if triggered */}
        {hintShown && currentPuzzle.hint && (
          <div className="mb-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 shrink-0 text-amber-500" />
            <span>{currentPuzzle.hint}</span>
          </div>
        )}

        {/* Revealed Solution */}
        {revealedSolution && currentPuzzle.solution && (
          <div className="mb-2 p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs text-sky-700 dark:text-sky-400 flex items-center gap-2 font-mono">
            <span>Solution: {currentPuzzle.solution.join(' ')}</span>
          </div>
        )}

        {/* Interactive Chessboard */}
        <div className="my-auto">
          <Chessboard
            fen={currentFen}
            flipped={shouldFlipBoard}
            onMove={handleMove}
            lastMove={lastMove}
            disabled={status === 'solved'}
          />
        </div>

        {/* Bottom Toolbar: Hint, Flag, Prev, Next */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around">
          <button
            onClick={() => setHintShown(true)}
            className="p-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-amber-500 transition-colors"
            title="Hint"
          >
            <Lightbulb className="w-5 h-5" />
          </button>
          <button
            onClick={handleShowSolution}
            className="p-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors"
            title="View Solution"
          >
            <Flag className="w-5 h-5" />
          </button>
          <button
            onClick={handlePrevPuzzle}
            className="p-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Previous Puzzle"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextPuzzle}
            className="p-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Next Puzzle"
          >
            <ChevronRight className="w-5 h-5" />
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
  const healthyPuzzle = ALL_PUZZLES.find(p => p.id === 'puz_healthy_1') || ALL_PUZZLES[0];
  const lemmingPuzzle = ALL_PUZZLES.find(p => p.id === 'puz_lemming_1') || ALL_PUZZLES[0];

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight">Puzzles</h1>
        <div className="w-9 h-9 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 font-bold text-sm">
          {currentUser?.username?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>

      {/* Top Card: 3 Primary Puzzle Navigation Modes */}
      <div className="mt-4 bg-sky-500/5 dark:bg-slate-900/60 rounded-3xl p-2 border border-sky-500/15 dark:border-slate-800 divide-y divide-sky-500/10 dark:divide-slate-800/60">
        {/* Row 1: Puzzle Themes */}
        <div
          onClick={() => setViewState('themes')}
          className="flex items-center gap-4 p-4 rounded-2xl hover:bg-sky-500/10 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
        >
          <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">
              Puzzle Themes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              Do puzzles from your favorite openings, or choose a theme.
            </p>
          </div>
        </div>

        {/* Row 2: Puzzle Streak */}
        <div
          onClick={startStreakMode}
          className="flex items-center gap-4 p-4 rounded-2xl hover:bg-sky-500/10 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-lg">
            🏹🍎
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
              Puzzle Streak
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              Solve progressively harder puzzles and build a win streak.
            </p>
          </div>
        </div>

        {/* Row 3: Puzzle Storm */}
        <div
          onClick={startStormMode}
          className="flex items-center gap-4 p-4 rounded-2xl hover:bg-sky-500/10 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-lg">
            🌪️
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
              Puzzle Storm
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              Solve as many puzzles as possible in 3 minutes.
            </p>
          </div>
        </div>
      </div>

      {/* Chess Tactics Trainer Section */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-4">
          Chess tactics trainer
        </h2>

        <div className="space-y-3">
          {/* Card 1: Puzzle of the Day */}
          <div
            onClick={() => {
              setPuzzles([dailyPuzzle, ...ALL_PUZZLES]);
              setCurrentIndex(0);
              setActiveThemeTitle('Puzzle of the day');
              loadPuzzle(dailyPuzzle);
              setViewState('trainer');
            }}
            className="flex items-center gap-4 p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-sky-500/50 cursor-pointer transition-all group"
          >
            <MiniBoard fen={dailyPuzzle.fen} flipped={dailyPuzzle.turn === 'b'} />
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">
                Puzzle of the day
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Played 18,898 times
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{dailyPuzzle.turn === 'b' ? 'Black' : 'White'} to play</span>
              </div>
            </div>
          </div>

          {/* Card 2: Healthy Mix */}
          <div
            onClick={() => {
              const mixed = [...ALL_PUZZLES].sort(() => Math.random() - 0.5);
              setPuzzles(mixed);
              setCurrentIndex(0);
              setActiveThemeTitle('Healthy mix');
              loadPuzzle(mixed[0]);
              setViewState('trainer');
            }}
            className="flex items-center gap-4 p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-sky-500/50 cursor-pointer transition-all group"
          >
            <MiniBoard fen={healthyPuzzle.fen} flipped={healthyPuzzle.turn === 'b'} />
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">
                Healthy mix
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                A mix of everything. You don't know what to expect, so be ready for anything! Just like in real games.
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-sky-600 dark:text-sky-400">
                <Crosshair className="w-3.5 h-3.5" />
                <span>{healthyPuzzle.turn === 'b' ? 'Black' : 'White'} to play</span>
              </div>
            </div>
          </div>

          {/* Card 3: Lemming Defense */}
          <div
            onClick={() => {
              const lemmingPuzzles = getPuzzlesByOpening('Lemming Defense');
              setPuzzles(lemmingPuzzles);
              setCurrentIndex(0);
              setActiveThemeTitle('Lemming Defense');
              loadPuzzle(lemmingPuzzles[0]);
              setViewState('trainer');
            }}
            className="flex items-center gap-4 p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-sky-500/50 cursor-pointer transition-all group"
          >
            <MiniBoard fen={lemmingPuzzle.fen} flipped={lemmingPuzzle.turn === 'b'} />
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">
                Lemming Defense
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                1. e4 Na6 opening refutation tactic
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Crosshair className="w-3.5 h-3.5" />
                <span>{lemmingPuzzle.turn === 'b' ? 'Black' : 'White'} to play</span>
              </div>
            </div>
          </div>

          {/* Featured Screenshot Puzzles Quick Access Grid */}
          <div className="pt-4">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3">
              Featured Tactics
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "Anastasia's mate", theme: "Anastasia's mate", tag: "Mates" },
                { name: "Attraction", theme: "Attraction", tag: "Sacrifice" },
                { name: "Advanced pawn", theme: "Advanced pawn", tag: "Promotion" },
                { name: "Discovered attack", theme: "Discovered attack", tag: "Battery" },
                { name: "Rook endgame", theme: "Rook endgame", tag: "Endgame" },
                { name: "Middlegame", theme: "Middlegame", tag: "Strategy" }
              ].map(feat => (
                <div
                  key={feat.name}
                  onClick={() => {
                    const subset = getPuzzlesByTheme(feat.theme);
                    startTrainerWithTheme(feat.name, subset);
                  }}
                  className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-sky-500/40 cursor-pointer transition-all group"
                >
                  <span className="text-[10px] font-mono font-bold text-sky-500 uppercase">
                    {feat.tag}
                  </span>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-sky-500 transition-colors mt-0.5">
                    {feat.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
