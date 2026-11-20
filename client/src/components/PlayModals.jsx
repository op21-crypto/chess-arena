import React, { useState, useEffect } from 'react';
import {
  Zap, Clock, Shield, Sparkles, Copy, Check, Share2, Bot, Users, X,
  UserPlus, Search, Circle, Swords, Trash2, LogIn, Send, AlertCircle
} from 'lucide-react';
import { safeStorage } from '../utils/storage.js';
import { triggerHaptic } from '../utils/device.js';

const TIME_PRESETS = [
  { id: '1m', name: '1 min', format: 'bullet', baseMinutes: 1, incrementSeconds: 0, icon: '⚡' },
  { id: '2+1', name: '2 | 1', format: 'bullet', baseMinutes: 2, incrementSeconds: 1, icon: '⚡' },
  { id: '3m', name: '3 min', format: 'blitz', baseMinutes: 3, incrementSeconds: 0, icon: '🔥' },
  { id: '3+2', name: '3 | 2', format: 'blitz', baseMinutes: 3, incrementSeconds: 2, icon: '🔥' },
  { id: '5m', name: '5 min', format: 'blitz', baseMinutes: 5, incrementSeconds: 0, icon: '🔥' },
  { id: '10m', name: '10 min', format: 'rapid', baseMinutes: 10, incrementSeconds: 0, icon: '⏳' },
  { id: '15+10', name: '15 | 10', format: 'rapid', baseMinutes: 15, incrementSeconds: 10, icon: '⏳' },
  { id: '30m', name: '30 min', format: 'classical', baseMinutes: 30, incrementSeconds: 0, icon: '🏛️' }
];

export function MatchmakingModal({ isOpen, onClose, onStartMatchmaking, isSearching, onCancelMatchmaking, initialPreset }) {
  const [selectedPreset, setSelectedPreset] = useState(() => initialPreset || TIME_PRESETS[2]); // Default 3 min Blitz

  useEffect(() => {
    if (initialPreset) {
      const matched = TIME_PRESETS.find(p => p.baseMinutes === initialPreset.baseMinutes && p.incrementSeconds === (initialPreset.incrementSeconds || 0)) || initialPreset;
      setSelectedPreset(matched);
    }
  }, [initialPreset, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Play Online Multiplayer</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Rated Matchmaking
            </span>
          </h3>
          <p className="text-xs text-slate-400">Select time control to queue against an opponent with matched ELO</p>
        </div>

        {isSearching ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full border-4 border-amber-500/30 animate-ping" />
              <span className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center text-2xl">
                ♟️
              </span>
            </div>
            <div className="text-center space-y-1">
              <span className="text-sm font-bold text-white block">Finding Opponent...</span>
              <span className="text-xs text-slate-400 font-mono">
                {selectedPreset.name} • {selectedPreset.format.toUpperCase()}
              </span>
            </div>
            <button
              onClick={onCancelMatchmaking}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
            >
              Cancel Queue
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {TIME_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPreset(p)}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    selectedPreset.id === p.id
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg shadow-amber-500/20 scale-102'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <span className="text-lg">{p.icon}</span>
                  <span className="text-xs font-mono">{p.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => onStartMatchmaking(selectedPreset)}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-2xl transition-all shadow-xl shadow-amber-500/10 transform active:scale-98"
            >
              Find Match Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
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
  onOpenAuth,
  initialTab = 'room'
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'room' | 'friends' | 'add'
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');
  const [requestStatus, setRequestStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Private Room State
  const [roomCode, setRoomCode] = useState('');
  const [selectedMinutes, setSelectedMinutes] = useState(10);
  const [colorPref, setColorPref] = useState('random');
  const [copied, setCopied] = useState(false);

  const fetchFriends = () => {
    const token = safeStorage.getItem('token');
    if (!token) return;
    setLoadingFriends(true);
    fetch('/api/friends', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setFriends(data.friends || []);
        setPending(data.pendingRequests || []);
        setLoadingFriends(false);
      })
      .catch(err => {
        console.error('Error fetching friends:', err);
        setLoadingFriends(false);
      });
  };

  useEffect(() => {
    if (isOpen) {
      fetchFriends();
      if (initialTab) setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const handleSendRequest = (e) => {
    if (e) e.preventDefault();
    if (!searchUsername.trim()) return;

    const token = safeStorage.getItem('token');
    if (!token) {
      setRequestStatus({ type: 'error', text: 'Please sign in or register to send friend requests.' });
      return;
    }

    setIsSubmitting(true);
    setRequestStatus(null);

    fetch('/api/friends/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ targetUsername: searchUsername.trim() })
    })
      .then(res => res.json())
      .then(data => {
        setIsSubmitting(false);
        if (data.success) {
          setRequestStatus({
            type: 'success',
            text: `Friend request sent to @${searchUsername.trim()}!`
          });
          setSearchUsername('');
          fetchFriends();
          triggerHaptic('move');
        } else {
          setRequestStatus({
            type: 'error',
            text: data.error || 'Failed to send friend request'
          });
        }
      })
      .catch(err => {
        setIsSubmitting(false);
        setRequestStatus({ type: 'error', text: 'Network error sending request.' });
      });
  };

  const handleRespond = (fromUserId, accept) => {
    const token = safeStorage.getItem('token');
    if (!token) return;

    fetch('/api/friends/respond', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ fromUserId, accept })
    })
      .then(res => res.json())
      .then(() => {
        fetchFriends();
        triggerHaptic('move');
      })
      .catch(err => console.error(err));
  };

  const handleRemoveFriend = (friendId) => {
    const token = safeStorage.getItem('token');
    if (!token) return;

    fetch('/api/friends/remove', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ friendId })
    })
      .then(res => res.json())
      .then(() => {
        fetchFriends();
        triggerHaptic('move');
      })
      .catch(err => console.error(err));
  };

  const handleChallenge = (friend) => {
    triggerHaptic('move');
    if (onChallengeFriend) {
      onChallengeFriend(friend);
    } else {
      onCreateRoom({
        timeControl: { baseMinutes: 5, incrementSeconds: 0 },
        colorPreference: 'random'
      });
      setActiveTab('room');
    }
  };

  if (!isOpen) return null;

  const fullShareUrl = createdRoom
    ? `${window.location.origin}/?room=${createdRoom.roomId}`
    : '';

  const copyLink = async () => {
    let success = false;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullShareUrl);
        success = true;
      }
    } catch {}

    if (!success) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = fullShareUrl;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
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
          text: '♟️ Battle me in Chess Arena! Click to join my match:',
          url: fullShareUrl
        });
        return;
      } catch {}
    }
    copyLink();
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `♟️ Battle me in Chess Arena! Click to join my match: ${fullShareUrl}`
  )}`;

  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(fullShareUrl)}&text=${encodeURIComponent(
    '♟️ Join my Chess Arena room!'
  )}`;

  const isGuest = !currentUser || currentUser.role === 'guest';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Play With Friends
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Create private match rooms, manage your Friend Arena, or make new friends
          </p>
        </div>

        {/* Navigation Tabs: Room | Friend Arena | Make Friend */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => {
              setActiveTab('room');
              triggerHaptic('move');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'room'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🎮 Custom Room</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('friends');
              triggerHaptic('move');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'friends'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Friend Arena</span>
            {friends.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                activeTab === 'friends' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
              }`}>
                {friends.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('add');
              triggerHaptic('move');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'add'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Make Friend</span>
            {pending.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white animate-pulse">
                {pending.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Custom Room */}
        {activeTab === 'room' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {createdRoom ? (
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4 animate-fade-in">
                <div className="text-center space-y-1">
                  <span className="text-xs font-semibold text-emerald-400 block">
                    ✓ Room Created! Share with your friend to begin
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Room Code: <strong className="text-amber-400">{createdRoom.roomId}</strong>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 font-semibold block">Shareable Link</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={fullShareUrl}
                      onClick={e => e.target.select()}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 select-all"
                    />
                    <button
                      onClick={copyLink}
                      className="flex items-center gap-1 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors text-xs whitespace-nowrap shadow-md"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handleNativeShare}
                    className="flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors border border-slate-700"
                  >
                    <Share2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Share</span>
                  </button>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    <span>Telegram</span>
                  </a>
                </div>

                <button
                  onClick={() => {
                    if (onEnterRoom) onEnterRoom(createdRoom);
                    onClose();
                  }}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5"
                >
                  <span>Enter Board & Wait For Friend</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Create Room Section */}
                <div className="space-y-3 p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    Create Private Match
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Time Control</label>
                      <select
                        value={selectedMinutes}
                        onChange={e => setSelectedMinutes(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="1">1 min Bullet</option>
                        <option value="3">3 min Blitz</option>
                        <option value="5">5 min Blitz</option>
                        <option value="10">10 min Rapid</option>
                        <option value="15">15 min Rapid</option>
                        <option value="30">30 min Classical</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Your Color</label>
                      <select
                        value={colorPref}
                        onChange={e => setColorPref(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="random">Random</option>
                        <option value="white">White</option>
                        <option value="black">Black</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => onCreateRoom({ timeControl: { baseMinutes: selectedMinutes, incrementSeconds: 0 }, colorPreference: colorPref })}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-md"
                  >
                    Generate Room & Link
                  </button>
                </div>

                {/* Join Room Section */}
                <div className="space-y-2 p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Join Friend's Room
                  </span>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={roomCode}
                      onChange={e => setRoomCode(e.target.value)}
                      placeholder="Enter Room Code..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={() => onJoinRoom(roomCode.trim())}
                      disabled={!roomCode.trim()}
                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold text-xs rounded-xl transition-colors"
                    >
                      Join
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Friend Arena */}
        {activeTab === 'friends' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {/* Top Toolbar in Friend Arena */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Arena Circle ({friends.length})
              </span>
              <button
                onClick={() => {
                  setActiveTab('add');
                  triggerHaptic('move');
                }}
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Make Friend</span>
              </button>
            </div>

            {/* Guest Notice */}
            {isGuest && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="text-amber-200">
                  <span className="font-bold block">Guest Mode Active</span>
                  <span className="text-[11px] text-amber-300/80">Sign in to save your friends list & receive match invites anytime.</span>
                </div>
                {onOpenAuth && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shrink-0"
                  >
                    Sign In
                  </button>
                )}
              </div>
            )}

            {/* Friends List */}
            {loadingFriends ? (
              <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <span className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span>Loading your Friend Arena...</span>
              </div>
            ) : friends.length === 0 ? (
              <div className="py-10 text-center space-y-3 bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">No Friends Added Yet</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Use the Make Friend option to send a request by username and invite opponents to battle!
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('add');
                    triggerHaptic('move');
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md inline-flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Make Friend Option</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-3 bg-slate-950/70 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <img
                          src={friend.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${friend.username}`}
                          alt={friend.username}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700 bg-slate-900"
                        />
                        <Circle
                          className={`w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5 rounded-full ${
                            friend.isOnline ? 'text-emerald-400 fill-emerald-400' : 'text-slate-600 fill-slate-600'
                          }`}
                        />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs truncate">
                            {friend.username}
                          </span>
                          <span className={`text-[9px] font-semibold ${friend.isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {friend.isOnline ? '● Online' : 'Offline'}
                          </span>
                        </div>
                        <span className="text-[11px] text-amber-400 font-mono font-bold">
                          {friend.ratings?.rapid || 1200} Rapid ELO
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleChallenge(friend)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md active:scale-95"
                        title="Challenge friend to live match"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Play</span>
                      </button>

                      <button
                        onClick={() => handleRemoveFriend(friend.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Remove from Friend Arena"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Make Friend Option (Give Request) */}
        {activeTab === 'add' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Make Friend Request Form */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-amber-400">
                <UserPlus className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Make Friend Option (Give Request)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Enter any player's username to give them a friend request directly.
              </p>

              <form onSubmit={handleSendRequest} className="space-y-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchUsername}
                    onChange={e => setSearchUsername(e.target.value)}
                    placeholder="Enter username (e.g. Magnus, Hikaru)..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!searchUsername.trim() || isSubmitting}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Sending Request...' : 'Send Friend Request'}</span>
                </button>
              </form>

              {requestStatus && (
                <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  requestStatus.type === 'success'
                    ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/15 border border-rose-500/40 text-rose-300'
                }`}>
                  {requestStatus.type === 'success' ? (
                    <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  )}
                  <span>{requestStatus.text}</span>
                </div>
              )}
            </div>

            {/* Pending Requests Section */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Incoming Friend Requests ({pending.length})
              </span>

              {pending.length === 0 ? (
                <div className="py-4 text-center text-slate-500 text-xs italic bg-slate-950/30 rounded-xl border border-slate-800/50">
                  No incoming friend requests right now.
                </div>
              ) : (
                <div className="space-y-2">
                  {pending.map((req) => (
                    <div
                      key={req.requestId}
                      className="flex items-center justify-between p-2.5 bg-slate-950/80 border border-amber-500/30 rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={req.user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${req.user?.username}`}
                          alt={req.user?.username}
                          className="w-7 h-7 rounded-full border border-amber-500/40 bg-slate-900"
                        />
                        <div>
                          <span className="font-bold text-white block">
                            {req.user?.username}
                          </span>
                          <span className="text-[10px] text-amber-400">
                            Wants to be friends
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleRespond(req.user?.id, true)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
                          title="Accept Friend Request"
                        >
                          <Check className="w-3 h-3" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleRespond(req.user?.id, false)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
                          title="Decline"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function PlayAIModal({ isOpen, onClose, onStartAIGame }) {
  const [selectedLevel, setSelectedLevel] = useState(2);
  const [selectedColor, setSelectedColor] = useState('w');

  if (!isOpen) return null;

  const AI_LEVELS = [
    { level: 1, name: 'Beginner', elo: '~800 ELO', desc: 'Makes frequent inaccuracies and tactical errors.' },
    { level: 2, name: 'Casual', elo: '~1200 ELO', desc: 'Solid fundamental openings and piece values.' },
    { level: 3, name: 'Club Player', elo: '~1600 ELO', desc: 'Sharp tactical vision and few blunders.' },
    { level: 4, name: 'Master', elo: '~2000 ELO', desc: 'Deep positional foresight and opening book.' },
    { level: 5, name: 'Grandmaster', elo: '~2500+ ELO', desc: 'Full Stockfish 19 engine calculations.' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <span>Play Against Stockfish AI</span>
          </h3>
          <p className="text-xs text-slate-400">Practice your chess openings and tactics at any difficulty</p>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-2">
          {AI_LEVELS.map((item) => (
            <div
              key={item.level}
              onClick={() => setSelectedLevel(item.level)}
              className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                selectedLevel === item.level
                  ? 'bg-indigo-500/10 border-indigo-500/80 shadow-md shadow-indigo-500/10'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white text-xs">{item.name}</span>
                <span className="text-[11px] font-mono text-indigo-400 font-bold">{item.elo}</span>
              </div>
              <p className="text-[11px] text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Color Choice */}
        <div className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-300 font-semibold">Play as</span>
          <div className="flex gap-2">
            {[
              { id: 'w', label: 'White ♔' },
              { id: 'b', label: 'Black ♚' }
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedColor(c.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedColor === c.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onStartAIGame({ level: selectedLevel, color: selectedColor })}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-2xl transition-all shadow-xl shadow-indigo-600/20"
        >
          Start AI Battle
        </button>
      </div>
    </div>
  );
}
