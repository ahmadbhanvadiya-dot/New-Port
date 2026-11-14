"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import dynamic from "next/dynamic";
import { ArrowDownRight, ArrowUpRight, Github, Linkedin, Music } from "lucide-react";
import ScrollLuffy from "@/components/ScrollLuffy";
import ScrollBackground from "@/components/ScrollBackground";
import SoundDock from "@/components/SoundDock";
import SiteNav from "@/components/SiteNav";
import KineticLane from "@/components/KineticLane";
import ShipScene from "@/components/ShipScene";
import BountyBoard from "@/components/BountyBoard";
import IslandSelector from "@/components/IslandSelector";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const OrbScene = dynamic(() => import("@/components/OrbScene"), {
  ssr: false,
  loading: () => <div className="scene-fallback" aria-hidden="true" />,
});

export default function Home() {
  const root = useRef<HTMLElement>(null);
  const [time, setTime] = useState("--:--");
  const [copied, setCopied] = useState(false);
  const [activeCrew, setActiveCrew] = useState("COMPASS CORSAIRS");
  const [chaosMode, setChaosMode] = useState(false);
  const [sailSignal, setSailSignal] = useState(0);
  const [signalMode, setSignalMode] = useState(0);
  const [quipIndex, setQuipIndex] = useState(0);
  const signalLines = [
    { first: "I make", second: "the complex", third: "feel simple", accent: "complex", label: "01 / CLARITY" },
    { first: "I turn", second: "what if", third: "into what is", accent: "what if", label: "02 / POSSIBILITY" },
    { first: "I build", second: "useful things", third: "with a pulse", accent: "useful things", label: "03 / FEELING" },
  ];
  const activeSignal = signalLines[signalMode];
  const visitorQuips = [
    "Take a chill pill. I’m just a person who likes building things.",
    "No world domination plan here. Just a few tabs and a lot of curiosity.",
    "Thanks for visiting. Your attention is already a pretty big deal.",
    "Built with care, caffeine-free enthusiasm, and occasional Stack Overflow.",
    "Please enjoy the pixels. They were emotionally supported by CSS.",
    "If something breaks, it’s an interactive feature. (Kidding. Mostly.)",
  ];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(".hero-kicker, .hero-title-line, .hero-copy, .hero-actions", {
        y: 34, opacity: 0, filter: "blur(8px)"
      }, {
        y: 0, opacity: 1, filter: "blur(0px)", duration: 1.05,
        stagger: 0.12, ease: "power3.out", delay: 0.18
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.fromTo(element, { y: 44, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.85, ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 86%", once: true }
        });
      });

      gsap.utils.toArray<HTMLElement>(".project-row").forEach((row) => {
        const art = row.querySelector(".art-symbol");
        if (art) {
          gsap.fromTo(art, { scale: 0.92, rotate: -1.5 }, {
            scale: 1, rotate: 0, ease: "none",
            scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: 0.6 }
          });
        }
      });

      gsap.to(".scroll-progress span", {
        scaleX: 1, ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.25 }
      });
      gsap.utils.toArray<HTMLElement>(".section-heading, .about-statement").forEach((element) => {
        gsap.fromTo(element, { y: 24, rotateX: 2 }, {
          y: -12, rotateX: 0, ease: "none",
          scrollTrigger: { trigger: element, start: "top bottom", end: "bottom top", scrub: 0.7 }
        });
      });

      gsap.to(".orbit-ring", {
        rotate: 360, duration: 32, ease: "none", repeat: -1
      });
    }, root);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const update = () => setTime(new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false
    }).format(new Date()));
    update();
    const interval = window.setInterval(update, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("bhanvadiyaahmad@gmail.com");
      setCopied(true);
      setSailSignal((n) => n + 1);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = "mailto:bhanvadiyaahmad@gmail.com";
    }
  };


  const moveSpotlight = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--pointer-x", `${event.clientX}px`);
    event.currentTarget.style.setProperty("--pointer-y", `${event.clientY}px`);
    event.currentTarget.style.setProperty("--pointer-local-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--pointer-local-y", `${event.clientY - rect.top}px`);
  };

  const handleContactMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty("--contact-shift-x", `${(x * 24).toFixed(1)}px`);
    event.currentTarget.style.setProperty("--contact-shift-y", `${(y * 24).toFixed(1)}px`);
    event.currentTarget.style.setProperty("--contact-rotate", `${(x * 12).toFixed(1)}deg`);
  };

  const handleContactLeave = (event: ReactPointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--contact-shift-x", `0px`);
    event.currentTarget.style.setProperty("--contact-shift-y", `0px`);
    event.currentTarget.style.setProperty("--contact-rotate", `0deg`);
  };

  return (
    <main ref={root} className={`site-shell signal-${signalMode}`} data-signal={signalMode} onPointerMove={moveSpotlight}>
      <ScrollBackground />
      <div className="scroll-progress" aria-hidden="true"><span /></div>
      <div className="ambient-cursor-glow" aria-hidden="true" />
      <SoundDock />
      <div className="cursor-ghost" aria-hidden="true" /><div className="cursor-word" aria-hidden="true">LOOK CLOSER <span>↗</span></div>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SiteNav />

      <section className="hero" id="top" aria-labelledby="hero-heading">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-topline">
          <span className="hero-kicker"><span className="crosshair">✳</span> CAPTAIN OF CODE / CREATIVE ENGINEER</span>
          <span className="hero-index">LOGBOOK ENTRY&nbsp; — &nbsp;{time} IST</span>
        </div>
        <div className="hero-main" id="main-content">
          <div className="hero-heading-wrap">
            <h1 id="hero-heading" className="hero-title">
              <span className="hero-title-line">{activeSignal.first}</span>
              <span className="hero-title-line title-second">{activeSignal.second === "the complex" ? <>the <em>complex</em></> : <em>{activeSignal.second}</em>}</span>
              <span className="hero-title-line">{activeSignal.third === "feel simple" ? <>feel <span className="simple-word">simple<span className="title-period">.</span></span></> : <span className="simple-word">{activeSignal.third}<span className="title-period">.</span></span>}</span>
            </h1>
            <div className="hero-aside hero-copy">
              <span className="aside-rule" />
              <p>Ideas into interfaces.<br />Problems into products.<br /><strong>Pixels with a purpose.</strong></p>
              <span className="aside-caption">CODE × CURIOSITY × CRAFT</span>
              <button className="signal-switch" type="button" onClick={() => setSignalMode((mode) => (mode + 1) % signalLines.length)} aria-label="Change the hero statement">
                <span>{activeSignal.label}</span><b>RECOMPOSE ↗</b>
              </button>
            </div>
          </div>
          <div className="hero-visual" aria-label="Interactive Jolly Roger with a Grand Line compass">
            <div className="visual-label visual-label-top"><span>GRAND LINE / 001</span><span>JOLLY ROGER FIELD NOTES</span></div>
            <OrbScene onCrewChange={setActiveCrew} />
            <div className="visual-coordinates">LOG POSE: ACTIVE<br />CREW: {activeCrew}</div>
            <div className="visual-label visual-label-bottom"><span>THE GRAND LINE<br />CALLS</span><span className="visual-plus">↗</span></div>
          </div>
        </div>
        <div className="hero-bottom">
          <a className="scroll-cue" href="#work"><span className="scroll-icon"><ArrowDownRight size={17} /></span> SCROLL TO EXPLORE</a>
          <p>DESIGN-MINDED ENGINEERING<br />FROM HYDERABAD, INDIA.</p>
          <span className="hero-bottom-index">001 — 005</span>
        </div>
        <div className="visitor-note" aria-live="polite">
          <span className="visitor-note-label"><i /> A FRIENDLY REMINDER</span>
          <p key={quipIndex}>{visitorQuips[quipIndex]}</p>
          <button type="button" onClick={() => setQuipIndex((index) => (index + 1) % visitorQuips.length)} aria-label="Show another friendly note">ANOTHER ONE <span>↻</span></button>
        </div>
      </section>


      <KineticLane chaos={chaosMode} onToggleChaos={() => setChaosMode((value) => !value)} />

      <section className="work-section section-pad" id="work">
        <div className="section-heading" data-reveal>
          <div><span className="eyebrow">01 / THE GRAND LINE</span><h2>The crew’s <em>logbook.</em></h2></div>
          <p>Six islands explored.<br />Useful things built along the way.</p>
        </div>

        <IslandSelector />
        <div className="work-footnote"><span>MORE TREASURES LIVE IN THE VAULT.</span><a href="https://github.com/ahmadbhanvadiya-dot" target="_blank" rel="noreferrer">VISIT THE TREASURE VAULT <ArrowUpRight size={14} /></a></div>
      </section>

      <section className="about-section" id="about">
        <div className="about-top section-pad" data-reveal>
          <span className="eyebrow">02 / THE CAPTAIN’S LOG</span>
          <span className="about-stamp">NAKAMA<br />IN PROGRESS <b>☠</b></span>
        </div>
        <div className="about-content section-pad" data-reveal>
          <h2>A good crew<br />makes the <em>journey</em><br />worth it.</h2>
          <div className="about-description">
            <p className="about-lede">Every great adventure starts with a curious mind, a rough map, and the courage to build the first thing.</p>
            <p>I’m Ahmad — a developer who likes turning ambitious ideas into useful things. I explore interfaces, systems, and the little details that make a product feel alive. Still learning, still building, and always looking for the next island worth exploring.</p>
            <a className="dark-link" href="https://portfolio-ahmadbhanvadiya.vercel.app/" target="_blank" rel="noreferrer">VISIT MY EARLIER PORTFOLIO <ArrowUpRight size={15} /></a>
          </div>
        </div>
        <div className="about-bottom section-pad">
          <span>CHART A COURSE.</span><span>BUILD WITH HEART.</span><span>KEEP SAILING.</span>
        </div>
      </section>

      <section className="lab-section section-pad" id="lab">
        <div className="section-heading lab-heading" data-reveal>
          <div><span className="eyebrow">03 / SHIPYARD LAB <i className="lab-live-dot" /> EXPERIMENT 001—026</span><h2>Curiosity, <em>set sail.</em></h2></div>
          <p>Every tool is part of the crew.<br />The magic is what you build together.</p>
        </div>
        <div className="lab-manifesto" aria-label="Lab motto"><span>THE SEA IS FULL OF WHAT-IFS.</span><b>Sometimes all you need is a little curiosity.</b><span className="manifesto-spark">✳</span></div>
        <BountyBoard />
      </section>


      <section
        className="contact-section section-pad"
        id="contact"
        onPointerMove={handleContactMove}
        onPointerLeave={handleContactLeave}
      >
        <ShipScene sailSignal={sailSignal} />
        <div className="contact-orbit orbit-ring" aria-hidden="true"><span>THE NEXT ADVENTURE STARTS HERE ✳ THE NEXT ADVENTURE STARTS HERE ✳</span></div>
        <div className="contact-content" data-reveal>
          <span className="eyebrow">04 / YOUR NEXT ADVENTURE</span>
          <h2>Ready for a<br /><em>new adventure?</em></h2>
          <p>Got a project, a curious idea, or a problem worth solving? Pull up a seat at the table. Let’s build something useful.</p>
          <button className="contact-button" onClick={copyEmail}><span>{copied ? "EMAIL COPIED" : "BHANVADIYAAHMAD@GMAIL.COM"}</span><ArrowUpRight size={21} /></button>
          <div className="social-links">
            <a href="https://github.com/ahmadbhanvadiya-dot" target="_blank" rel="noreferrer"><Github size={16} /> GITHUB <ArrowUpRight size={12} /></a>
            <a href="https://linkedin.com/in/ahmad-bhanvadia-dot" target="_blank" rel="noreferrer"><Linkedin size={16} /> LINKEDIN <ArrowUpRight size={12} /></a>
          </div>
        </div>
        <div className="contact-bottom"><span>AHMAD BHANVADIYA · CREW LOG 2026</span><span>CHARTED & BUILT BY AHMAD.</span><a href="#top">BACK TO THE SHIP ↑</a></div>
      </section>
      <ScrollLuffy />
    </main>
  );
}
