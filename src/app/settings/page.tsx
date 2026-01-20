import PushNotificationManager from '@/components/feat/PushNotificationManager';
import PushNotificationDemo from '@/components/feat/PushNotificationDemo';

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-6">
        <PushNotificationManager />
        <PushNotificationDemo />
      </div>
    </div>
  );
}