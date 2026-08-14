'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import {
  Dumbbell,
  Calendar,
  BarChart3,
  PlusCircle,
  Sun,
  Moon,
  Database,
  User as UserIcon,
  LogOut,
} from 'lucide-react';
import { UnitType } from '@/lib/types';
import { isSupabaseConfigured } from '@/lib/supabase';

interface NavbarProps {
  activeTab: 'dashboard' | 'analytics' | 'history';
  setActiveTab: (tab: 'dashboard' | 'analytics' | 'history') => void;
  onStartWorkout: () => void;
  preferredUnit: UnitType;
  setPreferredUnit: (unit: UnitType) => void;
  onOpenAuth: () => void;
  currentUser?: any;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onStartWorkout,
  preferredUnit,
  setPreferredUnit,
  onOpenAuth,
  currentUser,
  onLogout,
}) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userName = currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'Member';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
              GymAnalytics <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">PRO</span>
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">Track, Progress & Gain</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900/60 p-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-500" />
            Dashboard & Calendar
          </button>
          
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-cyan-500" />
            Analytics & Progress
          </button>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Start Workout Button */}
          <button
            onClick={onStartWorkout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold text-sm shadow-md shadow-emerald-500/20 hover:opacity-95 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden xs:inline">Start Workout</span>
          </button>

          {/* Unit Toggle (KG / LBS) */}
          <button
            onClick={() => setPreferredUnit(preferredUnit === 'kg' ? 'lbs' : 'kg')}
            className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all uppercase"
            title="Toggle Weight Unit"
          >
            {preferredUnit}
          </button>

          {/* Theme Toggle Button (Dark / Light) */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>
          )}

          {/* User Account / Auth Indicator */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="px-2.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5 truncate max-w-[130px]"
                title={`Logged in as ${currentUser.email}`}
              >
                <UserIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{userName}</span>
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-medium transition-all ${
                isSupabaseConfigured
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
              }`}
              title="Sign In / Manage Account"
            >
              <Database className="w-4 h-4" />
              <UserIcon className="w-3.5 h-3.5 hidden sm:inline" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
