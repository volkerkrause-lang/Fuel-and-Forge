import React, { useState } from 'react';
import { Apple, Settings2, Utensils, X, Zap } from 'lucide-react';
import { Food, Meal, MealSlot } from '../types';
import { isFoodShownOnHome } from '../services/quickAdd';

interface HomeFastAddMealsProps {
  meals: Meal[];
  foods: Food[];
  onAddMeal: (meal: Meal, slot: MealSlot) => void;
  onAddFood: (food: Food, slot: MealSlot) => void;
  onManage: () => void;
}

type QuickItem =
  | { kind: 'meal'; item: Meal }
  | { kind: 'food'; item: Food };

const MEAL_SLOTS: Array<{ id: MealSlot; label: string }> = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snacks', label: 'Snacks' },
];

export const HomeFastAddMeals: React.FC<HomeFastAddMealsProps> = ({
  meals,
  foods,
  onAddMeal,
  onAddFood,
  onManage,
}) => {
  const [selected, setSelected] = useState<QuickItem | null>(null);
  const quickFoods = foods.filter(isFoodShownOnHome);
  const orderedMeals = [...meals].sort(
    (a, b) => Number(Boolean(b.isCustom)) - Number(Boolean(a.isCustom))
  );
  const items: QuickItem[] = [
    ...orderedMeals.map((item): QuickItem => ({ kind: 'meal', item })),
    ...quickFoods.map((item): QuickItem => ({ kind: 'food', item })),
  ];

  const nutrition = (entry: QuickItem) => entry.kind === 'meal'
    ? {
        calories: entry.item.totalCalories,
        protein: entry.item.totalProtein,
        carbs: entry.item.totalCarbs,
        fat: entry.item.totalFat,
      }
    : {
        calories: entry.item.calories,
        protein: entry.item.protein,
        carbs: entry.item.carbohydrates,
        fat: entry.item.fat,
      };

  const addSelected = (slot: MealSlot) => {
    if (!selected) return;
    if (selected.kind === 'meal') onAddMeal(selected.item, slot);
    else onAddFood(selected.item, slot);
    setSelected(null);
  };

  return (
    <section className="space-y-3" aria-label="Everyday fast add">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="serif text-xs font-semibold uppercase tracking-widest text-gray-200">Fast Add</h2>
            <p className="text-[10px] text-gray-500">Your regular meals and everyday foods</p>
          </div>
        </div>
        <button onClick={onManage} className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-400 hover:text-[#d4af37]">
          <Settings2 className="w-3.5 h-3.5" /> Manage
        </button>
      </div>

      {items.length === 0 ? (
        <button onClick={onManage} className="w-full card-bg rounded-xl p-4 text-xs text-gray-400 border border-dashed border-white/10">
          Choose meals and foods for Fast Add
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {items.map((entry) => {
            const values = nutrition(entry);
            return (
              <button
                key={`${entry.kind}_${entry.item.id}`}
                onClick={() => setSelected(entry)}
                className="card-bg rounded-xl p-3.5 border border-white/5 hover:border-[#d4af37]/45 text-left active:scale-[0.98] transition-all"
              >
                <div className="flex items-start gap-2">
                  <span className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center ${entry.kind === 'meal' ? 'bg-orange-500/10 text-orange-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {entry.kind === 'meal' ? <Utensils className="w-3.5 h-3.5" /> : <Apple className="w-3.5 h-3.5" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-white leading-snug">{entry.item.name}</span>
                    <span className="block text-[9px] uppercase tracking-wider text-gray-500 mt-0.5">{entry.kind}</span>
                  </span>
                </div>
                <span className="block text-[11px] font-mono gold-text mt-2">{values.calories} kcal</span>
                <span className="block text-[9px] font-mono text-gray-500 mt-0.5">{values.protein}g P · {values.carbs}g C · {values.fat}g F</span>
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4">
          <div className="w-full max-w-sm card-bg border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#d4af37] font-bold">Add to</p>
                <h3 className="serif font-bold text-base text-white mt-1">{selected.item.name}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 text-gray-400 hover:text-white" aria-label="Close meal choice">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {MEAL_SLOTS.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => addSelected(slot.id)}
                  className="min-h-12 rounded-xl bg-[#181818] hover:bg-[#d4af37] border border-white/10 hover:border-[#d4af37] text-gray-200 hover:text-black text-sm font-bold transition-colors"
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
