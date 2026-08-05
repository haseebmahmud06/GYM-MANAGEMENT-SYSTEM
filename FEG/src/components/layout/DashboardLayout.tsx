/**
 * Dashboard layout wrapper with a floating sidebar and sticky top header.
 * Provides the main layout structure for all authenticated pages.
 */
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';

// Map known routes to breadcrumb labels for the top navigation.
const CRUMB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  members: 'Members',
  trainers: 'Trainers',
  packages: 'Packages',
  bookings: 'Bookings',
  payments: 'Payments',
  attendance: 'Attendance',
  equipment: 'Equipment',
  analytics: 'Analytics',
  reports: 'Reports',
  notifications: 'Notifications',
  profile: 'Profile',
  settings: 'Settings',
  workouts: 'Workouts',
  progress: 'Progress',
  'personal-records': 'Personal Records',
  measurements: 'Measurements',
  wearables: 'Wearables',
  goals: 'Goals',
  social: 'Community',
  'fitness-tools': 'Fitness Tools',
  'exercise-library': 'Exercise Library',
  'exercise-management': 'Exercise Management',
};

export default function DashboardLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Derive breadcrumb from the current path's first segment after /dashboard/.
  const segments = location.pathname.split('/').filter(Boolean);
  const activeSegment = segments[1] ?? 'dashboard';
  const crumbLabel = CRUMB_LABELS[activeSegment] ?? 'Dashboard';

  return (
    <div className="min-h-screen bg-charcoal-50 dark:bg-charcoal-950">
      {/* Floating Sidebar */}
      <Sidebar
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 transition-all duration-200">
        {/* Sticky Top Header */}
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />

        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="px-4 lg:px-8 pt-5 text-sm text-charcoal-500 dark:text-charcoal-500"
        >
          <ol className="flex items-center gap-1.5">
            <li>
              <span className="font-medium text-charcoal-900 dark:text-charcoal-100">
                {crumbLabel}
              </span>
            </li>
          </ol>
        </nav>

        {/* Page Content */}
        <main className="px-4 lg:px-8 py-6">
          <motion.div
            key={activeSegment}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="px-4 lg:px-8 py-6">
          <div className="border-t border-charcoal-200 dark:border-charcoal-800 pt-4 flex items-center justify-between">
            <p className="text-sm text-charcoal-500 dark:text-charcoal-500">
              &copy; {new Date().getFullYear()} Fitness First Gym. All rights reserved.
            </p>
            <p className="text-sm text-charcoal-500 dark:text-charcoal-500">
              v1.0.0
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}