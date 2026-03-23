import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data: imaging, error } = await supabase
      .from('imaging_orders')
      .select('*')
      .order('ordered_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(imaging || []);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Imaging fetch error:', message);
    return NextResponse.json({ error: 'Failed to fetch imaging', detail: message }, { status: 500 });
  }
}
