import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const alerts = db.prepare('SELECT * FROM alerts ORDER BY created_at DESC LIMIT 50').all();
    
    return NextResponse.json({ success: true, alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch alerts' }, { status: 500 });
  }
}
