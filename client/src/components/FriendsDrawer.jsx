import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Swords, Check, X, Search, Circle } from 'lucide-react';
import { safeStorage } from '../utils/storage.js';

export function FriendsDrawer({ currentUser, isOpen, onClose, onChallengeFriend }) {
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [message, setMessage] = useState('');

  const fetchFriends = () => {
    fetch('/api/friends', {
      headers: {
        'Authorization': `Bearer ${safeStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setFriends(data.friends || []);
        setPending(data.pendingRequests || []);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (isOpen) {
      fetchFriends();
    }
  }, [isOpen]);

  const handleSendRequest = (e) => {
    e.preventDefault();
    if (!searchUsername.trim()) return;

    fetch('/api/friends/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${safeStorage.getItem('token')}`
      },
      body: JSON.stringify({ targetUsername: searchUsername.trim() })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMessage('Friend request sent!');
          setSearchUsername('');
        } else {
          setMessage(data.error || 'Failed to send request');
        }
        setTimeout(() => setMessage(''), 3000);
      });
  };

  const handleRespond = (fromUserId, accept) => {
    fetch('/api/friends/respond', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${safeStorage.getItem('token')}`
      },
      body: JSON.stringify({ fromUserId, accept })
    })
      .then(res => res.json())
      .then(() => fetchFriends());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-sm bg-slate-900 border-l border-slate-800 h-full p-4 flex flex-col space-y-4 shadow-2xl animate-slide-left">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Friend Arena</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Friend Form */}
        <form onSubmit={handleSendRequest} className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchUsername}
              onChange={e => setSearchUsername(e.target.value)}
              placeholder="Add friend by username..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors"
          >
            Send Friend Request
          </button>
          {message && (
            <p className="text-xs text-center text-amber-400 font-medium">{message}</p>
          )}
        </form>

        {/* Pending Requests */}
        {pending.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              Pending Requests ({pending.length})
            </span>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {pending.map((req) => (
                <div key={req.requestId} className="flex items-center justify-between p-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs">
                  <span className="font-semibold text-slate-200">{req.user?.username}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleRespond(req.user?.id, true)}
                      className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                      title="Accept"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRespond(req.user?.id, false)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400"
                      title="Decline"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Friends ({friends.length})
          </span>

          {friends.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs italic">
              No friends added yet. Search players above to build your arena circle!
            </div>
          ) : (
            friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative">
                    <img
                      src={friend.avatar}
                      alt={friend.username}
                      className="w-8 h-8 rounded-full border border-slate-700"
                    />
                    <Circle
                      className={`w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5 rounded-full ${
                        friend.isOnline ? 'text-emerald-400 fill-emerald-400' : 'text-slate-600 fill-slate-600'
                      }`}
                    />
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-white text-xs block truncate">
                      {friend.username}
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">
                      {friend.ratings?.rapid || 1200} ELO
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onChallengeFriend && onChallengeFriend(friend)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold rounded-lg transition-colors"
                  title="Challenge friend to match"
                >
                  <Swords className="w-3 h-3" />
                  <span>Play</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
