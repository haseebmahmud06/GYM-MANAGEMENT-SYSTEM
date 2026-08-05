/**
 * Equipment Management page for admin to track gym equipment inventory and maintenance.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Search, AlertTriangle, Plus, Download, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useEquipment, useDeleteEquipment } from '@/hooks/useEquipment';
import { formatDate } from '@/lib/utils';
import type { Equipment } from '@/types';

export default function EquipmentPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { data: equipmentData, isLoading } = useEquipment({
    search: searchTerm || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const deleteEquipment = useDeleteEquipment();

  const equipment = equipmentData?.data?.results || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      operational: 'success',
      under_maintenance: 'warning',
      broken: 'danger',
      retired: 'info',
    };
    return <Badge variant={variants[status] || 'info'}>{status.replace('_', ' ')}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">Equipment Management</h2>
          <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">Track and manage gym equipment inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
              <Input
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'operational', 'under_maintenance', 'broken', 'retired'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="capitalize"
                >
                  {status.replace('_', ' ')}
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
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Equipment</th>
                    <th>Status</th>
                    <th>Condition</th>
                    <th>Location</th>
                    <th>Last Maintenance</th>
                    <th>Next Maintenance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {equipment.map((item: Equipment, index: number) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-charcoal-100 dark:bg-charcoal-800">
                              <Dumbbell className="h-4 w-4 text-charcoal-500" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium">{item.name}</p>
                            {item.brand && (
                              <p className="text-xs text-charcoal-500">{item.brand}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{getStatusBadge(item.status)}</td>
                      <td className="text-sm font-medium capitalize">{item.condition}</td>
                      <td className="text-sm">{item.location || 'N/A'}</td>
                      <td className="text-sm">{formatDate(item.maintenance_date)}</td>
                      <td className="text-sm">
                        {item.next_maintenance_date ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-charcoal-400" />
                            {formatDate(item.next_maintenance_date)}
                          </div>
                        ) : 'N/A'}
                      </td>
                      <td>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deleteEquipment.isPending}
                          onClick={() => deleteEquipment.mutate(item.id)}
                        >
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!isLoading && equipment.length === 0 && (
            <div className="text-center py-12">
              <Dumbbell className="h-12 w-12 mx-auto text-charcoal-300 dark:text-charcoal-600 mb-4" />
              <h3 className="text-lg font-medium text-charcoal-900 dark:text-white mb-1">No equipment found</h3>
              <p className="text-sm text-charcoal-500">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}