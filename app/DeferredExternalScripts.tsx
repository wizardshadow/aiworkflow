"use client";

import { useEffect, useRef } from "react";

type DeferredExternalScriptsProps = {
  html: string;
};

/**
 * Injects trusted admin HTML/JS after window load + idle, at end of body.
 * Does not run in <head> and does not block LCP/FCP.
 */
export default function DeferredExternalScripts({
  html,
}: DeferredExternalScriptsProps) {
  const injected = useRef(false);

  useEffect(() => {
    const source = (html || "").trim();
    if (!source || injected.current) return;

    let idleId = 0;
    let timeoutId = 0;
    let cancelled = false;

    const mount = () => {
      if (cancelled || injected.current) return;
      injected.current = true;

      let host = document.getElementById("aw-external-scripts");
      if (!host) {
        host = document.createElement("div");
        host.id = "aw-external-scripts";
        host.setAttribute("data-aw-deferred", "1");
        document.body.appendChild(host);
      }
      host.replaceChildren();

      const template = document.createElement("template");
      template.innerHTML = source;

      const appendNode = (node: ChildNode) => {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          host!.appendChild(node.cloneNode(true));
          return;
        }
        const el = node as HTMLElement;
        if (el.tagName === "SCRIPT") {
          const script = document.createElement("script");
          for (const attr of el.attributes) {
            script.setAttribute(attr.name, attr.value);
          }
          if (el.textContent) script.text = el.textContent;
          // Keep execution deferred relative to parser; we already waited for load/idle.
          if (!script.src && !script.getAttribute("type")) {
            script.type = "text/javascript";
          }
          host!.appendChild(script);
          return;
        }
        host!.appendChild(el.cloneNode(true));
      };

      template.content.childNodes.forEach((node) => appendNode(node));
    };

    const schedule = () => {
      const ric = (
        window as Window & {
          requestIdleCallback?: (
            cb: IdleRequestCallback,
            opts?: IdleRequestOptions
          ) => number;
        }
      ).requestIdleCallback;
      if (typeof ric === "function") {
        idleId = ric(() => mount(), { timeout: 3500 });
      } else {
        timeoutId = window.setTimeout(mount, 1);
      }
    };

    if (document.readyState === "complete") {
      schedule();
    } else {
      window.addEventListener("load", schedule, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      const cic = (
        window as Window & {
          cancelIdleCallback?: (id: number) => void;
        }
      ).cancelIdleCallback;
      if (idleId && typeof cic === "function") cic(idleId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [html]);

  return null;
}
