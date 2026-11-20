import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  RotateCcw,
  Check
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

  // Mode: 'lesson' | 'practice'
  const [activeMode, setActiveMode] = useState('lesson');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [practiceStepIdx, setPracticeStepIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Audio toggles (persisted in safeStorage)
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    const saved = safeStorage.getItem('chess_lesson_voice');
    return saved === null ? true : saved === 'true';
  });
  const [musicEnabled, setMusicEnabled] = useState(() => {
    const saved = safeStorage.getItem('chess_lesson_music');
    return saved === 'true';
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(musicEngine.isPlaying);

  // Interactive practice states
  const [successSquares, setSuccessSquares] = useState([]);
  const [errorSquares, setErrorSquares] = useState([]);
  const [practiceFeedback, setPracticeFeedback] = useState(null);
  const [practiceComplete, setPracticeComplete] = useState(false);

  const [unlockAll, setUnlockAll] = useState(() => {
    const saved = safeStorage.getItem('chess_lessons_unlock_all');
    return saved === null ? true : saved === 'true';
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

  // Interactive Practice Drills for this lesson
  const practiceDrills = useMemo(() => {
    return getPracticeDrills(currentLesson);
  }, [currentLesson]);

  const currentPractice = practiceDrills[practiceStepIdx] || practiceDrills[0];

  // Save current lesson index
  useEffect(() => {
    safeStorage.setItem('chess_current_lesson_idx', selectedLessonIdx.toString());
  }, [selectedLessonIdx]);

  // Save completed lessons
  useEffect(() => {
    safeStorage.setItem('chess_completed_lessons', JSON.stringify([...completedLessons]));
  }, [completedLessons]);

  // Text-To-Speech Narrator for Owl
  const speakText = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
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

  // Auto-speak on step or mode changes when voice is enabled
  useEffect(() => {
    if (!voiceEnabled) return;
    const textToSpeak = activeMode === 'lesson'
      ? (currentStep?.speech || currentStep?.content || currentLesson.title)
      : (practiceFeedback || currentPractice?.prompt || 'Your turn!');

    speakText(textToSpeak);
  }, [currentStepIdx, practiceStepIdx, activeMode, selectedLessonIdx]);

  // Keyboard navigation
  useEffect(() => {
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
  }, [isModalOpen, currentStepIdx, practiceStepIdx, activeMode, selectedLessonIdx]);

  // Toggle Voice Narration ON/OFF
  const toggleVoice = () => {
    const nextVal = !voiceEnabled;
    setVoiceEnabled(nextVal);
    safeStorage.setItem('chess_lesson_voice', nextVal.toString());

    if (nextVal) {
      const textToSpeak = activeMode === 'lesson'
        ? (currentStep?.speech || currentStep?.content || currentLesson.title)
        : (currentPractice?.prompt || 'Your turn!');
      speakText(textToSpeak);
    } else {
      if ('speechSynthesis' in window) {
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
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    if (currentLesson && currentStepIdx < currentLesson.steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      sound.playMove();
    } else {
      // Completed last lesson step -> offer to jump to practice
      sound.playVictory();
      setCompletedLessons(prev => new Set([...prev, currentLesson.num]));
      setShowCompletionBanner(true);
    }
  };

  const handlePrevStep = () => {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
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

      // Advance to next practice after brief celebration
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

  const handleSelectLesson = (lessonNum) => {
    const idx = lessons.findIndex(l => l.num === lessonNum);
    if (idx !== -1) {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
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
      sound.playMove();
    }
  };

  const handleAdvanceToNextLesson = () => {
    setShowCompletionBanner(false);
    if (selectedLessonIdx < lessons.length - 1) {
      handleSelectLesson(lessons[selectedLessonIdx + 1].num);
    }
  };

  return (
    <div className="min-h-screen bg-[#edf3f8] text-slate-800 flex flex-col justify-between selection:bg-sky-200">
      {/* Top Navigation Bar (matching screenshots) */}
      <header className="sticky top-0 z-30 bg-[#dbeafe] border-b border-sky-200 px-4 py-2.5 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Back Button */}
          <button
            onClick={() => {
              if (onBack) onBack();
            }}
            className="p-1.5 rounded-full hover:bg-sky-200/70 text-slate-700 transition-colors"
            title="Go Back"
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
            {/* 1. Choose Lesson Modal Trigger (:= icon) */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 rounded-xl text-slate-700 hover:text-sky-900 hover:bg-sky-200/70 transition-colors"
              title="Choose a lesson"
            >
              <List className="w-5 h-5" />
            </button>

            {/* 2. Text-To-Speech Voice Narration Toggle (🗣️ / Volume) */}
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

            {/* 3. Light Ambient Background Music Toggle (🎵 icon) */}
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

        {/* Clean Mode Switcher: [ 📖 Lesson ]  [ 🎯 Practice ] */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => {
              setActiveMode('lesson');
              setSuccessSquares([]);
              setErrorSquares([]);
              setPracticeFeedback(null);
              sound.playMove();
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
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
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
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
          {/* Owl Mascot */}
          <div
            className="shrink-0 pt-1 cursor-pointer"
            onClick={() => {
              const textToSpeak = activeMode === 'lesson'
                ? (currentStep?.speech || currentStep?.content || currentLesson.title)
                : (practiceFeedback || currentPractice?.prompt || 'Your turn!');
              speakText(textToSpeak);
            }}
            title="Tap owl to hear voice"
          >
            <OwlMascot size={64} isSpeaking={isSpeaking} />
          </div>

          {/* Speech Bubble */}
          <div className="relative flex-1 bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-200 text-slate-800 text-sm md:text-base leading-relaxed">
            {/* Arrow pointer */}
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
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-sm transition-all transform active:scale-95"
              >
                Practice Drills 🎯 &rarr;
              </button>
            ) : selectedLessonIdx < lessons.length - 1 ? (
              <button
                onClick={handleAdvanceToNextLesson}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all transform active:scale-95"
              >
                Next Lesson &rarr;
              </button>
            ) : null}
          </div>
        )}

        {/* The Chessboard (Properly bounded so it never collapses to a dot) */}
        <div className="w-full max-w-[min(100vw-32px,440px)] aspect-square flex items-center justify-center my-1">
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
      </main>

      {/* Bottom Step Navigation Bar (matching screenshots) */}
      <footer className="w-full py-3 px-4 bg-transparent">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          {/* Previous Step Button */}
          <button
            onClick={activeMode === 'lesson' ? handlePrevStep : handlePrevPractice}
            disabled={activeMode === 'lesson' ? currentStepIdx === 0 : practiceStepIdx === 0}
            className="w-11 h-11 rounded-full bg-slate-200/90 hover:bg-slate-300 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-slate-700 shadow-xs transition-all active:scale-90"
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
                  className={`transition-all duration-200 rounded-full ${
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
                  className={`transition-all duration-200 rounded-full ${
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
            className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md transition-all active:scale-90 ${
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

      {/* "Choose a lesson" Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-[#f0f4f9] rounded-[28px] max-w-md w-full max-h-[88vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 pt-5 pb-3 border-b border-slate-200/80 flex items-center justify-between bg-white/70 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-6 h-6 text-sky-800" />
                <h3 className="text-xl font-bold text-slate-800">Choose a lesson</h3>
              </div>

              {/* Progress & Free Mode Toggle */}
              <button
                onClick={() => {
                  const nextVal = !unlockAll;
                  setUnlockAll(nextVal);
                  safeStorage.setItem('chess_lessons_unlock_all', nextVal.toString());
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  unlockAll
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-800'
                    : 'bg-slate-200 border-slate-300 text-slate-600'
                }`}
                title={unlockAll ? 'Free mode active: all lessons open' : 'Sequential mode: complete lessons in order'}
              >
                {unlockAll ? <LockOpen className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{unlockAll ? 'All Open' : 'Sequential'}</span>
              </button>
            </div>

            {/* Scrollable Lesson List by Category */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
              {LESSON_CATEGORIES.map((cat, catIdx) => (
                <div key={catIdx} className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
                    {cat.name}
                  </h4>

                  <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 divide-y divide-slate-100 overflow-hidden">
                    {cat.lessons.map((lesson) => {
                      const isUnlocked = unlockAll || completedLessons.has(lesson.num) || lesson.num === 1;
                      const isCompleted = completedLessons.has(lesson.num);
                      const isCurrent = lesson.num === currentLesson.num;

                      return (
                        <button
                          key={lesson.num}
                          disabled={!isUnlocked}
                          onClick={() => handleSelectLesson(lesson.num)}
                          className={`w-full px-4 py-3 flex items-center justify-between transition-colors text-left ${
                            isCurrent
                              ? 'bg-sky-50 text-sky-900 font-semibold'
                              : isUnlocked
                              ? 'hover:bg-slate-50 text-slate-700'
                              : 'opacity-40 cursor-not-allowed bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 text-xs font-bold text-slate-400">
                              {lesson.num}.
                            </span>
                            <span className="text-sm font-medium">
                              {lesson.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isCompleted && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            )}
                            {!isUnlocked && (
                              <Lock className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white/70 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {completedLessons.size} of 64 completed
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
