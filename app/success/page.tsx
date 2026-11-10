"use client";

import { useEffect, useState } from "react";
import SiteNoise from "../SiteNoise";

/** Placeholder: no login / cabinet URL exists on the site yet. */
const LOGIN_HREF = "#";

export default function SuccessPage() {
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
          <h1>Благодарю!</h1>
          <p className="success-lead">Оплата прошла успешно!</p>
          <p>
            Все инструкции отправлены тебе на почту, указанную при регистрации.
          </p>
          <p className="success-start">Стартуем 1 декабря.</p>
          <a className="button" href={LOGIN_HREF}>
            Войти в систему. <span>↗</span>
          </a>
        </div>
      </main>
    </>
  );
}
