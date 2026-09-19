import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Portfolio } from "@/components/portfolio";
import { Services } from "@/components/services";
import { Testimonials } from "@/components/testimonials";
import { NAV } from "@/lib/site-data";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [activeId, setActiveId] = useState("honea-path");
  const [section, setSection] = useState("home");
  // Bumped each time the hero card's expand button is pressed; Portfolio reacts
  // to it by revealing + highlighting that project's card. `tick` makes
  // repeat presses on the SAME project still count as a new request.
  const [portfolioFocus, setPortfolioFocus] = useState<{ id: string; tick: number } | null>(null);
  const showInPortfolio = (id: string) => {
    setPortfolioFocus((prev) => ({ id, tick: (prev?.tick ?? 0) + 1 }));
  };

  useEffect(() => {
    const ids = NAV.map((item) => item.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setSection(visible.target.id);
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0.15, 0.4] },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Header active={section} />
      <main>
        <Hero activeId={activeId} onSelect={setActiveId} onExpand={showInPortfolio} />
        <Services />
        <Portfolio activeId={activeId} onSelect={setActiveId} focusRequest={portfolioFocus} />
        <About />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
