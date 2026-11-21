// Web Audio API Synthesizer for high-fidelity chess audio
// Zero external assets or network dependencies - guaranteed instant, tactile, and reliable.

class ChessAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.setupAutoUnlock();
  }

  setupAutoUnlock() {
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.initContext();
        window.removeEventListener('click', unlock);
        window.removeEventListener('touchstart', unlock);
        window.removeEventListener('keydown', unlock);
      };
      window.addEventListener('click', unlock, { passive: true });
      window.addEventListener('touchstart', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
    }
  }

  initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Authentic wooden board piece placement ("thock")
   * Modeled after real weighted Staunton piece placed onto a hardwood chessboard.
   */
  playMove() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Felt-on-hardwood contact transient (crisp organic texture)
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.015);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.003));
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const feltFilter = this.ctx.createBiquadFilter();
      feltFilter.type = 'bandpass';
      feltFilter.frequency.setValueAtTime(2200, now);
      feltFilter.Q.setValueAtTime(2.0, now);

      const feltGain = this.ctx.createGain();
      feltGain.gain.setValueAtTime(0.38, now);
      feltGain.gain.exponentialRampToValueAtTime(0.001, now + 0.014);

      noiseSource.connect(feltFilter);
      feltFilter.connect(feltGain);
      feltGain.connect(this.ctx.destination);
      noiseSource.start(now);

      // 2. Solid weighted wooden piece body knock
      const woodOsc = this.ctx.createOscillator();
      const woodGain = this.ctx.createGain();
      const woodFilter = this.ctx.createBiquadFilter();

      woodOsc.type = 'triangle';
      woodOsc.frequency.setValueAtTime(285, now);
      woodOsc.frequency.exponentialRampToValueAtTime(115, now + 0.045);

      woodFilter.type = 'lowpass';
      woodFilter.frequency.setValueAtTime(680, now);

      woodGain.gain.setValueAtTime(0.65, now);
      woodGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

      woodOsc.connect(woodFilter);
      woodFilter.connect(woodGain);
      woodGain.connect(this.ctx.destination);

      woodOsc.start(now);
      woodOsc.stop(now + 0.055);

      // 3. Resonant wooden board acoustic chamber thump (hollow hardwood body)
      const chamberOsc = this.ctx.createOscillator();
      const chamberGain = this.ctx.createGain();

      chamberOsc.type = 'sine';
      chamberOsc.frequency.setValueAtTime(168, now);
      chamberOsc.frequency.exponentialRampToValueAtTime(75, now + 0.04);

      chamberGain.gain.setValueAtTime(0.48, now);
      chamberGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      chamberOsc.connect(chamberGain);
      chamberGain.connect(this.ctx.destination);

      chamberOsc.start(now);
      chamberOsc.stop(now + 0.05);

      // 4. Subtle wood click overtone for high-end definition
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();

      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(640, now);
      clickOsc.frequency.exponentialRampToValueAtTime(240, now + 0.018);

      clickGain.gain.setValueAtTime(0.25, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      clickOsc.connect(clickGain);
      clickGain.connect(this.ctx.destination);

      clickOsc.start(now);
      clickOsc.stop(now + 0.02);
    } catch (e) {}
  }

  /**
   * Crunchy wooden piece capture collision (piece knocking opponent off the square)
   */
  playCapture() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Initial wood-on-wood strike crack (the two pieces colliding)
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.022);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.004));
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const snapFilter = this.ctx.createBiquadFilter();
      snapFilter.type = 'bandpass';
      snapFilter.frequency.setValueAtTime(2400, now);
      snapFilter.Q.setValueAtTime(2.5, now);

      const snapGain = this.ctx.createGain();
      snapGain.gain.setValueAtTime(0.55, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

      noiseSource.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(this.ctx.destination);
      noiseSource.start(now);

      // 2. Heavy wooden piece body knock
      const bodyOsc = this.ctx.createOscillator();
      const bodyGain = this.ctx.createGain();
      const bodyFilter = this.ctx.createBiquadFilter();

      bodyOsc.type = 'triangle';
      bodyOsc.frequency.setValueAtTime(360, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(95, now + 0.065);

      bodyFilter.type = 'lowpass';
      bodyFilter.frequency.setValueAtTime(900, now);

      bodyGain.gain.setValueAtTime(0.72, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

      bodyOsc.connect(bodyFilter);
      bodyFilter.connect(bodyGain);
      bodyGain.connect(this.ctx.destination);

      bodyOsc.start(now);
      bodyOsc.stop(now + 0.075);

      // 3. Heavy board cabinet impact (displacing piece slamming down)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(145, now);
      subOsc.frequency.exponentialRampToValueAtTime(50, now + 0.055);

      subGain.gain.setValueAtTime(0.55, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.065);

      // 4. Secondary tumbling piece rebound tap at +24ms
      const reboundOsc = this.ctx.createOscillator();
      const reboundGain = this.ctx.createGain();
      reboundOsc.type = 'triangle';
      reboundOsc.frequency.setValueAtTime(420, now + 0.024);
      reboundOsc.frequency.exponentialRampToValueAtTime(180, now + 0.055);

      reboundGain.gain.setValueAtTime(0.28, now + 0.024);
      reboundGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      reboundOsc.connect(reboundGain);
      reboundGain.connect(this.ctx.destination);
      reboundOsc.start(now + 0.024);
      reboundOsc.stop(now + 0.06);
    } catch (e) {}
  }

  /**
   * Premier King In Check Alert Sound
   * Combines an authoritative tactile wood impact with a dramatic, urgent, crystal-clear warning resonance.
   * Completely replaces the old double-chime with a prestigious tournament alert sound.
   */
  playCheck() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Authoritative wooden check strike (piece slams down with purpose)
      const strikeOsc = this.ctx.createOscillator();
      const strikeGain = this.ctx.createGain();
      const strikeFilter = this.ctx.createBiquadFilter();

      strikeOsc.type = 'triangle';
      strikeOsc.frequency.setValueAtTime(320, now);
      strikeOsc.frequency.exponentialRampToValueAtTime(120, now + 0.05);

      strikeFilter.type = 'lowpass';
      strikeFilter.frequency.setValueAtTime(750, now);

      strikeGain.gain.setValueAtTime(0.70, now);
      strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      strikeOsc.connect(strikeFilter);
      strikeFilter.connect(strikeGain);
      strikeGain.connect(this.ctx.destination);

      strikeOsc.start(now);
      strikeOsc.stop(now + 0.06);

      // 2. Urgent dramatic alert bell chord (Root: D5 587.33Hz + Major 6th: B5 987.77Hz + Tension 9th: E6 1318.51Hz)
      // Crystal clear, suspenseful, and immediately alerts the player that king is under attack!
      const alertHarmonics = [
        { freq: 587.33, gainVal: 0.42, dur: 0.28 },  // D5 core tone
        { freq: 880.00, gainVal: 0.32, dur: 0.26 },  // A5 fifth harmonic
        { freq: 1174.66, gainVal: 0.18, dur: 0.22 }  // D6 bright overtone
      ];

      alertHarmonics.forEach(({ freq, gainVal, dur }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.008);

        gain.gain.setValueAtTime(0.001, now + 0.008);
        gain.gain.linearRampToValueAtTime(gainVal, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + 0.008);
        osc.stop(now + dur);
      });

      // 3. Deep resonant tension undercurrent (gives weight to the check)
      const tensionOsc = this.ctx.createOscillator();
      const tensionGain = this.ctx.createGain();

      tensionOsc.type = 'triangle';
      tensionOsc.frequency.setValueAtTime(140, now);
      tensionOsc.frequency.exponentialRampToValueAtTime(60, now + 0.18);

      tensionGain.gain.setValueAtTime(0.40, now);
      tensionGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      tensionOsc.connect(tensionGain);
      tensionGain.connect(this.ctx.destination);

      tensionOsc.start(now);
      tensionOsc.stop(now + 0.2);
    } catch (e) {}
  }

  /**
   * Castling sound: King move wood knock followed swiftly by Rook latching in
   */
  playCastle() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // Step 1: King step knock
      this.playMove();

      // Step 2: Rook swift latch into place at +75ms
      setTimeout(() => {
        if (!this.ctx) return;
        try {
          const t = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(310, t);
          osc.frequency.exponentialRampToValueAtTime(130, t + 0.045);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(720, t);

          gain.gain.setValueAtTime(0.55, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(t);
          osc.stop(t + 0.05);
        } catch (_) {}
      }, 75);
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
