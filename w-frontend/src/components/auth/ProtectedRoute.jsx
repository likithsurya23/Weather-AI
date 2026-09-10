'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '../../Hooks/useAppContext';
import { Cloud } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, authLoading } = useApp();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [authLoading, isAuthenticated, router, pathname]);

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-blue-600/20 animate-ping absolute" />
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 relative">
            <Cloud className="w-7 h-7 fill-white stroke-none animate-pulse" />
          </div>
        </div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
          Verifying secure session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
