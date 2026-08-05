/**
 * Package Types page for the public website.
 * Displays the admin-managed membership package types (duration classes such as
 * "Monthly", "Quarterly", "Annual") so visitors can understand plan lengths.
 */
import { motion } from 'framer-motion';
import { CalendarRange, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePackageTypes } from '@/hooks/useCategories';
import type { PackageType } from '@/types';

export default function PackageTypesPage() {
  const { data, isLoading } = usePackageTypes();
  const packageTypes = data?.data?.results ?? [];

  return (
    <div>
      {/* Page header */}
      <section className="bg-gradient-to-br from-charcoal-950 to-primary-950 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Membership Types</h1>
          <p className="text-lg text-charcoal-300 max-w-2xl mx-auto">
            Choose the membership duration that best suits your commitment and goals
          </p>
        </div>
      </section>

      {/* Package types grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(6)].map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)
            ) : packageTypes.length === 0 ? (
              <div className="col-span-full text-center py-16 text-charcoal-500 dark:text-charcoal-400">
                No membership types available yet.
              </div>
            ) : (
              packageTypes.map((pkgType: PackageType, index: number) => (
                <motion.div
                  key={pkgType.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Card className="group hover:shadow-xl transition-all duration-300 h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                          <CalendarRange className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-xl">{pkgType.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-charcoal-600 dark:text-charcoal-400 mb-4">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Duration: {pkgType.duration_days} days</span>
                      </div>
                      <Button variant="ghost" size="sm" asChild className="group/btn">
                        <Link to="/membership" className="flex items-center">
                          See Available Plans
                          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
