'use client';

import { useState } from 'react';

export default function PushNotificationDemo() {
  const [petName, setPetName] = useState('Buddy');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const sendTestNotification = async (type: string, message: string, title?: string) => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          petName,
          message,
          title
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(`✅ ${data.message}`);
      } else {
        setResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Network error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border border-border rounded-lg bg-muted">
      <h3 className="font-semibold mb-4">Test Push Notifications</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Pet Name</label>
          <input
            type="text"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
            placeholder="Enter pet name"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={() => sendTestNotification('feed', '')}
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm disabled:opacity-50"
          >
            🍖 Feed Reminder
          </button>
          
          <button
            onClick={() => sendTestNotification('medicine', '')}
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm disabled:opacity-50"
          >
            💊 Medicine Reminder
          </button>
          
          <button
            onClick={() => sendTestNotification('vet', '')}
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm disabled:opacity-50"
          >
            🏥 Vet Appointment
          </button>
          
          <button
            onClick={() => sendTestNotification('bath', '')}
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm disabled:opacity-50"
          >
            🛁 Bath Reminder
          </button>
        </div>

        <div className="mt-4">
          <button
            onClick={() => sendTestNotification('custom', 'This is a custom message!', 'Custom Notification')}
            disabled={loading}
            className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm disabled:opacity-50"
          >
            📝 Send Custom Message
          </button>
        </div>

        {result && (
          <div className="p-3 bg-background border border-border rounded-md">
            <p className="text-sm">{result}</p>
          </div>
        )}

        <div className="mt-4 p-3 bg-background rounded border border-border">
          <h4 className="font-medium text-sm mb-2">How to use:</h4>
          <ol className="text-xs text-muted-foreground space-y-1">
            <li>1. Enable push notifications using the manager above</li>
            <li>2. Test different notification types</li>
            <li>3. Check notification permissions in your browser</li>
            <li>4. Notifications work even when app is closed!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}