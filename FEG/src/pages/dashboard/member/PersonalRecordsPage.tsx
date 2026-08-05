/**
 * Personal Records page - automatically detected achievements from completed
 * workouts, with celebration animations for new records.
 */
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Timer, Zap, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePersonalRecords, useProgress } from '@/hooks/useWorkouts';
import type { RecordType } from '@/types';

const FILTERS: { value: RecordType | 'all'; label: string }[] = [
  { value: 'all', label: 'All PRs' },
  { value: 'bench_press', label: 'Bench' },
  { value: 'squat', label: 'Squat' },
  { value: 'deadlift', label: 'Deadlift' },
  { value: 'overhead_press', label: 'Press' },
  { value: 'run', label: 'Run' },
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  bench_press: <Trophy className="h-5 w-5 text-amber-500" />,
  squat: <Zap className="h-5 w-5 text-blue-500" />,
  deadlift: <Flame className="h-5 w-5 text-red-500" />,
  run: <Timer className="h-5 w-5 text-emerald-500" />,
};

export default function PersonalRecordsPage() {
  const [filter, setFilter] = useState<RecordType | 'all'>('all');
  const { data, isLoading } = usePersonalRecords({ page_size: 100 });
  const { data: progressData } = useProgress({ metric: 'volume', grouping: 'all' });

  const records = useMemo(() => {
    const list = data?.data?.results ?? [];
    if (filter === 'all') return list;
    return list.filter((r) => r.record_type === filter);
  }, [data, filter]);

  const summary = progressData?.data?.summary;

  const statCards = [
    { label: 'Personal Records', value: summary?.personal_records ?? records.length, icon: Trophy },
    { label: 'Total Volume', value: summary ? `${Math.round(summary.total_volume)} kg` : '—', icon: Flame },
    { label: 'Workout Streak', value: summary ? `${summary.current_streak} days` : '—', icon: Zap },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">Personal Records</h2>
        <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">
          Your best lifts and achievements, detected automatically
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}><CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20">
                <Icon className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal-900 dark:text-white">{s.value}</p>
                <p className="text-sm text-charcoal-500">{s.label}</p>
              </div>
            </CardContent></Card>
          );
        })}
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as RecordType | 'all')}>
        <TabsList className="flex flex-wrap h-auto">
          {FILTERS.map((f) => <TabsTrigger key={f.value} value={f.value}>{f.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : records.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-charcoal-500">
          <Award className="h-12 w-12 mx-auto mb-3 text-charcoal-300" />
          <p className="font-medium">No personal records yet</p>
          <p className="text-sm mt-1">Complete workouts to log your PRs automatically.</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((r, idx) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.04 }}
              whileHover={{ y: -3 }}
            >
              <Card hover className="relative overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
                        {TYPE_ICONS[r.record_type] ?? <Award className="h-5 w-5 text-primary-600" />}
                      </div>
                      <div>
                        <p className="font-semibold text-charcoal-900 dark:text-white">{r.exercise}</p>
                        <p className="text-xs text-charcoal-500">{r.record_type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <Badge variant="success" size="sm">Current PR</Badge>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold text-primary-600">{r.weight ?? r.volume ?? '—'}</p>
                      <p className="text-xs text-charcoal-500">{r.weight != null ? 'kg (est. 1RM)' : 'volume'}</p>
                    </div>
                    {r.reps != null && <p className="text-sm text-charcoal-500">{r.reps} reps</p>}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
