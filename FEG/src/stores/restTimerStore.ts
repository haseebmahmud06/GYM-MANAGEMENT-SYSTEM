/**
 * Rest timer state stored in Zustand so the countdown survives navigation
 * between pages. The timer remains mounted at the layout level and its state
 * is controlled globally here.
 */
import { create } from 'zustand';

interface RestTimerState {
  /** Total duration in seconds for the current run. */
  total: number;
  /** Seconds remaining in the current run. */
  remaining: number;
  /** Whether the timer is actively counting down. */
  running: boolean;
  /** Whether the timer has completed (0 remaining) and is waiting to reset. */
  finished: boolean;

  /** Start a new countdown with a given duration (seconds). */
  start: (seconds: number) => void;
  /** Pause the countdown without resetting remaining time. */
  pause: () => void;
  /** Resume a paused countdown. */
  resume: () => void;
  /** Reset the current countdown to its total duration and stop. */
  reset: () => void;
  /** Stop and clear the timer entirely. */
  stop: () => void;
  /** Set the remaining seconds directly (used by the ticking effect). */
  setRemaining: (r: number) => void;
  /** Mark the timer finished (called by the ticking effect). */
  markFinished: () => void;
}

export const useRestTimer = create<RestTimerState>((set, get) => ({
  total: 60,
  remaining: 60,
  running: false,
  finished: false,

  start: (seconds) =>
    set({ total: seconds, remaining: seconds, running: true, finished: false }),

  pause: () => set({ running: false }),

  resume: () => {
    const { remaining, finished } = get();
    if (finished) {
      // Restart from full if resuming after finish.
      set({ remaining: get().total, running: true, finished: false });
      return;
    }
    if (remaining > 0) set({ running: true });
  },

  reset: () => set({ running: false, finished: false, remaining: get().total }),

  stop: () => set({ running: false, finished: false, total: 60, remaining: 60 }),

  setRemaining: (r) => set({ remaining: r }),

  markFinished: () => set({ running: false, finished: true, remaining: 0 }),
}));
