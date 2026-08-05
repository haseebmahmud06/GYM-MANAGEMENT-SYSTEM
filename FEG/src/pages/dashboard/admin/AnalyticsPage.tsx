/**
 * Analytics page for admin to view detailed analytics on gym performance.
 * Includes revenue trends, member growth, popular classes, and more.
 */
import { useState } from 'react';
import { TrendingUp, Users, Download, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRevenueData, useGrowthData, useAttendanceData, usePopularPackages } from '@/hooks/useDashboard';
import { useThemeStore } from '@/stores/themeStore';
import { chartTooltipStyle } from '@/lib/chartTheme';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('12m');
  const { theme } = useThemeStore();
  const tooltipStyle = chartTooltipStyle(theme);
  const { data: revenueData, isLoading: revenueLoading } = useRevenueData(period);
  const { data: growthData, isLoading: growthLoading } = useGrowthData(period);
  const { data: attendanceData, isLoading: attendanceLoading } = useAttendanceData(period === '12m' ? '30d' : period);
  const { data: popularData, isLoading: popularLoading } = usePopularPackages(period);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">Analytics & Insights</h2>
          <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">Detailed analysis of gym performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {['30d', '90d', '12m'].map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod(p)}
              >
                {p}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-600" />
              Revenue Trends
            </CardTitle>
            <CardDescription>Monthly revenue for selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {revenueLoading ? (
                <Skeleton className="h-full w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData?.data || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-charcoal-200 dark:stroke-charcoal-800" />
                    <XAxis dataKey="month" className="text-xs text-charcoal-500" />
                    <YAxis className="text-xs text-charcoal-500" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary-600" />
              Member Growth
            </CardTitle>
            <CardDescription>New member registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {growthLoading ? (
                <Skeleton className="h-full w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={growthData?.data || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-charcoal-200 dark:stroke-charcoal-800" />
                    <XAxis dataKey="month" className="text-xs text-charcoal-500" />
                    <YAxis className="text-xs text-charcoal-500" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="new_members" fill="#3b82f6" radius={[4, 4, 0, 0]} name="New Members" />
                    <Bar dataKey="total_members" fill="#10b981" radius={[4, 4, 0, 0]} name="Total Members" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary-600" />
              Popular Packages
            </CardTitle>
            <CardDescription>Most purchased membership packages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {popularLoading ? (
                <Skeleton className="h-full w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={popularData?.data || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label
                    >
                      {(popularData?.data || []).map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-600" />
              Attendance Trend
            </CardTitle>
            <CardDescription>Daily check-ins for the period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {attendanceLoading ? (
                <Skeleton className="h-full w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceData?.data || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-charcoal-200 dark:stroke-charcoal-800" />
                    <XAxis dataKey="date" className="text-xs text-charcoal-500" />
                    <YAxis className="text-xs text-charcoal-500" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="checkins" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}