# AI WORKFLOW — nine sections + footer

Reference: https://crox.framer.website/ . Content: supplied Google document; screens 1–9 and footer live on the page.
Observed colors: #e3e7eb background; #1a1b1c text; orange CTA (matched #ff5b0b).
Observed type: locally hosted Sonko, 400 body / 500 headings / 700 hero. Letter-spacing is 0 generally; paragraphs (`p`) use font-size 18px, letter-spacing 1px, font-weight 500. Minimum size is 14px for non-paragraph UI text.
Composition: strong black outer frame, ruled grids, oversized type, squared buttons, engineering photography/video, ticker, restrained reveal motion. Responsive layouts preserve reading order. Reduced motion and explicit pause supported.
Assets are temporary CROX visuals requested by the owner. Image files copied locally; hero video is remote `https://aiworkflow.modules.club/assets/aimain.webm`; market (02) video is remote `https://aiworkflow.modules.club/assets/atrain.webm`; no static poster — browser shows the video first frame (`preload="auto"`). Site boot uses a black / `#ff5b0b` preloader. Fonts are local Sonko. Editable copy and media URLs live in `content.json` (seed defaults in `lib/site-content.ts`); password-protected `/cpanel` on modules.club writes that JSON (no MySQL).
Duration confirmed by owner: 12 weeks in hero and curriculum.
Registration destination not supplied: buttons open an honest preview dialog; no contact data collected or submission simulated.

Sections: hero; 01 scenarios; 02 market; 03 workflow; 04 program (accordion, first month open); 05 proof (speaker quote + metrics); 06 audience filter (fit / not fit); 07 pricing value stack + эфир offer; 08 final CTA. Footer: tagline, ИП/ОГРН/ИНН, offer & privacy anchors. Nav links: подход, workflow, программа, доказательства, стоимость.
Program weeks follow the Google Doc topics/results; month headers use contiguous weeks 1–4 / 5–8 / 9–12 so the table stays a clean 12-week map. Hero phrase «За 12 недель» is orange type without a background chip. Continuous marquee.
Motion (ref. bymonolog.com): animated canvas film grain (`app/SiteNoise.tsx`, soft-light overlay, `pointer-events: none`); staggered hero reveal on load; Lenis inertia smooth scroll for wheel and in-page anchors. Respects `prefers-reduced-motion` and the hero pause toggle (grain freezes to one frame).
