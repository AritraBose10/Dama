import { Patient, RiskFlag } from '@/types';

export const calculateRiskScore = (patient: Patient): { score: number, flags: RiskFlag[] } => {
  let score = 0.1;
  const flags: RiskFlag[] = [...patient.risk_flags];

  // Logic based on ESI
  if (patient.esi_level <= 2) score += 0.4;
  
  // Sepsis logic
  if (patient.sepsis_watch) {
    score += 0.3;
    if (!flags.find(f => f.label === 'SEPSIS')) {
      flags.push({ label: 'SEPSIS', color: 'red', severity: 'critical' });
    }
  }

  // Anticoag logic
  if (patient.anticoag_status === 'UNKNOWN' && !flags.find(f => f.label === 'ANTICOAG?')) {
    flags.push({ label: 'ANTICOAG?', color: 'yellow', severity: 'safety' });
  }

  return { 
    score: Math.min(score, 1.0), 
    flags 
  };
};
