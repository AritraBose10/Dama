import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient';
import { RiskFlag, TreatmentPlan, DispositionPlan, Vitals, DifferentialDx } from '@/types';

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function mapTriageStatus(triageStatus?: string): string {
  if (!triageStatus) return 'WAITING';
  const s = triageStatus.toUpperCase();
  if (s.includes('TREATMENT') || s.includes('ROOMED')) return 'ROOMED';
  if (s.includes('BOARDING')) return 'BOARDING';
  if (s.includes('DISPO') || s.includes('READY')) return 'DISPO_READY';
  if (s.includes('DISCHARGED')) return 'DISCHARGED';
  return 'WAITING';
}

function mapComplaintCategory(complaint?: string): string {
  if (!complaint) return 'CARDIAC';
  const c = complaint.toUpperCase();
  if (c.includes('CHEST') || c.includes('CARDIAC') || c.includes('HEART') || c.includes('MI') || c.includes('CHOLECYST')) return 'CARDIAC';
  if (c.includes('HEAD') || c.includes('NEURO') || c.includes('STROKE') || c.includes('SEIZURE')) return 'NEURO';
  if (c.includes('ABDOM') || c.includes('NAUSEA') || c.includes('VOMIT') || c.includes('GI')) return 'GI';
  if (c.includes('OB') || c.includes('PREG') || c.includes('OBSTET')) return 'OB';
  if (c.includes('FAST') || c.includes('MINOR')) return 'FAST_TRACK';
  return 'PROCEDURE';
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const isRichPayload = !!body.patient && !!body.triage && !!body.assessment && !!body.treatment_plan;
    const isNewPayload = !isRichPayload && !!body.patient && !!body.triage && !!body.assessment;

    // ─── LEGACY FLAT PAYLOAD ───────────────────────────────────────────────
    if (!isRichPayload && !isNewPayload) {
      const {
        name, age, gender, esi_level, chief_complaint, arrived_at,
        status = 'WAITING', risk_score = 65, external_id, source = 'EXTERNAL_AI'
      } = body;

      const id = uuidv4();
      const initials = getInitials(name);
      const legacyRiskFlags: RiskFlag[] = [{ label: 'AI PRE-CHARTED', color: 'amber', severity: 'watch' }];
      const bed_id = status !== 'WAITING' ? 'B-14' : 'WR-01';
      const bed_label = status !== 'WAITING' ? '14' : 'WR';

      const { error } = await supabase.from('patients').insert([{
        id, name, initials, age, gender, bed_id, bed_label, esi_level, chief_complaint,
        complaint_category: mapComplaintCategory(chief_complaint), complaint_icon: 'HEART',
        arrived_at, status, risk_score, risk_flags: legacyRiskFlags, owner_role: body.owner_role || 'Unassigned',
        next_milestone_text: 'MD Eval Appended', next_milestone_eta: 'Pending',
        milestone_overdue: false, dispo_prediction_mins: 180,
        sepsis_watch: false, anticoag_status: 'UNKNOWN',
        is_waiting_room: status === 'WAITING', source, external_id: external_id || null
      }]);
      if (error) throw error;

      await supabase.from('alerts').insert([{
        id: uuidv4(), type: 'NEW_ADMISSION', title: 'New External Admission',
        message: `New external admission: ${initials} (${chief_complaint})`,
        severity: esi_level <= 2 ? 'critical' : 'normal',
      }]);

      return NextResponse.json({ success: true, message: 'Admitted (Legacy)', patient_id: id });
    }

    // ─── PREVIOUS SIMPLE NEW PAYLOAD ──────────────────────────────────────
    if (isNewPayload) {
      const { patient, triage, assessment, safety_alerts } = body;
      const { patient_id: external_id, name, age, gender } = patient;
      const { acuity_level: esi_level, chief_complaint } = triage;
      const id = uuidv4();
      const initials = getInitials(name);
      const status = esi_level <= 2 ? 'BOARDING' : 'WAITING';
      const riskFlags: RiskFlag[] = [{ label: 'AI PRE-CHARTED', color: 'amber', severity: 'watch' }];

      if (safety_alerts?.severity === 'high') riskFlags.push({ label: 'CRITICAL ALERT', color: 'red', severity: 'critical' });
      else if (safety_alerts?.severity) riskFlags.push({ label: 'SAFETY WARN', color: 'amber', severity: 'safety' });
      if ((assessment?.confidence_score || 0) > 80) riskFlags.push({ label: 'AI: HIGH CONFIDENCE', color: 'yellow', severity: 'safety' });

      const { error } = await supabase.from('patients').insert([{
        id, name, initials, age, gender,
        bed_id: status === 'BOARDING' ? 'TB-1' : 'WR-1',
        bed_label: status === 'BOARDING' ? 'Trauma 1' : 'WR',
        esi_level, chief_complaint,
        complaint_category: mapComplaintCategory(chief_complaint), complaint_icon: 'HEART',
        arrived_at: new Date().toISOString(), status, risk_score: assessment?.confidence_score || 65,
        risk_flags: riskFlags, owner_role: 'Unassigned',
        next_milestone_text: status === 'WAITING' ? 'Triage Vitals' : 'MD Assessment',
        next_milestone_eta: '5m', milestone_overdue: false, dispo_prediction_mins: 180,
        sepsis_watch: false, anticoag_status: 'UNKNOWN',
        is_waiting_room: status === 'WAITING', source: 'AI_AGENT', external_id: external_id || null
      }]);
      if (error) throw error;

      await supabase.from('alerts').insert([{
        id: uuidv4(), type: 'NEW_ADMISSION', title: 'New External Admission',
        message: `New external admission: ${initials} (${chief_complaint})`,
        severity: esi_level <= 2 ? 'critical' : 'normal',
      }]);

      return NextResponse.json({ success: true, message: 'Admitted via AI Agent Payload', patientId: id });
    }

    // ─── RICH CLINICAL PAYLOAD ─────────────────────────────────────────────
    const { patient, triage, vitals, assessment, diagnostics, treatment_plan, safety_alerts, disposition } = body;

    const { patient_id: external_id, name, age, gender, associated_symptoms, past_medical_history, allergies: patientAllergies } = patient;
    const { acuity_level: esi_level, chief_complaint, arrival_timestamp, roomed_at, status: triageStatus, assigned_room } = triage;

    const id = uuidv4();
    const initials = getInitials(name);
    const status = mapTriageStatus(triageStatus);
    const bed_label = assigned_room || (status === 'BOARDING' ? 'Trauma 1' : 'WR');
    const bed_id = assigned_room?.toLowerCase().replace(/\s+/g, '-') || (status === 'BOARDING' ? 'TB-1' : 'WR-1');

    // Risk flags
    const riskFlags: RiskFlag[] = [{ label: 'AI PRE-CHARTED', color: 'amber', severity: 'watch' }];
    if (safety_alerts?.severity?.toUpperCase() === 'CRITICAL' || safety_alerts?.severity === 'high') {
      riskFlags.push({ label: 'CRITICAL ALERT', color: 'red', severity: 'critical' });
    } else if (safety_alerts?.has_conflicts) {
      riskFlags.push({ label: 'SAFETY WARN', color: 'amber', severity: 'safety' });
    }
    if (patientAllergies?.length) {
      riskFlags.push({ label: 'ALLERGIES', color: 'red', severity: 'safety' });
    }
    const confidenceScore = typeof assessment?.confidence_score === 'number'
      ? (assessment.confidence_score <= 1 ? Math.round(assessment.confidence_score * 100) : assessment.confidence_score)
      : 65;
    if (confidenceScore >= 80) {
      riskFlags.push({ label: `AI: ${assessment?.ai_predicted_diagnosis?.toUpperCase().slice(0, 12) || 'HIGH CONF'}`, color: 'yellow', severity: 'safety' });
    }

    // Vitals
    const vitalsData: Vitals | undefined = vitals?.latest ? {
      blood_pressure: vitals.latest.blood_pressure,
      heart_rate: vitals.latest.heart_rate,
      respiratory_rate: vitals.latest.respiratory_rate,
      oxygen_saturation: vitals.latest.oxygen_saturation,
      temperature_c: vitals.latest.temperature_c,
      pain_scale: vitals.latest.pain_scale,
      last_updated: vitals.last_updated,
    } : undefined;

    // Differential diagnosis
    const differentialDx: DifferentialDx[] | undefined = assessment?.ai_differential_diagnosis?.map((d: any) => ({
      disease: d.disease,
      probability: typeof d.probability === 'number'
        ? (d.probability <= 1 ? Math.round(d.probability * 100) : d.probability)
        : 0,
      reasoning: d.reasoning || '',
    }));

    // Treatment plan
    const treatmentPlan: TreatmentPlan | undefined = treatment_plan ? {
      approach: treatment_plan.treatment_approach || assessment?.treatment_approach,
      medications: treatment_plan.medications?.map((m: any) => ({
        name: m.name, dosage: m.dosage, frequency: m.frequency,
        route: m.route, duration: m.duration, status: m.status,
        note: m.note, monitoring: m.monitoring,
        age_adjustment: m.age_adjustment, renal_adjustment: m.renal_adjustment,
        hepatic_adjustment: m.hepatic_adjustment,
      })),
      procedures: treatment_plan.procedures?.map((p: any) => ({
        name: p.name, type: p.type, timing: p.timing,
        status: p.status, indications: p.indications, sequence: p.sequence,
      })),
      supportive_care: treatment_plan.supportive_care,
      monitoring: treatment_plan.monitoring,
      complications_to_watch: treatment_plan.complications_to_watch,
      follow_up_tests: treatment_plan.follow_up_tests,
      notes: treatment_plan.notes,
    } : undefined;

    // Disposition
    const dispositionPlan: DispositionPlan | undefined = disposition ? {
      disposition: disposition.disposition,
      level: disposition.level,
      reasoning: disposition.reasoning || [],
    } : undefined;

    // Sepsis heuristic
    const sepsisWatch = !!(vitalsData?.heart_rate && vitalsData.heart_rate > 100 &&
      vitalsData.temperature_c && vitalsData.temperature_c > 38.3 &&
      disposition?.criteria?.sepsis);

    // Insert patient
    const { error: patientError } = await supabase.from('patients').insert([{
      id, name, initials, age, gender, bed_id, bed_label, esi_level, chief_complaint,
      complaint_category: mapComplaintCategory(chief_complaint), complaint_icon: 'HEART',
      arrived_at: arrival_timestamp || new Date().toISOString(),
      roomed_at: roomed_at || null,
      status, risk_score: confidenceScore,
      risk_flags: riskFlags, owner_role: 'Unassigned',
      next_milestone_text: treatmentPlan?.approach ? 'Treatment Initiated' : 'MD Assessment',
      next_milestone_eta: '5m', milestone_overdue: false,
      dispo_prediction_mins: disposition?.level === 'Ward' ? 240 : 180,
      sepsis_watch: sepsisWatch, anticoag_status: 'UNKNOWN',
      is_waiting_room: status === 'WAITING', source: 'AI_AGENT',
      external_id: external_id || body.id || null,
      // Clinical enrichment
      vitals: vitalsData || null,
      differential_diagnosis: differentialDx || null,
      predicted_diagnosis: assessment?.ai_predicted_diagnosis || null,
      ground_truth_diagnosis: assessment?.ground_truth_diagnosis || null,
      key_findings: assessment?.key_findings || null,
      clinical_reasoning: assessment?.reasoning || null,
      treatment_plan: treatmentPlan || null,
      allergies: patientAllergies || null,
      pmh: past_medical_history || null,
      associated_symptoms: associated_symptoms || null,
      disposition_plan: dispositionPlan || null,
      safety_conflicts: safety_alerts?.conflicts || null,
    }]);
    if (patientError) throw patientError;

    // Insert labs from diagnostics
    if (diagnostics?.labs?.length) {
      const labRows = diagnostics.labs.map((lab: any) => ({
        id: uuidv4(),
        patient_id: id,
        patient_initials: initials,
        bed_label,
        test_name: lab.test_name,
        value: lab.result ? `${lab.result} ${lab.unit || ''}`.trim() : 'Pending',
        status: lab.flag || 'PENDING',
        critical: lab.flag === 'HIGH' || lab.flag === 'CRITICAL',
        ordered_at: arrival_timestamp || new Date().toISOString(),
        resulted_at: lab.result ? new Date().toISOString() : null,
      }));
      await supabase.from('lab_results').insert(labRows);
    }

    // Insert imaging from diagnostics
    if (diagnostics?.imaging?.length) {
      const imagingRows = diagnostics.imaging.map((img: any) => ({
        id: uuidv4(),
        patient_id: id,
        patient_initials: initials,
        bed_label,
        modality: img.modality || 'Unknown',
        body_part: img.body_area || 'Unknown',
        status: img.status?.toUpperCase().replace(/\s+/g, '_') || 'ORDERED',
        ordered_at: arrival_timestamp || new Date().toISOString(),
        alert_threshold_mins: 60,
      }));
      await supabase.from('imaging_orders').insert(imagingRows);
    }

    // Alert
    const alertSeverity = safety_alerts?.has_conflicts ? 'critical' : esi_level <= 2 ? 'critical' : 'normal';
    await supabase.from('alerts').insert([{
      id: uuidv4(), type: 'NEW_ADMISSION', title: 'Rich Clinical Admission',
      message: `${initials} admitted — Dx: ${assessment?.ai_predicted_diagnosis || chief_complaint}${safety_alerts?.has_conflicts ? ' ⚠ SAFETY ALERT' : ''}`,
      severity: alertSeverity,
    }]);

    return NextResponse.json({
      success: true,
      message: 'Rich clinical payload admitted successfully',
      patient_id: id,
      labs_inserted: diagnostics?.labs?.length || 0,
      imaging_inserted: diagnostics?.imaging?.length || 0,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('External Admission Error:', message);
    return NextResponse.json({ error: 'Failed to process admission', detail: message }, { status: 500 });
  }
}
