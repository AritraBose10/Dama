import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

/**
 * POST /api/external/vitals
 * Webhook to append new vital readings to a patient's vitals_history.
 * Also updates the 'vitals' column with the latest reading.
 *
 * Payload:
 * {
 *   "patient_id": "uuid",
 *   "vitals": {
 *     "blood_pressure": "120/80",
 *     "heart_rate": 78,
 *     "respiratory_rate": 16,
 *     "oxygen_saturation": 98,
 *     "temperature_c": 37.1,
 *     "pain_scale": 3
 *   },
 *   "recorded_at": "2026-03-23T14:00:00Z"  // optional, defaults to now
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { patient_id, vitals, recorded_at } = body;

    if (!patient_id || !vitals) {
      return NextResponse.json(
        { error: 'Missing required fields: patient_id, vitals' },
        { status: 400 }
      );
    }

    const timestamp = recorded_at || new Date().toISOString();
    const vitalRecord = { ...vitals, last_updated: timestamp };

    // Fetch the current vitals_history
    const { data: patient, error: fetchError } = await supabase
      .from('patients')
      .select('vitals_history')
      .eq('id', patient_id)
      .single();

    if (fetchError) throw fetchError;

    const currentHistory = Array.isArray(patient?.vitals_history)
      ? patient.vitals_history
      : [];

    // Keep last 12 readings (covers ~6 hours at 30min intervals)
    const updatedHistory = [...currentHistory, vitalRecord].slice(-12);

    // Update both vitals (latest) and vitals_history (array)
    const { error: updateError } = await supabase
      .from('patients')
      .update({
        vitals: vitalRecord,
        vitals_history: updatedHistory,
      })
      .eq('id', patient_id);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: 'Vitals recorded',
      readings_count: updatedHistory.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Vitals webhook error:', message);
    return NextResponse.json({ error: 'Failed to record vitals', detail: message }, { status: 500 });
  }
}
