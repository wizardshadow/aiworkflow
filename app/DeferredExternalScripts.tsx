"use client";

import { useEffect, useRef } from "react";

type DeferredExternalScriptsProps = {
  /** Optional hint from parent; component also fetches content.json itself. */
  html?: string;
};

/** Nodes we appended to <body> (no wrapper div). */
let injectedNodes: ChildNode[] = [];
let injectedFingerprint = "";

function contentJsonUrl(): string {
  if (typeof window === "undefined") return "/content.json";
  const base = document.querySelector("base")?.href;
  try {
    return new URL("content.json", base || window.location.href).pathname;
  } catch {
    return "/content.json";
  }
}

function fingerprint(source: string): string {
  let h = 0;
  for (let i = 0; i < source.length; i++) {
    h = (Math.imul(31, h) + source.charCodeAt(i)) | 0;
  }
  return `${source.length}:${h}`;
}

function clearPreviousInject(): void {
  for (const node of injectedNodes) {
    node.parentNode?.removeChild(node);
  }
  injectedNodes = [];
  injectedFingerprint = "";
  // Remove legacy wrapper from previous deploy.
  document.getElementById("aw-external-scripts")?.remove();
}

/**
 * Append trusted admin HTML as real DOM nodes at the end of <body>
 * — actual <script> / <noscript> siblings of body children, not a div wrapper
 * and not HTML stored in a data-* attribute.
 */
function injectHtml(source: string): void {
  const trimmed = source.trim();
  if (!trimmed) return;

  const fp = fingerprint(trimmed);
  if (fp === injectedFingerprint && injectedNodes.length > 0) return;

  clearPreviousInject();

  const template = document.createElement("template");
  template.innerHTML = trimmed;
  const created: ChildNode[] = [];

  const appendNode = (node: ChildNode) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? "";
      if (!text.trim()) return;
      const textNode = document.createTextNode(text);
      document.body.appendChild(textNode);
      created.push(textNode);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const el = node as HTMLElement;
    if (el.tagName === "SCRIPT") {
      // Recreate so the browser executes (innerHTML <script> is inert).
      const script = document.createElement("script");
      for (const attr of el.attributes) {
        script.setAttribute(attr.name, attr.value);
      }
      if (el.textContent) script.text = el.textContent;
      if (!script.src && !script.getAttribute("type")) {
        script.type = "text/javascript";
      }
      document.body.appendChild(script);
      created.push(script);
      return;
    }

    const clone = el.cloneNode(true) as HTMLElement;
    document.body.appendChild(clone);
    created.push(clone);
  };

  Array.from(template.content.childNodes).forEach(appendNode);
  injectedNodes = created;
  injectedFingerprint = fp;
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
      timeoutId = window.setTimeout(() => {
        if (document.readyState === "complete") schedule();
      }, 0);
    };

    if (html.trim()) run(html);

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
