import React from 'react';

interface MacroBarsProps {
  protein?: { consumed: number; target: number };
  carbs?: { consumed: number; target: number };
  fat?: { consumed: number; target: number };
  consumedProtein?: number;
  targetProtein?: number;
  consumedCarbs?: number;
  targetCarbs?: number;
  consumedFat?: number;
  targetFat?: number;
}

export const MacroBars: React.FC<MacroBarsProps> = ({
  protein,
  carbs,
  fat,
  consumedProtein,
  targetProtein,
  consumedCarbs,
  targetCarbs,
  consumedFat,
  targetFat,
}) => {
  const pConsumed = consumedProtein !== undefined ? consumedProtein : protein?.consumed || 0;
  const pTarget = targetProtein !== undefined ? targetProtein : protein?.target || 140;

  const cConsumed = consumedCarbs !== undefined ? consumedCarbs : carbs?.consumed || 0;
  const cTarget = targetCarbs !== undefined ? targetCarbs : carbs?.target || 200;

  const fConsumed = consumedFat !== undefined ? consumedFat : fat?.consumed || 0;
  const fTarget = targetFat !== undefined ? targetFat : fat?.target || 60;

  const macros = [
    {
      name: 'Protein',
      consumed: Math.round(pConsumed),
      target: Math.round(pTarget),
      remaining: Math.max(0, Math.round(pTarget - pConsumed)),
      gradient: 'from-[#10b981] to-[#059669]',
      textColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400',
    },
    {
      name: 'Carbs',
      consumed: Math.round(cConsumed),
      target: Math.round(cTarget),
      remaining: Math.max(0, Math.round(cTarget - cConsumed)),
      gradient: 'from-[#d4af37] to-[#b8962e]',
      textColor: 'text-[#d4af37]',
      badgeBg: 'bg-[#221c0e] border-[#d4af37]/30 text-[#d4af37]',
    },
    {
      name: 'Fat',
      consumed: Math.round(fConsumed),
      target: Math.round(fTarget),
      remaining: Math.max(0, Math.round(fTarget - fConsumed)),
      gradient: 'from-[#a1a1aa] to-[#71717a]',
      textColor: 'text-gray-300',
      badgeBg: 'bg-[#1c1c1c] border-white/10 text-gray-300',
    },
  ];

  return (
    <div className="card-bg rounded-xl p-4 shadow-lg space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="serif text-xs font-semibold uppercase tracking-widest text-gray-200">
          Macronutrient Allocation
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">
          Consumed / Target
        </span>
      </div>

      <div className="space-y-2.5">
        {macros.map((m) => {
          const percentage = Math.min(100, Math.round((m.consumed / (m.target || 1)) * 100));
          return (
            <div key={m.name} className="space-y-1.5 bg-[#171717] p-2.5 rounded-lg border border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-200">{m.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-gray-200 text-xs">
                    {m.consumed} <span className="text-gray-500 font-normal">/ {m.target}g</span>
                  </span>
                  <span className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border ${m.badgeBg}`}>
                    {m.remaining}g left
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden border border-white/5">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${m.gradient} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
