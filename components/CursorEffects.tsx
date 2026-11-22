"use client";

import { useEffect, useRef } from "react";

/**
 * Soft cursor light + "ghost" circle that follow the mouse.
 *
 * Performance notes: the pointer position is written as CSS variables on these two
 * fixed elements only (once per frame), never on <main>. Custom properties inherit,
 * so writing them on a page-level ancestor forced a style recalculation of the whole
 * page on every mouse move. Both elements move with `transform`, so a move is a
 * compositor-only update. Hover states are classes set here instead of
 * `.site-shell:has(a:hover)`, which made the browser re-check the whole tree.
 *
 * Touch devices, small screens and reduced-motion users get neither (see globals.css).
 */
export default function CursorEffects() {
  const glowRef = useRef<HTMLDivElement | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const glow = glowRef.current;
    const ghost = ghostRef.current;
    if (!glow || !ghost) return;

    let x = 0;
    let y = 0;
    let raf = 0;

    const write = () => {
      raf = 0;
      const px = `${x}px`;
      const py = `${y}px`;
      glow.style.setProperty("--pointer-x", px);
      glow.style.setProperty("--pointer-y", py);
      ghost.style.setProperty("--pointer-x", px);
      ghost.style.setProperty("--pointer-y", py);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(write);
    };

    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const target = e.target instanceof Element ? e.target : null;
      ghost.classList.toggle("is-link", !!target?.closest("a"));
      ghost.classList.toggle("is-hidden", !!target?.closest(".isl-art"));
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={glowRef} className="ambient-cursor-glow" aria-hidden="true" />
      <div ref={ghostRef} className="cursor-ghost" aria-hidden="true" />
    </>
  );
}
