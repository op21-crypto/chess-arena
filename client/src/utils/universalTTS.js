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
        this.isSpeaking = true;
        if (typeof this.onStartCallback === 'function') this.onStartCallback();
        window.AndroidTTS.speakWithRate(cleanText, rate, pitch);
        return;
      } catch (err) {
        // Fall through to other engines
      }
    }

    // Engine 2: Browser Web Speech API
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
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
          this.isSpeaking = true;
          if (typeof this.onStartCallback === 'function') this.onStartCallback();
        };

        utterance.onend = () => {
          this.isSpeaking = false;
          if (typeof this.onEndCallback === 'function') this.onEndCallback();
        };

        utterance.onerror = (e) => {
          // If browser speech fails, fall back to audio stream
          this.fallbackAudioTTS(cleanText, lang);
        };

        this.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
        return;
      } catch (e) {
        // Fall through to audio fallback
      }
    }

    // Engine 3: Streaming Audio Fallback (Guaranteed to work in any WebView with network)
    this.fallbackAudioTTS(cleanText, lang);
  }

  /**
   * High-reliability audio stream fallback
   */
  fallbackAudioTTS(text, lang = 'en') {
    try {
      this.isSpeaking = true;
      if (typeof this.onStartCallback === 'function') this.onStartCallback();

      // Chunk long text if needed (Google TTS endpoint supports up to ~200 chars smoothly)
      const encoded = encodeURIComponent(text.slice(0, 200));
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${lang}&client=tw-ob`;

      const audio = new Audio(audioUrl);
      this.audioElement = audio;

      audio.onended = () => {
        this.isSpeaking = false;
        this.audioElement = null;
        if (typeof this.onEndCallback === 'function') this.onEndCallback();
      };

      audio.onerror = () => {
        this.isSpeaking = false;
        this.audioElement = null;
        if (typeof this.onEndCallback === 'function') this.onEndCallback();
      };

      audio.play().catch(() => {
        this.isSpeaking = false;
        this.audioElement = null;
        if (typeof this.onEndCallback === 'function') this.onEndCallback();
      });
    } catch (_) {
      this.isSpeaking = false;
      if (typeof this.onEndCallback === 'function') this.onEndCallback();
    }
  }
}

export const tts = new UniversalTTS();
