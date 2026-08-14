import { Category, Exercise, Workout, WorkoutSet, UserProfile, ExerciseComparison, UnitType } from './types';

// Weight conversion helper utilities
export const toKg = (weight: number | null | undefined, unit: UnitType = 'kg'): number | null => {
  if (weight === null || weight === undefined) return null;
  if (unit === 'lbs') {
    return parseFloat((weight * 0.45359237).toFixed(2));
  }
  return parseFloat(weight.toFixed(2));
};

export const toLbs = (weight: number | null | undefined, unit: UnitType = 'lbs'): number | null => {
  if (weight === null || weight === undefined) return null;
  if (unit === 'kg') {
    return parseFloat((weight * 2.20462262).toFixed(2));
  }
  return parseFloat(weight.toFixed(2));
};

export const formatDisplayWeight = (
  weight: number | null | undefined,
  loggedUnit: UnitType = 'kg',
  targetUnit: UnitType = 'kg'
): string => {
  if (weight === null || weight === undefined) return 'Bodyweight';
  if (loggedUnit === targetUnit) {
    return `${weight} ${loggedUnit}`;
  }
  const converted = targetUnit === 'kg' ? toKg(weight, loggedUnit) : toLbs(weight, loggedUnit);
  return `${weight} ${loggedUnit} (${converted} ${targetUnit})`;
};

// Default Global Categories
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Chest & Triceps' },
  { id: 'cat-2', name: 'Back & Biceps' },
  { id: 'cat-3', name: 'Shoulders' },
  { id: 'cat-4', name: 'Legs' },
  { id: 'cat-5', name: 'Core' },
  { id: 'cat-6', name: 'Cardio' },
];

// Default Global Exercises
export const DEFAULT_EXERCISES: Exercise[] = [
  // Chest & Triceps
  { id: 'ex-1', categoryId: 'cat-1', name: 'Barbell Bench Press', isBodyweight: false },
  { id: 'ex-2', categoryId: 'cat-1', name: 'Incline Dumbbell Press', isBodyweight: false },
  { id: 'ex-3', categoryId: 'cat-1', name: 'Push Ups', isBodyweight: true },
  { id: 'ex-4', categoryId: 'cat-1', name: 'Tricep Rope Pushdown', isBodyweight: false },
  { id: 'ex-5', categoryId: 'cat-1', name: 'Dips', isBodyweight: true },
  // Back & Biceps
  { id: 'ex-6', categoryId: 'cat-2', name: 'Lat Pull Down', isBodyweight: false },
  { id: 'ex-7', categoryId: 'cat-2', name: 'Pull Ups', isBodyweight: true },
  { id: 'ex-8', categoryId: 'cat-2', name: 'Seated Cable Row', isBodyweight: false },
  { id: 'ex-9', categoryId: 'cat-2', name: 'Bicep Barbell Curl', isBodyweight: false },
  { id: 'ex-10', categoryId: 'cat-2', name: 'Hammer Curls', isBodyweight: false },
  // Shoulders
  { id: 'ex-11', categoryId: 'cat-3', name: 'Overhead Press', isBodyweight: false },
  { id: 'ex-12', categoryId: 'cat-3', name: 'Dumbbell Lateral Raise', isBodyweight: false },
  { id: 'ex-13', categoryId: 'cat-3', name: 'Face Pulls', isBodyweight: false },
  // Legs
  { id: 'ex-14', categoryId: 'cat-4', name: 'Barbell Squat', isBodyweight: false },
  { id: 'ex-15', categoryId: 'cat-4', name: 'Leg Press', isBodyweight: false },
  { id: 'ex-16', categoryId: 'cat-4', name: 'Romanian Deadlift', isBodyweight: false },
  { id: 'ex-17', categoryId: 'cat-4', name: 'Leg Extensions', isBodyweight: false },
  // Core
  { id: 'ex-18', categoryId: 'cat-5', name: 'Crunches', isBodyweight: true },
  { id: 'ex-19', categoryId: 'cat-5', name: 'Plank', isBodyweight: true },
  { id: 'ex-20', categoryId: 'cat-5', name: 'Hanging Leg Raise', isBodyweight: true },
];

const STORAGE_KEYS = {
  CATEGORIES: 'gym_analytics_categories',
  EXERCISES: 'gym_analytics_exercises',
  WORKOUTS: 'gym_analytics_workouts',
  USER_PROFILE: 'gym_analytics_profile',
};

// Initial Seed Workouts for Guest / Demo showcase
const SEED_WORKOUTS: Workout[] = [
  {
    id: 'w-1',
    userId: 'guest-demo',
    categoryId: 'cat-1',
    categoryName: 'Chest & Triceps',
    date: '2026-08-03',
    startTime: '2026-08-03T10:00:00.000Z',
    endTime: '2026-08-03T11:15:00.000Z',
    durationSec: 4500, // 1h 15m
    sets: [
      { id: 's-1', workoutId: 'w-1', exerciseId: 'ex-1', exerciseName: 'Barbell Bench Press', setNumber: 1, weight: 135, unit: 'lbs', reps: 12, isCompleted: true },
      { id: 's-2', workoutId: 'w-1', exerciseId: 'ex-1', exerciseName: 'Barbell Bench Press', setNumber: 2, weight: 155, unit: 'lbs', reps: 10, isCompleted: true },
      { id: 's-3', workoutId: 'w-1', exerciseId: 'ex-1', exerciseName: 'Barbell Bench Press', setNumber: 3, weight: 165, unit: 'lbs', reps: 8, isCompleted: true },
      { id: 's-4', workoutId: 'w-1', exerciseId: 'ex-3', exerciseName: 'Push Ups', setNumber: 1, weight: null, unit: 'kg', reps: 20, isCompleted: true },
      { id: 's-5', workoutId: 'w-1', exerciseId: 'ex-3', exerciseName: 'Push Ups', setNumber: 2, weight: null, unit: 'kg', reps: 18, isCompleted: true },
    ],
    createdAt: '2026-08-03T11:15:00.000Z',
  },
  {
    id: 'w-2',
    userId: 'guest-demo',
    categoryId: 'cat-2',
    categoryName: 'Back & Biceps',
    date: '2026-08-05',
    startTime: '2026-08-05T17:30:00.000Z',
    endTime: '2026-08-05T18:35:00.000Z',
    durationSec: 3900, // 1h 05m
    sets: [
      { id: 's-6', workoutId: 'w-2', exerciseId: 'ex-6', exerciseName: 'Lat Pull Down', setNumber: 1, weight: 45, unit: 'kg', reps: 15, isCompleted: true },
      { id: 's-7', workoutId: 'w-2', exerciseId: 'ex-6', exerciseName: 'Lat Pull Down', setNumber: 2, weight: 55, unit: 'kg', reps: 12, isCompleted: true },
      { id: 's-8', workoutId: 'w-2', exerciseId: 'ex-7', exerciseName: 'Pull Ups', setNumber: 1, weight: null, unit: 'kg', reps: 10, isCompleted: true },
    ],
    createdAt: '2026-08-05T18:35:00.000Z',
  },
];

const isGuestUser = (userId?: string) => {
  return !userId || userId.startsWith('guest');
};

const getStorageEngine = (userId?: string) => {
  if (typeof window === 'undefined') return null;
  // Guest sessions use sessionStorage so data is lost on page refresh / tab close
  return isGuestUser(userId) ? sessionStorage : localStorage;
};

const getUserKey = (baseKey: string, userId?: string) => {
  return userId ? `${baseKey}_${userId}` : baseKey;
};

export const getStoredCategories = (userId?: string): Category[] => {
  const engine = getStorageEngine(userId);
  if (!engine) return DEFAULT_CATEGORIES;
  const key = getUserKey(STORAGE_KEYS.CATEGORIES, userId);
  const raw = engine.getItem(key);
  if (!raw) {
    engine.setItem(key, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }
  return JSON.parse(raw);
};

export const saveCategory = (newCatName: string, userId?: string): Category => {
  const categories = getStoredCategories(userId);
  const engine = getStorageEngine(userId);
  const key = getUserKey(STORAGE_KEYS.CATEGORIES, userId);
  const newCat: Category = {
    id: `cat-custom-${Date.now()}`,
    name: newCatName,
    userId: userId || 'user-custom',
    createdAt: new Date().toISOString(),
  };
  const updated = [...categories, newCat];
  if (engine) engine.setItem(key, JSON.stringify(updated));
  return newCat;
};

export const getStoredExercises = (userId?: string): Exercise[] => {
  const engine = getStorageEngine(userId);
  if (!engine) return DEFAULT_EXERCISES;
  const key = getUserKey(STORAGE_KEYS.EXERCISES, userId);
  const raw = engine.getItem(key);
  if (!raw) {
    engine.setItem(key, JSON.stringify(DEFAULT_EXERCISES));
    return DEFAULT_EXERCISES;
  }
  return JSON.parse(raw);
};

export const saveExercise = (name: string, categoryId: string, isBodyweight: boolean, userId?: string): Exercise => {
  const exercises = getStoredExercises(userId);
  const engine = getStorageEngine(userId);
  const key = getUserKey(STORAGE_KEYS.EXERCISES, userId);
  const newEx: Exercise = {
    id: `ex-custom-${Date.now()}`,
    name,
    categoryId,
    isBodyweight,
    userId: userId || 'user-custom',
    createdAt: new Date().toISOString(),
  };
  const updated = [...exercises, newEx];
  if (engine) engine.setItem(key, JSON.stringify(updated));
  return newEx;
};

export const getStoredWorkouts = (userId?: string): Workout[] => {
  const engine = getStorageEngine(userId);
  if (!engine) return [];
  const key = getUserKey(STORAGE_KEYS.WORKOUTS, userId);
  const raw = engine.getItem(key);
  if (!raw) {
    // Guest gets initial demo workouts for current session, registered users start empty
    const initial = isGuestUser(userId) ? SEED_WORKOUTS : [];
    engine.setItem(key, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(raw);
};

export const saveWorkout = (workout: Workout, userId?: string): Workout[] => {
  const current = getStoredWorkouts(userId);
  const engine = getStorageEngine(userId);
  const key = getUserKey(STORAGE_KEYS.WORKOUTS, userId);
  const existingIdx = current.findIndex((w) => w.id === workout.id);
  let updated: Workout[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = workout;
  } else {
    updated = [workout, ...current];
  }
  if (engine) engine.setItem(key, JSON.stringify(updated));
  return updated;
};

export const deleteWorkout = (workoutId: string, userId?: string): Workout[] => {
  const current = getStoredWorkouts(userId);
  const engine = getStorageEngine(userId);
  const key = getUserKey(STORAGE_KEYS.WORKOUTS, userId);
  const updated = current.filter((w) => w.id !== workoutId);
  if (engine) engine.setItem(key, JSON.stringify(updated));
  return updated;
};

// Calculate monthly metrics & rest days
export const calculateMonthlyStats = (workouts: Workout[], year: number, monthZeroIndexed: number) => {
  const yearMonthStr = `${year}-${String(monthZeroIndexed + 1).padStart(2, '0')}`;
  const daysInMonth = new Date(year, monthZeroIndexed + 1, 0).getDate();
  
  const monthlyWorkouts = workouts.filter((w) => w.date.startsWith(yearMonthStr));
  const activeGymDates = new Set(monthlyWorkouts.map((w) => w.date));
  
  const totalGymDays = activeGymDates.size;
  const totalRestDays = daysInMonth - totalGymDays;
  
  const totalDurationSec = monthlyWorkouts.reduce((acc, w) => acc + (w.durationSec || 0), 0);
  const totalHours = Math.floor(totalDurationSec / 3600);
  const totalMinutes = Math.floor((totalDurationSec % 3600) / 60);

  const categoryBreakdown: Record<string, number> = {};
  monthlyWorkouts.forEach((w) => {
    const name = w.categoryName || 'Other';
    categoryBreakdown[name] = (categoryBreakdown[name] || 0) + 1;
  });

  return {
    yearMonthStr,
    daysInMonth,
    monthlyWorkouts,
    totalGymDays,
    totalRestDays,
    totalHours,
    totalMinutes,
    totalDurationSec,
    categoryBreakdown,
  };
};

// Exercise session comparative analysis (% gains calculation with standardized unit conversion)
export const getExerciseComparisons = (workouts: Workout[], categoryId?: string): ExerciseComparison[] => {
  const filteredWorkouts = categoryId
    ? workouts.filter((w) => w.categoryId === categoryId)
    : workouts;

  const exerciseMap: Record<string, ExerciseComparison> = {};

  // Sort chronological
  const sortedWorkouts = [...filteredWorkouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  sortedWorkouts.forEach((w) => {
    w.sets.forEach((s) => {
      if (!s.isCompleted) return;
      
      if (!exerciseMap[s.exerciseId]) {
        exerciseMap[s.exerciseId] = {
          exerciseId: s.exerciseId,
          exerciseName: s.exerciseName || 'Exercise',
          isBodyweight: s.weight === null || s.weight === undefined,
          sessions: [],
        };
      }

      const comp = exerciseMap[s.exerciseId];
      let session = comp.sessions.find((sess) => sess.workoutId === w.id);

      // Convert weight to standardized KG for reliable mathematical comparison
      const weightInKg = toKg(s.weight, s.unit);
      const setVolumeKg = weightInKg ? weightInKg * s.reps : s.reps; // bodyweight uses reps count as volume factor

      if (!session) {
        session = {
          date: w.date,
          workoutId: w.id,
          maxWeight: weightInKg, // Standardized in KG
          totalVolume: setVolumeKg,
          totalReps: s.reps,
          setsCount: 1,
          bestSet: { weight: s.weight ?? null, reps: s.reps, unit: s.unit },
        };
        comp.sessions.push(session);
      } else {
        session.totalVolume += setVolumeKg;
        session.totalReps += s.reps;
        session.setsCount += 1;

        if (weightInKg !== null) {
          if (session.maxWeight === null || weightInKg > session.maxWeight) {
            session.maxWeight = weightInKg;
            session.bestSet = { weight: s.weight ?? null, reps: s.reps, unit: s.unit };
          }
        }
      }
    });
  });

  // Compute percentage changes comparing latest session to earliest session in standardized KG
  Object.values(exerciseMap).forEach((comp) => {
    if (comp.sessions.length >= 2) {
      const first = comp.sessions[0];
      const latest = comp.sessions[comp.sessions.length - 1];

      if (first.maxWeight !== null && latest.maxWeight !== null && first.maxWeight > 0) {
        comp.weightPercentChange = parseFloat((((latest.maxWeight - first.maxWeight) / first.maxWeight) * 100).toFixed(1));
      }

      if (first.totalVolume > 0) {
        comp.volumePercentChange = parseFloat((((latest.totalVolume - first.totalVolume) / first.totalVolume) * 100).toFixed(1));
      }

      if (first.totalReps > 0) {
        comp.repsPercentChange = parseFloat((((latest.totalReps - first.totalReps) / first.totalReps) * 100).toFixed(1));
      }
    }
  });

  return Object.values(exerciseMap);
};
