export type UnitType = 'kg' | 'lbs';
export type ThemeMode = 'dark' | 'light' | 'system';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  preferredUnit: UnitType;
  themePreference: ThemeMode;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  userId?: string | null; // null for global default categories
  createdAt?: string;
}

export interface Exercise {
  id: string;
  name: string;
  categoryId?: string;
  isBodyweight: boolean;
  userId?: string | null;
  createdAt?: string;
}

export interface WorkoutSet {
  id: string;
  workoutId: string;
  exerciseId: string;
  exerciseName?: string;
  setNumber: number;
  weight?: number | null; // Optional for bodyweight exercises
  unit: UnitType;
  reps: number;
  isCompleted: boolean;
}

export interface Workout {
  id: string;
  userId: string;
  categoryId: string;
  categoryName?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // ISO string
  endTime?: string | null; // ISO string
  durationSec: number; // Total workout duration in seconds
  notes?: string;
  sets: WorkoutSet[];
  createdAt: string;
}

export interface MonthlyStats {
  monthKey: string; // YYYY-MM
  totalWorkouts: number;
  totalGymDays: number;
  totalRestDays: number;
  totalHours: number;
  totalMinutes: number;
  categoryBreakdown: Record<string, number>;
}

export interface ExerciseComparison {
  exerciseId: string;
  exerciseName: string;
  isBodyweight: boolean;
  sessions: {
    date: string;
    workoutId: string;
    maxWeight: number | null;
    totalVolume: number; // weight * reps sum
    totalReps: number;
    setsCount: number;
    bestSet: { weight: number | null; reps: number; unit: UnitType };
  }[];
  weightPercentChange?: number; // e.g. +12.5%
  repsPercentChange?: number;
  volumePercentChange?: number;
}
