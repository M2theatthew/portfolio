import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import AmbientParticles from '@/components/AmbientParticles';

interface Project {
  id: string;
  title: string;
  category: string;
  year: string;
  tags: string[];
  link: string;
  image?: string;
  span: 'wide' | 'tall' | 'normal';
  accent: string;
}

const projects: Project[] = [
  {
    id: '01',
    title: 'Empower Honea Path',
    category: 'Community organization site with About, Get Involved, Events, and Contact pages.',
    year: '',
    tags: ['Nonprofit', 'Multi-page'],
    link: '/work/empower-honea-path/index.html',
    image: '/images/work/empower.jpg',
    span: 'wide',
    accent: '#49c5b6',
  },
  {
    id: '02',
    title: 'Honea Path First Baptist Church',
    category: 'Full church site with leadership bios and a Celebrate Recovery ministry page, custom video hero and asset pipeline.',
    year: '',
    tags: ['Church', 'Multi-page'],
    link: '/work/honea-path-church/index.html',
    image: '/images/work/church.jpg',
    span: 'wide',
    accent: '#ff3d6e',
  },
  {
    id: '03',
    title: "Lou & Perry's",
    category: "Restaurant site in Honea Path, SC.",
    year: '',
    tags: ['Restaurant'],
    link: '/work/lou-perrys/index.html',
    image: '/images/work/lou-perrys.jpg',
    span: 'normal',
    accent: '#49c5b6',
  },
  {
    id: '04',
    title: 'The Melt Pizzeria',
    category: '"Local toppings. Better pizza." A pizzeria site with menu and brand-forward design.',
    year: '',
    tags: ['Restaurant'],
    link: '/work/melt-pizzeria/index.html',
    image: '/images/work/melt.jpg',
    span: 'normal',
    accent: '#ff3d6e',
  },
  {
    id: '05',
    title: 'The Green Dragon Vape Lounge',
    category: 'Vape lounge site in Honea Path, SC.',
    year: '',
    tags: ['Retail'],
    link: '/work/green-dragon/index.html',
    image: '/images/work/green-dragon.jpg',
    span: 'normal',
    accent: '#49c5b6',
  },
  {
    id: '06',
    title: 'Eoin Reardon',
    category: 'Traditional Irish woodwork — a craftsman site with a browsable shop page.',
    year: '',
    tags: ['Craft', 'Shop'],
    link: '/work/eoin-reardon/index.html',
    image: '/images/work/eoin-reardon.jpg',
    span: 'normal',
    accent: '#ff3d6e',
  },
  {
    id: '07',
    title: 'Chadwicks: Diner Concepts',
    category: 'Three layout concepts explored side-by-side: Classic Diner, and two additional directions.',
    year: '',
    tags: ['Restaurant', '3 Concepts'],
    link: '/work/chadwicks/layout-a.html',
    image: '/images/work/chadwicks-a.jpg',
    span: 'tall',
    accent: '#49c5b6',
  },
  {
    id: '08',
    title: 'WiFi Monitor',
    category: 'Fully local network dashboard for Windows — live device list, Wi-Fi link status, and bandwidth graph, plus a desktop widget.',
    year: '',
    tags: ['Tool', 'Desktop + Web'],
    link: '',
    span: 'normal',
    accent: '#49c5b6',
    image: '/images/work/wifi-monitor.jpg',
  },
];

function ProjectCard({ project, index }: { project: Project; index: number }) {
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
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const spanClass =
    project.span === 'wide'
      ? 'md:col-span-2 aspect-[16/9]'
      : project.span === 'tall'
        ? 'md:row-span-2 aspect-[3/4]'
        : 'aspect-[4/3]';

  const hasLink = Boolean(project.link);
  const Wrapper = hasLink ? 'a' : 'div';

  return (
    <div
      ref={ref}
      id={`work-${project.id}`}
      className={`reveal scroll-mt-24 md:scroll-mt-28 ${visible ? 'is-visible' : ''} ${spanClass}`}
      style={{ transitionDelay: `${(index % 2) * 0.12}s` }}
    >
      <Wrapper
        {...(hasLink ? { href: project.link, target: '_blank', rel: 'noopener noreferrer' } : {})}
        data-cursor={hasLink ? 'hover' : undefined}
        className="group relative block h-full w-full overflow-hidden rounded-2xl bg-ink-700"
      >
        <div
          className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
          style={project.image ? undefined : { background: `linear-gradient(150deg, ${project.accent}2e, #0a0a12 70%)` }}
        >
          {project.image ? (
            <img
              src={project.image}
              alt={project.title}
              loading="lazy"
              className="h-full w-full object-cover"
              style={{ filter: 'saturate(0.9) contrast(1.05) brightness(0.82)' }}
            />
          ) : (
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: '22px 22px',
              }}
            />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `radial-gradient(circle at 50% 100%, ${project.accent}22, transparent 70%)` }}
        />
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[9px] tracking-wider uppercase text-white/60 px-2 py-1 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          {hasLink && (
            <div className="flex items-center justify-center w-9 h-9 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 group-hover:rotate-45 transition-all duration-500">
              <ArrowUpRight size={16} className="text-white" />
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-xl md:text-2xl font-medium text-white leading-tight">
            {project.title}
          </h3>
          <p className="text-sm text-white/50 font-light mt-1 leading-relaxed max-w-md">
            {project.category}
          </p>
          <div className="mt-3 h-px w-0 group-hover:w-full bg-gradient-to-r from-transparent via-teal to-transparent transition-all duration-700" />
        </div>
      </Wrapper>
    </div>
  );
}

export default function Work() {
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Restaurant', 'Church', 'Nonprofit', 'Retail', 'Craft', 'Tool'];
  const { hash } = useLocation();

  // If a link (the sidebar list, a floating card, an external share) points
  // at a specific project via #work-<id>, make sure the active category
  // filter isn't hiding that card before we try to scroll to it.
  useEffect(() => {
    if (!hash.startsWith('#work-')) return;
    const id = hash.slice('#work-'.length);
    const target = projects.find((p) => p.id === id);
    if (!target) return;
    setFilter((current) => (current === 'All' || target.tags.includes(current) ? current : 'All'));
  }, [hash]);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true);
          obs.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const filtered = filter === 'All' ? projects : projects.filter((p) => p.tags.includes(filter));

  return (
    <section id="work" className="relative py-24 md:py-32 px-6 md:px-10 z-30">
      <AmbientParticles
        density={40}
        hues={[188, 340]}
        glows={[{ x: 0.9, y: 0.15, hue: 340, alpha: 0.06, radiusFrac: 0.32 }]}
        splashes={[{ x: 0.06, y: 0.85, hue: 188, count: 22 }]}
      />
      <div
        ref={headerRef}
        className={`reveal ${headerVisible ? 'is-visible' : ''} relative z-10 max-w-7xl mx-auto mb-12 md:mb-16`}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-teal" />
              <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-teal">
                Selected Work
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-light tracking-tight leading-[1.05]">
              Sites &amp; projects <br />
              <span className="text-white/40">built so far.</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                data-cursor="hover"
                className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider uppercase transition-all duration-300 border ${
                  filter === f
                    ? 'bg-teal text-black border-teal'
                    : 'text-white/50 border-white/10 hover:border-white/30 hover:text-white/80'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 auto-rows-auto">
          {filtered.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
