/**
 * Progress Tracking page - interactive Recharts visualisations of member
 * progress: strength, volume, body weight, BMI, body fat, measurements,
 * workout frequency, and training hours. Supports daily/weekly/monthly/yearly
 * groupings and multiple date ranges.
 */
import { useMemo, useState } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Scale, Timer, BarChart3, Flame, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProgress } from '@/hooks/useWorkouts';
import { useThemeStore } from '@/stores/themeStore';
import { chartTooltipStyle, chartTickStyle, chartGridColor, chartCursorColor } from '@/lib/chartTheme';
import type { ProgressResponse } from '@/types';

const METRICS = [
  { value: 'volume', label: 'Training Volume', icon: Flame },
  { value: 'frequency', label: 'Workout Frequency', icon: BarChart3 },
  { value: 'strength', label: 'Strength Progress', icon: TrendingUp },
  { value: 'measurements', label: 'Body Measurements', icon: Scale },
];
const GROUPINGS = ['daily', 'weekly', 'monthly', 'yearly'];
const RANGES = [
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '6m', label: 'Last 6 months' },
  { value: '12m', label: 'Last 12 months' },
  { value: 'all', label: 'All time' },
];
const MEASURE_COLORS: Record<string, string> = {
  weight: '#f59e0b', body_fat: '#ef4444', bmi: '#3b82f6',
  chest: '#10b981', waist: '#8b5cf6', arm: '#ec4899', leg: '#14b8a6',
};

export default function ProgressPage() {
  const [metric, setMetric] = useState('volume');
  const [grouping, setGrouping] = useState('monthly');
  const [range, setRange] = useState('12m');

  const { data, isLoading } = useProgress({ metric, grouping, range });
  const { theme } = useThemeStore();
  const progress: ProgressResponse | undefined = data?.data;

  const summary = progress?.summary;
  const chartData = progress?.data ?? [];

  const volumeChart = chartData.map((d) => ({ label: d.label, volume: d.volume ?? 0, sessions: d.sessions ?? 0 }));
  const freqChart = chartData.map((d) => ({ label: d.label, sessions: d.sessions ?? 0 }));
  const strengthChart = chartData.filter((d) => d.weight !== undefined);
  const measureChart = chartData;

  const summaryCards = useMemo(
    () => [
      { label: 'Total Volume', value: summary ? `${Math.round(summary.total_volume)} kg` : '—', icon: Flame },
      { label: 'Sessions', value: summary ? `${summary.total_sessions}` : '—', icon: BarChart3 },
      { label: 'Training Hours', value: summary ? `${summary.total_hours}h` : '—', icon: Timer },
      { label: 'Current Streak', value: summary ? `${summary.current_streak} days` : '—', icon: TrendingUp },
      { label: 'Weight', value: summary?.latest_weight ? `${summary.latest_weight} kg` : '—', icon: Scale },
      { label: 'Personal Records', value: summary ? `${summary.personal_records}` : '—', icon: Trophy },
    ],
    [summary]
  );

  const tooltipStyle = chartTooltipStyle(theme);
  const tickStyle = chartTickStyle(theme);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">Progress Tracking</h2>
          <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">Visualise your fitness journey over time</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={grouping} onValueChange={setGrouping}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {GROUPINGS.map((g) => <SelectItem key={g} value={g}>{g[0].toUpperCase() + g.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {RANGES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metric picker */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {METRICS.map((m) => {
          const Icon = m.icon;
          const active = metric === m.value;
          return (
            <motion.button
              key={m.value}
              whileTap={{ scale: 0.97 }}
              onClick={() => setMetric(m.value)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                active
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-charcoal-200 bg-white hover:border-charcoal-300 dark:border-charcoal-800 dark:bg-charcoal-900'
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? 'text-primary-600' : 'text-charcoal-400'}`} />
              <p className="mt-2 font-medium text-sm text-charcoal-900 dark:text-white">{m.label}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Summary cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {summaryCards.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label}><CardContent className="p-4">
                <Icon className="h-5 w-5 text-primary-600" />
                <p className="mt-2 text-2xl font-bold text-charcoal-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-charcoal-500">{s.label}</p>
              </CardContent></Card>
            );
          })}
        </div>
      )}

      {/* Charts */}
      {isLoading ? (
        <Skeleton className="h-80" />
      ) : metric === 'volume' ? (
        <Card><CardContent className="p-6">
          <h3 className="font-semibold mb-4 text-charcoal-900 dark:text-white">Training Volume & Sessions</h3>
          <ResponsiveContainer width="100%" height={360}>
            <AreaChart data={volumeChart}>
              <defs>
                <linearGradient id="vol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor(theme)} vertical={false} />
              <XAxis dataKey="label" tick={tickStyle} stroke={chartGridColor(theme)} axisLine={false} tickLine={false} />
              <YAxis tick={tickStyle} stroke={chartGridColor(theme)} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: chartCursorColor(theme) }} />
              <Legend />
              <Area type="monotone" dataKey="volume" stroke="#f59e0b" fill="url(#vol)" name="Volume (kg)" />
              <Line type="monotone" dataKey="sessions" stroke="#3b82f6" name="Sessions" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent></Card>
      ) : metric === 'frequency' ? (
        <Card><CardContent className="p-6">
          <h3 className="font-semibold mb-4 text-charcoal-900 dark:text-white">Workout Frequency</h3>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={freqChart}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor(theme)} vertical={false} />
              <XAxis dataKey="label" tick={tickStyle} stroke={chartGridColor(theme)} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={tickStyle} stroke={chartGridColor(theme)} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: chartCursorColor(theme) }} />
              <Bar dataKey="sessions" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent></Card>
      ) : metric === 'strength' ? (
        <Card><CardContent className="p-6">
          <h3 className="font-semibold mb-4 text-charcoal-900 dark:text-white">Strength Progress (Personal Records)</h3>
          {strengthChart.length === 0 ? (
            <p className="py-16 text-center text-charcoal-500">Complete workouts to record strength PRs.</p>
          ) : (
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={strengthChart}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor(theme)} vertical={false} />
                <XAxis dataKey="label" tick={tickStyle} stroke={chartGridColor(theme)} axisLine={false} tickLine={false} />
                <YAxis tick={tickStyle} stroke={chartGridColor(theme)} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="weight" stroke="#ef4444" name="Best weight (kg)" strokeWidth={2} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent></Card>
      ) : (
        <Card><CardContent className="p-6">
          <h3 className="font-semibold mb-4 text-charcoal-900 dark:text-white">Body Measurements</h3>
          {measureChart.length === 0 ? (
            <p className="py-16 text-center text-charcoal-500">Record your first measurement on the Measurements page.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={360}>
                <LineChart data={measureChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor(theme)} vertical={false} />
                  <XAxis dataKey="label" tick={tickStyle} stroke={chartGridColor(theme)} axisLine={false} tickLine={false} />
                  <YAxis tick={tickStyle} stroke={chartGridColor(theme)} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Line type="monotone" dataKey="weight" stroke={MEASURE_COLORS.weight} name="Weight (kg)" />
                  <Line type="monotone" dataKey="body_fat" stroke={MEASURE_COLORS.body_fat} name="Body Fat %" />
                  <Line type="monotone" dataKey="bmi" stroke={MEASURE_COLORS.bmi} name="BMI" />
                </LineChart>
              </ResponsiveContainer>
              <h4 className="mt-6 mb-2 font-medium text-charcoal-900 dark:text-white">Body Circumferences (cm)</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={measureChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor(theme)} vertical={false} />
                  <XAxis dataKey="label" tick={tickStyle} stroke={chartGridColor(theme)} axisLine={false} tickLine={false} />
                  <YAxis tick={tickStyle} stroke={chartGridColor(theme)} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Line type="monotone" dataKey="chest" stroke={MEASURE_COLORS.chest} name="Chest" />
                  <Line type="monotone" dataKey="waist" stroke={MEASURE_COLORS.waist} name="Waist" />
                  <Line type="monotone" dataKey="arm" stroke={MEASURE_COLORS.arm} name="Arm" />
                  <Line type="monotone" dataKey="leg" stroke={MEASURE_COLORS.leg} name="Leg" />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </CardContent></Card>
      )}
    </div>
  );
}
