// Procedural Ambient Music Engine for Chess Arena using Web Audio API
// Runs completely offline and zero-latency with beautiful relaxing chord progressions.

class MusicEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.currentTrackIndex = 0;
    this.volume = 0.3; // 0.0 to 1.0
    this.stepTimer = null;
    this.activeNodes = [];

    this.tracks = [
      {
        id: 'zen',
        name: 'Zen Meditation',
        mood: 'Ambient Calm • 432Hz',
        tempo: 4200,
        chords: [
          [220, 261.63, 329.63, 392],       // Am7
          [174.61, 220, 261.63, 329.63],    // Fmaj7
          [130.81, 196, 261.63, 329.63],    // Cmaj7
          [196, 246.94, 293.66, 392]        // G6
        ]
      },
      {
        id: 'focus',
        name: 'Grandmaster Focus',
        mood: 'Lo-Fi Chill • Warm Keys',
        tempo: 3600,
        chords: [
          [146.83, 220, 261.63, 349.23],    // Dm9
          [196, 246.94, 329.63, 392],       // G13
          [130.81, 164.81, 246.94, 329.63], // Cmaj9
          [220, 261.63, 329.63, 440]        // Am9
        ]
      },
      {
        id: 'midnight',
        name: 'Midnight Blitz',
        mood: 'Deep Synthwave • Mellow',
        tempo: 3200,
        chords: [
          [110, 164.81, 220, 261.63],       // Low Am
          [174.61, 220, 261.63, 329.63],    // Fmaj7
          [130.81, 196, 261.63, 392],       // C
          [146.83, 220, 293.66, 369.99]     // D9
        ]
      },
      {
        id: 'classical',
        name: 'Classical Sonata',
        mood: 'Acoustic Piano • Baroque',
        tempo: 2800,
        chords: [
          [130.81, 196, 261.63, 329.63],    // C
          [123.47, 196, 246.94, 293.66],    // G/B
          [110, 164.81, 220, 261.63],       // Am
          [98, 164.81, 196, 246.94],        // Em/G
          [87.31, 174.61, 220, 261.63],     // F
          [98, 146.83, 196, 246.94]         // G
        ]
      },
      {
        id: 'rainy',
        name: 'Rainy Cafe',
        mood: 'Peaceful Jazz • Gentle Rain',
        tempo: 4000,
        chords: [
          [174.61, 261.63, 329.63, 392],    // Fmaj9
          [164.81, 246.94, 329.63, 392],    // Em7
          [146.83, 220, 261.63, 349.23],    // Dm7
          [130.81, 196, 246.94, 329.63]     // Cmaj7
        ]
      }
    ];

    this.chordStep = 0;
  }

  initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  start() {
    this.initCtx();
    if (!this.ctx) return;
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.chordStep = 0;
    this.playChord();

    const track = this.tracks[this.currentTrackIndex];
    this.stepTimer = setInterval(() => {
      if (this.isPlaying) {
        this.playChord();
      }
    }, track.tempo);
  }

  stop() {
    this.isPlaying = false;
    if (this.stepTimer) {
      clearInterval(this.stepTimer);
      this.stepTimer = null;
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
    this.currentTrackIndex = (index + this.tracks.length) % this.tracks.length;
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
    return this.tracks[this.currentTrackIndex];
  }

  playChord() {
    if (!this.ctx || !this.isPlaying) return;
    const track = this.tracks[this.currentTrackIndex];
    const chord = track.chords[this.chordStep % track.chords.length];
    this.chordStep++;

    const now = this.ctx.currentTime;
    const duration = track.tempo / 1000;

    // Filter for mellow warm sound
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, now);
    filter.Q.setValueAtTime(1.2, now);
    filter.connect(this.masterGain);

    chord.forEach((freq, i) => {
      // Primary soft sine oscillator
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = i === 0 ? 'sine' : (track.id === 'midnight' ? 'sawtooth' : 'triangle');
      osc.frequency.setValueAtTime(freq, now);

      // Subtle warm detuning for lush chorusing
      const detune = (i % 2 === 0 ? 3 : -3) + (Math.random() * 2 - 1);
      osc.detune.setValueAtTime(detune, now);

      // Envelope: gentle attack, long smooth sustain and release
      const attackTime = 1.2;
      const releaseTime = duration * 0.9;
      const noteGain = i === 0 ? 0.35 : 0.18; // Bass slightly more pronounced

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(noteGain, now + attackTime);
      gain.gain.exponentialRampToValueAtTime(0.001, now + releaseTime);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(now);
      osc.stop(now + releaseTime + 0.1);

      this.activeNodes.push(osc);
      setTimeout(() => {
        const idx = this.activeNodes.indexOf(osc);
        if (idx !== -1) this.activeNodes.splice(idx, 1);
      }, (releaseTime + 0.2) * 1000);
    });
  }
}

export const musicEngine = new MusicEngine();
