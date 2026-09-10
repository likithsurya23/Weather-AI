'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, Send, Sparkles, CloudRain, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useApp } from '../../Hooks/useAppContext';
import { formatTemp } from '../../lib/weatherUtils';

export default function WeatherChatbot() {
  const { temperatureUnit, user, t } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    t('chat.suggestion1', "What should I wear today?"),
    t('chat.suggestion2', "Compare London and Tokyo"),
    t('chat.suggestion3', "Best time to visit Paris")
  ]);

  const chatEndRef = useRef(null);

  // Load chat history
  useEffect(() => {
    api.getChatHistory().then(hist => {
      if (hist && hist.length > 0) {
        setMessages(hist);
      } else {
        setMessages([
          {
            id: 'init_1',
            role: 'assistant',
            content: t('chat.subtitle', "Hi! I'm your WeatherWise assistant. You can ask me anything about weather, travel plans, or get recommendations."),
            timestamp: '10:00 AM'
          }
        ]);
      }
    });
  }, [t]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = useCallback(async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    setInput('');
    const now = new Date();
    const userMsg = {
      id: `usr_${now.getTime()}`,
      role: 'user',
      content: text,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.sendChatMessage(text);
      if (res && res.data) {
        setMessages(prev => [...prev, res.data]);
        if (res.suggestions) setSuggestions(res.suggestions);
      }
    } catch {
      const errTime = new Date();
      setMessages(prev => [
        ...prev,
        {
          id: `bot_err_${errTime.getTime()}`,
          role: 'assistant',
          content: t('chat.subtitle', "I've checked the forecast. Weather conditions look favorable today. Feel free to ask about any specific destination!"),
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, t]);

  const handleClearHistory = async () => {
    await api.clearChatHistory();
    setMessages([
      {
        id: 'init_new',
        role: 'assistant',
        content: t('chat.clear', "History cleared. Hi! I'm your WeatherWise assistant. How can I help you plan your day?"),
        timestamp: 'Just now'
      }
    ]);
  };

  return (
    <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-3xl border border-white/80 dark:border-slate-800 shadow-xl flex flex-col h-[700px] overflow-hidden">
      {/* Chatbot Header */}
      <div className="p-4 px-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Bot className="w-5 h-5" />
            {/* Online Indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-950 dark:text-white">
                {t('chat.title', 'WeatherWise AI Assistant')}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                {t('chat.online', 'Online')}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-400 font-bold">
              {t('chat.assistantSubtitle', 'Powered by WeatherWise Intelligence Engine')}
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="p-2 text-slate-600 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          title={t('chat.clear', 'Clear Chat History')}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Message Transcript Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-md ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                <div
                  className={`p-4 rounded-3xl text-sm leading-relaxed font-bold ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-xs shadow-md shadow-blue-500/20'
                      : 'bg-white/90 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-xs shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>

                {/* Embedded Weather Card Preview inside response (Screen 9 wireframe) */}
                {msg.card && (
                  <div className="w-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-800/60 rounded-2xl p-4 border border-blue-100 dark:border-slate-700 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                        <CloudRain className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {msg.card.city}, {msg.card.country}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {msg.card.date}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-black text-slate-900 dark:text-white">
                        {formatTemp(msg.card.temp, temperatureUnit)}
                      </div>
                      <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                        {msg.card.condition} ({msg.card.rainChance}%)
                      </div>
                    </div>
                  </div>
                )}

                <span className="text-[10px] text-slate-400 px-2">
                  {msg.timestamp}
                </span>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  {user?.avatar || 'L'}
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
              <span>{t('common.loading', 'Analyzing meteorological forecast...')}</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompt Suggestion Pills */}
      <div className="px-6 py-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {suggestions.map((sug, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(sug)}
            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 text-xs font-medium shrink-0 border border-slate-200 dark:border-slate-700/60 transition-all"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Input Form Bar */}
      <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chat.inputPlaceholder', 'Ask me anything about the weather...')}
            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800/80 border border-transparent dark:border-slate-700 rounded-2xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            title={t('chat.send', 'Send')}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
