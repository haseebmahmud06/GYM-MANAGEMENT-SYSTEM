/**
 * Login page with email/password authentication.
 * Enterprise-grade design with glassmorphism card and form validation.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { authApi, setTokens } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Dumbbell, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import GoogleButton from '@/components/auth/GoogleButton';

// ============================================================
// Form Schema
// ============================================================

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ============================================================
// Login Page
// ============================================================

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  /**
   * Handle login form submission.
   * Authenticates user and stores JWT tokens.
   */
  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await authApi.login(data);
      const tokens = response.data;

      // Persist tokens FIRST so the axios interceptor attaches the
      // Authorization header to the subsequent authenticated request.
      setTokens(tokens);

      // Get user profile (authenticated)
      const profileResponse = await authApi.getProfile();
      const user = profileResponse.data;

      // Set auth state with user and tokens
      setAuth(user, tokens);

      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Invalid email or password. Please try again.';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-charcoal-950 p-4 relative overflow-hidden">
      {/* Subtle grid background - Vercel-inspired */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary-100 dark:bg-primary-900/20 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-primary-50 dark:bg-charcoal-800 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-charcoal-950 dark:bg-white mb-5">
            <Dumbbell className="h-6 w-6 text-white dark:text-charcoal-950" />
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight text-charcoal-900 dark:text-white">
            Fitness First Gym
          </h1>
          <p className="text-sm text-charcoal-500 dark:text-charcoal-500 mt-1.5">
            Sign in to your account
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-[var(--shadow-lg)] border-charcoal-200/70 dark:border-charcoal-800">
          <CardHeader>
            <CardTitle className="text-lg">Sign in to your account</CardTitle>
            <CardDescription>
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  icon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    icon={<Lock className="h-4 w-4" />}
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded border-charcoal-300 text-primary-600 focus:ring-primary-500 dark:border-charcoal-700"
                  />
                  <span className="text-sm text-charcoal-600 dark:text-charcoal-400">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isSubmitting}
              >
                Sign In
              </Button>
            </form>

            {/* Google Sign-In */}
            <div className="mt-6">
              <GoogleButton />
            </div>

            {/* Register Link */}
            <p className="mt-6 text-center text-sm text-charcoal-500 dark:text-charcoal-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              >
                Create one
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}