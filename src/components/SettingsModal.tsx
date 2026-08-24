import React, { useState } from 'react';
import {
  X,
  Sliders,
  Download,
  Upload,
  HelpCircle,
} from 'lucide-react';
import {
  UserProfile,
  UserSettings,
  NutritionTargets,
  UnitPreferences,
  ActivityLevel,
  FitnessLocation,
} from '../types';
import {
  calculateNutritionTargets,
  calculateProjectedTargetDate,
} from '../services/calculator';

interface SettingsModalProps {
  isOpen: boolean;
  profile: UserProfile;
  settings: UserSettings;
  targets: NutritionTargets;
  onClose: () => void;
  onSaveProfile: (profile: UserProfile) => void;
  onSaveSettings: (settings: UserSettings) => void;
  onSaveTargets: (targets: NutritionTargets) => void;
  onOpenGranularReset: () => void;
  onExportData: () => void;
  onImportData: (data: any) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  profile,
  settings,
  targets,
  onClose,
  onSaveProfile,
  onSaveSettings,
  onSaveTargets,
  onOpenGranularReset,
  onExportData,
  onImportData,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'units' | 'goals' | 'nutrition' | 'data'>('profile');

  // Profile Form State
  const [name, setName] = useState(profile.name);
  const [sex, setSex] = useState<'male' | 'female'>(profile.sex);
  const [dob, setDob] = useState(profile.dob);
  const [heightCm, setHeightCm] = useState(profile.heightCm);
  const [country, setCountry] = useState(profile.country);
  const [startingWeightKg, setStartingWeightKg] = useState(profile.startingWeightKg);
  const [currentWeightKg, setCurrentWeightKg] = useState(profile.currentWeightKg);
  const [targetWeightKg, setTargetWeightKg] = useState(profile.targetWeightKg);

  // Settings State
  const [weightUnit, setWeightUnit] = useState<UnitPreferences['weight']>(settings.units.weight);
  const [heightUnit, setHeightUnit] = useState<UnitPreferences['height']>(settings.units.height);
  const [energyUnit, setEnergyUnit] = useState<UnitPreferences['energy']>(settings.units.energy);
  const [waterUnit, setWaterUnit] = useState<UnitPreferences['water']>(settings.units.water);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(settings.activityLevel);
  const [weeklyGoal, setWeeklyGoal] = useState<number>(settings.weeklyGoalKgChange);
  const [fitnessLocation, setFitnessLocation] = useState<FitnessLocation>(settings.fitnessLocation);
  const [targetWorkouts, setTargetWorkouts] = useState<number>(settings.targetWorkoutsPerWeek);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(settings.maintenanceMode);

  // Nutrition Targets State
  const [isAutomatic, setIsAutomatic] = useState<boolean>(settings.automaticTargets);
  const [manualCal, setManualCal] = useState<number>(targets.calories);
  const [manualProt, setManualProt] = useState<number>(targets.proteinGrams);
  const [manualCarbs, setManualCarbs] = useState<number>(targets.carbsGrams);
  const [manualFat, setManualFat] = useState<number>(targets.fatGrams);

  // WHY? Popover Explanations
  const [showWhyBmr, setShowWhyBmr] = useState(false);
  const [showWhyTdee, setShowWhyTdee] = useState(false);

  if (!isOpen) return null;

  const projected = calculateProjectedTargetDate(currentWeightKg, targetWeightKg, weeklyGoal);

  const handleSaveAll = () => {
    const updatedProfile: UserProfile = {
      ...profile,
      name,
      sex,
      dob,
      heightCm: Number(heightCm),
      country,
      startingWeightKg: Number(startingWeightKg),
      currentWeightKg: Number(currentWeightKg),
      targetWeightKg: Number(targetWeightKg),
    };

    const updatedSettings: UserSettings = {
      ...settings,
      units: {
        weight: weightUnit,
        height: heightUnit,
        energy: energyUnit,
        water: waterUnit,
      },
      activityLevel,
      weeklyGoalKgChange: Number(weeklyGoal),
      fitnessLocation,
      targetWorkoutsPerWeek: Number(targetWorkouts),
      automaticTargets: isAutomatic,
      maintenanceMode,
    };

    onSaveProfile(updatedProfile);
    onSaveSettings(updatedSettings);

    if (isAutomatic) {
      const calculated = calculateNutritionTargets(updatedProfile, updatedSettings);
      onSaveTargets(calculated);
    } else {
      onSaveTargets({
        ...targets,
        calories: Number(manualCal),
        proteinGrams: Number(manualProt),
        carbsGrams: Number(manualCarbs),
        fatGrams: Number(manualFat),
      });
    }

    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          onImportData(json);
          onClose();
        } catch (err) {
          alert('Invalid backup JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg card-bg border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-[#d4af37]" />
            <h2 className="serif font-bold text-base text-white uppercase tracking-wider">Protocol Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#181818] text-gray-400 hover:text-white flex items-center justify-center border border-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-white/5 bg-[#0a0a0a] px-3 pt-2 overflow-x-auto">
          {[
            { id: 'profile', label: 'Profile' },
            { id: 'goals', label: 'Goals' },
            { id: 'nutrition', label: 'Nutrition' },
            { id: 'units', label: 'Units' },
            { id: 'data', label: 'Data / Resets' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-[#d4af37] text-[#d4af37]'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* TAB 1: Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-3">
              <div>
                <label className="block text-gray-300 font-medium uppercase tracking-wider mb-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-gray-300 font-medium uppercase tracking-wider mb-1">Biological Sex</label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value as any)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-medium uppercase tracking-wider mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-gray-300 font-medium uppercase tracking-wider mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium uppercase tracking-wider mb-1">Country / Region</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono">
                <div>
                  <label className="block text-gray-300 font-medium uppercase tracking-wider mb-1">Start (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={startingWeightKg}
                    onChange={(e) => setStartingWeightKg(Number(e.target.value))}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-2 py-2 text-white text-center font-bold focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium uppercase tracking-wider mb-1">Current (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentWeightKg}
                    onChange={(e) => setCurrentWeightKg(Number(e.target.value))}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-2 py-2 text-center font-bold gold-text focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium uppercase tracking-wider mb-1">Target (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={targetWeightKg}
                    onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-2 py-2 text-emerald-400 text-center font-bold focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Goals */}
          {activeTab === 'goals' && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-gray-300 font-medium uppercase tracking-wider mb-1">Weekly Weight Goal</label>
                <select
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-[#d4af37]"
                >
                  <option value={-0.75}>Lose 0.75 kg / week (Steeper deficit: -825 kcal/d)</option>
                  <option value={-0.5}>Lose 0.50 kg / week (Recommended deficit: -550 kcal/d)</option>
                  <option value={-0.25}>Lose 0.25 kg / week (Gentle deficit: -275 kcal/d)</option>
                  <option value={0}>Maintain Current Weight (0 kcal adjustment)</option>
                  <option value={0.25}>Gain 0.25 kg / week (Lean mass surplus: +275 kcal/d)</option>
                </select>
              </div>

              <div className="bg-[#181818] p-3 rounded-lg border border-white/5 space-y-1">
                <span className="serif font-semibold gold-text block uppercase tracking-wider text-[10px]">Trajectory Projection</span>
                <p className="text-gray-300 font-mono">
                  Estimated Journey: <span className="font-bold text-white">~{projected.weeks} weeks</span> ({projected.dateStr})
                </p>
                <span className="text-[10px] text-gray-500 block font-serif italic">
                  * Note: Real physiological weight change is undulating and non-linear.
                </span>
              </div>

              <div>
                <label className="block text-gray-300 font-medium uppercase tracking-wider mb-1">
                  Non-Exercise Activity Level (NEAT)
                </label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as any)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                >
                  <option value="sedentary">Not very active (Desk job, minimal walking) [1.2x]</option>
                  <option value="light">Lightly active (Light daily movement, ~5-7k steps) [1.375x]</option>
                  <option value="moderate">Active (Regular walking, on feet often) [1.55x]</option>
                  <option value="very_active">Very active (Heavy physical work/active lifestyle) [1.725x]</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-gray-300 font-medium uppercase tracking-wider mb-1">Workout Location</label>
                  <select
                    value={fitnessLocation}
                    onChange={(e) => setFitnessLocation(e.target.value as any)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="gym">Gym</option>
                    <option value="home">Home</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-medium uppercase tracking-wider mb-1">Target Sessions/Week</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={targetWorkouts}
                    onChange={(e) => setTargetWorkouts(Number(e.target.value))}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* Maintenance Mode Milestone Check */}
              <div className="bg-[#181818] p-3 rounded-lg border border-white/5 flex items-center justify-between">
                <div>
                  <span className="serif font-semibold text-gray-200 block">Maintenance Mode</span>
                  <span className="text-[11px] text-gray-400 font-sans">Lock targets to calculated maintenance energy</span>
                </div>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="w-4 h-4 rounded text-[#d4af37] focus:ring-[#d4af37]"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Nutrition & WHY? */}
          {activeTab === 'nutrition' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between bg-[#181818] p-2.5 rounded-lg border border-white/5">
                <div>
                  <span className="serif font-semibold text-gray-200 block">Calculation Method</span>
                  <span className="text-[11px] text-gray-400 font-sans">
                    {isAutomatic ? 'Calculated via Mifflin-St Jeor formula' : 'Custom manual values'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAutomatic(!isAutomatic)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                    isAutomatic
                      ? 'bg-[#d4af37] text-black shadow-[0_0_10px_rgba(212,175,55,0.25)]'
                      : 'bg-[#222222] text-gray-300 border border-white/10'
                  }`}
                >
                  {isAutomatic ? 'Automatic' : 'Manual'}
                </button>
              </div>

              {/* Scientific Calculations with WHY? */}
              <div className="space-y-2">
                {/* BMR */}
                <div className="bg-[#181818] p-3 rounded-lg border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-gray-400 font-medium">Basal Metabolic Rate (BMR):</span>
                      <button
                        type="button"
                        onClick={() => setShowWhyBmr(!showWhyBmr)}
                        className="text-[#d4af37] hover:text-white"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {showWhyBmr && (
                      <p className="text-[10px] text-gray-300 mt-1 bg-[#0a0a0a] p-2 rounded-lg border border-white/10">
                        WHY? Energy expended at complete rest for cellular respiration, calculated using the validated Mifflin-St Jeor formula based on body mass, height, age, and sex.
                      </p>
                    )}
                  </div>
                  <span className="serif font-bold text-white text-sm font-mono">{targets.bmr} kcal</span>
                </div>

                {/* TDEE */}
                <div className="bg-[#181818] p-3 rounded-lg border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-gray-400 font-medium">Maintenance (TDEE):</span>
                      <button
                        type="button"
                        onClick={() => setShowWhyTdee(!showWhyTdee)}
                        className="text-[#d4af37] hover:text-white"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {showWhyTdee && (
                      <p className="text-[10px] text-gray-300 mt-1 bg-[#0a0a0a] p-2 rounded-lg border border-white/10">
                        WHY? Total Daily Energy Expenditure factoring in lifestyle movement multipliers without double-counting workout calories.
                      </p>
                    )}
                  </div>
                  <span className="serif font-bold text-white text-sm font-mono">{targets.tdee} kcal</span>
                </div>
              </div>

              {/* Target Values Inputs */}
              <div className="grid grid-cols-2 gap-2.5 font-mono">
                <div>
                  <label className="block text-gray-300 font-medium uppercase tracking-wider mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    disabled={isAutomatic}
                    value={isAutomatic ? targets.calories : manualCal}
                    onChange={(e) => setManualCal(Number(e.target.value))}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 gold-text font-bold disabled:opacity-75 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium uppercase tracking-wider mb-1">Protein (g)</label>
                  <input
                    type="number"
                    disabled={isAutomatic}
                    value={isAutomatic ? targets.proteinGrams : manualProt}
                    onChange={(e) => setManualProt(Number(e.target.value))}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-emerald-400 font-bold disabled:opacity-75 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium uppercase tracking-wider mb-1">Carbohydrates (g)</label>
                  <input
                    type="number"
                    disabled={isAutomatic}
                    value={isAutomatic ? targets.carbsGrams : manualCarbs}
                    onChange={(e) => setManualCarbs(Number(e.target.value))}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-amber-400 font-bold disabled:opacity-75 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium uppercase tracking-wider mb-1">Fat (g)</label>
                  <input
                    type="number"
                    disabled={isAutomatic}
                    value={isAutomatic ? targets.fatGrams : manualFat}
                    onChange={(e) => setManualFat(Number(e.target.value))}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-rose-400 font-bold disabled:opacity-75 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Units */}
          {activeTab === 'units' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-[#181818] p-3 rounded-lg border border-white/5">
                <span className="font-medium text-gray-200 uppercase tracking-wider">Weight Unit</span>
                <div className="flex space-x-1">
                  {(['kg', 'lb'] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setWeightUnit(u)}
                      className={`px-3 py-1 rounded-lg font-mono font-bold text-xs ${
                        weightUnit === u ? 'bg-[#d4af37] text-black shadow-[0_0_8px_rgba(212,175,55,0.2)]' : 'bg-[#0a0a0a] text-gray-400'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between bg-[#181818] p-3 rounded-lg border border-white/5">
                <span className="font-medium text-gray-200 uppercase tracking-wider">Height Unit</span>
                <div className="flex space-x-1">
                  {(['cm', 'in'] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setHeightUnit(u)}
                      className={`px-3 py-1 rounded-lg font-mono font-bold text-xs ${
                        heightUnit === u ? 'bg-[#d4af37] text-black shadow-[0_0_8px_rgba(212,175,55,0.2)]' : 'bg-[#0a0a0a] text-gray-400'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between bg-[#181818] p-3 rounded-lg border border-white/5">
                <span className="font-medium text-gray-200 uppercase tracking-wider">Energy Unit</span>
                <div className="flex space-x-1">
                  {(['kcal', 'kJ'] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setEnergyUnit(u)}
                      className={`px-3 py-1 rounded-lg font-mono font-bold text-xs ${
                        energyUnit === u ? 'bg-[#d4af37] text-black shadow-[0_0_8px_rgba(212,175,55,0.2)]' : 'bg-[#0a0a0a] text-gray-400'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between bg-[#181818] p-3 rounded-lg border border-white/5">
                <span className="font-medium text-gray-200 uppercase tracking-wider">Fluid Unit</span>
                <div className="flex space-x-1">
                  {(['ml', 'fl_oz'] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setWaterUnit(u)}
                      className={`px-3 py-1 rounded-lg font-mono font-bold text-xs ${
                        waterUnit === u ? 'bg-[#d4af37] text-black shadow-[0_0_8px_rgba(212,175,55,0.2)]' : 'bg-[#0a0a0a] text-gray-400'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Data & Granular Resets */}
          {activeTab === 'data' && (
            <div className="space-y-3">
              <div className="bg-[#181818] p-3.5 rounded-lg border border-white/5 space-y-2">
                <span className="serif font-semibold text-gray-200 block uppercase tracking-wider text-[11px]">Granular Reset Controls</span>
                <p className="text-gray-400 text-xs font-sans">
                  Reset specific meal slots, hydration entries, or routine weights independently.
                </p>
                <button
                  type="button"
                  onClick={onOpenGranularReset}
                  className="w-full py-2 bg-[#221c0e] hover:bg-[#332a15] text-[#d4af37] border border-[#d4af37]/40 rounded-lg font-bold uppercase tracking-wider transition-colors text-xs"
                >
                  Open Granular Reset Panel
                </button>
              </div>

              <div className="bg-[#181818] p-3.5 rounded-lg border border-white/5 space-y-2">
                <span className="serif font-semibold text-gray-200 block uppercase tracking-wider text-[11px]">Backup & Migration</span>
                <p className="text-gray-400 text-xs font-sans">
                  Export your full protocol history, custom templates, and logs to a JSON snapshot.
                </p>
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={onExportData}
                    className="flex-1 py-2 bg-[#242424] hover:bg-[#2e2e2e] text-white rounded-lg font-semibold flex items-center justify-center space-x-1.5 border border-white/5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>

                  <label className="flex-1 py-2 bg-[#242424] hover:bg-[#2e2e2e] text-white rounded-lg font-semibold flex items-center justify-center space-x-1.5 cursor-pointer border border-white/5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import JSON</span>
                    <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-[#0a0a0a] flex items-center space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-[#181818] text-gray-400 hover:text-white font-semibold text-xs uppercase tracking-wider border border-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="flex-1 py-2.5 rounded-lg bg-[#d4af37] hover:bg-[#b8962e] text-black font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(212,175,55,0.25)]"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
