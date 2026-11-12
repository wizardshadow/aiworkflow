"use client";

import { useEffect, useRef } from "react";

type DeferredExternalScriptsProps = {
  /** Optional hint from parent; component also fetches content.json itself. */
  html?: string;
};

function contentJsonUrl(): string {
  if (typeof window === "undefined") return "/content.json";
  const base = document.querySelector("base")?.href;
  try {
    return new URL("content.json", base || window.location.href).pathname;
  } catch {
    return "/content.json";
  }
}

function injectHtml(source: string): void {
  const trimmed = source.trim();
  if (!trimmed) return;

  let host = document.getElementById("aw-external-scripts");
  if (!host) {
    host = document.createElement("div");
    host.id = "aw-external-scripts";
    host.setAttribute("data-aw-deferred", "1");
    document.body.appendChild(host);
  }

  // Skip re-injecting identical payload.
  if (
    host.getAttribute("data-aw-payload") === trimmed &&
    host.querySelector("script")
  ) {
    return;
  }

  host.replaceChildren();
  host.setAttribute("data-aw-payload", trimmed);

  const template = document.createElement("template");
  template.innerHTML = trimmed;

  const appendNode = (node: ChildNode) => {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      host!.appendChild(node.cloneNode(true));
      return;
    }
    const el = node as HTMLElement;
    if (el.tagName === "SCRIPT") {
      // Recreate so the browser executes the script (innerHTML scripts are inert).
      const script = document.createElement("script");
      for (const attr of el.attributes) {
        script.setAttribute(attr.name, attr.value);
      }
      if (el.textContent) script.text = el.textContent;
      if (!script.src && !script.getAttribute("type")) {
        script.type = "text/javascript";
      }
      host!.appendChild(script);
      return;
    }
    host!.appendChild(el.cloneNode(true));
  };

  template.content.childNodes.forEach((node) => appendNode(node));
}

/**
 * Injects trusted admin HTML/JS after window load + idle, at end of body.
 * Fetches content.json itself so Metrika is not stuck on empty DEFAULT seed
 * while useSiteContent is still hydrating.
 */
export default function DeferredExternalScripts({
  html = "",
}: DeferredExternalScriptsProps) {
  const lastInjected = useRef("");

  useEffect(() => {
    let cancelled = false;
    let idleId = 0;
    let timeoutId = 0;
    const loadListeners: Array<() => void> = [];

    const run = (source: string) => {
      if (cancelled) return;
      const trimmed = (source || "").trim();
      if (!trimmed || trimmed === lastInjected.current) return;

      const mount = () => {
        if (cancelled) return;
        try {
          injectHtml(trimmed);
          lastInjected.current = trimmed;
        } catch {
          /* keep page usable if admin HTML is malformed */
        }
      };

      const schedule = () => {
        if (cancelled) return;
        const ric = (
          window as Window & {
            requestIdleCallback?: (
              cb: IdleRequestCallback,
              opts?: IdleRequestOptions
            ) => number;
          }
        ).requestIdleCallback;
        if (typeof ric === "function") {
          idleId = ric(() => mount(), { timeout: 1500 });
        } else {
          timeoutId = window.setTimeout(mount, 0);
        }
      };

      if (document.readyState === "complete") {
        schedule();
        return;
      }

      const onLoad = () => schedule();
      window.addEventListener("load", onLoad, { once: true });
      loadListeners.push(onLoad);
      // If load raced between the readyState check and addEventListener.
      timeoutId = window.setTimeout(() => {
        if (document.readyState === "complete") schedule();
      }, 0);
    };

    // 1) Parent hint (may be empty DEFAULT on first paint).
    if (html.trim()) run(html);

    // 2) Authoritative runtime fetch — same file cpanel writes.
    fetch(`${contentJsonUrl()}?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const fromJson =
          typeof data.externalScriptsHtml === "string"
            ? data.externalScriptsHtml
            : "";
        run(fromJson);
      })
      .catch(() => {
        /* ignore — keep page without analytics */
      });

    return () => {
      cancelled = true;
      for (const onLoad of loadListeners) {
        window.removeEventListener("load", onLoad);
      }
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
