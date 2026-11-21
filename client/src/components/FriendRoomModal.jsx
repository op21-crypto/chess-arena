import React, { useState, useEffect, useRef } from 'react';
import {
  Users, UserPlus, Search, Swords, Trash2, Send, Check, X,
  Copy, Share2, MessageCircle, ArrowLeft, Ban, ShieldCheck,
  Clock, Flame, Zap, Trophy, Circle, MoreVertical, Sparkles,
  UserCheck, AlertCircle, RefreshCw
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

const DEFAULT_FRIENDS = [
  {
    id: 'f_magnus',
    username: 'Magnus_C',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MagnusCarlsen',
    country: 'NO',
    elo: 2882,
    isOnline: true,
    statusText: 'World #1 • Ready for Blitz',
    bio: 'Former 5x World Chess Champion'
  },
  {
    id: 'f_hikaru',
    username: 'Hikaru_N',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=HikaruNakamura',
    country: 'US',
    elo: 2875,
    isOnline: true,
    statusText: 'Online • In Arena Lobby',
    bio: 'Super GM & Blitz Maestro'
  },
  {
    id: 'f_gotham',
    username: 'Gotham_Chess',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=GothamChess',
    country: 'US',
    elo: 2410,
    isOnline: true,
    statusText: 'IM Levy • Ready to battle',
    bio: 'International Master'
  },
  {
    id: 'f_viking',
    username: 'VikingKing',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=VikingKing',
    country: 'NO',
    elo: 2840,
    isOnline: false,
    statusText: 'Arena Champion • Offline',
    bio: 'Classical Grandmaster'
  }
];

const SUGGESTED_PLAYERS = [
  {
    id: 'sug_elena',
    username: 'Elena_Tactics',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ElenaChess',
    country: 'IT',
    elo: 1845,
    isOnline: true,
    statusText: 'Tactics Enthusiast • Online'
  },
  {
    id: 'sug_arjun',
    username: 'Arjun_Knight',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ArjunKnight',
    country: 'IN',
    elo: 2150,
    isOnline: true,
    statusText: 'Rapid Specialist • Online'
  },
  {
    id: 'sug_alex',
    username: 'GM_Alexander',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=AlexanderGM',
    country: 'DE',
    elo: 2560,
    isOnline: false,
    statusText: 'Grandmaster • Offline'
  }
];

const INITIAL_DIRECT_MESSAGES = {
  f_magnus: [
    { id: 'm1', sender: 'them', text: 'Hey! Ready for some fast-paced chess in the Arena? ♟️', time: '10:14 AM' },
    { id: 'm2', sender: 'them', text: 'Send me a 3-minute or 5-minute blitz challenge whenever you want!', time: '10:15 AM' }
  ],
  f_hikaru: [
    { id: 'm1', sender: 'them', text: 'Literally let\'s play right now! Ready when you are 🔥', time: '11:30 AM' }
  ],
  f_gotham: [
    { id: 'm1', sender: 'them', text: 'Welcome to the Arena! Watch out for tactical knight forks! ⚡', time: '12:00 PM' }
  ]
};

const QUICK_CHAT_SUGGESTIONS = [
  'Ready to play? ♟️',
  'Let\'s play 3m Blitz! 🔥',
  'Good game! Great tactics 👏',
  'Want a rematch? ⚔️'
];

export function FriendRoomModal({
  isOpen,
  onClose,
  currentUser,
  onCreateRoom,
  onJoinRoom,
  createdRoom,
  onEnterRoom,
  onChallengeFriend,
  onOpenAuth,
  initialTab = 'friends',
  isLight = false
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'friends' | 'add' | 'blocked' | 'room'
  const [friends, setFriends] = useState(() => {
    try {
      const saved = safeStorage.getItem('chess_arena_friends_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_FRIENDS;
  });

  const [blockedUsers, setBlockedUsers] = useState(() => {
    try {
      const saved = safeStorage.getItem('chess_arena_blocked_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [pendingRequests, setPendingRequests] = useState(() => {
    try {
      const saved = safeStorage.getItem('chess_arena_pending_requests_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [directMessages, setDirectMessages] = useState(() => {
    try {
      const saved = safeStorage.getItem('chess_arena_dms_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_DIRECT_MESSAGES;
  });

  // Active Chat State
  const [chattingFriend, setChattingFriend] = useState(null);
  const [chatInputText, setChatInputText] = useState('');
  const chatMessagesEndRef = useRef(null);

  // Search & Add state
  const [searchUsername, setSearchUsername] = useState('');
  const [requestStatus, setRequestStatus] = useState(null);
  const [activeOptionsFriendId, setActiveOptionsFriendId] = useState(null);

  // Time control picker popover for challenge
  const [challengeFriendTarget, setChallengeFriendTarget] = useState(null);
  const [challengeMinutes, setChallengeMinutes] = useState(5);

  // Custom Room state
  const [roomCode, setRoomCode] = useState('');
  const [selectedMinutes, setSelectedMinutes] = useState(10);
  const [copied, setCopied] = useState(false);

  // Sync to safeStorage
  useEffect(() => {
    try {
      safeStorage.setItem('chess_arena_friends_v3', JSON.stringify(friends));
    } catch {}
  }, [friends]);

  useEffect(() => {
    try {
      safeStorage.setItem('chess_arena_blocked_v3', JSON.stringify(blockedUsers));
    } catch {}
  }, [blockedUsers]);

  useEffect(() => {
    try {
      safeStorage.setItem('chess_arena_pending_requests_v3', JSON.stringify(pendingRequests));
    } catch {}
  }, [pendingRequests]);

  useEffect(() => {
    try {
      safeStorage.setItem('chess_arena_dms_v3', JSON.stringify(directMessages));
    } catch {}
  }, [directMessages]);

  // Initial fetch from server API if authenticated
  useEffect(() => {
    if (isOpen) {
      if (initialTab) setActiveTab(initialTab);
      const token = safeStorage.getItem('token');
      if (token) {
        fetch('/api/friends', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data?.friends?.length) {
              setFriends(prev => {
                const existingIds = new Set(prev.map(f => f.id));
                const merged = [...prev];
                data.friends.forEach(f => {
                  if (!existingIds.has(f.id)) merged.push(f);
                });
                return merged;
              });
            }
            if (data?.pendingRequests) {
              setPendingRequests(data.pendingRequests);
            }
          })
          .catch(() => {});
      }
    }
  }, [isOpen, initialTab]);

  // Scroll chat to bottom
  useEffect(() => {
    if (chattingFriend) {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chattingFriend, directMessages]);

  if (!isOpen) return null;

  // Handlers
  const handleSendFriendRequest = (e) => {
    if (e) e.preventDefault();
    const query = searchUsername.trim();
    if (!query) return;

    // Check if user themselves
    if (currentUser && query.toLowerCase() === currentUser.username?.toLowerCase()) {
      setRequestStatus({ type: 'error', text: 'You cannot send a friend request to yourself.' });
      return;
    }

    // Check if already friends
    if (friends.some(f => f.username.toLowerCase() === query.toLowerCase())) {
      setRequestStatus({ type: 'info', text: `@${query} is already in your Friend Arena!` });
      return;
    }

    // Check if blocked
    if (blockedUsers.some(b => b.username.toLowerCase() === query.toLowerCase())) {
      setRequestStatus({ type: 'error', text: `@${query} is currently blocked. Unblock them first in the Blocked tab.` });
      return;
    }

    // Add friend
    const newFriend = {
      id: `f_${Date.now()}`,
      username: query,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${query}`,
      country: 'UN',
      elo: 1200,
      isOnline: true,
      statusText: 'Online • Mutual Friend',
      bio: 'Arena Competitor'
    };

    setFriends(prev => [newFriend, ...prev]);
    setRequestStatus({
      type: 'success',
      text: `Friend request accepted! You are now connected with @${query}.`
    });
    setSearchUsername('');
    sound.playMove();
    triggerHaptic('move');

    // Also attempt server sync
    const token = safeStorage.getItem('token');
    if (token) {
      fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ targetUsername: query })
      }).catch(() => {});
    }
  };

  const handleFollowSuggested = (player) => {
    if (friends.some(f => f.id === player.id || f.username.toLowerCase() === player.username.toLowerCase())) return;
    setFriends(prev => [player, ...prev]);
    sound.playMove();
    triggerHaptic('move');
  };

  const handleRemoveFriend = (friendId) => {
    const friend = friends.find(f => f.id === friendId);
    setFriends(prev => prev.filter(f => f.id !== friendId));
    setActiveOptionsFriendId(null);
    if (chattingFriend?.id === friendId) setChattingFriend(null);
    sound.playClick();
    triggerHaptic('move');

    const token = safeStorage.getItem('token');
    if (token) {
      fetch('/api/friends/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ friendId })
      }).catch(() => {});
    }
  };

  const handleBlockUser = (friend) => {
    setFriends(prev => prev.filter(f => f.id !== friend.id));
    setBlockedUsers(prev => [
      {
        id: friend.id,
        username: friend.username,
        avatar: friend.avatar,
        elo: friend.elo,
        blockedAt: new Date().toLocaleDateString()
      },
      ...prev
    ]);
    setActiveOptionsFriendId(null);
    if (chattingFriend?.id === friend.id) setChattingFriend(null);
    sound.playClick();
    triggerHaptic('move');
  };

  const handleUnblockAndAdd = (blocked) => {
    setBlockedUsers(prev => prev.filter(b => b.id !== blocked.id));
    const restored = {
      id: blocked.id,
      username: blocked.username,
      avatar: blocked.avatar,
      country: 'UN',
      elo: blocked.elo || 1200,
      isOnline: true,
      statusText: 'Online • Mutual Friend'
    };
    setFriends(prev => [restored, ...prev]);
    sound.playMove();
    triggerHaptic('move');
  };

  const handleStartDirectChat = (friend) => {
    setChattingFriend(friend);
    setActiveOptionsFriendId(null);
    sound.playClick();
    triggerHaptic('move');
  };

  const handleSendChatMessage = (e) => {
    if (e) e.preventDefault();
    const text = chatInputText.trim();
    if (!text || !chattingFriend) return;

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

    // Simulate smart friendly reply if chatting with bot/grandmaster
    if (targetId.startsWith('f_') || targetId.startsWith('sug_')) {
      setTimeout(() => {
        const botReplies = [
          `Great message! Let's play a 3m blitz match right now! ♟️`,
          `I am ready! Click 'Challenge' above to start our live game. 🔥`,
          `Good tactical insight! Looking forward to our next match! ⚔️`,
          `Challenge accepted! Let's meet on the board. ♔`
        ];
        const replyText = botReplies[Math.floor(Math.random() * botReplies.length)];
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
      }, 750);
    }
  };

  const handleExecuteChallenge = (friend, minutes = 5) => {
    sound.playClick();
    triggerHaptic('move');
    setChallengeFriendTarget(null);

    const config = {
      timeControl: { baseMinutes: minutes, incrementSeconds: 0 },
      colorPreference: 'random'
    };

    if (onChallengeFriend) {
      onChallengeFriend(friend, config);
    } else {
      onCreateRoom(config);
      setActiveTab('room');
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
          title: 'Chess Arena Match',
          text: '♟️ Battle me in Chess Arena! Click to join my room:',
          url: fullShareUrl
        });
        return;
      } catch {}
    }
    copyLink();
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
              Challenge friends directly, send instant private messages, or create custom rooms.
            </p>
          </div>
        )}

        {/* Navigation Tabs (Hidden when inside Direct Chat) */}
        {!chattingFriend && (
          <div className={`flex p-1 rounded-2xl border shrink-0 text-xs gap-1 ${theme.tabContainer}`}>
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
              {pendingRequests.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('blocked');
                triggerHaptic('move');
              }}
              className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'blocked' ? theme.tabActive : theme.tabInactive
              }`}
              title="Blocked Players"
            >
              <Ban className="w-3.5 h-3.5" />
              {blockedUsers.length > 0 && (
                <span className="text-[10px] font-black">({blockedUsers.length})</span>
              )}
            </button>

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
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 1: DIRECT CHAT WITH FRIEND                           */}
        {/* ========================================================= */}
        {chattingFriend ? (
          <div className="flex-1 flex flex-col min-h-0 space-y-3">
            {/* Direct Chat Top Bar */}
            <div className={`flex items-center justify-between p-2.5 rounded-2xl border shrink-0 ${theme.innerBox}`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => {
                    setChattingFriend(null);
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

              {/* Quick Challenge from Chat Header */}
              <button
                onClick={() => setChallengeFriendTarget(chattingFriend)}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Play</span>
              </button>
            </div>

            {/* Direct Message Feed */}
            <div className={`flex-1 overflow-y-auto p-3 rounded-2xl border space-y-2.5 min-h-[220px] max-h-[360px] ${
              isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-slate-950/80 border-slate-800'
            }`}>
              {(!directMessages[chattingFriend.id] || directMessages[chattingFriend.id].length === 0) ? (
                <div className="py-12 text-center space-y-1">
                  <MessageCircle className="w-8 h-8 mx-auto text-amber-500/60" />
                  <p className="text-xs font-bold">Start a conversation with @{chattingFriend.username}</p>
                  <p className={`text-[11px] ${theme.textMuted}`}>Say hi or send a match challenge!</p>
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
                placeholder={`Message @${chattingFriend.username}...`}
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
            {/* TAB 1: FRIENDS LIST (ARENA CIRCLE)                        */}
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
                        Add opponents or follow featured masters below to chat and play!
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
                      <span>Find & Add Friends</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {friends.map(friend => {
                      const flag = COUNTRY_FLAGS[friend.country] || '🌐';
                      const hasOptionsOpen = activeOptionsFriendId === friend.id;

                      return (
                        <div
                          key={friend.id}
                          className={`p-3 rounded-2xl border transition-all relative ${theme.card}`}
                        >
                          <div className="flex items-center justify-between gap-2.5">
                            {/* Avatar & Info */}
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

                              <div className="min-w-0 truncate">
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className="font-bold text-xs sm:text-sm truncate">{friend.username}</span>
                                  <span className="text-xs" title={friend.country}>{flag}</span>
                                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${theme.badge}`}>
                                    {friend.elo}
                                  </span>
                                </div>
                                <span className={`text-[11px] block truncate mt-0.5 ${friend.isOnline ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : theme.textMuted}`}>
                                  {friend.statusText || (friend.isOnline ? 'Online • Ready to play' : 'Offline')}
                                </span>
                              </div>
                            </div>

                            {/* Action Buttons: Play | Chat | Options */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Direct Challenge Button */}
                              <button
                                onClick={() => setChallengeFriendTarget(friend)}
                                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                                title="Challenge to live match"
                              >
                                <Swords className="w-3.5 h-3.5" />
                                <span>Play</span>
                              </button>

                              {/* Direct Chat Button */}
                              <button
                                onClick={() => handleStartDirectChat(friend)}
                                className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                                  isLight
                                    ? 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700'
                                    : 'bg-indigo-950/60 hover:bg-indigo-900/60 border-indigo-500/30 text-indigo-300'
                                }`}
                                title="Open Direct Chat"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>

                              {/* More Options Dropdown Toggle */}
                              <button
                                onClick={() => setActiveOptionsFriendId(hasOptionsOpen ? null : friend.id)}
                                className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                                  isLight
                                    ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
                                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                                }`}
                                title="Friend options"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Options Popover Menu */}
                          {hasOptionsOpen && (
                            <div className={`mt-2.5 pt-2.5 border-t flex items-center justify-end gap-2 animate-fade-in ${
                              isLight ? 'border-slate-200' : 'border-slate-800'
                            }`}>
                              <button
                                onClick={() => handleBlockUser(friend)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                  isLight ? 'text-amber-800 hover:bg-amber-50' : 'text-amber-400 hover:bg-amber-950/40'
                                }`}
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>Block Player</span>
                              </button>

                              <button
                                onClick={() => handleRemoveFriend(friend.id)}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-500 hover:bg-rose-500/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove Friend</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quick Add Suggestions Strip */}
                <div className={`p-3.5 rounded-2xl border space-y-2 mt-3 ${theme.innerBox}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-amber-500">
                      <Sparkles className="w-3.5 h-3.5" />
                      Suggested Arena Players
                    </span>
                    <button
                      onClick={() => setActiveTab('add')}
                      className={`text-[11px] font-bold ${isLight ? 'text-indigo-600 hover:underline' : 'text-indigo-400 hover:underline'}`}
                    >
                      View All
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {SUGGESTED_PLAYERS.map(sug => {
                      const isAlreadyFriend = friends.some(f => f.username.toLowerCase() === sug.username.toLowerCase());
                      return (
                        <div
                          key={sug.id}
                          className={`p-2 rounded-xl border flex items-center justify-between gap-2 ${
                            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img src={sug.avatar} alt={sug.username} className="w-7 h-7 rounded-full shrink-0" />
                            <div className="truncate">
                              <span className="text-xs font-bold block truncate">{sug.username}</span>
                              <span className={`text-[10px] ${theme.textMuted}`}>{sug.elo} Rapid</span>
                            </div>
                          </div>

                          {isAlreadyFriend ? (
                            <span className="text-[10px] text-emerald-600 font-bold px-2 py-0.5">Added</span>
                          ) : (
                            <button
                              onClick={() => handleFollowSuggested(sug)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] rounded-lg shadow-xs cursor-pointer active:scale-95"
                            >
                              + Add
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 2: ADD / FOLLOW / INCOMING REQUESTS                   */}
            {/* ========================================================= */}
            {activeTab === 'add' && (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {/* Search & Follow Form */}
                <div className={`p-4 rounded-2xl border space-y-3 ${theme.innerBox}`}>
                  <div className="flex items-center gap-2 text-amber-500">
                    <UserPlus className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-wider">
                      Add Friend by Username
                    </span>
                  </div>
                  <p className={`text-xs ${theme.textMuted}`}>
                    Enter any player's username to connect, chat, and invite them to live matches.
                  </p>

                  <form onSubmit={handleSendFriendRequest} className="space-y-2">
                    <div className="relative">
                      <Search className={`w-4 h-4 absolute left-3 top-2.5 ${theme.textMuted}`} />
                      <input
                        type="text"
                        value={searchUsername}
                        onChange={e => setSearchUsername(e.target.value)}
                        placeholder="e.g. Magnus, Hikaru, GM_Alex..."
                        className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-500 ${theme.input}`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!searchUsername.trim()}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Send Friend Request / Follow</span>
                    </button>
                  </form>

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
                </div>

                {/* Incoming Requests */}
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider block">
                    Incoming Requests ({pendingRequests.length})
                  </span>

                  {pendingRequests.length === 0 ? (
                    <div className={`py-3 text-center text-xs rounded-xl border ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-950/40 border-slate-800 text-slate-400'
                    }`}>
                      No pending incoming requests right now.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pendingRequests.map(req => (
                        <div
                          key={req.requestId}
                          className={`flex items-center justify-between p-2.5 rounded-xl border ${theme.card}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={req.user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${req.user?.username}`}
                              alt={req.user?.username}
                              className="w-8 h-8 rounded-full border border-amber-500/30"
                            />
                            <div>
                              <span className="font-bold text-xs block">{req.user?.username}</span>
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Wants to connect</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setFriends(p => [req.user, ...p]);
                                setPendingRequests(p => p.filter(r => r.requestId !== req.requestId));
                                sound.playMove();
                                triggerHaptic('move');
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => {
                                setPendingRequests(p => p.filter(r => r.requestId !== req.requestId));
                                triggerHaptic('move');
                              }}
                              className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                                isLight ? 'bg-white border-slate-200 text-slate-500 hover:text-rose-600' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-rose-400'
                              }`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recommended Players Carousel */}
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider block">
                    Recommended Arena Masters & Bot Opponents
                  </span>
                  <div className="space-y-2">
                    {SUGGESTED_PLAYERS.map(player => {
                      const isFriend = friends.some(f => f.username.toLowerCase() === player.username.toLowerCase());
                      return (
                        <div
                          key={player.id}
                          className={`flex items-center justify-between p-3 rounded-2xl border ${theme.card}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img src={player.avatar} alt={player.username} className="w-9 h-9 rounded-full border border-amber-500/30" />
                            <div className="truncate">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs truncate">{player.username}</span>
                                <span>{COUNTRY_FLAGS[player.country] || '🌐'}</span>
                                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${theme.badge}`}>
                                  {player.elo}
                                </span>
                              </div>
                              <span className={`text-[11px] block ${theme.textMuted}`}>{player.statusText}</span>
                            </div>
                          </div>

                          {isFriend ? (
                            <span className="text-xs text-emerald-600 font-bold px-3 py-1 flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Friends</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleFollowSuggested(player)}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Follow</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 3: BLOCKED PLAYERS (UNBLOCK & ADD AGAIN)              */}
            {/* ========================================================= */}
            {activeTab === 'blocked' && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-rose-500">
                    <Ban className="w-3.5 h-3.5" />
                    Blocked Players ({blockedUsers.length})
                  </span>
                </div>

                {blockedUsers.length === 0 ? (
                  <div className={`py-12 text-center space-y-2 rounded-2xl border ${theme.innerBox}`}>
                    <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500" />
                    <p className="text-xs font-bold">No Blocked Players</p>
                    <p className={`text-[11px] max-w-xs mx-auto ${theme.textMuted}`}>
                      Players you block will appear here. You can unblock and re-add them at any time.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {blockedUsers.map(blocked => (
                      <div
                        key={blocked.id}
                        className={`flex items-center justify-between p-3 rounded-2xl border ${theme.card}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={blocked.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${blocked.username}`}
                            alt={blocked.username}
                            className="w-9 h-9 rounded-full opacity-70 border border-slate-600 grayscale"
                          />
                          <div className="truncate">
                            <span className="font-bold text-xs block truncate">{blocked.username}</span>
                            <span className={`text-[10px] block ${theme.textMuted}`}>Blocked on {blocked.blockedAt || 'Recent'}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleUnblockAndAdd(blocked)}
                          className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                          title="Unblock and add back to friends"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Unblock & Add</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 4: CUSTOM MATCH ROOM & CODES                         */}
            {/* ========================================================= */}
            {activeTab === 'room' && (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {createdRoom ? (
                  <div className={`p-4 border rounded-2xl space-y-4 animate-fade-in ${theme.innerBox}`}>
                    <div className="text-center space-y-1">
                      <span className="text-xs font-black text-emerald-500 block">
                        ✓ Private Room Ready! Share code with your opponent
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
                          <span>Enter Board Now</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Setup Room Parameters */}
                    <div className={`p-4 border rounded-2xl space-y-3 ${theme.innerBox}`}>
                      <span className="text-xs font-black uppercase tracking-wider block text-amber-500">
                        Create Private Room
                      </span>

                      {/* Time Presets */}
                      <div>
                        <label className={`text-[11px] font-bold block mb-1.5 ${theme.textMuted}`}>Time Control</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { m: 1, label: '1m Bullet', icon: '⚡' },
                            { m: 3, label: '3m Blitz', icon: '🔥' },
                            { m: 5, label: '5m Blitz', icon: '⏱️' },
                            { m: 10, label: '10m Rapid', icon: '🎯' }
                          ].map(t => (
                            <button
                              key={t.m}
                              type="button"
                              onClick={() => {
                                setSelectedMinutes(t.m);
                                triggerHaptic('move');
                              }}
                              className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                                selectedMinutes === t.m
                                  ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-xs'
                                  : isLight
                                  ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <span>{t.icon} {t.m}m</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => onCreateRoom({ timeControl: { baseMinutes: selectedMinutes, incrementSeconds: 0 }, colorPreference: 'random' })}
                        className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-98"
                      >
                        Generate Room & Link
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
          </>
        )}

        {/* ========================================================= */}
        {/* MODAL: TIME CONTROL SELECTOR FOR CHALLENGING FRIEND       */}
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
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { m: 1, label: '1m Bullet ⚡' },
                    { m: 3, label: '3m Blitz 🔥' },
                    { m: 5, label: '5m Blitz ⏱️' },
                    { m: 10, label: '10m Rapid 🎯' }
                  ].map(t => (
                    <button
                      key={t.m}
                      onClick={() => setChallengeMinutes(t.m)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        challengeMinutes === t.m
                          ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-xs'
                          : isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                          : 'bg-slate-800 border-slate-700 text-slate-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleExecuteChallenge(challengeFriendTarget, challengeMinutes)}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Swords className="w-4 h-4" />
                <span>Start Match ({challengeMinutes} min)</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
