"use client";

import { useEffect, useRef } from "react";

const GC_WIDGET_SCRIPT_ID = "19e17b8b985187efc847b6739d21c94717a2d960";
const GC_WIDGET_SRC =
  "https://modulesclub.getcourse.ru/pl/lite/widget/script?id=1681648";
const GC_START_EVENT = `StartWidget${GC_WIDGET_SCRIPT_ID}`;

/** Mount GetCourse lite widget once into a stable host (script → iframe). */
export default function GetCourseEnrollWidget() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (host.querySelector("iframe")) return;
    if (document.getElementById(GC_WIDGET_SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = GC_WIDGET_SCRIPT_ID;
    script.src = GC_WIDGET_SRC;
    script.async = true;

    const startIfNeeded = () => {
      // Lite widget listens for DOMContentLoaded OR StartWidget{id}.
      // After first paint DOMContentLoaded has usually already fired.
      if (!document.getElementById(GC_WIDGET_SCRIPT_ID)) return;
      if (document.readyState === "loading") return;
      document.dispatchEvent(new Event(GC_START_EVENT));
    };

    script.addEventListener("load", startIfNeeded);
    host.appendChild(script);

    return () => {
      script.removeEventListener("load", startIfNeeded);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="gc-widget-host"
      data-gc-widget-id="1681648"
      // Success URL after payment is configured in GetCourse widget settings:
      // https://wizardshadow.github.io/aiworkflow/success.html
    />
  );
}
