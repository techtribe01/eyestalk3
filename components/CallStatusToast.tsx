import React from 'react';
import { Phone, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { CallStatus } from '../types';

interface CallStatusToastProps {
  status: CallStatus;
  phoneNumber: string;
}

const CallStatusToast: React.FC<CallStatusToastProps> = ({ status, phoneNumber }) => {
  if (status === 'idle') {
    return null;
  }

  const getStatusInfo = () => {
    switch (status) {
      case 'calling':
        return {
          icon: <Phone className="w-5 h-5 animate-pulse" />,
          text: `Calling...`,
          bgColor: 'bg-blue-500',
        };
      case 'success':
         const maskedNumber = phoneNumber ? `${phoneNumber.slice(0, -4)}****` : '';
        return {
          icon: <CheckCircle2 className="w-5 h-5" />,
          text: `Called ${maskedNumber}`,
          bgColor: 'bg-accent-green',
        };
      case 'error':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          text: 'Call Failed',
          bgColor: 'bg-red-500',
        };
      default:
        return null;
    }
  };

  const info = getStatusInfo();

  if (!info) return null;

  return (
    <div 
        className={`fixed top-20 right-4 flex items-center gap-3 px-4 py-2 rounded-lg text-white font-semibold shadow-lg z-[200] transition-all duration-300 animate-slide-in ${info.bgColor}`}
    >
      {info.icon}
      <span>{info.text}</span>
      <style>{`
          @keyframes slide-in {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
          }
          .animate-slide-in {
              animation: slide-in 0.3s ease-out forwards;
          }
      `}</style>
    </div>
  );
};

export default CallStatusToast;