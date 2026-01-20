import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo (use database in production)
let pushSubscriptions: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const { endpoint } = await request.json();
    
    // Remove subscription from database
    pushSubscriptions = pushSubscriptions.filter(
      sub => sub.endpoint !== endpoint
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
}