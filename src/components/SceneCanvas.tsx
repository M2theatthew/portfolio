import { useEffect, useRef } from 'react';
import { getEffectsTier } from '@/lib/effectsTier';

interface Splash {
  x: number;
  y: number;
  particles: Array<{
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    hue: number;
    saturation: number;
  }>;
}

export default function SceneCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // documentElement.clientWidth/Height (not window.innerWidth/Height) is
    // what actually respects `scrollbar-gutter: stable` on <html> — inner*
    // reports the full window including the reserved gutter, so anything
    // sized off it ends up wider than the real content area. That mismatch
    // is what caused the horizontal shift once the page grew past one
    // viewport tall and the browser engaged the scrollbar.
    const vw = () => document.documentElement.clientWidth;
    const vh = () => document.documentElement.clientHeight;

    const resize = () => {
      canvas.width = vw() * dpr;
      canvas.height = vh() * dpr;
      canvas.style.width = vw() + 'px';
      canvas.style.height = vh() + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle counts scale with device tier — same visual language at
    // every tier, just less of it. This is the batched/pre-composited
    // version already (see comments below), so even "high" tier is far
    // cheaper than the original per-particle-draw-call version was.
    const tier = getEffectsTier();
    const dustCount = tier === 'low' ? 30 : tier === 'mid' ? 70 : 120;
    const splashCounts = tier === 'low' ? [20, 15, 10] : tier === 'mid' ? [40, 28, 18] : [60, 40, 25];

    // Ambient floating dust particles
    const dust = Array.from({ length: dustCount }, () => ({
      x: Math.random() * vw(),
      y: Math.random() * vh(),
      vx: (Math.random() - 0.5) * 0.15,
      vy: -Math.random() * 0.2 - 0.05,
      size: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.4 + 0.05,
      hue: Math.random() < 0.5 ? 188 : 340,
    }));

    // Permanent splash zones (match the image — right side pink burst)
    const splashes: Splash[] = [
      createSplash(vw() * 0.78, vh() * 0.52, 340, splashCounts[0]),
      createSplash(vw() * 0.72, vh() * 0.58, 340, splashCounts[1]),
      createSplash(vw() * 0.15, vh() * 0.7, 188, splashCounts[2]),
    ];

    function createSplash(x: number, y: number, hue: number, count: number): Splash {
      return {
        x,
        y,
        particles: Array.from({ length: count }, () => {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 1.8 + 0.3;
          return {
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: Math.random() * 120,
            maxLife: 100 + Math.random() * 80,
            size: Math.random() * 3 + 0.8,
            hue,
            saturation: 80 + Math.random() * 20,
          };
        }),
      };
    }

    const w = vw;
    const h = vh;

    // These four gradients never change frame-to-frame (same geometry,
    // same color stops), so we don't just cache the CanvasGradient objects —
    // we pre-composite them into an offscreen bitmap ONCE per resize.
    // Re-filling the full canvas with 4 overlapping gradients every single
    // frame (60x/sec) was the actual cost: Firefox's canvas 2D backend
    // rasterizes that overdraw on the CPU far more expensively than Chrome
    // does, and it showed up as ~52% of total frame time in profiling.
    // Now each frame just blits one pre-rendered bitmap instead.
    const bgCanvas = document.createElement('canvas');
    const bgCtx = bgCanvas.getContext('2d')!;

    const buildGradients = () => {
      bgCanvas.width = canvas.width;
      bgCanvas.height = canvas.height;
      bgCtx.setTransform(1, 0, 0, 1, 0, 0);
      bgCtx.scale(dpr, dpr);

      const bg = bgCtx.createRadialGradient(w() * 0.5, h() * 0.45, 0, w() * 0.5, h() * 0.45, w() * 0.7);
      bg.addColorStop(0, 'rgba(8, 10, 22, 0.98)');
      bg.addColorStop(0.5, 'rgba(4, 4, 9, 0.99)');
      bg.addColorStop(1, 'rgba(2, 2, 6, 1)');

      const centerGlow = bgCtx.createRadialGradient(w() * 0.5, h() * 0.46, 0, w() * 0.5, h() * 0.46, w() * 0.38);
      centerGlow.addColorStop(0, 'rgba(40, 60, 80, 0.12)');
      centerGlow.addColorStop(1, 'rgba(0,0,0,0)');

      const pinkGlow = bgCtx.createRadialGradient(w() * 0.78, h() * 0.5, 0, w() * 0.78, h() * 0.5, w() * 0.28);
      pinkGlow.addColorStop(0, 'rgba(180, 30, 80, 0.09)');
      pinkGlow.addColorStop(1, 'rgba(0,0,0,0)');

      const tealGlow = bgCtx.createRadialGradient(w() * 0.18, h() * 0.55, 0, w() * 0.18, h() * 0.55, w() * 0.22);
      tealGlow.addColorStop(0, 'rgba(20, 100, 90, 0.07)');
      tealGlow.addColorStop(1, 'rgba(0,0,0,0)');

      bgCtx.fillStyle = bg;
      bgCtx.fillRect(0, 0, w(), h());
      bgCtx.fillStyle = centerGlow;
      bgCtx.fillRect(0, 0, w(), h());
      bgCtx.fillStyle = pinkGlow;
      bgCtx.fillRect(0, 0, w(), h());
      bgCtx.fillStyle = tealGlow;
      bgCtx.fillRect(0, 0, w(), h());
    };
    buildGradients();
    window.addEventListener('resize', buildGradients);

    let raf = 0;
    const render = () => {
      // One blit replaces the old clearRect + 4x full-viewport fillRect —
      // it both clears and paints the background in a single cheap op,
      // since the background bitmap is fully opaque edge-to-edge.
      ctx.drawImage(bgCanvas, 0, 0, w(), h());

      // Dust particles — batched by (hue, alpha-bucket) into a few Path2D
      // fills instead of one beginPath/arc/fill *per particle*. That was
      // 120 individual context-level draw calls every frame; Firefox's
      // accelerated canvas ships each one to the GPU process as a
      // message, and that volume of tiny messages every 16ms was
      // flooding the event queue — which is what was showing up as a
      // burst of PutEvent markers and stalling cursor/input handling.
      // Path2D.arc() below builds geometry in JS only; the actual paint
      // command is just the one ctx.fill(path) per group.
      const dustGroups = new Map<string, Path2D>();
      const dustStyle = new Map<string, { hue: number; alpha: number }>();
      for (const p of dust) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -5) { p.y = h() + 5; p.x = Math.random() * w(); }
        if (p.x < -5) { p.x = w() + 5; }
        if (p.x > w() + 5) { p.x = -5; }

        const alphaBucket = Math.round(p.alpha * 10) / 10;
        const key = `${p.hue}_${alphaBucket}`;
        let path = dustGroups.get(key);
        if (!path) {
          path = new Path2D();
          dustGroups.set(key, path);
          dustStyle.set(key, { hue: p.hue, alpha: alphaBucket });
        }
        path.moveTo(p.x + p.size, p.y);
        path.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }
      for (const [key, path] of dustGroups) {
        const { hue, alpha } = dustStyle.get(key)!;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `hsl(${hue}, 70%, 65%)`;
        ctx.fill(path);
      }
      ctx.globalAlpha = 1;

      // Splash burst particles — same batching approach. Alpha changes
      // every frame here (it's tied to particle life/fade), so the
      // grouping is rebuilt each frame, but that's cheap JS Map work —
      // what matters is still collapsing ~125 individual fillRect calls
      // down to a handful of ctx.fill(path) calls.
      const splashGroups = new Map<string, Path2D>();
      const splashStyle = new Map<string, { hue: number; sat: number; alpha: number }>();
      for (const splash of splashes) {
        for (const p of splash.particles) {
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
          const x = splash.x + p.vx * p.life * 1.4;
          const y = splash.y + p.vy * p.life * 1.4 + 0.5 * 0.02 * p.life * p.life;
          const alpha = (1 - t) * (t < 0.1 ? t * 10 : 1) * 0.85;

          // Pixel-style square dots (matches the image aesthetic)
          const s = p.size * (1 - t * 0.4);

          const alphaBucket = Math.round(alpha * 10) / 10;
          const satBucket = Math.round(p.saturation / 5) * 5;
          const key = `${p.hue}_${satBucket}_${alphaBucket}`;
          let path = splashGroups.get(key);
          if (!path) {
            path = new Path2D();
            splashGroups.set(key, path);
            splashStyle.set(key, { hue: p.hue, sat: satBucket, alpha: alphaBucket });
          }
          path.rect(x - s / 2, y - s / 2, s, s);
        }
      }
      for (const [key, path] of splashGroups) {
        const { hue, sat, alpha } = splashStyle.get(key)!;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `hsl(${hue}, ${sat}%, 62%)`;
        ctx.fill(path);
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('resize', buildGradients);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
    />
  );
}
