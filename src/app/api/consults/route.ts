import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data: consults, error } = await supabase
      .from('consults')
      .select('*')
      .order('called_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(consults || []);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Consults fetch error:', message);
    return NextResponse.json({ error: 'Failed to fetch consults', detail: message }, { status: 500 });
  }
}
