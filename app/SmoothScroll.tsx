"use client";

import { useEffect } from "react";
import Lenis from "lenis";

let lenisInstance: Lenis | null = null;

export function scrollToId(id: string, offset = -75) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenisInstance) {
    lenisInstance.scrollTo(el, { offset, duration: 1.2 });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function SmoothScroll({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });
    lenisInstance = lenis;
    document.documentElement.classList.add("lenis", "lenis-smooth");

    let rafId = 0;
    let alive = true;
    const raf = (time: number) => {
      if (!alive) return;
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const anchor = target?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#" || href === "#main") return;
      const id = decodeURIComponent(href.slice(1));
      const el = document.getElementById(id);
      if (!el) return;
      event.preventDefault();
      lenis.scrollTo(el, { offset: -75, duration: 1.2 });
      history.pushState(null, "", href);
    };

    document.addEventListener("click", onClick);

    return () => {
      alive = false;
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", onClick);
      document.documentElement.classList.remove("lenis", "lenis-smooth");
      lenis.destroy();
      if (lenisInstance === lenis) lenisInstance = null;
    };
  }, [enabled]);

  return null;
}
