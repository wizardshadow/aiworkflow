"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

const STEPS = [
  "СИСТЕМА",
  "ШРИФТЫ",
  "HERO VIDEO",
  "MARKET VIDEO",
  "WORKFLOW",
] as const;

type SitePreloaderProps = {
  heroVideo: RefObject<HTMLVideoElement | null>;
};

export default function SitePreloader({ heroVideo }: SitePreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"loading" | "leaving" | "gone">("loading");
  const target = useRef(8);
  const raf = useRef(0);

  useEffect(() => {
    document.documentElement.dataset.preload = "on";
    document.body.style.overflow = "hidden";

    const flags = { hero: false, market: false, fonts: false, load: false };

    const bump = (value: number) => {
      target.current = Math.max(target.current, Math.min(100, value));
    };

    const finish = () => {
      bump(100);
    };

    const maybeFinish = () => {
      if (flags.hero && flags.market && flags.fonts && flags.load) finish();
    };

    const markHero = () => {
      flags.hero = true;
      bump(78);
      maybeFinish();
    };
    const markMarket = () => {
      flags.market = true;
      bump(92);
      maybeFinish();
    };
    const markFonts = () => {
      flags.fonts = true;
      bump(42);
      maybeFinish();
    };

    const hero = heroVideo.current;
    const market = document.querySelector<HTMLVideoElement>(
      '.market-image video'
    );

    const onHeroReady = () => {
      markHero();
      try {
        if (hero && hero.currentTime < 0.05) hero.currentTime = 0.001;
      } catch {
        /* seek may fail before enough data */
      }
    };
    const onMarketReady = () => {
      markMarket();
      try {
        if (market && market.currentTime < 0.05) market.currentTime = 0.001;
      } catch {
        /* ignore */
      }
    };

    if (hero) {
      if (hero.readyState >= 2) onHeroReady();
      else {
        hero.addEventListener("loadeddata", onHeroReady, { once: true });
        hero.addEventListener("canplay", onHeroReady, { once: true });
        hero.addEventListener("error", markHero, { once: true });
      }
    } else {
      markHero();
    }

    if (market) {
      if (market.readyState >= 2) onMarketReady();
      else {
        market.addEventListener("loadeddata", onMarketReady, { once: true });
        market.addEventListener("canplay", onMarketReady, { once: true });
        market.addEventListener("error", markMarket, { once: true });
      }
    } else {
      markMarket();
    }

    if (document.fonts?.ready) {
      document.fonts.ready.then(markFonts).catch(markFonts);
    } else {
      markFonts();
    }

    const onWindowLoad = () => {
      flags.load = true;
      bump(96);
      maybeFinish();
    };
    if (document.readyState === "complete") onWindowLoad();
    else window.addEventListener("load", onWindowLoad, { once: true });

    // Soft floor progress while waiting for media.
    const soft = window.setInterval(() => {
      if (target.current >= 100) return;
      bump(Math.min(68, target.current + 3));
    }, 280);

    // Never block forever on slow / failed media.
    const hardCap = window.setTimeout(() => {
      flags.hero = true;
      flags.market = true;
      flags.fonts = true;
      flags.load = true;
      finish();
    }, 4500);

    const tick = () => {
      setProgress((prev) => {
        const next =
          prev >= target.current
            ? prev
            : prev + Math.max(0.6, (target.current - prev) * 0.12);
        return Math.min(100, next >= 99.5 && target.current >= 100 ? 100 : next);
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf.current);
      window.clearInterval(soft);
      window.clearTimeout(hardCap);
      window.removeEventListener("load", onWindowLoad);
      hero?.removeEventListener("loadeddata", onHeroReady);
      hero?.removeEventListener("canplay", onHeroReady);
      market?.removeEventListener("loadeddata", onMarketReady);
      market?.removeEventListener("canplay", onMarketReady);
    };
  }, [heroVideo]);

  useEffect(() => {
    setStep(Math.min(STEPS.length - 1, Math.floor((progress / 100) * STEPS.length)));
  }, [progress]);

  useEffect(() => {
    if (progress < 100 || phase !== "loading") return;
    const leave = window.setTimeout(() => setPhase("leaving"), 180);
    return () => window.clearTimeout(leave);
  }, [progress, phase]);

  useEffect(() => {
    if (phase !== "leaving") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ms = reduce ? 0 : 720;
    const gone = window.setTimeout(() => {
      setPhase("gone");
      delete document.documentElement.dataset.preload;
      document.body.style.overflow = "";
    }, ms);
    return () => window.clearTimeout(gone);
  }, [phase]);

  if (phase === "gone") return null;

  const shown = String(Math.round(progress)).padStart(2, "0");

  return (
    <div
      className={`site-preloader${phase === "leaving" ? " is-leaving" : ""}`}
      aria-hidden={phase === "leaving"}
      role="status"
      aria-live="polite"
      aria-label={`Загрузка ${shown}%`}
    >
      <div className="site-preloader__frame">
        <div className="site-preloader__brand">
          <span>AI WORKFLOW</span>
          <span className="site-preloader__mark">↗</span>
        </div>
        <div className="site-preloader__meta">
          <span>01 / BOOT</span>
          <span>HUMAN × MACHINE</span>
        </div>

        <div className="site-preloader__center">
          <div className="site-preloader__progress" aria-hidden="true">
            <span>{shown}</span>
            <small>%</small>
          </div>
          <div className="site-preloader__bar" aria-hidden="true">
            <i style={{ transform: `scaleX(${Math.max(0.02, progress / 100)})` }} />
          </div>
        </div>

        <div className="site-preloader__rail">
          <ul className="site-preloader__steps">
            {STEPS.map((label, i) => (
              <li
                key={label}
                className={
                  i === step
                    ? "is-active"
                    : i < step
                      ? "is-done"
                      : undefined
                }
              >
                {label}
              </li>
            ))}
          </ul>
          <p className="site-preloader__status">
            {progress >= 100 ? "READY" : "LOADING"}
            <i />
          </p>
        </div>
      </div>
    </div>
  );
}
