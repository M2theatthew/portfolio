import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import CustomCursor from '@/components/CustomCursor';
import HomePage from '@/components/HomePage';
import GetInTouchPage from '@/components/GetInTouchPage';
import ServicesPage from '@/components/ServicesPage';
import ReviewsPage from '@/components/ReviewsPage';

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const { pathname } = useLocation();

  useEffect(() => {
    let p = 0;
    const id = setInterval(() => {
      p += Math.random() * 10 + 3;
      if (p >= 100) {
        p = 100;
        clearInterval(id);
        setTimeout(() => setLoaded(true), 400);
      }
      setProgress(p);
    }, 70);
    return () => clearInterval(id);
  }, []);

  // Scroll to top on route change (not for the homepage, which handles
  // its own hash-based scrolling).
  useEffect(() => {
    if (pathname === '/') return;
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <CustomCursor />
      <div className="grain" />
      <div className="scanlines" />
      <div className="glitch-bar" />

      {/* Loading overlay */}
      {!loaded && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[#040409]"
          style={{
            opacity: progress >= 100 ? 0 : 1,
            transition: 'opacity 0.5s ease',
            pointerEvents: progress >= 100 ? 'none' : 'auto',
          }}
        >
          <div className="text-center">
            <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-white/30 mb-4">
              Loading
            </div>
            <div className="w-48 h-px bg-white/10 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal to-coral"
                style={{ width: `${progress}%`, transition: 'width 0.2s' }}
              />
            </div>
            <div className="font-mono text-[10px] text-white/20 mt-2 tabular-nums">
              {String(Math.floor(progress)).padStart(3, '0')}
            </div>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/get-in-touch" element={<GetInTouchPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
      </Routes>
    </>
  );
}
