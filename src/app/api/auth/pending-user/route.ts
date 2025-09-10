import { NextRequest, NextResponse } from 'next/server';
import { getTemporarySession } from '@/lib/temp-session';

export async function GET(request: NextRequest) {
  try {
    const session = getTemporarySession(request);
    
    if (!session) {
      return NextResponse.json({ error: 'No pending session found' }, { status: 404 });
    }

    return NextResponse.json({ user: session });
  } catch (error) {
    console.error('Error getting pending user:', error);
    return NextResponse.json(
      { error: 'Failed to get pending user session' },
      { status: 500 }
    );
  }
}