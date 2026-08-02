import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Work', href: '/#work' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
];

export default function PillboxNav() {
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  let lastY = 0;

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY + 5 && y > 100) setHidden(true);
      else if (y < lastY - 5 || y < 100) setHidden(false);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu if the viewport grows past the mobile
  // breakpoint (e.g. rotating a tablet) so it can't get stuck open.
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 640) setMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <>
      <nav
        className="pillbox fixed top-4 sm:top-5 left-1/2 z-50 flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1.5 fade-up"
        style={{
          transform: `translateX(-50%) translateY(${hidden ? '-120%' : '0'})`,
          animationDelay: '0.3s',
          opacity: 0,
        }}
      >
        <Link to="/" data-cursor="hover" className="flex items-center gap-2 px-2.5 sm:px-3 py-1">
          <svg width="18" height="18" viewBox="0 0 24 24" className="text-teal flex-shrink-0">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.5" />
          </svg>
          <span className="hidden sm:inline text-sm font-medium tracking-tight text-white/80 whitespace-nowrap">
            Upstate Technology
          </span>
        </Link>

        {/* Desktop links — hidden below sm, where they'd overflow the pill */}
        <div className="hidden sm:flex items-center gap-1">
          <div className="h-4 w-px bg-white/10" />
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              data-cursor="hover"
              className="px-4 py-1.5 text-sm font-medium text-white/60 hover:text-white transition-colors whitespace-nowrap"
            >
              {label}
            </a>
          ))}
          <Link
            to="/get-in-touch"
            data-cursor="hover"
            className="ml-1 rounded-full bg-teal/10 border border-teal/30 px-4 py-1.5 text-sm font-medium text-teal hover:bg-teal hover:text-black transition-all whitespace-nowrap"
          >
            Start a Project
          </Link>
        </div>

        {/* Mobile hamburger toggle */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          data-cursor="hover"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="sm:hidden flex items-center justify-center w-10 h-10 rounded-full text-white/70 hover:text-white active:bg-white/5 transition-colors"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile dropdown panel */}
      <div
        className="pillbox-menu fixed top-[4rem] left-1/2 z-50 sm:hidden flex flex-col gap-1 p-2 w-[calc(100vw-2rem)] max-w-xs"
        style={{
          transform: `translateX(-50%) translateY(${menuOpen ? '0' : '-12px'})`,
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.3s',
        }}
      >
        {navLinks.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            data-cursor="hover"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-3 rounded-xl text-base font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
          >
            {label}
          </a>
        ))}
        <Link
          to="/get-in-touch"
          data-cursor="hover"
          onClick={() => setMenuOpen(false)}
          className="mt-1 rounded-xl bg-teal/10 border border-teal/30 px-4 py-3 text-base font-medium text-teal text-center hover:bg-teal hover:text-black transition-all"
        >
          Start a Project
        </Link>
      </div>
    </>
  );
}
