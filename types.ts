import type { ComponentType, CSSProperties } from 'react';

export type Theme = 'light' | 'dark' | 'auto';
export type Language = 'english' | 'hindi' | 'tamil' | 'telugu';
export type AppMode = 'navigation' | 'entertainment';
export type ArduinoStatus = 'connected' | 'disconnected';

export interface MenuItemData {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  icon: ComponentType<{ className?: string; style?: CSSProperties }>;
}

export interface LanguageOption {
  id: Language;
  name: string;
  flag: string;
}