import { useEffect, useState, type ComponentType } from "react";
import { ArrowRight, Info, Play, SquareArrowOutUpRight } from "lucide-react";
import { VideoModal } from "@/components/video-modal";
import { PinGlyph } from "@/components/pin-icon";
import { useReveal } from "@/hooks/use-reveal";
import { MAPPED_PROJECTS, STATS, type MappedProject } from "@/lib/site-data";
import { cn, scrollToSection } from "@/lib/utils";

type MapProps = {
  projects: MappedProject[];
  activeId: string;
  onSelect: (id: string) => void;
};

export function Hero({
  activeId,
  onSelect,
  onExpand,
}: {
  activeId: string;
  onSelect: (id: string) => void;
  /** Jump to this project's card in the Featured Work section. */
  onExpand: (id: string) => void;
}) {
  const [videoOpen, setVideoOpen] = useState(false);
  const [Map, setMap] = useState<ComponentType<MapProps> | null>(null);
  const active = MAPPED_PROJECTS.find((p) => p.id === activeId) ?? MAPPED_PROJECTS[0];

  // Staggered so the hero reads top-to-bottom on load instead of arriving as
  // one flat block: kicker/headline first, then copy, actions, and stats.
  const kicker = useReveal({ delay: 0, y: 14 });
  const copy = useReveal<HTMLParagraphElement>({ delay: 120, y: 16 });
  const actions = useReveal({ delay: 220, y: 16 });
  const stats = useReveal({ delay: 320, y: 16 });
  const mapReveal = useReveal({ delay: 180, y: 24 });

  useEffect(() => {
    let alive = true;
    void import("@/components/hero-map")
      .then((mod) => {
        if (alive) setMap(() => mod.HeroMap);
      })
      .catch((err) => {
        console.error("Failed to load map", err);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section id="home" className="relative min-h-screen pt-24 md:pt-28">
      {/* No more mx-auto max-w-[92rem] wrapping both columns — that cap was
          exactly what stopped the map from ever reaching the real right
          edge of the browser, since the map column's "100%" was 100% of a
          container that stopped short of the viewport. The grid itself is
          now full-width; the left inset lives on the GRID CONTAINER itself
          (not on the text column's own box) so it shifts where both
          columns start rather than eating into the text column's own
          width budget — doing it on the inner box caused the offset to be
          subtracted twice (once from the column's fr-share, again from
          the box's own margin/padding), collapsing it to a sliver on wide
          screens. It's still keyed to the old 92rem/2rem math so it lines
          up with the header on typical screens, and doesn't creep too far
          left on ultra-wide ones. With nothing capping the right side
          anymore, the map column's right edge simply *is* the viewport's
          right edge. */}
      {/* Dropped `relative` from this grid. It has no vertical padding of
          its own, so it was never the thing holding the map back — the
          actual limit was the parent <section>'s `pt-24 md:pt-28`. The map
          wrapper below is positioned `lg:inset-0`, and that resolves
          against the padding box of the NEAREST positioned ancestor. As
          long as this grid stayed `relative`, it was that ancestor, and
          this grid's own box already starts *below* the section's top
          padding — so the map's canvas could never reach any higher than
          that line, no matter how close the terrain itself got dollied.
          Removing `relative` here lets that lookup continue up to
          <section> (still `relative`), whose padding box spans the
          section's full outer height, so `top-0` on the map wrapper now
          lands at the section's actual top instead of stopping at the
          header gap — giving the terrain real headroom above the old line
          before its top edge runs into the edge of the canvas when
          someone zooms in. Left/right and the bottom edge are unaffected:
          this grid has no horizontal or bottom padding, so those insets
          already resolved to the same place against either ancestor. */}
      <div className="grid min-h-[calc(100vh-6rem)] gap-8 px-5 pb-16 lg:grid-cols-[minmax(20rem,0.62fr)_minmax(0,1.55fr)] lg:items-stretch lg:px-0 lg:pl-[max(2rem,calc((100vw-92rem)/4+2rem))]">
        <div className="relative z-10 max-w-xl">
          <div ref={kicker.ref} className={kicker.className} style={kicker.style}>
            <p className="section-kicker flex items-center gap-3 text-[0.7rem] tracking-[0.16em] whitespace-nowrap sm:text-[1.05rem] md:text-[1.15rem] lg:text-[1.25rem]">
              <span className="inline-block h-px w-8 bg-teal" />
              Local business / modern solutions
            </p>
            <h1 className="mt-5 font-display text-[clamp(2.6rem,11vw,6.4rem)] leading-[0.88] font-extrabold tracking-[0.02em] text-fg uppercase">
              <span className="block whitespace-nowrap">
                Upstate <span className="text-teal">(SC)</span>
              </span>
              <span className="mt-1 block whitespace-nowrap text-teal">Solutions</span>
            </h1>
          </div>
          <p
            ref={copy.ref}
            className={cn("mt-7 max-w-md text-base leading-relaxed text-pretty text-muted md:text-lg", copy.className)}
            style={copy.style}
          >
            I help local businesses grow with modern websites, reliable hosting, and smart
            technology, so you can focus on what you do best.
          </p>
          <div
            ref={actions.ref}
            className={cn("mt-9 flex flex-wrap items-center gap-4", actions.className)}
            style={actions.style}
          >
            <button
              type="button"
              onClick={() => scrollToSection("contact")}
              className="pressable inline-flex items-center gap-2 rounded-full bg-teal px-6 py-3 font-display text-sm font-bold tracking-[0.14em] text-ink uppercase"
            >
              Get a free quote
              <ArrowRight className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setVideoOpen(true)}
              className="pressable inline-flex items-center gap-3 text-fg"
            >
              <span className="flex size-11 items-center justify-center rounded-full border border-white/25 bg-transparent">
                <Play className="ml-0.5 size-4 fill-current" />
              </span>
              <span className="font-display text-sm font-semibold tracking-[0.12em] uppercase">
                Watch my intro video
              </span>
            </button>
          </div>
          <div
            ref={stats.ref}
            className={cn(
              "mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-8",
              stats.className,
            )}
            style={stats.style}
          >
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-3xl font-bold tracking-tight text-fg md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs tracking-wide text-faint">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* This wrapper used to be a normal, `relative` grid cell confined
            to just this second grid column — which meant its own left edge
            (the DOM/CSS box, not the terrain's shape) was a hard boundary
            sitting right where the text column ends. Once the recent zoom
            increase pulled the terrain's silhouette out closer to that
            edge, the terrain started visibly hitting that box edge and
            disappearing — the "cut" wasn't the text column painting over
            it (that column has no background), it was this wrapper's own
            box clipping the canvas's content at its boundary.

            Fix: from `lg` up, this wrapper leaves the grid flow entirely
            (`absolute`) and covers the *whole* grid container above via
            `inset-0` — the same one whose left inset and true-viewport
            right edge are set up in the comment above — instead of just
            its own column. That both removes the boundary that was doing
            the clipping and lets the terrain extend left, showing through
            behind the (transparent) text column exactly as intended,
            instead of stopping at a box edge. `z-0` keeps it behind the
            text's `z-10`, and the old `lg:translate-x-16` on the map's own
            inner div is gone — reaching the true right edge is now just
            what `inset-0` on this wrapper already does, relative to that
            same full-bleed container. Below `lg` (stacked mobile layout)
            nothing changes — the wrapper stays an ordinary block.

            UPDATE — going full-bleed also re-centered the terrain: Bounds
            fits it to the middle of this now much wider box, whereas
            before it was centered within just the narrower right column
            (well clear of the headline). Shifted the map's own inner div
            right by ~15% of the full width to put the terrain back
            roughly where it read well — mostly clear of the big headline
            text — while keeping the wider box (so no more hard-edge
            clipping) and the through-the-text bleed at the terrain's own
            edges/pins, not the bulk of it sitting under the letters.

            UPDATE 2 — asked to nudge the terrain down and slightly right
            because it was sitting too high, leaving a large empty gap
            between it and the Services section below. This was first
            tried as a 3D pan inside hero-map.tsx's Scene (moving the
            camera and its OrbitControls target together, in world space)
            — that turned out unreliable in practice (see that file's
            history), most likely because OrbitControls' own per-frame
            damping update recomputes the camera from its internal
            spherical state each frame and can fight a one-off external
            position nudge like that. A plain CSS transform on this
            wrapper has no such fight — it moves the already-rendered
            canvas pixels directly, the same mechanism the `translate-x`
            here already uses for the earlier off-center fix above — so
            the position adjustment now lives entirely here instead.

            UPDATE 3 — the previous pass (translate-x 15%→20%, translate-y
            0→22%) closed the vertical gap well, but the x change read as
            a shift *left* into the headline instead of further right.
            Rather than chase the discrepancy (the terrain's own on-screen
            footprint also changed between screenshots from the separate
            zoom work in hero-map.tsx, which likely swamped a modest 5-point
            translate-x change), this jumped translate-x by a clearly
            bigger, unambiguous step — 20% → 32% — so the correction would
            read unmistakably as "more right" regardless of that
            interaction.

            UPDATE 4 — turned out this whole time the running project
            wasn't picking up source edits (a stale prebuilt bundle was
            being served) — the 32% jump above only became visible once
            that got sorted out and the project was rebuilt, and once
            visible it read as "5% too far right." So: 32% → 27%.
            translate-y stays at 22%.

            UPDATE 5 — asked to nudge left again: 27% → 22%.

          UPDATE 6 (superseded by UPDATE 7) — the wrapper reaches the
          section's full (tall) height now, but the terrain itself was
          still only filling roughly the top ~55% of it, leaving a large
          empty band at the bottom (the fixed zoom factor in hero-map.tsx
          was sized to the terrain's own wide/short aspect at ONE window
          shape, so it satisfied the frame's width before its height).
          Bumped that zoom so the terrain was ~1.46x bigger, which grows
          it symmetrically around its own center rather than only
          downward — so this also needed translate-y pushed further down,
          22% → 30%, to land that larger terrain against the bottom of
          the frame instead of spilling extra height off the top.

          UPDATE 7 — that fixed zoom-and-translate-y combination only
          looked right at the one window shape it was tuned against; a
          wider/shorter window (e.g. going fullscreen) reintroduced empty
          space, just on a different edge, since neither number adapted
          to the new aspect ratio. hero-map.tsx's zoom is now computed
          live from the actual frame size instead (see its CoverFit
          comment) — it always fills every edge of this wrapper by
          itself, at any window shape, so the compensating translate-y
          here was dropped. translate-x stays: that one is pure
          left/right composition (keeping the terrain's bulk clear of the
          headline text), which has nothing to do with the letterboxing
          bug and still needs to be picked by hand.

          UPDATE 8 — separately from letterboxing, asked to physically
          relocate the terrain lower in the frame (it was reading as
          sitting too high, with too much empty room below it) WITHOUT
          changing how zoomed-in it is — i.e. move it, don't re-fit it.
          CoverFit only controls the zoom/fit, not vertical placement, so
          this is back to a plain CSS translate-y again, same mechanism
          as UPDATE 6 above and for the same underlying reason it was
          used there (a plain transform just moves the already-rendered
          pixels, with no fight against OrbitControls' per-frame damping
          the way nudging the 3D camera/target has run into before — see
          ZoomBoost's own comment in hero-map.tsx). This one isn't
          compensating for a fit bug like UPDATE 6 was, so there's no
          derivation behind the number — 18% was just a first pass; nudge
          it up/down in similar small steps if it needs more or less. */}
        <div
          ref={mapReveal.ref}
          className={cn(
            // Below `lg` this used to be one `relative` box with the 3D map
            // AND the project card both absolutely stacked inside a fixed
            // ~28rem/34rem height — the card's own footprint (device mockup +
            // three lines of copy) ate a third of that height and sat right
            // over the pins near the bottom of the terrain, so the map had
            // very little clear room left to actually see or drag around in
            // on a phone. It's now just the map's own box on mobile — full
            // height, nothing overlaid on top of it — and `ProjectCard`
            // moves into normal document flow *after* it (see below), full
            // width, as its own separate card. `lg:` and up is unchanged:
            // the card goes back to floating over the map exactly as before.
            "relative h-[24rem] sm:h-[30rem] lg:absolute lg:top-24 lg:right-0 lg:bottom-0 lg:left-0 lg:h-auto lg:z-0",
            mapReveal.className,
          )}
          style={mapReveal.style}
        >
          {Map ? (
            <div className="absolute inset-0 lg:translate-x-[22%] lg:translate-y-[1%]">
              <Map projects={MAPPED_PROJECTS} activeId={activeId} onSelect={onSelect} />
            </div>
          ) : (
            <div className="relative flex h-full items-center justify-center">
              <img
                src="/textures/sc-terrain.png"
                alt=""
                className="h-[78%] w-[78%] object-contain opacity-70"
              />
            </div>
          )}
          {/* lg+ only here — see the mobile copy below the map for <lg. */}
          <div className="hidden lg:contents">
            <ProjectCard project={active} onExpand={onExpand} />
          </div>
        </div>
        {/* Mobile/tablet copy of the project card: plain flow (not overlaid
            on the map), so it gets its own glass background for legibility
            instead of relying on floating over the terrain. */}
        <div className="lg:hidden">
          <ProjectCard project={active} onExpand={onExpand} mobile />
        </div>
      </div>
      <VideoModal open={videoOpen} onOpenChange={setVideoOpen} />
    </section>
  );
}

function ProjectCard({
  project,
  onExpand,
  mobile,
}: {
  project: MappedProject;
  onExpand: (id: string) => void;
  /** Renders as a plain, in-flow card with its own background instead of
   *  floating (absolutely positioned, no background) over the 3D map —
   *  used below `lg`, where the card now sits after the map rather than
   *  overlapping it. See the two call sites in Hero above. */
  mobile?: boolean;
}) {
  return (
    <article
      key={project.id}
      // Was `lg:bottom-[30rem]` at every desktop size — a fixed offset
      // from the bottom that only happened to land near the top-right of
      // the map because of this container's particular height, and stayed
      // there no matter how wide the browser got.
      //
      // Now split into two explicit desktop states instead of one fixed
      // spot: from `lg` up to `xl` (a browser window that's been resized
      // narrower, not maximized) the card stays anchored to the top-right,
      // overlapping the 3D asset there. From `2xl` up — the width a
      // maximized/fullscreen browser reaches on typical monitors — it
      // drops to the bottom-right corner instead, off the terrain itself.
      className={cn(
        "rounded-2xl p-5",
        mobile
          ? "relative w-full border border-white/10 bg-bg-deep/50 backdrop-blur-md"
          : "absolute right-2 bottom-[12rem] z-40 w-[min(100%,20rem)] sm:right-4 sm:bottom-[18rem] lg:top-6 lg:right-6 lg:bottom-auto 2xl:top-auto 2xl:right-8 2xl:bottom-8",
      )}
    >
      {/* Info button. Two things make it easy to hit: `z-10` lifts it above the
          device mockup below (which is positioned later in the DOM and was
          painting over — and swallowing clicks on — the lower half of the old
          24px icon), and the button itself is a 40px target around a 28px
          visible circle, so the click area is much larger than what's drawn. */}
      <button
        type="button"
        onClick={() => onExpand(project.id)}
        aria-label={`More about ${project.name}, view in featured work`}
        title="View project details"
        className="group absolute top-1 right-1 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-teal"
      >
        <span className="flex size-7 items-center justify-center rounded-full border border-white/20 bg-white/10 text-muted transition-colors group-hover:border-teal/60 group-hover:bg-teal/15 group-hover:text-teal group-active:scale-95">
          <Info className="size-4" />
        </span>
      </button>
      <DeviceMockup image={project.image} />
      <p className="mt-4 font-display text-[0.68rem] font-semibold tracking-[0.22em] text-teal uppercase">
        {project.category} · {project.detail}
      </p>
      <h2 className="mt-1 flex items-center gap-2 font-display text-lg font-semibold tracking-wide text-fg uppercase">
        <PinGlyph name={project.icon} className="size-4 text-teal" />
        {project.name}
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-pretty text-muted">{project.summary}</p>
      {project.href ? (
        <a
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          className="pressable mt-3 inline-flex items-center gap-1.5 font-display text-xs font-semibold tracking-[0.12em] text-teal uppercase hover:text-teal-bright"
        >
          <SquareArrowOutUpRight className="size-3.5" />
          View live site
        </a>
      ) : null}
    </article>
  );
}

/**
 * Stand-in for the reference card's isometric device photo: a single
 * lightly-tilted "screen" showing the project image, angled just enough
 * to read as a floating preview rather than a flat photo banner. The X
 * tilt was originally 48deg (a thin, hard-to-read horizontal strip),
 * pulled back to 16deg (still visibly crooked/diagonal — the rotateZ
 * skew compounded with the rotateX foreshortening to tilt the whole
 * rectangle off-axis), and now further down to 5deg X / -1deg Z so it
 * reads as an essentially upright, easy-to-read photo with only a
 * faint isometric hint.
 */
function DeviceMockup({ image }: { image: string }) {
  return (
    <div className="relative h-28 w-full [perspective:800px]">
      <div className="absolute inset-x-2 bottom-1 h-8 rounded-full bg-black/50 blur-md" />
      <div className="absolute inset-0 flex items-center justify-center [transform:rotateX(5deg)_rotateZ(-1deg)]">
        <div
          className="h-20 w-[92%] rounded-md border border-white/15 bg-cover bg-center shadow-2xl"
          style={{ backgroundImage: `url(${image})`, backgroundPosition: "50% 45%" }}
        />
      </div>
    </div>
  );
}
