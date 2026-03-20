'use client';

import React from 'react';
import { X, Activity, Clock, ShieldAlert, User, Zap, Tag, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Patient, RiskFlag } from '@/types';
import { useClinicalStore } from '@/hooks/useStore';

interface PatientDetailDrawerProps {
  patients: Patient[];
}

const flagColor: Record<RiskFlag['color'], string> = {
  red:    'bg-red-500/20 text-red-400 border-red-500/30',
  amber:  'bg-amber-500/20 text-amber-400 border-amber-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  green:  'bg-green-500/20 text-green-400 border-green-500/30',
};

const statusColor: Record<string, string> = {
  WAITING:     'text-cliniq-cyan',
  ROOMED:      'text-blue-400',
  BOARDING:    'text-orange-400',
  DISPO_READY: 'text-green-400',
  DISCHARGED:  'text-muted-foreground',
};

const esiColors: Record<number, string> = {
  1: 'bg-red-500 text-white',
  2: 'bg-orange-500 text-white',
  3: 'bg-amber-500 text-cliniq-navy',
  4: 'bg-green-500 text-white',
  5: 'bg-cliniq-surface text-muted-foreground',
};

function fmt(ts?: string) {
  if (!ts) return '—';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function fmtFull(ts?: string) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function InfoRow({ label, value, valueClass }: { label: string; value: React.ReactNode; valueClass?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-cliniq-surface/30 last:border-0">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest shrink-0">{label}</span>
      <span className={cn("text-xs font-medium text-white text-right break-all", valueClass)}>{value ?? '—'}</span>
    </div>
  );
}

export const PatientDetailDrawer: React.FC<PatientDetailDrawerProps> = ({ patients }) => {
  const selectedPatientId = useClinicalStore(state => state.selectedPatientId);
  const setSelectedPatientId = useClinicalStore(state => state.setSelectedPatientId);

  const patient = patients.find(p => p.id === selectedPatientId);
  const isOpen = !!patient;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedPatientId(null)}
        />
      )}

      <div className={cn(
        "fixed top-0 right-0 h-full w-[440px] z-50 bg-cliniq-navy border-l border-cliniq-surface flex flex-col",
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
                    {patient.age}{patient.gender} · {patient.bed_label || patient.bed_id || '—'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", esiColors[patient.esi_level])}>
                  ESI {patient.esi_level}
                </span>
                <button
                  onClick={() => setSelectedPatientId(null)}
                  className="p-1.5 rounded-lg hover:bg-cliniq-surface text-muted-foreground hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">

              {/* ── Status Bar ── */}
              <div className="flex items-center gap-2 flex-wrap px-5 py-3 border-b border-cliniq-surface/50 bg-cliniq-surface/10">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cliniq-cyan" />
                  <span className={cn("text-xs font-bold uppercase tracking-wider", statusColor[patient.status] || 'text-white')}>
                    {patient.status.replace('_', ' ')}
                  </span>
                </div>
                {patient.is_waiting_room && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cliniq-cyan/10 text-cliniq-cyan border border-cliniq-cyan/20">
                    WAITING ROOM
                  </span>
                )}
                {patient.source && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cliniq-surface/60 text-muted-foreground">
                    {patient.source}
                  </span>
                )}
                {patient.sepsis_watch && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-red-400" /> SEPSIS WATCH
                  </span>
                )}
              </div>

              {/* ── Complaint ── */}
              <Section title="Chief Complaint">
                <InfoRow label="Complaint" value={patient.chief_complaint} />
                <InfoRow label="Category" value={patient.complaint_category} />
                <InfoRow label="Icon" value={patient.complaint_icon} />
              </Section>

              {/* ── Risk ── */}
              <Section title="Risk">
                <InfoRow
                  label="Risk Score"
                  value={Math.round(patient.risk_score)}
                  valueClass={
                    patient.risk_score >= 80 ? 'text-red-400 font-bold' :
                    patient.risk_score >= 60 ? 'text-orange-400 font-bold' :
                    patient.risk_score >= 40 ? 'text-amber-400' : 'text-cliniq-cyan'
                  }
                />
                <div className="py-2 border-b border-cliniq-surface/30">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Risk Flags
                  </div>
                  {patient.risk_flags?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {patient.risk_flags.map((flag, i) => (
                        <span key={i} className={cn("px-2 py-0.5 rounded border text-[10px] font-bold", flagColor[flag.color])}>
                          {flag.label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">None</span>
                  )}
                </div>
                <InfoRow label="Anticoag" value={patient.anticoag_status}
                  valueClass={
                    patient.anticoag_status === 'CONFIRMED' ? 'text-red-400 font-bold' :
                    patient.anticoag_status === 'UNKNOWN' ? 'text-amber-400' : 'text-green-400'
                  }
                />
              </Section>

              {/* ── Sepsis ── */}
              {patient.sepsis_watch && (
                <Section title="Sepsis">
                  <InfoRow label="Sepsis Watch" value="ACTIVE" valueClass="text-red-400 font-bold" />
                  <InfoRow label="Bundle Started" value={fmtFull(patient.sepsis_bundle_started_at)} />
                </Section>
              )}

              {/* ── Workflow / Milestones ── */}
              <Section title="Workflow">
                <InfoRow label="Next Milestone" value={patient.next_milestone_text} />
                <InfoRow label="ETA" value={patient.next_milestone_eta || '—'} />
                <InfoRow
                  label="Milestone Overdue"
                  value={patient.milestone_overdue ? 'YES' : 'NO'}
                  valueClass={patient.milestone_overdue ? 'text-red-400 font-bold' : 'text-green-400'}
                />
                <InfoRow label="Dispo Prediction" value={patient.dispo_prediction_mins ? `${patient.dispo_prediction_mins}m` : '—'} />
              </Section>

              {/* ── Provider ── */}
              <Section title="Provider">
                <InfoRow label="Role" value={patient.owner_role} />
                <InfoRow label="User ID" value={patient.owner_user_id || '—'} valueClass="font-mono text-[11px]" />
              </Section>

              {/* ── Location ── */}
              <Section title="Location">
                <InfoRow label="Bed Label" value={patient.bed_label || '—'} />
                <InfoRow label="Bed ID" value={patient.bed_id || '—'} valueClass="font-mono text-[11px]" />
                <InfoRow
                  label="Waiting Room"
                  value={patient.is_waiting_room ? 'YES' : 'NO'}
                  valueClass={patient.is_waiting_room ? 'text-cliniq-cyan' : 'text-muted-foreground'}
                />
                {patient.fast_track_category && (
                  <InfoRow label="Fast Track" value={patient.fast_track_category} />
                )}
              </Section>

              {/* ── Timeline ── */}
              <Section title="Timeline">
                <InfoRow label="Arrived" value={fmtFull(patient.arrived_at)} />
                <InfoRow label="Roomed" value={patient.roomed_at ? fmtFull(patient.roomed_at) : '—'} />
              </Section>

              {/* ── System / External ── */}
              <Section title="System">
                <InfoRow label="Patient ID" value={patient.id} valueClass="font-mono text-[10px] text-muted-foreground" />
                {patient.external_id && (
                  <InfoRow label="External ID" value={patient.external_id} valueClass="font-mono text-[11px]" />
                )}
                {patient.source && (
                  <InfoRow label="Source" value={patient.source} />
                )}
              </Section>

              {/* ── AI Suggestion ── */}
              {patient.ai_suggestion && (
                <div className="mx-5 mb-5 p-3 rounded-xl border border-cliniq-cyan/20 bg-cliniq-cyan/5">
                  <div className="text-[10px] font-bold text-cliniq-cyan uppercase tracking-widest mb-1.5">AI Suggestion</div>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-3 border-b border-cliniq-surface/50">
      <div className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.15em] mb-1">{title}</div>
      {children}
    </div>
  );
}
