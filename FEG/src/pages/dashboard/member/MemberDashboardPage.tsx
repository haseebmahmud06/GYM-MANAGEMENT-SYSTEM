/**
 * Member Dashboard page showing membership status, upcoming bookings, and recent payments.
 */
import { Link } from 'react-router-dom';
import {
  Dumbbell, CalendarCheck, CreditCard, ChevronRight, Clock, } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/authStore';
import { useBookings } from '@/hooks/useBookings';
import { usePayments } from '@/hooks/usePayments';
import { useDashboardStats } from '@/hooks/useDashboard';
import { formatDate, formatCurrency, formatTime, daysRemaining } from '@/lib/utils';
import MemberFitnessWidgets from '@/components/workout/MemberFitnessWidgets';

export default function MemberDashboardPage() {
  const { user } = useAuthStore();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: bookingsData, isLoading: bookingsLoading } = useBookings({ page: 1, status: 'approved' });
  const { data: paymentsData, isLoading: paymentsLoading } = usePayments({ page: 1 });

  const bookings = bookingsData?.data?.results || [];
  const payments = paymentsData?.data?.results || [];
  const remainingDays = daysRemaining(user?.membership_end_date);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">
          Welcome back, {user?.first_name || 'Member'}!
        </h2>
        <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">
          Here's your fitness journey at a glance
        </p>
      </div>

      {/* Membership Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1 bg-charcoal-950 text-white border-0 dark:bg-black">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-white/10">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-white/70">Membership Status</p>
                <p className="text-lg font-semibold capitalize">{user?.membership_status}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70">Member ID</span>
                <span className="font-mono">{user?.member_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Expires</span>
                <span>{formatDate(user?.membership_end_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Days Left</span>
                <span className="font-semibold">{remainingDays} days</span>
              </div>
            </div>
            <Link to="/dashboard/member/packages" className="block mt-4">
              <Button variant="secondary" size="sm" className="w-full bg-white/20 text-white hover:bg-white/30 border-0">
                {remainingDays <= 30 ? 'Renew Now' : 'Manage Membership'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Upcoming Bookings</p>
                <p className="text-2xl font-bold">{statsLoading ? '—' : stats?.data?.total_bookings || 0}</p>
              </div>
            </div>
            <p className="text-xs text-charcoal-400">Your approved class bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Total Paid</p>
                <p className="text-2xl font-bold">{paymentsLoading ? '—' : formatCurrency(payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0))}</p>
              </div>
            </div>
            <p className="text-xs text-charcoal-400">All-time payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Fitness Tracking Widgets */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-charcoal-900 dark:text-white">Fitness Overview</h3>
            <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Your workouts, goals and progress</p>
          </div>
          <Link to="/dashboard/progress" className="text-sm text-primary-600 hover:underline flex items-center">
            View progress <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <MemberFitnessWidgets />
      </div>

      {/* Upcoming Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary-600" />
            Upcoming Bookings
          </CardTitle>
          <CardDescription>Your approved class and session bookings</CardDescription>
        </CardHeader>
        <CardContent>
          {bookingsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <CalendarCheck className="h-10 w-10 mx-auto text-charcoal-300 dark:text-charcoal-600 mb-3" />
              <p className="text-sm text-charcoal-500">No upcoming bookings</p>
              <Link to="/dashboard/member/bookings" className="mt-2 inline-block">
                <Button size="sm" variant="outline">Book a Class</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 3).map((booking: any) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-charcoal-100 dark:border-charcoal-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                      <Clock className="h-4 w-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{booking.title}</p>
                      <p className="text-xs text-charcoal-500">
                        {formatDate(booking.booking_date)} · {formatTime(booking.start_time)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success">{booking.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary-600" />
            Recent Payments
          </CardTitle>
          <CardDescription>Your latest payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-10 w-10 mx-auto text-charcoal-300 dark:text-charcoal-600 mb-3" />
              <p className="text-sm text-charcoal-500">No payments yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.slice(0, 3).map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-charcoal-100 dark:border-charcoal-800"
                >
                  <div>
                    <p className="text-sm font-medium">{payment.membership_type || 'Booking Payment'}</p>
                    <p className="text-xs text-charcoal-500">{formatDate(payment.payment_date)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{formatCurrency(payment.amount)}</span>
                    <Badge variant={payment.status === 'paid' ? 'success' : payment.status === 'pending' ? 'warning' : 'secondary'}>
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}