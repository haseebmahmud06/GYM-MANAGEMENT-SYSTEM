/**
 * Measurements page - record and track body measurements (weight, BMI,
 * body fat, circumferences) over time.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Scale, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useMeasurements, useCreateMeasurement, useDeleteMeasurement } from '@/hooks/useWorkouts';
import { useAuthStore } from '@/stores/authStore';
import { formatDate } from '@/lib/utils';
import type { BodyMeasurement } from '@/types';

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  weight_kg: '', height_cm: '', body_fat_pct: '',
  chest_cm: '', waist_cm: '', arm_cm: '', leg_cm: '', notes: '',
};

export default function MeasurementsPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useMeasurements({ page_size: 100 });
  const createMeasurement = useCreateMeasurement();
  const deleteMeasurement = useDeleteMeasurement();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm, height_cm: user?.height_cm ? String(user.height_cm) : '' });

  const measurements = data?.data?.results ?? [];

  const latest = measurements[0];

  const openForm = () => {
    setForm({ ...emptyForm, height_cm: user?.height_cm ? String(user.height_cm) : '' });
    setOpen(true);
  };

  const submit = () => {
    const payload: Partial<BodyMeasurement> = {
      date: form.date,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      height_cm: form.height_cm ? Number(form.height_cm) : null,
      body_fat_pct: form.body_fat_pct ? Number(form.body_fat_pct) : null,
      chest_cm: form.chest_cm ? Number(form.chest_cm) : null,
      waist_cm: form.waist_cm ? Number(form.waist_cm) : null,
      arm_cm: form.arm_cm ? Number(form.arm_cm) : null,
      leg_cm: form.leg_cm ? Number(form.leg_cm) : null,
      notes: form.notes,
    };
    createMeasurement.mutate(payload, { onSuccess: () => setOpen(false) });
  };

  const statRow = (label: string, value: number | null | undefined, unit: string) => (
    <div className="rounded-lg bg-charcoal-50 p-3 dark:bg-charcoal-800/50">
      <p className="text-xs text-charcoal-500">{label}</p>
      <p className="mt-1 font-semibold text-charcoal-900 dark:text-white">
        {value != null ? <>{value} <span className="text-xs text-charcoal-400">{unit}</span></> : '—'}
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">Body Measurements</h2>
          <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">Track your body composition over time</p>
        </div>
        <Button onClick={openForm}><Plus className="h-4 w-4 mr-2" /> Add Measurement</Button>
      </div>

      {/* Current snapshot */}
      {latest && (
        <Card className="bg-charcoal-950 text-white border-0 dark:bg-black">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Scale className="h-5 w-5" /> Latest ({formatDate(latest.date)})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-xs text-white/70">Weight</p>
                <p className="mt-1 text-xl font-bold">{latest.weight_kg ?? '—'} kg</p>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-xs text-white/70">BMI</p>
                <p className="mt-1 text-xl font-bold">{latest.bmi ?? '—'}</p>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-xs text-white/70">Body Fat</p>
                <p className="mt-1 text-xl font-bold">{latest.body_fat_pct ?? '—'}%</p>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-xs text-white/70">Waist</p>
                <p className="mt-1 text-xl font-bold">{latest.waist_cm ?? '—'} cm</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : measurements.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-charcoal-500">
          <Activity className="h-12 w-12 mx-auto mb-3 text-charcoal-300" />
          <p className="font-medium">No measurements recorded</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {measurements.map((m) => (
              <motion.div key={m.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card hover>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{formatDate(m.date)}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="success" size="sm">BMI {m.bmi ?? '—'}</Badge>
                        <Button variant="ghost" size="icon" onClick={() => deleteMeasurement.mutate(m.id)} aria-label="Delete">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {statRow('Weight', m.weight_kg, 'kg')}
                      {statRow('Body Fat', m.body_fat_pct, '%')}
                      {statRow('Chest', m.chest_cm, 'cm')}
                      {statRow('Waist', m.waist_cm, 'cm')}
                      {statRow('Arm', m.arm_cm, 'cm')}
                      {statRow('Leg', m.leg_cm, 'cm')}
                    </div>
                    {m.notes && <p className="mt-3 text-sm text-charcoal-500">{m.notes}</p>}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add form dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Measurement</DialogTitle>
            <DialogDescription>Record your current body metrics.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5"><Label>Weight (kg)</Label><Input type="number" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Height (cm)</Label><Input type="number" value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Body Fat (%)</Label><Input type="number" value={form.body_fat_pct} onChange={(e) => setForm({ ...form, body_fat_pct: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-1.5"><Label>Chest</Label><Input type="number" value={form.chest_cm} onChange={(e) => setForm({ ...form, chest_cm: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Waist</Label><Input type="number" value={form.waist_cm} onChange={(e) => setForm({ ...form, waist_cm: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Arm</Label><Input type="number" value={form.arm_cm} onChange={(e) => setForm({ ...form, arm_cm: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Leg</Label><Input type="number" value={form.leg_cm} onChange={(e) => setForm({ ...form, leg_cm: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} isLoading={createMeasurement.isPending}>Save Measurement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
