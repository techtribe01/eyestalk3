import type { ComponentType } from 'react';

export type Theme = 'light' | 'dark' | 'auto';
export type Language = 'english' | 'hindi' | 'tamil' | 'telugu';
export type AppMode = 'navigation' | 'entertainment';
export type ArduinoStatus = 'connected' | 'disconnected';
export type CallStatus = 'idle' | 'calling' | 'success' | 'error';

export interface MenuItemData {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  icon: ComponentType<{ className?: string }>;
}

export interface LanguageOption {
  id: Language;
  name: string;
  flag: string;
}

export interface TwilioConfig {
    accountSid: string;
    authToken: string;
    twilioPhoneNumber: string;
    caregiverPhoneNumber: string;
}