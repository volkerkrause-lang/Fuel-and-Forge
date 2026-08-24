import React from 'react';
import { Flame } from 'lucide-react';

interface FuelGaugeProps {
  targetCalories: number;
  consumedCalories: number;
  burnCalories?: number;
  unit?: string;
}

export const FuelGauge: React.FC<FuelGaugeProps> = ({
  targetCalories,
  consumedCalories,
  unit = 'kcal',
}) => {
  const remaining = Math.max(0, targetCalories - consumedCalories);
  const overage = Math.max(0, consumedCalories - targetCalories);
  const percentage = Math.min(100, Math.round((consumedCalories / targetCalories) * 100)) || 0;

  // Arc SVG calculation (270 degree gauge)
  const radius = 80;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (percentage / 100) * arcLength;

  return (
    <div className="relative card-bg rounded-xl p-5 shadow-xl overflow-hidden">
      {/* Background Gold Ambient Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
            <Flame className="w-3.5 h-3.5" />
          </div>
          <h2 className="serif text-sm font-semibold uppercase tracking-widest text-gray-200">
            Fuel Gauge
          </h2>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#1c1c1c] text-[#d4af37] border border-[#d4af37]/30">
          {percentage}% Fueled
        </span>
      </div>

      {/* Main Dial and Prominent Remaining Visual */}
      <div className="flex flex-col items-center justify-center my-2 relative">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-225" viewBox="0 0 180 180">
            {/* Background Track Arc */}
            <circle
              cx="90"
              cy="90"
              r={normalizedRadius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="transparent"
              strokeDasharray={`${arcLength} ${circumference}`}
            />
            {/* Animated Active Progress Arc in Gold */}
            <circle
              cx="90"
              cy="90"
              r={normalizedRadius}
              stroke="url(#goldGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={`${arcLength} ${circumference}`}
              style={{
                strokeDashoffset: isNaN(strokeDashoffset) ? arcLength : strokeDashoffset,
                transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              strokeLinecap="round"
              fill="transparent"
            />

            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d4af37" />
                <stop offset="60%" stopColor="#c59e2b" />
                <stop offset="100%" stopColor="#8a6d1e" />
              </linearGradient>
            </defs>
          </svg>

          {/* Central Prominent Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[10px] uppercase font-semibold tracking-widest text-[#d4af37]/90">
              {overage > 0 ? 'Surplus' : 'Remaining'}
            </span>
            <span className="serif text-4xl font-bold text-white tracking-tight my-0.5">
              {overage > 0 ? `+${overage.toLocaleString()}` : remaining.toLocaleString()}
            </span>
            <span className="text-[11px] text-gray-400 font-mono">
              {unit}
            </span>
          </div>
        </div>

        {/* Bottom Metre Metrics */}
        <div className="grid grid-cols-2 gap-4 w-full mt-2 pt-3 border-t border-white/5">
          <div className="text-center">
            <span className="block text-[10px] uppercase tracking-widest text-gray-400">Consumed</span>
            <span className="serif text-lg font-medium text-[#e0e0e0] font-mono">
              {consumedCalories.toLocaleString()}
              <span className="text-[10px] text-gray-500 font-sans ml-1">{unit}</span>
            </span>
          </div>
          <div className="text-center border-l border-white/5">
            <span className="block text-[10px] uppercase tracking-widest text-gray-400">Daily Target</span>
            <span className="serif text-lg font-medium text-[#d4af37] font-mono">
              {targetCalories.toLocaleString()}
              <span className="text-[10px] text-[#8a6d1e] font-sans ml-1">{unit}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
