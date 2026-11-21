import React, { useState, useEffect, useRef } from 'react';
import {
  Users, UserPlus, Search, Swords, Trash2, Send, Check, X,
  Copy, Share2, MessageCircle, ArrowLeft, Ban, ShieldCheck,
  Clock, Flame, Zap, Trophy, Circle, MoreVertical, Sparkles,
  UserCheck, AlertCircle, RefreshCw, ChevronRight, Sliders, Dices
} from 'lucide-react';
import { safeStorage } from '../utils/storage.js';
import { triggerHaptic } from '../utils/device.js';
import { sound } from '../utils/audio.js';

const COUNTRY_FLAGS = {
  US: '🇺🇸',
  NO: '🇳🇴',
  IN: '🇮🇳',
  IT: '🇮🇹',
  DE: '🇩🇪',
  HU: '🇭🇺',
  CA: '🇨🇦',
  IS: '🇮🇸',
  GB: '🇬🇧',
  FR: '🇫🇷',
  BR: '🇧🇷',
  ES: '🇪🇸',
  JP: '🇯🇵',
  UN: '🌐'
};

const BOT_LEVEL_MAP = {
  f_magnus: 5,
  f_hikaru: 5,
  f_gotham: 3,
  f_viking: 4,
  sug_elena: 2,
  sug_arjun: 3,
  sug_alex: 4
};

const DEFAULT_FRIENDS = [
  {
    id: 'f_magnus',
    username: 'Magnus_C',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MagnusCarlsen',
    country: 'NO',
    elo: 2882,
    isOnline: true,
    statusText: 'World #1 • Ready for Blitz',
    bio: 'Former 5x World Chess Champion',
    isBot: true
  },
  {
    id: 'f_hikaru',
    username: 'Hikaru_N',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=HikaruNakamura',
    country: 'US',
    elo: 2875,
    isOnline: true,
    statusText: 'Online • In Arena Lobby',
    bio: 'Super GM & Blitz Maestro',
    isBot: true
  },
  {
    id: 'f_gotham',
    username: 'Gotham_Chess',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=GothamChess',
    country: 'US',
    elo: 2410,
    isOnline: true,
    statusText: 'IM Levy • Ready to battle',
    bio: 'International Master',
    isBot: true
  },
  {
    id: 'f_viking',
    username: 'VikingKing',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=VikingKing',
    country: 'NO',
    elo: 2840,
    isOnline: false,
    statusText: 'Arena Champion • Offline',
    bio: 'Classical Grandmaster',
    isBot: true
  }
];

// Rich, cool anime & gaming opponents roster for dynamic suggestions
const ANIME_GAMING_CANDIDATES = [
  {
    username: 'Zoro_Gambit',
    title: 'Three-Blade Tactician',
    elo: 2240,
    country: 'JP',
    seed: 'ZoroOnePiece',
    bio: 'Looking for a direction... and an opponent! ⚔️'
  },
  {
    username: 'Levi_Captain',
    title: 'Humanity\'s Strongest',
    elo: 2480,
    country: 'DE',
    seed: 'LeviAckermanAttack',
    bio: 'No regrets on the board. Make your move.'
  },
  {
    username: 'Gojo_Limitless',
    title: 'Special Grade Master',
    elo: 2600,
    country: 'JP',
    seed: 'GojoSatoruLimitless',
    bio: 'Throughout heaven and earth, my chess is honored. 😎'
  },
  {
    username: 'Killua_Godspeed',
    title: 'Assassin Prodigy',
    elo: 2190,
    country: 'JP',
    seed: 'KilluaZoldyckLightning',
    bio: 'Lightning-fast 3m blitz only! ⚡'
  },
  {
    username: 'Shadow_Monarch',
    title: 'Solo Leveler',
    elo: 2510,
    country: 'UN',
    seed: 'SungJinwooShadow',
    bio: 'Arise! Let us battle in the Arena. 👑'
  },
  {
    username: 'Cyber_Samurai',
    title: 'Neon Ronin',
    elo: 2080,
    country: 'JP',
    seed: 'CyberSamurai2077',
    bio: 'Tactical algorithms sharp as a katana.'
  },
  {
    username: 'Tanjiro_SunBlade',
    title: 'Sun Breathing Demon Slayer',
    elo: 1980,
    country: 'JP',
    seed: 'TanjiroKamadoSun',
    bio: 'Never giving up until the king falls! 🗡️'
  },
  {
    username: 'Kakashi_Copycat',
    title: 'Sharingan Tactician',
    elo: 2350,
    country: 'JP',
    seed: 'KakashiHatakeSensei',
    bio: 'I can read your opening before you play it.'
  },
  {
    username: 'Geralt_WhiteWolf',
    title: 'Witcher of Rivia',
    elo: 2290,
    country: 'UN',
    seed: 'GeraltOfRiviaWolf',
    bio: 'Silver for monsters, pawns for kings. 🐺'
  },
  {
    username: 'Cloud_Strife',
    title: 'Ex-SOLDIER First Class',
    elo: 2320,
    country: 'US',
    seed: 'CloudStrifeBuster',
    bio: 'Buster sword tactics ready for blitz.'
  },
  {
    username: 'Itachi_Uchiha',
    title: 'Tsukuyomi Master',
    elo: 2580,
    country: 'JP',
    seed: 'ItachiUchihaCrow',
    bio: 'You are already trapped in my knight fork. 👁️'
  },
  {
    username: 'Luffy_Gear5',
    title: 'Warrior of Liberation',
    elo: 2420,
    country: 'BR',
    seed: 'MonkeyDLuffyGear5',
    bio: 'I\'m gonna be the Chess King! 🍖'
  }
];

const INITIAL_DIRECT_MESSAGES = {
  f_magnus: [
    { id: 'm1', sender: 'them', text: 'Hey! Ready for some fast-paced chess in the Arena? ♟️', time: '10:14 AM' },
    { id: 'm2', sender: 'them', text: 'Let\'s play a 5-minute blitz game whenever you want!', time: '10:15 AM' }
  ],
  f_hikaru: [
    { id: 'm1', sender: 'them', text: 'Literally let\'s play right now! 3m or 5m blitz? Ready when you are 🔥', time: '11:30 AM' }
  ],
  f_gotham: [
    { id: 'm1', sender: 'them', text: 'Welcome to the Arena! Watch out for tactical knight forks and don\'t hang THE ROOOOOK! ⚡', time: '12:00 PM' }
  ]
};

const QUICK_CHAT_SUGGESTIONS = [
  'Let\'s play 5 minutes! ⏱️',
  'How about 3m Blitz? 🔥',
  'Let\'s do 10m Rapid 🎯',
  'Want a rematch? ⚔️',
  'Ready to play? ♟️'
];

/**
 * Parses user text for explicit time declarations (e.g. "5m", "10 minutes", "3 min", "20m")
 */
function extractTimeFromText(text) {
  if (!text) return null;
  const match = text.match(/(?:^|\s)(\d{1,2})\s*(?:m|min|mins|minute|minutes)(?:$|\s|[.,!?])/i);
  if (match) {
    const mins = parseInt(match[1], 10);
    if (mins >= 1 && mins <= 60) return mins;
  }
  if (/blitz/i.test(text)) return 3;
  if (/rapid/i.test(text)) return 10;
  if (/bullet/i.test(text)) return 1;
  return null;
}

/**
 * Generates witty, personality-driven bot responses that actively negotiate match time
 */
function generateBotReply(botId, botUsername, userText, detectedMinutes) {
  const lower = userText.toLowerCase();
  const minutesToUse = detectedMinutes || (Math.random() < 0.5 ? 5 : 3);

  if (botId === 'f_magnus' || /magnus/i.test(botUsername)) {
    if (detectedMinutes) {
      return `Haha ${detectedMinutes} minutes? Deal! You think your opening can survive my endgame? 😉 Drop the challenge above and let's find out! 🏆`;
    }
    if (/hi|hello|hey|yo|sup|kya/i.test(lower)) {
      return `Hey! I was just studying some world championship endgames. Ready to test your skills? Let's play a 5-minute blitz! ♟️`;
    }
    if (/ready|play|match|game|khel|aaja/i.test(lower)) {
      return `I was born ready. Let's do 5m Blitz! Click the Challenge button above and make your first move! 🔥`;
    }
    if (/beat|win|defeat|lose|noob/i.test(lower)) {
      return `Big words! Even grandmasters couldn't crack my defense. Send a 5m challenge and let's see if you can back up that talk! 😂`;
    }
    return `Nice one! But chess is played on the 64 squares, not just in chat. How about a 5-minute blitz match right now? Send the request! ♟️`;
  }

  if (botId === 'f_hikaru' || /hikaru/i.test(botUsername)) {
    if (detectedMinutes) {
      return `Literally ${detectedMinutes} minutes is perfection! Chat, he's challenging me! Hit Challenge above right now and let's go! ⚡🔥`;
    }
    if (/hi|hello|hey|yo/i.test(lower)) {
      return `Hey what's up! Literally just finished a stream and looking to crush some blitz. Let's do 3m blitz right now! 🚀`;
    }
    if (/ready|play|match|game/i.test(lower)) {
      return `Let's goooo! I take take take and it's completely winning! Send the 3-minute challenge right now! 💥`;
    }
    return `Literally let's see what you've got! I'm pre-moving already. Challenge me to a 3m or 5m game above! ⚡`;
  }

  if (botId === 'f_gotham' || /gotham/i.test(botUsername)) {
    if (detectedMinutes) {
      return `${detectedMinutes} minutes?! Okay, but if you hang your queen in the first 10 moves, I'm putting it in a video! 😂 Hit Challenge and let's play! 📹`;
    }
    if (/hi|hello|hey/i.test(lower)) {
      return `Hello hello! Welcome to Gotham Arena! Ready to blunder your pieces or play some master chess today? Let's do 5m blitz! ☕`;
    }
    if (/ready|play|match|game/i.test(lower)) {
      return `AND HE SACRIFICES THE ROOOOOOK! 💥 Send the challenge for 5m or 10m, I am waiting! ♟️`;
    }
    return `Danger Levels! Watch your f7 pawn and don't get trapped. Challenge me to a 5-minute battle right now! ⚔️`;
  }

  if (botId === 'f_viking' || /viking/i.test(botUsername)) {
    if (detectedMinutes) {
      return `A battle of ${detectedMinutes} minutes honors Odin! 🛡️ Send the duel challenge above and let steel clash on the 64 squares! ⚔️`;
    }
    return `The northern winds blow toward victory! Challenge me to a 10m rapid duel and prove your worth! 🛡️`;
  }

  // Friendly Indian / Desi friend (e.g. Shivam)
  if (/shivam/i.test(botUsername) || /arjun/i.test(botUsername)) {
    if (detectedMinutes) {
      return `Arre badhiya! ${detectedMinutes} minute ka match set hai. Upar Challenge pe click kar, board pe milte hain bhai! 🏆`;
    }
    return `Bhai kya haal! Poora mood hai chess khelne ka. 5 minute ya 10 minute ka match lagate hain, bhej challenge! ♟️🔥`;
  }

  // Cool Anime / Gamer friends
  if (detectedMinutes) {
    return `Challenge accepted for ${detectedMinutes} minutes! My blade is sharp and my knights are ready. Hit Challenge above and let's duel! ⚔️`;
  }
  return `I see you're ready for battle! Let's play a ${minutesToUse}-minute game right now. Click Challenge above and let's go! 🚀`;
}

export function FriendRoomModal({
  isOpen,
  onClose,
  currentUser,
  onCreateRoom,
  onJoinRoom,
  createdRoom,
  onEnterRoom,
  onChallengeFriend,
  onStartAIGame,
  onOpenAuth,
  initialTab = 'friends',
  isLight = false
}) {
  // 3 tabs: 1. friends, 2. room, 3. add
  const [activeTab, setActiveTab] = useState(initialTab || 'friends');

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);
  const [friends, setFriends] = useState(() => {
    try {
      const saved = safeStorage.getItem('chess_arena_friends_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_FRIENDS;
  });

  const [directMessages, setDirectMessages] = useState(() => {
    try {
      const saved = safeStorage.getItem('chess_arena_dms_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_DIRECT_MESSAGES;
  });

  // Track sent friend requests (so requests aren't immediately added to friends)
  const [sentRequests, setSentRequests] = useState(() => {
    try {
      const saved = safeStorage.getItem('chess_arena_sent_requests_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Selected friend for detail action bar
  const [selectedFriend, setSelectedFriend] = useState(null);

  // Active Direct Chat state
  const [chattingFriend, setChattingFriend] = useState(null);
  const [chatInputText, setChatInputText] = useState('');
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [agreedChatMinutes, setAgreedChatMinutes] = useState(null);
  const chatMessagesEndRef = useRef(null);

  // Search & Add state
  const [searchUsername, setSearchUsername] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchedUser, setSearchedUser] = useState(null);
  const [searchNotFound, setSearchNotFound] = useState(false);
  const [suggestedOnlinePlayer, setSuggestedOnlinePlayer] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);

  // Challenge time picker
  const [challengeFriendTarget, setChallengeFriendTarget] = useState(null);
  const [challengeMinutes, setChallengeMinutes] = useState(5);
  const [challengeCustomMinutes, setChallengeCustomMinutes] = useState('15');
  const [isCustomChallenge, setIsCustomChallenge] = useState(false);

  // Room state (Starting Side removed; strictly random 50/50 automatically)
  const [roomCode, setRoomCode] = useState('');
  const [selectedRoomMinutes, setSelectedRoomMinutes] = useState(5); // 3, 5, 10, or custom
  const [customRoomMinutes, setCustomRoomMinutes] = useState('15');
  const [isCustomRoom, setIsCustomRoom] = useState(false);
  const [copied, setCopied] = useState(false);

  // Set default tab to 'room' on open
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'room');
      setSelectedFriend(null);
      setChattingFriend(null);
      setShowChatMenu(false);
      setSearchedUser(null);
      setSearchNotFound(false);
      setRequestStatus(null);
    }
  }, [isOpen, initialTab]);

  // Sync to safeStorage
  useEffect(() => {
    try {
      safeStorage.setItem('chess_arena_friends_v3', JSON.stringify(friends));
    } catch {}
  }, [friends]);

  useEffect(() => {
    try {
      safeStorage.setItem('chess_arena_dms_v3', JSON.stringify(directMessages));
    } catch {}
  }, [directMessages]);

  useEffect(() => {
    try {
      safeStorage.setItem('chess_arena_sent_requests_v3', JSON.stringify(sentRequests));
    } catch {}
  }, [sentRequests]);

  // Scroll chat to bottom
  useEffect(() => {
    if (chattingFriend) {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chattingFriend, directMessages]);

  if (!isOpen) return null;

  // Execute match challenge with friend or AI bot
  const handleExecuteChallenge = (friend, minutes = 5) => {
    sound.playClick();
    triggerHaptic('move');
    setChallengeFriendTarget(null);

    const isBotFriend = friend.isBot || BOT_LEVEL_MAP[friend.id] || friend.id.startsWith('f_') || friend.id.startsWith('sug_');
    if (isBotFriend && onStartAIGame) {
      const level = BOT_LEVEL_MAP[friend.id] || 4;
      sound.playMatchStart();
      onClose();
      onStartAIGame(level, minutes, 'w');
      return;
    }

    const config = {
      timeControl: { baseMinutes: minutes, incrementSeconds: 0 },
      colorPreference: 'random' // Strictly random side assignment
    };

    if (onChallengeFriend) {
      onChallengeFriend(friend, config);
    } else {
      onCreateRoom(config);
      setActiveTab('room');
    }
  };

  /**
   * Search Player by Username
   * Does NOT directly add them to friends. Searches first.
   * If found -> presents card with "Send Friend Request" button.
   * If not found -> shows not found and dynamically suggests a fresh random online anime/gaming player.
   */
  const handleSearchUser = async (e) => {
    if (e) e.preventDefault();
    const query = searchUsername.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchedUser(null);
    setSearchNotFound(false);
    setRequestStatus(null);

    // Self check
    if (currentUser && query.toLowerCase() === currentUser.username?.toLowerCase()) {
      setIsSearching(false);
      setRequestStatus({ type: 'error', text: 'You cannot send a friend request to yourself.' });
      return;
    }

    // Check existing friends list
    const existing = friends.find(f => f.username.toLowerCase() === query.toLowerCase());
    if (existing) {
      setIsSearching(false);
      setSearchedUser(existing);
      setRequestStatus({ type: 'info', text: `@${existing.username} is already in your Friends list!` });
      return;
    }

    // Check local masters roster & registered db users
    let match = DEFAULT_FRIENDS.find(f => f.username.toLowerCase() === query.toLowerCase());
    if (!match) {
      match = ANIME_GAMING_CANDIDATES.find(c => c.username.toLowerCase() === query.toLowerCase());
      if (match) {
        match = {
          id: `sug_${match.username.toLowerCase()}`,
          username: match.username,
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${match.seed}`,
          country: match.country,
          elo: match.elo,
          isOnline: true,
          statusText: `${match.title} • Online`,
          bio: match.bio,
          isBot: true
        };
      }
    }

    // Try server search if available
    if (!match) {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data?.users?.length) {
          const u = data.users[0];
          match = {
            id: u.id,
            username: u.username,
            avatar: u.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.username}`,
            country: u.country || 'UN',
            elo: u.rating || 1200,
            isOnline: Boolean(u.isOnline),
            statusText: u.isOnline ? 'Online • In Arena' : 'Offline'
          };
        }
      } catch {}
    }

    setIsSearching(false);

    if (match) {
      setSearchedUser(match);
      setSearchNotFound(false);
    } else {
      // NOT FOUND: Dynamically generate a cool anime/gaming online candidate
      setSearchNotFound(true);
      const randomCandidate = ANIME_GAMING_CANDIDATES[Math.floor(Math.random() * ANIME_GAMING_CANDIDATES.length)];
      const randomSeed = `${randomCandidate.seed}_${Date.now() % 1000}`;
      setSuggestedOnlinePlayer({
        id: `sug_${Date.now()}`,
        username: randomCandidate.username,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${randomSeed}`,
        country: randomCandidate.country,
        elo: randomCandidate.elo,
        title: randomCandidate.title,
        statusText: '🔥 In Lobby • Looking for Match',
        bio: randomCandidate.bio,
        isBot: true
      });
      sound.playClick();
    }
  };

  /**
   * Send Friend Request to the found user
   * Does NOT instantly add to friends; queues as pending friend request!
   */
  const handleSendFriendRequest = (userToSend) => {
    if (!userToSend) return;
    const targetUsername = userToSend.username;

    // Check if request was already sent
    if (sentRequests.includes(targetUsername)) {
      setRequestStatus({ type: 'info', text: `Friend request to @${targetUsername} is already pending!` });
      return;
    }

    setSentRequests(prev => [targetUsername, ...prev]);
    setRequestStatus({
      type: 'success',
      text: `Friend request sent to @${targetUsername}! 📩 You'll be notified when they accept.`
    });
    sound.playMove();
    triggerHaptic('move');

    // If target is a bot or community friend, simulate acceptance after a short delay!
    if (userToSend.isBot || userToSend.id.startsWith('f_') || userToSend.id.startsWith('sug_')) {
      setTimeout(() => {
        setFriends(prev => {
          if (prev.some(f => f.username.toLowerCase() === targetUsername.toLowerCase())) return prev;
          return [userToSend, ...prev];
        });
        setSentRequests(prev => prev.filter(u => u !== targetUsername));
        sound.playVictory();
        triggerHaptic('success');
      }, 3000);
    }
  };

  /**
   * Directly add / follow suggested online player
   */
  const handleAddSuggestedOnlinePlayer = (player) => {
    if (friends.some(f => f.username.toLowerCase() === player.username.toLowerCase())) {
      setRequestStatus({ type: 'info', text: `@${player.username} is already in your friends list!` });
      return;
    }
    setFriends(prev => [player, ...prev]);
    setSuggestedOnlinePlayer(null);
    setSearchNotFound(false);
    setRequestStatus({
      type: 'success',
      text: `Connected with @${player.username}! You can now chat and challenge them. 🎉`
    });
    sound.playVictory();
    triggerHaptic('move');
  };

  const handleRemoveFriend = (friendId) => {
    setFriends(prev => prev.filter(f => f.id !== friendId));
    setSelectedFriend(null);
    if (chattingFriend?.id === friendId) setChattingFriend(null);
    setShowChatMenu(false);
    sound.playClick();
    triggerHaptic('move');
  };

  const handleBlockUser = (friend) => {
    setFriends(prev => prev.filter(f => f.id !== friend.id));
    setSelectedFriend(null);
    if (chattingFriend?.id === friend.id) setChattingFriend(null);
    setShowChatMenu(false);
    sound.playClick();
    triggerHaptic('move');
  };

  /**
   * Send Chat Message & Trigger Witty, Contextual Bot Reply
   */
  const handleSendChatMessage = (e) => {
    if (e) e.preventDefault();
    const text = chatInputText.trim();
    if (!text || !chattingFriend) return;

    const detected = extractTimeFromText(text);
    if (detected) {
      setAgreedChatMinutes(detected);
    }

    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: 'me',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const targetId = chattingFriend.id;
    setDirectMessages(prev => ({
      ...prev,
      [targetId]: [...(prev[targetId] || []), newMsg]
    }));
    setChatInputText('');
    sound.playMove();
    triggerHaptic('move');

    // Bot witty response
    if (targetId.startsWith('f_') || targetId.startsWith('sug_') || chattingFriend.isBot) {
      setTimeout(() => {
        const replyText = generateBotReply(targetId, chattingFriend.username, text, detected);
        const replyMsg = {
          id: `reply_${Date.now()}`,
          sender: 'them',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setDirectMessages(p => ({
          ...p,
          [targetId]: [...(p[targetId] || []), replyMsg]
        }));
        sound.playMove();
      }, 700);
    }
  };

  const fullShareUrl = createdRoom
    ? `${window.location.origin}/?room=${createdRoom.roomId}`
    : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullShareUrl);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = fullShareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    triggerHaptic('move');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator?.share) {
      try {
        await navigator.share({
          title: 'Chess Arena Match Room',
          text: '♟️ Battle me in Chess Arena! Join my room here:',
          url: fullShareUrl
        });
        return;
      } catch {}
    }
    copyLink();
  };

  // Resolve room creation with strictly random side
  const handleCreateRoomAction = () => {
    const finalMinutes = isCustomRoom
      ? Math.max(1, Math.min(60, parseInt(customRoomMinutes, 10) || 15))
      : selectedRoomMinutes;

    onCreateRoom({
      timeControl: { baseMinutes: finalMinutes, incrementSeconds: 0 },
      colorPreference: 'random' // Strictly random 50/50 starting side automatically
    });
  };

  // Color Theme Tokens
  const theme = {
    modalBg: isLight ? 'bg-white border-slate-200 shadow-2xl text-slate-900' : 'bg-slate-900 border-slate-700/80 shadow-2xl text-white',
    tabContainer: isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800',
    tabActive: 'bg-amber-500 text-slate-950 font-black shadow-md',
    tabInactive: isLight ? 'text-slate-600 hover:text-slate-900 font-bold' : 'text-slate-400 hover:text-white font-bold',
    card: isLight ? 'bg-slate-50/90 border-slate-200 hover:border-slate-300 text-slate-900' : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-100',
    innerBox: isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950/60 border-slate-800 text-slate-100',
    input: isLight ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500' : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-amber-500',
    textMuted: isLight ? 'text-slate-600' : 'text-slate-400',
    badge: isLight ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-800 text-amber-400 border-slate-700'
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className={`border rounded-3xl p-4 sm:p-6 max-w-lg w-full space-y-4 relative max-h-[92vh] flex flex-col overflow-hidden transition-colors ${theme.modalBg}`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors z-20 cursor-pointer ${
            isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        {!chattingFriend && (
          <div className="space-y-1 pr-8">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                isLight ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-lg sm:text-xl font-black">
                Play With Friends
              </h3>
            </div>
            <p className={`text-xs ${theme.textMuted}`}>
              Create private match rooms, challenge friends, or chat directly.
            </p>
          </div>
        )}

        {/* ========================================================= */}
        {/* TABS (Only 3 Tabs: 1st Room, 2nd Friends, 3rd Add/Follow) */}
        {/* ========================================================= */}
        {!chattingFriend && (
          <div className={`flex p-1 rounded-2xl border shrink-0 text-xs gap-1 ${theme.tabContainer}`}>
            {/* 1st Tab: Room (default on open) */}
            <button
              onClick={() => {
                setActiveTab('room');
                triggerHaptic('move');
              }}
              className={`flex-1 py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'room' ? theme.tabActive : theme.tabInactive
              }`}
            >
              <span>🎮 Room</span>
            </button>

            {/* 2nd Tab: Friends */}
            <button
              onClick={() => {
                setActiveTab('friends');
                triggerHaptic('move');
              }}
              className={`flex-1 py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'friends' ? theme.tabActive : theme.tabInactive
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Friends ({friends.length})</span>
            </button>

            {/* 3rd Tab: Add / Follow */}
            <button
              onClick={() => {
                setActiveTab('add');
                triggerHaptic('move');
              }}
              className={`flex-1 py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'add' ? theme.tabActive : theme.tabInactive
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add / Follow</span>
              {sentRequests.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW: DIRECT CHAT WITH FRIEND                             */}
        {/* ========================================================= */}
        {chattingFriend ? (
          <div className="flex-1 flex flex-col min-h-0 space-y-3">
            {/* Direct Chat Top Bar with 3-Dot Corner Menu */}
            <div className={`flex items-center justify-between p-2.5 rounded-2xl border shrink-0 relative ${theme.innerBox}`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => {
                    setChattingFriend(null);
                    setShowChatMenu(false);
                    sound.playClick();
                    triggerHaptic('move');
                  }}
                  className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                    isLight ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                  }`}
                  title="Back to Friends List"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="relative">
                  <img
                    src={chattingFriend.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${chattingFriend.username}`}
                    alt={chattingFriend.username}
                    className="w-8 h-8 rounded-full object-cover border border-amber-500/40"
                  />
                  <Circle
                    className={`w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5 rounded-full ${
                      chattingFriend.isOnline ? 'text-emerald-500 fill-emerald-500' : 'text-slate-500 fill-slate-500'
                    }`}
                  />
                </div>

                <div className="truncate">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-xs truncate">{chattingFriend.username}</span>
                    <span>{COUNTRY_FLAGS[chattingFriend.country] || '🌐'}</span>
                  </div>
                  <span className={`text-[10px] block ${chattingFriend.isOnline ? 'text-emerald-600 font-bold' : theme.textMuted}`}>
                    {chattingFriend.statusText || (chattingFriend.isOnline ? 'Online' : 'Offline')}
                  </span>
                </div>
              </div>

              {/* Chat Actions: Challenge Button + 3-Dot Options in Corner */}
              <div className="flex items-center gap-1.5 shrink-0 relative">
                <button
                  onClick={() => {
                    setChallengeFriendTarget(chattingFriend);
                    if (agreedChatMinutes) {
                      setChallengeMinutes(agreedChatMinutes);
                    }
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Challenge</span>
                </button>

                {/* 3-Dot Menu Button */}
                <button
                  onClick={() => setShowChatMenu(!showChatMenu)}
                  className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                    isLight ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  }`}
                  title="Friend Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* 3-Dot Dropdown Menu in Corner */}
                {showChatMenu && (
                  <div className={`absolute top-full right-0 mt-1.5 w-44 rounded-2xl border shadow-xl p-1.5 z-30 animate-fade-in ${
                    isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                  }`}>
                    <button
                      onClick={() => handleBlockUser(chattingFriend)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                        isLight ? 'hover:bg-amber-50 text-amber-800' : 'hover:bg-amber-950/40 text-amber-300'
                      }`}
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Block Player</span>
                    </button>
                    <button
                      onClick={() => handleRemoveFriend(chattingFriend.id)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Friend</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Direct Message Feed */}
            <div className={`flex-1 overflow-y-auto p-3 rounded-2xl border space-y-2.5 min-h-[220px] max-h-[360px] ${
              isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-slate-950/80 border-slate-800'
            }`}>
              {(!directMessages[chattingFriend.id] || directMessages[chattingFriend.id].length === 0) ? (
                <div className="py-12 text-center space-y-1">
                  <MessageCircle className="w-8 h-8 mx-auto text-amber-500/60" />
                  <p className="text-xs font-bold">Start a conversation with @{chattingFriend.username}</p>
                  <p className={`text-[11px] ${theme.textMuted}`}>Decide game time and challenge them to a match!</p>
                </div>
              ) : (
                directMessages[chattingFriend.id].map(msg => {
                  const isMe = msg.sender === 'me';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[82%] px-3 py-2 rounded-2xl text-xs shadow-xs ${
                        isMe
                          ? 'bg-amber-500 text-slate-950 font-medium rounded-br-xs'
                          : isLight
                          ? 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs'
                          : 'bg-slate-800 border border-slate-700 text-white rounded-bl-xs'
                      }`}>
                        <p className="break-words leading-relaxed">{msg.text}</p>
                      </div>
                      <span className={`text-[9px] mt-0.5 px-1 font-mono ${theme.textMuted}`}>
                        {msg.time}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatMessagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              {QUICK_CHAT_SUGGESTIONS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setChatInputText(chip);
                    triggerHaptic('move');
                  }}
                  className={`px-2.5 py-1 rounded-xl border whitespace-nowrap transition-colors cursor-pointer shrink-0 font-medium ${
                    isLight
                      ? 'bg-white hover:bg-amber-50 border-slate-200 text-slate-700 hover:border-amber-300'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendChatMessage} className="flex gap-2">
              <input
                type="text"
                value={chatInputText}
                onChange={e => setChatInputText(e.target.value)}
                placeholder={`Message @${chattingFriend.username} (e.g. Let's play 5 minutes)...`}
                className={`flex-1 border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 ${theme.input}`}
              />
              <button
                type="submit"
                disabled={!chatInputText.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center cursor-pointer active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* ========================================================= */}
            {/* 1st TAB: CUSTOM ROOM (DEFAULT ON OPEN)                    */}
            {/* ========================================================= */}
            {activeTab === 'room' && (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {createdRoom ? (
                  <div className={`p-4 border rounded-2xl space-y-4 animate-fade-in ${theme.innerBox}`}>
                    <div className="text-center space-y-1">
                      <span className="text-xs font-black text-emerald-500 block">
                        ✓ Private Match Room Ready!
                      </span>
                      <span className={`text-xs font-mono ${theme.textMuted}`}>
                        Room Code: <strong className="text-amber-500 text-sm font-black">{createdRoom.roomId}</strong>
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-[11px] font-bold block ${theme.textMuted}`}>Shareable Invite Link</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={fullShareUrl}
                          className={`flex-1 border rounded-xl px-3 py-2 text-xs select-all font-mono ${theme.input}`}
                        />
                        <button
                          onClick={copyLink}
                          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                        >
                          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleNativeShare}
                        className={`flex-1 py-2 px-3 border rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                        }`}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share Directly</span>
                      </button>

                      {onEnterRoom && (
                        <button
                          onClick={onEnterRoom}
                          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Swords className="w-3.5 h-3.5" />
                          <span>Enter Board Lounge</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Setup Room Parameters */}
                    <div className={`p-4 border rounded-2xl space-y-3 ${theme.innerBox}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider block text-amber-500">
                          Create Private Room
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                          <Dices className="w-3 h-3" />
                          <span>Random Sides (50/50)</span>
                        </span>
                      </div>

                      {/* Time Presets (3, 5, 10, and Custom) */}
                      <div>
                        <label className={`text-[11px] font-bold block mb-1.5 ${theme.textMuted}`}>Select Time Control</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { m: 3, label: '3m Blitz', icon: '🔥' },
                            { m: 5, label: '5m Blitz', icon: '⏱️' },
                            { m: 10, label: '10m Rapid', icon: '🎯' }
                          ].map(t => (
                            <button
                              key={t.m}
                              type="button"
                              onClick={() => {
                                setSelectedRoomMinutes(t.m);
                                setIsCustomRoom(false);
                                triggerHaptic('move');
                              }}
                              className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                                !isCustomRoom && selectedRoomMinutes === t.m
                                  ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-xs'
                                  : isLight
                                  ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <span>{t.icon} {t.m}m</span>
                            </button>
                          ))}

                          {/* Custom Time Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomRoom(true);
                              triggerHaptic('move');
                            }}
                            className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                              isCustomRoom
                                ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-xs'
                                : isLight
                                ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <Sliders className="w-3 h-3" />
                            <span>Custom</span>
                          </button>
                        </div>

                        {/* Custom Time Control Input Drawer */}
                        {isCustomRoom && (
                          <div className={`mt-2 p-2.5 rounded-xl border flex items-center gap-2 animate-fade-in ${theme.innerBox}`}>
                            <span className="text-xs font-bold text-amber-500">Minutes:</span>
                            <input
                              type="number"
                              min="1"
                              max="60"
                              value={customRoomMinutes}
                              onChange={e => setCustomRoomMinutes(e.target.value)}
                              className={`w-20 border rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-center ${theme.input}`}
                            />
                            <span className={`text-[11px] ${theme.textMuted}`}>(1 to 60 mins per player)</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleCreateRoomAction}
                        className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-1.5"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Generate Room & Link ({isCustomRoom ? customRoomMinutes : selectedRoomMinutes}m)</span>
                      </button>
                    </div>

                    {/* Join Room by Code */}
                    <div className={`p-4 border rounded-2xl space-y-2.5 ${theme.innerBox}`}>
                      <span className="text-xs font-black uppercase tracking-wider block">
                        Join Friend's Room
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={roomCode}
                          onChange={e => setRoomCode(e.target.value)}
                          placeholder="Enter Room Code (e.g. ARENA_XYZ)..."
                          className={`flex-1 border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 font-mono ${theme.input}`}
                        />
                        <button
                          onClick={() => onJoinRoom(roomCode.trim())}
                          disabled={!roomCode.trim()}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer active:scale-95"
                        >
                          Join
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* 2nd TAB: FRIENDS LIST (CLEAN, NO CLUTTER, EXPANDS ON CLICK)*/}
            {/* ========================================================= */}
            {activeTab === 'friends' && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {friends.length === 0 ? (
                  <div className={`p-6 text-center space-y-3 rounded-2xl border ${theme.innerBox}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto border ${
                      isLight ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    }`}>
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black">No Friends in Your Arena Yet</h4>
                      <p className={`text-xs mt-1 max-w-xs mx-auto ${theme.textMuted}`}>
                        Search players or add online contenders in the Add / Follow tab!
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('add');
                        triggerHaptic('move');
                      }}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Search & Add Friends</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {friends.map(friend => {
                      const flag = COUNTRY_FLAGS[friend.country] || '🌐';
                      const isSelected = selectedFriend?.id === friend.id;

                      return (
                        <div
                          key={friend.id}
                          className={`rounded-2xl border transition-all overflow-hidden ${theme.card} ${
                            isSelected ? (isLight ? 'border-amber-400 shadow-md ring-1 ring-amber-400/30' : 'border-amber-500/60 shadow-lg ring-1 ring-amber-500/20') : ''
                          }`}
                        >
                          {/* Clean Friend Row: Clicking reveals Action Buttons */}
                          <div
                            onClick={() => {
                              setSelectedFriend(isSelected ? null : friend);
                              sound.playClick();
                              triggerHaptic('move');
                            }}
                            className="p-3 flex items-center justify-between gap-3 cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative shrink-0">
                                <img
                                  src={friend.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${friend.username}`}
                                  alt={friend.username}
                                  className="w-10 h-10 rounded-full object-cover border border-amber-500/30"
                                />
                                <Circle
                                  className={`w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5 rounded-full ${
                                    friend.isOnline ? 'text-emerald-500 fill-emerald-500' : 'text-slate-500 fill-slate-500'
                                  }`}
                                />
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  {/* Full Username - NOT TRUNCATED */}
                                  <span className="font-bold text-sm">{friend.username}</span>
                                  <span className="text-xs" title={friend.country}>{flag}</span>
                                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${theme.badge}`}>
                                    {friend.elo}
                                  </span>
                                </div>
                                <span className={`text-[11px] block mt-0.5 ${friend.isOnline ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : theme.textMuted}`}>
                                  {friend.statusText || (friend.isOnline ? 'Online • Ready to play' : 'Offline')}
                                </span>
                              </div>
                            </div>

                            <ChevronRight className={`w-4 h-4 transition-transform duration-200 shrink-0 ${
                              isSelected ? 'rotate-90 text-amber-500' : theme.textMuted
                            }`} />
                          </div>

                          {/* Action Bar (Opens only when clicking friend) */}
                          {isSelected && (
                            <div className={`p-2.5 px-3 border-t flex items-center gap-2 animate-fade-in ${
                              isLight ? 'bg-amber-50/50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
                            }`}>
                              {/* Request Match */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setChallengeFriendTarget(friend);
                                }}
                                className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                              >
                                <Swords className="w-3.5 h-3.5" />
                                <span>Request Match</span>
                              </button>

                              {/* Open Chat */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setChattingFriend(friend);
                                  setSelectedFriend(null);
                                  sound.playClick();
                                  triggerHaptic('move');
                                }}
                                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                                  isLight
                                    ? 'bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-700'
                                    : 'bg-indigo-950/60 hover:bg-indigo-900/60 border-indigo-500/30 text-indigo-300'
                                }`}
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Direct Chat</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* 3rd TAB: ADD / FOLLOW / SEARCH BY USERNAME                */}
            {/* ========================================================= */}
            {activeTab === 'add' && (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {/* Search Form */}
                <div className={`p-4 rounded-2xl border space-y-3 ${theme.innerBox}`}>
                  <div className="flex items-center gap-2 text-amber-500">
                    <UserPlus className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-wider">
                      Search Player to Add
                    </span>
                  </div>
                  <p className={`text-xs ${theme.textMuted}`}>
                    Enter an opponent's username to search for their account and send a friend request.
                  </p>

                  <form onSubmit={handleSearchUser} className="space-y-2">
                    <div className="relative">
                      <Search className={`w-4 h-4 absolute left-3 top-2.5 ${theme.textMuted}`} />
                      <input
                        type="text"
                        value={searchUsername}
                        onChange={e => setSearchUsername(e.target.value)}
                        placeholder="Enter username (e.g. Magnus, Levi, Gojo)..."
                        className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-500 ${theme.input}`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!searchUsername.trim() || isSearching}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>{isSearching ? 'Searching...' : 'Search Player'}</span>
                    </button>
                  </form>

                  {/* Feedback Status Alert */}
                  {requestStatus && (
                    <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 animate-fade-in ${
                      requestStatus.type === 'success'
                        ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300'
                        : requestStatus.type === 'info'
                        ? 'bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300'
                        : 'bg-rose-500/15 border border-rose-500/40 text-rose-600 dark:text-rose-300'
                    }`}>
                      {requestStatus.type === 'success' ? (
                        <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                      )}
                      <span>{requestStatus.text}</span>
                    </div>
                  )}

                  {/* CASE 1: USER IS FOUND -> Present Profile Card with 'Send Friend Request' Button */}
                  {searchedUser && (
                    <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 animate-fade-in ${
                      isLight ? 'bg-emerald-50/60 border-emerald-300' : 'bg-emerald-950/30 border-emerald-500/40'
                    }`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={searchedUser.avatar}
                          alt={searchedUser.username}
                          className="w-10 h-10 rounded-full border-2 border-emerald-500/50 object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs truncate">@{searchedUser.username}</span>
                            <span>{COUNTRY_FLAGS[searchedUser.country] || '🌐'}</span>
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${theme.badge}`}>
                              {searchedUser.elo || 1200}
                            </span>
                          </div>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                            {searchedUser.statusText || 'Registered Arena Player'}
                          </span>
                        </div>
                      </div>

                      {friends.some(f => f.username.toLowerCase() === searchedUser.username.toLowerCase()) ? (
                        <span className="text-xs text-emerald-600 font-bold px-3 py-1 flex items-center gap-1 shrink-0">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Friends</span>
                        </span>
                      ) : sentRequests.includes(searchedUser.username) ? (
                        <span className="text-xs text-amber-600 font-bold px-3 py-1 flex items-center gap-1 shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Sent ✓</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSendFriendRequest(searchedUser)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Request</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* CASE 2: USER NOT FOUND -> Display Message AND Suggest Random Online Anime/Game Player */}
                  {searchNotFound && suggestedOnlinePlayer && (
                    <div className="space-y-2.5 animate-fade-in pt-1">
                      <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                        isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                      }`}>
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                        <span>No registered player found with that username.</span>
                      </div>

                      {/* Random Online Suggested Candidate */}
                      <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
                        isLight ? 'bg-sky-50/70 border-sky-300' : 'bg-sky-950/30 border-sky-500/40'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Player Online Now • Ready to Add</span>
                          </span>
                          <span className="text-[10px] font-mono text-emerald-500 font-bold flex items-center gap-1">
                            <Circle className="w-2 h-2 fill-emerald-500" />
                            Online
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={suggestedOnlinePlayer.avatar}
                              alt={suggestedOnlinePlayer.username}
                              className="w-11 h-11 rounded-full border-2 border-sky-500/60 object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-sm truncate">@{suggestedOnlinePlayer.username}</span>
                                <span>{COUNTRY_FLAGS[suggestedOnlinePlayer.country] || '🌐'}</span>
                                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${theme.badge}`}>
                                  {suggestedOnlinePlayer.elo}
                                </span>
                              </div>
                              <span className="text-[11px] text-sky-700 dark:text-sky-300 font-medium block truncate mt-0.5">
                                {suggestedOnlinePlayer.statusText}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleAddSuggestedOnlinePlayer(suggestedOnlinePlayer)}
                            className="px-3.5 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shrink-0"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>+ Add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Popular Featured Online Contenders */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-black uppercase tracking-wider block">
                      Active Arena Players Online
                    </span>
                    <span className={`text-[11px] ${theme.textMuted}`}>Fast Connect</span>
                  </div>

                  <div className="space-y-2">
                    {ANIME_GAMING_CANDIDATES.slice(0, 4).map(candidate => {
                      const isFriend = friends.some(f => f.username.toLowerCase() === candidate.username.toLowerCase());
                      const isRequested = sentRequests.includes(candidate.username);

                      return (
                        <div
                          key={candidate.username}
                          className={`flex items-center justify-between p-3 rounded-2xl border ${theme.card}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${candidate.seed}`}
                              alt={candidate.username}
                              className="w-9 h-9 rounded-full border border-amber-500/30 object-cover shrink-0"
                            />
                            <div className="truncate">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs truncate">@{candidate.username}</span>
                                <span>{COUNTRY_FLAGS[candidate.country] || '🌐'}</span>
                                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${theme.badge}`}>
                                  {candidate.elo}
                                </span>
                              </div>
                              <span className={`text-[11px] block ${theme.textMuted}`}>{candidate.title}</span>
                            </div>
                          </div>

                          {isFriend ? (
                            <span className="text-xs text-emerald-600 font-bold px-3 py-1 flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Friends</span>
                            </span>
                          ) : isRequested ? (
                            <span className="text-xs text-amber-600 font-bold px-3 py-1 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Pending</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                handleSendFriendRequest({
                                  id: `sug_${candidate.username.toLowerCase()}`,
                                  username: candidate.username,
                                  avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${candidate.seed}`,
                                  country: candidate.country,
                                  elo: candidate.elo,
                                  isOnline: true,
                                  statusText: `${candidate.title} • Online`,
                                  bio: candidate.bio,
                                  isBot: true
                                });
                              }}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Request</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ========================================================= */}
        {/* TIME CONTROL PICKER FOR CHALLENGING FRIEND (3, 5, 10, Custom) */}
        {/* ========================================================= */}
        {challengeFriendTarget && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className={`border rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl relative ${theme.modalBg}`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-amber-500" />
                  <h4 className="text-sm font-black">Challenge @{challengeFriendTarget.username}</h4>
                </div>
                <button
                  onClick={() => setChallengeFriendTarget(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className={`text-xs font-bold block mb-2 ${theme.textMuted}`}>Select Time Control</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { m: 3, label: '3m Blitz 🔥' },
                    { m: 5, label: '5m Blitz ⏱️' },
                    { m: 10, label: '10m Rapid 🎯' }
                  ].map(t => (
                    <button
                      key={t.m}
                      onClick={() => {
                        setChallengeMinutes(t.m);
                        setIsCustomChallenge(false);
                      }}
                      className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                        !isCustomChallenge && challengeMinutes === t.m
                          ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-xs'
                          : isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                          : 'bg-slate-800 border-slate-700 text-slate-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}

                  <button
                    onClick={() => setIsCustomChallenge(true)}
                    className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                      isCustomChallenge
                        ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-xs'
                        : isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        : 'bg-slate-800 border-slate-700 text-slate-200'
                    }`}
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Custom</span>
                  </button>
                </div>

                {/* Custom Minutes Input */}
                {isCustomChallenge && (
                  <div className={`mt-2 p-2.5 rounded-xl border flex items-center gap-2 animate-fade-in ${theme.innerBox}`}>
                    <span className="text-xs font-bold text-amber-500">Minutes:</span>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={challengeCustomMinutes}
                      onChange={e => setChallengeCustomMinutes(e.target.value)}
                      className={`w-20 border rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-center ${theme.input}`}
                    />
                    <span className={`text-[11px] ${theme.textMuted}`}>(1 to 60 minutes)</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  const finalM = isCustomChallenge
                    ? Math.max(1, Math.min(60, parseInt(challengeCustomMinutes, 10) || 15))
                    : challengeMinutes;
                  handleExecuteChallenge(challengeFriendTarget, finalM);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Swords className="w-4 h-4" />
                <span>Start Match ({isCustomChallenge ? challengeCustomMinutes : challengeMinutes} min)</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
