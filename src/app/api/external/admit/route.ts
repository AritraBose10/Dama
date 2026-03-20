import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient';
import { RiskFlag } from '@/types';

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Determine payload type
    const isNewPayload = !!body.patient && !!body.triage && !!body.assessment;

    if (!isNewPayload) {
      // --- LEGACY PAYLOAD SUPPORT ---
      const {
        name, age, gender, esi_level, chief_complaint, arrived_at, 
        status = 'WAITING', risk_score = 65, external_id, source = 'EXTERNAL_AI'
      } = body;

      const id = uuidv4();
      const initials = getInitials(name);
      
      const newRiskFlags: RiskFlag[] = [
        { label: 'AI PRE-CHARTED', color: 'amber', severity: 'watch' }
      ];

      // Assign initial bed for legacy
      let bed_id = 'WR-01';
      let bed_label = 'WR';
      if (status !== 'WAITING') {
        bed_id = 'B-14';
        bed_label = '14';
      }

      const next_milestone_text = 'MD Eval Appended';
      const next_milestone_eta = 'Pending';
      const owner_role = body.owner_role || 'Unassigned';

      const { error: insertError } = await supabase.from('patients').insert([{
        id, initials, age, gender, bed_id, bed_label, esi_level, chief_complaint, 
        complaint_category: 'CARDIAC', complaint_icon: 'HEART', arrived_at, status, 
        risk_score, risk_flags: newRiskFlags, owner_role, next_milestone_text, 
        next_milestone_eta, milestone_overdue: false, dispo_prediction_mins: 180, 
        sepsis_watch: false, sepsis_bundle_started_at: null, anticoag_status: 'UNKNOWN', 
        is_waiting_room: status === 'WAITING', source, external_id: external_id || null
      }]);

      if (insertError) throw insertError;

      // 10. Generate alert for the admission
      await supabase.from('alerts').insert([{
        id: uuidv4(), 
        type: 'NEW_ADMISSION', 
        title: 'New External Admission',
        message: `New external admission: ${initials} (${chief_complaint})`, 
        severity: esi_level <= 2 ? 'critical' : 'normal',
      }]);

      return NextResponse.json({ 
        success: true, 
        message: 'External patient admitted successfully (Legacy)',
        patient_id: id 
      });
    }

    // --- NEW COMPLEX PAYLOAD SUPPORT ---
    const { patient, triage, assessment, safety_alerts } = body;
    const { patient_id: external_id, name, age, gender } = patient;
    const { acuity_level: esi_level, chief_complaint } = triage;
    const source = 'AI_AGENT';

    const id = uuidv4();
    const initials = getInitials(name);
    const startTime = new Date();

    // 1. Determine base status off ESI
    const status = esi_level <= 2 ? 'BOARDING' : 'WAITING';
    const bed_id = status === 'BOARDING' ? 'TB-1' : 'WR-1';
    const bed_label = status === 'BOARDING' ? 'Trauma 1' : 'WR';

    // 2. Generate initial risk flags from assessment and safety alerts
    const riskFlags: RiskFlag[] = [
      { label: 'AI PRE-CHARTED', color: 'amber', severity: 'watch' }
    ];

    if (safety_alerts?.severity) {
      if (safety_alerts.severity === 'high') {
        riskFlags.push({ label: 'CRITICAL ALERT', color: 'red', severity: 'critical' });
      } else {
        riskFlags.push({ label: 'SAFETY WARN', color: 'amber', severity: 'safety' });
      }
    }

    if (assessment?.confidence_score > 80) {
      riskFlags.push({ label: 'AI: ACS RISK', color: 'yellow', severity: 'safety' });
    }
    
    // 3. Convert confidence to risk score base
    const riskScore = assessment?.confidence_score || 65;

    // 4. Map complaint category (simple mapping)
    const complaintCategory = 'CARDIAC'; 
    const complaintIcon = 'HEART';

    const next_milestone_text = status === 'WAITING' ? 'Triage Vitals' : 'MD Assessment';
    const next_milestone_eta = '5m';

    // 5. Insert properly
    const { error: patientInsertError } = await supabase.from('patients').insert([{
        id, initials, age, gender, bed_id, bed_label, esi_level, chief_complaint, 
        complaint_category: complaintCategory, complaint_icon: complaintIcon, 
        arrived_at: startTime.toISOString(), status, risk_score: riskScore, 
        risk_flags: riskFlags, owner_role: 'Unassigned', next_milestone_text, 
        next_milestone_eta, milestone_overdue: false, dispo_prediction_mins: 180, 
        sepsis_watch: false, sepsis_bundle_started_at: null, anticoag_status: 'UNKNOWN', 
        is_waiting_room: status === 'WAITING', source, external_id: external_id || null
    }]);

    if (patientInsertError) throw patientInsertError;

    // 6. Generate alert for the admission
    await supabase.from('alerts').insert([{
        id: uuidv4(),
        type: 'NEW_ADMISSION',
        title: 'New External Admission',
        message: `New external admission: ${initials} (${chief_complaint})`,
        severity: esi_level <= 2 ? 'critical' : 'normal',
    }]);

    return NextResponse.json({ 
      success: true, 
      message: 'Patient admitted successfully via AI Agent Payload',
      patientId: id 
    });
  } catch (error) {
    console.error('External Admission Error:', error);
    return NextResponse.json({ error: 'Failed to process admission' }, { status: 500 });
  }
}
