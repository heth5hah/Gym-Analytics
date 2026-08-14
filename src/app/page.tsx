'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { CalendarView } from '@/components/CalendarView';
import { AnalyticsView } from '@/components/AnalyticsView';
import { ActiveWorkoutModal } from '@/components/ActiveWorkoutModal';
import { AuthModal } from '@/components/AuthModal';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
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

  // User State
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isAuthInitializing, setIsAuthInitializing] = useState(true);

  // Loaded Data (Scoped per User)
  const [categories, setCategories] = useState<Category[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  // Modals
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [selectedWorkoutDate, setSelectedWorkoutDate] = useState<string | undefined>();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Check Active Session on Mount
  useEffect(() => {
    const initSession = async () => {
      try {
        if (isSupabaseConfigured) {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            let sessionUser = data.session.user;

            // Fetch profile name if missing in user_metadata
            if (!sessionUser.user_metadata?.name && !sessionUser.user_metadata?.full_name) {
              try {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('name')
                  .eq('id', sessionUser.id)
                  .maybeSingle();

                if (profile?.name) {
                  sessionUser = {
                    ...sessionUser,
                    user_metadata: { ...sessionUser.user_metadata, name: profile.name, full_name: profile.name },
                  };
                }
              } catch (pErr) {
                console.log('Profile fetch notice:', pErr);
              }
            }

            setCurrentUser(sessionUser);
            refreshUserData(sessionUser.id);
            setIsAuthInitializing(false);
            return;
          }
        }

        // Check Persistent Local Registered User ("Remember Me")
        const persistentUser = localStorage.getItem('gym_app_saved_user');
        if (persistentUser) {
          const parsed = JSON.parse(persistentUser);
          setCurrentUser(parsed);
          refreshUserData(parsed.id);
          setIsAuthInitializing(false);
          return;
        }

        // Check Guest Temporary Session
        const guestSession = sessionStorage.getItem('gym_app_guest_session');
        if (guestSession) {
          const parsedGuest = JSON.parse(guestSession);
          setCurrentUser(parsedGuest);
          refreshUserData(parsedGuest.id);
        }
      } catch (err) {
        console.error('Session init error:', err);
      } finally {
        setIsAuthInitializing(false);
      }
    };

    initSession();

    // Listen to Supabase Auth State Changes
    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          let sessionUser = session.user;
          if (!sessionUser.user_metadata?.name && !sessionUser.user_metadata?.full_name) {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', sessionUser.id)
                .maybeSingle();

              if (profile?.name) {
                sessionUser = {
                  ...sessionUser,
                  user_metadata: { ...sessionUser.user_metadata, name: profile.name, full_name: profile.name },
                };
              }
            } catch (pErr) {
              console.log('Profile fetch notice:', pErr);
            }
          }
          setCurrentUser(sessionUser);
          refreshUserData(sessionUser.id);
        } else {
          setCurrentUser(null);
        }
      });
      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const refreshUserData = (userId?: string) => {
    const uId = userId || currentUser?.id;
    setCategories(getStoredCategories(uId));
    setExercises(getStoredExercises(uId));
    setWorkouts(getStoredWorkouts(uId));
  };

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    refreshUserData(user.id);
    setIsAuthModalOpen(false);
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem('gym_app_saved_user');
      localStorage.removeItem('gym_app_remember_me');
      sessionStorage.removeItem('gym_app_guest_session');
      sessionStorage.removeItem('gym_app_saved_user');
      setCurrentUser(null);
      setWorkouts([]);
    }
  };

  const handleStartWorkout = (dateStr?: string) => {
    setSelectedWorkoutDate(dateStr || new Date().toISOString().split('T')[0]);
    setIsWorkoutModalOpen(true);
  };

  const handleSaveWorkout = (newWorkout: Workout) => {
    const workoutWithUser = {
      ...newWorkout,
      userId: currentUser?.id || 'user-current',
    };
    const updated = saveWorkout(workoutWithUser, currentUser?.id);
    setWorkouts(updated);
  };

  const handleDeleteWorkout = (workoutId: string) => {
    if (confirm('Are you sure you want to delete this workout log?')) {
      const updated = deleteWorkout(workoutId, currentUser?.id);
      setWorkouts(updated);
    }
  };

  // Loading Screen
  if (isAuthInitializing) {
    return (
      <div className="min-h-screen w-full bg-zinc-950 flex items-center justify-center text-white p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-zinc-400">Loading GymAnalytics PRO...</p>
        </div>
      </div>
    );
  }

  // MANDATORY AUTH WALL: If not logged in, display full-screen Login Screen
  if (!currentUser) {
    return (
      <AuthModal
        isFullPage={true}
        onClose={() => {}}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col pb-20 md:pb-8 overflow-x-hidden">
      
      {/* Top Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onStartWorkout={() => handleStartWorkout()}
        preferredUnit={preferredUnit}
        setPreferredUnit={setPreferredUnit}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-x-hidden">
        
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
          onRefreshCategories={() => refreshUserData(currentUser?.id)}
          onRefreshExercises={() => refreshUserData(currentUser?.id)}
        />
      )}

      {/* Account Settings / User Modal */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

    </div>
  );
}
