'use client';

import React from 'react';
import { Calendar, BarChart3, Plus } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'dashboard' | 'analytics' | 'history';
  setActiveTab: (tab: 'dashboard' | 'analytics' | 'history') => void;
  onStartWorkout: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onStartWorkout,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-zinc-950/90 border-t border-zinc-200 dark:border-zinc-800 backdrop-blur-lg px-4 py-2 flex items-center justify-around shadow-lg">
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
          activeTab === 'dashboard'
            ? 'text-emerald-500 font-bold'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
        }`}
      >
        <Calendar className="w-5 h-5" />
        Dashboard
      </button>

      {/* Floating Center Start Button */}
      <button
        onClick={onStartWorkout}
        className="w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all"
        title="Start Workout"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      <button
        onClick={() => setActiveTab('analytics')}
        className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
          activeTab === 'analytics'
            ? 'text-cyan-500 font-bold'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
        }`}
      >
        <BarChart3 className="w-5 h-5" />
        Analytics
      </button>
    </div>
  );
};
