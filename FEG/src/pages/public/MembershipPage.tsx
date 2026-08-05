/**
 * Membership page for the public website showing packages and pricing.
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePackages } from '@/hooks/usePackages';
import { formatCurrency } from '@/lib/utils';
import type { Package as PackageType } from '@/types';

const faqs = [
  { q: 'What payment methods do you accept?', a: 'We accept cash, card, bank transfer, and online payments.' },
  { q: 'Can I freeze my membership?', a: 'Yes, active members can freeze their membership for up to 30 days per year.' },
  { q: 'Is there a joining fee?', a: 'No, there is no joining fee. You only pay for your chosen membership plan.' },
];

export default function MembershipPage() {
  const { data: packagesData, isLoading } = usePackages();
  const packages = packagesData?.data?.results || [];

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-charcoal-950 to-primary-950 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Membership Packages</h1>
          <p className="text-lg text-charcoal-300 max-w-2xl mx-auto">
            Flexible plans designed to fit your fitness goals and budget
          </p>
        </div>
      </section>

      {/* Packages */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-xl" />
              ))
            ) : (
              packages.map((pkg: PackageType, index: number) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group hover:shadow-xl transition-all duration-300 relative overflow-hidden h-full">
                    {pkg.discount > 0 && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge variant="warning">-{pkg.discount}% OFF</Badge>
                      </div>
                    )}
                    {/* Package image */}
                    {pkg.image ? (
                      <div className="h-40 overflow-hidden">
                        <img
                          src={pkg.image}
                          alt={pkg.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="h-40 flex items-center justify-center bg-charcoal-100 dark:bg-charcoal-800">
                        <Package className="h-10 w-10 text-charcoal-300 dark:text-charcoal-600" />
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
                        <ul className="space-y-1.5">
                          {(pkg.benefits_list || []).slice(0, 6).map((benefit, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-charcoal-600 dark:text-charcoal-400">
                              <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      )}

                      <Button className="w-full group-hover:from-primary-700 group-hover:to-primary-900 transition-all" variant={pkg.discount > 0 ? 'premium' : 'default'} asChild>
                        <Link to="/register">
                          Get Started
                          <ChevronRight className="ml-1 h-4 w-4" />
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

      {/* FAQs */}
      <section className="py-16 bg-charcoal-50 dark:bg-charcoal-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Membership FAQs</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-5">
                  <p className="font-medium mb-2">{faq.q}</p>
                  <p className="text-sm text-charcoal-500 dark:text-charcoal-400">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}