'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '../../src/components/layout/Sidebar';
import TopNavbar from '../../src/components/layout/TopNavbar';
import { 
  Heart, 
  MessageSquare, 
  Bell, 
  Sliders, 
  KeyRound, 
  Trash2, 
  LogOut, 
  ChevronRight,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { useApp } from '../../src/Hooks/useAppContext';
import ProtectedRoute from '../../src/components/auth/ProtectedRoute';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, logout } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || 'Likith D');
  const [emailInput, setEmailInput] = useState(user?.email || 'likith@example.com');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');

  const handleSaveProfile = () => {
    setUser(prev => ({
      ...prev,
      name: nameInput,
      email: emailInput,
      avatar: nameInput.charAt(0).toUpperCase()
    }));
    setIsEditing(false);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordMsg('Password changed successfully!');
    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordMsg('');
    }, 1500);
  };

  const menuItems = [
    { label: 'Favorites', icon: Heart, href: '/favorites', count: 'Saved cities' },
    { label: 'Chat History', icon: MessageSquare, href: '/chat', count: 'Weather AI transcripts' },
    { label: 'Weather Alerts', icon: Bell, href: '/alerts', count: 'Severe condition warnings' },
    { label: 'Preferences', icon: Sliders, href: '/settings', count: 'Notifications, language, location' }
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-transparent flex transition-colors">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar />

        <main className="flex-1 p-2.5 sm:p-6 lg:p-8 max-w-3xl w-full mx-auto space-y-3 sm:space-y-6 pb-20 lg:pb-8">
          <h1 className="text-base sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            My Profile
          </h1>

          {/* User Bio Card matching Screen 10 */}
          <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-3xl p-3 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 sm:gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-5 text-center sm:text-left">
              <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-xl sm:rounded-3xl bg-linear-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white font-extrabold text-lg sm:text-3xl flex items-center justify-center shadow-md sm:shadow-lg shadow-blue-500/20 shrink-0">
                {user?.avatar || 'L'}
              </div>

              {isEditing ? (
                <div className="space-y-2 sm:space-y-3">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-bold"
                  />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="block px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] sm:text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="px-2.5 py-1 rounded-lg sm:rounded-xl bg-blue-600 text-white text-[11px] sm:text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-2.5 py-1 rounded-lg sm:rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-sm sm:text-xl font-bold text-slate-900 dark:text-white">
                    {user?.name || 'Likith D'}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {user?.email || 'likith@example.com'}
                  </p>
                </div>
              )}
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] sm:text-xs font-bold transition-all cursor-pointer"
              >
                <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {/* Quick Access Menu List */}
          <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className="p-2.5 sm:p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-950 dark:group-hover:text-blue-400 transition-colors shrink-0">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {item.label}
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-400">
                        {item.count}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </Link>
              );
            })}
          </div>

          {/* Account Section */}
          <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-3xl p-3 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 sm:space-y-4">
            <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              Account Security
            </h3>

            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center justify-between p-2.5 sm:p-3.5 rounded-lg sm:rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 text-slate-700 dark:text-slate-300 font-medium text-xs sm:text-sm">
                <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                <span>Change Password</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            </button>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                  router.push('/login');
                }
              }}
              className="w-full flex items-center justify-between p-2.5 sm:p-3.5 rounded-lg sm:rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/30 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 text-red-600 dark:text-red-400 font-medium text-xs sm:text-sm">
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Delete Account</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
            </button>
          </div>

          {/* Logout button */}
          <div className="pt-1 sm:pt-2">
            <button
              onClick={handleLogout}
              className="w-full py-2.5 sm:py-3.5 bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/40 text-slate-700 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Logout</span>
            </button>
          </div>
        </main>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            {passwordMsg ? (
              <div className="p-3 sm:p-4 bg-emerald-50 text-emerald-700 rounded-xl sm:rounded-2xl text-xs font-bold text-center">
                {passwordMsg}
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                  <input type="password" required className="w-full px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm" />
                </div>
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                  <input type="password" required className="w-full px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm" />
                </div>
                <button type="submit" className="w-full py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl font-bold text-xs shadow-md cursor-pointer">
                  Update Password
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
}
