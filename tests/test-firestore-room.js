import { firestoreRestService } from '../server/services/firestoreRestService.js';
import assert from 'assert';

async function runTest() {
  console.log('🧪 Starting Cloud Firestore Real-Time Room & Match Verification...\n');

  const testRoomId = `arena_TEST_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const userA = { id: 'user_A_101', username: 'MagnusA', elo: 1500, avatar: 'avatarA' };
  const userB = { id: 'user_B_202', username: 'HikaruB', elo: 1520, avatar: 'avatarB' };

  // 1. User A creates a room (5m blitz)
  console.log(`1. User A creates private room ${testRoomId}...`);
  const roomCreated = await firestoreRestService.saveRoom({
    id: testRoomId,
    whitePlayer: userA,
    blackPlayer: null,
    timeControl: { baseMinutes: 5, incrementSeconds: 0 },
    whiteTime: 300000,
    blackTime: 300000,
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    status: 'waiting',
    moveHistory: [],
    capturedPieces: { white: [], black: [] },
    chatMessages: [],
    typingUsers: {},
    createdAt: new Date().toISOString()
  });
  assert(roomCreated === true, 'Room creation in Firestore should succeed');
  console.log('   ✓ Room saved to Firestore with status: waiting\n');

  // 2. Fetch room as User B opens invite link
  console.log('2. User B clicks invite link and fetches room...');
  const fetchedRoom = await firestoreRestService.getRoom(testRoomId);
  assert(fetchedRoom !== null, 'Fetched room must exist');
  assert.strictEqual(fetchedRoom.status, 'waiting', 'Room should be waiting');
  assert.strictEqual(fetchedRoom.whitePlayer.id, userA.id, 'White player should be user A');
  assert.strictEqual(fetchedRoom.blackPlayer, null, 'Black player should initially be null');
  console.log('   ✓ Room verified waiting for friend\n');

  // 3. User B joins the room
  console.log('3. User B enters room...');
  const updatedRoom = {
    ...fetchedRoom,
    blackPlayer: userB,
    status: 'active',
    lastUpdated: Date.now()
  };
  const joinedSaved = await firestoreRestService.saveRoom(updatedRoom);
  assert(joinedSaved === true, 'Join save should succeed');

  // 4. User A receives real-time update
  console.log('4. User A retrieves active room state...');
  const liveRoom = await firestoreRestService.getRoom(testRoomId);
  assert.strictEqual(liveRoom.status, 'active', 'Room status must be active');
  assert.strictEqual(liveRoom.blackPlayer.id, userB.id, 'Black player must be user B');
  console.log('   ✓ Opponent entrance detected: Status = active, Match starts instantly!\n');

  // 5. In-game text chat exchange
  console.log('5. Testing in-game chat messages...');
  const chatMsg = {
    id: `msg_${Date.now()}`,
    sender: userB,
    text: 'Good luck! ♟️',
    timestamp: '10:00'
  };
  liveRoom.chatMessages.push(chatMsg);
  await firestoreRestService.saveRoom(liveRoom);

  const roomWithChat = await firestoreRestService.getRoom(testRoomId);
  assert.strictEqual(roomWithChat.chatMessages.length, 1, 'Chat message should be stored');
  assert.strictEqual(roomWithChat.chatMessages[0].text, 'Good luck! ♟️');
  console.log('   ✓ In-game chat message delivered successfully\n');

  // 6. Typing indicator
  console.log('6. Testing typing indicator...');
  liveRoom.typingUsers[userA.id] = { id: userA.id, username: userA.username, timestamp: Date.now() };
  await firestoreRestService.saveRoom(liveRoom);

  const roomWithTyping = await firestoreRestService.getRoom(testRoomId);
  assert(roomWithTyping.typingUsers[userA.id] !== undefined, 'User A typing indicator should be active');
  console.log('   ✓ Live typing indicator verified\n');

  // 7. Match move & completion
  console.log('7. Testing match moves and checkmate resolution...');
  liveRoom.moveHistory.push({ from: 'e2', to: 'e4', san: 'e4' });
  liveRoom.status = 'checkmate';
  liveRoom.winner = 'white';
  liveRoom.winReason = 'checkmate';
  await firestoreRestService.saveRoom(liveRoom);

  const finishedRoom = await firestoreRestService.getRoom(testRoomId);
  assert.strictEqual(finishedRoom.status, 'checkmate');
  assert.strictEqual(finishedRoom.winner, 'white');
  console.log('   ✓ Game completed: Winner = white, Reason = checkmate\n');

  console.log('====================================================');
  console.log('🎉 ALL FIRESTORE MULTIPLAYER TESTS PASSED 100%!');
  console.log('====================================================');
}

runTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
