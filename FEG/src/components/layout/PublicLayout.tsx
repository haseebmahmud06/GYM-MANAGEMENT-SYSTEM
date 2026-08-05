/**
 * Public website layout with header, footer, and navigation.
 */
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Dumbbell, Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Membership', path: '/membership' },
  { label: 'Categories', path: '/categories' },
  { label: 'Package Types', path: '/package-types' },
  { label: 'Trainers', path: '/trainers' },
  { label: 'Equipment', path: '/equipment' },
  { label: 'Contact', path: '/contact' },
  { label: 'BMI Calculator', path: '/bmi' },
];

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-charcoal-200 dark:bg-charcoal-950/80 dark:border-charcoal-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-charcoal-950 dark:bg-white">
              <Dumbbell className="h-4 w-4 text-white dark:text-charcoal-950" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-charcoal-900 dark:text-white">Fitness First</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-medium text-charcoal-600 hover:text-charcoal-900 dark:text-charcoal-400 dark:hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
            {isAuthenticated ? (
              <Button size="sm" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button size="sm" onClick={() => navigate('/register')}>
                  Join Now
                </Button>
              </>
            )}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-charcoal-100 dark:hover:bg-charcoal-800"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav className="lg:hidden border-t border-charcoal-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm font-medium text-charcoal-600 hover:text-primary-600 dark:text-charcoal-400 dark:hover:text-primary-400"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-charcoal-950 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
                  <Dumbbell className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">Fitness First</span>
              </div>
              <p className="text-sm text-charcoal-400">
                Premium gym facilities and expert trainers dedicated to your fitness goals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <Link key={link.path} to={link.path} className="block text-sm text-charcoal-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-charcoal-400">
                <p>123 Fitness Avenue</p>
                <p>Lagos, Nigeria</p>
                <p>+234 800 123 4567</p>
                <p>info@fitnessfirstgym.com</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Hours</h4>
              <div className="space-y-2 text-sm text-charcoal-400">
                <p>Mon - Fri: 5:00 AM - 10:00 PM</p>
                <p>Saturday: 7:00 AM - 9:00 PM</p>
                <p>Sunday: 8:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-charcoal-800 text-center text-sm text-charcoal-500">
            &copy; {new Date().getFullYear()} Fitness First Gym. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}