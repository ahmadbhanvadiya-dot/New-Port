"use client";

import { useEffect, useRef } from "react";

/** Vertical scroll companion — Luffy runs upright along a right-side rail. */
export default function ScrollLuffy() {
  const runnerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const settleRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const runner = runnerRef.current;
    if (!runner) return;

    const update = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
        runner.style.top = `${progress * 100}%`;
        runner.classList.add("is-running");
        if (settleRef.current) clearTimeout(settleRef.current);
        settleRef.current = setTimeout(() => runner.classList.remove("is-running"), 200);
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (settleRef.current) clearTimeout(settleRef.current);
    };
  }, []);

  return (
    <aside className="luffy-track" aria-label="Luffy scroll companion">
      {/* Rail line */}
      <span className="luffy-rail" aria-hidden="true" />
      {/* Caption */}
      <span className="luffy-caption" aria-hidden="true">GRAND LINE</span>

      {/* Runner character — upright figure */}
      <div className="luffy-runner" ref={runnerRef} aria-label="Luffy running with the page scroll">
        <svg
          viewBox="0 0 56 92"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-hidden="true"
          className="luffy-svg"
        >
          {/* ── SHADOW ── */}
          <ellipse className="luffy-ground-shadow" cx="28" cy="89" rx="12" ry="2.5" fill="rgba(23,32,42,0.18)" />

          {/* ── BACK LEG ── */}
          <g className="luffy-leg-back">
            {/* upper back leg */}
            <path d="M24 58 Q18 65 16 73" stroke="#1a4a82" strokeWidth="6.5" strokeLinecap="round" />
            {/* lower back leg */}
            <path d="M16 73 Q14 79 13 83" stroke="#1a4a82" strokeWidth="6" strokeLinecap="round" />
            {/* back shoe */}
            <ellipse cx="12" cy="84" rx="5" ry="3" fill="#7a3c1e" />
          </g>

          {/* ── BACK ARM ── */}
          <g className="luffy-arm-back">
            <path d="M22 42 Q13 48 10 57" stroke="#d4916a" strokeWidth="6" strokeLinecap="round" />
            <ellipse cx="10" cy="59" rx="4" ry="3.5" fill="#d4916a" />
          </g>

          {/* ── SHORTS ── */}
          <path d="M18 55 Q24 62 32 62 Q40 62 36 55 L34 44 Q28 48 22 44 Z" fill="#244b8a" />
          {/* belt */}
          <rect x="20" y="43" width="16" height="3.5" rx="1.5" fill="#8a6a3a" />

          {/* ── TORSO / SHIRT ── */}
          <path d="M21 28 Q28 24 35 28 L37 43 Q28 47 19 43 Z" fill="#c0392b" />
          {/* shirt stripe */}
          <path d="M22 33 L34 33" stroke="#f1a199" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <path d="M21 38 L35 38" stroke="#f1a199" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

          {/* ── FRONT ARM ── */}
          <g className="luffy-arm-front">
            <path d="M34 40 Q44 44 46 53" stroke="#d4916a" strokeWidth="6" strokeLinecap="round" />
            <ellipse cx="46" cy="55" rx="4" ry="3.5" fill="#d4916a" />
          </g>

          {/* ── FRONT LEG ── */}
          <g className="luffy-leg-front">
            {/* upper */}
            <path d="M32 59 Q37 65 40 73" stroke="#1e5ba8" strokeWidth="6.5" strokeLinecap="round" />
            {/* lower */}
            <path d="M40 73 Q42 79 43 83" stroke="#1e5ba8" strokeWidth="6" strokeLinecap="round" />
            {/* front shoe */}
            <ellipse cx="44" cy="84" rx="5" ry="3" fill="#9b5029" />
          </g>

          {/* ── NECK ── */}
          <rect x="25" y="23" width="6" height="6" rx="3" fill="#d4916a" />

          {/* ── HEAD ── */}
          <g className="luffy-head">
            {/* head base */}
            <ellipse cx="28" cy="16" rx="13" ry="13.5" fill="#d9966e" />
            {/* scar under left eye */}
            <path d="M20 16 L22 18" stroke="#b52d32" strokeWidth="1.8" strokeLinecap="round" />
            {/* left eye */}
            <ellipse cx="22.5" cy="14" rx="2.8" ry="2.8" fill="#1a1208" />
            <ellipse cx="23.1" cy="13.4" rx="0.9" ry="0.9" fill="white" />
            {/* right eye */}
            <ellipse cx="33.5" cy="14" rx="2.8" ry="2.8" fill="#1a1208" />
            <ellipse cx="34.1" cy="13.4" rx="0.9" ry="0.9" fill="white" />
            {/* smile */}
            <path d="M22 19 Q28 24 34 19" stroke="#7a3414" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            {/* teeth */}
            <path d="M25 20 Q28 22.5 31 20" fill="white" />

            {/* ── STRAW HAT ── */}
            {/* brim */}
            <ellipse cx="28" cy="6" rx="18" ry="4.5" fill="#e8c84f" stroke="#9a7520" strokeWidth="1.2" />
            {/* crown */}
            <path d="M14 6 Q16 -3 28 -4 Q40 -3 42 6 Z" fill="#e8c84f" stroke="#9a7520" strokeWidth="1.2" />
            {/* highlight on brim */}
            <ellipse cx="24" cy="4.5" rx="7" ry="1.5" fill="rgba(255,255,255,0.3)" />
            {/* red band */}
            <path d="M12 6.5 Q28 8.5 44 6.5" stroke="#b52d32" strokeWidth="3.2" strokeLinecap="round" />
          </g>
        </svg>

        {/* Speed lines — only visible when running */}
        <span className="luffy-speed-lines" aria-hidden="true">
          <i /><i /><i />
        </span>
      </div>
    </aside>
  );
}
