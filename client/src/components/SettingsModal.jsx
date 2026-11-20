import React, { useState } from 'react';
import {
  X, Settings, Music, Volume2, VolumeX, Smartphone, Mic, Palette,
  ChevronLeft, ChevronRight, Check, Eye, BookOpen, MessageSquare,
  Crown, Play, Pause, Sliders, Sparkles, Filter, Shield
} from 'lucide-react';
import { BOARD_THEMES, PIECE_THEMES, PIECE_COLOR_PALETTES, PieceIcon } from './PieceIcons.jsx';
import { musicEngine, TRACK_LIST, MUSIC_CATEGORIES } from '../utils/music.js';
import { triggerHaptic } from '../utils/device.js';

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) {
  const [activeSubModal, setActiveSubModal] = useState(null); // 'board_picker' | 'piece_picker' | 'color_picker' | 'music_library' | null
  const [selectedMusicCategory, setSelectedMusicCategory] = useState('all');
  const [musicIsPlaying, setMusicIsPlaying] = useState(musicEngine.isPlaying);

  if (!isOpen) return null;

  const currentBoard = BOARD_THEMES[settings.boardTheme] || BOARD_THEMES.cappuccino;
  const currentPiece = PIECE_THEMES[settings.pieceTheme] || PIECE_THEMES.alexander;
  const currentPalette = PIECE_COLOR_PALETTES[settings.pieceColorPalette || 'classic'];
  const currentTrack = TRACK_LIST[settings.musicTrackIndex % TRACK_LIST.length];

  const handleToggle = (key) => {
    triggerHaptic('move');
    const updated = { ...settings, [key]: !settings[key] };
    onUpdateSettings(updated);

    if (key === 'musicEnabled') {
      if (!settings.musicEnabled) {
        musicEngine.start();
        setMusicIsPlaying(true);
      } else {
        musicEngine.stop();
        setMusicIsPlaying(false);
      }
    }
  };

  const handleChangeTrack = (delta) => {
    triggerHaptic('move');
    const newIdx = (settings.musicTrackIndex + delta + TRACK_LIST.length) % TRACK_LIST.length;
    musicEngine.setTrack(newIdx);
    onUpdateSettings({ ...settings, musicTrackIndex: newIdx });
  };

  const handleSelectTrack = (trackId) => {
    triggerHaptic('move');
    const idx = TRACK_LIST.findIndex(t => t.id === trackId);
    if (idx !== -1) {
      musicEngine.setTrack(idx);
      onUpdateSettings({ ...settings, musicTrackIndex: idx, musicEnabled: true });
      musicEngine.start();
      setMusicIsPlaying(true);
    }
  };

  const handleToggleMusicPlayback = () => {
    triggerHaptic('move');
    if (musicEngine.isPlaying) {
      musicEngine.stop();
      setMusicIsPlaying(false);
    } else {
      musicEngine.start();
      setMusicIsPlaying(true);
      if (!settings.musicEnabled) {
        onUpdateSettings({ ...settings, musicEnabled: true });
      }
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    musicEngine.setVolume(vol);
    onUpdateSettings({ ...settings, musicVolume: vol });
  };

  const filteredTracks = selectedMusicCategory === 'all'
    ? TRACK_LIST
    : TRACK_LIST.filter(t => t.category === selectedMusicCategory);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-fade-in">
      <div className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Settings className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">Arena Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Settings Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* ================= SECTION 1: THEME & COLOR COMBINATION ================= */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" />
              <span>Color Themes & Visuals</span>
            </h3>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-4">
              {/* App UI Theme Picker */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200">App Theme Style</span>
                  <p className="text-[11px] text-slate-400">Light luxury or dark esports aesthetic</p>
                </div>
                <select
                  value={settings.appTheme || 'dark'}
                  onChange={(e) => onUpdateSettings({ ...settings, appTheme: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-amber-400 focus:outline-none"
                >
                  <option value="alabaster">Alabaster Luxury (Light)</option>
                  <option value="dark">Dark Luxury Slate</option>
                  <option value="emerald">Emerald Royale</option>
                  <option value="obsidian">Obsidian Gold</option>
                  <option value="midnight">Midnight Navy</option>
                </select>
              </div>

              {/* 3 Swatch Selector Buttons: Board Theme, Pieces Style, Pieces Color */}
              <div className="grid grid-cols-3 gap-2">
                {/* 1. Board Theme */}
                <button
                  onClick={() => setActiveSubModal('board_picker')}
                  className="flex flex-col items-center justify-center p-2.5 bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl transition-all text-center group"
                >
                  <span className="text-[10px] text-slate-400 font-semibold mb-1">Board</span>
                  <div className="flex w-6 h-6 rounded overflow-hidden border border-slate-700 mb-1">
                    <span className="w-3 h-full" style={{ backgroundColor: currentBoard.light }} />
                    <span className="w-3 h-full" style={{ backgroundColor: currentBoard.dark }} />
                  </div>
                  <span className="text-[11px] font-bold text-white truncate max-w-full group-hover:text-amber-400">
                    {currentBoard.name.split(' ')[0]}
                  </span>
                </button>

                {/* 2. Pieces Carving Style */}
                <button
                  onClick={() => setActiveSubModal('piece_picker')}
                  className="flex flex-col items-center justify-center p-2.5 bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl transition-all text-center group"
                >
                  <span className="text-[10px] text-slate-400 font-semibold mb-1">Piece Design</span>
                  <span className="text-xl leading-none mb-1">♔</span>
                  <span className="text-[11px] font-bold text-white truncate max-w-full group-hover:text-amber-400">
                    {currentPiece.name}
                  </span>
                </button>

                {/* 3. Pieces Color Palette */}
                <button
                  onClick={() => setActiveSubModal('color_picker')}
                  className="flex flex-col items-center justify-center p-2.5 bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl transition-all text-center group"
                >
                  <span className="text-[10px] text-slate-400 font-semibold mb-1">Piece Color</span>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="w-3 h-3 rounded-full border border-slate-600" style={{ backgroundColor: currentPalette.white }} />
                    <span className="w-3 h-3 rounded-full border border-slate-600" style={{ backgroundColor: currentPalette.black }} />
                  </div>
                  <span className="text-[11px] font-bold text-white truncate max-w-full group-hover:text-amber-400">
                    {currentPalette.name.split(' ')[0]}
                  </span>
                </button>
              </div>

              {/* Real Interactive Live Preview */}
              <div className="flex flex-col items-center justify-center p-3 bg-slate-900/60 rounded-2xl border border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-400 mb-2">Live Board Preview</span>
                <div
                  className="w-44 h-44 rounded-xl overflow-hidden border-2 shadow-2xl grid grid-cols-4 grid-rows-4"
                  style={{ borderColor: currentBoard.border }}
                >
                  {[
                    ['r', 'n', 'b', 'q'],
                    ['p', 'p', 'p', 'p'],
                    ['P', 'P', 'P', 'P'],
                    ['R', 'N', 'B', 'K']
                  ].map((row, rIdx) =>
                    row.map((pieceChar, cIdx) => {
                      const isDark = (rIdx + cIdx) % 2 === 1;
                      const isWhite = pieceChar === pieceChar.toUpperCase();
                      return (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          className="flex items-center justify-center"
                          style={{ backgroundColor: isDark ? currentBoard.dark : currentBoard.light }}
                        >
                          <PieceIcon
                            piece={pieceChar.toLowerCase()}
                            color={isWhite ? 'w' : 'b'}
                            size={30}
                            theme={settings.pieceTheme}
                            colorPalette={settings.pieceColorPalette || 'classic'}
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ================= SECTION 2: SOOTHING MUSIC & SOUNDS (36+ Tracks) ================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5" />
                <span>Soothing Music & Audio (36 Tracks)</span>
              </h3>
              <button
                onClick={() => setActiveSubModal('music_library')}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
              >
                Browse All (36) →
              </button>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl divide-y divide-slate-800/60 overflow-hidden">
              {/* Music Master Toggle */}
              <div className="flex items-center justify-between p-3.5">
                <div className="flex items-center gap-2.5">
                  <Music className="w-4 h-4 text-indigo-400" />
                  <div>
                    <span className="text-xs font-bold text-slate-200">Background Music</span>
                    <p className="text-[11px] text-slate-400">Soothing, organic ambient chill soundtrack</p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={settings.musicEnabled}
                  onChange={() => handleToggle('musicEnabled')}
                />
              </div>

              {/* Quick Track Switcher Carousel */}
              <div className="p-3.5 space-y-3">
                <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleChangeTrack(-1)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Previous track"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex-1 text-center min-w-0">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">
                        {currentTrack.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                        {settings.musicTrackIndex + 1}/{TRACK_LIST.length}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {currentTrack.mood}
                    </span>
                  </div>

                  <button
                    onClick={() => handleChangeTrack(1)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Next track"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleToggleMusicPlayback}
                    className={`p-2 rounded-xl text-slate-950 font-bold transition-all ${
                      musicIsPlaying ? 'bg-amber-400 hover:bg-amber-300' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                    title={musicIsPlaying ? 'Pause Music' : 'Play Music'}
                  >
                    {musicIsPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  </button>
                </div>

                {/* Music Volume Slider */}
                <div className="flex items-center gap-3 pt-1">
                  <VolumeX className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.musicVolume}
                    onChange={handleVolumeChange}
                    className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px] font-mono text-slate-400 w-8 text-right">
                    {Math.round(settings.musicVolume * 100)}%
                  </span>
                </div>
              </div>

              {/* Music Scopes: Game, Puzzles, Lessons */}
              <div className="flex items-center justify-between p-3.5 pl-9 bg-slate-950/40">
                <span className="text-xs font-medium text-slate-300">Play music during games</span>
                <ToggleSwitch
                  checked={settings.musicDuringGame}
                  onChange={() => handleToggle('musicDuringGame')}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 pl-9 bg-slate-950/40">
                <span className="text-xs font-medium text-slate-300">Play music during puzzles</span>
                <ToggleSwitch
                  checked={settings.musicDuringPuzzles}
                  onChange={() => handleToggle('musicDuringPuzzles')}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 pl-9 bg-slate-950/40">
                <span className="text-xs font-medium text-slate-300">Play music during lessons</span>
                <ToggleSwitch
                  checked={settings.musicDuringLessons}
                  onChange={() => handleToggle('musicDuringLessons')}
                />
              </div>

              {/* Sound Effects Toggle */}
              <div className="flex items-center justify-between p-3.5">
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-xs font-bold text-slate-200">Sound Effects</span>
                    <p className="text-[11px] text-slate-400">Board moves, captures, checks and victories</p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={settings.soundEnabled}
                  onChange={() => handleToggle('soundEnabled')}
                />
              </div>

              {/* Vibrations & Haptics */}
              <div className="flex items-center justify-between p-3.5">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-xs font-bold text-slate-200">Vibrations</span>
                    <p className="text-[11px] text-slate-400">Tactile haptic feedback on touch devices</p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={settings.vibrations}
                  onChange={() => handleToggle('vibrations')}
                />
              </div>

              {/* Voice Commentary */}
              <div className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Mic className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-200">Voice Commentary</span>
                      <p className="text-[11px] text-slate-400">Speaks moves and checks aloud</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={settings.voiceCommentary}
                    onChange={() => handleToggle('voiceCommentary')}
                  />
                </div>

                {settings.voiceCommentary && (
                  <div className="flex items-center justify-between pl-6 pt-1">
                    <span className="text-xs text-slate-400 font-medium">↳ Only opponent's moves</span>
                    <ToggleSwitch
                      checked={settings.voiceCommentaryOnlyOpponent}
                      onChange={() => handleToggle('voiceCommentaryOnlyOpponent')}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ================= SECTION 3: GAME OPTIONS ================= */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>Game Options</span>
            </h3>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl divide-y divide-slate-800/60 overflow-hidden">
              <div className="flex items-center justify-between p-3.5">
                <span className="text-xs font-bold text-slate-200">Show legal moves</span>
                <ToggleSwitch
                  checked={settings.showLegalMoves}
                  onChange={() => handleToggle('showLegalMoves')}
                />
              </div>

              <div className="flex items-center justify-between p-3.5">
                <span className="text-xs font-bold text-slate-200">Highlight last move</span>
                <ToggleSwitch
                  checked={settings.highlightLastMove}
                  onChange={() => handleToggle('highlightLastMove')}
                />
              </div>

              <div className="flex items-center justify-between p-3.5">
                <span className="text-xs font-bold text-slate-200">Show coordinates</span>
                <ToggleSwitch
                  checked={settings.showCoordinates}
                  onChange={() => handleToggle('showCoordinates')}
                />
              </div>

              <div className="flex items-center justify-between p-3.5">
                <span className="text-xs font-bold text-slate-200">King in check indicator</span>
                <ToggleSwitch
                  checked={settings.kingInCheckIndicator}
                  onChange={() => handleToggle('kingInCheckIndicator')}
                />
              </div>

              <div className="flex items-center justify-between p-3.5">
                <span className="text-xs font-bold text-slate-200">Show openings names</span>
                <ToggleSwitch
                  checked={settings.showOpenings}
                  onChange={() => handleToggle('showOpenings')}
                />
              </div>

              <div className="flex items-center justify-between p-3.5">
                <span className="text-xs font-bold text-slate-200">Allow chat during game</span>
                <ToggleSwitch
                  checked={settings.allowChat}
                  onChange={() => handleToggle('allowChat')}
                />
              </div>

              <div className="flex items-center justify-between p-3.5">
                <div>
                  <span className="text-xs font-bold text-slate-200">Always promote to queen</span>
                  <p className="text-[10px] text-slate-500">Fast tactical play without modal</p>
                </div>
                <ToggleSwitch
                  checked={settings.alwaysPromoteToQueen}
                  onChange={() => handleToggle('alwaysPromoteToQueen')}
                />
              </div>

              <div className="flex items-center justify-between p-3.5">
                <div>
                  <span className="text-xs font-bold text-slate-200">Enable premoves</span>
                  <p className="text-[10px] text-slate-500">Queue next response while opponent thinks</p>
                </div>
                <ToggleSwitch
                  checked={settings.enablePremoves}
                  onChange={() => handleToggle('enablePremoves')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/10 transition-all active:scale-95"
          >
            Done
          </button>
        </div>

        {/* ================= SUB-MODAL: 36+ TRACK MUSIC LIBRARY ================= */}
        {activeSubModal === 'music_library' && (
          <div className="absolute inset-0 z-30 bg-slate-950/95 p-4 flex flex-col animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-white">Soothing Chess Music Library</h4>
                <p className="text-[11px] text-slate-400">36 handcrafted calm, organic tracks</p>
              </div>
              <button
                onClick={() => setActiveSubModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 py-3 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedMusicCategory('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedMusicCategory === 'all'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All (36)
              </button>
              {Object.keys(MUSIC_CATEGORIES).map((catKey) => (
                <button
                  key={catKey}
                  onClick={() => setSelectedMusicCategory(catKey)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedMusicCategory === catKey
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {MUSIC_CATEGORIES[catKey]}
                </button>
              ))}
            </div>

            {/* Track Items List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredTracks.map((tr) => {
                const isCurrent = TRACK_LIST[settings.musicTrackIndex]?.id === tr.id;
                return (
                  <div
                    key={tr.id}
                    onClick={() => handleSelectTrack(tr.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-amber-500/15 border-amber-500/60 shadow-md'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{tr.name}</span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-bold font-mono">
                            Playing
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{tr.mood}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        {tr.category}
                      </span>
                      {isCurrent && musicIsPlaying ? (
                        <Pause className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Play className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= SUB-MODAL: BOARD THEME PICKER ================= */}
        {activeSubModal === 'board_picker' && (
          <div className="absolute inset-0 z-30 bg-slate-950/95 p-4 flex flex-col animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white">Select Chessboard Theme</h4>
              <button
                onClick={() => setActiveSubModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              {Object.keys(BOARD_THEMES).map((key) => {
                const b = BOARD_THEMES[key];
                const isSelected = settings.boardTheme === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      triggerHaptic('move');
                      onUpdateSettings({ ...settings, boardTheme: key });
                      setActiveSubModal(null);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/60 shadow-md'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-9 rounded-lg overflow-hidden border border-slate-700/80 grid grid-cols-4 grid-rows-2 shrink-0">
                        {[0, 1, 0, 1, 1, 0, 1, 0].map((val, idx) => (
                          <div
                            key={idx}
                            style={{ backgroundColor: val === 0 ? b.light : b.dark }}
                          />
                        ))}
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold text-white block capitalize">{b.name}</span>
                        {b.isLight && <span className="text-[10px] text-amber-400 font-medium">Light Luxury Theme</span>}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= SUB-MODAL: PIECE CARVING PICKER ================= */}
        {activeSubModal === 'piece_picker' && (
          <div className="absolute inset-0 z-30 bg-slate-950/95 p-4 flex flex-col animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white">Select Chess Pieces Style</h4>
              <button
                onClick={() => setActiveSubModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
              {Object.keys(PIECE_THEMES).map((key) => {
                const p = PIECE_THEMES[key];
                const isSelected = settings.pieceTheme === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      triggerHaptic('move');
                      onUpdateSettings({ ...settings, pieceTheme: key });
                      setActiveSubModal(null);
                    }}
                    className={`w-full p-3 rounded-2xl border transition-all text-left space-y-2 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/60 shadow-md'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{p.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                    </div>

                    <div className="flex items-center justify-between p-2 bg-slate-950/70 rounded-xl border border-slate-800/80">
                      {['k', 'q', 'r', 'b', 'n', 'p'].map((pieceType, pIdx) => (
                        <div key={pIdx} className="w-7 h-7 flex items-center justify-center">
                          <PieceIcon
                            piece={pieceType}
                            color={pIdx % 2 === 0 ? 'w' : 'b'}
                            size={26}
                            theme={key}
                            colorPalette={settings.pieceColorPalette || 'classic'}
                          />
                        </div>
                      ))}
                    </div>

                    <p className="text-[10px] text-slate-400 truncate">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= SUB-MODAL: PIECE COLOR PALETTE PICKER ================= */}
        {activeSubModal === 'color_picker' && (
          <div className="absolute inset-0 z-30 bg-slate-950/95 p-4 flex flex-col animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white">Select Pieces Color Palette</h4>
              <button
                onClick={() => setActiveSubModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
              {Object.keys(PIECE_COLOR_PALETTES).map((palKey) => {
                const pal = PIECE_COLOR_PALETTES[palKey];
                const isSelected = (settings.pieceColorPalette || 'classic') === palKey;
                return (
                  <button
                    key={palKey}
                    onClick={() => {
                      triggerHaptic('move');
                      onUpdateSettings({ ...settings, pieceColorPalette: palKey });
                      setActiveSubModal(null);
                    }}
                    className={`w-full p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/60 shadow-md'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                        <span className="w-5 h-5 rounded-full border border-slate-600" style={{ backgroundColor: pal.white }} />
                        <span className="w-5 h-5 rounded-full border border-slate-600" style={{ backgroundColor: pal.black }} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">{pal.name}</span>
                        <span className="text-[10px] text-slate-400">White & Black color finish</span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? 'bg-amber-500' : 'bg-slate-800'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
