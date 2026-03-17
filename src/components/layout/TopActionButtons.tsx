import React, { useState, useEffect } from 'react';
import { Play, Square, ClipboardList, Share2, UserPlus, Clock } from 'lucide-react';
import { useClinicalStore } from '@/hooks/useStore';

interface TopActionButtonsProps {
  onAddPatient: () => void;
}

export const TopActionButtons: React.FC<TopActionButtonsProps> = ({ onAddPatient }) => {
  const isShiftActive = useClinicalStore((state) => state.isShiftActive);
  const shiftStartTime = useClinicalStore((state) => state.shiftStartTime);
  const toggleShift = useClinicalStore((state) => state.toggleShift);
  
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isShiftActive && shiftStartTime) {
      interval = setInterval(() => {
        const start = new Date(shiftStartTime).getTime();
        const now = new Date().getTime();
        const diff = now - start;
        
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        
        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isShiftActive, shiftStartTime]);

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-cliniq-navy">
      <button 
        onClick={onAddPatient}
        className="flex items-center gap-2 px-4 py-2 bg-cliniq-cyan hover:bg-cyan-600 text-cliniq-navy text-[11px] font-bold rounded border border-cyan-400/20 transition-colors"
      >
        <UserPlus className="w-3 h-3 fill-cliniq-navy" />
        CHECK-IN PATIENT
      </button>
      
      <div className="w-[1px] h-6 bg-slate-700 mx-2" />
      
      <button 
        onClick={toggleShift}
        className={`flex items-center gap-2 px-4 py-2 border transition-colors text-[11px] font-bold rounded ${
          isShiftActive 
            ? 'bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20' 
            : 'bg-cliniq-surface border-slate-600 text-white hover:bg-slate-700'
        }`}
      >
        {isShiftActive ? (
          <>
            <Square className="w-3 h-3 fill-red-500" />
            END SHIFT
          </>
        ) : (
          <>
            <Play className="w-3 h-3 fill-white" />
            START SHIFT
          </>
        )}
      </button>

      {isShiftActive && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-full animate-in fade-in slide-in-from-left-2 duration-300">
          <Clock className="w-3.5 h-3.5 text-cliniq-cyan" />
          <span className="text-[12px] font-mono font-bold text-white tabular-nums">
            {elapsedTime}
          </span>
        </div>
      )}

      <div className="flex-1" />

      <button className="flex items-center gap-2 px-4 py-2 bg-cliniq-surface hover:bg-slate-700 text-white text-[11px] font-bold rounded border border-slate-600 transition-colors">
        <ClipboardList className="w-3 h-3" />
        PENDING SUMMARY
      </button>
      <button className="flex items-center gap-2 px-4 py-2 bg-cliniq-surface hover:bg-slate-700 text-white text-[11px] font-bold rounded border border-slate-600 transition-colors">
        <Share2 className="w-3 h-3" />
        HANDOFF
      </button>
    </div>
  );
};
