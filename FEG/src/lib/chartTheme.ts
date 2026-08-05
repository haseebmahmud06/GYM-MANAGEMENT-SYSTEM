/**
 * Centralized chart styling tokens for the Fitness First Gym dashboard.
 *
 * All Recharts charts across the app share these theme-aware styles so that
 * tooltips, grid lines, and axis text adapt automatically to Light and Dark
 * Mode. This avoids hardcoded hex values scattered across page components.
 */
import type { ThemeMode } from '@/types';

/** Chart color palette (shared with the design system). */
export const CHART_COLORS = {
  primary: '#4b59e0',
  primarySoft: '#7c93ff',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#ef4444',
  sky: '#3b82f6',
  violet: '#8b5cf6',
  slate500: '#85857f',
};

/**
 * Return a Recharts-compatible tooltip contentStyle that adapts to the theme.
 * Uses theme tokens so it stays consistent with the rest of the UI.
 */
export function chartTooltipStyle(theme: ThemeMode) {
  return {
    backgroundColor: theme === 'dark' ? '#171717' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? '#292929' : '#e8e8e6'}`,
    borderRadius: 8,
    color: theme === 'dark' ? '#f5f5f4' : '#171717',
    fontSize: 12,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  };
}

/** Axis tick style that adapts to the theme. */
export function chartTickStyle(theme: ThemeMode) {
  return { fill: theme === 'dark' ? '#85857f' : '#85857f', fontSize: 12 };
}

/** Cartesian grid stroke that adapts to the theme. */
export function chartGridColor(theme: ThemeMode) {
  return theme === 'dark' ? '#292929' : '#e8e8e6';
}

/** Cursor fill for bar/area charts that adapts to the theme. */
export function chartCursorColor(theme: ThemeMode) {
  return theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
}
