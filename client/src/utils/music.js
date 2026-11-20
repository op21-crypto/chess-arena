// Video Game Login & Title Screen Music Engine for Chess Arena
// 20 iconic login themes, main menu anthems, and chill matchmaking lounges synthesized via Web Audio API.
// Zero external assets or network dependencies - guaranteed instant, high fidelity, and 100% reliable.

export const MUSIC_CATEGORIES = {
  signature: 'Signature Sound Identity',
  title: 'Login & Title Anthems',
  lobby: 'Lobby & Matchmaking Lounge',
  orchestral: 'Championship Orchestral',
  cyber: 'Cyberpunk & Arcade Login'
};

export const TRACK_LIST = [
  // 0. Signature Dynamic Adaptive Soundscape
  {
    id: 'sig-adaptive',
    category: 'signature',
    name: 'Arena Signature (Soft Piano & Match Tension)',
    mood: 'Signature dynamic soundscape: gentle soft piano when navigating; seamlessly shifts into intense cinematic tension during matches',
    baseFreq: 130.81, // C3
    type: 'signature_adaptive',
    tempo: 3400
  },
  {
    id: 'sig-piano',
    category: 'signature',
    name: 'Gymnopédie for 64 Squares (Soft Piano Solo)',
    mood: 'Soothing acoustic grand piano with warm felt hammers, rolling contemplative arpeggios, and delicate raindrop notes',
    baseFreq: 130.81, // C3
    type: 'soft_piano',
    tempo: 3400
  },
  {
    id: 'sig-duel',
    category: 'signature',
    name: 'The Grandmaster’s Duel (Match Tension)',
    mood: 'Atmospheric tactical duel with driving heartbeat pulse, bowed cellos, ticking clock, and dramatic suspense chords',
    baseFreq: 146.83, // D3
    type: 'match_intense',
    tempo: 2200
  },

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
    this.volume = 0.30;
    this.currentMode = 'menu'; // 'menu' (soft piano) | 'match' (intense tactical tension)
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
        this.filterNode.frequency.setValueAtTime(1600, this.ctx.currentTime);
        this.filterNode.Q.setValueAtTime(1.1, this.ctx.currentTime);

        this.filterNode.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setMode(mode) {
    if (this.currentMode === mode) return;
    this.currentMode = mode; // 'menu' | 'match'

    const track = TRACK_LIST[this.currentTrackIndex];
    if (track && (track.type === 'signature_adaptive' || track.category === 'signature')) {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      const newTempo = mode === 'match' ? 2200 : 3400;
      if (this.isPlaying) {
        this.timer = setInterval(() => {
          if (this.isPlaying) {
            this.playStep();
          }
        }, newTempo);
        // Trigger smooth step in the newly selected atmosphere immediately
        this.playStep();
      }
    }
  }

  start() {
    this.initCtx();
    if (!this.ctx || this.isPlaying) return;

    this.isPlaying = true;
    this.stepIndex = 0;
    this.playStep();

    const track = TRACK_LIST[this.currentTrackIndex];
    let tempo = track ? track.tempo : 3400;
    if (track && track.type === 'signature_adaptive') {
      tempo = this.currentMode === 'match' ? 2200 : 3400;
    }

    this.timer = setInterval(() => {
      if (this.isPlaying) {
        this.playStep();
      }
    }, tempo);
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

    // Signature adaptive / soft piano / match intense branches
    if (track.type === 'signature_adaptive') {
      if (this.currentMode === 'match') {
        this.playMatchIntenseStep(now, 2.2);
      } else {
        this.playSoftPianoStep(now, 3.4);
      }
      return;
    }

    if (track.type === 'soft_piano') {
      this.playSoftPianoStep(now, duration);
      return;
    }

    if (track.type === 'match_intense') {
      this.playMatchIntenseStep(now, duration);
      return;
    }

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

  // =========================================================================
  // SIGNATURE SOUND IDENTITY: SOFT GRAND PIANO SYNTHESIS
  // =========================================================================
  playPianoKey(freq, startTime, duration, velocity = 0.5) {
    if (!this.ctx) return;

    // 1. Piano felt hammer impact transient (short wood strike)
    const hammerOsc = this.ctx.createOscillator();
    const hammerGain = this.ctx.createGain();
    hammerOsc.type = 'triangle';
    hammerOsc.frequency.setValueAtTime(freq * 3.8, startTime);
    hammerOsc.frequency.exponentialRampToValueAtTime(freq * 0.9, startTime + 0.012);
    hammerGain.gain.setValueAtTime(0.06 * velocity, startTime);
    hammerGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.016);
    hammerOsc.connect(hammerGain);
    hammerGain.connect(this.filterNode);
    hammerOsc.start(startTime);
    hammerOsc.stop(startTime + 0.02);

    // 2. Multi-string acoustic unison oscillators (Natural piano chorused strings)
    const osc1 = this.ctx.createOscillator(); // Fundamental sine
    const osc2 = this.ctx.createOscillator(); // Warm triangle body
    const osc3 = this.ctx.createOscillator(); // Octave harmonic (warmth)
    const keyGain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc3.type = 'sine';

    osc1.frequency.setValueAtTime(freq, startTime);
    osc2.frequency.setValueAtTime(freq, startTime);
    osc3.frequency.setValueAtTime(freq * 2.001, startTime);

    // Microscopic acoustic piano detuning (±1.6 cents)
    osc1.detune.setValueAtTime(-1.6, startTime);
    osc2.detune.setValueAtTime(1.6, startTime);

    // Piano amplitude envelope: 7ms attack -> quick body rebound -> slow soundboard decay
    const attackTime = 0.007;
    const peakGain = 0.22 * velocity;
    const bodyLevel = peakGain * 0.45;
    const ringTime = Math.min(duration, 3.8);

    keyGain.gain.setValueAtTime(0.0001, startTime);
    keyGain.gain.linearRampToValueAtTime(peakGain, startTime + attackTime);
    keyGain.gain.exponentialRampToValueAtTime(bodyLevel, startTime + 0.12);
    keyGain.gain.exponentialRampToValueAtTime(0.0001, startTime + ringTime);

    osc1.connect(keyGain);
    osc2.connect(keyGain);
    osc3.connect(keyGain);
    keyGain.connect(this.filterNode);

    osc1.start(startTime);
    osc2.start(startTime);
    osc3.start(startTime);

    osc1.stop(startTime + ringTime + 0.05);
    osc2.stop(startTime + ringTime + 0.05);
    osc3.stop(startTime + ringTime + 0.05);

    this.activeNodes.push(osc1, osc2, osc3, hammerOsc);
  }

  // Generative Soft Grand Piano for App Open, Menus & Study (Gymnopédie / Satie & Chopin Inspired)
  playSoftPianoStep(now, duration) {
    if (!this.ctx) return;

    // Warm, silky acoustic low-pass filter (1650Hz)
    this.filterNode.frequency.setTargetAtTime(1650, now, 0.1);

    const PIANO_PROGRESSION = [
      // 0. Cmaj9 (expansive, welcoming, serene)
      {
        bass: 65.41, // C2
        harmony: [130.81, 196.00, 246.94, 329.63, 293.66], // C3, G3, B3, E4, D4
        melody: [
          { freq: 587.33, delay: 0.45, dur: 1.8, vel: 0.65 }, // D5
          { freq: 493.88, delay: 1.10, dur: 1.6, vel: 0.50 }  // B4
        ]
      },
      // 1. Em9 (introspective, thoughtful chess calculation)
      {
        bass: 82.41, // E2
        harmony: [164.81, 246.94, 392.00, 587.33], // E3, B3, G4, D5
        melody: [
          { freq: 739.99, delay: 0.40, dur: 1.7, vel: 0.65 }, // F#5
          { freq: 659.25, delay: 1.20, dur: 1.8, vel: 0.55 }  // E5
        ]
      },
      // 2. Fmaj7(#11) (poetic, deep beauty, contemplative wonder)
      {
        bass: 87.31, // F2
        harmony: [174.61, 261.63, 329.63, 440.00, 493.88], // F3, C4, E4, A4, B4
        melody: [
          { freq: 523.25, delay: 0.50, dur: 1.9, vel: 0.60 }, // C5
          { freq: 440.00, delay: 1.30, dur: 1.5, vel: 0.50 }  // A4
        ]
      },
      // 3. Am9 (solemn intellectual mastery)
      {
        bass: 55.00, // A1
        harmony: [110.00, 164.81, 261.63, 329.63, 493.88], // A2, E3, C4, E4, B4
        melody: [
          { freq: 659.25, delay: 0.45, dur: 1.8, vel: 0.65 }, // E5
          { freq: 587.33, delay: 1.15, dur: 1.5, vel: 0.55 }  // D5
        ]
      },
      // 4. Dm9 (soft, delicate emotional depth)
      {
        bass: 73.42, // D2
        harmony: [146.83, 220.00, 349.23, 523.25], // D3, A3, F4, C5
        melody: [
          { freq: 659.25, delay: 0.40, dur: 1.7, vel: 0.60 }, // E5
          { freq: 587.33, delay: 1.20, dur: 1.8, vel: 0.55 }  // D5
        ]
      },
      // 5. G7sus4 -> G6 (gentle resolution)
      {
        bass: 98.00, // G2
        harmony: [196.00, 261.63, 293.66, 392.00, 493.88], // G3, C4, D4, G4, B4
        melody: [
          { freq: 493.88, delay: 0.50, dur: 1.6, vel: 0.60 }, // B4
          { freq: 523.25, delay: 1.25, dur: 1.9, vel: 0.70 }  // C5
        ]
      }
    ];

    const chord = PIANO_PROGRESSION[this.stepIndex % PIANO_PROGRESSION.length];
    this.stepIndex++;

    // 1. Resonant piano bass note
    this.playPianoKey(chord.bass, now, duration * 0.95, 0.75);

    // 2. Rolled harmony chord with 34ms human strum timing
    chord.harmony.forEach((freq, idx) => {
      const strumTime = now + 0.04 + (idx * 0.034);
      this.playPianoKey(freq, strumTime, duration * 0.9, 0.55);
    });

    // 3. Delicate high raindrop melody notes
    if (chord.melody) {
      chord.melody.forEach(({ freq, delay, dur, vel }) => {
        this.playPianoKey(freq, now + delay, dur, vel);
      });
    }

    // Schedule cleanup
    setTimeout(() => {
      this.activeNodes = this.activeNodes.filter(n => {
        try {
          return n.playbackState !== 3;
        } catch {
          return false;
        }
      });
    }, (duration + 0.3) * 1000);
  }

  // =========================================================================
  // SIGNATURE SOUND IDENTITY: INTENSE MATCH BATTLE ATMOSPHERE
  // =========================================================================
  playMatchIntenseStep(now, duration) {
    if (!this.ctx) return;

    // Filter opens to 1950Hz to bring subtle urgency and sharpness
    this.filterNode.frequency.setTargetAtTime(1950, now, 0.1);

    const TENSION_PROGRESSION = [
      // 0. Dm add9 - Deep strategic tension, game begins
      {
        root: 73.42, // D2
        pedal: 36.71, // D1 deep sub
        harmony: [146.83, 220.00, 349.23, 440.00, 493.88], // D3, A3, F4, A4, B4
        tensionChime: 880.00 // A5 high suspended clock chime
      },
      // 1. Bbmaj7 - Sharp tactical flank & counterattack
      {
        root: 58.27, // Bb1
        pedal: 29.14, // Bb0 deep sub
        harmony: [116.54, 174.61, 220.00, 293.66, 349.23], // Bb2, F3, A3, D4, F4
        tensionChime: 932.33 // Bb5
      },
      // 2. C#dim7 - Pin, critical calculation, maximum tension
      {
        root: 69.30, // C#2
        pedal: 34.65, // C#1
        harmony: [138.59, 164.81, 196.00, 233.08, 277.18], // C#3, E3, G3, Bb3, C#4
        tensionChime: 1108.73 // C#6
      },
      // 3. Gm6 / E - Time pressure & complications
      {
        root: 82.41, // E2 (inverted)
        pedal: 41.20, // E1
        harmony: [164.81, 196.00, 246.94, 293.66, 392.00], // E3, G3, B3, D4, G4
        tensionChime: 783.99 // G5
      },
      // 4. Dm / A - King under pressure, relentless calculation
      {
        root: 55.00, // A1
        pedal: 55.00,
        harmony: [110.00, 146.83, 220.00, 349.23, 440.00], // A2, D3, A3, F4, A4
        tensionChime: 880.00 // A5
      },
      // 5. A7(b9) - Decisive endgame crisis / mating net
      {
        root: 55.00, // A1
        pedal: 27.50, // A0
        harmony: [110.00, 164.81, 220.00, 277.18, 311.13, 392.00], // A2, E3, A3, C#4, Eb4, G4
        tensionChime: 1174.66 // D6
      }
    ];

    const chord = TENSION_PROGRESSION[this.stepIndex % TENSION_PROGRESSION.length];
    this.stepIndex++;

    // 1. Deep Bowed Cello / Double-Bass Ostinato (Saw + Triangle with slow swell)
    const bassSaw = this.ctx.createOscillator();
    const bassTri = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    const bassFilter = this.ctx.createBiquadFilter();

    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(320, now);
    bassFilter.frequency.linearRampToValueAtTime(460, now + duration * 0.45);
    bassFilter.frequency.linearRampToValueAtTime(280, now + duration * 0.9);

    bassSaw.type = 'sawtooth';
    bassTri.type = 'triangle';
    bassSaw.frequency.setValueAtTime(chord.root, now);
    bassTri.frequency.setValueAtTime(chord.pedal, now);

    bassGain.gain.setValueAtTime(0.001, now);
    bassGain.gain.linearRampToValueAtTime(0.32, now + 0.35); // Slow bowed cello swell
    bassGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.95);

    bassSaw.connect(bassFilter);
    bassTri.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(this.masterGain);

    bassSaw.start(now);
    bassTri.start(now);
    bassSaw.stop(now + duration);
    bassTri.stop(now + duration);
    this.activeNodes.push(bassSaw, bassTri);

    // 2. Rhythmic Heartbeat & Ticking Clock Pulse
    // A. Downbeat heartbeat kick (t = 0)
    const kickOsc = this.ctx.createOscillator();
    const kickGain = this.ctx.createGain();
    kickOsc.type = 'sine';
    kickOsc.frequency.setValueAtTime(82, now);
    kickOsc.frequency.exponentialRampToValueAtTime(36, now + 0.08);
    kickGain.gain.setValueAtTime(0.42, now);
    kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    kickOsc.connect(kickGain);
    kickGain.connect(this.masterGain);
    kickOsc.start(now);
    kickOsc.stop(now + 0.1);
    this.activeNodes.push(kickOsc);

    // B. Offbeat second pulse (t = duration * 0.46) - Heartbeat 'lub-dub' + Clock Tick
    const beatTime = now + (duration * 0.46);
    const subBeatOsc = this.ctx.createOscillator();
    const subBeatGain = this.ctx.createGain();
    subBeatOsc.type = 'sine';
    subBeatOsc.frequency.setValueAtTime(70, beatTime);
    subBeatOsc.frequency.exponentialRampToValueAtTime(32, beatTime + 0.07);
    subBeatGain.gain.setValueAtTime(0.26, beatTime);
    subBeatGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.08);
    subBeatOsc.connect(subBeatGain);
    subBeatGain.connect(this.masterGain);
    subBeatOsc.start(beatTime);
    subBeatOsc.stop(beatTime + 0.09);
    this.activeNodes.push(subBeatOsc);

    // Clock tick transient on the offbeat (1350Hz acoustic wooden tick)
    const tickOsc = this.ctx.createOscillator();
    const tickGain = this.ctx.createGain();
    tickOsc.type = 'triangle';
    tickOsc.frequency.setValueAtTime(1350, beatTime);
    tickGain.gain.setValueAtTime(0.09, beatTime);
    tickGain.gain.exponentialRampToValueAtTime(0.0001, beatTime + 0.015);
    tickOsc.connect(tickGain);
    tickGain.connect(this.filterNode);
    tickOsc.start(beatTime);
    tickOsc.stop(beatTime + 0.02);
    this.activeNodes.push(tickOsc);

    // 3. Tense Tactical Piano Stabs
    chord.harmony.forEach((freq, idx) => {
      const hitTime = now + 0.02 + (idx * 0.02);
      this.playPianoKey(freq, hitTime, duration * 0.75, 0.48);
    });

    // 4. High Suspended Tension Clock Chime (delicate high bell chime)
    if (chord.tensionChime) {
      const chimeOsc = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(chord.tensionChime, now + 0.12);
      chimeGain.gain.setValueAtTime(0.001, now + 0.12);
      chimeGain.gain.linearRampToValueAtTime(0.08, now + 0.14);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.85);
      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.filterNode);
      chimeOsc.start(now + 0.12);
      chimeOsc.stop(now + duration * 0.9);
      this.activeNodes.push(chimeOsc);
    }

    // Schedule cleanup
    setTimeout(() => {
      this.activeNodes = this.activeNodes.filter(n => {
        try {
          return n.playbackState !== 3;
        } catch {
          return false;
        }
      });
    }, (duration + 0.3) * 1000);
  }
}

export const musicEngine = new GameMusicEngine();
