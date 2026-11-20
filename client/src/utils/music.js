// Video Game Login & Title Screen Music Engine for Chess Arena
// 20 iconic login themes, main menu anthems, and chill matchmaking lounges synthesized via Web Audio API.
// Zero external assets or network dependencies - guaranteed instant, high fidelity, and 100% reliable.

export const MUSIC_CATEGORIES = {
  title: 'Login & Title Anthems',
  lobby: 'Lobby & Matchmaking Lounge',
  orchestral: 'Championship Orchestral',
  cyber: 'Cyberpunk & Arcade Login'
};

export const TRACK_LIST = [
  // 1. Login & Title Anthems (5 tracks)
  {
    id: 'title-1',
    category: 'title',
    name: 'Gate of Champions (Main Title)',
    mood: 'Majestic grand title screen theme with shimmering crystal bells and deep regal pads',
    baseFreq: 130.81, // C3
    scale: [0, 4, 7, 11, 14], // Cmaj9
    progression: [[0, 4, 7, 11], [5, 9, 12, 16], [7, 11, 14, 18], [0, 4, 7, 11]],
    type: 'title_anthem',
    tempo: 3400
  },
  {
    id: 'title-2',
    category: 'title',
    name: 'Arena Dawn Login',
    mood: 'Inspiring morning login screen with warm sweeping harmony and anticipation',
    baseFreq: 146.83, // D3
    scale: [0, 4, 7, 9, 14], // Dmaj9
    progression: [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]],
    type: 'title_anthem',
    tempo: 3200
  },
  {
    id: 'title-3',
    category: 'title',
    name: 'Ascension Prelude',
    mood: 'Classic cascading crystal harp arpeggio prelude over deep sustained sub-bass',
    baseFreq: 130.81, // C3
    scale: [0, 4, 7, 11, 12, 16, 19, 23],
    progression: [[0, 4, 7, 11], [9, 12, 16, 19], [5, 9, 12, 16], [7, 11, 14, 18]],
    type: 'crystal_prelude',
    tempo: 2800
  },
  {
    id: 'title-4',
    category: 'title',
    name: "The Grandmaster's Sanctum",
    mood: 'Solemn mystical cathedral title theme celebrating timeless chess mastery',
    baseFreq: 110.00, // A2
    scale: [0, 3, 7, 10, 14], // Am9
    progression: [[0, 3, 7], [5, 8, 12], [8, 12, 15], [7, 11, 14]],
    type: 'title_anthem',
    tempo: 3600
  },
  {
    id: 'title-5',
    category: 'title',
    name: 'Celestial Gates (Title Theme)',
    mood: 'Dreamy ethereal gateway theme with heavenly glockenspiel and warm pads',
    baseFreq: 164.81, // E3
    scale: [0, 4, 7, 11, 14],
    progression: [[0, 4, 7, 11], [2, 6, 9, 13], [5, 9, 12, 16], [7, 11, 14, 18]],
    type: 'crystal_prelude',
    tempo: 3000
  },

  // 2. Lobby & Matchmaking Lounge (5 tracks)
  {
    id: 'lobby-1',
    category: 'lobby',
    name: 'Lobby Velvet Lounge',
    mood: 'Smooth neo-soul Rhodes electric piano chords for relaxed lobby preparation',
    baseFreq: 174.61, // F3
    scale: [0, 4, 7, 11, 14], // Fmaj9
    progression: [[0, 4, 7, 11], [2, 5, 9, 12], [7, 11, 14, 17], [0, 4, 7, 11]],
    type: 'lobby_rhodes',
    tempo: 3300
  },
  {
    id: 'lobby-2',
    category: 'lobby',
    name: 'Ranked Queue Chillhop',
    mood: 'Mellow lo-fi matchmaking groove with warm analog electric piano and bass',
    baseFreq: 146.83, // D3
    scale: [0, 3, 7, 10, 14], // Dm9
    progression: [[0, 3, 7], [10, 14, 17], [5, 8, 12], [0, 3, 7]],
    type: 'lobby_rhodes',
    tempo: 3100
  },
  {
    id: 'lobby-3',
    category: 'lobby',
    name: 'Waiting Room Groove',
    mood: 'Hypnotic chill lounge progression with soft vibrato and deep sub-bass glide',
    baseFreq: 110.00, // A2
    scale: [0, 3, 7, 10, 14], // Am9
    progression: [[0, 3, 7, 10], [5, 9, 12, 15], [3, 7, 10, 14], [7, 10, 14, 17]],
    type: 'lobby_rhodes',
    tempo: 3200
  },
  {
    id: 'lobby-4',
    category: 'lobby',
    name: 'Midnight Strategy Bar',
    mood: 'Late-night jazz lounge chords for tactical focus and clear mind',
    baseFreq: 98.00, // G2
    scale: [0, 3, 7, 10, 14, 17], // Gm11
    progression: [[0, 3, 7, 10], [5, 8, 12, 15], [8, 12, 15, 19], [7, 10, 14, 17]],
    type: 'lobby_rhodes',
    tempo: 3500
  },
  {
    id: 'lobby-5',
    category: 'lobby',
    name: 'Coffee & Tactics',
    mood: 'Cozy morning acoustic warmth with gentle plucked guitar and mellow bass',
    baseFreq: 130.81, // C3
    scale: [0, 4, 7, 9, 14], // Cmaj9
    progression: [[0, 4, 7], [5, 9, 12], [9, 12, 16], [7, 11, 14]],
    type: 'rpg_pluck',
    tempo: 3400
  },

  // 3. Championship Orchestral (5 tracks)
  {
    id: 'orch-1',
    category: 'orchestral',
    name: 'Crown & Scepter',
    mood: 'Regal brass fanfare and heraldic symphony for royal tournaments',
    baseFreq: 110.00, // A2
    scale: [0, 3, 7, 10, 14],
    progression: [[0, 3, 7], [5, 9, 12], [8, 12, 15], [7, 11, 14]],
    type: 'arena_brass',
    tempo: 3600
  },
  {
    id: 'orch-2',
    category: 'orchestral',
    name: 'Immortal Throne',
    mood: 'Dramatic cinematic battle theme between opposing kings on the 64 squares',
    baseFreq: 98.00, // G2
    scale: [0, 3, 7, 8, 10],
    progression: [[0, 3, 7], [3, 7, 10], [5, 8, 12], [0, 3, 7]],
    type: 'arena_brass',
    tempo: 3800
  },
  {
    id: 'orch-3',
    category: 'orchestral',
    name: 'Knights of the Round',
    mood: 'Heroic noble adventure march with driving chordal movement and brass depth',
    baseFreq: 123.47, // B2
    scale: [0, 3, 7, 9, 12],
    progression: [[0, 3, 7], [7, 10, 14], [5, 9, 12], [2, 5, 9]],
    type: 'arena_brass',
    tempo: 3500
  },
  {
    id: 'orch-4',
    category: 'orchestral',
    name: 'Checkmate Destiny',
    mood: 'Grand championship finals theme with escalating tension and glory',
    baseFreq: 146.83, // D3
    scale: [0, 3, 7, 10, 14],
    progression: [[0, 3, 7], [8, 12, 15], [10, 14, 17], [5, 8, 12]],
    type: 'title_anthem',
    tempo: 3700
  },
  {
    id: 'orch-5',
    category: 'orchestral',
    name: 'Halls of Valhalla',
    mood: 'Thunderous Viking arena anthem with resonant low brass and triumphant peaks',
    baseFreq: 82.41, // E2
    scale: [0, 3, 7, 10, 12],
    progression: [[0, 3, 7], [5, 8, 12], [7, 10, 14], [0, 3, 7]],
    type: 'arena_brass',
    tempo: 3900
  },

  // 4. Cyberpunk & Arcade Login (5 tracks)
  {
    id: 'cyber-1',
    category: 'cyber',
    name: 'Neon Gateway 2088',
    mood: 'Iconic 80s analog synth login theme with wide stereo chorus and driving pulse',
    baseFreq: 110.00, // A2
    scale: [0, 3, 7, 10, 14],
    progression: [[0, 3, 7], [8, 12, 15], [5, 8, 12], [7, 10, 14]],
    type: 'cyber_login',
    tempo: 3000
  },
  {
    id: 'cyber-2',
    category: 'cyber',
    name: 'Arcade Title Select',
    mood: 'Upbeat coin-op title select theme with catchy 16-bit retro bounce',
    baseFreq: 146.83, // D3
    scale: [0, 4, 7, 9, 12],
    progression: [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]],
    type: 'chiptune',
    tempo: 2500
  },
  {
    id: 'cyber-3',
    category: 'cyber',
    name: 'Synthwave Expressway',
    mood: 'Midnight neon drive synth pads with deep analog bassline glide',
    baseFreq: 87.31, // F2
    scale: [0, 7, 10, 14],
    progression: [[0, 7], [5, 12], [3, 10], [0, 7]],
    type: 'cyber_login',
    tempo: 2900
  },
  {
    id: 'cyber-4',
    category: 'cyber',
    name: 'Digital Colosseum',
    mood: 'Retro futuristic cyber battle arena intro with vibrant square wave lead',
    baseFreq: 98.00, // G2
    scale: [0, 3, 7, 10, 12],
    progression: [[0, 3, 7], [3, 7, 10], [5, 8, 12], [2, 5, 8]],
    type: 'chiptune',
    tempo: 2700
  },
  {
    id: 'cyber-5',
    category: 'cyber',
    name: 'Matrix Reboot',
    mood: 'Futuristic sci-fi terminal boot screen with zero-gravity stereo sweeps',
    baseFreq: 82.41, // E2
    scale: [0, 7, 10, 14, 19],
    progression: [[0, 7, 10], [5, 12, 15], [3, 10, 14], [0, 7, 10]],
    type: 'cyber_login',
    tempo: 3600
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

  // Generate rich, musical game audio step
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
    } else if (track.type === 'crystal_prelude') {
      this.filterNode.frequency.setTargetAtTime(2400, now, 0.1);
    } else if (track.type === 'lobby_rhodes') {
      this.filterNode.frequency.setTargetAtTime(1150, now, 0.1);
    } else {
      this.filterNode.frequency.setTargetAtTime(1450, now, 0.1);
    }

    if (track.type === 'title_anthem') {
      // Majestic orchestral title screen anthem with swell & shimmer
      chordIntervals.forEach((interval, idx) => {
        const semitoneRatio = Math.pow(2, interval / 12);
        const freq = track.baseFreq * semitoneRatio;

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const shimmerOsc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'triangle';
        shimmerOsc.type = 'sine';

        osc1.frequency.setValueAtTime(freq, now);
        osc2.frequency.setValueAtTime(freq, now);
        shimmerOsc.frequency.setValueAtTime(freq * 2, now + 0.1);

        osc1.detune.setValueAtTime((idx % 2 === 0 ? 5 : -5), now);
        osc2.detune.setValueAtTime((idx % 2 === 0 ? -4 : 4), now);

        const attackTime = 0.55;
        const releaseTime = duration * 0.95;

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.18, now + attackTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + releaseTime);

        osc1.connect(gain);
        osc2.connect(gain);
        shimmerOsc.connect(gain);
        gain.connect(this.filterNode);

        osc1.start(now);
        osc2.start(now);
        shimmerOsc.start(now + 0.1);

        osc1.stop(now + releaseTime + 0.1);
        osc2.stop(now + releaseTime + 0.1);
        shimmerOsc.stop(now + releaseTime + 0.1);

        this.activeNodes.push(osc1, osc2, shimmerOsc);
      });

      // Majestic sub-bass foundation
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(track.baseFreq * Math.pow(2, chordIntervals[0] / 12) * 0.5, now);
      bassGain.gain.setValueAtTime(0.0001, now);
      bassGain.gain.linearRampToValueAtTime(0.28, now + 0.4);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.95);

      bassOsc.connect(bassGain);
      bassGain.connect(this.filterNode);
      bassOsc.start(now);
      bassOsc.stop(now + duration);
      this.activeNodes.push(bassOsc);

    } else if (track.type === 'lobby_rhodes') {
      // Warm Rhodes electric piano chords with smooth sine/triangle blend
      chordIntervals.forEach((interval, idx) => {
        const strumDelay = idx * 0.04;
        const semitoneRatio = Math.pow(2, interval / 12);
        const freq = track.baseFreq * semitoneRatio;

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const tineOsc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'triangle';
        tineOsc.type = 'sine'; // Tine bell attack

        osc1.frequency.setValueAtTime(freq, now + strumDelay);
        osc2.frequency.setValueAtTime(freq, now + strumDelay);
        tineOsc.frequency.setValueAtTime(freq * 3.01, now + strumDelay);

        osc1.detune.setValueAtTime((idx % 2 === 0 ? 3 : -3), now + strumDelay);

        gain.gain.setValueAtTime(0.0001, now + strumDelay);
        gain.gain.linearRampToValueAtTime(0.24, now + strumDelay + 0.03); // Fast punchy attack
        gain.gain.exponentialRampToValueAtTime(0.0001, now + strumDelay + duration * 0.88);

        osc1.connect(gain);
        osc2.connect(gain);
        tineOsc.connect(gain);
        gain.connect(this.filterNode);

        osc1.start(now + strumDelay);
        osc2.start(now + strumDelay);
        tineOsc.start(now + strumDelay);

        osc1.stop(now + strumDelay + duration * 0.9);
        osc2.stop(now + strumDelay + duration * 0.9);
        tineOsc.stop(now + strumDelay + 0.15); // Fast tine decay

        this.activeNodes.push(osc1, osc2, tineOsc);
      });

    } else if (track.type === 'crystal_prelude') {
      // Classic ascending crystal prelude arpeggio (Final Fantasy / Zelda style)
      chordIntervals.forEach((interval, idx) => {
        const arpeggioDelay = idx * 0.11;
        const semitoneRatio = Math.pow(2, interval / 12);
        const freq = track.baseFreq * semitoneRatio * 2;

        const osc = this.ctx.createOscillator();
        const bellHarm = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        bellHarm.type = 'sine';

        osc.frequency.setValueAtTime(freq, now + arpeggioDelay);
        bellHarm.frequency.setValueAtTime(freq * 2.76, now + arpeggioDelay);

        gain.gain.setValueAtTime(0.0001, now + arpeggioDelay);
        gain.gain.linearRampToValueAtTime(0.22, now + arpeggioDelay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + arpeggioDelay + duration * 0.95);

        osc.connect(gain);
        bellHarm.connect(gain);
        gain.connect(this.filterNode);

        osc.start(now + arpeggioDelay);
        bellHarm.start(now + arpeggioDelay);
        osc.stop(now + arpeggioDelay + duration);
        bellHarm.stop(now + arpeggioDelay + duration);

        this.activeNodes.push(osc, bellHarm);
      });

      // Warm background drone
      const droneOsc = this.ctx.createOscillator();
      const droneGain = this.ctx.createGain();
      droneOsc.type = 'triangle';
      droneOsc.frequency.setValueAtTime(track.baseFreq * Math.pow(2, chordIntervals[0] / 12), now);
      droneGain.gain.setValueAtTime(0.0001, now);
      droneGain.gain.linearRampToValueAtTime(0.18, now + 0.4);
      droneGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.95);

      droneOsc.connect(droneGain);
      droneGain.connect(this.filterNode);
      droneOsc.start(now);
      droneOsc.stop(now + duration);
      this.activeNodes.push(droneOsc);

    } else if (track.type === 'cyber_login') {
      // 80s Cyberpunk analog synthwave with dual detuned saw and sub-bass
      chordIntervals.forEach((interval, idx) => {
        const semitoneRatio = Math.pow(2, interval / 12);
        const freq = track.baseFreq * semitoneRatio;

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';

        osc1.frequency.setValueAtTime(freq, now);
        osc2.frequency.setValueAtTime(freq, now);

        osc1.detune.setValueAtTime(7, now);
        osc2.detune.setValueAtTime(-7, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.16, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.92);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.filterNode);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + duration);
        osc2.stop(now + duration);

        this.activeNodes.push(osc1, osc2);
      });

      // Punchy analog bass
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(track.baseFreq * Math.pow(2, chordIntervals[0] / 12) * 0.5, now);
      subGain.gain.setValueAtTime(0.0001, now);
      subGain.gain.linearRampToValueAtTime(0.26, now + 0.04);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.85);

      subOsc.connect(subGain);
      subGain.connect(this.filterNode);
      subOsc.start(now);
      subOsc.stop(now + duration * 0.9);
      this.activeNodes.push(subOsc);

    } else if (track.type === 'chiptune') {
      // 8-Bit rapid arpeggio pattern
      chordIntervals.forEach((interval, i) => {
        const semitoneRatio = Math.pow(2, interval / 12);
        const freq = track.baseFreq * semitoneRatio * 2;

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
        gain.gain.linearRampToValueAtTime(0.17, now + 0.6);
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
      // Acoustic Lute / Harp plucked chords
      chordIntervals.forEach((interval, idx) => {
        const strumDelay = idx * 0.06;
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
