import React, { useState, useEffect, useRef, useMemo } from 'react';
import { io } from 'socket.io-client';
import { Chess } from 'chess.js';
import {
  Home, Trophy, Swords, Users, BookOpen, Bot, Shield, Volume2, VolumeX,
  Palette, User, LogOut, Bell, Flame, Sparkles, ChevronRight, Settings, Music, Zap, ArrowRight,
  LogIn, X, Clock, Mic, Smartphone, GraduationCap, Puzzle, CircleUserRound, Sun, Moon
} from 'lucide-react';

import { Chessboard } from './components/Chessboard.jsx';
import { PlayerCard } from './components/PlayerCard.jsx';
import { GameControls } from './components/GameControls.jsx';
import { GameChat } from './components/GameChat.jsx';
import { MatchmakingModal, FriendRoomModal, PlayAIModal } from './components/PlayModals.jsx';
import { AuthModal } from './components/AuthModal.jsx';
import { ProfileModal } from './components/ProfileModal.jsx';
import { ProfileView } from './components/ProfileView.jsx';
import { OfflineBoardView } from './components/OfflineBoardView.jsx';
import { PuzzleView } from './components/PuzzleView.jsx';
import { LessonView } from './components/LessonView.jsx';
import { TournamentView } from './components/TournamentView.jsx';
import { LeaderboardView } from './components/LeaderboardView.jsx';
import { AnalysisView } from './components/AnalysisView.jsx';
import { AdminView } from './components/AdminView.jsx';
import { GameOverModal } from './components/GameOverModal.jsx';
import { SettingsModal } from './components/SettingsModal.jsx';
import { DailyStreakModal } from './components/DailyStreakModal.jsx';
import { MiniMusicPlayer } from './components/MiniMusicPlayer.jsx';
import { InGameDesignModal } from './components/InGameDesignModal.jsx';
import { AIBattleCard } from './components/AIBattleCard.jsx';
import { ChessLogo } from './components/ChessLogo.jsx';
import { BOARD_THEMES } from './components/PieceIcons.jsx';
import { getRandomAnimeOpponent, ANIME_AI_ROSTER } from './data/animeOpponents.js';
import { sound } from './utils/audio.js';
import { musicEngine } from './utils/music.js';
import { triggerHaptic, speakMove } from './utils/device.js';
import { getOpeningName } from './utils/openings.js';
import { safeStorage } from './utils/storage.js';
import { getLocalAIMove, getAIMoveAsync, getCapturedPieces } from './utils/aiEngine.js';
import { calculateUserRanking } from './data/leaderboardData.js';

const DEFAULT_SETTINGS = {
  appTheme: 'system', // Defaults dynamically to device / phone system mode
  soundEnabled: true,
  soundOnlyPieceMove: false,
  musicEnabled: true, // Signature sound identity enabled by default
  musicDuringGame: true,
  musicDuringPuzzles: true,
  musicDuringLessons: true,
  musicVolume: 0.30,
  musicTrackIndex: 0, // Signature Dynamic Soundscape
  vibrations: true,
  voiceCommentary: false,
  voiceCommentaryOnlyOpponent: true,
  boardTheme: 'amoled',
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

function KnightNavIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      viewBox="0 0 45 45"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" />
      <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0-.95 1.23-1.5 1.5-1 0-2.06 1.15-2.5-.5-.45-1.69 1-3.69 2.5-4.5 2-1 3.5-3.5 3.5-6.5 0-2.8 1.5-5.5 3.5-7 2.5-2 5.5-2 7.5-1.5z" />
      <circle cx="15.5" cy="19.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

const PRIMARY_NAV_TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'puzzles', label: 'Puzzles', icon: Puzzle },
  { id: 'lessons', label: 'Learn', icon: GraduationCap },
  { id: 'profile', label: 'Profile', icon: CircleUserRound }
];

export default function App() {
  // Navigation & View State (4 Primary: Home, Puzzles, Learn, Profile)
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'game' | 'puzzles' | 'lessons' | 'profile' | 'admin'
  const [selectedHomeTime, setSelectedHomeTime] = useState(HOME_TIME_CONTROLS[1]); // Default 3 min Blitz
  const [incomingChallenge, setIncomingChallenge] = useState(null);
  const [globalConfig, setGlobalConfig] = useState(null);
  const [settings, setSettings] = useState(() => {
    try {
      const saved = safeStorage.getItem('chess_arena_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure default theme adapts to phone system mode by default & default board is amoled
        const amoledMigrated = safeStorage.getItem('chess_arena_amoled_board_default_v1');
        if (!amoledMigrated) {
          safeStorage.setItem('chess_arena_amoled_board_default_v1', 'true');
          parsed.boardTheme = 'amoled';
        }
        const themeMigrated = safeStorage.getItem('chess_arena_system_theme_default_v1');
        if (!themeMigrated) {
          safeStorage.setItem('chess_arena_system_theme_default_v1', 'true');
          parsed.appTheme = 'system';
        }
        // 10 new tracks & signature identity initialization: ensure 1st track is default
        const signatureMigrated = safeStorage.getItem('chess_arena_signature_sound_v3');
        if (!signatureMigrated) {
          safeStorage.setItem('chess_arena_signature_sound_v3', 'true');
          parsed.musicEnabled = true;
          parsed.musicTrackIndex = 0; // 1st track by default
          parsed.musicVolume = parsed.musicVolume || 0.30;
          safeStorage.setItem('chess_arena_settings', JSON.stringify({ ...DEFAULT_SETTINGS, ...parsed, musicEnabled: true, musicTrackIndex: 0 }));
          return { ...DEFAULT_SETTINGS, ...parsed, musicEnabled: true, musicTrackIndex: 0 };
        }
        return { ...DEFAULT_SETTINGS, ...parsed };
      } else {
        safeStorage.setItem('chess_arena_signature_sound_v2', 'true');
        safeStorage.setItem('chess_arena_system_theme_default_v1', 'true');
      }
    } catch (e) {}
    return { ...DEFAULT_SETTINGS, appTheme: 'system', musicEnabled: true };
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

  const isTabActive = (tabId) => {
    if (tabId === 'home') {
      return activeTab === 'home' || activeTab === 'play' || activeTab === 'game' || activeTab === 'tournaments';
    }
    if (tabId === 'lessons') {
      return activeTab === 'lessons' || activeTab === 'learn';
    }
    if (tabId === 'puzzles') {
      return activeTab === 'puzzles' || activeTab === 'puzzle';
    }
    if (tabId === 'profile') {
      return activeTab === 'profile';
    }
    return activeTab === tabId;
  };

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
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=Guest_${guestNum}&radius=50`
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
  const [currentAIOpponent, setCurrentAIOpponent] = useState(null);
  const [inGameNotice, setInGameNotice] = useState(null);
  const [showInGameDesignModal, setShowInGameDesignModal] = useState(false);
  const [voiceCallTrigger, setVoiceCallTrigger] = useState(0);

  // Socket reference
  const socketRef = useRef(null);

  // Initialize Audio & Music Settings
  useEffect(() => {
    sound.enabled = settings.soundEnabled;
    musicEngine.setVolume(settings.musicVolume);
    if (settings.musicTrackIndex !== undefined) {
      musicEngine.currentTrackIndex = settings.musicTrackIndex;
    }
  }, [settings.soundEnabled, settings.musicVolume, settings.musicTrackIndex]);

  // Auto-unlock Web Audio on user's first touch/click (handling browser autoplay policies)
  useEffect(() => {
    const unlockSignatureAudio = () => {
      musicEngine.initCtx();
      sound.initContext();
      if (settings.musicEnabled && !musicEngine.isPlaying) {
        musicEngine.start();
      }
      window.removeEventListener('click', unlockSignatureAudio);
      window.removeEventListener('touchstart', unlockSignatureAudio);
      window.removeEventListener('pointerdown', unlockSignatureAudio);
      window.removeEventListener('keydown', unlockSignatureAudio);
    };

    window.addEventListener('click', unlockSignatureAudio, { once: true, passive: true });
    window.addEventListener('touchstart', unlockSignatureAudio, { once: true, passive: true });
    window.addEventListener('pointerdown', unlockSignatureAudio, { once: true, passive: true });
    window.addEventListener('keydown', unlockSignatureAudio, { once: true, passive: true });

    // In environments that permit immediate autoplay (such as Android WebView), start right away
    if (settings.musicEnabled && !musicEngine.isPlaying) {
      musicEngine.start();
    }

    return () => {
      window.removeEventListener('click', unlockSignatureAudio);
      window.removeEventListener('touchstart', unlockSignatureAudio);
      window.removeEventListener('pointerdown', unlockSignatureAudio);
      window.removeEventListener('keydown', unlockSignatureAudio);
    };
  }, [settings.musicEnabled]);

  // Signature Sound Atmosphere Lifecycle (Soft Piano in Lobby/Menu vs Intense Tactical Tension in Matches)
  useEffect(() => {
    if (!settings.musicEnabled) {
      musicEngine.stop();
      return;
    }

    const isMatchActive = activeTab === 'game' || activeTab === 'offline' || Boolean(gameSession && !gameSession.isGameOver);
    musicEngine.setMode(isMatchActive ? 'match' : 'menu');

    const shouldPlay =
      (activeTab === 'game' && settings.musicDuringGame) ||
      (activeTab === 'puzzles' && settings.musicDuringPuzzles) ||
      ((activeTab === 'lessons' || activeTab === 'learn') && settings.musicDuringLessons) ||
      activeTab === 'home' ||
      activeTab === 'offline' ||
      activeTab === 'profile';

    if (shouldPlay) {
      musicEngine.start();
    } else {
      musicEngine.stop();
    }
  }, [
    activeTab,
    gameSession?.isGameOver,
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
    // 0. Fetch global server configuration & defaults
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data?.config) {
          setGlobalConfig(data.config);
          // If user hasn't explicitly set preferences, seed with global admin defaults
          const saved = safeStorage.getItem('chess_arena_settings');
          if (!saved) {
            setSettings(prev => ({
              ...prev,
              appTheme: data.config.defaultTheme || 'system',
              boardTheme: data.config.defaultBoardTheme || 'cappuccino',
              pieceTheme: data.config.defaultPieceTheme || 'alexander',
              pieceColorPalette: data.config.defaultPieceColorPalette || 'classic',
              musicEnabled: data.config.defaultMusicEnabled !== undefined ? data.config.defaultMusicEnabled : true,
              musicTrackIndex: data.config.defaultMusicTrackIndex || 0
            }));
          }
        }
      })
      .catch(() => {});

    // 1. Check existing auth token
    const token = safeStorage.getItem('token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            const isOp = data.user.email?.toLowerCase().trim() === 'op21plus@gmail.com';
            data.user.role = isOp ? 'admin' : (data.user.role === 'guest' ? 'guest' : 'user');
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
      sound.playMatchStart();
      window.scrollTo({ top: 0, behavior: 'instant' });
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
        sound.playMatchStart();
        window.scrollTo({ top: 0, behavior: 'instant' });
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
            const captured = getCapturedPieces(r.fen || prev.fen);
            setGameSession(prev => ({
              ...prev,
              ...r,
              turn: new Chess(r.fen || prev.fen).turn(),
              capturedPieces: { white: captured.byWhite, black: captured.byBlack }
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
  const handleStartAIGame = (param1, param2) => {
    let level = 2;
    let color = 'w';
    let timeMinutes = 10;

    if (typeof param1 === 'object' && param1 !== null) {
      level = Number(param1.level) || 2;
      const rawColor = param1.color;
      color = rawColor === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : (rawColor === 'b' ? 'b' : 'w');
      timeMinutes = param1.timeMinutes !== undefined ? Number(param1.timeMinutes) : 10;
    } else {
      level = Number(param1) || 2;
      const rawColor = param2;
      color = rawColor === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : (rawColor === 'b' ? 'b' : 'w');
    }

    // Select a randomized cool anime opponent for this AI match
    const animeBot = getRandomAnimeOpponent(level);
    setCurrentAIOpponent(animeBot);
    setInGameNotice(null);

    const botPlayerObj = {
      username: animeBot.username,
      elo: animeBot.elo,
      avatar: animeBot.avatar,
      title: animeBot.title,
      country: animeBot.country || 'JP',
      anime: animeBot.anime,
      quote: animeBot.quote
    };

    setIsAIGame(true);
    setAiLevel(level);
    setBoardFlipped(color === 'b');
    setAiThinking(false);
    setShowAIModal(false);
    setShowGameOverModal(false);
    setActiveTab('game');
    sound.playMatchStart();
    window.scrollTo({ top: 0, behavior: 'instant' });

    const initialTimeMs = timeMinutes === 0 ? 3600000 : timeMinutes * 60 * 1000;

    const playerObj = currentUser || { username: 'You', elo: 1200, country: 'IN' };

    const startingSession = {
      id: `ai_${Date.now()}`,
      whitePlayer: color === 'w' ? playerObj : botPlayerObj,
      blackPlayer: color === 'w' ? botPlayerObj : playerObj,
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      turn: 'w',
      inCheck: false,
      isGameOver: false,
      status: 'active',
      whiteTime: initialTimeMs,
      blackTime: initialTimeMs,
      timeControl: { baseMinutes: timeMinutes, incrementSeconds: 0 },
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
    // Unlimited time / casual mode
    if (gameSession.timeControl?.baseMinutes === 0) return;

    const interval = setInterval(() => {
      setGameSession(prev => {
        if (!prev || prev.isGameOver) return prev;
        if (prev.timeControl?.baseMinutes === 0) return prev;

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

      // 1. First try modern Web Worker Stockfish / Async engine with budget
      try {
        aiMove = await getAIMoveAsync(fen, level);
      } catch (e) {
        // Fallback to local synchronous engine
      }

      // 2. Fallback to instant client-side AI engine
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
        if (moveRes.captured) {
          sound.playCapture();
        } else {
          sound.playMove();
        }
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

        const captured = getCapturedPieces(chess.fen());

        setGameSession(prev => ({
          ...prev,
          fen: chess.fen(),
          turn: chess.turn(),
          inCheck: chess.inCheck(),
          isGameOver: isOver,
          status: isOver ? status : 'active',
          winner: isOver ? winner : null,
          winReason: isOver ? winReason : null,
          moveHistory: updatedMoves,
          capturedPieces: { white: captured.byWhite, black: captured.byBlack }
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
        if (res.captured) {
          sound.playCapture();
        } else {
          sound.playMove();
        }
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

        const captured = getCapturedPieces(chess.fen());

        const updatedSession = {
          ...gameSession,
          fen: chess.fen(),
          turn: chess.turn(),
          inCheck: chess.inCheck(),
          isGameOver: isOver,
          status: isOver ? status : 'active',
          winner: isOver ? winner : null,
          winReason: isOver ? winReason : null,
          moveHistory: updatedHistory,
          capturedPieces: { white: captured.byWhite, black: captured.byBlack }
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
          if (res.captured) {
            sound.playCapture();
          } else {
            sound.playMove();
          }
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

          const captured = getCapturedPieces(chess.fen());

          const updatedSession = {
            ...gameSession,
            fen: chess.fen(),
            turn: chess.turn(),
            inCheck: chess.inCheck(),
            isGameOver: isOver,
            status: isOver ? status : 'active',
            winner: isOver ? winner : null,
            winReason: isOver ? winReason : null,
            moveHistory: updatedHistory,
            capturedPieces: { white: captured.byWhite, black: captured.byBlack }
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

  const handleExitGame = () => {
    sound.playClick();
    if (!isAIGame && gameSession && !gameSession.isGameOver) {
      socketRef.current?.emit('resign_game', { gameId: gameSession.id });
    }
    setShowGameOverModal(false);
    setActiveTab('home');
  };

  const handleOfferDraw = () => {
    if (!isAIGame) {
      socketRef.current?.emit('offer_draw', { gameId: gameSession.id });
    } else {
      // In AI Game: evaluate position or provide Anime Opponent dialogue
      let isTechnicallyDrawn = false;
      try {
        const c = new Chess(gameSession?.fen || '');
        isTechnicallyDrawn = c.isDraw();
      } catch (e) {}

      const moveCount = gameSession?.moveHistory?.length || 0;
      if (isTechnicallyDrawn || moveCount >= 24) {
        setGameSession(prev => ({
          ...prev,
          isGameOver: true,
          status: 'draw',
          winner: null,
          winReason: 'agreement'
        }));
        setShowGameOverModal(true);
        sound.playVictory();
      } else {
        const reaction = currentAIOpponent?.drawReaction || "A true grandmaster fights until the final move!";
        setInGameNotice(reaction);
        sound.playMove();
        setTimeout(() => setInGameNotice(null), 6000);
      }
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
  // Dynamic Day & Night System Theme Detection
  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const effectiveTheme = useMemo(() => {
    const rawTheme = (settings.appTheme || 'system').toLowerCase();
    if (rawTheme === 'system' || rawTheme === 'auto' || rawTheme === 'device') {
      return systemIsDark ? 'dark' : 'light';
    }
    if (rawTheme === 'alabaster' || rawTheme === 'light' || rawTheme === 'white' || rawTheme === 'day') {
      return 'light';
    }
    if (rawTheme === 'black' || rawTheme === 'oled') {
      return 'black';
    }
    return 'dark';
  }, [settings.appTheme, systemIsDark]);

  const isLight = effectiveTheme === 'light';
  const isOled = effectiveTheme === 'black';

  // Synchronize document root theme class & system color-scheme
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (isLight) {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    }
  }, [isLight]);

  const currentTurn = gameSession ? new Chess(gameSession.fen).turn() : 'w';

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-amber-500 selection:text-black transition-colors ${
      isLight ? 'light-bg text-slate-900' : isOled ? 'bg-black text-slate-100' : 'luxury-bg text-slate-100'
    }`}>
      {/* Top Navbar (Hidden in full-screen offline pass & play mode) */}
      {activeTab !== 'offline' && (
        <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 py-2.5 transition-colors ${
          isLight ? 'bg-white/95 border-slate-200 text-slate-900 shadow-sm' : isOled ? 'bg-black/95 border-zinc-800 text-white' : 'bg-slate-950/80 border-slate-800 text-white'
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
              ...PRIMARY_NAV_TABS,
              ...(currentUser?.role === 'admin' ? [{ id: 'admin', label: 'Admin', icon: Sparkles }] : [])
            ].map(tab => {
              const Icon = tab.icon;
              const active = isTabActive(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playClick();
                    triggerHaptic('move');
                    setActiveTab(tab.id);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
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
                sound.playClick();
                triggerHaptic('move');
                setShowSettingsModal(true);
              }}
              className={`p-2 rounded-xl border transition-colors ${
                showSettingsModal
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-amber-600'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-400'
              }`}
              title="Application Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Sign In / Profile Header Controls */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 md:gap-2">
                {(currentUser.role === 'admin' || currentUser.email?.toLowerCase().trim() === 'op21plus@gmail.com') && (
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

                {/* Day / Night Theme One-Click Toggle (Directly to the left of Profile Avatar) */}
                <button
                  onClick={() => {
                    sound.playClick();
                    triggerHaptic('move');
                    const nextTheme = isLight ? 'dark' : 'light';
                    handleUpdateSettings({ ...settings, appTheme: nextTheme });
                  }}
                  className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                    isLight
                      ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800 shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-amber-400 hover:text-amber-300 shadow-md'
                  }`}
                  title={isLight ? 'Switch to Night Mode (Dark)' : 'Switch to Day Mode (Light)'}
                  aria-label="Toggle Day / Night Mode"
                >
                  {isLight ? (
                    <Moon className="w-4 h-4 text-indigo-600 transition-transform hover:-rotate-12" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
                  )}
                </button>

                {/* Profile Avatar Button (ONLY Avatar Pic - No username in top corner) */}
                <button
                  onClick={() => {
                    sound.playClick();
                    triggerHaptic('move');
                    setActiveTab('profile');
                  }}
                  className={`relative p-0.5 rounded-full border-2 transition-all active:scale-95 cursor-pointer hover:scale-105 ${
                    activeTab === 'profile'
                      ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/20'
                      : isLight
                      ? 'border-amber-500 hover:border-amber-600 shadow-sm'
                      : 'border-amber-400/80 hover:border-amber-400 shadow-amber-500/10'
                  }`}
                  title={`Profile: ${currentUser.username}`}
                  aria-label="View Profile"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    className="w-8 h-8 rounded-full object-cover bg-slate-950"
                  />
                  {(currentUser.role === 'admin' || currentUser.email?.toLowerCase().trim() === 'op21plus@gmail.com') && (
                    <span
                      className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 border border-slate-950 rounded-full flex items-center justify-center text-[8px] shadow-sm leading-none"
                      title="Arena Admin"
                    >
                      👑
                    </span>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 md:gap-2">
                {/* Day / Night Theme One-Click Toggle for Guests */}
                <button
                  onClick={() => {
                    sound.playClick();
                    triggerHaptic('move');
                    const nextTheme = isLight ? 'dark' : 'light';
                    handleUpdateSettings({ ...settings, appTheme: nextTheme });
                  }}
                  className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                    isLight
                      ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800 shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-amber-400 hover:text-amber-300 shadow-md'
                  }`}
                  title={isLight ? 'Switch to Night Mode (Dark)' : 'Switch to Day Mode (Light)'}
                  aria-label="Toggle Day / Night Mode"
                >
                  {isLight ? (
                    <Moon className="w-4 h-4 text-indigo-600 transition-transform hover:-rotate-12" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
                  )}
                </button>

                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
                  title="Sign In with Google / Gmail"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      )}

      {/* Main Content View Switcher */}
      <main className="flex-1 flex flex-col relative">
        {(activeTab === 'home' || activeTab === 'play') && (() => {
          const userElo = currentUser?.ratings?.rapid || currentUser?.elo || 1078;
          const { rank: userRank, totalPlayers, percentile, countryRank } = calculateUserRanking(userElo);
          const currentUsername = currentUser?.username || 'Guest Competitor';
          const currentAvatar = currentUser?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=LuffyGear5';
          const currentTier = currentUser?.tier || 'Intermediate';

          return (
            <div className="max-w-6xl w-full mx-auto px-3.5 sm:px-6 py-4 md:py-8 space-y-6 flex-1 flex flex-col justify-center relative">
              {/* Live Arena Telemetry Status Strip */}
              <div className={`flex items-center justify-between flex-wrap gap-2 px-4 py-2.5 rounded-2xl border shadow-lg text-xs backdrop-blur-md transition-colors ${
                isLight
                  ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/50'
                  : 'bg-slate-900/80 border-slate-800/80 text-white shadow-slate-950/50'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className={`font-extrabold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>18,450</span>
                  <span className={isLight ? 'text-slate-500 font-medium' : 'text-slate-400 font-medium'}>Players Online</span>
                </div>
                <div className={`hidden sm:flex items-center gap-2 font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  <span className="text-amber-500 font-bold font-mono">⚔️ 4,280</span>
                  <span>Active Battles</span>
                </div>
                <div className={`flex items-center gap-1.5 font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">1.1s</span>
                  <span>Avg Pairing</span>
                </div>
              </div>

              {/* Live Admin Announcement Banner */}
              {globalConfig?.announcement && (
                <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border shadow-md text-xs font-semibold backdrop-blur-md transition-colors overflow-hidden ${
                  isLight
                    ? 'bg-amber-50/95 border-amber-300 text-amber-900 shadow-amber-100'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-amber-950/40'
                }`}>
                  <span className="text-amber-500 text-sm animate-bounce shrink-0">📢</span>
                  <span className="font-black uppercase tracking-wider text-[9px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full shrink-0">
                    ANNOUNCEMENT
                  </span>
                  <span className="truncate flex-1">{globalConfig.announcement}</span>
                </div>
              )}

              {/* Grandmaster Arena Game Modes Hub */}
              <div className={`relative rounded-3xl p-4 sm:p-7 md:p-8 border shadow-2xl overflow-hidden backdrop-blur-xl transition-colors ${
                isLight
                  ? 'bg-white/95 border-slate-200 shadow-slate-200/60'
                  : 'bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 border-amber-500/20 shadow-amber-500/10'
              }`}>
                {/* Ethereal Ambient Glows */}
                <div className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
                  isLight ? 'bg-amber-400/10' : 'bg-amber-500/10'
                }`} />
                <div className={`absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
                  isLight ? 'bg-indigo-400/10' : 'bg-indigo-500/10'
                }`} />

                <div className="max-w-2xl mx-auto space-y-4 relative z-10">
                  {/* Clean, sleek title bar */}
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <h2 className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                        <span>Play Chess</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          isLight
                            ? 'bg-amber-100 border-amber-300 text-amber-800'
                            : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                        }`}>
                          Season 2026
                        </span>
                      </h2>
                      <p className={`text-xs font-medium mt-0.5 ${
                        isLight ? 'text-slate-600' : 'text-slate-400'
                      }`}>
                        Select your game mode to start playing
                      </p>
                    </div>
                    <div className={`hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] ${
                      isLight
                        ? 'bg-slate-100 border-slate-200 text-slate-700'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>18,450</span>
                      <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>online</span>
                    </div>
                  </div>

                  {/* 4 Game Mode Buttons (Unified, Sleek & Non-Bulky) */}
                  <div className="space-y-2.5 pt-1">
                    {/* 1st: Play with Stockfish */}
                    <button
                      onClick={() => {
                        sound.playClick();
                        triggerHaptic('move');
                        setShowAIModal(true);
                      }}
                      className={`w-full text-left p-3 sm:p-4 rounded-2xl border transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.985] group cursor-pointer relative overflow-hidden ${
                        isLight
                          ? 'bg-gradient-to-r from-indigo-50/90 via-white to-purple-50/70 hover:from-indigo-100/90 hover:to-purple-100/80 border-indigo-200/90 hover:border-indigo-400 shadow-md shadow-indigo-100'
                          : 'bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-purple-950/50 hover:from-indigo-900/80 hover:via-purple-900/60 hover:to-indigo-850/80 active:from-indigo-900/95 active:to-purple-900/90 border-indigo-500/35 hover:border-indigo-400/70 shadow-lg shadow-indigo-950/30'
                      }`}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/25 transition-all duration-300" />
                      <div className="flex items-center justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                          {/* Stockfish AI Neural Bot Avatar Profile Picture */}
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border p-1.5 shadow-md flex flex-col items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-300 relative overflow-hidden ${
                            isLight
                              ? 'bg-gradient-to-br from-indigo-100 via-white to-purple-100 border-indigo-200 group-hover:border-indigo-400 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                              : 'bg-gradient-to-br from-indigo-900/80 via-slate-950 to-purple-950/90 border-indigo-400/50 group-hover:border-indigo-300 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.35)]'
                          }`}>
                            {/* Circuit lines backdrop */}
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:6px_6px] pointer-events-none" />
                            {/* Glowing Bot Face & Dual Cyan Eyes */}
                            <div className="relative z-10 flex flex-col items-center">
                              <Bot className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                                isLight
                                  ? 'text-indigo-600 group-hover:text-indigo-700'
                                  : 'text-indigo-300 drop-shadow-[0_0_6px_rgba(99,102,241,0.7)] group-hover:text-indigo-200'
                              }`} />
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_4px_#22d3ee] animate-pulse" />
                                <span className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_4px_#22d3ee] animate-pulse" style={{ animationDelay: '200ms' }} />
                              </div>
                            </div>
                            {/* Bottom tag strip */}
                            <div className={`absolute bottom-0 inset-x-0 border-t py-0.5 flex justify-center items-center ${
                              isLight
                                ? 'bg-indigo-100/95 border-indigo-200 text-indigo-700'
                                : 'bg-indigo-950/95 border-indigo-500/40 text-indigo-300'
                            }`}>
                              <span className="text-[7px] sm:text-[8px] font-black tracking-widest uppercase">AI BOT</span>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Title with flex-wrap and NO truncate so title is 100% visible on all screens */}
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <h3 className={`text-sm sm:text-base font-black transition-colors leading-tight ${
                                isLight
                                  ? 'text-slate-900 group-hover:text-indigo-700'
                                  : 'text-white group-hover:text-indigo-200'
                              }`}>
                                Play with Stockfish
                              </h3>
                              <span className={`px-1.5 sm:px-2 py-0.5 rounded-full border text-[9px] sm:text-[10px] font-black uppercase tracking-wider shrink-0 shadow-sm ${
                                isLight
                                  ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                              }`}>
                                AI Bot 🤖
                              </span>
                            </div>
                            <p className={`text-[11px] sm:text-xs mt-1 font-medium leading-tight ${
                              isLight ? 'text-slate-600' : 'text-slate-400'
                            }`}>
                              Practice against engine bots (800–2500+ Elo)
                            </p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-bold shrink-0 ${
                          isLight ? 'text-indigo-600' : 'text-indigo-400'
                        }`}>
                          <span className="hidden md:inline">Play AI</span>
                          <ChevronRight className={`w-5 h-5 group-hover:translate-x-1 transition-all ${
                            isLight ? 'group-hover:text-indigo-800' : 'group-hover:text-indigo-300'
                          }`} />
                        </div>
                      </div>
                    </button>

                    {/* 2nd: Play with Friends (Chat & Voice Room) */}
                    <button
                      onClick={() => {
                        sound.playClick();
                        triggerHaptic('move');
                        setShowFriendRoomModal(true);
                      }}
                      className={`w-full text-left p-3 sm:p-4 rounded-2xl border transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.985] group cursor-pointer relative overflow-hidden ${
                        isLight
                          ? 'bg-gradient-to-r from-emerald-50/90 via-white to-teal-50/70 hover:from-emerald-100/90 hover:to-teal-100/80 border-emerald-200/90 hover:border-emerald-400 shadow-md shadow-emerald-100'
                          : 'bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-teal-950/50 hover:from-emerald-900/80 hover:via-teal-900/60 hover:to-emerald-850/80 active:from-emerald-900/95 active:to-teal-900/90 border-emerald-500/35 hover:border-emerald-400/70 shadow-lg shadow-emerald-950/30'
                      }`}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/25 transition-all duration-300" />
                      <div className="flex items-center justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                          {/* Friends & Live Voice Audio Wave Avatar Profile Picture */}
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border p-1.5 shadow-md flex flex-col items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-300 relative overflow-hidden ${
                            isLight
                              ? 'bg-gradient-to-br from-emerald-100 via-white to-teal-100 border-emerald-200 group-hover:border-emerald-400 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                              : 'bg-gradient-to-br from-emerald-900/80 via-slate-950 to-teal-950/90 border-emerald-400/50 group-hover:border-emerald-300 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                          }`}>
                            {/* Two friend avatar badges overlapping + live sound equalizer waves */}
                            <div className="relative z-10 flex flex-col items-center">
                              <div className="flex items-center justify-center -space-x-1.5">
                                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 border border-emerald-200/50 flex items-center justify-center text-[8px] font-black text-white shadow-sm">
                                  ♔
                                </div>
                                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border border-amber-200/50 flex items-center justify-center text-[8px] font-black text-white shadow-sm">
                                  ♚
                                </div>
                              </div>
                              {/* Audio Soundwave Equalizer */}
                              <div className="flex items-end gap-0.5 justify-center mt-1">
                                <span className="w-0.5 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-0.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                <span className="w-0.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                              </div>
                            </div>
                            {/* Bottom tag strip */}
                            <div className={`absolute bottom-0 inset-x-0 border-t py-0.5 flex justify-center items-center ${
                              isLight
                                ? 'bg-emerald-100/95 border-emerald-200 text-emerald-700'
                                : 'bg-emerald-950/95 border-emerald-500/40 text-emerald-300'
                            }`}>
                              <span className="text-[7px] sm:text-[8px] font-black tracking-widest uppercase">VOICE</span>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Title with flex-wrap and NO truncate so title is 100% visible on all screens */}
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <h3 className={`text-sm sm:text-base font-black transition-colors leading-tight ${
                                isLight
                                  ? 'text-slate-900 group-hover:text-emerald-700'
                                  : 'text-white group-hover:text-emerald-200'
                              }`}>
                                Play with Friends
                              </h3>
                              <span className={`px-1.5 sm:px-2 py-0.5 rounded-full border text-[9px] sm:text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-sm ${
                                isLight
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              }`}>
                                <span>Chat & Voice</span>
                                <span className="text-[10px]">🎙️</span>
                              </span>
                            </div>
                            <p className={`text-[11px] sm:text-xs mt-1 font-medium leading-tight ${
                              isLight ? 'text-slate-600' : 'text-slate-400'
                            }`}>
                              Private rooms with live chat, voice & invites
                            </p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-bold shrink-0 ${
                          isLight ? 'text-emerald-600' : 'text-emerald-400'
                        }`}>
                          <span className="hidden md:inline">Join Room</span>
                          <ChevronRight className={`w-5 h-5 group-hover:translate-x-1 transition-all ${
                            isLight ? 'group-hover:text-emerald-800' : 'group-hover:text-emerald-300'
                          }`} />
                        </div>
                      </div>
                    </button>

                    {/* 3rd: Play Online (Opens Time Selection Modal) */}
                    <button
                      onClick={() => {
                        sound.playClick();
                        triggerHaptic('move');
                        setShowMatchmakingModal(true);
                      }}
                      className={`w-full text-left p-3 sm:p-4 rounded-2xl border transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.985] group cursor-pointer relative overflow-hidden ${
                        isLight
                          ? 'bg-gradient-to-r from-amber-50/90 via-white to-orange-50/70 hover:from-amber-100/90 hover:to-orange-100/80 border-amber-200/90 hover:border-amber-400 shadow-md shadow-amber-100'
                          : 'bg-gradient-to-r from-amber-950/70 via-slate-900/90 to-orange-950/50 hover:from-amber-900/80 hover:via-orange-900/60 hover:to-amber-850/80 active:from-amber-900/95 active:to-orange-900/90 border-amber-500/35 hover:border-amber-400/70 shadow-lg shadow-amber-950/30'
                      }`}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/25 transition-all duration-300" />
                      <div className="flex items-center justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                          {/* Global Arena Matchmaking Profile Picture with Crossed Swords */}
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border p-1.5 shadow-md flex flex-col items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-300 relative overflow-hidden ${
                            isLight
                              ? 'bg-gradient-to-br from-amber-100 via-white to-orange-100 border-amber-300 group-hover:border-amber-400 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                              : 'bg-gradient-to-br from-amber-900/80 via-slate-950 to-orange-950/90 border-amber-500/50 group-hover:border-amber-300 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                          }`}>
                            {/* Green live radar pulse in corner */}
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#34d399] animate-pulse" />
                            {/* Crossed Swords with golden flare */}
                            <div className="relative z-10 flex flex-col items-center">
                              <Swords className={`w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform duration-300 ${
                                isLight
                                  ? 'text-amber-600'
                                  : 'text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.7)]'
                              }`} />
                            </div>
                            {/* Bottom tag strip */}
                            <div className={`absolute bottom-0 inset-x-0 border-t py-0.5 flex justify-center items-center ${
                              isLight
                                ? 'bg-amber-100/95 border-amber-200 text-amber-800'
                                : 'bg-amber-950/95 border-amber-500/40 text-amber-300'
                            }`}>
                              <span className="text-[7px] sm:text-[8px] font-black tracking-widest uppercase">ONLINE</span>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Title with flex-wrap and NO truncate so title is 100% visible on all screens */}
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <h3 className={`text-sm sm:text-base font-black transition-colors leading-tight ${
                                isLight
                                  ? 'text-slate-900 group-hover:text-amber-800'
                                  : 'text-white group-hover:text-amber-200'
                              }`}>
                                Play Online
                              </h3>
                              <span className={`px-1.5 sm:px-2 py-0.5 rounded-full border text-[9px] sm:text-[10px] font-black uppercase tracking-wider shrink-0 shadow-sm ${
                                isLight
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              }`}>
                                Rated FIDE ⚔️
                              </span>
                            </div>
                            <p className={`text-[11px] sm:text-xs mt-1 font-medium leading-tight ${
                              isLight ? 'text-slate-600' : 'text-slate-400'
                            }`}>
                              Choose time control & match with global players
                            </p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-bold shrink-0 ${
                          isLight ? 'text-amber-600' : 'text-amber-400'
                        }`}>
                          <span className="hidden md:inline">Choose Time</span>
                          <ChevronRight className={`w-5 h-5 group-hover:translate-x-1 transition-all ${
                            isLight ? 'group-hover:text-amber-800' : 'group-hover:text-amber-300'
                          }`} />
                        </div>
                      </div>
                    </button>

                    {/* 4th: Offline Chess Board (With 4x4 Mini Chessboard Picture Graphic) */}
                    <button
                      onClick={() => {
                        sound.playClick();
                        triggerHaptic('move');
                        setActiveTab('offline');
                      }}
                      className={`w-full text-left p-3 sm:p-4 rounded-2xl border transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.985] group cursor-pointer relative overflow-hidden ${
                        isLight
                          ? 'bg-gradient-to-r from-amber-50/70 via-white to-stone-50/70 hover:from-amber-100/80 hover:to-stone-100/80 border-amber-200/80 hover:border-amber-400 shadow-md shadow-amber-100'
                          : 'bg-gradient-to-r from-slate-900/90 via-amber-950/25 to-slate-950/90 hover:from-slate-850 hover:via-amber-950/40 hover:to-amber-900/30 active:from-amber-950/60 active:to-slate-900/95 border-amber-500/30 hover:border-amber-400/60 shadow-lg shadow-slate-950/30'
                      }`}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-300" />
                      <div className="flex items-center justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                          {/* 4x4 Mini Chessboard Picture */}
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border p-1 shadow-md flex flex-col items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-300 relative overflow-hidden ${
                            isLight
                              ? 'bg-amber-100 border-amber-300 group-hover:border-amber-400 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                              : 'bg-amber-950/90 border-amber-500/50 group-hover:border-amber-300 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                          }`}>
                            <div className="w-full h-[32px] sm:h-[36px] grid grid-cols-4 grid-rows-4 rounded-sm overflow-hidden border border-amber-900/40 shadow-inner">
                              {[
                                0, 1, 0, 1,
                                1, 0, 1, 0,
                                0, 1, 0, 1,
                                1, 0, 1, 0
                              ].map((val, idx) => {
                                const isDark = val === 1;
                                return (
                                  <div
                                    key={idx}
                                    className={`w-full h-full flex items-center justify-center ${
                                      isDark ? 'bg-amber-800' : 'bg-amber-100'
                                    }`}
                                  >
                                    {idx === 9 && (
                                      <span className="text-[7px] leading-none select-none text-slate-900 font-bold">♟</span>
                                    )}
                                    {idx === 6 && (
                                      <span className="text-[7px] leading-none select-none text-amber-950 font-bold">♙</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            {/* Bottom tag strip */}
                            <div className={`absolute bottom-0 inset-x-0 border-t py-0.5 flex justify-center items-center ${
                              isLight
                                ? 'bg-amber-100/95 border-amber-200 text-amber-800'
                                : 'bg-stone-950/95 border-amber-600/40 text-amber-300'
                            }`}>
                              <span className="text-[7px] sm:text-[8px] font-black tracking-widest uppercase">BOARD</span>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Title with flex-wrap and NO truncate so title is 100% visible on all screens */}
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <h3 className={`text-sm sm:text-base font-black transition-colors leading-tight ${
                                isLight
                                  ? 'text-slate-900 group-hover:text-amber-800'
                                  : 'text-white group-hover:text-amber-200'
                              }`}>
                                Offline Chess Board
                              </h3>
                              <span className={`px-1.5 sm:px-2 py-0.5 rounded-full border text-[9px] sm:text-[10px] font-black uppercase tracking-wider shrink-0 shadow-sm ${
                                isLight
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}>
                                Pass & Play 👥
                              </span>
                            </div>
                            <p className={`text-[11px] sm:text-xs mt-1 font-medium leading-tight ${
                              isLight ? 'text-slate-600' : 'text-slate-400'
                            }`}>
                              Play face-to-face on 1 phone (No internet needed)
                            </p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-bold shrink-0 ${
                          isLight ? 'text-amber-600' : 'text-slate-400 group-hover:text-amber-400'
                        }`}>
                          <span className="hidden md:inline">Pass & Play</span>
                          <ChevronRight className={`w-5 h-5 group-hover:translate-x-1 transition-all ${
                            isLight ? 'group-hover:text-amber-800' : 'group-hover:text-amber-300'
                          }`} />
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
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
                    isLight={isLight}
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
                  <div className={`w-full max-w-[520px] px-3.5 py-1.5 border rounded-xl flex items-center justify-between text-xs shadow-xs animate-fade-in ${
                    isLight ? "bg-white border-slate-200 text-amber-600 shadow-xs" : "bg-slate-900/90 border-slate-800 text-amber-300 shadow-sm"
                  }`}>
                    <div className="flex items-center gap-2 truncate">
                      <BookOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className={`font-bold truncate ${isLight ? "text-slate-800" : "text-amber-300"}`}>{getOpeningName(gameSession.moveHistory).name}</span>
                    </div>
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                      isLight ? "bg-slate-100 text-slate-700" : "bg-slate-800 text-slate-300"
                    }`}>
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
                    isLight={isLight}
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
                  isLight={isLight}
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onOpenSettings={() => setShowSettingsModal(true)}
                />

                {/* Game Controls: Exit, Draw, Design, Resign */}
                <GameControls
                  isLight={isLight}
                  isGameOver={gameSession.isGameOver}
                  isPlayer={playerColor === 'w' || playerColor === 'b'}
                  drawOfferedBy={gameSession.drawOfferedBy}
                  rematchRequestedBy={gameSession.rematchRequestedBy}
                  currentUserColor={playerColor}
                  onResign={handleResign}
                  onOfferDraw={handleOfferDraw}
                  onRespondDraw={handleRespondDraw}
                  onRequestRematch={handleRequestRematch}
                  onOpenDesign={() => setShowInGameDesignModal(true)}
                  onExit={handleExitGame}
                  onAnalyze={() => setAnalysisGame(gameSession)}
                  onViewResult={() => setShowGameOverModal(true)}
                  isAIGame={isAIGame}
                  onVoiceCall={!isAIGame ? () => setVoiceCallTrigger(c => c + 1) : null}
                />

                {/* AI Battle Card for AI Matches, or Live Chat with Voice Call for Multiplayer */}
                {isAIGame ? (
                  <AIBattleCard
                    opponent={currentAIOpponent || opponent}
                    aiLevel={aiLevel}
                    isThinking={aiThinking}
                    inCheck={gameSession.inCheck}
                    isLight={isLight}
                    inGameNotice={inGameNotice}
                  />
                ) : (
                  settings.allowChat ? (
                    <GameChat
                      isLight={isLight}
                      messages={chatMessages}
                      onSendMessage={handleSendMessage}
                      currentUser={currentUser}
                      opponentUser={opponent}
                      socket={socketRef.current}
                      gameId={gameSession.id}
                      isPlayer={playerColor === 'w' || playerColor === 'b'}
                      triggerVoiceCall={voiceCallTrigger}
                    />
                  ) : (
                    <div className={`p-3 border rounded-xl text-center text-xs italic ${
                      isLight ? "bg-white border-slate-200 text-slate-400" : "bg-slate-900/60 border-slate-800 text-slate-500"
                    }`}>
                      In-game text chat is disabled in Settings.
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tournaments Championship Tab */}
        {activeTab === 'tournaments' && (
          <TournamentView
            currentUser={currentUser}
            onBack={() => setActiveTab('home')}
          />
        )}

        {/* Play Offline Board Tab (Pass & Play Two Players Local) */}
        {activeTab === 'offline' && (
          <OfflineBoardView onBack={() => setActiveTab('home')} isLight={isLight} />
        )}

        {/* Puzzles Tab */}
        {(activeTab === 'puzzles' || activeTab === 'puzzle') && (
          <PuzzleView
            isLight={isLight}
            isOled={isOled}
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
          <LessonView isLight={isLight} isOled={isOled} onBack={() => setActiveTab('home')} />
        )}

        {/* Profile Tab (Full-Page View: Overview, Rankings & Settings) */}
        {activeTab === 'profile' && (
          <ProfileView
            isLight={isLight}
            isOled={isOled}
            user={currentUser}
            onUpdateUser={user => setCurrentUser(user)}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
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
          <LeaderboardView isLight={isLight} currentUser={currentUser} />
        )}

        {/* Admin Dashboard Tab */}
        {activeTab === 'admin' && (
          <AdminView
            onBack={() => setActiveTab('profile')}
            currentUser={currentUser}
            isLight={isLight}
          />
        )}
      </main>

      {/* Floating Bottom Navigation for Mobile (4 Primary Tabs: Home, Puzzles, Learn, Profile) */}
      {activeTab !== 'offline' && (
        <footer className={`md:hidden sticky bottom-0 z-40 backdrop-blur-md border-t px-2 py-2 flex items-center justify-around transition-colors ${
          isLight ? 'bg-white/95 border-slate-200' : isOled ? 'bg-black/95 border-zinc-800' : 'bg-slate-950/90 border-slate-800'
        }`}>
          {PRIMARY_NAV_TABS.map(tab => {
            const Icon = tab.icon;
            const active = isTabActive(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  triggerHaptic('move');
                  setActiveTab(tab.id);
                }}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold transition-all active:scale-95 cursor-pointer ${
                  active
                    ? 'text-amber-400 font-black scale-105'
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
        isLight={isLight}
        onAuthSuccess={user => {
          if (user) {
            const isOp = user.email?.toLowerCase().trim() === 'op21plus@gmail.com';
            user.role = isOp ? 'admin' : (user.role === 'guest' ? 'guest' : 'user');
          }
          setCurrentUser(user);
        }}
      />

      <ProfileModal
        isOpen={showProfileModal}
        user={currentUser}
        isLight={isLight}
        onClose={() => setShowProfileModal(false)}
        onUpdateUser={user => {
          if (user) {
            const isOp = user.email?.toLowerCase().trim() === 'op21plus@gmail.com';
            user.role = isOp ? 'admin' : (user.role === 'guest' ? 'guest' : 'user');
          }
          setCurrentUser(user);
        }}
        onOpenAdmin={() => setActiveTab('admin')}
        onNavigateToRankings={() => {
          setShowProfileModal(false);
          setActiveTab('profile');
        }}
        onOpenStreak={() => {
          setShowProfileModal(false);
          setShowStreakModal(true);
        }}
      />

      <DailyStreakModal
        isOpen={showStreakModal}
        isLight={isLight}
        onClose={() => setShowStreakModal(false)}
      />

      <MatchmakingModal
        isOpen={showMatchmakingModal}
        isLight={isLight}
        onClose={() => setShowMatchmakingModal(false)}
        onStartMatchmaking={handleStartMatchmaking}
        isSearching={isSearchingMatch}
        onCancelMatchmaking={handleCancelMatchmaking}
        initialPreset={selectedHomeTime}
      />

      <FriendRoomModal
        isOpen={showFriendRoomModal}
        isLight={isLight}
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
        isLight={isLight}
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
        isLight={isLight}
        isOled={isOled}
        timeControl={gameSession?.timeControl}
        status={gameSession?.status}
        winner={gameSession?.winner}
        winReason={gameSession?.winReason}
        playerColor={playerColor}
        whitePlayer={gameSession?.whitePlayer}
        blackPlayer={gameSession?.blackPlayer}
        whiteEloChange={gameSession?.whiteEloChange || (isAIGame ? (gameSession?.winner === 'white' ? 16 : -16) : 0)}
        blackEloChange={gameSession?.blackEloChange || (isAIGame ? (gameSession?.winner === 'black' ? 16 : -16) : 0)}
        moveHistory={gameSession?.moveHistory}
        pgn={gameSession?.pgn}
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

      {/* Real-Time In-Game Design Customization Studio */}
      <InGameDesignModal
        isOpen={showInGameDesignModal}
        onClose={() => setShowInGameDesignModal(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        isBoardFlipped={boardFlipped}
        onToggleFlip={() => setBoardFlipped(!boardFlipped)}
        isLight={isLight}
      />

      {/* Full Feature Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        isLight={isLight}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
}
