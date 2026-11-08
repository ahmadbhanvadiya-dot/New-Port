"use client";

import { useEffect, useRef } from "react";

type Props = { chaos: boolean; onToggleChaos: () => void };

/**
 * The gold "kinetic lane" ticker.
 * - Speeds up (and skews) with your scroll speed; scrolling up makes it run backwards.
 * - Slows down while you hover it, and follows the cursor with a soft spotlight.
 * - Drag it to scrub, fling it and it coasts on momentum.
 * - Every phrase has its own colour that floods in on hover.
 */
export default function KineticLane({ chaos, onToggleChaos }: Props) {
  const laneRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const lane = laneRef.current;
    const track = trackRef.current;
    if (!lane || !track) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const BASE = reduce ? 18 : 70; // idle speed, px/s (to the left)

    let x = 0;
    let half = 1;
    let hoverFactor = 1;
    let hovering = false;
    let dragging = false;
    let dragLastX = 0;
    let dragLastT = 0;
    let fling = 0;
    let scrollV = 0;
    let lastScrollY = window.scrollY;
    let lastScrollT = performance.now();
    let skew = 0;
    let visible = true;
    let raf = 0;
    let last = performance.now();

    const measure = () => {
      half = Math.max(1, track.scrollWidth / 2);
    };

    const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!visible) return;

      hoverFactor += ((hovering ? 0.3 : 1) - hoverFactor) * Math.min(1, 6 * dt);
      scrollV *= Math.exp(-4 * dt);
      fling *= Math.exp(-2.6 * dt);

      const idle = -BASE * hoverFactor;
      const speed = dragging ? 0 : idle - scrollV * 0.9 + fling;
      if (!dragging) x += speed * dt;

      if (x <= -half) x += half;
      if (x > 0) x -= half;

      const extra = dragging ? fling : speed - idle;
      const skewTarget = reduce ? 0 : clamp(extra * -0.012, -14, 14);
      skew += (skewTarget - skew) * Math.min(1, 10 * dt);

      track.style.transform = `translate3d(${x.toFixed(2)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
      lane.style.setProperty("--lane-speed", clamp(Math.abs(extra) / 900, 0, 1).toFixed(3));
    };

    const onScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      const dt = Math.max((now - lastScrollT) / 1000, 0.008);
      const v = clamp((y - lastScrollY) / dt, -3000, 3000);
      scrollV += (v - scrollV) * 0.4;
      lastScrollY = y;
      lastScrollT = now;
    };

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") hovering = true;
    };
    const onLeave = () => {
      hovering = false;
    };
    const onMove = (e: PointerEvent) => {
      const rect = lane.getBoundingClientRect();
      lane.style.setProperty("--lx", `${e.clientX - rect.left}px`);
      lane.style.setProperty("--ly", `${e.clientY - rect.top}px`);
      if (dragging) {
        const now = performance.now();
        const dx = e.clientX - dragLastX;
        const dtm = Math.max((now - dragLastT) / 1000, 0.008);
        x += dx;
        fling += (clamp(dx / dtm, -2500, 2500) - fling) * 0.5;
        dragLastX = e.clientX;
        dragLastT = now;
      }
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || (e.target as HTMLElement).closest(".ticker-controls")) return;
      dragging = true;
      dragLastX = e.clientX;
      dragLastT = performance.now();
      fling = 0;
      lane.classList.add("is-dragging");
      lane.setPointerCapture?.(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      lane.classList.remove("is-dragging");
      lane.releasePointerCapture?.(e.pointerId);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      last = performance.now();
    });
    io.observe(lane);

    const ro = new ResizeObserver(measure);
    ro.observe(track);
    measure();

    window.addEventListener("scroll", onScroll, { passive: true });
    lane.addEventListener("pointerenter", onEnter);
    lane.addEventListener("pointerleave", onLeave);
    lane.addEventListener("pointermove", onMove);
    lane.addEventListener("pointerdown", onDown);
    lane.addEventListener("pointerup", onUp);
    lane.addEventListener("pointercancel", onUp);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      lane.removeEventListener("pointerenter", onEnter);
      lane.removeEventListener("pointerleave", onLeave);
      lane.removeEventListener("pointermove", onMove);
      lane.removeEventListener("pointerdown", onDown);
      lane.removeEventListener("pointerup", onUp);
      lane.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <section
      ref={laneRef}
      className={`ticker kinetic-lane ${chaos ? "ticker-chaos" : ""}`}
      aria-label="Ideas in motion"
    >
      <i className="lane-bar lane-bar-top" aria-hidden="true" />
      <i className="lane-bar lane-bar-bottom" aria-hidden="true" />
      <i className="lane-spot" aria-hidden="true" />
      <span className="lane-hint" aria-hidden="true">DRAG ME · SCROLL TO SPEED UP</span>

      <div className="marquee-track" ref={trackRef}>
        {[0, 1].map((set) => (
          <div className="ticker-set" key={set} aria-hidden={set === 1 ? "true" : undefined}>
            <span className="ticker-item ticker-item-1"><small>01</small> CHASE THE DREAM <b>✳</b></span>
            <span className="ticker-item ticker-item-outline ticker-item-2"><small>02</small> SAIL BEYOND THE MAP <b>✳</b></span>
            <span className="ticker-item ticker-item-3"><small>03</small> STAY HUMBLE, NAKAMA <b>☻</b></span>
            <span className="ticker-item ticker-item-outline ticker-item-4"><small>04</small> FIND YOUR ALL BLUE <b>✳</b></span>
            <span className="ticker-item ticker-item-sticker ticker-item-5">JUST A HUMAN WITH A KEYBOARD &amp; A DREAM <b>↗</b></span>
          </div>
        ))}
      </div>

      <div className="ticker-controls">
        <button
          className="ticker-flash"
          type="button"
          aria-label={chaos ? "Turn off chaos mode" : "Turn on chaos mode"}
          aria-pressed={chaos}
          onClick={onToggleChaos}
          title={chaos ? "Tame the chaos" : "Turn up the chaos"}
        >
          <span>{chaos ? "−" : "✳"}</span>
          <small>{chaos ? "TAME IT" : "MORE CHAOS"}</small>
        </button>
      </div>
    </section>
  );
}
