import React from 'react';
import { CheckCircle2, AlertTriangle, MessageCircleMore } from 'lucide-react';
import { TELEGRAM_STATUS_MESSAGES } from '../constants';
import type { Language, NotificationStatus } from '../types';

interface NotificationStatusToastProps {
  status: NotificationStatus;
  language: Language;
}

const STATUS_CONFIG = {
  sending: {
    icon: MessageCircleMore,
    color: 'text-accent-cyan',
    bgColor: 'bg-accent-cyan/10',
    iconAnimation: 'animate-pulse',
  },
  success: {
    icon: CheckCircle2,
    color: 'text-accent-green',
    bgColor: 'bg-accent-green/10',
    iconAnimation: '',
  },
  error: {
    icon: AlertTriangle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    iconAnimation: '',
  },
};

const NotificationStatusToast: React.FC<NotificationStatusToastProps> = ({ status, language }) => {
  if (status === 'idle') return null;

  const { icon: Icon, color, bgColor, iconAnimation } = STATUS_CONFIG[status];
  const message = TELEGRAM_STATUS_MESSAGES[language][status];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] animate-toast-in">
      <div className={`flex items-center gap-4 py-3 px-6 rounded-2xl shadow-lg border border-light-card-border dark:border-dark-card-border bg-light-card-bg/80 dark:bg-dark-card-bg/80 backdrop-blur-sm ${bgColor}`}>
        <Icon className={`w-6 h-6 ${color} ${iconAnimation}`} />
        <p className={`text-lg font-semibold text-light-text dark:text-dark-text`}>
          {message}
        </p>
      </div>
       <style>{`
          @keyframes toast-in {
            from { opacity: 0; transform: translate(-50%, 20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
          }
          .animate-toast-in {
            animation: toast-in 0.3s ease-out forwards;
          }
      `}</style>
    </div>
  );
};

export default NotificationStatusToast;
