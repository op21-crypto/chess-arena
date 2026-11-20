import React, { useState, useEffect } from 'react';
import { Music, Play, Pause, SkipForward, Volume2, VolumeX, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { musicEngine } from '../utils/music.js';
import { triggerHaptic } from '../utils/device.js';

export function MiniMusicPlayer({
  settings,
  onUpdateSettings,
  onOpenSettings
}) {
  const [isPlaying, setIsPlaying] = useState(musicEngine.isPlaying);
  const [isMinimized, setIsMinimized] = useState(true);
  const tracks = musicEngine.tracks;
  const currentTrack = tracks[settings.musicTrackIndex % tracks.length];

  useEffect(() => {
    setIsPlaying(musicEngine.isPlaying);
  }, [musicEngine.isPlaying, settings.musicTrackIndex]);

  const togglePlay = () => {
    triggerHaptic('move');
    if (musicEngine.isPlaying) {
      musicEngine.stop();
      setIsPlaying(false);
      onUpdateSettings({ ...settings, musicEnabled: false });
    } else {
      musicEngine.start();
      setIsPlaying(true);
      onUpdateSettings({ ...settings, musicEnabled: true });
    }
  };

  const handleNext = () => {
    triggerHaptic('move');
    const newIdx = (settings.musicTrackIndex + 1) % tracks.length;
    musicEngine.setTrack(newIdx);
    onUpdateSettings({ ...settings, musicTrackIndex: newIdx });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md overflow-hidden transition-all duration-200">
      {/* Compact Mini Bar */}
      <div className="flex items-center justify-between p-2.5 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={togglePlay}
            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-90 ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 animate-pulse'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title={isPlaying ? 'Pause Music' : 'Play Chill Music'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 truncate">
              <Music className={`w-3 h-3 shrink-0 ${isPlaying ? 'text-amber-400' : 'text-slate-500'}`} />
              <span className="text-xs font-bold text-white truncate max-w-[130px] md:max-w-[170px]">
                {currentTrack.name}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono block truncate">
              Track {settings.musicTrackIndex + 1}/{tracks.length}
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Next Track"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isMinimized ? 'Expand Audio Controls' : 'Collapse'}
          >
            {isMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
            title="Open Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Slider Controls */}
      {!isMinimized && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-800/80 bg-slate-950/40 space-y-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <VolumeX className="w-3 h-3 text-slate-500" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={(e) => {
                const vol = parseFloat(e.target.value);
                musicEngine.setVolume(vol);
                onUpdateSettings({ ...settings, musicVolume: vol });
              }}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <Volume2 className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] font-mono text-slate-400 w-7 text-right">
              {Math.round(settings.musicVolume * 100)}%
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>{currentTrack.mood}</span>
            <button
              onClick={onOpenSettings}
              className="text-amber-400 hover:underline font-semibold"
            >
              All Settings →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
