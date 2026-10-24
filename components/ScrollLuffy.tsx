"use client";

import { useEffect, useRef } from "react";

/** A lightweight, scroll-position companion. It uses vector artwork rather than a heavy video. */
export default function ScrollLuffy() {
  const runnerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const runner = runnerRef.current;
    if (!runner) return;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;

    const update = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
        runner.style.top = `${progress * 100}%`;
        runner.classList.add("is-running");
        if (settleTimer) clearTimeout(settleTimer);
        settleTimer = setTimeout(() => runner.classList.remove("is-running"), 220);
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (settleTimer) clearTimeout(settleTimer);
    };
  }, []);

  return (
    <aside className="scroll-luffy-track" aria-label="Luffy scroll companion">
      <span className="scroll-luffy-rail" aria-hidden="true" />
      <span className="scroll-luffy-caption" aria-hidden="true">GRAND LINE</span>
      <div className="scroll-luffy-runner" ref={runnerRef} title="Luffy runs along with your scroll">
        <svg viewBox="0 0 88 64" role="img" aria-label="Stylized Luffy in a straw hat running"><g transform="translate(0 64) rotate(-90)">
          <g className="luffy-shadow"><ellipse cx="32" cy="82" rx="19" ry="3.5" /></g>
          <g className="luffy-back-arm"><path d="M25 35 Q13 40 10 51" fill="none" stroke="#e8b28a" strokeWidth="7" strokeLinecap="round"/><path d="M10 51 l-3 5" fill="none" stroke="#e8b28a" strokeWidth="6" strokeLinecap="round"/></g>
          <g className="luffy-back-leg"><path d="M28 59 Q21 68 15 74" fill="none" stroke="#245b91" strokeWidth="9" strokeLinecap="round"/><path d="M15 74 l-5 4" fill="none" stroke="#9b5534" strokeWidth="6" strokeLinecap="round"/></g>
          <g className="luffy-front-leg"><path d="M38 58 Q46 64 48 73" fill="none" stroke="#245b91" strokeWidth="9" strokeLinecap="round"/><path d="M48 73 l7 2" fill="none" stroke="#9b5534" strokeWidth="6" strokeLinecap="round"/></g>
          <path d="M24 30 Q31 26 40 32 L43 55 Q33 62 22 54 Z" fill="#c93636" stroke="#8f2527" strokeWidth="1.4"/>
          <path d="M25 34 L39 34 M24 39 L40 39" stroke="#f1c6a4" strokeWidth="1.4" opacity=".7"/>
          <g className="luffy-front-arm"><path d="M40 36 Q51 38 52 48" fill="none" stroke="#e8b28a" strokeWidth="7" strokeLinecap="round"/><path d="M52 48 l4 3" fill="none" stroke="#e8b28a" strokeWidth="6" strokeLinecap="round"/></g>
          <path d="M27 53 L38 53 L40 61 L25 61 Z" fill="#d9b34f"/>
          <g className="luffy-head">
            <ellipse cx="32" cy="23" rx="13" ry="14" fill="#e8b28a"/>
            <path d="M19 24 Q15 11 26 8 L31 10 L37 7 Q46 12 45 23 L41 20 L37 16 L32 20 L27 15 L22 25 Z" fill="#171b22" stroke="#10151c" strokeWidth="1"/>
            <path d="M24 24 Q28 21 31 24" fill="none" stroke="#25201d" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M36 24 Q39 21 41 24" fill="none" stroke="#25201d" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M29 29 Q33 31 37 28" fill="none" stroke="#9b5534" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M10 15 Q13 7 23 7 Q35 3 45 8 Q51 10 54 15 Q34 12 10 19 Z" fill="#f0c84b" stroke="#a87c27" strokeWidth="1.3"/>
            <path d="M14 16 Q31 11 50 16" fill="none" stroke="#c93636" strokeWidth="4.2"/>
            <path d="M21 8 Q31 5 42 8" fill="none" stroke="#ffe38b" strokeWidth="1.5" strokeLinecap="round"/>
          </g>
          </g>
        </svg>
      </div>
    </aside>
  );
}
