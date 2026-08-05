/**
 * Member Payments page showing payment history and invoices.
 */
import { motion } from 'framer-motion';
import { CreditCard, FileDown, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePayments } from '@/hooks/usePayments';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Payment } from '@/types';

export default function MemberPaymentsPage() {
  const { data: paymentsData, isLoading } = usePayments({ page: 1 });
  const payments = paymentsData?.data?.results || [];

  const downloadReceipt = (payment: Payment) => {
    const receipt = `
      FITNESS FIRST GYM
      =================
      Payment Receipt
      ---------------
      Reference: ${payment.transaction_id}
      Type: ${payment.membership_type || 'Booking Payment'}
      Amount: ${formatCurrency(payment.amount)}
      Method: ${payment.payment_method}
      Date: ${formatDate(payment.payment_date)}
      Status: ${payment.status}
    `;
    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${payment.transaction_id?.substring(0, 8) || payment.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">Payment History</h2>
        <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">View your payment transactions and download receipts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary-600" />
            Transactions
          </CardTitle>
          <CardDescription>All your payment records</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-charcoal-300 dark:text-charcoal-600 mb-4" />
              <h3 className="text-lg font-medium text-charcoal-900 dark:text-white mb-1">No payments yet</h3>
              <p className="text-sm text-charcoal-500">Your payment history will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-charcoal-100 dark:divide-charcoal-800">
              {payments.map((payment: Payment, index: number) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 hover:bg-charcoal-50 dark:hover:bg-charcoal-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                      <FileDown className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{payment.membership_type || 'Booking Payment'}</p>
                      <p className="text-xs text-charcoal-500">
                        {formatDate(payment.payment_date)} · {payment.payment_method}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{formatCurrency(payment.amount)}</span>
                    <Badge variant={payment.status === 'paid' ? 'success' : payment.status === 'pending' ? 'warning' : 'secondary'}>
                      {payment.status}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => downloadReceipt(payment)}>
                      <Download className="h-4 w-4" />
                    </Button>
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