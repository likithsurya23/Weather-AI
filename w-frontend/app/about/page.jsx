'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from '../../src/components/layout/Sidebar';
import TopNavbar from '../../src/components/layout/TopNavbar';
import { 
  Cloud, 
  HelpCircle, 
  ShieldCheck, 
  FileText, 
  Mail, 
  ChevronRight, 
  X,
  Info,
  Zap,
  Bot,
  Shield,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../src/Hooks/useAppContext';

export default function AboutPage() {
  const { t } = useApp();
  const [modalType, setModalType] = useState(null); // 'help', 'privacy', 'terms', 'contact'
  const modalRef = useRef(null);
  const triggerRef = useRef(null);

  const handleOpenModal = (type, event) => {
    triggerRef.current = event?.currentTarget || document.activeElement;
    setModalType(type);
  };

  const handleCloseModal = useCallback(() => {
    setModalType(null);
  }, []);

  // Keyboard accessibility: initial focus, focus trap, Escape to close, and return focus on close
  useEffect(() => {
    if (!modalType) return;

    const triggerElement = triggerRef.current;

    // Initial focus on first interactive element or dialog container
    const modalElement = modalRef.current;
    if (modalElement) {
      const focusable = modalElement.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        modalElement.focus();
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCloseModal();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (triggerElement && typeof triggerElement.focus === 'function') {
        triggerElement.focus();
      }
    };
  }, [modalType, handleCloseModal]);

  const links = [
    { 
      id: 'help', 
      title: t ? t('about.helpCenter', 'Help Center') : 'Help Center', 
      icon: HelpCircle, 
      badge: 'FAQs & Guides',
      desc: 'User guides, meteorological metrics, and usage FAQs' 
    },
    { 
      id: 'privacy', 
      title: t ? t('about.privacyPolicy', 'Privacy Policy') : 'Privacy Policy', 
      icon: ShieldCheck, 
      badge: 'Encrypted',
      desc: 'How your telemetry, search queries, and credentials are protected' 
    },
    { 
      id: 'terms', 
      title: t ? t('about.termsOfService', 'Terms of Service') : 'Terms of Service', 
      icon: FileText, 
      badge: 'v1.0.0',
      desc: 'Licensing, allowable usage, and data attribution policies' 
    },
    { 
      id: 'contact', 
      title: t ? t('about.contactSupport', 'Contact Support') : 'Contact Support', 
      icon: Mail, 
      badge: '24/7 Response',
      desc: 'Direct channels for feedback, bug reports, and assistance' 
    }
  ];

  const highlights = [
    { icon: Zap, label: 'Real-time Radar & Forecasts', desc: 'Hour-by-hour precision data' },
    { icon: Bot, label: 'Gemini AI Intelligence', desc: 'Natural weather consultations' },
    { icon: Shield, label: 'Severe Alert Broadcasts', desc: 'Critical disaster warnings' },
    { icon: Layers, label: 'Localized Multi-language', desc: 'Native multi-lingual experience' }
  ];

  return (
    <div className="min-h-screen bg-transparent flex text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* App Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar />

        <main className="flex-1 p-2.5 sm:p-4 lg:p-5 max-w-4xl w-full mx-auto space-y-3 sm:space-y-4 pb-24 lg:pb-8">
          
          {/* Top Header Card (Compact & Consistent) */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-2.5 sm:p-3.5 flex items-center justify-between gap-2.5 transition-colors">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 shrink-0">
                <Info className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
              </div>
              <div>
                <h1 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                  {t ? t('nav.about', 'About WeatherWise') : 'About WeatherWise'}
                </h1>
              </div>
            </div>

            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 shrink-0">
              v1.0.0
            </span>
          </div>

          {/* Hero / Brand Card */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs text-center relative overflow-hidden transition-colors">
            {/* Subtle decorative glow */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center max-w-xl mx-auto space-y-3 sm:space-y-4">
              {/* App Icon */}
              <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-4 ring-blue-100 dark:ring-blue-950/50">
                <Cloud className="w-7 h-7 sm:w-8 sm:h-8 fill-white stroke-none" />
              </div>

              {/* Title & Tagline */}
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Weather<span className="text-blue-600 dark:text-blue-400">Wise</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  Your intelligent atmospheric companion delivering hyper-local forecasts, conversational AI climate insights, and severe weather preparedness.
                </p>
              </div>

              {/* Feature Chips / Highlights Grid (Mobile Friendly) */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-left">
                {highlights.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 flex items-center gap-2.5 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {item.label}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Links Section (Help, Privacy, Terms, Contact) */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 px-1 uppercase tracking-wider">
              Legal & Support Guides
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={(e) => handleOpenModal(link.id, e)}
                    aria-haspopup="dialog"
                    aria-expanded={modalType === link.id}
                    className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/50 dark:hover:border-blue-500/40 hover:shadow-xs active:scale-[0.99] transition-all flex items-center justify-between text-left group cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                        <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                      </div>
                      <div className="min-w-0 pr-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {link.title}
                          </span>
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                            {link.badge}
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {link.desc}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* ========================================================= */}
      {/* MOBILE-RESPONSIVE MODAL / BOTTOM-SHEET                     */}
      {/* ========================================================= */}
      {modalType && (
        <div 
          onClick={handleCloseModal}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
        >
          <div 
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-modal-title"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl max-w-lg w-full p-4 sm:p-5 border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 outline-hidden"
          >
            {/* Mobile Sheet Handle Indicator */}
            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-2 sm:hidden shrink-0" />

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  {modalType === 'help' && <HelpCircle className="w-4 h-4" />}
                  {modalType === 'privacy' && <ShieldCheck className="w-4 h-4" />}
                  {modalType === 'terms' && <FileText className="w-4 h-4" />}
                  {modalType === 'contact' && <Mail className="w-4 h-4" />}
                </div>
                <h3 id="about-modal-title" className="text-sm sm:text-base font-bold text-slate-900 dark:text-white capitalize">
                  {modalType === 'help' && 'WeatherWise Help Center'}
                  {modalType === 'privacy' && 'Privacy & Data Protection'}
                  {modalType === 'terms' && 'Terms of Service & Attribution'}
                  {modalType === 'contact' && 'Contact Support & Feedback'}
                </h3>
              </div>
              <button 
                type="button"
                onClick={handleCloseModal}
                aria-label="Close dialog"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed pr-1">
              {modalType === 'help' && (
                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      Searching for Weather
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Use the top search bar to look up any worldwide city by name or ZIP code. Enable auto-detect location in Settings for real-time local telemetry.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      AI Assistant Consultations
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Open the AI Assistant tab to ask queries like &quot;Will it rain tomorrow in Paris?&quot; or &quot;Recommend an outfit for a chilly 50°F windy morning.&quot;
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      Managing Favorites & Alerts
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Tap the bookmark icon on any city card to pin it to your Saved Locations list for rapid comparison and morning forecasts.
                    </p>
                  </div>
                </div>
              )}

              {modalType === 'privacy' && (
                <div className="space-y-2.5">
                  <p>
                    We respect your privacy. All telemetry queries are routed securely to WeatherAPI and are never sold or distributed to third-party ad networks.
                  </p>
                  <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-[11px] space-y-1">
                    <p className="font-semibold text-blue-900 dark:text-blue-300">Protected Information:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-blue-800 dark:text-blue-400">
                      <li>Geolocation queries are converted to coordinates on-device</li>
                      <li>Encrypted password tokens stored in secure MongoDB clusters</li>
                      <li>AI Chat consultation histories are private to your authenticated account</li>
                    </ul>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    You can permanently clear all account data and telemetry at any time in Settings.
                  </p>
                </div>
              )}

              {modalType === 'terms' && (
                <div className="space-y-2.5">
                  <p>
                    WeatherWise data is provided for general planning, travel, and personal convenience. In severe meteorological emergencies or natural disaster alerts, always follow advisories from official government and civil defense authorities.
                  </p>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Data Attribution:</p>
                    <p className="text-slate-500 dark:text-slate-400">
                      Meteorological telemetry is powered by WeatherAPI. Real-time NLP interpretations are generated via Google Gemini.
                    </p>
                  </div>
                </div>
              )}

              {modalType === 'contact' && (
                <div className="space-y-3">
                  <p>
                    Have questions, feature suggestions, or encountered a bug? Our engineering and meteorology teams are here to help.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-500">Support Inbox:</span>
                      <a 
                        href="mailto:support@weatherwise.ai" 
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        support@weatherwise.ai
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-500">Response SLA:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">Within 24 hours</span>
                    </div>
                  </div>

                  <a
                    href="mailto:support@weatherwise.ai?subject=WeatherWise%20Support%20Request"
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Support Email</span>
                  </a>
                </div>
              )}
            </div>

            {/* Modal Bottom Close Button */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer text-center"
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
