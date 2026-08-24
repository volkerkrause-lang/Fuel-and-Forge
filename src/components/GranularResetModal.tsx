import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { MealSlot } from '../types';

interface GranularResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetMealSlot: (slot: MealSlot) => void;
  onResetTodayFood: () => void;
  onResetTodayWater: () => void;
  onResetTodayWorkout: () => void;
  onResetRoutineToDefault: () => void;
  onResetNutritionTargets: () => void;
  onFullFactoryReset: () => void;
}

export const GranularResetModal: React.FC<GranularResetModalProps> = ({
  isOpen,
  onClose,
  onResetMealSlot,
  onResetTodayFood,
  onResetTodayWater,
  onResetTodayWorkout,
  onResetRoutineToDefault,
  onResetNutritionTargets,
  onFullFactoryReset,
}) => {
  const [actionDoneMsg, setActionDoneMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setActionDoneMsg(msg);
    setTimeout(() => setActionDoneMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-lg card-bg border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#221c0e] text-[#d4af37] flex items-center justify-center border border-[#d4af37]/30">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="serif font-bold text-sm text-white uppercase tracking-wider">Granular Reset Control</h3>
              <p className="text-[11px] font-mono text-gray-400">Targeted isolation preserving peripheral data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#181818] text-gray-400 hover:text-white flex items-center justify-center border border-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Message */}
        {actionDoneMsg && (
          <div className="mx-4 mt-3 p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionDoneMsg}</span>
          </div>
        )}

        {/* Reset Actions List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 text-xs">
          {/* 1. Single Meal Reset */}
          <div className="bg-[#181818] p-3.5 rounded-lg border border-white/5 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="serif font-semibold text-gray-100 uppercase tracking-wider text-[11px]">Clear Meal Slot Today</h4>
                <p className="text-[11px] text-gray-400 font-sans">
                  Clears selected slot for current day. Other meals and custom foods remain intact.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealSlot[]).map((slot) => (
                <button
                  key={slot}
                  onClick={() => {
                    onResetMealSlot(slot);
                    showFeedback(`Today's ${slot} cleared.`);
                  }}
                  className="py-1.5 px-2 rounded-lg bg-[#0a0a0a] hover:bg-[#242424] border border-white/10 text-gray-300 hover:text-white capitalize font-mono text-xs transition-colors"
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Today Food Diary Reset */}
          <div className="bg-[#181818] p-3.5 rounded-lg border border-white/5 flex items-center justify-between">
            <div>
              <h4 className="serif font-semibold text-gray-100 uppercase tracking-wider text-[11px]">Clear Daily Fuel Diary</h4>
              <p className="text-[11px] text-gray-400 font-sans">
                Safe: Custom recipes and other historical days untouched.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm("Reset today's food log?")) {
                  onResetTodayFood();
                  showFeedback("Today's food diary reset.");
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-[#221c0e] hover:bg-[#332a15] text-[#d4af37] font-bold border border-[#d4af37]/40 text-xs shrink-0 uppercase tracking-wider font-mono"
            >
              Reset Diary
            </button>
          </div>

          {/* 3. Today Water Reset */}
          <div className="bg-[#181818] p-3.5 rounded-lg border border-white/5 flex items-center justify-between">
            <div>
              <h4 className="serif font-semibold text-gray-100 uppercase tracking-wider text-[11px]">Clear Hydration Log</h4>
              <p className="text-[11px] text-gray-400 font-sans">
                Safe: Target parameters & previous history remain preserved.
              </p>
            </div>
            <button
              onClick={() => {
                onResetTodayWater();
                showFeedback("Today's water log cleared.");
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-300 font-bold border border-cyan-500/30 text-xs shrink-0 uppercase tracking-wider font-mono"
            >
              Reset Water
            </button>
          </div>

          {/* 4. Today Workout Reset */}
          <div className="bg-[#181818] p-3.5 rounded-lg border border-white/5 flex items-center justify-between">
            <div>
              <h4 className="serif font-semibold text-gray-100 uppercase tracking-wider text-[11px]">Clear Active Session</h4>
              <p className="text-[11px] text-gray-400 font-sans">
                Safe: Master exercise routine & logged history unchanged.
              </p>
            </div>
            <button
              onClick={() => {
                onResetTodayWorkout();
                showFeedback("Today's workout session cleared.");
              }}
              className="px-3 py-1.5 rounded-lg bg-[#221c0e] hover:bg-[#332a15] text-[#d4af37] font-bold border border-[#d4af37]/40 text-xs shrink-0 uppercase tracking-wider font-mono"
            >
              Reset Session
            </button>
          </div>

          {/* 5. Master Routine Reset */}
          <div className="bg-[#181818] p-3.5 rounded-lg border border-white/5 flex items-center justify-between">
            <div>
              <h4 className="serif font-semibold text-gray-100 uppercase tracking-wider text-[11px]">Restore 9-Movement Routine</h4>
              <p className="text-[11px] text-gray-400 font-sans">
                Restores standard baseline resistance, assistance, reps & sets.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Restore default master routine template?')) {
                  onResetRoutineToDefault();
                  showFeedback('Master routine restored to defaults.');
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2e2e2e] text-gray-300 font-medium border border-white/10 text-xs shrink-0 font-mono"
            >
              Restore Routine
            </button>
          </div>

          {/* 6. Targets Auto Reset */}
          <div className="bg-[#181818] p-3.5 rounded-lg border border-white/5 flex items-center justify-between">
            <div>
              <h4 className="serif font-semibold text-gray-100 uppercase tracking-wider text-[11px]">Recalculate Energy Targets</h4>
              <p className="text-[11px] text-gray-400 font-sans">
                Applies Mifflin-St Jeor formula to latest recorded weight.
              </p>
            </div>
            <button
              onClick={() => {
                onResetNutritionTargets();
                showFeedback('Targets recalculated.');
              }}
              className="px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2e2e2e] text-gray-300 font-medium border border-white/10 text-xs shrink-0 font-mono"
            >
              Recalculate
            </button>
          </div>

          {/* 7. Factory Reset */}
          <div className="bg-rose-950/20 p-3.5 rounded-lg border border-rose-900/40 flex items-center justify-between mt-4">
            <div>
              <h4 className="font-semibold text-rose-300 flex items-center space-x-1 uppercase tracking-wider text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Total Factory Wipe</span>
              </h4>
              <p className="text-[11px] text-rose-400/80 font-sans">
                Restores application to initial fresh installation state.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to perform a full factory reset?')) {
                  onFullFactoryReset();
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 uppercase tracking-wider font-mono"
            >
              Factory Reset
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/5 bg-[#0a0a0a] text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-[#181818] text-gray-300 hover:text-white font-semibold text-xs uppercase tracking-wider border border-white/5"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
