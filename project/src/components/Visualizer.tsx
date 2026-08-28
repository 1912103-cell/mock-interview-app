import { useEffect, useRef } from 'react';

interface VisualizerProps {
  active: boolean;
}

/**
 * Animated audio visualizer. Uses requestAnimationFrame to drive a
 * pseudo-random bar animation when active, and smoothly settles to a
 * flat baseline when inactive. Canvas-based for smooth 60fps motion.
 */
export default function Visualizer({ active }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const BAR_COUNT = 28;
    const bars = new Array(BAR_COUNT).fill(0.08);
    const targets = new Array(BAR_COUNT).fill(0.08);
    let raf = 0;

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      const gap = 4;
      const barW = (width - gap * (BAR_COUNT - 1)) / BAR_COUNT;
      const mid = BAR_COUNT / 2;

      for (let i = 0; i < BAR_COUNT; i++) {
        if (activeRef.current) {
          // symmetric falloff from center
          const dist = Math.abs(i - mid) / mid;
          const amp = (1 - dist * 0.55) * (0.45 + Math.random() * 0.55);
          targets[i] = Math.max(0.08, amp);
        } else {
          targets[i] = 0.08;
        }
        // ease toward target
        bars[i] += (targets[i] - bars[i]) * 0.22;

        const h = Math.max(4, bars[i] * height * 0.9);
        const x = i * (barW + gap);
        const y = (height - h) / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + h);
        if (activeRef.current) {
          grad.addColorStop(0, '#599dff');
          grad.addColorStop(1, '#1d57f5');
        } else {
          grad.addColorStop(0, '#cbd5e1');
          grad.addColorStop(1, '#94a3b8');
        }
        ctx.fillStyle = grad;
        const r = Math.min(barW / 2, 4);
        roundRect(ctx, x, y, barW, h, r);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-16 w-full"
      aria-hidden="true"
    />
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
