import { ReactNode } from 'react';
import SceneCanvas from '@/components/SceneCanvas';
import PillboxNav from '@/components/PillboxNav';

// Shared shell for the standalone pages (Get in Touch / Services / Reviews)
// so they carry the same atmosphere as the homepage without re-mounting the
// heavy 3D globe scene.
export default function PageChrome({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <SceneCanvas />
      <PillboxNav />
      <main id="main-content" className="relative z-30 pt-32 pb-24 px-6 md:px-10">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
