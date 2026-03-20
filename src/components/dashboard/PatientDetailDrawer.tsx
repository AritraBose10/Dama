'use client';

import React from 'react';
import { X, Activity, Clock, ShieldAlert, User, Zap, AlertTriangle } from 'lucide-react';
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

function fmtFull(ts?: string) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function Section({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-5 py-3 border-b border-cliniq-surface/50", className)}>
      <div className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.15em] mb-2">{title}</div>
      {children}
    </div>
  );
}

function InfoRow({ label, value, valueClass }: { label: string; value: React.ReactNode; valueClass?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b border-cliniq-surface/20 last:border-0">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest shrink-0">{label}</span>
      <span className={cn("text-xs font-medium text-white text-right break-all", valueClass)}>{value ?? '—'}</span>
    </div>
  );
}

function PillList({ items }: { items?: string[] }) {
  if (!items?.length) return <span className="text-xs text-muted-foreground">None</span>;
  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {items.map((item, i) => (
        <span key={i} className="px-2 py-0.5 rounded bg-cliniq-surface/60 border border-cliniq-surface text-[10px] text-slate-300">{item}</span>
      ))}
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
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedPatientId(null)} />
      )}

      <div className={cn(
        "fixed top-0 right-0 h-full w-[460px] z-50 bg-cliniq-navy border-l border-cliniq-surface flex flex-col",
        "transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {patient && (
          <>
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-cliniq-surface shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cliniq-surface flex items-center justify-center text-sm font-bold text-cliniq-cyan">
                  {patient.initials}
                </div>
                <div>
                  {patient.name
                    ? <div className="text-sm font-bold text-white">{patient.name}</div>
                    : <div className="text-sm font-bold text-white">{patient.initials}</div>
                  }
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    {patient.age}{patient.gender} · {patient.bed_label || '—'}
                    {patient.name && <span className="ml-1 normal-case text-[10px] text-muted-foreground/60">({patient.initials})</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", esiColors[patient.esi_level])}>
                  ESI {patient.esi_level}
                </span>
                <button onClick={() => setSelectedPatientId(null)}
                  className="p-1.5 rounded-lg hover:bg-cliniq-surface text-muted-foreground hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Status bar ── */}
            <div className="flex items-center gap-2 flex-wrap px-5 py-2.5 border-b border-cliniq-surface/50 bg-cliniq-surface/10">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cliniq-cyan" />
                <span className={cn("text-xs font-bold uppercase tracking-wider", statusColor[patient.status] || 'text-white')}>
                  {patient.status.replace('_', ' ')}
                </span>
              </div>
              {patient.is_waiting_room && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cliniq-cyan/10 text-cliniq-cyan border border-cliniq-cyan/20">WAITING ROOM</span>
              )}
              {patient.source && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cliniq-surface/60 text-muted-foreground">{patient.source}</span>
              )}
              {patient.sepsis_watch && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-red-400" /> SEPSIS WATCH
                </span>
              )}
            </div>

            {/* ── Scrollable body ── */}
            <div className="flex-1 overflow-y-auto">

              {/* Safety Alerts */}
              {patient.safety_conflicts?.length ? (
                <div className="mx-5 mt-4 p-3 rounded-xl border border-red-500/40 bg-red-500/10">
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-[10px] font-black text-red-400 uppercase tracking-wider">Safety Alerts</span>
                  </div>
                  {patient.safety_conflicts.map((c, i) => (
                    <p key={i} className="text-xs text-red-300 leading-relaxed">{c}</p>
                  ))}
                </div>
              ) : null}

              {/* Vitals */}
              {patient.vitals && (
                <Section title="Vitals">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'BP', value: patient.vitals.blood_pressure },
                      { label: 'HR', value: patient.vitals.heart_rate ? `${patient.vitals.heart_rate} bpm` : undefined },
                      { label: 'RR', value: patient.vitals.respiratory_rate ? `${patient.vitals.respiratory_rate}/min` : undefined },
                      { label: 'SpO₂', value: patient.vitals.oxygen_saturation ? `${patient.vitals.oxygen_saturation}%` : undefined },
                      { label: 'Temp', value: patient.vitals.temperature_c ? `${patient.vitals.temperature_c}°C` : undefined },
                      { label: 'Pain', value: patient.vitals.pain_scale !== undefined ? `${patient.vitals.pain_scale}/10` : undefined },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-2 rounded-lg bg-cliniq-surface/40 border border-cliniq-surface/60 text-center">
                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{label}</div>
                        <div className={cn("text-sm font-bold mt-0.5", !value && 'text-muted-foreground/40')}>
                          {value || '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                  {patient.vitals.last_updated && (
                    <p className="text-[10px] text-muted-foreground mt-2">Updated {fmtFull(patient.vitals.last_updated)}</p>
                  )}
                </Section>
              )}

              {/* Chief Complaint */}
              <Section title="Chief Complaint">
                <InfoRow label="Complaint" value={patient.chief_complaint} />
                <InfoRow label="Category" value={patient.complaint_category} />
                {patient.associated_symptoms?.length ? (
                  <div className="py-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Symptoms</span>
                    <PillList items={patient.associated_symptoms} />
                  </div>
                ) : null}
              </Section>

              {/* Allergies & PMH */}
              {(patient.allergies?.length || patient.pmh?.length) && (
                <Section title="Allergies & History">
                  {patient.allergies?.length ? (
                    <div className="mb-2">
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Allergies</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {patient.allergies.map((a, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-[10px] font-bold text-red-400">{a}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {patient.pmh?.length ? (
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Past Medical History</span>
                      <PillList items={patient.pmh} />
                    </div>
                  ) : null}
                </Section>
              )}

              {/* Diagnosis */}
              {(patient.predicted_diagnosis || patient.differential_diagnosis?.length) && (
                <Section title="Diagnosis">
                  {patient.predicted_diagnosis && (
                    <div className="mb-3 p-2.5 rounded-lg bg-cliniq-cyan/10 border border-cliniq-cyan/20">
                      <div className="text-[9px] font-bold text-cliniq-cyan uppercase tracking-widest mb-0.5">AI Predicted Diagnosis</div>
                      <div className="text-sm font-bold text-white">{patient.predicted_diagnosis}</div>
                      {patient.ground_truth_diagnosis && patient.ground_truth_diagnosis !== patient.predicted_diagnosis && (
                        <div className="text-[10px] text-muted-foreground mt-1">Ground Truth: {patient.ground_truth_diagnosis}</div>
                      )}
                      <div className="text-[10px] text-cliniq-cyan mt-1">Confidence: {patient.risk_score}%</div>
                    </div>
                  )}
                  {patient.differential_diagnosis?.length ? (
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Differential</div>
                      {patient.differential_diagnosis.map((dx, i) => (
                        <div key={i} className="p-2 rounded-lg bg-cliniq-surface/40 border border-cliniq-surface/60">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-xs font-bold text-white">{dx.disease}</span>
                            <span className={cn("text-[10px] font-bold shrink-0",
                              dx.probability >= 70 ? 'text-red-400' : dx.probability >= 40 ? 'text-amber-400' : 'text-muted-foreground'
                            )}>{dx.probability}%</span>
                          </div>
                          {dx.reasoning && <p className="text-[10px] text-muted-foreground mt-0.5">{dx.reasoning}</p>}
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {patient.key_findings && <InfoRow label="Key Findings" value={patient.key_findings} />}
                  {patient.clinical_reasoning && <InfoRow label="Reasoning" value={patient.clinical_reasoning} />}
                </Section>
              )}

              {/* Risk Flags */}
              <Section title="Risk">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {patient.risk_flags?.length > 0
                    ? patient.risk_flags.map((flag, i) => (
                        <span key={i} className={cn("px-2 py-0.5 rounded border text-[10px] font-bold", flagColor[flag.color])}>
                          {flag.label}
                        </span>
                      ))
                    : <span className="text-xs text-muted-foreground">None</span>
                  }
                </div>
                <InfoRow label="Anticoag" value={patient.anticoag_status}
                  valueClass={patient.anticoag_status === 'CONFIRMED' ? 'text-red-400 font-bold' : patient.anticoag_status === 'UNKNOWN' ? 'text-amber-400' : 'text-green-400'} />
                <InfoRow label="Risk Score" value={Math.round(patient.risk_score)}
                  valueClass={patient.risk_score >= 80 ? 'text-red-400 font-bold' : patient.risk_score >= 60 ? 'text-orange-400' : 'text-cliniq-cyan'} />
              </Section>

              {/* Treatment Plan */}
              {patient.treatment_plan && (
                <Section title="Treatment Plan">
                  {patient.treatment_plan.approach && (
                    <div className="mb-3 p-2.5 rounded-lg bg-cliniq-surface/40 border border-cliniq-surface/60">
                      <p className="text-xs text-white leading-relaxed">{patient.treatment_plan.approach}</p>
                    </div>
                  )}

                  {patient.treatment_plan.medications?.length ? (
                    <div className="mb-3">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Medications</div>
                      <div className="space-y-2">
                        {patient.treatment_plan.medications.map((med, i) => (
                          <div key={i} className="p-2.5 rounded-lg bg-cliniq-surface/40 border border-cliniq-surface/60">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-cliniq-cyan">{med.name}</span>
                              {med.status && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/20">
                                  {med.status}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-300 mt-0.5">
                              {med.dosage} · {med.frequency} · {med.route}
                              {med.duration && ` · ${med.duration}`}
                            </div>
                            {med.note && <p className="text-[10px] text-amber-400/80 mt-0.5">{med.note}</p>}
                            {(med.age_adjustment || med.renal_adjustment || med.hepatic_adjustment) && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {[med.age_adjustment, med.renal_adjustment, med.hepatic_adjustment].filter(Boolean).join(' · ')}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {patient.treatment_plan.procedures?.length ? (
                    <div className="mb-3">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Procedures</div>
                      <div className="space-y-2">
                        {patient.treatment_plan.procedures.map((proc, i) => (
                          <div key={i} className="p-2.5 rounded-lg bg-cliniq-surface/40 border border-cliniq-surface/60">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-white">{proc.name}</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/20">{proc.status}</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{proc.type} · {proc.timing}</div>
                            {proc.indications?.length ? <p className="text-[10px] text-slate-400 mt-0.5">{proc.indications.join(', ')}</p> : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {patient.treatment_plan.supportive_care?.length ? (
                    <div className="mb-2">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Supportive Care</div>
                      {patient.treatment_plan.supportive_care.map((s, i) => (
                        <p key={i} className="text-[11px] text-slate-300 leading-relaxed">· {s}</p>
                      ))}
                    </div>
                  ) : null}

                  {patient.treatment_plan.monitoring?.length ? (
                    <div className="mb-2">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Monitoring</div>
                      {patient.treatment_plan.monitoring.map((m, i) => (
                        <p key={i} className="text-[11px] text-slate-300 leading-relaxed">· {m}</p>
                      ))}
                    </div>
                  ) : null}

                  {patient.treatment_plan.complications_to_watch?.length ? (
                    <div className="mb-2">
                      <div className="text-[10px] font-bold text-amber-400/80 uppercase tracking-widest mb-1">Watch For</div>
                      {patient.treatment_plan.complications_to_watch.map((c, i) => (
                        <p key={i} className="text-[11px] text-amber-300/80 leading-relaxed">⚠ {c}</p>
                      ))}
                    </div>
                  ) : null}

                  {patient.treatment_plan.notes && (
                    <p className="text-[11px] text-muted-foreground italic leading-relaxed mt-1">{patient.treatment_plan.notes}</p>
                  )}
                </Section>
              )}

              {/* Disposition */}
              {patient.disposition_plan && (
                <Section title="Disposition">
                  <InfoRow label="Decision" value={patient.disposition_plan.disposition}
                    valueClass={patient.disposition_plan.disposition === 'ADMIT' ? 'text-orange-400 font-bold' : 'text-green-400 font-bold'} />
                  <InfoRow label="Level" value={patient.disposition_plan.level} />
                  {patient.disposition_plan.reasoning?.length ? (
                    <div className="pt-1">
                      {patient.disposition_plan.reasoning.map((r, i) => (
                        <p key={i} className="text-[11px] text-slate-300">· {r}</p>
                      ))}
                    </div>
                  ) : null}
                </Section>
              )}

              {/* Workflow */}
              <Section title="Workflow">
                <InfoRow label="Next Milestone" value={patient.next_milestone_text} />
                <InfoRow label="ETA" value={patient.next_milestone_eta || '—'} />
                <InfoRow label="Overdue" value={patient.milestone_overdue ? 'YES' : 'NO'}
                  valueClass={patient.milestone_overdue ? 'text-red-400 font-bold' : 'text-green-400'} />
                <InfoRow label="Dispo Prediction" value={patient.dispo_prediction_mins ? `${patient.dispo_prediction_mins}m` : '—'} />
              </Section>

              {/* Provider & Location */}
              <Section title="Provider & Location">
                <InfoRow label="Role" value={patient.owner_role} />
                {patient.owner_user_id && <InfoRow label="User ID" value={patient.owner_user_id} valueClass="font-mono text-[11px]" />}
                <InfoRow label="Bed" value={patient.bed_label || '—'} />
                <InfoRow label="Bed ID" value={patient.bed_id || '—'} valueClass="font-mono text-[11px]" />
              </Section>

              {/* Timeline */}
              <Section title="Timeline">
                <InfoRow label="Arrived" value={fmtFull(patient.arrived_at)} />
                <InfoRow label="Roomed" value={patient.roomed_at ? fmtFull(patient.roomed_at) : '—'} />
              </Section>

              {/* System */}
              <Section title="System" className="mb-4">
                <InfoRow label="Patient ID" value={patient.id} valueClass="font-mono text-[10px] text-muted-foreground" />
                {patient.external_id && <InfoRow label="External ID" value={patient.external_id} valueClass="font-mono text-[11px]" />}
                {patient.source && <InfoRow label="Source" value={patient.source} />}
              </Section>

            </div>
          </>
        )}
      </div>
    </>
  );
};
