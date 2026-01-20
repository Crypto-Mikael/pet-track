import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo (use database in production)
let pushSubscriptions: any[] = [];

const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'demo-key';
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BDdXhKqB8C9r8k7O6V4W5M2X1Y7S6P8T9Q3R7W2E1A5F6G7H8J9K';

export async function POST(request: NextRequest) {
  try {
    const { type, petName, message, title } = await request.json();

    let notificationTitle = 'Pet Track';
    let notificationBody = message;
    let notificationData = {};

    switch (type) {
      case 'feed':
        notificationTitle = `Time to feed ${petName}!`;
        notificationBody = `${petName} is due for feeding. Don't forget! 🍖`;
        notificationData = { type: 'feed', petName };
        break;
      
      case 'medicine':
        notificationTitle = `Medicine Reminder for ${petName}`;
        notificationBody = `${petName} needs medication. Time for dose! 💊`;
        notificationData = { type: 'medicine', petName };
        break;
      
      case 'vet':
        notificationTitle = `Vet Appointment for ${petName}`;
        notificationBody = `Upcoming vet appointment for ${petName}. 🏥`;
        notificationData = { type: 'vet', petName };
        break;
      
      case 'bath':
        notificationTitle = `Bath Time for ${petName}!`;
        notificationBody = `${petName} is due for a bath. 🛁`;
        notificationData = { type: 'bath', petName };
        break;
      
      default:
        notificationTitle = title || 'Pet Update';
        notificationBody = message || 'New update for your pet';
        notificationData = { type: 'general' };
    }

    // Send push notification to all subscribers
    const payload = JSON.stringify({
      title: notificationTitle,
      body: notificationBody,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: notificationData,
      actions: [
        {
          action: 'view',
          title: 'View Pet',
          icon: '/icons/icon-72x72.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/icon-72x72.png'
        }
      ]
    });

    // Send to all subscriptions
    const promises = pushSubscriptions.map(async (subscription) => {
      try {
        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${process.env.FCM_SERVER_KEY || 'demo-key'}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: subscription.endpoint,
            notification: JSON.parse(payload),
            webpush: {
              headers: {
                'TTL': '60'
              }
            }
          })
        });

        if (!response.ok) {
          console.error('Failed to send push notification:', await response.text());
          // Remove invalid subscription
          pushSubscriptions = pushSubscriptions.filter(
            sub => sub.endpoint !== subscription.endpoint
          );
        }
      } catch (error) {
        console.error('Error sending push notification:', error);
      }
    });

    await Promise.all(promises);

    return NextResponse.json({ 
      success: true, 
      message: `Notification sent to ${pushSubscriptions.length} subscribers`,
      title: notificationTitle,
      body: notificationBody 
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}