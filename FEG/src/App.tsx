/**
 * Main Application component for Fitness First Gym Management System.
 * Sets up routing, providers, and global configuration.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PublicLayout from '@/components/layout/PublicLayout';

import { lazy, Suspense } from 'react';

// Auth Pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));

// Public Pages
const HomePage = lazy(() => import('@/pages/public/HomePage'));
const AboutPage = lazy(() => import('@/pages/public/AboutPage'));
const MembershipPage = lazy(() => import('@/pages/public/MembershipPage'));
const CategoriesPage = lazy(() => import('@/pages/public/CategoriesPage'));
const PackageTypesPage = lazy(() => import('@/pages/public/PackageTypesPage'));
const TrainersPage = lazy(() => import('@/pages/public/TrainersPage'));
const EquipmentPage = lazy(() => import('@/pages/public/EquipmentPage'));
const ContactPage = lazy(() => import('@/pages/public/ContactPage'));
const FAQPage = lazy(() => import('@/pages/public/FAQPage'));
const BMICalculatorPage = lazy(() => import('@/pages/public/BMICalculatorPage'));

// Admin Dashboard Pages
const DashboardPage = lazy(() => import('@/pages/dashboard/admin/DashboardPage'));
const MembersPage = lazy(() => import('@/pages/dashboard/admin/MembersPage'));
const TrainersAdminPage = lazy(() => import('@/pages/dashboard/admin/TrainersPage'));
const PackagesPage = lazy(() => import('@/pages/dashboard/admin/PackagesPage'));
const BookingsPage = lazy(() => import('@/pages/dashboard/admin/BookingsPage'));
const PaymentsPage = lazy(() => import('@/pages/dashboard/admin/PaymentsPage'));
const AttendancePage = lazy(() => import('@/pages/dashboard/admin/AttendancePage'));
const EquipmentAdminPage = lazy(() => import('@/pages/dashboard/admin/EquipmentPage'));
const AnalyticsPage = lazy(() => import('@/pages/dashboard/admin/AnalyticsPage'));
const ReportsPage = lazy(() => import('@/pages/dashboard/admin/ReportsPage'));
const NotificationsPage = lazy(() => import('@/pages/dashboard/admin/NotificationsPage'));
const ProfilePage = lazy(() => import('@/pages/dashboard/admin/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/dashboard/admin/SettingsPage'));
const ExerciseLibraryAdminPage = lazy(() => import('@/pages/dashboard/admin/ExerciseLibraryAdminPage'));

// Member Dashboard Pages
const MemberDashboardPage = lazy(() => import('@/pages/dashboard/member/MemberDashboardPage'));
const MemberPackagesPage = lazy(() => import('@/pages/dashboard/member/MemberPackagesPage'));
const MemberBookingsPage = lazy(() => import('@/pages/dashboard/member/MemberBookingsPage'));
const MemberPaymentsPage = lazy(() => import('@/pages/dashboard/member/MemberPaymentsPage'));

// Workout & Fitness Tracking Pages
const WorkoutsPage = lazy(() => import('@/pages/dashboard/member/WorkoutsPage'));
const WorkoutDetailPage = lazy(() => import('@/pages/dashboard/member/WorkoutDetailPage'));
const ExerciseLibraryPage = lazy(() => import('@/pages/dashboard/member/ExerciseLibraryPage'));
const ProgressPage = lazy(() => import('@/pages/dashboard/member/ProgressPage'));
const PersonalRecordsPage = lazy(() => import('@/pages/dashboard/member/PersonalRecordsPage'));
const MeasurementsPage = lazy(() => import('@/pages/dashboard/member/MeasurementsPage'));
const WearablesPage = lazy(() => import('@/pages/dashboard/member/WearablesPage'));
const SocialPage = lazy(() => import('@/pages/dashboard/member/SocialPage'));
const GoalsPage = lazy(() => import('@/pages/dashboard/member/GoalsPage'));
const FitnessToolsPage = lazy(() => import('@/pages/dashboard/member/FitnessToolsPage'));

// Suspense Fallback Component
const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
  </div>
);

// ============================================================
// Query Client Configuration
// ============================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ============================================================
// Route Guards
// ============================================================

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

// Admin dashboard overview shows sensitive data (revenue, members, etc.).
// Only staff should see it; members go to their own progress view.
function RoleDashboardIndex() {
  const { user } = useAuthStore();
  if (!user?.is_staff) {
    return <Navigate to="/dashboard/progress" replace />;
  }
  return <DashboardPage />;
}

// ============================================================
// App Component
// ============================================================

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              background: '#1e293b',
              color: '#f8fafc',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#f8fafc' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#f8fafc' },
            },
          }}
        />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ============================================ */}
            {/* Public Website Routes */}
            {/* ============================================ */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="membership" element={<MembershipPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="package-types" element={<PackageTypesPage />} />
              <Route path="trainers" element={<TrainersPage />} />
              <Route path="equipment" element={<EquipmentPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="faq" element={<FAQPage />} />
              <Route path="bmi" element={<BMICalculatorPage />} />
            </Route>

            {/* ============================================ */}
            {/* Auth Routes */}
            {/* ============================================ */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              }
            />

            {/* ============================================ */}
            {/* Protected Dashboard Routes */}
            {/* ============================================ */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Admin Dashboard (index) — admin-only, members redirect to /progress */}
              <Route index element={<RoleDashboardIndex />} />
              <Route path="members" element={<MembersPage />} />
              <Route path="trainers" element={<TrainersAdminPage />} />
              <Route path="packages" element={<PackagesPage />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="equipment" element={<EquipmentAdminPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="exercise-management" element={<ExerciseLibraryAdminPage />} />

              {/* Member Dashboard */}
              <Route path="member" element={<MemberDashboardPage />} />
              <Route path="member/packages" element={<MemberPackagesPage />} />
              <Route path="member/bookings" element={<MemberBookingsPage />} />
              <Route path="member/payments" element={<MemberPaymentsPage />} />

              {/* Workout & Fitness Tracking (shared member routes) */}
              <Route path="workouts" element={<WorkoutsPage />} />
              <Route path="workouts/:id" element={<WorkoutDetailPage />} />
              <Route path="exercise-library" element={<ExerciseLibraryPage />} />
              <Route path="progress" element={<ProgressPage />} />
              <Route path="personal-records" element={<PersonalRecordsPage />} />
              <Route path="measurements" element={<MeasurementsPage />} />
              <Route path="wearables" element={<WearablesPage />} />
              <Route path="social" element={<SocialPage />} />
              <Route path="goals" element={<GoalsPage />} />
              <Route path="fitness-tools" element={<FitnessToolsPage />} />
            </Route>

            {/* ============================================ */}
            {/* Fallback */}
            {/* ============================================ */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}