/**
 * MemberFitnessWidgets - dashboard cards for the workout module.
 * Shows Today's Workout, Weekly Goal Progress, Calories, Workout Streak,
 * Training Volume, Current BMI, Upcoming Workout, and Rest Day Indicator.
 * Designed to be embedded in the member dashboard.
 */
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Activity, Flame, TrendingUp, Scale, Calendar, Moon, Trophy, Target, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkouts, useProgress, useGoals, useMeasurements } from '@/hooks/useWorkouts';
import { formatDate } from '@/lib/utils';
import type { Workout } from '@/types';

function WidgetSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
    </div>
  );
}

export default function MemberFitnessWidgets() {
  const { data: workoutsData, isLoading: workoutsLoading } = useWorkouts({ page_size: 10 });
  const { data: progressData, isLoading: progressLoading } = useProgress({ metric: 'volume', grouping: 'monthly', range: '12m' });
  const { data: goalsData } = useGoals({ status: 'active' });
  const { data: measurementsData } = useMeasurements({ page_size: 1 });

  if (workoutsLoading || progressLoading) return <WidgetSkeleton />;

  const workouts = workoutsData?.data?.results ?? [];
  const summary = progressData?.data?.summary;
  const activeGoals = goalsData?.data?.results ?? [];
  const latestMeasurement = measurementsData?.data?.results?.[0];
  const today = new Date().toISOString().slice(0, 10);

  // Today's workout (planned or in-progress on today's date)
  const todaysWorkout = workouts.find((w: Workout) => w.date === today && w.status !== 'completed');
  const upcomingWorkout = workouts.find((w: Workout) => w.date > today && w.status !== 'completed');
  const hasWorkoutToday = !!todaysWorkout;
  const streak = summary?.current_streak ?? 0;

  const weeklyGoal = activeGoals.find((g) => g.metric === 'weekly_sessions');

  const widgets = [
    // Today's Workout
    {
      key: 'today',
      card: (
        <Card hover><CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary-600" /><span className="text-sm font-medium text-charcoal-500">Today's Workout</span></div>
            {hasWorkoutToday && <Badge variant="info" size="sm">Planned</Badge>}
          </div>
          {hasWorkoutToday ? (
            <div className="mt-3">
              <p className="font-semibold text-charcoal-900 dark:text-white">{todaysWorkout.name}</p>
              <p className="text-xs text-charcoal-500 mt-1">{todaysWorkout.exercise_count} exercises</p>
            </div>
          ) : (
            <div className="mt-3">
              <p className="font-semibold text-charcoal-900 dark:text-white">Rest Day 🎉</p>
              <p className="text-xs text-charcoal-500 mt-1">No workout scheduled today</p>
            </div>
          )}
          <Link to="/dashboard/workouts" className="mt-3 flex items-center text-sm text-primary-600 hover:underline">View workouts <ChevronRight className="h-4 w-4" /></Link>
        </CardContent></Card>
      ),
    },
    // Weekly Goal Progress
    {
      key: 'goal',
      card: (
        <Card hover><CardContent className="p-5">
          <div className="flex items-center gap-2"><Target className="h-5 w-5 text-blue-500" /><span className="text-sm font-medium text-charcoal-500">Weekly Goal</span></div>
          {weeklyGoal ? (
            <div className="mt-3">
              <p className="font-semibold text-charcoal-900 dark:text-white">{weeklyGoal.current_value}/{weeklyGoal.target_value} {weeklyGoal.unit}</p>
              <Progress value={weeklyGoal.progress_pct} className="mt-2 h-2" />
              <p className="text-xs text-charcoal-500 mt-1">{weeklyGoal.progress_pct}% complete</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-charcoal-500">Set a weekly session goal</p>
          )}
        </CardContent></Card>
      ),
    },
    // Workout Streak
    {
      key: 'streak',
      card: (
        <Card hover><CardContent className="p-5">
          <div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-orange-500" /><span className="text-sm font-medium text-charcoal-500">Workout Streak</span></div>
          <p className="mt-3 text-3xl font-bold text-charcoal-900 dark:text-white">{streak} <span className="text-lg text-charcoal-400 font-medium">days</span></p>
          <p className="text-xs text-charcoal-500 mt-1">Keep it going!</p>
        </CardContent></Card>
      ),
    },
    // Training Volume
    {
      key: 'volume',
      card: (
        <Card hover><CardContent className="p-5">
          <div className="flex items-center gap-2"><Flame className="h-5 w-5 text-red-500" /><span className="text-sm font-medium text-charcoal-500">Training Volume</span></div>
          <p className="mt-3 text-3xl font-bold text-charcoal-900 dark:text-white">{Math.round(summary?.total_volume ?? 0)} <span className="text-lg text-charcoal-400 font-medium">kg</span></p>
          <p className="text-xs text-charcoal-500 mt-1">{summary?.total_sessions ?? 0} sessions · {summary?.total_hours ?? 0}h total</p>
        </CardContent></Card>
      ),
    },
    // BMI
    {
      key: 'bmi',
      card: (
        <Card hover><CardContent className="p-5">
          <div className="flex items-center gap-2"><Scale className="h-5 w-5 text-emerald-500" /><span className="text-sm font-medium text-charcoal-500">Current BMI</span></div>
          <p className="mt-3 text-3xl font-bold text-charcoal-900 dark:text-white">{latestMeasurement?.bmi ?? '—'}</p>
          <p className="text-xs text-charcoal-500 mt-1 capitalize">{latestMeasurement?.weight_kg ? `${latestMeasurement.weight_kg} kg` : 'Record a measurement'}</p>
        </CardContent></Card>
      ),
    },
    // Upcoming Workout
    {
      key: 'upcoming',
      card: (
        <Card hover><CardContent className="p-5">
          <div className="flex items-center gap-2"><Calendar className="h-5 w-5 text-blue-500" /><span className="text-sm font-medium text-charcoal-500">Upcoming Workout</span></div>
          {upcomingWorkout ? (
            <div className="mt-3">
              <p className="font-semibold text-charcoal-900 dark:text-white">{upcomingWorkout.name}</p>
              <p className="text-xs text-charcoal-500 mt-1">{formatDate(upcomingWorkout.date)}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-charcoal-500">No upcoming workouts</p>
          )}
        </CardContent></Card>
      ),
    },
    // Rest Day Indicator
    {
      key: 'rest',
      card: (
        <Card hover><CardContent className="p-5">
          <div className="flex items-center gap-2"><Moon className="h-5 w-5 text-purple-500" /><span className="text-sm font-medium text-charcoal-500">Rest Status</span></div>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant={hasWorkoutToday ? 'warning' : 'success'}>
              {hasWorkoutToday ? 'Training day' : 'Rest day'}
            </Badge>
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-xs text-charcoal-500 mt-1">{summary?.personal_records ?? 0} personal records</p>
        </CardContent></Card>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {widgets.map((w) => <div key={w.key}>{w.card}</div>)}
    </motion.div>
  );
}
