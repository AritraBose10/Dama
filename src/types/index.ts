export type OwnerRole = 'MD' | 'PA' | 'RN' | 'CHG';

export type EsiLevel = 1 | 2 | 3 | 4 | 5;

export type PatientStatus = 'WAITING' | 'ROOMED' | 'BOARDING' | 'DISPO_READY' | 'DISCHARGED';

export type ComplaintCategory = 'CARDIAC' | 'NEURO' | 'PROCEDURE' | 'GI' | 'OB' | 'FAST_TRACK';

export type AnticoagStatus = 'CONFIRMED' | 'UNKNOWN' | 'NONE';

export interface RiskFlag {
  label: string;
  color: 'red' | 'amber' | 'yellow' | 'green';
  severity: 'critical' | 'watch' | 'safety' | 'normal';
}

export interface Vitals {
  blood_pressure?: string;
  heart_rate?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  temperature_c?: number;
  pain_scale?: number;
  last_updated?: string;
}

export interface DifferentialDx {
  disease: string;
  probability: number;
  reasoning: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  duration?: string;
  status?: string;
  note?: string;
  monitoring?: string;
  age_adjustment?: string | null;
  renal_adjustment?: string | null;
  hepatic_adjustment?: string | null;
}

export interface Procedure {
  name: string;
  type: string;
  timing: string;
  status: string;
  indications?: string[];
  sequence?: string;
}

export interface TreatmentPlan {
  approach?: string;
  medications?: Medication[];
  procedures?: Procedure[];
  supportive_care?: string[];
  monitoring?: string[];
  complications_to_watch?: string[];
  follow_up_tests?: string[];
  notes?: string;
}

export interface DispositionPlan {
  disposition: string;
  level: string;
  reasoning: string[];
}

export interface Patient {
  id: string;
  name?: string;
  initials: string;
  age: number;
  gender: string;
  bed_id?: string;
  bed_label?: string;
  esi_level: EsiLevel;
  chief_complaint: string;
  complaint_category: ComplaintCategory;
  complaint_icon: string;
  arrived_at: string;
  roomed_at?: string;
  status: PatientStatus;
  risk_score: number;
  risk_flags: RiskFlag[];
  owner_role: OwnerRole;
  owner_user_id?: string;
  next_milestone_text: string;
  next_milestone_eta: string;
  milestone_overdue: boolean;
  ai_suggestion?: string;
  dispo_prediction_mins: number;
  sepsis_watch: boolean;
  sepsis_bundle_started_at?: string;
  anticoag_status: AnticoagStatus;
  is_waiting_room: boolean;
  fast_track_category?: string;
  source?: string;
  external_id?: string;
  // Clinical enrichment
  vitals?: Vitals;
  vitals_history?: Vitals[];
  differential_diagnosis?: DifferentialDx[];
  predicted_diagnosis?: string;
  ground_truth_diagnosis?: string;
  key_findings?: string;
  clinical_reasoning?: string;
  treatment_plan?: TreatmentPlan;
  allergies?: string[];
  pmh?: string[];
  associated_symptoms?: string[];
  disposition_plan?: DispositionPlan;
  safety_conflicts?: string[];
}

export interface ImagingOrder {
  id: string;
  patient_id: string;
  patient_initials: string;
  bed_label?: string;
  modality: string;
  body_part: string;
  status: 'ORDERED' | 'PENDING_TECH' | 'IN_SCANNER' | 'RAD_READING' | 'ALERT';
  ordered_at: string;
  alert_threshold_mins: number;
}

export interface LabResult {
  id: string;
  patient_id: string;
  patient_initials: string;
  bed_label?: string;
  test_name: string;
  value: string;
  status: string;
  critical: boolean;
  alert_threshold?: number;
  ordered_at: string;
  resulted_at?: string;
}

export interface Consult {
  id: string;
  patient_id: string;
  patient_initials: string;
  bed_label?: string;
  specialty: string;
  called_at: string;
  callback_at?: string;
  status: string;
}
