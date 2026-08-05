/**
 * Exercise Library admin page - manage the exercise database (CRUD).
 * Admins can add, edit, delete, and toggle bookmarks on exercises.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit3, Trash2, Dumbbell, Bookmark, BookmarkCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useExercises, useToggleBookmark, useCreateExercise, useUpdateExercise, useDeleteExercise } from '@/hooks/useWorkouts';
import type { Exercise } from '@/types';

const CATEGORIES = [
  { value: 'chest', label: 'Chest' }, { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' }, { value: 'legs', label: 'Legs' },
  { value: 'arms', label: 'Arms' }, { value: 'core', label: 'Core' },
  { value: 'cardio', label: 'Cardio' }, { value: 'full_body', label: 'Full Body' },
  { value: 'stretching', label: 'Stretching' },
];
const DIFFICULTIES = [
  { value: 'beginner', label: 'Beginner' }, { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }, { value: 'expert', label: 'Expert' },
];

// Admin form state - typed so it satisfies Partial<Exercise>.
const emptyForm: {
  name: string; description: string; category: string; primary_muscle: string;
  secondary_muscles: string; equipment: string; difficulty: string;
  instructions: string; common_mistakes: string; tips: string; video_url: string;
} = {
  name: '', description: '', category: 'full_body', primary_muscle: '',
  secondary_muscles: '', equipment: '', difficulty: 'beginner',
  instructions: '', common_mistakes: '', tips: '', video_url: '',
};

export default function ExerciseLibraryAdminPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading } = useExercises({ search: searchTerm || undefined, page_size: 100 });
  const toggleBookmark = useToggleBookmark();
  const createExercise = useCreateExercise();
  const updateExercise = useUpdateExercise();
  const deleteExercise = useDeleteExercise();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const exercises = data?.data?.results ?? [];

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setOpen(true);
  };

  const openEdit = (ex: Exercise) => {
    setEditing(ex);
    setForm({
      name: ex.name, description: ex.description, category: ex.category,
      primary_muscle: ex.primary_muscle, secondary_muscles: ex.secondary_muscles,
      equipment: ex.equipment, difficulty: ex.difficulty, instructions: ex.instructions,
      common_mistakes: ex.common_mistakes, tips: ex.tips, video_url: ex.video_url,
    });
    setOpen(true);
  };

  const submit = () => {
    const payload: Partial<Exercise> = {
      ...form,
      category: form.category as Exercise['category'],
      difficulty: form.difficulty as Exercise['difficulty'],
    };
    if (editing) {
      updateExercise.mutate({ id: editing.id, data: payload });
    } else {
      createExercise.mutate(payload);
    }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">Exercise Library</h2>
          <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">Manage the exercise database</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Add Exercise</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
        <Input placeholder="Search exercises..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {exercises.map((ex) => (
              <motion.div key={ex.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card hover>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20">
                          <Dumbbell className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-charcoal-900 dark:text-white">{ex.name}</h3>
                          <p className="text-sm text-charcoal-500 capitalize">{ex.primary_muscle || ex.category}</p>
                        </div>
                      </div>
                      <button onClick={() => toggleBookmark.mutate(ex.id)} aria-label="Bookmark">
                        {ex.is_bookmarked ? <BookmarkCheck className="h-4 w-4 text-primary-600" /> : <Bookmark className="h-4 w-4 text-charcoal-400" />}
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Badge variant="outline" size="sm" className="capitalize">{ex.difficulty}</Badge>
                      <Badge variant="secondary" size="sm" className="capitalize">{ex.category.replace('_', ' ')}</Badge>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(ex)}>
                        <Edit3 className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" className="flex-1" onClick={() => deleteExercise.mutate(ex.id)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Exercise' : 'Add Exercise'}</DialogTitle>
            <DialogDescription>Manage exercise library entry.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Difficulty</Label>
                <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Primary Muscle</Label><Input value={form.primary_muscle} onChange={(e) => setForm({ ...form, primary_muscle: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Equipment</Label><Input value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5"><Label>Secondary Muscles (comma separated)</Label><Input value={form.secondary_muscles} onChange={(e) => setForm({ ...form, secondary_muscles: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Instructions</Label><Textarea rows={3} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Common Mistakes</Label><Textarea rows={2} value={form.common_mistakes} onChange={(e) => setForm({ ...form, common_mistakes: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Tips</Label><Textarea rows={2} value={form.tips} onChange={(e) => setForm({ ...form, tips: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5"><Label>Video URL</Label><Input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} isLoading={createExercise.isPending || updateExercise.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
