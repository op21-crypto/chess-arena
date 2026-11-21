import React, { useState } from 'react';
import { Shield, Sparkles, Check, Lock, AlertCircle, X, Award } from 'lucide-react';
import { STARTING_ELO_OPTIONS } from '../utils/elo.js';
import { triggerHaptic } from '../utils/device.js';
import { sound } from '../utils/audio.js';

export function EloSelectionModal({
  isOpen,
  onClose,
  onSelectElo,
  isLight = false
}) {
  const [selectedElo, setSelectedElo] = useState(1200);
  const [confirmStep, setConfirmStep] = useState(false);

  if (!isOpen) return null;

  const handleSelect = (elo) => {
    sound.playClick();
    triggerHaptic('move');
    setSelectedElo(elo);
  };

  const handleProceed = () => {
    sound.playClick();
    triggerHaptic('move');
    setConfirmStep(true);
  };

  const handleFinalConfirm = () => {
    triggerHaptic('success');
    sound.playGameEnd('win');
    onSelectElo(selectedElo);
    onClose();
  };

  const currentOption = STARTING_ELO_OPTIONS.find(o => o.elo === selectedElo) || STARTING_ELO_OPTIONS[1];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className={`border rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative transition-colors ${
        isLight
          ? 'bg-white border-amber-300 text-slate-900'
          : 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-amber-500/30 text-white'
      }`}>
        {/* Close Button */}
        {!confirmStep && (
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors cursor-pointer ${
              isLight ? 'text-slate-400 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {!confirmStep ? (
          <div className="space-y-4">
            {/* Header */}
            <div className="text-center space-y-1.5 pt-1">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30 shadow-lg text-2xl">
                ⚡
              </div>
              <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
                Choose Starting Rating
              </h3>
              <p className={`text-xs font-semibold max-w-xs mx-auto ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Select your starting chess skill tier. Once confirmed, this selection is <span className="text-amber-500 font-bold">permanent</span> and will dynamically adjust with every match you win or lose.
              </p>
            </div>

            {/* 5 Starting Options */}
            <div className="space-y-2 pt-1 max-h-[52vh] overflow-y-auto pr-1">
              {STARTING_ELO_OPTIONS.map((opt) => {
                const isSelected = selectedElo === opt.elo;
                return (
                  <div
                    key={opt.elo}
                    onClick={() => handleSelect(opt.elo)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? isLight
                          ? 'bg-amber-100/80 border-amber-500 shadow-md ring-2 ring-amber-400/50 scale-[1.01]'
                          : 'bg-amber-500/15 border-amber-400 shadow-md ring-2 ring-amber-400/40 scale-[1.01]'
                        : isLight
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        : 'bg-slate-950/70 hover:bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl shrink-0">{opt.icon}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>
                            {opt.elo} Elo
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${opt.badgeClass}`}>
                            {opt.label}
                          </span>
                        </div>
                        <p className={`text-[11px] font-medium leading-tight mt-0.5 ${
                          isLight ? 'text-slate-600' : 'text-slate-400'
                        }`}>
                          {opt.desc}
                        </p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-amber-500 border-amber-500 text-slate-950'
                        : isLight
                        ? 'border-slate-300 bg-white'
                        : 'border-slate-700 bg-slate-900'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Permanent Warning */}
            <div className={`p-2.5 rounded-xl border flex items-start gap-2 text-[11px] ${
              isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <span>
                <strong>Permanent Lock:</strong> You can only select this once. Your rating will rise when you win and drop when you lose.
              </span>
            </div>

            {/* Next / Proceed Button */}
            <button
              type="button"
              onClick={handleProceed}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Continue with {selectedElo} Elo</span>
              <Sparkles className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Step 2: Confirmation */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 text-amber-500 border-2 border-amber-500/40 text-3xl shadow-xl">
                <Lock className="w-8 h-8 text-amber-500" />
              </div>

              <h3 className={`text-xl font-black tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
                Lock {currentOption.elo} Elo as Starting Rating?
              </h3>

              <div className={`p-4 rounded-2xl border text-center space-y-1.5 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
              }`}>
                <div className="text-3xl">{currentOption.icon}</div>
                <div className={`text-lg font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>
                  {currentOption.elo} Elo • {currentOption.title}
                </div>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {currentOption.desc}
                </p>
              </div>

              <p className={`text-xs font-semibold px-2 ${isLight ? 'text-rose-700' : 'text-rose-400'}`}>
                ⚠️ This decision is permanent. You will not be able to reset or re-select this starting tier.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmStep(false)}
                className={`flex-1 py-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleFinalConfirm}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Lock Rating Permanently</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
