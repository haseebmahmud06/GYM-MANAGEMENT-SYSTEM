/**
 * Trainers Management page for admin to manage gym trainers.
 * Displays trainer list with search and status management.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircle, Search, Plus, Edit3, Trash2, Mail, Phone, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTrainers, useDeleteTrainer } from '@/hooks/useTrainers';
import type { Trainer } from '@/types';

export default function TrainersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: trainersData, isLoading } = useTrainers({ search: searchTerm || undefined });
  const deleteTrainer = useDeleteTrainer();

  const trainers = trainersData?.data?.results || [];

  const filteredTrainers = trainers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">Trainers Management</h2>
          <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">
            Manage gym trainers and their schedules
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Trainer
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
        <Input
          placeholder="Search trainers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainers.map((trainer: Trainer, index: number) => (
            <motion.div
              key={trainer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                        {trainer.photo ? (
                          <img
                            src={trainer.photo}
                            alt={trainer.name}
                            className="h-14 w-14 rounded-full object-cover"
                          />
                        ) : (
                          <UserCircle className="h-8 w-8" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-charcoal-900 dark:text-white">{trainer.name}</h3>
                        <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                          {trainer.specialization || 'General Fitness'}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-charcoal-500 dark:text-charcoal-400">
                          <Briefcase className="h-3 w-3" />
                          {trainer.experience_years} years experience
                        </div>
                      </div>
                    </div>
                    <Badge variant={trainer.status === 'active' ? 'success' : 'secondary'}>
                      {trainer.status}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-1.5">
                    {trainer.email && (
                      <div className="flex items-center gap-2 text-sm text-charcoal-600 dark:text-charcoal-400">
                        <Mail className="h-3.5 w-3.5" />
                        {trainer.email}
                      </div>
                    )}
                    {trainer.phone && (
                      <div className="flex items-center gap-2 text-sm text-charcoal-600 dark:text-charcoal-400">
                        <Phone className="h-3.5 w-3.5" />
                        {trainer.phone}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-1 mt-4 pt-3 border-t border-charcoal-100 dark:border-charcoal-800">
                    <Button variant="ghost" size="sm">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteTrainer.mutate(trainer.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}