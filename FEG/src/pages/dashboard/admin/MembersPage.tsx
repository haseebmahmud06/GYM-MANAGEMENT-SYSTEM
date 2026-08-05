/**
 * Members Management page for admin to view, filter, and manage gym members.
 * Displays member list with search, filtering, and status management.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Search, MoreVertical, Mail, Phone, Calendar, Shield, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMembers } from '@/hooks/useMembers';
import { formatDate } from '@/lib/utils';
import type { User } from '@/types';

export default function MembersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: membersData, isLoading } = useMembers({
    search: searchTerm || undefined,
    membership_status: statusFilter === 'all' ? undefined : statusFilter,
    page: currentPage,
  });

  const members = membersData?.data?.results || [];
  const totalCount = membersData?.data?.count || 0;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      active: 'success',
      expired: 'danger',
      pending: 'warning',
      cancelled: 'info',
    };
    return <Badge variant={variants[status] || 'info'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">Members Management</h2>
          <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">
            View and manage all gym members
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
              <Input
                placeholder="Search by name, email, or member ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'expired', 'pending', 'cancelled'].map((status) => (
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
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Contact</th>
                    <th>Member ID</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member: User, index: number) => (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-charcoal-100 dark:bg-charcoal-800 text-charcoal-700 dark:text-charcoal-200 text-sm font-semibold">
                            {(member.first_name || 'U').charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-charcoal-900 dark:text-white">
                              {member.first_name} {member.last_name}
                            </p>
                            <p className="text-xs text-charcoal-500 dark:text-charcoal-500">@{member.username}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-sm text-charcoal-600 dark:text-charcoal-400">
                            <Mail className="h-3.5 w-3.5" />
                            {member.email}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-charcoal-600 dark:text-charcoal-400">
                            <Phone className="h-3.5 w-3.5" />
                            {member.phone || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-sm font-mono text-charcoal-700 dark:text-charcoal-300">
                          {member.member_id || 'N/A'}
                        </span>
                      </td>
                      <td>{getStatusBadge(member.membership_status)}</td>
                      <td>
                        <div className="flex items-center gap-1.5 text-sm text-charcoal-600 dark:text-charcoal-400">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(member.date_joined)}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Shield className="h-4 w-4" />
                          </Button>
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

          {!isLoading && members.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-charcoal-300 dark:text-charcoal-600 mb-4" />
              <h3 className="text-lg font-medium text-charcoal-900 dark:text-white mb-1">No members found</h3>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-charcoal-200 dark:border-charcoal-800">
            <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
              Showing {members.length} of {totalCount} members
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-charcoal-600 dark:text-charcoal-400 px-2">Page {currentPage}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={members.length < 20}
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