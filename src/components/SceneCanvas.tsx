import { useEffect, useRef } from 'react';

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

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Ambient floating dust particles
    const dust = Array.from({ length: 120 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -Math.random() * 0.2 - 0.05,
      size: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.4 + 0.05,
      hue: Math.random() < 0.5 ? 188 : 340,
    }));

    // Permanent splash zones (match the image — right side pink burst)
    const splashes: Splash[] = [
      createSplash(window.innerWidth * 0.78, window.innerHeight * 0.52, 340, 60),
      createSplash(window.innerWidth * 0.72, window.innerHeight * 0.58, 340, 40),
      createSplash(window.innerWidth * 0.15, window.innerHeight * 0.7, 188, 25),
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

    const w = () => window.innerWidth;
    const h = () => window.innerHeight;

    let raf = 0;
    const render = () => {
      ctx.clearRect(0, 0, w(), h());

      // Deep background gradient
      const bg = ctx.createRadialGradient(w() * 0.5, h() * 0.45, 0, w() * 0.5, h() * 0.45, w() * 0.7);
      bg.addColorStop(0, 'rgba(8, 10, 22, 0.98)');
      bg.addColorStop(0.5, 'rgba(4, 4, 9, 0.99)');
      bg.addColorStop(1, 'rgba(2, 2, 6, 1)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w(), h());

      // Subtle center glow
      const centerGlow = ctx.createRadialGradient(w() * 0.5, h() * 0.46, 0, w() * 0.5, h() * 0.46, w() * 0.38);
      centerGlow.addColorStop(0, 'rgba(40, 60, 80, 0.12)');
      centerGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, w(), h());

      // Right side pink atmospheric glow
      const pinkGlow = ctx.createRadialGradient(w() * 0.78, h() * 0.5, 0, w() * 0.78, h() * 0.5, w() * 0.28);
      pinkGlow.addColorStop(0, 'rgba(180, 30, 80, 0.09)');
      pinkGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = pinkGlow;
      ctx.fillRect(0, 0, w(), h());

      // Left side teal atmospheric glow
      const tealGlow = ctx.createRadialGradient(w() * 0.18, h() * 0.55, 0, w() * 0.18, h() * 0.55, w() * 0.22);
      tealGlow.addColorStop(0, 'rgba(20, 100, 90, 0.07)');
      tealGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = tealGlow;
      ctx.fillRect(0, 0, w(), h());

      // Dust particles
      for (const p of dust) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -5) { p.y = h() + 5; p.x = Math.random() * w(); }
        if (p.x < -5) { p.x = w() + 5; }
        if (p.x > w() + 5) { p.x = -5; }

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = `hsl(${p.hue}, 70%, 65%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Splash burst particles
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
          ctx.globalAlpha = alpha;
          ctx.fillStyle = `hsl(${p.hue}, ${p.saturation}%, 62%)`;
          ctx.fillRect(x - s / 2, y - s / 2, s, s);
        }
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
