import React from 'react';
import { Eye, Sun, Moon, Settings } from 'lucide-react';
import { LANGUAGES } from '../constants';
import type { Theme, Language, ArduinoStatus, CallStatus } from '../types';
import CallStatusToast from './CallStatusToast';

interface HeaderProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  arduinoStatus: ArduinoStatus;
  setArduinoStatus: (status: ArduinoStatus) => void;
  onOpenConfig: () => void;
  callStatus: CallStatus;
  lastCalledNumber: string;
}

const Header: React.FC<HeaderProps> = ({
  theme,
  setTheme,
  language,
  setLanguage,
  arduinoStatus,
  setArduinoStatus,
  onOpenConfig,
  callStatus,
  lastCalledNumber,
}) => {
  return (
    <header className="w-full p-4 flex items-center justify-between bg-light-card-bg/80 dark:bg-dark-card-bg/80 backdrop-blur-sm sticky top-0 z-50 border-b border-light-card-border dark:border-dark-card-border">
      <div className="flex items-center gap-3">
        <Eye className="w-8 h-8 text-accent-cyan" />
        <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">EyesTalk</h1>
      </div>
      
      <div className="flex items-center gap-4 md:gap-6">
        <CallStatusToast status={callStatus} phoneNumber={lastCalledNumber} />

        <button
          onClick={onOpenConfig}
          className="p-2 rounded-full hover:bg-light-bg dark:hover:bg-dark-bg"
          aria-label="Open settings"
        >
          <Settings className="w-6 h-6 text-dark-text-secondary" />
        </button>

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full hover:bg-light-bg dark:hover:bg-dark-bg"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-purple-400" />}
        </button>

        <div className="relative">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-transparent text-lg appearance-none cursor-pointer pr-8 py-1"
            aria-label="Select language"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.id} value={lang.id} className="bg-light-card-bg dark:bg-dark-card-bg">
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
            <div 
              className="flex items-center gap-2"
              title={`Arduino connection status: ${arduinoStatus}`}
            >
                <div className={`w-3 h-3 rounded-full ${arduinoStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}></div>
                <span className="hidden md:inline text-sm font-medium">
                    {arduinoStatus === 'connected' ? 'Connected' : 'Disconnected'}
                </span>
            </div>
            {arduinoStatus === 'disconnected' && (
                <button 
                    onClick={() => setArduinoStatus('connected')}
                    className="ml-2 px-3 py-1 text-sm font-semibold text-dark-bg bg-accent-green rounded-md hover:opacity-90 transition-opacity"
                >
                    Connect
                </button>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;