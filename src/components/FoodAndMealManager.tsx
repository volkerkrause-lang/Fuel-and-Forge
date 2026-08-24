import React, { useState } from 'react';
import { Plus, Trash2, Utensils, Layers, X } from 'lucide-react';
import { Food, Meal, MealIngredient, MealSlot } from '../types';

interface FoodAndMealManagerProps {
  foods: Food[];
  meals: Meal[];
  onSaveFood: (food: Food) => void;
  onDeleteFood: (id: string) => void;
  onSaveMeal: (meal: Meal) => void;
  onDeleteMeal: (id: string) => void;
}

export const FoodAndMealManager: React.FC<FoodAndMealManagerProps> = ({
  foods,
  meals,
  onSaveFood,
  onDeleteFood,
  onSaveMeal,
  onDeleteMeal,
}) => {
  const [activeTab, setActiveTab] = useState<'meals' | 'foods'>('meals');
  const [showMealBuilder, setShowMealBuilder] = useState(false);
  const [showFoodForm, setShowFoodForm] = useState(false);

  // New Food Form State
  const [foodName, setFoodName] = useState('');
  const [foodServingAmount, setFoodServingAmount] = useState<number | ''>(100);
  const [foodServingUnit, setFoodServingUnit] = useState('g');
  const [foodCalories, setFoodCalories] = useState<number | ''>('');
  const [foodProtein, setFoodProtein] = useState<number | ''>('');
  const [foodCarbs, setFoodCarbs] = useState<number | ''>('');
  const [foodFat, setFoodFat] = useState<number | ''>('');
  const [foodCategory] = useState('Pantry');

  // Meal Builder State
  const [mealName, setMealName] = useState('');
  const [selectedFastAddSlots, setSelectedFastAddSlots] = useState<MealSlot[]>(['breakfast']);
  const [mealIngredients, setMealIngredients] = useState<MealIngredient[]>([]);
  const [ingredientFoodId, setIngredientFoodId] = useState(foods[0]?.id || '');
  const [ingredientAmount, setIngredientAmount] = useState<number | ''>(100);

  const handleAddIngredient = () => {
    const targetFood = foods.find((f) => f.id === ingredientFoodId);
    if (!targetFood || !ingredientAmount) return;

    const ratio = Number(ingredientAmount) / (targetFood.servingAmount || 1);
    const newIngredient: MealIngredient = {
      foodId: targetFood.id,
      name: targetFood.name,
      amount: Number(ingredientAmount),
      unit: targetFood.servingUnit,
      calories: Math.round(targetFood.calories * ratio),
      protein: Number((targetFood.protein * ratio).toFixed(1)),
      carbohydrates: Number((targetFood.carbohydrates * ratio).toFixed(1)),
      fat: Number((targetFood.fat * ratio).toFixed(1)),
    };

    setMealIngredients([...mealIngredients, newIngredient]);
  };

  const handleRemoveIngredient = (index: number) => {
    setMealIngredients(mealIngredients.filter((_, idx) => idx !== index));
  };

  const handleSaveMealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim() || mealIngredients.length === 0) return;

    const totalCal = mealIngredients.reduce((sum, i) => sum + i.calories, 0);
    const totalProt = Number(mealIngredients.reduce((sum, i) => sum + i.protein, 0).toFixed(1));
    const totalCarb = Number(mealIngredients.reduce((sum, i) => sum + i.carbohydrates, 0).toFixed(1));
    const totalF = Number(mealIngredients.reduce((sum, i) => sum + i.fat, 0).toFixed(1));

    const newMeal: Meal = {
      id: `meal_${Date.now()}`,
      name: mealName.trim(),
      ingredients: mealIngredients,
      totalCalories: totalCal,
      totalProtein: totalProt,
      totalCarbs: totalCarb,
      totalFat: totalF,
      showInFastAdd: selectedFastAddSlots,
      isCustom: true,
    };

    onSaveMeal(newMeal);
    setShowMealBuilder(false);
    setMealName('');
    setMealIngredients([]);
  };

  const handleSaveFoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim() || foodCalories === '') return;

    const newFood: Food = {
      id: `food_${Date.now()}`,
      name: foodName.trim(),
      servingAmount: Number(foodServingAmount || 100),
      servingUnit: foodServingUnit,
      calories: Number(foodCalories),
      protein: Number(foodProtein || 0),
      carbohydrates: Number(foodCarbs || 0),
      fat: Number(foodFat || 0),
      category: foodCategory,
      isCustom: true,
    };

    onSaveFood(newFood);
    setShowFoodForm(false);
    setFoodName('');
    setFoodCalories('');
    setFoodProtein('');
    setFoodCarbs('');
    setFoodFat('');
  };

  const toggleSlot = (slot: MealSlot) => {
    if (selectedFastAddSlots.includes(slot)) {
      setSelectedFastAddSlots(selectedFastAddSlots.filter((s) => s !== slot));
    } else {
      setSelectedFastAddSlots([...selectedFastAddSlots, slot]);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Switch Tabs */}
      <div className="flex card-bg border border-white/5 rounded-xl p-1 shadow-md">
        <button
          onClick={() => setActiveTab('meals')}
          className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'meals'
              ? 'bg-[#d4af37] text-black shadow-[0_0_12px_rgba(212,175,55,0.25)]'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Curated Menus ({meals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('foods')}
          className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'foods'
              ? 'bg-[#d4af37] text-black shadow-[0_0_12px_rgba(212,175,55,0.25)]'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Food Pantry ({foods.length})</span>
        </button>
      </div>

      {/* TAB 1: MEAL BUILDER & LIBRARY */}
      {activeTab === 'meals' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="serif text-xs font-semibold uppercase tracking-widest text-gray-200">
                Preset Meal Templates
              </h3>
              <p className="text-[11px] font-mono text-gray-400">Multi-ingredient precision fueling</p>
            </div>
            <button
              onClick={() => setShowMealBuilder(true)}
              className="py-1.5 px-3 rounded-lg bg-[#221c0e] hover:bg-[#332a15] border border-[#d4af37]/40 text-[#d4af37] font-bold text-xs uppercase tracking-wider flex items-center space-x-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Build Meal</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="card-bg rounded-xl p-4 shadow-lg space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="serif font-semibold text-sm text-gray-100">{meal.name}</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {meal.showInFastAdd.map((slot) => (
                        <span
                          key={slot}
                          className="text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-[#221c0e] text-[#d4af37] border border-[#d4af37]/30"
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="serif font-bold text-sm gold-text font-mono">
                      {meal.totalCalories} kcal
                    </span>
                    {meal.isCustom && (
                      <button
                        onClick={() => onDeleteMeal(meal.id)}
                        className="p-1 text-gray-600 hover:text-rose-400"
                        title="Delete meal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-[#181818] p-2.5 rounded-lg border border-white/5 text-xs space-y-1">
                  <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider block">
                    Ingredients
                  </span>
                  <p className="text-gray-300 text-xs font-sans">
                    {meal.ingredients.map((i) => `${i.name} (${i.amount}${i.unit})`).join(' • ')}
                  </p>
                  <div className="flex items-center space-x-3 pt-1 text-[11px] font-mono font-medium text-gray-400">
                    <span className="text-emerald-400">{meal.totalProtein}g Protein</span>
                    <span className="text-amber-400">{meal.totalCarbs}g Carbs</span>
                    <span className="text-rose-400">{meal.totalFat}g Fat</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: FOODS DATABASE */}
      {activeTab === 'foods' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="serif text-xs font-semibold uppercase tracking-widest text-gray-200">
                Nutritional Foods
              </h3>
              <p className="text-[11px] font-mono text-gray-400">Pantry staples and custom items</p>
            </div>
            <button
              onClick={() => setShowFoodForm(true)}
              className="py-1.5 px-3 rounded-lg bg-[#221c0e] hover:bg-[#332a15] border border-[#d4af37]/40 text-[#d4af37] font-bold text-xs uppercase tracking-wider flex items-center space-x-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Food</span>
            </button>
          </div>

          <div className="space-y-2">
            {foods.map((food) => (
              <div
                key={food.id}
                className="card-bg rounded-xl p-3.5 flex items-center justify-between"
              >
                <div>
                  <h4 className="serif font-semibold text-xs text-gray-200">{food.name}</h4>
                  <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                    {food.servingAmount}{food.servingUnit} • {food.calories} kcal •{' '}
                    <span className="text-emerald-400">{food.protein}g P</span> •{' '}
                    <span className="text-amber-400">{food.carbohydrates}g C</span> •{' '}
                    <span className="text-rose-400">{food.fat}g F</span>
                  </p>
                </div>

                {food.isCustom && (
                  <button
                    onClick={() => onDeleteFood(food.id)}
                    className="p-1 text-gray-600 hover:text-rose-400"
                    title="Delete food"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Build Meal Modal */}
      {showMealBuilder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md card-bg border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="serif font-bold text-base text-white uppercase tracking-wider">Create Custom Meal</h3>
              <button
                onClick={() => setShowMealBuilder(false)}
                className="w-7 h-7 rounded-lg bg-[#181818] text-gray-400 hover:text-white flex items-center justify-center border border-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMealSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1">Meal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Signature Post-Workout Fuel"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              {/* Show in Fast Add Checkboxes */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1.5">
                  Slot Assignment:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealSlot[]).map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => toggleSlot(slot)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-mono font-bold capitalize transition-all ${
                        selectedFastAddSlots.includes(slot)
                          ? 'bg-[#d4af37] text-black shadow-[0_0_10px_rgba(212,175,55,0.25)]'
                          : 'bg-[#181818] text-gray-400 border border-white/5'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Ingredient Section */}
              <div className="bg-[#181818] p-3 rounded-lg border border-white/5 space-y-2">
                <span className="serif text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Add Ingredient
                </span>
                <div className="space-y-2">
                  <select
                    value={ingredientFoodId}
                    onChange={(e) => setIngredientFoodId(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    {foods.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.calories} kcal / {f.servingAmount}
                        {f.servingUnit})
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Amount"
                      value={ingredientAmount}
                      onChange={(e) =>
                        setIngredientAmount(e.target.value ? Number(e.target.value) : '')
                      }
                      className="w-24 bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                    />
                    <span className="text-xs font-mono text-gray-400">grams/ml</span>
                    <button
                      type="button"
                      onClick={handleAddIngredient}
                      className="ml-auto px-3 py-1.5 rounded-lg bg-[#221c0e] hover:bg-[#332a15] text-[#d4af37] border border-[#d4af37]/40 text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Added Ingredients List */}
              {mealIngredients.length > 0 && (
                <div className="space-y-1.5">
                  <span className="serif text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                    Included Ingredients ({mealIngredients.length})
                  </span>
                  {mealIngredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-[#181818] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <span className="text-gray-200 font-sans">
                        {ing.name} ({ing.amount}
                        {ing.unit}) - <span className="font-mono text-[#d4af37]">{ing.calories} kcal</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(idx)}
                        className="text-gray-500 hover:text-rose-400 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={mealIngredients.length === 0}
                className="w-full py-2.5 bg-[#d4af37] hover:bg-[#b8962e] text-black font-bold text-xs uppercase tracking-widest rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.25)] transition-all disabled:opacity-40"
              >
                Save Meal Template
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Food Modal */}
      {showFoodForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm card-bg border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="serif font-bold text-base text-white uppercase tracking-wider">Add Food Item</h3>
            <form onSubmit={handleSaveFoodSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1">Food Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sourdough Bread"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1">Serving</label>
                  <input
                    type="number"
                    value={foodServingAmount}
                    onChange={(e) =>
                      setFoodServingAmount(e.target.value ? Number(e.target.value) : '')
                    }
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1">Unit</label>
                  <input
                    type="text"
                    value={foodServingUnit}
                    onChange={(e) => setFoodServingUnit(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1">Kcal *</label>
                  <input
                    type="number"
                    required
                    value={foodCalories}
                    onChange={(e) =>
                      setFoodCalories(e.target.value ? Number(e.target.value) : '')
                    }
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={foodProtein}
                    onChange={(e) =>
                      setFoodProtein(e.target.value ? Number(e.target.value) : '')
                    }
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={foodCarbs}
                    onChange={(e) => setFoodCarbs(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1">Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={foodFat}
                    onChange={(e) => setFoodFat(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFoodForm(false)}
                  className="flex-1 py-2.5 rounded-lg bg-[#181818] text-gray-400 hover:text-white text-xs uppercase font-semibold border border-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-[#d4af37] hover:bg-[#b8962e] text-black font-bold text-xs uppercase tracking-widest shadow-[0_0_12px_rgba(212,175,55,0.25)]"
                >
                  Save Food
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
