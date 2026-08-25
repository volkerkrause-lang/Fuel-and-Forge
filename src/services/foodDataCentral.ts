import { Food } from '../types';

type FdcNutrient = { nutrientId?: number; nutrientName?: string; unitName?: string; value?: number };
type FdcFood = { fdcId: number; description: string; brandOwner?: string; dataType?: string; foodNutrients?: FdcNutrient[] };

const nutrient = (food: FdcFood, id: number, names: string[]) => {
  const match = food.foodNutrients?.find((n) => n.nutrientId === id || names.includes((n.nutrientName || '').toLowerCase()));
  return Number(match?.value || 0);
};

export async function searchUsdaFoods(query: string, signal?: AbortSignal): Promise<Food[]> {
  const key = import.meta.env.VITE_USDA_FDC_API_KEY || 'DEMO_KEY';
  const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(key)}&query=${encodeURIComponent(query)}&pageSize=15`, { signal });
  if (!response.ok) throw new Error(`USDA search failed (${response.status})`);
  const data = await response.json();
  return (data.foods || []).map((food: FdcFood) => ({
    id: `usda_${food.fdcId}`,
    name: food.description,
    brand: food.brandOwner,
    category: food.dataType,
    servingAmount: 100,
    servingUnit: 'g',
    calories: nutrient(food, 1008, ['energy']),
    protein: nutrient(food, 1003, ['protein']),
    carbohydrates: nutrient(food, 1005, ['carbohydrate, by difference']),
    fat: nutrient(food, 1004, ['total lipid (fat)']),
  })).filter((food: Food) => food.calories || food.protein || food.carbohydrates || food.fat);
}
