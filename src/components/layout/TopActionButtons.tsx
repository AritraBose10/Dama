import React from 'react';
import { Play, ClipboardList, Share2, UserPlus } from 'lucide-react';

interface TopActionButtonsProps {
  onAddPatient: () => void;
}

export const TopActionButtons: React.FC<TopActionButtonsProps> = ({ onAddPatient }) => {
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
      
      <button className="flex items-center gap-2 px-4 py-2 bg-cliniq-surface hover:bg-slate-700 text-white text-[11px] font-bold rounded border border-slate-600 transition-colors">
        <Play className="w-3 h-3 fill-white" />
        START SHIFT
      </button>
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
