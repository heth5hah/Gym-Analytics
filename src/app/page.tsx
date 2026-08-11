'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { CalendarView } from '@/components/CalendarView';
import { AnalyticsView } from '@/components/AnalyticsView';
import { ActiveWorkoutModal } from '@/components/ActiveWorkoutModal';
import { AuthModal } from '@/components/AuthModal';
import {
  Category,
  Exercise,
  Workout,
  UnitType,
} from '@/lib/types';
import {
  getStoredCategories,
  getStoredExercises,
  getStoredWorkouts,
  saveWorkout,
  deleteWorkout,
} from '@/lib/storage';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'history'>('dashboard');
  const [preferredUnit, setPreferredUnit] = useState<UnitType>('kg');

  // Loaded Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  // Modals
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [selectedWorkoutDate, setSelectedWorkoutDate] = useState<string | undefined>();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Load Data on Mount
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setCategories(getStoredCategories());
    setExercises(getStoredExercises());
    setWorkouts(getStoredWorkouts());
  };

  const handleStartWorkout = (dateStr?: string) => {
    setSelectedWorkoutDate(dateStr || new Date().toISOString().split('T')[0]);
    setIsWorkoutModalOpen(true);
  };

  const handleSaveWorkout = (newWorkout: Workout) => {
    const updated = saveWorkout(newWorkout);
    setWorkouts(updated);
  };

  const handleDeleteWorkout = (workoutId: string) => {
    if (confirm('Are you sure you want to delete this workout log?')) {
      const updated = deleteWorkout(workoutId);
      setWorkouts(updated);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-8">
      
      {/* Top Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onStartWorkout={() => handleStartWorkout()}
        preferredUnit={preferredUnit}
        setPreferredUnit={setPreferredUnit}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeTab === 'dashboard' && (
          <CalendarView
            workouts={workouts}
            onSelectDate={(dateStr) => handleStartWorkout(dateStr)}
            onStartWorkoutForDate={(dateStr) => handleStartWorkout(dateStr)}
            onDeleteWorkout={handleDeleteWorkout}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            workouts={workouts}
            categories={categories}
            preferredUnit={preferredUnit}
          />
        )}

      </main>

      {/* Mobile Bottom Thumb Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onStartWorkout={() => handleStartWorkout()}
      />

      {/* Active Workout Session Builder Modal */}
      {isWorkoutModalOpen && (
        <ActiveWorkoutModal
          initialDate={selectedWorkoutDate}
          categories={categories}
          exercises={exercises}
          preferredUnit={preferredUnit}
          onClose={() => setIsWorkoutModalOpen(false)}
          onSaveWorkout={handleSaveWorkout}
          onRefreshCategories={refreshData}
          onRefreshExercises={refreshData}
        />
      )}

      {/* Supabase / Auth Settings Modal */}
      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}

    </div>
  );
}
