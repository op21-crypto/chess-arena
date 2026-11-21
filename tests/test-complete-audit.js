import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('🧪 RUNNING COMPLETE CHESS ARENA AUDIT & VERIFICATION SUITE\n');

// 1. PieceIcons.jsx board theme defaults & exports
const pieceIconsSrc = fs.readFileSync(path.resolve('client/src/components/PieceIcons.jsx'), 'utf8');
assert(pieceIconsSrc.includes("export const getRandomDefaultBoardTheme = () => (Math.random() < 0.5 ? 'gold' : 'emerald');"),
  'PieceIcons must export getRandomDefaultBoardTheme returning gold or emerald');
assert(pieceIconsSrc.includes("gold: {") && pieceIconsSrc.includes("emerald: {"),
  'PieceIcons BOARD_THEMES must define gold and emerald');
console.log('✓ 1. PieceIcons: Gold & Emerald themes and random default verified.');

// 2. Chessboard.jsx defaults
const chessboardSrc = fs.readFileSync(path.resolve('client/src/components/Chessboard.jsx'), 'utf8');
assert(chessboardSrc.includes("boardTheme = 'gold'"), 'Chessboard default parameter must be gold');
assert(chessboardSrc.includes("BOARD_THEMES.gold || BOARD_THEMES.emerald"), 'Chessboard fallback must include gold or emerald');
console.log('✓ 2. Chessboard: Gold/Emerald default and fallback verified.');

// 3. App.jsx settings defaults & migrations
const appSrc = fs.readFileSync(path.resolve('client/src/App.jsx'), 'utf8');
assert(appSrc.includes("boardTheme: (typeof Math !== 'undefined' && Math.random() < 0.5) ? 'gold' : 'emerald'"),
  'App.jsx DEFAULT_SETTINGS must randomly default to gold or emerald');
assert(appSrc.includes("safeStorage.setItem('chess_arena_gold_emerald_default_v2', 'true');"),
  'App.jsx migration must ensure gold_emerald_default_v2 is persisted');
console.log('✓ 3. App.jsx: Settings default and storage migration verified.');

// 4. OfflineBoardView.jsx default theme
const offlineBoardSrc = fs.readFileSync(path.resolve('client/src/components/OfflineBoardView.jsx'), 'utf8');
assert(offlineBoardSrc.includes("const [themeId, setThemeId] = useState(() => (Math.random() < 0.5 ? 'gold' : 'emerald'));"),
  'OfflineBoardView must default themeId randomly to gold or emerald');
console.log('✓ 4. OfflineBoardView: Random Gold/Emerald default verified.');

// 5. PuzzleView, LessonView, AnalysisView board defaults
const puzzleSrc = fs.readFileSync(path.resolve('client/src/components/PuzzleView.jsx'), 'utf8');
assert(puzzleSrc.includes("Math.random() < 0.5 ? 'gold' : 'emerald'"), 'PuzzleView must default to gold or emerald');

const lessonSrc = fs.readFileSync(path.resolve('client/src/components/LessonView.jsx'), 'utf8');
assert(lessonSrc.includes("const [boardTheme] = useState(() => (Math.random() < 0.5 ? 'gold' : 'emerald'));"),
  'LessonView must default boardTheme to gold or emerald');

const analysisSrc = fs.readFileSync(path.resolve('client/src/components/AnalysisView.jsx'), 'utf8');
assert(analysisSrc.includes("const [boardTheme, setBoardTheme] = useState(() => (Math.random() < 0.5 ? 'gold' : 'emerald'));"),
  'AnalysisView must default boardTheme to gold or emerald');
console.log('✓ 5. PuzzleView, LessonView, AnalysisView: All chess views default to Gold/Emerald.');

// 6. GameControls.jsx buttons: Exit, Draw, Design, Resign (NO Flip, NO Share)
const gameControlsSrc = fs.readFileSync(path.resolve('client/src/components/GameControls.jsx'), 'utf8');
assert(gameControlsSrc.includes('<span>Exit</span>') && gameControlsSrc.includes('handleExitClick'), 'Must have Exit button with modal');
assert(gameControlsSrc.includes('<span>Draw</span>') && gameControlsSrc.includes('onOfferDraw'), 'Must have Draw button');
assert(gameControlsSrc.includes('<span>Design</span>') && gameControlsSrc.includes('onOpenDesign'), 'Must have Design button');
assert(gameControlsSrc.includes('<span>Resign</span>') && gameControlsSrc.includes('setShowResignModal'), 'Must have Resign button with modal');
assert(!gameControlsSrc.includes('<span>Flip</span>') && !gameControlsSrc.includes('<span>Share</span>'),
  'Flip and Share buttons must be removed from GameControls');
console.log('✓ 6. GameControls: Exit, Draw, Design, Resign buttons verified (Flip & Share removed).');

// 7. App.jsx PvP vs AI isolation: Voice call & chat restricted to PvP, AIBattleCard for AI
assert(appSrc.includes("{isAIGame ? (") && appSrc.includes("<AIBattleCard") && appSrc.includes("<GameChat"),
  'App.jsx must render AIBattleCard for AI matches and GameChat for PvP');
assert(appSrc.includes("onVoiceCall={!isAIGame ? () => setVoiceCallTrigger(c => c + 1) : null}"),
  'Voice call must only be passed for non-AI games');
console.log('✓ 7. PvP vs AI Isolation: Chat & Voice Call only in PvP, AIBattleCard for AI verified.');

// 8. Anime Opponents roster
const animeSrc = fs.readFileSync(path.resolve('client/src/data/animeOpponents.js'), 'utf8');
assert(animeSrc.includes("ANIME_AI_ROSTER"), 'Anime AI roster must be defined');
assert(animeSrc.includes("getRandomAnimeOpponent"), 'Must export getRandomAnimeOpponent');
console.log('✓ 8. Anime AI opponents: Roster and selection helper verified.');

console.log('\n🎉 ALL AUDIT CHECKS PASSED WITH 100% SUCCESS!\n');
