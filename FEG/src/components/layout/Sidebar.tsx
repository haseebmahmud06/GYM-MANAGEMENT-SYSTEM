/**
 * Collapsible sidebar navigation for the Fitness First Gym dashboard.
 * Features role-based menu items, icons, active state tracking, and smooth animations.
 */
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  CalendarCheck,
  CreditCard,

  BarChart3,
  Settings,
  Bell,
  Package,
  Clock,

  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCircle,

  X,

  FileText,
  Activity,
  BookMarked,
  TrendingUp,
  Trophy,
  Ruler,
  Watch,
  Users2,
  Target,
  Wrench,
} from 'lucide-react';

// ============================================================
// Menu Item Type
// ============================================================

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles: string[];
  children?: MenuItem[];
}

// ============================================================
// Menu Configuration
// ============================================================

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    path: '/dashboard',
    roles: ['super_admin', 'admin', 'receptionist', 'trainer', 'member'],
  },
  {
    label: 'Members',
    icon: <Users className="h-5 w-5" />,
    path: '/dashboard/members',
    roles: ['super_admin', 'admin', 'receptionist'],
  },
  {
    label: 'Trainers',
    icon: <UserCircle className="h-5 w-5" />,
    path: '/dashboard/trainers',
    roles: ['super_admin', 'admin'],
  },
  {
    label: 'Packages',
    icon: <Package className="h-5 w-5" />,
    path: '/dashboard/packages',
    roles: ['super_admin', 'admin'],
  },
  {
    label: 'Bookings',
    icon: <CalendarCheck className="h-5 w-5" />,
    path: '/dashboard/bookings',
    roles: ['super_admin', 'admin', 'receptionist', 'member'],
  },
  {
    label: 'Attendance',
    icon: <Clock className="h-5 w-5" />,
    path: '/dashboard/attendance',
    roles: ['super_admin', 'admin', 'receptionist', 'trainer'],
  },
  {
    label: 'Payments',
    icon: <CreditCard className="h-5 w-5" />,
    path: '/dashboard/payments',
    roles: ['super_admin', 'admin', 'receptionist'],
  },
  {
    label: 'Equipment',
    icon: <Dumbbell className="h-5 w-5" />,
    path: '/dashboard/equipment',
    roles: ['super_admin', 'admin'],
  },
  {
    label: 'Exercise Library',
    icon: <BookMarked className="h-5 w-5" />,
    path: '/dashboard/exercise-library',
    roles: ['super_admin', 'admin', 'receptionist', 'trainer', 'member'],
  },
  {
    label: 'Workouts',
    icon: <Activity className="h-5 w-5" />,
    path: '/dashboard/workouts',
    roles: ['member', 'trainer'],
  },
  {
    label: 'Progress',
    icon: <TrendingUp className="h-5 w-5" />,
    path: '/dashboard/progress',
    roles: ['member', 'trainer'],
  },
  {
    label: 'Personal Records',
    icon: <Trophy className="h-5 w-5" />,
    path: '/dashboard/personal-records',
    roles: ['member', 'trainer'],
  },
  {
    label: 'Measurements',
    icon: <Ruler className="h-5 w-5" />,
    path: '/dashboard/measurements',
    roles: ['member', 'trainer'],
  },
  {
    label: 'Wearables',
    icon: <Watch className="h-5 w-5" />,
    path: '/dashboard/wearables',
    roles: ['member'],
  },
  {
    label: 'Goals',
    icon: <Target className="h-5 w-5" />,
    path: '/dashboard/goals',
    roles: ['member', 'trainer'],
  },
  {
    label: 'Community',
    icon: <Users2 className="h-5 w-5" />,
    path: '/dashboard/social',
    roles: ['member', 'trainer'],
  },
  {
    label: 'Fitness Tools',
    icon: <Wrench className="h-5 w-5" />,
    path: '/dashboard/fitness-tools',
    roles: ['member', 'trainer'],
  },
  {
    label: 'Exercise Mgmt',
    icon: <BookMarked className="h-5 w-5" />,
    path: '/dashboard/exercise-management',
    roles: ['super_admin', 'admin'],
  },
  {
    label: 'Analytics',
    icon: <BarChart3 className="h-5 w-5" />,
    path: '/dashboard/analytics',
    roles: ['super_admin', 'admin'],
  },
  {
    label: 'Reports',
    icon: <FileText className="h-5 w-5" />,
    path: '/dashboard/reports',
    roles: ['super_admin', 'admin'],
  },
  {
    label: 'Notifications',
    icon: <Bell className="h-5 w-5" />,
    path: '/dashboard/notifications',
    roles: ['super_admin', 'admin', 'receptionist', 'trainer', 'member'],
  },
  {
    label: 'My Profile',
    icon: <UserCircle className="h-5 w-5" />,
    path: '/dashboard/profile',
    roles: ['super_admin', 'admin', 'receptionist', 'trainer', 'member'],
  },
  {
    label: 'Settings',
    icon: <Settings className="h-5 w-5" />,
    path: '/dashboard/settings',
    roles: ['super_admin', 'admin'],
  },
];

// ============================================================
// Sidebar Component
// ============================================================

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  // Determine user role: admin for staff, member otherwise
  const userRole = user?.is_staff ? 'admin' : 'member';

  // Filter menu items based on user role
  const filteredMenu = menuItems.filter(
    (item) => user && item.roles.includes(userRole)
  );

  /**
   * Check if a menu item is active based on current path.
   */
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo Section */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-charcoal-100 dark:border-charcoal-800">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-charcoal-950 dark:bg-white">
            <Dumbbell className="h-4.5 w-4.5 text-white dark:text-charcoal-950" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[15px] font-semibold tracking-tight text-charcoal-900 dark:text-white"
            >
              Fitness First
            </motion.span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex h-8 w-8 items-center justify-center rounded-md text-charcoal-400 hover:bg-charcoal-100 hover:text-charcoal-700 dark:hover:bg-charcoal-800 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
        <button
          onClick={onMobileClose}
          className="lg:hidden h-8 w-8 items-center justify-center rounded-md text-charcoal-400 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {filteredMenu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onMobileClose}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150',
              isActive(item.path)
                ? 'bg-charcoal-100 text-charcoal-900 dark:bg-charcoal-800 dark:text-white'
                : 'text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-900 dark:text-charcoal-400 dark:hover:bg-charcoal-800/60 dark:hover:text-charcoal-200'
            )}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {item.label}
              </motion.span>
            )}
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-charcoal-100 dark:border-charcoal-800 p-2">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-charcoal-100 text-charcoal-700 dark:bg-charcoal-800 dark:text-charcoal-200">
            {user?.first_name?.charAt(0) || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-charcoal-900 dark:text-white truncate">
                {user?.full_name || 'User'}
              </p>
              <p className="text-xs text-charcoal-500 dark:text-charcoal-500 truncate">
                {user?.email || ''}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className="mt-1 flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-sm font-medium text-charcoal-500 hover:bg-charcoal-50 hover:text-red-600 dark:text-charcoal-400 dark:hover:bg-charcoal-800 dark:hover:text-red-400 transition-colors"
        >
          <LogOut className="h-[18px] w-[18px]" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-0 h-full bg-white dark:bg-charcoal-900 border-r border-charcoal-200 dark:border-charcoal-800 z-30 transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-64 bg-white dark:bg-charcoal-900 border-r border-charcoal-200 dark:border-charcoal-800 z-50 transform transition-transform duration-300 lg:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}