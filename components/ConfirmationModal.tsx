import React from 'react';
import type { MenuItemData, Language } from '../types';
import { Check, X } from 'lucide-react';

interface ConfirmationModalProps {
  item: MenuItemData;
  language: Language;
  onConfirm: () => void;
  onCancel: () => void;
  highlightedOption: 'yes' | 'no';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ item, language, onConfirm, onCancel, highlightedOption }) => {
  const Icon = item.icon;
  
  const translations = {
      confirm: { english: 'Confirm selection?', hindi: 'चयन की पुष्टि करें?', tamil: 'தேர்வை உறுதிப்படுத்தவா?', telugu: 'ఎంపికను నిర్ధారించాలా?' },
      yes: { english: "Yes", hindi: "हाँ", tamil: "ஆம்", telugu: "అవును" },
      no: { english: "No", hindi: "नहीं", tamil: "இல்லை", telugu: "కాదు" }
  };

  const buttonClasses = (isHighlighted: boolean) => `
    flex items-center justify-center gap-2 w-36 py-3 px-6 rounded-full text-xl font-bold transition-all duration-200 transform 
    ${isHighlighted 
      ? 'scale-110 text-white shadow-lg' 
      : 'bg-light-bg dark:bg-dark-bg text-light-text-secondary dark:text-dark-text-secondary'}
  `;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] animate-fade-in">
      <div className="bg-light-card-bg dark:bg-dark-card-bg rounded-3xl p-8 md:p-12 shadow-2xl w-full max-w-md mx-4 flex flex-col items-center gap-6 animate-scale-in">
        <Icon className="w-20 h-20 text-accent-cyan" />
        <h2 className="text-3xl md:text-4xl font-bold text-center text-light-text dark:text-dark-text">
          {item.name[language]}
        </h2>
        <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary">
          {translations.confirm[language]}
        </p>

        <div className="flex items-center justify-center gap-8 mt-4">
            <button 
              className={buttonClasses(highlightedOption === 'yes')}
              style={{
                backgroundColor: highlightedOption === 'yes' ? '#22C55E' : undefined,
                boxShadow: highlightedOption === 'yes' ? '0 0 20px #22C55E' : undefined,
              }}
              onClick={onConfirm}
              aria-label="Confirm"
            >
                <Check className="w-6 h-6" />
                {translations.yes[language]}
            </button>
            <button 
              className={buttonClasses(highlightedOption === 'no')}
              style={{
                backgroundColor: highlightedOption === 'no' ? '#EF4444' : undefined,
                boxShadow: highlightedOption === 'no' ? '0 0 20px #EF4444' : undefined,
              }}
              onClick={onCancel}
              aria-label="Cancel"
            >
                <X className="w-6 h-6" />
                {translations.no[language]}
            </button>
        </div>
      </div>
       <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scale-in {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
          }
          .animate-scale-in {
            animation: scale-in 0.3s ease-out forwards;
          }
      `}</style>
    </div>
  );
};

export default ConfirmationModal;
