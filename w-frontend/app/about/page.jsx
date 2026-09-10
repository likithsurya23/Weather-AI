'use client';

import React, { useState } from 'react';
import Sidebar from '../../src/components/layout/Sidebar';
import TopNavbar from '../../src/components/layout/TopNavbar';
import { 
  Cloud, 
  HelpCircle, 
  ShieldCheck, 
  FileText, 
  Mail, 
  ChevronRight, 
  X
} from 'lucide-react';

export default function AboutPage() {
  const [modalType, setModalType] = useState(null); // 'help', 'privacy', 'terms', 'contact'

  const links = [
    { id: 'help', title: 'Help Center', icon: HelpCircle, desc: 'Guides, FAQs, and API documentation' },
    { id: 'privacy', title: 'Privacy Policy', icon: ShieldCheck, desc: 'How we respect and secure your telemetry' },
    { id: 'terms', title: 'Terms of Service', icon: FileText, desc: 'Usage guidelines and licensing terms' },
    { id: 'contact', title: 'Contact Us', icon: Mail, desc: 'Direct support from our engineering team' }
  ];

  return (
    <div className="min-h-screen bg-transparent flex transition-colors">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar />

        <main className="flex-1 p-8 max-w-4xl w-full mx-auto flex flex-col justify-center items-center text-center space-y-8">
          {/* Brand Presentation */}
          <div className="space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-500/25">
              <Cloud className="w-10 h-10 fill-white stroke-none" />
            </div>

            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Weather<span className="text-blue-600">Wise</span>
            </h1>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              Version 1.0.0
            </span>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              Your intelligent weather companion. Get accurate weather information, AI-powered insights, and plan your day better.
            </p>
          </div>

          {/* Links Grid matching Screen 11 wireframe */}
          <div className="w-full max-w-lg space-y-3 text-left">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <div
                  key={link.id}
                  onClick={() => setModalType(link.id)}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 hover:shadow-md transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {link.title}
                      </div>
                      <div className="text-xs text-slate-400">
                        {link.desc}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              );
            })}
          </div>

          <div className="text-xs text-slate-400 pt-4">
            Built with Next.js, React, Tailwind CSS, Express, and WeatherAPI.
          </div>
        </main>
      </div>

      {/* Info Modal */}
      {modalType && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                {modalType === 'help' && 'WeatherWise Help Center'}
                {modalType === 'privacy' && 'Privacy Policy'}
                {modalType === 'terms' && 'Terms of Service'}
                {modalType === 'contact' && 'Contact Support'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
              {modalType === 'help' && (
                <>
                  <p><strong>How to search:</strong> Type any worldwide city into the search bar or use your current geolocation icon.</p>
                  <p><strong>AI Assistant:</strong> Open the Chat tab and ask questions like &quot;Will it rain tomorrow in London?&quot; or &quot;What should I wear today?&quot;.</p>
                  <p><strong>Favorites:</strong> Click the heart icon on any weather card to pin that city to your dashboard.</p>
                </>
              )}

              {modalType === 'privacy' && (
                <>
                  <p>We respect your privacy. Geolocation queries are used exclusively to retrieve localized meteorological data from WeatherAPI.</p>
                  <p>Your session details, favorite destinations, and chat interactions are stored securely.</p>
                </>
              )}

              {modalType === 'terms' && (
                <>
                  <p>WeatherWise data is supplied for general planning purposes. For extreme weather emergencies, always refer to your national weather administration.</p>
                </>
              )}

              {modalType === 'contact' && (
                <>
                  <p>Have questions or feedback? Reach out to our team at <strong>support@weatherwise.internal</strong></p>
                  <p>We typically respond within 24 hours.</p>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
