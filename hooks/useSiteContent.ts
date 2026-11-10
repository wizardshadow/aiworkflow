"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_CONTENT,
  mergeSiteContent,
  type SiteContent,
} from "../lib/site-content";

function contentUrl(): string {
  if (typeof window === "undefined") return "/content.json";
  const base = document.querySelector("base")?.href;
  try {
    return new URL("content.json", base || window.location.href).pathname;
  } catch {
    return "/content.json";
  }
}

export function useSiteContent(): SiteContent {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);

  useEffect(() => {
    let cancelled = false;
    const url = `${contentUrl()}?t=${Date.now()}`;
    fetch(url, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setContent(mergeSiteContent(data));
      })
      .catch(() => {
        /* keep seed defaults */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return content;
}
