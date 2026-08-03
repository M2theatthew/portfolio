import { useEffect, useRef } from 'react';

interface AmbientParticlesProps {
  /** How many floating dust particles to render. */
  density?: number;
  /** Color hues (0-360) the particles are drawn from. Teal ~188, coral ~340. */
  hues?: number[];
  /** Optional soft radial glow(s) — {x, y} as 0-1 fractions of the container. */
  glows?: Array<{ x: number; y: number; hue: number; radiusFrac?: number; alpha?: number }>;
  /** Optional firework-style particle bursts, matching the hero's splash effect — {x, y} as 0-1 fractions of the container. */
  splashes?: Array<{ x: number; y: number; hue: number; count?: number }>;
  className?: string;
}

// A lightweight, self-contained echo of the hero's SceneCanvas dust field —
// sized to whatever section wraps it (not the viewport), and paused via
// IntersectionObserver when scrolled out of view to keep it cheap.
export default function AmbientParticles({
  density = 45,
  hues = [188, 340],
  glows = [],
  splashes = [],
  className = '',
}: AmbientParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    // Static per-frame gradients (same geometry/color-stops every draw) are
    // pre-composited into an offscreen bitmap once per resize, rather than
    // re-filling the full canvas with each gradient every single frame —
    // same fix as SceneCanvas, for the same reason (cheap in Chrome,
    // expensive full-canvas overdraw in Firefox).
    const bgCanvas = document.createElement('canvas');
    const bgCtx = bgCanvas.getContext('2d')!;
    const buildGlowGradients = () => {
      bgCanvas.width = canvas.width;
      bgCanvas.height = canvas.height;
      bgCtx.setTransform(1, 0, 0, 1, 0, 0);
      bgCtx.scale(dpr, dpr);
      bgCtx.clearRect(0, 0, width, height);

      for (const g of glows) {
        const r = width * (g.radiusFrac ?? 0.3);
        const grad = bgCtx.createRadialGradient(width * g.x, height * g.y, 0, width * g.x, height * g.y, r);
        grad.addColorStop(0, `hsla(${g.hue}, 80%, 55%, ${g.alpha ?? 0.1})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        bgCtx.fillStyle = grad;
        bgCtx.fillRect(0, 0, width, height);
      }
    };

    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      buildGlowGradients();
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const dust = Array.from({ length: density }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -Math.random() * 0.15 - 0.03,
      size: Math.random() * 1.6 + 0.4,
      alpha: Math.random() * 0.35 + 0.06,
      hue: hues[Math.floor(Math.random() * hues.length)],
    }));

    const bursts = splashes.map((s) => ({
      x: width * s.x,
      y: height * s.y,
      particles: Array.from({ length: s.count ?? 40 }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.8 + 0.3;
        return {
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: Math.random() * 120,
          maxLife: 100 + Math.random() * 80,
          size: Math.random() * 3 + 0.8,
          hue: s.hue,
          saturation: 80 + Math.random() * 20,
        };
      }),
    }));

    let raf = 0;
    let animating = false;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Glows are translucent, not opaque — still need the clearRect above,
      // but this is one blit instead of one fillRect per glow.
      ctx.drawImage(bgCanvas, 0, 0, width, height);

      for (const p of dust) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -5) {
          p.y = height + 5;
          p.x = Math.random() * width;
        }
        if (p.x < -5) p.x = width + 5;
        if (p.x > width + 5) p.x = -5;

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = `hsl(${p.hue}, 75%, 65%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      for (const burst of bursts) {
        for (const p of burst.particles) {
          p.life++;
          if (p.life > p.maxLife) {
            p.life = 0;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 1.8 + 0.3;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            p.size = Math.random() * 3 + 0.8;
          }
          const t = p.life / p.maxLife;
          const x = burst.x + p.vx * p.life * 1.4;
          const y = burst.y + p.vy * p.life * 1.4 + 0.5 * 0.02 * p.life * p.life;
          const alpha = (1 - t) * (t < 0.1 ? t * 10 : 1) * 0.85;

          const s = p.size * (1 - t * 0.4);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = `hsl(${p.hue}, ${p.saturation}%, 62%)`;
          ctx.fillRect(x - s / 2, y - s / 2, s, s);
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      if (!animating) return;
      draw();
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (animating) return;
      animating = true;
      loop();
    };
    const stop = () => {
      animating = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), {
      threshold: 0,
    });
    io.observe(container);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={containerRef} className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <canvas ref={canvasRef} />
    </div>
  );
}
