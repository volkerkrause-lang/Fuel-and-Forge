import {
  UserProfile,
  UserSettings,
  NutritionTargets,
  Food,
  Meal,
  FoodLog,
  WaterLog,
  WorkoutRoutine,
  WorkoutSession,
  BodyMeasurement,
  Achievement,
  LearningArticle,
  ContextualTip,
  MomentumState,
  AppDataSnapshot,
  MealSlot,
  SessionExercise,
} from '../types';
import {
  SEED_PROFILE,
  SEED_SETTINGS,
  SEED_NUTRITION_TARGETS,
  SEED_FOODS,
  SEED_MEALS,
  SEED_DEFAULT_ROUTINE,
  SEED_ACHIEVEMENTS,
  SEED_LEARNING_ARTICLES,
  SEED_INITIAL_MEASUREMENTS,
  SEED_INITIAL_SESSIONS,
  SEED_INITIAL_FOOD_LOGS,
  SEED_INITIAL_WATER_LOGS,
} from '../data/seedData';
import { calculateNutritionTargets } from './calculator';

const STORAGE_KEYS = {
  VERSION: 'forge_fuel_version_v1',
  PROFILE: 'forge_fuel_profile',
  SETTINGS: 'forge_fuel_settings',
  TARGETS: 'forge_fuel_targets',
  FOODS: 'forge_fuel_foods',
  MEALS: 'forge_fuel_meals',
  FOOD_LOGS: 'forge_fuel_food_logs',
  WATER_LOGS: 'forge_fuel_water_logs',
  ROUTINES: 'forge_fuel_routines',
  SESSIONS: 'forge_fuel_sessions',
  ACTIVE_SESSION: 'forge_fuel_active_session',
  MEASUREMENTS: 'forge_fuel_measurements',
  MOMENTUM: 'forge_fuel_momentum',
  ACHIEVEMENTS: 'forge_fuel_achievements',
  ARTICLES: 'forge_fuel_articles',
  TIPS: 'forge_fuel_tips',
};

export class StorageService {
  private static isInitialized = false;

  public static initialize(): void {
    if (this.isInitialized) return;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (!localStorage.getItem(STORAGE_KEYS.VERSION)) {
          this.seedAllDefaults();
        }
      }
      this.isInitialized = true;
    } catch (e) {
      console.warn('LocalStorage unavailable or sandboxed:', e);
    }
  }

  public static seedAllDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.VERSION, '1.0.0');
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(SEED_PROFILE));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(SEED_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.TARGETS, JSON.stringify(SEED_NUTRITION_TARGETS));
    localStorage.setItem(STORAGE_KEYS.FOODS, JSON.stringify(SEED_FOODS));
    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(SEED_MEALS));
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify([SEED_DEFAULT_ROUTINE]));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(SEED_INITIAL_SESSIONS));
    localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(SEED_INITIAL_MEASUREMENTS));
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(SEED_ACHIEVEMENTS));
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(SEED_LEARNING_ARTICLES));
    localStorage.setItem(STORAGE_KEYS.FOOD_LOGS, JSON.stringify(SEED_INITIAL_FOOD_LOGS));
    localStorage.setItem(STORAGE_KEYS.WATER_LOGS, JSON.stringify(SEED_INITIAL_WATER_LOGS));
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  }

  // Profile & Settings
  public static getProfile(): UserProfile {
    this.initialize();
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return data ? JSON.parse(data) : SEED_PROFILE;
  }

  public static saveProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }

  public static getSettings(): UserSettings {
    this.initialize();
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : SEED_SETTINGS;
  }

  public static saveSettings(settings: UserSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // Targets
  public static getTargets(): NutritionTargets {
    this.initialize();
    const data = localStorage.getItem(STORAGE_KEYS.TARGETS);
    if (data) return JSON.parse(data);
    const profile = this.getProfile();
    const settings = this.getSettings();
    return calculateNutritionTargets(profile, settings);
  }

  public static saveTargets(targets: NutritionTargets): void {
    localStorage.setItem(STORAGE_KEYS.TARGETS, JSON.stringify(targets));
  }

  // Foods & Meals
  public static getFoods(): Food[] {
    this.initialize();
    const data = localStorage.getItem(STORAGE_KEYS.FOODS);
    return data ? JSON.parse(data) : SEED_FOODS;
  }

  public static saveFoods(foods: Food[]): void {
    localStorage.setItem(STORAGE_KEYS.FOODS, JSON.stringify(foods));
  }

  public static getMeals(): Meal[] {
    this.initialize();
    const data = localStorage.getItem(STORAGE_KEYS.MEALS);
    return data ? JSON.parse(data) : SEED_MEALS;
  }

  public static saveMeals(meals: Meal[]): void {
    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
  }

  // Food Logs
  public static getFoodLogs(date?: string): FoodLog[] {
    this.initialize();
    const data = localStorage.getItem(STORAGE_KEYS.FOOD_LOGS);
    const all: FoodLog[] = data ? JSON.parse(data) : SEED_INITIAL_FOOD_LOGS;
    if (date) {
      return all.filter((item) => item.date === date);
    }
    return all;
  }

  public static saveFoodLogs(logs: FoodLog[]): void {
    localStorage.setItem(STORAGE_KEYS.FOOD_LOGS, JSON.stringify(logs));
  }

  // Water Logs
  public static getWaterLogs(): WaterLog[] {
    this.initialize();
    const data = localStorage.getItem(STORAGE_KEYS.WATER_LOGS);
    return data ? JSON.parse(data) : SEED_INITIAL_WATER_LOGS;
  }

  public static saveWaterLogs(logs: WaterLog[]): void {
    localStorage.setItem(STORAGE_KEYS.WATER_LOGS, JSON.stringify(logs));
  }

  // Workout Routines & Sessions
  public static getWorkoutRoutine(): WorkoutRoutine {
    this.initialize();
    const data = localStorage.getItem(STORAGE_KEYS.ROUTINES);
    const list: WorkoutRoutine[] = data ? JSON.parse(data) : [SEED_DEFAULT_ROUTINE];
    return list[0] || SEED_DEFAULT_ROUTINE;
  }

  public static saveWorkoutRoutine(routine: WorkoutRoutine): void {
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify([routine]));
  }

  public static getWorkoutSessions(): WorkoutSession[] {
    this.initialize();
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return data ? JSON.parse(data) : SEED_INITIAL_SESSIONS;
  }

  public static saveWorkoutSessions(sessions: WorkoutSession[]): void {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }

  public static getActiveSession(): WorkoutSession | null {
    this.initialize();
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    return data ? JSON.parse(data) : null;
  }

  public static saveActiveSession(session: WorkoutSession | null): void {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    }
  }

  public static createSessionFromRoutine(
    routine: WorkoutRoutine,
    date: string,
    previousSession?: WorkoutSession
  ): WorkoutSession {
    const sessionExercises: SessionExercise[] = routine.exercises.map((ex, exIdx) => {
      const prevEx = previousSession?.exercises.find((pe) => pe.name === ex.name);

      const sets = Array.from({ length: ex.setsCount }).map((_, setIdx) => {
        let prevStr = '-';
        if (prevEx && prevEx.sets[setIdx]) {
          const ps = prevEx.sets[setIdx];
          if (ex.category === 'cardio') {
            prevStr = `${ps.durationMin || 2}m @ L${ps.level || 12}`;
          } else if (ex.category === 'assisted') {
            prevStr = `-${ps.weightOrAssistanceKg || ex.defaultWeightOrAssistanceKg}kg × ${ps.reps || ex.defaultReps}`;
          } else if (ex.category === 'bodyweight') {
            prevStr = `BW × ${ps.reps || ex.defaultReps}`;
          } else {
            prevStr = `${ps.weightOrAssistanceKg || ex.defaultWeightOrAssistanceKg}kg × ${ps.reps || ex.defaultReps}`;
          }
        }

        return {
          id: `set_${Date.now()}_${exIdx}_${setIdx}`,
          setNumber: setIdx + 1,
          previousStr: prevStr,
          weightOrAssistanceKg: ex.defaultWeightOrAssistanceKg ?? 0,
          reps: ex.defaultReps ?? 10,
          durationMin: ex.cardioDurationMin ?? 2,
          level: ex.cardioLevel ?? 12,
          isCompleted: false,
        };
      });

      return {
        id: `sex_${Date.now()}_${exIdx}`,
        exerciseId: ex.exerciseId || ex.id,
        name: ex.name,
        targetMuscle: ex.targetMuscle,
        category: ex.category,
        restSeconds: ex.defaultRestSeconds || 120,
        sets,
        order: ex.order || exIdx + 1,
      };
    });

    return {
      id: `sess_${Date.now()}`,
      routineId: routine.id,
      routineName: routine.name,
      date,
      startTime: Date.now(),
      totalVolumeKg: 0,
      bodyweightRepsCount: 0,
      isCompleted: false,
      exercises: sessionExercises,
    };
  }

  // Body Measurements
  public static getMeasurements(): BodyMeasurement[] {
    this.initialize();
    const data = localStorage.getItem(STORAGE_KEYS.MEASUREMENTS);
    return data ? JSON.parse(data) : SEED_INITIAL_MEASUREMENTS;
  }

  public static saveMeasurements(measurements: BodyMeasurement[]): void {
    localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(measurements));
  }

  // Momentum State
  public static getMomentum(): MomentumState {
    this.initialize();
    const data = localStorage.getItem(STORAGE_KEYS.MOMENTUM);
    if (data) return JSON.parse(data);
    return {
      score: 68,
      title: 'In Motion',
      streakDays: 4,
      consecutiveDays: 4,
      totalWorkouts: 4,
      heatPercentage: 68,
      nutritionAdherence: 85,
      proteinHitDays: 4,
    };
  }

  public static saveMomentum(momentum: MomentumState): void {
    localStorage.setItem(STORAGE_KEYS.MOMENTUM, JSON.stringify(momentum));
  }

  // Achievements
  public static getAchievements(): Achievement[] {
    this.initialize();
    const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    return data ? JSON.parse(data) : SEED_ACHIEVEMENTS;
  }

  public static saveAchievements(achievements: Achievement[]): void {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  }

  // Learning Articles
  public static getArticles(): LearningArticle[] {
    this.initialize();
    const data = localStorage.getItem(STORAGE_KEYS.ARTICLES);
    return data ? JSON.parse(data) : SEED_LEARNING_ARTICLES;
  }

  public static saveArticles(articles: LearningArticle[]): void {
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
  }

  // Granular Reset Helpers
  public static restoreDefaultRoutine(): WorkoutRoutine {
    this.saveWorkoutRoutine(SEED_DEFAULT_ROUTINE);
    return SEED_DEFAULT_ROUTINE;
  }

  public static clearAll(): void {
    localStorage.clear();
    this.seedAllDefaults();
  }

  // Snapshot Export / Import
  public static exportSnapshot(): string {
    const snapshot: AppDataSnapshot = {
      version: 1,
      profile: this.getProfile(),
      settings: this.getSettings(),
      nutritionTargets: this.getTargets(),
      foods: this.getFoods(),
      meals: this.getMeals(),
      foodLogs: this.getFoodLogs(),
      waterLogs: this.getWaterLogs(),
      workoutRoutines: [this.getWorkoutRoutine()],
      workoutSessions: this.getWorkoutSessions(),
      bodyMeasurements: this.getMeasurements(),
      achievements: this.getAchievements(),
      learningArticles: this.getArticles(),
      tips: [],
    };
    return JSON.stringify(snapshot, null, 2);
  }

  public static importSnapshot(snapshot: any): boolean {
    try {
      if (snapshot.profile) this.saveProfile(snapshot.profile);
      if (snapshot.settings) this.saveSettings(snapshot.settings);
      if (snapshot.nutritionTargets) this.saveTargets(snapshot.nutritionTargets);
      if (snapshot.foods) this.saveFoods(snapshot.foods);
      if (snapshot.meals) this.saveMeals(snapshot.meals);
      if (snapshot.foodLogs) this.saveFoodLogs(snapshot.foodLogs);
      if (snapshot.waterLogs) this.saveWaterLogs(snapshot.waterLogs);
      if (snapshot.workoutRoutines && snapshot.workoutRoutines[0]) {
        this.saveWorkoutRoutine(snapshot.workoutRoutines[0]);
      }
      if (snapshot.workoutSessions) this.saveWorkoutSessions(snapshot.workoutSessions);
      if (snapshot.bodyMeasurements) this.saveMeasurements(snapshot.bodyMeasurements);
      if (snapshot.achievements) this.saveAchievements(snapshot.achievements);
      if (snapshot.learningArticles) this.saveArticles(snapshot.learningArticles);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }
}

export const storage = StorageService;
