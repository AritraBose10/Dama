import { Patient } from '@/types';

export const generateLawContext = (patient: Patient) => {
  return {
    patient_id: patient.id,
    name: patient.name || patient.initials,
    initials: patient.initials,
    age: patient.age,
    gender: patient.gender,
    chief_complaint: patient.chief_complaint,
    esi: patient.esi_level,
    status: patient.status,
    bed: patient.bed_label || 'WR',
    risk_score: patient.risk_score,
    risk_flags: patient.risk_flags?.map(f => f.label) || [],
    sepsis_watch: patient.sepsis_watch,
    anticoag_status: patient.anticoag_status,
    next_milestone: patient.next_milestone_text,
    // Clinical enrichment
    vitals: patient.vitals || null,
    allergies: patient.allergies || [],
    pmh: patient.pmh || [],
    associated_symptoms: patient.associated_symptoms || [],
    predicted_diagnosis: patient.predicted_diagnosis || null,
    differential_diagnosis: patient.differential_diagnosis || [],
    key_findings: patient.key_findings || null,
    clinical_reasoning: patient.clinical_reasoning || null,
    treatment_plan: patient.treatment_plan || null,
    disposition_plan: patient.disposition_plan || null,
    safety_conflicts: patient.safety_conflicts || [],
    current_time: new Date().toISOString()
  };
};

export const prompts = {
  RISK_SUMMARY: "Analyze the current census and provide a top 5 risk summary. Reference patients by initials. Format each line for a monospace terminal.",

  FAST_DISPO: "Predict the fastest disposition candidates from the current waiting room and roomed patients. Provide estimated minutes to discharge.",

  PATIENT_ASSIST: (ctx: any) => `Evaluate Bed ${ctx.name || ctx.initials} (${ctx.chief_complaint}, ESI ${ctx.esi}).
Risk Flags: ${ctx.risk_flags.join(', ')}.
Status: ${ctx.status}. Bed: ${ctx.bed}.
Vitals: ${ctx.vitals ? JSON.stringify(ctx.vitals) : 'Not recorded'}.
Allergies: ${ctx.allergies?.length ? ctx.allergies.join(', ') : 'None documented'}.
PMH: ${ctx.pmh?.length ? ctx.pmh.join(', ') : 'None documented'}.
Symptoms: ${ctx.associated_symptoms?.length ? ctx.associated_symptoms.join(', ') : 'N/A'}.
AI Predicted Diagnosis: ${ctx.predicted_diagnosis || 'Pending'} (Score: ${ctx.risk_score}).
Key Findings: ${ctx.key_findings || 'N/A'}.
Treatment Plan: ${ctx.treatment_plan ? JSON.stringify(ctx.treatment_plan) : 'Not initiated'}.
Disposition: ${ctx.disposition_plan ? JSON.stringify(ctx.disposition_plan) : 'Pending'}.
Safety Alerts: ${ctx.safety_conflicts?.length ? ctx.safety_conflicts.join('; ') : 'None'}.
Next Milestone: ${ctx.next_milestone}.
Provide risk analysis and workflow next steps for this patient. Always maintain a monospace terminal style.`,

  SUMMARIZE: (ctx: any) => `Generate a concise 3-line clinical summary for patient ${ctx.name || ctx.initials}:
- Line 1: Demographics + chief complaint + ESI
- Line 2: Key vitals + AI diagnosis + risk flags
- Line 3: Current treatment status + next milestone
Patient data: ${JSON.stringify(ctx)}
Format for monospace terminal. Be extremely concise.`,

  PREDICT_DISCHARGE: (ctx: any) => `Estimate time-to-disposition for patient ${ctx.name || ctx.initials}:
Current status: ${ctx.status}. ESI: ${ctx.esi}. Chief complaint: ${ctx.chief_complaint}.
Diagnosis: ${ctx.predicted_diagnosis || 'Pending'}. Disposition plan: ${ctx.disposition_plan ? JSON.stringify(ctx.disposition_plan) : 'None'}.
Treatment: ${ctx.treatment_plan ? JSON.stringify(ctx.treatment_plan) : 'Not initiated'}.
Provide estimated minutes to discharge/admission and reasoning. Format for monospace terminal.`,

  SBAR_GENERATE: (ctx: any) => `Generate a structured SBAR handoff note for patient ${ctx.name || ctx.initials}.
Full patient context: ${JSON.stringify(ctx)}

Format the output EXACTLY as:
SITUATION:
[1-2 sentences: who, what, when]

BACKGROUND:
[Medical history, allergies, current medications, relevant context]

ASSESSMENT:
[Current clinical status, vital signs trends, AI assessment, key findings]

RECOMMENDATION:
[Recommended actions, monitoring plan, follow-up needed]

Be thorough but concise. Use clinical terminology.`,
};
