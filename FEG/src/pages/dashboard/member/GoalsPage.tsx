/**
 * Goals page - create and track fitness goals with progress indicators.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, Trash2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from '@/hooks/useWorkouts';
import type { WorkoutGoal } from '@/types';

const METRICS = [
  { value: 'weekly_sessions', label: 'Weekly Sessions', unit: 'sessions' },
  { value: 'training_volume', label: 'Training Volume', unit: 'kg' },
  { value: 'weight', label: 'Body Weight', unit: 'kg' },
  { value: 'bmi', label: 'BMI', unit: 'BMI' },
  { value: 'distance', label: 'Distance', unit: 'km' },
  { value: 'custom', label: 'Custom', unit: '' },
];

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  missed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export default function GoalsPage() {
  const { data, isLoading } = useGoals();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  const goals = data?.data?.results ?? [];

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WorkoutGoal | null>(null);
  const [form, setForm] = useState({ name: '', metric: 'weekly_sessions', target: '', unit: 'sessions' });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', metric: 'weekly_sessions', target: '', unit: 'sessions' });
    setOpen(true);
  };

  const openEdit = (g: WorkoutGoal) => {
    setEditing(g);
    setForm({ name: g.name, metric: g.metric, target: String(g.target_value), unit: g.unit });
    setOpen(true);
  };

  const onMetricChange = (m: string) => {
    const meta = METRICS.find((x) => x.value === m);
    setForm({ ...form, metric: m, unit: meta?.unit || '' });
  };

  const submit = () => {
    const payload = {
      name: form.name,
      metric: form.metric,
      target_value: Number(form.target),
      unit: form.unit,
    };
    if (editing) {
      updateGoal.mutate({ id: editing.id, data: payload });
    } else {
      createGoal.mutate(payload);
    }
    setOpen(false);
  };

  const markComplete = (g: WorkoutGoal) => {
    updateGoal.mutate({ id: g.id, data: { status: 'completed', current_value: g.target_value } });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">Goals</h2>
          <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">Set and track your fitness goals</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> New Goal</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : goals.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-charcoal-500">
          <Target className="h-12 w-12 mx-auto mb-3 text-charcoal-300" />
          <p className="font-medium">No goals yet</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {goals.map((g) => (
              <motion.div key={g.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card hover>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary-600" />
                        <div>
                          <p className="font-semibold text-charcoal-900 dark:text-white">{g.name}</p>
                          <p className="text-xs text-charcoal-500 capitalize">{g.metric.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge className={STATUS_COLORS[g.status] || ''}>{g.status}</Badge>
                        <Button variant="ghost" size="icon" onClick={() => deleteGoal.mutate(g.id)} aria-label="Delete"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-charcoal-500">{g.current_value} / {g.target_value} {g.unit}</span>
                        <span className="font-semibold text-primary-600">{g.progress_pct}%</span>
                      </div>
                      <Progress value={g.progress_pct} className="h-2" />
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <button onClick={() => openEdit(g)} className="text-sm text-primary-600 hover:underline">Update progress</button>
                      {g.status === 'active' && (
                        <Button variant="ghost" size="sm" onClick={() => markComplete(g)}>
                          <CheckCircle2 className="h-4 w-4 mr-1 text-emerald-500" /> Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Goal' : 'New Goal'}</DialogTitle>
            <DialogDescription>Define what you want to achieve.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Goal Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Train 4x per week" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Metric</Label>
                <Select value={form.metric} onValueChange={onMetricChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {METRICS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Target Value</Label>
                <Input type="number" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} min={0} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} isLoading={createGoal.isPending || updateGoal.isPending}>Save Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
