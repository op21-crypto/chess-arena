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
  onVoiceToggle = null
}) {
  if (!player) {
    return (
      <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-xl animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800" />
          <div className="space-y-1">
            <div className="w-24 h-4 bg-slate-800 rounded" />
            <div className="w-16 h-3 bg-slate-800 rounded" />
          </div>
        </div>
        <div className="w-20 h-8 bg-slate-800 rounded-xl" />
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
    <div className={`flex items-center justify-between p-2.5 md:p-3 bg-slate-900/90 border rounded-xl backdrop-blur-md transition-all duration-200 ${
      isTurn ? 'border-amber-500/60 shadow-lg shadow-amber-500/5' : 'border-slate-800/80'
    }`}>
      {/* Left: Avatar, Username, Elo & Captured Pieces */}
      <div className="flex items-center gap-2.5 md:gap-3 min-w-0">
        <div className="relative flex-shrink-0">
          <img
            src={player.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.username}`}
            alt={player.username}
            className={`w-10 h-10 md:w-11 md:h-11 rounded-full object-cover border-2 ${
              voiceState?.isSpeaking ? 'border-emerald-400 ring-2 ring-emerald-400/50' : (color === 'w' ? 'border-slate-300' : 'border-slate-700')
            }`}
          />
          {/* Side badge indicator */}
          <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-slate-950 flex items-center justify-center text-[10px] font-bold ${
            color === 'w' ? 'bg-white text-slate-950' : 'bg-slate-950 text-white'
          }`}>
            {color === 'w' ? 'W' : 'B'}
          </span>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-semibold text-slate-100 text-sm md:text-base truncate">
              {player.username}
            </span>
            <span className="text-xs" title={player.countryName || player.country}>
              {flag}
            </span>
            <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-bold border border-slate-700">
              {elo}
            </span>
          </div>

          {/* Captured pieces row */}
          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
            {capturedPieces.map((p, idx) => (
              <span key={idx} className="opacity-80">
                <PieceIcon piece={p} color={color === 'w' ? 'b' : 'w'} size={14} />
              </span>
            ))}
            {materialAdvantage > 0 && (
              <span className="text-[11px] font-bold font-mono text-emerald-400 ml-1">
                +{materialAdvantage}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Voice Status & Clock */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {voiceState && voiceState.isConnected && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs">
            {voiceState.isSpeaking ? (
              <div className="flex items-center gap-0.5 h-3">
                <span className="w-1 bg-emerald-400 rounded-full voice-wave-bar" />
                <span className="w-1 bg-emerald-400 rounded-full voice-wave-bar" />
                <span className="w-1 bg-emerald-400 rounded-full voice-wave-bar" />
              </div>
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
            {voiceState.isMuted && <MicOff className="w-3.5 h-3.5 text-red-400" />}
          </div>
        )}

        <Clock timeMs={timeMs} isTurn={isTurn} isActive={isActive} />
      </div>
    </div>
  );
}
