export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active';
export type FitnessLocation = 'gym' | 'home' | 'both';
export type ExerciseCategory = 'cardio' | 'assisted' | 'weighted' | 'bodyweight';

export interface UserProfile {
  name: string;
  sex: 'male' | 'female';
  dob: string; // YYYY-MM-DD
  heightCm: number;
  country: string;
  startingWeightKg: number;
  currentWeightKg: number;
  targetWeightKg: number;
  startingWaistCm?: number;
  currentWaistCm?: number;
  startDate: string;
  isOnboarded: boolean;
}

export interface UnitPreferences {
  weight: 'kg' | 'lb';
  height: 'cm' | 'in';
  energy: 'kcal' | 'kJ';
  water: 'ml' | 'fl_oz';
}

export interface UserSettings {
  units: UnitPreferences;
  glassSizeMl: number;
  defaultRestTimeSeconds: number;
  soundAlerts: boolean;
  automaticTargets: boolean;
  activityLevel: ActivityLevel;
  weeklyGoalKgChange: number; // e.g. -0.5 for lose 0.5kg/wk, 0 for maintain, +0.25
  fitnessLocation: FitnessLocation;
  targetWorkoutsPerWeek: number;
  maintenanceMode: boolean;
}

export interface NutritionTargets {
  bmr: number;
  tdee: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  waterTargetMl: number;
  manualOverrides?: {
    calories?: number;
    proteinGrams?: number;
    carbsGrams?: number;
    fatGrams?: number;
    waterTargetMl?: number;
  };
}

export interface Food {
  id: string;
  name: string;
  servingAmount: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  per100g?: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  };
  brand?: string;
  category?: string;
  isCustom?: boolean;
  showOnHomeFastAdd?: boolean;
}

export interface MealIngredient {
  foodId: string;
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

export interface Meal {
  id: string;
  name: string;
  ingredients: MealIngredient[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  showInFastAdd: MealSlot[];
  isCustom?: boolean;
}

export interface FoodLog {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealSlot;
  name: string;
  portionMultiplier: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  originalItemType: 'food' | 'meal' | 'custom';
  originalItemId?: string;
  timestamp: number;
}

export interface WaterLog {
  id: string;
  date: string; // YYYY-MM-DD
  glasses: number;
  totalMl: number;
  amountMl?: number;
  targetMl?: number;
}

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  targetMuscle: string;
  defaultRestSeconds: number;
  instructions?: string;
}

export interface RoutineExercise {
  id: string;
  exerciseId: string;
  name: string;
  category: ExerciseCategory;
  targetMuscle: string;
  defaultRestSeconds: number;
  setsCount: number;
  cardioDurationMin?: number;
  cardioLevel?: number;
  defaultWeightOrAssistanceKg?: number;
  defaultReps?: number;
  order: number;
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  description: string;
  targetFrequencyPerWeek: number;
  exercises: RoutineExercise[];
}

export interface ExerciseSet {
  id: string;
  setNumber: number;
  previousStr: string;
  weightOrAssistanceKg?: number;
  reps?: number;
  durationMin?: number;
  level?: number;
  isCompleted: boolean;
  completedAt?: number;
}

export interface SessionExercise {
  id: string;
  exerciseId: string;
  name: string;
  category: ExerciseCategory;
  targetMuscle: string;
  restSeconds: number;
  sets: ExerciseSet[];
  order: number;
}

export interface WorkoutSession {
  id: string;
  routineId: string;
  routineName: string;
  date: string; // YYYY-MM-DD
  startTime: number;
  endTime?: number;
  exercises: SessionExercise[];
  totalVolumeKg: number;
  bodyweightRepsCount: number;
  isCompleted: boolean;
}

export interface BodyMeasurement {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  waistCm?: number;
  notes?: string;
}

export interface Achievement {
  id: string;
  code: 'STREAK' | 'STRONGER' | 'ON_TARGET' | 'MOMENTUM' | 'PROGRESSIVE' | 'HALFWAY' | 'GOAL_ACHIEVED';
  title: string;
  description: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  iconName: string;
}

export interface MomentumState {
  score: number; // 0 - 100
  title: 'Starting Out' | 'Building' | 'Consistent' | 'In Motion' | 'Strong' | 'Unstoppable';
  consecutiveDays: number;
  totalWorkouts: number;
  streakDays: number;
  heatPercentage: number;
  nutritionAdherence: number;
  proteinHitDays: number;
}

export interface LearningArticle {
  id: string;
  title: string;
  category: 'Nutrition' | 'Training';
  summary: string;
  content: string;
  keyTakeaway: string;
  sourceName: string;
  sourceUrl?: string;
  isLearned: boolean;
  isSavedForLater: boolean;
  readTimeMinutes: number;
}

export interface ContextualTip {
  id: string;
  title: string;
  message: string;
  category: 'progression' | 'nutrition' | 'recovery';
  isDismissed: boolean;
  timestamp: number;
}

export interface AppDataSnapshot {
  version: number;
  profile: UserProfile;
  settings: UserSettings;
  nutritionTargets: NutritionTargets;
  foods: Food[];
  meals: Meal[];
  foodLogs: FoodLog[];
  waterLogs: WaterLog[];
  workoutRoutines: WorkoutRoutine[];
  workoutSessions: WorkoutSession[];
  bodyMeasurements: BodyMeasurement[];
  achievements: Achievement[];
  learningArticles: LearningArticle[];
  tips: ContextualTip[];
}
