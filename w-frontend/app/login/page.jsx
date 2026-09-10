'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Cloud, ArrowLeft, Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useApp } from '../../src/Hooks/useAppContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams ? searchParams.get('redirect') : null;

  const { login, isAuthenticated, authLoading } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to dashboard or redirect parameter
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(redirectPath || '/dashboard');
    }
  }, [authLoading, isAuthenticated, router, redirectPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push(redirectPath || '/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError('Google OAuth will be available soon. Please use email login.');
  };

  return (
    <div className="w-full max-w-md bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl sm:shadow-2xl transition-all relative">
      {/* Back Button inside container */}
      <Link
        href="/"
        className="absolute top-3 sm:top-6 left-3 sm:left-6 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100/60 hover:bg-slate-200/60 dark:bg-slate-800/60 dark:hover:bg-slate-700/60 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs transition-all flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold cursor-pointer"
      >
        <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        <span>Back</span>
      </Link>

      {/* Logo and Welcome */}
      <div className="text-center mb-4 sm:mb-6 pt-1 sm:pt-2">
        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-600 flex items-center justify-center text-white mx-auto shadow-md shadow-blue-500/25 mb-2 sm:mb-3">
          <Cloud className="w-5 h-5 sm:w-7 sm:h-7 fill-white stroke-none" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Welcome Back
        </h1>
        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
          Login to your WeatherWise account
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-400">
          <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-4">
        {/* Email field */}
        <div>
          <label className="block text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Email
          </label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Password field */}
        <div>
          <label className="block text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          </div>
        </div>

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between text-[10px] sm:text-xs pt-0.5 sm:pt-1">
          <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer text-slate-600 dark:text-slate-300 select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Remember me</span>
          </label>
          <span className="text-slate-400">
            Secure JWT session
          </span>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 sm:py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-blue-500/10 transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'Login'}
        </button>
      </form>

      {/* OR Divider */}
      <div className="my-3 sm:my-6 flex items-center justify-between text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">
        <div className="h-px bg-slate-200 dark:bg-slate-800 w-full" />
        <span className="px-2.5 sm:px-3">OR</span>
        <div className="h-px bg-slate-200 dark:bg-slate-800 w-full" />
      </div>

      {/* Google OAuth Button */}
      <button
        onClick={handleGoogleLogin}
        type="button"
        className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-xs flex items-center justify-center gap-2.5 sm:gap-3 transition-all cursor-pointer"
      >
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Sign up link */}
      <p className="text-center text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-3 sm:mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center items-center px-3 sm:px-4 py-4 sm:py-12">
      <Suspense fallback={
        <div className="w-full max-w-md bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl flex items-center justify-center min-h-[300px]">
          <div className="w-7 h-7 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
