import React, { useEffect } from 'react';
import { CheckCircle2, Loader } from 'lucide-react';
import type { MenuItemData, Language } from '../types';

interface SelectionModalProps {
  item: MenuItemData;
  language: Language;
  onClose: () => void;
  isSending: boolean;
}

const SelectionModal: React.FC<SelectionModalProps> = ({ item, language, onClose, isSending }) => {
  useEffect(() => {
    if (isSending) return; // Don't start the auto-close timer while sending

    const timer = setTimeout(() => {
      onClose();
    }, 2500); // Auto-close after 2.5 seconds

    return () => clearTimeout(timer);
  }, [isSending, onClose]);

  const Icon = item.icon;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out" style={{'animation': 'fadeIn 0.3s ease-out'}}>
        <div className="bg-light-card-bg dark:bg-dark-card-bg rounded-2xl p-8 flex flex-col items-center gap-4 text-center shadow-2xl max-w-sm w-full mx-4" style={{'animation': 'zoomIn 0.3s ease-out'}}>
            {isSending ? (
                <Loader className="w-16 h-16 text-accent-cyan animate-spin" />
            ) : (
                <CheckCircle2 className="w-16 h-16 text-accent-green" />
            )}

            <h2 className="text-3xl font-bold text-light-text dark:text-dark-text">
                {item.name[language]} {isSending ? '' : 'Selected'}
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
                {isSending ? 'Sending request to caregiver...' : 'Request has been sent to the caregiver.'}
            </p>
        </div>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes zoomIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
    </div>
  );
};

export default SelectionModal;