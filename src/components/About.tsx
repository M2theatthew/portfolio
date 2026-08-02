import { useEffect, useRef, useState } from 'react';
import { services } from '@/data/services';
import AmbientParticles from '@/components/AmbientParticles';

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

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

  const stats = [
    { value: '60+', label: 'Projects' },
    { value: '100%', label: 'Custom Code' },
    { value: 'Endless', label: 'Industries' },
    { value: '1', label: 'Developer' },
  ];

  const profileBuilds = [
    'custom websites',
    'web applications',
    'business automation',
    'internal tools',
    'system integrations',
  ];
  const profileTech = [
    'React',
    'Next.js',
    'JavaScript',
    'HTML',
    'CSS',
    'Node.js',
    'Python',
    'SQL',
    'Tailwind CSS',
  ];
  const profileFocus = [
    'performance',
    'clean architecture',
    'accessibility',
    'practical solutions',
  ];

  return (
    <section id="about" ref={ref} className="relative py-24 md:py-32 px-6 md:px-10 z-30">
      <AmbientParticles
        density={50}
        hues={[188, 340]}
        glows={[
          { x: 0.12, y: 0.25, hue: 188, alpha: 0.07, radiusFrac: 0.35 },
          { x: 0.88, y: 0.75, hue: 340, alpha: 0.06, radiusFrac: 0.3 },
        ]}
        splashes={[{ x: 0.9, y: 0.15, hue: 340, count: 22 }]}
      />
      <div className={`reveal ${visible ? 'is-visible' : ''} relative z-10 max-w-7xl mx-auto`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-px bg-teal" />
          <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-teal">About</span>
        </div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-20 mb-20">
          <h2 className="text-4xl md:text-6xl font-light tracking-tight leading-[1.05]">
            Not every problem <br />
            <span className="text-white/40">is a technology problem.</span>
          </h2>
          <div className="space-y-4 text-white/50 font-light leading-relaxed text-lg">
            <p>
              I'm Matthew Hunt, founder of Upstate Technology Solutions. I
              design and build websites and custom software for businesses,
              nonprofits, churches, and everything in between, all hand-coded,
              not assembled from a page builder. Based in Honea Path, Upstate
              South Carolina, working with clients locally and remotely.
            </p>
            <p>
              Plenty of local businesses get by just fine without a new
              website or a new tool. My job isn't to sell you technology;
              it's to give you an honest read on whether it would actually
              help, and to build only what's worth building.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-20 border-y border-white/5 py-12">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl md:text-5xl font-light text-white tabular-nums">
                {s.value}
              </div>
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/30 mt-2">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* profile.js snippet */}
        <div className="mb-20 rounded-2xl border border-white/5 overflow-hidden bg-black/30">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            </div>
            <span className="font-mono text-[10px] tracking-wider text-white/30 ml-2">profile.js</span>
          </div>
          <pre className="p-5 md:p-6 overflow-x-auto text-[13px] leading-relaxed font-mono">
            <code className="text-white/60">
              <span className="text-teal">const</span> profile = {'{'}
              {'\n'}  name: <span className="text-coral">'Matthew Hunt'</span>,
              {'\n'}  role: <span className="text-coral">'Software Developer'</span>,
              {'\n'}  based: <span className="text-coral">'Upstate, SC'</span>,
              {'\n'}  builds: [
              {profileBuilds.map((b, i) => (
                <span key={b}>
                  {'\n'}    <span className="text-coral">'{b}'</span>
                  {i < profileBuilds.length - 1 ? ',' : ''}
                </span>
              ))}
              {'\n'}  ],
              {'\n'}  tech: [
              {profileTech.map((t, i) => (
                <span key={t}>
                  {'\n'}    <span className="text-coral">'{t}'</span>
                  {i < profileTech.length - 1 ? ',' : ''}
                </span>
              ))}
              {'\n'}  ],
              {'\n'}  focus: [
              {profileFocus.map((f, i) => (
                <span key={f}>
                  {'\n'}    <span className="text-coral">'{f}'</span>
                  {i < profileFocus.length - 1 ? ',' : ''}
                </span>
              ))}
              {'\n'}  ]
              {'\n'}{'}'}
              {'\n'}
              {'\n'}<span className="text-teal">export default</span> profile
            </code>
          </pre>
        </div>

        {/* Services */}
        <div className="flex items-center justify-between mb-6">
          <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-white/30">
            What I Do
          </span>
          <a
            href="/services"
            data-cursor="hover"
            className="font-mono text-[11px] tracking-[0.2em] uppercase text-teal hover:text-teal-light transition-colors"
          >
            View all services →
          </a>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {services.map((s, i) => (
            <div
              key={s.title}
              className="group relative p-6 rounded-2xl border border-white/5 hover:border-teal/30 transition-colors duration-500"
              data-cursor="hover"
            >
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-teal/50 mb-3">
                0{i + 1}
              </div>
              <h3 className="text-xl font-medium text-white mb-2">{s.title}</h3>
              <p className="text-sm text-white/40 font-light leading-relaxed">{s.desc}</p>
              <div className="absolute bottom-0 left-6 right-6 h-px w-0 group-hover:w-[calc(100%-3rem)] bg-teal/30 transition-all duration-700" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
