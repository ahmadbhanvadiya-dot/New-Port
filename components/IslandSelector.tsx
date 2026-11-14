"use client";

import { useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { ArrowUpRight } from "lucide-react";

type Project = {
  number: string;
  name: string;
  type: string;
  year: string;
  description: string;
  stack: string[];
  theme: "narco" | "commute" | "foresight" | "fresh" | "atlas" | "meridian";
  mark: string;
  href: string;
  live?: string;
  group: "AI / Systems" | "Web" | "Mobile";
};

const PROJECTS: Project[] = [
  {
    number: "01", name: "NarcoLens", type: "AI / COMPUTER VISION · DIGITAL FORENSICS", year: "2026",
    description: "An AI-powered digital companion for field-test documentation and image analysis, built to make test records more traceable.",
    stack: ["Next.js", "TypeScript", "FastAPI", "Image Analysis"], theme: "narco", mark: "N/", group: "AI / Systems",
    href: "https://github.com/ahmadbhanvadiya-dot/narcolens", live: "https://narcolens.vercel.app",
  },
  {
    number: "02", name: "SmartCommute AI", type: "MOBILITY · ROUTE INTELLIGENCE", year: "2026",
    description: "A smarter commuting platform combining transit route planning, real-world GTFS data, map-based discovery, and logistics tools.",
    stack: ["Next.js", "TypeScript", "FastAPI", "GTFS", "Leaflet"], theme: "commute", mark: "SC", group: "AI / Systems",
    href: "https://github.com/ahmadbhanvadiya-dot/Smartcommute-web", live: "https://smartcommute-web-three.vercel.app/dashboard",
  },
  {
    number: "03", name: "ForeSight", type: "AI · OPERATIONAL RISK & WORKFORCE ROUTING", year: "2026",
    description: "A risk-aware work routing platform designed to score delays, evaluate team capacity, and direct requests to suitable employees.",
    stack: ["Next.js", "TypeScript", "Supabase", "Framer Motion"], theme: "foresight", mark: "FS", group: "AI / Systems",
    href: "https://github.com/ahmadbhanvadiya-dot/ForeSight", live: "https://spih-133.vercel.app",
  },
  {
    number: "04", name: "Freshlify", type: "MOBILE · PRODUCT TRACKING", year: "2026",
    description: "QR-powered product freshness and expiry tracking, with inventory tools that help make everyday product information easier to manage.",
    stack: ["Flutter", "Dart", "SQLite", "QR"], theme: "fresh", mark: "F.", group: "Mobile",
    href: "https://github.com/ahmadbhanvadiya-dot/freshlifyv3", live: "https://github.com/ahmadbhanvadiya-dot/Freshlify",
  },
  {
    number: "05", name: "Code Atlas", type: "DEVELOPER TOOLS · WEB", year: "2026",
    description: "A developer-focused web project built with TypeScript, exploring ways to make code and project information easier to navigate.",
    stack: ["Next.js", "TypeScript"], theme: "atlas", mark: "CA", group: "Web",
    href: "https://github.com/ahmadbhanvadiya-dot/code-atlas", live: "https://code-atlas-delta.vercel.app",
  },
  {
    number: "06", name: "Meridian Restro", type: "WEB DESIGN · HOSPITALITY", year: "2025",
    description: "A responsive restaurant website focused on menu discovery, digital presence, and a polished browsing experience.",
    stack: ["HTML", "CSS", "JavaScript"], theme: "meridian", mark: "MR", group: "Web",
    href: "https://github.com/ahmadbhanvadiya-dot/MeridianRestro", live: "https://themeridianrestro.netlify.app/",
  },
];

const FILTERS = ["All work", "AI / Systems", "Web", "Mobile"] as const;
type Filter = (typeof FILTERS)[number];

/**
 * "Island selector" — the project logbook.
 *  - frosted info panel (readable over the 3D background) with proper buttons and tech chips
 *  - 3D-tilting artwork with a cursor shine, and parallax on the panel + giant ghost number
 *  - slide direction follows how you navigate; drag / swipe / arrows / keys all work
 *  - a route-map strip: a little ship sails to whichever island you pick
 */
export default function IslandSelector() {
  const [filter, setFilter] = useState<Filter>("All work");
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);

  const visible = useMemo(() => PROJECTS.filter((p) => filter === "All work" || p.group === filter), [filter]);
  const count = visible.length;
  const active = visible[index % count] ?? PROJECTS[0];
  const countFor = (f: Filter) => (f === "All work" ? PROJECTS.length : PROJECTS.filter((p) => p.group === f).length);

  const drag = useRef({ x: 0, moved: false, down: false });
  const slideRef = useRef<HTMLElement | null>(null);

  const move = (to: number, direction?: number) => {
    if (count < 2) return;
    const next = ((to % count) + count) % count;
    setDir(direction ?? (to > index ? 1 : -1));
    setIndex(next);
  };
  const step = (d: number) => move(index + d, d);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    drag.current = { x: e.clientX, moved: false, down: true };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current.down && Math.abs(e.clientX - drag.current.x) > 8) drag.current.moved = true;
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current.down) return;
    drag.current.down = false;
    const delta = e.clientX - drag.current.x;
    if (Math.abs(delta) > 60) step(delta < 0 ? 1 : -1);
  };
  // dragging across the artwork must not count as a click on its link
  const onClickCapture = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  const tilt = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const el = e.currentTarget;
    el.style.setProperty("--tilt-x", `${((0.5 - y) * 10).toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${((x - 0.5) * 12).toFixed(2)}deg`);
    el.style.setProperty("--shine-x", `${(x * 100).toFixed(1)}%`);
    el.style.setProperty("--shine-y", `${(y * 100).toFixed(1)}%`);
    el.style.setProperty("--card-x", `${(x * 100).toFixed(1)}%`);
    el.style.setProperty("--card-y", `${(y * 100).toFixed(1)}%`);
    el.style.setProperty("--depth-x", `${((x - 0.5) * 18).toFixed(1)}px`);
    el.style.setProperty("--depth-y", `${((y - 0.5) * 18).toFixed(1)}px`);
    slideRef.current?.style.setProperty("--px", ((x - 0.5) * 2).toFixed(3));
    slideRef.current?.style.setProperty("--py", ((y - 0.5) * 2).toFixed(3));
  };
  const untilt = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    ["--tilt-x", "--tilt-y", "--depth-x", "--depth-y"].forEach((k) => el.style.setProperty(k, k.startsWith("--tilt") ? "0deg" : "0px"));
    el.style.setProperty("--card-x", "50%");
    el.style.setProperty("--card-y", "50%");
    slideRef.current?.style.setProperty("--px", "0");
    slideRef.current?.style.setProperty("--py", "0");
  };

  const pct = (i: number) => (count > 1 ? (i / (count - 1)) * 100 : 50);

  return (
    <>
      <div className="work-filter-bar" aria-label="Filter projects">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={filter === f ? "filter-active" : ""}
            aria-pressed={filter === f}
            onClick={() => {
              setFilter(f);
              setIndex(0);
              setDir(1);
            }}
          >
            {f}<span>{String(countFor(f)).padStart(2, "0")}</span>
          </button>
        ))}
      </div>

      <div className="project-carousel-shell isl-shell" data-reveal>
        <div className="project-carousel-topline">
          <span><i className="lab-live-dot" /> ISLAND SELECTOR / INTERACTIVE LOGBOOK</span>
          <span>{String(index + 1).padStart(2, "0")} <b>/</b> {String(count).padStart(2, "0")}</span>
        </div>

        <div
          className="isl-viewport"
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured projects. Use the arrow keys, buttons, or drag to switch islands."
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => { drag.current.down = false; }}
          onClickCapture={onClickCapture}
        >
          <button className="isl-arrow isl-arrow-prev" type="button" aria-label="Previous project" disabled={count < 2} onClick={() => step(-1)}>←</button>

          <div className="isl-ghost" key={`ghost-${filter}-${active.name}`} aria-hidden="true">{active.number}</div>

          <article
            className="isl-slide"
            key={`${filter}-${active.name}`}
            ref={slideRef}
            data-dir={dir}
            aria-live="polite"
          >
            <a
              className={`project-art isl-art art-${active.theme}`}
              href={active.href}
              target="_blank"
              rel="noreferrer"
              draggable={false}
              aria-label={`Open ${active.name} on GitHub`}
              onMouseMove={tilt}
              onMouseLeave={untilt}
            >
              <div className="art-grain" />
              <div className="art-top"><span>{active.number} / CASE FILE</span><span>{active.year}</span></div>
              <div className={`art-symbol symbol-${active.theme}`} aria-hidden="true">
                {active.theme === "narco" && <><div className="scan-ring ring-one" /><div className="scan-ring ring-two" /><div className="scan-core">N<span>/</span></div><div className="scan-cross">+</div></>}
                {active.theme === "commute" && <><div className="route-line route-a" /><div className="route-line route-b" /><div className="route-node node-a" /><div className="route-node node-b" /><div className="route-node node-c" /><div className="route-center">SC</div></>}
                {active.theme === "fresh" && <><div className="fresh-orbit orbit-a" /><div className="fresh-orbit orbit-b" /><div className="fresh-core">F.</div><span className="fresh-leaf">✳</span></>}
                {active.theme === "foresight" && <><div className="fs-grid">{Array.from({ length: 25 }).map((_, i) => <i key={i} />)}</div><div className="fs-core">FS<span>◎</span></div><div className="fs-scan">RISK SIGNAL / 03</div></>}
                {active.theme === "atlas" && <><div className="atlas-orbit atlas-a" /><div className="atlas-orbit atlas-b" /><div className="atlas-core">{"{}"}</div><span className="atlas-node node-1">TS</span><span className="atlas-node node-2">JS</span><span className="atlas-node node-3">UI</span></>}
                {active.theme === "meridian" && <><div className="meridian-disc" /><div className="meridian-type">M<br /><span>R</span></div><span className="meridian-label">THE TABLE IS SET</span></>}
              </div>
              <span className="art-monogram">{active.mark}</span>
              <span className="art-hover-label"><span>GRAND LINE DOSSIER</span><b>EXPLORE {active.name.toUpperCase()} ↗</b></span>
              <div className="art-bottom"><span>MOVE YOUR CURSOR / DISCOVER THE ISLAND</span><span className="art-arrow"><ArrowUpRight size={18} /></span></div>
            </a>

            <div className="isl-info">
              <div className="isl-meta">
                <span className="isl-type">{active.type}</span>
                <span className="isl-year">{active.year}</span>
              </div>
              <h3>{active.name}</h3>
              <p>{active.description}</p>
              <ul className="isl-stack" aria-label="Tech stack">
                {active.stack.map((tech) => <li key={tech}>{tech}</li>)}
              </ul>
              <div className="isl-actions">
                <a className="isl-btn isl-btn-primary" href={active.href} target="_blank" rel="noreferrer">
                  View source <ArrowUpRight size={15} />
                </a>
                {active.live && (
                  <a className="isl-btn isl-btn-ghost" href={active.live} target="_blank" rel="noreferrer">
                    Live demo <ArrowUpRight size={15} />
                  </a>
                )}
              </div>
            </div>
          </article>

          <button className="isl-arrow isl-arrow-next" type="button" aria-label="Next project" disabled={count < 2} onClick={() => step(1)}>→</button>
        </div>

        {count > 1 && (
          <div className="isl-route-wrap">
            <div className="isl-route-caption">
              <span>NOW EXPLORING</span>
              <strong>{active.name}</strong>
            </div>
            <div className="isl-route" style={{ ["--pos" as string]: `${pct(index)}%` } as CSSProperties} aria-label="Choose an island">
              <div className="isl-route-line"><i style={{ width: `${pct(index)}%` }} /></div>
              {visible.map((p, i) => (
                <button
                  key={p.name}
                  type="button"
                  className={`isl-node${i === index ? " is-current" : ""}${i < index ? " is-passed" : ""}`}
                  style={{ left: `${pct(i)}%` }}
                  aria-label={`Sail to ${p.name}`}
                  aria-current={i === index ? "true" : undefined}
                  onClick={() => move(i, i > index ? 1 : -1)}
                >
                  <span className="isl-node-label">{p.number} · {p.name}</span>
                  <span className="isl-node-dot" />
                </button>
              ))}
              <span className={`isl-ship${dir < 0 ? " is-back" : ""}`} style={{ left: `${pct(index)}%` }} aria-hidden="true">
                <svg viewBox="0 0 40 36" width="34" height="31">
                  <path d="M20 3 L20 24" stroke="#5a3b25" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M21.5 5 Q33 12 33 22 L21.5 22 Z" fill="#fbf0d6" stroke="#c7ad76" strokeWidth=".8" />
                  <path d="M18.5 8 Q9 14 8 22 L18.5 22 Z" fill="#f0e0b8" stroke="#c7ad76" strokeWidth=".8" />
                  <path d="M4 25 Q20 33 36 25 L32 31 Q20 36 8 31 Z" fill="#6b2a22" />
                  <path d="M4 25 Q20 33 36 25" stroke="#e9bf57" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                  <path d="M20 3 L26 5 L20 7 Z" fill="#b52d32" />
                </svg>
              </span>
            </div>
            <span className="isl-route-hint">DRAG / SWIPE / ARROW KEYS</span>
          </div>
        )}
      </div>
    </>
  );
}
