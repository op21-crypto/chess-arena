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
  onUpdateSettings,
  isEmbedded = false,
  isLight = false
}) {
  const [activeSubModal, setActiveSubModal] = useState(null); // 'board_picker' | 'piece_picker' | 'color_picker' | 'music_library' | null
  const [selectedMusicCategory, setSelectedMusicCategory] = useState('all');
  const [musicIsPlaying, setMusicIsPlaying] = useState(musicEngine.isPlaying);

  const isLightMode = isLight || (settings?.appTheme === 'light' || settings?.appTheme === 'alabaster' || (!settings?.appTheme && typeof document !== 'undefined' && !document.documentElement.classList.contains('dark')));

  if (!isOpen && !isEmbedded) return null;

  const currentBoard = BOARD_THEMES[settings.boardTheme] || BOARD_THEMES.gold || BOARD_THEMES.emerald;
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

  const renderSubModal = (title, subtitle, content) => (
    <div className={isEmbedded ? "fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in" : "absolute inset-0 z-30 bg-slate-950/95 p-4 flex flex-col animate-fade-in"}>
      <div className={isEmbedded
        ? `${isLightMode ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'} border rounded-3xl max-w-lg w-full max-h-[85vh] p-4 flex flex-col shadow-2xl overflow-hidden relative`
        : `flex flex-col h-full w-full overflow-hidden ${isLightMode ? 'bg-white text-slate-900' : 'text-white'}`
      }>
        <div className={`flex items-center justify-between pb-3 border-b shrink-0 ${isLightMode ? 'border-slate-200' : 'border-slate-800'}`}>
          <div>
            <h4 className={`text-sm font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{title}</h4>
            {subtitle && <p className={`text-[11px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{subtitle}</p>}
          </div>
          <button
            onClick={() => setActiveSubModal(null)}
            className={`p-1.5 rounded-full transition-colors ${isLightMode ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {content}
      </div>
    </div>
  );

  const filteredTracks = selectedMusicCategory === 'all'
    ? TRACK_LIST
    : TRACK_LIST.filter(t => t.category === selectedMusicCategory);

  const modalContent = (
    <div className={`${isEmbedded
      ? isLightMode
        ? 'w-full bg-white border border-slate-200 rounded-3xl text-slate-900 shadow-sm'
        : 'w-full bg-slate-900 border border-slate-800 rounded-3xl text-white'
      : isLightMode
        ? 'bg-white border-2 border-slate-200 rounded-3xl max-w-lg w-full max-h-[92vh] text-slate-900'
        : 'bg-slate-900 border-2 border-slate-700/80 rounded-3xl max-w-lg w-full max-h-[92vh] text-white'
    } flex flex-col shadow-2xl overflow-hidden relative`}>
      {/* Header */}
      {!isEmbedded && (
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'}`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${isLightMode ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
              <Settings className="w-4 h-4" />
            </div>
            <h2 className={`text-lg font-extrabold tracking-tight ${isLightMode ? 'text-slate-900' : 'text-white'}`}>Arena Settings</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors ${isLightMode ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Scrollable Settings Body */}
      <div className={`flex-1 ${isEmbedded ? 'p-4 sm:p-6' : 'overflow-y-auto p-5'} space-y-6`}>
          {/* ================= SECTION 1: THEME & COLOR COMBINATION ================= */}
          <div className="space-y-3">
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLightMode ? 'text-amber-700' : 'text-amber-400'}`}>
              <Palette className="w-3.5 h-3.5" />
              <span>Color Themes & Visuals</span>
            </h3>

            <div className={`border rounded-2xl p-4 space-y-4 ${isLightMode ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/70 border-slate-800/80'}`}>
              {/* App UI Theme Picker */}
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-xs font-bold ${isLightMode ? 'text-slate-900' : 'text-slate-200'}`}>App Theme Style</span>
                  <p className={`text-[11px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Light luxury or dark esports aesthetic</p>
                </div>
                <select
                  value={settings.appTheme || 'system'}
                  onChange={(e) => onUpdateSettings({ ...settings, appTheme: e.target.value })}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none border ${
                    isLightMode
                      ? 'bg-white border-slate-300 text-slate-800'
                      : 'bg-slate-900 border-slate-700 text-amber-400'
                  }`}
                >
                  <option value="system">⚙️ Auto System (Device Sync)</option>
                  <option value="light">☀️ Day (White / Light Mode)</option>
                  <option value="dark">🌙 Night (Dark Luxury Slate)</option>
                  <option value="black">🖤 OLED Black (Pure Pitch Black)</option>
                  <option value="alabaster">Alabaster Luxury</option>
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
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center group cursor-pointer ${
                    isLightMode
                      ? 'bg-white border-slate-200 hover:border-amber-400 hover:bg-slate-50'
                      : 'bg-slate-900 border-slate-800 hover:border-amber-500/50'
                  }`}
                >
                  <span className={`text-[10px] font-semibold mb-1 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Board</span>
                  <div className={`flex w-6 h-6 rounded overflow-hidden border mb-1 ${isLightMode ? 'border-slate-300' : 'border-slate-700'}`}>
                    <span className="w-3 h-full" style={{ backgroundColor: currentBoard.light }} />
                    <span className="w-3 h-full" style={{ backgroundColor: currentBoard.dark }} />
                  </div>
                  <span className={`text-[11px] font-bold truncate max-w-full group-hover:text-amber-500 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                    {currentBoard.name.split(' ')[0]}
                  </span>
                </button>

                {/* 2. Pieces Carving Style */}
                <button
                  onClick={() => setActiveSubModal('piece_picker')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center group cursor-pointer ${
                    isLightMode
                      ? 'bg-white border-slate-200 hover:border-amber-400 hover:bg-slate-50'
                      : 'bg-slate-900 border-slate-800 hover:border-amber-500/50'
                  }`}
                >
                  <span className={`text-[10px] font-semibold mb-1 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Piece Design</span>
                  <span className="text-xl leading-none mb-1">♔</span>
                  <span className={`text-[11px] font-bold truncate max-w-full group-hover:text-amber-500 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                    {currentPiece.name}
                  </span>
                </button>

                {/* 3. Pieces Color Palette */}
                <button
                  onClick={() => setActiveSubModal('color_picker')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center group cursor-pointer ${
                    isLightMode
                      ? 'bg-white border-slate-200 hover:border-amber-400 hover:bg-slate-50'
                      : 'bg-slate-900 border-slate-800 hover:border-amber-500/50'
                  }`}
                >
                  <span className={`text-[10px] font-semibold mb-1 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Piece Color</span>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="w-3 h-3 rounded-full border border-slate-400" style={{ backgroundColor: currentPalette.white }} />
                    <span className="w-3 h-3 rounded-full border border-slate-400" style={{ backgroundColor: currentPalette.black }} />
                  </div>
                  <span className={`text-[11px] font-bold truncate max-w-full group-hover:text-amber-500 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                    {currentPalette.name.split(' ')[0]}
                  </span>
                </button>
              </div>

              {/* Real Interactive Live Preview */}
              <div className={`flex flex-col items-center justify-center p-3 rounded-2xl border ${
                isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800/80'
              }`}>
                <span className={`text-[11px] font-semibold mb-2 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>Live Board Preview</span>
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
              <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLightMode ? 'text-amber-700' : 'text-amber-400'}`}>
                <Music className="w-3.5 h-3.5" />
                <span>Soothing Music & Audio (36 Tracks)</span>
              </h3>
              <button
                onClick={() => setActiveSubModal('music_library')}
                className={`text-xs font-bold underline cursor-pointer ${isLightMode ? 'text-indigo-600 hover:text-indigo-800' : 'text-indigo-400 hover:text-indigo-300'}`}
              >
                Browse All (36) →
              </button>
            </div>

            <div className={`border rounded-2xl divide-y overflow-hidden ${
              isLightMode
                ? 'bg-slate-50/70 border-slate-200 divide-slate-200'
                : 'bg-slate-950/70 border-slate-800/80 divide-slate-800/60'
            }`}>
              {/* Music Master Toggle */}
              <div className="flex items-center justify-between p-3.5">
                <div className="flex items-center gap-2.5">
                  <Music className="w-4 h-4 text-indigo-500" />
                  <div>
                    <span className={`text-xs font-bold ${isLightMode ? 'text-slate-900' : 'text-slate-200'}`}>Background Music</span>
                    <p className={`text-[11px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Soothing, organic ambient chill soundtrack</p>
                  </div>
                </div>
                <ToggleSwitch
                  isLight={isLightMode}
                  checked={settings.musicEnabled}
                  onChange={() => handleToggle('musicEnabled')}
                />
              </div>

              {/* Quick Track Switcher Carousel */}
              <div className="p-3.5 space-y-3">
                <div className={`p-2.5 border rounded-xl flex items-center justify-between gap-2 ${
                  isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
                }`}>
                  <button
                    onClick={() => handleChangeTrack(-1)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isLightMode ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                    title="Previous track"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex-1 text-center min-w-0">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={`text-xs font-bold truncate ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                        {currentTrack.name}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                        isLightMode ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-500/20 text-indigo-300'
                      }`}>
                        {settings.musicTrackIndex + 1}/{TRACK_LIST.length}
                      </span>
                    </div>
                    <span className={`text-[10px] block truncate ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {currentTrack.mood}
                    </span>
                  </div>

                  <button
                    onClick={() => handleChangeTrack(1)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isLightMode ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                    title="Next track"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleToggleMusicPlayback}
                    className={`p-2 rounded-xl font-bold transition-all cursor-pointer ${
                      musicIsPlaying
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                        : isLightMode
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                    title={musicIsPlaying ? 'Pause Music' : 'Play Music'}
                  >
                    {musicIsPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  </button>
                </div>

                {/* Music Volume Slider */}
                <div className="flex items-center gap-3 pt-1">
                  <VolumeX className={`w-3.5 h-3.5 shrink-0 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`} />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.musicVolume}
                    onChange={handleVolumeChange}
                    className={`flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-amber-500 ${isLightMode ? 'bg-slate-200' : 'bg-slate-800'}`}
                  />
                  <Volume2 className={`w-3.5 h-3.5 shrink-0 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`} />
                  <span className={`text-[11px] font-mono w-8 text-right ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {Math.round(settings.musicVolume * 100)}%
                  </span>
                </div>
              </div>

              {/* Music Scopes: Game, Puzzles, Lessons */}
              <div className={`flex items-center justify-between p-3.5 pl-9 ${isLightMode ? 'bg-slate-100/50' : 'bg-slate-950/40'}`}>
                <span className={`text-xs font-medium ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>Play music during games</span>
                <ToggleSwitch
                  isLight={isLightMode}
                  checked={settings.musicDuringGame}
                  onChange={() => handleToggle('musicDuringGame')}
                />
              </div>

              <div className={`flex items-center justify-between p-3.5 pl-9 ${isLightMode ? 'bg-slate-100/50' : 'bg-slate-950/40'}`}>
                <span className={`text-xs font-medium ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>Play music during puzzles</span>
                <ToggleSwitch
                  isLight={isLightMode}
                  checked={settings.musicDuringPuzzles}
                  onChange={() => handleToggle('musicDuringPuzzles')}
                />
              </div>

              <div className={`flex items-center justify-between p-3.5 pl-9 ${isLightMode ? 'bg-slate-100/50' : 'bg-slate-950/40'}`}>
                <span className={`text-xs font-medium ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>Play music during lessons</span>
                <ToggleSwitch
                  isLight={isLightMode}
                  checked={settings.musicDuringLessons}
                  onChange={() => handleToggle('musicDuringLessons')}
                />
              </div>

              {/* Sound Effects Toggle */}
              <div className="flex items-center justify-between p-3.5">
                <div className="flex items-center gap-2.5">
                  <Volume2 className={`w-4 h-4 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`} />
                  <div>
                    <span className={`text-xs font-bold ${isLightMode ? 'text-slate-900' : 'text-slate-200'}`}>Sound Effects</span>
                    <p className={`text-[11px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Board moves, captures, checks and victories</p>
                  </div>
                </div>
                <ToggleSwitch
                  isLight={isLightMode}
                  checked={settings.soundEnabled}
                  onChange={() => handleToggle('soundEnabled')}
                />
              </div>

              {/* Vibrations & Haptics */}
              <div className="flex items-center justify-between p-3.5">
                <div className="flex items-center gap-2.5">
                  <Smartphone className={`w-4 h-4 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`} />
                  <div>
                    <span className={`text-xs font-bold ${isLightMode ? 'text-slate-900' : 'text-slate-200'}`}>Vibrations</span>
                    <p className={`text-[11px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Tactile haptic feedback on touch devices</p>
                  </div>
                </div>
                <ToggleSwitch
                  isLight={isLightMode}
                  checked={settings.vibrations}
                  onChange={() => handleToggle('vibrations')}
                />
              </div>

              {/* Voice Commentary */}
              <div className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Mic className="w-4 h-4 text-emerald-500" />
                    <div>
                      <span className={`text-xs font-bold ${isLightMode ? 'text-slate-900' : 'text-slate-200'}`}>Voice Commentary</span>
                      <p className={`text-[11px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Speaks moves and checks aloud</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    isLight={isLightMode}
                    checked={settings.voiceCommentary}
                    onChange={() => handleToggle('voiceCommentary')}
                  />
                </div>

                {settings.voiceCommentary && (
                  <div className="flex items-center justify-between pl-6 pt-1">
                    <span className={`text-xs font-medium ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>↳ Only opponent's moves</span>
                    <ToggleSwitch
                      isLight={isLightMode}
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
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLightMode ? 'text-amber-700' : 'text-amber-400'}`}>
              <Eye className="w-3.5 h-3.5" />
              <span>Game Options</span>
            </h3>

            <div className={`border rounded-2xl divide-y overflow-hidden ${
              isLightMode
                ? 'bg-slate-50/70 border-slate-200 divide-slate-200'
                : 'bg-slate-950/70 border-slate-800/80 divide-slate-800/60'
            }`}>
              <div className="flex items-center justify-between p-3.5">
                <span className={`text-xs font-bold ${isLightMode ? 'text-slate-900' : 'text-slate-200'}`}>Show legal moves</span>
                <ToggleSwitch
                  isLight={isLightMode}
                  checked={settings.showLegalMoves}
                  onChange={() => handleToggle('showLegalMoves')}
                />
              </div>

              <div className="flex items-center justify-between p-3.5">
                <span className={`text-xs font-bold ${isLightMode ? 'text-slate-900' : 'text-slate-200'}`}>Highlight last move</span>
                <ToggleSwitch
                  isLight={isLightMode}
                  checked={settings.highlightLastMove}
                  onChange={() => handleToggle('highlightLastMove')}
                />
              </div>

              <div className="flex items-center justify-between p-3.5">
                <span className={`text-xs font-bold ${isLightMode ? 'text-slate-900' : 'text-slate-200'}`}>Show coordinates</span>
                <ToggleSwitch
                  isLight={isLightMode}
                  checked={settings.showCoordinates}
                  onChange={() => handleToggle('showCoordinates')}
                />
              </div>

              <div className="flex items-center justify-between p-3.5">
                <span className={`text-xs font-bold ${isLightMode ? 'text-slate-900' : 'text-slate-200'}`}>King in check indicator</span>
                <ToggleSwitch
                  isLight={isLightMode}
                  checked={settings.kingInCheckIndicator}
                  onChange={() => handleToggle('kingInCheckIndicator')}
                />
              </div>

              <div className="flex items-center justify-between p-3.5">
                <span className={`text-xs font-bold ${isLightMode ? 'text-slate-900' : 'text-slate-200'}`}>Show openings names</span>
                <ToggleSwitch
                  isLight={isLightMode}
                  checked={settings.showOpenings}
                  onChange={() => handleToggle('showOpenings')}
                />
              </div>

              <div className="flex items-center justify-between p-3.5">
                <span className={`text-xs font-bold ${isLightMode ? 'text-slate-900' : 'text-slate-200'}`}>Allow chat during game</span>
                <ToggleSwitch
                  isLight={isLightMode}
                  checked={settings.allowChat}
                  onChange={() => handleToggle('allowChat')}
                />
              </div>

              <div className="flex items-center justify-between p-3.5">
                <div>
                  <span className={`text-xs font-bold ${isLightMode ? 'text-slate-900' : 'text-slate-200'}`}>Always promote to queen</span>
                  <p className={`text-[10px] ${isLightMode ? 'text-slate-500' : 'text-slate-500'}`}>Fast tactical play without modal</p>
                </div>
                <ToggleSwitch
                  isLight={isLightMode}
                  checked={settings.alwaysPromoteToQueen}
                  onChange={() => handleToggle('alwaysPromoteToQueen')}
                />
              </div>

              <div className="flex items-center justify-between p-3.5">
                <div>
                  <span className={`text-xs font-bold ${isLightMode ? 'text-slate-900' : 'text-slate-200'}`}>Enable premoves</span>
                  <p className={`text-[10px] ${isLightMode ? 'text-slate-500' : 'text-slate-500'}`}>Queue next response while opponent thinks</p>
                </div>
                <ToggleSwitch
                  isLight={isLightMode}
                  checked={settings.enablePremoves}
                  onChange={() => handleToggle('enablePremoves')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {!isEmbedded && (
          <div className={`p-4 border-t flex justify-end ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'}`}>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/10 transition-all active:scale-95 cursor-pointer"
            >
              Done
            </button>
          </div>
        )}

        {/* ================= SUB-MODAL: 36+ TRACK MUSIC LIBRARY ================= */}
        {activeSubModal === 'music_library' && renderSubModal(
          'Soothing Chess Music Library',
          '36 handcrafted calm, organic tracks',
          <>
            {/* Category Filter Pills */}
            <div className="flex gap-1.5 py-3 overflow-x-auto no-scrollbar shrink-0">
              <button
                onClick={() => setSelectedMusicCategory('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedMusicCategory === 'all'
                    ? 'bg-amber-500 text-slate-950'
                    : isLightMode
                    ? 'bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All ({TRACK_LIST.length})
              </button>
              {Object.keys(MUSIC_CATEGORIES).map((catKey) => (
                <button
                  key={catKey}
                  onClick={() => setSelectedMusicCategory(catKey)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedMusicCategory === catKey
                      ? 'bg-amber-500 text-slate-950'
                      : isLightMode
                      ? 'bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200'
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
                        ? isLightMode
                          ? 'bg-amber-50 border-amber-300 shadow-sm'
                          : 'bg-amber-500/15 border-amber-500/60 shadow-md'
                        : isLightMode
                        ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold truncate ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{tr.name}</span>
                        {isCurrent && (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                            isLightMode ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            Playing
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{tr.mood}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-mono uppercase ${isLightMode ? 'text-slate-500' : 'text-slate-500'}`}>
                        {tr.category}
                      </span>
                      {isCurrent && musicIsPlaying ? (
                        <Pause className={`w-4 h-4 ${isLightMode ? 'text-amber-600' : 'text-amber-400'}`} />
                      ) : (
                        <Play className={`w-4 h-4 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ================= SUB-MODAL: BOARD THEME PICKER ================= */}
        {activeSubModal === 'board_picker' && renderSubModal(
          'Select Chessboard Theme',
          null,
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
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? isLightMode
                        ? 'bg-amber-50 border-amber-300 shadow-sm'
                        : 'bg-amber-500/15 border-amber-500/60 shadow-md'
                      : isLightMode
                      ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-9 rounded-lg overflow-hidden border grid grid-cols-4 grid-rows-2 shrink-0 ${isLightMode ? 'border-slate-300' : 'border-slate-700/80'}`}>
                      {[0, 1, 0, 1, 1, 0, 1, 0].map((val, idx) => (
                        <div
                          key={idx}
                          style={{ backgroundColor: val === 0 ? b.light : b.dark }}
                        />
                      ))}
                    </div>
                    <div className="text-left">
                      <span className={`text-xs font-bold block capitalize ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{b.name}</span>
                      {b.isLight && <span className={`text-[10px] font-medium ${isLightMode ? 'text-amber-700' : 'text-amber-400'}`}>Light Luxury Theme</span>}
                    </div>
                  </div>
                  {isSelected && <Check className={`w-4 h-4 ${isLightMode ? 'text-amber-600' : 'text-amber-400'}`} />}
                </button>
              );
            })}
          </div>
        )}

        {/* ================= SUB-MODAL: PIECE CARVING PICKER (Exact styling matching Image 1) ================= */}
        {activeSubModal === 'piece_picker' && renderSubModal(
          'Select Chess Pieces Style',
          null,
          <div className="flex-1 overflow-y-auto py-3 space-y-4 px-1">
            {Object.keys(PIECE_THEMES).map((key) => {
              const p = PIECE_THEMES[key];
              const isSelected = settings.pieceTheme === key;
              return (
                <div key={key} className="space-y-1.5">
                  {/* Theme Title Centered Above Box (Matching Image 1) */}
                  <div className={`text-xs sm:text-sm font-bold text-center transition-colors ${
                    isSelected
                      ? isLightMode ? 'text-amber-700 font-extrabold' : 'text-amber-400 font-extrabold'
                      : isLightMode ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    {p.name}
                  </div>

                  {/* Piece Showcase Rounded Box */}
                  <button
                    onClick={() => {
                      triggerHaptic('move');
                      onUpdateSettings({ ...settings, pieceTheme: key });
                      setActiveSubModal(null);
                    }}
                    className={`w-full p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center justify-around cursor-pointer active:scale-98 ${
                      isSelected
                        ? isLightMode
                          ? 'bg-amber-50 border-2 border-amber-400 shadow-md ring-2 ring-amber-300/40'
                          : 'bg-amber-500/10 border-2 border-amber-400 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/20'
                        : isLightMode
                        ? 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    {['k', 'q', 'r', 'b', 'n', 'p'].map((pieceType, pIdx) => (
                      <div key={pIdx} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center">
                        <PieceIcon
                          piece={pieceType}
                          color={pIdx % 2 === 0 ? 'w' : 'b'}
                          size={32}
                          theme={key}
                          colorPalette={settings.pieceColorPalette || 'classic'}
                        />
                      </div>
                    ))}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= SUB-MODAL: PIECE COLOR PALETTE PICKER ================= */}
        {activeSubModal === 'color_picker' && renderSubModal(
          'Select Pieces Color Palette',
          null,
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
                  className={`w-full p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? isLightMode
                        ? 'bg-amber-50 border-amber-300 shadow-sm'
                        : 'bg-amber-500/15 border-amber-500/60 shadow-md'
                      : isLightMode
                      ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1.5 p-1 rounded-xl border ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                      <span className="w-5 h-5 rounded-full border border-slate-400" style={{ backgroundColor: pal.white }} />
                      <span className="w-5 h-5 rounded-full border border-slate-400" style={{ backgroundColor: pal.black }} />
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{pal.name}</span>
                      <span className={`text-[10px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>White & Black color finish</span>
                    </div>
                  </div>
                  {isSelected && <Check className={`w-4 h-4 ${isLightMode ? 'text-amber-600' : 'text-amber-400'}`} />}
                </button>
              );
            })}
          </div>
        )}
      </div>
  );

  if (isEmbedded) {
    return modalContent;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-fade-in">
      {modalContent}
    </div>
  );
}

function ToggleSwitch({ checked, onChange, isLight = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? 'bg-amber-500' : (isLight ? 'bg-slate-300' : 'bg-slate-800')
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
