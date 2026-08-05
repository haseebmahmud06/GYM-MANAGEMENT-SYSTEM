/**
 * Forgot Password page for requesting a password reset link.
 * Enterprise-grade design with form validation and API integration.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { authApi } from '@/lib/api';
import { Dumbbell, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================
// Form Schema
// ============================================================

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ============================================================
// Forgot Password Page
// ============================================================

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  /**
   * Handle forgot password form submission.
   * Requests a password reset link for the provided email.
   */
  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await authApi.forgotPassword(data.email);
      setSubmitted(true);
      toast.success('Password reset link sent!');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to send reset link. Please try again.';
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
            Reset Password
          </h1>
          <p className="text-sm text-charcoal-500 dark:text-charcoal-500 mt-1.5">
            Enter your email to receive a reset link
          </p>
        </div>

        {/* Forgot Password Card */}
        <Card className="shadow-[var(--shadow-lg)] border-charcoal-200/70 dark:border-charcoal-800">
          <CardHeader>
            <CardTitle className="text-lg">Forgot Password</CardTitle>
            <CardDescription>
              We'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center py-6">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-charcoal-900 dark:text-white mb-2">
                  Check your email
                </h3>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mb-6">
                  If an account exists for that email, a password reset link has been sent.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
            ) : (
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

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isSubmitting}
                >
                  Send Reset Link
                </Button>
              </form>
            )}

            {/* Back to Login Link */}
            {!submitted && (
              <p className="mt-6 text-center text-sm text-charcoal-500 dark:text-charcoal-400">
                Remembered your password?{' '}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                >
                  Back to login
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}