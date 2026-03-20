import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePatients } from '@/hooks/usePatients';

interface PatientCardProps {
  rank?: number;
  initials: string;
  bedLabel: string;
  summary: string;
  type: 'risk' | 'dispo';
  source?: string;
}

export const PatientCard: React.FC<PatientCardProps> = ({ rank, initials, bedLabel, summary, type, source }) => {
  const isRisk = type === 'risk';
  
  return (
    <div className={cn(
      "w-64 h-20 rounded border flex overflow-hidden shrink-0",
      isRisk ? "bg-cliniq-surface border-cliniq-red/30" : "bg-cliniq-surface border-cliniq-green/30"
    )}>
      <div className={cn(
        "w-10 flex items-center justify-center shrink-0",
        isRisk ? "bg-cliniq-red/20" : "bg-cliniq-green/20"
      )}>
        {isRisk ? (
          <div className="w-6 h-6 rounded-full border border-cliniq-red flex items-center justify-center">
            <span className="text-cliniq-red text-xs font-bold">{rank}</span>
          </div>
        ) : (
          <ArrowRight className="text-cliniq-green w-5 h-5" />
        )}
      </div>
      
      <div className="flex-1 p-2 flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-sm tracking-wide">{initials}</span>
          {source && source !== 'CLINIQ' && (
            <span className="text-[8px] px-1 py-0 bg-cliniq-cyan/10 text-cliniq-cyan border border-cliniq-cyan/20 rounded-full lowercase">
              {source}
            </span>
          )}
          <span className="text-muted-foreground text-[10px] uppercase">{bedLabel}</span>
        </div>
        <p className={cn(
          "text-[10px] truncate-2-lines",
          isRisk ? "text-cliniq-red/90" : "text-cliniq-green/90"
        )}>
          {summary}
        </p>
      </div>
    </div>
  );
};

export const PatientCardContainer: React.FC = () => {
  const { patients } = usePatients();
  
  // Dynamically calculate top 3 risk patients
  const topRisk = [...patients]
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 3);
    
  // Dynamically calculate ready for dispo (DISPO_READY or lower risk)
  const readyDispo = patients
    .filter(p => p.status === 'DISPO_READY')
    .slice(0, 2);

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-cliniq-navy overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-2">
        {topRisk.map((p, i) => (
          <PatientCard 
            key={p.id}
            rank={i + 1} 
            initials={p.initials} 
            bedLabel={p.bed_label || 'WR'} 
            summary={p.chief_complaint} 
            type="risk" 
          />
        ))}
      </div>
      
      {readyDispo.length > 0 && <div className="w-px h-12 bg-cliniq-surface mx-2 shrink-0" />}
      
      <div className="flex items-center gap-2">
        {readyDispo.map(p => (
          <PatientCard 
            key={p.id}
            initials={p.initials} 
            bedLabel={p.bed_label || 'WR'} 
            summary={p.chief_complaint} 
            type="dispo" 
          />
        ))}
      </div>
    </div>
  );
};
