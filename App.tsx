
import React, { useState, useEffect, useCallback } from 'react';
import { MENU_ITEMS, SUCCESS_MESSAGE_SUBTITLE, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from './constants';
import type { Theme, Language, ArduinoStatus, MenuItemData, NotificationStatus } from './types';
import Header from './components/Header';
import MainMenu from './components/MainMenu';
import HowItWorks from './components/HowItWorks';
import InitializingScreen from './components/InitializingScreen';
import NotificationStatusToast from './components/NotificationStatusToast';

// --- Text-to-Speech (TTS) Utility ---
const languageToCode: Record<Language, string> = {
  english: 'en-US',
  hindi: 'hi-IN',
  tamil: 'ta-IN',
  telugu: 'te-IN',
};

const speak = (text: string, language: Language, enabled: boolean): void => {
  if (!enabled || typeof window === 'undefined' || !window.speechSynthesis) {
    return;
  }
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = languageToCode[language] || 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1.1;

  window.speechSynthesis.speak(utterance);
};
// --- End of TTS Utility ---

// --- Telegram Message Formatter ---
const generateTelegramMessage = (item: MenuItemData, language: Language): string => {
    const requestDetails: Record<string, { emoji: string; request: string; status: string; }> = {
      water: { emoji: '💧', request: 'WATER', status: 'Urgent' },
      food: { emoji: '🍽️', request: 'FOOD', status: 'Urgent' },
      help: { emoji: '🆘', request: 'HELP', status: 'CRITICAL' },
      washroom: { emoji: '🚻', request: 'WASHROOM', status: 'Urgent' },
      outing: { emoji: '🚗', request: 'OUTING', status: 'Request' },
    };

    const details = requestDetails[item.id];
    if (!details) {
        return `Patient made an unknown request: ${item.name.english}`;
    }

    const timeInIST = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    
    const statusEmoji = details.status === 'CRITICAL' ? '🚨' : (details.status === 'Request' ? '📌' : '⚠️');
    const languageName = language.charAt(0).toUpperCase() + language.slice(1);

    return `${details.emoji} *Patient Request: ${details.request}*\n\n` +
           `⏰ *Time:* ${timeInIST}\n` +
           `🌐 *Language:* ${languageName}\n` +
           `${statusEmoji} *Status:* ${details.status}`;
};
// --- End of Formatter ---

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'dark');
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('language') as Language) || 'english');
  const [arduinoStatus, setArduinoStatus] = useState<ArduinoStatus>('disconnected');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);
  const [notificationStatus, setNotificationStatus] = useState<NotificationStatus>('idle');
  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('ttsEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('ttsEnabled', JSON.stringify(isTtsEnabled));
  }, [isTtsEnabled]);

  useEffect(() => {
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);
  
  useEffect(() => {
    if (isInitializing || notificationStatus !== 'idle') {
      window.speechSynthesis?.cancel();
      return;
    }
    const currentItem = MENU_ITEMS[selectedIndex];
    speak(currentItem.name[language], language, isTtsEnabled);
  }, [selectedIndex, language, isTtsEnabled, isInitializing, notificationStatus]);

  const handleNavigateNext = useCallback(() => {
    if (notificationStatus !== 'idle') return;
    setSelectedIndex(prevIndex => (prevIndex + 1) % MENU_ITEMS.length);
  }, [notificationStatus]);

  const handleSelectionAndNotify = useCallback(async (item: MenuItemData) => {
    if (notificationStatus !== 'idle') return;

    speak(`You selected ${item.name[language]}.`, language, isTtsEnabled);
    
    setNotificationStatus('sending');
    
    const messageText = generateTelegramMessage(item, language);
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: messageText,
          parse_mode: 'Markdown'
        }),
      });
      
      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.description || 'Failed to send message');
      }

      setNotificationStatus('success');
      speak(SUCCESS_MESSAGE_SUBTITLE[language], language, isTtsEnabled);
    } catch (error) {
      console.error("Failed to send Telegram message:", error);
      setNotificationStatus('error');
    } finally {
      setTimeout(() => {
        setNotificationStatus('idle');
      }, 2500);
    }
  }, [language, isTtsEnabled, notificationStatus]);

  const handleSelect = useCallback(() => {
    setSelectedIndex(currentSelectedIndex => {
      const item = MENU_ITEMS[currentSelectedIndex];
    
      if (item.id === 'entertainment') {
        speak(`Opening entertainment.`, language, isTtsEnabled);
        const url = `https://www.youtube.com/shorts/`;
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        handleSelectionAndNotify(item);
      }
      return 0;
    });
  }, [handleSelectionAndNotify, language, isTtsEnabled]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (notificationStatus !== 'idle') return;

      if (event.code === 'ArrowDown') {
        event.preventDefault();
        handleNavigateNext();
      } else if (event.code === 'Space') {
        event.preventDefault();
        handleSelect();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [notificationStatus, handleNavigateNext, handleSelect]);

  if (isInitializing) {
    return <InitializingScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text font-sans transition-colors duration-300">
      <Header
        theme={theme}
        setTheme={setTheme}
        language={language}
        setLanguage={setLanguage}
        arduinoStatus={arduinoStatus}
        setArduinoStatus={setArduinoStatus}
        isTtsEnabled={isTtsEnabled}
        setIsTtsEnabled={setIsTtsEnabled}
      />
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        <MainMenu selectedIndex={selectedIndex} language={language} />
      </main>
      <HowItWorks />
      <NotificationStatusToast 
        status={notificationStatus}
        language={language}
      />
    </div>
  );
};

export default App;
