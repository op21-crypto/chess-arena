import React, { useState, useEffect } from 'react';
import {
  Bell, Swords, UserPlus, Check, X, ShieldCheck,
  Clock, Trash2, Smartphone, Sparkles, MessageCircle, CheckCircle2
} from 'lucide-react';
import { triggerHaptic } from '../utils/device.js';
import { sound } from '../utils/audio.js';
import { safeStorage } from '../utils/storage.js';

export function NotificationsDropdown({
  isOpen,
  onClose,
  notifications = [],
  onAcceptChallenge,
  onDeclineChallenge,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onClearAll,
  isLight = false
}) {
  const [alertsEnabled, setAlertsEnabled] = useState(() => {
    const saved = safeStorage.getItem('chess_arena_mobile_alerts_enabled');
    if (saved !== null) {
      return saved === 'true';
    }
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return true; // Default to active on first install/open
  });

  const [alertNotice, setAlertNotice] = useState(null);

  const toggleAlerts = async () => {
    sound.playClick();
    triggerHaptic('move');

    if (alertsEnabled) {
      setAlertsEnabled(false);
      safeStorage.setItem('chess_arena_mobile_alerts_enabled', 'false');
      setAlertNotice('Alerts turned off');
      setTimeout(() => setAlertNotice(null), 3000);
      return;
    }

    // Turning ON
    setAlertsEnabled(true);
    safeStorage.setItem('chess_arena_mobile_alerts_enabled', 'true');
    sound.playMove();
    triggerHaptic('success');
    setAlertNotice('✓ Mobile & In-App Alerts Activated!');
    setTimeout(() => setAlertNotice(null), 3500);

    // Also attempt native browser notification permission if available
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          try {
            new Notification('Chess Arena Alerts Active', {
              body: 'You will receive game challenges and friend requests!',
              icon: '/favicon.ico'
            });
          } catch {}
        }
      } catch (err) {
        console.warn('Native notification request notice:', err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-3 sm:p-5 pt-16 animate-fade-in bg-black/40 backdrop-blur-xs">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className={`relative z-10 w-full max-w-sm rounded-3xl border shadow-2xl p-4 sm:p-5 space-y-3.5 transition-colors overflow-hidden ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-xl'
          : 'bg-slate-900 border-slate-700/80 text-white shadow-2xl shadow-black/80'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
              isLight ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
            }`}>
              <Bell className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-black flex items-center gap-1.5">
                Notifications
                {notifications.length > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950">
                    {notifications.length}
                  </span>
                )}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <button
                onClick={() => {
                  sound.playClick();
                  onClearAll();
                }}
                className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  isLight ? 'text-slate-500 hover:text-rose-600 hover:bg-slate-100' : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                }`}
                title="Clear all notifications"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Device Mobile Push Alerts Banner */}
        <div className={`p-2.5 rounded-2xl border text-xs flex items-center justify-between gap-2 transition-all ${
          alertsEnabled
            ? isLight
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-xs'
            : isLight
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-slate-800/80 border-slate-700 text-slate-300'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <Smartphone className={`w-4 h-4 shrink-0 ${alertsEnabled ? 'text-emerald-500' : 'text-amber-500'}`} />
            <div className="truncate">
              <span className="font-bold block truncate flex items-center gap-1.5">
                <span>{alertsEnabled ? 'Mobile Alerts Active' : 'Enable Mobile Alerts'}</span>
                {alertsEnabled && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 inline" />}
              </span>
              <span className={`text-[10px] block truncate ${alertsEnabled ? 'opacity-90 font-medium' : 'opacity-80'}`}>
                {alertsEnabled ? 'Invites, challenges & turns active' : 'Get notified for invites & turns'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleAlerts}
            className={`px-3 py-1 font-black text-[11px] rounded-lg shrink-0 shadow-xs cursor-pointer active:scale-95 transition-all ${
              alertsEnabled
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 ring-1 ring-emerald-400/50'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-1 ring-amber-400/50'
            }`}
            title={alertsEnabled ? 'Click to disable alerts' : 'Click to enable alerts'}
          >
            {alertsEnabled ? 'Active ✓' : 'Turn On'}
          </button>
        </div>

        {alertNotice && (
          <div className="py-1 px-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold text-center animate-fade-in">
            {alertNotice}
          </div>
        )}

        {/* Notifications Feed */}
        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
          {notifications.length === 0 ? (
            <div className={`py-10 text-center space-y-2 rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-950/40 border-slate-800 text-slate-400'
            }`}>
              <ShieldCheck className="w-8 h-8 mx-auto text-amber-500/60" />
              <p className="text-xs font-bold">All Caught Up!</p>
              <p className="text-[11px] opacity-80">No new game challenges or friend requests.</p>
            </div>
          ) : (
            notifications.map(item => {
              const isChallenge = item.type === 'challenge';
              const isFriendReq = item.type === 'friend_request';

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border space-y-2.5 transition-all shadow-xs ${
                    isLight
                      ? 'bg-slate-50/90 border-slate-200 text-slate-900'
                      : 'bg-slate-950/80 border-slate-800 text-white'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {/* User Avatar / Badge */}
                    <div className="relative shrink-0 mt-0.5">
                      <img
                        src={item.fromUser?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${item.fromUser?.username || 'player'}`}
                        alt={item.fromUser?.username}
                        className="w-9 h-9 rounded-full object-cover border border-amber-500/40"
                      />
                      <span className={`w-3.5 h-3.5 absolute -bottom-0.5 -right-0.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                        isChallenge ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-white'
                      }`}>
                        {isChallenge ? '⚔️' : '👥'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs truncate">
                          @{item.fromUser?.username || 'Player'}
                        </span>
                        <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {item.time || 'Just now'}
                        </span>
                      </div>
                      <p className={`text-xs mt-0.5 leading-snug font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        {item.message}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons for Challenges & Requests */}
                  {isChallenge && (
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        onClick={() => {
                          sound.playMatchStart();
                          triggerHaptic('move');
                          onAcceptChallenge(item);
                        }}
                        className="flex-1 py-1.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Accept & Play</span>
                      </button>
                      <button
                        onClick={() => {
                          sound.playClick();
                          onDeclineChallenge(item.id);
                        }}
                        className={`py-1.5 px-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                          isLight
                            ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                        }`}
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {isFriendReq && (
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        onClick={() => {
                          sound.playMove();
                          triggerHaptic('move');
                          onAcceptFriendRequest(item);
                        }}
                        className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept Friend</span>
                      </button>
                      <button
                        onClick={() => {
                          sound.playClick();
                          onDeclineFriendRequest(item.id);
                        }}
                        className={`py-1.5 px-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                          isLight
                            ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                        }`}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
