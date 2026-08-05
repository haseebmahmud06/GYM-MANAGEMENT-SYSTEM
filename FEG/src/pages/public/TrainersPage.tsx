/**
 * Trainers page for the public website showing gym trainers.
 */
import { motion } from 'framer-motion';
import { UserCircle, Briefcase, Mail, Phone, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useTrainers } from '@/hooks/useTrainers';
import type { Trainer } from '@/types';

export default function TrainersPage() {
  const { data: trainersData, isLoading } = useTrainers();
  const trainers = trainersData?.data?.results || [];

  return (
    <div>
      <section className="bg-gradient-to-br from-charcoal-950 to-primary-950 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Our Trainers</h1>
          <p className="text-lg text-charcoal-300 max-w-2xl mx-auto">
            Meet the certified experts who will guide you towards your fitness goals
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))
            ) : trainers.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <UserCircle className="h-12 w-12 mx-auto text-charcoal-300 mb-4" />
                <p className="text-charcoal-500">Our trainers will be listed here soon.</p>
              </div>
            ) : (
              trainers.map((trainer: Trainer, index: number) => (
                <motion.div
                  key={trainer.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="w-24 h-24 mx-auto rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4">
                        {trainer.photo ? (
                          <img src={trainer.photo} alt={trainer.name} className="w-24 h-24 rounded-full object-cover" />
                        ) : (
                          <UserCircle className="h-12 w-12" />
                        )}
                      </div>
                      <h3 className="text-lg font-semibold">{trainer.name}</h3>
                      <div className="flex items-center justify-center gap-1.5 mt-1 text-sm text-charcoal-500">
                        <Briefcase className="h-4 w-4" />
                        <span>{trainer.specialization || 'General Fitness'}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium">{trainer.experience_years} years experience</span>
                      </div>
                      <div className="mt-4 space-y-1.5">
                        {trainer.email && (
                          <div className="flex items-center justify-center gap-1.5 text-sm text-charcoal-500">
                            <Mail className="h-3.5 w-3.5" /> {trainer.email}
                          </div>
                        )}
                        {trainer.phone && (
                          <div className="flex items-center justify-center gap-1.5 text-sm text-charcoal-500">
                            <Phone className="h-3.5 w-3.5" /> {trainer.phone}
                          </div>
                        )}
                      </div>
                      {trainer.bio && (
                        <p className="text-sm text-charcoal-500 mt-4 line-clamp-3">{trainer.bio}</p>
                      )}
                      <div className="mt-4">
                        <Badge variant={trainer.status === 'active' ? 'success' : 'secondary'}>
                          {trainer.status}
                        </Badge>
                      </div>
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