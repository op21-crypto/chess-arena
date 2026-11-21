import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Chessboard } from './Chessboard.jsx';
import { MentorAvatar } from './MentorAvatar.jsx';
import {
  GraduationCap,
  List,
  Volume2,
  VolumeX,
  Music,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  LockOpen,
  Lock,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Target,
  Check,
  Play,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Trophy,
  Flame,
  Compass
} from 'lucide-react';
import { ALL_LESSONS, LESSON_CATEGORIES, getPracticeDrills } from '../data/lessonsData.js';
import { sound } from '../utils/audio.js';
import { musicEngine } from '../utils/music.js';
import { safeStorage } from '../utils/storage.js';
import { triggerHaptic } from '../utils/device.js';

const ENCOURAGING_PRAISES = [
  { title: "Brilliant Move! 🌟", text: "You calculated the line like a grandmaster!" },
  { title: "Outstanding Vision! 🎯", text: "Pure tactical precision! That was spot-on!" },
  { title: "Phenomenal Tactic! ⚡", text: "Razor-sharp tactical instinct! That's how champions play!" },
  { title: "Grandmaster Intuition! 👑", text: "Flawless execution! Even Magnus Carlsen would smile at that!" },
  { title: "Mastery Unlocked! 💎", text: "Superb calculation! You turned chess theory into pure power!" },
  { title: "Tactical Perfection! 🔥", text: "You spotted the key square instantly! Keep this momentum!" },
  { title: "Strategic Brilliance! 🏆", text: "Your piece coordination and board control are outstanding!" },
  { title: "Superb Insight! ✨", text: "Spot-on! Another critical fundamental mastered!" }
];

export function LessonView({ onBack, isLight, isOled }) {
  const isLightMode = isLight !== undefined
    ? isLight
    : (typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [boardTheme] = useState(() => (Math.random() < 0.5 ? 'gold' : 'emerald'));
  const [lessons] = useState(ALL_LESSONS);
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(() => {
    const saved = safeStorage.getItem('chess_current_lesson_idx');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  // State to track if board/lesson is active
  const [isLessonStarted, setIsLessonStarted] = useState(false);

  // Mode: 'lesson' | 'practice'
  const [activeMode, setActiveMode] = useState('lesson');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [practiceStepIdx, setPracticeStepIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCategoryIdx, setModalCategoryIdx] = useState(0);
  const [showAllChapters, setShowAllChapters] = useState(false);
  const [expandedCategoryIdx, setExpandedCategoryIdx] = useState(null);

  const openLessonModal = (catIdx = null) => {
    sound.playClick();
    triggerHaptic('move');
    if (catIdx !== null) {
      setModalCategoryIdx(catIdx);
    } else {
      const curCatIdx = LESSON_CATEGORIES.findIndex(cat =>
        cat.lessons.some(l => l.num === currentLesson.num)
      );
      setModalCategoryIdx(curCatIdx !== -1 ? curCatIdx : 0);
    }
    setIsModalOpen(true);
  };

  // Voice narration enabled by default so the AI mentor speaks
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    const saved = safeStorage.getItem('chess_lesson_voice');
    return saved === null ? true : saved === 'true';
  });
  const [musicEnabled, setMusicEnabled] = useState(() => {
    const saved = safeStorage.getItem('chess_lesson_music');
    return saved === 'true';
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [, setIsMusicPlaying] = useState(musicEngine.isPlaying);

  // Interactive practice states
  const [successSquares, setSuccessSquares] = useState([]);
  const [errorSquares, setErrorSquares] = useState([]);
  const [practiceFeedback, setPracticeFeedback] = useState(null);
  const [practiceComplete, setPracticeComplete] = useState(false);

  const [completedLessons, setCompletedLessons] = useState(() => {
    try {
      const saved = safeStorage.getItem('chess_completed_lessons');
      return saved ? new Set(JSON.parse(saved)) : new Set([1]);
    } catch {
      return new Set([1]);
    }
  });

  const [showCompletionBanner, setShowCompletionBanner] = useState(false);

  const currentLesson = lessons[selectedLessonIdx] || lessons[0];
  const currentStep = currentLesson?.steps?.[currentStepIdx] || currentLesson?.steps?.[0];

  // Identify category for the selected lesson
  const currentCategory = useMemo(() => {
    return LESSON_CATEGORIES.find(cat =>
      cat.lessons.some(l => l.num === currentLesson.num)
    ) || LESSON_CATEGORIES[0];
  }, [currentLesson]);

  // Interactive Practice Drills for this lesson
  const practiceDrills = useMemo(() => {
    return getPracticeDrills(currentLesson);
  }, [currentLesson]);

  const currentPractice = practiceDrills[practiceStepIdx] || practiceDrills[0];

  // Pre-load voices on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
      }
    };
  }, []);

  // Save current lesson index
  useEffect(() => {
    safeStorage.setItem('chess_current_lesson_idx', selectedLessonIdx.toString());
  }, [selectedLessonIdx]);

  // Save completed lessons
  useEffect(() => {
    safeStorage.setItem('chess_completed_lessons', JSON.stringify([...completedLessons]));
  }, [completedLessons]);

  // Robust Text-To-Speech Narrator for Anime Mentor
  const speakText = (text) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (!voiceEnabled) return;

    try {
      window.speechSynthesis.cancel();

      setTimeout(() => {
        try {
          const cleanText = text.replace(/[*#_~`]/g, '').trim();
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = 'en-US';
          utterance.rate = 1.0;
          utterance.pitch = 1.05;

          const voices = window.speechSynthesis.getVoices();
          if (voices && voices.length > 0) {
            const naturalVoice = voices.find(v => (v.lang.startsWith('en') || v.lang.includes('US')) && v.name.includes('Google'))
              || voices.find(v => v.lang.startsWith('en'))
              || voices[0];
            if (naturalVoice) utterance.voice = naturalVoice;
          }

          utterance.onstart = () => setIsSpeaking(true);
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = () => setIsSpeaking(false);

          window.speechSynthesis.speak(utterance);
        } catch (err) {
          setIsSpeaking(false);
        }
      }, 50);
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  // Explicit user-triggered voice speaking
  const speakExplicitly = (text) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      if (!voiceEnabled) {
        setVoiceEnabled(true);
        safeStorage.setItem('chess_lesson_voice', 'true');
      }

      setTimeout(() => {
        try {
          const cleanText = text.replace(/[*#_~`]/g, '').trim();
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = 'en-US';
          utterance.rate = 1.0;
          utterance.pitch = 1.05;

          const voices = window.speechSynthesis.getVoices();
          if (voices && voices.length > 0) {
            const naturalVoice = voices.find(v => (v.lang.startsWith('en') || v.lang.includes('US')) && v.name.includes('Google'))
              || voices.find(v => v.lang.startsWith('en'))
              || voices[0];
            if (naturalVoice) utterance.voice = naturalVoice;
          }

          utterance.onstart = () => setIsSpeaking(true);
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = () => setIsSpeaking(false);

          window.speechSynthesis.speak(utterance);
        } catch (err) {
          setIsSpeaking(false);
        }
      }, 50);
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  // Automatically speak when advancing steps in Lesson Guide mode
  useEffect(() => {
    if (isLessonStarted && activeMode === 'lesson' && voiceEnabled && currentStep) {
      const textToSpeak = currentStep.speech || currentStep.content || currentLesson.title;
      speakText(textToSpeak);
    }
  }, [isLessonStarted, activeMode, currentStepIdx, selectedLessonIdx, voiceEnabled]);

  // Toggle Voice Narration ON/OFF
  const toggleVoice = () => {
    sound.playClick();
    triggerHaptic('move');
    const nextVal = !voiceEnabled;
    setVoiceEnabled(nextVal);
    safeStorage.setItem('chess_lesson_voice', nextVal.toString());

    if (nextVal) {
      if (isLessonStarted) {
        const textToSpeak = activeMode === 'lesson'
          ? (currentStep?.speech || currentStep?.content || currentLesson.title)
          : (currentPractice?.prompt || 'Your turn!');
        speakText(textToSpeak);
      }
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    }
  };

  // Toggle Ambient Light Background Music ON/OFF
  const toggleMusic = () => {
    sound.playClick();
    triggerHaptic('move');
    const nextVal = !musicEnabled;
    setMusicEnabled(nextVal);
    safeStorage.setItem('chess_lesson_music', nextVal.toString());

    if (nextVal) {
      musicEngine.start();
      setIsMusicPlaying(true);
    } else {
      musicEngine.stop();
      setIsMusicPlaying(false);
    }
  };

  const handleManualSpeak = () => {
    sound.playClick();
    triggerHaptic('move');
    if (isSpeaking) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    } else {
      const textToSpeak = activeMode === 'lesson'
        ? (currentStep?.speech || currentStep?.content || currentLesson.title)
        : (practiceFeedback || currentPractice?.prompt || 'Your turn!');
      speakExplicitly(textToSpeak);
    }
  };

  const handleNextStep = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    if (currentLesson && currentStepIdx < currentLesson.steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      sound.playMove();
      triggerHaptic('move');
    } else {
      sound.playLessonComplete();
      triggerHaptic('move');
      try {
        confetti({ particleCount: 75, spread: 65, origin: { y: 0.65 } });
      } catch (e) {}
      setCompletedLessons(prev => new Set([...prev, currentLesson.num]));
      setShowCompletionBanner(true);
    }
  };

  const handlePrevStep = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
      sound.playMove();
      triggerHaptic('move');
    }
  };

  const handleNextPractice = () => {
    setSuccessSquares([]);
    setErrorSquares([]);
    setPracticeFeedback(null);

    if (practiceStepIdx < practiceDrills.length - 1) {
      setPracticeStepIdx(prev => prev + 1);
      sound.playMove();
      triggerHaptic('move');
    } else {
      setPracticeComplete(true);
      setShowCompletionBanner(true);
      sound.playVictory();
      triggerHaptic('move');
    }
  };

  const handlePrevPractice = () => {
    setSuccessSquares([]);
    setErrorSquares([]);
    setPracticeFeedback(null);

    if (practiceStepIdx > 0) {
      setPracticeStepIdx(prev => prev - 1);
      sound.playMove();
      triggerHaptic('move');
    }
  };

  // Handle User Tapping a square during Practice drills
  const handlePracticeSquareClick = (square) => {
    if (activeMode !== 'practice' || !currentPractice) return;
    if (practiceComplete) return;

    const isCorrect = currentPractice.validSquares && currentPractice.validSquares.includes(square);
    if (isCorrect) {
      setSuccessSquares([square]);
      setErrorSquares([]);

      const praise = ENCOURAGING_PRAISES[Math.floor(Math.random() * ENCOURAGING_PRAISES.length)];
      setPracticeFeedback(`${praise.title} ${praise.text}`);
      sound.playLessonSuccess();
      triggerHaptic('move');
      if (voiceEnabled) speakText(praise.title);

      setTimeout(() => {
        if (practiceStepIdx < practiceDrills.length - 1) {
          setPracticeStepIdx(prev => prev + 1);
          setSuccessSquares([]);
          setPracticeFeedback(null);
        } else {
          setPracticeComplete(true);
          setCompletedLessons(prev => new Set([...prev, currentLesson.num, currentLesson.num + 1]));
          setShowCompletionBanner(true);
          sound.playLessonComplete();
          triggerHaptic('move');
          try {
            confetti({ particleCount: 85, spread: 75, origin: { y: 0.65 } });
          } catch (e) {}
        }
      }, 1200);
    } else {
      setErrorSquares([square]);
      sound.playErrorTone();
      triggerHaptic('move');
      const hintMsg = currentPractice.hint ? `Not quite! ${currentPractice.hint}` : "Not quite, try again!";
      setPracticeFeedback(hintMsg);
      if (voiceEnabled) speakText(hintMsg);

      setTimeout(() => {
        setErrorSquares([]);
      }, 700);
    }
  };

  // Select and immediately launch the lesson board
  const handleSelectLesson = (lessonNum, startImmediately = true) => {
    const idx = lessons.findIndex(l => l.num === lessonNum);
    if (idx !== -1) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      setSelectedLessonIdx(idx);
      setCurrentStepIdx(0);
      setPracticeStepIdx(0);
      setActiveMode('lesson');
      setSuccessSquares([]);
      setErrorSquares([]);
      setPracticeFeedback(null);
      setPracticeComplete(false);
      setIsModalOpen(false);
      setShowCompletionBanner(false);
      setIsLessonStarted(startImmediately);
      sound.playClick();
      triggerHaptic('move');
    }
  };

  const handleAdvanceToNextLesson = () => {
    setShowCompletionBanner(false);
    if (selectedLessonIdx < lessons.length - 1) {
      handleSelectLesson(lessons[selectedLessonIdx + 1].num, true);
    }
  };

  const completedCount = completedLessons.size;
  const progressPercent = Math.min(100, Math.round((completedCount / lessons.length) * 100));

  // Dynamic Encouragement Quote based on user progress
  const dynamicEncouragement = useMemo(() => {
    if (completedCount === 0) {
      return "🌱 Every Grandmaster began with a single move. Tap any lesson below to start!";
    } else if (completedCount <= 5) {
      return "🔥 Brilliant start! You are building muscle memory and tactical fundamentals.";
    } else if (completedCount <= 15) {
      return "⚔️ Tactical vision sharpening! You're mastering critical piece dynamics.";
    } else if (completedCount <= 30) {
      return "⚡ Impressive momentum! Core strategic patterns are becoming second nature.";
    } else if (completedCount <= 50) {
      return "🛡️ Advanced mastery in progress! You calculate complex lines with ease.";
    } else if (completedCount < 64) {
      return "💎 Elite Grandmaster tier within reach! Finish the remaining drills and conquer!";
    } else {
      return "👑 Academy Graduate! You have mastered the complete 64-lesson curriculum!";
    }
  }, [completedCount]);

  // Academic Tier Title
  const academicTier = useMemo(() => {
    if (completedCount <= 5) return { title: "Academy Apprentice", badge: "🌱 Apprentice", color: "text-emerald-400" };
    if (completedCount <= 15) return { title: "Knight Strategist", badge: "⚔️ Strategist", color: "text-emerald-300" };
    if (completedCount <= 30) return { title: "Bishop Tactician", badge: "🛡️ Tactician", color: "text-amber-400" };
    if (completedCount <= 45) return { title: "Rook Scholar", badge: "🏰 Scholar", color: "text-amber-300" };
    if (completedCount <= 60) return { title: "Queen's Vanguard", badge: "👑 Vanguard", color: "text-yellow-400" };
    return { title: "Grandmaster Scholar", badge: "🏆 Grandmaster", color: "text-yellow-300" };
  }, [completedCount]);

  // =========================================================================
  // VIEW 1: LESSON OVERVIEW & ACADEMY HUB (!isLessonStarted)
  // Clean, uncluttered, luxury academic aesthetic
  // =========================================================================
  if (!isLessonStarted) {
    return (
      <div className={`min-h-screen flex flex-col justify-between selection:bg-emerald-500/30 pb-20 md:pb-8 animate-fade-in transition-colors ${
        isLightMode
          ? 'bg-[#f4f7fb] text-slate-900'
          : 'bg-gradient-to-b from-slate-950 via-[#070b14] to-slate-950 text-slate-100'
      }`}>
        {/* Streamlined Top Header */}
        <header className={`sticky top-0 z-30 backdrop-blur-xl border-b px-4 py-3 shadow-sm transition-colors ${
          isLightMode
            ? 'bg-white/95 border-slate-200 text-slate-900'
            : 'bg-slate-950/80 border-slate-800/80 text-white'
        }`}>
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            {/* Back Button to Home */}
            <button
              onClick={() => {
                sound.playClick();
                triggerHaptic('move');
                if (typeof window !== 'undefined' && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                }
                if (onBack) onBack();
              }}
              className={`p-2 rounded-xl border transition-colors shadow-xs active:scale-95 cursor-pointer ${
                isLightMode
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:text-white text-slate-400'
              }`}
              title="Return to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Academy Title with Emerald & Gold Accent */}
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shadow-md ${
                isLightMode
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-700 shadow-emerald-500/10'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10'
              }`}>
                <GraduationCap className="w-4 h-4" />
              </div>
              <h1 className={`text-base sm:text-lg font-black leading-tight flex items-center gap-1.5 ${
                isLightMode ? 'text-slate-900' : 'text-white'
              }`}>
                <span>Chess Academy</span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border uppercase tracking-wider ${
                  isLightMode
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}>
                  PRO
                </span>
              </h1>
            </div>

            {/* Quick Actions (Choose Lesson, Browse All, Voice Toggle, Music) */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openLessonModal()}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  isLightMode
                    ? 'bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100'
                    : 'bg-sky-500/15 border border-sky-500/30 text-sky-300 hover:bg-sky-500/25'
                }`}
                title="Choose a lesson modal"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Choose Lesson</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  triggerHaptic('move');
                  setShowAllChapters(prev => !prev);
                }}
                className={`p-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 ${
                  showAllChapters
                    ? isLightMode
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                    : isLightMode
                    ? 'bg-slate-100 border border-slate-200 text-slate-700 hover:text-emerald-700'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400'
                }`}
                title="Toggle chapters list"
              >
                <List className="w-5 h-5" />
              </button>

              <button
                onClick={toggleVoice}
                className={`p-2 rounded-xl transition-all cursor-pointer active:scale-95 ${
                  voiceEnabled
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/40'
                    : isLightMode
                    ? 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
                title={voiceEnabled ? 'Sensei Voice: ON' : 'Sensei Voice: OFF'}
              >
                {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleMusic}
                className={`p-2 rounded-xl transition-all cursor-pointer active:scale-95 ${
                  musicEnabled
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/25 ring-2 ring-amber-300/40'
                    : isLightMode
                    ? 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
                title={musicEnabled ? 'Ambient Music: ON' : 'Ambient Music: OFF'}
              >
                <Music className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Academy Hub Main Body */}
        <main className="flex-1 max-w-md w-full mx-auto px-3.5 py-4 space-y-4">
          {/* Professional Academic Mastery Tracker Card (Single Premium Progress Line) */}
          <div className={`border rounded-2xl p-4 shadow-md backdrop-blur-xl space-y-3 relative overflow-hidden transition-colors ${
            isLightMode
              ? 'bg-white border-slate-200/90 shadow-slate-200/40 text-slate-900'
              : 'bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/90 border-slate-800/80 text-white'
          }`}>
            <div className="flex items-center justify-between gap-2 relative z-10">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20 shrink-0">
                  <GraduationCap className="w-4 h-4 text-slate-950" />
                </div>
                <div className="min-w-0">
                  <h2 className={`text-xs sm:text-sm font-black uppercase tracking-wider truncate ${
                    isLightMode ? 'text-slate-900' : 'text-white'
                  }`}>
                    Academic Mastery Tracker
                  </h2>
                  <p className={`text-[11px] font-medium truncate ${
                    isLightMode ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    Structured FIDE Curriculum • 64 Master Lessons
                  </p>
                </div>
              </div>

              <div className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold flex items-center gap-1 shadow-xs shrink-0 ${
                isLightMode
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              }`}>
                <span>{academicTier.badge}</span>
              </div>
            </div>

            {/* Single Premium Progress Line */}
            <div className="space-y-1.5 pt-0.5 relative z-10">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className={`flex items-center gap-1.5 text-[11px] ${
                  isLightMode ? 'text-slate-600' : 'text-slate-300'
                }`}>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Curriculum Completed</span>
                </span>
                <span className={`font-black text-xs ${
                  isLightMode ? 'text-emerald-700' : 'text-emerald-400'
                }`}>
                  {completedCount} / 64 Lessons ({progressPercent}%)
                </span>
              </div>

              <div className={`w-full h-2.5 rounded-full overflow-hidden p-0.5 border shadow-inner ${
                isLightMode ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'
              }`}>
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full transition-all duration-700 shadow-md shadow-emerald-500/30"
                  style={{ width: `${Math.max(4, progressPercent)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Featured Resume Lesson Card with Anime Sensei Mentor */}
          <div className={`border rounded-3xl p-4 sm:p-5 shadow-lg backdrop-blur-xl space-y-3.5 transition-colors ${
            isLightMode
              ? 'bg-white border-slate-200/90 shadow-slate-200/40 text-slate-900'
              : 'bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 border-slate-800/90 text-white'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${
                isLightMode
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              }`}>
                <Compass className="w-3 h-3" />
                <span>{currentCategory?.name || 'Tactics'}</span>
              </span>
              <span className={`text-xs font-bold font-mono ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Lesson {currentLesson.num} of 64
              </span>
            </div>

            <div>
              <h2 className={`text-xl sm:text-2xl font-black leading-tight tracking-tight ${
                isLightMode ? 'text-slate-900' : 'text-white'
              }`}>
                {currentLesson.title}
              </h2>
            </div>

            {/* Anime Mentor Preview with Audio Button */}
            <div className={`flex items-center gap-3 rounded-2xl p-3 border ${
              isLightMode
                ? 'bg-slate-50 border-slate-200 text-slate-900'
                : 'bg-slate-950/80 border-slate-800/80 text-white'
            }`}>
              <div
                className="shrink-0 cursor-pointer hover:scale-105 transition-transform"
                onClick={handleManualSpeak}
                title="Tap Anime Sensei to speak"
              >
                <MentorAvatar size={52} isSpeaking={isSpeaking} />
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium leading-relaxed italic line-clamp-2 ${
                  isLightMode ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  "{currentStep?.speech || currentStep?.content || currentLesson.title}"
                </p>
                <button
                  type="button"
                  onClick={handleManualSpeak}
                  className={`inline-flex items-center gap-1.5 text-[11px] font-bold mt-1 cursor-pointer transition-colors ${
                    isLightMode ? 'text-emerald-700 hover:text-emerald-800' : 'text-emerald-400 hover:text-emerald-300'
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>Speaking... (Tap to stop)</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Tap to Hear Sensei</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Steps & Duration Strip */}
            <div className="flex items-center justify-between text-xs font-bold px-1">
              <span className={`flex items-center gap-1.5 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                <span>{currentLesson.steps.length} Steps</span>
              </span>
              <span className={`flex items-center gap-1.5 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                <Target className="w-3.5 h-3.5 text-amber-500" />
                <span>{practiceDrills.length} Drills</span>
              </span>
              <span className={`flex items-center gap-1.5 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                <Clock className="w-3.5 h-3.5 text-teal-500" />
                <span>~2 Mins</span>
              </span>
            </div>

            {/* Primary Action Button */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => handleSelectLesson(currentLesson.num, true)}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.98] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current text-slate-950" />
                <span>Start Lesson {currentLesson.num}: {currentLesson.title}</span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => openLessonModal()}
                  className={`w-full py-2.5 px-3 rounded-xl font-black text-xs border flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-98 cursor-pointer ${
                    isLightMode
                      ? 'bg-sky-50 hover:bg-sky-100 text-[#1e6091] border-sky-200'
                      : 'bg-sky-950/80 hover:bg-sky-900 text-sky-300 border-sky-500/40'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>Choose a lesson</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    triggerHaptic('move');
                    setShowAllChapters(prev => !prev);
                  }}
                  className={`w-full py-2.5 px-3 rounded-xl font-black text-xs border flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-98 cursor-pointer ${
                    isLightMode
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border-slate-700/80 hover:border-emerald-500/50'
                  }`}
                >
                  <List className="w-4 h-4 text-emerald-500" />
                  <span>{showAllChapters ? 'Hide Chapters' : 'All Chapters'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Curriculum Chapters (Collapsible & Closed by Default) */}
          <div className="space-y-2 pt-1">
            {/* Master Toggle Button: Closed by Default */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                triggerHaptic('move');
                setShowAllChapters(prev => !prev);
              }}
              className={`w-full p-3.5 sm:p-4 rounded-2xl border shadow-md transition-all duration-200 transform hover:-translate-y-0.5 active:scale-[0.985] group cursor-pointer relative overflow-hidden text-left ${
                isLightMode
                  ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-slate-200/40 text-slate-900'
                  : 'bg-gradient-to-r from-slate-900/90 via-slate-900/95 to-slate-950/90 hover:from-slate-850 hover:to-slate-900 border-slate-800 hover:border-emerald-500/40 shadow-slate-950/30 text-white'
              }`}
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0 ${
                    isLightMode
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                      : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  }`}>
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-black transition-colors truncate ${
                        isLightMode ? 'text-slate-900 group-hover:text-emerald-700' : 'text-white group-hover:text-emerald-300'
                      }`}>
                        Curriculum Chapters
                      </span>
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        isLightMode
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}>
                        8 Chapters
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 font-medium truncate ${
                      isLightMode ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      {showAllChapters
                        ? 'Tap to collapse chapter curriculum'
                        : 'Tap to view full 64-lesson chapter list'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                    isLightMode
                      ? 'bg-slate-100 border-slate-200 text-slate-600 group-hover:text-emerald-700'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300 group-hover:text-emerald-400'
                  }`}>
                    {showAllChapters ? (
                      <ChevronUp className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                    )}
                  </div>
                </div>
              </div>
            </button>

            {/* Chapters List: Revealed on click */}
            {showAllChapters && (
              <div className="space-y-2 pt-1 animate-fade-in">
                <div className="flex items-center justify-between px-1">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${
                    isLightMode ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    All 8 Chapters • Tap to expand lessons
                  </span>
                  <button
                    onClick={() => openLessonModal()}
                    className={`text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                      isLightMode ? 'text-sky-700 hover:text-sky-850' : 'text-sky-400 hover:text-sky-300'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Choose a lesson &rarr;</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {LESSON_CATEGORIES.map((cat, catIdx) => {
                    const isExpanded = expandedCategoryIdx === catIdx;
                    const completedInCat = cat.lessons.filter(l => completedLessons.has(l.num)).length;

                    return (
                      <div
                        key={catIdx}
                        className={`border rounded-2xl overflow-hidden transition-all shadow-md backdrop-blur-md ${
                          isLightMode
                            ? 'bg-white border-slate-200 text-slate-900'
                            : 'bg-slate-900/80 border-slate-800/90 text-white'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            triggerHaptic('move');
                            setExpandedCategoryIdx(isExpanded ? null : catIdx);
                          }}
                          className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors cursor-pointer ${
                            isLightMode ? 'hover:bg-slate-50' : 'hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-7 h-7 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 ${
                              isLightMode
                                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                                : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400'
                            }`}>
                              {catIdx + 1}
                            </div>
                            <div className="min-w-0">
                              <span className={`text-xs sm:text-sm font-bold block truncate ${
                                isLightMode ? 'text-slate-900' : 'text-white'
                              }`}>
                                {cat.name}
                              </span>
                              <span className={`text-[10px] font-mono ${
                                isLightMode ? 'text-slate-500' : 'text-slate-400'
                              }`}>
                                {cat.lessons.length} Lessons • {completedInCat} Done
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openLessonModal(catIdx);
                              }}
                              className={`p-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                isLightMode
                                  ? 'bg-sky-50 text-[#1e6091] border-sky-200 hover:bg-sky-100'
                                  : 'bg-sky-950/60 text-sky-300 border-sky-500/30 hover:bg-sky-900/60'
                              }`}
                              title="Open Choose a Lesson modal for this chapter"
                            >
                              <GraduationCap className="w-3.5 h-3.5" />
                            </button>

                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isLightMode
                                ? 'bg-slate-100 text-slate-700 border-slate-200'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}>
                              {completedInCat}/{cat.lessons.length}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className={`px-3 pb-3 pt-1 space-y-1.5 border-t ${
                            isLightMode ? 'border-slate-200 bg-slate-50/70' : 'border-slate-800/80 bg-slate-950/60'
                          }`}>
                            {cat.lessons.map((lesson) => {
                              const isCompleted = completedLessons.has(lesson.num);
                              const isCurrent = lesson.num === currentLesson.num;

                              return (
                                <button
                                  key={lesson.num}
                                  type="button"
                                  onClick={() => handleSelectLesson(lesson.num, true)}
                                  className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between text-xs transition-all cursor-pointer active:scale-98 ${
                                    isCurrent
                                      ? isLightMode
                                        ? 'bg-emerald-100 text-emerald-950 font-black border border-emerald-300 shadow-xs'
                                        : 'bg-gradient-to-r from-emerald-500/20 to-amber-500/10 text-white font-black border border-emerald-500/50 shadow-md'
                                      : isLightMode
                                      ? 'hover:bg-slate-100 text-slate-800 border border-transparent'
                                      : 'hover:bg-slate-800/70 text-slate-300 border border-transparent'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    {isCompleted ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    ) : (
                                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                        isLightMode ? 'border-slate-300' : 'border-slate-600'
                                      }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${isLightMode ? 'bg-slate-400' : 'bg-slate-500'}`} />
                                      </span>
                                    )}
                                    <span className={`font-mono font-bold w-6 shrink-0 ${isLightMode ? 'text-amber-700' : 'text-amber-400'}`}>
                                      {lesson.num}.
                                    </span>
                                    <span className="truncate">{lesson.title}</span>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {isCurrent && (
                                      <span className={`px-1.5 py-0.5 text-[9px] font-black rounded-md border ${
                                        isLightMode
                                          ? 'bg-emerald-200 text-emerald-900 border-emerald-400'
                                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                      }`}>
                                        Current
                                      </span>
                                    )}
                                    <Play className={`w-3 h-3 ${isLightMode ? 'text-slate-400 hover:text-slate-700' : 'text-slate-500 hover:text-white'}`} />
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* 64-Lesson Picker Modal */}
        {renderLessonPickerModal()}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE LESSON BOARD VIEW (isLessonStarted === true)
  // Mobile-optimized, compact, with Anime Sensei and direct audio controls
  // =========================================================================
  return (
    <div className={`min-h-screen flex flex-col justify-between selection:bg-emerald-500/30 pb-20 md:pb-6 animate-fade-in transition-colors ${
      isLightMode
        ? 'bg-[#f4f7fb] text-slate-900'
        : 'bg-gradient-to-b from-slate-950 via-[#070b14] to-slate-950 text-slate-100'
    }`}>
      {/* Compact Top Navigation Bar */}
      <header className={`sticky top-0 z-30 backdrop-blur-xl border-b px-3 py-2.5 shadow-sm transition-colors ${
        isLightMode
          ? 'bg-white/95 border-slate-200 text-slate-900'
          : 'bg-slate-950/85 border-slate-800/80 text-white'
      }`}>
        <div className="max-w-md w-full mx-auto flex items-center justify-between gap-2">
          {/* Back Button -> Returns to Lesson Overview Hub */}
          <button
            onClick={() => {
              sound.playClick();
              triggerHaptic('move');
              if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
              setIsSpeaking(false);
              setIsLessonStarted(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-colors shadow-xs active:scale-95 cursor-pointer text-xs font-bold ${
              isLightMode
                ? 'bg-slate-100 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:text-white text-slate-300'
            }`}
            title="Exit Lesson to Overview Hub"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit</span>
          </button>

          {/* Lesson Title & Number */}
          <button
            onClick={() => {
              sound.playClick();
              triggerHaptic('move');
              setIsModalOpen(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-2xl border transition-all cursor-pointer truncate max-w-[200px] sm:max-w-none ${
              isLightMode
                ? 'bg-slate-100 border-slate-200 hover:border-emerald-500/50 text-slate-900'
                : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className={`font-extrabold text-xs sm:text-sm font-mono truncate ${
              isLightMode ? 'text-slate-900' : 'text-white'
            }`}>
              Lesson {currentLesson.num}: {currentLesson.title}
            </span>
          </button>

          {/* Right Action Icons (Chapter List, Voice, Music) */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                sound.playClick();
                triggerHaptic('move');
                setIsModalOpen(true);
              }}
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer active:scale-95 ${
                isLightMode
                  ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-emerald-700'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-emerald-400'
              }`}
              title="All Lessons"
            >
              <List className="w-4 h-4" />
            </button>

            <button
              onClick={toggleVoice}
              className={`p-1.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
                voiceEnabled
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/25'
                  : isLightMode
                  ? 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
              title={voiceEnabled ? 'Sensei Voice: ON' : 'Sensei Voice: OFF'}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleMusic}
              className={`p-1.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
                musicEnabled
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/25'
                  : isLightMode
                  ? 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
              title={musicEnabled ? 'Ambient Music: ON' : 'Ambient Music: OFF'}
            >
              <Music className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mode Switcher: [ 📖 Lesson Guide ]  [ 🎯 Practice Drills ] */}
      <div className="w-full text-center pt-2 pb-1 px-3">
        <div className={`inline-flex items-center justify-center gap-1.5 p-1 rounded-2xl border shadow-md ${
          isLightMode
            ? 'bg-white border-slate-200'
            : 'bg-slate-900/90 border-slate-800'
        }`}>
          <button
            onClick={() => {
              sound.playClick();
              triggerHaptic('move');
              setActiveMode('lesson');
              setSuccessSquares([]);
              setErrorSquares([]);
              setPracticeFeedback(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'lesson'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                : isLightMode
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Lesson Guide</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              triggerHaptic('move');
              setActiveMode('practice');
              setSuccessSquares([]);
              setErrorSquares([]);
              setPracticeFeedback(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'practice'
                ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : isLightMode
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Practice Drills</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              isLightMode ? 'bg-amber-100 text-amber-900' : 'bg-slate-950/40 text-slate-950'
            }`}>
              {practiceDrills.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-3.5 py-1 flex flex-col justify-around items-center gap-2">
        {/* Anime Mentor & Speech Bubble with Audio Playback Button */}
        <div className="w-full flex items-start gap-2.5 max-w-[500px]">
          <div
            className="shrink-0 pt-0.5 cursor-pointer hover:scale-105 transition-transform"
            onClick={handleManualSpeak}
            title="Tap Anime Sensei to hear voice"
          >
            <MentorAvatar size={54} isSpeaking={isSpeaking} />
          </div>

          <div className={`relative flex-1 rounded-2xl p-3 shadow-md border text-xs sm:text-sm leading-relaxed backdrop-blur-md ${
            isLightMode
              ? 'bg-white border-slate-200 text-slate-900'
              : 'bg-gradient-to-br from-slate-900/95 to-slate-950/95 border-slate-800 text-slate-100'
          }`}>
            <div className={`absolute top-4 -left-2 w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent ${
              isLightMode ? 'border-r-8 border-r-white' : 'border-r-8 border-r-slate-900'
            }`} />

            {activeMode === 'lesson' ? (
              <div className="space-y-2">
                <p className={`font-medium leading-normal ${
                  isLightMode ? 'text-slate-800' : 'text-slate-200'
                }`}>
                  {currentStep?.speech || currentStep?.content}
                </p>
                <div className={`flex items-center justify-between pt-1 border-t ${
                  isLightMode ? 'border-slate-200' : 'border-slate-800/60'
                }`}>
                  <button
                    type="button"
                    onClick={handleManualSpeak}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black transition-all cursor-pointer ${
                      isSpeaking
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 animate-pulse'
                        : isLightMode
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                        : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isSpeaking ? 'Speaking... (Tap to stop)' : 'Listen to Sensei'}</span>
                  </button>
                  <span className={`text-[10px] font-mono ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Step {currentStepIdx + 1}/{currentLesson.steps.length}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <p className={`font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                  {practiceFeedback || currentPractice?.prompt || "Your turn! Tap the correct square."}
                </p>
                {practiceFeedback && practiceFeedback.includes("!") && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-extrabold mt-1">
                    <Check className="w-3.5 h-3.5" /> Correct! Moving to next drill...
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Completion Announcement Banner */}
        {showCompletionBanner && (
          <div className={`w-full max-w-[500px] p-3.5 rounded-2xl flex items-center justify-between shadow-xl animate-fade-in backdrop-blur-xl border ${
            isLightMode
              ? 'bg-emerald-50 border-emerald-300 text-slate-900'
              : 'bg-gradient-to-r from-emerald-500/20 via-slate-900 to-amber-500/15 border-emerald-500/40 text-white'
          }`}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500 animate-spin" />
              <div>
                <p className={`text-[11px] font-black uppercase tracking-wider ${
                  isLightMode ? 'text-emerald-800' : 'text-emerald-400'
                }`}>
                  {activeMode === 'practice' ? 'Practice Complete! 🏆' : 'Lesson Complete! 🎉'}
                </p>
                <p className={`text-xs font-bold ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                  {activeMode === 'practice'
                    ? `Mastered all drills for ${currentLesson.title}!`
                    : `Great job on ${currentLesson.title}! Ready for practice?`}
                </p>
              </div>
            </div>
            {activeMode === 'lesson' ? (
              <button
                onClick={() => {
                  sound.playClick();
                  triggerHaptic('move');
                  setActiveMode('practice');
                  setPracticeStepIdx(0);
                  setShowCompletionBanner(false);
                }}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
              >
                Practice 🎯 &rarr;
              </button>
            ) : selectedLessonIdx < lessons.length - 1 ? (
              <button
                onClick={handleAdvanceToNextLesson}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
              >
                Next &rarr;
              </button>
            ) : null}
          </div>
        )}

        {/* Chessboard */}
        <div className="w-full flex justify-center items-center my-0.5 shrink-0">
          <div
            className={`flex justify-center items-center shadow-xl rounded-2xl overflow-hidden border ${
              isLightMode ? 'border-slate-300 shadow-slate-300/40' : 'border-slate-800 shadow-2xl'
            }`}
            style={{
              width: 'min(calc(100vw - 32px), 430px)',
              height: 'min(calc(100vw - 32px), 430px)'
            }}
          >
            <Chessboard
              fen={activeMode === 'lesson' ? (currentStep?.fen || "8/8/8/8/8/8/8/8 w - - 0 1") : (currentPractice?.fen || "8/8/8/8/8/8/8/8 w - - 0 1")}
              playerColor="w"
              disabled={activeMode === 'lesson'}
              onSquareClick={activeMode === 'practice' ? handlePracticeSquareClick : undefined}
              boardTheme={boardTheme}
              highlightSquares={activeMode === 'lesson' ? (currentStep?.highlightSquares || []) : (currentPractice?.highlightSquares || [])}
              successSquares={successSquares}
              errorSquares={errorSquares}
              showCoordinates={true}
            />
          </div>
        </div>
      </main>

      {/* Step Navigation Bar */}
      <footer className="w-full py-3 px-4 bg-transparent">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3 sm:gap-4">
          {/* Previous Step Button */}
          <button
            onClick={activeMode === 'lesson' ? handlePrevStep : handlePrevPractice}
            disabled={activeMode === 'lesson' ? currentStepIdx === 0 : practiceStepIdx === 0}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-2xl border disabled:opacity-30 disabled:pointer-events-none shadow-md font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer shrink-0 ${
              isLightMode
                ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
            title="Previous Step"
          >
            <ChevronLeft className={`w-4 h-4 sm:w-5 sm:h-5 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Interactive Step Navigator Capsule */}
          <div className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-2xl border shadow-inner max-w-[210px] overflow-x-auto no-scrollbar ${
            isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            {activeMode === 'lesson' ? (
              currentLesson.steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    sound.playClick();
                    triggerHaptic('move');
                    setCurrentStepIdx(idx);
                  }}
                  className={`transition-all duration-200 rounded-full cursor-pointer ${
                    currentStepIdx === idx
                      ? 'w-3 h-3 bg-emerald-500 scale-125 shadow-xs ring-2 ring-emerald-400/50'
                      : isLightMode
                      ? 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                      : 'w-2 h-2 bg-slate-700 hover:bg-slate-500'
                  }`}
                  title={`Step ${idx + 1}`}
                />
              ))
            ) : (
              practiceDrills.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    sound.playClick();
                    triggerHaptic('move');
                    setPracticeStepIdx(idx);
                    setSuccessSquares([]);
                    setErrorSquares([]);
                    setPracticeFeedback(null);
                  }}
                  className={`transition-all duration-200 rounded-full cursor-pointer ${
                    practiceStepIdx === idx
                      ? 'w-3 h-3 bg-amber-500 scale-125 shadow-xs ring-2 ring-amber-400/50'
                      : isLightMode
                      ? 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                      : 'w-2 h-2 bg-slate-700 hover:bg-slate-500'
                  }`}
                  title={`Drill ${idx + 1}`}
                />
              ))
            )}
          </div>

          {/* Next / Complete Step Button */}
          <button
            onClick={activeMode === 'lesson' ? handleNextStep : handleNextPractice}
            className={`flex items-center gap-1.5 px-4 sm:px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm shadow-xl transition-all active:scale-95 cursor-pointer shrink-0 ${
              activeMode === 'lesson'
                ? currentStepIdx === currentLesson.steps.length - 1
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-amber-500/30'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25'
                : practiceStepIdx === practiceDrills.length - 1
                ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 text-slate-950 shadow-emerald-500/30'
                : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-amber-500/25'
            }`}
          >
            {activeMode === 'lesson' ? (
              currentStepIdx === currentLesson.steps.length - 1 ? (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Practice 🎯</span>
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )
            ) : practiceStepIdx === practiceDrills.length - 1 ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete 🏆</span>
              </>
            ) : (
              <>
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </footer>

      {/* 64-Lesson Picker Modal */}
      {renderLessonPickerModal()}
    </div>
  );

  // Helper renderer for the Choose a Lesson dialog (matching official design)
  function renderLessonPickerModal() {
    if (!isModalOpen) return null;
    const currentCat = LESSON_CATEGORIES[modalCategoryIdx] || LESSON_CATEGORIES[0];

    return (
      <div
        onClick={() => {
          sound.playClick();
          setIsModalOpen(false);
        }}
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`rounded-3xl max-w-sm sm:max-w-md w-full max-h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-scale-up ${
            isLightMode
              ? 'bg-[#f0f4f8] text-slate-900'
              : 'bg-slate-900 text-white border border-slate-800'
          }`}
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-1">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-7 h-7 text-[#1e6091] dark:text-sky-400 shrink-0" />
              <h2 className="text-xl font-bold tracking-tight text-[#1e6091] dark:text-sky-300">
                Choose a lesson
              </h2>
            </div>
          </div>

          {/* Category Title & Scrollable Chips */}
          <div className="px-6 pt-1 pb-2 space-y-2">
            <p className="text-sm font-semibold text-[#1e6091] dark:text-sky-400">
              {currentCat.name}
            </p>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {LESSON_CATEGORIES.map((cat, idx) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    triggerHaptic('move');
                    setModalCategoryIdx(idx);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    modalCategoryIdx === idx
                      ? 'bg-[#1e6091] text-white shadow-xs'
                      : isLightMode
                      ? 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Cards List with green bottom border */}
          <div className="flex-1 overflow-y-auto px-5 py-2 space-y-2.5 no-scrollbar">
            {currentCat.lessons.map((lesson) => {
              const isCompleted = completedLessons.has(lesson.num);
              const isCurrent = lesson.num === currentLesson.num;
              const isUnlocked = isCompleted || isCurrent || lesson.num === 1;

              return (
                <button
                  key={lesson.num}
                  type="button"
                  onClick={() => handleSelectLesson(lesson.num, true)}
                  className={`w-full px-4 py-3 rounded-xl border-b-[3.5px] border-b-green-600 transition-all text-left flex items-center gap-3 shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer ${
                    isLightMode
                      ? 'bg-white border border-slate-150 text-slate-800'
                      : 'bg-slate-800/90 border border-slate-700/80 text-white hover:bg-slate-800'
                  }`}
                >
                  {/* Left Lock / Status */}
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : isUnlocked ? (
                      isCurrent ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
                      ) : null
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400" />
                    )}
                  </div>

                  {/* Lesson Number */}
                  <span className="font-bold text-base text-[#1e6091] dark:text-sky-400 w-6 shrink-0 text-left">
                    {lesson.num}
                  </span>

                  {/* Lesson Title */}
                  <span className="font-medium text-sm text-slate-800 dark:text-slate-100 flex-1 truncate">
                    {lesson.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer with Cancel button */}
          <div className="px-6 py-3.5 flex items-center justify-end">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsModalOpen(false);
              }}
              className="text-sm font-semibold text-[#1e6091] dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 transition-colors cursor-pointer px-3 py-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
}
