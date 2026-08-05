/**
 * Member Packages page for viewing and purchasing membership packages.
 */
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, Shield, CreditCard, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePackages } from '@/hooks/usePackages';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency } from '@/lib/utils';
import type { Package as PackageType } from '@/types';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function MemberPackagesPage() {
  const { data: packagesData, isLoading } = usePackages();
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  const purchaseMutation = useMutation({
    mutationFn: (packageId: number) => authApi.purchaseMembership({ package_id: packageId }),
    onSuccess: (response: any) => {
      const { membership } = response.data;
      updateUser({
        membership_status: membership.status,
        membership_start_date: membership.start_date,
        membership_end_date: membership.end_date,
      });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Membership purchased successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to purchase membership');
    },
  });

  const packages = packagesData?.data?.results || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">Membership Packages</h2>
        <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">
          Choose the perfect plan for your fitness journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))
        ) : (
          packages.map((pkg: PackageType, index: number) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 relative overflow-hidden h-full">
                {pkg.discount > 0 && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge variant="warning">-{pkg.discount}% OFF</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-0.5">
                        <Clock className="h-3.5 w-3.5" />
                        {pkg.duration_days} days
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{formatCurrency(pkg.discounted_price)}</span>
                    {pkg.discount > 0 && (
                      <span className="text-sm text-charcoal-400 line-through">{formatCurrency(pkg.price)}</span>
                    )}
                  </div>

                  <p className="text-sm text-charcoal-600 dark:text-charcoal-400 line-clamp-2">{pkg.description}</p>

                  {(pkg.benefits_list || []).length > 0 && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-charcoal-500 mb-2">Benefits</p>
                      <ul className="space-y-1.5">
                        {(pkg.benefits_list || []).slice(0, 5).map((benefit, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-charcoal-600 dark:text-charcoal-400">
                            <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    variant={pkg.discount > 0 ? 'premium' : 'default'}
                    isLoading={purchaseMutation.isPending}
                    onClick={() => purchaseMutation.mutate(pkg.id)}
                  >
                    {user?.membership_status === 'active' ? (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Switch to this Plan
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Purchase Now
                      </>
                    )}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}