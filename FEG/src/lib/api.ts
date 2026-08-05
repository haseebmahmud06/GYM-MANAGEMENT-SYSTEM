/**
 * Axios API client for Fitness First Gym Management System.
 * Handles JWT authentication, request/response interceptors, and API endpoints.
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  User, RegisterPayload, LoginPayload, TokenResponse, ProfileUpdatePayload,
  Package, Category, PackageType, Booking, Payment, Invoice, Trainer, Attendance, Notification,
  Equipment, ContactSubmission, DashboardStats, RevenueData, AttendanceData,
  GrowthData, PaginatedResponse,
  Exercise, Workout, WorkoutExercise, WorkoutSet, BodyMeasurement, PersonalRecord,
  WearableDevice, WearableData, WorkoutGoal, WorkoutPost, WorkoutPostComment,
  ProgressResponse, PlateCalcResponse, RecordType,
} from '@/types';

// ============================================================
// API Configuration
// ============================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const ACCESS_TOKEN_KEY = 'ffg_access_token';
const REFRESH_TOKEN_KEY = 'ffg_refresh_token';

// ============================================================
// Axios Instance & Token Management
// ============================================================

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(tokens: TokenResponse): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

// ============================================================
// Interceptors
// ============================================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');
        const response = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh: refreshToken });
        localStorage.setItem(ACCESS_TOKEN_KEY, response.data.access);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        }
        return api(originalRequest);
      } catch {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================
// Auth API
// ============================================================

export const authApi = {
  register: (data: RegisterPayload) => api.post<User>('/auth/register/', data),
  login: (data: LoginPayload) => api.post<TokenResponse>('/token/', data),
  refreshToken: (refresh: string) => api.post<{ access: string }>('/token/refresh/', { refresh }),
  getProfile: () => api.get<User>('/auth/profile/'),
  updateProfile: (data: ProfileUpdatePayload) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value instanceof File ? value : String(value));
      }
    });
    return api.patch<User>('/auth/profile/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  changePassword: (data: { old_password: string; new_password: string }) =>
    api.post('/auth/change-password/', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password/', { email }),
  resetPassword: (token: string, password: string) =>
    api.post(`/auth/reset-password/${token}/`, { password }),

  // Google OAuth - send the Google ID token (credential) from the frontend.
  googleLogin: (credential: string) =>
    api.post<{ tokens: TokenResponse; user: User; created: boolean }>(
      '/auth/google/',
      { credential }
    ),

  // Members (admin)
  getMembers: (params?: { search?: string; membership_status?: string; page?: number }) =>
    api.get<PaginatedResponse<User>>('/auth/members/', { params }),
  getMember: (id: number) => api.get<User>(`/auth/members/${id}/`),
  updateMember: (id: number, data: Partial<User>) => api.patch<User>(`/auth/members/${id}/`, data),
  deleteMember: (id: number) => api.delete(`/auth/members/${id}/`),

  // Membership
  purchaseMembership: (data: { package_id: number; payment_method?: string }) =>
    api.post('/auth/membership/purchase/', data),
  renewMembership: (data: { package_id: number; payment_method?: string }) =>
    api.post('/auth/membership/renew/', data),
};

// ============================================================
// Packages API
// ============================================================

export const packagesApi = {
  getAll: (params?: { search?: string; page?: number }) =>
    api.get<PaginatedResponse<Package>>('/packages/', { params }),
  getById: (id: number) => api.get<Package>(`/packages/${id}/`),
  create: (data: Partial<Package>) => api.post<Package>('/packages/', data),
  update: (id: number, data: Partial<Package>) => api.patch<Package>(`/packages/${id}/`, data),
  delete: (id: number) => api.delete(`/packages/${id}/`),

  // Categories (public list + admin CRUD)
  getCategories: () =>
    api.get<PaginatedResponse<Category>>('/packages/categories/', {
      params: { page_size: 100 },
    }),
  createCategory: (data: Partial<Category>) =>
    api.post<Category>('/packages/categories/', data),
  updateCategory: (id: number, data: Partial<Category>) =>
    api.patch<Category>(`/packages/categories/${id}/`, data),
  deleteCategory: (id: number) => api.delete(`/packages/categories/${id}/`),

  // Package Types (public list + admin CRUD)
  getPackageTypes: () =>
    api.get<PaginatedResponse<PackageType>>('/packages/types/', {
      params: { page_size: 100 },
    }),
  createPackageType: (data: Partial<PackageType>) =>
    api.post<PackageType>('/packages/types/', data),
  updatePackageType: (id: number, data: Partial<PackageType>) =>
    api.patch<PackageType>(`/packages/types/${id}/`, data),
  deletePackageType: (id: number) => api.delete(`/packages/types/${id}/`),
};

// ============================================================
// Bookings API
// ============================================================

export const bookingsApi = {
  getAll: (params?: { page?: number; status?: string; booking_type?: string; search?: string }) =>
    api.get<PaginatedResponse<Booking>>('/bookings/', { params }),
  getById: (id: number) => api.get<Booking>(`/bookings/${id}/`),
  create: (data: Partial<Booking>) => api.post<Booking>('/bookings/', data),
  update: (id: number, data: Partial<Booking>) => api.patch<Booking>(`/bookings/${id}/`, data),
  delete: (id: number) => api.delete(`/bookings/${id}/`),
  cancel: (id: number) => api.post(`/bookings/${id}/cancel/`),
  approve: (id: number) => api.post(`/bookings/${id}/approve/`),
  complete: (id: number) => api.post(`/bookings/${id}/complete/`),
};

// ============================================================
// Payments API
// ============================================================

export const paymentsApi = {
  getAll: (params?: { page?: number; status?: string; start_date?: string; end_date?: string }) =>
    api.get<PaginatedResponse<Payment>>('/payments/', { params }),
  getById: (id: number) => api.get<Payment>(`/payments/${id}/`),
  create: (data: Partial<Payment>) => api.post<Payment>('/payments/', data),
  update: (id: number, data: Partial<Payment>) => api.patch<Payment>(`/payments/${id}/`, data),
  delete: (id: number) => api.delete(`/payments/${id}/`),
  approve: (id: number) => api.post(`/payments/${id}/approve/`),
  refund: (id: number) => api.post(`/payments/${id}/refund/`),
  getInvoices: (params?: { page?: number }) =>
    api.get<PaginatedResponse<Invoice>>('/payments/invoices/', { params }),
  getInvoice: (id: number) => api.get<Invoice>(`/payments/invoices/${id}/`),
};

// ============================================================
// Trainers API
// ============================================================

export const trainersApi = {
  getAll: (params?: { search?: string }) =>
    api.get<PaginatedResponse<Trainer>>('/trainers/', { params }),
  getById: (id: number) => api.get<Trainer>(`/trainers/${id}/`),
  create: (data: Partial<Trainer>) => api.post<Trainer>('/trainers/', data),
  update: (id: number, data: Partial<Trainer>) => api.patch<Trainer>(`/trainers/${id}/`, data),
  delete: (id: number) => api.delete(`/trainers/${id}/`),
};

// ============================================================
// Attendance API
// ============================================================

export const attendanceApi = {
  getAll: (params?: { page?: number; date?: string }) =>
    api.get<PaginatedResponse<Attendance>>('/attendance/', { params }),
  checkIn: (data: { method?: string }) => api.post<Attendance>('/attendance/check-in/', data),
  checkOut: () => api.post('/attendance/check-out/'),
};

// ============================================================
// Notifications API
// ============================================================

export const notificationsApi = {
  getAll: (params?: { page?: number; is_read?: boolean }) =>
    api.get<PaginatedResponse<Notification>>('/notifications/', { params }),
  markAsRead: (id: number) => api.post(`/notifications/${id}/read/`),
  markAllAsRead: () => api.post('/notifications/mark-all-read/'),
  getUnreadCount: () => api.get<{ count: number }>('/notifications/unread-count/'),
};

// ============================================================
// Equipment API
// ============================================================

export const equipmentApi = {
  getAll: (params?: { search?: string; status?: string }) =>
    api.get<PaginatedResponse<Equipment>>('/equipment/', { params }),
  getById: (id: number) => api.get<Equipment>(`/equipment/${id}/`),
  create: (data: Partial<Equipment>) => api.post<Equipment>('/equipment/', data),
  update: (id: number, data: Partial<Equipment>) => api.patch<Equipment>(`/equipment/${id}/`, data),
  delete: (id: number) => api.delete(`/equipment/${id}/`),
};

// ============================================================
// Dashboard API
// ============================================================

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats/'),
  getRevenueData: (period?: string) =>
    api.get<RevenueData[]>('/dashboard/revenue/', { params: { period } }),
  getAttendanceData: (period?: string) =>
    api.get<AttendanceData[]>('/dashboard/attendance/', { params: { period } }),
  getGrowthData: (period?: string) =>
    api.get<GrowthData[]>('/dashboard/growth/', { params: { period } }),
  getPopularPackages: (period?: string) =>
    api.get<{ name: string; value: number }[]>('/dashboard/popular-packages/', { params: { period } }),
  getRecentRegistrations: () => api.get('/dashboard/recent-registrations/'),

  // Real-data report exports (CSV downloads with optional date range)
  exportReport: (report: string, startDate?: string, endDate?: string) =>
    api.get('/dashboard/reports/export/', {
      params: { report, start_date: startDate, end_date: endDate },
      responseType: 'blob',
    }),

  // R analytics pipeline (generates ggplot2 visualisations)
  generateRReport: () => api.get('/dashboard/reports/r/'),
  generateWorkoutRReport: () => api.get('/dashboard/reports/r/workout/'),
  getRChart: (filename: string) => api.get(`/dashboard/reports/r-output/${filename}/`, { responseType: 'blob' }),
};

// ============================================================
// Contact API
// ============================================================

export const contactApi = {
  submit: (data: Partial<ContactSubmission>) =>
    api.post<ContactSubmission>('/contact/', data),
  getMessages: (params?: { search?: string; is_read?: boolean; page?: number }) =>
    api.get<PaginatedResponse<ContactSubmission>>('/contact/messages/', { params }),
  getMessage: (id: number) => api.get<ContactSubmission>(`/contact/messages/${id}/`),
  deleteMessage: (id: number) => api.delete(`/contact/messages/${id}/`),
  markAsRead: (id: number) => api.post(`/contact/messages/${id}/read/`),
};

// ============================================================
// Workouts (Fitness Tracking) API
// ============================================================

export const workoutsApi = {
  // Exercise Library
  getExercises: (params?: {
    search?: string; category?: string; muscle?: string;
    difficulty?: string; bookmarked?: boolean; page?: number;
  }) => api.get<PaginatedResponse<Exercise>>('/workouts/exercises/', { params }),
  getExercise: (id: number) => api.get<Exercise>(`/workouts/exercises/${id}/`),
  createExercise: (data: Partial<Exercise>) => api.post<Exercise>('/workouts/exercises/', data),
  updateExercise: (id: number, data: Partial<Exercise>) =>
    api.patch<Exercise>(`/workouts/exercises/${id}/`, data),
  deleteExercise: (id: number) => api.delete(`/workouts/exercises/${id}/`),
  toggleBookmark: (id: number) => api.post(`/workouts/exercises/${id}/bookmark/`),

  // Workout Logging
  getWorkouts: (params?: {
    search?: string; status?: string; workout_type?: string;
    date_from?: string; date_to?: string; page?: number; page_size?: number;
  }) => api.get<PaginatedResponse<Workout>>('/workouts/workouts/', { params }),
  getWorkout: (id: number) => api.get<Workout>(`/workouts/workouts/${id}/`),
  createWorkout: (data: Partial<Workout>) => api.post<Workout>('/workouts/workouts/', data),
  updateWorkout: (id: number, data: Partial<Workout>) =>
    api.patch<Workout>(`/workouts/workouts/${id}/`, data),
  deleteWorkout: (id: number) => api.delete(`/workouts/workouts/${id}/`),
  completeWorkout: (id: number) =>
    api.post<{ detail: string; new_records: PersonalRecord[] }>(
      `/workouts/workouts/${id}/complete/`
    ),

  // Workout Exercises & Sets
  addWorkoutExercise: (data: Partial<WorkoutExercise>) =>
    api.post<WorkoutExercise>('/workouts/workout-exercises/', data),
  updateWorkoutExercise: (id: number, data: Partial<WorkoutExercise>) =>
    api.patch<WorkoutExercise>(`/workouts/workout-exercises/${id}/`, data),
  deleteWorkoutExercise: (id: number) =>
    api.delete(`/workouts/workout-exercises/${id}/`),
  addSet: (data: Partial<WorkoutSet>) =>
    api.post<WorkoutSet>('/workouts/sets/', data),
  updateSet: (id: number, data: Partial<WorkoutSet>) =>
    api.patch<WorkoutSet>(`/workouts/sets/${id}/`, data),
  deleteSet: (id: number) => api.delete(`/workouts/sets/${id}/`),

  // Body Measurements
  getMeasurements: (params?: { date_from?: string; date_to?: string; page?: number }) =>
    api.get<PaginatedResponse<BodyMeasurement>>('/workouts/measurements/', { params }),
  createMeasurement: (data: Partial<BodyMeasurement>) =>
    api.post<BodyMeasurement>('/workouts/measurements/', data),
  updateMeasurement: (id: number, data: Partial<BodyMeasurement>) =>
    api.patch<BodyMeasurement>(`/workouts/measurements/${id}/`, data),
  deleteMeasurement: (id: number) => api.delete(`/workouts/measurements/${id}/`),

  // Personal Records
  getPersonalRecords: (params?: { record_type?: RecordType }) =>
    api.get<PaginatedResponse<PersonalRecord>>('/workouts/personal-records/', { params }),

  // Progress Analytics
  getProgress: (params?: { metric?: string; grouping?: string; range?: string }) =>
    api.get<ProgressResponse>('/workouts/progress/', { params }),

  // Wearable Integration
  getWearableDevices: () =>
    api.get<WearableDevice[]>('/workouts/wearable/devices/', { params: { page_size: 100 } }),
  connectWearable: (data: Partial<WearableDevice>) =>
    api.post<WearableDevice>('/workouts/wearable/connect/', data),
  disconnectWearable: (id: number) => api.post(`/workouts/wearable/disconnect/${id}/`),
  getWearableData: (params?: { date_from?: string }) =>
    api.get<PaginatedResponse<WearableData>>('/workouts/wearable/data/', { params }),
  syncWearableData: (data: Partial<WearableData>) =>
    api.post<WearableData>('/workouts/wearable/data/', data),

  // Goals
  getGoals: (params?: { status?: string }) =>
    api.get<PaginatedResponse<WorkoutGoal>>('/workouts/goals/', { params }),
  createGoal: (data: Partial<WorkoutGoal>) => api.post<WorkoutGoal>('/workouts/goals/', data),
  updateGoal: (id: number, data: Partial<WorkoutGoal>) =>
    api.patch<WorkoutGoal>(`/workouts/goals/${id}/`, data),
  deleteGoal: (id: number) => api.delete(`/workouts/goals/${id}/`),

  // Social / Sharing
  getPosts: (params?: { page?: number }) =>
    api.get<PaginatedResponse<WorkoutPost>>('/workouts/posts/', { params }),
  createPost: (data: Partial<WorkoutPost>) => api.post<WorkoutPost>('/workouts/posts/', data),
  deletePost: (id: number) => api.delete(`/workouts/posts/${id}/`),
  likePost: (id: number) =>
    api.post<{ liked: boolean; like_count: number }>(`/workouts/posts/${id}/like/`),
  addComment: (id: number, text: string) =>
    api.post<WorkoutPostComment>(`/workouts/posts/${id}/comments/`, { text }),

  // Plate Calculator
  calculatePlates: (params: { target: number; barbell?: number; unit?: 'kg' | 'lb' }) =>
    api.get<PlateCalcResponse>('/workouts/plate-calculator/', { params }),
};

export default api;