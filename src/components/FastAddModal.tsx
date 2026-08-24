import React, { useState } from 'react';
import { X, Plus, Search, Utensils, Zap, Barcode } from 'lucide-react';
import { Food, Meal, MealSlot, FoodLog } from '../types';

interface FastAddModalProps {
  isOpen: boolean;
  mealSlot: MealSlot;
  foods: Food[];
  meals: Meal[];
  onClose: () => void;
  onLogFood?: (log: Omit<FoodLog, 'id' | 'timestamp'>) => void;
  onAddFoodLog?: (log: Omit<FoodLog, 'id' | 'timestamp'>) => void;
}

export const FastAddModal: React.FC<FastAddModalProps> = ({
  isOpen,
  mealSlot,
  foods,
  meals,
  onClose,
  onLogFood,
  onAddFoodLog,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'fast' | 'foods' | 'custom' | 'barcode'>('fast');
  const [selectedMultiplier, setSelectedMultiplier] = useState<number>(1.0);

  // Custom food quick form
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState<number | ''>('');
  const [customProtein, setCustomProtein] = useState<number | ''>('');
  const [customCarbs, setCustomCarbs] = useState<number | ''>('');
  const [customFat, setCustomFat] = useState<number | ''>('');

  if (!isOpen) return null;

  const emitLog = (log: Omit<FoodLog, 'id' | 'timestamp'>) => {
    if (onAddFoodLog) onAddFoodLog(log);
    else if (onLogFood) onLogFood(log);
  };

  // Filter contextual meals for this specific meal slot
  const contextualMeals = meals.filter((m) =>
    m.showInFastAdd.includes(mealSlot)
  );

  // Filtered foods for search
  const filteredFoods = foods.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.category && f.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const slotTitle = mealSlot.charAt(0).toUpperCase() + mealSlot.slice(1);

  const handleAddMeal = (meal: Meal) => {
    emitLog({
      date: new Date().toISOString().split('T')[0],
      mealType: mealSlot,
      name: meal.name,
      portionMultiplier: selectedMultiplier,
      calories: Math.round(meal.totalCalories * selectedMultiplier),
      protein: Number((meal.totalProtein * selectedMultiplier).toFixed(1)),
      carbs: Number((meal.totalCarbs * selectedMultiplier).toFixed(1)),
      fat: Number((meal.totalFat * selectedMultiplier).toFixed(1)),
      originalItemType: 'meal',
      originalItemId: meal.id,
    });
    onClose();
  };

  const handleAddFood = (food: Food) => {
    emitLog({
      date: new Date().toISOString().split('T')[0],
      mealType: mealSlot,
      name: food.name,
      portionMultiplier: selectedMultiplier,
      calories: Math.round(food.calories * selectedMultiplier),
      protein: Number((food.protein * selectedMultiplier).toFixed(1)),
      carbs: Number((food.carbohydrates * selectedMultiplier).toFixed(1)),
      fat: Number((food.fat * selectedMultiplier).toFixed(1)),
      originalItemType: 'food',
      originalItemId: food.id,
    });
    onClose();
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || customCalories === '') return;
    emitLog({
      date: new Date().toISOString().split('T')[0],
      mealType: mealSlot,
      name: customName.trim(),
      portionMultiplier: selectedMultiplier,
      calories: Math.round(Number(customCalories) * selectedMultiplier),
      protein: Number((Number(customProtein || 0) * selectedMultiplier).toFixed(1)),
      carbs: Number((Number(customCarbs || 0) * selectedMultiplier).toFixed(1)),
      fat: Number((Number(customFat || 0) * selectedMultiplier).toFixed(1)),
      originalItemType: 'custom',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4">
      <div className="w-full max-w-lg card-bg border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
              <h2 className="serif text-base font-bold text-white uppercase tracking-wider">
                Log to {slotTitle}
              </h2>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">
              Contextual Fast Add & Food Library
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1a1a1a] hover:bg-[#262626] text-gray-400 hover:text-white flex items-center justify-center transition-colors border border-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Portion Multiplier Selector */}
        <div className="px-4 pt-3 pb-2.5 bg-[#0e0e0e] border-b border-white/5 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">
            Portion Multiplier:
          </span>
          <div className="flex items-center space-x-1.5">
            {[0.5, 1.0, 1.5, 2.0].map((multiplier) => (
              <button
                key={multiplier}
                onClick={() => setSelectedMultiplier(multiplier)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                  selectedMultiplier === multiplier
                    ? 'bg-[#d4af37] text-black shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                    : 'bg-[#181818] text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                {multiplier === 0.5 ? '½x' : `${multiplier}x`}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 bg-[#111111] px-4 pt-2">
          <button
            onClick={() => setActiveTab('fast')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-all flex items-center space-x-1.5 uppercase tracking-wider ${
              activeTab === 'fast'
                ? 'border-[#d4af37] text-[#d4af37] font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Fast Add</span>
          </button>
          <button
            onClick={() => setActiveTab('foods')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-all flex items-center space-x-1.5 uppercase tracking-wider ${
              activeTab === 'foods'
                ? 'border-[#d4af37] text-[#d4af37] font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Search Foods</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-all flex items-center space-x-1.5 uppercase tracking-wider ${
              activeTab === 'custom'
                ? 'border-[#d4af37] text-[#d4af37] font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manual Custom</span>
          </button>
          <button
            onClick={() => setActiveTab('barcode')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-all flex items-center space-x-1.5 uppercase tracking-wider ${
              activeTab === 'barcode'
                ? 'border-[#d4af37] text-[#d4af37] font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Barcode className="w-3.5 h-3.5" />
            <span>Barcode</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {/* TAB 1: Fast Add Contextual Meals */}
          {activeTab === 'fast' && (
            <div className="space-y-2.5">
              <span className="serif text-[10px] uppercase font-semibold tracking-widest text-gray-400">
                Recommended for {slotTitle}
              </span>
              {contextualMeals.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-xs font-serif italic">
                  No specific meals assigned to {slotTitle} yet. Use search or manual add below.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {contextualMeals.map((meal) => (
                    <button
                      key={meal.id}
                      onClick={() => handleAddMeal(meal)}
                      className="w-full text-left bg-[#181818] hover:bg-[#202020] border border-white/5 hover:border-[#d4af37]/40 rounded-xl p-3.5 transition-all flex items-center justify-between group"
                    >
                      <div className="flex-1 pr-3">
                        <div className="serif font-semibold text-sm text-gray-100 group-hover:text-[#d4af37] transition-colors">
                          {meal.name}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {meal.ingredients.map((i) => i.name).join(' • ')}
                        </div>
                        <div className="flex items-center space-x-3 text-xs font-mono font-medium text-gray-300 mt-2">
                          <span className="gold-text">
                            {Math.round(meal.totalCalories * selectedMultiplier)} kcal
                          </span>
                          <span className="text-emerald-400">
                            {(meal.totalProtein * selectedMultiplier).toFixed(1)}g P
                          </span>
                          <span className="text-amber-400">
                            {(meal.totalCarbs * selectedMultiplier).toFixed(1)}g C
                          </span>
                          <span className="text-gray-400">
                            {(meal.totalFat * selectedMultiplier).toFixed(1)}g F
                          </span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-[#241e11] group-hover:bg-[#d4af37] text-[#d4af37] group-hover:text-black flex items-center justify-center transition-colors border border-[#d4af37]/30">
                        <Plus className="w-4 h-4" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Search Foods */}
          {activeTab === 'foods' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search oats, milk, chicken, whey..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#0e0e0e] border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="space-y-2">
                {filteredFoods.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => handleAddFood(food)}
                    className="w-full text-left bg-[#181818] hover:bg-[#202020] border border-white/5 hover:border-[#d4af37]/40 rounded-lg p-3 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-semibold text-xs text-gray-200 group-hover:text-[#d4af37]">
                        {food.name}
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono">
                        {food.servingAmount * selectedMultiplier} {food.servingUnit} •{' '}
                        <span className="gold-text">{Math.round(food.calories * selectedMultiplier)} kcal</span> •{' '}
                        <span className="text-emerald-400">{(food.protein * selectedMultiplier).toFixed(1)}g P</span>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded bg-[#241e11] group-hover:bg-[#d4af37] text-[#d4af37] group-hover:text-black flex items-center justify-center transition-colors border border-[#d4af37]/30">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Manual Custom Quick Entry */}
          {activeTab === 'custom' && (
            <form onSubmit={handleAddCustom} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                  Food / Meal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scrambled Eggs on Sourdough"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0e0e0e] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Calories (kcal) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="350"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 bg-[#0e0e0e] border border-white/10 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="25"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 bg-[#0e0e0e] border border-white/10 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Carbohydrates (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="30"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 bg-[#0e0e0e] border border-white/10 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="12"
                    value={customFat}
                    onChange={(e) => setCustomFat(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 bg-[#0e0e0e] border border-white/10 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-gray-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#d4af37] hover:bg-[#b8962e] text-black font-bold text-xs uppercase tracking-widest rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.25)] transition-all mt-3"
              >
                Log Custom Item to {slotTitle}
              </button>
            </form>
          )}

          {/* TAB 4: Barcode Scanner Mockup / Architecture */}
          {activeTab === 'barcode' && (
            <div className="text-center py-6 space-y-3 bg-[#0e0e0e] rounded-xl border border-white/5 p-4">
              <div className="w-12 h-12 mx-auto rounded-xl bg-[#241e11] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
                <Barcode className="w-6 h-6" />
              </div>
              <h4 className="serif font-bold text-sm text-gray-200 uppercase tracking-wider">
                Barcode Food Scanner
              </h4>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                Ready for OpenFoodFacts & USDA UPC barcode lookups. Select any staple item below to simulate a live barcode scan:
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 text-left">
                {foods.slice(0, 4).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleAddFood(f)}
                    className="p-2.5 rounded-lg bg-[#181818] hover:bg-[#222222] border border-white/5 text-xs font-semibold text-gray-300 flex items-center justify-between"
                  >
                    <span className="truncate">{f.name}</span>
                    <span className="text-[10px] font-mono gold-text">{f.calories} kcal</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
