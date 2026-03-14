import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SepsisWatchProps {
  patientInitials: string;
  lactateValue: string;
  bundleClockStartedAt: string;
}

export const SepsisWatch: React.FC<SepsisWatchProps> = ({ 
  patientInitials, 
  lactateValue, 
  bundleClockStartedAt 
}) => {
  const [elapsed, setElapsed] = useState<string>('00:00');

  useEffect(() => {
    const start = new Date(bundleClockStartedAt).getTime();
    
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = now - start;
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      
      setElapsed(`${hours > 0 ? hours + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [bundleClockStartedAt]);

  return (
    <div className="w-64 bg-cliniq-surface rounded border border-cliniq-red/50 p-2 flex items-center gap-3 animate-pulse-subtle">
      <div className="relative">
        <div className="w-3 h-3 rounded-full bg-cliniq-red animate-ping absolute opacity-70" />
        <div className="w-3 h-3 rounded-full bg-cliniq-red relative" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black text-white uppercase tracking-tighter">Sepsis Watch</span>
          <span className="text-[10px] text-cliniq-red font-bold">{patientInitials} — Lacta...</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase">
          <span className="tracking-widest">Bundle clock:</span>
          <span className="text-white font-mono">{elapsed}</span>
        </div>
      </div>
      
      <Zap className="w-4 h-4 fill-cliniq-red text-cliniq-red" />
    </div>
  );
};
