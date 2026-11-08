"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

const LINKS = [
  { id: "work", label: "Work", badge: "06" },
  { id: "about", label: "About" },
  { id: "lab", label: "The lab" },
  { id: "contact", label: "Contact" },
] as const;

type Indicator = { left: number; width: number; visible: boolean };

export default function SiteNav() {
  const headerRef = useRef<HTMLElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const [active, setActive] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [compact, setCompact] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [indicator, setIndicator] = useState<Indicator>({ left: 0, width: 0, visible: false });

  const lit = hovered ?? active;

  /* ---- sliding highlight follows hovered / active link ---- */
  const measure = useCallback(() => {
    const index = LINKS.findIndex((l) => l.id === lit);
    const el = index >= 0 ? linkRefs.current[index] : null;
    const list = listRef.current;
    if (!el || !list) {
      setIndicator((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      return;
    }
    // Measure against the list itself (offsetLeft is relative to each <li>, which would be ~0).
    const listRect = list.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    setIndicator({ left: rect.left - listRect.left, width: rect.width, visible: true });
  }, [lit]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [measure]);

  /* ---- scroll: progress ring, scroll-spy, compact + hide-on-scroll-down ---- */
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const header = headerRef.current;
      if (header) {
        header.style.setProperty("--nv-p", Math.min(1, Math.max(0, y / max)).toFixed(4));
        header.style.setProperty("--nv-rot", `${(y * 0.22).toFixed(1)}deg`);
      }

      // scroll-spy: the last section whose top has passed ~40% of the viewport
      let current: string | null = null;
      for (const link of LINKS) {
        const section = document.getElementById(link.id);
        if (section && section.getBoundingClientRect().top <= window.innerHeight * 0.4) {
          current = link.id;
        }
      }
      setActive(current);

      setCompact(y > 40);
      const delta = y - lastY;
      if (y < 100) setHidden(false);
      else if (delta > 8) setHidden(true);
      else if (delta < -8) setHidden(false);
      lastY = y;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* ---- close mobile menu on Escape / when resized to desktop ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    const onResize = () => window.innerWidth > 900 && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  /* ---- cursor-following glow inside the bar ---- */
  const onBarMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const bar = barRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    bar.style.setProperty("--gx", `${e.clientX - rect.left}px`);
    bar.style.setProperty("--gy", `${e.clientY - rect.top}px`);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      ref={headerRef}
      className={`site-header nv-shell${compact ? " is-compact" : ""}${hidden && !menuOpen ? " is-hidden" : ""}${menuOpen ? " is-open" : ""}`}
    >
      <div className="nv-bar" ref={barRef} onPointerMove={onBarMove}>
        <a href="#top" className="nv-brand" aria-label="Ahmad Bhanvadiya home" onClick={closeMenu}>
          <span className="nv-mark" aria-hidden="true">
            <span className="nv-ring" />
            <span className="nv-letter">a<i>.</i></span>
          </span>
          <span className="nv-id">
            <b>AHMAD BHANVADIYA</b>
            <em>Captain of code</em>
          </span>
        </a>

        <nav className="nv-nav" aria-label="Main navigation">
          <ul className="nv-links" ref={listRef} onPointerLeave={() => setHovered(null)}>
            <li
              className="nv-ind"
              aria-hidden="true"
              style={{
                transform: `translateX(${indicator.left}px)`,
                width: indicator.width,
                opacity: indicator.visible ? 1 : 0,
              }}
            />
            {LINKS.map((link, i) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  ref={(el) => {
                    linkRefs.current[i] = el;
                  }}
                  className={`nv-link${lit === link.id ? " is-lit" : ""}`}
                  aria-current={active === link.id ? "true" : undefined}
                  onPointerEnter={() => setHovered(link.id)}
                  onFocus={() => setHovered(link.id)}
                  onBlur={() => setHovered(null)}
                >
                  <span className="nv-idx">0{i + 1}</span>
                  {link.label}
                  {"badge" in link && <span className="nv-badge">{link.badge}</span>}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nv-right">
          <a href="#contact" className="nv-chip" aria-label="Open to new adventures — get in touch">
            <span className="nv-dot" aria-hidden="true" />
            <span className="nv-chip-text" aria-hidden="true">
              <span>OPEN TO NEW ADVENTURES</span>
              <span>LET&rsquo;S TALK <ArrowUpRight size={11} strokeWidth={2.2} /></span>
            </span>
          </a>
          <button
            type="button"
            className="nv-toggle"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="nv-panel"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="nv-progress" aria-hidden="true"><i /></div>
      </div>

      <div id="nv-panel" className="nv-panel" aria-hidden={!menuOpen}>
        <ul>
          {LINKS.map((link, i) => (
            <li key={link.id} style={{ ["--i" as string]: i }}>
              <a
                href={`#${link.id}`}
                onClick={closeMenu}
                tabIndex={menuOpen ? 0 : -1}
                aria-current={active === link.id ? "true" : undefined}
              >
                <span className="nv-p-idx">0{i + 1}</span>
                <span className="nv-p-label">{link.label}</span>
                <ArrowUpRight size={20} />
              </a>
            </li>
          ))}
        </ul>
        <a href="#contact" onClick={closeMenu} className="nv-p-cta" tabIndex={menuOpen ? 0 : -1}>
          <span className="nv-dot" aria-hidden="true" /> OPEN TO NEW ADVENTURES — SAY HELLO
        </a>
      </div>
    </header>
  );
}
