"use client";

import { useEffect, useRef } from "react";

/** Noise tile size — large enough to feel organic when randomly offset. */
const TILE = 256;
/** Flicker rate ≈ bymonolog `steps(6)` @ 0.5s (~12Hz). */
const INTERVAL_MS = 1000 / 12;

function makeNoiseTile(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = TILE;
  c.height = TILE;
  const ctx = c.getContext("2d", { alpha: false });
  if (!ctx) return c;
  const img = ctx.createImageData(TILE, TILE);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    d[i] = d[i + 1] = d[i + 2] = v;
    d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/**
 * Animated film grain (bymonolog-style): canvas noise tile + random offsets via rAF.
 * Soft overlay — does not block pointer events or reading.
 */
export default function SiteNoise({ enabled = true }: { enabled?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const tile = makeNoiseTile();
    let raf = 0;
    let alive = true;
    let last = 0;

    const resize = () => {
      // Full-res buffer → grain ~50% finer than previous half-res soft scale
      const w = Math.max(1, Math.ceil(window.innerWidth));
      const h = Math.max(1, Math.ceil(window.innerHeight));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const paint = () => {
      const w = canvas.width;
      const h = canvas.height;
      const ox = -((Math.random() * TILE) | 0);
      const oy = -((Math.random() * TILE) | 0);
      const pattern = ctx.createPattern(tile, "repeat");
      if (!pattern) return;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, ox, oy);
      ctx.fillStyle = pattern;
      ctx.fillRect(-ox, -oy, w + TILE, h + TILE);
      ctx.restore();
    };

    resize();
    paint();

    const loop = (t: number) => {
      if (!alive) return;
      if (enabled && t - last >= INTERVAL_MS) {
        last = t;
        paint();
      }
      raf = requestAnimationFrame(loop);
    };

    if (enabled) {
      raf = requestAnimationFrame(loop);
    }

    const onResize = () => {
      resize();
      paint();
    };
    window.addEventListener("resize", onResize);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [enabled]);

  return <canvas ref={ref} className="site-noise" aria-hidden="true" />;
}
