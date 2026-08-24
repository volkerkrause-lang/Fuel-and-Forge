import React, { useState } from 'react';
import { Droplet, Plus, Minus, Settings2 } from 'lucide-react';
import { WaterLog } from '../types';
import { formatWater } from '../services/calculator';

interface WaterTrackerProps {
  waterLog?: WaterLog;
  consumedMl?: number;
  targetMl?: number;
  waterUnit?: 'ml' | 'fl_oz';
  glassSizeMl?: number;
  onAddWater?: (amountMl: number) => void;
  onResetWater?: () => void;
  onUpdateWater?: (glasses: number, totalMl: number) => void;
  onUpdateGlassSize?: (ml: number) => void;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  waterLog,
  consumedMl,
  targetMl = 2500,
  waterUnit = 'ml',
  glassSizeMl = 250,
  onAddWater,
  onResetWater,
  onUpdateWater,
  onUpdateGlassSize,
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [customGlassSize, setCustomGlassSize] = useState(glassSizeMl);

  const currentTotalMl =
    consumedMl !== undefined
      ? consumedMl
      : waterLog?.amountMl !== undefined
      ? waterLog.amountMl
      : waterLog?.totalMl || 0;

  const currentGlasses =
    waterLog?.glasses !== undefined
      ? waterLog.glasses
      : Math.round(currentTotalMl / glassSizeMl);

  const totalGlassesTarget = Math.max(4, Math.round(targetMl / glassSizeMl));

  const handleAddGlass = () => {
    if (onAddWater) {
      onAddWater(glassSizeMl);
    } else if (onUpdateWater) {
      const nextGlasses = currentGlasses + 1;
      const nextMl = nextGlasses * glassSizeMl;
      onUpdateWater(nextGlasses, nextMl);
    }
  };

  const handleRemoveGlass = () => {
    if (currentTotalMl <= 0) return;
    if (onAddWater) {
      onAddWater(-glassSizeMl);
    } else if (onUpdateWater) {
      const nextGlasses = Math.max(0, currentGlasses - 1);
      const nextMl = nextGlasses * glassSizeMl;
      onUpdateWater(nextGlasses, nextMl);
    }
  };

  const handleSaveGlassSize = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateGlassSize) {
      onUpdateGlassSize(Number(customGlassSize));
    }
    setShowConfig(false);
  };

  const progressPercent = Math.min(100, Math.round((currentTotalMl / (targetMl || 1)) * 100));

  return (
    <div className="card-bg rounded-xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
            <Droplet className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="serif text-xs font-semibold uppercase tracking-widest text-gray-200">
              Hydration Balance
            </h3>
            <p className="text-[10px] uppercase font-mono tracking-wider text-gray-400">
              {currentGlasses} / {totalGlassesTarget} glasses ({formatWater(currentTotalMl, waterUnit as any)} /{' '}
              {formatWater(targetMl, waterUnit as any)})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          {onResetWater && (
            <button
              onClick={onResetWater}
              className="text-[10px] text-gray-500 hover:text-[#d4af37] font-semibold uppercase tracking-wider px-2 py-1 transition-colors"
            >
              Reset
            </button>
          )}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#222222] text-gray-400 hover:text-white border border-white/5 transition-colors"
            title="Configure glass size"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Glass Size Config Modal/Inline */}
      {showConfig && (
        <form
          onSubmit={handleSaveGlassSize}
          className="bg-[#181818] p-3 rounded-lg border border-[#d4af37]/30 flex items-center justify-between space-x-2 animate-in fade-in"
        >
          <span className="text-xs font-medium text-gray-300">Glass Volume:</span>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="50"
              step="25"
              value={customGlassSize}
              onChange={(e) => setCustomGlassSize(Number(e.target.value))}
              className="w-20 bg-[#0a0a0a] border border-white/10 rounded px-2 py-1 text-xs text-white text-center font-mono font-bold"
            />
            <span className="text-xs text-gray-400 font-mono">ml</span>
            <button
              type="submit"
              className="px-2.5 py-1 bg-[#d4af37] hover:bg-[#b8962e] text-black rounded text-xs font-bold uppercase tracking-wider"
            >
              Save
            </button>
          </div>
        </form>
      )}

      {/* Visual Glasses Row */}
      <div className="flex flex-wrap gap-2 justify-center py-2 px-1">
        {Array.from({ length: totalGlassesTarget }).map((_, index) => {
          const isFilled = index < currentGlasses;
          return (
            <button
              key={index}
              onClick={() => {
                if (index < currentGlasses) {
                  if (onAddWater) onAddWater(-glassSizeMl);
                } else {
                  if (onAddWater) onAddWater(glassSizeMl);
                }
              }}
              className={`w-9 h-12 rounded-lg border flex flex-col justify-end p-1 transition-all duration-300 relative overflow-hidden ${
                isFilled
                  ? 'bg-[#221c0e] border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.2)] scale-105'
                  : 'bg-[#141414] border-white/10 opacity-50 hover:opacity-80'
              }`}
              title={`Glass ${index + 1} (${glassSizeMl} ml)`}
            >
              {isFilled && (
                <div className="w-full h-3/4 rounded bg-gradient-to-t from-[#8a6d1e] to-[#d4af37] opacity-90 transition-all" />
              )}
              <span className="text-[8px] font-mono font-bold text-center w-full block text-gray-300 z-10">
                {index + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* Progress Bar & Quick Log Controls */}
      <div className="space-y-2">
        <div className="h-1.5 w-full bg-[#0a0a0a] rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-[#d4af37] to-[#8a6d1e] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handleRemoveGlass}
            disabled={currentTotalMl <= 0}
            className="py-1.5 px-3 rounded-lg bg-[#181818] hover:bg-[#222222] disabled:opacity-30 disabled:cursor-not-allowed border border-white/5 text-xs font-medium text-gray-300 flex items-center space-x-1 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
            <span className="font-mono">- {glassSizeMl} ml</span>
          </button>

          <span className="text-xs font-mono font-semibold gold-text">{progressPercent}% Target</span>

          <button
            onClick={handleAddGlass}
            className="py-1.5 px-3 rounded-lg bg-[#d4af37] hover:bg-[#b8962e] text-black text-xs font-bold flex items-center space-x-1 shadow-[0_0_12px_rgba(212,175,55,0.25)] transition-all active:scale-95 uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5 text-black" />
            <span className="font-mono text-black">+ {glassSizeMl} ml</span>
          </button>
        </div>
      </div>
    </div>
  );
};
