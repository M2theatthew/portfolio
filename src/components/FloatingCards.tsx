import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface CardData {
  workId: string; // matches the project id in Work.tsx, e.g. '01'
  image: string;
  title: string;
  meta: string;
  width: number;
  height: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  rotY: number;
  rotX: number;
  delay: number;
}

// Cards are kept well outside the horizontal 30–70vw / vertical 15–85vh
// zone where the hero title, tagline, and metadata sit — they should
// frame that content, not sit behind it.
const cards: CardData[] = [
  // Far top left
  {
    workId: '02',
    image: '/images/work/church.jpg',
    title: 'FIRST BAPTIST CHURCH',
    meta: 'CHURCH · 3 PAGES',
    width: 210,
    height: 132,
    baseX: 4,
    baseY: 12,
    baseZ: -140,
    rotY: 22,
    rotX: -6,
    delay: 0,
  },
  // Far top right
  {
    workId: '01',
    image: '/images/work/empower.jpg',
    title: 'EMPOWER HONEA PATH',
    meta: 'NONPROFIT · 5 PAGES',
    width: 230,
    height: 144,
    baseX: 84,
    baseY: 14,
    baseZ: -100,
    rotY: -22,
    rotX: -4,
    delay: 0.15,
  },
  // Bottom center, below the tagline — clear of the other left-side cards
  {
    workId: '08',
    image: '/images/work/wifi-monitor.jpg',
    title: 'WIFI MONITOR',
    meta: 'TOOL · DESKTOP + WEB',
    width: 200,
    height: 126,
    baseX: 42,
    baseY: 84,
    baseZ: -60,
    rotY: 6,
    rotX: 3,
    delay: 0.3,
  },
  // Bottom left-of-center
  {
    workId: '09',
    image: '/images/work/local-crm.jpg',
    title: 'LIGHTWEIGHT LOCAL CRM',
    meta: 'TOOL · BUSINESS SUITE',
    width: 195,
    height: 122,
    baseX: 8,
    baseY: 82,
    baseZ: -180,
    rotY: 24,
    rotX: 8,
    delay: 0.45,
  },
  // Far bottom right
  {
    workId: '06',
    image: '/images/work/eoin-reardon.jpg',
    title: 'EOIN REARDON',
    meta: 'WOODWORK · SHOP',
    width: 215,
    height: 135,
    baseX: 82,
    baseY: 80,
    baseZ: -160,
    rotY: -24,
    rotX: 7,
    delay: 0.6,
  },
];

export default function FloatingCards() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let mx = 0;
    let my = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove);

    const animate = () => {
      cx += (mx - cx) * 0.04;
      cy += (my - cy) * 0.04;

      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const card = cards[i];
        const depth = (card.baseZ + 200) / 200; // 0..1, closer = higher
        const parX = cx * 30 * (1 - depth * 0.5);
        const parY = cy * 20 * (1 - depth * 0.5);
        const float = Math.sin(Date.now() * 0.0005 + i * 1.3) * 8;
        const floatX = Math.cos(Date.now() * 0.0004 + i * 0.9) * 5;

        el.style.transform = `
          translate3d(
            calc(${card.baseX}vw + ${parX}px + ${floatX}px),
            calc(${card.baseY}vh + ${parY}px + ${float}px),
            ${card.baseZ}px
          )
          rotateY(${card.rotY + cx * 4}deg)
          rotateX(${card.rotX - cy * 3}deg)
        `;
      });

      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={sceneRef} className="scene absolute inset-0 z-10 pointer-events-none hidden md:block">
      {cards.map((card, i) => (
        <button
          key={card.title}
          type="button"
          ref={(el) => { cardRefs.current[i] = el; }}
          onClick={() => navigate(`/#work-${card.workId}`)}
          data-cursor="hover"
          className="card-3d fade-in-only appearance-none bg-transparent border-0 p-0 m-0 text-left pointer-events-auto"
          style={{
            width: card.width,
            height: card.height,
            opacity: 0,
            animationDelay: `${card.delay + 0.5}s`,
            boxShadow: '0 30px 60px -20px rgba(0,0,0,0.8), 0 0 40px rgba(73,197,182,0.05)',
          }}
        >
          <img
            src={card.image}
            alt={card.title}
            loading="lazy"
            className="w-full h-full object-cover"
            style={{ filter: 'saturate(0.85) contrast(1.1) brightness(0.85)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-3 right-3">
            <div className="font-mono text-[9px] tracking-[0.2em] text-white/50 uppercase mb-0.5">
              {card.meta}
            </div>
            <div className="text-sm font-medium text-white/90 tracking-wide">
              {card.title}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
