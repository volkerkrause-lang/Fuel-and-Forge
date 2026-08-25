import React from 'react';
import { Play, RotateCcw, Clock, Layers, Flame } from 'lucide-react';
import { WorkoutRoutine } from '../types';

interface WorkoutOverviewProps {
  routine: WorkoutRoutine;
  onStartWorkout: () => void;
  onResetRoutine: () => void;
  onUpdateRoutine: (routine: WorkoutRoutine) => void;
}

export const WorkoutOverview: React.FC<WorkoutOverviewProps> = ({
  routine,
  onStartWorkout,
  onResetRoutine,
  onUpdateRoutine,
}) => {
  const updateExercise = (index: number, field: string, value: number) => {
    const exercises = routine.exercises.map((exercise, i) => i === index ? { ...exercise, [field]: value } : exercise);
    onUpdateRoutine({ ...routine, exercises });
  };
  return (
    <div className="space-y-4">
      {/* Routine Hero Card */}
      <div className="card-bg rounded-xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#d4af37] bg-[#221c0e] px-2.5 py-0.5 rounded border border-[#d4af37]/40">
              Master Protocol
            </span>
            <h2 className="serif text-xl font-bold text-white mt-2">{routine.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5 font-sans">{routine.description}</p>
          </div>

          <button
            onClick={onResetRoutine}
            className="p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#262626] text-gray-400 hover:text-[#d4af37] border border-white/5 transition-colors"
            title="Reset to default routine template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center space-x-4 mt-4 pt-3 border-t border-white/5 text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-gray-300">
            <Layers className="w-4 h-4 text-[#d4af37]" />
            <span>{routine.exercises.length} Exercises</span>
          </div>
          <div className="flex items-center space-x-1.5 text-gray-300">
            <Clock className="w-4 h-4 text-[#d4af37]" />
            <span>~45–55 min</span>
          </div>
          <div className="flex items-center space-x-1.5 text-gray-300">
            <Flame className="w-4 h-4 text-[#d4af37]" />
            <span>{routine.targetFrequencyPerWeek}x / week</span>
          </div>
        </div>

        {/* Start Workout Button */}
        <button
          onClick={onStartWorkout}
          className="w-full mt-4 py-3.5 bg-[#d4af37] hover:bg-[#b8962e] text-black font-bold text-xs uppercase tracking-widest rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center space-x-2 active:scale-98"
        >
          <Play className="w-4 h-4 fill-black text-black" />
          <span>START TODAY'S PROTOCOL</span>
        </button>
      </div>

      {/* Exercises List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="serif text-xs font-semibold uppercase tracking-widest text-gray-200">
            Routine Structure
          </h3>
          <span className="text-[10px] uppercase font-mono tracking-widest text-gray-500">
            {routine.exercises.length} Core Movements
          </span>
        </div>

        <div className="space-y-2">
          {routine.exercises.map((ex, index) => (
            <div
              key={ex.id}
              className="card-bg rounded-xl p-3.5 flex items-center justify-between transition-colors hover:border-[#d4af37]/30"
            >
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-lg bg-[#221c0e] border border-[#d4af37]/30 flex items-center justify-center font-mono font-bold text-xs text-[#d4af37]">
                  {index + 1}
                </div>
                <div>
                  <h4 className="serif font-semibold text-xs text-gray-100">{ex.name}</h4>
                  <p className="text-[11px] text-gray-400 font-mono">
                    {ex.targetMuscle} •{' '}
                    {ex.category === 'cardio'
                      ? `${ex.cardioDurationMin} min @ Level ${ex.cardioLevel}`
                      : ex.category === 'assisted'
                      ? `${ex.setsCount} sets × ${ex.defaultReps} reps (${ex.defaultWeightOrAssistanceKg}kg assist)`
                      : ex.category === 'bodyweight'
                      ? `${ex.setsCount} sets × ${ex.defaultReps} reps (BW)`
                      : `${ex.setsCount} sets × ${ex.defaultReps} reps (${ex.defaultWeightOrAssistanceKg}kg)`}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2 text-[10px] font-mono">
                    {ex.category === 'cardio' ? (
                      <>
                        <label>Minutes <input aria-label={`${ex.name} minutes`} type="number" min="1" value={ex.cardioDurationMin ?? 1} onChange={(e) => updateExercise(index, 'cardioDurationMin', Number(e.target.value))} className="w-16 ml-1 bg-[#0a0a0a] border border-white/10 rounded px-1.5 py-1 text-white" /></label>
                        <label>Level <input aria-label={`${ex.name} level`} type="number" min="1" value={ex.cardioLevel ?? 1} onChange={(e) => updateExercise(index, 'cardioLevel', Number(e.target.value))} className="w-14 ml-1 bg-[#0a0a0a] border border-white/10 rounded px-1.5 py-1 text-white" /></label>
                      </>
                    ) : (
                      <>
                        {ex.category !== 'bodyweight' && <label>Kg <input aria-label={`${ex.name} kilograms`} type="number" min="0" step="0.5" value={ex.defaultWeightOrAssistanceKg ?? 0} onChange={(e) => updateExercise(index, 'defaultWeightOrAssistanceKg', Number(e.target.value))} className="w-16 ml-1 bg-[#0a0a0a] border border-white/10 rounded px-1.5 py-1 text-white" /></label>}
                        <label>Reps <input aria-label={`${ex.name} repetitions`} type="number" min="1" value={ex.defaultReps ?? 1} onChange={(e) => updateExercise(index, 'defaultReps', Number(e.target.value))} className="w-14 ml-1 bg-[#0a0a0a] border border-white/10 rounded px-1.5 py-1 text-white" /></label>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <span
                className={`text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded border ${
                  ex.category === 'cardio'
                    ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300'
                    : ex.category === 'assisted'
                    ? 'bg-purple-950/40 border-purple-500/30 text-purple-300'
                    : ex.category === 'bodyweight'
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    : 'bg-[#221c0e] border-[#d4af37]/40 text-[#d4af37]'
                }`}
              >
                {ex.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
