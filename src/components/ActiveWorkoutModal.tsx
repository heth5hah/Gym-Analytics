'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Pause,
  Plus,
  Trash2,
  Check,
  X,
  Dumbbell,
  Tag,
  Save,
  Copy,
} from 'lucide-react';
import { Category, Exercise, Workout, WorkoutSet, UnitType } from '@/lib/types';
import { saveCategory, saveExercise } from '@/lib/storage';

interface ActiveWorkoutModalProps {
  initialDate?: string;
  categories: Category[];
  exercises: Exercise[];
  preferredUnit: UnitType;
  onClose: () => void;
  onSaveWorkout: (workout: Workout) => void;
  onRefreshCategories: () => void;
  onRefreshExercises: () => void;
}

export const ActiveWorkoutModal: React.FC<ActiveWorkoutModalProps> = ({
  initialDate,
  categories,
  exercises,
  preferredUnit,
  onClose,
  onSaveWorkout,
  onRefreshCategories,
  onRefreshExercises,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [workoutDate, setWorkoutDate] = useState(initialDate || todayStr);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(categories[0] || null);

  // Timer states
  const [timerSec, setTimerSec] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [startTime] = useState(new Date().toISOString());

  // Category & Exercise Modals
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExIsBodyweight, setNewExIsBodyweight] = useState(false);

  // Set Logs
  const [sets, setSets] = useState<WorkoutSet[]>([]);

  // Ticking Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSec((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Format Timer Duration HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Add Custom Category Handler
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const created = saveCategory(newCatName.trim());
    onRefreshCategories();
    setSelectedCategory(created);
    setNewCatName('');
    setShowAddCategory(false);
  };

  // Add Custom Exercise Handler
  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim() || !selectedCategory) return;
    saveExercise(newExName.trim(), selectedCategory.id, newExIsBodyweight);
    onRefreshExercises();
    setNewExName('');
    setNewExIsBodyweight(false);
    setShowAddExercise(false);
  };

  // Add New Set Row
  const handleAddSetForExercise = (exercise: Exercise) => {
    const existingSetsForEx = sets.filter((s) => s.exerciseId === exercise.id);
    const nextSetNum = existingSetsForEx.length + 1;
    const lastSet = existingSetsForEx[existingSetsForEx.length - 1];

    const newSet: WorkoutSet = {
      id: `set-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      workoutId: '',
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      setNumber: nextSetNum,
      weight: exercise.isBodyweight ? null : (lastSet?.weight ?? 10),
      unit: preferredUnit,
      reps: lastSet?.reps ?? 12,
      isCompleted: true,
    };

    setSets((prev) => [...prev, newSet]);
  };

  // Update set field
  const handleUpdateSet = (setId: string, updates: Partial<WorkoutSet>) => {
    setSets((prev) =>
      prev.map((s) => (s.id === setId ? { ...s, ...updates } : s))
    );
  };

  // Delete set row
  const handleDeleteSet = (setId: string) => {
    setSets((prev) => prev.filter((s) => s.id !== setId));
  };

  // Finish Workout & Save
  const handleFinishWorkout = () => {
    if (!selectedCategory) return;

    const completedSets = sets.filter((s) => s.reps > 0);
    if (completedSets.length === 0) {
      alert('Please log at least one exercise set before finishing the workout.');
      return;
    }

    const endTime = new Date().toISOString();
    const workoutObj: Workout = {
      id: `workout-${Date.now()}`,
      userId: 'user-current',
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.name,
      date: workoutDate,
      startTime,
      endTime,
      durationSec: timerSec,
      sets: completedSets,
      createdAt: endTime,
    };

    onSaveWorkout(workoutObj);
    onClose();
  };

  // Filter exercises relevant to selected category or global
  const filteredExercises = selectedCategory
    ? exercises.filter((ex) => !ex.categoryId || ex.categoryId === selectedCategory.id)
    : exercises;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] transition-colors">
        
        {/* Top Sticky Header & Live Duration Bar */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white flex items-center justify-center shadow-md">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-zinc-900 dark:text-white">
                Active Workout Session
              </h2>
              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <span>Date:</span>
                <input
                  type="date"
                  value={workoutDate}
                  onChange={(e) => setWorkoutDate(e.target.value)}
                  className="bg-transparent font-medium text-emerald-600 dark:text-emerald-400 border-b border-emerald-500/40 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Realtime Live Timer Widget */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm sm:text-base flex items-center gap-2">
              <Clock className="w-4 h-4 animate-pulse text-emerald-500" />
              {formatTime(timerSec)}
            </div>

            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
              title={isTimerRunning ? 'Pause Timer' : 'Resume Timer'}
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-500" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Category Picker & Custom Category Option */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-500" />
                Select Category Split
              </label>
              <button
                onClick={() => setShowAddCategory(true)}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Custom Category
              </button>
            </div>

            {/* Category Chips */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedCategory?.id === cat.id
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-transparent shadow-md shadow-emerald-500/20'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500/50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Custom Category Inline Form Modal */}
            {showAddCategory && (
              <form onSubmit={handleCreateCategory} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Category Name (e.g., Arms & Abs)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-xl"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCategory(false)}
                  className="px-2 py-1.5 text-zinc-400 text-xs"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>

          {/* Exercise Selector & Quick Log Buttons */}
          <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-emerald-500" />
                Add Exercises to Session
              </label>
              <button
                onClick={() => setShowAddExercise(true)}
                className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                New Exercise
              </button>
            </div>

            {/* Custom Exercise Form */}
            {showAddExercise && (
              <form onSubmit={handleCreateExercise} className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 space-y-3 text-xs">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Exercise Name (e.g., Push Ups, Incline Bench)"
                    value={newExName}
                    onChange={(e) => setNewExName(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none"
                  />
                  <label className="flex items-center gap-1.5 cursor-pointer text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={newExIsBodyweight}
                      onChange={(e) => setNewExIsBodyweight(e.target.checked)}
                      className="rounded text-emerald-500 focus:ring-emerald-500"
                    />
                    Bodyweight Only (No weights required)
                  </label>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddExercise(false)}
                    className="px-3 py-1 text-zinc-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-cyan-500 text-white font-bold rounded-lg"
                  >
                    Add Exercise
                  </button>
                </div>
              </form>
            )}

            {/* Exercise Badges */}
            <div className="flex flex-wrap gap-2">
              {filteredExercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => handleAddSetForExercise(ex)}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:border-emerald-500 hover:text-emerald-500 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3 h-3 text-emerald-500" />
                  {ex.name}
                  {ex.isBodyweight && (
                    <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-500 font-normal">
                      BW
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sets Table Log */}
          <div className="space-y-4 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Logged Exercise Sets ({sets.length})
            </h3>

            {sets.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 text-xs border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                Click any exercise button above to start logging sets!
              </div>
            ) : (
              <div className="space-y-3">
                {/* Group sets by exercise */}
                {Array.from(new Set(sets.map((s) => s.exerciseId))).map((exId) => {
                  const exSets = sets.filter((s) => s.exerciseId === exId);
                  const exName = exSets[0]?.exerciseName || 'Exercise';
                  const isBodyweight = exSets[0]?.weight === null;

                  return (
                    <div
                      key={exId}
                      className="p-3 sm:p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/70 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                          <Dumbbell className="w-4 h-4 text-emerald-500" />
                          {exName}
                          {isBodyweight && (
                            <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">
                              Bodyweight Exercise (Weight Optional)
                            </span>
                          )}
                        </span>

                        <button
                          onClick={() => {
                            const ex = exercises.find((e) => e.id === exId) || { id: exId, name: exName, isBodyweight };
                            handleAddSetForExercise(ex);
                          }}
                          className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Add Set
                        </button>
                      </div>

                      {/* Set Rows */}
                      <div className="space-y-2">
                        {exSets.map((s, idx) => (
                          <div
                            key={s.id}
                            className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-zinc-900 p-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 text-xs"
                          >
                            <span className="font-bold text-zinc-400 w-12 text-center">
                              Set {idx + 1}
                            </span>

                            {/* Weight Input (Optional for bodyweight) */}
                            <div className="flex-1 flex items-center gap-1">
                              <input
                                type="number"
                                step="0.5"
                                placeholder={isBodyweight ? 'BW (0)' : 'Weight'}
                                value={s.weight ?? ''}
                                onChange={(e) =>
                                  handleUpdateSet(s.id, {
                                    weight: e.target.value === '' ? null : parseFloat(e.target.value),
                                  })
                                }
                                className="w-20 px-2 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />

                              {/* Unit Toggle Button */}
                              <button
                                onClick={() =>
                                  handleUpdateSet(s.id, {
                                    unit: s.unit === 'kg' ? 'lbs' : 'kg',
                                  })
                                }
                                className="px-1.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-300 uppercase"
                              >
                                {s.unit}
                              </button>
                            </div>

                            {/* Reps Input */}
                            <div className="flex-1 flex items-center gap-1.5">
                              <span className="text-zinc-400 font-medium">Reps:</span>
                              <input
                                type="number"
                                value={s.reps}
                                onChange={(e) =>
                                  handleUpdateSet(s.id, {
                                    reps: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="w-16 px-2 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>

                            {/* Completed Checkmark Toggle */}
                            <button
                              onClick={() => handleUpdateSet(s.id, { isCompleted: !s.isCompleted })}
                              className={`p-1.5 rounded-lg transition-colors ${
                                s.isCompleted
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
                              }`}
                              title="Mark set completed"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>

                            {/* Remove Set Row */}
                            <button
                              onClick={() => handleDeleteSet(s.id)}
                              className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Modal Bottom Sticky Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 rounded-b-2xl flex items-center justify-between">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            Category: <span className="font-bold text-zinc-900 dark:text-white">{selectedCategory?.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              Discard
            </button>

            <button
              onClick={handleFinishWorkout}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 hover:opacity-95 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              Finish Workout
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
