import React, { useState, useEffect } from 'react';
import {
  Check,
  Plus,
  Trash2,
  Clock,
  ArrowUp,
  ArrowDown,
  X,
  Trophy,
} from 'lucide-react';
import { WorkoutSession, ExerciseSet, WorkoutRoutine } from '../types';
import confetti from 'canvas-confetti';

interface ActiveWorkoutProps {
  session: WorkoutSession;
  masterRoutine: WorkoutRoutine;
  previousSession?: WorkoutSession;
  onUpdateSession: (session: WorkoutSession) => void;
  onFinishWorkout: (session: WorkoutSession, updateMaster: boolean) => void;
  onCancelWorkout: () => void;
}

export const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({
  session,
  previousSession,
  onUpdateSession,
  onFinishWorkout,
  onCancelWorkout,
}) => {
  // Rest Timer State
  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null);
  const [, setRestTotalSeconds] = useState<number>(120);
  const [isRestTimerActive, setIsRestTimerActive] = useState<boolean>(false);

  // Completion Dialog State
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [saveToMasterRoutine, setSaveToMasterRoutine] = useState(false);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isRestTimerActive && restSecondsLeft !== null && restSecondsLeft > 0) {
      interval = setInterval(() => {
        setRestSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (restSecondsLeft === 0) {
      setIsRestTimerActive(false);
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    }
    return () => clearInterval(interval);
  }, [isRestTimerActive, restSecondsLeft]);

  const startRestTimer = (seconds: number = 120) => {
    setRestTotalSeconds(seconds);
    setRestSecondsLeft(seconds);
    setIsRestTimerActive(true);
  };

  const handleToggleSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...session.exercises];
    const targetSet = updatedExercises[exerciseIndex].sets[setIndex];
    const willBeCompleted = !targetSet.isCompleted;

    targetSet.isCompleted = willBeCompleted;
    targetSet.completedAt = willBeCompleted ? Date.now() : undefined;

    // Recalculate session volume
    let totalVol = 0;
    let totalBwReps = 0;

    for (const ex of updatedExercises) {
      for (const s of ex.sets) {
        if (s.isCompleted) {
          if (ex.category === 'weighted') {
            totalVol += (s.weightOrAssistanceKg || 0) * (s.reps || 0);
          } else if (ex.category === 'bodyweight') {
            totalBwReps += s.reps || 0;
          }
        }
      }
    }

    const updatedSession: WorkoutSession = {
      ...session,
      exercises: updatedExercises,
      totalVolumeKg: totalVol,
      bodyweightRepsCount: totalBwReps,
    };

    onUpdateSession(updatedSession);

    if (willBeCompleted) {
      const restTime = updatedExercises[exerciseIndex].restSeconds || 120;
      startRestTimer(restTime);
    }
  };

  const handleUpdateSetValue = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof ExerciseSet,
    value: any
  ) => {
    const updatedExercises = [...session.exercises];
    const targetSet = updatedExercises[exerciseIndex].sets[setIndex];
    (targetSet as any)[field] = value;

    // Recalculate volume if weighted
    let totalVol = 0;
    let totalBwReps = 0;
    for (const ex of updatedExercises) {
      for (const s of ex.sets) {
        if (s.isCompleted) {
          if (ex.category === 'weighted') {
            totalVol += (s.weightOrAssistanceKg || 0) * (s.reps || 0);
          } else if (ex.category === 'bodyweight') {
            totalBwReps += s.reps || 0;
          }
        }
      }
    }

    onUpdateSession({
      ...session,
      exercises: updatedExercises,
      totalVolumeKg: totalVol,
      bodyweightRepsCount: totalBwReps,
    });
  };

  const handleAddSet = (exerciseIndex: number) => {
    const updatedExercises = [...session.exercises];
    const ex = updatedExercises[exerciseIndex];
    const lastSet = ex.sets[ex.sets.length - 1];

    const newSet: ExerciseSet = {
      id: `s_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      setNumber: ex.sets.length + 1,
      previousStr: lastSet ? lastSet.previousStr : '-',
      weightOrAssistanceKg: lastSet?.weightOrAssistanceKg ?? 0,
      reps: lastSet?.reps ?? 10,
      durationMin: lastSet?.durationMin ?? 2,
      level: lastSet?.level ?? 12,
      isCompleted: false,
    };

    ex.sets.push(newSet);
    onUpdateSession({ ...session, exercises: updatedExercises });
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...session.exercises];
    const ex = updatedExercises[exerciseIndex];
    if (ex.sets.length <= 1) return;

    ex.sets.splice(setIndex, 1);
    ex.sets.forEach((s, idx) => {
      s.setNumber = idx + 1;
    });

    onUpdateSession({ ...session, exercises: updatedExercises });
  };

  const handleRemoveExercise = (exerciseIndex: number) => {
    const updatedExercises = session.exercises.filter((_, idx) => idx !== exerciseIndex);
    onUpdateSession({ ...session, exercises: updatedExercises });
  };

  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= session.exercises.length) return;

    const list = [...session.exercises];
    const temp = list[index];
    list[index] = list[newIdx];
    list[newIdx] = temp;

    onUpdateSession({ ...session, exercises: list });
  };

  const handleOpenFinish = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#d4af37', '#b8962e', '#ffffff', '#10b981'],
      });
    } catch (e) {
      // ignore
    }
    setShowFinishModal(true);
  };

  const handleCompleteWorkout = () => {
    const finishedSession: WorkoutSession = {
      ...session,
      endTime: Date.now(),
      isCompleted: true,
    };
    onFinishWorkout(finishedSession, saveToMasterRoutine);
    setShowFinishModal(false);
  };

  const completedSetsCount = session.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.isCompleted).length,
    0
  );
  const totalSetsCount = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const percentComplete = Math.round((completedSetsCount / (totalSetsCount || 1)) * 100);

  const prevVol = previousSession?.totalVolumeKg || 12110;
  const volDiffPercent =
    prevVol > 0 ? (((session.totalVolumeKg - prevVol) / prevVol) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-4 pb-12">
      {/* Active Workout Header Bar */}
      <div className="card-bg rounded-xl p-4 shadow-xl sticky top-16 z-20 backdrop-blur-md border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
              <h2 className="serif font-bold text-sm text-white uppercase tracking-wider">{session.routineName}</h2>
            </div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mt-0.5">
              {completedSetsCount} of {totalSetsCount} sets completed ({percentComplete}%)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onCancelWorkout}
              className="px-2.5 py-1.5 rounded-lg bg-[#181818] hover:bg-[#242424] text-gray-400 hover:text-rose-400 text-xs font-semibold uppercase tracking-wider border border-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleOpenFinish}
              className="px-3.5 py-1.5 rounded-lg bg-[#d4af37] hover:bg-[#b8962e] text-black text-xs font-bold uppercase tracking-widest shadow-[0_0_12px_rgba(212,175,55,0.25)] transition-all"
            >
              Finish
            </button>
          </div>
        </div>

        {/* Real-time Session Volume Counter */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-white/5 text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="text-gray-400">Lifting Volume:</span>
            <span className="font-bold gold-text">
              {session.totalVolumeKg.toLocaleString()} kg
            </span>
          </div>
          <div className="flex items-center space-x-1.5 justify-end">
            <span className="text-gray-400">BW Reps:</span>
            <span className="font-bold text-emerald-400">{session.bodyweightRepsCount} reps</span>
          </div>
        </div>
      </div>

      {/* Floating Rest Timer Bar */}
      {isRestTimerActive && restSecondsLeft !== null && (
        <div className="bg-[#181818] border border-[#d4af37]/40 rounded-xl p-3 shadow-[0_0_20px_rgba(212,175,55,0.2)] flex items-center justify-between animate-in slide-in-from-top-3">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-5 h-5 text-[#d4af37] animate-spin" />
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-gray-300">Rest Timer Active</span>
              <div className="serif text-lg font-bold gold-text tracking-wider font-mono">
                {Math.floor(restSecondsLeft / 60)}:
                {(restSecondsLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setRestSecondsLeft((prev) => (prev || 0) + 30)}
              className="px-2.5 py-1 rounded bg-[#241e11] hover:bg-[#332b18] text-[#d4af37] border border-[#d4af37]/30 text-xs font-mono font-semibold"
            >
              +30s
            </button>
            <button
              onClick={() => setIsRestTimerActive(false)}
              className="p-1.5 rounded bg-[#222222] hover:bg-[#2e2e2e] text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Exercises Table Cards */}
      <div className="space-y-4">
        {session.exercises.map((exercise, exIdx) => {
          return (
            <div
              key={exercise.id}
              className="card-bg rounded-xl p-4 shadow-lg space-y-3"
            >
              {/* Exercise Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md bg-[#241e11] border border-[#d4af37]/30 text-[#d4af37] font-mono font-bold text-xs flex items-center justify-center">
                    {exIdx + 1}
                  </div>
                  <div>
                    <h3 className="serif font-semibold text-sm text-gray-100">{exercise.name}</h3>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
                      {exercise.targetMuscle} • {exercise.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleMoveExercise(exIdx, 'up')}
                    disabled={exIdx === 0}
                    className="p-1 rounded text-gray-500 hover:text-gray-300 disabled:opacity-30"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveExercise(exIdx, 'down')}
                    disabled={exIdx === session.exercises.length - 1}
                    className="p-1 rounded text-gray-500 hover:text-gray-300 disabled:opacity-30"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemoveExercise(exIdx)}
                    className="p-1 rounded text-gray-500 hover:text-rose-400 ml-1"
                    title="Remove exercise"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Sets Table */}
              <div className="space-y-2">
                {/* Table Column Headers */}
                <div className="grid grid-cols-12 gap-1 text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500 px-1">
                  <div className="col-span-1 text-center">Set</div>
                  <div className="col-span-3 text-center">Previous</div>
                  {exercise.category === 'cardio' ? (
                    <>
                      <div className="col-span-3 text-center">Duration (min)</div>
                      <div className="col-span-3 text-center">Level</div>
                    </>
                  ) : exercise.category === 'assisted' ? (
                    <>
                      <div className="col-span-3 text-center">Assistance (kg)</div>
                      <div className="col-span-3 text-center">Reps</div>
                    </>
                  ) : exercise.category === 'bodyweight' ? (
                    <>
                      <div className="col-span-3 text-center">Load (BW)</div>
                      <div className="col-span-3 text-center">Reps</div>
                    </>
                  ) : (
                    <>
                      <div className="col-span-3 text-center">KG</div>
                      <div className="col-span-3 text-center">Reps</div>
                    </>
                  )}
                  <div className="col-span-2 text-center">Done</div>
                </div>

                {/* Set Rows */}
                {exercise.sets.map((set, setIdx) => {
                  return (
                    <div
                      key={set.id}
                      className={`grid grid-cols-12 gap-1.5 items-center p-1.5 rounded-lg border transition-colors ${
                        set.isCompleted
                          ? 'bg-[#15231c] border-emerald-500/40'
                          : 'bg-[#181818] border-white/5'
                      }`}
                    >
                      {/* Set Number */}
                      <div className="col-span-1 text-center font-mono font-bold text-xs text-gray-400">
                        {set.setNumber}
                      </div>

                      {/* Previous Value */}
                      <div className="col-span-3 text-center text-[10px] font-mono text-gray-400 truncate">
                        {set.previousStr || '-'}
                      </div>

                      {/* Dynamic Input 1 */}
                      {exercise.category === 'cardio' ? (
                        <div className="col-span-3">
                          <input
                            type="number"
                            min="1"
                            value={set.durationMin ?? 2}
                            onChange={(e) =>
                              handleUpdateSetValue(exIdx, setIdx, 'durationMin', Number(e.target.value))
                            }
                            className="w-full bg-[#0a0a0a] text-center font-mono font-bold text-xs py-1.5 rounded border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
                          />
                        </div>
                      ) : (
                        <div className="col-span-3">
                          <input
                            type="number"
                            disabled={exercise.category === 'bodyweight'}
                            value={
                              exercise.category === 'bodyweight'
                                ? '0'
                                : set.weightOrAssistanceKg ?? 0
                            }
                            onChange={(e) =>
                              handleUpdateSetValue(
                                exIdx,
                                setIdx,
                                'weightOrAssistanceKg',
                                Number(e.target.value)
                              )
                            }
                            className={`w-full bg-[#0a0a0a] text-center font-mono font-bold text-xs py-1.5 rounded border border-white/10 focus:outline-none ${
                              exercise.category === 'bodyweight'
                                ? 'text-gray-500 opacity-60'
                                : exercise.category === 'assisted'
                                ? 'text-purple-300 focus:border-purple-500'
                                : 'gold-text focus:border-[#d4af37]'
                            }`}
                          />
                        </div>
                      )}

                      {/* Dynamic Input 2 */}
                      {exercise.category === 'cardio' ? (
                        <div className="col-span-3">
                          <input
                            type="number"
                            min="1"
                            value={set.level ?? 12}
                            onChange={(e) =>
                              handleUpdateSetValue(exIdx, setIdx, 'level', Number(e.target.value))
                            }
                            className="w-full bg-[#0a0a0a] text-center font-mono font-bold text-xs py-1.5 rounded border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
                          />
                        </div>
                      ) : (
                        <div className="col-span-3">
                          <input
                            type="number"
                            min="1"
                            value={set.reps ?? 10}
                            onChange={(e) =>
                              handleUpdateSetValue(exIdx, setIdx, 'reps', Number(e.target.value))
                            }
                            className="w-full bg-[#0a0a0a] text-center font-mono font-bold text-xs py-1.5 rounded border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
                          />
                        </div>
                      )}

                      {/* Complete Checkbox */}
                      <div className="col-span-2 flex items-center justify-center">
                        <button
                          onClick={() => handleToggleSet(exIdx, setIdx)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            set.isCompleted
                              ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.3)] scale-105'
                              : 'bg-[#222222] text-gray-500 hover:text-gray-300 border border-white/5'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add / Remove Set Row */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => handleAddSet(exIdx)}
                  className="py-1 px-2.5 rounded-lg bg-[#181818] hover:bg-[#242424] border border-white/5 text-xs font-mono font-medium text-gray-300 flex items-center space-x-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Add Set</span>
                </button>

                {exercise.sets.length > 1 && (
                  <button
                    onClick={() => handleRemoveSet(exIdx, exercise.sets.length - 1)}
                    className="text-[10px] font-mono text-gray-500 hover:text-rose-400 font-medium"
                  >
                    Remove Set
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Finish Workout Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md card-bg border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#241e11] border border-[#d4af37]/30 flex items-center justify-center mx-auto text-[#d4af37]">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="serif text-lg font-bold text-white uppercase tracking-wider">Protocol Completed</h3>
              <p className="text-xs text-gray-400">Excellent discipline! Training session summary:</p>
            </div>

            {/* Metrics Breakdown */}
            <div className="bg-[#181818] p-4 rounded-xl border border-white/5 space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Lifting Volume:</span>
                <span className="font-bold gold-text text-sm">
                  {session.totalVolumeKg.toLocaleString()} kg
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Volume Progression:</span>
                <span className="font-bold text-emerald-400">
                  {Number(volDiffPercent) >= 0 ? `+${volDiffPercent}%` : `${volDiffPercent}%`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Bodyweight Repetitions:</span>
                <span className="font-bold text-gray-200">{session.bodyweightRepsCount} reps</span>
              </div>
            </div>

            {/* Master Template Protection Choice */}
            <div className="bg-[#181818] p-3.5 rounded-xl border border-white/5 flex items-start space-x-3">
              <input
                type="checkbox"
                id="saveToMaster"
                checked={saveToMasterRoutine}
                onChange={(e) => setSaveToMasterRoutine(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-600 text-[#d4af37] focus:ring-[#d4af37]"
              />
              <label htmlFor="saveToMaster" className="text-xs text-gray-300 cursor-pointer">
                <span className="font-bold text-white block">Update Master Routine Template</span>
                Save modified weights, assistance, reps and sets back to the default routine for future sessions.
              </label>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setShowFinishModal(false)}
                className="flex-1 py-2.5 rounded-lg bg-[#181818] text-gray-400 hover:text-white font-semibold text-xs uppercase tracking-wider transition-colors border border-white/5"
              >
                Back
              </button>
              <button
                onClick={handleCompleteWorkout}
                className="flex-1 py-2.5 rounded-lg bg-[#d4af37] hover:bg-[#b8962e] text-black font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(212,175,55,0.25)] transition-all"
              >
                Save & Finish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
