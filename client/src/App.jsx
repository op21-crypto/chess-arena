import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Chess } from 'chess.js';
import {
  Home, Trophy, Swords, Users, BookOpen, Bot, Shield, Volume2, VolumeX,
  Palette, User, LogOut, Bell, Flame, Sparkles, ChevronRight, Settings, Music, Zap, ArrowRight
} from 'lucide-react';

import { Chessboard } from './components/Chessboard.jsx';
import { PlayerCard } from './components/PlayerCard.jsx';
import { MoveHistory } from './components/MoveHistory.jsx';
import { GameControls } from './components/GameControls.jsx';
import { GameChat } from './components/GameChat.jsx';
import { VoiceControls } from './components/VoiceControls.jsx';
import { MatchmakingModal, FriendRoomModal, PlayAIModal } from './components/PlayModals.jsx';
import { AuthModal } from './components/AuthModal.jsx';
import { ProfileModal } from './components/ProfileModal.jsx';
import { ProfileView } from './components/ProfileView.jsx';
import { FriendsDrawer } from './components/FriendsDrawer.jsx';
import { PlayView } from './components/PlayView.jsx';
import { PuzzleView } from './components/PuzzleView.jsx';
import { LessonView } from './components/LessonView.jsx';
import { LeaderboardView } from './components/LeaderboardView.jsx';
import { AnalysisView } from './components/AnalysisView.jsx';
import { AdminView } from './components/AdminView.jsx';
import { GameOverModal } from './components/GameOverModal.jsx';
import { SettingsModal } from './components/SettingsModal.jsx';
import { DailyStreakModal } from './components/DailyStreakModal.jsx';
import { MiniMusicPlayer } from './components/MiniMusicPlayer.jsx';
import { BOARD_THEMES } from './components/PieceIcons.jsx';
import { sound } from './utils/audio.js';
import { musicEngine } from './utils/music.js';
import { triggerHaptic, speakMove } from './utils/device.js';
import { getOpeningName } from './utils/openings.js';
import { safeStorage } from './utils/storage.js';
import { getLocalAIMove } from './utils/aiEngine.js';
import { calculateUserRanking } from './data/leaderboardData.js';

const DEFAULT_SETTINGS = {
  appTheme: 'dark',
  soundEnabled: true,
  soundOnlyPieceMove: false,
  musicEnabled: false,
  musicDuringGame: true,
  musicDuringPuzzles: true,
  musicDuringLessons: true,
  musicVolume: 0.35,
  musicTrackIndex: 0,
  vibrations: true,
  voiceCommentary: false,
  voiceCommentaryOnlyOpponent: true,
  boardTheme: 'cappuccino',
  pieceTheme: 'alexander',
  showLegalMoves: true,
  highlightLastMove: true,
  showCoordinates: true,
  kingInCheckIndicator: true,
  showOpenings: true,
  allowChat: true,
  alwaysPromoteToQueen: false,
  enablePremoves: true
};

export default function App() {
  // Navigation & View State (5 Primary: Home, Play Online, Puzzles, Learn, Profile)
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'play' | 'game' | 'puzzles' | 'lessons' | 'profile' | 'admin'
  const [profileSubTab, setProfileSubTab] = useState('overview'); // 'overview' | 'rankings' | 'settings'
  const [settings, setSettings] = useState(() => {
    try {
      const saved = safeStorage.getItem('chess_arena_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {}
    return DEFAULT_SETTINGS;
  });

  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    try {
      safeStorage.setItem('chess_arena_settings', JSON.stringify(newSettings));
    } catch (e) {}
  };

  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFriendsDrawer, setShowFriendsDrawer] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);

  // Resilient guest user initializer (ensures Firefox/mobile users are never blocked)
  const getOrCreateUser = () => {
    if (currentUser) return currentUser;
    const guestNum = Math.floor(1000 + Math.random() * 9000);
    const guest = {
      id: `guest_${Date.now()}_${guestNum}`,
      username: `Guest_${guestNum}`,
      role: 'guest',
      ratings: { bullet: 1200, blitz: 1200, rapid: 1200, classical: 1200 },
      country: 'UN',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=Guest_${guestNum}`
    };
    setCurrentUser(guest);
    safeStorage.setItem('token', `mock_guest_token_${Date.now()}`);
    return guest;
  };

  // Modals for Match Launching
  const [showMatchmakingModal, setShowMatchmakingModal] = useState(false);
  const [isSearchingMatch, setIsSearchingMatch] = useState(false);
  const [showFriendRoomModal, setShowFriendRoomModal] = useState(false);
  const [createdRoomInfo, setCreatedRoomInfo] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [analysisGame, setAnalysisGame] = useState(null);
  const [showGameOverModal, setShowGameOverModal] = useState(false);

  // Active Game State
  const [gameSession, setGameSession] = useState(null); // Full gameState from server
  const [playerColor, setPlayerColor] = useState('w'); // 'w' | 'b' | 'spectator'
  const [boardFlipped, setBoardFlipped] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [isAIGame, setIsAIGame] = useState(false);
  const [aiLevel, setAiLevel] = useState(2);
  const [aiThinking, setAiThinking] = useState(false);
  const [voiceCallTrigger, setVoiceCallTrigger] = useState(0);

  // Socket reference
  const socketRef = useRef(null);

  // Initialize Audio & Music Settings
  useEffect(() => {
    sound.enabled = settings.soundEnabled;
    musicEngine.setVolume(settings.musicVolume);
  }, [settings.soundEnabled, settings.musicVolume]);

  // Background Music Lifecycle Management across Game, Puzzles, Lessons, Lobby
  useEffect(() => {
    if (!settings.musicEnabled) {
      musicEngine.stop();
      return;
    }

    const shouldPlay =
      (activeTab === 'game' && settings.musicDuringGame) ||
      (activeTab === 'puzzles' && settings.musicDuringPuzzles) ||
      ((activeTab === 'lessons' || activeTab === 'learn') && settings.musicDuringLessons) ||
      activeTab === 'home' ||
      activeTab === 'play' ||
      activeTab === 'profile';

    if (shouldPlay) {
      musicEngine.start();
    } else {
      musicEngine.stop();
    }
  }, [
    activeTab,
    settings.musicEnabled,
    settings.musicDuringGame,
    settings.musicDuringPuzzles,
    settings.musicDuringLessons
  ]);

  useEffect(() => {
    // 1. Check existing auth token
    const token = safeStorage.getItem('token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            if (data.user.email?.toLowerCase() === 'op21plus@gmail.com' || data.user.username === 'op21plus') {
              data.user.role = 'admin';
            }
            setCurrentUser(data.user);
          }
        })
        .catch(() => safeStorage.removeItem('token'));
    }

    // 2. Initialize Socket.IO connection
    const socket = io('/', { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to Chess Arena Gateway:', socket.id);
      if (currentUser) {
        socket.emit('authenticate', currentUser);
      }
    });

    // Matchmaking events
    socket.on('match_found', ({ gameId, side, game }) => {
      setIsSearchingMatch(false);
      setShowMatchmakingModal(false);
      setShowGameOverModal(false);
      setGameSession(game);
      setPlayerColor(side);
      setChatMessages([]);
      setIsAIGame(false);
      setActiveTab('game');
      sound.playMove();
    });

    socket.on('room_created', (data) => {
      setCreatedRoomInfo(data);
      setGameSession(data.game);
      setPlayerColor(data.game.whitePlayer?.id === currentUser?.id ? 'w' : 'b');
    });

    socket.on('room_updated', ({ game, ready }) => {
      setGameSession(game);
      if (ready) {
        setShowFriendRoomModal(false);
        setShowGameOverModal(false);
        setActiveTab('game');
        sound.playMove();
      }
    });

    // Move synchronization
    socket.on('move_made', (data) => {
      setGameSession(prev => prev ? {
        ...prev,
        fen: data.fen,
        inCheck: data.inCheck,
        whiteTime: data.whiteTime,
        blackTime: data.blackTime,
        capturedPieces: data.capturedPieces,
        moveHistory: data.moveHistory,
        turn: new Chess(data.fen).turn()
      } : null);

      // Voice Commentary & Haptics
      const lastMoveObj = data.moveHistory?.[data.moveHistory.length - 1];
      if (lastMoveObj) {
        if (settings.voiceCommentary) {
          const isOpponentMove = lastMoveObj.color !== playerColor;
          if (!settings.voiceCommentaryOnlyOpponent || isOpponentMove) {
            speakMove(lastMoveObj.san);
          }
        }
      }
    });

    socket.on('clock_sync', (data) => {
      setGameSession(prev => prev ? {
        ...prev,
        whiteTime: data.whiteTime,
        blackTime: data.blackTime,
        turn: data.turn
      } : null);
    });

    socket.on('game_over', (data) => {
      setGameSession(prev => prev ? {
        ...prev,
        status: data.status,
        winner: data.winner,
        winReason: data.winReason,
        whiteEloChange: data.whiteEloChange || 0,
        blackEloChange: data.blackEloChange || 0,
        isGameOver: true
      } : null);

      setShowGameOverModal(true);

      const isWinner = (data.winner === 'white' && playerColor === 'w') || (data.winner === 'black' && playerColor === 'b');
      if (isWinner) {
        sound.playVictory();
      } else {
        sound.playGameOver();
      }
    });

    socket.on('new_chat_message', (msg) => {
      setChatMessages(prev => [...prev, msg]);
    });

    socket.on('draw_offered', ({ fromPlayer }) => {
      setGameSession(prev => prev ? {
        ...prev,
        drawOfferedBy: prev.whitePlayer?.username === fromPlayer ? 'w' : 'b'
      } : null);
    });

    socket.on('rematch_started', ({ newGameId, game }) => {
      setGameSession(game);
      setShowGameOverModal(false);
      setPlayerColor(prev => prev === 'w' ? 'b' : 'w');
      setChatMessages([]);
      sound.playMove();
    });

    // Check URL params for room invite
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      const activeUser = getOrCreateUser();
      fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: roomParam, user: activeUser })
      })
        .then(r => r.json())
        .then(data => {
          if (data.room) {
            setGameSession(data.room);
            const isWhite = data.room.whitePlayer?.id === activeUser.id;
            setPlayerColor(isWhite ? 'w' : 'b');
            setActiveTab('game');
            sound.playMove();
          }
        })
        .catch(() => {});

      setTimeout(() => {
        socket.emit('join_room', { roomId: roomParam });
        setActiveTab('game');
      }, 500);
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  // Room synchronization polling (ensures moves & player joins stay synced even if WebSocket is disconnected)
  useEffect(() => {
    if (!gameSession?.id || isAIGame || gameSession.isGameOver) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/get?id=${gameSession.id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data?.room) {
          const r = data.room;
          const movesDiffer = (r.moveHistory?.length || 0) !== (gameSession.moveHistory?.length || 0);
          const fenDiffers = r.fen && r.fen !== gameSession.fen;
          const statusDiffers = r.status && r.status !== gameSession.status;
          const opponentJoined = (!gameSession.blackPlayer && r.blackPlayer) || (!gameSession.whitePlayer && r.whitePlayer);

          if (movesDiffer || fenDiffers || statusDiffers || opponentJoined) {
            setGameSession(prev => ({
              ...prev,
              ...r,
              turn: new Chess(r.fen || prev.fen).turn()
            }));

            if (movesDiffer) {
              sound.playMove();
              const lastMove = r.moveHistory?.[r.moveHistory.length - 1];
              if (lastMove && settings.voiceCommentary) {
                speakMove(lastMove.san);
              }
            }

            if (r.status === 'checkmate' || r.status === 'resigned' || r.status === 'stalemate' || r.status === 'draw') {
              setShowGameOverModal(true);
            }
          }
        }
      } catch {
        // Silent poll fallback
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [gameSession?.id, gameSession?.fen, gameSession?.moveHistory?.length, gameSession?.status, isAIGame]);

  // Update socket authentication when user changes
  useEffect(() => {
    if (currentUser && socketRef.current) {
      socketRef.current.emit('authenticate', currentUser);
    }
  }, [currentUser]);

  // Handle Matchmaking
  const handleStartMatchmaking = (preset) => {
    const activeUser = getOrCreateUser();
    setIsSearchingMatch(true);
    socketRef.current?.emit('join_matchmaking', {
      format: preset.format,
      timeControl: { baseMinutes: preset.baseMinutes, incrementSeconds: preset.incrementSeconds }
    });
  };

  const handleCancelMatchmaking = () => {
    setIsSearchingMatch(false);
    socketRef.current?.emit('cancel_matchmaking');
  };

  // Handle Private Rooms
  const handleCreateFriendRoom = async (config) => {
    const activeUser = getOrCreateUser();
    const roomId = `arena_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const isWhite = config.colorPreference === 'white' || (config.colorPreference === 'random' && Math.random() > 0.5);
    const baseMinutes = config.timeControl?.baseMinutes || 10;

    const initialGame = {
      id: roomId,
      roomId,
      isRoom: true,
      whitePlayer: isWhite ? activeUser : null,
      blackPlayer: isWhite ? null : activeUser,
      timeControl: { baseMinutes, incrementSeconds: config.timeControl?.incrementSeconds || 0 },
      whiteTime: baseMinutes * 60 * 1000,
      blackTime: baseMinutes * 60 * 1000,
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      status: 'waiting',
      moveHistory: [],
      capturedPieces: { white: [], black: [] },
      createdAt: new Date().toISOString()
    };

    // Immediately set createdRoomInfo so the share link is instantly available!
    setCreatedRoomInfo({ roomId, game: initialGame });
    setGameSession(initialGame);
    setPlayerColor(isWhite ? 'w' : 'b');

    // Sync room with backend REST endpoint
    try {
      await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          timeControl: config.timeControl,
          colorPreference: config.colorPreference,
          user: activeUser
        })
      });
    } catch {
      // Local room state intact
    }

    // Also emit to socket if gateway connected
    socketRef.current?.emit('create_room', { ...config, roomId });
  };

  const handleJoinFriendRoom = async (roomId) => {
    const cleanId = (roomId || '').trim();
    if (!cleanId) return;
    const activeUser = getOrCreateUser();

    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: cleanId, user: activeUser })
      });
      const data = await res.json();
      if (data?.room) {
        setGameSession(data.room);
        const isWhite = data.room.whitePlayer?.id === activeUser.id;
        setPlayerColor(isWhite ? 'w' : 'b');
        setShowFriendRoomModal(false);
        setShowGameOverModal(false);
        setActiveTab('game');
        sound.playMove();
      }
    } catch {
      // Socket fallback
    }

    socketRef.current?.emit('join_room', { roomId: cleanId });
    setShowFriendRoomModal(false);
    setActiveTab('game');
  };

  // Handle AI Practice Matches
  const handleStartAIGame = ({ level, color }) => {
    setIsAIGame(true);
    setAiLevel(level);
    setBoardFlipped(false);
    setAiThinking(false);
    setShowAIModal(false);
    setShowGameOverModal(false);
    setActiveTab('game');

    const startingSession = {
      id: `ai_${Date.now()}`,
      whitePlayer: color === 'w' ? currentUser || { username: 'You', elo: 1200 } : { username: `Stockfish Level ${level}`, elo: 800 + level * 350 },
      blackPlayer: color === 'w' ? { username: `Stockfish Level ${level}`, elo: 800 + level * 350 } : currentUser || { username: 'You', elo: 1200 },
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      turn: 'w',
      inCheck: false,
      isGameOver: false,
      status: 'active',
      whiteTime: 600000,
      blackTime: 600000,
      moveHistory: [],
      capturedPieces: { white: [], black: [] }
    };

    setGameSession(startingSession);
    setPlayerColor(color);

    // If user chose black, AI makes first move as White
    if (color === 'b') {
      setTimeout(() => {
        triggerAIMove(startingSession.fen, startingSession, level);
      }, 350);
    }
  };

  // Local clock interval for AI matches
  useEffect(() => {
    if (!isAIGame || !gameSession || gameSession.isGameOver) return;
    const interval = setInterval(() => {
      setGameSession(prev => {
        if (!prev || prev.isGameOver) return prev;
        const isWhiteTurn = prev.turn === 'w';
        const newWhiteTime = isWhiteTurn ? Math.max(0, prev.whiteTime - 100) : prev.whiteTime;
        const newBlackTime = !isWhiteTurn ? Math.max(0, prev.blackTime - 100) : prev.blackTime;

        if (newWhiteTime <= 0 || newBlackTime <= 0) {
          const winner = newWhiteTime <= 0 ? 'black' : 'white';
          setShowGameOverModal(true);
          const isWinner = (winner === 'white' && playerColor === 'w') || (winner === 'black' && playerColor === 'b');
          if (isWinner) {
            sound.playVictory();
          } else {
            sound.playGameOver();
          }
          return {
            ...prev,
            whiteTime: newWhiteTime,
            blackTime: newBlackTime,
            isGameOver: true,
            status: 'timeout',
            winner,
            winReason: 'timeout'
          };
        }

        return {
          ...prev,
          whiteTime: newWhiteTime,
          blackTime: newBlackTime
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isAIGame, gameSession?.isGameOver, playerColor]);

  const triggerAIMove = async (fen, session, level) => {
    setAiThinking(true);
    try {
      let aiMove = null;

      // 1. Try server endpoint with fast timeout (1200ms)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);
        const res = await fetch('/api/ai/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fen, level }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          aiMove = await res.json();
        }
      } catch (networkErr) {
        // Fallback to client-side engine immediately
      }

      // 2. Fallback to ultra-fast client-side AI engine if server is slow, offline, or returns error
      if (!aiMove || !aiMove.from || !aiMove.to) {
        aiMove = getLocalAIMove(fen, level);
      }

      if (!aiMove || !aiMove.from || !aiMove.to) {
        console.warn('AI could not find legal move.');
        return;
      }

      const currentFen = session?.fen || fen;
      const chess = new Chess(currentFen);
      const moveRes = chess.move({
        from: aiMove.from,
        to: aiMove.to,
        promotion: aiMove.promotion || 'q'
      });

      if (moveRes) {
        sound.playMove();
        if (settings.voiceCommentary) {
          speakMove(moveRes.san);
        }
        const updatedMoves = [
          ...(session?.moveHistory || []),
          {
            from: moveRes.from,
            to: moveRes.to,
            piece: moveRes.piece,
            color: moveRes.color,
            san: moveRes.san,
            fen: chess.fen()
          }
        ];

        const isOver = chess.isGameOver();
        let status = 'active';
        let winner = null;
        let winReason = null;

        if (isOver) {
          if (chess.isCheckmate()) {
            status = 'checkmate';
            winner = chess.turn() === 'w' ? 'black' : 'white';
            winReason = 'checkmate';
          } else if (chess.isStalemate()) {
            status = 'stalemate';
            winner = 'draw';
            winReason = 'stalemate';
          } else {
            status = 'draw';
            winner = 'draw';
            winReason = 'draw';
          }
          setShowGameOverModal(true);
          const isWinner = (winner === 'white' && playerColor === 'w') || (winner === 'black' && playerColor === 'b');
          if (isWinner) {
            sound.playVictory();
          } else {
            sound.playGameOver();
          }
        }

        setGameSession(prev => ({
          ...prev,
          fen: chess.fen(),
          turn: chess.turn(),
          inCheck: chess.inCheck(),
          isGameOver: isOver,
          status: isOver ? status : 'active',
          winner: isOver ? winner : null,
          winReason: isOver ? winReason : null,
          moveHistory: updatedMoves
        }));
      }
    } catch (err) {
      console.error('AI move execution error:', err);
    } finally {
      setAiThinking(false);
    }
  };

  // In-Game Move Execution
  const handleMove = (moveObj) => {
    if (!gameSession) return;

    if (isAIGame) {
      // Local AI match
      const chess = new Chess(gameSession.fen);
      const res = chess.move(moveObj);
      if (res) {
        if (settings.voiceCommentary && !settings.voiceCommentaryOnlyOpponent) {
          speakMove(res.san);
        }
        const updatedHistory = [
          ...gameSession.moveHistory,
          {
            from: res.from,
            to: res.to,
            piece: res.piece,
            color: res.color,
            san: res.san,
            fen: chess.fen()
          }
        ];

        const isOver = chess.isGameOver();
        let status = 'active';
        let winner = null;
        let winReason = null;

        if (isOver) {
          if (chess.isCheckmate()) {
            status = 'checkmate';
            winner = chess.turn() === 'w' ? 'black' : 'white';
            winReason = 'checkmate';
          } else if (chess.isStalemate()) {
            status = 'stalemate';
            winner = 'draw';
            winReason = 'stalemate';
          } else {
            status = 'draw';
            winner = 'draw';
            winReason = 'draw';
          }
          setShowGameOverModal(true);
          const isWinner = (winner === 'white' && playerColor === 'w') || (winner === 'black' && playerColor === 'b');
          if (isWinner) {
            sound.playVictory();
          } else {
            sound.playGameOver();
          }
        }

        const updatedSession = {
          ...gameSession,
          fen: chess.fen(),
          turn: chess.turn(),
          inCheck: chess.inCheck(),
          isGameOver: isOver,
          status: isOver ? status : 'active',
          winner: isOver ? winner : null,
          winReason: isOver ? winReason : null,
          moveHistory: updatedHistory
        };
        setGameSession(updatedSession);

        if (!isOver) {
          setTimeout(() => {
            triggerAIMove(chess.fen(), updatedSession, aiLevel);
          }, 300);
        }
      }
    } else {
      // Multiplayer move (optimistic local update + REST sync + socket emit)
      try {
        const chess = new Chess(gameSession.fen);
        const res = chess.move(moveObj);
        if (res) {
          sound.playMove();
          if (settings.voiceCommentary && !settings.voiceCommentaryOnlyOpponent) {
            speakMove(res.san);
          }

          const updatedHistory = [
            ...(gameSession.moveHistory || []),
            {
              from: res.from,
              to: res.to,
              piece: res.piece,
              color: res.color,
              san: res.san,
              fen: chess.fen()
            }
          ];

          const isOver = chess.isGameOver();
          let status = 'active';
          let winner = null;
          let winReason = null;

          if (isOver) {
            if (chess.isCheckmate()) {
              status = 'checkmate';
              winner = chess.turn() === 'w' ? 'black' : 'white';
              winReason = 'checkmate';
            } else if (chess.isStalemate()) {
              status = 'stalemate';
              winner = 'draw';
              winReason = 'stalemate';
            } else {
              status = 'draw';
              winner = 'draw';
              winReason = 'draw';
            }
            setShowGameOverModal(true);
            const isWinner = (winner === 'white' && playerColor === 'w') || (winner === 'black' && playerColor === 'b');
            if (isWinner) sound.playVictory();
            else sound.playGameOver();
          }

          const updatedSession = {
            ...gameSession,
            fen: chess.fen(),
            turn: chess.turn(),
            inCheck: chess.inCheck(),
            isGameOver: isOver,
            status: isOver ? status : 'active',
            winner: isOver ? winner : null,
            winReason: isOver ? winReason : null,
            moveHistory: updatedHistory
          };
          setGameSession(updatedSession);

          // REST Sync for serverless persistence
          if (gameSession.id) {
            fetch('/api/rooms/move', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                roomId: gameSession.id,
                move: {
                  from: res.from,
                  to: res.to,
                  piece: res.piece,
                  color: res.color,
                  san: res.san,
                  fen: chess.fen()
                },
                fen: chess.fen(),
                status: isOver ? status : 'active',
                winner: isOver ? winner : null,
                winReason: isOver ? winReason : null
              })
            }).catch(() => {});
          }
        }
      } catch (e) {
        console.warn('Move validation fallback:', e);
      }

      socketRef.current?.emit('make_move', {
        gameId: gameSession.id,
        move: moveObj
      });
    }
  };

  const handleResign = () => {
    if (isAIGame) {
      const oppWinner = playerColor === 'w' ? 'black' : 'white';
      setGameSession(prev => ({
        ...prev,
        isGameOver: true,
        status: 'resigned',
        winner: oppWinner,
        winReason: 'resignation'
      }));
      setShowGameOverModal(true);
      sound.playGameOver();
    } else {
      socketRef.current?.emit('resign_game', { gameId: gameSession.id });
    }
  };

  const handleOfferDraw = () => {
    if (!isAIGame) {
      socketRef.current?.emit('offer_draw', { gameId: gameSession.id });
    }
  };

  const handleRespondDraw = (accept) => {
    if (!isAIGame) {
      socketRef.current?.emit('respond_draw', { gameId: gameSession.id, accept });
    }
  };

  const handleRequestRematch = () => {
    if (isAIGame) {
      handleStartAIGame({ level: aiLevel, color: playerColor === 'w' ? 'b' : 'w' });
    } else {
      socketRef.current?.emit('request_rematch', { gameId: gameSession.id });
    }
  };

  const handleSendMessage = ({ text, emoji }) => {
    if (!isAIGame) {
      socketRef.current?.emit('send_chat_message', { gameId: gameSession.id, text, emoji });
    } else {
      // Local chat in AI game
      const newMsg = {
        id: `msg_${Date.now()}`,
        sender: currentUser || { username: 'You' },
        text,
        emoji,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, newMsg]);
    }
  };

  // Header active player identification
  const whitePlayer = gameSession?.whitePlayer;
  const blackPlayer = gameSession?.blackPlayer;
  const isWhite = playerColor === 'w';
  const opponent = isWhite ? blackPlayer : whitePlayer;
  const me = isWhite ? whitePlayer : blackPlayer;
  const isLight = settings.appTheme === 'alabaster';

  const currentTurn = gameSession ? new Chess(gameSession.fen).turn() : 'w';

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-amber-500 selection:text-black transition-colors ${
      isLight ? 'bg-[#f4f7fb] text-slate-900' : 'luxury-bg text-slate-100'
    }`}>
      {/* Top Navbar */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 py-2.5 transition-colors ${
        isLight ? 'bg-white/95 border-slate-200 text-slate-900 shadow-sm' : 'bg-slate-950/80 border-slate-800 text-white'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Slogan */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <span className="text-xl">♟️</span>
            </div>
            <div>
              <span className={`text-base font-extrabold tracking-tight flex items-center gap-1 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                <span>CHESS</span>
                <span className="text-amber-500">ARENA</span>
              </span>
              <span className={`text-[10px] block font-medium -mt-1 hidden sm:block ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Play. Challenge. Conquer.
              </span>
            </div>
          </div>

          {/* Navigation Links (Visible on desktop/wide tablet) */}
          <nav className={`hidden lg:flex items-center gap-1 p-1 rounded-2xl border transition-colors ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/80 border-slate-800'
          }`}>
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'play', label: 'Play Online', icon: Swords },
              { id: 'puzzles', label: 'Puzzles', icon: Flame },
              { id: 'lessons', label: 'Learn', icon: BookOpen },
              { id: 'leaderboard', label: 'Rankings', icon: Shield },
              ...(currentUser?.role === 'admin' ? [{ id: 'admin', label: 'Admin', icon: Sparkles }] : [])
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Tools */}
          <div className="flex items-center gap-1.5 md:gap-2">
            {/* Ambient Background Music Toggle */}
            <button
              onClick={() => {
                const nextVal = !settings.musicEnabled;
                handleUpdateSettings({ ...settings, musicEnabled: nextVal });
                if (nextVal) {
                  musicEngine.start();
                } else {
                  musicEngine.stop();
                }
              }}
              className={`p-2 rounded-xl border transition-all ${
                settings.musicEnabled
                  ? 'bg-amber-500/20 text-amber-500 border-amber-500/50 shadow-md shadow-amber-500/10 animate-pulse'
                  : isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title={settings.musicEnabled ? `Playing: ${musicEngine.getCurrentTrack().name}` : 'Muted Background Music'}
            >
              <Music className="w-4 h-4" />
            </button>

            {/* Sound FX Toggle */}
            <button
              onClick={() => {
                handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
              }}
              className={`p-2 rounded-xl border transition-colors ${
                isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-amber-600'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-400'
              }`}
              title={settings.soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Global Settings Trigger */}
            <button
              onClick={() => {
                setProfileSubTab('settings');
                setActiveTab('profile');
              }}
              className={`p-2 rounded-xl border transition-colors ${
                activeTab === 'profile' && profileSubTab === 'settings'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-amber-600'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-400'
              }`}
              title="Application Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Daily Streak Tracker Pill Button */}
            <button
              onClick={() => setShowStreakModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/10 border border-amber-500/40 text-amber-400 hover:text-amber-300 hover:border-amber-400 font-bold text-xs shadow-xs transition-all active:scale-95"
              title="Daily Streak Tracker (🔥 7 Days Active)"
            >
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-pulse" />
              <span className="hidden sm:inline font-mono">7 Days</span>
              <span className="sm:hidden font-mono text-[11px]">7d</span>
            </button>

            {/* Friends Drawer Toggle */}
            {currentUser && (
              <button
                onClick={() => setShowFriendsDrawer(true)}
                className={`p-2 rounded-xl border transition-colors relative ${
                  isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-amber-600'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-400'
                }`}
                title="Friends & Social"
              >
                <Users className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
              </button>
            )}

            {/* Profile Avatar / Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 md:gap-2">
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      activeTab === 'admin'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                    }`}
                    title="Open Administrator Command Center"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Admin</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setProfileSubTab('overview');
                    setActiveTab('profile');
                  }}
                  className={`flex items-center gap-2 p-1 pl-2.5 rounded-2xl border transition-colors ${
                    activeTab === 'profile' && profileSubTab === 'overview'
                      ? 'border-amber-400 bg-amber-500/10'
                      : isLight
                      ? 'bg-slate-100 border-slate-200 hover:border-amber-500'
                      : 'bg-slate-900 border-slate-800 hover:border-amber-500/50'
                  }`}
                >
                  <span className={`text-xs font-bold max-w-[90px] truncate ${
                    isLight ? 'text-slate-800' : 'text-white'
                  }`}>
                    {currentUser.username}
                  </span>
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    className="w-7 h-7 rounded-full object-cover border border-amber-400"
                  />
                </button>
                <button
                  onClick={() => {
                    safeStorage.removeItem('token');
                    setCurrentUser(null);
                  }}
                  className={`p-2 rounded-xl border transition-colors ${
                    isLight
                      ? 'bg-slate-100 border-slate-200 text-slate-500 hover:text-red-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-red-400'
                  }`}
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/10"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content View Switcher */}
      <main className="flex-1 flex flex-col relative">
        {activeTab === 'home' && (() => {
          const userElo = currentUser?.ratings?.rapid || currentUser?.elo || 1078;
          const { rank: userRank, totalPlayers, percentile, countryRank } = calculateUserRanking(userElo);
          const currentUsername = currentUser?.username || 'Guest Competitor';
          const currentAvatar = currentUser?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=LuffyGear5';
          const currentTier = currentUser?.tier || 'Intermediate';

          return (
            <div className="max-w-6xl w-full mx-auto px-3.5 sm:px-6 py-4 md:py-8 space-y-6 flex-1 flex flex-col justify-center relative">
              {/* Live Arena Telemetry Status Strip */}
              <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-lg text-xs backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="font-extrabold text-white font-mono">18,450</span>
                  <span className="text-slate-400 font-medium">Players Online</span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-slate-400 font-medium">
                  <span className="text-amber-400 font-bold font-mono">⚔️ 4,280</span>
                  <span>Active Battles</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-emerald-400 font-bold font-mono">1.1s</span>
                  <span>Avg Pairing</span>
                </div>
              </div>

              {/* Grandmaster Arena Hero Showcase */}
              <div className="relative rounded-3xl p-5 sm:p-8 md:p-10 border border-amber-500/30 bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 shadow-2xl shadow-amber-500/10 overflow-hidden backdrop-blur-xl">
                {/* Ethereal Ambient Glows */}
                <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                  {/* Left Column: Headline, Time Controls & Actions */}
                  <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Arena Season 2026</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
                      Master the <span className="gold-gradient-text">Board</span>.
                    </h1>

                    <p className="text-sm md:text-base text-slate-300 font-medium max-w-lg mx-auto lg:mx-0">
                      Play real-time chess with grandmasters and enthusiasts worldwide. Official FIDE clock rules, rated matchmaking, and anti-cheat validation.
                    </p>

                    {/* Quick-Play Time Controls (1-Tap Direct Launch) */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Quick Play Time Controls
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { label: '1 min', type: 'Bullet', icon: '⚡', format: 'bullet', baseMinutes: 1, incrementSeconds: 0 },
                          { label: '3 min', type: 'Blitz', icon: '🔥', format: 'blitz', baseMinutes: 3, incrementSeconds: 0, popular: true },
                          { label: '5 min', type: 'Blitz', icon: '⏱️', format: 'blitz', baseMinutes: 5, incrementSeconds: 0 },
                          { label: '10 min', type: 'Rapid', icon: '🎯', format: 'rapid', baseMinutes: 10, incrementSeconds: 0 }
                        ].map((item) => (
                          <button
                            key={item.label}
                            onClick={() => handleStartMatchmaking(item)}
                            className={`p-2.5 rounded-2xl border text-center transition-all group relative overflow-hidden active:scale-95 ${
                              item.popular
                                ? 'bg-amber-500/15 border-amber-500/60 shadow-md shadow-amber-500/10'
                                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {item.popular && (
                              <span className="absolute top-1 right-1 px-1 py-0.2 rounded bg-amber-500 text-slate-950 font-black text-[8px] uppercase">
                                Hot
                              </span>
                            )}
                            <div className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">
                              {item.icon} {item.label}
                            </div>
                            <div className="text-[10px] text-slate-400 font-semibold">{item.type}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Primary Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <button
                        onClick={() => setActiveTab('play')}
                        className="w-full sm:w-auto flex items-center justify-center gap-3 py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-base shadow-xl shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:scale-95"
                      >
                        <Swords className="w-5 h-5 fill-slate-950" />
                        <span>Play Online Now</span>
                      </button>

                      <button
                        onClick={() => setShowFriendRoomModal(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
                      >
                        <Users className="w-4 h-4 text-emerald-400" />
                        <span>Play Friends (Voice 🎙️)</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Daily Tactical Strike Spotlight Board */}
                  <div className="lg:col-span-5 flex flex-col items-center">
                    <div className="w-full max-w-[340px] p-3 rounded-3xl bg-slate-950/90 border border-slate-800/90 shadow-2xl relative space-y-3">
                      <div className="flex items-center justify-between text-xs px-1">
                        <span className="font-bold text-amber-400 flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                          <span>Daily Tactical Strike</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                          +15 Elo
                        </span>
                      </div>

                      <div className="w-full aspect-square rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
                        <Chessboard
                          fen="r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5"
                          playerColor="w"
                          disabled={false}
                          boardTheme={settings.boardTheme}
                          pieceTheme={settings.pieceTheme}
                          showCoordinates={false}
                          onMove={() => {
                            setActiveTab('puzzles');
                          }}
                        />
                      </div>

                      <button
                        onClick={() => setActiveTab('puzzles')}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <span>Solve Daily Puzzle (+15 Elo)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Competitive Game Modes Grid (6 Luxury Cards) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider">
                    Competitive Game Modes
                  </h2>
                  <span className="text-xs text-amber-400 font-medium">Official FIDE Rules</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {/* 1. Play Online */}
                  <div
                    onClick={() => setActiveTab('play')}
                    className="luxury-card p-4 rounded-2xl cursor-pointer group space-y-2 border-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shadow-xs">
                        <Swords className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold text-[10px] border border-amber-500/20">
                        10k+ Playing
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white group-hover:text-amber-400 transition-colors">
                        Play Online
                      </h3>
                      <p className="text-xs text-slate-400">
                        Match against players at your exact ELO rating in real-time.
                      </p>
                    </div>
                  </div>

                  {/* 2. Play Friends */}
                  <div
                    onClick={() => setShowFriendRoomModal(true)}
                    className="luxury-card p-4 rounded-2xl cursor-pointer group space-y-2 border-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shadow-xs">
                        <Users className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                        Voice Call 🎙️
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                        Play with Friends
                      </h3>
                      <p className="text-xs text-slate-400">
                        Create private rooms, share invitation links and speak live.
                      </p>
                    </div>
                  </div>

                  {/* 3. Play AI */}
                  <div
                    onClick={() => setShowAIModal(true)}
                    className="luxury-card p-4 rounded-2xl cursor-pointer group space-y-2 border-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shadow-xs">
                        <Bot className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 font-bold text-[10px] border border-indigo-500/20">
                        Levels 1 - 8
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white group-hover:text-indigo-400 transition-colors">
                        Play Stockfish AI
                      </h3>
                      <p className="text-xs text-slate-400">
                        Practice against intelligent bots from Beginner (800) to GM (2800).
                      </p>
                    </div>
                  </div>

                  {/* 4. Daily Puzzles */}
                  <div
                    onClick={() => setActiveTab('puzzles')}
                    className="luxury-card p-4 rounded-2xl cursor-pointer group space-y-2 border-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform shadow-xs">
                        <Flame className="w-5 h-5 fill-orange-400" />
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 font-bold text-[10px] border border-orange-500/20">
                        🔥 Streak +25 XP
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white group-hover:text-orange-400 transition-colors">
                        Daily Puzzles
                      </h3>
                      <p className="text-xs text-slate-400">
                        Train tactical pattern recognition and build your day streak.
                      </p>
                    </div>
                  </div>

                  {/* 5. Master Lessons */}
                  <div
                    onClick={() => setActiveTab('lessons')}
                    className="luxury-card p-4 rounded-2xl cursor-pointer group space-y-2 border-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform shadow-xs">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 font-bold text-[10px] border border-sky-500/20">
                        64 Lessons
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white group-hover:text-sky-400 transition-colors">
                        Chess Lessons
                      </h3>
                      <p className="text-xs text-slate-400">
                        Voice-guided interactive academy with real drills across 8 chapters.
                      </p>
                    </div>
                  </div>

                  {/* 6. Player Rankings & Standings */}
                  <div
                    onClick={() => {
                      setProfileSubTab('rankings');
                      setActiveTab('profile');
                    }}
                    className="luxury-card p-4 rounded-2xl cursor-pointer group space-y-2 border-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shadow-xs">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold text-[10px] border border-amber-500/20">
                        Top Leaders 🏆
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white group-hover:text-amber-400 transition-colors">
                        Player Rankings
                      </h3>
                      <p className="text-xs text-slate-400">
                        Global and national player standings across Bullet, Blitz & Rapid.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Standing & Career Snapshot Bar */}
              <div className="luxury-card p-4 md:p-5 rounded-2xl border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={currentAvatar}
                    alt={currentUsername}
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow-md bg-slate-950 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-white">
                        {currentUsername}
                      </span>
                      <span className="px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                        {currentTier}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 font-mono pt-0.5 flex-wrap">
                      <span>Rapid Elo: <strong className="text-amber-400">{userElo}</strong></span>
                      <span>•</span>
                      <span>World: <strong className="text-slate-200">#{userRank.toLocaleString()}</strong></span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">Top {((100 - parseFloat(percentile))).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowStreakModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold flex items-center gap-1.5 hover:bg-orange-500/25 transition-colors"
                  >
                    <Flame className="w-4 h-4 fill-orange-400" />
                    <span>7 Day Streak</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('leaderboard')}
                    className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md flex items-center gap-1 transition-all active:scale-95"
                  >
                    <span>Leaderboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Grandmaster Wisdom */}
              <div className="text-center py-2 text-xs text-slate-500 italic">
                "When you see a good move, look for a better one." — Emanuel Lasker (World Chess Champion)
              </div>
            </div>
          );
        })()}

        {/* Real-Time Chess Game Screen */}
        {activeTab === 'game' && gameSession && (
          <div className="max-w-6xl w-full mx-auto p-2 md:p-6 flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
              {/* Left Column: Opponent Card + Opening Banner + Chessboard + Player Card */}
              <div className="lg:col-span-7 flex flex-col items-center gap-2 md:gap-3 w-full">
                {/* Opponent Card */}
                <div className="w-full max-w-[520px]">
                  <PlayerCard
                    player={opponent}
                    color={isWhite ? 'b' : 'w'}
                    isTurn={currentTurn === (isWhite ? 'b' : 'w')}
                    timeMs={isWhite ? gameSession.blackTime : gameSession.whiteTime}
                    isActive={!gameSession.isGameOver}
                    capturedPieces={isWhite ? gameSession.capturedPieces?.black : gameSession.capturedPieces?.white}
                    opponentCaptured={isWhite ? gameSession.capturedPieces?.white : gameSession.capturedPieces?.black}
                  />
                </div>

                {/* Opening Name Banner (Screenshot 6: Show Opening Names) */}
                {settings.showOpenings && getOpeningName(gameSession.moveHistory) && (
                  <div className="w-full max-w-[520px] px-3.5 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-amber-300 shadow-sm animate-fade-in">
                    <div className="flex items-center gap-2 truncate">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-bold truncate">{getOpeningName(gameSession.moveHistory).name}</span>
                    </div>
                    <span className="font-mono text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-bold shrink-0">
                      {getOpeningName(gameSession.moveHistory).eco}
                    </span>
                  </div>
                )}

                {/* Interactive Chessboard */}
                <div className="w-full max-w-[520px]">
                  <Chessboard
                    fen={gameSession.fen}
                    onMove={handleMove}
                    playerColor={playerColor}
                    flipped={boardFlipped}
                    boardTheme={settings.boardTheme}
                    pieceTheme={settings.pieceTheme}
                    colorPalette={settings.pieceColorPalette || 'classic'}
                    inCheck={gameSession.inCheck}
                    lastMove={gameSession.moveHistory?.[gameSession.moveHistory.length - 1]}
                    disabled={gameSession.isGameOver || (isAIGame && aiThinking)}
                    showLegalMoves={settings.showLegalMoves}
                    highlightLastMove={settings.highlightLastMove}
                    showCoordinates={settings.showCoordinates}
                    kingInCheckIndicator={settings.kingInCheckIndicator}
                    alwaysPromoteToQueen={settings.alwaysPromoteToQueen}
                    enablePremoves={settings.enablePremoves}
                  />
                </div>

                {/* User Card */}
                <div className="w-full max-w-[520px]">
                  <PlayerCard
                    player={me}
                    color={isWhite ? 'w' : 'b'}
                    isTurn={currentTurn === (isWhite ? 'w' : 'b')}
                    timeMs={isWhite ? gameSession.whiteTime : gameSession.blackTime}
                    isActive={!gameSession.isGameOver}
                    capturedPieces={isWhite ? gameSession.capturedPieces?.white : gameSession.capturedPieces?.black}
                    opponentCaptured={isWhite ? gameSession.capturedPieces?.black : gameSession.capturedPieces?.white}
                  />
                </div>
              </div>

              {/* Right Column: Mini Music Player, Game Controls, Move History, Voice Bar, Live Chat */}
              <div className="lg:col-span-5 space-y-3 w-full max-w-md mx-auto lg:max-w-none">
                {/* In-Game Mini Ambient Music Player & Settings Bar */}
                <MiniMusicPlayer
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onOpenSettings={() => setShowSettingsModal(true)}
                />

                {/* Voice Chat Component */}
                {!isAIGame && (
                  <VoiceControls
                    socket={socketRef.current}
                    gameId={gameSession.id}
                    currentUser={currentUser}
                    opponentUser={opponent}
                    isPlayer={playerColor === 'w' || playerColor === 'b'}
                    triggerVoiceCall={voiceCallTrigger}
                  />
                )}

                {/* Move History */}
                <MoveHistory
                  moves={gameSession.moveHistory || []}
                />

                {/* Game Controls */}
                <GameControls
                  isGameOver={gameSession.isGameOver}
                  isPlayer={playerColor === 'w' || playerColor === 'b'}
                  drawOfferedBy={gameSession.drawOfferedBy}
                  rematchRequestedBy={gameSession.rematchRequestedBy}
                  currentUserColor={playerColor}
                  onResign={handleResign}
                  onOfferDraw={handleOfferDraw}
                  onRespondDraw={handleRespondDraw}
                  onRequestRematch={handleRequestRematch}
                  onFlipBoard={() => setBoardFlipped(!boardFlipped)}
                  onAnalyze={() => setAnalysisGame(gameSession)}
                  onShareRoom={() => {
                    const url = `${window.location.origin}/?room=${gameSession.id}`;
                    navigator.clipboard.writeText(url);
                  }}
                  onViewResult={() => setShowGameOverModal(true)}
                  isFriendRoom={!isAIGame && !gameSession.isMatchmaking}
                  onVoiceCall={() => setVoiceCallTrigger(c => c + 1)}
                />

                {/* Live Chat (Toggleable in Settings) */}
                {settings.allowChat ? (
                  <GameChat
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                    currentUser={currentUser}
                  />
                ) : (
                  <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-center text-xs text-slate-500 italic">
                    In-game text chat is disabled in Settings.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Play Online Tab */}
        {activeTab === 'play' && (
          <PlayView
            currentUser={currentUser}
            onStartMatchmaking={handleStartMatchmaking}
            isSearchingMatch={isSearchingMatch}
            onCancelMatchmaking={handleCancelMatchmaking}
            onOpenFriendRoom={() => setShowFriendRoomModal(true)}
            onStartAIGame={handleStartAIGame}
            activeGameSession={gameSession}
            onReturnToGame={() => setActiveTab('game')}
          />
        )}

        {/* Puzzles Tab */}
        {activeTab === 'puzzles' && (
          <PuzzleView
            currentUser={currentUser}
            onUpdateRating={(newRating) => {
              if (currentUser) {
                setCurrentUser({
                  ...currentUser,
                  ratings: { ...currentUser.ratings, puzzle: newRating }
                });
              }
            }}
          />
        )}

        {/* Lessons Tab */}
        {(activeTab === 'lessons' || activeTab === 'learn') && (
          <LessonView onBack={() => setActiveTab('home')} />
        )}

        {/* Profile Tab (Full-Page View: Overview, Rankings & Settings) */}
        {activeTab === 'profile' && (
          <ProfileView
            user={currentUser}
            onUpdateUser={user => setCurrentUser(user)}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            initialSubTab={profileSubTab}
            onOpenStreak={() => setShowStreakModal(true)}
            onOpenAdmin={() => setActiveTab('admin')}
            onSignOut={() => {
              safeStorage.removeItem('token');
              setCurrentUser(null);
              setActiveTab('home');
            }}
            onSignIn={() => setShowAuthModal(true)}
          />
        )}

        {/* Leaderboard Tab (Compatibility fallback) */}
        {activeTab === 'leaderboard' && (
          <LeaderboardView currentUser={currentUser} />
        )}

        {/* Admin Dashboard Tab */}
        {activeTab === 'admin' && <AdminView />}
      </main>

      {/* Floating Bottom Navigation for Mobile (5 Primary Tabs: Home, Play, Puzzles, Learn, Rankings) */}
      <footer className={`md:hidden sticky bottom-0 z-40 backdrop-blur-md border-t px-2 py-2 flex items-center justify-around transition-colors ${
        isLight ? 'bg-white/95 border-slate-200' : 'bg-slate-950/90 border-slate-800'
      }`}>
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'play', label: 'Play', icon: Swords },
          { id: 'puzzles', label: 'Puzzles', icon: Flame },
          { id: 'lessons', label: 'Learn', icon: BookOpen },
          { id: 'leaderboard', label: 'Rankings', icon: Shield }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold ${
                activeTab === tab.id
                  ? 'text-amber-500'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </footer>

      {/* Global Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={user => {
          if (user && (user.email?.toLowerCase() === 'op21plus@gmail.com' || user.username?.toLowerCase() === 'op21plus')) {
            user.role = 'admin';
          }
          setCurrentUser(user);
        }}
      />

      <ProfileModal
        isOpen={showProfileModal}
        user={currentUser}
        onClose={() => setShowProfileModal(false)}
        onUpdateUser={user => {
          if (user && (user.email?.toLowerCase() === 'op21plus@gmail.com' || user.username?.toLowerCase() === 'op21plus')) {
            user.role = 'admin';
          }
          setCurrentUser(user);
        }}
        onOpenAdmin={() => setActiveTab('admin')}
        onNavigateToRankings={() => {
          setShowProfileModal(false);
          setProfileSubTab('rankings');
          setActiveTab('profile');
        }}
        onOpenStreak={() => {
          setShowProfileModal(false);
          setShowStreakModal(true);
        }}
      />

      <DailyStreakModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
      />

      <FriendsDrawer
        isOpen={showFriendsDrawer}
        currentUser={currentUser}
        onClose={() => setShowFriendsDrawer(false)}
        onChallengeFriend={friend => {
          setShowFriendsDrawer(false);
          setShowMatchmakingModal(false);
          handleCreateFriendRoom({
            timeControl: { baseMinutes: 5, incrementSeconds: 0 },
            colorPreference: 'random'
          });
        }}
      />

      <MatchmakingModal
        isOpen={showMatchmakingModal}
        onClose={() => setShowMatchmakingModal(false)}
        onStartMatchmaking={handleStartMatchmaking}
        isSearching={isSearchingMatch}
        onCancelMatchmaking={handleCancelMatchmaking}
      />

      <FriendRoomModal
        isOpen={showFriendRoomModal}
        onClose={() => {
          setShowFriendRoomModal(false);
          setCreatedRoomInfo(null);
        }}
        onCreateRoom={handleCreateFriendRoom}
        onJoinRoom={handleJoinFriendRoom}
        createdRoom={createdRoomInfo}
        onEnterRoom={() => {
          setActiveTab('game');
          setShowFriendRoomModal(false);
        }}
      />

      <PlayAIModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onStartAIGame={handleStartAIGame}
      />

      {analysisGame && (
        <AnalysisView
          game={analysisGame}
          onClose={() => setAnalysisGame(null)}
        />
      )}

      {/* End of Game Celebration & Result Modal */}
      <GameOverModal
        isOpen={showGameOverModal}
        status={gameSession?.status}
        winner={gameSession?.winner}
        winReason={gameSession?.winReason}
        playerColor={playerColor}
        whitePlayer={gameSession?.whitePlayer}
        blackPlayer={gameSession?.blackPlayer}
        whiteEloChange={gameSession?.whiteEloChange || (isAIGame ? (gameSession?.winner === 'white' ? 16 : -16) : 0)}
        blackEloChange={gameSession?.blackEloChange || (isAIGame ? (gameSession?.winner === 'black' ? 16 : -16) : 0)}
        onRematch={handleRequestRematch}
        onAnalyze={() => {
          setShowGameOverModal(false);
          setAnalysisGame(gameSession);
        }}
        onNewGame={() => {
          setShowGameOverModal(false);
          if (isAIGame) {
            setShowAIModal(true);
          } else {
            setShowMatchmakingModal(true);
          }
        }}
        onClose={() => setShowGameOverModal(false)}
      />

      {/* Full Feature Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
}
