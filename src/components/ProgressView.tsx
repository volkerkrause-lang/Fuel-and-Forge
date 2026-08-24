import React, { useState } from 'react';
import { Plus, Trash2, Scale, Dumbbell } from 'lucide-react';
import { BodyMeasurement, WorkoutSession, UserProfile, WorkoutRoutine } from '../types';

interface ProgressViewProps {
  profile: UserProfile;
  measurements: BodyMeasurement[];
  sessions: WorkoutSession[];
  masterRoutine: WorkoutRoutine;
  onAddMeasurement: (measurement: Omit<BodyMeasurement, 'id'>) => void;
  onDeleteMeasurement: (id: string) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  profile,
  measurements,
  sessions,
  masterRoutine,
  onAddMeasurement,
  onDeleteMeasurement,
}) => {
  const [activeTab, setActiveTab] = useState<'body' | 'training'>('body');
  const [showLogModal, setShowLogModal] = useState(false);

  // New measurement form
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logWeight, setLogWeight] = useState<number | ''>(profile.currentWeightKg);
  const [logWaist, setLogWaist] = useState<number | ''>(profile.currentWaistCm || '');
  const [logNotes, setLogNotes] = useState('');

  // Selected training exercise for chart
  const [selectedExerciseName, setSelectedExerciseName] = useState<string>(
    masterRoutine.exercises[1]?.name || 'Assisted Chin-Ups - Gravitron'
  );

  const startWeight = profile.startingWeightKg || 95;
  const currentWeight = profile.currentWeightKg || startWeight;
  const targetWeight = profile.targetWeightKg || 85;
  const totalWeightChange = currentWeight - startWeight;

  const handleSaveMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logWeight) return;
    onAddMeasurement({
      date: logDate,
      weightKg: Number(logWeight),
      waistCm: logWaist ? Number(logWaist) : undefined,
      notes: logNotes.trim() || undefined,
    });
    setShowLogModal(false);
  };

  // Build SVG Points for Weight Trend Chart
  const sortedMeasurements = [...measurements].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const weights = sortedMeasurements.map((m) => m.weightKg);
  const minWeight = Math.min(...weights, targetWeight) - 2;
  const maxWeight = Math.max(...weights, startWeight) + 2;
  const rangeWeight = maxWeight - minWeight || 1;

  const chartWidth = 320;
  const chartHeight = 150;
  const paddingX = 20;
  const paddingY = 20;

  const points = sortedMeasurements.map((m, idx) => {
    const x =
      sortedMeasurements.length > 1
        ? paddingX + (idx / (sortedMeasurements.length - 1)) * (chartWidth - paddingX * 2)
        : chartWidth / 2;
    const y =
      chartHeight -
      paddingY -
      ((m.weightKg - minWeight) / rangeWeight) * (chartHeight - paddingY * 2);
    return { x, y, ...m };
  });

  const pathD =
    points.length > 0
      ? points.reduce(
          (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
          ''
        )
      : '';

  // Goal Reference Line Y
  const goalY =
    chartHeight -
    paddingY -
    ((targetWeight - minWeight) / rangeWeight) * (chartHeight - paddingY * 2);

  // Training exercise history extraction
  const exerciseHistory: {
    date: string;
    weightOrAssistance: number;
    reps: number;
    volume: number;
    durationMin?: number;
    level?: number;
    category: string;
  }[] = [];

  for (const sess of sessions) {
    const foundEx = sess.exercises.find((e) => e.name === selectedExerciseName);
    if (foundEx && foundEx.sets.length > 0) {
      const firstSet = foundEx.sets[0];
      const totalExVolume = foundEx.sets.reduce((sum, s) => {
        if (foundEx.category === 'weighted') {
          return sum + (s.weightOrAssistanceKg || 0) * (s.reps || 0);
        }
        return sum;
      }, 0);

      exerciseHistory.push({
        date: sess.date,
        weightOrAssistance: firstSet.weightOrAssistanceKg || 0,
        reps: firstSet.reps || 10,
        volume: totalExVolume,
        durationMin: firstSet.durationMin,
        level: firstSet.level,
        category: foundEx.category,
      });
    }
  }

  return (
    <div className="space-y-4 pb-12">
      {/* Navigation Switcher */}
      <div className="flex card-bg border border-white/5 rounded-xl p-1 shadow-md">
        <button
          onClick={() => setActiveTab('body')}
          className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'body'
              ? 'bg-[#d4af37] text-black shadow-[0_0_12px_rgba(212,175,55,0.25)]'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Body Metrics</span>
        </button>

        <button
          onClick={() => setActiveTab('training')}
          className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'training'
              ? 'bg-[#d4af37] text-black shadow-[0_0_12px_rgba(212,175,55,0.25)]'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" />
          <span>Training Progression</span>
        </button>
      </div>

      {/* TAB 1: BODY METRICS */}
      {activeTab === 'body' && (
        <div className="space-y-4">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="card-bg rounded-xl p-3 text-center border border-white/5">
              <span className="text-[9px] uppercase font-mono tracking-wider text-gray-400 block font-medium">Starting</span>
              <span className="serif text-sm font-bold text-gray-200 font-mono">{startWeight} kg</span>
            </div>
            <div className="card-bg rounded-xl p-3 text-center border border-[#d4af37]/40 bg-[#1c170d]">
              <span className="text-[9px] uppercase font-mono tracking-wider text-[#d4af37] block font-bold">Current</span>
              <span className="serif text-base font-bold gold-text font-mono">{currentWeight} kg</span>
            </div>
            <div className="card-bg rounded-xl p-3 text-center border border-white/5">
              <span className="text-[9px] uppercase font-mono tracking-wider text-gray-400 block font-medium">Target</span>
              <span className="serif text-sm font-bold text-gray-300 font-mono">{targetWeight} kg</span>
            </div>
          </div>

          {/* Premium Weight Trend Chart Card */}
          <div className="card-bg rounded-xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="serif text-xs font-semibold uppercase tracking-widest text-gray-200">
                  Weight Trajectory
                </h3>
                <p className="text-[11px] font-mono text-gray-400">
                  Net Change:{' '}
                  <span
                    className={`font-bold ${
                      totalWeightChange <= 0 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {totalWeightChange > 0 ? `+${totalWeightChange.toFixed(1)}` : totalWeightChange.toFixed(1)} kg
                  </span>
                </p>
              </div>

              <button
                onClick={() => setShowLogModal(true)}
                className="py-1.5 px-3 rounded-lg bg-[#221c0e] hover:bg-[#332a15] border border-[#d4af37]/40 text-[#d4af37] font-bold text-xs uppercase tracking-wider flex items-center space-x-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ LOG</span>
              </button>
            </div>

            {/* SVG Chart with Goal Line & Trend */}
            <div className="w-full h-44 bg-[#0a0a0a] rounded-xl border border-white/5 p-2 relative flex items-center justify-center">
              <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                {/* Goal Reference Line */}
                <line
                  x1={paddingX}
                  y1={goalY}
                  x2={chartWidth - paddingX}
                  y2={goalY}
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  strokeOpacity="0.7"
                />
                <text
                  x={chartWidth - paddingX}
                  y={goalY - 4}
                  fill="#10b981"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="end"
                  fontWeight="bold"
                >
                  Goal: {targetWeight} kg
                </text>

                {/* Main Trend Line in Gold */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#d4af37"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {points.map((p) => (
                  <g key={p.id}>
                    <circle cx={p.x} cy={p.y} r="4" fill="#d4af37" stroke="#000" strokeWidth="1.5" />
                    <text
                      x={p.x}
                      y={p.y - 7}
                      fill="#e0e0e0"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {p.weightKg}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 px-1">
              <span>{sortedMeasurements[0]?.date || 'Start'}</span>
              <span>Smoothed Trajectory</span>
              <span>{sortedMeasurements[sortedMeasurements.length - 1]?.date || 'Latest'}</span>
            </div>
          </div>

          {/* Logged Measurements History Table */}
          <div className="card-bg rounded-xl p-4 shadow-lg space-y-2.5">
            <h4 className="serif text-xs font-semibold uppercase tracking-widest text-gray-200 px-1">
              Recorded Timeline
            </h4>

            <div className="divide-y divide-white/5">
              {sortedMeasurements.map((m) => (
                <div key={m.id} className="py-2.5 flex items-center justify-between px-1">
                  <div>
                    <div className="flex items-center space-x-2 font-mono">
                      <span className="font-bold text-xs text-gray-100">{m.weightKg} kg</span>
                      {m.waistCm && (
                        <span className="text-[11px] text-gray-400">({m.waistCm} cm waist)</span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">{m.date} {m.notes ? `• ${m.notes}` : ''}</span>
                  </div>

                  <button
                    onClick={() => onDeleteMeasurement(m.id)}
                    className="p-1 text-gray-600 hover:text-rose-400 transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRAINING PROGRESSION */}
      {activeTab === 'training' && (
        <div className="space-y-4">
          {/* Select Exercise Dropdown */}
          <div className="card-bg rounded-xl p-4 shadow-xl space-y-3">
            <label className="block serif text-xs font-semibold uppercase tracking-widest text-gray-200">
              Select Exercise to Analyze
            </label>
            <select
              value={selectedExerciseName}
              onChange={(e) => setSelectedExerciseName(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#d4af37]"
            >
              {masterRoutine.exercises.map((ex) => (
                <option key={ex.id} value={ex.name}>
                  {ex.name} ({ex.category})
                </option>
              ))}
            </select>

            {/* Performance Insights */}
            {exerciseHistory.length > 0 ? (
              <div className="space-y-2 pt-2">
                <div className="bg-[#181818] p-3.5 rounded-lg border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-400">Recorded Sessions:</span>
                    <span className="font-bold text-white">{exerciseHistory.length}</span>
                  </div>

                  {exerciseHistory[0].category === 'assisted' && (
                    <div className="bg-purple-950/30 p-2.5 rounded-lg border border-purple-500/30 text-xs text-purple-300">
                      <span className="font-bold block uppercase tracking-wider text-[10px]">Assisted Resistance Logic</span>
                      Assistance weight dropped. Decreasing assistance means your muscles lifted more of your actual body mass!
                    </div>
                  )}

                  {exerciseHistory[0].category === 'cardio' && (
                    <div className="bg-cyan-950/30 p-2.5 rounded-lg border border-cyan-500/30 text-xs text-cyan-300">
                      <span className="font-bold block uppercase tracking-wider text-[10px]">Cardio Conditioning</span>
                      Progress tracked via Duration & Resistance Level (e.g. 2 min @ Level 12).
                    </div>
                  )}

                  {exerciseHistory[0].category === 'weighted' && (
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-gray-400">Total Exercise Volume:</span>
                      <span className="font-bold gold-text">
                        {exerciseHistory[0].volume} kg
                      </span>
                    </div>
                  )}
                </div>

                {/* Session by Session Breakdown */}
                <div className="space-y-1.5 pt-2">
                  <span className="serif text-[10px] uppercase font-semibold tracking-widest text-gray-400">
                    Session Records
                  </span>
                  {exerciseHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#181818] p-2.5 rounded-lg border border-white/5 flex items-center justify-between text-xs font-mono"
                    >
                      <span className="text-gray-400">{item.date}</span>
                      <span className="font-bold text-gray-200">
                        {item.category === 'cardio'
                          ? `${item.durationMin} min @ L${item.level}`
                          : item.category === 'assisted'
                          ? `Assistance: -${item.weightOrAssistance}kg × ${item.reps} reps`
                          : item.category === 'bodyweight'
                          ? `BW × ${item.reps} reps`
                          : `${item.weightOrAssistance} kg × ${item.reps} reps`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 text-xs font-serif italic">
                No recorded sessions for this movement yet. Complete a protocol workout to view progression.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Log Measurement Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm card-bg border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="serif font-bold text-base text-white uppercase tracking-wider">Log Measurement</h3>

            <form onSubmit={handleSaveMeasurement} className="space-y-3">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={logWeight}
                  onChange={(e) => setLogWeight(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1">
                  Waist Circumference (cm) (Optional)
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 94"
                  value={logWaist}
                  onChange={(e) => setLogWaist(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Morning fasted"
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-[#181818] text-gray-400 hover:text-white font-semibold text-xs uppercase tracking-wider transition-colors border border-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-[#d4af37] hover:bg-[#b8962e] text-black font-bold text-xs uppercase tracking-widest shadow-[0_0_12px_rgba(212,175,55,0.25)] transition-all"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
