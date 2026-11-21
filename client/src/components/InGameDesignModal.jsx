import React, { useState } from 'react';
import { X, Sparkles, Palette, Check, Volume2, VolumeX, Eye, RotateCcw } from 'lucide-react';
import { BOARD_THEMES, PIECE_THEMES, PIECE_COLOR_PALETTES, PieceIcon } from './PieceIcons.jsx';

export function InGameDesignModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  isBoardFlipped,
  onToggleFlip,
  isLight = false
}) {
  const [activeTab, setActiveTab] = useState('board'); // 'board' | 'pieces' | 'palette'

  if (!isOpen) return null;

  const currentBoard = BOARD_THEMES[settings.boardTheme] || BOARD_THEMES.greenwich || BOARD_THEMES.cappuccino;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[88vh] transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-950/60 border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 shadow-md">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base flex items-center gap-1.5 leading-tight">
                <span>In-Game Design Studio</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Customization applies in real-time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Board Mini-Preview Strip */}
        <div className={`p-3.5 border-b flex items-center justify-between gap-4 ${
          isLight ? 'bg-amber-50/40 border-slate-200' : 'bg-slate-950/40 border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            {/* 2x2 Mini Board swatch */}
            <div
              className="w-12 h-12 rounded-lg border overflow-hidden grid grid-cols-2 grid-rows-2 shadow-inner shrink-0"
              style={{ borderColor: currentBoard.border }}
            >
              <div style={{ backgroundColor: currentBoard.light }} className="flex items-center justify-center">
                <PieceIcon piece="n" color="w" theme={settings.pieceTheme} size={18} />
              </div>
              <div style={{ backgroundColor: currentBoard.dark }} className="flex items-center justify-center">
                <PieceIcon piece="p" color="b" theme={settings.pieceTheme} size={18} />
              </div>
              <div style={{ backgroundColor: currentBoard.dark }} className="flex items-center justify-center">
                <PieceIcon piece="r" color="b" theme={settings.pieceTheme} size={18} />
              </div>
              <div style={{ backgroundColor: currentBoard.light }} className="flex items-center justify-center">
                <PieceIcon piece="k" color="w" theme={settings.pieceTheme} size={18} />
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold leading-tight truncate">
                {currentBoard.name}
              </div>
              <div className={`text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Pieces: {PIECE_THEMES[settings.pieceTheme]?.name || 'Staunton'}
              </div>
            </div>
          </div>

          {/* Quick Board Flip Action */}
          {onToggleFlip && (
            <button
              onClick={onToggleFlip}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs shrink-0 ${
                isBoardFlipped
                  ? (isLight ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-500/20 text-amber-300 border-amber-500/40')
                  : (isLight ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300')
              }`}
              title="Flip Board View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isBoardFlipped ? 'Black View' : 'White View'}</span>
            </button>
          )}
        </div>

        {/* Studio Tabs */}
        <div className={`flex border-b px-3 pt-2 gap-2 ${
          isLight ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-950/20 border-slate-800'
        }`}>
          <button
            onClick={() => setActiveTab('board')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'board'
                ? 'border-amber-500 text-amber-500'
                : 'border-transparent text-slate-500 hover:text-slate-400'
            }`}
          >
            Board Theme
          </button>
          <button
            onClick={() => setActiveTab('pieces')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'pieces'
                ? 'border-amber-500 text-amber-500'
                : 'border-transparent text-slate-500 hover:text-slate-400'
            }`}
          >
            Piece Carving
          </button>
          <button
            onClick={() => setActiveTab('palette')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'palette'
                ? 'border-amber-500 text-amber-500'
                : 'border-transparent text-slate-500 hover:text-slate-400'
            }`}
          >
            Color Palette
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 min-h-[220px]">
          {/* TAB 1: BOARD THEMES */}
          {activeTab === 'board' && (
            <div className="grid grid-cols-2 gap-2.5">
              {Object.entries(BOARD_THEMES).map(([key, theme]) => {
                const isSelected = settings.boardTheme === key;
                return (
                  <button
                    key={key}
                    onClick={() => onUpdateSettings({ ...settings, boardTheme: key })}
                    className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all relative overflow-hidden group ${
                      isSelected
                        ? (isLight
                            ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-400/40 shadow-sm'
                            : 'bg-amber-950/20 border-amber-500 ring-2 ring-amber-500/40 shadow-sm')
                        : (isLight
                            ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                            : 'bg-slate-950/50 hover:bg-slate-800/60 border-slate-800')
                    }`}
                  >
                    {/* Swatch */}
                    <div
                      className="w-10 h-10 rounded-xl border overflow-hidden grid grid-cols-2 grid-rows-2 shrink-0 shadow-xs"
                      style={{ borderColor: theme.border }}
                    >
                      <div style={{ backgroundColor: theme.light }} />
                      <div style={{ backgroundColor: theme.dark }} />
                      <div style={{ backgroundColor: theme.dark }} />
                      <div style={{ backgroundColor: theme.light }} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate leading-tight">
                        {theme.name}
                      </div>
                      <div className={`text-[10px] mt-0.5 truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {key === 'amoled' ? 'Deep Contrast' : 'Fine Wood / Slate'}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: PIECE CARVINGS */}
          {activeTab === 'pieces' && (
            <div className="grid grid-cols-2 gap-2.5">
              {Object.entries(PIECE_THEMES).map(([key, theme]) => {
                const isSelected = settings.pieceTheme === key;
                return (
                  <button
                    key={key}
                    onClick={() => onUpdateSettings({ ...settings, pieceTheme: key })}
                    className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all group ${
                      isSelected
                        ? (isLight
                            ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-400/40 shadow-sm'
                            : 'bg-amber-950/20 border-amber-500 ring-2 ring-amber-500/40 shadow-sm')
                        : (isLight
                            ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                            : 'bg-slate-950/50 hover:bg-slate-800/60 border-slate-800')
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-xs ${
                      isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                    }`}>
                      <PieceIcon piece="k" color="w" theme={key} size={22} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate leading-tight">
                        {theme.name}
                      </div>
                      <div className={`text-[10px] mt-0.5 truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {theme.desc?.split(' ')[0] || 'Royal'} Set
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 3: PIECE PALETTES */}
          {activeTab === 'palette' && (
            <div className="space-y-2">
              {Object.entries(PIECE_COLOR_PALETTES).map(([key, pal]) => {
                const isSelected = settings.piecePalette === key;
                return (
                  <button
                    key={key}
                    onClick={() => onUpdateSettings({ ...settings, piecePalette: key })}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? (isLight
                            ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-400/40 shadow-sm'
                            : 'bg-amber-950/20 border-amber-500 ring-2 ring-amber-500/40 shadow-sm')
                        : (isLight
                            ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                            : 'bg-slate-950/50 hover:bg-slate-800/60 border-slate-800')
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center -space-x-2">
                        <div
                          className="w-7 h-7 rounded-full border shadow-sm"
                          style={{ backgroundColor: pal.white, borderColor: pal.whiteStroke }}
                        />
                        <div
                          className="w-7 h-7 rounded-full border shadow-sm"
                          style={{ backgroundColor: pal.black, borderColor: pal.blackStroke }}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold">{pal.name}</div>
                        <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          Accent: {pal.accent}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Toggles Footer */}
        <div className={`p-3 border-t flex items-center justify-between text-xs font-medium ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
        }`}>
          {/* Sound Toggle */}
          <button
            onClick={() => onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              settings.soundEnabled
                ? (isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30')
                : (isLight ? 'bg-slate-200 text-slate-500 border-slate-300' : 'bg-slate-800 text-slate-400 border-slate-700')
            }`}
          >
            {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Sound FX</span>
          </button>

          {/* Coordinates Toggle */}
          <button
            onClick={() => onUpdateSettings({ ...settings, coordinates: !settings.coordinates })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              settings.coordinates
                ? (isLight ? 'bg-indigo-50 text-indigo-800 border-indigo-300' : 'bg-indigo-950/40 text-indigo-400 border-indigo-500/30')
                : (isLight ? 'bg-slate-200 text-slate-500 border-slate-300' : 'bg-slate-800 text-slate-400 border-slate-700')
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Coordinates</span>
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
