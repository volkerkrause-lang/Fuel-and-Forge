import React from 'react';
import { Flame, Trophy, Zap, Award, Target, TrendingUp, Dumbbell, Sparkles, CheckCircle2 } from 'lucide-react';
import { MomentumState, Achievement } from '../types';
import confetti from 'canvas-confetti';

interface MomentumViewProps {
  momentum: MomentumState;
  achievements: Achievement[];
  userName: string;
  onUnlockAchievement?: (code: Achievement['code']) => void;
}

export const MomentumView: React.FC<MomentumViewProps> = ({
  momentum,
  achievements,
  userName,
}) => {
  const triggerSparks = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#b8962e', '#ffffff', '#10b981'],
      });
    } catch (e) {
      // ignore
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-4 h-4" />;
      case 'Dumbbell':
        return <Dumbbell className="w-4 h-4" />;
      case 'Target':
        return <Target className="w-4 h-4" />;
      case 'Zap':
        return <Zap className="w-4 h-4" />;
      case 'TrendingUp':
        return <TrendingUp className="w-4 h-4" />;
      case 'Award':
        return <Award className="w-4 h-4" />;
      case 'Trophy':
        return <Trophy className="w-4 h-4" />;
      default:
        return <Award className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Visual Forge Core Hero */}
      <div className="card-bg rounded-xl p-6 shadow-2xl relative overflow-hidden text-center">
        {/* Glow backdrop based on momentum score */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#d4af37]/10 via-transparent to-transparent pointer-events-none transition-all duration-700"
          style={{ opacity: Math.max(0.2, momentum.score / 100) }}
        />

        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#d4af37] bg-[#221c0e] px-3 py-1 rounded-full border border-[#d4af37]/40">
          The Momentum Core
        </span>

        {/* Forge Core Visualizer Orb */}
        <div className="relative w-32 h-32 mx-auto my-4 flex items-center justify-center cursor-pointer" onClick={triggerSparks}>
          {/* Outer Metal Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-[#d4af37]/30 shadow-2xl flex items-center justify-center bg-[#0d0d0d]" />
          
          {/* Inner Glowing Heat Core */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-700 animate-pulse"
            style={{
              background: `radial-gradient(circle, #f3d978 0%, #d4af37 40%, #8a6d1e 80%, #17140b 100%)`,
              boxShadow: `0 0 ${20 + momentum.score * 0.3}px rgba(212, 175, 55, ${
                0.2 + (momentum.score / 100) * 0.5
              })`,
            }}
          >
            <Flame className="w-8 h-8 text-black drop-shadow" />
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="serif text-xl font-bold text-white uppercase tracking-wider">{userName}</h2>
          <div className="serif text-xs font-semibold gold-text tracking-widest uppercase">
            Rank: {momentum.title}
          </div>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1 font-serif italic">
            Consistency, disciplined fueling, and progressive overload.
          </p>
        </div>

        {/* Core Momentum Metrics */}
        <div className="grid grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-white/5 text-xs font-mono">
          <div className="bg-[#181818] p-2.5 rounded-lg border border-white/5">
            <span className="text-gray-400 block text-[9px] uppercase tracking-wider">Heat Index</span>
            <span className="serif font-bold gold-text text-base">{momentum.score}%</span>
          </div>
          <div className="bg-[#181818] p-2.5 rounded-lg border border-white/5">
            <span className="text-gray-400 block text-[9px] uppercase tracking-wider">Active Streak</span>
            <span className="serif font-bold text-emerald-400 text-base">
              {momentum.streakDays} Days
            </span>
          </div>
          <div className="bg-[#181818] p-2.5 rounded-lg border border-white/5">
            <span className="text-gray-400 block text-[9px] uppercase tracking-wider">Workouts</span>
            <span className="serif font-bold text-gray-100 text-base">
              {momentum.totalWorkouts} Done
            </span>
          </div>
        </div>
      </div>

      {/* Titles Tier Hierarchy */}
      <div className="card-bg rounded-xl p-4 shadow-lg space-y-3">
        <h3 className="serif text-xs font-semibold uppercase tracking-widest text-gray-200 px-1">
          Honorary Rank Progression
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
          {[
            { title: 'Starting Out', minScore: 0 },
            { title: 'Building', minScore: 20 },
            { title: 'Consistent', minScore: 35 },
            { title: 'In Motion', minScore: 55 },
            { title: 'Strong', minScore: 75 },
            { title: 'Unstoppable', minScore: 90 },
          ].map((tier) => {
            const isCurrent = momentum.title === tier.title;
            const isPassed = momentum.score >= tier.minScore;
            return (
              <div
                key={tier.title}
                className={`p-2.5 rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-[#221c0e] border-[#d4af37] text-[#d4af37] font-bold shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                    : isPassed
                    ? 'bg-[#181818] border-white/10 text-gray-300'
                    : 'bg-[#0f0f0f] border-white/5 text-gray-600 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="serif text-xs truncate">{tier.title}</span>
                  {isCurrent && <Sparkles className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />}
                </div>
                <span className="text-[10px] text-gray-500 block mt-0.5">{tier.minScore}%+ Heat</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements Roster */}
      <div className="card-bg rounded-xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="serif text-xs font-semibold uppercase tracking-widest text-gray-200">
            Unlocked Achievements
          </h3>
          <span className="text-[10px] font-mono text-gray-400">
            {achievements.filter((a) => a.isUnlocked).length} / {achievements.length} Unlocked
          </span>
        </div>

        <div className="space-y-2">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3 rounded-lg border transition-all flex items-start space-x-3 ${
                ach.isUnlocked
                  ? 'bg-[#181818] border-white/10 shadow-sm'
                  : 'bg-[#101010] border-white/5 opacity-50'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                  ach.isUnlocked
                    ? 'bg-[#241e11] border-[#d4af37]/40 text-[#d4af37]'
                    : 'bg-[#1a1a1a] border-white/5 text-gray-600'
                }`}
              >
                {getIcon(ach.iconName)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="serif font-semibold text-xs text-gray-100">{ach.title}</h4>
                  {ach.isUnlocked && (
                    <span className="text-[9px] font-mono text-emerald-400 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Unlocked</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 font-sans">{ach.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
