'use client';

import React from 'react';
import { X, Activity, Clock, ShieldAlert, User, Bed, AlertTriangle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Patient, RiskFlag } from '@/types';
import { useClinicalStore } from '@/hooks/useStore';

interface PatientDetailDrawerProps {
  patients: Patient[];
}

const severityColor: Record<RiskFlag['color'], string> = {
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const statusColor: Record<string, string> = {
  WAITING: 'text-cliniq-cyan',
  ROOMED: 'text-blue-400',
  BOARDING: 'text-orange-400',
  DISPO_READY: 'text-green-400',
  DISCHARGED: 'text-muted-foreground',
};

const esiColors: Record<number, string> = {
  1: 'bg-red-500 text-white',
  2: 'bg-orange-500 text-white',
  3: 'bg-amber-500 text-cliniq-navy',
  4: 'bg-green-500 text-white',
  5: 'bg-cliniq-surface text-muted-foreground',
};

export const PatientDetailDrawer: React.FC<PatientDetailDrawerProps> = ({ patients }) => {
  const selectedPatientId = useClinicalStore(state => state.selectedPatientId);
  const setSelectedPatientId = useClinicalStore(state => state.setSelectedPatientId);

  const patient = patients.find(p => p.id === selectedPatientId);
  const isOpen = !!patient;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedPatientId(null)}
        />
      )}

      {/* Drawer */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-[420px] z-50 bg-cliniq-navy border-l border-cliniq-surface flex flex-col",
        "transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {patient && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-cliniq-surface shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cliniq-surface flex items-center justify-center text-sm font-bold text-cliniq-cyan">
                  {patient.initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{patient.initials}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    {patient.age}{patient.gender} · {patient.bed_label}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatientId(null)}
                className="p-1.5 rounded-lg hover:bg-cliniq-surface text-muted-foreground hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

              {/* Status + ESI */}
              <div className="flex items-center gap-3">
                <span className={cn("px-2.5 py-1 rounded text-[11px] font-bold", esiColors[patient.esi_level])}>
                  ESI {patient.esi_level}
                </span>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cliniq-cyan" />
                  <span className={cn("text-xs font-bold uppercase tracking-wider", statusColor[patient.status] || 'text-white')}>
                    {patient.status.replace('_', ' ')}
                  </span>
                </div>
                {patient.source && (
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-cliniq-surface/60 text-muted-foreground uppercase">
                    {patient.source}
                  </span>
                )}
              </div>

              {/* Chief Complaint */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Chief Complaint</div>
                <div className="text-sm text-white font-medium leading-relaxed">{patient.chief_complaint}</div>
                <div className="text-[10px] text-muted-foreground">{patient.complaint_category}</div>
              </div>

              {/* Risk Flags */}
              {patient.risk_flags?.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldAlert className="w-3 h-3" />
                    Risk Flags
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.risk_flags.map((flag, i) => (
                      <span
                        key={i}
                        className={cn("px-2 py-0.5 rounded border text-[10px] font-bold", severityColor[flag.color])}
                      >
                        {flag.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sepsis Watch */}
              {patient.sepsis_watch && (
                <div className="p-3 rounded-xl border border-red-500/40 bg-red-500/10 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-red-400 fill-red-400" />
                  <div>
                    <div className="text-[11px] font-black text-red-400 uppercase tracking-wider">Sepsis Watch Active</div>
                    {patient.sepsis_bundle_started_at && (
                      <div className="text-[10px] text-red-400/70">
                        Bundle started {new Date(patient.sepsis_bundle_started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Next Milestone */}
              <div className="p-3 rounded-xl bg-cliniq-surface/40 border border-cliniq-surface/60 space-y-1">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  Next Milestone
                </div>
                <div className="text-sm font-bold text-cliniq-cyan">{patient.next_milestone_text}</div>
                {patient.next_milestone_eta && (
                  <div className={cn("text-[10px] font-medium", patient.milestone_overdue ? 'text-red-400' : 'text-muted-foreground')}>
                    ETA {patient.next_milestone_eta}
                    {patient.milestone_overdue && ' · OVERDUE'}
                  </div>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-cliniq-surface/30 border border-cliniq-surface/50 space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Provider
                  </div>
                  <div className="text-sm font-bold text-white uppercase">{patient.owner_role}</div>
                </div>
                <div className="p-3 rounded-xl bg-cliniq-surface/30 border border-cliniq-surface/50 space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                    <Bed className="w-3 h-3" />
                    Bed
                  </div>
                  <div className="text-sm font-bold text-white">{patient.bed_label || '—'}</div>
                </div>
                <div className="p-3 rounded-xl bg-cliniq-surface/30 border border-cliniq-surface/50 space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Anticoag</div>
                  <div className={cn(
                    "text-sm font-bold uppercase",
                    patient.anticoag_status === 'CONFIRMED' ? 'text-red-400' :
                    patient.anticoag_status === 'UNKNOWN' ? 'text-amber-400' : 'text-green-400'
                  )}>
                    {patient.anticoag_status}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-cliniq-surface/30 border border-cliniq-surface/50 space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Risk Score</div>
                  <div className={cn(
                    "text-sm font-bold",
                    patient.risk_score >= 80 ? 'text-red-400' :
                    patient.risk_score >= 60 ? 'text-orange-400' :
                    patient.risk_score >= 40 ? 'text-amber-400' : 'text-cliniq-cyan'
                  )}>
                    {Math.round(patient.risk_score)}
                  </div>
                </div>
              </div>

              {/* Arrived */}
              <div className="text-[10px] text-muted-foreground border-t border-cliniq-surface/40 pt-3">
                Arrived {new Date(patient.arrived_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                {patient.dispo_prediction_mins && ` · Est. dispo in ${patient.dispo_prediction_mins}m`}
              </div>

              {/* AI Suggestion */}
              {patient.ai_suggestion && (
                <div className="p-3 rounded-xl border border-cliniq-cyan/20 bg-cliniq-cyan/5 space-y-1">
                  <div className="text-[10px] font-bold text-cliniq-cyan uppercase tracking-widest">AI Suggestion</div>
                  <p className="text-xs text-cliniq-white/80 leading-relaxed">{patient.ai_suggestion}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};
