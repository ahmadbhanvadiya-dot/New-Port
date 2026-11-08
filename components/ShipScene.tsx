"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "sailing" | "returning";

/** Builds a seamless wavy path: the pattern repeats every `period` units across `width`. */
function wavePath(width: number, period: number, amp: number, base: number, height: number) {
  let d = `M0 ${base} Q${period / 4} ${base - amp} ${period / 2} ${base}`;
  for (let x = period / 2; x < width; x += period / 2) {
    d += ` T${x + period / 2} ${base}`;
  }
  return `${d} L${width} ${height} L0 ${height} Z`;
}

const STARS = [
  [6, 12, 2], [14, 30, 1.5], [22, 8, 1.5], [31, 22, 2], [38, 6, 1.5], [47, 18, 1.5], [55, 9, 2],
  [63, 26, 1.5], [71, 11, 1.5], [78, 5, 2], [86, 20, 1.5], [93, 10, 2], [10, 46, 1.5], [27, 40, 1.5],
  [44, 36, 2], [60, 44, 1.5], [82, 38, 1.5], [96, 34, 1.5],
];

export default function ShipScene({ sailSignal }: { sailSignal: number }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const firstSignal = useRef(sailSignal);

  const setSail = () => setPhase((p) => (p === "idle" ? "sailing" : p));

  useEffect(() => {
    if (sailSignal !== firstSignal.current) setSail();
  }, [sailSignal]);

  const onTravelEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.animationName === "shipSail") setPhase("returning");
    if (e.animationName === "shipReturn") setPhase("idle");
  };

  const W = 800;
  const back = wavePath(W, 100, 16, 46, 140);
  const mid = wavePath(W, 80, 13, 52, 140);
  const front = wavePath(W, 64, 10, 60, 140);

  return (
    <>
      <div className="contact-stars" aria-hidden="true">
        {STARS.map(([l, t, s], i) => (
          <i key={i} style={{ left: `${l}%`, top: `${t}%`, width: s, height: s, animationDelay: `${(i % 7) * 0.45}s` }} />
        ))}
      </div>

      <div className={`ship-stage is-${phase}`}>
        <svg className="ship-waves ship-waves-back" viewBox={`0 0 ${W} 140`} preserveAspectRatio="none" aria-hidden="true">
          <path d={back} fill="#1f3140" />
        </svg>

        <div className="ship-travel" onAnimationEnd={onTravelEnd}>
          <button type="button" className="ship-btn" onClick={setSail} aria-label="Set sail — send the ship across the sea">
            <span className="ship-hint" aria-hidden="true">⚓ CLICK TO SET SAIL</span>
            <span className="ship-bob">
              <span className="ship-tilt">
                <svg className="ship-svg" viewBox="0 0 320 270" aria-hidden="true">
                  <defs>
                    <linearGradient id="hullG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#6b2a22" />
                      <stop offset="1" stopColor="#35130f" />
                    </linearGradient>
                    <linearGradient id="sailG" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#fbf0d6" />
                      <stop offset="1" stopColor="#e5d2a4" />
                    </linearGradient>
                    <radialGradient id="lampG">
                      <stop offset="0" stopColor="#ffd98a" stopOpacity="1" />
                      <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* rigging */}
                  <g stroke="#e9bf57" strokeOpacity=".35" strokeWidth="1" fill="none">
                    <path d="M158 34 L52 176" />
                    <path d="M158 34 L246 176" />
                    <path d="M92 70 L40 176" />
                    <path d="M158 34 L92 70" />
                    <path d="M158 34 L220 82" />
                  </g>

                  {/* masts + crow's nest */}
                  <g fill="#5a3b25">
                    <rect x="154" y="30" width="8" height="150" rx="2" />
                    <rect x="88" y="66" width="7" height="114" rx="2" />
                    <rect x="216" y="78" width="7" height="102" rx="2" />
                  </g>
                  <rect x="144" y="36" width="28" height="8" rx="3" fill="#8a5a2b" />
                  <rect x="150" y="26" width="16" height="3" fill="#8a5a2b" />

                  {/* sails */}
                  <g className="ship-sails">
                    <path className="ship-sail" d="M114 48 Q158 66 204 48 L204 112 Q158 130 114 112 Z" fill="url(#sailG)" stroke="#c7ad76" strokeWidth="1.2" />
                    <path className="ship-sail" d="M104 118 Q158 138 210 118 L214 170 Q158 188 100 170 Z" fill="url(#sailG)" stroke="#c7ad76" strokeWidth="1.2" />
                    <path className="ship-sail" d="M60 82 Q92 96 124 82 L124 134 Q92 148 60 134 Z" fill="url(#sailG)" stroke="#c7ad76" strokeWidth="1.2" />
                    <path className="ship-sail" d="M226 88 L226 166 L272 166 Q246 124 226 88 Z" fill="url(#sailG)" stroke="#c7ad76" strokeWidth="1.2" />
                    {/* red + gold trim on the big sails */}
                    <path className="ship-sail" d="M118 80 Q158 96 200 80" stroke="#b52d32" strokeWidth="5" fill="none" strokeLinecap="round" />
                    <path className="ship-sail" d="M108 144 Q158 162 208 144" stroke="#b52d32" strokeWidth="5" fill="none" strokeLinecap="round" />
                  </g>

                  {/* flag with a classic skull-and-crossbones */}
                  <g className="ship-flag">
                    <path d="M162 8 H206 Q199 20 206 32 H162 Z" fill="#101820" stroke="#e9bf57" strokeWidth="1.2" />
                    <circle cx="180" cy="18" r="5" fill="#f6edd8" />
                    <rect x="177" y="21" width="6" height="4" rx="1" fill="#f6edd8" />
                    <circle cx="178.2" cy="17.5" r="1.1" fill="#101820" />
                    <circle cx="181.8" cy="17.5" r="1.1" fill="#101820" />
                    <path d="M172 27 L190 14 M172 14 L190 27" stroke="#f6edd8" strokeWidth="1.4" strokeLinecap="round" />
                  </g>

                  {/* hull */}
                  <path d="M26 170 Q160 214 288 168 L268 222 Q160 258 46 222 Z" fill="url(#hullG)" />
                  <path d="M26 170 Q160 214 288 168" stroke="#e9bf57" strokeWidth="4" fill="none" strokeLinecap="round" />
                  <path d="M38 196 Q160 236 276 194" stroke="#b52d32" strokeWidth="5" fill="none" />
                  <path d="M52 214 Q160 246 262 212" stroke="#e9bf57" strokeOpacity=".5" strokeWidth="1.5" fill="none" />
                  <g fill="#e9bf57">
                    {[92, 126, 160, 194, 228].map((cx, i) => (
                      <circle key={cx} cx={cx} cy={193 + [10, 17, 19, 16, 8][i]} r="4.2" />
                    ))}
                  </g>
                  {/* bowsprit + stern castle */}
                  <path d="M284 168 L316 146" stroke="#5a3b25" strokeWidth="5" strokeLinecap="round" />
                  <path d="M20 170 L22 146 L58 150 L60 176 Z" fill="#4a1f1b" stroke="#e9bf57" strokeWidth="1.5" />
                  {/* lanterns */}
                  <circle className="ship-lamp" cx="30" cy="144" r="16" fill="url(#lampG)" />
                  <circle cx="30" cy="144" r="3.4" fill="#ffd98a" />
                  <circle className="ship-lamp ship-lamp-2" cx="308" cy="146" r="12" fill="url(#lampG)" />
                  <circle cx="308" cy="146" r="2.6" fill="#ffd98a" />
                </svg>
              </span>
            </span>
            <span className="ship-wake" aria-hidden="true" />
          </button>
        </div>

        <svg className="ship-waves ship-waves-mid" viewBox={`0 0 ${W} 140`} preserveAspectRatio="none" aria-hidden="true">
          <path d={mid} fill="#173a45" />
          <path d={mid.split(" L")[0]} fill="none" stroke="#e9bf57" strokeOpacity=".4" strokeWidth="1.6" />
        </svg>
        <svg className="ship-waves ship-waves-front" viewBox={`0 0 ${W} 140`} preserveAspectRatio="none" aria-hidden="true">
          <path d={front} fill="#10262f" />
          <path d={front.split(" L")[0]} fill="none" stroke="#8fd0e8" strokeOpacity=".28" strokeWidth="1.4" />
        </svg>
      </div>
    </>
  );
}
