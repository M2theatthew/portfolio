import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Phone, Mail, MapPin } from 'lucide-react';
import AmbientParticles from '@/components/AmbientParticles';

export default function Contact() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [time, setTime] = useState('');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(entry.target);
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const et = now.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setTime(et);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer
      id="contact"
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} relative pt-24 md:pt-32 pb-10 px-6 md:px-10 z-30 overflow-hidden`}
    >
      <AmbientParticles
        density={45}
        hues={[188, 340]}
        glows={[
          { x: 0.22, y: 0.35, hue: 188, alpha: 0.07, radiusFrac: 0.3 },
          { x: 0.78, y: 0.4, hue: 340, alpha: 0.07, radiusFrac: 0.3 },
        ]}
        splashes={[{ x: 0.78, y: 0.25, hue: 188, count: 22 }]}
      />
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-teal/80 mb-6">
            Get In Touch
          </div>
          <Link
            to="/get-in-touch"
            data-cursor="hover"
            className="group inline-flex flex-wrap items-center justify-center gap-2 md:gap-4"
          >
            <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light tracking-tight leading-none">
              <span
                className="bg-gradient-to-r from-teal to-coral bg-clip-text text-transparent"
              >
                Start a Project
              </span>
            </h2>
            <ArrowUpRight
              className="text-teal group-hover:rotate-45 transition-transform duration-500 w-8 h-8 md:w-12 md:h-12"
            />
          </Link>
          <p className="mt-6 text-white/40 font-light max-w-md mx-auto">
            No pressure to buy anything. Tell me what's going on and we'll
            figure out together whether it's worth doing anything at all.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[0.8fr_1.5fr_1fr_0.9fr_0.9fr] gap-8 mb-16 border-t border-white/5 pt-12">
          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/30 mb-3">Phone</div>
            <a
              href="tel:+14804921911"
              data-cursor="hover"
              className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-2"
            >
              <Phone size={14} />
              (480) 492-1911
            </a>
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/30 mb-3">Email</div>
            <a
              href="mailto:contact@upstatetechnologysolutions.com"
              data-cursor="hover"
              className="text-sm text-white/70 hover:text-white transition-colors flex items-start gap-2"
            >
              <Mail size={14} className="mt-0.5 flex-shrink-0" />
              <span className="break-normal">
                contact
                <wbr />
                @upstatetechnologysolutions.com
              </span>
            </a>
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/30 mb-3">Based In</div>
            <p className="text-sm text-white/70 flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 flex-shrink-0 text-teal" />
              Honea Path, South Carolina
            </p>
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/30 mb-3">Local Time</div>
            <p className="font-mono text-sm text-white/70 tabular-nums">
              {time} <span className="text-white/30">ET</span>
            </p>
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/30 mb-3">Links</div>
            <div className="flex flex-col gap-1.5">
              <Link
                to="/get-in-touch"
                data-cursor="hover"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Get in Touch
              </Link>
              <Link
                to="/services"
                data-cursor="hover"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Services
              </Link>
              <Link
                to="/reviews"
                data-cursor="hover"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Reviews
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
          <div className="flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" className="text-teal">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <span className="font-mono text-[11px] tracking-wider uppercase text-white/40">
              Upstate Technology Solutions
            </span>
          </div>
          <div className="font-mono text-[10px] tracking-wider uppercase text-white/25">
            © {new Date().getFullYear()} Upstate Technology Solutions · Honea Path, SC
          </div>
          <div className="font-mono text-[10px] tracking-wider uppercase text-white/25">
            Real Code. No Page Builders.
          </div>
        </div>
      </div>
    </footer>
  );
}
