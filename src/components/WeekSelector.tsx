import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WeekSelectorProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  foodLogs?: any[];
  sessions?: any[];
  targetCalories?: number;
}

export const WeekSelector: React.FC<WeekSelectorProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const currentDateObj = new Date(selectedDate + 'T00:00:00');
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate Monday of the current selected week
  const dayOfWeek = currentDateObj.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = (dayOfWeek + 6) % 7; // Monday = 0, Sunday = 6
  const monday = new Date(currentDateObj);
  monday.setDate(currentDateObj.getDate() - distanceToMonday);

  const days: { label: string; dateStr: string; dayNum: number; isToday: boolean; isSelected: boolean }[] = [];
  const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({
      label: dayLetters[i],
      dateStr,
      dayNum: d.getDate(),
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDate,
    });
  }

  const shiftWeek = (offsetDays: number) => {
    const newDate = new Date(currentDateObj);
    newDate.setDate(currentDateObj.getDate() + offsetDays);
    onSelectDate(newDate.toISOString().split('T')[0]);
  };

  return (
    <div className="w-full card-bg rounded-xl p-3 shadow-lg">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <button
          onClick={() => shiftWeek(-7)}
          className="p-1 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          title="Previous Week"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="serif text-xs font-semibold text-gray-200 tracking-wider">
          {new Date(monday).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })} –{' '}
          {new Date(days[6].dateStr).toLocaleDateString('en-GB', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>

        <button
          onClick={() => shiftWeek(7)}
          className="p-1 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          title="Next Week"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Week Day Pills */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => (
          <button
            key={day.dateStr}
            onClick={() => onSelectDate(day.dateStr)}
            className={`flex flex-col items-center py-2 px-1 rounded-lg transition-all ${
              day.isSelected
                ? 'bg-gradient-to-b from-[#d4af37] to-[#8a6d1e] text-black font-bold shadow-[0_0_12px_rgba(212,175,55,0.3)] scale-105'
                : day.isToday
                ? 'bg-[#181818] border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#222222]'
                : 'bg-[#111111] text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-200 border border-white/5'
            }`}
          >
            <span className="text-[9px] uppercase font-bold mb-0.5 tracking-wider">
              {day.label}
            </span>
            <span className="text-sm font-semibold font-mono">{day.dayNum}</span>
            {day.isToday && !day.isSelected && (
              <span className="w-1 h-1 rounded-full bg-[#d4af37] mt-0.5" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
