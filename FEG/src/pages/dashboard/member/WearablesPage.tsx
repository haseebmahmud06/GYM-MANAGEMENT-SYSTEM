/**
 * Wearable Integration page - connect wearable devices and view synced health
 * data (heart rate, calories, steps, duration, distance, pace, active minutes,
 * sleep). Built with an extensible architecture so new providers can be added.
 */
import { useMemo, useState } from 'react';
import {
  Plus, Watch, Heart, Flame, Footprints, Moon, Timer, Gauge, Trash2, Activity,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  useWearableDevices, useWearableData, useConnectWearable, useDisconnectWearable,
} from '@/hooks/useWorkouts';
import { isAuthenticated } from '@/lib/api';

const DEVICE_OPTIONS = [
  { value: 'apple_watch', label: 'Apple Watch' },
  { value: 'garmin', label: 'Garmin' },
  { value: 'fitbit', label: 'Fitbit' },
  { value: 'whoop', label: 'Whoop' },
  { value: 'samsung', label: 'Samsung Health' },
  { value: 'google_fit', label: 'Google Fit' },
  { value: 'polar', label: 'Polar' },
  { value: 'other', label: 'Other' },
];

export default function WearablesPage() {
  const { data: devicesData, isLoading: devicesLoading } = useWearableDevices();
  const { data: dataData, isLoading: dataLoading } = useWearableData({ date_from: undefined });

  const connectWearable = useConnectWearable();
  const disconnectWearable = useDisconnectWearable();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ device_type: 'apple_watch', name: '' });

  const devices = devicesData?.data ?? [];
  const dataPoints = dataData?.data?.results ?? [];
  const connected = isAuthenticated();

  const latest = dataPoints[0] ?? null;

  const submit = () => {
    connectWearable.mutate({ device_type: form.device_type as never, name: form.name, provider: 'manual' }, {
      onSuccess: () => setOpen(false),
    });
  };

  const metricCards = useMemo(
    () => [
      { label: 'Heart Rate', value: latest?.heart_rate ? `${latest.heart_rate} bpm` : '—', icon: Heart },
      { label: 'Calories', value: latest?.calories ? `${Math.round(latest.calories)}` : '—', icon: Flame },
      { label: 'Steps', value: latest?.steps ? latest.steps.toLocaleString() : '—', icon: Footprints },
      { label: 'Sleep', value: latest?.sleep_hours ? `${latest.sleep_hours} h` : '—', icon: Moon },
      { label: 'Active Min', value: latest?.active_minutes ? `${latest.active_minutes}` : '—', icon: Timer },
      { label: 'Distance', value: latest?.distance_km ? `${latest.distance_km} km` : '—', icon: Gauge },
    ],
    [latest]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">Wearable Integration</h2>
          <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">
            Connect your devices and sync your fitness data
          </p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" /> Connect Device</Button>
      </div>

      {/* Connection status */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20">
              <Watch className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-charcoal-900 dark:text-white">Health integration</p>
              <p className="text-sm text-charcoal-500">Synced via our extensible wearable provider layer</p>
            </div>
          </div>
          <Badge variant={connected ? 'success' : 'secondary'}>
            {connected ? 'Connected' : 'Disconnected'}
          </Badge>
        </CardContent>
      </Card>

      {/* Connected devices */}
      <div>
        <h3 className="mb-3 font-semibold text-charcoal-900 dark:text-white">Connected Devices</h3>
        {devicesLoading ? (
          <Skeleton className="h-24" />
        ) : devices.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-charcoal-500">
            <Watch className="h-10 w-10 mx-auto mb-2 text-charcoal-300" />
            No devices connected yet. Connect one to start syncing.
          </CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {devices.map((d) => (
              <Card key={d.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Watch className="h-8 w-8 text-primary-600" />
                    <div>
                      <p className="font-semibold">{d.name}</p>
                      <p className="text-sm text-charcoal-500 capitalize">{d.device_type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={d.is_connected ? 'success' : 'secondary'}>
                      {d.is_connected ? 'Connected' : 'Off'}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => disconnectWearable.mutate(d.id)} aria-label="Disconnect">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Latest metrics */}
      <div>
        <h3 className="mb-3 font-semibold text-charcoal-900 dark:text-white">Latest Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {metricCards.map((m) => {
            const Icon = m.icon;
            return (
              <Card key={m.label}><CardContent className="p-4">
                <Icon className="h-5 w-5 text-primary-600" />
                <p className="mt-2 text-xl font-bold text-charcoal-900 dark:text-white">{m.value}</p>
                <p className="text-xs text-charcoal-500">{m.label}</p>
              </CardContent></Card>
            );
          })}
        </div>
      </div>

      {/* Data history */}
      <div>
        <h3 className="mb-3 font-semibold text-charcoal-900 dark:text-white">Synced Data</h3>
        {dataLoading ? (
          <Skeleton className="h-48" />
        ) : dataPoints.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-charcoal-500">
            <Activity className="h-10 w-10 mx-auto mb-2 text-charcoal-300" />
            No synced data yet.
          </CardContent></Card>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-charcoal-200 dark:border-charcoal-800">
            <table className="w-full text-sm">
              <thead className="bg-charcoal-50 dark:bg-charcoal-800/50">
                <tr className="text-left text-xs text-charcoal-500">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">HR</th>
                  <th className="py-3 px-4">Calories</th>
                  <th className="py-3 px-4">Steps</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Distance</th>
                  <th className="py-3 px-4">Sleep</th>
                </tr>
              </thead>
              <tbody>
                {dataPoints.slice(0, 15).map((d) => (
                  <tr key={d.id} className="border-b border-charcoal-100 dark:border-charcoal-800/50">
                    <td className="py-2.5 px-4">{d.date}</td>
                    <td className="py-2.5 px-4">{d.heart_rate ?? '—'}</td>
                    <td className="py-2.5 px-4">{d.calories ?? '—'}</td>
                    <td className="py-2.5 px-4">{d.steps ?? '—'}</td>
                    <td className="py-2.5 px-4">{d.duration_minutes ? `${d.duration_minutes}m` : '—'}</td>
                    <td className="py-2.5 px-4">{d.distance_km ? `${d.distance_km}km` : '—'}</td>
                    <td className="py-2.5 px-4">{d.sleep_hours ? `${d.sleep_hours}h` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Connect dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Wearable Device</DialogTitle>
            <DialogDescription>Choose your device type and give it a name.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Device Type</Label>
              <Select value={form.device_type} onValueChange={(v) => setForm({ ...form, device_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEVICE_OPTIONS.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Device Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. My Apple Watch" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} isLoading={connectWearable.isPending}>Connect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
