"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Crosshair,
  Menu,
  Radio,
  Shield,
  Sparkles,
  Volume2,
  VolumeX,
  Wind,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const abilities = [
  {
    id: "reflex",
    number: "01",
    label: "Spider-Sense",
    title: "Move before danger becomes visible.",
    copy: "A heightened response layer reads subtle changes in the environment and turns instinct into immediate action.",
    metric: "0.18s",
    metricLabel: "response window",
    Icon: Radio,
  },
  {
    id: "traverse",
    number: "02",
    label: "Web Traversal",
    title: "Treat the skyline like open ground.",
    copy: "Precision movement, momentum control and rapid course correction transform dense city geometry into a fluid route.",
    metric: "360°",
    metricLabel: "movement field",
    Icon: Wind,
  },
  {
    id: "defense",
    number: "03",
    label: "Adaptive Suit",
    title: "Protection that reacts with you.",
    copy: "A responsive suit system supports impact resistance, tactical awareness and stability under extreme pressure.",
    metric: "8×",
    metricLabel: "impact control",
    Icon: Shield,
  },
];

function SpiderMark() {
  return (
    <span className="spider-mark" aria-hidden="true">
      <svg viewBox="0 0 48 48" fill="none">
        <path d="M24 8v32M18 15l6 6 6-6M18 33l6-6 6 6M17 21 8 15M17 27 7 33M31 21l9-6M31 27l10 6" />
        <path d="M18.5 24c0-5 2.2-8.5 5.5-8.5s5.5 3.5 5.5 8.5-2.2 8.5-5.5 8.5-5.5-3.5-5.5-8.5Z" fill="currentColor" stroke="none" />
      </svg>
    </span>
  );
}

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLSpanElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(false);
  const [soundOn, setSoundOn] = useState(false);
  const [activeAbility, setActiveAbility] = useState(0);

  const playTone = useCallback((frequency = 460) => {
    if (!soundEnabledRef.current) return;
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const context = audioRef.current ?? new AudioContextClass();
    audioRef.current = context;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.28, now + 0.09);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.07, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }, []);

  const toggleSound = () => {
    const next = !soundEnabledRef.current;
    soundEnabledRef.current = next;
    setSoundOn(next);
    if (next) requestAnimationFrame(() => playTone(390));
  };

  useEffect(() => {
    const hero = heroRef.current;
    const mask = maskRef.current;
    const halo = haloRef.current;
    if (!hero || !mask || !halo) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let active = false;
    let targetX = hero.clientWidth * 0.64;
    let targetY = hero.clientHeight * 0.48;
    let currentX = targetX;
    let currentY = targetY;

    const locate = (event: PointerEvent) => {
      const rect = hero.getBoundingClientRect();
      targetX = event.clientX - rect.left;
      targetY = event.clientY - rect.top;
      active = true;
    };
    const release = () => {
      active = false;
    };

    const animate = (time: number) => {
      const rect = hero.getBoundingClientRect();
      const radius = rect.width < 760 ? 112 : Math.min(184, Math.max(142, rect.width * 0.11));
      if (!active && !reduced) {
        const t = time * 0.001;
        targetX = rect.width * 0.64 + Math.cos(t * 0.72) * 58;
        targetY = rect.height * 0.48 + Math.sin(t * 0.91) * 42;
      }
      const ease = active ? 0.17 : 0.045;
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;

      const gradient = `radial-gradient(circle ${radius}px at ${currentX}px ${currentY}px, #000 0%, rgba(0,0,0,.96) 44%, rgba(0,0,0,.48) 73%, transparent 100%)`;
      mask.style.maskImage = gradient;
      mask.style.webkitMaskImage = gradient;
      halo.style.width = `${radius * 2}px`;
      halo.style.height = `${radius * 2}px`;
      halo.style.transform = `translate3d(${currentX - radius}px, ${currentY - radius}px, 0)`;
      frame = requestAnimationFrame(animate);
    };

    hero.addEventListener("pointermove", locate);
    hero.addEventListener("pointerdown", locate);
    hero.addEventListener("pointerleave", release);
    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      hero.removeEventListener("pointermove", locate);
      hero.removeEventListener("pointerdown", locate);
      hero.removeEventListener("pointerleave", release);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    if (!canvas || !hero) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let width = 0;
    let height = 0;
    let points: Array<{ x: number; y: number; vx: number; vy: number; a: number }> = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = hero.clientWidth;
      height = hero.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      points = Array.from({ length: width < 760 ? 25 : 44 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -(0.05 + Math.random() * 0.18),
        a: 0.15 + Math.random() * 0.38,
      }));
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      points.forEach((point, index) => {
        if (!reduced) {
          point.x += point.vx;
          point.y += point.vy;
          if (point.y < -5) point.y = height + 5;
          if (point.x < -5) point.x = width + 5;
          if (point.x > width + 5) point.x = -5;
        }
        context.fillStyle = `rgba(79, 171, 255, ${point.a})`;
        context.shadowColor = "rgba(47, 145, 255, .9)";
        context.shadowBlur = 8;
        context.beginPath();
        context.arc(point.x, point.y, 1, 0, Math.PI * 2);
        context.fill();

        if (index % 3 === 0) {
          const next = points[(index + 7) % points.length];
          const distance = Math.hypot(point.x - next.x, point.y - next.y);
          if (distance < 130) {
            context.strokeStyle = `rgba(107, 184, 255, ${(1 - distance / 130) * 0.08})`;
            context.lineWidth = 0.5;
            context.beginPath();
            context.moveTo(point.x, point.y);
            context.lineTo(next.x, next.y);
            context.stroke();
          }
        }
      });
      frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    const updateScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const progress = total > 0 ? window.scrollY / total : 0;
      if (scrollRef.current) scrollRef.current.style.transform = `scaleX(${progress})`;
    };
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { threshold: 0.14 },
    );
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => observer.observe(element));
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateScroll);
    };
  }, []);

  const selected = abilities[activeAbility];

  return (
    <main>
      <span ref={scrollRef} className="scroll-progress" aria-hidden="true" />

      <header className="site-header">
        <a className="brand" href="#home" onClick={() => playTone(360)} aria-label="Spider Nexus home">
          <SpiderMark />
          <span>SPIDER<span className="brand-slash">//</span>NEXUS</span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#home">Home</a>
          <a href="#systems">Systems</a>
          <a href="#archive">Archive</a>
          <a href="#signal">Signal</a>
        </nav>

        <div className="header-actions">
          <Button type="button" variant="ghost" size="icon" className="icon-button" onClick={toggleSound}
            aria-label={soundOn ? "Disable interface sound" : "Enable interface sound"} aria-pressed={soundOn}>
            {soundOn ? <Volume2 /> : <VolumeX />}
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="icon-button mobile-trigger" aria-label="Open navigation">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent className="mobile-sheet">
              <SheetHeader className="mobile-sheet-header">
                <div className="brand"><SpiderMark /><span>SPIDER<span className="brand-slash">//</span>NEXUS</span></div>
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>Move through the Spider Nexus interface.</SheetDescription>
              </SheetHeader>
              <nav className="mobile-nav" aria-label="Mobile navigation">
                {["Home", "Systems", "Archive", "Signal"].map((item, index) => (
                  <SheetClose asChild key={item}>
                    <a href={`#${item.toLowerCase()}`}>
                      <span>0{index + 1}</span>{item}<ArrowUpRight />
                    </a>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <section id="home" ref={heroRef} className="hero" aria-label="Interactive Spider-Man hero">
        <div className="hero-image-stage" aria-hidden="true">
          <img className="hero-image hero-image-base" src="/spider-hero.png" alt="" draggable="false" />
          <div ref={maskRef} className="hero-mask">
            <img className="hero-image hero-image-color" src="/spider-hero.png" alt="" draggable="false" />
          </div>
          <div ref={haloRef} className="spotlight-halo"><span /></div>
          <div className="hero-vignette" />
        </div>
        <canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" />
        <div className="web-grid" aria-hidden="true" />

        <div className="hero-copy">
          <div className="eyebrow"><span /> Earth—616 / Signal online</div>
          <p className="hero-kicker">A cinematic fan interface</p>
          <h1>BE<br />GREATER.</h1>
          <p className="hero-lede">Power is instinct. Responsibility is the choice that follows.</p>
          <div className="hero-ctas">
            <Button asChild className="primary-cta">
              <a href="#systems" onClick={() => playTone(520)}>Enter the web <ArrowDown /></a>
            </Button>
            <Button asChild variant="ghost" className="secondary-cta">
              <a href="#archive" onClick={() => playTone(610)}>View archive <ArrowUpRight /></a>
            </Button>
          </div>
        </div>

        <div className="hero-meta" aria-label="Interface status">
          <span><i /> Mask reveal active</span>
          <span className="hero-hint">Move pointer to scan</span>
        </div>
        <a className="scroll-cue" href="#systems" aria-label="Scroll to systems"><ArrowDown /></a>
      </section>

      <section id="systems" className="systems-section section-shell">
        <div className="section-heading" data-reveal>
          <p className="section-index">01 / Suit systems</p>
          <h2>Built for the split second between <em>instinct</em> and impact.</h2>
        </div>

        <div className="systems-grid" data-reveal>
          <div className="ability-nav" role="tablist" aria-label="Suit abilities">
            {abilities.map((ability, index) => (
              <Button
                key={ability.id}
                type="button"
                variant="ghost"
                className={`ability-tab ${index === activeAbility ? "active" : ""}`}
                onClick={() => { setActiveAbility(index); playTone(430 + index * 80); }}
                role="tab"
                aria-selected={index === activeAbility}
                aria-controls="ability-panel"
              >
                <span>{ability.number}</span>
                <ability.Icon />
                <b>{ability.label}</b>
                <ArrowRight />
              </Button>
            ))}
          </div>

          <article id="ability-panel" className="ability-panel" role="tabpanel" aria-live="polite">
            <div className="panel-topline"><Crosshair /><span>System module / {selected.number}</span></div>
            <h3>{selected.title}</h3>
            <p>{selected.copy}</p>
            <div className="panel-metric">
              <strong>{selected.metric}</strong>
              <span>{selected.metricLabel}</span>
            </div>
            <div className="metric-line"><span key={selected.id} /></div>
          </article>

          <figure className="systems-image">
            <img src="/spider-city.png" alt="Spider-Man seen from behind in a city at night" />
            <figcaption><span>NYC // 23:48</span><b>Patrol sequence</b></figcaption>
          </figure>
        </div>
      </section>

      <section id="archive" className="archive-section section-shell">
        <div className="archive-header" data-reveal>
          <div>
            <p className="section-index">02 / Field archive</p>
            <h2>Every landing begins with a leap.</h2>
          </div>
          <p>Three visual states. One continuous system built around motion, focus and consequence.</p>
        </div>

        <div className="archive-grid" data-reveal>
          <figure className="archive-wide">
            <img src="/spider-hero.png" alt="Spider-Man moving across a city building" />
            <figcaption><span>Traversal</span><b>Momentum / 01</b></figcaption>
          </figure>
          <figure className="archive-tall">
            <img src="/spider-final.png" alt="Spider-Man crouched and ready for action" />
            <figcaption><span>Response</span><b>Impact / 02</b></figcaption>
          </figure>
          <article className="archive-note">
            <Sparkles />
            <p>“The mask hides a name. It never hides the responsibility.”</p>
            <span>Field note // Nexus 03</span>
          </article>
        </div>
      </section>

      <section id="signal" className="signal-section">
        <div className="signal-inner" data-reveal>
          <p className="section-index">03 / Open channel</p>
          <h2>Ready to enter<br />the <em>Spider Nexus?</em></h2>
          <Button asChild className="signal-button">
            <a href="#home" onClick={() => playTone(680)}>Restart sequence <ArrowUpRight /></a>
          </Button>
        </div>
        <div className="signal-orb" aria-hidden="true"><Zap /><span /></div>
      </section>

      <footer className="site-footer">
        <div className="brand"><SpiderMark /><span>SPIDER<span className="brand-slash">//</span>NEXUS</span></div>
        <p>Unofficial fan-made interface concept. Spider-Man and related marks belong to their respective owners.</p>
        <a href="#home">Back to top <ArrowUpRight /></a>
      </footer>
    </main>
  );
}
