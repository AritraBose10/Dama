import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { aiProvider } from '@/lib/ai/provider';
import { generateLawContext, prompts } from '@/lib/ai/prompts';

/**
 * POST /api/ai/sbar
 * Generates a structured SBAR handoff note for a patient using AI.
 * Streams the response back as text.
 * 
 * Body: { "patient_id": "uuid" }
 */
export async function POST(req: Request) {
  try {
    const { patient_id } = await req.json();

    if (!patient_id) {
      return NextResponse.json({ error: 'Missing patient_id' }, { status: 400 });
    }

    // Fetch the full patient record
    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patient_id)
      .single();

    if (error || !patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const context = generateLawContext(patient);
    const sbarPrompt = prompts.SBAR_GENERATE(context);

    // Generate the full text (non-streaming for simplicity in API route)
    const result = await aiProvider.generateText(sbarPrompt);

    return NextResponse.json({
      success: true,
      patient_id,
      patient_name: patient.name || patient.initials,
      sbar: result.text,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('SBAR generation error:', message);
    return NextResponse.json({ error: 'Failed to generate SBAR', detail: message }, { status: 500 });
  }
}
