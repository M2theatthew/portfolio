import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: string;
  title: string;
  category: string;
  detail: string;
}

const projects: Project[] = [
  { id: '01', title: "Empower Honea Path", category: 'Nonprofit', detail: '5 pages' },
  { id: '02', title: 'Honea Path First Baptist', category: 'Church', detail: '3 pages' },
  { id: '08', title: 'WiFi Monitor', category: 'Tool', detail: 'Desktop + Web' },
  { id: '04', title: 'The Melt Pizzeria', category: 'Restaurant', detail: 'Live site' },
  { id: '09', title: 'Lightweight Local CRM', category: 'Tool', detail: 'Business Suite' },
  { id: '06', title: 'Eoin Reardon', category: 'Craft', detail: 'Live site' },
];

export default function ProjectList() {
  const [active, setActive] = useState('01');
  const navigate = useNavigate();

  return (
    <div
      className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 z-20 hidden md:block fade-up"
      style={{ animationDelay: '1.2s', opacity: 0 }}
    >
      <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/25 mb-5">
        / Work
      </div>
      <div className="flex flex-col gap-3">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setActive(p.id);
              navigate(`/#work-${p.id}`);
            }}
            data-cursor="hover"
            className={`project-item text-left group ${active === p.id ? 'active' : 'text-white/40 hover:text-white/70'}`}
          >
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[10px] text-white/20 tabular-nums">
                {p.id}
              </span>
              <div>
                <div className="text-sm font-medium tracking-wide transition-colors">
                  {p.title}
                </div>
                <div className="font-mono text-[9px] tracking-wider uppercase text-white/20 mt-0.5">
                  {p.category} · {p.detail}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
