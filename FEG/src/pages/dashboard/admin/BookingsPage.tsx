/**
 * Booking Management page for admin to track and manage all gym bookings.
 * Displays booking status, payment info, and allows status updates.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Search, MoreVertical, Clock, User, CheckCircle, XCircle, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useBookings, useApproveBooking, useCompleteBooking, useCancelBooking } from '@/hooks/useBookings';
import { formatDate, formatTime } from '@/lib/utils';
import type { Booking } from '@/types';

export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const approveBooking = useApproveBooking();
  const completeBooking = useCompleteBooking();
  const cancelBooking = useCancelBooking();

  const { data: bookingsData, isLoading } = useBookings({
    search: searchTerm || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page: currentPage,
  });

  const bookings = bookingsData?.data?.results || [];
  const totalCount = bookingsData?.data?.count || 0;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      approved: 'success',
      pending: 'warning',
      cancelled: 'danger',
      completed: 'info',
    };
    return <Badge variant={variants[status] || 'info'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">Booking Management</h2>
          <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">Track and manage all gym bookings</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
              <Input
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'pending', 'approved', 'completed', 'cancelled'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1);
                  }}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-charcoal-200 dark:border-charcoal-800">
                    <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-500">Title</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-500">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-500">Date & Time</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking: Booking, index: number) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-charcoal-100 dark:border-charcoal-800 hover:bg-charcoal-50 dark:hover:bg-charcoal-900/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-charcoal-400" />
                          <div>
                            <p className="text-sm font-medium">{booking.title}</p>
                            <p className="text-xs text-charcoal-500">{booking.description || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm capitalize">{booking.booking_type.replace('_', ' ')}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-charcoal-400" />
                          {formatDate(booking.booking_date)}
                          <Clock className="h-3.5 w-3.5 text-charcoal-400 ml-1" />
                          {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                        </div>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(booking.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {booking.status === 'pending' && (
                            <Button variant="ghost" size="sm" onClick={() => approveBooking.mutate(booking.id)}>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                          {booking.status === 'approved' && (
                            <Button variant="ghost" size="sm" onClick={() => completeBooking.mutate(booking.id)}>
                              <CheckCircle className="h-4 w-4 text-blue-500" />
                            </Button>
                          )}
                          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                            <Button variant="ghost" size="sm" onClick={() => cancelBooking.mutate(booking.id)}>
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!isLoading && bookings.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-charcoal-300 dark:text-charcoal-600 mb-4" />
              <h3 className="text-lg font-medium text-charcoal-900 dark:text-white mb-1">No bookings found</h3>
              <p className="text-sm text-charcoal-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-charcoal-200 dark:border-charcoal-800">
            <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
              Showing {bookings.length} of {totalCount} bookings
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-charcoal-600 dark:text-charcoal-400 px-2">Page {currentPage}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={bookings.length < 20}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}