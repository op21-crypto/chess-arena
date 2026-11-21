import { ChessGameSession } from '../engine/chessEngine.js';
import { Database } from '../db/database.js';
import { tournamentManager } from '../tournaments/tournamentManager.js';

export function setupSocketHandler(io) {
  // Active games: gameId -> ChessGameSession
  const activeGames = new Map();
  // Matchmaking queue: array of { socketId, user, format, timeControl, joinedAt }
  const matchmakingQueue = [];
  // User ID to socket IDs mapping: userId -> Set(socketId)
  const userSockets = new Map();
  // Socket ID to current game ID
  const socketCurrentGame = new Map();

  // Periodic clock checker and matchmaking processor
  setInterval(() => {
    // 1. Process clocks
    for (const [gameId, game] of activeGames.entries()) {
      if (game.status === 'active' && game.timerStarted) {
        const prevStatus = game.status;
        game.updateClocks();
        
        if (game.status !== 'active' && prevStatus === 'active') {
          handleGameCompletion(game, io);
        } else {
          // Emit periodic clock sync every 1 second
          io.to(`game:${gameId}`).emit('clock_sync', {
            whiteTime: game.whiteTime,
            blackTime: game.blackTime,
            turn: game.chess.turn()
          });
        }
      }
    }

    // 2. Process matchmaking queue
    processMatchmaking(io);
  }, 1000);

  function processMatchmaking(io) {
    if (matchmakingQueue.length < 2) return;

    // Try to pair players
    for (let i = 0; i < matchmakingQueue.length; i++) {
      for (let j = i + 1; j < matchmakingQueue.length; j++) {
        const p1 = matchmakingQueue[i];
        const p2 = matchmakingQueue[j];

        // Format and baseMinutes match
        if (
          p1.format === p2.format &&
          p1.timeControl.baseMinutes === p2.timeControl.baseMinutes &&
          p1.user.id !== p2.user.id
        ) {
          // Check ELO delta (expands as wait time increases)
          const waitTime = (Date.now() - Math.min(p1.joinedAt, p2.joinedAt)) / 1000;
          const allowedDelta = Math.min(500, 150 + Math.floor(waitTime * 10));
          const elo1 = p1.user.ratings?.[p1.format] || 1200;
          const elo2 = p2.user.ratings?.[p2.format] || 1200;

          if (Math.abs(elo1 - elo2) <= allowedDelta) {
            // Found a match!
            matchmakingQueue.splice(j, 1);
            matchmakingQueue.splice(i, 1);

            // Create game
            const gameId = `match_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            const isWhite = Math.random() > 0.5;
            const white = isWhite ? p1.user : p2.user;
            const black = isWhite ? p2.user : p1.user;

            const session = new ChessGameSession({
              id: gameId,
              whitePlayer: white,
              blackPlayer: black,
              timeControl: p1.timeControl,
              isRated: true,
              format: p1.format
            });

            activeGames.set(gameId, session);

            const s1 = io.sockets.sockets.get(p1.socketId);
            const s2 = io.sockets.sockets.get(p2.socketId);

            if (s1) {
              s1.join(`game:${gameId}`);
              socketCurrentGame.set(p1.socketId, gameId);
              s1.emit('match_found', { gameId, side: isWhite ? 'w' : 'b', game: session.getState() });
            }
            if (s2) {
              s2.join(`game:${gameId}`);
              socketCurrentGame.set(p2.socketId, gameId);
              s2.emit('match_found', { gameId, side: isWhite ? 'b' : 'w', game: session.getState() });
            }

            return;
          }
        }
      }
    }
  }

  function handleGameCompletion(game, io) {
    const { whiteDiff, blackDiff } = game.calculateEloChanges();
    const format = game.format || 'rapid';

    // Update White player stats & Elo
    if (game.whitePlayer.id) {
      const whiteDb = Database.getUserById(game.whitePlayer.id);
      if (whiteDb) {
        const oldElo = whiteDb.ratings[format] || 1200;
        const newElo = Math.max(100, oldElo + whiteDiff);
        whiteDb.ratings[format] = newElo;
        whiteDb.highestRating = Math.max(whiteDb.highestRating || 1200, newElo);
        whiteDb.stats.played = (whiteDb.stats.played || 0) + 1;

        if (game.winner === 'white') {
          whiteDb.stats.won = (whiteDb.stats.won || 0) + 1;
          whiteDb.stats.currentStreak = (whiteDb.stats.currentStreak || 0) + 1;
          whiteDb.stats.winStreak = Math.max(whiteDb.stats.winStreak || 0, whiteDb.stats.currentStreak);
          checkAndAwardAchievements(whiteDb, 'win', game);
        } else if (game.winner === 'black') {
          whiteDb.stats.lost = (whiteDb.stats.lost || 0) + 1;
          whiteDb.stats.currentStreak = 0;
        } else {
          whiteDb.stats.drawn = (whiteDb.stats.drawn || 0) + 1;
        }

        whiteDb.ratingHistory.push({
          date: new Date().toISOString().split('T')[0],
          rating: newElo,
          format
        });
        Database.updateUser(whiteDb.id, whiteDb);
      }
    }

    // Update Black player stats & Elo
    if (game.blackPlayer.id) {
      const blackDb = Database.getUserById(game.blackPlayer.id);
      if (blackDb) {
        const oldElo = blackDb.ratings[format] || 1200;
        const newElo = Math.max(100, oldElo + blackDiff);
        blackDb.ratings[format] = newElo;
        blackDb.highestRating = Math.max(blackDb.highestRating || 1200, newElo);
        blackDb.stats.played = (blackDb.stats.played || 0) + 1;

        if (game.winner === 'black') {
          blackDb.stats.won = (blackDb.stats.won || 0) + 1;
          blackDb.stats.currentStreak = (blackDb.stats.currentStreak || 0) + 1;
          blackDb.stats.winStreak = Math.max(blackDb.stats.winStreak || 0, blackDb.stats.currentStreak);
          checkAndAwardAchievements(blackDb, 'win', game);
        } else if (game.winner === 'white') {
          blackDb.stats.lost = (blackDb.stats.lost || 0) + 1;
          blackDb.stats.currentStreak = 0;
        } else {
          blackDb.stats.drawn = (blackDb.stats.drawn || 0) + 1;
        }

        blackDb.ratingHistory.push({
          date: new Date().toISOString().split('T')[0],
          rating: newElo,
          format
        });
        Database.updateUser(blackDb.id, blackDb);
      }
    }

    // Save game record in Database
    Database.saveGame({
      id: game.id,
      whitePlayer: game.whitePlayer,
      blackPlayer: game.blackPlayer,
      status: game.status,
      winner: game.winner,
      winReason: game.winReason,
      moveCount: game.moveHistory.length,
      moveHistory: game.moveHistory,
      format: game.format,
      timeControl: { baseMinutes: game.baseMinutes, incrementSeconds: game.incrementSeconds },
      isRated: game.isRated,
      whiteEloChange: whiteDiff,
      blackEloChange: blackDiff,
      createdAt: game.createdAt,
      endedAt: game.endedAt
    });

    // Notify room of game over
    io.to(`game:${game.id}`).emit('game_over', {
      status: game.status,
      winner: game.winner,
      winReason: game.winReason,
      whiteEloChange: whiteDiff,
      blackEloChange: blackDiff,
      game: game.getState()
    });
  }

  function checkAndAwardAchievements(user, trigger, game) {
    const achs = new Set(user.achievements || []);
    const newlyUnlocked = [];

    const award = (id) => {
      if (!achs.has(id)) {
        achs.add(id);
        newlyUnlocked.push(id);
      }
    };

    if (trigger === 'win') {
      award('first_win');
      if (game.status === 'checkmate') award('checkmate_pro');
      if (user.stats.won >= 10) award('wins_10');
      if (user.stats.played >= 100) award('games_100');
      if (user.stats.currentStreak >= 3) award('streak_master');
      if (game.format === 'blitz' && (user.ratings.blitz || 0) >= 1500) award('blitz_master');
      if (game.format === 'rapid' && (user.ratings.rapid || 0) >= 1500) award('rapid_master');
      if ((user.ratings.rapid || 0) >= 2000) award('chess_champion');
    }

    user.achievements = Array.from(achs);
  }

  io.on('connection', (socket) => {
    let currentUser = null;

    // 1. Authenticate / Identify User
    socket.on('authenticate', (userData) => {
      if (!userData || !userData.id) return;
      currentUser = userData;

      if (!userSockets.has(userData.id)) {
        userSockets.set(userData.id, new Set());
      }
      userSockets.get(userData.id).add(socket.id);

      socket.join(`user:${userData.id}`);
      Database.updateUser(userData.id, { isOnline: true });

      // Notify friends
      const friends = Database.getUserFriends(userData.id);
      friends.forEach(f => {
        io.to(`user:${f.id}`).emit('friend_status', { userId: userData.id, isOnline: true });
      });
    });

    // 2. Matchmaking
    socket.on('join_matchmaking', (params) => {
      if (!currentUser) return;
      // Remove any existing queue entries for this user
      const existingIdx = matchmakingQueue.findIndex(q => q.user.id === currentUser.id);
      if (existingIdx !== -1) matchmakingQueue.splice(existingIdx, 1);

      matchmakingQueue.push({
        socketId: socket.id,
        user: currentUser,
        format: params.format || 'rapid',
        timeControl: params.timeControl || { baseMinutes: 10, incrementSeconds: 0 },
        joinedAt: Date.now()
      });

      socket.emit('matchmaking_joined', { format: params.format });
    });

    socket.on('cancel_matchmaking', () => {
      if (!currentUser) return;
      const idx = matchmakingQueue.findIndex(q => q.user.id === currentUser.id);
      if (idx !== -1) {
        matchmakingQueue.splice(idx, 1);
      }
      socket.emit('matchmaking_cancelled');
    });

    // 3. Private Rooms
    socket.on('create_room', (config) => {
      if (!currentUser) return;
      const roomId = `room_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      
      const timeControl = config.timeControl || { baseMinutes: 10, incrementSeconds: 0 };
      const format = config.format || (timeControl.baseMinutes <= 2 ? 'bullet' : (timeControl.baseMinutes <= 5 ? 'blitz' : 'rapid'));
      
      // Strictly random 50/50 color allocation for private rooms
      const isWhite = Math.random() < 0.5;
      const session = new ChessGameSession({
        id: roomId,
        whitePlayer: isWhite ? currentUser : null,
        blackPlayer: isWhite ? null : currentUser,
        timeControl,
        isRated: config.isRated !== false,
        format
      });

      activeGames.set(roomId, session);
      socket.join(`game:${roomId}`);
      socketCurrentGame.set(socket.id, roomId);

      socket.emit('room_created', {
        roomId,
        game: session.getState(),
        shareUrl: `/play?room=${roomId}`
      });
    });

    socket.on('join_room', ({ roomId }) => {
      if (!currentUser) return;
      const game = activeGames.get(roomId);
      if (!game) {
        socket.emit('error_message', { message: 'Room not found or game already finished' });
        return;
      }

      socket.join(`game:${roomId}`);
      socketCurrentGame.set(socket.id, roomId);

      // Check if joining as player or spectator
      if (!game.whitePlayer && game.blackPlayer?.id !== currentUser.id) {
        game.whitePlayer = currentUser;
      } else if (!game.blackPlayer && game.whitePlayer?.id !== currentUser.id) {
        game.blackPlayer = currentUser;
      } else if (game.whitePlayer?.id !== currentUser.id && game.blackPlayer?.id !== currentUser.id) {
        // Joining as spectator
        game.spectators.set(socket.id, currentUser);
        socket.emit('spectator_joined', { game: game.getState() });
        io.to(`game:${roomId}`).emit('spectator_count', { count: game.spectators.size });
        return;
      }

      // Notify all players in room that both are ready
      io.to(`game:${roomId}`).emit('room_updated', {
        game: game.getState(),
        ready: Boolean(game.whitePlayer && game.blackPlayer)
      });
    });

    // 4. In-Game Moves & Clock
    socket.on('make_move', ({ gameId, move }) => {
      const game = activeGames.get(gameId);
      if (!game || !currentUser) return;

      const result = game.makeMove(move, currentUser.id);
      if (!result.success) {
        socket.emit('move_rejected', { error: result.error });
        return;
      }

      io.to(`game:${gameId}`).emit('move_made', {
        move: result.move,
        fen: result.fen,
        inCheck: result.inCheck,
        whiteTime: result.whiteTime,
        blackTime: result.blackTime,
        capturedPieces: game.capturedPieces,
        moveHistory: game.moveHistory
      });

      if (result.status !== 'active') {
        handleGameCompletion(game, io);
      }
    });

    socket.on('resign_game', ({ gameId }) => {
      const game = activeGames.get(gameId);
      if (!game || !currentUser) return;
      game.resign(currentUser.id);
      handleGameCompletion(game, io);
    });

    socket.on('offer_draw', ({ gameId }) => {
      const game = activeGames.get(gameId);
      if (!game || !currentUser) return;
      if (game.offerDraw(currentUser.id)) {
        socket.to(`game:${gameId}`).emit('draw_offered', { fromPlayer: currentUser.username });
      }
    });

    socket.on('respond_draw', ({ gameId, accept }) => {
      const game = activeGames.get(gameId);
      if (!game || !currentUser) return;
      if (accept) {
        game.acceptDraw(currentUser.id);
        handleGameCompletion(game, io);
      } else {
        game.declineDraw(currentUser.id);
        io.to(`game:${gameId}`).emit('draw_declined');
      }
    });

    socket.on('request_rematch', ({ gameId }) => {
      const game = activeGames.get(gameId);
      if (!game || !currentUser) return;

      if (!game.rematchRequestedBy) {
        game.rematchRequestedBy = currentUser.id;
        socket.to(`game:${gameId}`).emit('rematch_requested', { from: currentUser.username });
      } else if (game.rematchRequestedBy !== currentUser.id) {
        // Rematch accepted! Swap colors and create fresh session
        const newGameId = `match_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newSession = new ChessGameSession({
          id: newGameId,
          whitePlayer: game.blackPlayer,
          blackPlayer: game.whitePlayer,
          timeControl: { baseMinutes: game.baseMinutes, incrementSeconds: game.incrementSeconds },
          isRated: game.isRated,
          format: game.format
        });

        activeGames.set(newGameId, newSession);
        io.to(`game:${gameId}`).emit('rematch_started', {
          newGameId,
          game: newSession.getState()
        });
      }
    });

    // 5. In-Game Chat & Quick Messages
    socket.on('send_chat_message', ({ gameId, text, emoji }) => {
      if (!currentUser || (!text && !emoji)) return;
      io.to(`game:${gameId}`).emit('new_chat_message', {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        sender: currentUser,
        text,
        emoji,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    });

    // 6. WebRTC Voice Chat Signaling with Mutual Consent
    socket.on('request_voice_chat', ({ gameId }) => {
      if (!currentUser) return;
      socket.to(`game:${gameId}`).emit('voice_chat_invitation', {
        from: currentUser
      });
    });

    socket.on('respond_voice_chat', ({ gameId, accept }) => {
      if (!currentUser) return;
      io.to(`game:${gameId}`).emit('voice_chat_response', {
        accepted: accept,
        by: currentUser
      });
    });

    socket.on('webrtc_signal', ({ gameId, signal, to }) => {
      if (to) {
        io.to(to).emit('webrtc_signal', { signal, from: socket.id, user: currentUser });
      } else {
        socket.to(`game:${gameId}`).emit('webrtc_signal', { signal, from: socket.id, user: currentUser });
      }
    });

    socket.on('voice_status_update', ({ gameId, isMuted, isSpeaking }) => {
      socket.to(`game:${gameId}`).emit('voice_peer_status', {
        userId: currentUser?.id,
        isMuted,
        isSpeaking
      });
    });

    // 7. Spectator Join
    socket.on('spectate_game', ({ gameId }) => {
      const game = activeGames.get(gameId);
      if (!game) {
        socket.emit('error_message', { message: 'Match not found' });
        return;
      }
      socket.join(`game:${gameId}`);
      game.spectators.set(socket.id, currentUser || { username: 'Spectator' });
      socket.emit('game_spectate_state', { game: game.getState() });
      io.to(`game:${gameId}`).emit('spectator_count', { count: game.spectators.size });
    });

    // 8. Friend Challenge & Social
    socket.on('challenge_friend', ({ friendId, config }) => {
      if (!currentUser) return;
      const challengeId = `chal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      io.to(`user:${friendId}`).emit('incoming_challenge', {
        challengeId,
        from: currentUser,
        config: config || { timeControl: { baseMinutes: 5, incrementSeconds: 0 }, format: 'blitz' }
      });
    });

    socket.on('accept_challenge', ({ challengeId, fromUserId, config }) => {
      if (!currentUser) return;
      const gameId = `match_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const opponent = Database.getUserById(fromUserId);
      if (!opponent) return;

      const session = new ChessGameSession({
        id: gameId,
        whitePlayer: opponent,
        blackPlayer: currentUser,
        timeControl: config.timeControl || { baseMinutes: 5, incrementSeconds: 0 },
        isRated: true,
        format: config.format || 'blitz'
      });

      activeGames.set(gameId, session);

      // Notify both players
      io.to(`user:${fromUserId}`).emit('challenge_accepted', { gameId, side: 'w' });
      socket.emit('challenge_accepted', { gameId, side: 'b' });
    });

    // 9. Disconnect Handling
    socket.on('disconnect', () => {
      if (currentUser) {
        const userSet = userSockets.get(currentUser.id);
        if (userSet) {
          userSet.delete(socket.id);
          if (userSet.size === 0) {
            userSockets.delete(currentUser.id);
            Database.updateUser(currentUser.id, { isOnline: false });
            // Notify friends
            const friends = Database.getUserFriends(currentUser.id);
            friends.forEach(f => {
              io.to(`user:${f.id}`).emit('friend_status', { userId: currentUser.id, isOnline: false });
            });
          }
        }

        // Clean up matchmaking
        const queueIdx = matchmakingQueue.findIndex(q => q.socketId === socket.id);
        if (queueIdx !== -1) matchmakingQueue.splice(queueIdx, 1);

        // Notify active game
        const gameId = socketCurrentGame.get(socket.id);
        if (gameId) {
          const game = activeGames.get(gameId);
          if (game && game.status === 'active') {
            socket.to(`game:${gameId}`).emit('opponent_disconnected', {
              userId: currentUser.id,
              username: currentUser.username
            });
          }
          socketCurrentGame.delete(socket.id);
        }
      }
    });
  });
}
