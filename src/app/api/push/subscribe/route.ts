import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo (use database in production)
let pushSubscriptions: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();
    
    // Store subscription in database
    pushSubscriptions.push({
      ...subscription,
      createdAt: new Date(),
      userId: 'demo-user' // Get from session/auth in production
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ subscriptions: pushSubscriptions.length });
}