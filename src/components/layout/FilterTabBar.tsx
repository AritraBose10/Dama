import React from 'react';
import { cn } from '@/lib/utils';
import { useClinicalStore } from '@/hooks/useStore';

export type FilterTab = 
  | 'ALL PATIENTS' 
  | 'ESI 1-2'
  | 'WAITING ROOM' 
  | 'TOP RISK' 
  | 'FAST TRACK' 
  | 'MY PATIENTS' 
  | 'BOARDING' 
  | 'DISPO READY' 
  | 'DISCHARGED'
  | 'NOTIFICATIONS';

const tabs: FilterTab[] = [
  'ALL PATIENTS',
  'ESI 1-2',
  'WAITING ROOM',
  'TOP RISK',
  'FAST TRACK',
  'MY PATIENTS',
  'BOARDING',
  'DISPO READY',
  'DISCHARGED',
  'NOTIFICATIONS'
];

export const FilterTabBar: React.FC = () => {
  const { activeTab, setActiveTab } = useClinicalStore();

  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-cliniq-navy border-b border-cliniq-surface overflow-x-auto no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={cn(
            "px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all whitespace-nowrap",
            activeTab === tab
              ? "bg-cliniq-cyan text-cliniq-navy shadow-[0_0_12px_rgba(34,211,238,0.3)]"
              : "text-muted-foreground hover:text-white hover:bg-cliniq-surface/50"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};
