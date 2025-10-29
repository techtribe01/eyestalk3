import React, { useState, useEffect, useCallback } from 'react';
import { MENU_ITEMS, SUCCESS_MESSAGE_SUBTITLE } from './constants';
import type { Theme, Language, AppMode, ArduinoStatus, MenuItemData, NotificationStatus } from './types';
import Header from './components/Header';
import MainMenu from './components/MainMenu';
import EntertainmentMode from './components/EntertainmentMode';
import HowItWorks from './components/HowItWorks';
import InitializingScreen from './components/InitializingScreen';
import ConfirmationModal from './components/ConfirmationModal';
import NotificationStatusToast from './components/WhatsAppStatusToast';

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
  // Cancel any currently speaking utterance to prevent overlap
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = languageToCode[language] || 'en-US';
  utterance.rate = 0.9; // Slightly slower for clarity
  utterance.pitch = 1.1;

  window.speechSynthesis.speak(utterance);
};
// --- End of TTS Utility ---

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'dark');
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('language') as Language) || 'english');
  const [arduinoStatus, setArduinoStatus] = useState<ArduinoStatus>('disconnected');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [appMode, setAppMode] = useState<AppMode>('navigation');
  const [isInitializing, setIsInitializing] = useState(true);
  const [itemToConfirm, setItemToConfirm] = useState<MenuItemData | null>(null);
  const [highlightedConfirmation, setHighlightedConfirmation] = useState<'yes' | 'no'>('yes');
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
  
  // TTS for menu navigation
  useEffect(() => {
    if (isInitializing || itemToConfirm || appMode !== 'navigation') {
      window.speechSynthesis?.cancel();
      return;
    }
    const currentItem = MENU_ITEMS[selectedIndex];
    speak(currentItem.name[language], language, isTtsEnabled);
  }, [selectedIndex, language, isTtsEnabled, isInitializing, itemToConfirm, appMode]);

  const handleNavigateNext = useCallback(() => {
    if (itemToConfirm) return;
    setSelectedIndex(prevIndex => (prevIndex + 1) % MENU_ITEMS.length);
  }, [itemToConfirm]);

  const handleSelect = useCallback(() => {
    if (itemToConfirm) return;
    const item = MENU_ITEMS[selectedIndex];
    
    if (item.id === 'entertainment') {
      setAppMode('entertainment');
    } else {
      setItemToConfirm(item);
      setHighlightedConfirmation('yes');
      speak(`${item.name[language]}. Confirm selection?`, language, isTtsEnabled);
    }
  }, [selectedIndex, language, isTtsEnabled, itemToConfirm]);
  
  const handleCancel = useCallback(() => {
    setItemToConfirm(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!itemToConfirm) return;

    const item = itemToConfirm;
    setItemToConfirm(null);
    
    speak(`${item.name[language]}. ${SUCCESS_MESSAGE_SUBTITLE[language]}`, language, isTtsEnabled);
    
    setNotificationStatus('sending');
    
    try {
      const response = await fetch('http://localhost:3001/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `EyesTalk Alert: User requested "${item.name.english}".` }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'API returned an error');

      setNotificationStatus('success');
    } catch (error) {
      console.error("Failed to send Telegram message:", error);
      setNotificationStatus('error');
    } finally {
      setTimeout(() => {
        setNotificationStatus('idle');
      }, 2500);
    }
  }, [itemToConfirm, language, isTtsEnabled]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (notificationStatus !== 'idle') return;

      if (itemToConfirm) {
        if (event.code === 'ArrowDown') {
          event.preventDefault();
          setHighlightedConfirmation(prev => (prev === 'yes' ? 'no' : 'yes'));
        } else if (event.code === 'Space') {
          event.preventDefault();
          if (highlightedConfirmation === 'yes') {
            handleConfirm();
          } else {
            handleCancel();
          }
        }
      } else if (appMode === 'navigation') {
        if (event.code === 'ArrowDown') {
          event.preventDefault();
          handleNavigateNext();
        } else if (event.code === 'Space') {
          event.preventDefault();
          handleSelect();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [appMode, itemToConfirm, notificationStatus, highlightedConfirmation, handleNavigateNext, handleSelect, handleConfirm, handleCancel]);

  const handleExitEntertainment = () => {
    setAppMode('navigation');
    setSelectedIndex(0);
  };

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
        {appMode === 'navigation' ? (
          <MainMenu selectedIndex={selectedIndex} language={language} />
        ) : (
          <EntertainmentMode onExit={handleExitEntertainment} />
        )}
      </main>
      {appMode === 'navigation' && <HowItWorks />}
      {itemToConfirm && (
        <ConfirmationModal
          item={itemToConfirm}
          language={language}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          highlightedOption={highlightedConfirmation}
        />
      )}
      <NotificationStatusToast 
        status={notificationStatus}
        language={language}
      />
    </div>
  );
};

export default App;
