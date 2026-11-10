"use client";

import { useEffect, useState } from "react";
import { useSiteContent } from "../../hooks/useSiteContent";
import SiteNoise from "../SiteNoise";

export default function SuccessPage() {
  const c = useSiteContent();
  const [motion, setMotion] = useState(true);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) setMotion(false);
    document.documentElement.dataset.motion = reduce ? "off" : "on";
  }, []);

  return (
    <>
      <SiteNoise enabled={motion} />
      <a href="#main" className="skip">
        Перейти к содержимому
      </a>
      <header className="header success-header">
        <a href="./" className="brand">
          AI WORKFLOW<span className="brand-mark">↗</span>
        </a>
      </header>
      <main id="main" className="success-page">
        <div className="success-inner">
          <h1>{c.success.title}</h1>
          <p className="success-lead">{c.success.lead}</p>
          <p>{c.success.body}</p>
          <p className="success-start">{c.success.start}</p>
          <a
            className="button"
            href={c.success.loginUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {c.success.loginLabel} <span>↗</span>
          </a>
        </div>
      </main>
    </>
  );
}
