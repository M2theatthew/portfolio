import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { getEffectsTier } from '@/lib/effectsTier';

// Path to your model — drop your .glb file in /public/models/ and update
// this if you name it something other than "centerpiece.glb".
const MODEL_PATH = '/models/centerpiece.glb';

export default function Centerpiece3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  const [progress, setProgress] = useState(0);
  // Mobile has no cursor to hint "this is draggable" via hover, so we show
  // a brief coach-mark instead — dismissed on first touch or after a few
  // seconds, and never shown again once the visitor has touched the globe.
  const [showTouchHint, setShowTouchHint] = useState(false);

  useEffect(() => {
    const container = containerRef.current!;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      35,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    // Close, "hero fills the frame" default — pulled in tighter than a
    // standard product-shot framing so the globe reads as an immersive
    // backdrop rather than an object floating in space on first paint.
    camera.position.set(0, 0.8, 3.4);

    const renderer = new THREE.WebGLRenderer({
      // MSAA cost scales with sample count x pixel count, and this scene
      // already has two soft transparent shells (cloud + atmosphere) doing
      // most of the edge-softening work visually — antialiasing on top of
      // that was paying twice for the same effect. Turned off; the globe's
      // silhouette is a sphere, so aliasing there is barely perceptible.
      antialias: false,
      alpha: true, // transparent so it composites over SceneCanvas's gradient background
      powerPreference: 'high-performance',
    });
    // Capped by device tier — see effectsTier.ts. On integrated-GPU
    // laptops (most MacBooks) this scene's fragment cost is the actual
    // bottleneck, and it scales with the *square* of pixel ratio, so
    // dropping a tier here buys back real headroom.
    const tier = getEffectsTier();
    const pixelRatioCap = tier === 'low' ? 1 : tier === 'mid' ? 1.5 : 2;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatioCap));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Lighting — tuned for an outdoor/landscape asset
    const hemi = new THREE.HemisphereLight(0x8fd8ff, 0x1a1410, 0.9);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff2d9, 1.6);
    sun.position.set(5, 8, 4);
    scene.add(sun);

    const fillTeal = new THREE.PointLight(0x49c5b6, 1.2, 20);
    fillTeal.position.set(-4, 1, 3);
    scene.add(fillTeal);

    const fillCoral = new THREE.PointLight(0xff3d6e, 0.8, 20);
    fillCoral.position.set(4, -1, -3);
    scene.add(fillCoral);

    let model: THREE.Object3D | null = null;
    let cloudMesh: THREE.Mesh | null = null;

    // --- Orient the globe toward the visitor's approximate location ---
    // Uses IP-based geolocation (no browser permission prompt, unlike
    // navigator.geolocation) so it can run silently on page load. Falls
    // back to Anderson/Honea Path, SC — home turf — if the lookup fails,
    // is blocked by an ad-blocker, or simply doesn't resolve before the
    // model is ready.
    const FALLBACK_LATLON = { lat: 34.5034, lon: -82.6501 };
    let targetLatLon = FALLBACK_LATLON;

    let reorientTarget: number | null = null; // set once a late geo fix arrives after first paint
    let userInteracted = false;

    const geoController = new AbortController();
    const geoTimeout = setTimeout(() => geoController.abort(), 2500);
    fetch('https://get.geojs.io/v1/ip/geo.json', { signal: geoController.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => {
        const lat = parseFloat(data?.latitude);
        const lon = parseFloat(data?.longitude);
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          targetLatLon = { lat, lon };
          // If the model already rendered (with the SC fallback) before
          // this resolved, ease it over to the real location instead of
          // snapping — but only if the visitor hasn't grabbed the globe.
          if (model && !userInteracted) {
            reorientTarget = rotationForLatLon(lat, lon);
          }
        }
      })
      .catch(() => {
        // Silent fallback — the SC default is already set.
      })
      .finally(() => clearTimeout(geoTimeout));

    // Converts lat/lon (degrees) to the Y-axis rotation that brings that
    // point on this model's earth_color.jpg to face the camera (+Z).
    // Note: the textbook equirectangular formula uses theta = lon + 180,
    // but that put a US east-coast visitor facing East Asia instead — this
    // particular texture's prime meridian is offset 180° from the usual
    // convention, so the +180 is dropped here to compensate.
    const rotationForLatLon = (lat: number, lon: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = lon * (Math.PI / 180);
      const x = -Math.sin(phi) * Math.cos(theta);
      const z = Math.sin(phi) * Math.sin(theta);
      return -Math.atan2(x, z);
    };

    // The cloud alpha map is high-contrast (near black/white), so the
    // sampling error every equirectangular sphere has at its poles — the
    // texture's top and bottom rows collapse to a single point, so
    // triangles meeting there each sample a thin wedge of pixels — shows up
    // as an obvious fan/pinwheel there. It's not visible on the softer
    // photographic surface map, just this one. Rather than rotating the
    // globe to hide it (which also rotates the correct geolocation-based
    // framing away), pre-fade the texture's own top/bottom strips toward
    // black before it ever reaches the GPU — no detail left there to
    // produce the wedge pattern, and it doesn't touch orientation at all.
    // Takes the material directly (rather than returning a texture) because
    // the texture can't exist — safely — until the image has loaded. A
    // CanvasTexture marks itself needsUpdate=true the instant it's
    // constructed, and the render loop is already running at that point, so
    // if we build it against a not-yet-sized canvas it gets uploaded to the
    // GPU once at the default blank 300x150 size. Resizing that same canvas
    // later (canvas.width = img.width, etc.) then corrupts the GPU texture —
    // Chrome's fast canvas-copy path reuses the old allocation and overflows
    // it, which is what "no image data found" / glCopySubTextureCHROMIUM
    // offset errors are. Building the canvas at its final size and only then
    // constructing the CanvasTexture avoids the resize-after-upload entirely.
    const loadCloudAlphaWithFadedPoles = (path: string, material: THREE.MeshStandardMaterial) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        // Fade each pole's top/bottom strip to black (= transparent, once
        // used as an alpha map) with a soft gradient rather than a hard
        // cutoff, so it blends into the surrounding cloud cover instead of
        // reading as a band.
        const fadeFrac = 0.08; // fraction of image height faded at each pole
        const fadeH = Math.round(img.height * fadeFrac);

        const top = ctx.createLinearGradient(0, 0, 0, fadeH);
        top.addColorStop(0, 'rgba(0,0,0,1)');
        top.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = top;
        ctx.fillRect(0, 0, img.width, fadeH);

        const bottom = ctx.createLinearGradient(0, img.height - fadeH, 0, img.height);
        bottom.addColorStop(0, 'rgba(0,0,0,0)');
        bottom.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.fillStyle = bottom;
        ctx.fillRect(0, img.height - fadeH, img.width, fadeH);

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.NoColorSpace;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        texture.flipY = false;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;

        material.alphaMap = texture;
        material.needsUpdate = true;
      };
      // Without this, a failed load (bad path, CDN hiccup, CSP block) leaves
      // the mesh permanently without an alpha map and zero console output —
      // it just silently reads as fully transparent with no trail to
      // follow. Surface it loudly instead.
      img.onerror = (err) => {
        console.error(`[Centerpiece3D] cloud alpha map failed to load: ${path}`, err);
      };
      img.src = path;
    };

    const texLoader = new THREE.TextureLoader();
    const loadTex = (path: string, colorManaged: boolean) => {
      const t = texLoader.load(path);
      t.colorSpace = colorManaged ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      t.flipY = false; // glTF UVs expect flipY=false; TextureLoader defaults to true, which was showing the map upside down
      // Equirectangular globe maps wrap horizontally (longitude 0 meets 360),
      // but ClampToEdgeWrapping (three's default) stretches the last row of
      // texels into infinity at that seam AND breaks mipmap generation right
      // at the U=0/1 boundary — that's the hard vertical line and the warped
      // smear you were seeing on one side of the globe. Wrapping U fixes both;
      // V (latitude/poles) should stay clamped since it doesn't wrap.
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.ClampToEdgeWrapping;
      t.generateMipmaps = true;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      return t;
    };

    // Draco support — only kicks in if the .glb was exported with
    // Draco mesh compression (common for large landscape/terrain models).
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      MODEL_PATH,
      (gltf) => {
        model = gltf.scene;

        // The source .glb ships broken placeholder materials (opaque shells
        // hiding the globe, a washed-out flat-white emissive on the surface).
        // Rebuild all three properly using our own textures rather than
        // trusting what's embedded in the file.
        model.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.castShadow = false;
          child.receiveShadow = false;

          // Low tier skips both transparent overdraw shells entirely —
          // no material build, no texture fetch, no extra draw call.
          // The bare surface still reads clearly as "a globe"; what's
          // lost is the cloud haze and the rim-light glow, which cost
          // real fill rate for a fairly subtle payoff.
          if (tier === 'low' && (child.name === 'cloud' || child.name === 'atmo')) {
            child.visible = false;
            return;
          }

          if (child.name === 'surface') {
            child.material = new THREE.MeshStandardMaterial({
              map: loadTex('/models/textures/earth_color.jpg', true),
              roughnessMap: loadTex('/models/textures/earth_roughness.jpg', false),
              roughness: 1,
              metalness: 0,
              bumpMap: loadTex('/models/textures/earth_bump.jpg', false),
              bumpScale: 0.015,
              emissiveMap: loadTex('/models/textures/earth_nightlights.jpg', true),
              emissive: new THREE.Color(0xffe9b0),
              emissiveIntensity: 1.4,
            });
          } else if (child.name === 'cloud') {
            cloudMesh = child;
            // The source .glb ships the cloud shell at the exact same radius
            // as the ground (identical bounding box), so the depth buffer
            // can't reliably tell them apart — that's what was causing the
            // hard banded/interlaced lines. Nudging the cloud shell
            // slightly outward and dropping depthTest (it's transparent and
            // additive-ish anyway, and always sits outside the surface)
            // fixes the fight instead of masking it.
            child.scale.setScalar(1.006);
            child.renderOrder = 1;
            const cloudMaterial = new THREE.MeshStandardMaterial({
              color: 0xffffff,
              // alphaMap is attached asynchronously below, once the image
              // has loaded and the canvas is built at its final size — see
              // loadCloudAlphaWithFadedPoles for why.
              // The alpha map itself is fairly bright/dense across most of
              // the map, so at full opacity the clouds read as a solid haze
              // over the whole globe rather than distinct wisps. Capping
              // opacity scales the alpha map's values down proportionally
              // (three multiplies them together), thinning coverage overall
              // while keeping the map's shape intact. Tune to taste — lower
              // = clearer surface, higher = heavier cloud cover.
              opacity: 0.45,
              transparent: true,
              depthWrite: false,
              depthTest: false,
              roughness: 1,
              metalness: 0,
            });
            child.material = cloudMaterial;
            loadCloudAlphaWithFadedPoles('/models/textures/earth_clouds.jpg', cloudMaterial);
          } else if (child.name === 'atmo') {
            // Soft rim glow — render the backside of a slightly larger sphere
            // with additive blending so it only shows at the grazing edge.
            // This one NEEDS depthTest on: it relies on being occluded by
            // the surface everywhere except the silhouette, where front and
            // back faces nearly coincide. The scale nudge below already
            // separates its radius from the surface's, so depth testing no
            // longer z-fights — it just does its job correctly again.
            child.scale.setScalar(1.015);
            child.renderOrder = 2;
            child.material = new THREE.MeshBasicMaterial({
              color: 0x6fd9ff,
              transparent: true,
              opacity: 0.35,
              side: THREE.BackSide,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            });
          }
        });

        // Auto-center and auto-scale so any model fills the same frame
        // regardless of its native export scale/units.
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = 5 / maxDim;

        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));

        // Face whichever location we have right now (real fix or SC
        // fallback) immediately, so there's no visible snap later.
        model.rotation.y = rotationForLatLon(targetLatLon.lat, targetLatLon.lon);

        scene.add(model);
        setStatus('ready');
      },
      (evt) => {
        if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100));
      },
      (err) => {
        // 404 = you haven't added the file yet; anything else = a real load error
        const message = String((err as ErrorEvent)?.message ?? err);
        if (message.includes('404') || message.toLowerCase().includes('not found')) {
          setStatus('missing');
        } else {
          console.error('Centerpiece3D load error:', err);
          setStatus('error');
        }
      }
    );

    // Interactive controls — drag to orbit, scroll/pinch to zoom, damped
    // inertia so it feels smooth rather than snapping to the cursor.
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.5, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 1.5;
    controls.maxDistance = 8;
    controls.minPolarAngle = Math.PI * 0.15;
    controls.maxPolarAngle = Math.PI * 0.85;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.update();

    // Touch devices get full drag-to-orbit / pinch-to-zoom too now. Note
    // the trade-off: a one-finger drag that starts on the globe rotates it
    // instead of scrolling the page — same as it would on any interactive
    // canvas (maps, model viewers, etc.). Visitors can still scroll by
    // swiping from anywhere outside the globe's full-bleed canvas, or via
    // the nav. touch-action: none stops the browser's own pinch-zoom/
    // pull-to-refresh gestures from fighting OrbitControls' own handling
    // of the same touches.
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    controls.enabled = true;
    let hintTimeout: ReturnType<typeof setTimeout> | undefined;
    if (isCoarsePointer) {
      renderer.domElement.style.touchAction = 'none';
      setShowTouchHint(true);
      hintTimeout = setTimeout(() => setShowTouchHint(false), 4000);
    }

    // Touch feedback — mobile has no hover state, so there's no equivalent
    // of the desktop custom-cursor's hover ring to signal "this responds
    // to input." Two things stand in for it: a light haptic tick where
    // supported (Android Chrome; iOS Safari has no Vibration API at all,
    // hence the visual ripple as the primary cue that works everywhere),
    // and a CSS ripple at the touch point mirroring the desktop cursor's
    // visual language. Both are one-shot per touch, not per-frame, so
    // they cost nothing in the render loop.
    const onTouchFeedback = (e: TouchEvent) => {
      setShowTouchHint(false);
      if ('vibrate' in navigator) {
        try { navigator.vibrate(12); } catch { /* unsupported/blocked — ignore */ }
      }
      const touch = e.touches[0];
      if (!touch) return;
      const rect = container.getBoundingClientRect();
      const ripple = document.createElement('div');
      ripple.className = 'touch-ripple';
      ripple.style.left = `${touch.clientX - rect.left}px`;
      ripple.style.top = `${touch.clientY - rect.top}px`;
      container.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    };
    if (isCoarsePointer) {
      renderer.domElement.addEventListener('touchstart', onTouchFeedback, { passive: true });
    }

    // Pause auto-rotate while the user is actively dragging/zooming, resume
    // shortly after they let go so it doesn't fight their input.
    let resumeTimeout: ReturnType<typeof setTimeout>;
    const onInteractionStart = () => {
      controls.autoRotate = false;
      userInteracted = true;
      reorientTarget = null; // visitor's in control now — don't fight their drag
      clearTimeout(resumeTimeout);
    };
    const onInteractionEnd = () => {
      clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(() => {
        controls.autoRotate = true;
      }, 2200);
    };
    controls.addEventListener('start', onInteractionStart);
    controls.addEventListener('end', onInteractionEnd);

    // Double-click / double-tap to reset the view
    const defaultPosition = camera.position.clone();
    const defaultTarget = controls.target.clone();
    const onDoubleClick = () => {
      camera.position.copy(defaultPosition);
      controls.target.copy(defaultTarget);
      controls.update();
    };
    renderer.domElement.addEventListener('dblclick', onDoubleClick);

    let raf = 0;
    // The scene sits in a full-screen hero, but this is a normally
    // scrolling page — once the visitor scrolls three sections past it,
    // there's no reason a WebGL scene should still be rendering every
    // frame off-screen. isVisible gates the render call itself (not just
    // requestAnimationFrame scheduling), so a hidden globe costs
    // essentially nothing instead of full GPU frame time for nothing.
    let isVisible = true;
    const animate = () => {
      controls.update(); // required every frame when damping/autoRotate is on
      if (cloudMesh) cloudMesh.rotation.y += 0.0006; // clouds drift slightly faster than the globe

      // Ease toward a late-arriving geo fix instead of snapping to it.
      if (model && reorientTarget !== null) {
        model.rotation.y = THREE.MathUtils.lerp(model.rotation.y, reorientTarget, 0.04);
        if (Math.abs(model.rotation.y - reorientTarget) < 0.001) reorientTarget = null;
      }

      if (isVisible) renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting; },
      { threshold: 0 }
    );
    visibilityObserver.observe(container);

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      visibilityObserver.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(resumeTimeout);
      clearTimeout(geoTimeout);
      clearTimeout(hintTimeout);
      geoController.abort();
      controls.removeEventListener('start', onInteractionStart);
      controls.removeEventListener('end', onInteractionEnd);
      renderer.domElement.removeEventListener('dblclick', onDoubleClick);
      renderer.domElement.removeEventListener('touchstart', onTouchFeedback);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      dracoLoader.dispose();

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-[5]" data-cursor="hover">
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/20">
            Loading model · {progress}%
          </div>
        </div>
      )}
      {status === 'missing' && (
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/15 text-center max-w-xs">
            No model found at /public/models/centerpiece.glb
          </div>
        </div>
      )}
      {status === 'ready' && showTouchHint && (
        <div className="touch-hint pointer-events-none absolute bottom-8 left-0 right-0 flex justify-center">
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/40">
            touch &amp; drag to explore
          </span>
        </div>
      )}
    </div>
  );
}
