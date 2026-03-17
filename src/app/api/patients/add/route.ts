import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      initials, 
      age, 
      gender, 
      esi_level, 
      chief_complaint, 
      complaint_category 
    } = body;

    const id = uuidv4();
    const arrived_at = new Date().toISOString();
    
    // Default values for a new patient
    const status = 'ROOMED';
    const bed_id = 'pending';
    const bed_label = 'Waiting Room';
    const risk_score = 0.5; // Baseline
    const risk_flags = JSON.stringify([]);
    const owner_role = 'Triage';
    const next_milestone_text = 'Triage Evaluation';
    const next_milestone_eta = new Date(Date.now() + 1800000).toISOString(); // 30 mins
    const milestone_overdue = 0;
    const dispo_prediction_mins = 180;
    const sepsis_watch = 0;
    const is_waiting_room = 1;

    const insert = db.prepare(`
      INSERT INTO patients (
        id, initials, age, gender, bed_id, bed_label, esi_level, 
        chief_complaint, complaint_category, complaint_icon, arrived_at, 
        status, risk_score, risk_flags, owner_role, next_milestone_text, 
        next_milestone_eta, milestone_overdue, dispo_prediction_mins, 
        sepsis_watch, anticoag_status, is_waiting_room
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      id, initials, age, gender, bed_id, bed_label, esi_level,
      chief_complaint, complaint_category || 'GENERAL', 'USER', arrived_at,
      status, risk_score, risk_flags, owner_role, 
      next_milestone_text, next_milestone_eta, milestone_overdue,
      dispo_prediction_mins, sepsis_watch, 'UNKNOWN', is_waiting_room
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Failed to add patient:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
