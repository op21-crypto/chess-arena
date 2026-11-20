import React, { useState, useEffect, useMemo } from 'react';
import { Chessboard } from './Chessboard.jsx';
import { OwlMascot } from './OwlMascot.jsx';
import {
  GraduationCap,
  List,
  Volume2,
  VolumeX,
  Music,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Lock,
  LockOpen,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Target,
  Check,
  Play,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ALL_LESSONS, LESSON_CATEGORIES, getPracticeDrills } from '../data/lessonsData.js';
import { sound } from '../utils/audio.js';
import { musicEngine } from '../utils/music.js';
import { safeStorage } from '../utils/storage.js';

export function LessonView({ onBack }) {
  const [lessons] = useState(ALL_LESSONS);
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(() => {
    const saved = safeStorage.getItem('chess_current_lesson_idx');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  // Consent & Start State: Lessons never auto-start or auto-speak without explicit consent
  const [isLessonStarted, setIsLessonStarted] = useState(false);

  // Mode: 'lesson' | 'practice'
  const [activeMode, setActiveMode] = useState('lesson');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [practiceStepIdx, setPracticeStepIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCategoryIdx, setExpandedCategoryIdx] = useState(null);

  // Audio toggles (Voice defaults to FALSE so it NEVER speaks automatically on navigation)
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    const saved = safeStorage.getItem('chess_lesson_voice');
    return saved === 'true'; // Defaults to false
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

  const [unlockAll, setUnlockAll] = useState(() => {
    const saved = safeStorage.getItem('chess_lessons_unlock_all');
    return saved === null ? false : saved === 'true';
  });
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

  // Silence speech synthesis immediately upon entering or leaving the component
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
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

  // Text-To-Speech Narrator for Owl (only speaks when lesson is active AND voiceEnabled is true)
  const speakText = (text) => {
    if (!isLessonStarted || !voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  // Explicit user-initiated speech (e.g. tapping the Owl or preview button)
  const speakExplicitly = (text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  // Auto-speak ONLY when lesson is explicitly started and voice is enabled
  useEffect(() => {
    if (!isLessonStarted || !voiceEnabled) return;
    const textToSpeak = activeMode === 'lesson'
      ? (currentStep?.speech || currentStep?.content || currentLesson.title)
      : (practiceFeedback || currentPractice?.prompt || 'Your turn!');

    speakText(textToSpeak);
  }, [currentStepIdx, practiceStepIdx, activeMode, selectedLessonIdx, isLessonStarted]);

  // Keyboard navigation (only active when lesson is running)
  useEffect(() => {
    if (!isLessonStarted) return;
    const handleKeyDown = (e) => {
      if (isModalOpen) {
        if (e.key === 'Escape') setIsModalOpen(false);
        return;
      }
      if (e.key === 'ArrowRight') {
        if (activeMode === 'lesson') handleNextStep();
        else handleNextPractice();
      } else if (e.key === 'ArrowLeft') {
        if (activeMode === 'lesson') handlePrevStep();
        else handlePrevPractice();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLessonStarted, isModalOpen, currentStepIdx, practiceStepIdx, activeMode, selectedLessonIdx]);

  // Toggle Voice Narration ON/OFF
  const toggleVoice = () => {
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

  const handleNextStep = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    if (currentLesson && currentStepIdx < currentLesson.steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      sound.playMove();
    } else {
      sound.playVictory();
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
    }
  };

  const handleNextPractice = () => {
    setSuccessSquares([]);
    setErrorSquares([]);
    setPracticeFeedback(null);

    if (practiceStepIdx < practiceDrills.length - 1) {
      setPracticeStepIdx(prev => prev + 1);
      sound.playMove();
    } else {
      setPracticeComplete(true);
      setShowCompletionBanner(true);
      sound.playVictory();
    }
  };

  const handlePrevPractice = () => {
    setSuccessSquares([]);
    setErrorSquares([]);
    setPracticeFeedback(null);

    if (practiceStepIdx > 0) {
      setPracticeStepIdx(prev => prev - 1);
      sound.playMove();
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
      sound.playVictory();
      setPracticeFeedback("Well done!");
      if (voiceEnabled) speakText("Well done!");

      setTimeout(() => {
        if (practiceStepIdx < practiceDrills.length - 1) {
          setPracticeStepIdx(prev => prev + 1);
          setSuccessSquares([]);
          setPracticeFeedback(null);
        } else {
          setPracticeComplete(true);
          setCompletedLessons(prev => new Set([...prev, currentLesson.num, currentLesson.num + 1]));
          setShowCompletionBanner(true);
          sound.playVictory();
        }
      }, 1200);
    } else {
      setErrorSquares([square]);
      sound.playGameOver();
      const hintMsg = currentPractice.hint ? `Not quite! ${currentPractice.hint}` : "Not quite, try again!";
      setPracticeFeedback(hintMsg);
      if (voiceEnabled) speakText(hintMsg);

      setTimeout(() => {
        setErrorSquares([]);
      }, 700);
    }
  };

  const handleSelectLesson = (lessonNum, startImmediately = false) => {
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
      sound.playMove();
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

  // =========================================================================
  // VIEW 1: LESSON OVERVIEW & CONSENT HUB (!isLessonStarted)
  // When user clicks 'Learn', they land here. No automatic speech or board start.
  // User explicitly chooses to Start Lesson or Browse Lessons.
  // =========================================================================
  if (!isLessonStarted) {
    return (
      <div className="min-h-screen bg-[#edf3f8] text-slate-800 flex flex-col justify-between selection:bg-sky-200 pb-20 md:pb-8">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#dbeafe] border-b border-sky-200 px-4 py-2.5 shadow-xs">
          <div className="max-w-md mx-auto flex items-center justify-between">
            {/* Back Button to Home */}
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                }
                if (onBack) onBack();
              }}
              className="p-1.5 rounded-full hover:bg-sky-200/70 text-slate-700 transition-colors"
              title="Return to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Title */}
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-sky-800" />
              <span className="font-bold text-sky-950 text-base md:text-lg">
                Chess Academy
              </span>
            </div>

            {/* Quick Actions (Browse All, Voice Toggle, Music) */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsModalOpen(true)}
                className="p-2 rounded-xl text-slate-700 hover:text-sky-900 hover:bg-sky-200/70 transition-colors"
                title="Browse all 64 lessons"
              >
                <List className="w-5 h-5" />
              </button>

              <button
                onClick={toggleVoice}
                className={`p-2 rounded-xl transition-all ${
                  voiceEnabled
                    ? 'bg-sky-500 text-white shadow-sm ring-2 ring-sky-300'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-sky-200/60'
                }`}
                title={voiceEnabled ? 'Voice Narration: ON (Tap to mute)' : 'Voice Narration: OFF (Tap to enable)'}
              >
                {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleMusic}
                className={`p-2 rounded-xl transition-all ${
                  musicEnabled
                    ? 'bg-amber-400 text-amber-950 shadow-sm ring-2 ring-amber-300'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-sky-200/60'
                }`}
                title={musicEnabled ? 'Ambient Music: ON' : 'Ambient Music: OFF'}
              >
                <Music className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Consent Hub Main Body */}
        <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 space-y-4">
          {/* Progress Card */}
          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1.5">
                <span>Course Progress</span>
                <span className="text-sky-700">{completedCount}/64 ({progressPercent}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Sequential / Free Mode Toggle */}
            <button
              onClick={() => {
                const nextVal = !unlockAll;
                setUnlockAll(nextVal);
                safeStorage.setItem('chess_lessons_unlock_all', nextVal.toString());
              }}
              className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                unlockAll
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-800'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
              title={unlockAll ? 'Free mode: all lessons open' : 'Sequential mode: complete lessons in order'}
            >
              {unlockAll ? <LockOpen className="w-3 h-3 text-amber-700" /> : <Lock className="w-3 h-3 text-slate-500" />}
              <span>{unlockAll ? 'All Open' : 'Sequential'}</span>
            </button>
          </div>

          {/* Featured Lesson Consent Card */}
          <div className="bg-white rounded-3xl p-5 shadow-md border border-sky-100 space-y-4">
            {/* Category & Lesson Num Badge */}
            <div className="flex items-center justify-between gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200">
                {currentCategory?.name || 'Chess Tactics'}
              </span>
              <span className="text-xs font-bold text-slate-500">
                Lesson {currentLesson.num} of 64
              </span>
            </div>

            {/* Lesson Title */}
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-tight">
                {currentLesson.title}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Master core principles step-by-step with interactive drills.
              </p>
            </div>

            {/* Owl Mascot Preview */}
            <div className="flex items-start gap-3.5 bg-sky-50/70 rounded-2xl p-3.5 border border-sky-200/60">
              <div
                className="shrink-0 cursor-pointer"
                onClick={() => speakExplicitly(currentStep?.speech || currentLesson.title)}
                title="Tap owl to hear voice preview"
              >
                <OwlMascot size={54} isSpeaking={isSpeaking} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  "{currentStep?.speech || currentStep?.content || currentLesson.title}"
                </p>
                <button
                  type="button"
                  onClick={() => speakExplicitly(currentStep?.speech || currentLesson.title)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:text-sky-900 mt-2 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Preview narration</span>
                </button>
              </div>
            </div>

            {/* Lesson Breakdown Pills */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 rounded-xl p-2 border border-slate-200/70">
                <div className="flex items-center justify-center text-sky-700 mb-0.5">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <span className="block text-xs font-bold text-slate-800">
                  {currentLesson.steps.length} Steps
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Concept</span>
              </div>

              <div className="bg-slate-50 rounded-xl p-2 border border-slate-200/70">
                <div className="flex items-center justify-center text-amber-600 mb-0.5">
                  <Target className="w-3.5 h-3.5" />
                </div>
                <span className="block text-xs font-bold text-slate-800">
                  {practiceDrills.length} Drills
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Practice</span>
              </div>

              <div className="bg-slate-50 rounded-xl p-2 border border-slate-200/70">
                <div className="flex items-center justify-center text-emerald-600 mb-0.5">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <span className="block text-xs font-bold text-slate-800">
                  ~2 Mins
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Duration</span>
              </div>
            </div>

            {/* Narration Preference Consent Switch */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-2 rounded-xl shrink-0 ${voiceEnabled ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-800 block truncate">
                    Spoken Narration
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {voiceEnabled ? 'Owl reads lesson aloud' : 'Silent mode (off by default)'}
                  </span>
                </div>
              </div>

              {/* Native Switch Toggle */}
              <button
                type="button"
                onClick={toggleVoice}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  voiceEnabled ? 'bg-sky-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    voiceEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Explicit Consent Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  sound.playMove();
                  setIsLessonStarted(true);
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-linear-to-r from-blue-700 to-sky-700 hover:from-blue-800 hover:to-sky-800 text-white font-black text-sm shadow-md shadow-blue-800/25 flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.98] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Lesson {currentLesson.num}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <List className="w-4 h-4 text-slate-500" />
                <span>Browse All 64 Lessons</span>
              </button>
            </div>
          </div>

          {/* Quick Curriculum Explorer (Browse Categories) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Curriculum Categories
              </span>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-xs font-bold text-sky-700 hover:text-sky-900"
              >
                View all &rarr;
              </button>
            </div>

            <div className="space-y-2">
              {LESSON_CATEGORIES.map((cat, catIdx) => {
                const isExpanded = expandedCategoryIdx === catIdx;
                const completedInCat = cat.lessons.filter(l => completedLessons.has(l.num)).length;

                return (
                  <div
                    key={catIdx}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedCategoryIdx(isExpanded ? null : catIdx)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {catIdx + 1}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-800 block truncate">
                            {cat.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {completedInCat}/{cat.lessons.length} completed
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Accordion Lessons list */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 px-3 py-2 space-y-1.5 bg-slate-50/50">
                        {cat.lessons.map(lesson => {
                          const isUnlocked = unlockAll || completedLessons.has(lesson.num) || lesson.num === 1;
                          const isCompleted = completedLessons.has(lesson.num);
                          const isCurrent = lesson.num === currentLesson.num;

                          return (
                            <button
                              key={lesson.num}
                              disabled={!isUnlocked}
                              onClick={() => handleSelectLesson(lesson.num, false)}
                              className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                                isCurrent
                                  ? 'bg-sky-100 text-sky-950 font-bold border border-sky-300'
                                  : isUnlocked
                                  ? 'hover:bg-white text-slate-700'
                                  : 'opacity-50 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                {isCompleted ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                ) : !isUnlocked ? (
                                  <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                ) : (
                                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                                )}
                                <span className="font-bold text-slate-900 w-5 shrink-0">
                                  {lesson.num}.
                                </span>
                                <span className="truncate">{lesson.title}</span>
                              </div>

                              {isCurrent && (
                                <span className="px-1.5 py-0.5 bg-sky-200 text-sky-800 text-[9px] font-black rounded-md shrink-0">
                                  Selected
                                </span>
                              )}
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
        </main>

        {/* 64-Lesson Picker Modal */}
        {renderLessonPickerModal()}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE LESSON BOARD VIEW (isLessonStarted === true)
  // Shows chessboard, owl mascot, steps, drills, and step pagination controls.
  // Back button cleanly exits back to the Lesson Consent Hub.
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#edf3f8] text-slate-800 flex flex-col justify-between selection:bg-sky-200 pb-20 md:pb-6">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#dbeafe] border-b border-sky-200 px-4 py-2.5 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Back Button -> Returns to Lesson Overview Hub and kills speech */}
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
              setIsSpeaking(false);
              setIsLessonStarted(false);
            }}
            className="p-1.5 rounded-full hover:bg-sky-200/70 text-slate-700 transition-colors"
            title="Exit Lesson to Overview Hub"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Lesson Title & Number */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1 rounded-xl hover:bg-sky-200/50 transition-colors cursor-pointer group"
          >
            <GraduationCap className="w-5 h-5 text-sky-800 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-sky-950 text-base md:text-lg">
              Lesson {currentLesson.num}/64
            </span>
          </button>

          {/* Right Action Icons (Chapter List, Voice, Music) */}
          <div className="flex items-center gap-1.5 md:gap-2">
            {/* Choose Lesson Modal Trigger */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 rounded-xl text-slate-700 hover:text-sky-900 hover:bg-sky-200/70 transition-colors"
              title="Choose a lesson"
            >
              <List className="w-5 h-5" />
            </button>

            {/* Text-To-Speech Voice Narration Toggle */}
            <button
              onClick={toggleVoice}
              className={`p-2 rounded-xl transition-all ${
                voiceEnabled
                  ? 'bg-sky-500 text-white shadow-sm ring-2 ring-sky-300'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-sky-200/60'
              }`}
              title={voiceEnabled ? 'Voice Narration: ON (Tap to mute)' : 'Voice Narration: OFF (Tap to speak)'}
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Light Ambient Background Music Toggle */}
            <button
              onClick={toggleMusic}
              className={`p-2 rounded-xl transition-all ${
                musicEnabled
                  ? 'bg-amber-400 text-amber-950 shadow-sm ring-2 ring-amber-300 animate-pulse'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-sky-200/60'
              }`}
              title={musicEnabled ? 'Ambient Music: ON (Tap to mute)' : 'Ambient Music: OFF (Tap to play)'}
            >
              <Music className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Subtitle Header & Lesson / Practice Switcher */}
      <div className="w-full text-center pt-3 pb-1 px-4 space-y-2">
        <h2 className="text-base md:text-lg font-semibold text-slate-700">
          {currentLesson.title}
        </h2>

        {/* Mode Switcher: [ 📖 Lesson ]  [ 🎯 Practice ] */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => {
              setActiveMode('lesson');
              setSuccessSquares([]);
              setErrorSquares([]);
              setPracticeFeedback(null);
              sound.playMove();
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'lesson'
                ? 'bg-sky-700 text-white shadow-sm ring-1 ring-sky-800'
                : 'bg-white/90 text-slate-700 hover:bg-white border border-slate-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Lesson</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('practice');
              setSuccessSquares([]);
              setErrorSquares([]);
              setPracticeFeedback(null);
              sound.playMove();
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'practice'
                ? 'bg-amber-500 text-slate-950 shadow-sm ring-1 ring-amber-600'
                : 'bg-white/90 text-slate-700 hover:bg-white border border-slate-300'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Practice</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-400/30 text-amber-950 font-bold">
              {practiceDrills.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-1 flex flex-col justify-around items-center gap-3">
        {/* Owl Mascot & Speech Bubble */}
        <div className="w-full flex items-start gap-3 md:gap-4 max-w-[500px]">
          <div
            className="shrink-0 pt-1 cursor-pointer"
            onClick={() => {
              const textToSpeak = activeMode === 'lesson'
                ? (currentStep?.speech || currentStep?.content || currentLesson.title)
                : (practiceFeedback || currentPractice?.prompt || 'Your turn!');
              speakExplicitly(textToSpeak);
            }}
            title="Tap owl to speak"
          >
            <OwlMascot size={64} isSpeaking={isSpeaking} />
          </div>

          <div className="relative flex-1 bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-200 text-slate-800 text-sm md:text-base leading-relaxed">
            <div className="absolute top-5 -left-2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white border-b-8 border-b-transparent drop-shadow-xs" />

            {activeMode === 'lesson' ? (
              <p>{currentStep?.speech || currentStep?.content}</p>
            ) : (
              <div>
                <p className="font-semibold text-sky-950">
                  {practiceFeedback || currentPractice?.prompt || "Your turn! Tap the correct square."}
                </p>
                {practiceFeedback === "Well done!" && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold mt-1">
                    <Check className="w-3.5 h-3.5" /> Correct! Moving to next drill...
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Completion Announcement Banner */}
        {showCompletionBanner && (
          <div className="w-full max-w-[500px] p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-emerald-800 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-emerald-600 animate-spin" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  {activeMode === 'practice' ? 'Practice Complete!' : 'Lesson Complete!'}
                </p>
                <p className="text-sm font-semibold">
                  {activeMode === 'practice'
                    ? `Mastered all drills for ${currentLesson.title}!`
                    : `Great job on ${currentLesson.title}! Ready for practice?`}
                </p>
              </div>
            </div>
            {activeMode === 'lesson' ? (
              <button
                onClick={() => {
                  setActiveMode('practice');
                  setPracticeStepIdx(0);
                  setShowCompletionBanner(false);
                  sound.playMove();
                }}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-sm transition-all transform active:scale-95 cursor-pointer"
              >
                Practice Drills 🎯 &rarr;
              </button>
            ) : selectedLessonIdx < lessons.length - 1 ? (
              <button
                onClick={handleAdvanceToNextLesson}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all transform active:scale-95 cursor-pointer"
              >
                Next Lesson &rarr;
              </button>
            ) : null}
          </div>
        )}

        {/* Chessboard */}
        <div className="w-full flex justify-center items-center my-1.5 shrink-0">
          <div
            className="flex justify-center items-center shadow-2xl rounded-2xl overflow-hidden"
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
              boardTheme="cappuccino"
              highlightSquares={activeMode === 'lesson' ? (currentStep?.highlightSquares || []) : (currentPractice?.highlightSquares || [])}
              successSquares={successSquares}
              errorSquares={errorSquares}
              showCoordinates={true}
            />
          </div>
        </div>
      </main>

      {/* Bottom Step Navigation Bar */}
      <footer className="w-full py-3 px-4 bg-transparent">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          {/* Previous Step Button */}
          <button
            onClick={activeMode === 'lesson' ? handlePrevStep : handlePrevPractice}
            disabled={activeMode === 'lesson' ? currentStepIdx === 0 : practiceStepIdx === 0}
            className="w-11 h-11 rounded-full bg-slate-200/90 hover:bg-slate-300 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-slate-700 shadow-xs transition-all active:scale-90 cursor-pointer"
            title="Previous Step"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Pagination Step Dots */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 px-2 no-scrollbar">
            {activeMode === 'lesson' ? (
              currentLesson.steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentStepIdx(idx);
                    sound.playMove();
                  }}
                  className={`transition-all duration-200 rounded-full cursor-pointer ${
                    currentStepIdx === idx
                      ? 'w-2.5 h-2.5 bg-[#1e40af] scale-125 shadow-xs'
                      : 'w-2 h-2 bg-sky-300/80 hover:bg-sky-400'
                  }`}
                  title={`Go to step ${idx + 1}`}
                />
              ))
            ) : (
              practiceDrills.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPracticeStepIdx(idx);
                    setSuccessSquares([]);
                    setErrorSquares([]);
                    setPracticeFeedback(null);
                    sound.playMove();
                  }}
                  className={`transition-all duration-200 rounded-full cursor-pointer ${
                    practiceStepIdx === idx
                      ? 'w-2.5 h-2.5 bg-amber-500 scale-125 shadow-xs'
                      : 'w-2 h-2 bg-amber-300/80 hover:bg-amber-400'
                  }`}
                  title={`Go to practice drill ${idx + 1}`}
                />
              ))
            )}
          </div>

          {/* Next Step Button */}
          <button
            onClick={activeMode === 'lesson' ? handleNextStep : handleNextPractice}
            className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md transition-all active:scale-90 cursor-pointer ${
              activeMode === 'lesson'
                ? 'bg-[#1e40af] hover:bg-blue-800 shadow-blue-900/20'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 font-bold'
            }`}
            title={
              activeMode === 'lesson'
                ? currentStepIdx === currentLesson.steps.length - 1 ? 'Finish Lesson' : 'Next Step'
                : practiceStepIdx === practiceDrills.length - 1 ? 'Finish Practice' : 'Next Drill'
            }
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </footer>

      {/* 64-Lesson Picker Modal */}
      {renderLessonPickerModal()}
    </div>
  );

  // Helper renderer for the 64-lesson picker dialog
  function renderLessonPickerModal() {
    if (!isModalOpen) return null;
    return (
      <div
        onClick={() => setIsModalOpen(false)}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-[#edf2f7] rounded-[28px] max-w-sm sm:max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-300/80 animate-scale-up"
        >
          {/* Modal Header */}
          <div className="px-6 pt-5 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-6 h-6 text-[#1e4a73] stroke-[1.8]" />
              <h3 className="text-[20px] font-semibold text-[#1e4a73] tracking-tight">Choose a lesson</h3>
            </div>

            <button
              onClick={() => {
                const nextVal = !unlockAll;
                setUnlockAll(nextVal);
                safeStorage.setItem('chess_lessons_unlock_all', nextVal.toString());
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                unlockAll
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-800'
                  : 'bg-slate-200 border-slate-300 text-slate-600'
              }`}
              title={unlockAll ? 'Free mode: all lessons open' : 'Sequential mode: complete lessons in order'}
            >
              {unlockAll ? <LockOpen className="w-3 h-3 text-amber-700" /> : <Lock className="w-3 h-3 text-slate-500" />}
              <span>{unlockAll ? 'All Open' : 'Sequential'}</span>
            </button>
          </div>

          {/* Scrollable Lesson List by Category */}
          <div className="flex-1 overflow-y-auto px-5 py-2 space-y-4">
            {LESSON_CATEGORIES.map((cat, catIdx) => {
              const isEmerald = catIdx < 2 || cat.color === 'emerald';
              const bottomBorderClass = isEmerald ? 'border-b-[3.5px] border-[#22c55e]' : 'border-b-[3.5px] border-[#f59e0b]';

              return (
                <div key={catIdx} className="space-y-2">
                  <h4 className="text-[15px] font-semibold text-[#1e4a73] px-1 pt-1">
                    {cat.name}
                  </h4>

                  <div className="space-y-2.5">
                    {cat.lessons.map((lesson) => {
                      const isUnlocked = unlockAll || completedLessons.has(lesson.num) || lesson.num === 1;
                      const isCompleted = completedLessons.has(lesson.num);
                      const isCurrent = lesson.num === currentLesson.num;

                      return (
                        <button
                          key={lesson.num}
                          disabled={!isUnlocked}
                          onClick={() => handleSelectLesson(lesson.num, isLessonStarted)}
                          className={`w-full bg-white rounded-xl shadow-[0_2px_6px_rgba(0,0,0,0.06)] hover:shadow-md px-4 py-3 flex items-center transition-all text-left active:scale-[0.99] cursor-pointer select-none ${bottomBorderClass} ${
                            isCurrent
                              ? 'ring-2 ring-sky-500/40 bg-sky-50/50'
                              : isUnlocked
                              ? 'hover:bg-slate-50'
                              : 'opacity-70 bg-slate-50/60 cursor-not-allowed'
                          }`}
                        >
                          {!isUnlocked ? (
                            <Lock className="w-[18px] h-[18px] text-slate-400 stroke-[1.8] mr-3 shrink-0" />
                          ) : isCompleted ? (
                            <span className="w-[18px] mr-3 shrink-0 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 stroke-[2.2]" />
                            </span>
                          ) : (
                            <span className="w-[18px] mr-3 shrink-0" />
                          )}

                          <span className="text-[#1d6394] font-bold text-base w-7 shrink-0">
                            {lesson.num}
                          </span>

                          <span className="text-slate-800 font-medium text-[15px] leading-tight truncate">
                            {lesson.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3.5 flex items-center justify-end bg-transparent">
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-[#1e4a73] font-semibold text-sm hover:text-sky-950 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
}
