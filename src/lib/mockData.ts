import { Patient, ImagingOrder, LabResult, Consult } from '../types';

export const mockPatients: Patient[] = [
  {
    id: '1',
    initials: 'R.T.',
    age: 68,
    gender: 'M',
    bed_id: 'b4',
    bed_label: 'Bed 4',
    esi_level: 1,
    chief_complaint: 'Stroke / AMS',
    complaint_category: 'NEURO',
    complaint_icon: 'BRAIN',
    arrived_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    status: 'ROOMED',
    risk_score: 0.95,
    risk_flags: [
      { label: 'STROKE!', color: 'red', severity: 'critical' },
      { label: 'SEPSIS', color: 'red', severity: 'critical' },
      { label: 'ANTICOAG', color: 'amber', severity: 'safety' }
    ],
    owner_role: 'MD',
    next_milestone_text: 'CTA Head/Neck Result',
    next_milestone_eta: new Date(Date.now() + 600000).toISOString(), // in 10 mins
    milestone_overdue: false,
    dispo_prediction_mins: 240,
    sepsis_watch: true,
    sepsis_bundle_started_at: new Date(Date.now() - 1800000).toISOString(),
    anticoag_status: 'CONFIRMED',
    is_waiting_room: false
  },
  {
    id: '2',
    initials: 'J.S.',
    age: 62,
    gender: 'M',
    bed_id: 'b12',
    bed_label: 'Bed 12',
    esi_level: 2,
    chief_complaint: 'Chest Pain',
    complaint_category: 'CARDIAC',
    complaint_icon: 'RED_DOT',
    arrived_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    status: 'ROOMED',
    risk_score: 0.75,
    risk_flags: [
      { label: 'ACS/PE', color: 'red', severity: 'critical' },
      { label: 'ANTICOAG?', color: 'yellow', severity: 'safety' }
    ],
    owner_role: 'PA',
    next_milestone_text: 'Delta Troponin',
    next_milestone_eta: new Date(Date.now() - 300000).toISOString(), // 5 mins overdue
    milestone_overdue: true,
    dispo_prediction_mins: 180,
    sepsis_watch: false,
    anticoag_status: 'UNKNOWN',
    is_waiting_room: false
  },
  {
    id: '3',
    initials: 'M.K.',
    age: 28,
    gender: 'F',
    bed_id: 'b7',
    bed_label: 'Bed 7',
    esi_level: 2,
    chief_complaint: 'Abd Pain',
    complaint_category: 'OB',
    complaint_icon: 'PROCEDURE',
    arrived_at: new Date(Date.now() - 5400000).toISOString(), // 1.5 hours ago
    status: 'ROOMED',
    risk_score: 0.8,
    risk_flags: [
      { label: 'ECTOPIC?', color: 'red', severity: 'critical' },
      { label: 'G1P0', color: 'amber', severity: 'watch' }
    ],
    owner_role: 'MD',
    next_milestone_text: 'Pelvic US',
    next_milestone_eta: new Date(Date.now() + 1200000).toISOString(), // in 20 mins
    milestone_overdue: false,
    dispo_prediction_mins: 300,
    sepsis_watch: false,
    anticoag_status: 'NONE',
    is_waiting_room: false
  },
  {
    id: '4',
    initials: 'A.B.',
    age: 45,
    gender: 'M',
    bed_id: 'b15',
    bed_label: 'Bed 15',
    esi_level: 4,
    chief_complaint: 'Laceration',
    complaint_category: 'PROCEDURE',
    complaint_icon: 'DEVICE',
    arrived_at: new Date(Date.now() - 3600000).toISOString(),
    status: 'DISPO_READY',
    risk_score: 0.2,
    risk_flags: [
      { label: 'ANTICOAG', color: 'amber', severity: 'safety' }
    ],
    owner_role: 'RN',
    next_milestone_text: 'AVS Review',
    next_milestone_eta: new Date(Date.now() + 900000).toISOString(),
    milestone_overdue: false,
    dispo_prediction_mins: 30,
    sepsis_watch: false,
    anticoag_status: 'CONFIRMED',
    is_waiting_room: false
  }
];

export const mockImaging: ImagingOrder[] = [
  {
    id: 'i1',
    patient_id: '1',
    patient_initials: 'R.T.',
    bed_label: 'Bed 4',
    modality: 'CT',
    body_part: 'Head/Neck',
    status: 'RAD_READING',
    ordered_at: new Date(Date.now() - 2400000).toISOString(),
    alert_threshold_mins: 30
  }
];

export const mockLabs: LabResult[] = [
  {
    id: 'l1',
    patient_id: '1',
    patient_initials: 'R.T.',
    bed_label: 'Bed 4',
    test_name: 'Lactate',
    value: '4.2',
    status: 'CRITICAL',
    critical: true,
    alert_threshold: 2.0,
    ordered_at: new Date(Date.now() - 3000000).toISOString(),
    resulted_at: new Date(Date.now() - 2400000).toISOString()
  },
  {
    id: 'l2',
    patient_id: '2',
    patient_initials: 'J.S.',
    bed_label: 'Bed 12',
    test_name: 'Troponin #2',
    value: 'Pending',
    status: 'ORDERED',
    critical: false,
    ordered_at: new Date(Date.now() - 10000000).toISOString()
  }
];

export const mockConsults: Consult[] = [
  {
    id: 'c1',
    patient_id: '1',
    patient_initials: 'R.T.',
    bed_label: 'Bed 4',
    specialty: 'Neurology',
    called_at: new Date(Date.now() - 1800000).toISOString(),
    status: 'Called'
  }
];
