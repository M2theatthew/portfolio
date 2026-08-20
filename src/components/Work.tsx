import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ArrowUpRight,
  Braces,
  Coffee,
  Layers,
  PenTool,
  Terminal,
  X,
  type LucideIcon,
} from 'lucide-react';
import AmbientParticles from '@/components/AmbientParticles';
import { useReveal, reveal } from '@/lib/useReveal';

interface StackItem {
  title: string;
  description: string;
  tags: string[];
  link?: string;
}

interface Project {
  id: string;
  title: string;
  category: string;
  year: string;
  tags: string[];
  link: string;
  image?: string;
  span: 'wide' | 'tall' | 'normal' | 'half';
  accent: string;
  // Directory tiles (the by-language row) use an icon instead of a photo.
  icon?: LucideIcon;
  // When present, this card renders as a "stacked" tile representing several
  // smaller projects. Clicking it opens a panel listing each one instead of
  // following a link.
  stackItems?: StackItem[];
}

// The headline pieces — real apps and client sites, each with their own
// live link. This is the "greatest hits" grid. Everything more incremental
// (coursework, smaller client sites) lives one level down in the language
// directories below instead of competing for space up here.
const showcased: Project[] = [
  {
    id: '14',
    title: 'Weatherly',
    category: 'Premium weather app with live Open-Meteo data, multi-location tracking, and a radar view. Canvas-composited precipitation effects layer over time-of-day and condition-matched atmosphere video for every forecast.',
    year: '',
    tags: ['Tool', 'Weather App'],
    link: '/work/weatherly/index.html',
    span: 'wide',
    accent: '#4f8fff',
    image: '/images/work/weatherly.jpg',
  },
  {
    id: '09',
    title: 'Lightweight Local CRM',
    category: 'Full business-suite app: customers, inventory, checkout, invoicing, payments, and reporting, running entirely on a local network.',
    year: '',
    tags: ['Tool', 'Business Suite'],
    link: '/work/local-crm/index.html',
    span: 'half',
    accent: '#ff3d6e',
    image: '/images/work/local-crm.jpg',
  },
  {
    id: '07',
    title: 'LiveBoard',
    category: 'Real-time multiplayer 3D whiteboard: physics-driven markers and eraser, sticky-note kanban board, live drawing sync, and chat, built with React Three Fiber and Rapier physics.',
    year: '',
    tags: ['Tool', '3D App', 'Multiplayer'],
    link: '/work/liveboard/index.html',
    span: 'half',
    accent: '#7c5cff',
    image: '/images/work/liveboard.jpg',
  },
  {
    id: '08',
    title: 'WiFi Monitor',
    category: 'Fully local network dashboard for Windows: live device list, Wi-Fi link status, and bandwidth graph, plus a desktop widget.',
    year: '',
    tags: ['Tool', 'Desktop + Web'],
    link: '',
    span: 'half',
    accent: '#49c5b6',
    image: '/images/work/wifi-monitor.jpg',
  },
  {
    id: '02',
    title: 'Honea Path First Baptist Church',
    category: 'Full church site with leadership bios and a Celebrate Recovery ministry page, custom video hero and asset pipeline.',
    year: '',
    tags: ['Church', 'Multi-page'],
    link: '/work/honea-path-church/index.html',
    image: '/images/work/church.jpg',
    span: 'half',
    accent: '#ff3d6e',
  },
  {
    id: '01',
    title: 'Empower Honea Path',
    category: 'Community organization site with About, Get Involved, Events, and Contact pages.',
    year: '',
    tags: ['Nonprofit', 'Multi-page'],
    link: '/work/empower-honea-path/index.html',
    image: '/images/work/empower.jpg',
    span: 'half',
    accent: '#49c5b6',
  },
];

// The by-language directory row. Each tile opens a panel listing everything
// filed under it — coursework, and (for Web Design) the smaller client
// sites that aren't prominent enough to earn their own showcase slot above.
const categories: Project[] = [
  {
    id: '13',
    title: 'C / C# Projects',
    category: 'A few systems and language-fundamentals projects, in progress.',
    year: '',
    tags: ['Student', 'C/C#'],
    link: '',
    span: 'normal',
    accent: '#ffb454',
    icon: Braces,
    stackItems: [
      {
        title: 'Coming soon',
        description: "These are still in progress — check back once they're finished.",
        tags: ['Planned'],
      },
    ],
  },
  {
    id: '12',
    title: 'Python Projects',
    category: 'Three small apps from an intro Python course.',
    year: '',
    tags: ['Student', 'Python'],
    link: '',
    span: 'normal',
    accent: '#ff3d6e',
    icon: Terminal,
    stackItems: [
      {
        title: 'Movie Database Browser',
        description: 'A Tkinter desktop app for browsing and querying a small SQLite movie database.',
        tags: ['Tkinter', 'SQLite'],
        link: '/work/python-movie-browser/index.html',
      },
      {
        title: 'Future Value Calculator',
        description: 'A Flask web app that calculates the future value of an investment over time.',
        tags: ['Flask', 'Web'],
        link: '/work/python-future-value-calculator/index.html',
      },
      {
        title: 'Pig Dice Game',
        description: 'A console game implementing the classic push-your-luck "Pig" dice rules.',
        tags: ['Python', 'Game'],
        link: '/work/python-pig-dice/index.html',
      },
    ],
  },
  {
    id: '10',
    title: 'Java Projects',
    category: 'CPT-237: three semester projects, from a desktop game to a command-line utility.',
    year: '',
    tags: ['Student', 'Java'],
    link: '',
    span: 'normal',
    accent: '#49c5b6',
    icon: Coffee,
    stackItems: [
      {
        title: 'Memory Match',
        description: 'A tile-matching memory game built with JavaFX, with custom card-back art and a few selectable themes.',
        tags: ['JavaFX', 'Game'],
        link: '/work/java-memory-match/index.html',
      },
      {
        title: 'Sudoku Checker',
        description: 'A JavaFX GUI tool that validates whether a completed Sudoku board follows the rules.',
        tags: ['JavaFX', 'GUI'],
        link: '/work/java-sudoku-checker/index.html',
      },
      {
        title: 'Directory Checksum Tool',
        description: 'A command-line utility that scans a directory and generates checksums for every file inside it.',
        tags: ['Java', 'CLI'],
        link: '/work/java-checksum-tool/index.html',
      },
    ],
  },
  {
    id: '11',
    title: 'Web Design Projects',
    category: 'Hand-coded client sites and personal project pages.',
    year: '',
    tags: ['HTML/CSS'],
    link: '',
    span: 'normal',
    accent: '#49c5b6',
    icon: PenTool,
    stackItems: [
      {
        title: "Lou & Perry's",
        description: 'Restaurant site in Honea Path, SC.',
        tags: ['Restaurant'],
        link: '/work/lou-perrys/index.html',
      },
      {
        title: 'The Melt Pizzeria',
        description: '"Local toppings. Better pizza." A pizzeria site with menu and brand-forward design.',
        tags: ['Restaurant'],
        link: '/work/melt-pizzeria/index.html',
      },
      {
        title: 'The Green Dragon Vape Lounge',
        description: 'Vape lounge site in Honea Path, SC.',
        tags: ['Retail'],
        link: '/work/green-dragon/index.html',
      },
      {
        title: 'Eoin Reardon',
        description: 'Traditional Irish woodwork, a craftsman site with a browsable shop page.',
        tags: ['Craft', 'Shop'],
        link: '/work/eoin-reardon/index.html',
      },
      {
        title: 'Design Concepts',
        description: 'A personal profile page built from scratch, custom stylesheet, portrait photography, and embedded video, no frameworks.',
        tags: ['HTML', 'CSS'],
      },
    ],
  },
];

// All items that can populate the stack/detail modal, keyed by id — the
// showcase cards and the directory tiles both open the same panel.
const allItems = [...showcased, ...categories];

function ProjectCard({
  project,
  index,
  onOpenStack,
}: {
  project: Project;
  index: number;
  onOpenStack: (id: string) => void;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>(0.12, '0px 0px -8% 0px');
  const isStack = Boolean(project.stackItems && project.stackItems.length);

  const spanClass =
    project.span === 'wide'
      ? 'md:col-span-2 aspect-[16/9]'
      : project.span === 'tall'
        ? 'md:row-span-2 aspect-[3/4]'
        : project.span === 'half'
          ? 'aspect-[16/9] md:aspect-auto md:min-h-[280px]'
          : 'aspect-[4/3] md:aspect-auto md:min-h-[260px]';

  const hasLink = Boolean(project.link);
  const Wrapper = hasLink ? 'a' : 'div';

  return (
    <div
      ref={ref}
      id={`work-${project.id}`}
      className={`${reveal(visible)} scroll-mt-24 md:scroll-mt-28 ${spanClass} ${isStack ? 'relative' : ''}`}
      style={{ transitionDelay: `${(index % 2) * 0.12}s` }}
    >
      {isStack && (
        <>
          <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-2xl bg-ink-700 border border-white/5" aria-hidden="true" />
          <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-2xl bg-ink-700 border border-white/5" aria-hidden="true" />
        </>
      )}
      <Wrapper
        {...(hasLink ? { href: project.link, target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...(isStack ? { onClick: () => onOpenStack(project.id) } : {})}
        data-cursor={hasLink || isStack ? 'hover' : undefined}
        className={`group relative block h-full w-full overflow-hidden rounded-2xl bg-ink-700 ${isStack ? 'cursor-pointer' : ''}`}
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
                className="font-mono text-tag uppercase text-white/60 px-2 py-1 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm"
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
          {isStack && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm text-white/80">
              <Layers size={13} />
              <span className="font-mono text-[10px] tracking-wider">
                {project.stackItems!.length}
              </span>
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
          {isStack && (
            <p className="font-mono text-[10px] tracking-wider uppercase text-teal/80 mt-2">
              Tap to view {project.stackItems!.length} {project.stackItems!.length === 1 ? 'project' : 'projects'}
            </p>
          )}
          <div className="mt-3 h-px w-0 group-hover:w-full bg-gradient-to-r from-transparent via-teal to-transparent transition-all duration-700" />
        </div>
      </Wrapper>
    </div>
  );
}

// The compact by-language directory tile: icon, title, live project count.
// Every one of these opens the same stack modal as the showcase cards.
function CategoryCard({
  category,
  index,
  onOpenStack,
}: {
  category: Project;
  index: number;
  onOpenStack: (id: string) => void;
}) {
  const { ref, visible } = useReveal<HTMLButtonElement>(0.12, '0px 0px -8% 0px');
  const Icon = category.icon;
  const count = category.stackItems?.length ?? 0;

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onOpenStack(category.id)}
      data-cursor="hover"
      style={{ transitionDelay: `${(index % 4) * 0.08}s` }}
      className={`${reveal(visible)} group relative flex flex-col items-start gap-5 overflow-hidden rounded-2xl border border-white/10 bg-ink-700 p-6 text-left transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:border-white/20`}
    >
      <div
        className="absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `linear-gradient(150deg, ${category.accent}20, #0a0a12 75%)` }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 20% 0%, ${category.accent}35, transparent 60%)` }}
        aria-hidden="true"
      />
      {Icon && (
        <div
          className="relative z-10 flex h-14 w-14 items-center justify-center rounded-xl border transition-transform duration-500 ease-out-expo group-hover:scale-110 group-hover:-rotate-6"
          style={{ borderColor: `${category.accent}45`, background: `${category.accent}18` }}
        >
          <Icon size={26} style={{ color: category.accent }} strokeWidth={1.75} />
        </div>
      )}
      <div className="relative z-10">
        <h3 className="text-base md:text-lg font-medium text-white leading-tight">
          {category.title}
        </h3>
        <p className="mt-1 font-mono text-tag uppercase tracking-wider text-white/40">
          {count} {count === 1 ? 'Project' : 'Projects'}
        </p>
      </div>
      <div className="relative z-10 mt-auto h-px w-0 group-hover:w-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700" />
    </button>
  );
}

// Swaps the filter inside a View Transition when the browser supports one
// (Chrome/Edge, Safari 18+) so the grid crossfades/reflows instead of
// snapping — pure browser-native snapshot animation, no per-frame JS, so
// it doesn't add to the cost profile on weaker/retina-laggy machines.
// Falls back to a plain state update everywhere else, and skips the
// transition entirely under prefers-reduced-motion rather than relying on
// the ::view-transition-* pseudo-tree to be caught by a global selector.
function applyWithViewTransition(apply: () => void) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supportsViewTransitions = 'startViewTransition' in document;
  if (prefersReducedMotion || !supportsViewTransitions) {
    apply();
    return;
  }
  (document as Document & { startViewTransition: (cb: () => void) => void }).startViewTransition(apply);
}

export default function Work() {
  const { ref: headerRef, visible: headerVisible } = useReveal<HTMLDivElement>(0.15);
  const [filter, setFilter] = useState('All');
  // Filters only apply to the showcase grid — the language directories below
  // aren't filtered, they're always fully visible.
  const filters = ['All', 'Tool', 'Church', 'Nonprofit'];
  const [openStackId, setOpenStackId] = useState<string | null>(null);
  // Drives the modal's enter/exit transition classes separately from
  // openStackId itself: opening flips this true a frame after mount (so
  // the initial "hidden" state actually paints first), closing flips it
  // false immediately and only clears openStackId once the exit transition
  // has had time to finish, so the panel fades/scales out instead of
  // vanishing.
  const [isStackModalShown, setIsStackModalShown] = useState(false);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openStack = openStackId ? allItems.find((p) => p.id === openStackId) : null;
  const { hash } = useLocation();

  const handleOpenStack = (id: string) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setOpenStackId(id);
  };

  const handleCloseStack = () => {
    setIsStackModalShown(false);
    closeTimeout.current = setTimeout(() => setOpenStackId(null), 300);
  };

  useEffect(() => {
    if (!openStackId) return;
    const raf = requestAnimationFrame(() => setIsStackModalShown(true));
    return () => cancelAnimationFrame(raf);
  }, [openStackId]);

  useEffect(() => {
    if (!openStackId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseStack();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openStackId]);

  useEffect(() => {
    return () => {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, []);

  // If a link (the sidebar list, a floating card, an external share) points
  // at a specific showcase project via #work-<id>, make sure the active
  // filter isn't hiding that card before we try to scroll to it.
  useEffect(() => {
    if (!hash.startsWith('#work-')) return;
    const id = hash.slice('#work-'.length);
    const target = showcased.find((p) => p.id === id);
    if (!target) return;
    setFilter((current) => (current === 'All' || target.tags.includes(current) ? current : 'All'));
  }, [hash]);

  const filtered = filter === 'All' ? showcased : showcased.filter((p) => p.tags.includes(filter));

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
        className={reveal(headerVisible, 'relative z-10 max-w-7xl mx-auto mb-12 md:mb-16')}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-teal" />
              <span className="font-mono text-eyebrow uppercase text-teal">
                Selected Work
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-light tracking-tight leading-[1.05]">
              Sites &amp; projects <br />
              <span className="text-white/40">built so far.</span>
            </h2>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* By-language directory row */}
        <div className="mb-16 md:mb-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-white/20" />
            <span className="font-mono text-eyebrow uppercase text-white/40">
              By language
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {categories.map((category, i) => (
              <CategoryCard key={category.id} category={category} index={i} onOpenStack={handleOpenStack} />
            ))}
          </div>
        </div>

        {/* Showcased work */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-teal" />
            <span className="font-mono text-eyebrow uppercase text-teal">
              Showcased work
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => applyWithViewTransition(() => setFilter(f))}
                data-cursor="hover"
                aria-pressed={filter === f}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 auto-rows-auto">
          {filtered.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} onOpenStack={handleOpenStack} />
          ))}
        </div>
      </div>

      {openStack && (
        <div
          role="dialog"
          aria-modal="true"
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/70 backdrop-blur-sm transition-opacity duration-base ease-out-expo ${
            isStackModalShown ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={handleCloseStack}
        >
          <div
            className={`relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-ink-800 p-6 md:p-8 transition-[opacity,transform] duration-base ease-out-expo ${
              isStackModalShown ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{ background: `linear-gradient(160deg, ${openStack.accent}14, #0d0d16 60%)` }}
          >
            <button
              onClick={handleCloseStack}
              data-cursor="hover"
              className="absolute top-5 right-5 flex items-center justify-center w-9 h-9 rounded-full border border-white/15 bg-black/40 hover:bg-black/60 transition-colors"
              aria-label="Close"
            >
              <X size={16} className="text-white" />
            </button>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {openStack.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-tag uppercase text-white/60 px-2 py-1 rounded-full border border-white/10 bg-black/30"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="text-2xl md:text-3xl font-medium text-white leading-tight pr-10">
              {openStack.title}
            </h3>
            <p className="text-sm text-white/50 font-light mt-1.5 leading-relaxed">
              {openStack.category}
            </p>
            <div className="mt-6 space-y-3">
              {openStack.stackItems!.map((item) => {
                const ItemWrapper = item.link ? 'a' : 'div';
                return (
                  <ItemWrapper
                    key={item.title}
                    {...(item.link ? { href: item.link, target: '_blank', rel: 'noopener noreferrer' } : {})}
                    data-cursor={item.link ? 'hover' : undefined}
                    className={`group/item block rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors ${
                      item.link ? 'hover:border-teal/40 hover:bg-white/[0.05] cursor-pointer' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-base font-medium text-white">{item.title}</h4>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex flex-wrap gap-1.5 justify-end">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="font-mono text-tag uppercase text-white/50 px-2 py-0.5 rounded-full border border-white/10"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        {item.link && (
                          <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white/20 bg-black/40 opacity-70 group-hover/item:opacity-100 group-hover/item:rotate-45 transition-all duration-300">
                            <ArrowUpRight size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-white/50 font-light mt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                    {item.link && (
                      <p className="font-mono text-[10px] tracking-wider uppercase text-teal/70 mt-2">
                        View demo
                      </p>
                    )}
                  </ItemWrapper>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
