import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Chess } from 'chess.js';
import {
  Home, Trophy, Swords, Users, BookOpen, Bot, Shield, Volume2, VolumeX,
  Palette, User, LogOut, Bell, Flame, Sparkles, ChevronRight, Settings, Music, Zap, ArrowRight,
  LogIn, X
} from 'lucide-react';

import { Chessboard } from './components/Chessboard.jsx';
import { PlayerCard } from './components/PlayerCard.jsx';
import { GameControls } from './components/GameControls.jsx';
import { GameChat } from './components/GameChat.jsx';
import { MatchmakingModal, FriendRoomModal, PlayAIModal } from './components/PlayModals.jsx';
import { AuthModal } from './components/AuthModal.jsx';
import { ProfileModal } from './components/ProfileModal.jsx';
import { ProfileView } from './components/ProfileView.jsx';
import { PlayView } from './components/PlayView.jsx';
import { OfflineBoardView } from './components/OfflineBoardView.jsx';
import { PuzzleView } from './components/PuzzleView.jsx';
import { LessonView } from './components/LessonView.jsx';
import { LeaderboardView } from './components/LeaderboardView.jsx';
import { AnalysisView } from './components/AnalysisView.jsx';
import { AdminView } from './components/AdminView.jsx';
import { GameOverModal } from './components/GameOverModal.jsx';
import { SettingsModal } from './components/SettingsModal.jsx';
import { DailyStreakModal } from './components/DailyStreakModal.jsx';
import { MiniMusicPlayer } from './components/MiniMusicPlayer.jsx';
import { ChessLogo } from './components/ChessLogo.jsx';
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

export const HOME_TIME_CONTROLS = [
  { id: '1m', label: '1 min', type: 'Bullet', icon: '⚡', format: 'bullet', baseMinutes: 1, incrementSeconds: 0 },
  { id: '3m', label: '3 min', type: 'Blitz', icon: '🔥', format: 'blitz', baseMinutes: 3, incrementSeconds: 0, popular: true },
  { id: '5m', label: '5 min', type: 'Blitz', icon: '⏱️', format: 'blitz', baseMinutes: 5, incrementSeconds: 0 },
  { id: '10m', label: '10 min', type: 'Rapid', icon: '🎯', format: 'rapid', baseMinutes: 10, incrementSeconds: 0 },
  { id: '15m', label: '15 min', type: 'Rapid', icon: '⌛', format: 'rapid', baseMinutes: 15, incrementSeconds: 0 },
  { id: '30m', label: '30 min', type: 'Classical', icon: '🏛️', format: 'classical', baseMinutes: 30, incrementSeconds: 0 }
];

export default function App() {
  // Navigation & View State (5 Primary: Home, Play Online, Puzzles, Learn, Profile)
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'play' | 'game' | 'puzzles' | 'lessons' | 'profile' | 'admin'
  const [profileSubTab, setProfileSubTab] = useState('overview'); // 'overview' | 'rankings' | 'settings'
  const [selectedHomeTime, setSelectedHomeTime] = useState(HOME_TIME_CONTROLS[1]); // Default 3 min Blitz
  const [incomingChallenge, setIncomingChallenge] = useState(null);
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
      activeTab === 'offline' ||
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

  // Cancel any lingering speech synthesis whenever navigating between tabs
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  }, [activeTab]);

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

    // Friend Challenge Socket Events
    socket.on('incoming_challenge', (data) => {
      setIncomingChallenge(data);
      sound.playCheck();
      triggerHaptic('capture');
    });

    socket.on('challenge_accepted', () => {
      setShowFriendRoomModal(false);
      setIncomingChallenge(null);
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
    setShowMatchmakingModal(true);
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
      {/* Top Navbar (Hidden in full-screen offline pass & play mode) */}
      {activeTab !== 'offline' && (
        <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 py-2.5 transition-colors ${
          isLight ? 'bg-white/95 border-slate-200 text-slate-900 shadow-sm' : 'bg-slate-950/80 border-slate-800 text-white'
        }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Top-Left Premium Brand Logo: CHESS */}
          <div
            onClick={() => setActiveTab('home')}
            className="cursor-pointer group flex items-center"
            title="CHESS - Home"
          >
            <ChessLogo size="md" isLight={isLight} showSubtitle={true} />
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
              { id: 'profile', label: 'Profile', icon: User },
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

            {/* Sign In / Sign Out Header Control (replaces Streak as requested) */}
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
                  title="View Profile"
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer ${
                    isLight
                      ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10'
                  }`}
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
                title="Sign In with Google / Gmail"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>
      )}

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

                <div className="max-w-3xl mx-auto space-y-6 text-center relative z-10">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Arena Season 2026 • Official FIDE Rules</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
                    Master the <span className="gold-gradient-text">Board</span>.
                  </h1>

                  <p className="text-sm md:text-base text-slate-300 font-medium max-w-xl mx-auto">
                    Real-time rated matchmaking, grandmaster AI bots, private voice rooms, and full-screen offline pass & play.
                  </p>

                  {/* Quick-Play Time Controls (Fully Selectable Grid) */}
                  <div className="space-y-2.5 pt-1 max-w-2xl mx-auto">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Select Time Control
                      </span>
                      <span className="text-xs text-amber-400 font-mono font-bold flex items-center gap-1.5">
                        <span className="text-slate-400 text-[11px] font-normal">Active:</span>
                        <span className="text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <span>{selectedHomeTime.icon}</span>
                          <span>{selectedHomeTime.label}</span>
                          <span>•</span>
                          <span>{selectedHomeTime.type}</span>
                        </span>
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {HOME_TIME_CONTROLS.map((item) => {
                        const isSelected = selectedHomeTime.id === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              if (isSelected) {
                                handleStartMatchmaking(item);
                              } else {
                                setSelectedHomeTime(item);
                                sound.playMove();
                                triggerHaptic('move');
                              }
                            }}
                            className={`p-2 sm:p-2.5 rounded-2xl border text-center transition-all group relative overflow-hidden active:scale-95 cursor-pointer ${
                              isSelected
                                ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black border-amber-300 ring-2 ring-amber-400/80 shadow-lg shadow-amber-500/30 scale-102'
                                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                            }`}
                            title={isSelected ? 'Double-click to start matchmaking' : `Select ${item.label} ${item.type}`}
                          >
                            {item.popular && !isSelected && (
                              <span className="absolute top-1 right-1 px-1 py-0.2 rounded bg-amber-500 text-slate-950 font-black text-[8px] uppercase">
                                Hot
                              </span>
                            )}
                            {isSelected && (
                              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-slate-950 text-amber-400 font-black text-[9px] flex items-center justify-center">
                                ✓
                              </span>
                            )}
                            <div className={`text-xs sm:text-sm font-black transition-colors ${
                              isSelected ? 'text-slate-950 font-black' : 'text-white group-hover:text-amber-400'
                            }`}>
                              {item.icon} {item.label}
                            </div>
                            <div className={`text-[9px] sm:text-[10px] font-semibold ${
                              isSelected ? 'text-slate-900 font-bold' : 'text-slate-400'
                            }`}>
                              {item.type}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Primary & Secondary Action CTAs */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3 max-w-2xl mx-auto">
                    <button
                      onClick={() => {
                        handleStartMatchmaking(selectedHomeTime);
                      }}
                      className="w-full sm:flex-1 flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                    >
                      <Swords className="w-5 h-5 fill-slate-950" />
                      <span>Play Online ({selectedHomeTime.label} {selectedHomeTime.type})</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('offline')}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 py-4 px-5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border-2 border-amber-500/50 text-amber-300 hover:text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                      title="Two Players Pass & Play Face-to-Face on 1 Device"
                    >
                      <Users className="w-4 h-4 text-amber-400" />
                      <span>Pass & Play (Offline 👥)</span>
                    </button>

                    <button
                      onClick={() => setShowFriendRoomModal(true)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 py-4 px-5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border-2 border-emerald-500/50 text-emerald-300 hover:text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span>Friends (Voice 🎙️)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Competitive Game Modes Grid (Ultra-Premium Redesign) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <span>Competitive Game Modes</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Choose your arena and play under official tournament rules.</p>
                  </div>
                  <span className="text-xs text-amber-400 font-bold hidden sm:inline">Official FIDE Rules</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {/* 1. Play Online */}
                  <div
                    onClick={() => setActiveTab('play')}
                    className="relative group p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/95 border border-amber-500/30 hover:border-amber-400 shadow-xl hover:shadow-amber-500/15 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden backdrop-blur-md"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
                    <div className="flex items-start justify-between relative z-10 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                        <Swords className="w-6 h-6 fill-slate-950" />
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-black text-[10px] tracking-wide uppercase">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        10k+ Live
                      </span>
                    </div>
                    <div className="relative z-10 space-y-1">
                      <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors flex items-center justify-between">
                        <span>Play Online</span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Instant ELO matchmaking with grandmasters and clubs worldwide.
                      </p>
                    </div>
                  </div>

                  {/* 2. Play Friends with Voice */}
                  <div
                    onClick={() => setShowFriendRoomModal(true)}
                    className="relative group p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/95 border border-emerald-500/30 hover:border-emerald-400 shadow-xl hover:shadow-emerald-500/15 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden backdrop-blur-md"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
                    <div className="flex items-start justify-between relative z-10 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6" />
                      </div>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-black text-[10px] tracking-wide uppercase">
                        🎙️ HD Voice Call
                      </span>
                    </div>
                    <div className="relative z-10 space-y-1">
                      <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                        <span>Play with Friends</span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Create private room links, customize time rules, and talk live in-game.
                      </p>
                    </div>
                  </div>

                  {/* 3. Play Stockfish AI */}
                  <div
                    onClick={() => setShowAIModal(true)}
                    className="relative group p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/95 border border-indigo-500/30 hover:border-indigo-400 shadow-xl hover:shadow-indigo-500/15 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden backdrop-blur-md"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />
                    <div className="flex items-start justify-between relative z-10 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                        <Bot className="w-6 h-6" />
                      </div>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-black text-[10px] tracking-wide uppercase">
                        Bots (800 - 2800)
                      </span>
                    </div>
                    <div className="relative z-10 space-y-1">
                      <h3 className="text-base font-black text-white group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                        <span>Play Stockfish AI</span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        8 progressive difficulty tiers from Novice to Grandmaster engine.
                      </p>
                    </div>
                  </div>

                  {/* 4. Pass & Play Offline Board (Fullscreen Vertical Android) */}
                  <div
                    onClick={() => setActiveTab('offline')}
                    className="relative group p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/95 border border-amber-600/40 hover:border-amber-400 shadow-xl hover:shadow-amber-500/15 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden backdrop-blur-md"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-600/20 transition-all" />
                    <div className="flex items-start justify-between relative z-10 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-600/30 group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6" />
                      </div>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-black text-[10px] tracking-wide uppercase">
                        👥 Fullscreen 2-Player
                      </span>
                    </div>
                    <div className="relative z-10 space-y-1">
                      <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors flex items-center justify-between">
                        <span>Offline Chess Board</span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Vertical full-screen Android board with face-to-face piece rotation & wood themes.
                      </p>
                    </div>
                  </div>

                  {/* 5. Tactics & Puzzles */}
                  <div
                    onClick={() => setActiveTab('puzzles')}
                    className="relative group p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/95 border border-orange-500/30 hover:border-orange-400 shadow-xl hover:shadow-orange-500/15 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden backdrop-blur-md"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-orange-500/20 transition-all" />
                    <div className="flex items-start justify-between relative z-10 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                        <Flame className="w-6 h-6 fill-white" />
                      </div>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 font-black text-[10px] tracking-wide uppercase">
                        🔥 Streak & Storm
                      </span>
                    </div>
                    <div className="relative z-10 space-y-1">
                      <h3 className="text-base font-black text-white group-hover:text-orange-400 transition-colors flex items-center justify-between">
                        <span>Tactics & Puzzles</span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Solve tactical themes, progressive Puzzle Streak & 3-minute blitz rush.
                      </p>
                    </div>
                  </div>

                  {/* 6. Chess Lessons & Academy */}
                  <div
                    onClick={() => setActiveTab('lessons')}
                    className="relative group p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/95 border border-sky-500/30 hover:border-sky-400 shadow-xl hover:shadow-sky-500/15 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden backdrop-blur-md"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-sky-500/20 transition-all" />
                    <div className="flex items-start justify-between relative z-10 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 font-black text-[10px] tracking-wide uppercase">
                        🎓 64 Master Lessons
                      </span>
                    </div>
                    <div className="relative z-10 space-y-1">
                      <h3 className="text-base font-black text-white group-hover:text-sky-400 transition-colors flex items-center justify-between">
                        <span>Chess Academy</span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Step-by-step master lessons with consent preview and interactive drills.
                      </p>
                    </div>
                  </div>

                  {/* 7. Player Rankings & Global Leaders */}
                  <div
                    onClick={() => {
                      setProfileSubTab('rankings');
                      setActiveTab('profile');
                    }}
                    className="relative group p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/95 border border-yellow-500/30 hover:border-yellow-400 shadow-xl hover:shadow-yellow-500/15 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden backdrop-blur-md"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-yellow-500/20 transition-all" />
                    <div className="flex items-start justify-between relative z-10 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-lg shadow-yellow-500/30 group-hover:scale-110 transition-transform">
                        <Trophy className="w-6 h-6 fill-slate-950" />
                      </div>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 font-black text-[10px] tracking-wide uppercase">
                        🏆 Global Leaders
                      </span>
                    </div>
                    <div className="relative z-10 space-y-1">
                      <h3 className="text-base font-black text-white group-hover:text-yellow-400 transition-colors flex items-center justify-between">
                        <span>Player Rankings</span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all" />
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        FIDE-rated international standings across Bullet, Blitz and Rapid.
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

              {/* Right Column: Mini Music Player, Game Controls, Live Chat with Embedded Voice Call */}
              <div className="lg:col-span-5 space-y-3 w-full max-w-md mx-auto lg:max-w-none">
                {/* In-Game Mini Ambient Music Player & Settings Bar */}
                <MiniMusicPlayer
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onOpenSettings={() => setShowSettingsModal(true)}
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

                {/* Live Chat with Unified Voice Call */}
                {settings.allowChat ? (
                  <GameChat
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                    currentUser={currentUser}
                    opponentUser={opponent}
                    socket={socketRef.current}
                    gameId={gameSession.id}
                    isPlayer={!isAIGame && (playerColor === 'w' || playerColor === 'b')}
                    triggerVoiceCall={voiceCallTrigger}
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
            onOpenOfflineBoard={() => setActiveTab('offline')}
            activeGameSession={gameSession}
            onReturnToGame={() => setActiveTab('game')}
          />
        )}

        {/* Play Offline Board Tab (Pass & Play Two Players Local) */}
        {activeTab === 'offline' && (
          <OfflineBoardView onBack={() => setActiveTab('home')} />
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

      {/* Floating Bottom Navigation for Mobile (5 Primary Tabs: Home, Play, Puzzles, Learn, Profile) */}
      {activeTab !== 'offline' && (
        <footer className={`md:hidden sticky bottom-0 z-40 backdrop-blur-md border-t px-2 py-2 flex items-center justify-around transition-colors ${
          isLight ? 'bg-white/95 border-slate-200' : 'bg-slate-950/90 border-slate-800'
        }`}>
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'play', label: 'Play', icon: Swords },
            { id: 'puzzles', label: 'Puzzles', icon: Flame },
            { id: 'lessons', label: 'Learn', icon: BookOpen },
            { id: 'profile', label: 'Profile', icon: User }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'profile') {
                    setProfileSubTab('overview');
                  }
                  setActiveTab(tab.id);
                }}
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
      )}

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

      <MatchmakingModal
        isOpen={showMatchmakingModal}
        onClose={() => setShowMatchmakingModal(false)}
        onStartMatchmaking={handleStartMatchmaking}
        isSearching={isSearchingMatch}
        onCancelMatchmaking={handleCancelMatchmaking}
        initialPreset={selectedHomeTime}
      />

      <FriendRoomModal
        isOpen={showFriendRoomModal}
        onClose={() => {
          setShowFriendRoomModal(false);
          setCreatedRoomInfo(null);
        }}
        currentUser={currentUser}
        onCreateRoom={handleCreateFriendRoom}
        onJoinRoom={handleJoinFriendRoom}
        createdRoom={createdRoomInfo}
        onEnterRoom={() => {
          setActiveTab('game');
          setShowFriendRoomModal(false);
        }}
        onChallengeFriend={(friend) => {
          handleCreateFriendRoom({
            timeControl: { baseMinutes: 5, incrementSeconds: 0 },
            colorPreference: 'random'
          });
          socketRef.current?.emit('challenge_friend', {
            friendId: friend.id,
            config: { timeControl: { baseMinutes: 5, incrementSeconds: 0 }, format: 'blitz' }
          });
        }}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* Incoming Challenge Toast */}
      {incomingChallenge && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border-2 border-amber-500 rounded-3xl p-4 shadow-2xl flex items-center gap-4 animate-bounce-in max-w-sm w-full mx-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 text-xl shrink-0">
            ⚔️
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-black text-white block truncate">
              {incomingChallenge.from?.username}
            </span>
            <span className="text-[11px] text-amber-300">
              Challenged you to a {incomingChallenge.config?.timeControl?.baseMinutes || 5}m match!
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                socketRef.current?.emit('accept_challenge', {
                  challengeId: incomingChallenge.challengeId,
                  fromUserId: incomingChallenge.from?.id,
                  config: incomingChallenge.config
                });
                setIncomingChallenge(null);
              }}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md"
            >
              Accept
            </button>
            <button
              onClick={() => setIncomingChallenge(null)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
