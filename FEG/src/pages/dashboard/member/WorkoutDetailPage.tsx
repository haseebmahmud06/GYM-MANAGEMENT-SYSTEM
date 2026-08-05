/**
 * Workout Detail page - log and manage a single workout.
 * Add exercises from the library, track unlimited sets with weight/reps/RPE/
 * rest time, start the integrated rest timer after a set, and complete the
 * workout (detecting personal records). Displays total training volume.
 */
import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Trash2, CheckCircle2, Search, Dumbbell,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import RestTimer from '@/components/workout/RestTimer';
import {
  useWorkout, useAddWorkoutExercise, useDeleteWorkoutExercise,
  useAddSet, useDeleteSet, useCompleteWorkout, useExercises,
} from '@/hooks/useWorkouts';
import { useRestTimer } from '@/stores/restTimerStore';
import { formatDate } from '@/lib/utils';
import type { WorkoutExercise, WorkoutSet, Exercise } from '@/types';

export default function WorkoutDetailPage() {
  const { id } = useParams();
  const workoutId = Number(id);
  const navigate = useNavigate();

  const { data: workoutData, isLoading } = useWorkout(workoutId);
  const workout = workoutData?.data;
  const { data: exerciseData } = useExercises({ page_size: 100 });
  const library = exerciseData?.data?.results ?? [];

  const addExercise = useAddWorkoutExercise();
  const deleteExercise = useDeleteWorkoutExercise();
  const addSet = useAddSet();
  const deleteSet = useDeleteSet();
  const completeWorkout = useCompleteWorkout();

  // Rest timer - automatically start after logging a set.
  const startRest = useRestTimer((s) => s.start);

  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [newExerciseName, setNewExerciseName] = useState('');

  // Set form per exercise: keyed by exercise id -> draft set
  const [drafts, setDrafts] = useState<Record<number, { weight: string; reps: string; rpe: string; rest: string }>>({});

  const exercises = workout?.exercises ?? [];
  const totalVolume = workout?.total_volume ?? 0;

  const filteredLibrary = useMemo(() => {
    const usedNames = new Set(exercises.map((e) => e.exercise_name.toLowerCase()));
    return library.filter(
      (e) =>
        !usedNames.has(e.name.toLowerCase()) &&
        (!search || e.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [library, exercises, search]);

  const draftFor = (exId: number) =>
    drafts[exId] ?? { weight: '', reps: '', rpe: '', rest: '60' };

  const handleAddExercise = (ex: Exercise) => {
    addExercise.mutate(
      { workout: workoutId, exercise: ex.id, exercise_name: ex.name, order: exercises.length },
      {
        onSuccess: () => { setAddOpen(false); setSearch(''); },
      }
    );
  };

  const handleAddCustom = () => {
    if (!newExerciseName.trim()) return;
    addExercise.mutate(
      { workout: workoutId, exercise: null, exercise_name: newExerciseName.trim(), order: exercises.length },
      { onSuccess: () => { setNewExerciseName(''); } }
    );
  };

  const handleAddSet = (we: WorkoutExercise) => {
    const d = draftFor(we.id);
    const setNumber = (we.sets?.length ?? 0) + 1;
    addSet.mutate({
      workout_exercise: we.id,
      set_number: setNumber,
      weight: d.weight ? Number(d.weight) : null,
      reps: d.reps ? Number(d.reps) : null,
      rpe: d.rpe ? Number(d.rpe) : null,
      rest_time: d.rest ? Number(d.rest) : 60,
      notes: '',
    });
    // Start rest timer.
    if (d.rest) startRest(Number(d.rest));
    // Clear the draft.
    setDrafts((prev) => ({ ...prev, [we.id]: { weight: '', reps: '', rpe: '', rest: d.rest } }));
  };

  const handleSetField = (exId: number, field: string, value: string) => {
    setDrafts((prev) => ({ ...prev, [exId]: { ...(prev[exId] ?? { weight: '', reps: '', rpe: '', rest: '60' }), [field]: value } }));
  };

  const handleComplete = () => {
    completeWorkout.mutate(workoutId);
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-40" /></div>;
  }

  if (!workout) {
    return (
      <Card><CardContent className="p-12 text-center text-charcoal-500">
        Workout not found.
        <div className="mt-4"><Button variant="outline" onClick={() => navigate('/dashboard/workouts')}>Back to Workouts</Button></div>
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/workouts')} aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">{workout.name}</h2>
            <p className="text-charcoal-500 dark:text-charcoal-400 mt-0.5 flex items-center gap-2">
              {formatDate(workout.date)}
              <Badge variant="secondary" size="sm">{workout.workout_type}</Badge>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {workout.status !== 'completed' && (
            <Button onClick={handleComplete} isLoading={completeWorkout.isPending}>
              <CheckCircle2 className="h-4 w-4 mr-2" /> Complete Workout
            </Button>
          )}
        </div>
      </div>

      {/* Rest timer always available on this page */}
      <RestTimer />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Volume', value: `${Math.round(totalVolume)} kg`, color: 'text-primary-600' },
          { label: 'Exercises', value: `${workout.exercise_count}`, color: '' },
          { label: 'Sets', value: `${workout.total_sets}`, color: '' },
          { label: 'Duration', value: `${workout.duration_minutes || 0} min`, color: '' },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-4">
            <p className="text-xs text-charcoal-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color} text-charcoal-900 dark:text-white`}>{s.value}</p>
          </CardContent></Card>
        ))}
      </div>

      {/* Add exercise */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Exercise
        </Button>
      </div>

      {/* Exercises with sets */}
      {exercises.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-charcoal-500">
          <Dumbbell className="h-12 w-12 mx-auto mb-3 text-charcoal-300" />
          <p className="font-medium">No exercises logged</p>
          <p className="text-sm mt-1">Add exercises to start tracking your sets.</p>
          <Button className="mt-4" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Exercise</Button>
        </CardContent></Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {exercises.map((we, idx) => (
              <motion.div key={we.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-50 text-sm font-bold text-primary-600 dark:bg-primary-900/20">
                          {idx + 1}
                        </span>
                        {we.exercise_name}
                      </CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => deleteExercise.mutate(we.id)} aria-label="Remove">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Set input row */}
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      <Input
                        type="number" placeholder="Weight" value={draftFor(we.id).weight}
                        onChange={(e) => handleSetField(we.id, 'weight', e.target.value)}
                      />
                      <Input
                        type="number" placeholder="Reps" value={draftFor(we.id).reps}
                        onChange={(e) => handleSetField(we.id, 'reps', e.target.value)}
                      />
                      <Input
                        type="number" placeholder="RPE" min={0} max={10} value={draftFor(we.id).rpe}
                        onChange={(e) => handleSetField(we.id, 'rpe', e.target.value)}
                      />
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number" placeholder="Rest" value={draftFor(we.id).rest}
                          onChange={(e) => handleSetField(we.id, 'rest', e.target.value)}
                          className="flex-1"
                        />
                        <span className="text-xs whitespace-nowrap">s</span>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleAddSet(we)} disabled={addSet.isPending}>
                      <Plus className="h-4 w-4 mr-1" /> Add Set
                    </Button>

                    {/* Logged sets */}
                    {we.sets && we.sets.length > 0 ? (
                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-charcoal-200 dark:border-charcoal-800 text-left text-xs text-charcoal-500">
                              <th className="py-2 px-2">#</th>
                              <th className="py-2 px-2">Weight</th>
                              <th className="py-2 px-2">Reps</th>
                              <th className="py-2 px-2">RPE</th>
                              <th className="py-2 px-2">Rest</th>
                              <th className="py-2 px-2">Volume</th>
                              <th className="py-2 px-2"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {we.sets.map((s: WorkoutSet) => (
                              <tr key={s.id} className="border-b border-charcoal-100 dark:border-charcoal-800/50">
                                <td className="py-2 px-2">{s.set_number}</td>
                                <td className="py-2 px-2">{s.weight ?? '—'}</td>
                                <td className="py-2 px-2">{s.reps ?? '—'}</td>
                                <td className="py-2 px-2">{s.rpe ?? '—'}</td>
                                <td className="py-2 px-2">{s.rest_time ? `${s.rest_time}s` : '—'}</td>
                                <td className="py-2 px-2 font-medium text-primary-600">{Math.round(s.volume)}</td>
                                <td className="py-2 px-2">
                                  <button onClick={() => deleteSet.mutate(s.id)} className="text-red-500 hover:text-red-700" aria-label="Delete set">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-charcoal-400">No sets yet. Add your first set above.</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Exercise Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Exercise</DialogTitle>
            <DialogDescription>Choose from the library or add a custom exercise.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
              <Input placeholder="Search library..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {filteredLibrary.map((ex) => (
              <button
                key={ex.id}
                onClick={() => handleAddExercise(ex)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-primary-50 dark:hover:bg-charcoal-800"
              >
                <span className="font-medium">{ex.name}</span>
                <Badge variant="secondary" size="sm">{ex.primary_muscle}</Badge>
              </button>
            ))}
            {filteredLibrary.length === 0 && <p className="px-3 py-4 text-sm text-charcoal-400">No matching library exercises.</p>}
          </div>
          <div className="flex gap-2 pt-2 border-t border-charcoal-100 dark:border-charcoal-800">
            <Input
              placeholder="Or custom exercise name..."
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
            />
            <Button variant="secondary" onClick={handleAddCustom}><Plus className="h-4 w-4" /></Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
