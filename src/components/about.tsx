import { useReveal } from "@/hooks/use-reveal";
import { BRAND_CONTACT } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function About() {
  const photo = useReveal({ y: 22 });
  const header = useReveal({ delay: 80, y: 16 });
  const bio = useReveal<HTMLParagraphElement>({ delay: 160, y: 16 });
  const quote = useReveal<HTMLParagraphElement>({ delay: 240, y: 16 });
  const list = useReveal<HTMLUListElement>({ delay: 320, y: 16 });

  return (
    <section id="about" className="scroll-mt-24 px-5 py-24 md:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div
          ref={photo.ref}
          className={cn(
            "overflow-hidden rounded-3xl border border-border shadow-(--shadow-border)",
            photo.className,
          )}
          style={photo.style}
        >
          <img
            src="/projects/clemson.jpg"
            alt="Forested lake shoreline in the South Carolina Upstate"
            loading="lazy"
            decoding="async"
            className="aspect-4/3 w-full object-cover outline outline-1 -outline-offset-1 outline-white/10"
          />
        </div>
        <div>
          <div
            ref={header.ref}
            className={cn("flex items-center justify-between gap-5", header.className)}
            style={header.style}
          >
            <div className="min-w-0">
              <p className="section-kicker">About</p>
              <h2 className="mt-4 font-display text-4xl font-bold tracking-wide text-balance text-fg uppercase md:text-5xl">
                From the foothills, for the foothills
              </h2>
            </div>
            <img
              src="/images/matthew-hunt.png"
              alt={`${BRAND_CONTACT.name}, founder of Upstate Technology Solutions`}
              width={720}
              height={720}
              loading="lazy"
              decoding="async"
              className="size-24 shrink-0 rounded-full border-2 border-teal/40 object-cover shadow-[0_0_28px_rgb(62_207_192/0.18)] sm:size-28"
            />
          </div>
          <p
            ref={bio.ref}
            className={cn(
              "mt-5 text-base leading-relaxed text-pretty text-muted",
              bio.className,
            )}
            style={bio.style}
          >
            I&rsquo;m <span className="font-semibold text-fg">{BRAND_CONTACT.name}</span>, founder
            of Upstate Technology Solutions. I design and build websites and custom software for
            businesses, nonprofits, churches, and everything in between, all hand-coded, not
            assembled from a page builder. Based in Honea Path, Upstate South Carolina, working with
            clients locally and remotely.
          </p>
          <p
            ref={quote.ref}
            className={cn(
              "mt-5 border-l-2 border-teal/60 pl-5 text-base leading-relaxed text-pretty text-fg/85",
              quote.className,
            )}
            style={quote.style}
          >
            Plenty of local businesses get by just fine without a new website or a new tool. My job
            isn&rsquo;t to sell you technology; it&rsquo;s to give you an honest read on whether it
            would actually help and to build only what&rsquo;s worth building.
          </p>
          <ul
            ref={list.ref}
            className={cn("mt-8 space-y-3 text-sm text-fg", list.className)}
            style={list.style}
          >
            <li className="flex gap-3">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-teal" />
              No templates dressed up as custom work
            </li>
            <li className="flex gap-3">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-teal" />
              Hosting, care plans, and smart add-ons only if you want them
            </li>
            <li className="flex gap-3">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-teal" />
              You own the site, the domain, and the keys
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
