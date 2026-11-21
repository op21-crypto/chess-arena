import React from 'react';
import { Clock } from './Clock.jsx';
import { PieceIcon } from './PieceIcons.jsx';
import { Mic, MicOff, Volume2 } from 'lucide-react';

const COUNTRY_FLAGS = {
  US: '🇺🇸',
  NO: '🇳🇴',
  IN: '🇮🇳',
  HU: '🇭🇺',
  CA: '🇨🇦',
  IS: '🇮🇸',
  GB: '🇬🇧',
  FR: '🇫🇷',
  DE: '🇩🇪',
  BR: '🇧🇷',
  ES: '🇪🇸',
  JP: '🇯🇵',
  UN: '🌐'
};

const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

export function PlayerCard({
  player,
  color, // 'w' | 'b'
  isTurn,
  timeMs,
  isActive,
  capturedPieces = [],
  opponentCaptured = [],
  voiceState = null, // { isConnected, isMuted, isSpeaking }
  onVoiceToggle = null,
  isLight = false
}) {
  if (!player) {
    return (
      <div className={`flex items-center justify-between p-2.5 md:p-3 border rounded-xl backdrop-blur-md transition-all duration-300 ${
        isLight
          ? 'bg-amber-50/70 border-amber-300/80 shadow-xs text-slate-900'
          : 'bg-slate-900/90 border-amber-500/40 text-slate-100 shadow-md'
      }`}>
        {/* Left: Animated Radar Seat Indicator */}
        <div className="flex items-center gap-2.5 md:gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <div className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center border-2 border-dashed ${
              isLight
                ? 'border-amber-500 bg-amber-100 text-amber-700'
                : 'border-amber-400 bg-amber-500/10 text-amber-400'
            }`}>
              <span className="text-base select-none">⚔️</span>
            </div>
            {/* Live radar pulsing beacon */}
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`font-black text-xs md:text-sm truncate ${
                isLight ? 'text-amber-900' : 'text-amber-300'
              }`}>
                Friend's Seat 🪑
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold uppercase border ${
                isLight ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {color === 'w' ? 'White' : 'Black'}
              </span>
            </div>
            <p className={`text-[11px] font-medium truncate flex items-center gap-1.5 ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Waiting for friend to enter room...</span>
            </p>
          </div>
        </div>

        {/* Right: Frozen Full Clock */}
        <div className="flex items-center gap-2 shrink-0">
          <Clock
            timeMs={timeMs}
            isTurn={false}
            isActive={false}
            isLight={isLight}
          />
        </div>
      </div>
    );
  }

  const flag = COUNTRY_FLAGS[player.country] || '🌐';
  const elo = player.elo || player.ratings?.rapid || 1200;

  // Material evaluation difference
  const myTotal = capturedPieces.reduce((sum, p) => sum + (PIECE_VALUES[p] || 0), 0);
  const oppTotal = opponentCaptured.reduce((sum, p) => sum + (PIECE_VALUES[p] || 0), 0);
  const materialAdvantage = myTotal - oppTotal;

  return (
    <div className={`flex items-center justify-between p-2.5 md:p-3 border rounded-xl backdrop-blur-md transition-all duration-200 ${
      isLight
        ? (isTurn
            ? 'bg-white/95 border-amber-500/80 shadow-md ring-1 ring-amber-400/40 text-slate-900'
            : 'bg-white/95 border-slate-200 shadow-xs text-slate-900')
        : (isTurn
            ? 'bg-slate-900/90 border-amber-500/60 shadow-lg shadow-amber-500/5 text-slate-100'
            : 'bg-slate-900/90 border-slate-800/80 text-slate-100')
    }`}>
      {/* Left: Avatar, Username, Elo & Captured Pieces */}
      <div className="flex items-center gap-2.5 md:gap-3 min-w-0">
        <div className="relative flex-shrink-0">
          <img
            src={player.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(player.username)}&radius=50`}
            alt={player.username}
            className={`w-10 h-10 md:w-11 md:h-11 rounded-full object-cover border-2 ${
              voiceState?.isSpeaking
                ? 'border-emerald-400 ring-2 ring-emerald-400/50'
                : (color === 'w'
                    ? (isLight ? 'border-amber-400' : 'border-slate-300')
                    : (isLight ? 'border-slate-400' : 'border-slate-700'))
            }`}
            onError={(e) => {
              e.currentTarget.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=LuffyGear5&radius=50';
            }}
          />
          {/* Side badge indicator */}
          <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold ${
            isLight
              ? (color === 'w' ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-800 text-white border-slate-900')
              : (color === 'w' ? 'bg-white text-slate-950 border-slate-950' : 'bg-slate-950 text-white border-slate-950')
          }`}>
            {color === 'w' ? 'W' : 'B'}
          </span>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 truncate">
            <span className={`text-sm md:text-base truncate ${
              isLight ? 'font-bold text-slate-900' : 'font-semibold text-slate-100'
            }`}>
              {player.username}
            </span>
            {player.title && (
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border shrink-0 truncate max-w-[120px] ${
                isLight ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'bg-indigo-950/70 text-indigo-300 border-indigo-500/30'
              }`}>
                {player.title}
              </span>
            )}
            <span className="text-xs" title={player.countryName || player.country}>
              {flag}
            </span>
            <span className={`text-xs font-mono px-1.5 py-0.5 rounded font-bold border ${
              isLight
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-slate-800 text-amber-400 border-slate-700'
            }`}>
              {elo}
            </span>
          </div>

          {/* Captured pieces row */}
          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
            {capturedPieces.map((p, idx) => (
              <span key={idx} className="opacity-90">
                <PieceIcon piece={p} color={color === 'w' ? 'b' : 'w'} size={14} />
              </span>
            ))}
            {materialAdvantage > 0 && (
              <span className={`text-[11px] font-bold font-mono ml-1 ${
                isLight ? 'text-emerald-700' : 'text-emerald-400'
              }`}>
                +{materialAdvantage}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Voice Status & Clock */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {voiceState && voiceState.isConnected && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs border ${
            isLight
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
          }`}>
            {voiceState.isSpeaking ? (
              <div className="flex items-center gap-0.5 h-3">
                <span className="w-1 bg-emerald-500 rounded-full voice-wave-bar" />
                <span className="w-1 bg-emerald-500 rounded-full voice-wave-bar" />
                <span className="w-1 bg-emerald-500 rounded-full voice-wave-bar" />
              </div>
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
            {voiceState.isMuted && <MicOff className="w-3.5 h-3.5 text-rose-500" />}
          </div>
        )}

        <Clock timeMs={timeMs} isTurn={isTurn} isActive={isActive} isLight={isLight} />
      </div>
    </div>
  );
}
