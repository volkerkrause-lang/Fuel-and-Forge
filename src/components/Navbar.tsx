import React from 'react';
import { Home, Dumbbell, Mic, LineChart, MoreHorizontal } from 'lucide-react';

export type NavigationTab = 'home' | 'workout' | 'progress' | 'more';
export type NavTab = NavigationTab;

interface NavbarProps {
  activeTab: NavigationTab;
  onChangeTab?: (tab: NavigationTab) => void;
  onSelectTab?: (tab: NavigationTab) => void;
  onOpenVoiceModal?: () => void;
  onOpenVoiceLog?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onChangeTab,
  onSelectTab,
  onOpenVoiceModal,
  onOpenVoiceLog,
}) => {
  const handleTabClick = (tab: NavigationTab) => {
    if (onChangeTab) onChangeTab(tab);
    if (onSelectTab) onSelectTab(tab);
  };

  const handleVoiceClick = () => {
    if (onOpenVoiceModal) onOpenVoiceModal();
    if (onOpenVoiceLog) onOpenVoiceLog();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 pb-safe">
      <div className="max-w-md mx-auto px-3 py-2 flex items-center justify-between relative">
        {/* Home */}
        <button
          onClick={() => handleTabClick('home')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'home'
              ? 'text-[#d4af37] font-semibold'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] uppercase tracking-wider">Home</span>
        </button>

        {/* Workout */}
        <button
          onClick={() => handleTabClick('workout')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'workout'
              ? 'text-[#d4af37] font-semibold'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Dumbbell className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] uppercase tracking-wider">Workout</span>
        </button>

        {/* Central Voice Button */}
        <div className="flex flex-col items-center justify-center px-2 -mt-5">
          <button
            onClick={handleVoiceClick}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#d4af37] via-[#b8962e] to-[#8a6d1e] flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.35)] text-black border-2 border-[#0a0a0a] hover:scale-105 active:scale-95 transition-all animate-gold-pulse"
            title="Voice Food Log"
            aria-label="Voice Log"
          >
            <Mic className="w-6 h-6 text-black" />
          </button>
          <span className="text-[10px] font-bold text-[#d4af37] mt-1 uppercase tracking-wider">Voice</span>
        </div>

        {/* Progress */}
        <button
          onClick={() => handleTabClick('progress')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'progress'
              ? 'text-[#d4af37] font-semibold'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <LineChart className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] uppercase tracking-wider">Progress</span>
        </button>

        {/* More */}
        <button
          onClick={() => handleTabClick('more')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'more'
              ? 'text-[#d4af37] font-semibold'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] uppercase tracking-wider">More</span>
        </button>
      </div>
    </div>
  );
};
