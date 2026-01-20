'use client';

import { useEffect, useState } from 'react';

interface PushSubscriptionState {
  subscription: PushSubscription | null;
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
}

export default function PushNotificationManager() {
  const [state, setState] = useState<PushSubscriptionState>({
    subscription: null,
    isSupported: false,
    isSubscribed: false,
    permission: 'default'
  });

  useEffect(() => {
    checkPushSupport();
  }, []);

  const checkPushSupport = async () => {
    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    const permission = await Notification.requestPermission();
    
    setState(prev => ({
      ...prev,
      isSupported,
      permission
    }));

    if (isSupported) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      setState(prev => ({
        ...prev,
        subscription,
        isSubscribed: !!subscription
      }));
    }
  };

  const subscribeToPush = async () => {
    if (!state.isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // In production, you'd get this from your server
      const VAPID_PUBLIC_KEY = 'BDdXhKqB8C9r8k7O6V4W5M2X1Y7S6P8T9Q3R7W2E1A5F6G7H8J9K';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      setState(prev => ({
        ...prev,
        subscription,
        isSubscribed: true
      }));

      // Send subscription to server
      await sendSubscriptionToServer(subscription);
      
      console.log('Subscribed to push notifications:', subscription);
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  };

  const unsubscribeFromPush = async () => {
    if (!state.subscription) return;

    try {
      await state.subscription.unsubscribe();
      setState(prev => ({
        ...prev,
        subscription: null,
        isSubscribed: false
      }));
      
      // Remove from server
      await removeSubscriptionFromServer(state.subscription);
      
      console.log('Unsubscribed from push notifications');
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    }
  };

  const sendSubscriptionToServer = async (subscription: PushSubscription) => {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  };

  const removeSubscriptionFromServer = async (subscription: PushSubscription) => {
    try {
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      });
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  };

  if (!state.isSupported) {
    return (
      <div className="p-4 border border-border rounded-lg bg-muted">
        <p className="text-sm text-muted-foreground">
          Push notifications are not supported in this browser.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-border rounded-lg bg-muted">
      <h3 className="font-semibold mb-2">Push Notifications</h3>
      
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Status: {state.isSubscribed ? 'Subscribed' : 'Not subscribed'}
        </p>
        
        <p className="text-sm text-muted-foreground">
          Permission: {state.permission}
        </p>

        {state.permission === 'default' && (
          <button
            onClick={checkPushSupport}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
          >
            Request Permission
          </button>
        )}

        {state.permission === 'granted' && !state.isSubscribed && (
          <button
            onClick={subscribeToPush}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
          >
            Enable Notifications
          </button>
        )}

        {state.isSubscribed && (
          <button
            onClick={unsubscribeFromPush}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm"
          >
            Disable Notifications
          </button>
        )}
      </div>

      <div className="mt-4 p-3 bg-background rounded border border-border">
        <p className="text-xs text-muted-foreground">
          📱 Enable push notifications to get alerts when your pets need to be fed, 
          when medication is due, or for important health reminders.
        </p>
      </div>
    </div>
  );
}