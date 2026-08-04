/**
 * Single source of truth for "how much visual effect can this device
 * afford." Computed once per session and exposed two ways:
 *   - as a `data-fx-tier` attribute on <html>, for CSS to gate against
 *     (e.g. `[data-fx-tier="low"] .pillbox { backdrop-filter: none; }`)
 *   - as `getEffectsTier()` / `prefersReducedMotion()` for components that
 *     need to branch in JS (particle counts, whether a WebGL scene mounts
 *     at all, whether an animation loop even starts).
 *
 * Every new heavy effect (glass, ambient layers, depth shadows, etc.)
 * should read from this rather than assuming the device can handle it —
 * that's the whole point: one place decides "can we afford this," not a
 * dozen ad-hoc `matchMedia` calls scattered through components.
 */

export type EffectsTier = 'low' | 'mid' | 'high';

let cachedTier: EffectsTier | null = null;
let cachedReducedMotion: boolean | null = null;

function detectGPUClass(): 'integrated' | 'discrete' | 'unknown' {
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return 'unknown';
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    if (!dbg) return 'unknown';
    const renderer = String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)).toLowerCase();
    // Apple Silicon/Intel/mobile integrated GPUs — the exact class of
    // hardware that struggled with the original globe scene. Fill-rate
    // heavy effects (blur, overdraw, high pixel ratio) get scaled back
    // hardest here.
    if (/(apple m\d|apple gpu|intel(?!.*arc)|iris|uhd graphics|adreno|mali|powervr)/.test(renderer)) {
      return 'integrated';
    }
    if (/(nvidia|geforce|rtx|gtx|radeon|amd)/.test(renderer)) return 'discrete';
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

export function prefersReducedMotion(): boolean {
  if (cachedReducedMotion === null) {
    cachedReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return cachedReducedMotion;
}

export function getEffectsTier(): EffectsTier {
  if (cachedTier) return cachedTier;

  if (prefersReducedMotion()) {
    cachedTier = 'low';
    return cachedTier;
  }

  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  // deviceMemory is Chromium-only; absent elsewhere (notably Safari), so
  // treat "unknown" as neutral rather than penalizing it.
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 4;
  const gpu = detectGPUClass();

  let score = 2; // start at mid
  if (!coarsePointer) score += 1; // desktop/laptop form factor
  if (gpu === 'discrete') score += 1;
  if (gpu === 'integrated') score -= 1;
  if (cores <= 4) score -= 1;
  if (mem <= 4) score -= 1;

  cachedTier = score <= 1 ? 'low' : score >= 4 ? 'high' : 'mid';
  return cachedTier;
}

/** Call once at app startup — puts the tier on <html> for CSS to read. */
export function applyEffectsTierAttribute(): void {
  document.documentElement.dataset.fxTier = getEffectsTier();
  if (prefersReducedMotion()) {
    document.documentElement.dataset.reducedMotion = 'true';
  }
}
