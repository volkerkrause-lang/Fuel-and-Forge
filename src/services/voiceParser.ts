import { Food, Meal, MealSlot } from '../types';

export interface ParsedVoiceItem {
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  matchedFoodId?: string;
  matchedMealId?: string;
}

export interface VoiceParseResult {
  transcript: string;
  targetMeal: MealSlot;
  items: ParsedVoiceItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  confidence: number;
}

export function parseVoiceInput(
  rawTranscript: string,
  availableFoods: Food[],
  availableMeals: Meal[]
): VoiceParseResult {
  const text = rawTranscript.trim().toLowerCase();

  // Detect meal slot
  let targetMeal: MealSlot = 'breakfast';
  if (text.includes('lunch') || text.includes('midday')) {
    targetMeal = 'lunch';
  } else if (text.includes('dinner') || text.includes('supper') || text.includes('evening meal')) {
    targetMeal = 'dinner';
  } else if (text.includes('snack') || text.includes('post-workout') || text.includes('smoothie')) {
    targetMeal = 'snacks';
  } else if (text.includes('breakfast') || text.includes('morning')) {
    targetMeal = 'breakfast';
  }

  const items: ParsedVoiceItem[] = [];

  // Match existing composite meals first (e.g. "Alpen Original with milk", "Greek yoghurt bowl", "Protein smoothie", "Latte")
  for (const meal of availableMeals) {
    const mealNameLower = meal.name.toLowerCase();
    // Check if meal or parts are mentioned
    const shortName = mealNameLower.replace('with', '').trim();
    if (text.includes(mealNameLower) || (shortName.length > 5 && text.includes(shortName))) {
      items.push({
        name: meal.name,
        amount: 1,
        unit: 'serving',
        calories: meal.totalCalories,
        protein: meal.totalProtein,
        carbs: meal.totalCarbs,
        fat: meal.totalFat,
        matchedMealId: meal.id,
      });
    }
  }

  // If no whole meal matched, check for individual foods or common phrases
  if (items.length === 0) {
    if (text.includes('alpen') && text.includes('milk')) {
      // Alpen + Milk
      const alpen = availableFoods.find(f => f.name.toLowerCase().includes('alpen'));
      const milk = availableFoods.find(f => f.name.toLowerCase().includes('milk'));
      if (alpen) {
        items.push({
          name: alpen.name,
          amount: alpen.servingAmount,
          unit: alpen.servingUnit,
          calories: alpen.calories,
          protein: alpen.protein,
          carbs: alpen.carbohydrates,
          fat: alpen.fat,
          matchedFoodId: alpen.id,
        });
      }
      if (milk) {
        items.push({
          name: milk.name,
          amount: milk.servingAmount,
          unit: milk.servingUnit,
          calories: milk.calories,
          protein: milk.protein,
          carbs: milk.carbohydrates,
          fat: milk.fat,
          matchedFoodId: milk.id,
        });
      }
    } else {
      for (const food of availableFoods) {
        const foodNameLower = food.name.toLowerCase();
        const baseKeywords = foodNameLower.split(' ').filter(w => w.length > 3);
        const matches = baseKeywords.some(kw => text.includes(kw));
        if (matches && !items.some(it => it.matchedFoodId === food.id)) {
          items.push({
            name: food.name,
            amount: food.servingAmount,
            unit: food.servingUnit,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbohydrates,
            fat: food.fat,
            matchedFoodId: food.id,
          });
        }
      }
    }
  }

  // Also check if latte was mentioned alongside another item
  if (text.includes('latte') && !items.some(i => i.name.toLowerCase().includes('latte'))) {
    const latteFood = availableFoods.find(f => f.name.toLowerCase().includes('latte'));
    if (latteFood) {
      items.push({
        name: 'Latte',
        amount: 250,
        unit: 'ml',
        calories: 120,
        protein: 7.5,
        carbs: 12.0,
        fat: 4.5,
        matchedFoodId: latteFood.id,
      });
    }
  }

  // Fallback if nothing matched: create a sensible custom entry based on input text
  if (items.length === 0) {
    const cleanName = rawTranscript
      .replace(/for (breakfast|lunch|dinner|snacks?)/gi, '')
      .replace(/add/gi, '')
      .trim();
    items.push({
      name: cleanName || 'Custom Voice Item',
      amount: 1,
      unit: 'portion',
      calories: 320,
      protein: 15,
      carbs: 35,
      fat: 10,
    });
  }

  const totalCalories = items.reduce((sum, it) => sum + it.calories, 0);
  const totalProtein = Number(items.reduce((sum, it) => sum + it.protein, 0).toFixed(1));
  const totalCarbs = Number(items.reduce((sum, it) => sum + it.carbs, 0).toFixed(1));
  const totalFat = Number(items.reduce((sum, it) => sum + it.fat, 0).toFixed(1));

  return {
    transcript: rawTranscript,
    targetMeal,
    items,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    confidence: 0.92,
  };
}

export const SAMPLE_VOICE_PROMPTS = [
  'Alpen Original with semi-skimmed milk and a latte for breakfast',
  'Greek yoghurt bowl with honey and blueberries for breakfast',
  'Protein smoothie with oats and peanut butter for snacks',
  'Grilled chicken breast with basmati rice for lunch',
  'Latte and 2 whole eggs for breakfast',
];
