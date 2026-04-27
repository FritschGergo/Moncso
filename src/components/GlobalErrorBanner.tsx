import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle } from 'lucide-react';

export default function GlobalErrorBanner() {
  const { globalError } = useAuth();

  if (!globalError) return null;

  return (
    <div className="bg-red-600 text-white py-3 px-4 flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top duration-500 sticky top-0 z-[100] shadow-lg">
      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
      <div className="text-sm font-bold flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-center sm:text-left">
        <span>{globalError}</span>
        <span className="font-normal opacity-90 text-xs sm:text-sm">
          Ellenőrizd a Firebase konzolt, az Email/Jelszó szolgáltatást és a szabályokat.
        </span>
      </div>
    </div>
  );
}
