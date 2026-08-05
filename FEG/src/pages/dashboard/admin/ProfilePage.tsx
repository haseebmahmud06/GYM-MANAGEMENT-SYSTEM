/**
 * Profile page for admin to view and update their profile information.
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Calendar, Camera, Save, Lock, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  first_name: z.string().min(2, 'First name is required'),
  last_name: z.string().min(2, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  current_password: z.string().min(6, 'Current password is required'),
  new_password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      country: user?.country || 'Nigeria',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      await authApi.updateProfile(data);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      await authApi.changePassword({
        old_password: data.current_password,
        new_password: data.new_password,
      });
      toast.success('Password changed successfully');
      setShowPasswordForm(false);
      passwordForm.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">My Profile</h2>
        <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">Manage your account information and security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative inline-block">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-3xl font-bold mx-auto">
                  {user?.full_name?.charAt(0) || 'A'}
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900 dark:text-white mt-4">{user?.full_name || 'Admin User'}</h3>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400">{user?.email}</p>
              <div className="mt-4 flex justify-center gap-2">
                <Badge variant="success">Administrator</Badge>
                {user?.email_verified && <Badge variant="info">Verified</Badge>}
              </div>
              <div className="mt-6 space-y-3 text-left">
                <div className="flex items-center gap-2 text-sm text-charcoal-600 dark:text-charcoal-400">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {user?.date_joined ? formatDate(user.date_joined) : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-charcoal-600 dark:text-charcoal-400">
                  <Shield className="h-4 w-4" />
                  <span>Role: Administrator</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary-600" />Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">First Name</label>
                    <Input {...profileForm.register('first_name')} error={profileForm.formState.errors.first_name?.message} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">Last Name</label>
                    <Input {...profileForm.register('last_name')} error={profileForm.formState.errors.last_name?.message} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">Email</label>
                    <Input type="email" icon={<Mail className="h-4 w-4" />} {...profileForm.register('email')} error={profileForm.formState.errors.email?.message} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">Phone</label>
                    <Input type="tel" icon={<Phone className="h-4 w-4" />} {...profileForm.register('phone')} error={profileForm.formState.errors.phone?.message} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">Address</label>
                    <Input {...profileForm.register('address')} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">City</label>
                    <Input {...profileForm.register('city')} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">State</label>
                    <Input {...profileForm.register('state')} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">Country</label>
                    <Input {...profileForm.register('country')} />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" isLoading={profileForm.formState.isSubmitting}>
                    <Save className="h-4 w-4 mr-2" />Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-primary-600" />Security</CardTitle>
              <CardDescription>Manage your password and security settings</CardDescription>
            </CardHeader>
            <CardContent>
              {!showPasswordForm ? (
                <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
                  <Lock className="h-4 w-4 mr-2" />Change Password
                </Button>
              ) : (
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">Current Password</label>
                      <Input type="password" {...passwordForm.register('current_password')} error={passwordForm.formState.errors.current_password?.message} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">New Password</label>
                      <Input type="password" {...passwordForm.register('new_password')} error={passwordForm.formState.errors.new_password?.message} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">Confirm Password</label>
                      <Input type="password" {...passwordForm.register('confirm_password')} error={passwordForm.formState.errors.confirm_password?.message} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={() => { setShowPasswordForm(false); passwordForm.reset(); }}>Cancel</Button>
                    <Button type="submit" isLoading={passwordForm.formState.isSubmitting}>Update Password</Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}