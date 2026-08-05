/**
 * Main Admin Dashboard page with key metrics, charts, and recent activity.
 * Enterprise-grade analytics dashboard with real-time data from the API.
 */
import { motion } from 'framer-motion';
import {
  Users, TrendingUp, DollarSign, CalendarCheck, UserPlus, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Clock,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardStats, useRevenueData, useAttendanceData, useRecentRegistrations } from '@/hooks/useDashboard';
import { useThemeStore } from '@/stores/themeStore';
import { chartTooltipStyle, chartTickStyle, chartGridColor, chartCursorColor } from '@/lib/chartTheme';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  description: string;
}

function StatCard({ title, value, change = 0, icon, description }: StatCardProps) {
  const isPositive = change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="min-w-0 overflow-hidden rounded-lg border border-charcoal-200/80 bg-white p-5 shadow-[var(--shadow-xs)] transition-colors dark:bg-charcoal-900 dark:border-charcoal-800"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-charcoal-100 text-charcoal-700 dark:bg-charcoal-800 dark:text-charcoal-200">
          {icon}
        </div>
        {change !== 0 && (
          <span className={`flex items-center gap-0.5 text-xs font-medium whitespace-nowrap ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'}`}>
            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <h3 className="min-w-0 text-2xl font-semibold leading-tight tracking-tight break-words [overflow-wrap:anywhere] text-charcoal-900 dark:text-white">
        {value}
      </h3>
      <p className="text-sm font-medium text-charcoal-900 dark:text-white mt-1">{title}</p>
      <p className="text-xs text-charcoal-500 dark:text-charcoal-500 mt-0.5">{description}</p>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: revenueData, isLoading: revenueLoading } = useRevenueData('12m');
  const { data: attendanceData, isLoading: attendanceLoading } = useAttendanceData('30d');
  const { data: recentRegistrations, isLoading: registrationsLoading } = useRecentRegistrations();

  const statCards: StatCardProps[] = [
    {
      title: 'Monthly Revenue',
      value: stats ? formatCurrency(stats.data?.monthly_revenue || 0) : formatCurrency(0),
      icon: <DollarSign className="h-5 w-5" />,
      description: 'Revenue this month',
    },
    {
      title: 'Total Revenue',
      value: stats ? formatCurrency(stats.data?.total_revenue || 0) : formatCurrency(0),
      icon: <TrendingUp className="h-5 w-5" />,
      description: 'All-time revenue',
    },
    {
      title: 'Active Members',
      value: stats ? formatNumber(stats.data?.active_members || 0) : 0,
      icon: <Users className="h-5 w-5" />,
      description: 'Total active members',
    },
    {
      title: "Today's Check-ins",
      value: stats ? formatNumber(stats.data?.today_checkins || 0) : 0,
      icon: <CalendarCheck className="h-5 w-5" />,
      description: 'Check-ins today',
    },
    {
      title: 'New Registrations',
      value: stats ? formatNumber(stats.data?.new_registrations || 0) : 0,
      icon: <UserPlus className="h-5 w-5" />,
      description: 'This month',
    },
    {
      title: 'Expiring Memberships',
      value: stats ? formatNumber(stats.data?.expiring_memberships || 0) : 0,
      icon: <AlertTriangle className="h-5 w-5" />,
      description: 'Within 30 days',
    },
  ];

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  const revenueChartData = revenueData?.data || [];
  const attendanceChartData = attendanceData?.data || [];
  const recentRegs = recentRegistrations?.data || [];
  const { theme } = useThemeStore();
  const tooltipStyle = chartTooltipStyle(theme);
  const tickStyle = chartTickStyle(theme);
  const gridColor = chartGridColor(theme);
  const cursorColor = chartCursorColor(theme);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-charcoal-900 dark:text-white">Overview</h2>
          <p className="text-sm text-charcoal-500 dark:text-charcoal-500 mt-1">
            Real-time performance of your gym
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-charcoal-400" />
              Revenue Overview
            </CardTitle>
            <CardDescription>Monthly revenue for the last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {revenueLoading ? (
                <Skeleton className="h-full w-full rounded-lg" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} />
                    <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <Tooltip
                      cursor={{ fill: cursorColor }}
                      contentStyle={tooltipStyle}
                    />
                    <Bar dataKey="revenue" fill="#0a0a0a" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-charcoal-400" />
              Daily Attendance
            </CardTitle>
            <CardDescription>Check-ins for the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {attendanceLoading ? (
                <Skeleton className="h-full w-full rounded-lg" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attendanceChartData}>
                    <defs>
                      <linearGradient id="checkins" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4b59e0" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#4b59e0" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="date" tick={tickStyle} axisLine={false} tickLine={false} />
                    <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ stroke: gridColor }}
                      contentStyle={tooltipStyle}
                    />
                    <Area type="monotone" dataKey="checkins" stroke="#4b59e0" fill="url(#checkins)" strokeWidth={2} />
                    <Area type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={1.5} fill="transparent" strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Registrations</CardTitle>
          <CardDescription>Latest members who joined the gym</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {registrationsLoading ? (
            <div className="space-y-3 p-5">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : recentRegs.length === 0 ? (
            <p className="text-sm text-charcoal-500 py-8 text-center">No registrations yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRegs.map((member: any, index: number) => (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-charcoal-100 dark:bg-charcoal-800 text-sm font-medium text-charcoal-700 dark:text-charcoal-300">
                            {(member.first_name || 'U').charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-charcoal-900 dark:text-white">
                              {member.first_name} {member.last_name}
                            </p>
                            <p className="text-xs text-charcoal-500">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge variant={member.membership_status === 'active' ? 'success' : 'warning'}>
                          {member.membership_status}
                        </Badge>
                      </td>
                      <td className="text-charcoal-500">{formatDate(member.date_joined)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}