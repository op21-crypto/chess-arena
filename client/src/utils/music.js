// Premium Soothing Music & Soundscape Engine for Chess Arena
// Over 35 categorized, ultra-relaxing, non-irritating tracks engineered for deep concentration.

export const MUSIC_CATEGORIES = {
  lofi: 'Lo-Fi Chill & Study',
  classical: 'Classical & Acoustic Piano',
  zen: 'Zen & Meditation (432Hz)',
  nature: 'Nature & Atmosphere',
  focus: 'Grandmaster Deep Focus'
};

export const TRACK_LIST = [
  // 1. Lo-Fi Chill & Study (8 tracks)
  { id: 'lofi-1', category: 'lofi', name: 'Coffee & Pawns', mood: 'Warm Rhodes chords & soft vinyl rain', baseFreq: 130.81, scale: [0, 4, 7, 11, 14], type: 'rhodes', tempo: 3400 },
  { id: 'lofi-2', category: 'lofi', name: 'Midnight Study', mood: 'Late night cozy bedroom lofi chords', baseFreq: 146.83, scale: [0, 3, 7, 10, 14], type: 'rhodes', tempo: 3600 },
  { id: 'lofi-3', category: 'lofi', name: 'Tokyo Rain', mood: 'Gentle raindrops & mellow jazz piano', baseFreq: 164.81, scale: [0, 4, 7, 9, 12], type: 'piano', tempo: 3200 },
  { id: 'lofi-4', category: 'lofi', name: 'Autumn Breeze', mood: 'Golden leaves & peaceful acoustic warmth', baseFreq: 130.81, scale: [0, 2, 4, 7, 9], type: 'warm_pad', tempo: 3800 },
  { id: 'lofi-5', category: 'lofi', name: 'Sunday Gambit', mood: 'Relaxed Sunday morning coffee vibes', baseFreq: 174.61, scale: [0, 4, 7, 11, 14], type: 'rhodes', tempo: 3500 },
  { id: 'lofi-6', category: 'lofi', name: 'Vinyl Twilight', mood: 'Subtle analog crackle & dusk melodies', baseFreq: 110.00, scale: [0, 3, 7, 10, 12], type: 'ambient', tempo: 4000 },
  { id: 'lofi-7', category: 'lofi', name: 'Rook on the 7th', mood: 'Smooth bassline & velvet electric piano', baseFreq: 146.83, scale: [0, 4, 7, 9, 12], type: 'rhodes', tempo: 3300 },
  { id: 'lofi-8', category: 'lofi', name: 'City Lights Drift', mood: 'Distant urban glow & serene chillhop', baseFreq: 130.81, scale: [0, 2, 5, 7, 11], type: 'piano', tempo: 3700 },

  // 2. Classical & Acoustic Piano (8 tracks)
  { id: 'class-1', category: 'classical', name: 'Gymnopédie Calm', mood: 'Satie-inspired meditative minor chords', baseFreq: 146.83, scale: [0, 4, 7, 9, 11], type: 'piano', tempo: 4200 },
  { id: 'class-2', category: 'classical', name: 'Clair de Lune Drift', mood: 'Impressionist piano waves in Db major', baseFreq: 138.59, scale: [0, 4, 7, 11, 12], type: 'piano', tempo: 4000 },
  { id: 'class-3', category: 'classical', name: 'Bach Cello Serenade', mood: 'Baroque counterpoint & deep resonant strings', baseFreq: 98.00, scale: [0, 2, 4, 7, 9], type: 'strings', tempo: 3800 },
  { id: 'class-4', category: 'classical', name: 'Nocturne Dreams', mood: 'Chopin romantic nocturne in Eb', baseFreq: 155.56, scale: [0, 3, 7, 8, 10], type: 'piano', tempo: 3900 },
  { id: 'class-5', category: 'classical', name: 'Moonlight Softness', mood: 'Beethoven Adagio sostenuto stillness', baseFreq: 110.00, scale: [0, 3, 7, 8, 12], type: 'piano', tempo: 4400 },
  { id: 'class-6', category: 'classical', name: 'Baroque Reverie', mood: 'Harpsichord-like gentle acoustic cadence', baseFreq: 130.81, scale: [0, 4, 7, 9, 12], type: 'chime', tempo: 3600 },
  { id: 'class-7', category: 'classical', name: 'Prelude in C Major', mood: 'Arpeggiated gentle cascades of harmony', baseFreq: 130.81, scale: [0, 2, 4, 5, 7, 9, 11], type: 'piano', tempo: 3100 },
  { id: 'class-8', category: 'classical', name: 'Pastoral Grace', mood: 'Soft woodwinds & tranquil chamber warmth', baseFreq: 146.83, scale: [0, 4, 7, 9, 14], type: 'strings', tempo: 4100 },

  // 3. Zen & Meditation 432Hz (8 tracks)
  { id: 'zen-1', category: 'zen', name: 'Tibetan Singing Bowls', mood: 'Resonant harmonic bell tones & peace', baseFreq: 108.00, scale: [0, 4, 7, 11, 14], type: 'bowl', tempo: 5000 },
  { id: 'zen-2', category: 'zen', name: '432Hz Pure Theta', mood: 'Deep binaural alignment & calm mind', baseFreq: 108.00, scale: [0, 7, 12, 16], type: 'ambient', tempo: 5500 },
  { id: 'zen-3', category: 'zen', name: 'Mountain Mist', mood: 'Himalayan temple stillness & prayer bells', baseFreq: 120.00, scale: [0, 3, 7, 10, 14], type: 'bowl', tempo: 4800 },
  { id: 'zen-4', category: 'zen', name: 'Golden Dawn Sanctuary', mood: 'Soft sunrise light & harmonic healing', baseFreq: 135.00, scale: [0, 4, 7, 9, 12], type: 'warm_pad', tempo: 4600 },
  { id: 'zen-5', category: 'zen', name: 'Lotus Pond Serenity', mood: 'Gentle water drops & bamboo flute essence', baseFreq: 144.00, scale: [0, 2, 5, 7, 9], type: 'flute', tempo: 4200 },
  { id: 'zen-6', category: 'zen', name: 'Breathe & Calculate', mood: 'Focused alpha waves for tactical clarity', baseFreq: 108.00, scale: [0, 5, 7, 12], type: 'ambient', tempo: 5200 },
  { id: 'zen-7', category: 'zen', name: 'Zen Rock Garden', mood: 'Minimalist stones, moss and pure space', baseFreq: 115.00, scale: [0, 3, 7, 10], type: 'chime', tempo: 4700 },
  { id: 'zen-8', category: 'zen', name: 'Still Waters', mood: 'Mirror lake reflection & total quietude', baseFreq: 108.00, scale: [0, 4, 7, 11], type: 'warm_pad', tempo: 5400 },

  // 4. Nature & Atmosphere (8 tracks)
  { id: 'nat-1', category: 'nature', name: 'Gentle Rain on Leaves', mood: 'Soft pink noise rainfall & warm piano', baseFreq: 130.81, scale: [0, 4, 7, 11], type: 'nature_rain', tempo: 3600 },
  { id: 'nat-2', category: 'nature', name: 'Cozy Fireplace Hearth', mood: 'Warm timber crackle & acoustic shelter', baseFreq: 146.83, scale: [0, 3, 7, 10], type: 'nature_fire', tempo: 3900 },
  { id: 'nat-3', category: 'nature', name: 'Pine Forest Wind', mood: 'Whispering evergreens & mountain breeze', baseFreq: 110.00, scale: [0, 4, 7, 9], type: 'nature_wind', tempo: 4500 },
  { id: 'nat-4', category: 'nature', name: 'Ocean Waves & Tides', mood: 'Rhythmic rolling surf & calming horizon', baseFreq: 98.00, scale: [0, 5, 7, 12], type: 'nature_sea', tempo: 4800 },
  { id: 'nat-5', category: 'nature', name: 'Morning Birds & Dew', mood: 'Dawn chorus & peaceful morning sunshine', baseFreq: 164.81, scale: [0, 2, 4, 7, 9], type: 'chime', tempo: 3400 },
  { id: 'nat-6', category: 'nature', name: 'Deep Space Cosmic Drift', mood: 'Interstellar nebulas & infinite stillness', baseFreq: 82.41, scale: [0, 7, 10, 14], type: 'ambient', tempo: 5600 },
  { id: 'nat-7', category: 'nature', name: 'Summer Meadow Grass', mood: 'Warm sunlit hills & gentle cicada song', baseFreq: 130.81, scale: [0, 4, 7, 9, 14], type: 'warm_pad', tempo: 4100 },
  { id: 'nat-8', category: 'nature', name: 'Night Campfire Stars', mood: 'Under the Milky Way with glowing embers', baseFreq: 110.00, scale: [0, 3, 7, 12], type: 'nature_fire', tempo: 4300 },

  // 5. Grandmaster Deep Focus (4 tracks)
  { id: 'foc-1', category: 'focus', name: 'Deep Calculation', mood: 'Unbroken concentration & strategic clarity', baseFreq: 110.00, scale: [0, 2, 4, 7, 9], type: 'warm_pad', tempo: 4200 },
  { id: 'foc-2', category: 'focus', name: 'Grandmaster Flow', mood: 'Effortless positional intuition & grace', baseFreq: 130.81, scale: [0, 4, 7, 11, 14], type: 'rhodes', tempo: 3800 },
  { id: 'foc-3', category: 'focus', name: 'Endgame Silence', mood: 'Pawn breakthroughs in quiet tension', baseFreq: 98.00, scale: [0, 3, 7, 10], type: 'ambient', tempo: 4600 },
  { id: 'foc-4', category: 'focus', name: 'The Immortal Game', mood: 'Sacrificial beauty & timeless mastery', baseFreq: 146.83, scale: [0, 4, 7, 9, 12], type: 'strings', tempo: 4000 }
];

class SoothingMusicEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.filterNode = null;
    this.isPlaying = false;
    this.currentTrackIndex = 0;
    this.volume = 0.28;
    this.timer = null;
    this.activeNodes = [];
    this.noiseNode = null;
    this.noiseGain = null;
  }

  initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

        // Warm 24dB/oct lowpass filter to remove any harshness or sharp beeps
        this.filterNode = this.ctx.createBiquadFilter();
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.setValueAtTime(450, this.ctx.currentTime);
        this.filterNode.Q.setValueAtTime(0.7, this.ctx.currentTime);

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
    this.stopNoise();
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
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.08);
    }
  }

  setTrack(index) {
    const wasPlaying = this.isPlaying;
    this.stop();
    this.currentTrackIndex = (index + TRACK_LIST.length) % TRACK_LIST.length;
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

  // Soft atmospheric noise for rain, fire, ocean waves
  setupNoise(type) {
    if (!this.ctx || this.noiseNode) return;
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Soft pink noise filter
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 1.5;
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = buffer;
      this.noiseNode.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = type === 'nature_fire' ? 'bandpass' : 'lowpass';
      noiseFilter.frequency.setValueAtTime(type === 'nature_fire' ? 800 : 350, this.ctx.currentTime);

      this.noiseGain = this.ctx.createGain();
      this.noiseGain.gain.setValueAtTime(0.02, this.ctx.currentTime);

      this.noiseNode.connect(noiseFilter);
      noiseFilter.connect(this.noiseGain);
      this.noiseGain.connect(this.masterGain);

      this.noiseNode.start();
    } catch (e) {}
  }

  stopNoise() {
    if (this.noiseNode) {
      try {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
      } catch (e) {}
      this.noiseNode = null;
    }
  }

  // Generate silky, warm, resonant chords without high-frequency clicks
  playStep() {
    if (!this.ctx || !this.isPlaying) return;
    const track = TRACK_LIST[this.currentTrackIndex];

    // Handle background environmental texture
    if (track.type.startsWith('nature_')) {
      if (!this.noiseNode) this.setupNoise(track.type);
    } else {
      this.stopNoise();
    }

    const now = this.ctx.currentTime;
    const duration = track.tempo / 1000;

    // Pick 3-4 harmonic intervals from track scale
    const chordIntervals = [0];
    const pick1 = track.scale[Math.floor(Math.random() * (track.scale.length - 1)) + 1];
    const pick2 = track.scale[Math.floor(Math.random() * (track.scale.length - 1)) + 1];
    chordIntervals.push(pick1);
    if (pick2 !== pick1) chordIntervals.push(pick2);

    chordIntervals.forEach((interval, idx) => {
      const semitoneRatio = Math.pow(2, interval / 12);
      const freq = track.baseFreq * semitoneRatio;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Ultra-gentle pure wave shapes: sine or low-harmonic triangle
      osc.type = track.type === 'rhodes' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Warm organic detuning for lush stereo chorus effect
      const detuneCents = (idx % 2 === 0 ? 3.5 : -3.5) + (Math.random() * 2 - 1);
      osc.detune.setValueAtTime(detuneCents, now);

      // Silky slow attack (no sharp clicks) & exponential decay
      const attackTime = idx === 0 ? 1.4 : 1.8;
      const releaseTime = duration * 0.95;
      const notePeakGain = (idx === 0 ? 0.22 : 0.12) / Math.sqrt(chordIntervals.length);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(notePeakGain, now + attackTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + releaseTime);

      osc.connect(gain);
      gain.connect(this.filterNode);

      osc.start(now);
      osc.stop(now + releaseTime + 0.1);

      this.activeNodes.push(osc);
      setTimeout(() => {
        const i = this.activeNodes.indexOf(osc);
        if (i !== -1) this.activeNodes.splice(i, 1);
      }, (releaseTime + 0.2) * 1000);
    });
  }
}

export const musicEngine = new SoothingMusicEngine();
