import { useEffect, useRef, useState } from 'react';

export default function GlitchTitle() {
  const [text, setText] = useState('MATTHEW HUNT');
  const titleRef = useRef<HTMLDivElement>(null);
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const words = ['MATTHEW HUNT', 'UPSTATE TECH', 'REAL CODE', 'HONEA PATH'];
    let idx = 0;

    const scramble = (target: string) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&@!?*+/=<>{}[]';
      const original = target.split('');
      const len = original.length;
      let frame = 0;
      const totalFrames = 24;

      setGlitching(true);

      const step = () => {
        frame++;
        const progress = frame / totalFrames;
        const result = original
          .map((c, i) => {
            if (c === ' ') return ' ';
            if (i < progress * len) return c;
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');
        setText(result);

        if (frame < totalFrames) {
          setTimeout(step, 28);
        } else {
          setText(target);
          setGlitching(false);
        }
      };
      step();
    };

    const cycle = () => {
      idx = (idx + 1) % words.length;
      scramble(words[idx]);
    };

    const initial = setTimeout(() => scramble(words[0]), 600);
    const interval = setInterval(cycle, 6000);

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      ref={titleRef}
      className="relative flex flex-col items-center text-center select-none px-4"
      style={{ marginTop: '-2vh' }}
    >
      {/* Metadata line above */}
      <div
        className="font-mono text-[9px] md:text-[11px] tracking-[0.2em] md:tracking-[0.4em] uppercase text-white/30 mb-4 fade-up px-4 text-center"
        style={{ animationDelay: '0.2s', opacity: 0 }}
      >
        [ UPSTATE TECHNOLOGY SOLUTIONS · HONEA PATH, SC ]
      </div>

      {/* Main glitch title */}
      <h1
        className="glitch font-light leading-[0.9] tracking-tight text-white"
        data-text={text}
        style={{
          fontSize: 'clamp(2.5rem, 12vw, 11rem)',
          textShadow: glitching
            ? '0 0 20px rgba(73,197,182,0.3), 0 0 40px rgba(255,61,110,0.2)'
            : 'none',
          transition: 'text-shadow 0.3s',
        }}
      >
        {text}
      </h1>

      {/* Subtitle */}
      <div
        className="mt-5 flex items-center gap-4 fade-up"
        style={{ animationDelay: '0.6s', opacity: 0 }}
      >
        <div className="h-px w-8 bg-teal/50" />
        <span className="font-mono text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-teal/70">
          Real Code, No Page Builders
        </span>
        <div className="h-px w-8 bg-teal/50" />
      </div>

      {/* Tagline */}
      <p
        className="mt-4 max-w-xl text-sm text-white/40 font-light leading-relaxed fade-up px-6 py-3 rounded-3xl text-center"
        style={{
          animationDelay: '0.9s',
          opacity: 0,
          backgroundColor: 'rgba(4,4,9,0.35)',
          backdropFilter: 'blur(6px)',
        }}
      >
        Custom websites, business software, and technology solutions
        built around how your business actually works. Hand-coded when
        it matters, designed to solve real problems; not forced into a
        template.
      </p>
    </div>
  );
}
