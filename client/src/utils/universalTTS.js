/**
 * Universal Text-To-Speech (TTS) Synthesizer - Single-Voice Guaranteed
 *
 * Supports:
 * 1. Android Native TTS Bridge (`window.AndroidTTS` injected by MainActivity WebView)
 * 2. Browser Web Speech API (`window.speechSynthesis`)
 * 3. High-Quality Web Audio TTS Fallback (Google TTS audio stream via HTML5 Audio)
 *
 * STRICT SINGLE-VOICE ENFORCEMENT:
 * - Monotonic speech session ID invalidates all pending callbacks & async operations.
 * - Deduplication guard prevents rapid double-invocation from component re-renders.
 * - Cancellation events (e.g. error === 'canceled') never trigger secondary fallbacks.
 * - Prior audio elements, oscillators, and speech utterances are silenced and torn down
 *   before any new voice initiates.
 */

class UniversalTTS {
  constructor() {
    this.audioElement = null;
    this.currentUtterance = null;
    this.onStartCallback = null;
    this.onEndCallback = null;
    this.isSpeaking = false;
    this.activeEngine = null; // 'native' | 'webspeech' | 'audio' | 'melody' | null
    this.currentSpeechId = 0;
    this.lastSpokenText = '';
    this.lastSpokenTime = 0;

    if (typeof window !== 'undefined') {
      // Register global callbacks for Native Android TTS bridge
      window.__nativeTtsOnStart = (id) => {
        this.isSpeaking = true;
        this.activeEngine = 'native';
        if (typeof this.onStartCallback === 'function') {
          this.onStartCallback(id);
        }
      };

      window.__nativeTtsOnDone = (id) => {
        this.isSpeaking = false;
        this.activeEngine = null;
        if (typeof this.onEndCallback === 'function') {
          this.onEndCallback(id);
        }
      };

      window.__nativeTtsOnError = (id) => {
        this.isSpeaking = false;
        this.activeEngine = null;
        if (typeof this.onEndCallback === 'function') {
          this.onEndCallback(id);
        }
      };

      // Warm up voice list if Web Speech API is present
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.getVoices();
          window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
          };
        } catch (_) {}
      }
    }
  }

  /**
   * Stop any ongoing speech across ALL engines immediately and silence everything
   */
  stop() {
    // Invalidate any pending asynchronous events or callbacks
    this.currentSpeechId++;
    this.isSpeaking = false;
    this.activeEngine = null;

    // 1. Native Android TTS
    if (typeof window !== 'undefined' && window.AndroidTTS && typeof window.AndroidTTS.stop === 'function') {
      try {
        window.AndroidTTS.stop();
      } catch (_) {}
    }

    // 2. Web Speech API
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    this.currentUtterance = null;

    // 3. Audio stream fallback
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.audioElement.src = '';
        this.audioElement.onplay = null;
        this.audioElement.onended = null;
        this.audioElement.onerror = null;
        this.audioElement = null;
      } catch (_) {}
    }

    if (typeof this.onEndCallback === 'function') {
      const endCb = this.onEndCallback;
      this.onEndCallback = null;
      this.onStartCallback = null;
      try { endCb(); } catch (_) {}
    } else {
      this.onStartCallback = null;
      this.onEndCallback = null;
    }
  }

  /**
   * Speak a text string clearly with strict single-voice exclusivity
   */
  speak(text, { onStart, onEnd, rate = 1.0, pitch = 1.05, lang = 'en' } = {}) {
    if (!text || typeof text !== 'string') return;
    const cleanText = text.replace(/[*#_~`]/g, '').trim();
    if (!cleanText) return;

    // Deduplication guard: ignore redundant duplicate speech calls fired within 350ms
    const now = Date.now();
    if (cleanText === this.lastSpokenText && (now - this.lastSpokenTime < 350)) {
      return;
    }
    this.lastSpokenText = cleanText;
    this.lastSpokenTime = now;

    // Immediately cancel and stop any prior voice or audio stream
    this.stop();

    // Assign new monotonic speech ID for this invocation
    const speechId = ++this.currentSpeechId;
    this.onStartCallback = onStart;
    this.onEndCallback = onEnd;

    // Engine 1: Android Native TTS Bridge (Direct Android hardware voice in APK)
    if (typeof window !== 'undefined' && window.AndroidTTS && typeof window.AndroidTTS.speakWithRate === 'function') {
      try {
        const isAvail = typeof window.AndroidTTS.isAvailable === 'function' ? window.AndroidTTS.isAvailable() : true;
        if (isAvail) {
          this.isSpeaking = true;
          this.activeEngine = 'native';
          if (typeof this.onStartCallback === 'function') this.onStartCallback();
          const nativeSuccess = window.AndroidTTS.speakWithRate(cleanText, rate, pitch);
          if (nativeSuccess !== false) {
            return;
          }
        }
      } catch (err) {
        // Fall through to browser engines
      }
    }

    // Engine 2: Browser Web Speech API
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.speechSynthesis.speak === 'function') {
      try {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = lang === 'en' ? 'en-US' : lang;
        utterance.rate = rate;
        utterance.pitch = pitch;

        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const naturalVoice =
            voices.find(v => (v.lang.startsWith('en') || v.lang.includes('US')) && v.name.includes('Google')) ||
            voices.find(v => (v.lang.startsWith('en') || v.lang.includes('US')) && v.name.includes('Natural')) ||
            voices.find(v => v.lang.startsWith('en')) ||
            voices[0];
          if (naturalVoice) utterance.voice = naturalVoice;
        }

        utterance.onstart = () => {
          if (this.currentSpeechId !== speechId) return;
          this.isSpeaking = true;
          this.activeEngine = 'webspeech';
          if (typeof this.onStartCallback === 'function') this.onStartCallback();
        };

        utterance.onend = () => {
          if (this.currentSpeechId !== speechId) return;
          this.isSpeaking = false;
          this.activeEngine = null;
          this.currentUtterance = null;
          if (typeof this.onEndCallback === 'function') this.onEndCallback();
        };

        utterance.onerror = (e) => {
          if (this.currentSpeechId !== speechId) return;
          // When speech is intentionally canceled or superseded, browser reports 'canceled' or 'interrupted'.
          // CRITICAL: NEVER trigger fallback audio on intentional cancellation!
          if (e && (e.error === 'canceled' || e.error === 'interrupted')) {
            this.isSpeaking = false;
            this.activeEngine = null;
            this.currentUtterance = null;
            return;
          }
          // Only actual synthesis failure triggers fallback streaming audio
          this.fallbackAudioTTS(cleanText, lang, speechId);
        };

        this.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
        return;
      } catch (e) {
        // Fall through to streaming audio fallback
      }
    }

    // Engine 3: Streaming Audio Fallback (For environments without Web Speech API)
    this.fallbackAudioTTS(cleanText, lang, speechId);
  }

  /**
   * High-reliability audio stream fallback (Strict Single-Audio Element)
   */
  fallbackAudioTTS(text, lang = 'en', speechId = this.currentSpeechId) {
    if (this.currentSpeechId !== speechId) return;

    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch (_) {}
      }

      if (this.audioElement) {
        try {
          this.audioElement.pause();
          this.audioElement.currentTime = 0;
          this.audioElement.src = '';
          this.audioElement = null;
        } catch (_) {}
      }

      const sliceText = text.slice(0, 240);
      const encoded = encodeURIComponent(sliceText);

      // Primary: Server TTS endpoint
      const primaryUrl = `/api/tts?text=${encoded}&lang=${lang}`;
      // Secondary: Direct Google TTS endpoint
      const secondaryUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${lang}&client=tw-ob`;

      const audio = new Audio(primaryUrl);
      this.audioElement = audio;

      audio.onplay = () => {
        if (this.currentSpeechId !== speechId) {
          try { audio.pause(); audio.src = ''; } catch (_) {}
          return;
        }
        this.isSpeaking = true;
        this.activeEngine = 'audio';
        if (typeof this.onStartCallback === 'function') this.onStartCallback();
      };

      audio.onended = () => {
        if (this.currentSpeechId !== speechId) return;
        this.isSpeaking = false;
        this.activeEngine = null;
        this.audioElement = null;
        if (typeof this.onEndCallback === 'function') this.onEndCallback();
      };

      const trySecondary = () => {
        if (this.currentSpeechId !== speechId) return;
        try {
          const fallbackAudio = new Audio(secondaryUrl);
          this.audioElement = fallbackAudio;

          fallbackAudio.onplay = () => {
            if (this.currentSpeechId !== speechId) {
              try { fallbackAudio.pause(); fallbackAudio.src = ''; } catch (_) {}
              return;
            }
            this.isSpeaking = true;
            this.activeEngine = 'audio';
            if (typeof this.onStartCallback === 'function') this.onStartCallback();
          };

          fallbackAudio.onended = () => {
            if (this.currentSpeechId !== speechId) return;
            this.isSpeaking = false;
            this.activeEngine = null;
            this.audioElement = null;
            if (typeof this.onEndCallback === 'function') this.onEndCallback();
          };

          fallbackAudio.onerror = () => {
            if (this.currentSpeechId !== speechId) return;
            this.playAcousticVoiceMelody(speechId);
          };

          fallbackAudio.play().catch(() => {
            if (this.currentSpeechId !== speechId) return;
            this.playAcousticVoiceMelody(speechId);
          });
        } catch (_) {
          this.playAcousticVoiceMelody(speechId);
        }
      };

      audio.onerror = trySecondary;
      audio.play().catch(trySecondary);
    } catch (_) {
      this.playAcousticVoiceMelody(speechId);
    }
  }

  /**
   * Offline Melodic Sensei Voice Chatter (Web Audio API)
   */
  playAcousticVoiceMelody(speechId = this.currentSpeechId) {
    if (this.currentSpeechId !== speechId) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        this.isSpeaking = false;
        this.activeEngine = null;
        if (typeof this.onEndCallback === 'function') this.onEndCallback();
        return;
      }

      this.isSpeaking = true;
      this.activeEngine = 'melody';
      if (typeof this.onStartCallback === 'function') this.onStartCallback();

      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const notes = [440, 523.25, 659.25, 587.33, 523.25];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.08;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.12);
      });
      setTimeout(() => {
        if (this.currentSpeechId !== speechId) return;
        this.isSpeaking = false;
        this.activeEngine = null;
        if (typeof this.onEndCallback === 'function') this.onEndCallback();
      }, notes.length * 80 + 120);
    } catch (_) {
      this.isSpeaking = false;
      this.activeEngine = null;
      if (typeof this.onEndCallback === 'function') this.onEndCallback();
    }
  }
}

export const tts = new UniversalTTS();
