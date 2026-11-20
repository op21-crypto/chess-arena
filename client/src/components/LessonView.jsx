import React, { useState, useEffect, useRef } from 'react';
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
  Award,
  Sparkles,
  Unlock,
  RotateCcw
} from 'lucide-react';
import { ALL_LESSONS, LESSON_CATEGORIES } from '../data/lessonsData.js';
import { sound } from '../utils/audio.js';
import { musicEngine } from '../utils/music.js';
import { safeStorage } from '../utils/storage.js';

export function LessonView({ onBack }) {
  const [lessons] = useState(ALL_LESSONS);
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(() => {
    const saved = safeStorage.getItem('chess_current_lesson_idx');
    return saved !== null ? parseInt(saved, 10) : 0;
  });
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unlockAll, setUnlockAll] = useState(() => {
    const saved = safeStorage.getItem('chess_lessons_unlock_all');
    return saved === null ? true : saved === 'true'; // Default true for flexible learning
  });
  const [completedLessons, setCompletedLessons] = useState(() => {
    try {
      const saved = safeStorage.getItem('chess_completed_lessons');
      return saved ? new Set(JSON.parse(saved)) : new Set([1]);
    } catch {
      return new Set([1]);
    }
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [showCompletionBanner, setShowCompletionBanner] = useState(false);

  const currentLesson = lessons[selectedLessonIdx] || lessons[0];
  const currentStep = currentLesson?.steps?.[currentStepIdx] || currentLesson?.steps?.[0];

  // Save current lesson index to storage
  useEffect(() => {
    safeStorage.setItem('chess_current_lesson_idx', selectedLessonIdx.toString());
  }, [selectedLessonIdx]);

  // Save completed lessons
  useEffect(() => {
    safeStorage.setItem('chess_completed_lessons', JSON.stringify([...completedLessons]));
  }, [completedLessons]);

  // Sync music state
  useEffect(() => {
    setIsMusicPlaying(musicEngine.isPlaying);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isModalOpen) {
        if (e.key === 'Escape') setIsModalOpen(false);
        return;
      }
      if (e.key === 'ArrowRight') {
        handleNextStep();
      } else if (e.key === 'ArrowLeft') {
        handlePrevStep();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, currentStepIdx, selectedLessonIdx]);

  // Handle Text-To-Speech for Owl
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech Synthesis is not supported in this browser environment.');
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = currentStep?.speech || currentStep?.content || currentLesson.title;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Handle ambient background music toggle
  const toggleMusic = () => {
    if (musicEngine.isPlaying) {
      musicEngine.stop();
      setIsMusicPlaying(false);
    } else {
      musicEngine.start();
      setIsMusicPlaying(true);
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
      // Completed last step of lesson!
      sound.playVictory();
      setCompletedLessons(prev => new Set([...prev, currentLesson.num, currentLesson.num + 1]));
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

  const handleSelectLesson = (lessonNum) => {
    const idx = lessons.findIndex(l => l.num === lessonNum);
    if (idx !== -1) {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      setSelectedLessonIdx(idx);
      setCurrentStepIdx(0);
      setIsModalOpen(false);
      setShowCompletionBanner(false);
      sound.playMove();
    }
  };

  const handleAdvanceToNextLesson = () => {
    setShowCompletionBanner(false);
    if (selectedLessonIdx < lessons.length - 1) {
      setSelectedLessonIdx(prev => prev + 1);
      setCurrentStepIdx(0);
      sound.playMove();
    }
  };

  const getBorderColorClass = (color) => {
    switch (color) {
      case 'emerald':
        return 'border-b-4 border-emerald-500';
      case 'rose':
        return 'border-b-4 border-rose-500';
      case 'orange':
        return 'border-b-4 border-orange-500';
      case 'amber':
      default:
        return 'border-b-4 border-amber-400';
    }
  };

  if (!currentLesson || !currentStep) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400">
        Loading lessons...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#edf3f8] text-slate-800 flex flex-col justify-between selection:bg-sky-200">
      {/* Top Navigation Bar (matching Image 8) */}
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

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 md:gap-2">
            {/* Choose Lesson Modal Trigger */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 rounded-xl text-slate-700 hover:text-sky-900 hover:bg-sky-200/70 transition-colors"
              title="Choose a lesson"
            >
              <List className="w-5 h-5" />
            </button>

            {/* Text-To-Speech Speaker */}
            <button
              onClick={toggleSpeech}
              className={`p-2 rounded-xl transition-all ${
                isSpeaking
                  ? 'bg-sky-400 text-sky-950 shadow-sm animate-pulse'
                  : 'text-slate-700 hover:text-sky-900 hover:bg-sky-200/70'
              }`}
              title={isSpeaking ? 'Mute voice' : 'Listen to lesson'}
            >
              <Volume2 className="w-5 h-5" />
            </button>

            {/* Ambient Background Music */}
            <button
              onClick={toggleMusic}
              className={`p-2 rounded-xl transition-all ${
                isMusicPlaying
                  ? 'bg-amber-400/90 text-amber-950 shadow-sm'
                  : 'text-slate-700 hover:text-sky-900 hover:bg-sky-200/70'
              }`}
              title={isMusicPlaying ? 'Stop music' : 'Play ambient music'}
            >
              <Music className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Subtitle Header */}
      <div className="w-full text-center pt-3 pb-1 px-4">
        <h2 className="text-base md:text-lg font-semibold text-slate-700">
          {currentLesson.title}
        </h2>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-2 flex flex-col justify-around items-center gap-4">
        {/* Owl Mascot & Speech Bubble */}
        <div className="w-full flex items-start gap-3 md:gap-4 max-w-[500px]">
          {/* Owl Mascot */}
          <div className="shrink-0 pt-1 cursor-pointer" onClick={toggleSpeech} title="Tap owl to hear voice">
            <OwlMascot size={64} isSpeaking={isSpeaking} />
          </div>

          {/* Speech Bubble */}
          <div className="relative flex-1 bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-200 text-slate-800 text-sm md:text-base leading-relaxed">
            {/* Speech bubble arrow pointer pointing to owl */}
            <div className="absolute top-5 -left-2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white border-b-8 border-b-transparent drop-shadow-xs" />
            <p>{currentStep.speech || currentStep.content}</p>
          </div>
        </div>

        {/* Completion Announcement Banner */}
        {showCompletionBanner && (
          <div className="w-full max-w-[500px] p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-emerald-800 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-emerald-600 animate-spin" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Lesson Complete!</p>
                <p className="text-sm font-semibold">Great job mastering {currentLesson.title}!</p>
              </div>
            </div>
            {selectedLessonIdx < lessons.length - 1 && (
              <button
                onClick={handleAdvanceToNextLesson}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all transform active:scale-95"
              >
                Next Lesson &rarr;
              </button>
            )}
          </div>
        )}

        {/* The Chessboard */}
        <div className="w-full max-w-[420px] md:max-w-[460px] aspect-square flex items-center justify-center">
          <Chessboard
            fen={currentStep.fen}
            playerColor="w"
            disabled={true}
            boardTheme="cappuccino"
            highlightSquares={currentStep.highlightSquares || []}
            showCoordinates={true}
          />
        </div>
      </main>

      {/* Bottom Step Navigation Bar (matching Image 8) */}
      <footer className="w-full py-3 px-4 bg-transparent">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          {/* Previous Step Button */}
          <button
            onClick={handlePrevStep}
            disabled={currentStepIdx === 0}
            className="w-11 h-11 rounded-full bg-slate-200/80 hover:bg-slate-300 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-slate-700 shadow-xs transition-all active:scale-90"
            title="Previous Step"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Pagination Step Dots */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 px-2 no-scrollbar">
            {currentLesson.steps.map((_, idx) => (
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
            ))}
          </div>

          {/* Next Step Button */}
          <button
            onClick={handleNextStep}
            className="w-11 h-11 rounded-full bg-[#1e40af] hover:bg-blue-800 text-white flex items-center justify-center shadow-md shadow-blue-900/20 transition-all active:scale-90"
            title={currentStepIdx === currentLesson.steps.length - 1 ? 'Finish Lesson' : 'Next Step'}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </footer>

      {/* "Choose a lesson" Modal Dialog (matching Screenshots 1 to 7) */}
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
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  unlockAll
                    ? 'bg-sky-100 text-sky-800 border border-sky-300'
                    : 'bg-slate-200 text-slate-600'
                }`}
                title="Toggle unlocking all lessons"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>{unlockAll ? 'All Unlocked' : 'Progress Mode'}</span>
              </button>
            </div>

            {/* Modal Body: Categorized Lessons List */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-5">
              {LESSON_CATEGORIES.map((cat, catIdx) => (
                <div key={cat.name} className="space-y-2">
                  {/* Category Header (Screenshots 1-7: blue section title) */}
                  <h4 className="text-sky-800 font-semibold text-sm px-1">
                    {cat.name}
                  </h4>

                  {/* Lesson Cards */}
                  <div className="space-y-2.5">
                    {cat.lessons.map(lesson => {
                      const isCompleted = completedLessons.has(lesson.num);
                      const isUnlocked = unlockAll || isCompleted || lesson.num === 1 || completedLessons.has(lesson.num - 1);
                      const isCurrent = currentLesson.num === lesson.num;
                      const cardColor = lesson.color || cat.color;

                      return (
                        <div
                          key={lesson.num}
                          onClick={() => {
                            if (isUnlocked) {
                              handleSelectLesson(lesson.num);
                            }
                          }}
                          className={`bg-white rounded-2xl shadow-xs p-3.5 flex items-center gap-3 transition-all ${
                            getBorderColorClass(cardColor)
                          } ${
                            isUnlocked
                              ? 'cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99]'
                              : 'opacity-65 cursor-not-allowed'
                          } ${isCurrent ? 'ring-2 ring-sky-500/50 bg-sky-50/40' : ''}`}
                        >
                          {/* Lock / Check Icon */}
                          <div className="w-6 flex items-center justify-center shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : isUnlocked ? (
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            ) : (
                              <Lock className="w-5 h-5 text-slate-400" />
                            )}
                          </div>

                          {/* Lesson Number */}
                          <span className="text-sky-600 font-bold text-base min-w-[28px] text-right">
                            {lesson.num}
                          </span>

                          {/* Lesson Title */}
                          <span className="text-slate-800 font-medium text-sm flex-1 truncate">
                            {lesson.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer: Cancel Button */}
            <div className="p-3 border-t border-slate-200/80 bg-white/70 text-center">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-2 text-sky-800 hover:text-sky-950 font-semibold text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
