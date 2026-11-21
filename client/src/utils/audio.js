// Web Audio API Synthesizer for high-fidelity chess audio
// Zero external assets or network dependencies - guaranteed instant and reliable.

class ChessAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playMove() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Warm acoustic wood knock
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(290, now);
      osc.frequency.exponentialRampToValueAtTime(115, now + 0.075);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(850, now);

      gain.gain.setValueAtTime(0.42, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);

      // Subtle soft wood tap transient
      const tapOsc = this.ctx.createOscillator();
      const tapGain = this.ctx.createGain();
      tapOsc.type = 'sine';
      tapOsc.frequency.setValueAtTime(750, now);
      tapOsc.frequency.exponentialRampToValueAtTime(280, now + 0.02);
      tapGain.gain.setValueAtTime(0.14, now);
      tapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
      tapOsc.connect(tapGain);
      tapGain.connect(this.ctx.destination);
      tapOsc.start(now);
      tapOsc.stop(now + 0.025);
    } catch (e) {}
  }

  playCapture() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 1. High-frequency wood snap / crack transient (0.025s noise burst)
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.025);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.005));
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const snapFilter = this.ctx.createBiquadFilter();
      snapFilter.type = 'bandpass';
      snapFilter.frequency.setValueAtTime(1800, now);
      snapFilter.Q.setValueAtTime(2.2, now);

      const snapGain = this.ctx.createGain();
      snapGain.gain.setValueAtTime(0.48, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      noiseSource.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(this.ctx.destination);
      noiseSource.start(now);

      // 2. Heavy wooden piece body knock
      const bodyOsc = this.ctx.createOscillator();
      const bodyGain = this.ctx.createGain();
      const bodyFilter = this.ctx.createBiquadFilter();

      bodyOsc.type = 'triangle';
      bodyOsc.frequency.setValueAtTime(340, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

      bodyFilter.type = 'lowpass';
      bodyFilter.frequency.setValueAtTime(950, now);

      bodyGain.gain.setValueAtTime(0.55, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      bodyOsc.connect(bodyFilter);
      bodyFilter.connect(bodyGain);
      bodyGain.connect(this.ctx.destination);

      bodyOsc.start(now);
      bodyOsc.stop(now + 0.09);

      // 3. Sub-thud for punchy acoustic weight on phone speakers
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(130, now);
      subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.07);

      subGain.gain.setValueAtTime(0.42, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.075);

      // 4. Subtle secondary wood rebound tap at +26ms
      const reboundOsc = this.ctx.createOscillator();
      const reboundGain = this.ctx.createGain();
      reboundOsc.type = 'sine';
      reboundOsc.frequency.setValueAtTime(460, now + 0.026);
      reboundOsc.frequency.exponentialRampToValueAtTime(200, now + 0.06);

      reboundGain.gain.setValueAtTime(0.2, now + 0.026);
      reboundGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

      reboundOsc.connect(reboundGain);
      reboundGain.connect(this.ctx.destination);
      reboundOsc.start(now + 0.026);
      reboundOsc.stop(now + 0.065);
    } catch (e) {}
  }

  playCheck() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    // Resonant alerting double chime
    const playChime = (freq, delay) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + 0.25);
    };

    playChime(660, 0);
    playChime(880, 0.08);
  }

  playCastle() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Step 1: King step knock
      this.playMove();

      // Step 2: Rook swift latch into place at +95ms
      setTimeout(() => {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.exponentialRampToValueAtTime(140, t + 0.07);
        gain.gain.setValueAtTime(0.38, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.075);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.075);
      }, 95);
    } catch (e) {}
  }

  playPromotion() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // Sparkling ascending harmonic fanfare (G5, C6, E6, G6)
      const notes = [783.99, 1046.50, 1318.51, 1567.98];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + idx * 0.07;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.32);
      });
    } catch (e) {}
  }

  playVictory() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 0. Distinctive match-finish gavel impact (signals game is concluded)
      const gavelOsc = this.ctx.createOscillator();
      const gavelGain = this.ctx.createGain();
      gavelOsc.type = 'triangle';
      gavelOsc.frequency.setValueAtTime(260, now);
      gavelOsc.frequency.exponentialRampToValueAtTime(70, now + 0.12);
      gavelGain.gain.setValueAtTime(0.4, now);
      gavelGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      gavelOsc.connect(gavelGain);
      gavelGain.connect(this.ctx.destination);
      gavelOsc.start(now);
      gavelOsc.stop(now + 0.14);

      // 1. Ascending triumphant fanfare arpeggio (C5, E5, G5, C6, E6)
      const arpeggio = [
        { freq: 523.25, time: 0.04, dur: 0.14 },    // C5
        { freq: 659.25, time: 0.16, dur: 0.14 },    // E5
        { freq: 783.99, time: 0.28, dur: 0.16 },    // G5
        { freq: 1046.50, time: 0.42, dur: 0.4 },    // C6
        { freq: 1318.51, time: 0.56, dur: 0.7 }     // E6
      ];

      arpeggio.forEach(({ freq, time, dur }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + time);
        gain.gain.setValueAtTime(0.35, now + time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + time);
        osc.stop(now + time + dur);
      });

      // 2. Rich sustained celebratory major chord (C5 + G5 + C6 + E6) at +0.56s
      const chordNotes = [523.25, 783.99, 1046.50, 1318.51];
      chordNotes.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.56);
        gain.gain.setValueAtTime(0.20, now + 0.56);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + 0.56);
        osc.stop(now + 1.35);
      });
    } catch (e) {}
  }

  playGameOver() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 0. Match-finish gavel strike (definite signal that match has ended)
      const strikeOsc = this.ctx.createOscillator();
      const strikeGain = this.ctx.createGain();
      strikeOsc.type = 'triangle';
      strikeOsc.frequency.setValueAtTime(240, now);
      strikeOsc.frequency.exponentialRampToValueAtTime(65, now + 0.12);
      strikeGain.gain.setValueAtTime(0.42, now);
      strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      strikeOsc.connect(strikeGain);
      strikeGain.connect(this.ctx.destination);
      strikeOsc.start(now);
      strikeOsc.stop(now + 0.14);

      // 1. Warm sub-bass acoustic warmth foundation (110 Hz -> 55 Hz)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      const subFilter = this.ctx.createBiquadFilter();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(110, now);
      subOsc.frequency.exponentialRampToValueAtTime(55, now + 1.2);
      subFilter.type = 'lowpass';
      subFilter.frequency.setValueAtTime(240, now);

      subGain.gain.setValueAtTime(0.35, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

      subOsc.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 1.3);

      // 2. Cinematic contemplative acoustic piano/celesta arpeggio (D minor 9th: D4 -> F4 -> A4 -> C5 -> E5)
      // Dignified, reflective, and clear match conclusion signal
      const notes = [
        { freq: 293.66, delay: 0.05, dur: 0.9, vol: 0.28 },   // D4
        { freq: 349.23, delay: 0.16, dur: 0.9, vol: 0.26 },  // F4
        { freq: 440.00, delay: 0.28, dur: 1.0, vol: 0.24 },  // A4
        { freq: 523.25, delay: 0.42, dur: 1.1, vol: 0.22 },  // C5
        { freq: 659.25, delay: 0.56, dur: 1.3, vol: 0.20 }   // E5
      ];

      notes.forEach(({ freq, delay, dur, vol }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + delay);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now + delay);
        filter.frequency.exponentialRampToValueAtTime(450, now + delay + dur);

        gain.gain.setValueAtTime(vol, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + dur);
      });

      // 3. Sustained reflective chord shimmer (A4 + C5 + E5) resolving warmly
      const padNotes = [440.00, 523.25, 659.25];
      padNotes.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.58);
        gain.gain.setValueAtTime(0.12, now + 0.58);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + 0.58);
        osc.stop(now + 1.8);
      });
    } catch (e) {}
  }

  // Alias for defeat sound (delegates smoothly to full harmonic playGameOver)
  playDefeat() {
    this.playGameOver();
  }

  // Harmonic match-drawn sound (peaceful, balanced conclusion)
  playGameDraw() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Match finish gavel tap
      const tapOsc = this.ctx.createOscillator();
      const tapGain = this.ctx.createGain();
      tapOsc.type = 'triangle';
      tapOsc.frequency.setValueAtTime(220, now);
      tapOsc.frequency.exponentialRampToValueAtTime(80, now + 0.09);
      tapGain.gain.setValueAtTime(0.32, now);
      tapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      tapOsc.connect(tapGain);
      tapGain.connect(this.ctx.destination);
      tapOsc.start(now);
      tapOsc.stop(now + 0.1);

      // Peaceful dual chime (F4 349.23Hz -> C5 523.25Hz -> A5 880Hz)
      const chimes = [
        { freq: 349.23, delay: 0.05, dur: 0.6 },
        { freq: 523.25, delay: 0.16, dur: 0.8 },
        { freq: 698.46, delay: 0.28, dur: 1.1 }
      ];
      chimes.forEach(({ freq, delay, dur }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(0.24, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + dur);
      });
    } catch (e) {}
  }

  // Crisp ascending insight chime when opening Stockfish review
  playReviewOpen() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [
        { freq: 783.99, delay: 0, dur: 0.22 },   // G5
        { freq: 1046.50, delay: 0.08, dur: 0.35 } // C6
      ];
      notes.forEach(({ freq, delay, dur }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(0.24, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + dur);
      });
    } catch (e) {}
  }

  // Signature match start chime: subtle deep wooden tournament gavel + resonant dual harmonic chime (D4 -> A4)
  playMatchStart() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Warm wood gavel impact
      const gavelOsc = this.ctx.createOscillator();
      const gavelGain = this.ctx.createGain();
      gavelOsc.type = 'triangle';
      gavelOsc.frequency.setValueAtTime(220, now);
      gavelOsc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
      gavelGain.gain.setValueAtTime(0.35, now);
      gavelGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      gavelOsc.connect(gavelGain);
      gavelGain.connect(this.ctx.destination);
      gavelOsc.start(now);
      gavelOsc.stop(now + 0.09);

      // 2. Resonant signature match bells (D4 293.66Hz -> A4 440Hz -> D5 587.33Hz)
      const chimes = [
        { freq: 293.66, delay: 0.02, dur: 0.65 },
        { freq: 440.00, delay: 0.10, dur: 0.85 },
        { freq: 587.33, delay: 0.18, dur: 1.20 }
      ];

      chimes.forEach(({ freq, delay, dur }) => {
        const osc = this.ctx.createOscillator();
        const harm = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        harm.type = 'triangle';

        osc.frequency.setValueAtTime(freq, now + delay);
        harm.frequency.setValueAtTime(freq * 2.01, now + delay);

        gain.gain.setValueAtTime(0.001, now + delay);
        gain.gain.linearRampToValueAtTime(0.22, now + delay + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

        osc.connect(gain);
        harm.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + delay);
        harm.start(now + delay);
        osc.stop(now + delay + dur);
        harm.stop(now + delay + dur);
      });
    } catch (e) {}
  }

  playLowTime() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(900, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playChat() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // Sparkling celebratory chime for interactive drill success
  playLessonSuccess() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [659.25, 830.61, 987.77, 1318.51]; // E5, G#5, B5, E6 (sparkling E major)
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.28, this.ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.3);
    });
  }

  // Triumphant royal fanfare for completing an entire lesson
  playLessonComplete() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const fanfare = [
      { freq: 523.25, time: 0, dur: 0.12 },     // C5
      { freq: 659.25, time: 0.12, dur: 0.12 },  // E5
      { freq: 783.99, time: 0.24, dur: 0.12 },  // G5
      { freq: 1046.50, time: 0.36, dur: 0.35 }, // C6
      { freq: 1318.51, time: 0.50, dur: 0.45 }  // E6
    ];

    fanfare.forEach(({ freq, time, dur }) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + time);
      gain.gain.setValueAtTime(0.32, this.ctx.currentTime + time);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + time + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + time);
      osc.stop(this.ctx.currentTime + time + dur);
    });
  }

  // Gentle soft error cue
  playErrorTone() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  // Crisp mechanical tactile button click
  playClick() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.04);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.045);
    } catch (e) {
      // Audio fallback
    }
  }

  // Premium melodic selection chime
  playSelect() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, t);
      osc.frequency.exponentialRampToValueAtTime(780, t + 0.06);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.07);
    } catch (e) {
      // Audio fallback
    }
  }
}

export const sound = new ChessAudio();
