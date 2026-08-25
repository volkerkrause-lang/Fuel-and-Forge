import React from 'react';
import { Check, Dumbbell, Plus, Minus } from 'lucide-react';
import { WorkoutSession } from '../types';

interface Props {
  sessions: WorkoutSession[];
  target: number;
  onToggle: (date: string) => void;
  onTargetChange: (target: number) => void;
}

const startOfWeek = (date = new Date()) => {
  const result = new Date(date);
  const day = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
};

const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const WeeklyWorkoutTracker: React.FC<Props> = ({ sessions, target, onToggle, onTargetChange }) => {
  const weekStart = startOfWeek();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const completed = sessions.filter((session) => {
    const date = new Date(`${session.date}T00:00:00`);
    return session.isCompleted && date >= weekStart && date < weekEnd;
  }).length;
  const slots = Math.max(3, target || 3);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    const key = dateKey(date);
    return { key, label: date.toLocaleDateString('en-GB', { weekday: 'short' }), done: sessions.some((s) => s.date === key && s.isCompleted) };
  });

  return (
    <section className="card-bg rounded-xl p-4 shadow-lg" aria-label="Weekly gym sessions">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-[#d4af37]" />
          <h2 className="serif font-bold text-sm text-white">Gym sessions this week</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-300">{completed} / {slots}</span>
          <button aria-label="Reduce weekly goal" disabled={slots <= 3} onClick={() => onTargetChange(slots - 1)} className="p-1 rounded bg-[#181818] disabled:opacity-25"><Minus className="w-3 h-3" /></button>
          <button aria-label="Increase weekly goal" onClick={() => onTargetChange(slots + 1)} className="p-1 rounded bg-[#181818] text-[#d4af37]"><Plus className="w-3 h-3" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          return (
            <button key={day.key} onClick={() => onToggle(day.key)} className={`min-h-14 rounded-lg border text-[10px] font-bold transition-all ${day.done ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300' : 'bg-[#181818] border-white/10 text-gray-400 hover:border-[#d4af37]/50'}`}>
              <Check className={`w-4 h-4 mx-auto mb-1 ${day.done ? 'opacity-100' : 'opacity-20'}`} />
              {day.label}
            </button>
          );
        })}
      </div>
      <div className="mt-3 h-2 rounded-full bg-[#181818] overflow-hidden"><div className="h-full bg-gradient-to-r from-[#d4af37] to-emerald-400 transition-all" style={{ width: `${Math.min(100, (completed / slots) * 100)}%` }} /></div>
      <p className="text-[10px] text-gray-500 mt-2">Tap the day you trained. Your goal stays at a minimum of three, and can grow with +.</p>
    </section>
  );
};
