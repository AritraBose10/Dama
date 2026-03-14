import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Circle } from 'lucide-react';

interface HeaderStripProps {
  inDept: number;
  esi12: number;
  waiting: number;
  pendingDispo: number;
  doorToDoc: string; // mm:ss
  lwbsRisk: 'LOW' | 'MED' | 'HIGH';
  doctorInitials: string;
}

export const HeaderStrip: React.FC<HeaderStripProps> = ({
  inDept,
  esi12,
  waiting,
  pendingDispo,
  doorToDoc,
  lwbsRisk,
  doctorInitials,
}) => {
  const lwbsColor = {
    LOW: 'text-cliniq-green',
    MED: 'text-cliniq-amber',
    HIGH: 'text-cliniq-red',
  }[lwbsRisk];

  return (
    <div className="h-14 bg-cliniq-navy border-b border-cliniq-surface flex items-center px-4 justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <h1 className="text-cliniq-cyan font-bold text-xl tracking-tight">ED COMMAND</h1>
        
        <div className="flex items-center gap-6 text-sm font-medium">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-[10px] uppercase">In Dept</span>
            <span className="text-cliniq-amber text-lg leading-none">{inDept}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-[10px] uppercase">ESI 1-2</span>
            <span className="text-cliniq-red text-lg leading-none">{esi12}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-[10px] uppercase">Waiting</span>
            <span className="text-cliniq-amber text-lg leading-none">{waiting}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-[10px] uppercase">Pending Dispo</span>
            <span className="text-cliniq-amber text-lg leading-none">{pendingDispo}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-[10px] uppercase">Door-to-Doc</span>
            <span className="text-cliniq-green text-lg leading-none font-mono">{doorToDoc}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-[10px] uppercase">LWBS Risk</span>
            <span className={`text-lg leading-none ${lwbsColor}`}>{lwbsRisk}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-cliniq-surface/50 rounded-full border border-cliniq-ai-green/30">
          <Circle className="w-2 h-2 fill-cliniq-ai-green text-cliniq-ai-green animate-pulse" />
          <span className="text-cliniq-ai-green text-[10px] font-bold tracking-widest uppercase">AI Assist Active</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-cliniq-cyan/20 border border-cliniq-cyan/50 flex items-center justify-center">
          <span className="text-cliniq-cyan font-bold text-sm">DR. {doctorInitials}</span>
        </div>
      </div>
    </div>
  );
};
