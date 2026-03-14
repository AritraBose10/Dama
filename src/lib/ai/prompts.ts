import { Patient } from '@/types';

export const generateLawContext = (patient: Patient) => {
  return {
    patient_id: patient.id,
    initials: patient.initials,
    age: patient.age,
    gender: patient.gender,
    chief_complaint: patient.chief_complaint,
    esi: patient.esi_level,
    risk_flags: patient.risk_flags.map(f => f.label),
    sepsis_watch: patient.sepsis_watch,
    anticoag_status: patient.anticoag_status,
    next_milestone: patient.next_milestone_text,
    current_time: new Date().toISOString()
  };
};

export const prompts = {
  RISK_SUMMARY: "Analyze the current census and provide a top 5 risk summary. Reference patients by initials. Format each line for a monospace terminal.",
  FAST_DISPO: "Predict the fastest disposition candidates from the current waiting room and roomed patients. Provide estimated minutes to discharge.",
  PATIENT_ASSIST: (initials: string) => `Provide a clinical workflow recommendation for patient ${initials} based on their current status and risk flags. Focus on next steps and safety alerts.`
};
