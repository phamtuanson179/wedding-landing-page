"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CornerLabels } from "./CornerLabels";
import { PolygonSvg } from "./PolygonSvg";
import { ScrollArrowSvg } from "./ScrollArrowSvg";

import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  HERO_ENTRANCE_COMPLETE,
  dispatchHeroEntranceStart,
} from "../heroEntrance";
import { setCornerNavColor } from "../cornerNav";

const LOADING_DURATION = 2;
const TRANSITION_DURATION = 2.2;
const POLYGON_END_SIZE = 88;
const POLYGON_LOADING_SIZE = 176;
const NEXT_SECTION_ID = "section-2";

function getPolygonCenterOffset(wrapper: HTMLElement) {
  const rect = wrapper.getBoundingClientRect();

  return {
    x: Math.round(-rect.left + window.innerWidth / 2 - rect.width / 2),
    y: Math.round(-rect.top + window.innerHeight / 2 - rect.height / 2),
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
    transformOrigin: "center center",
    force3D: false,
  });

  const centerOffset = getPolygonCenterOffset(polygonWrapper);
  const strokeLength = polygon.getTotalLength();

  gsap.set(loader, { yPercent: 0 });
  gsap.set(polygonWrapper, {
    x: centerOffset.x,
    y: centerOffset.y,
  });
  gsap.set(polygon, {
    strokeDasharray: strokeLength,
    strokeDashoffset: strokeLength,
    strokeOpacity: 1,
  });
  gsap.set(arrowInner, { yPercent: 0, autoAlpha: 0 });
  gsap.set(arrowBounce, { y: 0 });

  return { strokeLength };
}

function createReducedMotionTimeline(
  elements: PreloaderElements,
  onComplete: () => void,
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
    .set(arrowInner, { autoAlpha: 1 }, 0.2);
}

function createMainTimeline(
  elements: PreloaderElements,
  strokeLength: number,
  onComplete: () => void,
) {
  const { polygon, loader, polygonWrapper, arrowInner } = elements;

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
      LOADING_DURATION,
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
      LOADING_DURATION,
    )
    .to(
      polygon,
      {
        strokeOpacity: 0.1,
        duration: TRANSITION_DURATION,
        ease: "power2.inOut",
      },
      LOADING_DURATION,
    )
    .to(
      arrowInner,
      { autoAlpha: 1, duration: 0.6, ease: "power2.out" },
      LOADING_DURATION + 0.25,
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

  const scrollToNextSection = () => {
    const smoother = ScrollSmoother.get();
    const target = `#${NEXT_SECTION_ID}`;

    if (smoother) {
      smoother.scrollTo(target, true, "top top");
      return;
    }

    document.getElementById(NEXT_SECTION_ID)?.scrollIntoView({
      behavior: "smooth",
    });
  };

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

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const smoother = ScrollSmoother.get();
    smoother?.paused(true);
    const restoreScrollState = () => {
      document.body.style.overflow = previousOverflow;
      smoother?.paused(false);
    };

    const { strokeLength } = setInitialState(elements);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const finishPreloader = () => {
      gsap.set(elements.polygonWrapper, {
        width: POLYGON_END_SIZE,
        height: POLYGON_END_SIZE,
        x: 0,
        y: 0,
        scale: 1,
        autoAlpha: 1,
      });
      setCornerNavColor("hero");
      restoreScrollState();
      if (smoother) {
        ScrollTrigger.refresh();
      }
      elements.loader.setAttribute("aria-hidden", "true");
      elements.loader.style.pointerEvents = "none";
      setIsInteractive(true);
      dispatchHeroEntranceStart();
    };

    const revealChrome = () => {
      arrowBounceTweenRef.current?.kill();
      arrowBounceTweenRef.current = startArrowBounce(elements.arrowBounce);
    };

    const handleHeroEntranceComplete = () => {
      revealChrome();
    };

    window.addEventListener(HERO_ENTRANCE_COMPLETE, handleHeroEntranceComplete);

    const timeline = prefersReducedMotion
      ? createReducedMotionTimeline(elements, finishPreloader)
      : createMainTimeline(elements, strokeLength, finishPreloader);

    return () => {
      window.removeEventListener(
        HERO_ENTRANCE_COMPLETE,
        handleHeroEntranceComplete,
      );
      polygonHoverTweenRef.current?.kill();
      arrowBounceTweenRef.current?.kill();
      timeline.kill();
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
          className={`fixed lg:bottom-16 lg:right-16 bottom-8 right-8 size-22 [backface-visibility:visible] ${
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

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[220%] w-8 -translate-x-1/2 -translate-y-1/2 overflow-visible">
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
