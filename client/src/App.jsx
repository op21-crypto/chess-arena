import React, { useState, useEffect, useRef, useMemo } from 'react';
import { io } from 'socket.io-client';
import { Chess } from 'chess.js';
import {
  Home, Trophy, Swords, Users, BookOpen, Bot, Shield, Volume2, VolumeX,
  Palette, User, LogOut, Bell, Flame, Sparkles, ChevronRight, Settings, Music, Zap, ArrowRight,
  LogIn, X, Clock, Mic, Smartphone, GraduationCap, Puzzle, CircleUserRound, Sun, Moon, Copy
} from 'lucide-react';

import { Chessboard } from './components/Chessboard.jsx';
import { PlayerCard } from './components/PlayerCard.jsx';
import { GameControls } from './components/GameControls.jsx';
import { GameChat } from './components/GameChat.jsx';
import { WaitingLounge } from './components/WaitingLounge.jsx';
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
import { NotificationsDropdown } from './components/NotificationsDropdown.jsx';
import { MiniMusicPlayer } from './components/MiniMusicPlayer.jsx';
import { InGameDesignModal } from './components/InGameDesignModal.jsx';
import { AIBattleCard } from './components/AIBattleCard.jsx';
import { ChessLogo } from './components/ChessLogo.jsx';
import { BOARD_THEMES } from './components/PieceIcons.jsx';
import { getRandomAnimeOpponent, ANIME_AI_ROSTER } from './data/animeOpponents.js';
import { sound } from './utils/audio.js';
import { musicEngine } from './utils/music.js';
import { triggerHaptic, speakMove } from './utils/device.js';
import { tts } from './utils/universalTTS.js';
import { getOpeningName } from './utils/openings.js';
import { safeStorage } from './utils/storage.js';
import { getLocalAIMove, getAIMoveAsync, getCapturedPieces } from './utils/aiEngine.js';
import { calculateUserRanking } from './data/leaderboardData.js';
import { calculateEloDelta, getFormatFromTimeControl } from './utils/elo.js';
import { getStreakInfo } from './utils/streak.js';
import { firebaseRoomService } from './services/firebaseRoomService.js';
import { getRandomAnimeAvatar, FAMOUS_AVATARS } from './data/avatarData.js';

export const DEFAULT_APP_AVATAR = FAMOUS_AVATARS[0]?.url || 'https://api.dicebear.com/7.x/adventurer/svg?seed=LuffyGear5&radius=50';
import {
  processAppOpenNotifications,
  generateRandomChallenge,
  getInitialNotifications,
  addFriendPermanently,
  getDismissedNotifications,
  markNotificationDismissed,
  getStoredFriends
} from './utils/socialAutomation.js';

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
  boardTheme: 'greenwich',
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
  { id: 'home', label: 'Play', icon: KnightNavIcon },
  { id: 'lessons', label: 'Learn', icon: GraduationCap },
  { id: 'puzzles', label: 'Puzzle', icon: Puzzle },
  { id: 'profile', label: 'Profile', icon: CircleUserRound }
];

export default function App() {
  // Navigation & View State (4 Primary: Home, Puzzles, Learn, Profile)
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'game' | 'puzzles' | 'lessons' | 'profile' | 'admin'
  const [selectedHomeTime, setSelectedHomeTime] = useState(HOME_TIME_CONTROLS[1]); // Default 3 min Blitz
  const [incomingChallenge, setIncomingChallenge] = useState(null);
  const [globalConfig, setGlobalConfig] = useState(() => {
    try {
      const cached = safeStorage.getItem('chess_arena_global_config');
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  });

  const isButtonVisible = (btnKey, defaultValue = true) => {
    if (!globalConfig?.buttons) return defaultValue;
    return globalConfig.buttons[btnKey] !== false;
  };

  const getButtonLabel = (key, fallback) => {
    return globalConfig?.buttonLabels?.[key] || fallback;
  };
  const [settings, setSettings] = useState(() => {
    try {
      const saved = safeStorage.getItem('chess_arena_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Sanitize legacy amoled board theme to Greenwich tournament standard
        if (parsed.boardTheme === 'amoled') {
          parsed.boardTheme = 'greenwich';
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
    return { ...DEFAULT_SETTINGS, boardTheme: 'greenwich', appTheme: 'system', musicEnabled: true };
  });

  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    try {
      safeStorage.setItem('chess_arena_settings', JSON.stringify(newSettings));
    } catch (e) {}
  };

  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Authentication State with rock-solid, permanent avatar stability
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = safeStorage.getItem('chess_arena_user');
      const savedAvatar = safeStorage.getItem('chess_arena_selected_avatar');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) {
          // If user already has an avatar or selected avatar, preserve it permanently!
          if (savedAvatar) {
            parsed.avatar = savedAvatar;
          } else if (!parsed.avatar || parsed.avatar.includes('seed=Guest_') || parsed.avatar.includes('seed=Player') || parsed.avatar.includes('bottts')) {
            parsed.avatar = DEFAULT_APP_AVATAR;
            safeStorage.setItem('chess_arena_selected_avatar', DEFAULT_APP_AVATAR);
          } else {
            safeStorage.setItem('chess_arena_selected_avatar', parsed.avatar);
          }
          return parsed;
        }
      }
      // If no saved user exists on initial visit, establish stable persistent guest user ONCE
      const initialChosen = safeStorage.getItem('chess_arena_initial_elo_chosen');
      const baseElo = initialChosen ? (parseInt(initialChosen, 10) || 1200) : 1200;
      const guestNum = Math.floor(1000 + Math.random() * 9000);
      const chosenAvatar = savedAvatar || DEFAULT_APP_AVATAR;
      const initialGuest = {
        id: `guest_${Date.now()}_${guestNum}`,
        username: `Guest_${guestNum}`,
        role: 'guest',
        elo: baseElo,
        initialElo: baseElo,
        initialEloSelected: Boolean(initialChosen),
        ratings: { bullet: baseElo, blitz: baseElo, rapid: baseElo, classical: baseElo },
        country: 'IN',
        countryName: 'India',
        countryFlag: '🇮🇳',
        avatar: chosenAvatar
      };
      safeStorage.setItem('chess_arena_user', JSON.stringify(initialGuest));
      safeStorage.setItem('chess_arena_selected_avatar', chosenAvatar);
      safeStorage.setItem('token', `mock_guest_token_${Date.now()}`);
      return initialGuest;
    } catch (e) {
      return null;
    }
  });
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
    try {
      const saved = safeStorage.getItem('chess_arena_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) {
          const savedAvatar = safeStorage.getItem('chess_arena_selected_avatar');
          if (savedAvatar) {
            parsed.avatar = savedAvatar;
          } else if (!parsed.avatar || parsed.avatar.includes('seed=Guest_') || parsed.avatar.includes('seed=Player') || parsed.avatar.includes('bottts')) {
            parsed.avatar = DEFAULT_APP_AVATAR;
            safeStorage.setItem('chess_arena_selected_avatar', DEFAULT_APP_AVATAR);
          }
          setCurrentUser(parsed);
          return parsed;
        }
      }
    } catch (e) {}
    const initialChosen = safeStorage.getItem('chess_arena_initial_elo_chosen');
    const baseElo = initialChosen ? (parseInt(initialChosen, 10) || 1200) : 1200;
    const chosenAvatar = safeStorage.getItem('chess_arena_selected_avatar') || DEFAULT_APP_AVATAR;
    const guestNum = Math.floor(1000 + Math.random() * 9000);
    const guest = {
      id: `guest_${Date.now()}_${guestNum}`,
      username: `Guest_${guestNum}`,
      role: 'guest',
      elo: baseElo,
      initialElo: baseElo,
      initialEloSelected: Boolean(initialChosen),
      ratings: { bullet: baseElo, blitz: baseElo, rapid: baseElo, classical: baseElo },
      country: 'IN',
      countryName: 'India',
      countryFlag: '🇮🇳',
      avatar: chosenAvatar
    };
    setCurrentUser(guest);
    safeStorage.setItem('chess_arena_user', JSON.stringify(guest));
    safeStorage.setItem('chess_arena_selected_avatar', chosenAvatar);
    safeStorage.setItem('token', `mock_guest_token_${Date.now()}`);
    return guest;
  };

  // Modals for Match Launching
  const [showMatchmakingModal, setShowMatchmakingModal] = useState(false);
  const [isSearchingMatch, setIsSearchingMatch] = useState(false);
  const [showFriendRoomModal, setShowFriendRoomModal] = useState(false);
  const [friendRoomTab, setFriendRoomTab] = useState('friends');
  const [createdRoomInfo, setCreatedRoomInfo] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [analysisGame, setAnalysisGame] = useState(null);
  const [showGameOverModal, setShowGameOverModal] = useState(false);

  // Dynamic live fluctuating online players and arena telemetry
  const [liveOnlineCount, setLiveOnlineCount] = useState(() => {
    try {
      const saved = safeStorage.getItem('chess_arena_live_online_count');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 5000) return parsed;
      }
    } catch {}
    return 12023; // Baseline realistic starting counter: 12,023
  });
  const [avgPairingTime, setAvgPairingTime] = useState('1.1s');
  const [activeBattlesCount, setActiveBattlesCount] = useState(() => Math.round(12023 * 0.24));

  // Signal Android native container that web app has mounted and is ready
  useEffect(() => {
    try {
      if (window.AndroidBridge && typeof window.AndroidBridge.onAppReady === 'function') {
        window.AndroidBridge.onAppReady();
      }
      if (window.AndroidTTS && typeof window.AndroidTTS.onAppReady === 'function') {
        window.AndroidTTS.onAppReady();
      }
    } catch {}
  }, []);

  useEffect(() => {
    // Dynamic periodic fluctuations every 3.5 seconds
    const interval = setInterval(() => {
      setLiveOnlineCount(prev => {
        // Natural progression through realistic traffic waves (12,023 -> 12,272 -> ... up to 146,526)
        const isSurge = Math.random() < 0.12;
        let delta = 0;
        if (isSurge) {
          // Surge up or down by 80-250
          delta = (Math.random() > 0.42 ? 1 : -1) * (Math.floor(Math.random() * 200) + 80);
        } else {
          // Micro fluctuations (-12 to +28)
          delta = Math.floor(Math.random() * 41) - 13;
        }

        let next = prev + delta;
        if (next < 11800) next = 12023 + Math.floor(Math.random() * 180);
        if (next > 155000) next = 146526 - Math.floor(Math.random() * 800);

        try {
          safeStorage.setItem('chess_arena_live_online_count', String(next));
        } catch {}

        setActiveBattlesCount(Math.round(next * 0.24));

        // Periodically update pairing time slightly
        const times = ['0.8s', '0.9s', '1.0s', '1.1s', '1.2s', '1.3s'];
        setAvgPairingTime(times[Math.floor(Math.random() * times.length)]);

        return next;
      });
    }, 3600);

    return () => clearInterval(interval);
  }, []);

  // Notifications State & Handlers
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    try {
      const isSeeded = safeStorage.getItem('chess_arena_initial_notifs_seeded_v3') === 'true';
      const saved = safeStorage.getItem('chess_arena_notifications_v3');
      const dismissed = new Set(getDismissedNotifications());
      const friends = getStoredFriends();
      const friendUsernames = new Set(friends.map(f => f.username?.toLowerCase()));

      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.filter(n => {
          if (!n || dismissed.has(n.id)) return false;
          const lowerName = n.fromUser?.username?.toLowerCase();
          if (lowerName && dismissed.has(`user_${lowerName}`)) return false;
          if (n.type === 'friend_request' && lowerName && friendUsernames.has(lowerName)) return false;
          return true;
        });
      }
      if (!isSeeded) {
        safeStorage.setItem('chess_arena_initial_notifs_seeded_v3', 'true');
        const initial = getInitialNotifications();
        safeStorage.setItem('chess_arena_notifications_v3', JSON.stringify(initial));
        return initial;
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      safeStorage.setItem('chess_arena_notifications_v3', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  // App open notifications engine: delivers initial notifications on 1st open (exactly once),
  // and subsequent notifications ONLY after 5-7 app opens AND several hours have elapsed
  useEffect(() => {
    setNotifications(prev => processAppOpenNotifications(prev));
  }, []);

  const handleAcceptNotificationChallenge = (notif) => {
    setShowNotifications(false);
    markNotificationDismissed(notif);
    setNotifications(prev => prev.filter(n => n.id !== notif.id));
    sound.playMatchStart();
    triggerHaptic('move');

    const challenger = notif.fromUser || notif.from || {};
    const baseMinutes = notif.config?.timeControl?.baseMinutes || 5;

    // Appropriate level based on challenger's elo
    const elo = Number(challenger.elo) || 1600;
    let level = 2;
    if (elo >= 2500) level = 5;
    else if (elo >= 2000) level = 4;
    else if (elo >= 1500) level = 3;
    else if (elo >= 1000) level = 2;
    else level = 1;

    // Start game directly with this exact challenger!
    handleStartAIGame(level, baseMinutes, 'random', challenger);
  };

  const handleDeclineNotificationChallenge = (id) => {
    const target = notifications.find(n => n.id === id);
    markNotificationDismissed(target || id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    sound.playClick();
  };

  const handleAcceptNotificationFriendRequest = (notif) => {
    markNotificationDismissed(notif);
    setNotifications(prev => prev.filter(n => n.id !== notif.id));
    sound.playMove();
    triggerHaptic('move');
    if (notif.fromUser) {
      addFriendPermanently(notif.fromUser);
    }
    const token = safeStorage.getItem('token');
    fetch('/api/friends/respond', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`
      },
      body: JSON.stringify({
        fromUserId: notif.fromUser?.id,
        fromUsername: notif.fromUser?.username,
        targetUsername: currentUser?.username,
        accept: true
      })
    }).catch(() => {});
  };

  const handleDeclineNotificationFriendRequest = (id) => {
    const target = notifications.find(n => n.id === id);
    markNotificationDismissed(target || id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    sound.playClick();
    const token = safeStorage.getItem('token');
    fetch('/api/friends/respond', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`
      },
      body: JSON.stringify({
        fromUserId: target?.fromUser?.id,
        fromUsername: target?.fromUser?.username,
        targetUsername: currentUser?.username,
        accept: false
      })
    }).catch(() => {});
  };

  // Remote notifications synchronization (delivers genuine friend requests across users & devices via Firestore)
  useEffect(() => {
    const userToSync = currentUser?.username;
    if (!userToSync) return;

    let isMounted = true;
    const fetchRemoteNotifs = async () => {
      try {
        const token = safeStorage.getItem('token') || '';
        const res = await fetch(`/api/notifications?username=${encodeURIComponent(userToSync)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data?.notifications && Array.isArray(data.notifications) && data.notifications.length > 0) {
          const dismissedRaw = safeStorage.getItem('chess_arena_dismissed_notifications_v3');
          let dismissedSet = new Set();
          try {
            if (dismissedRaw) dismissedSet = new Set(JSON.parse(dismissedRaw));
          } catch {}

          setNotifications(prev => {
            const existingIds = new Set(prev.map(n => n.id));
            const fresh = data.notifications.filter(n => !existingIds.has(n.id) && !dismissedSet.has(n.id));
            if (fresh.length === 0) return prev;
            return [...fresh, ...prev];
          });
        }
      } catch {}
    };

    fetchRemoteNotifs();
    const syncInterval = setInterval(fetchRemoteNotifs, 8000);
    return () => {
      isMounted = false;
      clearInterval(syncInterval);
    };
  }, [currentUser?.username]);

  // Active Game State
  const [gameSession, setGameSession] = useState(null); // Full gameState from server
  const [playerColor, setPlayerColor] = useState('w'); // 'w' | 'b' | 'spectator'
  const [boardFlipped, setBoardFlipped] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [opponentIsTyping, setOpponentIsTyping] = useState(false);
  const [isAIGame, setIsAIGame] = useState(false);
  const [aiLevel, setAiLevel] = useState(2);
  const [aiThinking, setAiThinking] = useState(false);
  const [currentAIOpponent, setCurrentAIOpponent] = useState(null);
  const [inGameNotice, setInGameNotice] = useState(null);
  const [showInGameDesignModal, setShowInGameDesignModal] = useState(false);
  const [voiceCallTrigger, setVoiceCallTrigger] = useState(0);

  // Handle native Android hardware back button (placed safely after all modal & view states are initialized)
  useEffect(() => {
    window.__onAndroidBackPressed = () => {
      // 1. Close open modals in priority order
      if (showGameOverModal) { setShowGameOverModal(false); return true; }
      if (showInGameDesignModal) { setShowInGameDesignModal(false); return true; }
      if (showSettingsModal) { setShowSettingsModal(false); return true; }
      if (showProfileModal) { setShowProfileModal(false); return true; }
      if (showNotifications) { setShowNotifications(false); return true; }
      if (showStreakModal) { setShowStreakModal(false); return true; }
      if (showAuthModal) { setShowAuthModal(false); return true; }
      if (showFriendRoomModal) { setShowFriendRoomModal(false); return true; }
      if (showMatchmakingModal) { setShowMatchmakingModal(false); return true; }
      if (showAIModal) { setShowAIModal(false); return true; }
      if (inGameNotice) { setInGameNotice(null); return true; }
      if (incomingChallenge) { setIncomingChallenge(null); return true; }

      // 2. If in sub-view / sub-tab, return to home lobby
      if (activeTab !== 'home') {
        setActiveTab('home');
        return true;
      }

      // 3. Otherwise let Android handle standard back (minimize/exit)
      return false;
    };
    return () => {
      delete window.__onAndroidBackPressed;
    };
  }, [
    showGameOverModal, showInGameDesignModal, showSettingsModal, showProfileModal,
    showNotifications, showStreakModal, showAuthModal, showFriendRoomModal,
    showMatchmakingModal, showAIModal, inGameNotice, incomingChallenge, activeTab
  ]);

  // Match rating and stats tracking reference (prevents duplicate calculation)
  const processedMatchIdsRef = useRef(new Set());

  const handleMatchFinished = ({ winner, status, winReason, currentSession }) => {
    const session = currentSession || gameSession;
    if (!session) return;
    const matchId = session.id || `${session.fen}_${session.moveHistory?.length || 0}_${status}`;
    if (processedMatchIdsRef.current.has(matchId)) {
      return;
    }
    processedMatchIdsRef.current.add(matchId);

    const isWhite = playerColor === 'w';
    const isWinner = (winner === 'white' && isWhite) || (winner === 'black' && !isWhite);
    const isDraw = winner === 'draw' || winner === null || status === 'stalemate' || status === 'draw';
    const isDefeat = !isWinner && !isDraw;
    const resultType = isWinner ? 'win' : (isDefeat ? 'loss' : 'draw');

    const format = getFormatFromTimeControl(session.timeControl);
    const user = currentUser || getOrCreateUser();
    const userCurrentElo = user.ratings?.[format] || user.elo || 1200;

    let oppElo = 1200;
    if (isAIGame) {
      oppElo = currentAIOpponent?.elo || (700 + (aiLevel || 1) * 180);
    } else {
      const opp = isWhite ? session.blackPlayer : session.whitePlayer;
      oppElo = opp?.ratings?.[format] || opp?.elo || 1200;
    }

    const delta = calculateEloDelta(userCurrentElo, oppElo, resultType);
    const newElo = Math.max(100, userCurrentElo + delta);

    const currentStats = user.stats || { played: 0, won: 0, lost: 0, drawn: 0, winStreak: 0 };
    const updatedStats = {
      played: (currentStats.played || 0) + 1,
      won: (currentStats.won || 0) + (isWinner ? 1 : 0),
      lost: (currentStats.lost || 0) + (isDefeat ? 1 : 0),
      drawn: (currentStats.drawn || 0) + (isDraw ? 1 : 0),
      winStreak: isWinner ? ((currentStats.winStreak || 0) + 1) : 0
    };

    const baseRatings = {
      bullet: 1200,
      blitz: 1200,
      rapid: 1200,
      classical: 1200,
      puzzle: 1200,
      ...(user.ratings || {})
    };
    baseRatings[format] = newElo;
    if (format === 'rapid') {
      baseRatings.rapid = newElo;
    }
    const updatedRatings = baseRatings;

    const updatedUser = {
      ...user,
      elo: newElo,
      ratings: updatedRatings,
      stats: updatedStats
    };

    setCurrentUser(updatedUser);
    safeStorage.setItem('chess_arena_user', JSON.stringify(updatedUser));
    safeStorage.setItem('chess_arena_user_profile', JSON.stringify(updatedUser));

    const userEloChange = delta;
    const oppEloChange = -delta;
    const whiteEloChange = isWhite ? userEloChange : oppEloChange;
    const blackEloChange = isWhite ? oppEloChange : userEloChange;

    setGameSession(prev => prev ? {
      ...prev,
      isGameOver: true,
      status,
      winner,
      winReason,
      whiteEloChange,
      blackEloChange
    } : null);

    // Keep streak alive and updated
    getStreakInfo();

    if (user?.id) {
      fetch(`/api/users/${user.id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${safeStorage.getItem('token')}`
        },
        body: JSON.stringify({
          elo: newElo,
          ratings: updatedRatings,
          stats: updatedStats
        })
      }).catch(() => {});
    }
  };

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
    try {
      tts.stop();
    } catch (e) {}
  }, [activeTab]);

  useEffect(() => {
    // 0. Fetch global server configuration & defaults
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data?.config) {
          setGlobalConfig(data.config);
          safeStorage.setItem('chess_arena_global_config', JSON.stringify(data.config));
          // If user hasn't explicitly set preferences, seed with global admin defaults
          const saved = safeStorage.getItem('chess_arena_settings');
          if (!saved) {
            setSettings(prev => ({
              ...prev,
              appTheme: data.config.defaultTheme || 'system',
              boardTheme: data.config.defaultBoardTheme || (Math.random() < 0.5 ? 'gold' : 'emerald'),
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

    // Real-Time Global App Config Sync from Admin
    socket.on('app_config_updated', (updatedConfig) => {
      if (updatedConfig) {
        setGlobalConfig(updatedConfig);
        try {
          safeStorage.setItem('chess_arena_global_config', JSON.stringify(updatedConfig));
        } catch {}
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
      setNotifications(prev => [
        {
          id: data.challengeId || `chal_${Date.now()}`,
          type: 'challenge',
          fromUser: {
            id: data.from?.id,
            username: data.from?.username,
            avatar: data.from?.avatar,
            elo: data.from?.rating || data.from?.elo || 1200,
            country: data.from?.country || 'UN',
            title: data.from?.title || 'Challenger'
          },
          message: `Challenged you to a ${data.config?.timeControl?.baseMinutes || 5}-minute match! ⚔️`,
          time: 'Just now',
          config: data.config
        },
        ...prev
      ]);
    });

    socket.on('challenge_accepted', (data) => {
      setShowFriendRoomModal(false);
      setIncomingChallenge(null);
      if (data?.gameId) {
        socket.emit('join_game', { gameId: data.gameId });
        setPlayerColor(data.side || 'b');
        setActiveTab('game');
        sound.playMatchStart();
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

      // Sounds, Haptics & Voice Commentary for Opponent's Move
      const lastMoveObj = data.moveHistory?.[data.moveHistory.length - 1];
      if (lastMoveObj) {
        const isOpponentMove = lastMoveObj.color !== playerColor;
        if (isOpponentMove) {
          if (data.inCheck || lastMoveObj.san?.includes('+')) {
            sound.playCheck();
            triggerHaptic('check');
          } else if (lastMoveObj.san?.includes('x') || lastMoveObj.captured) {
            sound.playCapture();
            triggerHaptic('capture');
          } else if (lastMoveObj.san?.includes('O-O')) {
            sound.playCastle();
            triggerHaptic('move');
          } else {
            sound.playMove();
            triggerHaptic('move');
          }
        }

        if (settings.voiceCommentary) {
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
      handleMatchFinished({
        winner: data.winner,
        status: data.status,
        winReason: data.winReason
      });

      setShowGameOverModal(true);

      const isWinner = (data.winner === 'white' && playerColor === 'w') || (data.winner === 'black' && playerColor === 'b');
      if (isWinner) {
        sound.playVictory();
      } else {
        sound.playGameOver();
      }
    });

    socket.on('new_chat_message', (msg) => {
      setChatMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        if (msg.sender?.id !== currentUser?.id && msg.sender?.username !== currentUser?.username) {
          sound.playChat();
        }
        return [...prev, msg];
      });
    });

    socket.on('game_chat_typing', ({ user, isTyping }) => {
      if (user?.id !== currentUser?.id && user?.username !== currentUser?.username) {
        setOpponentIsTyping(Boolean(isTyping));
      }
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
      // Join in Firestore first for instant real-time synchronization
      firebaseRoomService.joinRoom(roomParam, activeUser).then(room => {
        if (room) {
          setGameSession(room);
          const isWhite = room.whitePlayer?.id === activeUser.id;
          setPlayerColor(isWhite ? 'w' : 'b');
          setActiveTab('game');
          sound.playMatchStart();
        }
      }).catch(() => {});

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
            sound.playMatchStart();
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

  // Room synchronization (Real-time Firestore Push + HTTP Polling Fallback)
  useEffect(() => {
    if (!gameSession?.id || isAIGame) return;

    const handleRoomData = (r) => {
      if (!r) return;
      const movesDiffer = (r.moveHistory?.length || 0) !== (gameSession.moveHistory?.length || 0);
      const fenDiffers = r.fen && r.fen !== gameSession.fen;
      const statusDiffers = r.status && r.status !== gameSession.status;
      const opponentJoined = (gameSession.status === 'waiting' && r.status === 'active') ||
        (!gameSession.blackPlayer && r.blackPlayer) ||
        (!gameSession.whitePlayer && r.whitePlayer);

      // Play match start sound when friend enters room!
      if (opponentJoined) {
        sound.playMatchStart();
      }

      // Synchronize room chat messages
      if (Array.isArray(r.chatMessages) && r.chatMessages.length > 0) {
        setChatMessages(prev => {
          const prevIds = new Set(prev.map(m => m.id));
          const newIncoming = r.chatMessages.filter(m => !prevIds.has(m.id));
          if (newIncoming.length > 0) {
            const fromOpponent = newIncoming.some(
              m => m.sender?.id !== currentUser?.id && m.sender?.username !== currentUser?.username
            );
            if (fromOpponent) {
              sound.playChat();
            }
            return [...prev, ...newIncoming];
          }
          return prev;
        });
      }

      // Synchronize live opponent typing status
      if (r.typingUsers) {
        const now = Date.now();
        const isTyping = Object.values(r.typingUsers).some(u => {
          const isOther = u.id !== currentUser?.id && u.username !== currentUser?.username;
          return isOther && (now - (u.timestamp || 0) < 3500);
        });
        setOpponentIsTyping(isTyping);
      }

      if (movesDiffer || fenDiffers || statusDiffers || opponentJoined) {
        const captured = getCapturedPieces(r.fen || gameSession.fen);
        setGameSession(prev => ({
          ...prev,
          ...r,
          status: opponentJoined ? 'active' : (r.status || prev?.status),
          turn: new Chess(r.fen || prev?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1').turn(),
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
          const isWinner = (r.winner === 'white' && playerColor === 'w') || (r.winner === 'black' && playerColor === 'b');
          if (isWinner) sound.playVictory();
          else sound.playGameOver();
          handleMatchFinished({
            winner: r.winner,
            status: r.status,
            winReason: r.winReason,
            currentSession: r
          });
        }
      }
    };

    // 1. Primary: Instant Firestore onSnapshot subscription (<50ms)
    const unsubscribe = firebaseRoomService.subscribeToRoom(gameSession.id, handleRoomData);

    // 2. Fallback: Secondary HTTP poll
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/get?id=${gameSession.id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data?.room) {
          handleRoomData(data.room);
        }
      } catch {}
    }, 1500);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [gameSession?.id, gameSession?.fen, gameSession?.moveHistory?.length, gameSession?.status, gameSession?.whitePlayer?.id, gameSession?.blackPlayer?.id, isAIGame, currentUser?.id, currentUser?.username, playerColor]);

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
    // Strictly random 50/50 color allocation for private rooms
    const isWhite = Math.random() > 0.5;
    const baseMinutes = config?.timeControl?.baseMinutes || 10;

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
      chatMessages: [],
      typingUsers: {},
      voiceCall: null,
      voiceSignals: [],
      createdAt: new Date().toISOString()
    };

    // Immediately set createdRoomInfo so the share link is instantly available!
    setCreatedRoomInfo({ roomId, game: initialGame });
    setGameSession(initialGame);
    setPlayerColor(isWhite ? 'w' : 'b');

    // 1. Create in Firestore directly for instant real-time synchronization
    firebaseRoomService.createRoom(initialGame).catch(() => {});

    // 2. Sync room with backend REST endpoint
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
      // 1. Direct real-time Firestore join
      const joinedRoom = await firebaseRoomService.joinRoom(cleanId, activeUser);
      if (joinedRoom) {
        setGameSession(joinedRoom);
        const isWhite = joinedRoom.whitePlayer?.id === activeUser.id;
        setPlayerColor(isWhite ? 'w' : 'b');
        setShowFriendRoomModal(false);
        setShowGameOverModal(false);
        setActiveTab('game');
        sound.playMatchStart();
      }

      // 2. Backend REST join
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
        sound.playMatchStart();
      }
    } catch {
      // Socket fallback
    }

    socketRef.current?.emit('join_room', { roomId: cleanId });
    setShowFriendRoomModal(false);
    setActiveTab('game');
  };

  // Handle AI Practice Matches & Direct Notification Challenges
  const handleStartAIGame = (param1, param2, param3, param4) => {
    let level = 2;
    let timeMinutes = 10;
    let preferredColor = null;
    let customOpponent = null;

    if (typeof param1 === 'object' && param1 !== null) {
      level = Number(param1.level) || 2;
      timeMinutes = param1.timeMinutes !== undefined ? Number(param1.timeMinutes) : 10;
      preferredColor = param1.preferredColor || param1.color || null;
      customOpponent = param1.challenger || param1.customOpponent || null;
    } else {
      if (param1 !== undefined) level = Number(param1) || 2;
      if (param2 !== undefined) timeMinutes = Number(param2);
      if (param3 !== undefined) preferredColor = param3;
      if (param4 !== undefined) customOpponent = param4;
    }

    // Color: if preferredColor is 'w' or 'b', use it; otherwise 50/50 random
    const color = (preferredColor === 'w' || preferredColor === 'b')
      ? preferredColor
      : (Math.random() < 0.5 ? 'w' : 'b');

    // Use custom opponent if provided; otherwise get randomized anime opponent
    const animeBot = customOpponent ? {
      username: customOpponent.username,
      elo: Number(customOpponent.elo) || (700 + level * 200),
      avatar: customOpponent.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${customOpponent.username}`,
      title: customOpponent.title || 'Competitor',
      country: customOpponent.country || 'JP',
      anime: customOpponent.anime || null,
      quote: customOpponent.bio || customOpponent.quote || 'Let\'s play a great chess game!'
    } : getRandomAnimeOpponent(level);

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
    setBoardFlipped(false); // Reset manual flip override: Chessboard auto-orients based on playerColor
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

    // White always plays the 1st move: if AI is White (user is Black), Stockfish plays 1st immediately
    if (color === 'b') {
      setTimeout(() => {
        triggerAIMove(startingSession.fen, startingSession, level);
      }, 350);
    }
  };

  // Local clock interval for AI matches
  useEffect(() => {
    if (!isAIGame || !gameSession || gameSession.isGameOver || gameSession.status === 'waiting') return;
    // Unlimited time / casual mode
    if (gameSession.timeControl?.baseMinutes === 0) return;

    const interval = setInterval(() => {
      setGameSession(prev => {
        if (!prev || prev.isGameOver || prev.status === 'waiting') return prev;
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
          handleMatchFinished({
            winner,
            status: 'timeout',
            winReason: 'timeout',
            currentSession: { ...prev, whiteTime: newWhiteTime, blackTime: newBlackTime }
          });
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
        if (chess.inCheck() || moveRes.san?.includes('+')) {
          sound.playCheck();
          triggerHaptic('check');
        } else if (moveRes.captured) {
          sound.playCapture();
          triggerHaptic('capture');
        } else if (moveRes.san?.includes('O-O')) {
          sound.playCastle();
          triggerHaptic('move');
        } else {
          sound.playMove();
          triggerHaptic('move');
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
          handleMatchFinished({
            winner,
            status,
            winReason,
            currentSession: { ...(session || gameSession), moveHistory: updatedMoves }
          });
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
    if (!gameSession || gameSession.status === 'waiting') return;

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
          handleMatchFinished({
            winner,
            status,
            winReason,
            currentSession: { ...(session || gameSession), moveHistory: updatedMoves }
          });
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
            handleMatchFinished({
              winner,
              status,
              winReason,
              currentSession: { ...gameSession, moveHistory: updatedHistory }
            });
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

          // Sync room moves with Firestore and REST
          if (gameSession.id) {
            firebaseRoomService.updateRoomMove(gameSession.id, {
              move: {
                from: res.from,
                to: res.to,
                piece: res.piece,
                color: res.color,
                san: res.san,
                fen: chess.fen()
              },
              fen: chess.fen(),
              turn: chess.turn(),
              status: isOver ? status : 'active',
              winner: isOver ? winner : null,
              winReason: isOver ? winReason : null,
              whiteTime: gameSession.whiteTime,
              blackTime: gameSession.blackTime,
              capturedPieces: { white: captured.byWhite, black: captured.byBlack }
            }).catch(() => {});

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
    const oppWinner = playerColor === 'w' ? 'black' : 'white';
    if (isAIGame) {
      setGameSession(prev => ({
        ...prev,
        isGameOver: true,
        status: 'resigned',
        winner: oppWinner,
        winReason: 'resignation'
      }));
      setShowGameOverModal(true);
      sound.playGameOver();
      handleMatchFinished({
        winner: oppWinner,
        status: 'resigned',
        winReason: 'resignation'
      });
    } else {
      if (gameSession?.id) {
        firebaseRoomService.updateRoomMove(gameSession.id, {
          status: 'resigned',
          winner: oppWinner,
          winReason: 'resignation'
        }).catch(() => {});

        fetch('/api/rooms/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: gameSession.id,
            status: 'resigned',
            winner: oppWinner,
            winReason: 'resignation'
          })
        }).catch(() => {});
      }
      socketRef.current?.emit('resign_game', { gameId: gameSession?.id });
      setGameSession(prev => prev ? ({
        ...prev,
        isGameOver: true,
        status: 'resigned',
        winner: oppWinner,
        winReason: 'resignation'
      }) : null);
      setShowGameOverModal(true);
      sound.playGameOver();
      handleMatchFinished({
        winner: oppWinner,
        status: 'resigned',
        winReason: 'resignation'
      });
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
        handleMatchFinished({
          winner: null,
          status: 'draw',
          winReason: 'agreement'
        });
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
      handleStartAIGame({ level: aiLevel });
    } else {
      socketRef.current?.emit('request_rematch', { gameId: gameSession.id });
    }
  };

  const handleSendMessage = ({ text, emoji }) => {
    if (!text && !emoji) return;

    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender: currentUser || { id: 'me', username: 'You' },
      text,
      emoji,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // 1. Optimistic instant display in chat
    setChatMessages(prev => {
      if (prev.some(m => m.id === newMsg.id)) return prev;
      return [...prev, newMsg];
    });
    sound.playChat();

    // 2. Emit to WebSocket if live
    if (socketRef.current && gameSession?.id) {
      socketRef.current.emit('send_chat_message', {
        gameId: gameSession.id,
        text,
        emoji,
        sender: currentUser
      });
    }

    // 3. Persist and broadcast via Firestore & HTTP room endpoint for resilient delivery
    if (gameSession?.id) {
      firebaseRoomService.sendRoomChat(gameSession.id, newMsg).catch(() => {});
      fetch('/api/rooms/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: gameSession.id,
          text,
          emoji,
          sender: currentUser
        })
      }).catch(() => {});
    }
  };

  const handleSendTyping = (isTyping) => {
    if (socketRef.current && gameSession?.id) {
      socketRef.current.emit('game_chat_typing', {
        gameId: gameSession.id,
        user: currentUser,
        isTyping
      });
    }
    if (gameSession?.id) {
      firebaseRoomService.sendRoomTyping(gameSession.id, currentUser, isTyping).catch(() => {});
      fetch('/api/rooms/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: gameSession.id,
          user: currentUser,
          isTyping
        })
      }).catch(() => {});
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
            <ChessLogo size="md" isLight={isLight} showSubtitle={true} customTitle={globalConfig?.brandTitle} />
          </div>

          {/* Navigation Links (Visible on desktop/wide tablet) */}
          <nav className={`hidden lg:flex items-center gap-1 p-1 rounded-2xl border transition-colors ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/80 border-slate-800'
          }`}>
            {[
              ...PRIMARY_NAV_TABS.filter(tab => {
                if (tab.id === 'play' || tab.id === 'home') return isButtonVisible('navPlay');
                if (tab.id === 'lessons') return isButtonVisible('navLearn');
                if (tab.id === 'puzzles') return isButtonVisible('navPuzzle');
                if (tab.id === 'profile') return isButtonVisible('navProfile');
                return true;
              }),
              ...(currentUser?.role === 'admin' || currentUser?.email?.toLowerCase().trim() === 'op21plus@gmail.com' ? [{ id: 'admin', label: 'Admin', icon: Sparkles }] : [])
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
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* 1st Option: Ambient Music Toggle ON/OFF */}
            {isButtonVisible('headerMusic') && (
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
                className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                  settings.musicEnabled
                    ? 'bg-amber-500/20 text-amber-500 border-amber-500/50 shadow-md shadow-amber-500/10 animate-pulse'
                    : isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title={settings.musicEnabled ? `Music ON: ${musicEngine.getCurrentTrack().name}` : 'Music OFF (Muted)'}
                aria-label="Toggle Background Music"
              >
                <Music className="w-4 h-4" />
              </button>
            )}

            {/* 2nd Option: Day / Night Theme One-Click Toggle */}
            {isButtonVisible('headerTheme') && (
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
            )}

            {/* 3rd Option: Friends Option 👥 (Opens Play with Friends Arena) */}
            <button
              onClick={() => {
                sound.playClick();
                triggerHaptic('move');
                setFriendRoomTab('friends');
                setShowFriendRoomModal(true);
              }}
              className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                showFriendRoomModal && friendRoomTab === 'friends'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-amber-600'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-400'
              }`}
              title="Friends Arena • View Friends, Search & Play"
              aria-label="Friends Option"
            >
              <Users className="w-4 h-4" />
            </button>

            {/* 4th Option: Notifications Bell */}
            {isButtonVisible('headerNotifications') && (
              <button
                onClick={() => {
                  sound.playClick();
                  triggerHaptic('move');
                  setShowNotifications(prev => !prev);
                }}
                className={`p-2 rounded-xl border transition-all relative cursor-pointer active:scale-95 ${
                  showNotifications
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-amber-600'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-400'
                }`}
                title="Notifications & Game Challenges"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse shadow-sm">
                    {notifications.length}
                  </span>
                )}
              </button>
            )}

            {/* Custom Header Buttons configured by Admin */}
            {Array.isArray(globalConfig?.customButtons) && globalConfig.customButtons.filter(b => b.enabled !== false && b.location === 'header').map(btn => (
              <button
                key={btn.id}
                onClick={() => {
                  sound.playClick();
                  if (btn.url) window.open(btn.url, '_blank', 'noopener,noreferrer');
                }}
                className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer text-xs font-bold ${
                  isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-amber-300'
                }`}
                title={btn.label}
              >
                <span>{btn.icon || '⭐'}</span>
              </button>
            ))}

            {/* 5th Option: Top-Right Corner Profile Pic (Random Anime Avatar / Selected Avatar) */}
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
              title={`Profile: ${currentUser?.username || 'Player'}`}
              aria-label="View Profile"
            >
              <img
                src={currentUser?.avatar || safeStorage.getItem('chess_arena_selected_avatar') || DEFAULT_APP_AVATAR}
                alt={currentUser?.username || 'Player'}
                className="w-8 h-8 rounded-full object-cover bg-amber-500/20 shadow-xs"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_APP_AVATAR;
                }}
              />
              {(currentUser?.role === 'admin' || currentUser?.email?.toLowerCase().trim() === 'op21plus@gmail.com') && (
                <span
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 border border-slate-950 rounded-full flex items-center justify-center text-[8px] shadow-sm leading-none"
                  title="Arena Admin"
                >
                  👑
                </span>
              )}
            </button>
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
              {isButtonVisible('homeTelemetryBanner') && (
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
                    <span className={`font-extrabold font-mono transition-all duration-300 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {liveOnlineCount.toLocaleString()}
                    </span>
                    <span className={isLight ? 'text-slate-500 font-medium' : 'text-slate-400 font-medium'}>Players Online</span>
                  </div>
                  <div className={`hidden sm:flex items-center gap-2 font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <span className="text-amber-500 font-bold font-mono">⚔️ {activeBattlesCount.toLocaleString()}</span>
                    <span>Active Battles</span>
                  </div>
                  <div className={`flex items-center gap-1.5 font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">{avgPairingTime}</span>
                    <span>Avg Pairing</span>
                  </div>
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
                      <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {liveOnlineCount.toLocaleString()}
                      </span>
                      <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>online</span>
                    </div>
                  </div>

                  {/* 4 Game Mode Buttons (Clean, Sleek, Highlighted & Non-Bulky) */}
                  <div className="space-y-3.5 sm:space-y-4 pt-1.5">
                    {/* 1st: Play with Stockfish (AI Bot) */}
                    {isButtonVisible('homePlayAi') && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        triggerHaptic('move');
                        setShowAIModal(true);
                      }}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.985] group cursor-pointer relative overflow-hidden ${
                        isLight
                          ? 'bg-gradient-to-r from-indigo-50/90 via-white to-purple-50/70 hover:from-indigo-100/90 hover:to-purple-100/80 border-2 border-indigo-200/90 hover:border-indigo-400 shadow-sm hover:shadow-md'
                          : 'bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-purple-950/50 hover:from-indigo-900/80 hover:via-purple-900/60 hover:to-indigo-850/80 border border-indigo-500/35 hover:border-indigo-400/70 shadow-md shadow-indigo-950/30'
                      }`}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/25 transition-all duration-300" />
                      <div className="flex items-center justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                          {/* Stockfish AI Neural Bot Avatar */}
                          <div className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-300 relative shadow-xs overflow-hidden ${
                            isLight
                              ? 'bg-gradient-to-br from-indigo-100 via-white to-purple-100 border-indigo-200 group-hover:border-indigo-400'
                              : 'bg-gradient-to-br from-indigo-900/80 via-slate-950 to-purple-950/90 border-indigo-400/50 group-hover:border-indigo-300'
                          }`}>
                            <Bot className={`w-6 h-6 transition-colors ${
                              isLight
                                ? 'text-indigo-600 group-hover:text-indigo-700'
                                : 'text-indigo-300 drop-shadow-[0_0_8px_rgba(99,102,241,0.7)] group-hover:text-indigo-200'
                            }`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                              <h3 className={`text-base sm:text-lg font-black tracking-tight transition-colors leading-tight ${
                                isLight
                                  ? 'text-slate-900 group-hover:text-indigo-700'
                                  : 'text-white group-hover:text-indigo-200'
                              }`}>
                                {getButtonLabel('homePlayAi', 'Play with Stockfish')}
                              </h3>
                              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] sm:text-[11px] font-black uppercase tracking-wider shrink-0 shadow-xs flex items-center gap-1 ${
                                isLight
                                  ? 'bg-indigo-100 text-indigo-800 border-indigo-300 shadow-indigo-100'
                                  : 'bg-indigo-500/25 text-indigo-300 border-indigo-400/40 shadow-indigo-950/50'
                              }`}>
                                <span>AI BOT</span>
                                <span className="text-xs">🤖</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ${
                          isLight ? 'text-indigo-600' : 'text-indigo-400'
                        }`} />
                      </div>
                    </button>
                    )}

                    {/* 2nd: Play with Friends (Chat & Voice) */}
                    {isButtonVisible('homePlayFriends') && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        triggerHaptic('move');
                        setFriendRoomTab('room');
                        setShowFriendRoomModal(true);
                      }}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.985] group cursor-pointer relative overflow-hidden ${
                        isLight
                          ? 'bg-gradient-to-r from-emerald-50/90 via-white to-teal-50/70 hover:from-emerald-100/90 hover:to-teal-100/80 border-2 border-emerald-200/90 hover:border-emerald-400 shadow-sm hover:shadow-md'
                          : 'bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-teal-950/50 hover:from-emerald-900/80 hover:via-teal-900/60 hover:to-emerald-850/80 border border-emerald-500/35 hover:border-emerald-400/70 shadow-md shadow-emerald-950/30'
                      }`}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/25 transition-all duration-300" />
                      <div className="flex items-center justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                          {/* Friends & Live Voice Avatar */}
                          <div className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-300 relative shadow-xs overflow-hidden ${
                            isLight
                              ? 'bg-gradient-to-br from-emerald-100 via-white to-teal-100 border-emerald-200 group-hover:border-emerald-400'
                              : 'bg-gradient-to-br from-emerald-900/80 via-slate-950 to-teal-950/90 border-emerald-400/50 group-hover:border-emerald-300'
                          }`}>
                            <div className="relative flex items-center justify-center">
                              <div className="flex items-center -space-x-1">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 border border-emerald-200/50 flex items-center justify-center text-[10px] font-black text-white shadow-xs">
                                  ♔
                                </div>
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-teal-500 to-emerald-700 border border-teal-200/50 flex items-center justify-center text-[10px] font-black text-white shadow-xs">
                                  ♚
                                </div>
                              </div>
                              <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border border-white dark:border-slate-900 flex items-center justify-center text-[7px] text-white">
                                🎙️
                              </span>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                              <h3 className={`text-base sm:text-lg font-black tracking-tight transition-colors leading-tight ${
                                isLight
                                  ? 'text-slate-900 group-hover:text-emerald-700'
                                  : 'text-white group-hover:text-emerald-200'
                              }`}>
                                {getButtonLabel('homePlayFriends', 'Play with Friends')}
                              </h3>
                              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] sm:text-[11px] font-black uppercase tracking-wider shrink-0 shadow-xs flex items-center gap-1 ${
                                isLight
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-emerald-100'
                                  : 'bg-emerald-500/25 text-emerald-300 border-emerald-400/40 shadow-emerald-950/50'
                              }`}>
                                <span>VOICE CHAT</span>
                                <span className="text-xs">🎙️</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ${
                          isLight ? 'text-emerald-600' : 'text-emerald-400'
                        }`} />
                      </div>
                    </button>
                    )}

                    {/* 3rd: Play Online (Rated FIDE) */}
                    {isButtonVisible('homePlayOnline') && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        triggerHaptic('move');
                        setShowMatchmakingModal(true);
                      }}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.985] group cursor-pointer relative overflow-hidden ${
                        isLight
                          ? 'bg-gradient-to-r from-rose-50/90 via-white to-red-50/80 hover:from-rose-100/90 hover:to-red-100/80 border-2 border-rose-200/90 hover:border-rose-400 shadow-sm hover:shadow-md'
                          : 'bg-gradient-to-r from-rose-950/70 via-slate-900/90 to-red-950/50 hover:from-rose-900/80 hover:via-red-900/60 hover:to-rose-850/80 border border-rose-500/35 hover:border-rose-400/70 shadow-md shadow-rose-950/30'
                      }`}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/25 transition-all duration-300" />
                      <div className="flex items-center justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                          {/* Global Arena Crossed Swords Avatar */}
                          <div className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-300 relative shadow-xs overflow-hidden ${
                            isLight
                              ? 'bg-gradient-to-br from-rose-100 via-white to-red-100 border-rose-300 group-hover:border-rose-400'
                              : 'bg-gradient-to-br from-rose-900/80 via-slate-950 to-red-950/90 border-rose-500/50 group-hover:border-rose-300'
                          }`}>
                            <Swords className={`w-6 h-6 group-hover:rotate-12 transition-transform duration-300 ${
                              isLight
                                ? 'text-rose-600'
                                : 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]'
                            }`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                              <h3 className={`text-base sm:text-lg font-black tracking-tight transition-colors leading-tight ${
                                isLight
                                  ? 'text-slate-900 group-hover:text-rose-700'
                                  : 'text-white group-hover:text-rose-200'
                              }`}>
                                {getButtonLabel('homePlayOnline', 'Play Online')}
                              </h3>
                              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] sm:text-[11px] font-black uppercase tracking-wider shrink-0 shadow-xs flex items-center gap-1 ${
                                isLight
                                  ? 'bg-rose-100 text-rose-800 border-rose-300 shadow-rose-100'
                                  : 'bg-rose-500/25 text-rose-300 border-rose-400/40 shadow-rose-950/50'
                              }`}>
                                <span>RATED FIDE</span>
                                <span className="text-xs">⚔️</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ${
                          isLight ? 'text-rose-600' : 'text-rose-400'
                        }`} />
                      </div>
                    </button>
                    )}

                    {/* 4th: Offline Chess Board (Electric Cyan / Ocean Azure) */}
                    {isButtonVisible('homeOfflineBoard') && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        triggerHaptic('move');
                        setActiveTab('offline');
                      }}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.985] group cursor-pointer relative overflow-hidden ${
                        isLight
                          ? 'bg-gradient-to-r from-cyan-50/90 via-white to-sky-50/80 hover:from-cyan-100/90 hover:to-sky-100/80 border-2 border-cyan-200/90 hover:border-cyan-400 shadow-sm hover:shadow-md'
                          : 'bg-gradient-to-r from-cyan-950/70 via-slate-900/90 to-sky-950/50 hover:from-cyan-900/80 hover:via-sky-900/60 hover:to-cyan-850/80 border border-cyan-500/35 hover:border-cyan-400/70 shadow-md shadow-cyan-950/30'
                      }`}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/25 transition-all duration-300" />
                      <div className="flex items-center justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                          {/* 3D Cyan Jewel Chessboard Icon */}
                          <div className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-300 relative shadow-xs overflow-hidden ${
                            isLight
                              ? 'bg-gradient-to-br from-cyan-100 via-white to-sky-100 border-cyan-200 group-hover:border-cyan-400'
                              : 'bg-gradient-to-br from-cyan-900/80 via-slate-950 to-sky-950/90 border-cyan-400/50 group-hover:border-cyan-300'
                          }`}>
                            <svg className="w-8 h-8 drop-shadow-xs transition-transform duration-300 group-hover:scale-110" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <defs>
                                <linearGradient id="boardBaseCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#0891b2" />
                                  <stop offset="60%" stopColor="#0e7490" />
                                  <stop offset="100%" stopColor="#155e75" />
                                </linearGradient>
                                <linearGradient id="cyanBoardTrim" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#a5f3fc" />
                                  <stop offset="50%" stopColor="#38bdf8" />
                                  <stop offset="100%" stopColor="#0284c7" />
                                </linearGradient>
                                <linearGradient id="sqLightCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#ecfeff" />
                                  <stop offset="100%" stopColor="#cffafe" />
                                </linearGradient>
                                <linearGradient id="sqDarkCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#0891b2" />
                                  <stop offset="100%" stopColor="#0e7490" />
                                </linearGradient>
                                <linearGradient id="knightCyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#ffffff" />
                                  <stop offset="40%" stopColor="#67e8f9" />
                                  <stop offset="100%" stopColor="#06b6d4" />
                                </linearGradient>
                                <linearGradient id="kingObsidianCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#334155" />
                                  <stop offset="60%" stopColor="#1e293b" />
                                  <stop offset="100%" stopColor="#0f172a" />
                                </linearGradient>
                              </defs>
                              <rect x="5" y="7" width="54" height="52" rx="7" fill="#0e7490" />
                              <rect x="5" y="5" width="54" height="52" rx="7" fill="url(#boardBaseCyan)" stroke="url(#cyanBoardTrim)" strokeWidth="1.2" />
                              <rect x="9" y="9" width="46" height="44" rx="3.5" fill="#155e75" stroke="#38bdf8" strokeWidth="0.8" />
                              <g transform="translate(10, 10)">
                                <rect x="0" y="0" width="11" height="10.5" fill="url(#sqLightCyan)" rx="1" />
                                <rect x="11" y="0" width="11" height="10.5" fill="url(#sqDarkCyan)" rx="1" />
                                <rect x="22" y="0" width="11" height="10.5" fill="url(#sqLightCyan)" rx="1" />
                                <rect x="33" y="0" width="11" height="10.5" fill="url(#sqDarkCyan)" rx="1" />
                                <rect x="0" y="10.5" width="11" height="10.5" fill="url(#sqDarkCyan)" rx="1" />
                                <rect x="11" y="10.5" width="11" height="10.5" fill="url(#sqLightCyan)" rx="1" />
                                <rect x="22" y="10.5" width="11" height="10.5" fill="url(#sqDarkCyan)" rx="1" />
                                <rect x="33" y="10.5" width="11" height="10.5" fill="url(#sqLightCyan)" rx="1" />
                                <rect x="0" y="21" width="11" height="10.5" fill="url(#sqLightCyan)" rx="1" />
                                <rect x="11" y="21" width="11" height="10.5" fill="url(#sqDarkCyan)" rx="1" />
                                <rect x="22" y="21" width="11" height="10.5" fill="url(#sqLightCyan)" rx="1" />
                                <rect x="33" y="21" width="11" height="10.5" fill="url(#sqDarkCyan)" rx="1" />
                                <rect x="0" y="31.5" width="11" height="10.5" fill="url(#sqDarkCyan)" rx="1" />
                                <rect x="11" y="31.5" width="11" height="10.5" fill="url(#sqLightCyan)" rx="1" />
                                <rect x="22" y="31.5" width="11" height="10.5" fill="url(#sqDarkCyan)" rx="1" />
                                <rect x="33" y="31.5" width="11" height="10.5" fill="url(#sqLightCyan)" rx="1" />
                              </g>
                              <g transform="translate(13, 24)">
                                <path d="M12 2C9.5 2 7 3.5 6 6.5C5.5 8 5.8 10 5 11.5C4.2 13 2.5 14 2 15.5C1.5 17 2.2 18.2 3.5 18.5C5 18.8 6.5 17.5 7 16.5C7.2 18 8 19 9.5 19.5C8.8 20 8 20.8 8 22H16C16 20.5 15.5 18.5 15.5 16.5C16.8 15 17.5 12.8 17.2 10.5C16.8 6 15 2 12 2Z" fill="url(#knightCyanGlow)" stroke="#0e7490" strokeWidth="0.8" />
                                <circle cx="8" cy="8" r="0.9" fill="#0891b2" />
                              </g>
                              <g transform="translate(34, 11)">
                                <path d="M10 3V1H8V3H6V5H8V6H10V5H12V3H10Z" fill="#38bdf8" />
                                <path d="M4 8L5.5 13H12.5L14 8L11 10L9 6.5L7 10L4 8Z" fill="url(#kingObsidianCyan)" stroke="#38bdf8" strokeWidth="0.7" />
                                <rect x="5" y="13" width="8" height="5" rx="1" fill="url(#kingObsidianCyan)" stroke="#0e7490" strokeWidth="0.7" />
                                <rect x="4" y="18" width="10" height="2.5" rx="1.2" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.6" />
                              </g>
                            </svg>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                              <h3 className={`text-base sm:text-lg font-black tracking-tight transition-colors leading-tight ${
                                isLight
                                  ? 'text-slate-900 group-hover:text-cyan-800'
                                  : 'text-white group-hover:text-cyan-200'
                              }`}>
                                {getButtonLabel('homeOfflineBoard', 'Offline Chess Board')}
                              </h3>
                              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] sm:text-[11px] font-black uppercase tracking-wider shrink-0 shadow-xs flex items-center gap-1 ${
                                isLight
                                  ? 'bg-cyan-100 text-cyan-800 border-cyan-300 shadow-cyan-100'
                                  : 'bg-cyan-500/25 text-cyan-300 border-cyan-400/40 shadow-cyan-950/50'
                              }`}>
                                <span>PASS & PLAY</span>
                                <span className="text-xs">👥</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ${
                          isLight ? 'text-cyan-600' : 'text-cyan-400'
                        }`} />
                      </div>
                    </button>
                    )}

                    {/* Dynamic Admin Custom Buttons for Home Area */}
                    {Array.isArray(globalConfig?.customButtons) && globalConfig.customButtons.filter(b => b.enabled && b.location === 'home').map(btn => (
                      <a
                        key={btn.id}
                        href={btn.link || '#'}
                        target={btn.link?.startsWith('http') ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.985] flex items-center justify-between gap-3 shadow-md ${
                          isLight
                            ? 'bg-gradient-to-r from-slate-50 via-white to-slate-100 hover:from-slate-100 hover:to-slate-200 border-slate-200 text-slate-800'
                            : 'bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-850 hover:from-slate-850 hover:to-slate-800 border-slate-800 text-white shadow-slate-950/40'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-xl shrink-0 ${
                            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'
                          }`}>
                            {btn.icon || '⭐'}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-extrabold text-sm sm:text-base truncate">{btn.label}</h3>
                            {btn.link && <p className="text-[11px] opacity-60 truncate max-w-xs">{btn.link}</p>}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 opacity-60 shrink-0" />
                      </a>
                    ))}
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
                    isActive={!gameSession.isGameOver && gameSession.status !== 'waiting'}
                    capturedPieces={isWhite ? gameSession.capturedPieces?.black : gameSession.capturedPieces?.white}
                    opponentCaptured={isWhite ? gameSession.capturedPieces?.white : gameSession.capturedPieces?.black}
                  />
                </div>

                {/* Opening Name Banner (High-contrast, prominent, premium text) */}
                {isButtonVisible('gameOpeningsBanner') && settings.showOpenings && getOpeningName(gameSession.moveHistory) && (
                  <div className={`w-full max-w-[520px] px-4 py-2.5 rounded-2xl border flex items-center justify-between text-sm shadow-md animate-fade-in backdrop-blur-md transition-all ${
                    isLight
                      ? "bg-gradient-to-r from-amber-50/95 via-white to-amber-50/80 border-amber-300/80 text-amber-900 shadow-amber-500/5"
                      : "bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-amber-950/40 border-amber-500/40 text-amber-300 shadow-slate-950/60"
                  }`}>
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
                        isLight ? "bg-amber-100/80 border-amber-300 text-amber-700" : "bg-amber-500/20 border-amber-500/30 text-amber-400"
                      }`}>
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span className={`font-black text-xs sm:text-sm tracking-tight truncate ${
                        isLight ? "text-slate-900" : "text-amber-200"
                      }`}>
                        {getOpeningName(gameSession.moveHistory).name}
                      </span>
                    </div>
                    <span className={`font-mono text-xs px-2.5 py-1 rounded-xl font-black uppercase tracking-wider shrink-0 border shadow-2xs ${
                      isLight
                        ? "bg-amber-100/90 text-amber-900 border-amber-300"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    }`}>
                      {getOpeningName(gameSession.moveHistory).eco}
                    </span>
                  </div>
                )}

                {/* Private Room Waiting Lounge: Animated, engaging UI while friend hasn't joined yet */}
                {gameSession?.status === 'waiting' && (
                  <WaitingLounge
                    isLight={isLight}
                    roomId={gameSession.roomId || createdRoomInfo?.roomId}
                    timeControl={gameSession.timeControl?.baseMinutes || 5}
                    onCopyLink={() => {
                      const shareUrl = `${window.location.origin}/?room=${gameSession.roomId || createdRoomInfo?.roomId}`;
                      if (typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.copyToClipboard === 'function') {
                        window.AndroidBridge.copyToClipboard(shareUrl);
                      } else if (navigator?.clipboard?.writeText) {
                        navigator.clipboard.writeText(shareUrl).catch(() => {});
                      }
                      sound.playClick();
                      triggerHaptic('move');
                    }}
                    onPlayBot={() => {
                      sound.playMatchStart();
                      handleStartAIGame(3, gameSession.timeControl?.baseMinutes || 5, 'w');
                    }}
                    onExit={() => {
                      setGameSession(null);
                      setActiveTab('home');
                      sound.playClick();
                    }}
                  />
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
                    disabled={gameSession.isGameOver || (isAIGame && aiThinking) || (gameSession.status === 'waiting')}
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
                    isActive={!gameSession.isGameOver && gameSession.status !== 'waiting'}
                    capturedPieces={isWhite ? gameSession.capturedPieces?.white : gameSession.capturedPieces?.black}
                    opponentCaptured={isWhite ? gameSession.capturedPieces?.black : gameSession.capturedPieces?.white}
                  />
                </div>
              </div>

              {/* Right Column: Mini Music Player, Game Controls, Live Chat with Embedded Voice Call */}
              <div className="lg:col-span-5 space-y-3 w-full max-w-md mx-auto lg:max-w-none">
                {/* In-Game Mini Ambient Music Player & Settings Bar */}
                {isButtonVisible('gameMiniMusicPlayer') && (
                  <MiniMusicPlayer
                    isLight={isLight}
                    settings={settings}
                    onUpdateSettings={handleUpdateSettings}
                    onOpenSettings={() => setShowSettingsModal(true)}
                  />
                )}

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
                  buttonConfig={globalConfig?.buttons}
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
                      isOpponentTyping={opponentIsTyping}
                      onTyping={handleSendTyping}
                      roomData={gameSession}
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
            boardTheme={settings.boardTheme}
            pieceTheme={settings.pieceTheme}
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
          <LessonView
            isLight={isLight}
            isOled={isOled}
            boardTheme={settings.boardTheme}
            pieceTheme={settings.pieceTheme}
            onBack={() => setActiveTab('home')}
          />
        )}

        {/* Profile Tab (Full-Page View: Overview, Rankings & Settings) */}
        {activeTab === 'profile' && (
          <ProfileView
            isLight={isLight}
            isOled={isOled}
            user={currentUser}
            onUpdateUser={user => {
              setCurrentUser(user);
              safeStorage.setItem('chess_arena_user', JSON.stringify(user));
            }}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onOpenStreak={() => setShowStreakModal(true)}
            onOpenAdmin={() => setActiveTab('admin')}
            onNavigateToLeaderboard={() => {}}
            onSignOut={() => {
              safeStorage.removeItem('token');
              safeStorage.removeItem('chess_arena_user');
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
                    ? isLight ? 'text-amber-600 font-black scale-105' : 'text-amber-400 font-black scale-105'
                    : isLight
                    ? 'text-slate-500 hover:text-slate-900'
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
            // Preserve user's avatar permanently; never randomize upon login!
            const savedAvatar = safeStorage.getItem('chess_arena_selected_avatar');
            user.avatar = user.avatar || savedAvatar || DEFAULT_APP_AVATAR;
            safeStorage.setItem('chess_arena_selected_avatar', user.avatar);
            safeStorage.setItem('chess_arena_user', JSON.stringify(user));
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
            if (user.avatar) {
              safeStorage.setItem('chess_arena_selected_avatar', user.avatar);
            }
            safeStorage.setItem('chess_arena_user', JSON.stringify(user));
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
        initialTab={friendRoomTab}
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
        onChallengeFriend={(friend, customConfig) => {
          const cfg = customConfig || { timeControl: { baseMinutes: 5, incrementSeconds: 0 }, colorPreference: 'random' };
          handleCreateFriendRoom(cfg);
          socketRef.current?.emit('challenge_friend', {
            friendId: friend.id,
            config: { timeControl: cfg.timeControl, format: cfg.timeControl?.baseMinutes <= 2 ? 'bullet' : (cfg.timeControl?.baseMinutes <= 5 ? 'blitz' : 'rapid') }
          });
        }}
        onStartAIGame={handleStartAIGame}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* Global Notifications Dropdown */}
      <NotificationsDropdown
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onAcceptChallenge={handleAcceptNotificationChallenge}
        onDeclineChallenge={handleDeclineNotificationChallenge}
        onAcceptFriendRequest={handleAcceptNotificationFriendRequest}
        onDeclineFriendRequest={handleDeclineNotificationFriendRequest}
        onClearAll={() => {
          notifications.forEach(n => markNotificationDismissed(n));
          setNotifications([]);
        }}
        isLight={isLight}
      />

      {/* Incoming Challenge Toast */}
      {incomingChallenge && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border-2 border-amber-500 rounded-3xl p-4 shadow-2xl flex items-center gap-4 animate-bounce-in max-w-sm w-full mx-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 text-xl shrink-0">
            ⚔️
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-black text-white block truncate">
              {incomingChallenge.from?.username || incomingChallenge.fromUser?.username || 'Challenger'}
            </span>
            <span className="text-[11px] text-amber-300">
              Challenged you to a {incomingChallenge.config?.timeControl?.baseMinutes || 5}m match!
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                if (incomingChallenge.challengeId && !incomingChallenge.isAutomated && socketRef.current) {
                  socketRef.current.emit('accept_challenge', {
                    challengeId: incomingChallenge.challengeId,
                    fromUserId: incomingChallenge.from?.id,
                    config: incomingChallenge.config
                  });
                } else {
                  handleAcceptNotificationChallenge(incomingChallenge);
                }
                setIncomingChallenge(null);
              }}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer active:scale-95"
            >
              Accept
            </button>
            <button
              onClick={() => {
                if (incomingChallenge.id) {
                  handleDeclineNotificationChallenge(incomingChallenge.id);
                }
                setIncomingChallenge(null);
                sound.playClick();
              }}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl cursor-pointer active:scale-95"
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
          boardTheme={settings.boardTheme}
          pieceTheme={settings.pieceTheme}
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
        whiteEloChange={gameSession?.whiteEloChange !== undefined ? gameSession.whiteEloChange : (isAIGame ? (gameSession?.winner === 'white' ? 16 : -16) : 0)}
        blackEloChange={gameSession?.blackEloChange !== undefined ? gameSession.blackEloChange : (isAIGame ? (gameSession?.winner === 'black' ? 16 : -16) : 0)}
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
