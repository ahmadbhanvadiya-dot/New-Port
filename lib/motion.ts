/**
 * True when the visitor asked the OS for less motion. CSS animations already respect
 * this (globals.css); JS-driven motion (GSAP, rAF loops, canvas parallax) must check it.
 * Call it inside effects / event handlers only: it reads `window`.
 */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
