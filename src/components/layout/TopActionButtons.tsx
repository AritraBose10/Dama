import React from 'react';
import { Play, ClipboardList, Share2 } from 'lucide-react';

export const TopActionButtons: React.FC = () => {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-cliniq-navy">
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
