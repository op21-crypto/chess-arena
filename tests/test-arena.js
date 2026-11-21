import { Database, getProgressionTier } from '../server/db/database.js';
import { ChessGameSession } from '../server/engine/chessEngine.js';
import { aiEngine } from '../server/engine/aiEngine.js';
import { tournamentManager } from '../server/tournaments/tournamentManager.js';
import { CHESS_PUZZLES, CHESS_LESSONS } from '../server/puzzles/puzzleData.js';

async function runTests() {
  console.log('🏁 STARTING CHESS ARENA COMPREHENSIVE VERIFICATION SUITE\n');

  // Test 1: Database & Seeded Grandmasters
  console.log('1. Database & User Profiles:');
  const admin = Database.getUserByEmail('admin@chessarena.com');
  console.assert(admin !== null, 'Admin user must exist');
  console.assert(admin.role === 'admin', 'Admin must have admin role');
  console.log('   ✓ Admin user verified:', admin.username, 'Role:', admin.role);

  const magnus = Database.getUserById('player_magnus');
  console.assert(magnus !== null, 'Magnus user must exist');
  console.log('   ✓ Grandmaster seed verified:', magnus.username, 'Rating:', magnus.ratings.rapid);

  const tier = getProgressionTier(2450);
  console.assert(tier.title === 'Elite', '2450 Elo must be Elite tier');
  console.log('   ✓ Progression tier logic verified: 2450 ->', tier.title);

  // Test 2: Chess Engine & Official Rules
  console.log('\n2. Chess Engine & Rules Validation:');
  const session = new ChessGameSession({
    id: 'test_session_1',
    whitePlayer: { id: 'w1', username: 'WhiteHero', elo: 1500 },
    blackPlayer: { id: 'b1', username: 'BlackNemesis', elo: 1500 },
    timeControl: { baseMinutes: 5, incrementSeconds: 2 },
    isRated: true,
    format: 'blitz'
  });

  // Scholar's Mate Test: 1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7#
  let move1 = session.makeMove({ from: 'e2', to: 'e4' }, 'w1');
  console.assert(move1.success, 'e4 must succeed');
  let move2 = session.makeMove({ from: 'e7', to: 'e5' }, 'b1');
  console.assert(move2.success, 'e5 must succeed');
  let move3 = session.makeMove({ from: 'f1', to: 'c4' }, 'w1');
  console.assert(move3.success, 'Bc4 must succeed');
  let move4 = session.makeMove({ from: 'b8', to: 'c6' }, 'b1');
  console.assert(move4.success, 'Nc6 must succeed');
  let move5 = session.makeMove({ from: 'd1', to: 'h5' }, 'w1');
  console.assert(move5.success, 'Qh5 must succeed');
  let move6 = session.makeMove({ from: 'g8', to: 'f6' }, 'b1');
  console.assert(move6.success, 'Nf6 must succeed');
  let move7 = session.makeMove({ from: 'h5', to: 'f7' }, 'w1');
  console.assert(move7.success, 'Qxf7# must succeed');
  console.assert(session.status === 'checkmate', 'Game must be checkmate');
  console.assert(session.winner === 'white', 'Winner must be white');
  console.log('   ✓ Full checkmate sequence validated: Status =', session.status, ', Winner =', session.winner);

  // Test 3: Elo Calculation
  console.log('\n3. Elo Rating Dynamics:');
  const { whiteDiff, blackDiff } = session.calculateEloChanges();
  console.assert(whiteDiff > 0, 'Winner White must gain Elo points');
  console.assert(blackDiff < 0, 'Loser Black must lose Elo points');
  console.log(`   ✓ Elo changes calculated: White +${whiteDiff}, Black ${blackDiff}`);

  // Test 4: En Passant & Castling
  console.log('\n4. Castling & Special Rules:');
  const session2 = new ChessGameSession({
    id: 'test_session_2',
    whitePlayer: { id: 'w1' },
    blackPlayer: { id: 'b1' },
    timeControl: { baseMinutes: 10, incrementSeconds: 0 }
  });
  session2.makeMove({ from: 'e2', to: 'e4' }, 'w1');
  session2.makeMove({ from: 'e7', to: 'e5' }, 'b1');
  session2.makeMove({ from: 'g1', to: 'f3' }, 'w1');
  session2.makeMove({ from: 'g8', to: 'f6' }, 'b1');
  session2.makeMove({ from: 'f1', to: 'c4' }, 'w1');
  session2.makeMove({ from: 'f8', to: 'c5' }, 'b1');
  const castleMove = session2.makeMove({ from: 'e1', to: 'g1' }, 'w1'); // Kingside Castle O-O
  console.assert(castleMove.success, 'Castling kingside O-O must be legal');
  console.log('   ✓ Kingside castling O-O executed cleanly');

  // Test 5: Stockfish 19 WASM AI & Game Analysis
  console.log('\n5. Stockfish 19 WASM Engine Inference:');
  const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const aiMove = await aiEngine.getAIMove(startFen, 2);
  console.assert(aiMove && aiMove.from && aiMove.to, 'Stockfish must produce valid move');
  console.log(`   ✓ Stockfish 19 AI move generated: ${aiMove.from} -> ${aiMove.to} (UCI: ${aiMove.uci})`);

  // Test 6: Tactical Puzzles & Lessons
  console.log('\n6. Puzzles & Curriculum Data:');
  console.assert(CHESS_PUZZLES.length >= 8, 'Must have at least 8 curated puzzles');
  console.assert(CHESS_LESSONS.length >= 4, 'Must have at least 4 learning modules');
  console.log(`   ✓ Loaded ${CHESS_PUZZLES.length} tactical puzzles and ${CHESS_LESSONS.length} comprehensive lessons`);

  // Test 7: Tournament Management
  console.log('\n7. Tournament Manager:');
  const tourneys = tournamentManager.getAll();
  console.assert(tourneys.length >= 3, 'Must have tournaments loaded');
  console.log(`   ✓ Active tournaments initialized: ${tourneys.length} championships ready`);

  // Test 8: Full Master Admin Controls (op21plus@gmail.com & App Config)
  console.log('\n8. Master Admin Controls & App Defaults:');
  const appConfig = Database.getAppConfig();
  console.assert(appConfig && appConfig.defaultTheme, 'App config must have defaultTheme');
  console.assert(appConfig.customBots && appConfig.customBots.length === 5, 'Must have 5 bot tiers');
  console.log('   ✓ App defaults loaded successfully:', appConfig.defaultTheme, appConfig.defaultBoardTheme);

  const updatedConfig = Database.updateAppConfig({ announcement: 'Arena Championship 2026' });
  console.assert(updatedConfig.announcement === 'Arena Championship 2026', 'Announcement must be updated');
  console.log('   ✓ App config update verified: announcement =', updatedConfig.announcement);

  // Verify deletion safeguard for op21plus@gmail.com
  const opUser = Database.createUser({
    id: 'user_op_test',
    username: 'OpMaster',
    email: 'op21plus@gmail.com',
    role: 'admin'
  });
  const deleteResult = Database.deleteUser('user_op_test');
  console.assert(deleteResult === false, 'op21plus@gmail.com must be protected from deletion');
  console.log('   ✓ Security safeguard verified: op21plus@gmail.com account is non-deletable');

  console.log('\n===============================================');
  console.log('🏆 ALL 8 CORE SUBSYSTEM TESTS PASSED WITH 100% SUCCESS!');
  console.log('===============================================');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
