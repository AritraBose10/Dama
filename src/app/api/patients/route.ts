import { NextResponse } from 'next/server';
import db, { initDb } from '@/lib/db';

// Ensure DB is initialized
initDb();

export async function GET() {
  try {
    const patients = db.prepare('SELECT * FROM patients').all();
    
    // Parse JSON strings back to objects
    const formattedPatients = patients.map((p: any) => ({
      ...p,
      risk_flags: JSON.parse(p.risk_flags),
      milestone_overdue: !!p.milestone_overdue,
      sepsis_watch: !!p.sepsis_watch,
      is_waiting_room: !!p.is_waiting_room
    }));

    return NextResponse.json(formattedPatients);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}
