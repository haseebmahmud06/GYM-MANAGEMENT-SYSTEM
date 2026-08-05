/**
 * Authentication store using Zustand for state management.
 * Manages user authentication state, tokens, and profile data.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, TokenResponse } from '@/types';
import { setTokens, clearTokens } from '@/lib/api';

// ============================================================
// Auth State Interface
// ============================================================

interface AuthState {
  /** Current authenticated user */
  user: User | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether auth state is being loaded */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;

  // Actions
  /** Set the authenticated user */
  setUser: (user: User) => void;
  /** Set tokens after login */
  setAuth: (user: User, tokens: TokenResponse) => void;
  /** Clear auth state on logout */
  logout: () => void;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Set error state */
  setError: (error: string | null) => void;
  /** Update user profile data */
  updateUser: (updates: Partial<User>) => void;
}

// ============================================================
// Auth Store
// ============================================================

/**
 * Zustand store for authentication state.
 * Persists user data to localStorage for session continuity.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Set the authenticated user.
       */
      setUser: (user: User) =>
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }),

      /**
       * Set authentication state after successful login.
       * Stores JWT tokens and user data.
       */
      setAuth: (user: User, tokens: TokenResponse) => {
        setTokens(tokens);
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      /**
       * Clear authentication state on logout.
       * Removes tokens and user data.
       */
      logout: () => {
        clearTokens();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      /**
       * Set loading state for async operations.
       */
      setLoading: (isLoading: boolean) => set({ isLoading }),

      /**
       * Set error message.
       */
      setError: (error: string | null) => set({ error, isLoading: false }),

      /**
       * Update user profile data partially.
       */
      updateUser: (updates: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'ffg-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);