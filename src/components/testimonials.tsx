import { useReveal } from "@/hooks/use-reveal";
import { TESTIMONIALS } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function Testimonials() {
  const testimonial = TESTIMONIALS[0];
  const card = useReveal({ y: 20 });

  return (
    <section className="relative overflow-hidden px-5 py-20 md:px-8">
      <img
        src="/images/testimonials-bg.jpg"
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-[center_40%]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#0c101699_0%,#0c101670_38%,#0c101638_62%,transparent_82%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#0c101699_0%,transparent_30%,transparent_75%,#0c1016cc_100%)]" />

      <div className="relative mx-auto max-w-6xl">
        <div
          ref={card.ref}
          className={cn(
            "max-w-4xl rounded-2xl border border-white/10 bg-bg-deep/35 px-6 py-6 shadow-(--shadow-card) backdrop-blur-sm [text-shadow:0_1px_10px_rgb(0_0_0/0.55)] sm:px-8",
            card.className,
          )}
          style={card.style}
        >
          <h2 className="font-display text-2xl font-bold tracking-wide text-[#96b9b9]">
            What My Clients Say
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-pretty text-fg">
            {testimonial.quote}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <div className="flex items-center gap-3">
              <img
                src={testimonial.image}
                alt={testimonial.name}
                width={40}
                height={40}
                loading="lazy"
                decoding="async"
                className="size-10 shrink-0 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-fg">{testimonial.name}</p>
                <p className="text-xs text-fg/70">{testimonial.role}</p>
              </div>
            </div>
            <p className="rounded-2xl bg-white/10 px-5 py-2 text-center text-xs leading-snug text-white">
              Trusted by local businesses
              <br />
              since 2018
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
