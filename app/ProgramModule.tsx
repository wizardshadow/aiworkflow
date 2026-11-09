"use client";
import { useState, type ReactNode } from "react";

export default function ProgramModule({ index, title, month, weeks, children }: { index: number; title: string; month: string; weeks: string; children: ReactNode }) {
  const [open, setOpen] = useState(index === 0);
  return <article className={`module ${open ? 'is-open' : ''}`}>
    <h3 className="module-heading"><button className="module-trigger" aria-expanded={open} aria-controls={`month-panel-${index}`} id={`month-trigger-${index}`} onClick={() => setOpen(!open)}>
      <span className="module-number">0{index + 1}</span>
      <span><span className="small">{month} / {weeks}</span><span className="module-title">{title}</span></span>
      <span className="module-icon" aria-hidden="true">+</span>
    </button></h3>
    <div className="module-panel" id={`month-panel-${index}`} role="region" aria-labelledby={`month-trigger-${index}`} aria-hidden={!open} inert={!open}>
      <div className="module-clip">{children}</div>
    </div>
  </article>;
}
