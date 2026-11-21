import React, { useState, useEffect } from 'react';
import {
  Zap, Clock, Shield, Sparkles, Copy, Check, Share2, Bot, Users, X,
  UserPlus, Search, Circle, Swords, Trash2, LogIn, Send, AlertCircle,
  Cpu, Crown, Dices, Flame, Trophy
} from 'lucide-react';
import { safeStorage } from '../utils/storage.js';
import { triggerHaptic } from '../utils/device.js';
import { sound } from '../utils/audio.js';

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

export function MatchmakingModal({ isOpen, onClose, onStartMatchmaking, isSearching, onCancelMatchmaking, initialPreset, isLight = false }) {
  const [selectedPreset, setSelectedPreset] = useState(() => initialPreset || TIME_PRESETS[2]); // Default 3 min Blitz

  useEffect(() => {
    if (initialPreset) {
      const matched = TIME_PRESETS.find(p => p.baseMinutes === initialPreset.baseMinutes && p.incrementSeconds === (initialPreset.incrementSeconds || 0)) || initialPreset;
      setSelectedPreset(matched);
    }
  }, [initialPreset, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className={`border rounded-3xl p-5 max-w-sm sm:max-w-md w-full space-y-4 shadow-2xl relative transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900'
          : 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-slate-700/80 text-slate-100'
      }`}>
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className={`absolute top-4 right-4 p-1.5 rounded-xl border transition-colors cursor-pointer ${
            isLight
              ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <h3 className={`text-lg font-black flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Swords className="w-5 h-5 text-amber-500" />
            <span>Play Online</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
              isLight
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}>
              Rated Matchmaking
            </span>
          </h3>
          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Choose your time control to find a rated opponent worldwide</p>
        </div>

        {isSearching ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full border-4 border-amber-500/30 animate-ping" />
              <span className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl ${
                isLight ? 'bg-amber-50 border-amber-400' : 'bg-amber-500/10 border-amber-500'
              }`}>
                ♟️
              </span>
            </div>
            <div className="text-center space-y-1">
              <span className={`text-sm font-bold block ${isLight ? 'text-slate-900' : 'text-white'}`}>Finding Opponent...</span>
              <span className="text-xs text-amber-500 font-mono font-bold">
                {selectedPreset.name} • {selectedPreset.format.toUpperCase()}
              </span>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                triggerHaptic('move');
                onCancelMatchmaking();
              }}
              className={`px-6 py-2 font-semibold text-xs rounded-xl transition-colors cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Cancel Queue
            </button>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-4 gap-2">
              {TIME_PRESETS.map((p) => {
                const isSelected = selectedPreset.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      sound.playClick();
                      triggerHaptic('move');
                      setSelectedPreset(p);
                    }}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/40'
                        : isLight
                        ? 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="text-lg">{p.icon}</span>
                    <span className="text-xs font-mono font-bold">{p.name}</span>
                    <span className={`text-[9px] uppercase font-semibold ${isSelected ? 'text-slate-900' : (isLight ? 'text-slate-500' : 'text-slate-500')}`}>
                      {p.format}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                sound.playMove();
                triggerHaptic('impact');
                onStartMatchmaking(selectedPreset);
              }}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm rounded-2xl transition-all shadow-xl shadow-amber-500/25 transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <Swords className="w-4.5 h-4.5" />
              <span>Find Match Now ({selectedPreset.name})</span>
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
  initialTab = 'room',
  isLight = false
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
      <div className={`border rounded-3xl p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900'
          : 'bg-slate-900 border-slate-700/80 text-white'
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors z-10 cursor-pointer ${
            isLight
              ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-8">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
              isLight ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}>
              <Users className="w-4 h-4" />
            </div>
            <h3 className={`text-lg sm:text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Play With Friends
            </h3>
          </div>
          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Create private match rooms, manage your Friend Arena, or make new friends
          </p>
        </div>

        {/* Navigation Tabs: Room | Friend Arena | Make Friend */}
        <div className={`flex p-1 rounded-2xl border shrink-0 ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <button
            onClick={() => {
              setActiveTab('room');
              triggerHaptic('move');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'room'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🎮 Custom Room</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('friends');
              triggerHaptic('move');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'friends'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Friend Arena</span>
            {friends.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                activeTab === 'friends'
                  ? 'bg-slate-950 text-amber-400'
                  : isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
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
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'add'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
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
              <div className={`p-4 border rounded-2xl space-y-4 animate-fade-in ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
              }`}>
                <div className="text-center space-y-1">
                  <span className="text-xs font-semibold text-emerald-500 block">
                    ✓ Room Created! Share with your friend to begin
                  </span>
                  <span className={`text-[11px] font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Room Code: <strong className="text-amber-500">{createdRoom.roomId}</strong>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className={`text-[11px] font-semibold block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Shareable Link</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={fullShareUrl}
                      onClick={e => e.target.select()}
                      className={`flex-1 rounded-xl px-3 py-2 text-xs font-mono select-all border ${
                        isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-200'
                      }`}
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
                    className={`flex items-center justify-center gap-1.5 py-2 font-bold text-xs rounded-xl transition-colors border ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
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
                <div className={`space-y-3 p-4 border rounded-2xl ${
                  isLight ? 'bg-slate-50 border-slate-200 shadow-xs' : 'bg-slate-950/50 border-slate-800'
                }`}>
                  <span className={`text-xs font-black uppercase tracking-wider block ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
                    Create Private Match
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={`text-[11px] block mb-1 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>Time Control</label>
                      <select
                        value={selectedMinutes}
                        onChange={e => setSelectedMinutes(Number(e.target.value))}
                        className={`w-full border rounded-xl px-2.5 py-1.5 text-xs ${
                          isLight ? 'bg-white border-slate-300 text-slate-900 focus:border-amber-500' : 'bg-slate-900 border-slate-700 text-white'
                        }`}
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
                      <label className={`text-[11px] block mb-1 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>Your Color</label>
                      <select
                        value={colorPref}
                        onChange={e => setColorPref(e.target.value)}
                        className={`w-full border rounded-xl px-2.5 py-1.5 text-xs ${
                          isLight ? 'bg-white border-slate-300 text-slate-900 focus:border-amber-500' : 'bg-slate-900 border-slate-700 text-white'
                        }`}
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
                <div className={`space-y-2 p-4 border rounded-2xl ${
                  isLight ? 'bg-slate-50 border-slate-200 shadow-xs' : 'bg-slate-950/50 border-slate-800'
                }`}>
                  <span className={`text-xs font-black uppercase tracking-wider block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Join Friend's Room
                  </span>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={roomCode}
                      onChange={e => setRoomCode(e.target.value)}
                      placeholder="Enter Room Code..."
                      className={`flex-1 border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500 ${
                        isLight ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                      }`}
                    />
                    <button
                      onClick={() => onJoinRoom(roomCode.trim())}
                      disabled={!roomCode.trim()}
                      className={`px-4 py-1.5 disabled:opacity-40 font-bold text-xs rounded-xl transition-colors ${
                        isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}>
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
              <span className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                Arena Circle ({friends.length})
              </span>
              <button
                onClick={() => {
                  setActiveTab('add');
                  triggerHaptic('move');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 font-bold text-xs rounded-xl transition-all border ${
                  isLight
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-400 shadow-xs'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-300'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Make Friend</span>
              </button>
            </div>

            {/* Guest Notice */}
            {isGuest && (
              <div className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs border ${
                isLight
                  ? 'bg-amber-50 border-amber-300 text-slate-900 shadow-xs'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              }`}>
                <div>
                  <span className={`font-black block text-xs ${isLight ? 'text-amber-950' : 'text-amber-200'}`}>Guest Mode Active</span>
                  <span className={`text-[11px] font-medium ${isLight ? 'text-amber-900' : 'text-amber-300/80'}`}>Sign in to save your friends list & receive match invites anytime.</span>
                </div>
                {onOpenAuth && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shrink-0 shadow-xs cursor-pointer"
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
              <div className={`py-10 text-center space-y-3 border rounded-2xl p-4 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800/80'
              }`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
                  isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>No Friends Added Yet</h4>
                  <p className={`text-xs mt-1 max-w-xs mx-auto font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Use the Make Friend option to send a request by username and invite opponents to battle!
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('add');
                    triggerHaptic('move');
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer"
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
                    className={`flex items-center justify-between p-3 border rounded-2xl transition-colors ${
                    isLight ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
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
                          <span className={`font-bold text-xs truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
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
            <div className={`p-4 border rounded-2xl space-y-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
              <div className="flex items-center gap-2 text-amber-400">
                <UserPlus className="w-4 h-4" />
                <span className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Make Friend Option (Give Request)
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
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
                    className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-500 ${
                    isLight ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                  }`}
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
              <span className={`text-[11px] font-black uppercase tracking-wider block ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                Incoming Friend Requests ({pending.length})
              </span>

              {pending.length === 0 ? (
                <div className={`py-4 text-center text-xs italic rounded-xl border ${
                  isLight ? 'bg-slate-100/80 border-slate-200 text-slate-500 font-medium' : 'bg-slate-950/30 border-slate-800/50 text-slate-500'
                }`}>
                  No incoming friend requests right now.
                </div>
              ) : (
                <div className="space-y-2">
                  {pending.map((req) => (
                    <div
                      key={req.requestId}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-xs border ${
                        isLight ? "bg-white border-slate-200 text-slate-900 shadow-2xs" : "bg-slate-950/80 border-amber-500/30 text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={req.user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${req.user?.username}`}
                          alt={req.user?.username}
                          className={`w-7 h-7 rounded-full border ${isLight ? "border-amber-400 bg-slate-100" : "border-amber-500/40 bg-slate-900"}`}
                        />
                        <div>
                          <span className={`font-bold block ${isLight ? "text-slate-900" : "text-white"}`}>
                            {req.user?.username}
                          </span>
                          <span className={`text-[10px] font-bold ${isLight ? "text-amber-700" : "text-amber-400"}`}>
                            Wants to be friends
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleRespond(req.user?.id, true)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                          title="Accept Friend Request"
                        >
                          <Check className="w-3 h-3" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleRespond(req.user?.id, false)}
                          className={`p-1 rounded-lg transition-colors cursor-pointer ${
                            isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-600" : "bg-slate-800 hover:bg-slate-700 text-slate-400"
                          }`}
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

export function PlayAIModal({ isOpen, onClose, onStartAIGame, isLight = false }) {
  const [selectedLevel, setSelectedLevel] = useState(2);
  const [selectedTime, setSelectedTime] = useState(10); // minutes (0 = unlimited)

  if (!isOpen) return null;

  const AI_LEVELS = [
    { level: 1, name: 'Beginner Sensei', anime: 'Tanjiro & Deku', elo: '800 ELO', icon: '🐣' },
    { level: 2, name: 'Casual Tactician', anime: 'Killua & Zoro', elo: '1200 ELO', icon: '🛡️' },
    { level: 3, name: 'Master Strategist', anime: 'Itachi & Levi', elo: '1600 ELO', icon: '⚔️' },
    { level: 4, name: 'FIDE Mastermind', anime: 'Lelouch & Light', elo: '2000 ELO', icon: '💎' },
    { level: 5, name: 'Grandmaster Deity', anime: 'Gojo & Meruem', elo: '2500+ ELO', icon: '👑' }
  ];

  const TIME_OPTIONS = [
    { minutes: 10, label: '10 min', sub: 'Rapid' },
    { minutes: 5, label: '5 min', sub: 'Blitz' },
    { minutes: 3, label: '3 min', sub: 'Fast' },
    { minutes: 0, label: 'No Clock', sub: 'Casual' }
  ];

  const currentLevelObj = AI_LEVELS.find((l) => l.level === selectedLevel) || AI_LEVELS[1];

  const handlePlay = (lvl = selectedLevel) => {
    sound.playMove();
    triggerHaptic('impact');
    onStartAIGame({
      level: lvl,
      color: 'w',
      timeMinutes: selectedTime
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className={`border rounded-3xl p-4 sm:p-5 max-w-sm sm:max-w-md w-full shadow-2xl relative space-y-3.5 transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900'
          : 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-slate-700/80 text-slate-100'
      }`}>
        {/* Subtle background glow */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className={`flex items-center justify-between pb-2.5 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
              isLight ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
            }`}>
              <Bot className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className={`text-sm sm:text-base font-black tracking-tight flex items-center gap-1.5 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                Play Stockfish AI
              </h3>
              <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Choose difficulty & start playing</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 5 Difficulty Tiers (Clean: Name + Elo) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Select Difficulty
            </span>
            <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
              {currentLevelObj.name} • {currentLevelObj.elo}
            </span>
          </div>

          <div className="space-y-1.5">
            {AI_LEVELS.map((item) => {
              const isSelected = selectedLevel === item.level;
              return (
                <div
                  key={item.level}
                  onClick={() => {
                    sound.playClick();
                    triggerHaptic('move');
                    setSelectedLevel(item.level);
                  }}
                  className={`px-3 py-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer select-none active:scale-[0.99] ${
                    isSelected
                      ? isLight
                        ? 'bg-amber-50 border-amber-400 shadow-sm ring-1 ring-amber-300'
                        : 'bg-amber-500/15 border-amber-500/60 shadow-md ring-1 ring-amber-400/30'
                      : isLight
                      ? 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                      : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base">{item.icon}</span>
                    <div className="min-w-0">
                      <span className={`text-xs sm:text-sm font-bold block truncate ${
                        isSelected
                          ? isLight ? 'text-amber-950 font-black' : 'text-white font-black'
                          : isLight ? 'text-slate-800' : 'text-white'
                      }`}>
                        {item.name}
                      </span>
                      <span className={`text-[10px] block truncate ${
                        isSelected
                          ? isLight ? 'text-amber-700 font-semibold' : 'text-amber-300 font-semibold'
                          : isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        {item.anime}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                      isSelected
                        ? isLight
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : isLight
                        ? 'bg-white text-slate-600 border-slate-200'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}>
                      {item.elo}
                    </span>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : isLight
                        ? 'border border-slate-300 bg-white'
                        : 'border border-slate-700 bg-slate-950'
                    }`}>
                      {isSelected ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Control Selection */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Time Control
            </span>
            <span className={`text-[10px] font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {selectedTime === 0 ? 'No clock' : `${selectedTime} min`}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {TIME_OPTIONS.map((t) => {
              const isSelected = selectedTime === t.minutes;
              return (
                <button
                  key={t.minutes}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    triggerHaptic('move');
                    setSelectedTime(t.minutes);
                  }}
                  className={`py-1.5 px-1 rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? isLight
                        ? 'bg-sky-50 border-sky-400 text-sky-800 ring-1 ring-sky-300 shadow-sm'
                        : 'bg-sky-500/20 border-sky-400 text-sky-300 ring-1 ring-sky-400/40 shadow-sm'
                      : isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className="text-[11px] font-bold block truncate leading-tight">
                    {t.label}
                  </span>
                  <span className={`text-[9px] block truncate ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                    {t.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Click & Play Premium Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => handlePlay(selectedLevel)}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Swords className="w-4 h-4 stroke-[2.5]" />
            <span>Play vs {currentLevelObj.name} ({currentLevelObj.elo})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
