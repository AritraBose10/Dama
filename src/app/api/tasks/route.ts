import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient';

/**
 * GET /api/tasks?patient_id=uuid
 * Fetch clinical tasks for a specific patient.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patient_id');

    if (!patientId) {
      return NextResponse.json({ error: 'Missing patient_id parameter' }, { status: 400 });
    }

    const { data: tasks, error } = await supabase
      .from('clinical_tasks')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json(tasks || []);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to fetch tasks', detail: message }, { status: 500 });
  }
}

/**
 * POST /api/tasks
 * Create a new clinical task.
 * Body: { patient_id, type, title, details?, assigned_role? }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { patient_id, type, title, details, assigned_role } = body;

    if (!patient_id || !type || !title) {
      return NextResponse.json({ error: 'Missing required fields: patient_id, type, title' }, { status: 400 });
    }

    const id = uuidv4();
    const { error } = await supabase.from('clinical_tasks').insert([{
      id,
      patient_id,
      type,
      title,
      details: details || null,
      assigned_role: assigned_role || 'RN',
      status: 'PENDING',
    }]);

    if (error) throw error;
    return NextResponse.json({ success: true, id });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to create task', detail: message }, { status: 500 });
  }
}

/**
 * PATCH /api/tasks
 * Toggle a task's status.
 * Body: { task_id, status, completed_by? }
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { task_id, status, completed_by } = body;

    if (!task_id || !status) {
      return NextResponse.json({ error: 'Missing required fields: task_id, status' }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = { status };
    if (status === 'COMPLETED') {
      updatePayload.completed_at = new Date().toISOString();
      updatePayload.completed_by = completed_by || 'staff';
    } else {
      updatePayload.completed_at = null;
      updatePayload.completed_by = null;
    }

    const { error } = await supabase
      .from('clinical_tasks')
      .update(updatePayload)
      .eq('id', task_id);

    if (error) throw error;
    return NextResponse.json({ success: true, task_id, status });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to update task', detail: message }, { status: 500 });
  }
}
