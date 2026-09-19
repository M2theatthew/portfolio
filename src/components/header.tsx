import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandMark } from "@/components/mountain-logo";
import { NAV } from "@/lib/site-data";
import { scrollToSection } from "@/lib/utils";

export function Header({ active }: { active: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function go(id: string) {
    setOpen(false);
    scrollToSection(id);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-8 md:pt-5">
      <div className="mx-auto flex max-w-[92rem] items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => go("home")}
          className="pressable relative z-50 rounded-md text-left"
          aria-label="Upstate Technology Solutions, back to top"
        >
          <BrandMark />
        </button>

        <nav className="hidden items-center gap-2 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className="nav-link"
              data-active={active === item.id}
              onClick={() => go(item.id)}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => go("contact")}
            className="pressable ml-2 rounded-full bg-teal px-4 py-2 font-display text-[0.78rem] font-bold tracking-[0.16em] text-ink uppercase"
          >
            Get a free quote
          </button>
        </nav>

        <button
          type="button"
          className="pressable relative z-50 flex size-11 items-center justify-center rounded-full border border-border bg-surface text-fg lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 bg-bg-deep/95 px-6 pt-24 backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col gap-2" aria-label="Mobile">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                className="rounded-xl px-2 py-3 text-left font-display text-2xl font-semibold tracking-[0.16em] text-fg uppercase"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => go("contact")}
              className="pressable mt-4 rounded-full bg-teal px-5 py-3 font-display text-sm font-bold tracking-[0.16em] text-ink uppercase"
            >
              Get a free quote
            </button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
