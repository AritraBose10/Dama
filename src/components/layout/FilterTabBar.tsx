import React from 'react';
import { cn } from '@/lib/utils';

export type FilterTab = 
  | 'ALL PATIENTS' 
  | 'ESI 1-2' 
  | 'PENDING RESULTS' 
  | 'DISPO READY' 
  | 'WAITING ROOM' 
  | 'Top 5 sick' 
  | 'Fast dispos' 
  | 'Overdue' 
  | 'Handoff';

interface FilterTabBarProps {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
}

const tabs: FilterTab[] = [
  'ALL PATIENTS',
  'ESI 1-2',
  'PENDING RESULTS',
  'DISPO READY',
  'WAITING ROOM',
  'Top 5 sick',
  'Fast dispos',
  'Overdue',
  'Handoff'
];

export const FilterTabBar: React.FC<FilterTabBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-cliniq-navy border-b border-cliniq-surface overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        const isSpecial = ['Top 5 sick', 'Fast dispos'].includes(tab);
        
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={cn(
              "px-4 py-1.5 text-[11px] font-bold tracking-wider uppercase transition-all whitespace-nowrap rounded",
              isActive 
                ? "text-cliniq-cyan border border-cliniq-cyan ring-1 ring-cliniq-cyan/30" 
                : "text-muted-foreground hover:text-foreground hover:bg-cliniq-surface/50",
              isSpecial && !isActive && "text-cliniq-cyan/70"
            )}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
};
