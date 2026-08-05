/**
 * RestTimer - a persistent workout rest timer.
 *
 * Features:
 * - Presets (30/45/60/90/120/180 seconds) + custom duration
 * - Start / Pause / Resume / Reset
 * - Circular countdown progress indicator with animation
 * - Sound notification when the timer finishes
 * - Persists state across page navigation via localStorage (and continues
 *   ticking even when the user moves between workout pages).
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Timer as TimerIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const PRESETS = [30, 45, 60, 90, 120, 180];

const STORAGE_KEY = 'ffg_rest_timer';

interface PersistedState {
  endTime: number | null;   // epoch ms when the timer should finish
  duration: number;         // total duration in seconds
  remaining: number;        // remaining seconds (when paused)
  running: boolean;
}

/** Small Web Audio beep used as the completion sound (no asset needed). */
let audioCtx: AudioContext | null = null;
function playBeep() {
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AC();
    }
    const ctx = audioCtx as AudioContext;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 880;
    oscillator.type = 'sine';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.5);
  } catch {
    /* audio not available */
  }
}

function loadPersisted(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

function persist(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export default function RestTimer() {
  const [duration, setDuration] = useState(60);
  const [custom, setCustom] = useState('60');
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(60);
  const endTimeRef = useRef<number | null>(null);
  const [completed, setCompleted] = useState(false);

  // Restore persisted state on mount and resume ticking.
  useEffect(() => {
    const saved = loadPersisted();
    if (saved) {
      setDuration(saved.duration);
      setRemaining(saved.remaining);
      if (saved.running && saved.endTime) {
        endTimeRef.current = saved.endTime;
        setRunning(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Main ticker - runs whenever `running` is true.
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      const end = endTimeRef.current;
      if (end === null) return;
      const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setRemaining(left);
      persist({ endTime: end, duration, remaining: left, running: true });
      if (left <= 0) {
        setRunning(false);
        setCompleted(true);
        playBeep();
        persist({ endTime: null, duration, remaining: 0, running: false });
        window.setTimeout(() => setCompleted(false), 3000);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [running, duration]);

  const start = useCallback(() => {
    const secs = Math.max(1, duration);
    endTimeRef.current = Date.now() + secs * 1000;
    setRemaining(secs);
    setRunning(true);
    setCompleted(false);
    persist({ endTime: endTimeRef.current, duration: secs, remaining: secs, running: true });
  }, [duration]);

  const pause = useCallback(() => {
    setRunning(false);
    setCompleted(false);
    const left = remaining;
    endTimeRef.current = null;
    persist({ endTime: null, duration, remaining: left, running: false });
  }, [duration, remaining]);

  const resume = useCallback(() => {
    const secs = Math.max(1, remaining);
    endTimeRef.current = Date.now() + secs * 1000;
    setRunning(true);
    setCompleted(false);
    persist({ endTime: endTimeRef.current, duration, remaining: secs, running: true });
  }, [duration, remaining]);

  const reset = useCallback(() => {
    setRunning(false);
    setCompleted(false);
    endTimeRef.current = null;
    setRemaining(duration);
    persist({ endTime: null, duration, remaining: duration, running: false });
  }, [duration]);

  const setPreset = useCallback(
    (secs: number) => {
      setDuration(secs);
      setCustom(String(secs));
      setRemaining(secs);
      setRunning(false);
      setCompleted(false);
      endTimeRef.current = null;
      persist({ endTime: null, duration: secs, remaining: secs, running: false });
    },
    []
  );

  const applyCustom = useCallback(() => {
    const parsed = parseInt(custom, 10);
    if (isNaN(parsed) || parsed < 1) return;
    setPreset(parsed);
  }, [custom, setPreset]);

  const progress = duration > 0 ? remaining / duration : 0;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Circular SVG progress (visual countdown animation).
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Circular countdown */}
      <div className="relative h-48 w-48">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={radius} fill="none" strokeWidth="8"
            className="stroke-charcoal-100 dark:stroke-charcoal-800" />
          <motion.circle
            cx="80" cy="80" r={radius} fill="none" strokeWidth="8"
            strokeLinecap="round"
            className="stroke-primary-600 dark:stroke-primary-500"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.25, ease: 'linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <TimerIcon className="h-5 w-5 text-charcoal-400 mb-1" />
          <AnimatePresence mode="wait">
            <motion.span
              key={display}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className={cn(
                'font-mono text-4xl font-bold tabular-nums',
                completed
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-charcoal-900 dark:text-white'
              )}
            >
              {display}
            </motion.span>
          </AnimatePresence>
          {completed && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1"
            >
              Time's up! 🔔
            </motion.span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {running ? (
          <>
            <Button variant="outline" onClick={pause}>
              <Pause className="h-4 w-4 mr-2" /> Pause
            </Button>
            <Button variant="ghost" onClick={reset}>
              <RotateCcw className="h-4 w-4 mr-2" /> Reset
            </Button>
          </>
        ) : remaining > 0 && remaining < duration ? (
          <>
            <Button onClick={resume}>
              <Play className="h-4 w-4 mr-2" /> Resume
            </Button>
            <Button variant="ghost" onClick={reset}>
              <RotateCcw className="h-4 w-4 mr-2" /> Reset
            </Button>
          </>
        ) : (
          <Button onClick={start}>
            <Play className="h-4 w-4 mr-2" /> Start Timer
          </Button>
        )}
      </div>

      {/* Presets */}
      <div className="flex flex-wrap justify-center gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setPreset(p)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors border',
              duration === p
                ? 'bg-primary-600 text-white border-primary-600'
                : 'border-charcoal-200 text-charcoal-600 hover:bg-charcoal-100 dark:border-charcoal-700 dark:text-charcoal-300 dark:hover:bg-charcoal-800'
            )}
          >
            {p}s
          </button>
        ))}
      </div>

      {/* Custom duration */}
      <div className="flex items-end gap-2 w-full max-w-[220px]">
        <div className="flex-1">
          <Label htmlFor="custom-time" className="mb-1 block">Custom (seconds)</Label>
          <Input
            id="custom-time"
            type="number"
            min={1}
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyCustom();
            }}
          />
        </div>
        <Button variant="outline" onClick={applyCustom}>Apply</Button>
      </div>
    </div>
  );
}
