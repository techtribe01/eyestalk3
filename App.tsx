import React, { useState, useEffect, useCallback } from 'react';
import { MENU_ITEMS } from './constants';
import type { Theme, Language, AppMode, ArduinoStatus, MenuItemData } from './types';
import Header from './components/Header';
import MainMenu from './components/MainMenu';
import EntertainmentMode from './components/EntertainmentMode';
import HowItWorks from './components/HowItWorks';
import InitializingScreen from './components/InitializingScreen';
import SelectionModal from './components/SelectionModal';

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
  const [selectedItem, setSelectedItem] = useState<MenuItemData | null>(null);
  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('ttsEnabled');
    // Default to true for better accessibility
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
    if (isInitializing || selectedItem || appMode !== 'navigation') {
      window.speechSynthesis?.cancel();
      return;
    }
    const currentItem = MENU_ITEMS[selectedIndex];
    speak(currentItem.name[language], language, isTtsEnabled);
  }, [selectedIndex, language, isTtsEnabled, isInitializing, selectedItem, appMode]);

  const handleNavigateNext = useCallback(() => {
    if (selectedItem) return;
    setSelectedIndex(prevIndex => (prevIndex + 1) % MENU_ITEMS.length);
  }, [selectedItem]);

  const handleSelect = useCallback(async () => {
    if (selectedItem) return;
    const item = MENU_ITEMS[selectedIndex];
    console.log(`[${new Date().toISOString()}] Selected: ${item.name[language]}`);

    const sentText: Record<Language, string> = {
      english: "Request Sent",
      hindi: "अनुरोध भेजा गया",
      tamil: "கோரிக்கை அனுப்பப்பட்டது",
      telugu: "అభ్యర్థన పంపబడింది"
    };
    speak(`${item.name[language]}. ${sentText[language]}`, language, isTtsEnabled);

    if (item.id === 'entertainment') {
      setAppMode('entertainment');
    } else {
       setSelectedItem(item);
    }
  }, [selectedIndex, language, selectedItem, isTtsEnabled]);
  
  const handleCloseSelectionModal = () => {
    setSelectedItem(null);
    setSelectedIndex(0);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedItem) return; // Block input when modal is open
      if (appMode !== 'navigation') return;

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
  }, [appMode, handleNavigateNext, handleSelect, selectedItem]);

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
      {selectedItem && (
        <SelectionModal
          item={selectedItem}
          language={language}
          onClose={handleCloseSelectionModal}
        />
      )}
    </div>
  );
};

export default App;