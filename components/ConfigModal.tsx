import React, { useState, useEffect, useCallback } from 'react';
import { X, Save, TestTube2, Trash2 } from 'lucide-react';
import type { TwilioConfig } from '../types';

interface ConfigModalProps {
  onClose: () => void;
}

const InputField: React.FC<{id: keyof TwilioConfig, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string, type?: string}> = 
  ({ id, label, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">{label}</label>
    <input
      id={id}
      name={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-card-border dark:border-dark-card-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-cyan"
    />
  </div>
);

const ConfigModal: React.FC<ConfigModalProps> = ({ onClose }) => {
  const [config, setConfig] = useState<TwilioConfig>({
    accountSid: '',
    authToken: '',
    twilioPhoneNumber: '',
    caregiverPhoneNumber: '',
  });

  useEffect(() => {
    const savedConfig = localStorage.getItem('twilioConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    localStorage.setItem('twilioConfig', JSON.stringify(config));
    alert('Configuration saved!');
    onClose();
  };
  
  const handleClear = () => {
      if (window.confirm("Are you sure you want to clear all stored credentials?")) {
          localStorage.removeItem('twilioConfig');
          setConfig({ accountSid: '', authToken: '', twilioPhoneNumber: '', caregiverPhoneNumber: '' });
          alert('Credentials cleared.');
      }
  }
  
  const handleTestCall = () => {
      // In a real app, this would trigger a call to a test endpoint.
      // For now, we'll just check if the number is valid-looking.
      if (config.caregiverPhoneNumber && config.caregiverPhoneNumber.startsWith('+')) {
          alert(`A test call would be sent to ${config.caregiverPhoneNumber}. Please ensure your backend is running.`);
      } else {
          alert('Please enter a valid caregiver phone number in E.164 format (e.g., +14155552671) and save.');
      }
  }

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
      <div className="bg-light-card-bg dark:bg-dark-card-bg rounded-2xl p-6 md:p-8 shadow-2xl max-w-md w-full mx-4 relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-dark-text-secondary hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4">Twilio Configuration</h2>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-6">
          Enter your credentials to enable voice call notifications. These are stored only in your browser.
        </p>
        <div className="space-y-4">
          <InputField id="accountSid" label="Twilio Account SID" value={config.accountSid} onChange={handleChange} placeholder="AC..." />
          <InputField id="authToken" label="Twilio Auth Token" value={config.authToken} onChange={handleChange} placeholder="Your auth token" type="password" />
          <InputField id="twilioPhoneNumber" label="Twilio Phone Number" value={config.twilioPhoneNumber} onChange={handleChange} placeholder="+15017122661" />
          <InputField id="caregiverPhoneNumber" label="Caregiver Phone Number" value={config.caregiverPhoneNumber} onChange={handleChange} placeholder="+917093035732" />
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-2">
            <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 w-full px-4 py-2 bg-accent-green text-dark-bg font-bold rounded-md hover:opacity-90 transition-opacity">
                <Save size={18} /> Save
            </button>
            <button onClick={handleTestCall} className="flex-1 flex items-center justify-center gap-2 w-full px-4 py-2 bg-accent-cyan text-dark-bg font-bold rounded-md hover:opacity-90 transition-opacity">
                <TestTube2 size={18} /> Test Call
            </button>
            <button onClick={handleClear} className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white font-bold rounded-md hover:opacity-90 transition-opacity">
                <Trash2 size={18} />
            </button>
        </div>
      </div>
      <style>{`
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
          }
      `}</style>
    </div>
  );
};

export default ConfigModal;