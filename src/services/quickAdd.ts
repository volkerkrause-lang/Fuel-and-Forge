import { Food } from '../types';

const DEFAULT_HOME_FOOD_IDS = new Set([
  'food_latte',
  'food_greek_yoghurt_5',
  'food_whey_protein',
  'food_banana',
]);

export const isFoodShownOnHome = (food: Food): boolean =>
  food.showOnHomeFastAdd ?? Boolean(food.isCustom || DEFAULT_HOME_FOOD_IDS.has(food.id));
