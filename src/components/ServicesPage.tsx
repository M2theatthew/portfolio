import { ArrowRight } from 'lucide-react';
import PageChrome from '@/components/PageChrome';
import { services } from '@/data/services';

export default function ServicesPage() {
  return (
    <PageChrome>
      <div className="mb-16 md:mb-20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-px bg-teal" />
          <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-teal">Services</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-light tracking-tight leading-[1.05] mb-6">
          Websites and software, <br />
          <span className="text-white/40">built for how your business runs.</span>
        </h1>
        <p className="text-white/50 font-light leading-relaxed text-lg max-w-2xl">
          Every project starts the same way: an honest conversation about what's
          actually slowing you down. Sometimes that's a website. Sometimes it's
          a process. Here's the full range of what I build and fix.
        </p>
      </div>

      <div className="space-y-4">
        {services.map((s, i) => (
          <div
            key={s.title}
            className="group relative p-6 md:p-8 rounded-2xl border border-white/5 hover:border-teal/30 transition-colors duration-500"
          >
            <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8">
              <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-teal/50 md:w-10 flex-shrink-0 pt-1">
                0{i + 1}
              </div>
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-medium text-white mb-2">{s.title}</h2>
                <p className="text-white/40 font-light leading-relaxed mb-1">{s.desc}</p>
                <p className="text-sm text-white/30 font-light leading-relaxed">{s.detail}</p>
              </div>
            </div>
            <div className="absolute bottom-0 left-6 right-6 md:left-16 md:right-8 h-px w-0 group-hover:w-[calc(100%-3rem)] bg-teal/30 transition-all duration-700" />
          </div>
        ))}
      </div>

      <div className="mt-16 md:mt-20 text-center">
        <a
          href="/get-in-touch"
          data-cursor="hover"
          className="group inline-flex items-center gap-2 rounded-full bg-teal/10 border border-teal/30 px-6 py-3 text-sm font-medium text-teal hover:bg-teal hover:text-black transition-all"
        >
          Start a project
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </PageChrome>
  );
}
