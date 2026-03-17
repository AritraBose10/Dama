import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    // This route simulates an external system calling the admit webhook
    const mockAdmission = {
      external_id: `SYS-${Math.floor(Math.random() * 10000)}`,
      initials: 'SIM',
      age: Math.floor(Math.random() * 50) + 20,
      gender: Math.random() > 0.5 ? 'M' : 'F',
      esi_level: Math.floor(Math.random() * 2) + 1, // High severity
      chief_complaint: 'EXTERNAL SYSTEM ADMISSION: Suspected Myocardial Infarction detected by Sensor AI.',
      source: 'AGENTIC_HOST'
    };

    // Construct the URL to the webhook endpoint accurately
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const host = process.env.NEXT_PUBLIC_HOST || 'localhost:3000';
    
    // We can't easily fetch from within a route handler in some environments without the full URL
    // So we'll just return the schema to the user or if possible do a direct call to the DB logic
    // But for a true simulation, a POST is better.
    
    return NextResponse.json({ 
      instruction: "To simulate an external admission, run this CURL command:",
      curl: `curl -X POST http://localhost:3000/api/external/admit -H "Content-Type: application/json" -d '${JSON.stringify(mockAdmission)}'`
    });
  } catch (error) {
    return NextResponse.json({ error: 'Simulation failed' }, { status: 500 });
  }
}
