// Video Game Music & Atmospheric Soundscape Engine for Chess Arena
// 20 iconic video game tracks engineered for immersive, focused, and enjoyable gaming.

export const MUSIC_CATEGORIES = {
  rpg: 'Retro RPG & Adventure',
  chiptune: '8-Bit & 16-Bit Classics',
  arena: 'Epic Chess Strategy',
  cozy: 'Cozy Worlds & Synthwave'
};

export const TRACK_LIST = [
  // 1. Retro RPG & Adventure (5 tracks)
  {
    id: 'rpg-1',
    category: 'rpg',
    name: 'Village of Dawn',
    mood: 'Peaceful RPG starter village with cheerful acoustic tavern melodies',
    baseFreq: 130.81, // C3
    scale: [0, 4, 7, 11, 14], // Cmaj9
    progression: [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]],
    type: 'rpg_pluck',
    tempo: 3200
  },
  {
    id: 'rpg-2',
    category: 'rpg',
    name: "The King's Tavern",
    mood: 'Warm medieval inn lute, crackling hearthside, and cozy fellowship',
    baseFreq: 146.83, // D3
    scale: [0, 3, 7, 10, 14], // Dm9
    progression: [[0, 3, 7], [10, 14, 17], [5, 9, 12], [0, 3, 7]],
    type: 'rpg_pluck',
    tempo: 3400
  },
  {
    id: 'rpg-3',
    category: 'rpg',
    name: 'Fairy Fountain Glade',
    mood: 'Mystical Great Fairy spring with cascading harp arpeggios and magic dust',
    baseFreq: 164.81, // E3
    scale: [0, 4, 7, 11, 16], // Emaj7
    progression: [[0, 4, 7, 11], [2, 6, 9, 13], [5, 9, 12, 16], [7, 11, 14, 18]],
    type: 'cozy_bell',
    tempo: 3000
  },
  {
    id: 'rpg-4',
    category: 'rpg',
    name: 'Royal Citadel March',
    mood: 'Noble castle throne room with cathedral organ and chamber heraldry',
    baseFreq: 110.00, // A2
    scale: [0, 3, 7, 10, 12], // Am7
    progression: [[0, 3, 7], [5, 8, 12], [7, 11, 14], [0, 3, 7]],
    type: 'hero_strings',
    tempo: 3600
  },
  {
    id: 'rpg-5',
    category: 'rpg',
    name: 'Whispering Woods',
    mood: 'Enchanted ancient forest with Celtic flute echoes and leafy light',
    baseFreq: 123.47, // B2
    scale: [0, 2, 5, 7, 10], // B dorian
    progression: [[0, 3, 7], [5, 9, 12], [2, 5, 9], [0, 3, 7]],
    type: 'rpg_pluck',
    tempo: 3300
  },

  // 2. 8-Bit & 16-Bit Classics (5 tracks)
  {
    id: 'chip-1',
    category: 'chiptune',
    name: 'Overworld Hero',
    mood: 'Iconic 8-bit NES overworld quest with buoyant arpeggiated bounce',
    baseFreq: 130.81, // C3
    scale: [0, 4, 7, 12, 16],
    progression: [[0, 4, 7, 12], [5, 9, 12, 17], [7, 11, 14, 19], [0, 4, 7, 12]],
    type: 'chiptune',
    tempo: 2600
  },
  {
    id: 'chip-2',
    category: 'chiptune',
    name: 'Pixel Dungeon Crawl',
    mood: 'Stealthy 16-bit dungeon exploration with mysterious square-wave pulse',
    baseFreq: 110.00, // A2
    scale: [0, 3, 7, 8, 12],
    progression: [[0, 3, 7], [3, 7, 10], [5, 8, 12], [2, 5, 8]],
    type: 'chiptune',
    tempo: 2800
  },
  {
    id: 'chip-3',
    category: 'chiptune',
    name: 'Neon Arcade Fever',
    mood: 'Upbeat coin-op arcade champion rhythm with vibrant retro chords',
    baseFreq: 146.83, // D3
    scale: [0, 4, 7, 9, 12],
    progression: [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]],
    type: 'chiptune',
    tempo: 2400
  },
  {
    id: 'chip-4',
    category: 'chiptune',
    name: 'Battle of the Titans',
    mood: 'Dramatic 16-bit boss battle confrontation with driving counterpoint',
    baseFreq: 98.00, // G2
    scale: [0, 3, 6, 9, 12], // Diminished / intense
    progression: [[0, 3, 7], [1, 5, 8], [6, 9, 12], [0, 3, 7]],
    type: 'chiptune',
    tempo: 2500
  },
  {
    id: 'chip-5',
    category: 'chiptune',
    name: 'Stage Clear Fanfare',
    mood: 'Joyful post-victory level clear melody with sparkling tri-tone flourishes',
    baseFreq: 130.81, // C3
    scale: [0, 4, 7, 11, 14, 18],
    progression: [[0, 4, 7], [4, 7, 11], [5, 9, 12], [7, 11, 14]],
    type: 'chiptune',
    tempo: 2700
  },

  // 3. Epic Chess Strategy (5 tracks)
  {
    id: 'arena-1',
    category: 'arena',
    name: 'Grandmaster Arena',
    mood: 'Regal orchestral arena march for calculating masterminds',
    baseFreq: 110.00, // A2
    scale: [0, 3, 7, 10, 14],
    progression: [[0, 3, 7], [5, 9, 12], [8, 12, 15], [7, 11, 14]],
    type: 'arena_brass',
    tempo: 3600
  },
  {
    id: 'arena-2',
    category: 'arena',
    name: 'Clash of Kings',
    mood: 'Dark cinematic battle between opposing royal armies on the 64 squares',
    baseFreq: 98.00, // G2
    scale: [0, 3, 7, 8, 10],
    progression: [[0, 3, 7], [3, 7, 10], [5, 8, 12], [0, 3, 7]],
    type: 'arena_brass',
    tempo: 3800
  },
  {
    id: 'arena-3',
    category: 'arena',
    name: 'Tactical Siege',
    mood: 'Resonant war drums and sweeping brass tactical anticipation',
    baseFreq: 123.47, // B2
    scale: [0, 3, 7, 9, 12],
    progression: [[0, 3, 7], [7, 10, 14], [5, 9, 12], [2, 5, 9]],
    type: 'arena_brass',
    tempo: 3500
  },
  {
    id: 'arena-4',
    category: 'arena',
    name: 'Clock Pressure Pulse',
    mood: 'Minimalist high-stakes blitz tension echoing the heartbeat of the clock',
    baseFreq: 87.31, // F2
    scale: [0, 7, 12, 15],
    progression: [[0, 7], [5, 12], [3, 10], [0, 7]],
    type: 'synthwave',
    tempo: 3100
  },
  {
    id: 'arena-5',
    category: 'arena',
    name: 'The Immortal Duel',
    mood: 'Heroic romantic gambit theme celebrating timeless sacrificial beauty',
    baseFreq: 130.81, // C3
    scale: [0, 4, 7, 9, 12],
    progression: [[0, 4, 7], [9, 12, 16], [5, 9, 12], [7, 11, 14]],
    type: 'hero_strings',
    tempo: 3700
  },

  // 4. Cozy Game Worlds & Synthwave (5 tracks)
  {
    id: 'cozy-1',
    category: 'cozy',
    name: 'Floating Cloud Isle',
    mood: 'Dreamy floating sky garden with gentle kalimba and crystal bells',
    baseFreq: 146.83, // D3
    scale: [0, 4, 7, 11, 14],
    progression: [[0, 4, 7], [2, 6, 9], [5, 9, 12], [7, 11, 14]],
    type: 'cozy_bell',
    tempo: 3200
  },
  {
    id: 'cozy-2',
    category: 'cozy',
    name: 'Cyber Knight 2077',
    mood: 'Glowing cyberpunk neon city with lush analog synth bassline glide',
    baseFreq: 110.00, // A2
    scale: [0, 3, 7, 10, 14],
    progression: [[0, 3, 7], [8, 12, 15], [5, 8, 12], [7, 10, 14]],
    type: 'synthwave',
    tempo: 3000
  },
  {
    id: 'cozy-3',
    category: 'cozy',
    name: 'Valley Sunset Farm',
    mood: 'Relaxing harvest simulator golden hour with acoustic porch warmth',
    baseFreq: 130.81, // C3
    scale: [0, 4, 7, 9, 12],
    progression: [[0, 4, 7], [5, 9, 12], [9, 12, 16], [7, 11, 14]],
    type: 'rpg_pluck',
    tempo: 3400
  },
  {
    id: 'cozy-4',
    category: 'cozy',
    name: 'Star Sanctuary',
    mood: 'Peaceful celestial puzzle oasis beneath glowing constellations',
    baseFreq: 164.81, // E3
    scale: [0, 4, 7, 11, 14],
    progression: [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]],
    type: 'cozy_bell',
    tempo: 3500
  },
  {
    id: 'cozy-5',
    category: 'cozy',
    name: 'Space Station Orbit',
    mood: 'Zero-gravity ambient sci-fi glide with deep cosmic resonance',
    baseFreq: 82.41, // E2
    scale: [0, 7, 10, 14, 19],
    progression: [[0, 7, 10], [5, 12, 15], [3, 10, 14], [0, 7, 10]],
    type: 'synthwave',
    tempo: 3900
  }
];

class GameMusicEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.filterNode = null;
    this.isPlaying = false;
    this.currentTrackIndex = 0;
    this.volume = 0.35;
    this.timer = null;
    this.stepIndex = 0;
    this.activeNodes = [];
  }

  initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

        // Warm 24dB/oct lowpass filter for lush, non-fatiguing game sound
        this.filterNode = this.ctx.createBiquadFilter();
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.setValueAtTime(1400, this.ctx.currentTime);
        this.filterNode.Q.setValueAtTime(1.1, this.ctx.currentTime);

        this.filterNode.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  start() {
    this.initCtx();
    if (!this.ctx || this.isPlaying) return;

    this.isPlaying = true;
    this.stepIndex = 0;
    this.playStep();

    const track = TRACK_LIST[this.currentTrackIndex];
    this.timer = setInterval(() => {
      if (this.isPlaying) {
        this.playStep();
      }
    }, track.tempo);
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.activeNodes.forEach(node => {
      try {
        node.stop();
        node.disconnect();
      } catch (e) {}
    });
    this.activeNodes = [];
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  setTrack(index) {
    const wasPlaying = this.isPlaying;
    this.stop();
    this.currentTrackIndex = (index + TRACK_LIST.length) % TRACK_LIST.length;
    this.stepIndex = 0;
    if (wasPlaying) {
      this.start();
    }
  }

  nextTrack() {
    this.setTrack(this.currentTrackIndex + 1);
  }

  prevTrack() {
    this.setTrack(this.currentTrackIndex - 1);
  }

  getCurrentTrack() {
    return TRACK_LIST[this.currentTrackIndex];
  }

  getTracksByCategory(cat) {
    if (!cat) return TRACK_LIST;
    return TRACK_LIST.filter(t => t.category === cat);
  }

  // Generate immersive game music step
  playStep() {
    if (!this.ctx || !this.isPlaying) return;
    const track = TRACK_LIST[this.currentTrackIndex];
    const now = this.ctx.currentTime;
    const duration = track.tempo / 1000;

    // Determine current chord in progression
    const progression = track.progression || [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]];
    const chordIntervals = progression[this.stepIndex % progression.length];
    this.stepIndex++;

    // Adjust filter per track style
    if (track.type === 'chiptune') {
      this.filterNode.frequency.setTargetAtTime(2200, now, 0.1);
    } else if (track.type === 'arena_brass') {
      this.filterNode.frequency.setTargetAtTime(950, now, 0.1);
    } else if (track.type === 'cozy_bell') {
      this.filterNode.frequency.setTargetAtTime(2600, now, 0.1);
    } else {
      this.filterNode.frequency.setTargetAtTime(1400, now, 0.1);
    }

    if (track.type === 'chiptune') {
      // 8-Bit rapid arpeggio pattern (authentic retro gaming chiptune!)
      chordIntervals.forEach((interval, i) => {
        const semitoneRatio = Math.pow(2, interval / 12);
        const freq = track.baseFreq * semitoneRatio * 2; // Octave up for melody

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = i === 0 ? 'triangle' : 'square';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        gain.gain.setValueAtTime(0.0001, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.18, now + i * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.35);

        osc.connect(gain);
        gain.connect(this.filterNode);

        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.4);

        this.activeNodes.push(osc);
      });

      // Solid 8-bit bass note
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(track.baseFreq * Math.pow(2, chordIntervals[0] / 12), now);
      bassGain.gain.setValueAtTime(0.0001, now);
      bassGain.gain.linearRampToValueAtTime(0.24, now + 0.05);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.85);

      bassOsc.connect(bassGain);
      bassGain.connect(this.filterNode);
      bassOsc.start(now);
      bassOsc.stop(now + duration * 0.9);
      this.activeNodes.push(bassOsc);

    } else if (track.type === 'rpg_pluck') {
      // Acoustic Lute / Harp plucked chords
      chordIntervals.forEach((interval, idx) => {
        const strumDelay = idx * 0.06; // Strummed chord effect
        const semitoneRatio = Math.pow(2, interval / 12);
        const freq = track.baseFreq * semitoneRatio;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + strumDelay);
        osc.detune.setValueAtTime((idx % 2 === 0 ? 3 : -3), now + strumDelay);

        gain.gain.setValueAtTime(0.0001, now + strumDelay);
        gain.gain.linearRampToValueAtTime(0.22, now + strumDelay + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + strumDelay + duration * 0.85);

        osc.connect(gain);
        gain.connect(this.filterNode);

        osc.start(now + strumDelay);
        osc.stop(now + strumDelay + duration * 0.9);
        this.activeNodes.push(osc);
      });

    } else if (track.type === 'cozy_bell') {
      // Shimmering crystal bells & celestial glockenspiel
      chordIntervals.forEach((interval, idx) => {
        const semitoneRatio = Math.pow(2, interval / 12);
        const freq = track.baseFreq * semitoneRatio * 2;

        const osc = this.ctx.createOscillator();
        const harmOsc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        harmOsc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        harmOsc.frequency.setValueAtTime(freq * 2.76, now + idx * 0.08); // Bell inharmonicity

        gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + duration * 0.95);

        osc.connect(gain);
        harmOsc.connect(gain);
        gain.connect(this.filterNode);

        osc.start(now + idx * 0.08);
        harmOsc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + duration);
        harmOsc.stop(now + idx * 0.08 + duration);

        this.activeNodes.push(osc, harmOsc);
      });

    } else if (track.type === 'arena_brass') {
      // Deep orchestral brass & battle strings
      chordIntervals.forEach((interval, idx) => {
        const semitoneRatio = Math.pow(2, interval / 12);
        const freq = track.baseFreq * semitoneRatio;

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, now);
        osc2.frequency.setValueAtTime(freq, now);
        osc1.detune.setValueAtTime(5, now);
        osc2.detune.setValueAtTime(-5, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.9);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.filterNode);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + duration);
        osc2.stop(now + duration);

        this.activeNodes.push(osc1, osc2);
      });

    } else {
      // Default synthwave & hero strings
      chordIntervals.forEach((interval, idx) => {
        const semitoneRatio = Math.pow(2, interval / 12);
        const freq = track.baseFreq * semitoneRatio;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = track.type === 'synthwave' ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime((idx % 2 === 0 ? 4 : -4), now);

        const attackTime = 0.8;
        const releaseTime = duration * 0.92;

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.2, now + attackTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + releaseTime);

        osc.connect(gain);
        gain.connect(this.filterNode);

        osc.start(now);
        osc.stop(now + releaseTime + 0.1);
        this.activeNodes.push(osc);
      });
    }

    // Clean up finished nodes
    setTimeout(() => {
      this.activeNodes = this.activeNodes.filter(n => {
        try {
          return n.playbackState !== 3; // Not finished
        } catch {
          return false;
        }
      });
    }, (duration + 0.2) * 1000);
  }
}

export const musicEngine = new GameMusicEngine();
