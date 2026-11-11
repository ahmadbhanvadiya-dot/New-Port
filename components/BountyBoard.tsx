"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";

type Skill = { name: string; src: string; bounty: number; role: string; note: string };

// Edit these to match your own skills — the bounties are just for fun.
const SKILLS: Skill[] = [
  { name: "React", src: "/posters/react.webp", bounty: 1_500_000_000, role: "Interface Navigator", note: "Where my interfaces come alive." },
  { name: "TypeScript", src: "/posters/typescript.webp", bounty: 1_000_000_000, role: "Quartermaster of Types", note: "Keeps the whole crew in line." },
  { name: "Next.js", src: "/posters/nextjs.webp", bounty: 1_200_000_000, role: "The Ship's Engine", note: "Pages that sail fast." },
  { name: "Python", src: "/posters/python.webp", bounty: 900_000_000, role: "Navigator of Data", note: "Glue, scripts and quick experiments." },
  { name: "Supabase", src: "/posters/supabase.webp", bounty: 800_000_000, role: "Keeper of the Treasure", note: "Auth, data and storage on tap." },
  { name: "Flutter", src: "/posters/flutter.webp", bounty: 750_000_000, role: "Deckhand on Every Device", note: "One codebase, every screen." },
];

const RAISE_STEP = 50_000_000;
const fmt = (n: number) => `฿${n.toLocaleString("en-US")}`;

type Coin = { dx: number; dy: number; rot: number; d: number };

/** Rolls a number up/down to its new value. */
function Counter({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const a = from.current;
    if (a === value) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 900);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = Math.round(a + (value - a) * eased);
      from.current = v;
      setShown(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{fmt(shown)}</>;
}

/**
 * Interactive skill "bounty board":
 *  - posters hang from a nail and swing when they arrive, then sway gently
 *  - drag a poster and throw it away; click it to flip it over to its case file
 *  - 3D tilt with a foil glare that follows your cursor
 *  - neighbouring posters peek in from the sides (click one to bring it forward)
 *  - "Raise the bounty" counts up and showers the board with coins
 */
export default function BountyBoard() {
  const total = SKILLS.length;
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [extra, setExtra] = useState<number[]>(() => SKILLS.map(() => 0));
  const [coins, setCoins] = useState<{ id: number; items: Coin[] }[]>([]);
  const [stamp, setStamp] = useState<{ index: number; key: number } | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timers = useRef<number[]>([]);
  const drag = useRef({ active: false, startX: 0, dx: 0, moved: false, onActive: false, cardIndex: 0, card: null as HTMLDivElement | null });

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const bounty = (i: number) => SKILLS[i].bounty + extra[i];

  const go = useCallback(
    (dir: number) => {
      setFlipped(false);
      setIndex((i) => (i + dir + total) % total);
    },
    [total]
  );
  const goTo = (i: number) => {
    setFlipped(false);
    setIndex(i);
  };

  /* ---------- pointer: tilt, drag-to-throw, click-to-flip ---------- */
  const resetVars = (card: HTMLElement | null, keepTilt = false) => {
    if (!card) return;
    card.style.setProperty("--dx", "0px");
    card.style.setProperty("--drot", "0deg");
    if (!keepTilt) {
      card.style.setProperty("--tx", "0deg");
      card.style.setProperty("--ty", "0deg");
      card.dataset.hover = "false";
    }
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest(".poster-arrow")) return;
    const card = target.closest(".bb-card") as HTMLDivElement | null;
    if (!card) return;
    const d = drag.current;
    d.active = true;
    d.startX = e.clientX;
    d.dx = 0;
    d.moved = false;
    d.card = card;
    d.cardIndex = Number(card.dataset.i);
    d.onActive = card.dataset.off === "0";
    if (d.onActive) card.classList.add("is-dragging");
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d.active) {
      if (!d.onActive || !d.card) return;
      d.dx = e.clientX - d.startX;
      if (Math.abs(d.dx) > 6) d.moved = true;
      d.card.style.setProperty("--dx", `${d.dx}px`);
      d.card.style.setProperty("--drot", `${Math.max(-18, Math.min(18, d.dx * 0.045))}deg`);
      return;
    }
    if (e.pointerType !== "mouse") return;
    const card = cardRefs.current[index];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) {
      resetVars(card);
      return;
    }
    card.style.setProperty("--tx", `${((0.5 - y) * 16).toFixed(2)}deg`);
    card.style.setProperty("--ty", `${((x - 0.5) * 18).toFixed(2)}deg`);
    card.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
    card.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
    card.dataset.hover = "true";
  };

  const finishPointer = (e: ReactPointerEvent<HTMLDivElement>, cancelled = false) => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    const card = d.card;
    card?.classList.remove("is-dragging");
    if (d.onActive) {
      if (!cancelled && Math.abs(d.dx) > 90) {
        resetVars(card, true);
        go(d.dx < 0 ? 1 : -1);
      } else if (!cancelled && !d.moved) {
        resetVars(card, true);
        setFlipped((f) => !f);
      } else {
        resetVars(card, true);
      }
    } else if (!cancelled && !d.moved) {
      goTo(d.cardIndex);
    }
    d.card = null;
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
    else if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
      e.preventDefault();
      setFlipped((f) => !f);
    }
  };

  /* ---------- raise the bounty ---------- */
  const raise = () => {
    setExtra((prev) => prev.map((v, i) => (i === index ? v + RAISE_STEP : v)));
    const id = Date.now();
    const items: Coin[] = Array.from({ length: 18 }, () => ({
      dx: (Math.random() - 0.5) * 460,
      dy: -(90 + Math.random() * 200),
      rot: (Math.random() - 0.5) * 720,
      d: Math.random() * 0.2,
    }));
    setCoins((c) => [...c, { id, items }]);
    setStamp({ index, key: id });
    timers.current.push(window.setTimeout(() => setCoins((c) => c.filter((x) => x.id !== id)), 1800));
  };

  return (
    <div className="poster-carousel-wrap bb-wrap" data-reveal>
      <div className="poster-carousel-meta">
        <span><i className="lab-live-dot" /> SKILL BOUNTY ARCHIVE</span>
        <span>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
      </div>

      <div
        ref={stageRef}
        className="bb-stage"
        role="region"
        aria-roledescription="carousel"
        aria-label="Skill wanted posters. Drag a poster, click it to flip it, or use the arrow keys."
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => finishPointer(e)}
        onPointerCancel={(e) => finishPointer(e, true)}
        onPointerLeave={() => {
          if (!drag.current.active) resetVars(cardRefs.current[index]);
        }}
      >
        <button className="poster-arrow poster-arrow-prev" type="button" aria-label="Previous skill poster" onClick={() => go(-1)}>←</button>

        <div className="bb-track">
          {SKILLS.map((skill, i) => {
            const raw = (i - index + total) % total;
            const off = raw > total / 2 ? raw - total : raw;
            const abs = Math.abs(off);
            const active = off === 0;
            return (
              <div
                key={skill.name}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="bb-card"
                data-i={i}
                data-off={off}
                data-abs={Math.min(abs, 3)}
                data-hover="false"
                aria-hidden={active ? undefined : "true"}
                style={{ ["--off" as string]: off, ["--abs" as string]: Math.min(abs, 3), zIndex: 20 - abs * 3 }}
              >
                <div className="bb-hang">
                  <span className="bb-nail" aria-hidden="true" />
                  <div className="bb-tilt">
                    <div className="bb-flip" data-flipped={active && flipped ? "true" : "false"}>
                      <div className="bb-face bb-front">
                        <img src={skill.src} alt={`${skill.name} skill wanted poster`} draggable={false} />
                        <span className="bb-dim" aria-hidden="true" />
                        <span className="bb-glare" aria-hidden="true" />
                        {stamp && stamp.index === i && (
                          <span key={stamp.key} className="bb-stamp" aria-hidden="true">REWARD RAISED!</span>
                        )}
                        <span className="bb-flip-hint" aria-hidden="true">↻ CLICK TO FLIP</span>
                      </div>
                      <div className="bb-face bb-back">
                        <div className="bb-back-inner">
                          <span className="bb-back-kicker">BOUNTY FILE № {String(i + 1).padStart(2, "0")}</span>
                          <h4>{skill.name}</h4>
                          <div className="bb-back-bounty">
                            <small>CURRENT BOUNTY</small>
                            <b><Counter value={active && flipped ? bounty(i) : 0} /></b>
                          </div>
                          <dl>
                            <div><dt>ROLE</dt><dd>{skill.role}</dd></div>
                            <div><dt>STATUS</dt><dd>Still sailing</dd></div>
                            <div><dt>LAST SEEN</dt><dd>Shipping something new</dd></div>
                          </dl>
                          <p>“{skill.note}”</p>
                          <span className="bb-approved" aria-hidden="true">APPROVED</span>
                          <span className="bb-back-hint" aria-hidden="true">↻ CLICK TO FLIP BACK</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="bb-coins" aria-hidden="true">
            {coins.map((burst) =>
              burst.items.map((c, k) => (
                <i
                  key={`${burst.id}-${k}`}
                  className="bb-coin"
                  style={{ ["--dx" as string]: `${c.dx}px`, ["--dy" as string]: `${c.dy}px`, ["--rot" as string]: `${c.rot}deg`, animationDelay: `${c.d}s` }}
                >
                  ฿
                </i>
              ))
            )}
          </div>
        </div>

        <button className="poster-arrow poster-arrow-next" type="button" aria-label="Next skill poster" onClick={() => go(1)}>→</button>
      </div>

      <div className="poster-carousel-footer">
        <div>
          <div className="poster-current-topline">
            <span className="poster-current-label">CURRENT BOUNTY FILE</span>
            <span className="poster-bounty-badge"><Counter value={bounty(index)} /></span>
          </div>
          <h3>{SKILLS[index].name}</h3>
          <p>Drag a poster and throw it, click to flip it over, or raise the bounty.</p>
          <button type="button" className="bb-raise" onClick={raise}>
            RAISE THE BOUNTY <span aria-hidden="true">▲</span>
          </button>
          <span className="bb-live" aria-live="polite">{SKILLS[index].name} bounty is {fmt(bounty(index))}</span>
        </div>
        <div className="poster-carousel-controls" aria-label="Choose a skill poster">
          {SKILLS.map((poster, i) => (
            <button
              key={poster.name}
              type="button"
              className={`poster-dot ${i === index ? "is-active" : ""}`}
              aria-label={`Show ${poster.name} poster`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => goTo(i)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
