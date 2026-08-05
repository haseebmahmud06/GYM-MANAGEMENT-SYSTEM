/**
 * TypeScript type definitions for Fitness First Gym Management System.
 * Mirrors the Django backend models for type-safe API interactions.
 */

// ============================================================
// User & Authentication Types
// ============================================================

/** User roles for role-based access control */
export type UserRole = 'super_admin' | 'admin' | 'receptionist' | 'trainer' | 'member';

/** Gender options */
export type Gender = 'M' | 'F' | 'O';

/** Membership status */
export type MembershipStatus = 'active' | 'expired' | 'pending' | 'cancelled';

/** User profile matching Django's User model */
export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  date_of_birth: string | null;
  age: number | null;
  gender: Gender;
  profile_picture: string | null;
  address: string;
  city: string;
  state: string;
  country: string;
  member_id: string | null;
  membership_status: MembershipStatus;
  membership_start_date: string | null;
  membership_end_date: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  emergency_contact: string;
  emergency_phone: string;
  medical_conditions: string;
  fitness_goals: string;
  email_verified: boolean;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
}

/** Registration payload */
export interface RegisterPayload {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string;
  gender: Gender;
  password: string;
  confirm_password: string;
}

/** Login payload */
export interface LoginPayload {
  email: string;
  password: string;
}

/** JWT token response */
export interface TokenResponse {
  access: string;
  refresh: string;
}

/** Profile update payload */
export interface ProfileUpdatePayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: Gender;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  profile_picture?: File;
  height_cm?: number;
  weight_kg?: number;
  emergency_contact?: string;
  emergency_phone?: string;
  medical_conditions?: string;
  fitness_goals?: string;
}

// ============================================================
// Package Types
// ============================================================

/** Package category taxonomy (admin-managed). */
export interface Category {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  image: string | null;
}

/** Package type taxonomy - groups packages by duration (admin-managed). */
export interface PackageType {
  id: number;
  name: string;
  duration_days: number;
}

/** Membership package matching Django's Package model */
export interface Package {
  id: number;
  category: number | null;
  category_name: string | null;
  package_type: number | null;
  package_type_name: string | null;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  discount: number;
  discounted_price: number;
  benefits: string;
  benefits_list: string[];
  available_classes: string;
  available_classes_list: string[];
  image: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// ============================================================
// Booking Types
// ============================================================

/** Booking type options */
export type BookingType = 'class' | 'personal_training' | 'session';

/** Booking status */
export type BookingStatus = 'pending' | 'approved' | 'completed' | 'cancelled';

/** Booking matching Django's Booking model */
export interface Booking {
  id: number;
  user: number;
  package: number | null;
  trainer: number | null;
  booking_type: BookingType;
  title: string;
  description: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  notes: string;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Payment Types
// ============================================================

/** Payment method options */
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'online';

/** Payment status */
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded';

/** Payment matching Django's Payment model */
export interface Payment {
  id: number;
  user: number;
  booking: number | null;
  membership_type: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  transaction_id: string;
  status: PaymentStatus;
  reference: string;
  notes: string;
}

/** Invoice matching Django's Invoice model */
export interface Invoice {
  id: number;
  payment: number;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  pdf_file: string | null;
}

// ============================================================
// Trainer Types
// ============================================================

/** Trainer matching Django's Trainer model */
export interface Trainer {
  id: number;
  user: number | null;
  name: string;
  specialization: string;
  experience_years: number;
  bio: string;
  photo: string | null;
  certificates: string | null;
  working_hours: Record<string, { start: string; end: string }>;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  working_days: string[];
  created_at: string;
}

// ============================================================
// Attendance Types
// ============================================================

/** Attendance record matching Django's Attendance model */
export interface Attendance {
  id: number;
  user: number;
  date: string;
  check_in: string;
  check_out: string | null;
  is_late: boolean;
  status: 'present' | 'absent' | 'late' | 'half_day';
  notes: string;
  created_at: string;
}

// ============================================================
// Notification Types
// ============================================================

/** Notification matching Django's Notification model */
export interface Notification {
  id: number;
  user: number;
  title: string;
  message: string;
  notification_type: 'in_app' | 'email' | 'sms';
  related_to: string;
  is_read: boolean;
  created_at: string;
}

// ============================================================
// Equipment Types
// ============================================================

/** Equipment matching Django's Equipment model */
export interface Equipment {
  id: number;
  name: string;
  brand: string;
  description: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  location: string;
  purchase_date: string | null;
  maintenance_date: string | null;
  next_maintenance_date: string | null;
  status: 'operational' | 'under_maintenance' | 'broken' | 'retired';
  image: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// API Response Types
// ============================================================

/** Paginated API response */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Dashboard stats */
export interface DashboardStats {
  total_members: number;
  active_members: number;
  new_registrations: number;
  today_checkins: number;
  monthly_revenue: number;
  total_revenue: number;
  expiring_memberships: number;
  total_bookings: number;
  pending_payments: number;
  total_trainers: number;
  total_equipment: number;
}

/** Revenue chart data */
export interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

/** Attendance chart data */
export interface AttendanceData {
  date: string;
  checkins: number;
  late: number;
}

/** Member growth data */
export interface GrowthData {
  month: string;
  new_members: number;
  total_members: number;
}

// ============================================================
// Contact & Inquiry Types
// ============================================================

/** Contact form submission */
export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ============================================================
// Theme Types
// ============================================================

/** Theme mode */
export type ThemeMode = 'light' | 'dark';

// ============================================================
// Workout & Fitness Tracking Types
// ============================================================

/** Exercise categories */
export type ExerciseCategory =
  | 'chest' | 'back' | 'shoulders' | 'legs' | 'arms'
  | 'core' | 'cardio' | 'full_body' | 'stretching';

/** Exercise difficulty */
export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/** Exercise library entry */
export interface Exercise {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: ExerciseCategory;
  primary_muscle: string;
  secondary_muscles: string;
  secondary_muscles_list: string[];
  equipment: string;
  difficulty: ExerciseDifficulty;
  instructions: string;
  common_mistakes: string;
  tips: string;
  image: string | null;
  video_url: string;
  is_bookmarked: boolean;
  created_at: string;
  updated_at: string;
}

/** Workout types */
export type WorkoutType = 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'endurance' | 'mixed';
export type WorkoutStatus = 'planned' | 'in_progress' | 'completed';
export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'legs' | 'arms' | 'core' | 'cardio' | 'full_body';

/** A single set within a workout exercise */
export interface WorkoutSet {
  id: number;
  workout_exercise: number;
  set_number: number;
  weight: number | null;
  reps: number | null;
  rest_time: number | null;
  rpe: number | null;
  notes: string;
  volume: number;
}

/** An exercise (with its sets) within a workout */
export interface WorkoutExercise {
  id: number;
  workout: number;
  exercise: number | null;
  exercise_name: string;
  order: number;
  sets: WorkoutSet[];
  volume: number;
}

/** Workout session */
export interface Workout {
  id: number;
  user: number;
  user_name: string;
  name: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  notes: string;
  muscle_group: MuscleGroup | '';
  workout_type: WorkoutType;
  status: WorkoutStatus;
  exercises: WorkoutExercise[];
  total_volume: number;
  total_sets: number;
  total_reps: number;
  exercise_count: number;
  created_at: string;
  updated_at: string;
}

/** Body measurement snapshot */
export interface BodyMeasurement {
  id: number;
  user: number;
  date: string;
  weight_kg: number | null;
  height_cm: number | null;
  body_fat_pct: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  arm_cm: number | null;
  leg_cm: number | null;
  bmi: number | null;
  notes: string;
  created_at: string;
}

/** Personal record types */
export type RecordType =
  | 'bench_press' | 'squat' | 'deadlift' | 'overhead_press' | 'run'
  | 'volume' | 'duration' | 'streak' | 'custom';

/** Personal record */
export interface PersonalRecord {
  id: number;
  user: number;
  exercise: string;
  record_type: RecordType;
  weight: number | null;
  reps: number | null;
  time_seconds: number | null;
  volume: number | null;
  achieved_date: string;
  is_current: boolean;
}

/** Wearable device types */
export type WearableDeviceType =
  | 'apple_watch' | 'garmin' | 'fitbit' | 'whoop' | 'samsung'
  | 'google_fit' | 'polar' | 'other';

/** Connected wearable device */
export interface WearableDevice {
  id: number;
  user: number;
  device_type: WearableDeviceType;
  name: string;
  provider: string;
  is_connected: boolean;
  last_synced: string | null;
  created_at: string;
}

/** Synced wearable data */
export interface WearableData {
  id: number;
  user: number;
  device: number | null;
  device_name: string;
  source: string;
  date: string;
  heart_rate: number | null;
  calories: number | null;
  steps: number | null;
  duration_minutes: number | null;
  distance_km: number | null;
  avg_pace: string;
  active_minutes: number | null;
  sleep_hours: number | null;
  sync_timestamp: string;
}

/** Workout goal */
export interface WorkoutGoal {
  id: number;
  user: number;
  name: string;
  metric: string;
  target_value: number;
  current_value: number;
  unit: string;
  status: 'active' | 'completed' | 'missed';
  target_date: string | null;
  progress_pct: number;
  created_at: string;
}

/** Workout post comment */
export interface WorkoutPostComment {
  id: number;
  user: number;
  post: number;
  user_name: string;
  user_avatar: string;
  text: string;
  created_at: string;
}

/** Social workout post */
export interface WorkoutPost {
  id: number;
  user: number;
  user_name: string;
  user_avatar: string;
  workout: number;
  workout_name: string;
  workout_volume: number;
  caption: string;
  like_count: number;
  is_public: boolean;
  liked_by_me: boolean;
  comments: WorkoutPostComment[];
  created_at: string;
}

/** Progress chart data point */
export interface ProgressPoint {
  label: string;
  volume?: number;
  sessions?: number;
  weight?: number;
  body_fat?: number;
  bmi?: number;
  chest?: number;
  waist?: number;
  arm?: number;
  leg?: number;
  exercise?: string;
}

/** Progress summary */
export interface ProgressSummary {
  total_volume: number;
  total_sessions: number;
  total_hours: number;
  current_streak: number;
  latest_weight: number | null;
  latest_bmi: number | null;
  personal_records: number;
}

/** Progress API response */
export interface ProgressResponse {
  metric: string;
  grouping: string;
  data: ProgressPoint[];
  summary: ProgressSummary;
}

/** Plate calculator response */
export interface PlateCalcResponse {
  target: number;
  barbell: number;
  unit: 'kg' | 'lb';
  plates: { plate: number; quantity: number }[];
  per_side_total: number;
  exact: boolean;
}