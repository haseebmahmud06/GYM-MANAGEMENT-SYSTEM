/**
 * Utility functions for the Fitness First Gym Management System.
 * Provides class name merging, date formatting, and other helpers.
 */
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes with proper conflict resolution.
 * Combines clsx for conditional classes with tailwind-merge for deduplication.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to a human-readable format.
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a time string to a human-readable format.
 * Handles both "HH:MM" and full ISO datetime strings.
 */
export function formatTime(timeString: string | null | undefined): string {
  if (!timeString) return 'N/A';
  // Extract time from ISO datetime if present
  const timePart = timeString.includes('T')
    ? timeString.split('T')[1]?.substring(0, 5)
    : timeString.substring(0, 5);
  if (!timePart) return 'N/A';
  const [hours, minutes] = timePart.split(':');
  const hour = parseInt(hours, 10);
  if (isNaN(hour)) return 'N/A';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Format a number as currency (USD).
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return '$0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format a number with commas.
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Calculate the number of days between two dates.
 */
export function daysBetween(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get the remaining days from today until a target date.
 */
export function daysRemaining(targetDate: string | null | undefined): number {
  if (!targetDate) return 0;
  const today = new Date();
  const target = new Date(targetDate);
  const diffTime = target.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

/**
 * Truncate text to a specified length with ellipsis.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Get initials from a full name.
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Generate a random color based on a string (for avatars).
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
  ];
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Get the status color class for a membership status.
 */
export function getMembershipStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    expired: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Get the status color class for a booking status.
 */
export function getBookingStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Format a date as relative time (e.g., "2 hours ago", "3 days ago").
 */
export function formatTimeAgo(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
}

/**
 * Get the status color class for a payment status.
 */
export function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    partial: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    refunded: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Resolve a media/asset path to a fully-qualified URL the browser can load.
 *
 * The backend returns image paths like "/media/packages/Gymkits.jpeg.jpg" (or
 * absolute http://... URLs in dev). In production the frontend and the Django
 * backend live on different origins, so relative "/media/..." paths must be
 * prefixed with the backend's base URL (from VITE_API_URL).
 *
 * - Absolute URLs (http/https/data:) are returned unchanged.
 * - Relative "/media|/static" paths are prefixed with the API origin.
 * - Empty/null values fall back to an empty string.
 */
export function assetUrl(path: string | null | undefined): string {
  if (!path) return '';
  // Already absolute (http://, https://, //, data:) -> use as-is.
  if (/^(https?:)?\/\//i.test(path) || /^data:/i.test(path)) return path;
  // Relative media/static path -> prefix with the API origin.
  const apiBase = import.meta.env.VITE_API_URL || '/api';
  const origin = apiBase.replace(/\/api\/?$/, '');
  return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
}