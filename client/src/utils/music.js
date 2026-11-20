// Chess Arena Signature Music & Sound Identity Engine
// 12 curated chess soundscapes: Soft acoustic grand piano, impressionist classical masterpieces,
// and soothing therapeutic ambient music synthesized via Web Audio API.
// Zero external mp3 downloads, zero network latency, 100% offline and reliable.

export const MUSIC_CATEGORIES = {
  signature: 'Signature Sound Identity',
  piano: 'Piano',
  classical: 'Classical',
  ambient: 'Ambient'
};

export const TRACK_LIST = [
  // --- 0. SIGNATURE ADAPTIVE THEME (DEFAULT MUSIC ON APP OPEN) ---
  {
    id: 'sig-adaptive',
    category: 'signature',
    name: 'Arena Signature (Soft Piano & Match Tension)',
    mood: 'Signature dynamic soundscape: gentle soft piano when navigating; seamlessly shifts into intense cinematic tension during matches',
    baseFreq: 130.81, // C3
    type: 'signature_adaptive',
    tempo: 3400
  },

  // --- 10 CURATED CHESS SOUNDSCAPES ---
  // 1. Nuvole Bianche (Piano - Ludovico Einaudi)
  {
    id: 'piano-nuvole',
    category: 'piano',
    name: 'Nuvole Bianche',
    artist: 'Ludovico Einaudi',
    mood: 'Soulful, emotional acoustic piano arpeggios that clear the mind for profound chess strategy',
    baseFreq: 110.00, // A2
    type: 'nuvole_bianche',
    tempo: 3100
  },

  // 2. Experience (Piano - Ludovico Einaudi)
  {
    id: 'piano-experience',
    category: 'piano',
    name: 'Experience',
    artist: 'Ludovico Einaudi',
    mood: 'Stirring minimalist piano with ascending cascading arpeggios of growing passion and victory',
    baseFreq: 110.00, // A2
    type: 'experience',
    tempo: 2600
  },

  // 3. Gymnopédie No. 1 (Classical - Erik Satie)
  {
    id: 'classical-gymnopedie',
    category: 'classical',
    name: 'Gymnopédie No. 1',
    artist: 'Erik Satie',
    mood: 'Iconic classical chess waltz with gentle floating chords and timeless melancholic grace',
    baseFreq: 98.00, // G2
    type: 'gymnopedie',
    tempo: 3500
  },

  // 4. Snowfall (Ambient - Øneheart)
  {
    id: 'ambient-snowfall',
    category: 'ambient',
    name: 'Snowfall',
    artist: 'Øneheart',
    mood: 'Nostalgic tape-delayed ambient piano with warm sub-bass and tranquil snowfall stillness',
    baseFreq: 65.41, // C2
    type: 'snowfall',
    tempo: 3400
  },

  // 5. Clair de Lune (Classical - Claude Debussy)
  {
    id: 'classical-clairdelune',
    category: 'classical',
    name: 'Clair de Lune',
    artist: 'Claude Debussy',
    mood: 'Impressionist moonlight piano masterpiece flowing like water across the 64 squares',
    baseFreq: 69.30, // Db2
    type: 'clair_de_lune',
    tempo: 3600
  },

  // 6. River Flows in You (Piano - Yiruma)
  {
    id: 'piano-riverflows',
    category: 'piano',
    name: 'River Flows in You',
    artist: 'Yiruma',
    mood: 'Gentle, romantic acoustic piano melody that inspires creative tactics and peaceful focus',
    baseFreq: 110.00, // A2
    type: 'river_flows',
    tempo: 2900
  },

  // 7. A Walk (Ambient - Tycho)
  {
    id: 'ambient-awalk',
    category: 'ambient',
    name: 'A Walk',
    artist: 'Tycho',
    mood: 'Warm analog synthesizer drifting chords and organic chillwave acoustic plucks',
    baseFreq: 98.00, // G2
    type: 'a_walk',
    tempo: 3200
  },

  // 8. Moonlight Sonata (Classical - Ludwig van Beethoven)
  {
    id: 'classical-moonlight',
    category: 'classical',
    name: 'Moonlight Sonata',
    artist: 'Ludwig van Beethoven',
    mood: 'Adagio sostenuto in C# minor with hypnotic, solemn triplet arpeggios of deep calculation',
    baseFreq: 69.30, // C#2
    type: 'moonlight_sonata',
    tempo: 3300
  },

  // 9. Weightless (Ambient - Marconi Union)
  {
    id: 'ambient-weightless',
    category: 'ambient',
    name: 'Weightless',
    artist: 'Marconi Union',
    mood: '60 BPM alpha-wave therapeutic ambient drone designed to lower heart rate and eliminate match anxiety',
    baseFreq: 77.78, // Eb2
    type: 'weightless',
    tempo: 4200
  },

  // 10. Canon in D (Classical - Johann Pachelbel)
  {
    id: 'classical-canond',
    category: 'classical',
    name: 'Canon in D',
    artist: 'Johann Pachelbel',
    mood: 'Noble, stately baroque cascading harmony celebrating royal chess history',
    baseFreq: 73.42, // D2
    type: 'canon_in_d',
    tempo: 3000
  },

  // --- DEDICATED INTENSE MATCH ATMOSPHERE ---
  {
    id: 'sig-duel',
    category: 'signature',
    name: 'The Grandmaster’s Duel (Match Tension)',
    mood: 'Atmospheric tactical duel with driving heartbeat pulse, bowed cellos, ticking clock, and dramatic suspense chords',
    baseFreq: 146.83, // D3
    type: 'match_intense',
    tempo: 2200
  }
];

class GameMusicEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.filterNode = null;
    this.isPlaying = false;
    this.currentTrackIndex = 0; // Default track: 0 (Arena Signature)
    this.volume = 0.30;
    this.currentMode = 'menu'; // 'menu' (soft piano) | 'match' (intense tactical tension)
    this.timer = null;
    this.stepIndex = 0;
    this.activeNodes = [];
  }

  initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

        // Warm 24dB/oct lowpass filter for silky, organic acoustic tones
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
    return TRACK_LIST[this.currentTrackIndex] || TRACK_LIST[0];
  }

  getTracksByCategory(cat) {
    if (!cat) return TRACK_LIST;
    return TRACK_LIST.filter(t => t.category === cat);
  }

  // Master Step Generator
  playStep() {
    if (!this.ctx || !this.isPlaying) return;
    const track = TRACK_LIST[this.currentTrackIndex];
    if (!track) return;
    const now = this.ctx.currentTime;
    const duration = track.tempo / 1000;

    switch (track.type) {
      case 'signature_adaptive':
        if (this.currentMode === 'match') {
          this.playMatchIntenseStep(now, 2.2);
        } else {
          this.playSoftPianoStep(now, 3.4);
        }
        break;
      case 'nuvole_bianche':
        this.playNuvoleBiancheStep(now, duration);
        break;
      case 'experience':
        this.playExperienceStep(now, duration);
        break;
      case 'gymnopedie':
        this.playGymnopedieStep(now, duration);
        break;
      case 'snowfall':
        this.playSnowfallStep(now, duration);
        break;
      case 'clair_de_lune':
        this.playClairDeLuneStep(now, duration);
        break;
      case 'river_flows':
        this.playRiverFlowsStep(now, duration);
        break;
      case 'a_walk':
        this.playAWalkStep(now, duration);
        break;
      case 'moonlight_sonata':
        this.playMoonlightSonataStep(now, duration);
        break;
      case 'weightless':
        this.playWeightlessStep(now, duration);
        break;
      case 'canon_in_d':
        this.playCanonInDStep(now, duration);
        break;
      case 'match_intense':
        this.playMatchIntenseStep(now, duration);
        break;
      default:
        this.playSoftPianoStep(now, duration);
        break;
    }
  }

  // =========================================================================
  // CORE SYNTHESIZER PRIMITIVES
  // =========================================================================

  // 1. Acoustic Concert Grand Piano Note
  playPianoKey(freq, startTime, duration, velocity = 0.5) {
    if (!this.ctx) return;

    // A. Piano felt hammer impact transient (short wood strike)
    const hammerOsc = this.ctx.createOscillator();
    const hammerGain = this.ctx.createGain();
    hammerOsc.type = 'triangle';
    hammerOsc.frequency.setValueAtTime(freq * 3.8, startTime);
    hammerOsc.frequency.exponentialRampToValueAtTime(freq * 0.9, startTime + 0.012);
    hammerGain.gain.setValueAtTime(0.05 * velocity, startTime);
    hammerGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.016);
    hammerOsc.connect(hammerGain);
    hammerGain.connect(this.filterNode);
    hammerOsc.start(startTime);
    hammerOsc.stop(startTime + 0.02);

    // B. Multi-string acoustic unison oscillators (Natural piano chorused strings)
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

    // Dynamic envelope: 7ms attack -> quick hammer release -> slow soundboard decay
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

  // 2. Warm Ambient Analog Synthesizer Pad
  playAmbientPad(freq, startTime, duration, velocity = 0.3) {
    if (!this.ctx) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const padGain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, startTime);
    osc2.frequency.setValueAtTime(freq, startTime);
    osc1.detune.setValueAtTime(-4, startTime);
    osc2.detune.setValueAtTime(4, startTime);

    padGain.gain.setValueAtTime(0.0001, startTime);
    padGain.gain.linearRampToValueAtTime(0.14 * velocity, startTime + 0.6);
    padGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.95);

    osc1.connect(padGain);
    osc2.connect(padGain);
    padGain.connect(this.filterNode);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
    this.activeNodes.push(osc1, osc2);
  }

  // 3. Resonant Sub-Bass
  playSubBass(freq, startTime, duration, velocity = 0.5) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.25 * velocity, startTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.95);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(startTime);
    osc.stop(startTime + duration);
    this.activeNodes.push(osc);
  }

  // =========================================================================
  // TRACK 0 & DEFAULT: SIGNATURE SOFT GRAND PIANO
  // =========================================================================
  playSoftPianoStep(now, duration) {
    if (!this.ctx) return;
    this.filterNode.frequency.setTargetAtTime(1650, now, 0.1);

    const PIANO_PROGRESSION = [
      {
        bass: 65.41, // C2
        harmony: [130.81, 196.00, 246.94, 329.63, 293.66], // Cmaj9
        melody: [
          { freq: 587.33, delay: 0.45, dur: 1.8, vel: 0.65 }, // D5
          { freq: 493.88, delay: 1.10, dur: 1.6, vel: 0.50 }  // B4
        ]
      },
      {
        bass: 82.41, // E2
        harmony: [164.81, 246.94, 392.00, 587.33], // Em9
        melody: [
          { freq: 739.99, delay: 0.40, dur: 1.7, vel: 0.65 }, // F#5
          { freq: 659.25, delay: 1.20, dur: 1.8, vel: 0.55 }  // E5
        ]
      },
      {
        bass: 87.31, // F2
        harmony: [174.61, 261.63, 329.63, 440.00, 493.88], // Fmaj7#11
        melody: [
          { freq: 523.25, delay: 0.50, dur: 1.9, vel: 0.60 }, // C5
          { freq: 440.00, delay: 1.30, dur: 1.5, vel: 0.50 }  // A4
        ]
      },
      {
        bass: 55.00, // A1
        harmony: [110.00, 164.81, 261.63, 329.63, 493.88], // Am9
        melody: [
          { freq: 659.25, delay: 0.45, dur: 1.8, vel: 0.65 }, // E5
          { freq: 587.33, delay: 1.15, dur: 1.5, vel: 0.55 }  // D5
        ]
      },
      {
        bass: 73.42, // D2
        harmony: [146.83, 220.00, 349.23, 523.25], // Dm9
        melody: [
          { freq: 659.25, delay: 0.40, dur: 1.7, vel: 0.60 }, // E5
          { freq: 587.33, delay: 1.20, dur: 1.8, vel: 0.55 }  // D5
        ]
      },
      {
        bass: 98.00, // G2
        harmony: [196.00, 261.63, 293.66, 392.00, 493.88], // G7sus4 -> G6
        melody: [
          { freq: 493.88, delay: 0.50, dur: 1.6, vel: 0.60 }, // B4
          { freq: 523.25, delay: 1.25, dur: 1.9, vel: 0.70 }  // C5
        ]
      }
    ];

    const chord = PIANO_PROGRESSION[this.stepIndex % PIANO_PROGRESSION.length];
    this.stepIndex++;

    this.playPianoKey(chord.bass, now, duration * 0.95, 0.75);
    chord.harmony.forEach((freq, idx) => {
      this.playPianoKey(freq, now + 0.04 + (idx * 0.034), duration * 0.9, 0.55);
    });
    if (chord.melody) {
      chord.melody.forEach(({ freq, delay, dur, vel }) => {
        this.playPianoKey(freq, now + delay, dur, vel);
      });
    }
  }

  // =========================================================================
  // TRACK 1: NUVOLE BIANCHE (Ludovico Einaudi)
  // =========================================================================
  playNuvoleBiancheStep(now, duration) {
    if (!this.ctx) return;
    this.filterNode.frequency.setTargetAtTime(1600, now, 0.1);

    const CHORDS = [
      // Am - emotional opening
      {
        bass: 110.00, // A2
        harmony: [164.81, 220.00, 261.63, 329.63], // E3, A3, C4, E4
        melody: [
          { freq: 523.25, delay: 0.35, dur: 1.6, vel: 0.7 }, // C5
          { freq: 493.88, delay: 1.05, dur: 1.4, vel: 0.6 }, // B4
          { freq: 440.00, delay: 1.80, dur: 1.2, vel: 0.5 }  // A4
        ]
      },
      // Fmaj7 - expanding contemplation
      {
        bass: 87.31, // F2
        harmony: [130.81, 174.61, 220.00, 329.63], // C3, F3, A3, E4
        melody: [
          { freq: 440.00, delay: 0.40, dur: 1.8, vel: 0.65 }, // A4
          { freq: 392.00, delay: 1.20, dur: 1.5, vel: 0.55 }  // G4
        ]
      },
      // Cmaj - peaceful clarity
      {
        bass: 65.41, // C2
        harmony: [130.81, 196.00, 261.63, 329.63], // C3, G3, C4, E4
        melody: [
          { freq: 523.25, delay: 0.35, dur: 1.6, vel: 0.7 }, // C5
          { freq: 587.33, delay: 1.10, dur: 1.5, vel: 0.65 } // D5
        ]
      },
      // G6 - noble resolution
      {
        bass: 98.00, // G2
        harmony: [146.83, 196.00, 246.94, 329.63], // D3, G3, B3, E4
        melody: [
          { freq: 493.88, delay: 0.40, dur: 1.7, vel: 0.65 }, // B4
          { freq: 523.25, delay: 1.25, dur: 1.6, vel: 0.60 }  // C5
        ]
      }
    ];

    const c = CHORDS[this.stepIndex % CHORDS.length];
    this.stepIndex++;

    this.playPianoKey(c.bass, now, duration * 0.95, 0.7);
    c.harmony.forEach((f, i) => {
      this.playPianoKey(f, now + 0.05 + (i * 0.038), duration * 0.85, 0.5);
    });
    c.melody.forEach(({ freq, delay, dur, vel }) => {
      this.playPianoKey(freq, now + delay, dur, vel);
    });
  }

  // =========================================================================
  // TRACK 2: EXPERIENCE (Ludovico Einaudi)
  // =========================================================================
  playExperienceStep(now, duration) {
    if (!this.ctx) return;
    this.filterNode.frequency.setTargetAtTime(1750, now, 0.1);

    const CHORDS = [
      // Am - ascending driving arpeggios
      {
        bass: 110.00,
        arpeggios: [220.00, 261.63, 329.63, 440.00, 523.25, 659.25] // A3, C4, E4, A4, C5, E5
      },
      // F - passionate crescendo
      {
        bass: 87.31,
        arpeggios: [174.61, 220.00, 261.63, 349.23, 440.00, 523.25] // F3, A3, C4, F4, A4, C5
      },
      // C - expansive triumph
      {
        bass: 65.41,
        arpeggios: [196.00, 261.63, 329.63, 392.00, 523.25, 659.25] // G3, C4, E4, G4, C5, E5
      },
      // Em/G - building anticipation
      {
        bass: 98.00,
        arpeggios: [164.81, 196.00, 246.94, 329.63, 392.00, 493.88] // E3, G3, B3, E4, G4, B4
      }
    ];

    const c = CHORDS[this.stepIndex % CHORDS.length];
    this.stepIndex++;

    this.playPianoKey(c.bass, now, duration * 0.95, 0.8);
    c.arpeggios.forEach((freq, idx) => {
      this.playPianoKey(freq, now + 0.08 + (idx * 0.12), duration * 0.75, 0.55);
    });
  }

  // =========================================================================
  // TRACK 3: GYMNOPÉDIE NO. 1 (Erik Satie)
  // =========================================================================
  playGymnopedieStep(now, duration) {
    if (!this.ctx) return;
    this.filterNode.frequency.setTargetAtTime(1550, now, 0.1);

    const CHORDS = [
      {
        bass: 98.00, // G2
        midChord: [246.94, 293.66, 369.99], // B3, D4, F#4
        melody: { freq: 440.00, delay: 0.70 } // A4
      },
      {
        bass: 73.42, // D2
        midChord: [185.00, 220.00, 277.18], // F#3, A3, C#4
        melody: { freq: 493.88, delay: 0.70 } // B4
      },
      {
        bass: 98.00, // G2
        midChord: [246.94, 293.66, 369.99],
        melody: { freq: 392.00, delay: 0.70 } // G4
      },
      {
        bass: 73.42, // D2
        midChord: [185.00, 220.00, 277.18],
        melody: { freq: 369.99, delay: 0.70 } // F#4
      }
    ];

    const c = CHORDS[this.stepIndex % CHORDS.length];
    this.stepIndex++;

    // Satie 3/4 waltz timing: bass on beat 1, rolled chord on beat 2, floating melody on beat 3
    this.playPianoKey(c.bass, now, duration * 0.95, 0.7);
    c.midChord.forEach((freq, idx) => {
      this.playPianoKey(freq, now + 0.32 + (idx * 0.03), duration * 0.8, 0.45);
    });
    if (c.melody) {
      this.playPianoKey(c.melody.freq, now + c.melody.delay, duration * 0.7, 0.65);
    }
  }

  // =========================================================================
  // TRACK 4: SNOWFALL (Øneheart)
  // =========================================================================
  playSnowfallStep(now, duration) {
    if (!this.ctx) return;
    this.filterNode.frequency.setTargetAtTime(1150, now, 0.1);

    const CHORDS = [
      { sub: 32.70, bass: 65.41, tape: [155.56, 196.00, 233.08, 293.66], chime: 587.33 }, // Cm9
      { sub: 25.96, bass: 51.91, tape: [155.56, 196.00, 261.63, 311.13], chime: 523.25 }, // Abmaj7
      { sub: 43.65, bass: 87.31, tape: [130.81, 155.56, 207.65, 392.00], chime: 783.99 }, // Fm9
      { sub: 29.14, bass: 58.27, tape: [174.61, 233.08, 293.66, 349.23], chime: 698.46 }  // Bb7sus4
    ];

    const c = CHORDS[this.stepIndex % CHORDS.length];
    this.stepIndex++;

    this.playSubBass(c.sub, now, duration, 0.6);
    this.playPianoKey(c.bass, now, duration * 0.9, 0.6);
    c.tape.forEach((freq, idx) => {
      this.playPianoKey(freq, now + 0.08 + (idx * 0.04), duration * 0.85, 0.4);
    });
    // High tape-delayed chime
    this.playPianoKey(c.chime, now + 0.6, duration * 0.7, 0.5);
  }

  // =========================================================================
  // TRACK 5: CLAIR DE LUNE (Claude Debussy)
  // =========================================================================
  playClairDeLuneStep(now, duration) {
    if (!this.ctx) return;
    this.filterNode.frequency.setTargetAtTime(1600, now, 0.1);

    const CHORDS = [
      // Dbmaj9
      {
        bass: 69.30,
        arpeggio: [174.61, 207.65, 261.63, 311.13, 349.23],
        melody: [{ freq: 698.46, delay: 0.5 }, { freq: 622.25, delay: 1.3 }]
      },
      // Gbmaj7
      {
        bass: 46.25,
        arpeggio: [138.59, 185.00, 233.08, 277.18, 349.23],
        melody: [{ freq: 587.33, delay: 0.5 }, { freq: 523.25, delay: 1.3 }]
      },
      // Ebm9
      {
        bass: 77.78,
        arpeggio: [155.56, 185.00, 233.08, 277.18, 349.23],
        melody: [{ freq: 698.46, delay: 0.6 }]
      },
      // Ab7sus4
      {
        bass: 51.91,
        arpeggio: [155.56, 207.65, 261.63, 349.23, 466.16],
        melody: [{ freq: 466.16, delay: 0.5 }, { freq: 523.25, delay: 1.2 }]
      }
    ];

    const c = CHORDS[this.stepIndex % CHORDS.length];
    this.stepIndex++;

    this.playPianoKey(c.bass, now, duration * 0.95, 0.7);
    c.arpeggio.forEach((freq, idx) => {
      this.playPianoKey(freq, now + 0.05 + (idx * 0.038), duration * 0.9, 0.5);
    });
    c.melody.forEach(({ freq, delay }) => {
      this.playPianoKey(freq, now + delay, duration * 0.7, 0.6);
    });
  }

  // =========================================================================
  // TRACK 6: RIVER FLOWS IN YOU (Yiruma)
  // =========================================================================
  playRiverFlowsStep(now, duration) {
    if (!this.ctx) return;
    this.filterNode.frequency.setTargetAtTime(1700, now, 0.1);

    const CHORDS = [
      // A Major
      {
        bass: 110.00,
        harmony: [164.81, 220.00, 277.18], // E3, A3, C#4
        melody: [{ freq: 659.25, delay: 0.35 }, { freq: 739.99, delay: 0.75 }, { freq: 659.25, delay: 1.15 }] // E5, F#5, E5
      },
      // E Major
      {
        bass: 82.41,
        harmony: [123.47, 164.81, 207.65], // B2, E3, G#3
        melody: [{ freq: 587.33, delay: 0.35 }, { freq: 554.37, delay: 0.75 }, { freq: 493.88, delay: 1.15 }] // D5, C#5, B4
      },
      // F# Minor
      {
        bass: 92.50,
        harmony: [138.59, 185.00, 220.00], // C#3, F#3, A3
        melody: [{ freq: 440.00, delay: 0.35 }, { freq: 493.88, delay: 0.75 }, { freq: 554.37, delay: 1.15 }] // A4, B4, C#5
      },
      // D Major
      {
        bass: 73.42,
        harmony: [110.00, 146.83, 185.00], // A2, D3, F#3
        melody: [{ freq: 659.25, delay: 0.35 }, { freq: 587.33, delay: 0.75 }, { freq: 554.37, delay: 1.15 }] // E5, D5, C#5
      }
    ];

    const c = CHORDS[this.stepIndex % CHORDS.length];
    this.stepIndex++;

    this.playPianoKey(c.bass, now, duration * 0.95, 0.7);
    c.harmony.forEach((freq, idx) => {
      this.playPianoKey(freq, now + 0.05 + (idx * 0.035), duration * 0.85, 0.5);
    });
    c.melody.forEach(({ freq, delay }) => {
      this.playPianoKey(freq, now + delay, duration * 0.7, 0.65);
    });
  }

  // =========================================================================
  // TRACK 7: A WALK (Tycho)
  // =========================================================================
  playAWalkStep(now, duration) {
    if (!this.ctx) return;
    this.filterNode.frequency.setTargetAtTime(1100, now, 0.1);

    const CHORDS = [
      { bass: 98.00, pad: [146.83, 246.94, 369.99], chime: 587.33 }, // Gmaj9
      { bass: 123.47, pad: [185.00, 293.66, 440.00], chime: 739.99 }, // Bm7
      { bass: 82.41, pad: [164.81, 246.94, 329.63], chime: 659.25 }, // Em9
      { bass: 65.41, pad: [130.81, 196.00, 293.66], chime: 523.25 }  // Cadd9
    ];

    const c = CHORDS[this.stepIndex % CHORDS.length];
    this.stepIndex++;

    this.playSubBass(c.bass * 0.5, now, duration, 0.6);
    this.playAmbientPad(c.bass, now, duration, 0.4);
    c.pad.forEach((freq) => {
      this.playAmbientPad(freq, now, duration, 0.35);
    });
    this.playPianoKey(c.chime, now + 0.4, duration * 0.8, 0.55);
  }

  // =========================================================================
  // TRACK 8: MOONLIGHT SONATA (Ludwig van Beethoven)
  // =========================================================================
  playMoonlightSonataStep(now, duration) {
    if (!this.ctx) return;
    this.filterNode.frequency.setTargetAtTime(1450, now, 0.1);

    const CHORDS = [
      // C#m
      {
        sub: 34.65, bass: 69.30,
        triplets: [207.65, 277.18, 329.63], // G#3, C#4, E4
        melody: 415.30 // G#4
      },
      // C#m/B
      {
        sub: 30.87, bass: 61.74,
        triplets: [207.65, 246.94, 329.63], // G#3, B3, E4
        melody: 415.30
      },
      // A Major
      {
        sub: 27.50, bass: 55.00,
        triplets: [220.00, 277.18, 329.63], // A3, C#4, E4
        melody: 440.00 // A4
      },
      // G#7
      {
        sub: 25.96, bass: 51.91,
        triplets: [207.65, 261.63, 311.13], // G#3, C4, D#4
        melody: 415.30
      }
    ];

    const c = CHORDS[this.stepIndex % CHORDS.length];
    this.stepIndex++;

    this.playSubBass(c.sub, now, duration, 0.7);
    this.playPianoKey(c.bass, now, duration * 0.95, 0.75);

    // Play Beethoven's famous triplet ripples (3 times in each bar)
    [0, 1, 2].forEach(repeat => {
      const offset = repeat * (duration / 3.2);
      c.triplets.forEach((freq, idx) => {
        this.playPianoKey(freq, now + 0.08 + offset + (idx * 0.08), duration * 0.7, 0.42);
      });
    });

    // Solemn sustained dotted melody
    this.playPianoKey(c.melody, now + 0.65, duration * 0.8, 0.65);
  }

  // =========================================================================
  // TRACK 9: WEIGHTLESS (Marconi Union)
  // =========================================================================
  playWeightlessStep(now, duration) {
    if (!this.ctx) return;
    this.filterNode.frequency.setTargetAtTime(850, now, 0.1);

    const CHORDS = [
      { root: 38.89, drone: [77.78, 116.54, 155.56], bowl: 528.00 }, // Eb deep relaxation
      { root: 29.14, drone: [58.27, 87.31, 116.54], bowl: 432.00 },  // Bb calm
      { root: 32.70, drone: [65.41, 98.00, 130.81], bowl: 528.00 },  // Cm peace
      { root: 25.96, drone: [51.91, 77.78, 103.83], bowl: 432.00 }   // Ab harmony
    ];

    const c = CHORDS[this.stepIndex % CHORDS.length];
    this.stepIndex++;

    // Deep alpha wave sub-harmonic
    this.playSubBass(c.root, now, duration, 0.7);
    c.drone.forEach((freq) => {
      this.playAmbientPad(freq, now, duration, 0.3);
    });

    // Therapeutic singing bowl sine chime with ultra-smooth 4s decay
    const bowlOsc = this.ctx.createOscillator();
    const bowlGain = this.ctx.createGain();
    bowlOsc.type = 'sine';
    bowlOsc.frequency.setValueAtTime(c.bowl, now + 0.8);
    bowlGain.gain.setValueAtTime(0.0001, now + 0.8);
    bowlGain.gain.linearRampToValueAtTime(0.06, now + 1.2);
    bowlGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.95);
    bowlOsc.connect(bowlGain);
    bowlGain.connect(this.masterGain);
    bowlOsc.start(now + 0.8);
    bowlOsc.stop(now + duration);
    this.activeNodes.push(bowlOsc);
  }

  // =========================================================================
  // TRACK 10: CANON IN D (Johann Pachelbel)
  // =========================================================================
  playCanonInDStep(now, duration) {
    if (!this.ctx) return;
    this.filterNode.frequency.setTargetAtTime(1600, now, 0.1);

    const CHORDS = [
      { bass: 73.42, arpeggio: [146.83, 220.00, 293.66, 369.99], melody: 587.33 }, // D
      { bass: 55.00, arpeggio: [110.00, 164.81, 220.00, 277.18], melody: 440.00 }, // A
      { bass: 61.74, arpeggio: [123.47, 185.00, 246.94, 293.66], melody: 493.88 }, // Bm
      { bass: 46.25, arpeggio: [92.50, 138.59, 185.00, 220.00], melody: 369.99 },  // F#m
      { bass: 49.00, arpeggio: [98.00, 146.83, 196.00, 246.94], melody: 392.00 },  // G
      { bass: 73.42, arpeggio: [146.83, 220.00, 293.66, 369.99], melody: 587.33 }, // D
      { bass: 49.00, arpeggio: [98.00, 146.83, 196.00, 246.94], melody: 392.00 },  // G
      { bass: 55.00, arpeggio: [110.00, 164.81, 220.00, 277.18], melody: 440.00 }  // A
    ];

    const c = CHORDS[this.stepIndex % CHORDS.length];
    this.stepIndex++;

    this.playPianoKey(c.bass, now, duration * 0.95, 0.75);
    c.arpeggio.forEach((freq, idx) => {
      this.playPianoKey(freq, now + 0.06 + (idx * 0.08), duration * 0.8, 0.5);
    });
    this.playPianoKey(c.melody, now + 0.45, duration * 0.75, 0.65);
  }

  // =========================================================================
  // TRACK 11: THE GRANDMASTER’S DUEL (INTENSE MATCH BATTLE ATMOSPHERE)
  // =========================================================================
  playMatchIntenseStep(now, duration) {
    if (!this.ctx) return;
    this.filterNode.frequency.setTargetAtTime(1950, now, 0.1);

    const TENSION_PROGRESSION = [
      {
        root: 73.42, // D2
        pedal: 36.71, // D1 deep sub
        harmony: [146.83, 220.00, 349.23, 440.00, 493.88], // Dm add9
        tensionChime: 880.00 // A5 high suspended clock chime
      },
      {
        root: 58.27, // Bb1
        pedal: 29.14, // Bb0 deep sub
        harmony: [116.54, 174.61, 220.00, 293.66, 349.23], // Bbmaj7
        tensionChime: 932.33 // Bb5
      },
      {
        root: 69.30, // C#2
        pedal: 34.65, // C#1
        harmony: [138.59, 164.81, 196.00, 233.08, 277.18], // C#dim7
        tensionChime: 1108.73 // C#6
      },
      {
        root: 82.41, // E2 (inverted)
        pedal: 41.20, // E1
        harmony: [164.81, 196.00, 246.94, 293.66, 392.00], // Gm6 / E
        tensionChime: 783.99 // G5
      },
      {
        root: 55.00, // A1
        pedal: 55.00,
        harmony: [110.00, 146.83, 220.00, 349.23, 440.00], // Dm / A
        tensionChime: 880.00 // A5
      },
      {
        root: 55.00, // A1
        pedal: 27.50, // A0
        harmony: [110.00, 164.81, 220.00, 277.18, 311.13, 392.00], // A7(b9)
        tensionChime: 1174.66 // D6
      }
    ];

    const chord = TENSION_PROGRESSION[this.stepIndex % TENSION_PROGRESSION.length];
    this.stepIndex++;

    // 1. Deep Bowed Cello / Double-Bass Ostinato
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
    bassGain.gain.linearRampToValueAtTime(0.32, now + 0.35);
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

    // B. Offbeat second pulse - Heartbeat 'lub-dub' + Clock Tick
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

    // 4. High Suspended Tension Clock Chime
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
  }
}

export const musicEngine = new GameMusicEngine();
