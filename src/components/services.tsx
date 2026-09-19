import { AppWindow, ArrowRight, CodeXml, Cog, Laptop, Lightbulb, Workflow } from "lucide-react";
import type { ComponentType } from "react";
import { useReveal } from "@/hooks/use-reveal";
import { SERVICES, type ServiceIconName } from "@/lib/site-data";
import { cn, scrollToSection } from "@/lib/utils";

type IconProps = { className?: string; strokeWidth?: number };

/** Three interlocking gears (lucide only ships a single cog). */
function CogsIcon({ className, strokeWidth = 1.5 }: IconProps) {
  return (
    <span className={`relative block ${className ?? ""}`} aria-hidden="true">
      <Cog className="absolute bottom-0 left-0 size-[70%]" strokeWidth={strokeWidth} />
      <Cog className="absolute top-0 right-0 size-[44%]" strokeWidth={strokeWidth + 0.4} />
      <Cog
        className="absolute right-[4%] bottom-[10%] size-[34%]"
        strokeWidth={strokeWidth + 0.6}
      />
    </span>
  );
}

const ICONS: Record<ServiceIconName, ComponentType<IconProps>> = {
  code: CodeXml,
  cogs: CogsIcon,
  app: AppWindow,
  idea: Lightbulb,
  flow: Workflow,
  laptop: Laptop,
};

export function Services() {
  const heading = useReveal({ y: 16 });

  return (
    <section id="services" className="scroll-mt-24 px-5 py-24 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.1fr)] lg:gap-10">
        <div ref={heading.ref} className={cn("max-w-sm lg:pt-2", heading.className)} style={heading.style}>
          <p className="font-display text-lg font-semibold tracking-wide text-teal-dim">
            My Services
          </p>
          <h2 className="mt-2 font-display text-4xl leading-[1.05] font-bold text-balance text-fg md:text-5xl">
            Everything You Need Under One Roof.
          </h2>
          <p className="mt-5 font-card text-[15px] leading-snug text-pretty text-fg/85">
            From websites and automation to integrations and hardware, I build solutions that fit
            your business, your goals, and your budget.
          </p>
          <button
            type="button"
            onClick={() => scrollToSection("contact")}
            className="pressable mt-6 inline-flex items-center gap-2 font-display text-sm font-semibold tracking-[0.12em] text-teal-dim uppercase transition-colors hover:text-teal-bright"
          >
            Get a free quote
            <ArrowRight className="size-4" />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  service,
  index,
}: {
  service: (typeof SERVICES)[number];
  index: number;
}) {
  const Icon = ICONS[service.icon];
  // Small stagger across the grid, capped so late cards don't lag too long.
  const card = useReveal({ delay: Math.min(index, 5) * 70, y: 18 });

  return (
    <article
      ref={card.ref}
      className={cn(
        // `hover-card` (styles.css) handles the hover/touch motion+glow — see
        // that rule's comment for why it's split out of these utility classes:
        // animating box-shadow/border-color directly on this same element
        // (which also carries backdrop-blur-md) was what caused the laggy,
        // stuttery hover response on desktop, since every frame of that
        // transition forced the blur to re-sample the whole backdrop.
        "group pressable hover-card relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-b from-white/[0.07] to-white/[0.02] p-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.07),0_10px_30px_rgb(0_0_0/0.25)] backdrop-blur-md",
        card.className,
      )}
      style={card.style}
    >
      {/* Plain, unblurred overlay: fades in on hover/press to draw the
          teal border + glow without ever repainting the parent's blur. */}
      <span
        aria-hidden="true"
        className="hover-card-glow border border-teal/35 shadow-[inset_0_1px_0_rgb(255_255_255/0.09),0_0_28px_rgb(62_207_192/0.12),0_10px_30px_rgb(0_0_0/0.3)]"
      />
      <Icon
        className="relative size-8 text-teal-bright drop-shadow-[0_0_7px_rgb(62_207_192/0.7)]"
        strokeWidth={1.5}
      />
      <h3 className="relative mt-5 font-card text-[17px] leading-tight font-semibold text-fg">
        {service.title}
      </h3>
      <p className="relative mt-1.5 font-card text-sm leading-snug text-pretty text-fg/75">
        {service.body}
      </p>
    </article>
  );
}
