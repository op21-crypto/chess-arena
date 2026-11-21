import React from 'react';
import { Bot, Sparkles, Zap, Shield, Swords, Cpu, MessageSquare } from 'lucide-react';

export function AIBattleCard({
  opponent,
  aiLevel = 2,
  isThinking = false,
  inCheck = false,
  isLight = false,
  inGameNotice = null
}) {
  if (!opponent) return null;

  const quote = inGameNotice || opponent.quote || 'Let the battle of minds begin!';

  return (
    <div
      className={`rounded-2xl border p-4 shadow-lg backdrop-blur-md transition-all relative overflow-hidden ${
        isLight
          ? 'bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/70 border-indigo-200/90 text-slate-900 shadow-indigo-100/50'
          : 'bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-purple-950/40 border-indigo-500/30 text-slate-100 shadow-indigo-950/30'
      }`}
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Bot Tier & Engine Tag */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-indigo-500/20">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className={`text-[11px] font-black tracking-wider uppercase ${
            isLight ? 'text-indigo-800' : 'text-indigo-300'
          }`}>
            Anime Master Duel
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
            isLight
              ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
              : 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40'
          }`}>
            Stockfish 19 NNUE
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
            isLight
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}>
            Lvl {aiLevel}
          </span>
        </div>
      </div>

      {/* Character Profile Section */}
      <div className="flex items-center gap-3.5 pt-3">
        {/* Anime Avatar with Glowing Ring */}
        <div className="relative shrink-0">
          <div className={`w-14 h-14 rounded-2xl border-2 p-0.5 shadow-md overflow-hidden relative ${
            isThinking
              ? 'border-indigo-400 ring-4 ring-indigo-500/40 animate-pulse'
              : (isLight ? 'border-indigo-300' : 'border-indigo-500/60')
          }`}>
            <img
              src={opponent.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(opponent.username)}&radius=50`}
              alt={opponent.username}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          {/* Level Crown Badge */}
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 font-black text-[10px] flex items-center justify-center border border-white shadow-xs">
            ★
          </span>
        </div>

        {/* Character Title & Name */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-black text-sm sm:text-base leading-tight truncate">
              {opponent.username}
            </h4>
            {opponent.anime && (
              <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'
              }`}>
                {opponent.anime}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border inline-block ${
              isLight
                ? 'bg-indigo-100/90 text-indigo-800 border-indigo-300'
                : 'bg-indigo-950/70 text-indigo-300 border-indigo-500/30'
            }`}>
              {opponent.title || 'Grandmaster'}
            </span>
            <span className={`text-xs font-mono font-bold ${
              isLight ? 'text-amber-800' : 'text-amber-400'
            }`}>
              {opponent.elo || 1200} ELO
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Battle Quote Balloon */}
      <div className={`mt-3 p-3 rounded-xl border relative text-xs leading-relaxed transition-all ${
        inGameNotice
          ? (isLight ? 'bg-amber-100/80 border-amber-300 text-amber-900 font-bold' : 'bg-amber-950/50 border-amber-500/40 text-amber-200 font-bold')
          : (isLight ? 'bg-white/90 border-indigo-100 text-slate-700' : 'bg-slate-950/70 border-slate-800 text-slate-300')
      }`}>
        <div className="flex items-start gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
          <p className="italic">
            "{quote}"
          </p>
        </div>
      </div>

      {/* Live Engine Activity Bar */}
      <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-xs ${
        isLight ? 'border-slate-200 text-slate-600' : 'border-slate-800/80 text-slate-400'
      }`}>
        <div className="flex items-center gap-2">
          <Cpu className={`w-3.5 h-3.5 ${isThinking ? 'text-indigo-400 animate-spin' : 'text-slate-400'}`} />
          <span className="font-mono text-[11px]">
            {isThinking
              ? (opponent.thinkingStatus || 'Calculating 1,850k nodes/sec...')
              : inCheck
                ? 'King under check pressure!'
                : 'Your move - calculate deeply.'}
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[11px] font-bold">
          <Zap className="w-3 h-3 text-amber-500" />
          <span>Depth {10 + aiLevel * 3}</span>
        </div>
      </div>
    </div>
  );
}
