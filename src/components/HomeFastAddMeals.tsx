import React from 'react';
import { Plus, Settings2, Zap } from 'lucide-react';
import { Meal, MealSlot } from '../types';

interface HomeFastAddMealsProps {
  meals: Meal[];
  onAdd: (meal: Meal, slot: MealSlot) => void;
  onManage: () => void;
}

export const HomeFastAddMeals: React.FC<HomeFastAddMealsProps> = ({ meals, onAdd, onManage }) => {
  const orderedMeals = [...meals].sort((a, b) => Number(Boolean(b.isCustom)) - Number(Boolean(a.isCustom)));

  return (
    <section className="space-y-3" aria-label="Saved meals fast add">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]"><Zap className="w-3.5 h-3.5" /></div>
          <div>
            <h2 className="serif text-xs font-semibold uppercase tracking-widest text-gray-200">Saved meals</h2>
            <p className="text-[10px] text-gray-500">Tap a meal time to add it</p>
          </div>
        </div>
        <button onClick={onManage} className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-400 hover:text-[#d4af37]"><Settings2 className="w-3.5 h-3.5" /> Manage</button>
      </div>

      {orderedMeals.length === 0 ? (
        <button onClick={onManage} className="w-full card-bg rounded-xl p-4 text-xs text-gray-400 border border-dashed border-white/10">Add your first regular meal</button>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {orderedMeals.map((meal) => {
            const slots = meal.showInFastAdd.length ? meal.showInFastAdd : ['breakfast' as MealSlot];
            return (
              <article key={meal.id} className="card-bg rounded-xl p-3.5 border border-white/5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xs font-semibold text-white leading-snug">{meal.name}</h3>
                  <span className="shrink-0 text-xs font-mono gold-text">{meal.totalCalories} kcal</span>
                </div>
                <p className="text-[10px] font-mono text-gray-400 mt-1">{meal.totalProtein}g P · {meal.totalCarbs}g C · {meal.totalFat}g F</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {slots.map((slot) => (
                    <button key={slot} onClick={() => onAdd(meal, slot)} className="flex-1 min-w-[78px] py-1.5 px-2 rounded-lg bg-[#221c0e] hover:bg-[#d4af37] border border-[#d4af37]/35 text-[#d4af37] hover:text-black text-[10px] font-bold capitalize transition-colors flex items-center justify-center gap-1">
                      <Plus className="w-3 h-3" /> {slot}
                    </button>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
