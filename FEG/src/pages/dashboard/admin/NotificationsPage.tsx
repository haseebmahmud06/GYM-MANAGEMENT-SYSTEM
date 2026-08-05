/**
 * Notifications page for admin to view and manage system notifications.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Mail, MailOpen, AlertCircle, Calendar, DollarSign, UserPlus, Dumbbell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications';
import { formatTimeAgo } from '@/lib/utils';
import type { Notification } from '@/types';

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'registration': return <UserPlus className="h-4 w-4 text-blue-500" />;
    case 'payment': return <DollarSign className="h-4 w-4 text-green-500" />;
    case 'booking': return <Calendar className="h-4 w-4 text-purple-500" />;
    case 'equipment': return <Dumbbell className="h-4 w-4 text-amber-500" />;
    case 'alert': return <AlertCircle className="h-4 w-4 text-red-500" />;
    default: return <Bell className="h-4 w-4" />;
  }
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<string>('all');
  const { data: notificationsData, isLoading } = useNotifications({
    is_read: filter === 'unread' ? false : undefined,
  });
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = notificationsData?.data?.results || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">Notifications</h2>
          <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">
            View and manage system notifications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread
          </Button>
          <Button variant="outline" size="sm" onClick={() => markAllAsRead.mutate()}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-charcoal-300 dark:text-charcoal-600 mb-4" />
              <h3 className="text-lg font-medium text-charcoal-900 dark:text-white mb-1">No notifications</h3>
              <p className="text-sm text-charcoal-500">You're all caught up</p>
            </div>
          ) : (
            <div className="divide-y divide-charcoal-100 dark:divide-charcoal-800">
              {notifications.map((notification: Notification, index: number) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-start justify-between p-4 hover:bg-charcoal-50 dark:hover:bg-charcoal-900/50 transition-colors ${
                    !notification.is_read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-charcoal-100 dark:bg-charcoal-800 flex-shrink-0">
                      {notification.is_read ? (
                        <MailOpen className="h-4 w-4 text-charcoal-500" />
                      ) : (
                        <Mail className="h-4 w-4 text-primary-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-charcoal-900 dark:text-white">
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <Badge variant="default" size="sm">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-charcoal-600 dark:text-charcoal-400 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-charcoal-400 dark:text-charcoal-500 mt-1">
                        {formatTimeAgo(notification.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {getTypeIcon(notification.notification_type)}
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead.mutate(notification.id)}
                      >
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                    )}
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