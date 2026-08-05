/**
 * Payment Management page for admin to track all payments, invoices, and transactions.
 * Displays payment status, methods, and allows payment status updates.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, Search, MoreVertical, CreditCard, Banknote, Building2, CheckCircle, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePayments, useApprovePayment, useRefundPayment } from '@/hooks/usePayments';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Payment } from '@/types';

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const approvePayment = useApprovePayment();
  const refundPayment = useRefundPayment();

  const { data: paymentsData, isLoading } = usePayments({
    status: statusFilter === 'all' ? undefined : statusFilter,
    page: currentPage,
  });

  const payments = paymentsData?.data?.results || [];
  const totalCount = paymentsData?.data?.count || 0;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      paid: 'success',
      partial: 'warning',
      pending: 'danger',
      refunded: 'info',
    };
    return <Badge variant={variants[status] || 'info'}>{status}</Badge>;
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'cash': return <Banknote className="h-4 w-4" />;
      case 'transfer': return <Building2 className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">Payment Management</h2>
        <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">Track all payments, invoices, and transactions</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
              <Input
                placeholder="Search by reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'paid', 'partial', 'pending', 'refunded'].map((status) => (
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
                    <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-500">Reference</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-500">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-500">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-500">Method</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-500">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment: Payment, index: number) => (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-charcoal-100 dark:border-charcoal-800 hover:bg-charcoal-50 dark:hover:bg-charcoal-900/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm font-mono">
                        {payment.transaction_id ? payment.transaction_id.substring(0, 8) : payment.reference}
                      </td>
                      <td className="py-3 px-4 text-sm">{payment.membership_type || 'Booking'}</td>
                      <td className="py-3 px-4 text-sm font-semibold">{formatCurrency(payment.amount)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-sm text-charcoal-600 dark:text-charcoal-400">
                          {getMethodIcon(payment.payment_method)}
                          <span className="capitalize">{payment.payment_method}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(payment.status)}</td>
                      <td className="py-3 px-4 text-sm">{formatDate(payment.payment_date)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {payment.status === 'pending' && (
                            <Button variant="ghost" size="sm" onClick={() => approvePayment.mutate(payment.id)}>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                          {payment.status === 'paid' && (
                            <Button variant="ghost" size="sm" onClick={() => refundPayment.mutate(payment.id)}>
                              <Banknote className="h-4 w-4 text-amber-500" />
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
          {!isLoading && payments.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-charcoal-300 dark:text-charcoal-600 mb-4" />
              <h3 className="text-lg font-medium text-charcoal-900 dark:text-white mb-1">No payments found</h3>
              <p className="text-sm text-charcoal-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-charcoal-200 dark:border-charcoal-800">
            <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
              Showing {payments.length} of {totalCount} payments
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-charcoal-600 dark:text-charcoal-400 px-2">Page {currentPage}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={payments.length < 20}
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