import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Bot, LogOut, Sword, Wifi, Clock, Zap } from 'lucide-react';

const DYNAMIC_MESSAGES = [
  { emoji: '🏃', text: 'Your friend is on the way...' },
  { emoji: '📱', text: 'Invite link sent! Waiting...' },
  { emoji: '⚔️', text: 'Preparing for battle...' },
  { emoji: '🎯', text: 'Friend is joining soon...' },
  { emoji: '🔗', text: 'Room link is live & active!' },
  { emoji: '♟️', text: 'The board awaits your rival...' },
  { emoji: '🛡️', text: 'Clocks frozen until first move.' },
  { emoji: '🌐', text: 'Scanning for your friend...' },
  { emoji: '🏆', text: 'Epic match about to begin...' },
  { emoji: '🔥', text: 'Your opponent is incoming!' },
];

export function WaitingLounge({
  isLight = false,
  roomId = '',
  timeControl = 5,
  onCopyLink,
  onPlayBot,
  onExit,
}) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [copyFlash, setCopyFlash] = useState(false);
  const [radarPulse, setRadarPulse] = useState(0); // 0,1,2 — ring animations

  // Rotate dynamic messages every 2.8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % DYNAMIC_MESSAGES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // Radar ring pulse every 1.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setRadarPulse((p) => (p + 1) % 3);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = useCallback(() => {
    onCopyLink?.();
    setCopyFlash(true);
    setTimeout(() => setCopyFlash(false), 1800);
  }, [onCopyLink]);

  const { emoji, text } = DYNAMIC_MESSAGES[msgIndex];

  return (
    <div
      className={`w-full max-w-[520px] rounded-2xl border shadow-2xl overflow-hidden animate-fade-in mb-2 ${
        isLight
          ? 'bg-gradient-to-br from-amber-50 via-white to-orange-50 border-amber-300'
          : 'bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border-amber-500/50'
      }`}
    >
      {/* Top Header Row */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 border-b ${
          isLight ? 'border-amber-200/60 bg-amber-500/10' : 'border-amber-500/20 bg-amber-500/5'
        }`}
      >
        <div className="flex items-center gap-2">
          {/* Live blinking dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
          </span>
          <span className={`font-black text-[11px] uppercase tracking-widest ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
            Room Lounge
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className={`w-3 h-3 ${isLight ? 'text-amber-600' : 'text-amber-500'}`} />
          <span className={`text-[11px] font-mono font-bold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
            {timeControl}m
          </span>
          <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ml-1 ${
            isLight
              ? 'bg-amber-100 border-amber-300 text-amber-800'
              : 'bg-amber-500/20 border-amber-500/30 text-amber-300'
          }`}>
            {roomId}
          </span>
        </div>
      </div>

      {/* Main Animated Area */}
      <div className="px-4 py-4 flex items-center gap-4">
        {/* Radar Animation */}
        <div className="relative shrink-0 w-14 h-14 flex items-center justify-center">
          {/* Radar rings */}
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`absolute rounded-full border-2 transition-all duration-700 ${
                isLight ? 'border-amber-400' : 'border-amber-500'
              } ${radarPulse >= i ? 'opacity-100' : 'opacity-20'}`}
              style={{
                width: `${28 + i * 16}px`,
                height: `${28 + i * 16}px`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
          {/* Center chess knight */}
          <div
            className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg ${
              isLight ? 'bg-amber-500 text-white' : 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
            }`}
          >
            ♞
          </div>
        </div>

        {/* Dynamic text messages */}
        <div className="flex-1 min-w-0">
          <div
            key={msgIndex}
            className="flex items-center gap-1.5 animate-fade-in"
          >
            <span className="text-lg leading-none">{emoji}</span>
            <span
              className={`text-sm font-bold truncate ${
                isLight ? 'text-slate-800' : 'text-slate-100'
              }`}
            >
              {text}
            </span>
          </div>
          <p className={`text-[11px] mt-1 leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Clocks & board frozen — both start the moment your friend enters the room.
          </p>

          {/* Connecting dots animation */}
          <div className="flex items-center gap-1 mt-2">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`inline-block w-1.5 h-1.5 rounded-full animate-bounce ${
                  isLight ? 'bg-amber-500' : 'bg-amber-400'
                }`}
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
            <span className={`text-[10px] ml-1 font-mono ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              Waiting for connection...
            </span>
          </div>
        </div>
      </div>

      {/* Chessboard side approaching animation */}
      <div
        className={`mx-4 mb-3 px-3 py-2 rounded-xl border flex items-center gap-2 overflow-hidden ${
          isLight
            ? 'bg-white border-slate-200'
            : 'bg-slate-800/60 border-slate-700'
        }`}
      >
        {/* Moving chess piece animation */}
        <div className="relative w-full h-6 flex items-center overflow-hidden">
          <span
            className={`absolute text-base animate-bounce ${isLight ? 'text-amber-600' : 'text-amber-400'}`}
            style={{
              animation: 'slideIn 2.5s ease-in-out infinite',
            }}
          >
            ♟
          </span>
          <div className={`w-full h-0.5 rounded-full ${isLight ? 'bg-slate-200' : 'bg-slate-700'}`} />
          <span className={`absolute right-0 text-base ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>⚔</span>
        </div>
        <style>{`
          @keyframes slideIn {
            0% { left: 0%; opacity: 0.4; transform: scale(0.8); }
            50% { left: 70%; opacity: 1; transform: scale(1.2); }
            100% { left: 85%; opacity: 0.6; transform: scale(1); }
          }
        `}</style>
      </div>

      {/* Action Buttons */}
      <div className={`px-4 pb-4 flex flex-wrap items-center gap-2`}>
        {/* Copy Invite Link */}
        <button
          onClick={handleCopy}
          className={`px-3.5 py-2 font-black text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all ${
            copyFlash
              ? 'bg-emerald-500 text-white scale-95'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
          }`}
        >
          {copyFlash ? (
            <Zap className="w-3.5 h-3.5" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          <span>{copyFlash ? 'Link Copied!' : 'Copy Invite Link'}</span>
        </button>

        {/* Play Stockfish Bot */}
        <button
          onClick={onPlayBot}
          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          title="Play Stockfish bot instead if friend is delayed"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Play Stockfish Bot</span>
        </button>

        {/* Exit Room */}
        <button
          onClick={onExit}
          className={`px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 active:scale-95 ${
            isLight
              ? 'bg-white hover:bg-red-50 border-slate-300 hover:border-rose-300 text-slate-700 hover:text-rose-600'
              : 'bg-slate-800 hover:bg-rose-950/40 border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-400'
          }`}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Room</span>
        </button>
      </div>
    </div>
  );
}
