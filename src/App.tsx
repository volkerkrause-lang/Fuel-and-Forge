import React, { useState, useEffect } from 'react';
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
  MomentumState,
  Achievement,
  LearningArticle,
  MealSlot,
} from './types';
import { StorageService } from './services/storage';
import { calculateNutritionTargets } from './services/calculator';

// Components
import { Header } from './components/Header';
import { Navbar, NavigationTab } from './components/Navbar';
import { WeekSelector } from './components/WeekSelector';
import { FuelGauge } from './components/FuelGauge';
import { WeeklyWorkoutTracker } from './components/WeeklyWorkoutTracker';
import { MacroBars } from './components/MacroBars';
import { WaterTracker } from './components/WaterTracker';
import { FoodDiary } from './components/FoodDiary';
import { FastAddModal } from './components/FastAddModal';
import { VoiceLogModal } from './components/VoiceLogModal';
import { WorkoutOverview } from './components/WorkoutOverview';
import { ActiveWorkout } from './components/ActiveWorkout';
import { ProgressView } from './components/ProgressView';
import { MomentumView } from './components/MomentumView';
import { FoodAndMealManager } from './components/FoodAndMealManager';
import { LearnView } from './components/LearnView';
import { SettingsModal } from './components/SettingsModal';
import { GranularResetModal } from './components/GranularResetModal';

export const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [moreSubTab, setMoreSubTab] = useState<'momentum' | 'meals' | 'learn'>('momentum');

  // Selected Date State (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Application Data States
  const [profile, setProfile] = useState<UserProfile>(StorageService.getProfile());
  const [settings, setSettings] = useState<UserSettings>(StorageService.getSettings());
  const [targets, setTargets] = useState<NutritionTargets>(StorageService.getTargets());
  const [foods, setFoods] = useState<Food[]>(StorageService.getFoods());
  const [meals, setMeals] = useState<Meal[]>(StorageService.getMeals());
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>(StorageService.getFoodLogs());
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>(StorageService.getWaterLogs());
  const [routine, setRoutine] = useState<WorkoutRoutine>(StorageService.getWorkoutRoutine());
  const [sessions, setSessions] = useState<WorkoutSession[]>(StorageService.getWorkoutSessions());
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(
    StorageService.getActiveSession()
  );
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>(
    StorageService.getMeasurements()
  );
  const [momentum, setMomentum] = useState<MomentumState>(StorageService.getMomentum());
  const [achievements, setAchievements] = useState<Achievement[]>(
    StorageService.getAchievements()
  );
  const [articles, setArticles] = useState<LearningArticle[]>(StorageService.getArticles());

  // Modals Visibility
  const [isFastAddOpen, setIsFastAddOpen] = useState(false);
  const [fastAddSlot, setFastAddSlot] = useState<MealSlot>('breakfast');
  const [isVoiceLogOpen, setIsVoiceLogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGranularResetOpen, setIsGranularResetOpen] = useState(false);

  // Update Momentum Heat and Streak on log changes
  useEffect(() => {
    recalculateMomentum();
  }, [foodLogs, waterLogs, sessions, measurements]);

  const recalculateMomentum = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysLogs = foodLogs.filter((l) => l.date === todayStr);
    const todaysCalories = todaysLogs.reduce((sum, l) => sum + l.calories, 0);
    const todaysProtein = todaysLogs.reduce((sum, l) => sum + l.protein, 0);

    let heat = 40;
    if (todaysLogs.length > 0) heat += 15;
    if (todaysProtein >= targets.proteinGrams * 0.8) heat += 20;
    if (todaysCalories > 0 && Math.abs(todaysCalories - targets.calories) <= 300) heat += 15;
    if (sessions.some((s) => s.date === todayStr && s.isCompleted)) heat += 10;
    heat = Math.min(100, heat);

    let title: MomentumState['title'] = 'Starting Out';
    if (heat >= 90) title = 'Unstoppable';
    else if (heat >= 75) title = 'Strong';
    else if (heat >= 55) title = 'In Motion';
    else if (heat >= 35) title = 'Consistent';
    else if (heat >= 20) title = 'Building';

    const updatedMomentum: MomentumState = {
      ...momentum,
      score: heat,
      title,
      totalWorkouts: sessions.filter((s) => s.isCompleted).length,
    };

    setMomentum(updatedMomentum);
    StorageService.saveMomentum(updatedMomentum);
  };

  // --- Food Diary Actions ---
  const handleOpenFastAdd = (slot: MealSlot) => {
    setFastAddSlot(slot);
    setIsFastAddOpen(true);
  };

  const handleAddFoodLog = (newLogData: Omit<FoodLog, 'id' | 'timestamp'>) => {
    const newLog: FoodLog = {
      ...newLogData,
      id: `fl_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
    };
    const updated = [...foodLogs, newLog];
    setFoodLogs(updated);
    StorageService.saveFoodLogs(updated);
  };

  const handleVoiceConfirmLogs = (logsToAdd: Omit<FoodLog, 'id' | 'timestamp'>[]) => {
    const createdLogs: FoodLog[] = logsToAdd.map((l) => ({
      ...l,
      id: `fl_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
    }));
    const updated = [...foodLogs, ...createdLogs];
    setFoodLogs(updated);
    StorageService.saveFoodLogs(updated);
  };

  const handleUpdateFoodLog = (id: string, updates: Partial<FoodLog>) => {
    const updated = foodLogs.map((l) => (l.id === id ? { ...l, ...updates } : l));
    setFoodLogs(updated);
    StorageService.saveFoodLogs(updated);
  };

  const handleDeleteFoodLog = (id: string) => {
    const updated = foodLogs.filter((l) => l.id !== id);
    setFoodLogs(updated);
    StorageService.saveFoodLogs(updated);
  };

  const handleClearMealSlot = (slot: MealSlot) => {
    const updated = foodLogs.filter((l) => !(l.date === selectedDate && l.mealType === slot));
    setFoodLogs(updated);
    StorageService.saveFoodLogs(updated);
  };

  // --- Water Actions ---
  const handleAddWater = (amountMl: number) => {
    const existingIndex = waterLogs.findIndex((w) => w.date === selectedDate);
    let updated: WaterLog[];

    if (existingIndex >= 0) {
      updated = [...waterLogs];
      updated[existingIndex] = {
        ...updated[existingIndex],
        amountMl: Math.max(0, updated[existingIndex].amountMl + amountMl),
      };
    } else {
      updated = [
        ...waterLogs,
        {
          id: `w_${Date.now()}`,
          date: selectedDate,
          amountMl: Math.max(0, amountMl),
          targetMl: targets.waterMl || 2500,
        },
      ];
    }

    setWaterLogs(updated);
    StorageService.saveWaterLogs(updated);
  };

  const handleResetWaterToday = () => {
    const updated = waterLogs.filter((w) => w.date !== selectedDate);
    setWaterLogs(updated);
    StorageService.saveWaterLogs(updated);
  };

  // --- Workout Actions ---
  const handleStartWorkout = () => {
    const previousCompleted = [...sessions]
      .filter((s) => s.isCompleted)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    const newSession = StorageService.createSessionFromRoutine(
      routine,
      selectedDate,
      previousCompleted
    );

    setActiveSession(newSession);
    StorageService.saveActiveSession(newSession);
  };

  const handleUpdateActiveSession = (updatedSession: WorkoutSession) => {
    setActiveSession(updatedSession);
    StorageService.saveActiveSession(updatedSession);
  };

  const handleFinishWorkout = (finishedSession: WorkoutSession, updateMaster: boolean) => {
    const updatedSessions = [
      finishedSession,
      ...sessions.filter((s) => s.id !== finishedSession.id),
    ];
    setSessions(updatedSessions);
    StorageService.saveWorkoutSessions(updatedSessions);

    if (updateMaster) {
      // Update master routine default weights/reps from session
      const updatedExercises = routine.exercises.map((masterEx) => {
        const matchingSessionEx = finishedSession.exercises.find((se) => se.name === masterEx.name);
        if (matchingSessionEx && matchingSessionEx.sets.length > 0) {
          const firstCompletedSet = matchingSessionEx.sets.find((s) => s.isCompleted) || matchingSessionEx.sets[0];
          return {
            ...masterEx,
            defaultWeightOrAssistanceKg: firstCompletedSet.weightOrAssistanceKg ?? masterEx.defaultWeightOrAssistanceKg,
            defaultReps: firstCompletedSet.reps ?? masterEx.defaultReps,
            setsCount: matchingSessionEx.sets.length,
            cardioDurationMin: firstCompletedSet.durationMin ?? masterEx.cardioDurationMin,
            cardioLevel: firstCompletedSet.level ?? masterEx.cardioLevel,
          };
        }
        return masterEx;
      });

      const newRoutine: WorkoutRoutine = {
        ...routine,
        exercises: updatedExercises,
      };
      setRoutine(newRoutine);
      StorageService.saveWorkoutRoutine(newRoutine);
    }

    setActiveSession(null);
    StorageService.saveActiveSession(null);
  };

  const handleCancelWorkout = () => {
    if (confirm('Cancel this active workout session?')) {
      setActiveSession(null);
      StorageService.saveActiveSession(null);
    }
  };

  const handleToggleWeeklyWorkout = (date: string) => {
    const completedSession = sessions.find((s) => s.date === date && s.isCompleted);
    let updated: WorkoutSession[];
    if (completedSession?.id.startsWith('quick_')) {
      updated = sessions.filter((s) => s.id !== completedSession.id);
    } else if (completedSession) {
      return;
    } else {
      const quick = StorageService.createSessionFromRoutine(routine, date);
      updated = [{ ...quick, id: `quick_${Date.now()}`, endTime: Date.now(), isCompleted: true, exercises: [] }, ...sessions];
    }
    setSessions(updated);
    StorageService.saveWorkoutSessions(updated);
  };

  const handleWeeklyTargetChange = (targetWorkoutsPerWeek: number) => {
    const updated = { ...settings, targetWorkoutsPerWeek: Math.max(3, targetWorkoutsPerWeek) };
    setSettings(updated);
    StorageService.saveSettings(updated);
  };

  // --- Measurement Actions ---
  const handleAddMeasurement = (m: Omit<BodyMeasurement, 'id'>) => {
    const newM: BodyMeasurement = {
      ...m,
      id: `bm_${Date.now()}`,
    };
    const updated = [...measurements, newM];
    setMeasurements(updated);
    StorageService.saveMeasurements(updated);

    // Update profile current weight if latest
    const updatedProfile = { ...profile, currentWeightKg: m.weightKg };
    setProfile(updatedProfile);
    StorageService.saveProfile(updatedProfile);

    // If automatic targets enabled, recalculate
    if (settings.automaticTargets) {
      const newTargets = calculateNutritionTargets(updatedProfile, settings);
      setTargets(newTargets);
      StorageService.saveTargets(newTargets);
    }
  };

  const handleDeleteMeasurement = (id: string) => {
    const updated = measurements.filter((m) => m.id !== id);
    setMeasurements(updated);
    StorageService.saveMeasurements(updated);
  };

  // --- Learning Article Actions ---
  const handleSaveArticleToLibrary = (id: string) => {
    const updated = articles.map((a) =>
      a.id === id ? { ...a, isSavedForLater: true, isLearned: true } : a
    );
    setArticles(updated);
    StorageService.saveArticles(updated);
  };

  const handleDiscardArticle = (id: string) => {
    const updated = articles.filter((a) => a.id !== id);
    setArticles(updated);
    StorageService.saveArticles(updated);
  };

  // --- Granular Resets ---
  const handleResetTodayFood = () => {
    const updated = foodLogs.filter((l) => l.date !== selectedDate);
    setFoodLogs(updated);
    StorageService.saveFoodLogs(updated);
  };

  const handleResetTodayWorkout = () => {
    setActiveSession(null);
    StorageService.saveActiveSession(null);
    const updated = sessions.filter((s) => s.date !== selectedDate);
    setSessions(updated);
    StorageService.saveWorkoutSessions(updated);
  };

  const handleResetRoutineToDefault = () => {
    const defaultR = StorageService.restoreDefaultRoutine();
    setRoutine(defaultR);
  };

  const handleResetNutritionTargets = () => {
    const calculated = calculateNutritionTargets(profile, { ...settings, automaticTargets: true });
    setTargets(calculated);
    StorageService.saveTargets(calculated);
    setSettings({ ...settings, automaticTargets: true });
    StorageService.saveSettings({ ...settings, automaticTargets: true });
  };

  const handleFullFactoryReset = () => {
    StorageService.clearAll();
    window.location.reload();
  };

  // --- Export / Import ---
  const handleExportData = () => {
    const jsonStr = StorageService.exportSnapshot();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuel-and-forge-backup-${selectedDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (data: any) => {
    StorageService.importSnapshot(data);
    window.location.reload();
  };

  // Calculate selected date nutrition
  const dayFoodLogs = foodLogs.filter((l) => l.date === selectedDate);
  const totalCaloriesLogged = dayFoodLogs.reduce((sum, l) => sum + l.calories, 0);
  const totalProteinLogged = Number(
    dayFoodLogs.reduce((sum, l) => sum + l.protein, 0).toFixed(1)
  );
  const totalCarbsLogged = Number(
    dayFoodLogs.reduce((sum, l) => sum + l.carbs, 0).toFixed(1)
  );
  const totalFatLogged = Number(
    dayFoodLogs.reduce((sum, l) => sum + l.fat, 0).toFixed(1)
  );

  const dayWaterLog = waterLogs.find((w) => w.date === selectedDate);
  const totalWaterLogged = dayWaterLog ? dayWaterLog.amountMl : 0;

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Global Header */}
      <Header
        userName={profile.name}
        momentumTitle={momentum.title}
        heatScore={momentum.score}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-xl mx-auto px-3.5 sm:px-4 pt-3 pb-24 space-y-4">
        {/* VIEW 1: HOME (FUEL & NUTRITION) */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            {/* Week Selector */}
            <WeekSelector
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              foodLogs={foodLogs}
              sessions={sessions}
              targetCalories={targets.calories}
            />

            <WeeklyWorkoutTracker
              sessions={sessions}
              target={settings.targetWorkoutsPerWeek || 3}
              onToggle={handleToggleWeeklyWorkout}
              onTargetChange={handleWeeklyTargetChange}
            />

            {/* Fuel Gauge Card */}
            <FuelGauge
              consumedCalories={totalCaloriesLogged}
              targetCalories={targets.calories}
              burnCalories={0}
            />

            {/* Macro Bars */}
            <MacroBars
              consumedProtein={totalProteinLogged}
              targetProtein={targets.proteinGrams}
              consumedCarbs={totalCarbsLogged}
              targetCarbs={targets.carbsGrams}
              consumedFat={totalFatLogged}
              targetFat={targets.fatGrams}
            />

            {/* Water Tracker */}
            <WaterTracker
              consumedMl={totalWaterLogged}
              targetMl={targets.waterMl || 2500}
              onAddWater={handleAddWater}
              onResetWater={handleResetWaterToday}
            />

            {/* Food Diary */}
            <FoodDiary
              logs={dayFoodLogs}
              onOpenFastAdd={handleOpenFastAdd}
              onUpdateLog={handleUpdateFoodLog}
              onDeleteLog={handleDeleteFoodLog}
              onClearMealSlot={handleClearMealSlot}
            />
          </div>
        )}

        {/* VIEW 2: WORKOUT */}
        {activeTab === 'workout' && (
          <div className="space-y-4">
            {activeSession ? (
              <ActiveWorkout
                session={activeSession}
                masterRoutine={routine}
                previousSession={sessions.find((s) => s.isCompleted)}
                onUpdateSession={handleUpdateActiveSession}
                onFinishWorkout={handleFinishWorkout}
                onCancelWorkout={handleCancelWorkout}
              />
            ) : (
              <WorkoutOverview
                routine={routine}
                onStartWorkout={handleStartWorkout}
                onResetRoutine={handleResetRoutineToDefault}
                onUpdateRoutine={(updated) => {
                  setRoutine(updated);
                  StorageService.saveWorkoutRoutine(updated);
                }}
              />
            )}
          </div>
        )}

        {/* VIEW 3: PROGRESS */}
        {activeTab === 'progress' && (
          <ProgressView
            profile={profile}
            measurements={measurements}
            sessions={sessions}
            masterRoutine={routine}
            onAddMeasurement={handleAddMeasurement}
            onDeleteMeasurement={handleDeleteMeasurement}
          />
        )}

        {/* VIEW 4: MORE (MOMENTUM / MEAL BUILDER / LEARN) */}
        {activeTab === 'more' && (
          <div className="space-y-4">
            {/* Sub Tabs */}
            <div className="flex bg-[#141720] border border-[#232938] rounded-2xl p-1 shadow-md">
              <button
                onClick={() => setMoreSubTab('momentum')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  moreSubTab === 'momentum'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                The Forge Core
              </button>
              <button
                onClick={() => setMoreSubTab('meals')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  moreSubTab === 'meals'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Meal & Food Builder
              </button>
              <button
                onClick={() => setMoreSubTab('learn')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  moreSubTab === 'learn'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Evidence Codex
              </button>
            </div>

            {moreSubTab === 'momentum' && (
              <MomentumView
                momentum={momentum}
                achievements={achievements}
                userName={profile.name}
              />
            )}

            {moreSubTab === 'meals' && (
              <FoodAndMealManager
                foods={foods}
                meals={meals}
                onSaveFood={(f) => {
                  const updated = [...foods, f];
                  setFoods(updated);
                  StorageService.saveFoods(updated);
                }}
                onDeleteFood={(id) => {
                  const updated = foods.filter((f) => f.id !== id);
                  setFoods(updated);
                  StorageService.saveFoods(updated);
                }}
                onSaveMeal={(m) => {
                  const updated = [...meals, m];
                  setMeals(updated);
                  StorageService.saveMeals(updated);
                }}
                onDeleteMeal={(id) => {
                  const updated = meals.filter((m) => m.id !== id);
                  setMeals(updated);
                  StorageService.saveMeals(updated);
                }}
              />
            )}

            {moreSubTab === 'learn' && (
              <LearnView
                articles={articles}
                onSaveToLibrary={handleSaveArticleToLibrary}
                onDiscard={handleDiscardArticle}
              />
            )}
          </div>
        )}
      </main>

      {/* Bottom Sticky Navigation */}
      <Navbar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenVoiceModal={() => setIsVoiceLogOpen(true)}
      />

      {/* Modals */}
      <FastAddModal
        isOpen={isFastAddOpen}
        mealSlot={fastAddSlot}
        foods={foods}
        meals={meals}
        onClose={() => setIsFastAddOpen(false)}
        onAddFoodLog={handleAddFoodLog}
      />

      <VoiceLogModal
        isOpen={isVoiceLogOpen}
        foods={foods}
        meals={meals}
        onClose={() => setIsVoiceLogOpen(false)}
        onConfirmLogs={handleVoiceConfirmLogs}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        profile={profile}
        settings={settings}
        targets={targets}
        onClose={() => setIsSettingsOpen(false)}
        onSaveProfile={(p) => {
          setProfile(p);
          StorageService.saveProfile(p);
        }}
        onSaveSettings={(s) => {
          setSettings(s);
          StorageService.saveSettings(s);
        }}
        onSaveTargets={(t) => {
          setTargets(t);
          StorageService.saveTargets(t);
        }}
        onOpenGranularReset={() => {
          setIsSettingsOpen(false);
          setIsGranularResetOpen(true);
        }}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />

      <GranularResetModal
        isOpen={isGranularResetOpen}
        onClose={() => setIsGranularResetOpen(false)}
        onResetMealSlot={handleClearMealSlot}
        onResetTodayFood={handleResetTodayFood}
        onResetTodayWater={handleResetWaterToday}
        onResetTodayWorkout={handleResetTodayWorkout}
        onResetRoutineToDefault={handleResetRoutineToDefault}
        onResetNutritionTargets={handleResetNutritionTargets}
        onFullFactoryReset={handleFullFactoryReset}
      />
    </div>
  );
};
export default App;
