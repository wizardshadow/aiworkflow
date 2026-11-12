"use client";

import { useEffect, useRef } from "react";

const GC_WIDGET_SCRIPT_ID = "19e17b8b985187efc847b6739d21c94717a2d960";
const GC_WIDGET_SRC =
  "https://modulesclub.getcourse.ru/pl/lite/widget/script?id=1681648";
const GC_START_EVENT = `StartWidget${GC_WIDGET_SCRIPT_ID}`;

type GetCourseEnrollWidgetProps = {
  /** Load third-party widget only after enroll dialog opens. */
  enabled?: boolean;
};

/** Mount GetCourse lite widget once into a stable host (script → iframe). */
export default function GetCourseEnrollWidget({
  enabled = false,
}: GetCourseEnrollWidgetProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const host = hostRef.current;
    if (!host) return;
    if (host.querySelector("iframe")) return;

    let script = document.getElementById(
      GC_WIDGET_SCRIPT_ID
    ) as HTMLScriptElement | null;

    const startIfNeeded = () => {
      if (!document.getElementById(GC_WIDGET_SCRIPT_ID)) return;
      if (document.readyState === "loading") return;
      document.dispatchEvent(new Event(GC_START_EVENT));
    };

    if (!script) {
      script = document.createElement("script");
      script.id = GC_WIDGET_SCRIPT_ID;
      script.src = GC_WIDGET_SRC;
      script.async = true;
      script.addEventListener("load", startIfNeeded);
      // Append into host so the lite widget finds a nearby mount point.
      host.appendChild(script);
    } else {
      startIfNeeded();
    }

    return () => {
      script?.removeEventListener("load", startIfNeeded);
    };
  }, [enabled]);

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
