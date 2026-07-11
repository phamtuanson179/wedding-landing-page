"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CornerLabels } from "./CornerLabels";
import { MonogramLogoSvg } from "./MonogramLogoSvg";
import { PolygonSvg } from "./PolygonSvg";

import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  dispatchHeroEntranceStart,
  HERO_ENTRANCE_COMPLETE,
} from "@/components/sections/hero/heroEntrance";
import {
  ensureCornerChromeVisible,
  preparePreloaderChrome,
  setCornerNavColor,
} from "@/lib/scroll/cornerNav";
import { setPreloaderPolygonAnimating } from "@/lib/preloader/preloaderState";
import { playBackgroundMusicWithSound } from "@/lib/audio/backgroundMusic";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

/** Center stage size while the polygon stroke is drawing. */
const POLYGON_LOADING_SIZE_MOBILE = 160;
const POLYGON_LOADING_SIZE_DESKTOP = 250;
/** Corner mark size after the curtain lifts. */
const POLYGON_END_SIZE = 88;
const POLYGON_DRAW_DURATION = 2;
const LOGO_REVEAL_DURATION = 0.85;
const TRANSITION_DURATION = 2.2;

function getPolygonLoadingSize() {
  return window.matchMedia("(min-width: 768px)").matches
    ? POLYGON_LOADING_SIZE_DESKTOP
    : POLYGON_LOADING_SIZE_MOBILE;
}

function getViewportMetrics() {
  const visualViewport = window.visualViewport;

  if (visualViewport) {
    return {
      width: visualViewport.width,
      height: visualViewport.height,
      offsetLeft: visualViewport.offsetLeft,
      offsetTop: visualViewport.offsetTop,
    };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
    offsetLeft: 0,
    offsetTop: 0,
  };
}

function getCenterOffset(wrapper: HTMLElement) {
  const rect = wrapper.getBoundingClientRect();
  const viewport = getViewportMetrics();
  const centerX = viewport.offsetLeft + viewport.width / 2;
  const centerY = viewport.offsetTop + viewport.height / 2;

  return {
    x: Math.round(centerX - rect.left - rect.width / 2),
    y: Math.round(centerY - rect.top - rect.height / 2),
  };
}

type PreloaderElements = {
  loader: HTMLElement;
  markWrapper: HTMLDivElement;
  polygon: SVGPolygonElement;
  logoMark: HTMLElement;
};

function setInitialState({
  loader,
  markWrapper,
  polygon,
  logoMark,
}: PreloaderElements) {
  gsap.set(markWrapper, {
    width: getPolygonLoadingSize(),
    height: getPolygonLoadingSize(),
    scale: 1,
    x: 0,
    y: 0,
    transformOrigin: "center center",
    force3D: false,
    autoAlpha: 0,
    visibility: "hidden",
  });

  void markWrapper.offsetHeight;

  const centerOffset = getCenterOffset(markWrapper);
  const strokeLength = polygon.getTotalLength();

  gsap.set(loader, { yPercent: 0, autoAlpha: 1 });
  gsap.set(markWrapper, {
    x: centerOffset.x,
    y: centerOffset.y,
    autoAlpha: 1,
    visibility: "visible",
  });

  gsap.set(polygon, {
    strokeDasharray: strokeLength,
    strokeDashoffset: strokeLength,
    strokeOpacity: 1,
  });

  // Logo waits until the polygon closes, then rises in.
  gsap.set(logoMark, {
    autoAlpha: 0,
    y: 18,
    scale: 1,
    transformOrigin: "50% 50%",
  });

  return { strokeLength };
}

function createReducedMotionExitTimeline(
  elements: PreloaderElements,
  onComplete: () => void,
) {
  const { loader, markWrapper, polygon } = elements;

  return gsap
    .timeline({ onComplete })
    .to(loader, { yPercent: -100, duration: 0.4, ease: "power2.inOut" })
    .to(
      markWrapper,
      { x: 0, y: 0, scale: 1, duration: 0.4, ease: "power2.inOut" },
      0,
    )
    .to(
      markWrapper,
      {
        width: POLYGON_END_SIZE,
        height: POLYGON_END_SIZE,
        duration: 0.4,
        ease: "power2.inOut",
      },
      0,
    )
    .set(polygon, { strokeOpacity: 0.18 }, 0.2);
}

/**
 * Non-linear stroke progress — same start point every time, but cadence
 * mimics real loading (bursts, slowdowns) instead of a flat metronome.
 */
function appendOrganicPolygonDraw(
  timeline: gsap.core.Timeline,
  polygon: SVGPolygonElement,
  strokeLength: number,
  totalDuration: number,
  at = 0,
) {
  const stepCount = 6 + Math.floor(Math.random() * 3); // 6–8 segments
  // Bias: early segments often quicker, mid can stall, late finishes strong
  const weights = Array.from({ length: stepCount }, (_, i) => {
    const t = i / (stepCount - 1);
    const base = 0.45 + Math.random() * 0.9;
    // Occasionally inject a “stall” or a “rush”
    const stall = Math.random() < 0.22 ? 1.6 + Math.random() : 1;
    const rush = Math.random() < 0.18 ? 0.45 + Math.random() * 0.25 : 1;
    // Slight ease-in-out bias across the whole load
    const curve = 0.75 + Math.sin(t * Math.PI) * 0.55;
    return base * stall * rush * curve;
  });
  const weightSum = weights.reduce((sum, w) => sum + w, 0);

  let elapsed = at;
  let drawn = 0;

  weights.forEach((weight, index) => {
    const portion = weight / weightSum;
    const nextDrawn = index === stepCount - 1 ? 1 : Math.min(0.999, drawn + portion);
    const duration = Math.max(0.06, portion * totalDuration);
    const easePool = [
      "none",
      "power1.in",
      "power1.out",
      "power2.inOut",
      "sine.inOut",
    ] as const;
    const ease = easePool[Math.floor(Math.random() * easePool.length)];

    timeline.to(
      polygon,
      {
        strokeDashoffset: strokeLength * (1 - nextDrawn),
        duration,
        ease,
      },
      elapsed,
    );

    drawn = nextDrawn;
    elapsed += duration;
  });

  timeline.to(
    polygon,
    {
      strokeDashoffset: 0,
      duration: 0.06,
      ease: "power1.out",
    },
    Math.max(elapsed, at + totalDuration) - 0.06,
  );

  return at + totalDuration;
}

function createLoadingTimeline(
  elements: PreloaderElements,
  strokeLength: number,
  onReady: () => void,
) {
  const { polygon, logoMark } = elements;
  const timeline = gsap.timeline({ onComplete: onReady });

  const logoAt = appendOrganicPolygonDraw(
    timeline,
    polygon,
    strokeLength,
    POLYGON_DRAW_DURATION,
    0,
  );

  timeline.to(
    logoMark,
    {
      autoAlpha: 1,
      y: 0,
      duration: LOGO_REVEAL_DURATION,
      ease: "power2.out",
    },
    logoAt,
  );

  timeline.to({}, { duration: 0.2 });

  return timeline;
}

/** Curtain lifts up; mark shrinks home to the corner as a static watermark. */
function createExitTimeline(
  elements: PreloaderElements,
  onComplete: () => void,
) {
  const { polygon, loader, markWrapper, logoMark } = elements;

  return gsap
    .timeline({ onComplete })
    .to(
      loader,
      {
        yPercent: -100,
        duration: TRANSITION_DURATION,
        ease: "power2.inOut",
      },
      0,
    )
    .to(
      markWrapper,
      {
        x: 0,
        y: 0,
        width: POLYGON_END_SIZE,
        height: POLYGON_END_SIZE,
        scale: 1,
        duration: TRANSITION_DURATION,
        ease: "power2.inOut",
      },
      0,
    )
    .to(
      logoMark,
      {
        scale: 0.92,
        duration: TRANSITION_DURATION,
        ease: "power2.inOut",
      },
      0,
    )
    .to(
      polygon,
      {
        strokeOpacity: 0.22,
        duration: TRANSITION_DURATION,
        ease: "power2.inOut",
      },
      0,
    );
}

function startScrollExplorePulse(scrollHint: HTMLElement) {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    gsap.set(scrollHint, { opacity: 0.55 });
    return null;
  }

  gsap.set(scrollHint, { opacity: 0.32 });

  return gsap.to(scrollHint, {
    opacity: 0.82,
    duration: 2.6,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
  });
}

export function PreLoader() {
  const [awaitingEnter, setAwaitingEnter] = useState(false);
  const loaderRef = useRef<HTMLElement>(null);
  const markWrapperRef = useRef<HTMLDivElement>(null);
  const polygonRef = useRef<SVGPolygonElement>(null);
  const logoMarkRef = useRef<HTMLDivElement>(null);
  const scrollHintTweenRef = useRef<gsap.core.Tween | null>(null);

  useLayoutEffect(() => {
    const logoMark = logoMarkRef.current;
    const elements: PreloaderElements = {
      loader: loaderRef.current as HTMLElement,
      markWrapper: markWrapperRef.current as HTMLDivElement,
      polygon: polygonRef.current as SVGPolygonElement,
      logoMark: logoMark as HTMLElement,
    };

    if (
      !elements.loader ||
      !elements.markWrapper ||
      !elements.polygon ||
      !elements.logoMark
    ) {
      return;
    }

    const previousScrollRestoration = history.scrollRestoration;
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    setCornerNavColor("loading");
    preparePreloaderChrome();
    ensureCornerChromeVisible();

    setPreloaderPolygonAnimating(true);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const smoother = ScrollSmoother.get();
    smoother?.scrollTo(0, false);
    smoother?.paused(true);
    const restoreScrollState = () => {
      document.body.style.overflow = previousOverflow;
      smoother?.paused(false);
    };

    let loadingTimeline: gsap.core.Timeline | undefined;
    let exitTimeline: gsap.core.Timeline | undefined;
    let loadingReady = false;
    let musicStarted = false;
    let exitStarted = false;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const finishPreloader = () => {
      setPreloaderPolygonAnimating(false);
      gsap.set(elements.loader, {
        yPercent: -100,
        autoAlpha: 1,
      });
      gsap.set(elements.markWrapper, {
        width: POLYGON_END_SIZE,
        height: POLYGON_END_SIZE,
        x: 0,
        y: 0,
        scale: 1,
        autoAlpha: 1,
      });
      gsap.set(elements.logoMark, {
        y: 0,
        scale: 0.92,
        autoAlpha: 1,
      });
      gsap.set(elements.polygon, { strokeOpacity: 0.22 });
      setCornerNavColor("hero");
      ensureCornerChromeVisible();
      restoreScrollState();
      if ("scrollRestoration" in history) {
        history.scrollRestoration = previousScrollRestoration;
      }
      if (smoother) {
        ScrollTrigger.refresh();
      }
      elements.loader.setAttribute("aria-hidden", "true");
      elements.loader.style.pointerEvents = "none";
      setAwaitingEnter(false);
      dispatchHeroEntranceStart();
    };

    const beginExit = () => {
      if (exitStarted) {
        return;
      }

      exitStarted = true;
      setAwaitingEnter(false);
      elements.loader.style.cursor = "default";

      exitTimeline = prefersReducedMotion
        ? createReducedMotionExitTimeline(elements, finishPreloader)
        : createExitTimeline(elements, finishPreloader);
    };

    const onEnterGesture = () => {
      playBackgroundMusicWithSound();
      musicStarted = true;

      if (loadingReady) {
        beginExit();
      }
    };

    const onLoadingReady = () => {
      loadingReady = true;

      if (musicStarted) {
        beginExit();
        return;
      }

      setAwaitingEnter(true);
      elements.loader.style.cursor = "pointer";
    };

    const startTimeline = () => {
      const { strokeLength } = setInitialState(elements);

      if (prefersReducedMotion) {
        gsap.set(elements.polygon, { strokeDashoffset: 0, strokeOpacity: 1 });
        gsap.set(elements.logoMark, { autoAlpha: 1, y: 0, scale: 1 });
        onLoadingReady();
        return;
      }

      loadingTimeline = createLoadingTimeline(
        elements,
        strokeLength,
        onLoadingReady,
      );
    };

    const revealScrollHint = () => {
      const scrollHint = document.querySelector<HTMLElement>(
        "[data-scroll-explore-hint]",
      );
      if (scrollHint) {
        scrollHintTweenRef.current?.kill();
        scrollHintTweenRef.current = startScrollExplorePulse(scrollHint);
      }
    };

    const handleHeroEntranceComplete = () => {
      revealScrollHint();
    };

    elements.loader.addEventListener("pointerdown", onEnterGesture);
    window.addEventListener(HERO_ENTRANCE_COMPLETE, handleHeroEntranceComplete);

    requestAnimationFrame(() => {
      requestAnimationFrame(startTimeline);
    });

    return () => {
      elements.loader.removeEventListener("pointerdown", onEnterGesture);
      window.removeEventListener(
        HERO_ENTRANCE_COMPLETE,
        handleHeroEntranceComplete,
      );
      scrollHintTweenRef.current?.kill();
      setPreloaderPolygonAnimating(false);
      loadingTimeline?.kill();
      exitTimeline?.kill();
      restoreScrollState();
      if ("scrollRestoration" in history) {
        history.scrollRestoration = previousScrollRestoration;
      }
    };
  }, []);

  return (
    <>
      <section
        id="loader"
        ref={loaderRef}
        className="fixed inset-0 z-40 bg-primary will-change-transform"
        aria-label={awaitingEnter ? "Chạm để mở thiệp" : "Loading"}
      >
        {awaitingEnter ? (
          <p className="pointer-events-none absolute inset-x-0 bottom-[18%] z-10 text-center text-[10px] uppercase tracking-[0.35em] text-background/70 animate-pulse md:bottom-[16%]">
            Chạm để mở thiệp
          </p>
        ) : null}
      </section>

      <div
        data-corner-nav
        className="pointer-events-none fixed inset-0 z-50 text-background transition-colors duration-500"
      >
        <CornerLabels />

        {/* Static corner watermark — brand seal only, no click/hover */}
        <div
          ref={markWrapperRef}
          data-scroll-polygon
          aria-hidden="true"
          className="pointer-events-none invisible fixed bottom-15 right-6 size-14 overflow-visible [backface-visibility:visible] md:bottom-12 md:right-8 md:size-22 lg:bottom-20 lg:right-16"
        >
          <div className="relative size-full">
            <div className="absolute inset-0 opacity-80" aria-hidden>
              <PolygonSvg ref={polygonRef} />
            </div>

            <div
              ref={logoMarkRef}
              className="absolute inset-[28%] will-change-transform md:inset-[30%]"
            >
              <MonogramLogoSvg className="block h-full w-full object-contain" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
