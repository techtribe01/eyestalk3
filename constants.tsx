
import { UtensilsCrossed, Droplets, Phone, Accessibility, Wind, Tv2 } from 'lucide-react';
import type { MenuItemData, LanguageOption, Language } from './types';

export const MENU_ITEMS: MenuItemData[] = [
  {
    id: 'food',
    name: { english: 'Food', hindi: 'खाना', tamil: 'உணவு', telugu: 'ఆహారం' },
    description: { english: 'Request a meal or snack', hindi: 'भोजन या नाश्ते का अनुरोध करें', tamil: 'உணவு அல்லது சிற்றுண்டி கோருங்கள்', telugu: 'భోజనం లేదా అల్పాహారం అభ్యర్థించండి' },
    icon: UtensilsCrossed,
  },
  {
    id: 'water',
    name: { english: 'Water', hindi: 'पानी', tamil: 'தண்ணீர்', telugu: 'నీరు' },
    description: { english: 'Ask for a drink of water', hindi: 'पानी पीने के लिए कहें', tamil: 'குடிப்பதற்கு தண்ணீர் கேட்கவும்', telugu: 'త్రాగడానికి నీరు అడగండి' },
    icon: Droplets,
  },
  {
    id: 'help',
    name: { english: 'Help', hindi: 'मदद', tamil: 'உதவி', telugu: 'సహాయం' },
    description: { english: 'Call for assistance', hindi: 'सहायता के लिए बुलाएं', tamil: 'உதவிக்கு அழைக்கவும்', telugu: 'సహాయం కోసం కాల్ చేయండి' },
    icon: Phone,
  },
  {
    id: 'outing',
    name: { english: 'Outing', hindi: 'बाहर जाना', tamil: 'வெளிச்செலவு', telugu: 'విహారయాత్ర' },
    description: { english: 'Request to go outside', hindi: 'बाहर जाने का अनुरोध करें', tamil: 'வெளியே செல்லக் கோருங்கள்', telugu: 'బయటికి వెళ్లాలని అభ్యర్థించండి' },
    icon: Accessibility,
  },
  {
    id: 'washroom',
    name: { english: 'Washroom', hindi: 'शौचालय', tamil: 'கழிவறை', telugu: 'వాష్రూమ్' },
    description: { english: 'Request to use the washroom', hindi: 'शौचालय का उपयोग करने का अनुरोध करें', tamil: 'கழிப்பறையைப் பயன்படுத்தக் கோருங்கள்', telugu: 'వాష్రూమ్ ఉపయోగించడానికి అభ్యర్థించండి' },
    icon: Wind,
  },
  {
    id: 'entertainment',
    name: { english: 'Entertainment', hindi: 'मनोरंजन', tamil: 'பொழுதுபோக்கு', telugu: 'వినోదం' },
    description: { english: 'Watch short videos', hindi: 'छोटे वीडियो देखें', tamil: 'குறுகிய வீடியோக்களைப் பார்க்கவும்', telugu: 'చిన్న వీడియోలను చూడండి' },
    icon: Tv2,
  },
];

export const LANGUAGES: LanguageOption[] = [
    { id: 'english', name: 'English', flag: '🇺🇸' },
    { id: 'hindi', name: 'हिंदी', flag: '🇮🇳' },
    { id: 'tamil', name: 'தமிழ்', flag: '🇮🇳' },
    { id: 'telugu', name: 'తెలుగు', flag: '🇮🇳' },
];

export const YOUTUBE_SHORT_IDS = ['h-b8pZXMy-o', 'f49b1a0f9y8', 'jNQXAC9IVRw', 'M3-O2g-oM_k', 'dQw4w9WgXcQ', 'y6120QOlsfU'];

export const ACCENT_COLORS = [
    '#00D9FF', // cyan
    '#22C55E', // green
    '#A78BFA', // purple
    '#FB923C', // orange
    '#EC4899', // pink
];

export const SUCCESS_MESSAGE_SUBTITLE: Record<Language, string> = {
  english: "Request Sent Successfully",
  hindi: "अनुरोध सफलतापूर्वक भेजा गया",
  tamil: "கோரிக்கை வெற்றிகரமாக அனுப்பப்பட்டது",
  telugu: "అభ్యర్థన విజయవంతంగా పంపబడింది",
};
