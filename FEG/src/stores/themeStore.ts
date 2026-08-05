/**
 * Theme store for managing light/dark mode.
 * Persists theme preference and applies the appropriate class to the document.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode } from '@/types';

// ============================================================
// Theme State Interface
// ============================================================

interface ThemeState {
  /** Current theme mode */
  theme: ThemeMode;
  /** Toggle between light and dark mode */
  toggleTheme: () => void;
  /** Set a specific theme mode */
  setTheme: (theme: ThemeMode) => void;
}

// ============================================================
// Theme Store
// ============================================================

/**
 * Zustand store for theme management.
 * Persists theme preference and automatically applies dark class to <html> element.
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',

      /**
       * Toggle between light and dark mode.
       * Updates the document class for Tailwind dark mode support.
       */
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          applyTheme(newTheme);
          return { theme: newTheme };
        }),

      /**
       * Set a specific theme mode.
       */
      setTheme: (theme: ThemeMode) => {
        applyTheme(theme);
        set({ theme });
      },
    }),
    {
      name: 'ffg-theme-storage',
    }
  )
);

/**
 * Apply the theme to the document by toggling the dark class.
 */
function applyTheme(theme: ThemeMode): void {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

// Initialize theme on load
const savedTheme = localStorage.getItem('ffg-theme-storage');
if (savedTheme) {
  try {
    const parsed = JSON.parse(savedTheme);
    if (parsed.state?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch {
    // Ignore parse errors
  }
}