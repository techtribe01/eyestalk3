
import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { MenuItemData, Language } from '../types';

interface SelectionModalProps {
  item: MenuItemData;
  language: Language;
  onClose: () => void;
  successMessage: string;
}

const SelectionModal: React.FC<SelectionModalProps> = ({ item, language, onClose, successMessage }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2500); // Auto-close after 2.5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const Icon = item.icon;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] animate-fade-in">
      <div className="bg-light-card-bg dark:bg-dark-card-bg rounded-3xl p-8 md:p-12 shadow-2xl w-full max-w-sm mx-4 flex flex-col items-center gap-4 animate-scale-in">
        <div className="relative">
            <Icon className="w-24 h-24 text-accent-cyan" />
            <CheckCircle2 className="absolute -bottom-2 -right-2 w-10 h-10 text-accent-green bg-light-card-bg dark:bg-dark-card-bg rounded-full" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-center text-light-text dark:text-dark-text">
          {item.name[language]}
        </h2>
        <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary">
          {successMessage}
        </p>
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

export default SelectionModal;
