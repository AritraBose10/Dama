'use client';

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
  Monitor,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Patient, EsiLevel } from '@/types';
import { usePatients } from '@/hooks/usePatients';
import { useClinicalStore } from '@/hooks/useStore';
import { NotificationList } from './NotificationList';

const EsiBadge: React.FC<{ level: EsiLevel }> = ({ level }) => {
  const colors = {
    1: 'bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]',
    2: 'bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]',
    3: 'bg-amber-500 text-cliniq-navy font-bold',
    4: 'bg-green-500 text-white',
    5: 'bg-cliniq-surface text-muted-foreground'
  };

  return (
    <span className={cn(
      "px-2 py-0.5 rounded text-[10px] font-bold shrink-0",
      colors[level] || colors[5]
    )}>
      ESI {level}
    </span>
  );
};

const RiskScoreIndicator: React.FC<{ score: number }> = ({ score }) => {
  const getColor = (s: number) => {
    if (s >= 80) return 'text-red-500';
    if (s >= 60) return 'text-orange-500';
    if (s >= 40) return 'text-amber-500';
    return 'text-cliniq-cyan';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-cliniq-surface rounded-full overflow-hidden min-w-[40px]">
        <div 
          className={cn("h-full transition-all duration-500", getColor(score).replace('text-', 'bg-'))}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={cn("text-[10px] font-bold font-mono min-w-[24px]", getColor(score))}>
        {Math.round(score)}
      </span>
    </div>
  );
};

export const PatientGrid: React.FC = () => {
  const { patients, isLoading } = usePatients();
  const setSelectedPatientId = useClinicalStore(state => state.setSelectedPatientId);
  const activeTab = useClinicalStore(state => state.activeTab);

  const filteredPatients = patients.filter((p: Patient) => {
    if (activeTab === 'ALL PATIENTS' || activeTab === 'NOTIFICATIONS') return true;
    if (activeTab === 'WAITING ROOM') return p.status === 'WAITING';
    if (activeTab === 'BOARDING') return p.status === 'BOARDING';
    if (activeTab === 'ESI 1-2') return p.esi_level <= 2;
    if (activeTab === 'TOP RISK') return p.risk_score >= 80;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-cliniq-cyan">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cliniq-cyan"></div>
      </div>
    );
  }

  if (activeTab === 'NOTIFICATIONS') {
    return <NotificationList />;
  }

  return (
    <div className="flex-1 overflow-auto bg-cliniq-navy relative border-t border-cliniq-surface">
      <table className="w-full text-left border-collapse min-w-[1024px]">
        <thead className="sticky top-0 bg-cliniq-navy z-10">
          <tr className="border-b border-cliniq-surface text-[10px] text-muted-foreground font-bold tracking-widest uppercase">
            <th className="px-4 py-3 font-bold">Patient</th>
            <th className="px-4 py-3 font-bold text-center">ESI</th>
            <th className="px-4 py-3 font-bold">Room/Bed</th>
            <th className="px-4 py-3 font-bold">Chief Complaint</th>
            <th className="px-4 py-3 font-bold">Status/Next Step</th>
            <th className="px-4 py-3 font-bold">Provider</th>
            <th className="px-4 py-3 font-bold">Risk Score</th>
            <th className="px-4 py-3 font-bold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-cliniq-surface/30">
          {filteredPatients.map((patient: Patient) => (
            <tr 
              key={patient.id}
              onClick={() => setSelectedPatientId(patient.id)}
              className="group hover:bg-cliniq-surface/20 transition-colors cursor-pointer"
            >
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cliniq-surface flex items-center justify-center text-xs font-bold text-cliniq-cyan group-hover:scale-110 transition-transform">
                    {patient.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-bold text-cliniq-white tracking-tight">{patient.name || patient.initials}</div>
                      {patient.source && patient.source !== 'CLINIQ' && (
                        <span className="text-[8px] px-1 py-0 bg-cliniq-cyan/10 text-cliniq-cyan border border-cliniq-cyan/30 rounded lowercase">
                          {patient.source}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                      {patient.age}{patient.gender} • ARR {new Date(patient.arrived_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-center">
                <EsiBadge level={patient.esi_level} />
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cliniq-cyan animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                  <span className="text-sm font-bold text-cliniq-white">{patient.bed_label}</span>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-3 h-3 text-red-500" />
                  <span className="text-xs font-medium text-cliniq-white max-w-[150px] truncate">
                    {patient.chief_complaint}
                  </span>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 text-cliniq-cyan" />
                    <span className="text-xs font-bold text-cliniq-cyan uppercase tracking-wider">{patient.status}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-medium truncate max-w-[180px]">
                    {patient.next_milestone_text} {patient.next_milestone_eta && `• ETA ${patient.next_milestone_eta}`}
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-cliniq-surface/50 flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase">
                    MD
                  </div>
                  <span className="text-xs font-medium text-cliniq-white uppercase">{patient.owner_role}</span>
                </div>
              </td>
              <td className="px-4 py-4">
                <RiskScoreIndicator score={patient.risk_score} />
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 hover:bg-cliniq-cyan/20 rounded-lg text-muted-foreground hover:text-cliniq-cyan transition-colors">
                    <Smartphone className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 hover:bg-cliniq-cyan/20 rounded-lg text-muted-foreground hover:text-cliniq-cyan transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 hover:bg-cliniq-cyan/20 rounded-lg text-muted-foreground hover:text-cliniq-cyan transition-colors">
                    <Monitor className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
