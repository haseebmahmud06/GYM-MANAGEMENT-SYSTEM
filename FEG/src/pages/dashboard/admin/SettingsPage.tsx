/**
 * Settings page for admin to configure system preferences.
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Globe, Mail, Moon, Sun, Palette, Clock, Save } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore();
  const [gymName, setGymName] = useState('Fitness First Gym');
  const [gymEmail, setGymEmail] = useState('info@fitnessfirstgym.com');
  const [gymPhone, setGymPhone] = useState('+234 800 123 4567');
  const [gymAddress, setGymAddress] = useState('123 Fitness Avenue, Lagos, Nigeria');
  const [checkinWindow, setCheckinWindow] = useState('15');
  const [bookingLead, setBookingLead] = useState('24');
  const [autoRenew, setAutoRenew] = useState(true);

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">Settings</h2>
          <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">Configure system preferences and gym information</p>
        </div>
        <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" />Save Settings</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-primary-600" />Gym Information</CardTitle>
            <CardDescription>Update your gym's public information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">Gym Name</label>
              <Input value={gymName} onChange={(e) => setGymName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">Email Address</label>
              <Input type="email" value={gymEmail} onChange={(e) => setGymEmail(e.target.value)} icon={<Mail className="h-4 w-4" />} />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">Phone Number</label>
              <Input value={gymPhone} onChange={(e) => setGymPhone(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">Address</label>
              <Input value={gymAddress} onChange={(e) => setGymAddress(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary-600" />Appearance</CardTitle>
            <CardDescription>Customize the look and feel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">Theme Mode</label>
              <div className="flex gap-2">
                <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')} className="flex-1">
                  <Sun className="h-4 w-4 mr-2" />Light
                </Button>
                <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')} className="flex-1">
                  <Moon className="h-4 w-4 mr-2" />Dark
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">Primary Color</label>
              <div className="flex gap-2">
                {['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'].map((color) => (
                  <button key={color} className="h-8 w-8 rounded-full border-2 border-transparent hover:border-charcoal-300 transition-all" style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary-600" />Booking Settings</CardTitle>
            <CardDescription>Configure booking rules and check-in policies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">Late Check-in Window (minutes)</label>
              <Input type="number" value={checkinWindow} onChange={(e) => setCheckinWindow(e.target.value)} />
              <p className="text-xs text-charcoal-400 mt-1">Members are marked late if they check in after this window</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">Minimum Booking Lead Time (hours)</label>
              <Input type="number" value={bookingLead} onChange={(e) => setBookingLead(e.target.value)} />
              <p className="text-xs text-charcoal-400 mt-1">How far in advance members must book</p>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-charcoal-50 dark:bg-charcoal-900">
              <div>
                <p className="text-sm font-medium text-charcoal-900 dark:text-white">Auto-renew Memberships</p>
                <p className="text-xs text-charcoal-500">Automatically renew expiring memberships</p>
              </div>
              <button
                onClick={() => setAutoRenew(!autoRenew)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoRenew ? 'bg-primary-600' : 'bg-charcoal-300 dark:bg-charcoal-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoRenew ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary-600" />Notifications</CardTitle>
            <CardDescription>Configure email and system notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'New Member Registration', desc: 'Notify when a new member registers', enabled: true },
              { label: 'Payment Received', desc: 'Notify when a payment is completed', enabled: true },
              { label: 'Booking Confirmation', desc: 'Notify when a booking is made', enabled: true },
              { label: 'Membership Expiry', desc: 'Notify when memberships are about to expire', enabled: true },
              { label: 'Equipment Maintenance', desc: 'Notify when equipment needs maintenance', enabled: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-charcoal-50 dark:bg-charcoal-900">
                <div>
                  <p className="text-sm font-medium text-charcoal-900 dark:text-white">{item.label}</p>
                  <p className="text-xs text-charcoal-500">{item.desc}</p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.enabled ? 'bg-primary-600' : 'bg-charcoal-300 dark:bg-charcoal-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}