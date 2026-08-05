/**
 * Attendance Management page for admin to track member check-ins and attendance patterns.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, User, QrCode, Download } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { attendanceApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useAttendanceData } from '@/hooks/useDashboard';
import { formatDate, formatTime } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useThemeStore } from '@/stores/themeStore';
import { chartTooltipStyle } from '@/lib/chartTheme';
import type { Attendance } from '@/types';

export default function AttendancePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { theme } = useThemeStore();
  const tooltipStyle = chartTooltipStyle(theme);
  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ['attendance-records'],
    queryFn: () => attendanceApi.getAll({ page: 1 }),
  });
  const { data: chartData, isLoading: chartLoading } = useAttendanceData('30d');

  const records = attendanceData?.data?.results || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">Attendance Tracking</h2>
          <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">Monitor member check-ins and attendance patterns</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <QrCode className="h-4 w-4 mr-2" />
            QR Scanner
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Attendance Trend</h3>
            <p className="text-sm text-charcoal-500">Last 30 days</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {chartLoading ? (
                <Skeleton className="h-full w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData?.data || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-charcoal-200 dark:stroke-charcoal-800" />
                    <XAxis dataKey="date" className="text-xs text-charcoal-500" />
                    <YAxis className="text-xs text-charcoal-500" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="checkins" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Today's Check-ins</h3>
            <p className="text-sm text-charcoal-500">{formatDate(new Date().toISOString())}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Check-ins</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">{records.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <p className="text-sm text-amber-600 dark:text-amber-400">Late Arrivals</p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">
                  {records.filter((r: Attendance) => r.is_late).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
            <Input
              placeholder="Search member ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-charcoal-200 dark:border-charcoal-800">
                    <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-500">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-500">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-500">Check In</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-500">Check Out</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-500">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record: Attendance, index: number) => (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-charcoal-100 dark:border-charcoal-800 hover:bg-charcoal-50 dark:hover:bg-charcoal-900/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-charcoal-400" />
                          <span className="text-sm font-medium">#{record.user}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{formatDate(record.date)}</td>
                      <td className="py-3 px-4 text-sm font-medium">{formatTime(record.check_in)}</td>
                      <td className="py-3 px-4 text-sm">{record.check_out ? formatTime(record.check_out) : '—'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={record.is_late ? 'warning' : 'success'}>
                          {record.is_late ? 'Late' : 'On Time'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm capitalize">{record.status}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!isLoading && records.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-charcoal-300 dark:text-charcoal-600 mb-4" />
              <h3 className="text-lg font-medium text-charcoal-900 dark:text-white mb-1">No attendance records</h3>
              <p className="text-sm text-charcoal-500">No check-ins recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}