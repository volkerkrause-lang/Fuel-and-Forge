import React from 'react';
import { Plus, Trash2, RotateCcw, Utensils } from 'lucide-react';
import { FoodLog, MealSlot } from '../types';

interface FoodDiaryProps {
  logs: FoodLog[];
  onOpenFastAdd: (mealSlot: MealSlot) => void;
  onDeleteLog: (id: string) => void;
  onUpdateLog?: (log: FoodLog) => void;
  onUpdateLogMultiplier?: (log: FoodLog, multiplier: number) => void;
  onResetMeal?: (mealSlot: MealSlot) => void;
  onClearMealSlot?: (mealSlot: MealSlot) => void;
}

export const FoodDiary: React.FC<FoodDiaryProps> = ({
  logs,
  onOpenFastAdd,
  onDeleteLog,
  onUpdateLog,
  onUpdateLogMultiplier,
  onResetMeal,
  onClearMealSlot,
}) => {
  const mealSlots: { id: MealSlot; title: string; defaultCalories: number }[] = [
    { id: 'breakfast', title: 'Breakfast', defaultCalories: 450 },
    { id: 'lunch', title: 'Lunch', defaultCalories: 650 },
    { id: 'dinner', title: 'Dinner', defaultCalories: 700 },
    { id: 'snacks', title: 'Snacks', defaultCalories: 300 },
  ];

  const handleMultiplier = (log: FoodLog, mult: number) => {
    if (onUpdateLogMultiplier) {
      onUpdateLogMultiplier(log, mult);
    } else if (onUpdateLog) {
      const baseCal = log.calories / (log.portionMultiplier || 1);
      const baseProt = log.protein / (log.portionMultiplier || 1);
      const baseCarb = log.carbs / (log.portionMultiplier || 1);
      const baseFat = log.fat / (log.portionMultiplier || 1);

      onUpdateLog({
        ...log,
        portionMultiplier: mult,
        calories: Math.round(baseCal * mult),
        protein: Number((baseProt * mult).toFixed(1)),
        carbs: Number((baseCarb * mult).toFixed(1)),
        fat: Number((baseFat * mult).toFixed(1)),
      });
    }
  };

  const handleReset = (slot: MealSlot) => {
    if (onClearMealSlot) onClearMealSlot(slot);
    else if (onResetMeal) onResetMeal(slot);
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
            <Utensils className="w-3.5 h-3.5" />
          </div>
          <h3 className="serif text-xs font-semibold uppercase tracking-widest text-gray-200">
            Fuel Journal
          </h3>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">
          Interactive Log
        </span>
      </div>

      <div className="space-y-3">
        {mealSlots.map((slot) => {
          const slotLogs = logs.filter((l) => l.mealType === slot.id);
          const totalSlotCalories = slotLogs.reduce((sum, item) => sum + item.calories, 0);
          const totalSlotProtein = Number(
            slotLogs.reduce((sum, item) => sum + item.protein, 0).toFixed(1)
          );

          return (
            <div
              key={slot.id}
              className="card-bg rounded-xl p-4 shadow-lg transition-all"
            >
              {/* Slot Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
                <div>
                  <h4 className="serif font-semibold text-sm text-gray-100 tracking-wide">
                    {slot.title}
                  </h4>
                  <div className="flex items-center space-x-2 text-[11px] font-mono text-gray-400 mt-0.5">
                    <span className="gold-text font-medium">{totalSlotCalories} kcal</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-emerald-400">{totalSlotProtein}g P</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {slotLogs.length > 0 && (
                    <button
                      onClick={() => handleReset(slot.id)}
                      className="p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-rose-950/40 text-gray-400 hover:text-rose-400 border border-white/5 hover:border-rose-500/30 transition-colors"
                      title={`Reset ${slot.title}`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => onOpenFastAdd(slot.id)}
                    className="py-1.5 px-3 rounded-lg bg-[#1f1a0e] hover:bg-[#2c2413] border border-[#d4af37]/40 text-[#d4af37] hover:text-[#f3d978] font-bold text-xs uppercase tracking-wider flex items-center space-x-1 transition-all active:scale-95 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>+ LOG</span>
                  </button>
                </div>
              </div>

              {/* Logged Items List */}
              {slotLogs.length === 0 ? (
                <div
                  onClick={() => onOpenFastAdd(slot.id)}
                  className="py-3 text-center cursor-pointer group"
                >
                  <p className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors font-serif italic">
                    No items recorded for {slot.title.toLowerCase()}. Tap + LOG to add.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5 pt-1">
                  {slotLogs.map((log) => (
                    <div
                      key={log.id}
                      className="py-2.5 flex items-center justify-between group hover:bg-white/[0.02] rounded-lg px-2 transition-colors"
                    >
                      <div className="flex-1 pr-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-xs text-gray-200">
                            {log.name}
                          </span>
                          {log.portionMultiplier !== 1 && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#221c0e] border border-[#d4af37]/40 text-[#d4af37] font-bold">
                              {log.portionMultiplier}x
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-gray-400 mt-0.5 font-mono">
                          <span className="gold-text">{log.calories} kcal</span>
                          <span>{log.protein}g P</span>
                          <span>{log.carbs}g C</span>
                          <span>{log.fat}g F</span>
                        </div>
                      </div>

                      {/* Multiplier & Delete Controls */}
                      <div className="flex items-center space-x-1">
                        {/* Quick portion change buttons */}
                        <div className="hidden sm:flex items-center space-x-1 mr-1">
                          {[0.5, 1, 1.5, 2].map((mult) => (
                            <button
                              key={mult}
                              onClick={() => handleMultiplier(log, mult)}
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                                log.portionMultiplier === mult
                                  ? 'bg-[#d4af37] border-[#d4af37] text-black font-bold'
                                  : 'bg-[#181818] border-white/5 text-gray-400 hover:text-white'
                              }`}
                            >
                              {mult === 0.5 ? '½' : mult}x
                            </button>
                          ))}
                        </div>

                        {/* Delete Food Button */}
                        <button
                          onClick={() => onDeleteLog(log.id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                          title="Remove food"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
