import React, { useState, useEffect } from 'react';
import { Chessboard } from './Chessboard.jsx';
import { BookOpen, ChevronRight, ChevronLeft, Award, Sparkles } from 'lucide-react';
import { CHESS_LESSONS as DEFAULT_LESSONS } from '../data/puzzleData.js';

export function LessonView() {
  const [lessons, setLessons] = useState(DEFAULT_LESSONS);
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(0);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  useEffect(() => {
    fetch('/api/lessons')
      .then(res => res.json())
      .then(data => {
        if (data.lessons) {
          setLessons(data.lessons);
        }
      })
      .catch(() => {
        setLessons(DEFAULT_LESSONS);
      });
  }, []);

  const currentLesson = lessons[selectedLessonIdx];
  const currentStep = currentLesson?.steps?.[currentStepIdx];

  const handleNextStep = () => {
    if (currentLesson && currentStepIdx < currentLesson.steps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  if (!currentLesson || !currentStep) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        Loading lessons...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {lessons.map((lesson, idx) => (
          <button
            key={lesson.id}
            onClick={() => {
              setSelectedLessonIdx(idx);
              setCurrentStepIdx(0);
            }}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              selectedLessonIdx === idx
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {lesson.title}
          </button>
        ))}
      </div>

      {/* Main Lesson Body */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Interactive Board */}
        <div className="md:col-span-7 flex justify-center">
          <div className="w-full max-w-[460px]">
            <Chessboard
              fen={currentStep.fen}
              playerColor="w"
              disabled={true}
            />
          </div>
        </div>

        {/* Step Content & Controls */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                {currentLesson.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Step {currentStepIdx + 1} of {currentLesson.steps.length}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-2">{currentStep.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{currentStep.content}</p>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={handlePrevStep}
                disabled={currentStepIdx === 0}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleNextStep}
                disabled={currentStepIdx === currentLesson.steps.length - 1}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-slate-950 rounded-xl text-xs font-bold transition-colors shadow-lg shadow-amber-500/10"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
