import React, { useState } from 'react';
import { Zap, Clock, Shield, Sparkles, Copy, Check, Share2, Bot, Users, X } from 'lucide-react';

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

export function MatchmakingModal({ isOpen, onClose, onStartMatchmaking, isSearching, onCancelMatchmaking }) {
  const [selectedPreset, setSelectedPreset] = useState(TIME_PRESETS[5]); // Default 10 min Rapid

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

export function FriendRoomModal({ isOpen, onClose, onCreateRoom, onJoinRoom, createdRoom }) {
  const [roomCode, setRoomCode] = useState('');
  const [selectedMinutes, setSelectedMinutes] = useState(10);
  const [colorPref, setColorPref] = useState('random');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const fullShareUrl = createdRoom
    ? `${window.location.origin}/?room=${createdRoom.roomId}`
    : '';

  const copyLink = () => {
    navigator.clipboard.writeText(fullShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `♟️ Battle me in Chess Arena! Click to join my match: ${fullShareUrl}`
  )}`;

  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(fullShareUrl)}&text=${encodeURIComponent(
    '♟️ Join my Chess Arena room!'
  )}`;

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
            <Users className="w-5 h-5 text-amber-400" />
            <span>Play With Friends</span>
          </h3>
          <p className="text-xs text-slate-400">Create a private arena room or join a friend via code/link</p>
        </div>

        {createdRoom ? (
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4 animate-fade-in">
            <span className="text-xs font-semibold text-emerald-400 block text-center">
              ✓ Room Created! Share with your friend to begin
            </span>

            <div className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-700 rounded-xl font-mono text-xs text-slate-200">
              <span className="truncate mr-2">{createdRoom.roomId}</span>
              <button
                onClick={copyLink}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
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
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors"
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
