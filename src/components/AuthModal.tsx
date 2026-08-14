'use client';

import React, { useState } from 'react';
import { Database, ShieldCheck, CheckCircle2, AlertCircle, Lock, Mail, Key, Eye, EyeOff } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
  isFullPage?: boolean;
}

const LOCAL_USERS_KEY = 'gym_app_registered_users';

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess, isFullPage = false }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMsg('Please enter both email address and password.');
      return;
    }

    setLoading(true);

    try {
      if (!isSupabaseConfigured) {
        // Local Account Authentication Logic
        const existingUsersRaw = localStorage.getItem(LOCAL_USERS_KEY);
        const registeredUsers: Array<{ id: string; email: string; passwordHash: string; name: string }> = existingUsersRaw ? JSON.parse(existingUsersRaw) : [];

        if (isSignUp) {
          // Check if already registered
          const alreadyExists = registeredUsers.some((u) => u.email === cleanEmail);
          if (alreadyExists) {
            throw new Error('An account with this email already exists. Please switch to Sign In.');
          }

          const newUser = {
            id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            email: cleanEmail,
            passwordHash: btoa(password),
            name: name || cleanEmail.split('@')[0],
          };

          registeredUsers.push(newUser);
          localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(registeredUsers));

          const sessionUser = {
            id: newUser.id,
            email: newUser.email,
            isGuest: false,
            user_metadata: { name: newUser.name, full_name: newUser.name },
          };

          if (rememberMe) {
            localStorage.setItem('gym_app_remember_me', 'true');
            localStorage.setItem('gym_app_saved_user', JSON.stringify(sessionUser));
          } else {
            sessionStorage.setItem('gym_app_saved_user', JSON.stringify(sessionUser));
          }

          setSuccessMsg('Account registered successfully! Logging you in...');
          setTimeout(() => {
            onSuccess(sessionUser);
            onClose();
          }, 600);
        } else {
          // Sign In Check - Require prior registration
          const foundUser = registeredUsers.find((u) => u.email === cleanEmail && u.passwordHash === btoa(password));
          if (!foundUser) {
            throw new Error('Account not found or password incorrect. Please register first by clicking "New here? Create a free account".');
          }

          const sessionUser = {
            id: foundUser.id,
            email: foundUser.email,
            isGuest: false,
            user_metadata: { name: foundUser.name, full_name: foundUser.name },
          };

          if (rememberMe) {
            localStorage.setItem('gym_app_remember_me', 'true');
            localStorage.setItem('gym_app_saved_user', JSON.stringify(sessionUser));
          } else {
            sessionStorage.setItem('gym_app_saved_user', JSON.stringify(sessionUser));
          }

          setSuccessMsg('Welcome back! Loading your profile...');
          setTimeout(() => {
            onSuccess(sessionUser);
            onClose();
          }, 500);
        }
        return;
      }

      // Supabase Authentication Mode
      const displayName = name || cleanEmail.split('@')[0];

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name: displayName,
              full_name: displayName,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          // Explicitly upsert name into public.profiles table to guarantee name is never NULL in Supabase
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              email: cleanEmail,
              name: displayName,
              updated_at: new Date().toISOString(),
            });
          } catch (profileErr) {
            console.log('Profile upsert notice:', profileErr);
          }

          setSuccessMsg('Account created successfully! Signing you in...');
          if (rememberMe) {
            localStorage.setItem('gym_app_remember_me', 'true');
          }
          setTimeout(() => {
            onSuccess(data.user);
            onClose();
          }, 800);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Ensure profiles table has name updated
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              email: cleanEmail,
              name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || displayName,
              updated_at: new Date().toISOString(),
            });
          } catch (profileErr) {
            console.log('Profile upsert notice:', profileErr);
          }

          if (rememberMe) {
            localStorage.setItem('gym_app_remember_me', 'true');
          } else {
            localStorage.removeItem('gym_app_remember_me');
          }
          setSuccessMsg('Welcome back! Loading your workouts...');
          setTimeout(() => {
            onSuccess(data.user);
            onClose();
          }, 500);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const guestUser = {
      id: `guest-${Date.now()}`,
      email: 'guest@session.temp',
      isGuest: true,
      user_metadata: { name: 'Guest User (Temporary)', full_name: 'Guest User (Temporary)' },
    };
    sessionStorage.setItem('gym_app_guest_session', JSON.stringify(guestUser));
    onSuccess(guestUser);
    onClose();
  };

  const containerClasses = isFullPage
    ? 'min-h-screen w-full flex items-center justify-center p-4 bg-zinc-950 bg-gradient-to-b from-zinc-900 to-zinc-950 text-zinc-100 overflow-x-hidden'
    : 'fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-x-hidden';

  return (
    <div className={containerClasses}>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 transition-colors mx-auto">
        
        {/* Top Header & Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
            {isSignUp ? 'Create Gym Tracker Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {isSignUp
              ? 'Register first to save and isolate your workout history'
              : 'Sign in with your registered email & password'}
          </p>
        </div>

        {/* Supabase Status Banner */}
        {!isSupabaseConfigured && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-500" />
            <span>Local Mode: Registration required. Guest data resets on refresh.</span>
          </div>
        )}

        {/* Feedback Banners */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="space-y-4 text-xs">
          
          {isSignUp && (
            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5">
                Full Name / Alias
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Key className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-zinc-600 dark:text-zinc-400 font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-zinc-300 text-emerald-500 focus:ring-emerald-500"
              />
              <span>Remember me & keep me signed in</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-black shadow-lg shadow-emerald-500/25 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">Processing...</span>
            ) : isSignUp ? (
              'Create My Account'
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        {/* Bottom Switcher */}
        <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
            }}
            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'New here? Create a free account'}
          </button>

          <div>
            <button
              type="button"
              onClick={handleGuestLogin}
              className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium hover:underline text-[11px]"
            >
              Continue as Guest (Data reset on refresh)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
