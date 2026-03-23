import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient';

/**
 * POST /api/external/results
 * Webhook for Agentic AI systems to push live lab, imaging, or consult results.
 * 
 * Payload:
 * {
 *   "patient_id": "uuid",           // ClinIQ patient ID
 *   "type": "lab" | "imaging" | "consult",
 *   "data": { ... }                 // Type-specific fields
 * }
 * 
 * Lab data: { test_name, value, status, critical, flag }
 * Imaging data: { modality, body_part, status, findings }
 * Consult data: { specialty, status, callback_at }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { patient_id, type, data } = body;

    if (!patient_id || !type || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: patient_id, type, data' },
        { status: 400 }
      );
    }

    // Lookup patient to get initials and bed_label
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('initials, bed_label')
      .eq('id', patient_id)
      .single();

    if (patientError || !patient) {
      return NextResponse.json(
        { error: `Patient not found: ${patient_id}` },
        { status: 404 }
      );
    }

    const { initials, bed_label } = patient;
    const id = uuidv4();
    const now = new Date().toISOString();

    switch (type) {
      case 'lab': {
        const { error } = await supabase.from('lab_results').insert([{
          id,
          patient_id,
          patient_initials: initials,
          bed_label: bed_label || 'WR',
          test_name: data.test_name,
          value: data.value || 'Pending',
          status: data.flag || data.status || 'PENDING',
          critical: data.critical || data.flag === 'CRITICAL' || data.flag === 'HIGH',
          ordered_at: data.ordered_at || now,
          resulted_at: data.value ? now : null,
        }]);
        if (error) throw error;

        // If critical, also insert an alert
        if (data.critical || data.flag === 'CRITICAL') {
          await supabase.from('alerts').insert([{
            id: uuidv4(),
            type: 'CRITICAL_LAB',
            title: `Critical Lab: ${data.test_name}`,
            message: `${initials} (${bed_label || 'WR'}): ${data.test_name} = ${data.value} [${data.flag}]`,
            severity: 'critical',
          }]);
        }

        return NextResponse.json({ success: true, message: 'Lab result recorded', id });
      }

      case 'imaging': {
        const { error } = await supabase.from('imaging_orders').insert([{
          id,
          patient_id,
          patient_initials: initials,
          bed_label: bed_label || 'WR',
          modality: data.modality || 'Unknown',
          body_part: data.body_part || data.body_area || 'Unknown',
          status: data.status?.toUpperCase().replace(/\s+/g, '_') || 'ORDERED',
          ordered_at: data.ordered_at || now,
          alert_threshold_mins: data.alert_threshold_mins || 60,
        }]);
        if (error) throw error;
        return NextResponse.json({ success: true, message: 'Imaging order recorded', id });
      }

      case 'consult': {
        const { error } = await supabase.from('consults').insert([{
          id,
          patient_id,
          patient_initials: initials,
          bed_label: bed_label || 'WR',
          specialty: data.specialty,
          called_at: data.called_at || now,
          callback_at: data.callback_at || null,
          status: data.status || 'PENDING',
        }]);
        if (error) throw error;
        return NextResponse.json({ success: true, message: 'Consult recorded', id });
      }

      default:
        return NextResponse.json(
          { error: `Unknown result type: ${type}. Use "lab", "imaging", or "consult".` },
          { status: 400 }
        );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('External results webhook error:', message);
    return NextResponse.json({ error: 'Failed to process result', detail: message }, { status: 500 });
  }
}
