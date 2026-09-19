import { useEffect, useRef, useState, type RefObject } from "react";
import { ArrowRight, SquareArrowOutUpRight } from "lucide-react";
import { PinGlyph } from "@/components/pin-icon";
import { useReveal } from "@/hooks/use-reveal";
import { isMapped, PROJECTS, type Project } from "@/lib/site-data";
import { cn, scrollToSection } from "@/lib/utils";

const FEATURED = PROJECTS.filter((project) => project.featured);
// "View all" keeps the featured cards exactly where they are and appends the rest after them.
const ALL_PROJECTS = [...FEATURED, ...PROJECTS.filter((project) => !project.featured)];

export function Portfolio({
  activeId,
  onSelect,
  focusRequest,
}: {
  activeId: string;
  onSelect: (id: string) => void;
  /** Set by the hero card's expand button: reveal and highlight this project. */
  focusRequest?: { id: string; tick: number } | null;
}) {
  const [showAll, setShowAll] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const pendingScroll = useRef<string | null>(null);
  const visible = showAll ? ALL_PROJECTS : FEATURED;
  const heading = useReveal({ y: 16 });

  // 1) A request arrives: make sure the project's card will be rendered (the
  //    non-featured ones only exist under "View all projects"), and queue a scroll.
  useEffect(() => {
    if (!focusRequest) return;
    const project = PROJECTS.find((p) => p.id === focusRequest.id);
    if (!project) return;
    if (!project.featured) setShowAll(true);
    pendingScroll.current = project.id;
    setHighlightId(project.id);
    const timer = window.setTimeout(() => setHighlightId(null), 2400);
    return () => window.clearTimeout(timer);
  }, [focusRequest]);

  // 2) After any render, if a scroll is queued and its card is now in the DOM,
  //    scroll to it (this waits out the extra render when "show all" flips on).
  useEffect(() => {
    const id = pendingScroll.current;
    if (!id) return;
    const el = document.getElementById(`project-${id}`);
    if (!el) return;
    pendingScroll.current = null;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  return (
    <section id="portfolio" className="scroll-mt-24 relative overflow-hidden px-5 py-24 md:px-8">
      <img
        src="/images/featured-bg.jpg"
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(100deg,#0c1016_0%,#0c1016e8_30%,#0c101699_58%,#0c101640_78%)] [mask-image:linear-gradient(to_bottom,#000_0,#000_340px,rgb(0_0_0/0.3)_560px)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,#0c1016_0%,transparent_22%)]" />

      <div className="relative mx-auto max-w-6xl">
        <div ref={heading.ref} className={heading.className} style={heading.style}>
          <p className="section-kicker">Local businesses. Modern solutions.</p>
          <h2 className="mt-4 max-w-xl font-display text-4xl font-bold tracking-wide text-balance text-fg uppercase md:text-5xl">
            Featured work
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-pretty text-muted">
            I'm dedicated to building tools and strategies that help local businesses thrive. Here
            are a few examples of what I've done.
          </p>
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="pressable group mt-8 inline-flex items-center gap-2 font-display text-sm font-semibold tracking-[0.14em] text-teal uppercase transition-colors hover:text-teal-bright"
          >
            {showAll ? "Show featured only" : "View all projects"}
            <ArrowRight
              className={cn(
                "size-4 transition-transform duration-300 ease-out group-hover:rotate-90",
                showAll && "rotate-90",
              )}
            />
          </button>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              active={project.id === activeId}
              highlighted={project.id === highlightId}
              onShowOnMap={() => {
                onSelect(project.id);
                scrollToSection("home");
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const CARD_TEXT_SHADOW = "[text-shadow:0_1px_10px_rgb(0_0_0/0.55)]";
const CTA_CLASS =
  "inline-flex items-center gap-1.5 self-start font-display text-xs font-semibold tracking-[0.12em] uppercase";
// Same teal glow used when the hero card's (i) button highlights a project
// here — reused as a hover state below so hovering a card previews the same
// look, rather than inventing a second highlight style.
const HIGHLIGHT_CLASS = "border-teal ring-2 ring-teal/60 shadow-[0_0_36px_rgb(62_207_192_/_0.35)]";
const HIGHLIGHT_HOVER_CLASS =
  "hover:border-teal hover:ring-2 hover:ring-teal/60 hover:shadow-[0_0_36px_rgb(62_207_192_/_0.35)]";

/**
 * One portfolio card.
 *
 * - Projects with a real location (they have a pin on the hero map): tapping the
 *   card body flies to that pin, and a separate "View project" link opens the
 *   live site. They're siblings, not nested, so both are valid interactive elements.
 * - Projects without a location (software, coursework): the whole card is the link.
 * - Projects with nothing public to link to just say so.
 */
function ProjectCard({
  project,
  index,
  active,
  highlighted,
  onShowOnMap,
}: {
  project: Project;
  index: number;
  active: boolean;
  highlighted: boolean;
  onShowOnMap: () => void;
}) {
  const mapped = isMapped(project);
  const kicker = [project.city, project.category, project.city ? null : project.detail]
    .filter(Boolean)
    .join(" \u00b7 ");
  // Capped stagger — newly revealed cards (e.g. after "View all projects")
  // fade in the same way instead of waiting on a huge cumulative delay.
  const reveal = useReveal<HTMLElement>({ delay: Math.min(index, 5) * 70, y: 18 });

  const cardClass = cn(
    "flex flex-col overflow-hidden rounded-2xl border text-left shadow-(--shadow-card) transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1",
    HIGHLIGHT_HOVER_CLASS,
    active ? "border-teal/50" : "border-border",
    highlighted && HIGHLIGHT_CLASS,
    reveal.className,
  );

  const media = (
    <img
      src={project.image}
      alt=""
      loading="lazy"
      decoding="async"
      className="aspect-video w-full shrink-0 object-cover outline outline-1 -outline-offset-1 outline-white/10"
    />
  );

  const text = (
    <div
      className={cn("flex flex-1 flex-col bg-surface/25 p-5 backdrop-blur-sm", CARD_TEXT_SHADOW)}
    >
      <p className="font-display text-[0.68rem] font-semibold tracking-[0.2em] text-teal uppercase">
        {kicker}
      </p>
      <h3 className="mt-1 flex items-center gap-2 font-display text-xl font-semibold tracking-wide text-fg">
        <PinGlyph name={project.icon} className="size-4 shrink-0 text-teal" />
        {project.name}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-pretty text-fg/80">{project.summary}</p>
    </div>
  );

  const viewCta = (
    <span className={cn(CTA_CLASS, "text-teal")}>
      <SquareArrowOutUpRight className="size-3.5" />
      View project
    </span>
  );

  const noDemo = <span className={cn(CTA_CLASS, "text-faint")}>No public demo</span>;

  // Mapped: body = "show on map" button, footer = live-site link.
  if (mapped) {
    return (
      <article
        id={`project-${project.id}`}
        ref={reveal.ref}
        className={cardClass}
        style={reveal.style}
      >
        <button
          type="button"
          onClick={onShowOnMap}
          className="pressable flex flex-1 flex-col text-left"
        >
          {media}
          {text}
        </button>
        <div className={cn("bg-surface/25 px-5 pb-5 backdrop-blur-sm", CARD_TEXT_SHADOW)}>
          {project.href ? (
            <a
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(CTA_CLASS, "pressable text-teal hover:text-teal-bright")}
            >
              <SquareArrowOutUpRight className="size-3.5" />
              View project
            </a>
          ) : (
            noDemo
          )}
        </div>
      </article>
    );
  }

  // Not on the map: the whole card is the link (or plain, if there's nothing to link to).
  const inner = (
    <>
      {media}
      {text}
      <div className={cn("bg-surface/25 px-5 pb-5 backdrop-blur-sm", CARD_TEXT_SHADOW)}>
        {project.href ? viewCta : noDemo}
      </div>
    </>
  );

  return project.href ? (
    <a
      id={`project-${project.id}`}
      ref={reveal.ref as unknown as RefObject<HTMLAnchorElement>}
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${project.name}, opens in a new tab`}
      className={cn(cardClass, "pressable")}
      style={reveal.style}
    >
      {inner}
    </a>
  ) : (
    <article id={`project-${project.id}`} ref={reveal.ref} className={cardClass} style={reveal.style}>
      {inner}
    </article>
  );
}
