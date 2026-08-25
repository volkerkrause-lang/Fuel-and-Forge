import React from 'react';
import { Check, Dumbbell } from 'lucide-react';
import { WorkoutSession } from '../types';

interface Props {
  sessions: WorkoutSession[];
  target: number;
  onToggle: (slot: number) => void;
}

const startOfWeek = (date = new Date()) => {
  const result = new Date(date);
  const day = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const WeeklyWorkoutTracker: React.FC<Props> = ({ sessions, target, onToggle }) => {
  const weekStart = startOfWeek();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const completed = sessions.filter((session) => {
    const date = new Date(`${session.date}T00:00:00`);
    return session.isCompleted && date >= weekStart && date < weekEnd;
  }).length;
  const slots = Math.max(1, target || 3);

  return (
    <section className="card-bg rounded-xl p-4 shadow-lg" aria-label="Weekly gym sessions">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-[#d4af37]" />
          <h2 className="serif font-bold text-sm text-white">Gym sessions this week</h2>
        </div>
        <span className="text-xs font-mono text-gray-400">{Math.min(completed, slots)} / {slots}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: slots }, (_, index) => {
          const done = index < completed;
          return (
            <button key={index} onClick={() => onToggle(index)} className={`min-h-14 rounded-lg border text-xs font-bold transition-all ${done ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300' : 'bg-[#181818] border-white/10 text-gray-400 hover:border-[#d4af37]/50'}`}>
              <Check className={`w-4 h-4 mx-auto mb-1 ${done ? 'opacity-100' : 'opacity-25'}`} />
              Session {index + 1}
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-gray-500 mt-2">Tap to quickly mark a session done. Log exercise details in Workout for progression.</p>
    </section>
  );
};
