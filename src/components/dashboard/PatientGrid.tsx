import React from 'react';
import { 
  Circle, 
  Brain, 
  Activity, 
  Stethoscope, 
  User, 
  Clock, 
  Smartphone,
  Pencil,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Patient, RiskFlag, EsiLevel } from '@/types';

interface PatientGridProps {
  patients: Patient[];
}

const EsiBadge: React.FC<{ level: EsiLevel }> = ({ level }) => {
  const colors = {
    1: 'bg-cliniq-red border-cliniq-red',
    2: 'bg-orange-600 border-orange-600',
    3: 'bg-cliniq-amber border-cliniq-amber',
    4: 'bg-cliniq-yellow border-cliniq-yellow',
    5: 'bg-cliniq-green border-cliniq-green',
  };

  return (
    <div className={cn("w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold border", colors[level])}>
      {level}
    </div>
  );
};

const ComplaintIcon: React.FC<{ icon: string }> = ({ icon }) => {
  switch (icon) {
    case 'BRAIN': return <Brain className="w-3 h-3 text-cliniq-cyan" />;
    case 'RED_DOT': return <Circle className="w-3 h-3 fill-cliniq-red text-cliniq-red" />;
    case 'DEVICE': return <Smartphone className="w-3 h-3 text-cliniq-cyan" />;
    default: return <Activity className="w-3 h-3 text-cliniq-cyan" />;
  }
};

export const PatientGrid: React.FC<PatientGridProps> = ({ patients }) => {
  return (
    <div className="flex-1 overflow-auto bg-cliniq-navy">
      <table className="w-full text-left border-collapse min-w-[1024px]">
        <thead className="sticky top-0 bg-cliniq-navy z-10">
          <tr className="border-b border-cliniq-surface text-[10px] text-muted-foreground font-bold tracking-widest uppercase">
            <th className="w-1.5 p-0"></th>
            <th className="px-4 py-3">Bed</th>
            <th className="px-4 py-3">Patient</th>
            <th className="px-2 py-3">ESI</th>
            <th className="px-4 py-3">Complaint</th>
            <th className="px-4 py-3">Risk Flags</th>
            <th className="px-4 py-3">Time In</th>
            <th className="px-4 py-3">Next Milestone</th>
            <th className="px-4 py-3">Owner</th>
            <th className="px-4 py-3">AI Assist</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {patients.map((patient) => (
            <tr key={patient.id} className="border-b border-cliniq-surface/50 hover:bg-cliniq-surface/20 transition-colors group">
              <td className={cn(
                "w-1.5 p-0",
                patient.risk_flags.some(f => f.severity === 'critical') ? "bg-cliniq-red" : 
                patient.risk_flags.some(f => f.severity === 'watch') ? "bg-cliniq-amber" : "bg-cliniq-green"
              )}></td>
              
              <td className="px-4 py-4 font-mono font-medium text-white">
                {patient.bed_label || '--'}
              </td>
              
              <td className="px-4 py-4">
                <div className="flex flex-col">
                  <span className="text-white font-bold">{patient.initials}</span>
                  <span className="text-[10px] text-muted-foreground">{patient.age} {patient.gender}</span>
                </div>
              </td>
              
              <td className="px-2 py-4">
                <EsiBadge level={patient.esi_level} />
              </td>
              
              <td className="px-4 py-4">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-cliniq-surface/60 rounded border border-cliniq-surface group-hover:border-cliniq-cyan/30 transition-colors">
                  <ComplaintIcon icon={patient.complaint_icon} />
                  <span className="text-[11px] font-bold text-slate-200 uppercase whitespace-nowrap">
                    {patient.chief_complaint}
                  </span>
                </div>
              </td>
              
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-1">
                  {patient.risk_flags.map((flag, i) => (
                    <Badge key={i} className={cn(
                      "text-[9px] px-1.5 py-0 rounded font-bold border",
                      flag.color === 'red' ? "bg-cliniq-red/10 text-cliniq-red border-cliniq-red/30" :
                      flag.color === 'amber' ? "bg-cliniq-amber/10 text-cliniq-amber border-cliniq-amber/30" :
                      "bg-cliniq-yellow/10 text-cliniq-yellow border-cliniq-yellow/30"
                    )}>
                      {flag.label}
                    </Badge>
                  ))}
                </div>
              </td>
              
              <td className="px-4 py-4">
                <div className="flex flex-col">
                  <span className={cn(
                    "font-mono text-sm font-bold",
                    patient.milestone_overdue ? "text-cliniq-red" : "text-cliniq-green"
                  )}>
                    {new Date(patient.arrived_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>
                  {patient.milestone_overdue && <span className="text-[9px] font-bold text-cliniq-red uppercase">Overdue</span>}
                </div>
              </td>
              
              <td className="px-4 py-4">
                <div className="flex flex-col leading-tight max-w-[150px]">
                  <span className="text-[11px] font-bold text-white truncate">{patient.next_milestone_text}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    ≈ {new Date(patient.next_milestone_eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>
                </div>
              </td>
              
              <td className="px-4 py-4">
                <Badge className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-bold",
                  patient.owner_role === 'MD' ? "bg-blue-600/20 text-blue-400 border-blue-500/30" :
                  patient.owner_role === 'PA' ? "bg-cliniq-green/20 text-cliniq-green border-cliniq-green/30" :
                  patient.owner_role === 'RN' ? "bg-purple-600/20 text-purple-400 border-purple-500/30" :
                  "bg-cliniq-navy border-cliniq-cyan/30 text-cliniq-cyan"
                )}>
                  {patient.owner_role}
                </Badge>
              </td>
              
              <td className="px-4 py-4">
                <button className="flex items-center gap-1.5 px-3 py-1 bg-cliniq-navy border border-cliniq-cyan/50 hover:bg-cliniq-cyan/10 rounded text-[10px] font-bold text-cliniq-cyan uppercase tracking-wider transition-all">
                  <Activity className="w-3 h-3" />
                  Assist
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
