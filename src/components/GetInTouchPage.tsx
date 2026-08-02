import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Phone, Mail, MapPin } from 'lucide-react';
import PageChrome from '@/components/PageChrome';

const CONTACT_EMAIL = 'contact@upstatetechnologysolutions.com';

export default function GetInTouchPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [hoveredSide, setHoveredSide] = useState<'left' | 'right' | null>(null);
  const tapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Touch devices don't get mouseenter/mouseleave, so a tap sets the side
  // directly and auto-reverts after a beat — same visual as a hover, just
  // time-boxed instead of leave-boxed.
  const handleTap = (side: 'left' | 'right') => {
    if (tapTimeout.current) clearTimeout(tapTimeout.current);
    setHoveredSide(side);
    tapTimeout.current = setTimeout(() => setHoveredSide(null), 900);
  };

  useEffect(() => {
    return () => {
      if (tapTimeout.current) clearTimeout(tapTimeout.current);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`New project inquiry from ${name || 'website visitor'}`);
    const body = encodeURIComponent(
      `${message}\n\n---\nName: ${name}\nEmail: ${email}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <PageChrome>
      {/* Route-style header, echoing the "waypoints" feel */}
      <div className="text-center mb-16 md:mb-24">
        <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-teal/80 mb-8">
          ✦ Contact ✦
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-10">
          <span
            onMouseEnter={() => setHoveredSide('left')}
            onMouseLeave={() => setHoveredSide(null)}
            onClick={() => handleTap('left')}
            data-cursor="hover"
            className="text-4xl sm:text-5xl md:text-7xl font-light tracking-tight text-white/30 cursor-pointer active:scale-95 transition-all duration-300"
          >
            A CONVERSATION
          </span>
          <ArrowRight
            className="w-8 h-8 md:w-12 md:h-12 flex-shrink-0"
            style={{
              transform: hoveredSide === 'left' ? 'rotate(180deg) scale(1.15)' : hoveredSide === 'right' ? 'rotate(0deg) scale(1.15)' : 'rotate(0deg) scale(1)',
              transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), color 0.5s ease',
              color: hoveredSide ? '#49c5b6' : 'rgba(255,255,255,0.2)',
            }}
          />
          <span
            onMouseEnter={() => setHoveredSide('right')}
            onMouseLeave={() => setHoveredSide(null)}
            onClick={() => handleTap('right')}
            data-cursor="hover"
            className="text-4xl sm:text-5xl md:text-7xl font-light tracking-tight bg-gradient-to-r from-teal to-coral bg-clip-text text-transparent cursor-pointer active:scale-95 transition-all duration-300"
          >
            YOUR IDEA
          </span>
        </div>
        <p className="text-white/40 font-light max-w-lg mx-auto">
          No pressure to buy anything. Tell me what's going on and we'll
          figure out together whether it's worth doing anything at all.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-10 md:gap-16">
        {/* Contact form */}
        <form onSubmit={handleSubmit} className="md:col-span-3 space-y-5">
          <div>
            <label className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/30 mb-2 block">
              Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-teal/50 transition-colors"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/30 mb-2 block">
              Email
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-teal/50 transition-colors"
              placeholder="you@business.com"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/30 mb-2 block">
              What's going on?
            </label>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-teal/50 transition-colors resize-none"
              placeholder="Tell me a bit about your business and what you're hoping to fix or build."
            />
          </div>
          <button
            type="submit"
            data-cursor="hover"
            className="group inline-flex items-center gap-2 rounded-full bg-teal/10 border border-teal/30 px-6 py-3 text-sm font-medium text-teal hover:bg-teal hover:text-black transition-all"
          >
            Send it over
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          {sent && (
            <p className="text-sm text-white/40 font-light">
              Opening your email app with everything filled in — just hit send.
            </p>
          )}
        </form>

        {/* Direct info */}
        <div className="md:col-span-2 space-y-8 md:pl-8 md:border-l md:border-white/5">
          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/30 mb-3">Phone</div>
            <a
              href="tel:+14804921911"
              data-cursor="hover"
              className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
            >
              <Phone size={14} />
              (480) 492-1911
            </a>
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/30 mb-3">Email</div>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              data-cursor="hover"
              className="text-white/70 hover:text-white transition-colors flex items-start gap-2"
            >
              <Mail size={14} className="mt-0.5 flex-shrink-0" />
              <span className="break-normal">
                {CONTACT_EMAIL.split('@')[0]}
                <wbr />
                {`@${CONTACT_EMAIL.split('@')[1]}`}
              </span>
            </a>
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/30 mb-3">Based In</div>
            <p className="text-white/70 flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 flex-shrink-0 text-teal" />
              Honea Path, South Carolina, working with clients locally and remotely
            </p>
          </div>
        </div>
      </div>
    </PageChrome>
  );
}
