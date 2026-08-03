import { ArrowRight, Star } from 'lucide-react';
import PageChrome from '@/components/PageChrome';

interface Review {
  quote: string;
  name: string;
  business: string;
}

// Add real client testimonials here as they come in — nothing fake goes
// on the site, so this starts empty rather than pre-filled with
// placeholder quotes. Each entry renders as one card below.
const reviews: Review[] = [];

export default function ReviewsPage() {
  return (
    <PageChrome>
      <div className="mb-16 md:mb-20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-px bg-teal" />
          <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-teal">Reviews</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-light tracking-tight leading-[1.05] mb-6">
          What clients say <br />
          <span className="text-white/40">after the project ships.</span>
        </h1>
      </div>

      {reviews.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {reviews.map((r) => (
            <div key={r.name} className="p-6 md:p-8 rounded-2xl border border-white/5">
              <div className="flex gap-1 mb-4 text-teal">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="text-white/60 font-light leading-relaxed mb-4">"{r.quote}"</p>
              <div className="font-mono text-[11px] tracking-[0.15em] uppercase text-white/30">
                {r.name} · {r.business}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/5 p-10 md:p-16 text-center">
          <p className="text-white/40 font-light max-w-md mx-auto mb-2">
            Reviews from recent projects are on their way here.
          </p>
          <p className="text-sm text-white/25 font-light max-w-md mx-auto">
            In the meantime, take a look at the work itself, every project
            listed there is a live or delivered site.
          </p>
        </div>
      )}

      <div className="mt-16 md:mt-20 text-center">
        <a
          href="/#work"
          data-cursor="hover"
          className="group inline-flex items-center gap-2 rounded-full bg-teal/10 border border-teal/30 px-6 py-3 text-sm font-medium text-teal hover:bg-teal hover:text-black transition-all"
        >
          See the work
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </PageChrome>
  );
}
