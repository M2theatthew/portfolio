import { Github, Mail, Phone } from "lucide-react";
import { BrandMark } from "@/components/mountain-logo";
import { useReveal } from "@/hooks/use-reveal";
import { BRAND_CONTACT, NAV } from "@/lib/site-data";
import { cn, scrollToSection } from "@/lib/utils";

export function Footer() {
  const reveal = useReveal<HTMLElement>({ y: 12 });

  return (
    <footer
      ref={reveal.ref}
      className={cn("border-t border-border px-5 py-10 md:px-8", reveal.className)}
      style={reveal.style}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <BrandMark />
        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className="font-display text-xs font-semibold tracking-[0.18em] text-muted uppercase hover:text-fg"
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="flex flex-col gap-2 md:items-end">
          <div className="flex items-center gap-4 text-muted">
            <a
              href={BRAND_CONTACT.phoneHref}
              aria-label={`Call ${BRAND_CONTACT.phone}`}
              className="hover:text-fg"
            >
              <Phone className="size-[18px]" strokeWidth={1.5} />
            </a>
            <a href={BRAND_CONTACT.emailHref} aria-label="Email me" className="hover:text-fg">
              <Mail className="size-[18px]" strokeWidth={1.5} />
            </a>
            <a
              href={BRAND_CONTACT.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="hover:text-fg"
            >
              <Github className="size-[18px]" strokeWidth={1.5} />
            </a>
          </div>
          <p className="text-xs tracking-wide text-faint">
            © {new Date().getFullYear()} Upstate Technology Solutions · {BRAND_CONTACT.name},{" "}
            {BRAND_CONTACT.location}
          </p>
        </div>
      </div>
    </footer>
  );
}
