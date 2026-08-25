import React from 'react';
import { Flame, Settings, RotateCcw } from 'lucide-react';
import { MomentumState } from '../types';

interface HeaderProps {
  currentDate?: string;
  selectedDate?: string;
  userName?: string;
  onSelectToday?: () => void;
  momentum?: MomentumState;
  momentumTitle?: string;
  heatScore?: number;
  onOpenSettings: () => void;
  onOpenMomentum?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  selectedDate,
  userName = 'Athlete',
  onSelectToday,
  momentum,
  momentumTitle,
  heatScore,
  onOpenSettings,
  onOpenMomentum,
}) => {
  const activeDateStr = currentDate || selectedDate || new Date().toISOString().split('T')[0];
  const isToday = new Date().toISOString().split('T')[0] === activeDateStr;
  const displayDate = new Date(activeDateStr).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const score = heatScore !== undefined ? heatScore : momentum?.score ?? 68;
  const title = momentumTitle || momentum?.title || 'In Motion';

  // Initials
  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'JD';

  return (
    <header className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10 px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#d4af37] to-[#8a6d1e] flex items-center justify-center text-black font-extrabold shadow-[0_0_15px_rgba(212,175,55,0.25)] border border-[#d4af37]/40">
            <span className="serif text-sm tracking-tighter text-black font-bold">FF</span>
          </div>
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="serif font-bold tracking-tight text-lg text-white uppercase">
                FUEL <span className="gold-text">&</span> FORGE
              </span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-gray-400 flex items-center space-x-1.5">
              <span>{displayDate}</span>
              {!isToday && onSelectToday && (
                <button
                  onClick={onSelectToday}
                  className="ml-1 inline-flex items-center text-[9px] text-[#d4af37] hover:text-[#f3d978] font-bold px-1.5 py-0.5 rounded bg-[#1f1a0e] border border-[#d4af37]/30 transition-colors"
                  title="Jump back to today"
                >
                  <RotateCcw className="w-2.5 h-2.5 mr-0.5" />
                  Today
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Pill & Profile / Settings */}
        <div className="flex items-center space-x-2.5">
          {/* Momentum Core Button */}
          <button
            onClick={onOpenMomentum}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1c1c1c] border border-white/10 hover:border-[#d4af37]/40 transition-all text-xs font-medium"
            title="Momentum & Forge Core"
          >
            <Flame
              className={`w-3.5 h-3.5 ${
                score >= 50 ? 'text-[#d4af37] animate-pulse' : 'text-[#d4af37]/70'
              }`}
            />
            <span className="gold-text font-mono font-semibold">{score}%</span>
            <span className="text-gray-400 text-[10px] uppercase tracking-wider hidden sm:inline">{title}</span>
          </button>

          {/* User Initials Badge */}
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#8a6d1e] flex items-center justify-center text-black text-xs font-bold shadow-sm"
            title={userName}
          >
            {initials}
          </div>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-lg bg-[#141414] hover:bg-[#1c1c1c] border border-white/10 hover:border-[#d4af37]/40 flex items-center justify-center text-gray-400 hover:text-[#d4af37] transition-colors"
            title="Settings & Goals"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
