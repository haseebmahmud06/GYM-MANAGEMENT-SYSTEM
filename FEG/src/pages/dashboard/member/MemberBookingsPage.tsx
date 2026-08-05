/**
 * Member Bookings page for viewing and creating class bookings.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CalendarCheck, XCircle, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useBookings, useCreateBooking, useCancelBooking } from '@/hooks/useBookings';
import { useAuthStore } from '@/stores/authStore';
import { formatDate, formatTime } from '@/lib/utils';
import type { Booking } from '@/types';

export default function MemberBookingsPage() {
  const { user } = useAuthStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [bookingType, setBookingType] = useState('class');

  const { data: bookingsData, isLoading } = useBookings({ page: 1 });
  const createBooking = useCreateBooking();
  const cancelBooking = useCancelBooking();

  const bookings = bookingsData?.data?.results || [];

  const handleCreate = () => {
    if (!title || !bookingDate || !startTime || !endTime) return;
    createBooking.mutate(
      {
        title,
        booking_type: bookingType as any,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        user: user?.id,
      },
      {
        onSuccess: () => {
          setShowCreateForm(false);
          setTitle('');
          setBookingDate('');
          setStartTime('');
          setEndTime('');
        },
      }
    );
  };

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
          <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">My Bookings</h2>
          <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">Manage your class and session bookings</p>
        </div>
        <Button size="sm" onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {showCreateForm ? 'Cancel' : 'New Booking'}
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Create New Booking</CardTitle>
            <CardDescription>Book a fitness class or personal training session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E.g., Morning Yoga Class" />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">Booking Type</label>
                <select
                  value={bookingType}
                  onChange={(e) => setBookingType(e.target.value)}
                  className="w-full h-10 rounded-lg border border-charcoal-300 bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-charcoal-700"
                >
                  <option value="class">Class</option>
                  <option value="personal_training">Personal Training</option>
                  <option value="session">Session</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">Date</label>
                <Input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">Start Time</label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">End Time</label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleCreate}
                isLoading={createBooking.isPending}
                disabled={!title || !bookingDate || !startTime || !endTime}
              >
                <CalendarCheck className="h-4 w-4 mr-2" />
                Create Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-charcoal-300 dark:text-charcoal-600 mb-4" />
              <h3 className="text-lg font-medium text-charcoal-900 dark:text-white mb-1">No bookings yet</h3>
              <p className="text-sm text-charcoal-500">Book your first class or session today!</p>
            </div>
          ) : (
            <div className="divide-y divide-charcoal-100 dark:divide-charcoal-800">
              {bookings.map((booking: Booking, index: number) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 hover:bg-charcoal-50 dark:hover:bg-charcoal-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{booking.title}</p>
                      <p className="text-xs text-charcoal-500">
                        <span className="capitalize">{booking.booking_type.replace('_', ' ')}</span> ·{' '}
                        {formatDate(booking.booking_date)} · {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(booking.status)}
                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <Button variant="ghost" size="sm" onClick={() => cancelBooking.mutate(booking.id)}>
                        <XCircle className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}