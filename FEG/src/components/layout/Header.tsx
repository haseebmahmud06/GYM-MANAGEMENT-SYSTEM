/**
 * Top header bar for the Fitness First Gym dashboard.
 * Contains search, notifications, theme toggle, and user menu.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import {
  Search,
  Bell,
  Moon,
  Sun,
  Menu,
  User,
  Settings,
  LogOut,
  HelpCircle,
} from 'lucide-react';

// ============================================================
// Header Component
// ============================================================

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur-xl border-b border-charcoal-200/80 dark:bg-charcoal-950/80 dark:border-charcoal-800/80">
      <div className="flex h-full items-center justify-between px-4 lg:px-8">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onMenuClick}
            aria-label="Open menu"
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-md hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
          >
            <Menu className="h-5 w-5 text-charcoal-700 dark:text-charcoal-300" />
          </button>

          {/* Greeting */}
          <div>
            <h1 className="text-[17px] font-semibold tracking-tight text-charcoal-900 dark:text-white">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
              {user?.first_name ? `, ${user.first_name}` : ''}
            </h1>
            <p className="text-xs text-charcoal-500 dark:text-charcoal-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1.5">
          {/* Search */}
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search..."
              className="h-9 w-48 lg:w-56 rounded-md border border-charcoal-200 bg-charcoal-50/70 pl-9 pr-3 text-sm placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 dark:border-charcoal-800 dark:bg-charcoal-900 dark:text-charcoal-100 dark:placeholder:text-charcoal-500 transition-all"
            />
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="h-[18px] w-[18px] text-charcoal-600 dark:text-charcoal-400" />
            ) : (
              <Moon className="h-[18px] w-[18px] text-charcoal-600" />
            )}
          </button>

          {/* Notifications */}
          <button
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-md hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
          >
            <Bell className="h-[18px] w-[18px] text-charcoal-600 dark:text-charcoal-400" />
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              aria-label="User menu"
              className="flex items-center gap-2 rounded-md p-1 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-charcoal-100 text-charcoal-700 dark:bg-charcoal-800 dark:text-charcoal-200 font-semibold text-sm">
                {user?.first_name?.charAt(0) || 'U'}
              </div>
              <span className="hidden md:block text-sm font-medium text-charcoal-700 dark:text-charcoal-300">
                {user?.full_name || 'User'}
              </span>
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setUserMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-charcoal-200 bg-white p-1.5 shadow-lg dark:bg-charcoal-900 dark:border-charcoal-800 z-20"
                >
                  <div className="px-3 py-2 border-b border-charcoal-100 dark:border-charcoal-800 mb-1">
                    <p className="text-sm font-medium text-charcoal-900 dark:text-white">
                      {user?.full_name}
                    </p>
                    <p className="text-xs text-charcoal-500">{user?.email}</p>
                  </div>

                  <Link
                    to="/dashboard/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 dark:text-charcoal-300 dark:hover:bg-charcoal-800 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 dark:text-charcoal-300 dark:hover:bg-charcoal-800 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <Link
                    to="/faq"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 dark:text-charcoal-300 dark:hover:bg-charcoal-800 transition-colors"
                  >
                    <HelpCircle className="h-4 w-4" />
                    Help & Support
                  </Link>

                  <hr className="my-1 border-charcoal-100 dark:border-charcoal-800" />

                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}