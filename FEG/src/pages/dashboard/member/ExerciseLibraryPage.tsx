/**
 * Exercise Library page - searchable database of exercises.
 * Users can search, filter by category/muscle/difficulty/equipment, view
 * exercise details, and bookmark favourites.
 */
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Bookmark, BookmarkCheck, Dumbbell, Video, Info,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useExercises, useToggleBookmark } from '@/hooks/useWorkouts';
import type { Exercise, ExerciseCategory } from '@/types';

const CATEGORIES: { value: ExerciseCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'legs', label: 'Legs' },
  { value: 'arms', label: 'Arms' },
  { value: 'core', label: 'Core' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'full_body', label: 'Full Body' },
  { value: 'stretching', label: 'Stretching' },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  advanced: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  expert: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export default function ExerciseLibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<ExerciseCategory | 'all'>('all');
  const [difficulty, setDifficulty] = useState('');
  const [bookmarked, setBookmarked] = useState(false);
  const [selected, setSelected] = useState<Exercise | null>(null);

  const { data, isLoading } = useExercises({ search: searchTerm || undefined, category: category === 'all' ? undefined : category });
  const toggleBookmark = useToggleBookmark();

  const exercises = useMemo(() => {
    const list = data?.data?.results ?? [];
    return list.filter((e) => {
      if (difficulty && e.difficulty !== difficulty) return false;
      if (bookmarked && !e.is_bookmarked) return false;
      return true;
    });
  }, [data, difficulty, bookmarked]);

  const handleBookmark = (e: React.MouseEvent, ex: Exercise) => {
    e.stopPropagation();
    toggleBookmark.mutate(ex.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">Exercise Library</h2>
          <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">
            Search and explore exercises to build your workouts
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
              <Input
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="rounded-lg border border-charcoal-300 bg-transparent px-3 py-2 text-sm dark:border-charcoal-700 dark:text-charcoal-100"
              >
                <option value="">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
              <Button variant={bookmarked ? 'secondary' : 'outline'} size="sm" onClick={() => setBookmarked(!bookmarked)}>
                {bookmarked ? <BookmarkCheck className="h-4 w-4 mr-1" /> : <Bookmark className="h-4 w-4 mr-1" />}
                Bookmarked
              </Button>
            </div>
          </div>

          <Tabs value={category} onValueChange={(v) => setCategory(v as ExerciseCategory | 'all')}>
            <TabsList className="flex flex-wrap h-auto">
              {CATEGORIES.map((c) => (
                <TabsTrigger key={c.value} value={c.value}>{c.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : exercises.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-charcoal-500">No exercises found. Try adjusting your filters.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {exercises.map((ex) => (
              <motion.div
                key={ex.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -4 }}
                onClick={() => setSelected(ex)}
                className="cursor-pointer"
              >
                <Card hover className="h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20">
                        <Dumbbell className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <button
                        onClick={(e) => handleBookmark(e, ex)}
                        className="rounded-md p-1.5 hover:bg-charcoal-100 dark:hover:bg-charcoal-800"
                        aria-label="Toggle bookmark"
                      >
                        {ex.is_bookmarked
                          ? <BookmarkCheck className="h-4 w-4 text-primary-600" />
                          : <Bookmark className="h-4 w-4 text-charcoal-400" />}
                      </button>
                    </div>
                    <h3 className="mt-3 font-semibold text-charcoal-900 dark:text-white">{ex.name}</h3>
                    <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400 line-clamp-2">{ex.description || '—'}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Badge variant="info" size="sm">{ex.primary_muscle || ex.category}</Badge>
                      <Badge size="sm" className={DIFFICULTY_COLORS[ex.difficulty]}>{ex.difficulty}</Badge>
                      {ex.equipment && <Badge variant="outline" size="sm">{ex.equipment}</Badge>}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <Dumbbell className="h-6 w-6 text-primary-600" /> {selected.name}
                </DialogTitle>
                <DialogDescription>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="info">{selected.primary_muscle}</Badge>
                    <Badge className={DIFFICULTY_COLORS[selected.difficulty]}>{selected.difficulty}</Badge>
                    {selected.equipment && <Badge variant="outline">{selected.equipment}</Badge>}
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm text-charcoal-700 dark:text-charcoal-300">
                {selected.video_url && (
                  <a href={selected.video_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-primary-600 hover:underline">
                    <Video className="h-4 w-4" /> Watch demonstration
                  </a>
                )}
                <section>
                  <h4 className="mb-1 flex items-center gap-1.5 font-semibold text-charcoal-900 dark:text-white"><Info className="h-4 w-4" /> Instructions</h4>
                  <p className="whitespace-pre-line">{selected.instructions || '—'}</p>
                </section>
                {selected.common_mistakes && (
                  <section>
                    <h4 className="mb-1 font-semibold text-charcoal-900 dark:text-white">Common Mistakes</h4>
                    <p className="whitespace-pre-line text-red-600 dark:text-red-400">{selected.common_mistakes}</p>
                  </section>
                )}
                {selected.tips && (
                  <section>
                    <h4 className="mb-1 font-semibold text-charcoal-900 dark:text-white">Tips</h4>
                    <p className="whitespace-pre-line text-emerald-600 dark:text-emerald-400">{selected.tips}</p>
                  </section>
                )}
                {selected.secondary_muscles_list?.length > 0 && (
                  <section>
                    <h4 className="mb-1 font-semibold text-charcoal-900 dark:text-white">Secondary Muscles</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.secondary_muscles_list.map((m) => <Badge key={m} variant="secondary" size="sm">{m}</Badge>)}
                    </div>
                  </section>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
