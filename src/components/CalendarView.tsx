'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Moon,
  Plus,
  Calendar as CalendarIcon,
  Trash2,
} from 'lucide-react';
import { Workout } from '@/lib/types';
import { calculateMonthlyStats } from '@/lib/storage';

interface CalendarViewProps {
  workouts: Workout[];
  onSelectDate: (dateStr: string) => void;
  onStartWorkoutForDate: (dateStr: string) => void;
  onDeleteWorkout: (workoutId: string) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const CalendarView: React.FC<CalendarViewProps> = ({
  workouts,
  onSelectDate,
  onStartWorkoutForDate,
  onDeleteWorkout,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  // Navigation between months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Calculate monthly stats
  const stats = calculateMonthlyStats(workouts, currentYear, currentMonth);

  // Generate Calendar Grid Days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = stats.daysInMonth;

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      
      {/* Month Selector & Summary Metrics Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900/60 p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors">
        
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden xs:block">
              Select any date to view or log a workout session
            </p>
          </div>
        </div>

        {/* Top Key Metrics Banner */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          
          {/* Total Monthly Hours */}
          <div className="bg-zinc-50 dark:bg-zinc-950 p-2.5 sm:p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-center text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1 text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-500 shrink-0" />
              <span>Hours</span>
            </div>
            <p className="text-xs sm:text-base font-black text-zinc-900 dark:text-white mt-0.5">
              {stats.totalHours}h {stats.totalMinutes}m
            </p>
          </div>

          {/* Gym Days Attended */}
          <div className="bg-zinc-50 dark:bg-zinc-950 p-2.5 sm:p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-center text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1 text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 shrink-0" />
              <span>Gym Days</span>
            </div>
            <p className="text-xs sm:text-base font-black text-zinc-900 dark:text-white mt-0.5">
              {stats.totalGymDays} <span className="text-[10px] sm:text-xs font-normal text-zinc-400">/ {stats.daysInMonth}</span>
            </p>
          </div>

          {/* Rest Days */}
          <div className="bg-zinc-50 dark:bg-zinc-950 p-2.5 sm:p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-center text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1 text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              <Moon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400 shrink-0" />
              <span>Rest Days</span>
            </div>
            <p className="text-xs sm:text-base font-black text-zinc-900 dark:text-white mt-0.5">
              {stats.totalRestDays} <span className="text-[10px] sm:text-xs font-normal text-zinc-400">d</span>
            </p>
          </div>

        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-zinc-900/60 p-2.5 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm w-full overflow-hidden">
        
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 text-center mb-2 text-[10px] sm:text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          
          {/* Blank Offset Days */}
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
            <div key={`blank-${idx}`} className="h-14 sm:h-24 rounded-lg sm:rounded-xl bg-zinc-50/40 dark:bg-zinc-950/20 opacity-30" />
          ))}

          {/* Actual Month Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            
            const dayWorkouts = workouts.filter((w) => w.date === dateStr);
            const hasWorkout = dayWorkouts.length > 0;
            const isToday = dateStr === todayStr;

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => onSelectDate(dateStr)}
                className={`group relative h-14 sm:h-24 p-1 sm:p-2 rounded-lg sm:rounded-xl border transition-all flex flex-col justify-between cursor-pointer overflow-hidden ${
                  isToday
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5'
                    : hasWorkout
                    ? 'border-zinc-300 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-800/50 hover:border-emerald-500/50'
                    : 'border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/30 dark:bg-zinc-950/40 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] sm:text-xs font-bold w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-emerald-500 text-white'
                        : 'text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {/* Add (+) workout button on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartWorkoutForDate(dateStr);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 sm:p-1 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition-opacity hidden xs:block"
                    title={`Start workout for ${dateStr}`}
                  >
                    <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </button>
                </div>

                {/* Workout Category Badges or Rest Day Badge */}
                <div className="space-y-0.5 sm:space-y-1 overflow-hidden">
                  {hasWorkout ? (
                    dayWorkouts.map((w) => (
                      <div
                        key={w.id}
                        className="truncate text-[8px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20 flex items-center gap-0.5 sm:gap-1"
                      >
                        <Dumbbell className="w-2.5 h-2.5 shrink-0 hidden xs:inline" />
                        <span className="truncate">{w.categoryName}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-[8px] sm:text-[10px] text-zinc-400 dark:text-zinc-600 flex items-center gap-0.5 sm:gap-1 italic opacity-75">
                      <Moon className="w-2 h-2 sm:w-2.5 sm:h-2.5 shrink-0" />
                      <span className="hidden xs:inline">Rest</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* Monthly Workouts Log List */}
      <div className="bg-white dark:bg-zinc-900/60 p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 w-full">
        <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white flex items-center justify-between">
          <span>{MONTH_NAMES[currentMonth]} Gym Sessions ({stats.monthlyWorkouts.length})</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal hidden sm:inline">
            Click any session to review
          </span>
        </h3>

        {stats.monthlyWorkouts.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 text-xs sm:text-sm border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
            <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50 text-emerald-500" />
            No workout sessions logged for {MONTH_NAMES[currentMonth]} {currentYear} yet.
            <div className="mt-3">
              <button
                onClick={() => onStartWorkoutForDate(todayStr)}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-medium text-xs shadow-md hover:bg-emerald-600 transition-colors"
              >
                Log Today's Workout
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {stats.monthlyWorkouts.map((w) => {
              const minutes = Math.floor((w.durationSec || 0) / 60);
              return (
                <div
                  key={w.id}
                  className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                          {w.categoryName}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                          {w.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 mt-2">
                        <span className="flex items-center gap-1 font-semibold text-zinc-900 dark:text-zinc-200">
                          <Clock className="w-3.5 h-3.5 text-cyan-500" />
                          {minutes} mins
                        </span>
                        <span>•</span>
                        <span>{w.sets?.length || 0} Sets Logged</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteWorkout(w.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete workout log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Summary of Exercises in Workout */}
                  <div className="space-y-1.5 border-t border-zinc-200/60 dark:border-zinc-800/60 pt-2 text-xs">
                    {w.sets.slice(0, 3).map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between text-zinc-600 dark:text-zinc-300">
                        <span className="truncate">{s.exerciseName} (Set {s.setNumber})</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {s.weight !== null && s.weight !== undefined ? `${s.weight}${s.unit}` : 'Bodyweight'} × {s.reps} reps
                        </span>
                      </div>
                    ))}
                    {w.sets.length > 3 && (
                      <div className="text-[10px] text-zinc-400 italic">
                        + {w.sets.length - 3} more sets...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
