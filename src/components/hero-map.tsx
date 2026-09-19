import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, QuadraticBezierLine, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { RotateCcw } from "lucide-react";
import { PinGlyph } from "@/components/pin-icon";
import { geoToMap, pinLayouts, type MappedProject, type PinLayout } from "@/lib/site-data";
import { cn } from "@/lib/utils";

type MapProps = {
  projects: MappedProject[];
  activeId: string;
  onSelect: (id: string) => void;
};

export function HeroMap(props: MapProps) {
  const [mounted, setMounted] = useState(false);
  const [webgl, setWebgl] = useState(true);
  // Which pin the camera is flown in on (null = the default overview). Driven
  // by pin clicks AND by activeId changes from elsewhere on the page (e.g. the
  // portfolio cards), so every way of selecting a project focuses the map.
  const [focusId, setFocusId] = useState<string | null>(null);
  // Tracks the last activeId we've already reacted to, seeded with the
  // initial value so the very first commit is a no-op. Comparing against a
  // stored VALUE (rather than consuming a one-shot boolean flag) keeps this
  // idempotent under React's development-mode StrictMode double-invoke of
  // effects on mount: re-running this effect a second time with the same
  // activeId just compares equal again and skips, instead of falling through
  // and flying the camera in on the initial default selection.
  const lastActiveId = useRef(props.activeId);
  useEffect(() => {
    if (props.activeId === lastActiveId.current) return;
    lastActiveId.current = props.activeId;
    setFocusId(props.activeId);
  }, [props.activeId]);
  const handleSelect = (id: string) => {
    if (id === focusId) {
      setFocusId(null); // clicking the focused pin again zooms back out
      return;
    }
    props.onSelect(id);
    setFocusId(id);
  };

  useLayoutEffect(() => {
    setMounted(true);
    try {
      const a = document.createElement("canvas");
      const gl2 = a.getContext("webgl2");
      if (gl2) {
        setWebgl(true);
        useGLTF.preload("/models/south-carolina.glb");
        return;
      }
      const b = document.createElement("canvas");
      const ok = Boolean(b.getContext("webgl"));
      setWebgl(ok);
      if (ok) useGLTF.preload("/models/south-carolina.glb");
    } catch {
      setWebgl(false);
    }
  }, []);

  if (!mounted) return <MapPlaceholder />;
  if (!webgl) return <FallbackMap {...props} />;

  return (
    <div className="relative h-full min-h-[22rem] w-full">
      <Suspense fallback={<MapPlaceholder />}>
        <Canvas
          className="h-full w-full touch-none"
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          // UPDATE (fix) — the previous [0.28, 0.5, 1.9] position put the
          // camera's polar angle (angle down from straight-overhead) at
          // ~75°: nearly edge-on/grazing to the terrain. The model is
          // basically a flat plate with only mild elevation relief, so
          // viewing it edge-on collapses its whole silhouette into a thin
          // horizontal sliver across the middle of the frame — the exact
          // "lying flat/tilted sideways" look being reported, just from the
          // opposite cause earlier updates assumed (they kept push the
          // angle further toward side-on, chasing a *different* "flat
          // tabletop" complaint, which overshot into this grazing view).
          //
          // Raising the Y component (holding X/Z, and therefore the
          // diagonal azimuth baked into the group rotation below, fixed)
          // lowers the polar angle back down to ~42°: a moderate
          // three-quarter aerial view where both the terrain's width and
          // its depth/relief are visible, so it reads as a standing,
          // dimensional landmass rather than a flat line. Do not touch X/Z
          // here to re-tilt — only Y controls this pitch; X/Z control the
          // left-right composition angle, which is unrelated to this bug.
          camera={{ position: [0.28, 2.1, 1.9], fov: 28, near: 0.1, far: 40 }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            // Was 1.55 — that plus the light intensities below blew the terrain
            // out to near-white. Matching the reference hero's darker, moodier
            // look just needed everything (exposure + lights) pulled down together.
            gl.toneMappingExposure = 1.05;
          }}
        >
          <Scene {...props} onSelect={handleSelect} focusId={focusId} />
        </Canvas>
      </Suspense>
      {focusId && (
        <button
          type="button"
          onClick={() => setFocusId(null)}
          // Sits above the project detail card in the top-right corner, right-
          // aligned with the card's edge. hero.tsx shifts this whole map right by
          // 22% of its width on lg+, so `right` adds that back (else the button
          // lands off-screen); `-top-2` lifts it into the gap between the header
          // and the card's top edge. Below lg there is no shift and the card is
          // at the bottom, so a plain top-right corner works.
          className="absolute top-4 right-4 z-50 flex items-center gap-1.5 rounded-full border border-white/15 bg-slate-950/70 px-3 py-1.5 font-sans lg:-top-2 lg:right-[calc(22%+1.5rem)] text-xs font-medium text-slate-200 backdrop-blur-md transition-colors hover:border-white/30 hover:text-white"
        >
          <RotateCcw className="size-3.5" />
          Reset view
        </button>
      )}
    </div>
  );
}

function Scene({ projects, activeId, onSelect, focusId }: MapProps & { focusId: string | null }) {
  const terrainRef = useRef<THREE.Group>(null);
  // Frame of reference the pins live in (for converting a pin to world space),
  // and the overview pose CoverFit last computed (what "reset" flies back to).
  const pinSpaceRef = useRef<THREE.Group>(null);
  const homeRef = useRef<HomePose | null>(null);
  const layouts = useMemo(() => pinLayouts(projects), [projects]);
  return (
    <>
      {/* Intensities roughly halved across the board (and exposure above dropped
          too) to match the darker, moodier reference — the old combination was
          washing the terrain out to near-white. */}
      <ambientLight intensity={0.22} />
      <hemisphereLight args={["#c8f4ec", "#0a0e12", 0.55]} />
      <directionalLight position={[2.8, 4.2, 1.6]} intensity={1.1} color="#f6fbf9" />
      <directionalLight position={[-3.2, 1.4, -1.1]} intensity={0.45} color="#3ecfc0" />
      <spotLight
        position={[0.1, 3.1, 1.6]}
        angle={0.62}
        penumbra={0.8}
        intensity={0.75}
        color="#c9eee8"
      />
      {/*
        Rotation order here matters:
        1. Inner group only converts the model's native Z-up axes (elevation on Z)
           into three.js's Y-up convention — this alone lays the map flat, facing up.
        2. Outer group then spins it around Y for the on-the-table composition.
           This was 0.5 rad (~29°), which put the state's long axis running
           almost horizontally across the frame. Swinging it to ~80° puts the
           long axis running mostly top-to-bottom instead, matching the more
           vertical/diagonal composition in the reference hero image — the pins
           ride along with the terrain since geoToMap's x/y feed straight into
           this same rotated hierarchy, so nothing needs to move independently.
           The X tilt is nudged slightly steeper too, for a bit more of the
           looking-down-at-a-map angle the reference has.

           UPDATE — the ~80° (1.4 rad) spin above was correct for the long-axis
           angle, but it left the compass backwards: the Upstate cluster (which
           should sit toward the NW / upper portion) was landing in the lower-
           left and the state read as flipped top-to-bottom ("upside down").
           Adding Math.PI spins it the other half-turn around the same axis —
           same diagonal composition/angle, opposite facing. If this overshoots
           (mirrors it the wrong way instead of fixing it), the other value to
           try is the original 1.4 rad combined with a Math.PI flip on the
           INNER group's Z instead — i.e. the two are opposite hypotheses for
           what "upside down" meant here, and only one is confirmable by eye.

           UPDATE 2 (superseded) — a further +Math.PI/2 "rotate left" pass
           landed close to 0° net spin, which still didn't match the
           reference (mountains-upper-left, coast-lower-right diagonal).

           UPDATE 3 — rather than guess again, this value was derived
           directly from the GLB's own vertex data instead of by eye:
           parsed the mesh's raw positions, filtered to up-facing vertices
           (mirroring the runtime wall-discard logic), and found where the
           real elevation gradient actually sits in the model's native
           space — the highest terrain (mountains) and lowest terrain
           (coastal lowland) centroids. Running those two points through
           this exact transform chain (inner conversion → outer rotation →
           camera view matrix) for every angle gives the actual on-screen
           mountain→lowland direction for each candidate rotation, so the
           angle below (≈147.75°) is the one that was solved to put the
           mountains upper-left and the lowland lower-right at roughly the
           same diagonal steepness as the reference image — not eyeballed.

           UPDATE 4 — that render came out upside down and needed another
           ~180° further left. Adding 180° to a Y-axis spin lands on the
           exact opposite side of the circle no matter which way "left" or
           "right" turns out to mean on screen, so this step doesn't depend
           on getting that direction right — 147.75° + 180° = 327.75°.

           UPDATE 5 — another ~90° further left on top of that: 327.75° +
           90° = 417.75°, i.e. 57.75° once wrapped past 360°. This one DOES
           depend on "add degrees = rotate left" being the right direction —
           that's the same direction used for the original 90°-left request
           (147.75° itself came from solving for composition, not from this
           convention, so it's only been exercised twice). If this instead
           turns out to have gone right, the fix is to subtract two 90°
           steps from the pre-this-update value instead: 327.75° - 180° =
           147.75° (back to the mountains-upper-left framing, unrotated by
           this and the previous 90° request).

           One caveat this analysis surfaced: the real elevation gradient in
           the GLB runs opposite to what `SC_BOUNDS`/`geoToMap` in
           site-data.ts assumes (that file's west→x=0/east→x=1 mapping
           looks like it was set from the model's bounding box without
           checking which physical end is actually higher terrain). That's
           a separate, pre-existing issue from the terrain's own rotation —
           it would affect where the project PINS land relative to the
           real terrain, not the terrain's own visual orientation fixed
           here — worth a look if pins ever seem to sit on the wrong part
           of the map.

           UPDATE 6 (fix) — the X/Z components added in step 2 above
           (-0.22 rad X, 0.06 rad Z, "for a bit more of the looking-down
           angle") were the actual bug behind two separate reports: the
           map reading as tilted/not level on load, and its bottom (south)
           edge getting clipped. After the inner group's Z-up→Y-up
           conversion the terrain is a flat, level plate — rotating that
           plate around X or Z (as opposed to Y) pitches/rolls it off
           level, so the terrain itself sits crooked in world space no
           matter how the camera looks at it, which reads on screen as
           "tilted." That same off-level plate also has a taller, more
           irregular axis-aligned world-space bounding box than a level
           one would (its corners now stick out further along a diagonal
           in a way a flat plate's don't), and Bounds' fit — sized off
           that box — under-frames that stuck-out corner, which is what
           was cropping the southern end. The "looking down at a map"
           angle is already fully handled by the camera's own position/
           polar angle (see the camera prop above and OrbitControls'
           min/maxPolarAngle below) — that's what a camera angle is for —
           so the mesh itself only needs the Y spin for compass/composition
           and should stay level on X/Z.
      */}
      <group position={[0.08, 0.02, 0]} rotation={[0, (377.75 * Math.PI) / 180, 0]}>
        {/* Uniform scale — the old [3.55, 3.55, 13.5] stretched elevation ~4x
            more than the map footprint, turning subtle terrain relief (and the
            model's wall thickness) into oversized spikes. */}
        <group rotation={[-Math.PI / 2, 0, 0]} scale={3.55}>
          <group ref={pinSpaceRef} position={[-0.5, -0.363, 0]}>
            {/*
              Bounds measures the terrain's actual world-space bounding box and
              moves/zooms the camera to fit it, with `margin` as breathing room.
              This replaces a hand-picked camera distance, which is why it was
              cropping in on Columbia before — any hard-coded distance only
              happens to work for one exact container size. `observe` re-fits
              if the hero's size changes (e.g. resizing the window).

              No `clip`: that prop pulls the camera's near/far planes in tight
              around the fitted box, and this terrain's mountain peaks sit
              physically closer to the camera than its flat footprint (that's
              what elevation relief IS) — with margin this tight, the near
              plane ended up slicing through the highest ridges. The result
              was a hard flat cut across the top of the terrain that read as
              a literal box edge, and losing that chunk of the silhouette is
              also what made the shape look wrong/unfamiliar. The Canvas's
              own near/far (0.1–40) already has generous slack, so dropping
              `clip` and letting Bounds only handle fit/zoom removes the whole
              failure mode. Margin nudged back up slightly too (1.05 → 1.2)
              for a bit more headroom around the peaks specifically, while
              still sitting well under the original 1.35.

              UPDATE — 1.2 was reading as too zoomed-out (lots of empty
              canvas around a small terrain). Lower margin = tighter/closer
              fit, so dropping it to 0.75 pulls the camera in noticeably.

              UPDATE 2 — asked for roughly "2 scroll-wheel notches" more
              zoom on top of that. A couple of OrbitControls' default zoom
              steps is a modest, not drastic, distance decrease, so margin
              is nudged down again from 0.75 to 0.55 rather than slashed to
              somewhere like 0.3. If it still isn't tight enough, keep
              lowering in similar small steps (0.45, 0.35, …) — and if it
              starts cropping the mountain peaks, that's the signal to stop
              and come back up slightly.
              UPDATE 3 — asked to fill more of the frame after the hero's
              map column started stretching to the row's full height
              (rather than a fixed rem cap) — more vertical canvas space
              alone didn't mean less dead air around the terrain, since
              Bounds re-fits to whatever aspect ratio it's given. Margin
              nudged down again, 0.55 → 0.4, continuing the same small-step
              approach as above.

              UPDATE 4 — 0.4 read as too zoomed-in on initial load. Asked
              for "about 3 scroll-wheel notches" out, in the opposite
              direction. Using the same ~0.1-per-notch rate established in
              UPDATE 2 (0.75 → 0.55 for "~2 notches"), 3 notches out is
              +0.3: 0.4 → 0.7.

              UPDATE 5 — asked for "about 2 scroll-wheel notches" back in.
              Same ~0.1-per-notch rate as above, in reverse: 0.7 → 0.5.

              UPDATE 6 — 0.5 was tuned against the terrain while it still had
              the stray X/Z tilt above (see that group's UPDATE 6 note), which
              gave it a larger, corner-stuck-out bounding box that this margin
              was implicitly compensating for — and still under-fit it enough
              to clip the southern edge. Now that the terrain is level, its
              box is smaller/more regular, so this needed a small bump (not a
              full reset back to an earlier, more-zoomed-out value) to keep a
              safety margin around every edge: 0.5 → 0.65.

              UPDATE 7 — asked for "about 2 scroll-wheel notches" in again.
              Same ~0.1-per-notch rate as UPDATE 2/5: 0.65 → 0.45.

              UPDATE 8 (superseded below) — Bounds + a fixed ZoomBoost
              factor (see that component's history, kept below for
              context) was always tuned against ONE specific window
              shape. That's fine as long as the frame's aspect ratio
              never changes, but it doesn't: going fullscreen, resizing
              the window, or just having a wider/shorter monitor changes
              the map column's own aspect ratio, and Bounds' fit is
              itself aspect-dependent (it satisfies whichever of
              width/height is the tighter constraint for the CURRENT
              frame, then letterboxes the other). A fixed multiplier on
              top of that only cancels the letterboxing for the aspect
              ratio it was measured against — a wider/shorter frame than
              that reintroduces empty bands on the sides or top/bottom,
              a taller/narrower one starts clipping the terrain instead.
              Replaced the whole Bounds+ZoomBoost pair with CoverFit
              below, which recomputes the fit from the live frame size
              on every resize instead of a one-time guess. */}
            <group ref={terrainRef}>
              <Terrain />
            </group>
            {/* CoverFit reads the terrain's actual world-space bounding
                box and this camera's fov/aspect, then — like CSS
                `object-fit: cover` on an image — sets the camera distance
                to whichever of "fit the width" / "fit the height" is
                SMALLER, so the terrain always fills the entire frame on
                every edge: one axis lands flush, the other intentionally
                bleeds past it (which axis bleeds depends on the current
                frame's shape, and flips automatically as that shape
                changes). `size` from useThree changes on every resize —
                including toggling fullscreen — so this effect re-runs and
                the fit stays correct at any window shape, instead of the
                old fixed-factor version only looking right at the one
                aspect ratio it happened to be tuned against. `margin`
                (<1 zooms in slightly past exact cover, matching the small
                intentional overscan the old ZoomBoost had) defaults to
                0.9; the CSS translate on this map's wrapper in hero.tsx
                then shifts that overscanned image sideways for
                composition (clearing the headline) without ever
                uncovering true empty space at the edges. */}
            {/* margin 1.0 → 0.9: about 2 scroll-wheel notches closer on load (one
                OrbitControls wheel notch scales the distance by 0.95, so two is ≈0.9). */}
            <CoverFit targetRef={terrainRef} margin={0.9} homeRef={homeRef} />
            <CameraFocus
              projects={projects}
              focusId={focusId}
              pinSpaceRef={pinSpaceRef}
              homeRef={homeRef}
            />
            <NetworkArcs projects={projects} />
            {projects.map((project) => (
              <ProjectPin
                key={project.id}
                project={project}
                active={project.id === activeId}
                onSelect={onSelect}
                layout={layouts[project.id]}
              />
            ))}
          </group>
        </group>
      </group>
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        autoRotate={false}
        // Explicit touch gesture mapping rather than leaving it to
        // three.js's defaults: one finger orbits the terrain, two fingers
        // pinch-zoom AND orbit together (DOLLY_ROTATE) so a two-finger
        // drag still reorients the view instead of only zooming — the
        // more natural gesture on a map. The Canvas above already sets
        // `touch-none` so the browser doesn't also try to scroll/zoom the
        // page underneath these gestures.
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE }}
        minPolarAngle={0.35}
        // Was 0.95, then 1.2 (~54°/~69°) — the default camera pitch above
        // is now pushed further too, so this ceiling is raised again to
        // stay above it and leave room to orbit further toward vertical.
        maxPolarAngle={1.4}
        // Was 1.2. CoverFit above dollies the camera in closer than a
        // plain "contain" fit on purpose, to fill the frame (see its
        // comment) — with the old floor still at 1.2, OrbitControls' own
        // update() (which CoverFit also calls, to apply the move) would
        // just clamp that closer distance straight back out to 1.2,
        // silently undoing the fit.
        // Lowered enough to give that closer distance room; only a floor
        // on how far the user can additionally scroll in by hand from
        // there, so raising it doesn't affect the initial framing itself.
        minDistance={0.5}
        maxDistance={14}
      />
    </>
  );
}

/**
 * Runs once, after Bounds has already fit the camera to the terrain, and
 * dollies it in further by `factor` (< 1 moves closer) — see the comment
 * where this is used for why this exists as its own step rather than a
 * smaller `margin`. The rAF delay (plus waiting a tick) is because Bounds
 * performs its own fit in an effect on mount; without ceding a turn first,
 * this can run before that fit lands and end up boosting the pre-fit
 * (default) camera position instead of the fitted one.
 *
 * This used to also take a `verticalShift` to pan the framing after the
 * zoom (moving camera + target together by world Y). That didn't hold up
 * in practice — enableDamping means OrbitControls re-derives the camera
 * from its own internal spherical state every frame, which can fight a
 * one-off external position nudge like that — so on-screen positioning of
 * the whole map now lives as a plain CSS transform on its wrapper in
 * hero.tsx instead, which just moves the rendered pixels directly with
 * no such fight.
 */
function ZoomBoost({ factor }: { factor: number }) {
  const camera = useThree((state) => state.camera);
  const controls = useThree(
    (state) => state.controls as unknown as { target: THREE.Vector3; update: () => void } | null,
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (!controls) return;
      camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target);
      camera.updateProjectionMatrix();
      controls.update();
    });
    return () => cancelAnimationFrame(id);
  }, [camera, controls, factor]);

  return null;
}

/**
 * Dynamic, aspect-ratio-aware replacement for the old Bounds+ZoomBoost
 * pair above (kept, unused, for its comment history). Measures
 * `targetRef`'s world-space bounding box, projects its corners onto this
 * camera's ACTUAL on-screen right/up axes (see the in-function comment —
 * this camera looks at the terrain from an oblique angle, so the box's
 * raw world X/Y are not what's horizontal/vertical on screen; an earlier
 * version of this used them directly and that mismatch is what caused
 * the extreme, filling-the-whole-frame-with-no-terrain-shape zoom bug),
 * then for the CURRENT frame size/fov computes the camera distance that
 * would exactly fit those real half-extents on width alone (`distH`) and
 * height alone (`distV`):
 *
 *   distV = halfHeight / tan(fov / 2)
 *   distH = halfWidth  / tan(fov / 2) / aspect
 *
 * Bounds' own "contain" fit effectively uses `max(distV, distH)` — far
 * enough back that BOTH axes fit, which is exactly what leaves the other
 * axis letterboxed whenever the frame's aspect doesn't match the
 * object's. This uses `min(distV, distH)` instead — a "cover" fit, the
 * same idea as CSS `object-fit: cover` — which moves the camera only as
 * close as whichever axis is easier to satisfy, so that axis lands flush
 * with the frame and the other axis (now too close to fully contain)
 * bleeds past the edges instead of leaving a gap. Which axis binds — and
 * how much the other bleeds — depends on the live aspect ratio, so this
 * self-corrects at any window shape instead of needing a re-tuned
 * constant per shape.
 *
 * Runs once on mount (after a tick, so the terrain's own effects/refs
 * have settled) and again every time `size` changes — R3F updates `size`
 * on every canvas resize, fullscreen toggle included — so the fit never
 * goes stale. Sets both camera position AND OrbitControls' target in the
 * same pass (rather than nudging position alone) so the result becomes
 * what OrbitControls treats as its own authoritative state afterward,
 * instead of a one-off value its per-frame damping update could
 * overwrite — the same failure mode the old ZoomBoost's comment above
 * describes for a bare position nudge.
 */
function CoverFit({
  targetRef,
  margin = 0.9,
  homeRef,
}: {
  targetRef: RefObject<THREE.Object3D | null>;
  margin?: number;
  homeRef?: RefObject<HomePose | null>;
}) {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const size = useThree((state) => state.size);
  const controls = useThree(
    (state) => state.controls as unknown as { target: THREE.Vector3; update: () => void } | null,
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const object = targetRef.current;
      if (!object || !controls) return;

      const box = new THREE.Box3().setFromObject(object);
      if (box.isEmpty()) return;
      const center = box.getCenter(new THREE.Vector3());

      // Preserve the hand-tuned viewing angle: stay on the same ray from
      // the target through the camera's current position, only changing
      // how far along that ray the camera sits. Falls back to the
      // camera's own starting position on the very first run, before
      // OrbitControls has set a target yet (target defaults to origin,
      // which would otherwise make this a zero-length vector).
      const direction = camera.position.clone().sub(controls.target);
      if (direction.lengthSq() === 0) direction.copy(camera.position);
      if (direction.lengthSq() === 0) direction.set(0, 1, 1);
      direction.normalize();

      // Orient a scratch camera pose along that same ray so we can read
      // off its REAL right/up axes for this fit. Using the box's raw
      // world-space X/Y here (as an earlier version of this did) is only
      // correct if the camera looks straight down an axis — this one
      // looks at the terrain from an oblique angle, so world X/Y don't
      // line up with what's actually horizontal/vertical on screen. Get
      // it wrong and the "half-extent" numbers below can come out far
      // smaller than the terrain's true on-screen size, which is exactly
      // what drove the camera absurdly close in the first version of
      // this fit (the very-zoomed-in, filling-the-whole-frame bug).
      camera.position.copy(center).addScaledVector(direction, 1);
      camera.up.set(0, 1, 0);
      camera.lookAt(center);
      camera.updateMatrixWorld(true);
      const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0).normalize();
      const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1).normalize();

      // Project every corner of the world-space bounding box onto those
      // two real screen axes (relative to the box's center) and take the
      // largest swing on each — the actual half-width/half-height this
      // camera angle sees, not the box's raw axis-aligned dimensions.
      let halfWidth = 0;
      let halfHeight = 0;
      for (let i = 0; i < 8; i++) {
        const corner = new THREE.Vector3(
          i & 1 ? box.max.x : box.min.x,
          i & 2 ? box.max.y : box.min.y,
          i & 4 ? box.max.z : box.min.z,
        ).sub(center);
        halfWidth = Math.max(halfWidth, Math.abs(corner.dot(right)));
        halfHeight = Math.max(halfHeight, Math.abs(corner.dot(up)));
      }

      // Same cover-fit logic as before (min of the per-axis distances,
      // so whichever axis is easier to satisfy lands flush and the other
      // bleeds past the frame) — just fed correct, camera-relative
      // half-extents this time.
      const aspect = size.width / size.height;
      const fovRad = (camera.fov * Math.PI) / 180;
      const distV = halfHeight / Math.tan(fovRad / 2);
      const distH = halfWidth / (Math.tan(fovRad / 2) * aspect);
      const distance = Math.max(Math.min(distV, distH) * margin, 0.01);

      camera.position.copy(center).addScaledVector(direction, distance);
      camera.lookAt(center);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld(true);
      controls.target.copy(center);
      controls.update();
      if (homeRef) homeRef.current = { target: center.clone(), distance };
    });
    return () => cancelAnimationFrame(id);
  }, [camera, controls, targetRef, margin, homeRef, size.width, size.height]);

  return null;
}

type HomePose = { target: THREE.Vector3; distance: number };

/** How close the camera flies in on a pin, as a fraction of the overview distance. */
const FOCUS_ZOOM = 0.4;
/** Fly speed — higher settles faster (roughly 1/this seconds to cover most of the move). */
const FOCUS_SPEED = 3.2;

/**
 * Flies the camera to `focusId`'s pin (or back to the overview when null).
 * Only the orbit TARGET and DISTANCE are animated; the viewing direction the
 * user currently has is kept, so it zooms in on the pin without snapping the
 * angle. Moves are applied through OrbitControls' own target/update() like
 * CoverFit does, so damping doesn't fight them, and grabbing the map (drag or
 * scroll) cancels an in-flight move so the user is never fought either.
 */
function CameraFocus({
  projects,
  focusId,
  pinSpaceRef,
  homeRef,
}: {
  projects: MappedProject[];
  focusId: string | null;
  pinSpaceRef: RefObject<THREE.Object3D | null>;
  homeRef: RefObject<HomePose | null>;
}) {
  const { scene } = useGLTF("/models/south-carolina.glb");
  const camera = useThree((state) => state.camera);
  const controls = useThree(
    (state) =>
      state.controls as unknown as
        | (THREE.EventDispatcher<{ start: object }> & {
            target: THREE.Vector3;
            update: () => void;
          })
        | null,
  );
  const goal = useRef<{ target: THREE.Vector3; distance: number; dir: THREE.Vector3 } | null>(null);
  const hasFocused = useRef(false);

  useEffect(() => {
    if (!controls) return;
    const cancel = () => {
      goal.current = null;
    };
    controls.addEventListener("start", cancel);
    return () => controls.removeEventListener("start", cancel);
  }, [controls]);

  useEffect(() => {
    if (!controls) return;
    const home = homeRef.current;
    if (!home) return; // CoverFit hasn't fit yet — nothing to fly relative to
    let target: THREE.Vector3;
    let distance: number;

    if (focusId) {
      const project = projects.find((p) => p.id === focusId);
      const space = pinSpaceRef.current;
      if (!project || !space) return;
      const [x, y] = geoToMap(project.lat, project.lng);
      space.updateWorldMatrix(true, false);
      target = space.localToWorld(new THREE.Vector3(x, y, sampleHeight(scene, x, y)));
      distance = Math.max(home.distance * FOCUS_ZOOM, 0.6);
      hasFocused.current = true;
    } else {
      if (!hasFocused.current) return; // still at the initial overview
      target = home.target.clone();
      distance = home.distance;
    }

    const dir = camera.position.clone().sub(controls.target).normalize();
    goal.current = { target, distance, dir };
  }, [focusId, projects, scene, camera, controls, homeRef, pinSpaceRef]);

  useFrame((_, delta) => {
    const g = goal.current;
    if (!g || !controls) return;
    const k = 1 - Math.exp(-delta * FOCUS_SPEED);
    const currentDistance = camera.position.distanceTo(controls.target);
    const nextDistance = currentDistance + (g.distance - currentDistance) * k;
    controls.target.lerp(g.target, k);
    camera.position.copy(controls.target).addScaledVector(g.dir, nextDistance);
    controls.update();
    if (
      controls.target.distanceTo(g.target) < 0.002 &&
      Math.abs(nextDistance - g.distance) < 0.004
    ) {
      goal.current = null;
    }
  });

  return null;
}

function Terrain() {
  const { scene } = useGLTF("/models/south-carolina.glb");
  const cloned = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    cloned.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const material = mesh.material;
      if (Array.isArray(material)) return;
      if (!(material instanceof THREE.MeshStandardMaterial)) return;

      if (material.map) {
        // The textured top surface — the part we actually want to see.
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        material.roughness = 0.68;
        material.metalness = 0.02;
        // Was (1.85, 1.95, 1.78) — those >1 channel values push the surface
        // toward blown-out white once combined with the tone mapping/exposure.
        // Toned down alongside the exposure/light drops above.
        material.color = new THREE.Color(1.15, 1.2, 1.1);
        material.emissive = new THREE.Color("#16352e");
        material.emissiveIntensity = 0.35;
        material.envMapIntensity = 0.5;

        // The glb ships with NO authored NORMAL attribute on any primitive
        // (confirmed by inspecting the file directly) — three.js's loader
        // responds to that by flipping the material to flatShading and
        // deriving normals per-fragment from screen-space derivatives
        // instead of a vertex attribute. That's exactly why the discard
        // below silently killed the *entire* surface the first time: reading
        // the vertex `normal` attribute in a custom shader chunk when no
        // such attribute is bound just returns (0,0,0), so every fragment
        // failed the "facing up" test. Computing real vertex normals here
        // fixes both problems in one shot — smooth lighting instead of the
        // flat-shaded look, and a normal attribute our discard can actually
        // read.
        mesh.geometry.computeVertexNormals();
        material.flatShading = false;

        // This primitive's own name ("terrain_with_walls") gives it away: the
        // sloped drop-off walls under the state are baked into the SAME mesh
        // and material as the top surface. `mesh.visible = false` in the else
        // branch below only hides the *separate* untextured wall/base meshes
        // — it can't touch these faces since they share this material. A
        // fragment-shader discard based on the vertex normal is what actually
        // removes them: keep faces whose normal still points mostly "up" (the
        // terrain), drop anything steeper than that (the walls), so only the
        // floating top surface renders no matter which way the camera or
        // model is turned. 0.55 is a starting point — raise it to shave more
        // of the sloped edge off, lower it to keep more.
        material.onBeforeCompile = (shader) => {
          shader.vertexShader = shader.vertexShader
            .replace("#include <common>", "varying float vUpFacing;\n#include <common>")
            .replace(
              "#include <beginnormal_vertex>",
              "#include <beginnormal_vertex>\nvUpFacing = objectNormal.z;",
            );
          shader.fragmentShader = shader.fragmentShader
            .replace("#include <common>", "varying float vUpFacing;\n#include <common>")
            .replace(
              "#include <dithering_fragment>",
              "if (vUpFacing < 0.55) discard;\n#include <dithering_fragment>",
            );
        };
        material.needsUpdate = true;
      } else {
        // The model's own baked-in vertical walls + base cap (the solid
        // "bounding box" under the terrain). `visible = false` removes them
        // from rendering entirely — more definitive than opacity alone — so
        // the terrain surface floats and blends into the page background.
        mesh.visible = false;
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        material.transparent = true;
        material.opacity = 0;
        material.depthWrite = false;
      }
    });
  }, [cloned]);

  return <primitive object={cloned} />;
}

/**
 * Faint glowing constellation lines between nearby pins, matching the
 * reference hero's "tech network" look. Each pin connects to its 2 closest
 * neighbours (rather than every pin under a flat distance cutoff) so the
 * result reads as a loose web instead of a solid mesh once the tight
 * Upstate cluster and the couple of far-flung pins (Columbia, Charleston)
 * are both in play.
 */
function NetworkArcs({ projects }: { projects: MappedProject[] }) {
  const { scene } = useGLTF("/models/south-carolina.glb");

  const points = useMemo(
    () =>
      projects.map((project) => {
        const [x, y] = geoToMap(project.lat, project.lng);
        const z = sampleHeight(scene, x, y);
        return new THREE.Vector3(x, y, z + 0.014);
      }),
    [scene, projects],
  );

  const links = useMemo(() => {
    const edges = new Set<string>();
    const pairs: Array<{ a: THREE.Vector3; b: THREE.Vector3; mid: THREE.Vector3 }> = [];

    points.forEach((point, i) => {
      const distances = points
        .map((other, j) => ({ j, dist: i === j ? Infinity : point.distanceTo(other) }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 2);

      distances.forEach(({ j, dist }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (edges.has(key)) return;
        edges.add(key);
        const mid = point.clone().lerp(points[j], 0.5);
        // Lift the midpoint so the line arcs up over the terrain rather
        // than clipping through it, more for longer links.
        mid.z += 0.03 + dist * 0.22;
        pairs.push({ a: point, b: points[j], mid });
      });
    });

    return pairs;
  }, [points]);

  return (
    <>
      {links.map((link, i) => (
        <QuadraticBezierLine
          key={i}
          start={link.a}
          end={link.b}
          mid={link.mid}
          color="#3ecfc0"
          lineWidth={1}
          transparent
          opacity={0.25}
          dashed
          dashSize={0.014}
          gapSize={0.012}
        />
      ))}
    </>
  );
}

// One shared soft radial-gradient sprite texture (white → transparent). Tinted
// per pin through the SpriteMaterial's `color`, so teal/amber pins reuse it.
// Pixels from the orb's centre up to the tile's centre (tile is 32px tall, so
// this leaves a ~14px gap between the tile's bottom edge and the orb).
const TILE_LIFT_PX = 34;

let glowTexture: THREE.CanvasTexture | null = null;
function getGlowTexture() {
  if (glowTexture) return glowTexture;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.18, "rgba(255,255,255,0.75)");
  g.addColorStop(0.45, "rgba(255,255,255,0.22)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  glowTexture = new THREE.CanvasTexture(canvas);
  glowTexture.colorSpace = THREE.SRGBColorSpace;
  return glowTexture;
}

function ProjectPin({
  project,
  active,
  onSelect,
  layout,
}: {
  project: MappedProject;
  active: boolean;
  onSelect: (id: string) => void;
  layout?: PinLayout;
}) {
  // Projects that share a town keep their orbs at the true spot but fan their
  // icon tiles out sideways (see pinLayouts in site-data.ts).
  const dx = layout?.dx ?? 0;
  const clustered = layout?.clustered ?? false;
  const TETHER_REST_PX = TILE_LIFT_PX - 16 - 4;
  const tetherLength = Math.hypot(dx, TETHER_REST_PX);
  const tetherAngle = (Math.atan2(dx, TETHER_REST_PX) * 180) / Math.PI;
  const [x, y] = geoToMap(project.lat, project.lng);
  const amber = project.tone === "amber";
  // `color` is the glow/tint; `core` is the near-white hot centre of the orb.
  const color = amber ? "#f0a24f" : "#3ecfc0";
  const core = amber ? "#fff2dc" : "#dffffa";
  const group = useRef<THREE.Group>(null);
  const pulse = useRef<THREE.Mesh>(null);
  const scaleTarget = useRef(new THREE.Vector3(1, 1, 1));
  const { scene } = useGLTF("/models/south-carolina.glb");
  const height = useMemo(() => sampleHeight(scene, x, y), [scene, x, y]);
  const glowMap = useMemo(() => getGlowTexture(), []);
  // Labels stay gated to the active/hovered pin so the tight Upstate cluster
  // doesn't stack a pile of names on top of each other.
  const [hovered, setHovered] = useState(false);
  const showLabel = active || hovered;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (pulse.current) {
      const wave = (t % 1.8) / 1.8;
      pulse.current.scale.setScalar(1 + wave * 1.6);
      const mat = pulse.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (1 - wave) * (active ? 0.5 : 0.28);
    }
    if (group.current) {
      scaleTarget.current.setScalar(active ? 1.12 : 1);
      group.current.scale.lerp(scaleTarget.current, 0.12);
    }
  });

  const select = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    onSelect(project.id);
  };

  return (
    <group ref={group} position={[x, y, height + 0.01]}>
      {/* Ground node: a glowing orb with a white-hot core and a soft tinted
          bloom (additive sprite), replacing the old flat dot + ring. The
          sprite ignores depth so the bloom is never sliced by the terrain
          it sits on; toneMapped={false} keeps the colors literal. */}
      <sprite
        position={[0, 0, 0.014]}
        scale={[active ? 0.062 : 0.052, active ? 0.062 : 0.052, 1]}
        renderOrder={10}
      >
        <spriteMaterial
          map={glowMap}
          color={color}
          transparent
          opacity={active ? 1 : 0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
        />
      </sprite>
      <mesh ref={pulse} position={[0, 0, 0.004]}>
        <ringGeometry args={[0.0035, 0.0052, 40]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh
        position={[0, 0, 0.014]}
        onClick={select}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
          setHovered(true);
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
          setHovered(false);
        }}
      >
        <sphereGeometry args={[0.0042, 16, 16]} />
        <meshBasicMaterial color={core} toneMapped={false} />
      </mesh>
      <pointLight
        position={[0, 0, 0.02]}
        color={color}
        intensity={active ? 0.22 : 0.12}
        distance={0.14}
      />
      {/* Icon tile: translucent tinted-glass rounded square with a pale glyph.
          The Html is anchored to the orb's OWN position (not a 3D point
          floating above it) and the tile is lifted with a fixed CSS pixel
          offset. Anchoring in 3D above the pin let perspective from the
          tilted camera slide the tile sideways off its orb; a screen-space
          lift keeps it dead-centred over the orb at any orbit angle or zoom.
          A short faint tether bridges the gap. The city label (active/hover
          only) is plain white type with a soft shadow beside the tile. */}
      <Html
        position={[0, 0, 0.014]}
        center
        sprite
        zIndexRange={[30, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div
          className="relative"
          style={{ transform: `translate(${dx}px, -${TILE_LIFT_PX}px)`, pointerEvents: "auto" }}
        >
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={select}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            aria-pressed={active}
            aria-label={`${project.city}: ${project.name}`}
            style={{
              boxShadow: `0 0 ${active ? 22 : 16}px ${color}${active ? "66" : "40"}, inset 0 1px 0 rgb(255 255 255 / 0.14)`,
              background: `linear-gradient(160deg, ${color}${active ? "55" : "3d"} 0%, ${color}1f 100%)`,
              borderColor: `${color}${active ? "8c" : "47"}`,
            }}
            className={cn(
              "flex size-8 items-center justify-center rounded-[10px] border backdrop-blur-md transition-transform duration-150",
              active ? "scale-110" : "hover:scale-105",
            )}
          >
            <PinGlyph
              name={project.icon}
              solid
              className={cn(
                "size-[17px] drop-shadow-[0_0_4px_rgb(255_255_255_/_0.35)]",
                amber ? "text-[#fff3e0]" : "text-[#eafffb]",
              )}
            />
          </button>
          <span
            aria-hidden
            className="pointer-events-none absolute top-full left-1/2 w-px -translate-x-1/2"
            style={{
              height: tetherLength,
              transformOrigin: "50% 0",
              transform: `rotate(${tetherAngle}deg)`,
              background: `linear-gradient(to bottom, ${color}99, ${color}00)`,
            }}
          />
          {showLabel &&
            (clustered ? (
              // Neighbours sit on both sides of a clustered tile, so its label
              // goes above it and names the project (the town is the same for all).
              <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 font-sans text-[11px] font-semibold tracking-wide whitespace-nowrap text-white uppercase [text-shadow:0_1px_3px_rgb(0_0_0_/_0.9),0_0_8px_rgb(0_0_0_/_0.7)]">
                {project.name}
              </span>
            ) : (
              <span className="pointer-events-none absolute top-1/2 left-full ml-2 -translate-y-1/2 font-sans text-[11px] font-semibold tracking-wide whitespace-nowrap text-white uppercase [text-shadow:0_1px_3px_rgb(0_0_0_/_0.9),0_0_8px_rgb(0_0_0_/_0.7)]">
                {project.name}
              </span>
            ))}
        </div>
      </Html>
    </group>
  );
}

function sampleHeight(root: THREE.Object3D, x: number, y: number) {
  const raycaster = new THREE.Raycaster();
  raycaster.set(new THREE.Vector3(x, y, 0.5), new THREE.Vector3(0, 0, -1));
  const hits = raycaster.intersectObject(root, true);
  return hits[0]?.point.z ?? 0.02;
}

function MapPlaceholder() {
  return (
    <div className="relative flex h-full min-h-[22rem] w-full items-center justify-center">
      <img
        src="/textures/sc-terrain.png"
        alt=""
        className="h-[78%] w-[78%] object-contain opacity-70"
      />
    </div>
  );
}

function FallbackMap({ projects, activeId, onSelect }: MapProps) {
  const layouts = pinLayouts(projects);
  return (
    <div className="relative h-full min-h-[22rem] w-full overflow-hidden">
      <img
        src="/textures/sc-terrain.png"
        alt="Topographic map of South Carolina"
        className="h-full w-full object-contain"
      />
      {projects.map((project) => {
        const [x, y] = geoToMap(project.lat, project.lng);
        const layout = layouts[project.id];
        const active = project.id === activeId;
        return (
          <button
            key={project.id}
            type="button"
            onClick={() => onSelect(project.id)}
            className="absolute flex -translate-x-1/2 translate-y-1/2 items-center gap-1.5"
            style={{
              left: `${x * 100}%`,
              bottom: `${(y / 0.72622478) * 100}%`,
              marginLeft: layout?.dx ?? 0,
            }}
            aria-pressed={active}
            aria-label={`${project.city}: ${project.name}`}
          >
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-xl border p-1.5 backdrop-blur-md",
                project.tone === "amber"
                  ? "border-amber/40 bg-[#2a1f10]/70 text-amber"
                  : "border-[#3ecfc0]/40 bg-[#102a2a]/70 text-teal",
              )}
            >
              <PinGlyph name={project.icon} className="size-4" />
            </span>
            {(!layout?.clustered || active) && (
              <span className="font-sans text-xs font-medium whitespace-nowrap text-slate-200 uppercase [text-shadow:0_1px_3px_rgb(0_0_0_/_0.8)]">
                {project.name}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
