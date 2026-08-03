import { lazy, Suspense, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SceneCanvas from '@/components/SceneCanvas';
import PillboxNav from '@/components/PillboxNav';
import FloatingCards from '@/components/FloatingCards';
import GlitchTitle from '@/components/GlitchTitle';
import ProjectList from '@/components/ProjectList';
import Work from '@/components/Work';
import About from '@/components/About';
import Contact from '@/components/Contact';

// Three.js + the GLTF/Draco loaders are the single heaviest chunk in the
// app. Lazy-loading this means the initial page bundle (and everything
// above/around the hero) can paint immediately, and the 3D globe's code
// only downloads once this component actually mounts.
const Centerpiece3D = lazy(() => import('@/components/Centerpiece3D'));

export default function HomePage() {
  const { hash } = useLocation();

  // When we arrive here carrying a hash (e.g. coming back from
  // /get-in-touch via a "Work" nav link, or clicking a project link/card
  // that points at #work-<id>) jump to that section once the page has
  // mounted. Retries briefly because a specific project target may need
  // Work's own filter-reset effect to run and re-render first.
  useEffect(() => {
    if (!hash) return;
    let attempts = 0;
    let raf = 0;
    const tryScroll = () => {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else if (attempts++ < 10) {
        raf = requestAnimationFrame(tryScroll);
      }
    };
    raf = requestAnimationFrame(tryScroll);
    return () => cancelAnimationFrame(raf);
  }, [hash]);

  return (
    <>
      <PillboxNav />

      {/* Full-screen immersive scene */}
      <div className="relative w-full h-screen overflow-hidden">
        <SceneCanvas />
        <Suspense
          fallback={
            <div className="absolute inset-0 z-[5] flex items-center justify-center">
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/20">
                Loading model
              </div>
            </div>
          }
        >
          <Centerpiece3D />
        </Suspense>
        <FloatingCards />

        {/* Center title */}
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <GlitchTitle />
        </div>

        {/* Left project list */}
        <ProjectList />

        {/* Bottom bar */}
        <div
          className="absolute bottom-6 left-0 right-0 z-20 flex items-end justify-between px-6 md:px-10 fade-up"
          style={{ animationDelay: '1.4s', opacity: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-coral animate-pulse" />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/30">
              9 Projects · Scroll to explore
            </span>
          </div>
          <div className="flex items-center gap-6 font-mono text-[10px] tracking-[0.2em] uppercase text-white/25">
            <span>Honea Path, SC</span>
            <span className="hidden md:inline">·</span>
            <span className="hidden md:inline">ET</span>
          </div>
        </div>

        {/* Right side metadata */}
        <div
          className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col items-end gap-2 fade-up"
          style={{ animationDelay: '1.3s', opacity: 0 }}
        >
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/20">
            / Index
          </div>
          <div className="font-mono text-[10px] tracking-wider text-white/15 tabular-nums">
            01-09
          </div>
        </div>
      </div>

      {/* Scrollable content sections */}
      <div className="relative z-30 bg-[#040409]">
        <Work />
        <About />
        <Contact />
      </div>
    </>
  );
}
