'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  Flame,
  Moon,
  Filter,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Category, Workout, UnitType } from '@/lib/types';
import { calculateMonthlyStats, getExerciseComparisons, formatDisplayWeight } from '@/lib/storage';

interface AnalyticsViewProps {
  workouts: Workout[];
  categories: Category[];
  preferredUnit?: UnitType;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  workouts,
  categories,
  preferredUnit = 'kg',
}) => {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id || '');

  // Calculate monthly stats
  const monthlyStats = calculateMonthlyStats(workouts, selectedYear, selectedMonth);

  // Get Comparative Exercise Analytics
  const exerciseComparisons = getExerciseComparisons(workouts, selectedCategoryId || undefined);

  // Selected Category Object
  const currentCategory = categories.find((c) => c.id === selectedCategoryId);

  // Prepare Chart Data
  const chartData = exerciseComparisons.flatMap((comp) =>
    comp.sessions.map((sess) => ({
      date: sess.date,
      exercise: comp.exerciseName,
      maxWeight: sess.maxWeight ?? 0,
      totalVolume: sess.totalVolume,
      totalReps: sess.totalReps,
    }))
  );

  return (
    <div className="space-y-6">
      
      {/* Top Controls: Month Selector & Category Selector */}
      <div className="bg-white dark:bg-zinc-900/60 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-500" />
            Workout Analytics & Progress
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Compare repeated workouts, calculate percentage gains, and view progress over time
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          
          {/* Month Switcher */}
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-transparent text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={idx} value={idx} className="bg-white dark:bg-zinc-900">
                  {m} {selectedYear}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <Filter className="w-4 h-4 text-cyan-500" />
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="bg-transparent text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-white dark:bg-zinc-900">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-zinc-900">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Monthly Key Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Hours Metric */}
        <div className="bg-white dark:bg-zinc-900/60 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Monthly Hours</span>
            <h3 className="text-xl font-black text-zinc-900 dark:text-white mt-0.5">
              {monthlyStats.totalHours}h {monthlyStats.totalMinutes}m
            </h3>
            <span className="text-[10px] text-zinc-400">in {MONTH_NAMES[selectedMonth]} {selectedYear}</span>
          </div>
        </div>

        {/* Gym Attendance */}
        <div className="bg-white dark:bg-zinc-900/60 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Gym Days Attended</span>
            <h3 className="text-xl font-black text-zinc-900 dark:text-white mt-0.5">
              {monthlyStats.totalGymDays} <span className="text-xs font-normal text-zinc-400">/ {monthlyStats.daysInMonth}</span>
            </h3>
            <span className="text-[10px] text-emerald-500 font-semibold">Active Consistency</span>
          </div>
        </div>

        {/* Rest Days */}
        <div className="bg-white dark:bg-zinc-900/60 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
            <Moon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Rest Days Detected</span>
            <h3 className="text-xl font-black text-zinc-900 dark:text-white mt-0.5">
              {monthlyStats.totalRestDays} <span className="text-xs font-normal text-zinc-400">days</span>
            </h3>
            <span className="text-[10px] text-indigo-400 font-semibold">Recovery Period</span>
          </div>
        </div>

        {/* Category Sessions Count */}
        <div className="bg-white dark:bg-zinc-900/60 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Category Frequency</span>
            <h3 className="text-xl font-black text-zinc-900 dark:text-white mt-0.5">
              {currentCategory ? monthlyStats.categoryBreakdown[currentCategory.name] || 0 : monthlyStats.monthlyWorkouts.length}
            </h3>
            <span className="text-[10px] text-amber-500 font-semibold truncate block max-w-[120px]">
              {currentCategory?.name || 'Total Sessions'}
            </span>
          </div>
        </div>

      </div>

      {/* Repeated Workout Sessions & Percentage Gain Comparisons */}
      <div className="bg-white dark:bg-zinc-900/60 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Exercise Progression & Percentage Gains
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {currentCategory ? `Filtered for ${currentCategory.name}` : 'Showing all exercises across historical sessions'}
            </p>
          </div>
        </div>

        {exerciseComparisons.length === 0 ? (
          <div className="text-center py-10 text-zinc-400 dark:text-zinc-500 text-sm border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
            No repeated exercise logs recorded for this category yet. Log sessions on different dates to generate progression stats!
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {exerciseComparisons.map((comp) => {
              const sessionCount = comp.sessions.length;
              const latestSession = comp.sessions[sessionCount - 1];
              const prevSession = sessionCount > 1 ? comp.sessions[sessionCount - 2] : null;

              return (
                <div
                  key={comp.exerciseId}
                  className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                        {comp.exerciseName}
                        {comp.isBodyweight && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-normal">
                            Bodyweight
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {sessionCount} historical sessions logged
                      </p>
                    </div>

                    {/* Percentage Increase Badge */}
                    {comp.weightPercentChange !== undefined ? (
                      <div
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${
                          comp.weightPercentChange >= 0
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {comp.weightPercentChange >= 0 ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        {comp.weightPercentChange > 0 ? `+${comp.weightPercentChange}%` : `${comp.weightPercentChange}%`}
                      </div>
                    ) : comp.volumePercentChange !== undefined ? (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        +{comp.volumePercentChange}% Vol
                      </div>
                    ) : null}
                  </div>

                  {/* Sessions Comparison Timeline Cards */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* Latest Session */}
                    <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 font-medium block">Latest Session ({latestSession.date})</span>
                      <div className="font-bold text-zinc-900 dark:text-white mt-1">
                        {formatDisplayWeight(latestSession.bestSet.weight, latestSession.bestSet.unit, preferredUnit)}
                      </div>
                      <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                        {latestSession.setsCount} Sets • {latestSession.totalReps} Total Reps
                      </div>
                    </div>

                    {/* Previous Session */}
                    {prevSession ? (
                      <div className="p-2.5 rounded-lg bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80">
                        <span className="text-[10px] text-zinc-400 font-medium block">Previous Session ({prevSession.date})</span>
                        <div className="font-bold text-zinc-700 dark:text-zinc-300 mt-1">
                          {formatDisplayWeight(prevSession.bestSet.weight, prevSession.bestSet.unit, preferredUnit)}
                        </div>
                        <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                          {prevSession.setsCount} Sets • {prevSession.totalReps} Total Reps
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-zinc-100/50 dark:bg-zinc-900/30 border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 text-[11px] italic">
                        First session recorded
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Visual Progression Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Max Weight Progression Line Chart */}
          <div className="bg-white dark:bg-zinc-900/60 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Standardized Max Weight Lifted Over Dates (KG)
            </h3>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', borderColor: '#27272a', color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="maxWeight" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Volume Bar Chart */}
          <div className="bg-white dark:bg-zinc-900/60 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-500" />
              Total Session Volume (KG × Reps)
            </h3>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', borderColor: '#27272a', color: '#fff' }}
                  />
                  <Bar dataKey="totalVolume" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
