import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data: labs, error } = await supabase
      .from('lab_results')
      .select('*')
      .order('ordered_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(labs || []);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Labs fetch error:', message);
    return NextResponse.json({ error: 'Failed to fetch labs', detail: message }, { status: 500 });
  }
}
