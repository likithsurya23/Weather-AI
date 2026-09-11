'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Sun,
  Wind,
  ArrowRight,
  Sparkles,
  Paperclip,
  Plus,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Menu,
  X,
  ShieldCheck,
  AlertTriangle,
  Plane,
  MapPin,
  Umbrella
} from 'lucide-react';
import { api } from '../../lib/api';
import { useApp } from '../../Hooks/useAppContext';
import { formatDegree, formatTemp } from '../../lib/weatherUtils';

function getLocalizedChatDefaults(language = 'English') {
  const l = (language || '').toLowerCase();
  if (l.includes('hindi') || l.includes('हिन्दी')) {
    return {
      greeting: "नमस्ते {name}! 👋 मैं आपका वेदरवाइज़ एआई सहायक हूँ। मुझसे लाइव मौसम, पूर्वानुमान, आपदा अलर्ट या सुरक्षा सुझावों के बारे में कुछ भी पूछें।",
      clearText: "बातचीत का इतिहास साफ़ कर दिया गया है। आज मैं आपकी कैसे मदद कर सकता हूँ?",
      tryAskingTitle: "💡 यह पूछने का प्रयास करें...",
      tryPrompts: [
        "क्या इस सप्ताह के अंत में बारिश होगी?",
        "क्या कोई चक्रवात अलर्ट है?",
        "बाढ़ से सुरक्षा के लिए मुझे सुझाव दें।",
        "ऊटी घूमने का सबसे अच्छा समय कौन सा है?"
      ],
      quickActions: [
        { label: "आज का मौसम", shortLabel: "आज", icon: CloudRain, query: "आज का मौसम कैसा रहेगा?" },
        { label: "आपदा अलर्ट", shortLabel: "अलर्ट", icon: AlertTriangle, query: "क्या कोई आपदा या तूफ़ान अलर्ट है?" },
        { label: "सुरक्षा सुझाव", shortLabel: "सुरक्षा", icon: ShieldCheck, query: "खराब मौसम के लिए सुरक्षा सुझाव दें।" },
        { label: "यात्रा सलाह", shortLabel: "यात्रा", icon: Plane, query: "यात्रा के लिए मौसम की सलाह दें।" }
      ],
      disclaimer: "वेदरवाइज़ सहायक से गलतियाँ हो सकती हैं। महत्वपूर्ण जानकारी की हमेशा पुष्टि करें।",
      inputPlaceholder: "अपना मौसम प्रश्न यहाँ लिखें...",
      recentChats: "हाल की बातचीत",
      newChat: "नई बातचीत",
      today: "आज",
      yesterday: "कल",
      thisWeek: "इस सप्ताह",
      noChatsYet: "कोई पिछली बातचीत नहीं है",
      startAsking: "नीचे प्रश्न लिखकर शुरुआत करें!",
      loadingText: "मौसम पूर्वानुमान का विश्लेषण किया जा रहा है...",
      connectionError: "कनेक्ट करने में समस्या आ रही है। कृपया कुछ देर बाद पुनः प्रयास करें।",
      newButton: "नया",
      quickInquiries: "त्वरित पूछताछ",
      myCurrentLocation: "मेरा वर्तमान स्थान",
      severeWeatherAlerts: "गंभीर मौसम अलर्ट",
      rainUmbrellaAdvice: "बारिश और छाता सलाह",
      highLabel: "अधिकतम:",
      lowLabel: "न्यूनतम:",
      precipitationLabel: "वर्षा:",
      windLabel: "हवा:"
    };
  }
  if (l.includes('kannada') || l.includes('ಕನ್ನಡ')) {
    return {
      greeting: "ನಮಸ್ಕಾರ {name}! 👋 ನಾನು ನಿಮ್ಮ ವೆದರ್‌ವೈಸ್ ಎಐ ಸಹಾಯಕ. ಲೈವ್ ಹವಾಮಾನ, ಮುನ್ಸೂಚನೆಗಳು ಅಥವಾ ಅಪ್ಲಿಕೇಶನ್ ವೈಶಿಷ್ಟ್ಯಗಳ ಕುರಿತು ನನ್ನನ್ನು ಕೇಳಿ.",
      clearText: "ಚಾಟ್ ಇತಿಹಾಸವನ್ನು ತೆರವುಗೊಳಿಸಲಾಗಿದೆ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
      tryAskingTitle: "💡 ಇವುಗಳನ್ನು ಕೇಳಿ ನೋಡಿ...",
      tryPrompts: [
        "ಈ ವಾರಾಂತ್ಯದಲ್ಲಿ ಮಳೆ ಬರುತ್ತದೆಯೇ?",
        "ಯಾವುದಾದರೂ ಚಂಡಮಾರುತದ ಎಚ್ಚರಿಕೆ ಇದೆಯೇ?",
        "ಪ್ರವಾಹದಿಂದ ರಕ್ಷಿಸಿಕೊಳ್ಳಲು ಸುರಕ್ಷತಾ ಸಲಹೆಗಳನ್ನು ನೀಡಿ.",
        "ಊಟಿಗೆ ಭೇಟಿ ನೀಡಲು ಉತ್ತಮ ಸಮಯ ಯಾವುದು?"
      ],
      quickActions: [
        { label: "ಇಂದಿನ ಮುನ್ಸೂಚನೆ", shortLabel: "ಇಂದು", icon: CloudRain, query: "ಇಂದಿನ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಏನು?" },
        { label: "ವಿಪತ್ತು ಎಚ್ಚರಿಕೆಗಳು", shortLabel: "ಎಚ್ಚರಿಕೆ", icon: AlertTriangle, query: "ಯಾವುದಾದರೂ ವಿಪತ್ತು ಎಚ್ಚರಿಕೆಗಳಿವೆಯೇ?" },
        { label: "ಸುರಕ್ಷತಾ ಸಲಹೆಗಳು", shortLabel: "ಸುರಕ್ಷತೆ", icon: ShieldCheck, query: "ಹವಾಮಾನ ಸುರಕ್ಷತಾ ಸಲಹೆಗಳನ್ನು ನೀಡಿ." },
        { label: "ಪ್ರವಾಸ ಸಲಹೆ", shortLabel: "ಪ್ರವಾಸ", icon: Plane, query: "ಪ್ರವಾಸಕ್ಕೆ ಹವಾಮಾನ ಸಲಹೆ ನೀಡಿ." }
      ],
      disclaimer: "ವೆದರ್‌ವೈಸ್ ಸಹಾಯಕ ತಪ್ಪುಗಳನ್ನು ಮಾಡಬಹುದು. ನಿರ್ಣಾಯಕ ಮಾಹಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.",
      inputPlaceholder: "ನಿಮ್ಮ ಹವಾಮಾನ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...",
      recentChats: "ಇತ್ತೀಚಿನ ಚಾಟ್‌ಗಳು",
      newChat: "ಹೊಸ ಚಾಟ್",
      today: "ಇಂದು",
      yesterday: "ನಿನ್ನೆ",
      thisWeek: "ಈ ವಾರ",
      noChatsYet: "ಇನ್ನೂ ಯಾವುದೇ ಚಾಟ್‌ಗಳಿಲ್ಲ",
      startAsking: "ಕೆಳಗೆ ಟೈಪ್ ಮಾಡಿ ಪ್ರಶ್ನಿಸಲು ಪ್ರಾರಂಭಿಸಿ!",
      loadingText: "ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
      connectionError: "ಸಂಪರ್ಕಿಸುವಲ್ಲಿ ತೊಂದರೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
      newButton: "ಹೊಸ",
      quickInquiries: "ತ್ವರಿತ ವಿಚಾರಣೆಗಳು",
      myCurrentLocation: "ನನ್ನ ಪ್ರಸ್ತುತ ಸ್ಥಳ",
      severeWeatherAlerts: "ತೀವ್ರ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳು",
      rainUmbrellaAdvice: "ಮಳೆ ಮತ್ತು ಛತ್ರಿ ಸಲಹೆ",
      highLabel: "ಗರಿಷ್ಠ:",
      lowLabel: "ಕನಿಷ್ಠ:",
      precipitationLabel: "ಮಳೆಯ ಪ್ರಮಾಣ:",
      windLabel: "ಗಾಳಿ:"
    };
  }
  if (l.includes('spanish') || l.includes('español')) {
    return {
      greeting: "¡Hola {name}! 👋 Soy tu asistente meteorológico de WeatherWise con tecnología Gemini. Pregúntame sobre el clima en vivo, pronósticos o alertas de desastre.",
      clearText: "Historial borrado. ¿En qué te puedo ayudar hoy?",
      tryAskingTitle: "💡 Prueba preguntando...",
      tryPrompts: [
        "¿Lloverá este fin de semana?",
        "¿Hay alguna alerta de ciclón?",
        "Dame consejos de seguridad ante inundaciones.",
        "¿Cuál es la mejor época para viajar a Ooty?"
      ],
      quickActions: [
        { label: "Pronóstico de Hoy", shortLabel: "Hoy", icon: CloudRain, query: "¿Cuál es el pronóstico para hoy?" },
        { label: "Alertas de Desastre", shortLabel: "Alertas", icon: AlertTriangle, query: "¿Hay alertas de desastre o tormentas?" },
        { label: "Consejos de Seguridad", shortLabel: "Seguridad", icon: ShieldCheck, query: "Dame recomendaciones de seguridad ante mal clima." },
        { label: "Consejos de Viaje", shortLabel: "Viaje", icon: Plane, query: "Dame recomendaciones meteorológicas para viajar." }
      ],
      disclaimer: "El Asistente WeatherWise puede cometer errores. Verifica la información crítica.",
      inputPlaceholder: "Escribe tu pregunta aquí...",
      recentChats: "Chats recientes",
      newChat: "Nuevo Chat",
      today: "Hoy",
      yesterday: "Ayer",
      thisWeek: "Esta semana",
      noChatsYet: "Sin chats anteriores",
      startAsking: "¡Comienza escribiendo abajo!",
      loadingText: "Analizando el pronóstico meteorológico...",
      connectionError: "Tengo problemas para conectarme ahora mismo. Inténtalo de nuevo en un momento.",
      newButton: "Nuevo",
      quickInquiries: "Consultas Rápidas",
      myCurrentLocation: "Mi ubicación actual",
      severeWeatherAlerts: "Alertas meteorológicas severas",
      rainUmbrellaAdvice: "Consejos de lluvia y paraguas",
      highLabel: "Máx:",
      lowLabel: "Mín:",
      precipitationLabel: "Precipitación:",
      windLabel: "Viento:"
    };
  }
  if (l.includes('french') || l.includes('français')) {
    return {
      greeting: "Bonjour {name} ! 👋 Je suis votre assistant météo IA WeatherWise. Posez-moi des questions sur la météo en direct, les prévisions ou les alertes.",
      clearText: "Historique effacé. Comment puis-je vous aider aujourd'hui ?",
      tryAskingTitle: "💡 Essayez de demander...",
      tryPrompts: [
        "Va-t-il pleuvoir ce week-end ?",
        "Y a-t-il une alerte au cyclone ?",
        "Donnez-moi des conseils de sécurité en cas d'inondation.",
        "Quel est le meilleur moment pour voyager ?"
      ],
      quickActions: [
        { label: "Météo du Jour", shortLabel: "Aujourd'hui", icon: CloudRain, query: "Quelles sont les prévisions pour aujourd'hui ?" },
        { label: "Alertes Catastrophe", shortLabel: "Alertes", icon: AlertTriangle, query: "Y a-t-il des alertes de catastrophe ?" },
        { label: "Conseils de Sécurité", shortLabel: "Sécurité", icon: ShieldCheck, query: "Donnez-moi des conseils de sécurité météo." },
        { label: "Conseils Voyage", shortLabel: "Voyage", icon: Plane, query: "Conseils météo pour voyager." }
      ],
      disclaimer: "L'assistant WeatherWise peut faire des erreurs. Vérifiez les informations critiques.",
      inputPlaceholder: "Posez votre question ici...",
      recentChats: "Discussions récentes",
      newChat: "Nouvelle discussion",
      today: "Aujourd'hui",
      yesterday: "Hier",
      thisWeek: "Cette semaine",
      noChatsYet: "Aucune discussion récente",
      startAsking: "Commencez en écrivant ci-dessous !",
      loadingText: "Analyse des prévisions météorologiques...",
      connectionError: "J'ai du mal à me connecter pour le moment. Veuillez réessayer dans un instant.",
      newButton: "Nouveau",
      quickInquiries: "Demandes rapides",
      myCurrentLocation: "Ma position actuelle",
      severeWeatherAlerts: "Alertes météo violente",
      rainUmbrellaAdvice: "Conseils pluie et parapluie",
      highLabel: "Max :",
      lowLabel: "Min :",
      precipitationLabel: "Précipitations :",
      windLabel: "Vent :"
    };
  }
  if (l.includes('german') || l.includes('deutsch')) {
    return {
      greeting: "Hallo {name}! 👋 Ich bin Ihr WeatherWise KI-Wetterassistent. Fragen Sie mich nach aktuellem Wetter, Vorhersagen oder Katastrophenwarnungen.",
      clearText: "Chat-Verlauf gelöscht. Wie kann ich Ihnen heute helfen?",
      tryAskingTitle: "💡 Probieren Sie Fragen aus...",
      tryPrompts: [
        "Wird es am Wochenende regnen?",
        "Gibt es eine Sturmwarnung?",
        "Geben Sie mir Sicherheitstipps für Überschwemmungen.",
        "Wann ist die beste Reisezeit?"
      ],
      quickActions: [
        { label: "Vorhersage heute", shortLabel: "Heute", icon: CloudRain, query: "Wie ist die heutige Wettervorhersage?" },
        { label: "Katastrophenwarnungen", shortLabel: "Warnungen", icon: AlertTriangle, query: "Gibt es Unwetterwarnungen?" },
        { label: "Sicherheitstipps", shortLabel: "Sicherheit", icon: ShieldCheck, query: "Sicherheitstipps bei Unwetter." },
        { label: "Reisehinweise", shortLabel: "Reise", icon: Plane, query: "Wetter-Tipps für meine Reise." }
      ],
      disclaimer: "WeatherWise Assistant kann Fehler machen. Überprüfen Sie wichtige Daten.",
      inputPlaceholder: "Stellen Sie hier Ihre Frage...",
      recentChats: "Kürzliche Chats",
      newChat: "Neuer Chat",
      today: "Heute",
      yesterday: "Gestern",
      thisWeek: "Diese Woche",
      noChatsYet: "Noch keine vorherigen Chats",
      startAsking: "Tippen Sie unten, um zu beginnen!",
      loadingText: "Wettervorhersage wird analysiert...",
      connectionError: "Verbindungsprobleme aufgetreten. Bitte versuchen Sie es gleich noch einmal.",
      newButton: "Neu",
      quickInquiries: "Schnellabfragen",
      myCurrentLocation: "Mein aktueller Standort",
      severeWeatherAlerts: "Unwetterwarnungen",
      rainUmbrellaAdvice: "Regen- & Regenschirmtipps",
      highLabel: "Hoch:",
      lowLabel: "Tief:",
      precipitationLabel: "Niederschlag:",
      windLabel: "Wind:"
    };
  }
  if (l.includes('japanese') || l.includes('日本語')) {
    return {
      greeting: "こんにちは、{name}さん！👋 WeatherWise AIアシスタントです。リアルタイムの天気、予報、防災警報、安全のヒントなど何でもお尋ねください。",
      clearText: "チャット履歴が消去されました。本日はどのようなご用件でしょうか？",
      tryAskingTitle: "💡 質問の例...",
      tryPrompts: [
        "今週末は雨が降りますか？",
        "サイクロンや台風の警報はありますか？",
        "洪水の安全対策を教えてください。",
        "旅行に最適な時期はいつですか？"
      ],
      quickActions: [
        { label: "今日の予報", shortLabel: "今日", icon: CloudRain, query: "今日の天気予报はどうですか？" },
        { label: "災害アラート", shortLabel: "警報", icon: AlertTriangle, query: "自然災害のアラートはありますか？" },
        { label: "安全のヒント", shortLabel: "安全", icon: ShieldCheck, query: "悪天候時の安全対策を教えてください。" },
        { label: "旅行アドバイス", shortLabel: "旅行", icon: Plane, query: "旅行の天気アドバイスをください。" }
      ],
      disclaimer: "AIアシスタントは誤りを含む場合があります。重要な情報はご確認ください。",
      inputPlaceholder: "天気に関する質問を入力...",
      recentChats: "最近のチャット",
      newChat: "新規チャット",
      today: "今日",
      yesterday: "昨日",
      thisWeek: "今週",
      noChatsYet: "チャット履歴はありません",
      startAsking: "下に入力して質問してみましょう！",
      loadingText: "気象予報を分析中...",
      connectionError: "現在接続に問題が発生しています。しばらくしてからもう一度お試しください。",
      newButton: "新規",
      quickInquiries: "クイック問い合わせ",
      myCurrentLocation: "現在の位置情報",
      severeWeatherAlerts: "気象警報・注意報",
      rainUmbrellaAdvice: "雨・傘のアドバイス",
      highLabel: "最高:",
      lowLabel: "最低:",
      precipitationLabel: "降水量:",
      windLabel: "風速:"
    };
  }
  return {
    greeting: "Hello {name}! 👋 I'm your WeatherWise Assistant. I can help you with weather forecasts, disaster alerts, safety tips, and more. What would you like to know?",
    clearText: "Chat history cleared. What would you like to explore today?",
    tryAskingTitle: "💡 Try asking...",
    tryPrompts: [
      "Will it rain this weekend?",
      "Is there a cyclone alert?",
      "Give me safety tips for floods.",
      "Best time to travel to Ooty?"
    ],
    quickActions: [
      { label: "Today's Forecast", shortLabel: "Today", icon: CloudRain, query: "What is the forecast for today?" },
      { label: "Disaster Alerts", shortLabel: "Alerts", icon: AlertTriangle, query: "Are there any natural disaster alerts?" },
      { label: "Safety Tips", shortLabel: "Safety Tips", icon: ShieldCheck, query: "Give me weather safety precautions." },
      { label: "Travel Advice", shortLabel: "Travel Advice", icon: Plane, query: "Give me travel weather advice." }
    ],
    disclaimer: "WeatherWise Assistant may make mistakes. Always verify critical information.",
    inputPlaceholder: "Type your question here...",
    recentChats: "Recent Chats",
    newChat: "New Chat",
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "This Week",
    noChatsYet: "No recent chats yet",
    startAsking: "Start asking questions below!",
    loadingText: "Analyzing meteorological forecast...",
    connectionError: "I'm having trouble connecting right now. Please try asking your question again in a moment.",
    newButton: "New",
    quickInquiries: "Quick Inquiries",
    myCurrentLocation: "My Current Location",
    severeWeatherAlerts: "Severe Weather Alerts",
    rainUmbrellaAdvice: "Rain & Umbrella Advice",
    highLabel: "High:",
    lowLabel: "Low:",
    precipitationLabel: "Precipitation:",
    windLabel: "Wind:"
  };
}

function getWeatherIcon(condition = '') {
  const c = condition.toLowerCase();
  if (c.includes('thunder') || c.includes('lightning') || c.includes('storm')) {
    return <CloudLightning className="w-10 h-10 text-amber-500 animate-pulse" />;
  }
  if (c.includes('snow') || c.includes('sleet') || c.includes('ice') || c.includes('blizzard')) {
    return <CloudSnow className="w-10 h-10 text-sky-400" />;
  }
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) {
    return <CloudRain className="w-10 h-10 text-blue-500" />;
  }
  if (c.includes('wind') || c.includes('breeze')) {
    return <Wind className="w-10 h-10 text-teal-500" />;
  }
  if (c.includes('cloud') || c.includes('overcast')) {
    return <Cloud className="w-10 h-10 text-slate-400" />;
  }
  return <Sun className="w-10 h-10 text-amber-400" />;
}

function buildPersonalizedGreeting(template, userName) {
  const name = userName || 'User';
  if (!template) return `Hello ${name}! 👋`;
  return template.includes('{name}')
    ? template.replace('{name}', name)
    : template.replace('Hello!', `Hello ${name}! 👋`);
}

export default function WeatherChatbot() {
  const { temperatureUnit, user, language, currentCity } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [likedMap, setLikedMap] = useState({});
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);

  const chatEndRef = useRef(null);
  const localized = getLocalizedChatDefaults(language);

  // Load chat history & dynamic suggestions based on selected language
  useEffect(() => {
    api.getChatHistory(language).then(res => {
      const hist = Array.isArray(res) ? res : (res?.data || []);
      const sugs = res?.suggestions || [];
      if (hist && hist.length > 0) {
        setMessages(hist);
      } else {
        const userName = user?.name ? user.name.split(' ')[0] : 'User';
        const personalizedGreeting = buildPersonalizedGreeting(localized.greeting, userName);
        setMessages([
          {
            id: 'init_welcome',
            role: 'assistant',
            content: personalizedGreeting,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
      setSuggestions(sugs.length > 0 ? sugs : []);
    });
  }, [language, user?.name, localized.greeting]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = useCallback(async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    setInput('');
    setAttachMenuOpen(false);
    if (mobileDrawerOpen) setMobileDrawerOpen(false);

    const now = new Date();
    const userMsg = {
      id: `usr_${now.getTime()}`,
      role: 'user',
      content: text,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: now.toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.sendChatMessage(text, language, currentCity);
      if (res && res.data) {
        setMessages(prev => [...prev, res.data]);
        if (res.suggestions && Array.isArray(res.suggestions) && res.suggestions.length > 0) {
          setSuggestions(res.suggestions);
        }
      } else {
        const errTime = new Date();
        setMessages(prev => [
          ...prev,
          {
            id: `bot_err_${errTime.getTime()}`,
            role: 'assistant',
            content: localized.connectionError || "I'm having trouble connecting right now. Please try asking your question again in a moment.",
            timestamp: 'Just now'
          }
        ]);
      }
    } catch {
      const errTime = new Date();
      setMessages(prev => [
        ...prev,
        {
          id: `bot_err_${errTime.getTime()}`,
          role: 'assistant',
          content: localized.connectionError || "I'm having trouble connecting right now. Please try asking your question again in a moment.",
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, language, currentCity, mobileDrawerOpen, localized.connectionError]);

  const handleNewChat = async () => {
    await api.clearChatHistory();
    const userName = user?.name ? user.name.split(' ')[0] : 'User';
    const personalizedGreeting = buildPersonalizedGreeting(localized.greeting, userName);
    setMessages([
      {
        id: `init_new_${Date.now()}`,
        role: 'assistant',
        content: personalizedGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setSuggestions([]);
    if (mobileDrawerOpen) setMobileDrawerOpen(false);
  };

  const handleCopy = (id, content) => {
    navigator.clipboard?.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (id, type) => {
    setLikedMap(prev => ({
      ...prev,
      [id]: prev[id] === type ? null : type
    }));
  };

  // Group user chats dynamically into Today, Yesterday, This Week
  const recentUserChats = messages
    .filter(m => m.role === 'user' && m.content)
    .slice(-12)
    .reverse();

  const categorizeChats = (chatList) => {
    const today = [];
    const yesterday = [];
    const thisWeek = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const weekStart = todayStart - 6 * 86400000;

    chatList.forEach((chat) => {
      const chatTime = chat.createdAt ? new Date(chat.createdAt).getTime() : now.getTime();
      if (chatTime >= todayStart) {
        today.push(chat);
      } else if (chatTime >= yesterdayStart) {
        yesterday.push(chat);
      } else if (chatTime >= weekStart) {
        thisWeek.push(chat);
      } else {
        thisWeek.push(chat);
      }
    });

    return { today, yesterday, thisWeek };
  };

  const chatGroups = categorizeChats(recentUserChats);
  const hasAnyChats = recentUserChats.length > 0;
  const userInitial = user?.avatar || (user?.name ? user.name.charAt(0).toUpperCase() : 'U');

  // Render recent chat item
  const renderChatItem = (chat, idx) => (
    <button
      key={chat.id || idx}
      onClick={() => handleSendMessage(chat.content)}
      className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700/80 flex items-center justify-between gap-2 transition-all cursor-pointer group mb-1"
      title={chat.content}
    >
      <div className="flex items-center gap-2 min-w-0">
        <MessageSquare className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 shrink-0" />
        <span className="truncate font-medium">{chat.content}</span>
      </div>
      <span className="text-[10px] text-slate-400 shrink-0">
        {chat.timestamp || 'Just now'}
      </span>
    </button>
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col lg:flex-row h-[720px] max-h-[calc(100vh-170px)] transition-colors relative">

      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR (matches Left Column of wireframe)                         */}
      {/* ========================================================================= */}
      <aside className="hidden lg:flex w-72 xl:w-80 border-r border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-4 flex-col justify-between shrink-0">
        <div className="flex flex-col min-h-0">

          {/* + New Chat Button (Pill button matching wireframe) */}
          <button
            onClick={handleNewChat}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{localized.newChat}</span>
          </button>

          {/* Recent Chats Section Header */}
          <div className="mt-5 mb-2 flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {localized.recentChats}
            </span>
          </div>

          {/* Grouped Dynamic Recent Chats (or empty state if no queries yet) */}
          <div className="space-y-2 overflow-y-auto max-h-[300px] scrollbar-thin pr-1">
            {hasAnyChats ? (
              <>
                {chatGroups.today.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1">
                      {localized.today}
                    </div>
                    {chatGroups.today.map(renderChatItem)}
                  </div>
                )}

                {chatGroups.yesterday.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1">
                      {localized.yesterday}
                    </div>
                    {chatGroups.yesterday.map(renderChatItem)}
                  </div>
                )}

                {chatGroups.thisWeek.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1">
                      {localized.thisWeek}
                    </div>
                    {chatGroups.thisWeek.map(renderChatItem)}
                  </div>
                )}
              </>
            ) : (
              <div className="px-3 py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-30 text-slate-400" />
                <p className="font-semibold text-slate-600 dark:text-slate-300">{localized.noChatsYet}</p>
                <p className="text-[11px] mt-0.5 opacity-75">{localized.startAsking}</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Left: "💡 Try asking..." Box (matches wireframe card) */}
        <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800">
          <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/50 dark:from-slate-800/80 dark:to-slate-800/50 rounded-2xl p-3.5 border border-blue-100/70 dark:border-slate-700/70 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
              <span>{localized.tryAskingTitle}</span>
            </h4>
            <div className="space-y-1.5">
              {localized.tryPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="w-full text-left text-[11px] text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 transition-colors cursor-pointer group"
                >
                  <span className="text-blue-500 font-bold shrink-0">+</span>
                  <span className="truncate group-hover:underline">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MOBILE DRAWER (Slide-out menu for mobile view)                             */}
      {/* ========================================================================= */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-72 sm:w-80 max-w-[85vw] bg-white dark:bg-slate-900 h-full p-4 flex flex-col justify-between shadow-2xl z-10">
            <div className="flex flex-col min-h-0">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <span className="font-bold text-sm text-slate-900 dark:text-white">WeatherWise Chat</span>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleNewChat}
                className="w-full py-2 px-3 rounded-xl bg-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>{localized.newChat}</span>
              </button>

              <div className="mt-4 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {localized.recentChats}
              </div>

              <div className="space-y-1 overflow-y-auto max-h-[260px] pr-1">
                {hasAnyChats ? (
                  recentUserChats.map((chat, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chat.content)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between gap-2"
                    >
                      <span className="truncate">{chat.content}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">{chat.timestamp}</span>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">{localized.noChatsYet}</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50/60 dark:bg-slate-800 rounded-xl p-3 border border-blue-100 dark:border-slate-700 mt-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">{localized.tryAskingTitle}</h4>
              <div className="space-y-1.5">
                {localized.tryPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p)}
                    className="w-full text-left text-[11px] text-slate-600 dark:text-slate-300 hover:text-blue-600 flex items-center gap-1.5"
                  >
                    <span className="text-blue-500 font-bold">+</span>
                    <span className="truncate">{p}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN CHAT WINDOW (Right Column on Desktop, Full view on Mobile)           */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">

        {/* Mobile Header Bar (Matches Mobile Wireframe mockup) */}
        <div className="lg:hidden flex items-center justify-between p-2.5 px-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors cursor-pointer"
              title="View recent chats"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-blue-600 fill-blue-600" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">WeatherWise Assistant</span>
            </div>
          </div>

          <button
            onClick={handleNewChat}
            className="p-1.5 px-2.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-semibold text-[11px] flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{localized.newButton || 'New'}</span>
          </button>
        </div>

        {/* Chat Transcript Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 scrollbar-thin">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const isLiked = likedMap[msg.id] === 'up';
            const isDisliked = likedMap[msg.id] === 'down';

            return (
              <div
                key={msg.id || index}
                className={`flex gap-2.5 sm:gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Avatar Badge: Blue outline ring with Cloud icon */}
                {!isUser && (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-slate-800 border-2 border-blue-500 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Cloud className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </div>
                )}

                <div className={`max-w-[88%] sm:max-w-xl ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>

                  {/* Message Speech Bubble */}
                  <div
                    className={`p-3.5 sm:p-4 text-xs sm:text-[13px] leading-relaxed font-normal ${isUser
                        ? 'bg-blue-600 text-white rounded-2xl rounded-tr-xs shadow-xs'
                        : 'bg-slate-100/90 dark:bg-slate-800/85 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-xs shadow-2xs border border-slate-200/60 dark:border-slate-700/60'
                      }`}
                  >
                    {/* User or Bot text message */}
                    <p className="whitespace-pre-line">{msg.content}</p>

                    {/* Embedded Weather Card (Exact match to wireframe design!) */}
                    {msg.card && (
                      <div className="w-full mt-3 bg-white dark:bg-slate-900/95 rounded-2xl p-4 border border-blue-200/80 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                        {/* Left Column: Icon + Large Temp + Condition */}
                        <div className="flex items-center gap-3.5">
                          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 shrink-0">
                            {getWeatherIcon(msg.card.condition)}
                          </div>
                          <div>
                            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                              {formatTemp(msg.card.temp, temperatureUnit)}
                            </div>
                            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                              {msg.card.condition}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {msg.card.city}, {msg.card.country} ({msg.card.date})
                            </div>
                          </div>
                        </div>

                        {/* Right Column: 4 Stats list with diamond/bullet icons */}
                        <div className="space-y-1 text-xs sm:text-[11px] text-slate-600 dark:text-slate-300 pl-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-slate-200/80 dark:border-slate-800 pt-2.5 sm:pt-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-blue-500">🔹</span>
                            <span className="font-medium">{localized.highLabel || 'High:'}</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {formatDegree(msg.card.high, temperatureUnit)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-blue-500">🔹</span>
                            <span className="font-medium">{localized.lowLabel || 'Low:'}</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {formatDegree(msg.card.low, temperatureUnit)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-blue-500">🔹</span>
                            <span className="font-medium">{localized.precipitationLabel || 'Precipitation:'}</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {msg.card.rainChance}%
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-blue-500">🔹</span>
                            <span className="font-medium">{localized.windLabel || 'Wind:'}</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {msg.card.wind} km/h
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Below Message Bubble: Timestamp & Action icons (thumbs up/down, copy) */}
                  <div className={`flex items-center gap-3 px-1.5 ${isUser ? 'justify-end' : 'justify-between w-full'}`}>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {msg.timestamp || 'Just now'}
                    </span>

                    {/* Bot Message Actions */}
                    {!isUser && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <button
                          onClick={() => handleFeedback(msg.id, 'up')}
                          className={`hover:text-blue-600 transition-colors p-0.5 rounded cursor-pointer ${isLiked ? 'text-blue-600' : ''
                            }`}
                          title="Helpful"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id, 'down')}
                          className={`hover:text-rose-500 transition-colors p-0.5 rounded cursor-pointer ${isDisliked ? 'text-rose-500' : ''
                            }`}
                          title="Not helpful"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-0.5 rounded cursor-pointer"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Avatar Badge matching wireframe on right side */}
                {isUser && (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    {userInitial}
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Animation Bubble */}
          {loading && (
            <div className="flex gap-2.5 items-center">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
                <Cloud className="w-4 h-4 animate-bounce" />
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                <span>{localized.loadingText || 'Analyzing meteorological forecast...'}</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* ========================================================================= */}
        {/* QUICK ACTION PILLS BAR (matches horizontal chips in wireframe)            */}
        {/* ========================================================================= */}
        <div className="px-3 sm:px-6 py-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none bg-slate-50/40 dark:bg-slate-900/40">

          {/* Quick Action Category Chips */}
          {localized.quickActions.map((action, idx) => {
            const IconComponent = action.icon;
            return (
              <button
                key={`qa_${idx}`}
                onClick={() => handleSendMessage(action.query)}
                className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 shrink-0 shadow-2xs transition-all cursor-pointer"
              >
                <IconComponent className="w-3.5 h-3.5 text-blue-500" />
                <span className="sm:hidden">{action.shortLabel || action.label}</span>
                <span className="hidden sm:inline">{action.label}</span>
              </button>
            );
          })}

          {/* Dynamic AI Suggestions Pills */}
          {suggestions.map((sug, idx) => (
            <button
              key={`sug_${idx}`}
              onClick={() => handleSendMessage(sug)}
              className="px-3 py-1.5 rounded-full bg-blue-50/80 dark:bg-slate-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border border-blue-200/80 dark:border-slate-700 text-xs font-medium shrink-0 shadow-2xs transition-all cursor-pointer"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* CHAT INPUT BAR & DISCLAIMER (matches bottom input in wireframe)            */}
        {/* ========================================================================= */}
        <div className="p-3 sm:p-4 px-3 sm:px-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 relative">

          {/* Paperclip quick attachment popover */}
          {attachMenuOpen && (
            <div className="absolute bottom-16 left-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 shadow-xl z-20 w-64 animate-in fade-in slide-in-from-bottom-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1">
                {localized.quickInquiries || 'Quick Inquiries'}
              </div>
              <button
                onClick={() => {
                  setInput(`What is the current live weather and forecast in ${currentCity || 'my city'}?`);
                  setAttachMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>{localized.myCurrentLocation || 'My Current Location'}</span>
              </button>
              <button
                onClick={() => {
                  setInput("Are there any severe storm, flood, or cyclone warnings today?");
                  setAttachMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>{localized.severeWeatherAlerts || 'Severe Weather Alerts'}</span>
              </button>
              <button
                onClick={() => {
                  setInput("Do I need to carry an umbrella or rain gear today?");
                  setAttachMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors"
              >
                <Umbrella className="w-3.5 h-3.5 text-indigo-500" />
                <span>{localized.rainUmbrellaAdvice || 'Rain & Umbrella Advice'}</span>
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1.5 shadow-2xs focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 transition-all"
          >
            {/* Paperclip Icon on the left */}
            <button
              type="button"
              onClick={() => setAttachMenuOpen(!attachMenuOpen)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-colors cursor-pointer"
              title="Attach location or prompt"
            >
              <Paperclip className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {/* Input Field */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={localized.inputPlaceholder}
              className="flex-1 bg-transparent px-2 py-1 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
            />

            {/* Blue Circular Send Button with right arrow */}
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center shadow-xs shrink-0 transition-all cursor-pointer active:scale-95"
              title="Send"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Disclaimer Footer Text matching wireframe */}
          <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 text-center mt-2 font-normal">
            {localized.disclaimer}
          </p>
        </div>

      </div>
    </div>
  );
}
