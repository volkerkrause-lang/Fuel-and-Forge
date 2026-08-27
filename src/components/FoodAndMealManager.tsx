import React, { useEffect, useState } from 'react';
import {
  Check,
  Database,
  Layers,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  Utensils,
  X,
} from 'lucide-react';
import { Food, Meal, MealSlot } from '../types';
import { searchUsdaFoods } from '../services/foodDataCentral';
import { isFoodShownOnHome } from '../services/quickAdd';

interface FoodAndMealManagerProps {
  foods: Food[];
  meals: Meal[];
  onSaveFood: (food: Food) => void;
  onDeleteFood: (id: string) => void;
  onSaveMeal: (meal: Meal) => void;
  onDeleteMeal: (id: string) => void;
}

const ALL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

const emptyNutrition = {
  calories: '' as number | '',
  protein: '' as number | '',
  carbs: '' as number | '',
  fat: '' as number | '',
};

export const FoodAndMealManager: React.FC<FoodAndMealManagerProps> = ({
  foods,
  meals,
  onSaveFood,
  onDeleteFood,
  onSaveMeal,
  onDeleteMeal,
}) => {
  const [activeTab, setActiveTab] = useState<'meals' | 'foods'>('meals');
  const [showFoodFinder, setShowFoodFinder] = useState(false);
  const [showManualFood, setShowManualFood] = useState(false);
  const [showMealForm, setShowMealForm] = useState(false);

  const [foodQuery, setFoodQuery] = useState('');
  const [foodResults, setFoodResults] = useState<Food[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [foodSearchError, setFoodSearchError] = useState('');

  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [foodName, setFoodName] = useState('');
  const [foodServingAmount, setFoodServingAmount] = useState<number | ''>(100);
  const [foodServingUnit, setFoodServingUnit] = useState('g');
  const [foodNutrition, setFoodNutrition] = useState(emptyNutrition);

  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [mealName, setMealName] = useState('');
  const [mealNutrition, setMealNutrition] = useState(emptyNutrition);
  const [selectedFastAddSlots, setSelectedFastAddSlots] = useState<MealSlot[]>(['breakfast']);

  useEffect(() => {
    if (!showFoodFinder || foodQuery.trim().length < 2) {
      setFoodResults([]);
      setFoodSearchError('');
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setFoodSearchError('');
      try {
        setFoodResults(await searchUsdaFoods(foodQuery.trim(), controller.signal));
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setFoodSearchError('Food lookup is unavailable just now. You can still enter the values manually.');
        }
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [foodQuery, showFoodFinder]);

  const resetFoodForm = () => {
    setEditingFoodId(null);
    setFoodName('');
    setFoodServingAmount(100);
    setFoodServingUnit('g');
    setFoodNutrition(emptyNutrition);
    setShowManualFood(false);
  };

  const resetMealForm = () => {
    setEditingMealId(null);
    setMealName('');
    setMealNutrition(emptyNutrition);
    setSelectedFastAddSlots(['breakfast']);
  };

  const saveLookupFood = (food: Food) => {
    onSaveFood({
      ...food,
      id: `food_${Date.now()}`,
      category: food.category || 'Food lookup',
      isCustom: true,
      showOnHomeFastAdd: true,
    });
  };

  const editFood = (food: Food) => {
    setEditingFoodId(food.id);
    setFoodName(food.name);
    setFoodServingAmount(food.servingAmount);
    setFoodServingUnit(food.servingUnit);
    setFoodNutrition({
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbohydrates,
      fat: food.fat,
    });
    setShowManualFood(true);
    setShowFoodFinder(true);
  };

  const handleSaveFood = (event: React.FormEvent) => {
    event.preventDefault();
    if (!foodName.trim() || foodNutrition.calories === '') return;
    const previous = foods.find((food) => food.id === editingFoodId);
    onSaveFood({
      id: editingFoodId || `food_${Date.now()}`,
      name: foodName.trim(),
      servingAmount: Number(foodServingAmount || 100),
      servingUnit: foodServingUnit.trim() || 'g',
      calories: Number(foodNutrition.calories),
      protein: Number(foodNutrition.protein || 0),
      carbohydrates: Number(foodNutrition.carbs || 0),
      fat: Number(foodNutrition.fat || 0),
      category: 'My foods',
      isCustom: true,
      showOnHomeFastAdd: previous?.showOnHomeFastAdd ?? true,
    });
    resetFoodForm();
    setShowFoodFinder(false);
  };

  const editMeal = (meal: Meal) => {
    setEditingMealId(meal.id);
    setMealName(meal.name);
    setMealNutrition({
      calories: meal.totalCalories,
      protein: meal.totalProtein,
      carbs: meal.totalCarbs,
      fat: meal.totalFat,
    });
    setSelectedFastAddSlots(meal.showInFastAdd.length ? meal.showInFastAdd : ['breakfast']);
    setShowMealForm(true);
  };

  const handleSaveMeal = (event: React.FormEvent) => {
    event.preventDefault();
    if (!mealName.trim() || mealNutrition.calories === '' || selectedFastAddSlots.length === 0) return;
    const previous = meals.find((meal) => meal.id === editingMealId);
    onSaveMeal({
      id: editingMealId || `meal_${Date.now()}`,
      name: mealName.trim(),
      ingredients: previous?.ingredients || [],
      totalCalories: Number(mealNutrition.calories),
      totalProtein: Number(mealNutrition.protein || 0),
      totalCarbs: Number(mealNutrition.carbs || 0),
      totalFat: Number(mealNutrition.fat || 0),
      showInFastAdd: selectedFastAddSlots,
      isCustom: true,
    });
    resetMealForm();
    setShowMealForm(false);
  };

  const toggleSlot = (slot: MealSlot) => {
    setSelectedFastAddSlots((current) =>
      current.includes(slot) ? current.filter((item) => item !== slot) : [...current, slot]
    );
  };

  return (
    <div className="space-y-4 pb-12">
      <section className="card-bg rounded-2xl p-4 border border-white/5 space-y-3">
        <div>
          <h2 className="serif text-base font-bold text-white">Add food or a regular meal</h2>
          <p className="text-xs text-gray-400 mt-1">Choose the quickest route. Nutrition lookup fills the macros for you.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { resetFoodForm(); setShowFoodFinder(true); }}
            className="min-h-24 rounded-xl bg-[#181818] border border-white/10 hover:border-[#d4af37]/50 p-3 text-left transition-colors"
          >
            <Search className="w-5 h-5 text-[#d4af37] mb-2" />
            <span className="block text-sm font-bold text-white">Find a food</span>
            <span className="block text-[11px] text-gray-400 mt-1">Calories and P/C/F added automatically</span>
          </button>
          <button
            onClick={() => { resetMealForm(); setShowMealForm(true); }}
            className="min-h-24 rounded-xl bg-[#181818] border border-white/10 hover:border-orange-500/50 p-3 text-left transition-colors"
          >
            <Plus className="w-5 h-5 text-orange-400 mb-2" />
            <span className="block text-sm font-bold text-white">Add regular meal</span>
            <span className="block text-[11px] text-gray-400 mt-1">Enter your own calories and macros</span>
          </button>
        </div>
      </section>

      <div className="flex card-bg border border-white/5 rounded-xl p-1 shadow-md">
        <button
          onClick={() => setActiveTab('meals')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'meals' ? 'bg-[#d4af37] text-black' : 'text-gray-400'}`}
        >
          <Layers className="w-3.5 h-3.5" /> Saved meals ({meals.length})
        </button>
        <button
          onClick={() => setActiveTab('foods')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'foods' ? 'bg-[#d4af37] text-black' : 'text-gray-400'}`}
        >
          <Utensils className="w-3.5 h-3.5" /> My foods ({foods.length})
        </button>
      </div>

      {activeTab === 'meals' && (
        <div className="space-y-2">
          {meals.map((meal) => (
            <article key={meal.id} className="card-bg rounded-xl p-3.5 border border-white/5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-white">{meal.name}</h3>
                  <p className="text-[11px] font-mono text-gray-400 mt-1">
                    <span className="gold-text">{meal.totalCalories} kcal</span> · {meal.totalProtein}g P · {meal.totalCarbs}g C · {meal.totalFat}g F
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {meal.showInFastAdd.map((slot) => (
                      <span key={slot} className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#221c0e] text-[#d4af37] border border-[#d4af37]/25">{slot}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => editMeal(meal)} className="p-2 text-gray-400 hover:text-[#d4af37]" aria-label={`Edit ${meal.name}`}><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => onDeleteMeal(meal.id)} className="p-2 text-gray-500 hover:text-rose-400" aria-label={`Delete ${meal.name}`}><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {activeTab === 'foods' && (
        <div className="space-y-2">
          {foods.map((food) => (
            <article key={food.id} className="card-bg rounded-xl p-3.5 border border-white/5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-white">{food.name}</h3>
                <p className="text-[11px] font-mono text-gray-400 mt-1">
                  {food.servingAmount}{food.servingUnit} · <span className="gold-text">{food.calories} kcal</span> · {food.protein}g P · {food.carbohydrates}g C · {food.fat}g F
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onSaveFood({ ...food, showOnHomeFastAdd: !isFoodShownOnHome(food) })}
                  className={`p-2 ${isFoodShownOnHome(food) ? 'text-[#d4af37]' : 'text-gray-500 hover:text-[#d4af37]'}`}
                  aria-label={isFoodShownOnHome(food) ? `Remove ${food.name} from Home Fast Add` : `Show ${food.name} on Home Fast Add`}
                  title={isFoodShownOnHome(food) ? 'Shown on Home' : 'Show on Home'}
                >
                  <Star className={`w-3.5 h-3.5 ${isFoodShownOnHome(food) ? 'fill-current' : ''}`} />
                </button>
                <button onClick={() => editFood(food)} className="p-2 text-gray-400 hover:text-[#d4af37]" aria-label={`Edit ${food.name}`}><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => onDeleteFood(food.id)} className="p-2 text-gray-500 hover:text-rose-400" aria-label={`Delete ${food.name}`}><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </article>
          ))}
        </div>
      )}

      {showFoodFinder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md card-bg border border-white/10 rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="serif font-bold text-base text-white">Find a food</h3>
                <p className="text-[11px] text-gray-400 mt-1">Search results show nutrition per 100 g.</p>
              </div>
              <button onClick={() => { setShowFoodFinder(false); resetFoodForm(); }} className="p-1.5 text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            {!showManualFood && (
              <>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                  <input autoFocus value={foodQuery} onChange={(event) => setFoodQuery(event.target.value)} placeholder="Type a food, e.g. banana or chicken breast" className="w-full pl-9 pr-3 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]" />
                </div>
                {isSearching && <p className="text-xs text-gray-400 flex items-center gap-2"><LoaderCircle className="w-3.5 h-3.5 animate-spin" /> Finding nutrition…</p>}
                {foodSearchError && <p className="text-xs text-amber-300">{foodSearchError}</p>}
                <div className="space-y-2">
                  {foodResults.map((food) => {
                    const alreadySaved = foods.some((item) => item.name.toLowerCase() === food.name.toLowerCase());
                    return (
                      <div key={food.id} className="rounded-xl bg-[#181818] border border-white/5 p-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{food.name}</p>
                          {food.brand && <p className="text-[10px] text-gray-500 truncate">{food.brand}</p>}
                          <p className="text-[10px] font-mono text-gray-400 mt-1"><span className="gold-text">{Math.round(food.calories)} kcal</span> · {food.protein.toFixed(1)}g P · {food.carbohydrates.toFixed(1)}g C · {food.fat.toFixed(1)}g F</p>
                        </div>
                        <button disabled={alreadySaved} onClick={() => saveLookupFood(food)} className="shrink-0 px-2.5 py-2 rounded-lg bg-[#d4af37] disabled:bg-emerald-900/40 disabled:text-emerald-300 text-black text-[10px] font-bold uppercase">
                          {alreadySaved ? <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Saved</span> : 'Save'}
                        </button>
                      </div>
                    );
                  })}
                </div>
                {foodQuery.trim().length < 2 && <div className="py-5 text-center text-gray-500"><Database className="w-7 h-7 mx-auto mb-2 opacity-50" /><p className="text-xs">Enter at least two letters to search.</p></div>}
                <button onClick={() => setShowManualFood(true)} className="w-full py-2 text-xs text-gray-400 hover:text-white underline underline-offset-4">Can't find it? Enter nutrition manually</button>
              </>
            )}

            {showManualFood && (
              <form onSubmit={handleSaveFood} className="space-y-3">
                <input required value={foodName} onChange={(event) => setFoodName(event.target.value)} placeholder="Food name" className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-lg text-xs text-white" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" min="0.1" step="0.1" value={foodServingAmount} onChange={(event) => setFoodServingAmount(event.target.value ? Number(event.target.value) : '')} placeholder="Serving amount" className="px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-xs text-white" />
                  <input value={foodServingUnit} onChange={(event) => setFoodServingUnit(event.target.value)} placeholder="Unit (g, ml, item)" className="px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-xs text-white" />
                </div>
                <NutritionInputs value={foodNutrition} onChange={setFoodNutrition} />
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => editingFoodId ? setShowFoodFinder(false) : setShowManualFood(false)} className="flex-1 py-2.5 rounded-lg bg-[#181818] text-xs text-gray-300">Back</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-lg bg-[#d4af37] text-black text-xs font-bold">Save food</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showMealForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm card-bg border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="serif font-bold text-base text-white">{editingMealId ? 'Edit regular meal' : 'Add regular meal'}</h3>
                <p className="text-[11px] text-gray-400 mt-1">It will appear in Saved meals on Home.</p>
              </div>
              <button onClick={() => { setShowMealForm(false); resetMealForm(); }} className="p-1.5 text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveMeal} className="space-y-3">
              <input autoFocus required value={mealName} onChange={(event) => setMealName(event.target.value)} placeholder="Meal name" className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-lg text-xs text-white" />
              <NutritionInputs value={mealNutrition} onChange={setMealNutrition} />
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Where do you usually eat it?</label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_SLOTS.map((slot) => (
                    <button type="button" key={slot} onClick={() => toggleSlot(slot)} className={`py-2 rounded-lg text-xs capitalize border ${selectedFastAddSlots.includes(slot) ? 'bg-[#d4af37] text-black border-[#d4af37] font-bold' : 'bg-[#181818] text-gray-400 border-white/5'}`}>{slot}</button>
                  ))}
                </div>
                {selectedFastAddSlots.length === 0 && <p className="text-[10px] text-amber-300 mt-2">Choose at least one meal time.</p>}
              </div>
              <button type="submit" disabled={selectedFastAddSlots.length === 0} className="w-full py-2.5 rounded-lg bg-[#d4af37] disabled:opacity-40 text-black text-xs font-bold">Save to Home Fast Add</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface NutritionInputsProps {
  value: typeof emptyNutrition;
  onChange: React.Dispatch<React.SetStateAction<typeof emptyNutrition>>;
}

const NutritionInputs: React.FC<NutritionInputsProps> = ({ value, onChange }) => {
  const fields: Array<{ key: keyof typeof emptyNutrition; label: string; placeholder: string }> = [
    { key: 'calories', label: 'Calories (kcal) *', placeholder: '450' },
    { key: 'protein', label: 'Protein (g)', placeholder: '30' },
    { key: 'carbs', label: 'Carbohydrates (g)', placeholder: '45' },
    { key: 'fat', label: 'Fat (g)', placeholder: '15' },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {fields.map((field) => (
        <label key={field.key} className="text-[10px] uppercase tracking-wider text-gray-400">
          {field.label}
          <input
            type="number"
            required={field.key === 'calories'}
            min="0"
            step="0.1"
            value={value[field.key]}
            onChange={(event) => onChange((current) => ({ ...current, [field.key]: event.target.value ? Number(event.target.value) : '' }))}
            placeholder={field.placeholder}
            className="w-full mt-1 px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
          />
        </label>
      ))}
    </div>
  );
};
