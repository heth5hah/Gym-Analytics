'use client';

import React, { useState } from 'react';
import { Database, Key, CheckCircle2, ShieldCheck, X, FileCode } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
                Supabase & User Account
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isSupabaseConfigured ? 'Connected to Supabase Database' : 'Local Demo Mode Active'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Supabase Status Banner */}
        {isSupabaseConfigured ? (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Supabase environment variables detected and connected!</span>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Offline / Local Storage Mode</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
              Your workouts and categories are currently saved locally. To sync with Supabase:
            </p>
            <ol className="list-decimal list-inside text-[11px] space-y-1 font-mono bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
              <li>Open <span className="underline">supabase_schema.sql</span> in project root</li>
              <li>Execute SQL script in Supabase SQL Editor</li>
              <li>Add credentials to <span className="underline">.env.local</span></li>
            </ol>
          </div>
        )}

        {/* User Login Form */}
        <form onSubmit={(e) => { e.preventDefault(); onClose(); }} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1">Email Address</label>
            <input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-extrabold shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all"
          >
            {isSignUp ? 'Create Supabase Account' : 'Sign In to Tracker'}
          </button>
        </form>

        <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="hover:underline text-emerald-600 dark:text-emerald-400 font-medium"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Register'}
          </button>

          <button onClick={onClose} className="hover:underline">
            Continue as Guest
          </button>
        </div>

      </div>
    </div>
  );
};
