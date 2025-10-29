
import React from 'react';
import { Eye } from 'lucide-react';

const InitializingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-dark-bg flex flex-col items-center justify-center text-white z-50">
        <div className="flex items-center gap-4">
            <Eye className="w-16 h-16 text-accent-cyan animate-pulse" />
            <h1 className="text-5xl font-bold">EyesTalk</h1>
        </div>
        <p className="mt-4 text-lg text-dark-text-secondary animate-pulse">Initializing...</p>
    </div>
  );
};

export default InitializingScreen;
