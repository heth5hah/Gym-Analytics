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
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Category, Exercise, Workout, WorkoutSet, UnitType } from '@/lib/types';
import { saveCategory, saveExercise } from '@/lib/storage';

interface ActiveWorkoutModalProps {
  initialDate?: string;
  categories: Category[];
  exercises: Exercise[];
  preferredUnit: UnitType;
  currentUser?: any;
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
  currentUser,
  onClose,
  onSaveWorkout,
  onRefreshCategories,
  onRefreshExercises,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [workoutDate, setWorkoutDate] = useState(initialDate || todayStr);

  // Workflow Steps: 1 = Select Category, 2 = Select & Log Exercises
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Selected Category
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(categories[0] || null);

  // Timer states
  const [timerSec, setTimerSec] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [startTime] = useState(new Date().toISOString());

  // Category & Exercise Modals/Forms
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExIsBodyweight, setNewExIsBodyweight] = useState(false);

  // Local Exercises State for Instant UI Feedback
  const [localExercises, setLocalExercises] = useState<Exercise[]>(exercises);

  useEffect(() => {
    // Merge incoming exercises with any custom ones added locally during this session
    setLocalExercises((prev) => {
      const mergedMap = new Map<string, Exercise>();
      exercises.forEach((ex) => mergedMap.set(ex.id, ex));
      prev.forEach((ex) => {
        if (!mergedMap.has(ex.id)) {
          mergedMap.set(ex.id, ex);
        }
      });
      return Array.from(mergedMap.values());
    });
  }, [exercises]);

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

  // Select Category and auto-advance to Step 2
  const handleSelectCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setCurrentStep(2);
  };

  // Add Custom Category Handler
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const created = saveCategory(newCatName.trim(), currentUser?.id);
    onRefreshCategories();
    setSelectedCategory(created);
    setNewCatName('');
    setShowAddCategory(false);
    setCurrentStep(2);
  };

  // Add Custom Exercise Handler (Saves to database AND auto-logs set #1)
  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim() || !selectedCategory) return;

    const createdEx = saveExercise(
      newExName.trim(),
      selectedCategory.id,
      newExIsBodyweight,
      currentUser?.id
    );

    // Update local exercises state instantly
    setLocalExercises((prev) => {
      const exists = prev.some((ex) => ex.id === createdEx.id);
      return exists ? prev : [...prev, createdEx];
    });

    onRefreshExercises();

    // Auto-add first set for this newly created exercise
    handleAddSetForExercise(createdEx);

    setNewExName('');
    setNewExIsBodyweight(false);
    setShowAddExercise(false);
  };

  // Add New Set Row for an Exercise
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
    if (!selectedCategory) {
      alert('Please select a category for your workout.');
      setCurrentStep(1);
      return;
    }

    const completedSets = sets.filter((s) => s.reps > 0);
    if (completedSets.length === 0) {
      alert('Please log at least one exercise set before finishing the workout.');
      return;
    }

    const endTime = new Date().toISOString();
    const workoutObj: Workout = {
      id: `workout-${Date.now()}`,
      userId: currentUser?.id || 'user-current',
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

  // Filter exercises relevant to selected category or global exercises
  const categoryExercises = selectedCategory
    ? localExercises.filter(
        (ex) =>
          !ex.categoryId ||
          ex.categoryId === selectedCategory.id ||
          ex.categoryId === selectedCategory.name
      )
    : localExercises;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto overflow-x-hidden">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[94vh] transition-colors overflow-hidden mx-auto">
        
        {/* Top Sticky Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 rounded-t-2xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white flex items-center justify-center shadow-md shrink-0">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-zinc-900 dark:text-white leading-tight">
                Active Workout Session
              </h2>
              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                <span>Date:</span>
                <input
                  type="date"
                  value={workoutDate}
                  onChange={(e) => setWorkoutDate(e.target.value)}
                  className="bg-transparent font-bold text-emerald-600 dark:text-emerald-400 border-b border-emerald-500/40 focus:outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Realtime Live Timer Widget & Close */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs sm:text-sm flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
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

        {/* Workflow Step Breadcrumb Bar */}
        <div className="bg-zinc-100 dark:bg-zinc-950 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-1.5 font-bold transition-all px-2.5 py-1 rounded-lg ${
                currentStep === 1
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <span>1. Select Category</span>
            </button>

            <ChevronRight className="w-4 h-4 text-zinc-400" />

            <button
              onClick={() => {
                if (selectedCategory) setCurrentStep(2);
              }}
              className={`flex items-center gap-1.5 font-bold transition-all px-2.5 py-1 rounded-lg ${
                currentStep === 2
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <span>2. Log Exercises & Sets</span>
            </button>
          </div>

          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hidden xs:inline">
            {sets.length} Sets Logged
          </span>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* STEP 1: SELECT CATEGORY SPLIT */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                    <Tag className="w-4 h-4 text-cyan-500" />
                    Step 1: Choose Workout Category
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    First, select which muscle split you are training today
                  </p>
                </div>

                <button
                  onClick={() => setShowAddCategory(!showAddCategory)}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Custom Category
                </button>
              </div>

              {/* Custom Category Form */}
              {showAddCategory && (
                <form onSubmit={handleCreateCategory} className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Category Name (e.g. Arms & Abs, Calisthenics)"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md"
                  >
                    Save & Select
                  </button>
                </form>
              )}

              {/* Category Grid Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map((cat) => {
                  const isSelected = selectedCategory?.id === cat.id;
                  const catExCount = localExercises.filter(
                    (ex) =>
                      !ex.categoryId ||
                      ex.categoryId === cat.id ||
                      ex.categoryId === cat.name
                  ).length;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat)}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 group ${
                        isSelected
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/50 hover:border-emerald-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isSelected
                              ? 'bg-emerald-500 text-white'
                              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-500'
                          }`}
                        >
                          <Tag className="w-4 h-4" />
                        </div>
                        {isSelected && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold">
                            Selected
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white">
                          {cat.name}
                        </h4>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {catExCount} exercises available
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedCategory && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 hover:opacity-95"
                  >
                    <span>Continue to Exercises ({selectedCategory.name})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: LOG EXERCISES & SETS FOR SELECTED CATEGORY */}
          {currentStep === 2 && (
            <div className="space-y-6">
              
              {/* Selected Category Header Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium block">Category Split</span>
                    <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">
                      {selectedCategory?.name}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:border-emerald-500 transition-all flex items-center gap-1 shrink-0"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Change Category
                </button>
              </div>

              {/* Add Exercises Button & Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-emerald-500" />
                    SELECT EXERCISE TO ADD SETS ({categoryExercises.length})
                  </label>
                  <button
                    onClick={() => setShowAddExercise(!showAddExercise)}
                    className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + New Exercise for {selectedCategory?.name}
                  </button>
                </div>

                {/* Custom Exercise Form */}
                {showAddExercise && (
                  <form onSubmit={handleCreateExercise} className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 space-y-3 text-xs border border-zinc-200 dark:border-zinc-700">
                    <h4 className="font-bold text-zinc-900 dark:text-white">
                      Add New Exercise to <span className="text-emerald-500">{selectedCategory?.name}</span>
                    </h4>
                    
                    <input
                      type="text"
                      required
                      placeholder="Exercise Name (e.g. Incline Bench Press, Cable Flyes)"
                      value={newExName}
                      onChange={(e) => setNewExName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300 font-medium">
                        <input
                          type="checkbox"
                          checked={newExIsBodyweight}
                          onChange={(e) => setNewExIsBodyweight(e.target.checked)}
                          className="rounded text-emerald-500 focus:ring-emerald-500"
                        />
                        <span>Bodyweight Exercise (No weight needed)</span>
                      </label>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddExercise(false)}
                          className="px-3 py-1.5 text-zinc-400 hover:text-zinc-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-cyan-500 text-white font-bold rounded-xl shadow-md"
                        >
                          Add & Log Set
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Exercise Badges list for selected Category */}
                <div className="flex flex-wrap gap-2">
                  {categoryExercises.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => handleAddSetForExercise(ex)}
                      className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:border-emerald-500 hover:text-emerald-500 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-500" />
                      {ex.name}
                      {ex.isBodyweight && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 font-normal">
                          BW
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logged Sets List */}
              <div className="space-y-4 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  LOGGED SETS ({sets.length})
                </h3>

                {sets.length === 0 ? (
                  <div className="text-center py-10 text-zinc-400 dark:text-zinc-500 text-xs border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                    <Dumbbell className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-50" />
                    Click any exercise button above to add sets to your workout!
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
                          className="p-3.5 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/70 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                              <Dumbbell className="w-4 h-4 text-emerald-500" />
                              {exName}
                              {isBodyweight && (
                                <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">
                                  Bodyweight
                                </span>
                              )}
                            </span>

                            <button
                              onClick={() => {
                                const ex = localExercises.find((e) => e.id === exId) || { id: exId, name: exName, isBodyweight };
                                handleAddSetForExercise(ex);
                              }}
                              className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Add Set
                            </button>
                          </div>

                          {/* Set Rows */}
                          <div className="space-y-2">
                            {exSets.map((s, idx) => (
                              <div
                                key={s.id}
                                className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 text-xs"
                              >
                                <span className="font-bold text-zinc-400 w-12 text-center">
                                  Set {idx + 1}
                                </span>

                                {/* Weight Input */}
                                <div className="flex-1 flex items-center gap-1.5">
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
                                    className="w-20 px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    style={{ fontSize: '16px' }}
                                  />

                                  <button
                                    onClick={() =>
                                      handleUpdateSet(s.id, {
                                        unit: s.unit === 'kg' ? 'lbs' : 'kg',
                                      })
                                    }
                                    className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-300 uppercase"
                                  >
                                    {s.unit}
                                  </button>
                                </div>

                                {/* Reps Input */}
                                <div className="flex-1 flex items-center gap-1.5">
                                  <span className="text-zinc-400 font-medium hidden xs:inline">Reps:</span>
                                  <input
                                    type="number"
                                    value={s.reps}
                                    onChange={(e) =>
                                      handleUpdateSet(s.id, {
                                        reps: parseInt(e.target.value) || 0,
                                      })
                                    }
                                    className="w-16 px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    style={{ fontSize: '16px' }}
                                  />
                                </div>

                                {/* Completed Checkmark Toggle */}
                                <button
                                  onClick={() => handleUpdateSet(s.id, { isCompleted: !s.isCompleted })}
                                  className={`p-2 rounded-lg transition-colors ${
                                    s.isCompleted
                                      ? 'bg-emerald-500 text-white'
                                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
                                  }`}
                                  title="Mark set completed"
                                >
                                  <Check className="w-4 h-4" />
                                </button>

                                {/* Remove Set Row */}
                                <button
                                  onClick={() => handleDeleteSet(s.id)}
                                  className="p-2 text-zinc-400 hover:text-rose-500 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
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
          )}

        </div>

        {/* Modal Sticky Bottom Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 rounded-b-2xl flex items-center justify-between gap-2">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            Category: <span className="font-bold text-zinc-900 dark:text-white">{selectedCategory?.name || 'None'}</span>
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
