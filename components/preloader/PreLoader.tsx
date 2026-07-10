"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CornerLabels } from "./CornerLabels";
import { PolygonSvg } from "./PolygonSvg";
import { ScrollArrowSvg } from "./ScrollArrowSvg";

import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { dispatchHeroEntranceStart, HERO_ENTRANCE_COMPLETE } from "@/components/sections/hero/heroEntrance";
import {
  ensureCornerChromeVisible,
  scrollToNextSection,
  setCornerNavColor,
} from "@/lib/scroll/cornerNav";
import { setPreloaderPolygonAnimating } from "@/lib/preloader/preloaderState";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const LOADING_DURATION = 2;
const TRANSITION_DURATION = 2.2;
const POLYGON_END_SIZE = 88;
const POLYGON_LOADING_SIZE = 176;

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

function getPolygonCenterOffset(wrapper: HTMLElement) {
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
  polygonWrapper: HTMLDivElement;
  polygon: SVGPolygonElement;
  arrowInner: HTMLDivElement;
  arrowBounce: HTMLDivElement;
};

function setInitialState({
  loader,
  polygonWrapper,
  polygon,
  arrowInner,
  arrowBounce,
}: PreloaderElements) {
  gsap.set(polygonWrapper, {
    width: POLYGON_LOADING_SIZE,
    height: POLYGON_LOADING_SIZE,
    scale: 1,
    x: 0,
    y: 0,
    transformOrigin: "center center",
    force3D: false,
    autoAlpha: 0,
    visibility: "hidden",
  });

  void polygonWrapper.offsetHeight;

  const centerOffset = getPolygonCenterOffset(polygonWrapper);
  const strokeLength = polygon.getTotalLength();

  gsap.set(loader, { yPercent: 0 });
  gsap.set(polygonWrapper, {
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
  gsap.set(arrowInner, { autoAlpha: 0, visibility: "hidden" });
  gsap.set(arrowBounce, { y: 0 });

  return { strokeLength };
}

function createReducedMotionTimeline(
  elements: PreloaderElements,
  onComplete: () => void,
  onArrowReveal: () => void,
) {
  const { loader, polygonWrapper, polygon, arrowInner } = elements;

  return gsap
    .timeline({ onComplete })
    .to(loader, { yPercent: -100, duration: 0.4, ease: "power2.inOut" })
    .to(
      polygonWrapper,
      { x: 0, y: 0, scale: 1, duration: 0.4, ease: "power2.inOut" },
      0,
    )
    .to(
      polygonWrapper,
      {
        width: POLYGON_END_SIZE,
        height: POLYGON_END_SIZE,
        duration: 0.4,
        ease: "power2.inOut",
      },
      0,
    )
    .set(polygon, { strokeOpacity: 0.1 }, 0.2)
    .to(
      arrowInner,
      {
        autoAlpha: 1,
        visibility: "visible",
        duration: 0.35,
        ease: "power2.out",
        onComplete: onArrowReveal,
      },
      0.4,
    );
}

function createMainTimeline(
  elements: PreloaderElements,
  strokeLength: number,
  onComplete: () => void,
  onArrowReveal: () => void,
) {
  const { polygon, loader, polygonWrapper, arrowInner } = elements;
  const transitionStart = LOADING_DURATION;
  const transitionEnd = LOADING_DURATION + TRANSITION_DURATION;

  return gsap
    .timeline({ onComplete })
    .fromTo(
      polygon,
      { strokeDashoffset: strokeLength },
      {
        strokeDashoffset: 0,
        duration: LOADING_DURATION,
        ease: "none",
      },
      0,
    )
    .to(
      loader,
      {
        yPercent: -100,
        duration: TRANSITION_DURATION,
        ease: "power2.inOut",
      },
      transitionStart,
    )
    .to(
      polygonWrapper,
      {
        x: 0,
        y: 0,
        width: POLYGON_END_SIZE,
        height: POLYGON_END_SIZE,
        scale: 1,
        duration: TRANSITION_DURATION,
        ease: "power2.inOut",
      },
      transitionStart,
    )
    .to(
      polygon,
      {
        strokeOpacity: 0.1,
        duration: TRANSITION_DURATION,
        ease: "power2.inOut",
      },
      transitionStart,
    )
    .to(
      arrowInner,
      {
        autoAlpha: 1,
        visibility: "visible",
        duration: 0.6,
        ease: "power2.out",
        onComplete: onArrowReveal,
      },
      transitionEnd,
    );
}

function startArrowBounce(arrowBounce: HTMLDivElement) {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    return null;
  }

  return gsap.to(arrowBounce, {
    y: 8,
    duration: 1.2,
    ease: "power1.inOut",
    repeat: -1,
    yoyo: true,
  });
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
  const [isInteractive, setIsInteractive] = useState(false);
  const loaderRef = useRef<HTMLElement>(null);
  const polygonWrapperRef = useRef<HTMLDivElement>(null);
  const polygonSpinRef = useRef<HTMLDivElement>(null);
  const polygonRef = useRef<SVGPolygonElement>(null);
  const arrowInnerRef = useRef<HTMLDivElement>(null);
  const arrowBounceRef = useRef<HTMLDivElement>(null);
  const polygonHoverTweenRef = useRef<gsap.core.Tween | null>(null);
  const arrowBounceTweenRef = useRef<gsap.core.Tween | null>(null);
  const scrollHintTweenRef = useRef<gsap.core.Tween | null>(null);

  const handlePolygonHoverStart = () => {
    const spin = polygonSpinRef.current;
    if (!spin) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    polygonHoverTweenRef.current?.kill();
    polygonHoverTweenRef.current = gsap.to(spin, {
      rotation: prefersReducedMotion ? 12 : 360,
      duration: prefersReducedMotion ? 0.45 : 14,
      ease: prefersReducedMotion ? "power2.out" : "none",
      repeat: prefersReducedMotion ? 0 : -1,
      transformOrigin: "50% 50%",
      overwrite: true,
    });
  };

  const handlePolygonHoverEnd = () => {
    const spin = polygonSpinRef.current;
    if (!spin) {
      return;
    }

    polygonHoverTweenRef.current?.kill();
    polygonHoverTweenRef.current = gsap.to(spin, {
      rotation: 0,
      duration: 0.7,
      ease: "power2.out",
      overwrite: true,
    });
  };

  useLayoutEffect(() => {
    const elements: PreloaderElements = {
      loader: loaderRef.current as HTMLElement,
      polygonWrapper: polygonWrapperRef.current as HTMLDivElement,
      polygon: polygonRef.current as SVGPolygonElement,
      arrowInner: arrowInnerRef.current as HTMLDivElement,
      arrowBounce: arrowBounceRef.current as HTMLDivElement,
    };

    if (
      !elements.loader ||
      !elements.polygonWrapper ||
      !elements.polygon ||
      !elements.arrowInner ||
      !elements.arrowBounce
    ) {
      return;
    }

    setCornerNavColor("loading");
    ensureCornerChromeVisible();

    setPreloaderPolygonAnimating(true);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const smoother = ScrollSmoother.get();
    smoother?.paused(true);
    const restoreScrollState = () => {
      document.body.style.overflow = previousOverflow;
      smoother?.paused(false);
    };

    let timeline: gsap.core.Timeline | undefined;

    const startTimeline = () => {
      const { strokeLength } = setInitialState(elements);

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      timeline = prefersReducedMotion
        ? createReducedMotionTimeline(elements, finishPreloader, revealArrow)
        : createMainTimeline(
            elements,
            strokeLength,
            finishPreloader,
            revealArrow,
          );
    };

    const finishPreloader = () => {
      setPreloaderPolygonAnimating(false);
      gsap.set(elements.polygonWrapper, {
        width: POLYGON_END_SIZE,
        height: POLYGON_END_SIZE,
        x: 0,
        y: 0,
        scale: 1,
        autoAlpha: 1,
      });
      setCornerNavColor("hero");
      ensureCornerChromeVisible();
      restoreScrollState();
      if (smoother) {
        ScrollTrigger.refresh();
      }
      elements.loader.setAttribute("aria-hidden", "true");
      elements.loader.style.pointerEvents = "none";
      setIsInteractive(true);
      dispatchHeroEntranceStart();
    };

    const revealArrow = () => {
      const arrowContainer = elements.arrowInner.parentElement;
      if (arrowContainer) {
        arrowContainer.style.overflow = "visible";
      }

      arrowBounceTweenRef.current?.kill();
      arrowBounceTweenRef.current = startArrowBounce(elements.arrowBounce);
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

    window.addEventListener(HERO_ENTRANCE_COMPLETE, handleHeroEntranceComplete);

    requestAnimationFrame(() => {
      requestAnimationFrame(startTimeline);
    });

    return () => {
      window.removeEventListener(
        HERO_ENTRANCE_COMPLETE,
        handleHeroEntranceComplete,
      );
      polygonHoverTweenRef.current?.kill();
      arrowBounceTweenRef.current?.kill();
      scrollHintTweenRef.current?.kill();
      setPreloaderPolygonAnimating(false);
      timeline?.kill();
      restoreScrollState();
    };
  }, []);

  return (
    <>
      <section
        id='loader'
        ref={loaderRef}
        className='fixed inset-0 z-40 bg-primary will-change-transform'
        aria-label='Loading'
      />

      <div
        data-corner-nav
        className="pointer-events-none fixed inset-0 z-50 text-background transition-colors duration-500"
      >
        <CornerLabels />

        <div
          ref={polygonWrapperRef}
          data-scroll-polygon
          className={`invisible fixed bottom-8 right-8 size-22 [backface-visibility:visible] lg:bottom-16 lg:right-16 ${
            isInteractive ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <button
            type='button'
            aria-label='Scroll to next section'
            disabled={!isInteractive}
            onClick={scrollToNextSection}
            onMouseEnter={handlePolygonHoverStart}
            onMouseLeave={handlePolygonHoverEnd}
            onFocus={handlePolygonHoverStart}
            onBlur={handlePolygonHoverEnd}
            className='group relative size-full cursor-pointer bg-transparent disabled:cursor-default'
          >
            <div ref={polygonSpinRef} className="size-full">
              <PolygonSvg ref={polygonRef} />
            </div>

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[220%] w-8 -translate-x-1/2 -translate-y-1/2 overflow-hidden">
              <div ref={arrowInnerRef} className="h-full">
                <div ref={arrowBounceRef} className="h-full">
                  <ScrollArrowSvg />
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
