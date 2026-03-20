import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .order('arrived_at', { ascending: false });

    if (error) {
      throw error;
    }

    // In Supabase, JSONB fields like `risk_flags` are returned as parsed JSON objects automatically!
    // Booleans are also returned as native booleans, not 0/1 ints like SQLite!
    
    // We map them just to ensure consistency just in case, but no JSON parsing needed
    const formattedPatients = (patients || []).map((p: any) => ({
      ...p,
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
