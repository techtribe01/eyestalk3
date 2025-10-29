import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MENU_ITEMS } from './constants';
import type { Theme, Language, AppMode, ArduinoStatus, MenuItemData, TwilioConfig, CallStatus } from './types';
import Header from './components/Header';
import MainMenu from './components/MainMenu';
import EntertainmentMode from './components/EntertainmentMode';
import SelectionModal from './components/SelectionModal';
import HowItWorks from './components/HowItWorks';
import InitializingScreen from './components/InitializingScreen';
import ConfigModal from './components/ConfigModal';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'dark');
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('language') as Language) || 'english');
  const [arduinoStatus, setArduinoStatus] = useState<ArduinoStatus>('disconnected');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [appMode, setAppMode] = useState<AppMode>('navigation');
  const [modalItem, setModalItem] = useState<MenuItemData | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isNotifying, setIsNotifying] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [lastCalledNumber, setLastCalledNumber] = useState('');

  const audioRef = useRef<HTMLAudioElement>(new Audio());

  const sendCaregiverNotification = async (item: MenuItemData, language: Language): Promise<boolean> => {
    console.log("--- Sending Caregiver Notification ---");
    const configString = localStorage.getItem('twilioConfig');
    if (!configString) {
      console.warn("Twilio config not found. Opening settings modal.");
      setIsConfigModalOpen(true);
      return false;
    }

    const config: TwilioConfig = JSON.parse(configString);
    if (!config.accountSid || !config.authToken || !config.twilioPhoneNumber || !config.caregiverPhoneNumber) {
        console.warn("Twilio config is incomplete. Opening settings modal.");
        setIsConfigModalOpen(true);
        return false;
    }
    
    setCallStatus('calling');
    setLastCalledNumber(config.caregiverPhoneNumber);
    
    const API_ENDPOINT = 'http://localhost:4000/send-voice-alert';

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            menuItem: item.id, 
            language,
            caregiverPhone: config.caregiverPhoneNumber,
            // In a real app, you would not send the auth token to your own backend this way
            // The backend would have its own auth mechanism. For this demo, we assume the backend is trusted.
            // But we are not sending SID/Token to backend. Backend uses its own .env.
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Network response was not ok: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log("Backend response:", result);
      setCallStatus('success');
      return true;

    } catch (error) {
      console.error("Failed to send notification via backend:", error);
      setCallStatus('error');
      return false;
    } finally {
        setTimeout(() => setCallStatus('idle'), 3000); // Reset status after 3 seconds
    }
  };


  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const handleError = () => {
        const urlParts = audio.src.split('/');
        const fileName = urlParts[urlParts.length - 1];
        if (fileName) {
          console.warn(`Audio file not found or failed to load: ${fileName}`);
        }
    };
    audio.addEventListener('error', handleError);
    return () => {
        audio.removeEventListener('error', handleError);
    };
  }, []);

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

  const playAudio = useCallback((fileName: string) => {
    const audio = audioRef.current;
    if (audio.src.endsWith(fileName) && !audio.paused) return; // Don't interrupt if same sound is playing
    audio.pause();
    audio.src = `/audio/${fileName}`;
    audio.volume = 0.8;
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            if (error.name === 'AbortError') {
                // This is an expected error when navigation is fast. We can safely ignore it.
            } else {
                console.error(`Error playing audio ${fileName}:`, error);
            }
        });
    }
  }, []);

  const handleNavigateNext = useCallback(() => {
    setSelectedIndex(prevIndex => {
      const newIndex = (prevIndex + 1) % MENU_ITEMS.length;
      const item = MENU_ITEMS[newIndex];
      playAudio(`${item.id}_${language}.mp3`);
      return newIndex;
    });
  }, [language, playAudio]);
  
  const handleCloseModal = useCallback(() => {
    setModalItem(null);
    setIsNotifying(false);
    setTimeout(() => {
        setSelectedIndex(0);
        const firstItem = MENU_ITEMS[0];
        playAudio(`${firstItem.id}_${language}.mp3`);
    }, 200);
  }, [language, playAudio]);

  const handleSelect = useCallback(async () => {
    const item = MENU_ITEMS[selectedIndex];
    playAudio(`${item.id}_selected_${language}.mp3`);
    console.log(`[${new Date().toISOString()}] Selected: ${item.name[language]}`);

    if (item.id === 'entertainment') {
      setAppMode('entertainment');
    } else {
      setModalItem(item);
      setIsNotifying(true);
      await sendCaregiverNotification(item, language);
      setIsNotifying(false);
    }
  }, [selectedIndex, language, playAudio]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (appMode !== 'navigation' || modalItem || isConfigModalOpen) return;

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
  }, [appMode, modalItem, isConfigModalOpen, handleNavigateNext, handleSelect]);

  const handleExitEntertainment = () => {
    setAppMode('navigation');
    setSelectedIndex(0);
     setTimeout(() => {
        const item = MENU_ITEMS[0];
        playAudio(`${item.id}_${language}.mp3`);
     }, 200);
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
        onOpenConfig={() => setIsConfigModalOpen(true)}
        callStatus={callStatus}
        lastCalledNumber={lastCalledNumber}
      />
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        {appMode === 'navigation' ? (
          <MainMenu selectedIndex={selectedIndex} language={language} />
        ) : (
          <EntertainmentMode onExit={handleExitEntertainment} />
        )}
      </main>
      {appMode === 'navigation' && <HowItWorks />}
      {modalItem && (
        <SelectionModal 
            item={modalItem}
            language={language}
            onClose={handleCloseModal}
            isSending={isNotifying}
        />
      )}
      {isConfigModalOpen && (
        <ConfigModal onClose={() => setIsConfigModalOpen(false)} />
      )}
    </div>
  );
};

export default App;