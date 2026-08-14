-- ==========================================
-- GYM ANALYTICS & WORKOUT TRACKER - SUPABASE SCHEMA
-- Execute this SQL in your Supabase SQL Editor
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    preferred_unit TEXT DEFAULT 'kg' CHECK (preferred_unit IN ('kg', 'lbs')),
    theme_preference TEXT DEFAULT 'dark' CHECK (theme_preference IN ('dark', 'light', 'system')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL means default global category
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EXERCISES TABLE
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL means default global exercise
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_bodyweight BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. WORKOUTS TABLE
CREATE TABLE IF NOT EXISTS public.workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    duration_sec INTEGER, -- Total workout time in seconds
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. WORKOUT_SETS TABLE
CREATE TABLE IF NOT EXISTS public.workout_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
    set_number INTEGER NOT NULL,
    weight NUMERIC(6, 2), -- NULL for bodyweight exercises like Push-ups or Pull-ups
    unit TEXT DEFAULT 'kg' CHECK (unit IN ('kg', 'lbs')),
    reps INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories Policies (User can view global categories OR their own custom categories)
CREATE POLICY "Users can view global or own categories" ON public.categories 
    FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Users can create own categories" ON public.categories 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON public.categories 
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON public.categories 
    FOR DELETE USING (auth.uid() = user_id);

-- Exercises Policies
CREATE POLICY "Users can view global or own exercises" ON public.exercises 
    FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Users can create own exercises" ON public.exercises 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own exercises" ON public.exercises 
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own exercises" ON public.exercises 
    FOR DELETE USING (auth.uid() = user_id);

-- Workouts Policies
CREATE POLICY "Users can view own workouts" ON public.workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workouts" ON public.workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON public.workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workouts" ON public.workouts FOR DELETE USING (auth.uid() = user_id);

-- Workout Sets Policies
CREATE POLICY "Users can view own workout sets" ON public.workout_sets 
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = workout_sets.workout_id AND w.user_id = auth.uid()));
CREATE POLICY "Users can insert own workout sets" ON public.workout_sets 
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = workout_sets.workout_id AND w.user_id = auth.uid()));
CREATE POLICY "Users can update own workout sets" ON public.workout_sets 
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = workout_sets.workout_id AND w.user_id = auth.uid()));
CREATE POLICY "Users can delete own workout sets" ON public.workout_sets 
    FOR DELETE USING (EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = workout_sets.workout_id AND w.user_id = auth.uid()));

-- ==========================================
-- AUTOMATIC PROFILE TRIGGER ON SIGNUP
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_name TEXT;
BEGIN
    user_name := COALESCE(
        new.raw_user_meta_data->>'name',
        new.raw_user_meta_data->>'full_name',
        split_part(new.email, '@', 1)
    );

    INSERT INTO public.profiles (id, email, name)
    VALUES (new.id, new.email, user_name)
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, public.profiles.name),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create Trigger safely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- SEED DEFAULT CATEGORIES & EXERCISES
-- ==========================================

-- Insert Default Categories
INSERT INTO public.categories (id, name, user_id) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Chest & Triceps', NULL),
    ('00000000-0000-0000-0000-000000000002', 'Back & Biceps', NULL),
    ('00000000-0000-0000-0000-000000000003', 'Shoulders', NULL),
    ('00000000-0000-0000-0000-000000000004', 'Legs', NULL),
    ('00000000-0000-0000-0000-000000000005', 'Core', NULL),
    ('00000000-0000-0000-0000-000000000006', 'Cardio', NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert Default Exercises
INSERT INTO public.exercises (name, category_id, is_bodyweight, user_id) VALUES
    -- Chest & Triceps
    ('Barbell Bench Press', '00000000-0000-0000-0000-000000000001', FALSE, NULL),
    ('Incline Dumbbell Press', '00000000-0000-0000-0000-000000000001', FALSE, NULL),
    ('Push Ups', '00000000-0000-0000-0000-000000000001', TRUE, NULL),
    ('Tricep Rope Pushdown', '00000000-0000-0000-0000-000000000001', FALSE, NULL),
    ('Skull Crushers', '00000000-0000-0000-0000-000000000001', FALSE, NULL),
    
    -- Back & Biceps
    ('Lat Pull Down', '00000000-0000-0000-0000-000000000002', FALSE, NULL),
    ('Pull Ups', '00000000-0000-0000-0000-000000000002', TRUE, NULL),
    ('Seated Cable Row', '00000000-0000-0000-0000-000000000002', FALSE, NULL),
    ('Barbell Bicep Curl', '00000000-0000-0000-0000-000000000002', FALSE, NULL),
    ('Hammer Curls', '00000000-0000-0000-0000-000000000002', FALSE, NULL),
    
    -- Shoulders
    ('Overhead Shoulder Press', '00000000-0000-0000-0000-000000000003', FALSE, NULL),
    ('Dumbbell Lateral Raise', '00000000-0000-0000-0000-000000000003', FALSE, NULL),
    ('Face Pulls', '00000000-0000-0000-0000-000000000003', FALSE, NULL),
    
    -- Legs
    ('Barbell Squat', '00000000-0000-0000-0000-000000000004', FALSE, NULL),
    ('Leg Press', '00000000-0000-0000-0000-000000000004', FALSE, NULL),
    ('Romanian Deadlift', '00000000-0000-0000-0000-000000000004', FALSE, NULL),
    ('Leg Extensions', '00000000-0000-0000-0000-000000000004', FALSE, NULL),
    
    -- Core
    ('Crunches', '00000000-0000-0000-0000-000000000005', TRUE, NULL),
    ('Plank', '00000000-0000-0000-0000-000000000005', TRUE, NULL),
    ('Hanging Leg Raise', '00000000-0000-0000-0000-000000000005', TRUE, NULL);
