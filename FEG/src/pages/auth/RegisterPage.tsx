/**
 * Registration page for new members.
 * Enterprise-grade signup with form validation and API integration.
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
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Dumbbell, Mail, Lock, User, Phone, Calendar, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import GoogleButton from '@/components/auth/GoogleButton';

// ============================================================
// Form Schema
// ============================================================

const registerSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Please select a gender').refine((val) => ['M', 'F', 'O'].includes(val), {
    message: 'Please select a valid gender',
  }),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

// ============================================================
// Register Page
// ============================================================

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  /**
   * Handle registration form submission.
   */
  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await authApi.register({ ...data, username: data.email, gender: data.gender as 'M' | 'F' | 'O' });
      const user = response.data;

      // Login after registration
      const loginResponse = await authApi.login({
        email: data.email,
        password: data.password,
      });
      const tokens = loginResponse.data;

      setAuth(user, tokens);
      toast.success('Account created successfully! Welcome to Fitness First Gym!');
      navigate('/dashboard');
    } catch (error: any) {
      // Extract the first human-readable error from the DRF validation payload,
      // which can contain nested per-field messages (e.g. { email: ["..."], username: ["..."] }).
      const data = error.response?.data;
      let message = 'Registration failed. Please try again.';
      if (typeof data === 'string') {
        message = data;
      } else if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        const firstValue = (data as any)[firstKey];
        if (Array.isArray(firstValue)) message = String(firstValue[0]);
        else if (typeof firstValue === 'string') message = firstValue;
        else if (typeof data.detail === 'string') message = data.detail;
      }
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-charcoal-950 p-4 relative overflow-hidden">
      {/* Subtle grid background */}
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
        className="w-full max-w-lg relative"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-charcoal-950 dark:bg-white mb-5">
            <Dumbbell className="h-6 w-6 text-white dark:text-charcoal-950" />
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight text-charcoal-900 dark:text-white">
            Create Account
          </h1>
          <p className="text-sm text-charcoal-500 dark:text-charcoal-500 mt-1.5">
            Join Fitness First Gym today
          </p>
        </div>

        <Card className="shadow-[var(--shadow-lg)] border-charcoal-200/70 dark:border-charcoal-800">
          <CardHeader>
            <CardTitle className="text-lg">Registration</CardTitle>
            <CardDescription>
              Fill in your details to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                    First Name
                  </label>
                  <Input
                    placeholder="John"
                    icon={<User className="h-4 w-4" />}
                    error={errors.first_name?.message}
                    {...register('first_name')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                    Last Name
                  </label>
                  <Input
                    placeholder="Doe"
                    icon={<User className="h-4 w-4" />}
                    error={errors.last_name?.message}
                    {...register('last_name')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  icon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="+234 800 000 0000"
                    icon={<Phone className="h-4 w-4" />}
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                    Date of Birth
                  </label>
                  <Input
                    type="date"
                    icon={<Calendar className="h-4 w-4" />}
                    error={errors.date_of_birth?.message}
                    {...register('date_of_birth')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                  Gender
                </label>
                <select
                  className="flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm dark:bg-charcoal-900 dark:border-charcoal-700 dark:text-charcoal-100"
                  {...register('gender')}
                >
                  <option value="">Select gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-xs text-red-500">{errors.gender.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      icon={<Lock className="h-4 w-4" />}
                      error={errors.password?.message}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Repeat password"
                    icon={<Lock className="h-4 w-4" />}
                    error={errors.confirm_password?.message}
                    {...register('confirm_password')}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
                Create Account
              </Button>
            </form>

            {/* Google Sign-Up */}
            <div className="mt-6">
              <GoogleButton onSuccess={() => navigate('/dashboard')} />
            </div>

            <p className="mt-6 text-center text-sm text-charcoal-500 dark:text-charcoal-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}