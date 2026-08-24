import { UserProfile, UserSettings, NutritionTargets, UnitPreferences, ActivityLevel } from '../types';

/**
 * Calculate age in completed years from ISO DOB string (YYYY-MM-DD)
 */
export function calculateAge(dob: string): number {
  if (!dob) return 30; // sensible default
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(16, age);
}

/**
 * Mifflin-St Jeor BMR Equation (Standard recognized modern formula)
 * Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
 * Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  sex: 'male' | 'female',
  ageYears: number
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  const bmr = sex === 'male' ? base + 5 : base - 161;
  return Math.round(Math.max(800, bmr));
}

/**
 * Activity Multipliers for TDEE (Total Daily Energy Expenditure)
 * - Sedentary / Not very active: 1.2
 * - Lightly active: 1.375
 * - Active: 1.55
 * - Very active: 1.725
 */
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
};

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.375;
  return Math.round(bmr * multiplier);
}

/**
 * Calculate evidence-based nutrition targets based on profile and settings.
 * 1 kg fat tissue ≈ 7,700 kcal.
 * Weekly rate of weight change corresponds to: (weeklyGoalKgChange * 7700) / 7 kcal per day.
 */
export function calculateNutritionTargets(
  profile: Partial<UserProfile>,
  settings: Partial<UserSettings>
): NutritionTargets {
  const weightKg = profile.currentWeightKg || profile.startingWeightKg || 80;
  const heightCm = profile.heightCm || 178;
  const sex = profile.sex || 'male';
  const age = profile.dob ? calculateAge(profile.dob) : 30;
  const activityLevel = settings.activityLevel || 'light';
  const weeklyGoalKgChange = settings.maintenanceMode ? 0 : (settings.weeklyGoalKgChange ?? -0.5);

  const bmr = calculateBMR(weightKg, heightCm, sex, age);
  const tdee = calculateTDEE(bmr, activityLevel);

  // Daily calorie adjustment based on rate: e.g. -0.5kg/wk => -550 kcal/day
  const dailyCalorieAdjustment = Math.round((weeklyGoalKgChange * 7700) / 7);
  
  // Floor safety limits: 1500 kcal for men, 1200 kcal for women
  const floorCalories = sex === 'male' ? 1500 : 1200;
  const rawCalories = tdee + dailyCalorieAdjustment;
  const calories = Math.max(floorCalories, Math.round(rawCalories));

  // Protein calculation: ~1.8g - 2.0g per kg for muscle preservation during deficit or training
  const proteinMultiplier = weeklyGoalKgChange < 0 ? 2.0 : 1.8;
  const proteinGrams = Math.round(weightKg * proteinMultiplier);
  const proteinCalories = proteinGrams * 4;

  // Fat calculation: ~28% of total calories (9 kcal/g)
  const fatCalories = Math.round(calories * 0.28);
  const fatGrams = Math.round(fatCalories / 9);

  // Carbohydrate calculation: remaining calories (4 kcal/g)
  const remainingCalories = Math.max(200, calories - (proteinCalories + fatCalories));
  const carbsGrams = Math.round(remainingCalories / 4);

  // Hydration target: ~35 ml per kg of body weight, rounded to 250ml intervals
  const rawWater = weightKg * 35;
  const waterTargetMl = Math.max(2000, Math.round(rawWater / 250) * 250);

  return {
    bmr,
    tdee,
    calories,
    proteinGrams,
    carbsGrams,
    fatGrams,
    waterTargetMl,
  };
}

/**
 * Estimate target completion date based on goal and weekly rate
 */
export function calculateProjectedTargetDate(
  currentWeightKg: number,
  targetWeightKg: number,
  weeklyGoalKgChange: number,
  startDate: Date = new Date()
): { dateStr: string; weeks: number } {
  const diffKg = Math.abs(currentWeightKg - targetWeightKg);
  const rate = Math.abs(weeklyGoalKgChange);

  if (diffKg < 0.2 || rate === 0) {
    return {
      dateStr: 'Goal achieved / Maintenance',
      weeks: 0,
    };
  }

  const weeks = Math.ceil(diffKg / rate);
  const targetDate = new Date(startDate.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
  
  return {
    dateStr: targetDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    weeks,
  };
}

// Unit Conversion Helpers
export function formatWeight(kg: number, unit: 'kg' | 'lb' = 'kg'): string {
  if (unit === 'lb') {
    return `${(kg * 2.20462).toFixed(1)} lb`;
  }
  return `${kg.toFixed(1)} kg`;
}

export function weightToUnit(kg: number, unit: 'kg' | 'lb' = 'kg'): number {
  if (unit === 'lb') {
    return Number((kg * 2.20462).toFixed(1));
  }
  return Number(kg.toFixed(1));
}

export function weightFromUnit(val: number, unit: 'kg' | 'lb' = 'kg'): number {
  if (unit === 'lb') {
    return Number((val / 2.20462).toFixed(2));
  }
  return Number(val.toFixed(2));
}

export function formatHeight(cm: number, unit: 'cm' | 'in' = 'cm'): string {
  if (unit === 'in') {
    const totalInches = Math.round(cm / 2.54);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return `${feet}' ${inches}"`;
  }
  return `${Math.round(cm)} cm`;
}

export function formatEnergy(kcal: number, unit: 'kcal' | 'kJ' = 'kcal'): string {
  if (unit === 'kJ') {
    return `${Math.round(kcal * 4.184).toLocaleString()} kJ`;
  }
  return `${Math.round(kcal).toLocaleString()} kcal`;
}

export function formatWater(ml: number, unit: 'ml' | 'fl_oz' = 'ml'): string {
  if (unit === 'fl_oz') {
    return `${(ml * 0.033814).toFixed(1)} fl oz`;
  }
  if (ml >= 1000) {
    return `${(ml / 1000).toFixed(2)} L`;
  }
  return `${Math.round(ml)} ml`;
}
