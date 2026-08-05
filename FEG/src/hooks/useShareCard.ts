/**
 * useShareCard - generates a shareable workout summary image (PNG) using the
 * native Canvas API, so no extra dependencies are required. Returns a function
 * that draws a branded summary card and triggers a download.
 */
import { useCallback } from 'react';
import type { Workout } from '@/types';

const COLORS = {
  bg: '#0f172a',
  card: '#1e293b',
  primary: '#f59e0b',
  text: '#f8fafc',
  muted: '#94a3b8',
};

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Draw a rounded-rect path.
 */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function useShareCard() {
  const generateCard = useCallback(async (workout: Workout, userName: string): Promise<Blob | null> => {
    try {
      const W = 1080;
      const H = 1350;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Background
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(0, 0, W, H);

      // Card
      roundRect(ctx, 90, 120, W - 180, H - 240, 32);
      ctx.fillStyle = COLORS.card;
      ctx.fill();

      // Accent bar
      roundRect(ctx, 90, 120, W - 180, 14, 7);
      ctx.fillStyle = COLORS.primary;
      ctx.fill();

      // Brand
      ctx.fillStyle = COLORS.primary;
      ctx.font = '700 40px system-ui, sans-serif';
      ctx.fillText('FITNESS FIRST GYM', 160, 210);

      // Title
      ctx.fillStyle = COLORS.text;
      ctx.font = '800 64px system-ui, sans-serif';
      ctx.fillText(workout.name.length > 22 ? workout.name.slice(0, 22) + '…' : workout.name, 160, 300);

      // Date
      ctx.fillStyle = COLORS.muted;
      ctx.font = '400 32px system-ui, sans-serif';
      ctx.fillText(formatDate(workout.date), 160, 360);

      // Divider
      ctx.strokeStyle = 'rgba(148,163,184,0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(160, 400);
      ctx.lineTo(W - 160, 400);
      ctx.stroke();

      // Stats grid
      const stats: { label: string; value: string }[] = [
        { label: 'Volume', value: `${Math.round(workout.total_volume || 0)} kg` },
        { label: 'Exercises', value: `${workout.exercise_count || 0}` },
        { label: 'Sets', value: `${workout.total_sets || 0}` },
        { label: 'Duration', value: `${workout.duration_minutes || 0} min` },
      ];

      const startX = 160;
      const gap = (W - 320 - 4 * 200) / 3;
      stats.forEach((s, i) => {
        const x = startX + i * (200 + gap);
        roundRect(ctx, x, 440, 200, 150, 20);
        ctx.fillStyle = 'rgba(15,23,42,0.6)';
        ctx.fill();
        ctx.fillStyle = COLORS.primary;
        ctx.font = '700 36px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(s.value, x + 100, 500);
        ctx.fillStyle = COLORS.muted;
        ctx.font = '400 24px system-ui, sans-serif';
        ctx.fillText(s.label, x + 100, 560);
        ctx.textAlign = 'left';
      });

      // Exercise list top 4
      ctx.fillStyle = COLORS.text;
      ctx.font = '600 34px system-ui, sans-serif';
      ctx.fillText('Workout Details', 160, 680);
      workout.exercises?.slice(0, 4).forEach((we, i) => {
        const y = 740 + i * 70;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(148,163,184,0.15)' : 'transparent';
        roundRect(ctx, 160, y - 44, W - 320, 56, 12);
        ctx.fill();
        ctx.fillStyle = COLORS.text;
        ctx.font = '500 28px system-ui, sans-serif';
        ctx.fillText(we.exercise_name.length > 26 ? we.exercise_name.slice(0, 26) + '…' : we.exercise_name, 190, y);
        const sets = (we.sets || []).length;
        ctx.fillStyle = COLORS.muted;
        ctx.font = '400 26px system-ui, sans-serif';
        ctx.fillText(`${sets} set${sets === 1 ? '' : 's'}`, W - 380, y);
      });

      // Footer
      ctx.fillStyle = COLORS.muted;
      ctx.font = '400 28px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Shared by ${userName} · Fitness First Gym`, W / 2, H - 160);
      ctx.fillStyle = COLORS.primary;
      ctx.font = '600 26px system-ui, sans-serif';
      ctx.fillText('fitnessfirstgym.com', W / 2, H - 110);
      ctx.textAlign = 'left';

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
      return blob;
    } catch {
      return null;
    }
  }, []);

  const downloadCard = useCallback(
    async (workout: Workout, userName: string) => {
      const blob = await generateCard(workout, userName);
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workout-${workout.id || 'summary'}-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [generateCard]
  );

  return { generateCard, downloadCard };
}
