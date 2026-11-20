import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Chess } from 'chess.js';
import {
  Trophy, Swords, Users, BookOpen, Bot, Shield, Volume2, VolumeX,
  Palette, User, LogOut, Bell, Flame, Sparkles, ChevronRight, Settings, Music
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
import { FriendsDrawer } from './components/FriendsDrawer.jsx';
import { PuzzleView } from './components/PuzzleView.jsx';
import { LessonView } from './components/LessonView.jsx';
import { TournamentView } from './components/TournamentView.jsx';
import { LeaderboardView } from './components/LeaderboardView.jsx';
import { AnalysisView } from './components/AnalysisView.jsx';
import { AdminView } from './components/AdminView.jsx';
import { GameOverModal } from './components/GameOverModal.jsx';
import { SettingsModal } from './components/SettingsModal.jsx';
import { MiniMusicPlayer } from './components/MiniMusicPlayer.jsx';
import { BOARD_THEMES } from './components/PieceIcons.jsx';
import { sound } from './utils/audio.js';
import { musicEngine } from './utils/music.js';
import { triggerHaptic, speakMove } from './utils/device.js';
import { getOpeningName } from './utils/openings.js';

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
  // Navigation & View State
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'game', 'puzzles', 'lessons', 'tournaments', 'leaderboard', 'admin'
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('chess_arena_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {}
    return DEFAULT_SETTINGS;
  });

  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('chess_arena_settings', JSON.stringify(newSettings));
    } catch (e) {}
  };

  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFriendsDrawer, setShowFriendsDrawer] = useState(false);

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
      (activeTab === 'lessons' && settings.musicDuringLessons) ||
      activeTab === 'home';

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
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setCurrentUser(data.user);
          }
        })
        .catch(() => localStorage.removeItem('token'));
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
      setTimeout(() => {
        socket.emit('join_room', { roomId: roomParam });
        setActiveTab('game');
      }, 500);
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  // Update socket authentication when user changes
  useEffect(() => {
    if (currentUser && socketRef.current) {
      socketRef.current.emit('authenticate', currentUser);
    }
  }, [currentUser]);

  // Handle Matchmaking
  const handleStartMatchmaking = (preset) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
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
  const handleCreateFriendRoom = (config) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    socketRef.current?.emit('create_room', config);
  };

  const handleJoinFriendRoom = (roomId) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    socketRef.current?.emit('join_room', { roomId });
    setShowFriendRoomModal(false);
    setActiveTab('game');
  };

  // Handle AI Practice Matches
  const handleStartAIGame = ({ level, color }) => {
    setIsAIGame(true);
    setAiLevel(level);
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
      triggerAIMove(startingSession.fen, startingSession, level);
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
      const res = await fetch('/api/ai/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen, level })
      });
      const aiMove = await res.json();

      const chess = new Chess(session.fen);
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
          ...session.moveHistory,
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
      console.error('AI move error:', err);
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
      // Multiplayer move
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

  const currentTurn = gameSession ? new Chess(gameSession.fen).turn() : 'w';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 py-2.5">
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
              <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1">
                <span>CHESS</span>
                <span className="text-amber-400">ARENA</span>
              </span>
              <span className="text-[10px] text-slate-400 block font-medium -mt-1 hidden sm:block">
                Play. Challenge. Conquer.
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-900/80 border border-slate-800 rounded-2xl">
            {[
              { id: 'home', label: 'Play', icon: Swords },
              { id: 'puzzles', label: 'Puzzles', icon: Flame },
              { id: 'lessons', label: 'Learn', icon: BookOpen },
              { id: 'tournaments', label: 'Tournaments', icon: Trophy },
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
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-md shadow-amber-500/10 animate-pulse'
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
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
              title={settings.soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Global Settings Modal Trigger */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
              title="Application Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Friends Drawer Toggle */}
            {currentUser && (
              <button
                onClick={() => setShowFriendsDrawer(true)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 transition-colors relative"
                title="Friends & Social"
              >
                <Users className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
              </button>
            )}

            {/* Profile Avatar / Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-2 p-1 pl-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-colors"
                >
                  <span className="text-xs font-bold text-white max-w-[90px] truncate">
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
                    localStorage.removeItem('token');
                    setCurrentUser(null);
                  }}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400"
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
      <main className="flex-1 flex flex-col">
        {activeTab === 'home' && (
          <div className="max-w-6xl w-full mx-auto p-4 md:p-8 space-y-8 flex-1">
            {/* Hero Card */}
            <div className="relative overflow-hidden p-6 md:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-2xl">
              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>The Grandmaster Arena Experience</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  Play. Challenge. Connect. <span className="text-amber-400">Conquer.</span>
                </h1>
                <p className="text-sm md:text-base text-slate-300 leading-relaxed">
                  Join real-time rated multiplayer matches, invite friends with one-click links, chat via live audio voice, solve daily tactics, and sharpen your game with Stockfish 19 WASM analysis.
                </p>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => setShowMatchmakingModal(true)}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transform hover:-translate-y-0.5 transition-all"
                  >
                    <Swords className="w-4 h-4" />
                    <span>Play Online</span>
                  </button>

                  <button
                    onClick={() => setShowFriendRoomModal(true)}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm transform hover:-translate-y-0.5 transition-all"
                  >
                    <Users className="w-4 h-4" />
                    <span>Play with Friend</span>
                  </button>

                  <button
                    onClick={() => setShowAIModal(true)}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/50 text-indigo-300 font-bold text-sm transform hover:-translate-y-0.5 transition-all"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Practice vs Stockfish</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Modes 3-Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div
                onClick={() => setActiveTab('puzzles')}
                className="p-5 bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl cursor-pointer group transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Flame className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Daily Tactical Puzzles</h3>
                <p className="text-xs text-slate-400">Sharpen tactical vision, build streaks and climb puzzle ELO.</p>
              </div>

              <div
                onClick={() => setActiveTab('tournaments')}
                className="p-5 bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl cursor-pointer group transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Live Arena Tournaments</h3>
                <p className="text-xs text-slate-400">Knockout brackets, Swiss systems and podium trophies.</p>
              </div>

              <div
                onClick={() => setActiveTab('lessons')}
                className="p-5 bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl cursor-pointer group transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Interactive Lessons</h3>
                <p className="text-xs text-slate-400">Master piece maneuvers, golden openings and checkmate nets.</p>
              </div>
            </div>
          </div>
        )}

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
        {activeTab === 'lessons' && (
          <LessonView onBack={() => setActiveTab('home')} />
        )}

        {/* Tournaments Tab */}
        {activeTab === 'tournaments' && (
          <TournamentView currentUser={currentUser} />
        )}

        {/* Leaderboards Tab */}
        {activeTab === 'leaderboard' && (
          <LeaderboardView currentUser={currentUser} />
        )}

        {/* Admin Dashboard Tab */}
        {activeTab === 'admin' && <AdminView />}
      </main>

      {/* Floating Bottom Navigation for Mobile */}
      <footer className="md:hidden sticky bottom-0 z-40 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 px-2 py-2 flex items-center justify-around">
        {[
          { id: 'home', label: 'Play', icon: Swords },
          { id: 'puzzles', label: 'Puzzles', icon: Flame },
          { id: 'lessons', label: 'Learn', icon: BookOpen },
          { id: 'tournaments', label: 'Tournaments', icon: Trophy },
          { id: 'leaderboard', label: 'Rankings', icon: Shield }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold ${
                activeTab === tab.id ? 'text-amber-400' : 'text-slate-400'
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
        onAuthSuccess={user => setCurrentUser(user)}
      />

      <ProfileModal
        isOpen={showProfileModal}
        user={currentUser}
        onClose={() => setShowProfileModal(false)}
        onUpdateUser={user => setCurrentUser(user)}
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
