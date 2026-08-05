/**
 * RestTimer - an integrated rest timer with a circular countdown indicator.
 *
 * Features:
 * - Presets (30/45/60/90/120/180s) and a custom duration input
 * - Pause / Resume / Reset controls
 * - Circular progress indicator driven by framer-motion
 * - A short beep (WebAudio) when the timer completes
 * - Runs from the global restTimerStore so it survives page navigation
 *
 * Consumed by workout logging pages via <RestTimer />.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Play, Pause, RotateCcw, X, Timer as TimerIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useRestTimer } from '@/stores/restTimerStore';

const PRESETS = [30, 45, 60, 90, 120, 180];

/** Play a short two-tone beep using the Web Audio API. */
function playBeep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [0, 0.25].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = i === 0 ? 880 : 660;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.001, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.5);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.55);
    });
  } catch {
    /* Audio not supported - silent fallback. */
  }
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function RestTimer() {
  const { total, remaining, running, finished, start, pause, resume, reset, stop } = useRestTimer();
  const [custom, setCustom] = useState('60');

  // Tick the countdown each second while running.
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      const { remaining: r, running: run } = useRestTimer.getState();
      if (!run) return;
      if (r <= 1) {
        useRestTimer.getState().markFinished();
        playBeep();
      } else {
        useRestTimer.getState().setRemaining(r - 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  const pct = useMemo(() => (total > 0 ? (remaining / total) * 100 : 0), [remaining, total]);
  const isActive = running || (!finished && remaining !== total);

  const handleCustomStart = useCallback(() => {
    const val = parseInt(custom, 10);
    if (!val || val <= 0 || val > 3600) return;
    start(val);
  }, [custom, start]);

  // If idle/hidden show a compact collapsed view.
  if (!isActive && !finished) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-charcoal-200 bg-white px-3 py-2 shadow-sm dark:border-charcoal-800 dark:bg-charcoal-900">
        <TimerIcon className="h-4 w-4 text-primary-600" />
        <span className="text-sm text-charcoal-600 dark:text-charcoal-300">Rest Timer</span>
        <div className="ml-auto flex items-center gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => start(p)}
              className="rounded-md px-2 py-1 text-xs font-medium text-charcoal-600 hover:bg-primary-50 hover:text-primary-700 dark:text-charcoal-300 dark:hover:bg-charcoal-800"
            >
              {p}s
            </button>
          ))}
          <Input
            type="number"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="h-8 w-16 text-xs"
            min={1}
          />
          <Button size="sm" onClick={handleCustomStart} className="h-8">
            <Play className="h-3.5 w-3.5 mr-1" /> Start
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-sm dark:border-charcoal-800 dark:bg-charcoal-900">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TimerIcon className="h-4 w-4 text-primary-600" />
          <span className="font-semibold text-charcoal-900 dark:text-white">Rest Timer</span>
        </div>
        <Button variant="ghost" size="icon" onClick={stop} aria-label="Close timer">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Circular progress */}
      <div className="relative mx-auto h-44 w-44">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r="44" fill="none" strokeWidth="6" className="stroke-charcoal-200 dark:stroke-charcoal-800" />
          <motion.circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            className="stroke-primary-600"
            strokeDasharray={2 * Math.PI * 44}
            animate={{ strokeDashoffset: (2 * Math.PI * 44) * (1 - pct / 100) }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={remaining}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            className={cn('font-mono text-4xl font-bold', finished ? 'text-emerald-600' : 'text-charcoal-900 dark:text-white')}
          >
            {formatTime(remaining)}
          </motion.span>
          <span className="text-xs text-charcoal-400">{finished ? 'Time\'s up!' : running ? 'Resting' : 'Paused'}</span>
        </div>
      </div>

      {/* Presets */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => start(p)}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              total === p && !finished
                ? 'bg-primary-600 text-white'
                : 'bg-charcoal-100 text-charcoal-600 hover:bg-primary-50 hover:text-primary-700 dark:bg-charcoal-800 dark:text-charcoal-300'
            )}
          >
            {p}s
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-center gap-3">
        {running ? (
          <Button onClick={pause}>
            <Pause className="h-4 w-4 mr-1" /> Pause
          </Button>
        ) : (
          <Button onClick={resume} disabled={finished}>
            <Play className="h-4 w-4 mr-1" /> {remaining === total ? 'Start' : 'Resume'}
          </Button>
        )}
        <Button variant="outline" onClick={reset}>
          <RotateCcw className="h-4 w-4 mr-1" /> Reset
        </Button>
      </div>
    </div>
  );
}
