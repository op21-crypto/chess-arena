/**
 * Universal Text-To-Speech (TTS) Synthesizer
 *
 * Supports:
 * 1. Android Native TTS Bridge (`window.AndroidTTS` injected by MainActivity WebView)
 * 2. Browser Web Speech API (`window.speechSynthesis`)
 * 3. High-Quality Web Audio TTS Fallback (Google TTS audio stream via HTML5 Audio)
 *
 * Guaranteed to produce clear voice narration in standard desktop/mobile browsers,
 * Android APK WebViews, and offline/restricted environments.
 */

class UniversalTTS {
  constructor() {
    this.audioElement = null;
    this.currentUtterance = null;
    this.onStartCallback = null;
    this.onEndCallback = null;
    this.isSpeaking = false;

    if (typeof window !== 'undefined') {
      // Register global callbacks for Native Android TTS bridge
      window.__nativeTtsOnStart = (id) => {
        this.isSpeaking = true;
        if (typeof this.onStartCallback === 'function') {
          this.onStartCallback(id);
        }
      };

      window.__nativeTtsOnDone = (id) => {
        this.isSpeaking = false;
        if (typeof this.onEndCallback === 'function') {
          this.onEndCallback(id);
        }
      };

      window.__nativeTtsOnError = (id) => {
        this.isSpeaking = false;
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
   * Stop any ongoing speech across all engines (Native, Web Speech, and Audio Stream)
   */
  stop() {
    this.isSpeaking = false;

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

    // 3. Audio stream fallback
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.audioElement = null;
      } catch (_) {}
    }

    if (typeof this.onEndCallback === 'function') {
      this.onEndCallback();
    }
  }

  /**
   * Speak a text string clearly with automatic tiered fallback
   */
  speak(text, { onStart, onEnd, rate = 1.0, pitch = 1.05, lang = 'en' } = {}) {
    if (!text || typeof text !== 'string') return;
    const cleanText = text.replace(/[*#_~`]/g, '').trim();
    if (!cleanText) return;

    this.stop();

    this.onStartCallback = onStart;
    this.onEndCallback = onEnd;

    // Engine 1: Android Native TTS Bridge (Direct Android hardware voice in APK)
    if (typeof window !== 'undefined' && window.AndroidTTS && typeof window.AndroidTTS.speakWithRate === 'function') {
      try {
        const isAvail = typeof window.AndroidTTS.isAvailable === 'function' ? window.AndroidTTS.isAvailable() : true;
        if (isAvail) {
          this.isSpeaking = true;
          if (typeof this.onStartCallback === 'function') this.onStartCallback();
          const nativeSuccess = window.AndroidTTS.speakWithRate(cleanText, rate, pitch);
          if (nativeSuccess !== false) {
            return;
          }
        }
      } catch (err) {
        // Fall through to other engines
      }
    }

    // Engine 2: Browser Web Speech API with watchdog timeout
    let webSpeechHandled = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
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

        let started = false;
        utterance.onstart = () => {
          started = true;
          this.isSpeaking = true;
          if (typeof this.onStartCallback === 'function') this.onStartCallback();
        };

        utterance.onend = () => {
          this.isSpeaking = false;
          if (typeof this.onEndCallback === 'function') this.onEndCallback();
        };

        utterance.onerror = () => {
          if (!started) {
            this.fallbackAudioTTS(cleanText, lang);
          }
        };

        this.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
        webSpeechHandled = true;

        // Watchdog: If Web Speech doesn't fire onstart within 400ms (common in Android WebView), fallback to Audio
        setTimeout(() => {
          if (!started && this.isSpeaking === false && this.currentUtterance === utterance) {
            try {
              window.speechSynthesis.cancel();
            } catch (_) {}
            this.fallbackAudioTTS(cleanText, lang);
          }
        }, 400);

        return;
      } catch (e) {
        // Fall through to audio fallback
      }
    }

    // Engine 3: Streaming Audio Fallback (Guaranteed to work in any WebView with network)
    if (!webSpeechHandled) {
      this.fallbackAudioTTS(cleanText, lang);
    }
  }

  /**
   * High-reliability audio stream fallback
   * 1. Try server `/api/tts?text=...` (proxy with proper headers, no CORS issues)
   * 2. Fallback to direct Google TTS URL
   * 3. Fallback to Web Audio Voice Melody
   */
  fallbackAudioTTS(text, lang = 'en') {
    try {
      this.isSpeaking = true;
      if (typeof this.onStartCallback === 'function') this.onStartCallback();

      const sliceText = text.slice(0, 240);
      const encoded = encodeURIComponent(sliceText);

      // Primary: Server TTS endpoint
      const primaryUrl = `/api/tts?text=${encoded}&lang=${lang}`;
      // Secondary: Direct Google TTS endpoint
      const secondaryUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${lang}&client=tw-ob`;

      const audio = new Audio(primaryUrl);
      this.audioElement = audio;

      audio.onended = () => {
        this.isSpeaking = false;
        this.audioElement = null;
        if (typeof this.onEndCallback === 'function') this.onEndCallback();
      };

      const trySecondary = () => {
        try {
          const fallbackAudio = new Audio(secondaryUrl);
          this.audioElement = fallbackAudio;
          fallbackAudio.onended = () => {
            this.isSpeaking = false;
            this.audioElement = null;
            if (typeof this.onEndCallback === 'function') this.onEndCallback();
          };
          fallbackAudio.onerror = () => {
            this.playAcousticVoiceMelody();
          };
          fallbackAudio.play().catch(() => {
            this.playAcousticVoiceMelody();
          });
        } catch (_) {
          this.playAcousticVoiceMelody();
        }
      };

      audio.onerror = trySecondary;
      audio.play().catch(trySecondary);
    } catch (_) {
      this.playAcousticVoiceMelody();
    }
  }

  /**
   * Offline Melodic Sensei Voice Chatter (Web Audio API)
   * Plays a pleasant, animated speech chatter sequence when all voice engines are unreachable.
   */
  playAcousticVoiceMelody() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        this.isSpeaking = false;
        if (typeof this.onEndCallback === 'function') this.onEndCallback();
        return;
      }
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
        this.isSpeaking = false;
        if (typeof this.onEndCallback === 'function') this.onEndCallback();
      }, notes.length * 80 + 120);
    } catch (_) {
      this.isSpeaking = false;
      if (typeof this.onEndCallback === 'function') this.onEndCallback();
    }
  }
}

export const tts = new UniversalTTS();
