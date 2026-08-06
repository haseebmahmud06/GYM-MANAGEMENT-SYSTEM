/**
 * Categories page for the public website.
 * Displays the admin-managed membership categories so visitors can understand
 * the different program areas offered by the gym (e.g. Strength, Cardio, Yoga).
 */
import { motion } from 'framer-motion';
import { Tag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategories } from '@/hooks/useCategories';
import { assetUrl } from '@/lib/utils';
import type { Category } from '@/types';

export default function CategoriesPage() {
  const { data, isLoading } = useCategories();
  const categories = data?.data?.results ?? [];

  return (
    <div>
      {/* Page header */}
      <section className="bg-gradient-to-br from-charcoal-950 to-primary-950 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Program Categories</h1>
          <p className="text-lg text-charcoal-300 max-w-2xl mx-auto">
            Explore the different training categories we offer to help you reach your goals
          </p>
        </div>
      </section>

      {/* Categories grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(6)].map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)
            ) : categories.length === 0 ? (
              <div className="col-span-full text-center py-16 text-charcoal-500 dark:text-charcoal-400">
                No categories available yet.
              </div>
            ) : (
              categories.map((category: Category, index: number) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Card className="group hover:shadow-xl transition-all duration-300 h-full overflow-hidden">
                    {/* Optional category image */}
                    {category.image ? (
                      <div className="h-40 overflow-hidden">
                        <img
                          src={assetUrl(category.image)}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="h-40 flex items-center justify-center bg-primary-50 dark:bg-primary-900/20">
                        <Tag className="h-12 w-12 text-primary-500" />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        <CardTitle className="text-xl">{category.name}</CardTitle>
                      </div>
                      {category.description && (
                        <CardDescription className="line-clamp-3">{category.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" size="sm" asChild className="group/btn">
                        <Link to="/membership" className="flex items-center">
                          View Packages
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
