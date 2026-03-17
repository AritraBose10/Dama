import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      external_id,
      initials, 
      age, 
      gender, 
      esi_level = 3, 
      chief_complaint, 
      source = 'EXTERNAL_AGENT'
    } = body;

    if (!initials || !chief_complaint) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = uuidv4();
    const arrived_at = new Date().toISOString();
    
    // External admissions are usually "Boarding" or "Roomed"
    const status = 'BOARDING';
    const bed_id = 'TBD';
    const bed_label = 'Unassigned';
    const risk_score = 0.5;
    const risk_flags = JSON.stringify([{ label: 'EXT_ADMIT', color: 'blue', severity: 'info' }]);
    const owner_role = 'ADMITTING';
    const next_milestone_text = 'Bed Assignment';
    const next_milestone_eta = new Date(Date.now() + 3600000).toISOString(); 

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
      chief_complaint, 'GENERAL', 'MONITOR', arrived_at,
      status, risk_score, risk_flags, owner_role, 
      next_milestone_text, next_milestone_eta, 0,
      240, 0, 'UNKNOWN', 0, source, external_id || null
    );

    return NextResponse.json({ 
      success: true, 
      message: 'External patient admitted successfully',
      patient_id: id 
    });
  } catch (error) {
    console.error('External Admission Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
