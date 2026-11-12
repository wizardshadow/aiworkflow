"use client";
import { useEffect, useRef, useState } from "react";
import { useSiteContent } from "../hooks/useSiteContent";
import { lines, seatsLeftText } from "../lib/site-content";
import DeferredExternalScripts from "./DeferredExternalScripts";
import GetCourseEnrollWidget from "./GetCourseEnrollWidget";
import ProgramModule from "./ProgramModule";
import SiteNoise from "./SiteNoise";
import SitePreloader from "./SitePreloader";
import SmoothScroll, { scrollToId } from "./SmoothScroll";

function BrText({ text }: { text: string }) {
  const parts = lines(text);
  return (
    <>
      {parts.map((part, i) => (
        <span key={`${i}-${part.slice(0, 12)}`}>
          {i > 0 ? <br /> : null}
          {part}
        </span>
      ))}
    </>
  );
}

export default function Home() {
  const c = useSiteContent();
  const [menu, setMenu] = useState(false);
  const [motion, setMotion] = useState(true);
  const [heroReady, setHeroReady] = useState(false);
  const [activeNav, setActiveNav] = useState("");
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [marketSrc, setMarketSrc] = useState<string | undefined>(undefined);
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const marketVideo = useRef<HTMLVideoElement>(null);
  const marketWrap = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const navLock = useRef<string | null>(null);
  const closingTimer = useRef<number | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setMotion(false);
      setHeroReady(true);
    } else {
      requestAnimationFrame(() => setHeroReady(true));
    }
    const observer = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.08 }
    );
    document.querySelectorAll(".reveal").forEach((e) => observer.observe(e));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = motion ? "on" : "off";
    if (motion) {
      video.current?.play().catch(() => {});
      marketVideo.current?.play().catch(() => {});
    } else {
      video.current?.pause();
      marketVideo.current?.pause();
    }
  }, [motion]);

  // Defer market video until near viewport — keeps initial transfer lean.
  useEffect(() => {
    const wrap = marketWrap.current;
    if (!wrap) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        setMarketSrc(c.market.videoUrl);
        io.disconnect();
      },
      { rootMargin: "240px 0px" }
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, [c.market.videoUrl]);

  useEffect(() => {
    if (!marketSrc || !motion) return;
    const el = marketVideo.current;
    if (!el) return;
    const play = () => el.play().catch(() => {});
    if (el.readyState >= 2) play();
    else el.addEventListener("loadeddata", play, { once: true });
    return () => el.removeEventListener("loadeddata", play);
  }, [marketSrc, motion]);

  const clearClosingTimer = () => {
    if (closingTimer.current !== null) {
      window.clearTimeout(closingTimer.current);
      closingTimer.current = null;
    }
  };

  const enroll = () => {
    const el = dialog.current;
    if (!el || el.open) return;
    clearClosingTimer();
    setEnrollOpen(true);
    el.classList.remove("is-closing");
    el.showModal();
    requestAnimationFrame(() =>
      requestAnimationFrame(() => el.classList.add("is-open"))
    );
  };

  /** Все CTA кроме «ЗАБРАТЬ МЕСТО СО СКИДКОЙ» — к блоку «Что ты получаешь?» */
  const scrollToValue = () => {
    setMenu(false);
    scrollToId("value");
  };

  const closeEnroll = () => {
    const el = dialog.current;
    if (!el?.open || el.classList.contains("is-closing")) return;
    const instant = document.documentElement.dataset.motion === "off";
    if (instant) {
      clearClosingTimer();
      el.classList.remove("is-open", "is-closing");
      el.close();
      setEnrollOpen(false);
      return;
    }
    el.classList.add("is-closing");
    el.classList.remove("is-open");
    const finish = () => {
      clearClosingTimer();
      el.removeEventListener("transitionend", onEnd);
      el.classList.remove("is-closing");
      if (el.open) el.close();
    };
    const onEnd = (e: TransitionEvent) => {
      if (e.target !== el || e.propertyName !== "opacity") return;
      finish();
    };
    el.addEventListener("transitionend", onEnd);
    closingTimer.current = window.setTimeout(finish, 450);
  };

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      closeEnroll();
    };
    const onClose = () => {
      clearClosingTimer();
      el.classList.remove("is-open", "is-closing");
      setEnrollOpen(false);
    };
    el.addEventListener("cancel", onCancel);
    el.addEventListener("close", onClose);
    return () => {
      el.removeEventListener("cancel", onCancel);
      el.removeEventListener("close", onClose);
      clearClosingTimer();
    };
  }, []);

  useEffect(() => {
    const ids = c.nav.map((item) => item.id);
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;
    const ratios = new Map<string, number>();
    const headerH = () =>
      (document.querySelector(".header") as HTMLElement | null)?.offsetHeight ??
      72;
    const resolve = () => {
      if (navLock.current) {
        setActiveNav(navLock.current);
        return;
      }
      let best = "";
      let bestR = 0;
      for (const id of ids) {
        const r = ratios.get(id) ?? 0;
        if (r > bestR) {
          bestR = r;
          best = id;
        }
      }
      if (bestR <= 0) {
        const y = window.scrollY + headerH() + 12;
        best = "";
        for (const id of ids) {
          const el = document.getElementById(id);
          if (el && el.offsetTop <= y) best = id;
        }
      }
      setActiveNav(best);
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          ratios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        resolve();
      },
      { rootMargin: "-76px 0px -48% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );
    sections.forEach((s) => io.observe(s));
    const onScroll = () => {
      if (!navLock.current) return;
      const el = document.getElementById(navLock.current);
      if (!el) {
        navLock.current = null;
        return;
      }
      if (Math.abs(el.getBoundingClientRect().top - headerH()) < 56)
        navLock.current = null;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    resolve();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [c.nav]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const bar = nav.querySelector(".nav-bar") as HTMLElement | null;
    if (!bar) return;
    const place = () => {
      if (getComputedStyle(nav).display === "none") {
        bar.hidden = true;
        return;
      }
      const link = activeNav
        ? (nav.querySelector(`a[href="#${activeNav}"]`) as HTMLElement | null)
        : null;
      if (!link) {
        bar.hidden = true;
        bar.style.width = "0px";
        return;
      }
      const nr = nav.getBoundingClientRect();
      const lr = link.getBoundingClientRect();
      bar.hidden = false;
      bar.style.width = `${Math.max(lr.width, 1)}px`;
      bar.style.transform = `translate(${lr.left - nr.left + nav.scrollLeft}px,${lr.bottom - nr.top - 3}px)`;
    };
    place();
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(place) : null;
    ro?.observe(nav);
    window.addEventListener("resize", place);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", place);
    };
  }, [activeNav, menu]);

  const onNavClick = (id: string) => {
    navLock.current = id;
    setActiveNav(id);
    setMenu(false);
    window.setTimeout(() => {
      if (navLock.current === id) navLock.current = null;
    }, 1400);
  };

  const scenarios = [c.approach.scenarioA, c.approach.scenarioB];
  const seatsLeft = seatsLeftText(c.seats);

  return (
    <>
      <SitePreloader heroVideo={video} />
      <SmoothScroll enabled={motion} />
      <SiteNoise enabled={motion} />
      <DeferredExternalScripts html={c.externalScriptsHtml} />
      <a href="#main" className="skip">
        Перейти к содержимому
      </a>
      <header className="header">
        <a href="#top" className="brand">
          AI WORKFLOW<span className="brand-mark">↗</span>
        </a>
        <nav
          ref={navRef}
          className={menu ? "nav open" : "nav"}
          aria-label="Главная навигация"
        >
          <span className="nav-bar" aria-hidden="true" hidden />
          {c.nav.map((item) => (
            <a
              key={item.id}
              href={"#" + item.id}
              aria-current={activeNav === item.id ? "true" : undefined}
              onClick={() => onNavClick(item.id)}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <button className="header-cta" onClick={scrollToValue}>
          {c.headerCta} <span>↗</span>
        </button>
        <button
          className="menu-toggle"
          aria-label={menu ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          {menu ? "×" : "☰"}
        </button>
      </header>
      <main id="main">
        <section id="top" className={heroReady ? "hero is-ready" : "hero"}>
          <div className="hero-kicker hero-reveal" data-d="1">
            <span>
              <i className="dot" /> {c.hero.kickerLeft}
            </span>
            <span>{c.hero.kickerRight}</span>
          </div>
          <div className="offer hero-reveal" data-d="2">
            <span>↗</span> {c.hero.offer}
          </div>
          <h1 className="hero-reveal" data-d="3">
            <span>{c.hero.titleAi}</span> {c.hero.titleRest}
          </h1>
          <div className="hero-content">
            <div className="hero-copy">
              <p className="hero-reveal" data-d="4">
                {c.hero.lead}{" "}
                <span className="duration-highlight">{c.hero.duration}</span>
              </p>
              <button
                className="button hero-reveal"
                data-d="5"
                onClick={scrollToValue}
              >
                {c.hero.cta} <span>↗</span>
              </button>
              <div className="availability hero-reveal" data-d="6">
                <i className="dot" /> {seatsLeft}
                {c.hero.startNote ? ` · ${c.hero.startNote}` : ""}
              </div>
              <p className="installments hero-reveal" data-d="7">
                {c.hero.installments}
              </p>
            </div>
            <div className="hero-visual hero-reveal" data-d="8">
              <video
                ref={video}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                src={c.hero.videoUrl}
                aria-label="AI WORKFLOW — hero-видео"
              />
              <div className="visual-top">
                <span>{c.hero.visualTopLeft}</span>
                <span className="live">
                  <i /> {c.hero.visualTopRight}
                </span>
              </div>
              <div className="visual-bottom">
                <span>{c.hero.visualBottom}</span>
                <button
                  aria-label={
                    motion ? "Приостановить анимации" : "Включить анимации"
                  }
                  onClick={() => setMotion(!motion)}
                >
                  {motion ? "Ⅱ" : "▷"}
                </button>
              </div>
            </div>
            <div className="hero-status hero-reveal" data-d="9">
              <span className="small">{c.hero.statusLabel}</span>
              <div>
                <span>{c.hero.formatLabel}</span>
                <b>{c.hero.formatValue}</b>
              </div>
              <div>
                <span>{c.hero.startLabel}</span>
                <b>{c.hero.startValue}</b>
              </div>
              <div>
                <span>{c.hero.seatsLabel}</span>
                <b>{c.seats.total}</b>
              </div>
              <div className="status-arrow">↘</div>
              <span className="small">
                <BrText text={c.hero.statusFooter} />
              </span>
            </div>
          </div>
          <div className="ticker hero-reveal" data-d="10" aria-hidden="true">
            <div>
              {[0, 1].map((i) => (
                <span key={i}>{c.hero.ticker.repeat(3)}</span>
              ))}
            </div>
          </div>
        </section>

        <section id="approach" className="section scenarios">
          <div className="section-label">
            <span>{c.approach.labelLeft}</span>
            <span>{c.approach.labelRight}</span>
          </div>
          <div className="section-heading reveal">
            <h2>
              <BrText text={c.approach.heading} />
            </h2>
            <p>
              <BrText text={c.approach.sub} />
            </p>
          </div>
          <div className="scenario-grid">
            {scenarios.map((block, index) => (
              <article
                className={
                  "scenario reveal " + (index ? "positive" : "negative")
                }
                key={index}
              >
                <div className="scenario-top">
                  <span>СЦЕНАРИЙ {index ? "Б" : "А"}</span>
                  <span>{index ? "↗" : "↘"}</span>
                </div>
                <h3>
                  <BrText text={block.title} />
                </h3>
                <ul>
                  {block.items.map((text, n) => (
                    <li key={n}>
                      <span>{index ? "+" : "−"}</span>
                      <p>{text}</p>
                    </li>
                  ))}
                </ul>
                <div className="scenario-bottom">
                  {block.footer}
                  <span>{index ? "↗" : "↘"}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="market" className="section market">
          <div className="section-label">
            <span>{c.market.labelLeft}</span>
            <span>{c.market.labelRight}</span>
          </div>
          <h2 className="reveal">
            {c.market.heading}
            <br />
            <span className="muted">{c.market.headingMuted}</span>
          </h2>
          <div className="stats">
            {c.market.stats.map((stat) => (
              <article className="stat reveal" key={stat.value + stat.source}>
                <div className="stat-number">
                  {stat.value}
                  <span>%</span>
                </div>
                <p>{stat.copy}</p>
                <span className="small">{stat.source}</span>
              </article>
            ))}
          </div>
          <div className="market-bottom">
            <div className="market-image reveal" ref={marketWrap}>
              <video
                ref={marketVideo}
                autoPlay
                muted
                loop
                playsInline
                preload="none"
                src={marketSrc}
                aria-label="Поезд AI WORKFLOW — визуал новой реальности"
              />
            </div>
            <div className="market-copy reveal">
              <h3>
                <BrText text={c.market.trainHeading} />
              </h3>
              <p>{c.market.p1}</p>
              <p>{c.market.p2}</p>
              <div className="manifesto">
                {c.market.manifesto}
                <br />
                <span>{c.market.manifestoAccent}</span>
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="section workflow">
          <div className="section-label">
            <span>{c.workflow.labelLeft}</span>
            <span>{c.workflow.labelRight}</span>
          </div>
          <div className="workflow-intro reveal">
            <h2>
              <BrText text={c.workflow.heading} />
              <span>{c.workflow.headingAccent}</span>
            </h2>
            <div>
              <p>{c.workflow.p1}</p>
              <p>{c.workflow.p2}</p>
            </div>
          </div>
          <div className="process">
            {c.workflow.steps.map((step, i) => (
              <article key={step.title} className="step reveal">
                <div className="step-line">
                  <span>0{i + 1}</span>
                  <span>→</span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.ai}</p>
                <div className="human">
                  <span>ТВОЯ РОЛЬ</span>
                  <p>{step.human}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="process-footer reveal">
            <span className="asterisk">✳</span>
            <div>
              <h3>{c.workflow.footerTitle}</h3>
              <p>{c.workflow.footerBody}</p>
            </div>
            <p>{c.workflow.footerAside}</p>
          </div>
        </section>

        <section id="program" className="section program">
          <div className="section-label">
            <span>{c.program.labelLeft}</span>
            <span>{c.program.labelRight}</span>
          </div>
          <div className="section-heading reveal">
            <h2>
              <BrText text={c.program.heading} />
            </h2>
            <span className="program-mark">↙</span>
          </div>
          <div className="modules">
            {c.program.modules.map((mod, i) => (
              <ProgramModule
                key={mod.title}
                index={i}
                title={mod.title}
                month={mod.month}
                weeks={mod.weeks}
              >
                <div className="module-content">
                  <div className="module-image">
                    <img
                      src={mod.imageUrl}
                      alt="Инженерный проект — временный визуальный материал CROX"
                      loading="lazy"
                      decoding="async"
                      width={1024}
                      height={550}
                    />
                    <span>ПРОЕКТ 0{i + 1} / ПРАКТИКА</span>
                  </div>
                  <div className="weeks">
                    <div className="table-head">
                      <span>НЕДЕЛЯ</span>
                      <span>ТЕМА</span>
                      <span>РЕЗУЛЬТАТ</span>
                    </div>
                    {mod.rows.map((row) => (
                      <div className="week" key={row.week}>
                        <span>{row.week.padStart(2, "0")}</span>
                        <h3>{row.topic}</h3>
                        <p>{row.result}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </ProgramModule>
            ))}
          </div>
          <div className="program-note reveal">
            <p>{c.program.note}</p>
          </div>
          <div className="program-end">
            <span>{c.program.endLabel}</span>
            <button className="button" onClick={scrollToValue}>
              {c.program.cta} <span>↗</span>
            </button>
          </div>
        </section>

        <section id="proof" className="section proof">
          <div className="section-label">
            <span>{c.proof.labelLeft}</span>
          </div>
          <div className="proof-heading reveal">
            <h2>{c.proof.heading}</h2>
          </div>
          <div className="proof-grid">
            <div className="proof-visual reveal">
              <img
                src={c.proof.imageUrl}
                alt={c.proof.imageAlt}
                loading="lazy"
                decoding="async"
                width={1280}
                height={720}
              />
            </div>
            <div className="proof-copy reveal">
              <div className="proof-quote-mark" aria-hidden="true">
                “
              </div>
              <blockquote>
                <p>{c.proof.quote}</p>
              </blockquote>
              <div className="proof-author">
                <span className="proof-author-name">{c.proof.author}</span>
              </div>
              <button className="button" onClick={scrollToValue}>
                {c.proof.cta} <span>↗</span>
              </button>
            </div>
          </div>
          <div className="proof-stats">
            {c.proof.stats.map((stat, i) => (
              <article className="proof-stat reveal" key={stat.label}>
                <div className="proof-stat-row">
                  <span>{stat.a}</span>
                  <span>{stat.b}</span>
                  <span>{stat.c}</span>
                </div>
                <span className="small">{stat.label}</span>
                {i < c.proof.stats.length - 1 ? (
                  <span className="proof-stat-arrow" aria-hidden="true">
                    →
                  </span>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section id="audience" className="section audience">
          <div className="section-label">
            <span>{c.audience.labelLeft}</span>
          </div>
          <div className="section-heading reveal">
            <h2>
              <BrText text={c.audience.heading} />
            </h2>
            <p>{c.audience.sub}</p>
          </div>
          <div className="audience-grid">
            <article className="audience-col fit reveal">
              <div className="audience-top">
                <span>{c.audience.fitTitle}</span>
                <span>+</span>
              </div>
              <ul>
                {c.audience.fit.map((text) => (
                  <li key={text}>
                    <span>+</span>
                    <p>{text}</p>
                  </li>
                ))}
              </ul>
            </article>
            <article className="audience-col nofit reveal">
              <div className="audience-top">
                <span>{c.audience.notFitTitle}</span>
                <span>−</span>
              </div>
              <ul>
                {c.audience.notFit.map((text) => (
                  <li key={text}>
                    <span>−</span>
                    <p>{text}</p>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section id="pricing" className="section pricing">
          <div className="section-label">
            <span>{c.pricing.labelLeft}</span>
            <span>{c.pricing.labelRight}</span>
          </div>
          <div className="pricing-layout">
            <div id="value" className="pricing-intro reveal">
              <h2>
                <BrText text={c.pricing.introHeading} />
              </h2>
              <p>{c.pricing.introValue}</p>
            </div>
            <div className="value-stack reveal">
              <div className="value-head">
                <span>СОСТАВ</span>
                <span>ЦЕННОСТЬ</span>
              </div>
              {c.pricing.valueStack.map((row) => (
                <div
                  className={"value-row" + (row.priceless ? " priceless" : "")}
                  key={row.item}
                >
                  <p>{row.item}</p>
                  <span>{row.price}</span>
                </div>
              ))}
              <div className="value-total">
                <span>{c.pricing.valueTotalLabel}</span>
                <b>{c.pricing.valueTotal}</b>
              </div>
            </div>
          </div>
          <div className="pricing-offer reveal">
            <div className="offer-price">
              <span className="small">{c.pricing.offerLabel}</span>
              <div className="price-row">
                <b>{c.pricing.price}</b>
                <s>{c.pricing.priceOld}</s>
              </div>
              <p>{c.pricing.discountNote}</p>
            </div>
            <div className="offer-meta">
              <p>{c.pricing.installments}</p>
              <button className="button" onClick={enroll}>
                {c.pricing.cta} <span>↗</span>
              </button>
              <div className="availability">
                <i className="dot" /> {seatsLeft}
              </div>
              <p className="offer-deadline">{c.pricing.deadline}</p>
            </div>
          </div>
        </section>

        <section id="final" className="section final-cta">
          <div className="section-label">
            <span>{c.final.labelLeft}</span>
            <span>{c.final.labelRight}</span>
          </div>
          <div className="final-inner reveal">
            <h2>{c.final.heading}</h2>
            <p>{c.final.p1}</p>
            <p className="final-accent">
              <BrText text={c.final.accent} />
            </p>
            <button className="button button-lg" onClick={scrollToValue}>
              {c.final.cta} <span>↗</span>
            </button>
            <div className="availability">
              <i className="dot" />
              {c.final.startNote ? `${c.final.startNote} · ` : ""}
              {seatsLeft}
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-brand">
          <a className="brand" href="#top">
            AI WORKFLOW <span className="brand-mark">↗</span>
          </a>
          <p>{c.footer.tagline}</p>
        </div>
        <div className="footer-legal">
          <p>{c.footer.legal}</p>
          <div className="footer-links">
            <a href="#offer">{c.footer.offerLabel}</a>
            <span aria-hidden="true">|</span>
            <a href="#privacy">{c.footer.privacyLabel}</a>
            <a href="#top">{c.footer.topLabel}</a>
          </div>
        </div>
      </footer>
      <div id="offer" className="legal-anchor" hidden aria-hidden="true" />
      <div id="privacy" className="legal-anchor" hidden aria-hidden="true" />
      <dialog
        className="enroll-dialog"
        ref={dialog}
        onClick={(e) => {
          if (e.target === dialog.current) closeEnroll();
        }}
      >
        <button
          className="dialog-close"
          onClick={closeEnroll}
          aria-label="Закрыть"
        >
          ×
        </button>
        <span className="small enroll-dialog-label">{c.enroll.label}</span>
        <h2 className="enroll-dialog-title">{c.enroll.title}</h2>
        <div className="enroll-dialog-widget">
          <GetCourseEnrollWidget enabled={enrollOpen} />
        </div>
        <p className="enroll-dialog-note">{c.enroll.note}</p>
      </dialog>
    </>
  );
}
