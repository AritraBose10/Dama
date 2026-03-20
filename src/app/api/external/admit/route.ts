import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { RiskFlag } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Support both old flat structure and new nested payload
    const isNested = !!body.patient;
    
    let external_id, initials, age, gender, esi_level, chief_complaint, source;
    let newRiskFlags: RiskFlag[] = [];
    let risk_score = 0.5;

    if (isNested) {
      const { patient, triage, assessment, safety_alerts } = body;
      external_id = patient.patient_id;
      // Extract initials from full name
      const nameParts = patient.name.split(' ');
      initials = nameParts.length > 1 
        ? `${nameParts[0][0]}${nameParts[nameParts.length-1][0]}`.toUpperCase()
        : patient.name.substring(0, 2).toUpperCase();
      
      age = patient.age;
      gender = patient.gender;
      esi_level = triage.acuity_level;
      chief_complaint = triage.chief_complaint;
      source = 'AGENTIC_HOST'; // Identify external advanced agents

      // Map Safety Alerts to Risk Flags
      if (safety_alerts && safety_alerts.severity === 'CRITICAL') {
        newRiskFlags.push({ label: 'CRITICAL ALERT', color: 'red', severity: 'critical' });
      } else if (safety_alerts && safety_alerts.severity === 'WARNING') {
        newRiskFlags.push({ label: 'SAFETY WARN', color: 'yellow', severity: 'safety' });
      }

      // Add AI Diagnosis flag if confidence is high
      if (assessment && assessment.confidence_score > 80) {
        newRiskFlags.push({ label: 'AI: ACS RISK', color: 'amber', severity: 'watch' });
        risk_score = 0.85; // elevate score based on high confidence AI
      }
    } else {
      // Legacy fallback
      ({ external_id, initials, age, gender, esi_level = 3, chief_complaint, source = 'EXTERNAL_AGENT' } = body);
      newRiskFlags.push({ label: 'EXT_ADMIT', color: 'amber', severity: 'watch' });
    }

    if (!initials || !chief_complaint) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = uuidv4();
    const arrived_at = new Date().toISOString();
    
    // Determine status from ESI
    const status = esi_level <= 2 ? 'BOARDING' : 'WAITING';
    const bed_id = status === 'BOARDING' ? 'TBD' : 'WR';
    const bed_label = status === 'BOARDING' ? 'Boarding' : 'Waiting Room';
    
    const owner_role = 'ADMITTING';
    const next_milestone_text = 'Triage Assessment';
    const next_milestone_eta = new Date(Date.now() + 1800000).toISOString(); 

    const insert = db.prepare(`
      INSERT INTO patients (
        id, initials, age, gender, bed_id, bed_label, esi_level, 
        chief_complaint, complaint_category, complaint_icon, arrived_at, 
        status, risk_score, risk_flags, owner_role, next_milestone_text, 
        next_milestone_eta, milestone_overdue, dispo_prediction_mins, 
        sepsis_watch, anticoag_status, is_waiting_room, source, external_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      id, initials, age, gender, bed_id, bed_label, esi_level,
      chief_complaint, 'CARDIAC', 'HEART', arrived_at,
      status, risk_score, JSON.stringify(newRiskFlags), owner_role, 
      next_milestone_text, next_milestone_eta, 0,
      180, 0, 'UNKNOWN', status === 'WAITING' ? 1 : 0, source, external_id || null
    );

    // 10. Generate alert for the admission
    db.prepare(`
      INSERT INTO alerts (id, patient_id, type, message, severity, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      uuidv4(),
      id,
      'NEW_ADMISSION',
      `New external admission: ${initials} (${chief_complaint})`,
      esi_level <= 2 ? 'CRITICAL' : 'INFO',
      new Date().toISOString()
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Patient admitted successfully via AI Agent Payload',
      patientId: id 
    });
  } catch (error) {
    console.error('External Admission Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
