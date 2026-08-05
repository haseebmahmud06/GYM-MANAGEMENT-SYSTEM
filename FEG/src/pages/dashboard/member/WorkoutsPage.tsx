/**
 * Workouts page - workout logging with set & rep tracking.
 * Create/edit/delete workouts, add exercises with unlimited sets, track rest,
 * view total training volume, and mark workouts complete (detecting PRs).
 */
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Trash2, Dumbbell, Play, CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import {
  useWorkouts, useCreateWorkout, useUpdateWorkout, useDeleteWorkout, useCompleteWorkout,
} from '@/hooks/useWorkouts';
import { formatDate } from '@/lib/utils';
import type { Workout } from '@/types';

const WORKOUT_TYPES = [
  { value: 'strength', label: 'Strength' }, { value: 'cardio', label: 'Cardio' },
  { value: 'hiit', label: 'HIIT' }, { value: 'flexibility', label: 'Flexibility' },
  { value: 'endurance', label: 'Endurance' }, { value: 'mixed', label: 'Mixed' },
];

const STATUS_COLORS: Record<string, string> = {
  planned: 'bg-charcoal-100 text-charcoal-700 dark:bg-charcoal-800 dark:text-charcoal-300',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
};

const emptyWorkout = {
  name: '', date: new Date().toISOString().slice(0, 10),
  start_time: '', end_time: '', notes: '', muscle_group: '', workout_type: 'strength',
};

export default function WorkoutsPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useWorkouts();
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState('all');
  const createWorkout = useCreateWorkout();
  const updateWorkout = useUpdateWorkout();
  const deleteWorkout = useDeleteWorkout();
  const completeWorkout = useCompleteWorkout();

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Workout | null>(null);
  const [form, setForm] = useState({ ...emptyWorkout });

  const workouts = useMemo(() => {
    const list = data?.data?.results ?? [];
    const filtered = list.filter((w) => w.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (tab === 'planned') return filtered.filter((w) => w.status === 'planned');
    if (tab === 'completed') return filtered.filter((w) => w.status === 'completed');
    return filtered;
  }, [data, searchTerm, tab]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyWorkout, date: new Date().toISOString().slice(0, 10) });
    setFormOpen(true);
  };

  const submit = () => {
    if (editing) {
      const payload = {
        name: form.name,
        date: form.date,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        notes: form.notes,
        muscle_group: (form.muscle_group || undefined) as Workout['muscle_group'],
        workout_type: form.workout_type as Workout['workout_type'],
      };
      updateWorkout.mutate({ id: editing.id, data: payload });
    } else {
      createWorkout.mutate(form as Partial<Workout>, {
        onSuccess: (res) => {
          const id = res.data?.id;
          if (id) openLog(id);
        },
      });
    }
    setFormOpen(false);
  };

  const openLog = (id: number) => {
    navigate(`/dashboard/workouts/${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">Workouts</h2>
          <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">
            Log your training sessions and track your volume
          </p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> New Workout</Button>
      </div>

      {/* Summary banner */}
      {workouts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4">
            <p className="text-xs text-charcoal-500">Total Workouts</p>
            <p className="text-2xl font-bold text-charcoal-900 dark:text-white mt-1">{workouts.length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs text-charcoal-500">Completed</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{workouts.filter((w) => w.status === 'completed').length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs text-charcoal-500">Total Volume</p>
            <p className="text-2xl font-bold text-primary-600 mt-1">{Math.round(workouts.reduce((s, w) => s + (w.total_volume || 0), 0))}kg</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs text-charcoal-500">Planned</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{workouts.filter((w) => w.status === 'planned').length}</p>
          </CardContent></Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
          <Input placeholder="Search workouts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="planned">Planned</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Workout list */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      ) : workouts.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-charcoal-500">
          <Dumbbell className="h-12 w-12 mx-auto mb-3 text-charcoal-300" />
          <p className="font-medium">No workouts yet</p>
          <p className="text-sm mt-1">Create your first workout to start tracking.</p>
          <Button className="mt-4" onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> New Workout</Button>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {workouts.map((w) => (
              <motion.div key={w.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card hover className="h-full flex flex-col">
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-charcoal-900 dark:text-white">{w.name}</h3>
                        <p className="text-sm text-charcoal-500 mt-0.5">{formatDate(w.date)}</p>
                      </div>
                      <Badge className={STATUS_COLORS[w.status] || ''}>{w.status.replace('_', ' ')}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Badge variant="secondary" size="sm">{w.workout_type}</Badge>
                      <Badge variant="outline" size="sm">{w.exercise_count} exercises</Badge>
                      <Badge variant="outline" size="sm">{w.total_sets} sets</Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-lg bg-charcoal-50 dark:bg-charcoal-800/50 p-2">
                        <p className="text-xs text-charcoal-500">Volume</p>
                        <p className="font-semibold text-primary-600">{Math.round(w.total_volume)}kg</p>
                      </div>
                      <div className="rounded-lg bg-charcoal-50 dark:bg-charcoal-800/50 p-2">
                        <p className="text-xs text-charcoal-500">Duration</p>
                        <p className="font-semibold text-charcoal-900 dark:text-white">{w.duration_minutes || 0} min</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 pt-3 border-t border-charcoal-100 dark:border-charcoal-800 mt-auto">
                      <Button variant="default" size="sm" className="flex-1" onClick={() => openLog(w.id)}>
                        {w.status === 'planned' ? <><Play className="h-3.5 w-3.5 mr-1" /> Log</> : <>View</>}
                      </Button>
                      {w.status !== 'completed' && (
                        <Button variant="secondary" size="sm" className="flex-1" onClick={() => completeWorkout.mutate(w.id)}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Complete
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => deleteWorkout.mutate(w.id)} aria-label="Delete">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Workout' : 'New Workout'}</DialogTitle>
            <DialogDescription>Set up a training session.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Workout Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Upper Body Push" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Workout Type</Label>
                <Select value={form.workout_type} onValueChange={(v) => setForm({ ...form, workout_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {WORKOUT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start Time</Label>
                <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>End Time</Label>
                <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Muscle Group</Label>
              <Select value={form.muscle_group} onValueChange={(v) => setForm({ ...form, muscle_group: v })}>
                <SelectTrigger><SelectValue placeholder="Select focus muscle group" /></SelectTrigger>
                <SelectContent>
                  {['chest','back','shoulders','legs','arms','core','cardio','full_body'].map((m) => (
                    <SelectItem key={m} value={m}>{m.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="How did it feel? Any notes." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={submit} isLoading={createWorkout.isPending || updateWorkout.isPending}>
              {editing ? 'Save Changes' : 'Create Workout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
