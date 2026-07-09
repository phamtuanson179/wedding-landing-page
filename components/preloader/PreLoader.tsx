"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CornerLabels } from "./CornerLabels";
import { PolygonSvg } from "./PolygonSvg";
import { ScrollArrowSvg } from "./ScrollArrowSvg";

import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const LOADING_DURATION = 2;
const TRANSITION_DURATION = 2.2;
const LOADING_OUT_DURATION = 0.7;
const ARROW_IN_DURATION = 2;
const POLYGON_LOADING_SCALE = 4;
const POLYGON_END_SCALE = 2;
const NEXT_SECTION_ID = "section-2";

function getPolygonCenterOffset(wrapper: HTMLElement) {
  const rect = wrapper.getBoundingClientRect();

  return {
    x: -rect.left + window.innerWidth / 2 - rect.width / 2,
    y: -rect.top + window.innerHeight / 2 - rect.height / 2,
  };
}

type PreloaderElements = {
  loader: HTMLElement;
  polygonWrapper: HTMLDivElement;
  polygon: SVGPolygonElement;
  arrowInner: HTMLDivElement;
  loadingText: HTMLSpanElement | null;
  scrollDown: HTMLSpanElement | null;
};

function setInitialState({
  loader,
  polygonWrapper,
  polygon,
  arrowInner,
  loadingText,
  scrollDown,
}: PreloaderElements) {
  const centerOffset = getPolygonCenterOffset(polygonWrapper);
  const strokeLength = polygon.getTotalLength();

  gsap.set(loader, { yPercent: 0 });
  gsap.set(polygonWrapper, {
    x: centerOffset.x,
    y: centerOffset.y,
    scale: POLYGON_LOADING_SCALE,
    transformOrigin: "center center",
  });
  gsap.set(polygon, {
    strokeDasharray: strokeLength,
    strokeDashoffset: strokeLength,
    strokeOpacity: 1,
  });
  gsap.set(arrowInner, { yPercent: -120 });

  if (loadingText) {
    gsap.set(loadingText, { yPercent: 0 });
  }
  if (scrollDown) {
    gsap.set(scrollDown, { yPercent: 100 });
  }

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
      { x: 0, y: 0, scale: POLYGON_END_SCALE, duration: 0.4 },
      0,
    )
    .set(polygon, { strokeOpacity: 0.1 }, 0.2)
    .set(arrowInner, { yPercent: 0 }, 0.2);
}

function createMainTimeline(
  elements: PreloaderElements,
  strokeLength: number,
  onComplete: () => void,
) {
  const {
    polygon,
    loadingText,
    scrollDown,
    loader,
    polygonWrapper,
    arrowInner,
  } = elements;

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
      loadingText,
      {
        yPercent: -110,
        duration: LOADING_OUT_DURATION,
        ease: "power3.inOut",
      },
      LOADING_DURATION,
    )
    .to(
      scrollDown,
      {
        yPercent: 0,
        duration: TRANSITION_DURATION * 0.7,
        ease: "power2.out",
      },
      LOADING_DURATION + 0.1,
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
        scale: POLYGON_END_SCALE,
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
      {
        yPercent: 0,
        duration: ARROW_IN_DURATION,
        ease: "power2.out",
      },
      LOADING_DURATION + 0.2,
    );
}

export function PreLoader() {
  const [isInteractive, setIsInteractive] = useState(false);
  const loaderRef = useRef<HTMLElement>(null);
  const polygonWrapperRef = useRef<HTMLDivElement>(null);
  const polygonRef = useRef<SVGPolygonElement>(null);
  const arrowInnerRef = useRef<HTMLDivElement>(null);
  const loadingTextRef = useRef<HTMLSpanElement>(null);
  const scrollDownRef = useRef<HTMLSpanElement>(null);

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

  useLayoutEffect(() => {
    const elements: PreloaderElements = {
      loader: loaderRef.current as HTMLElement,
      polygonWrapper: polygonWrapperRef.current as HTMLDivElement,
      polygon: polygonRef.current as SVGPolygonElement,
      arrowInner: arrowInnerRef.current as HTMLDivElement,
      loadingText: loadingTextRef.current,
      scrollDown: scrollDownRef.current,
    };

    if (
      !elements.loader ||
      !elements.polygonWrapper ||
      !elements.polygon ||
      !elements.arrowInner
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
      restoreScrollState();
      if (smoother) {
        ScrollTrigger.refresh();
      }
      elements.loader.setAttribute("aria-hidden", "true");
      elements.loader.style.pointerEvents = "none";
      setIsInteractive(true);
    };

    const timeline = prefersReducedMotion
      ? createReducedMotionTimeline(elements, finishPreloader)
      : createMainTimeline(elements, strokeLength, finishPreloader);

    return () => {
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

      <div className="pointer-events-none fixed inset-0 z-50 text-background">
        <CornerLabels
          loadingRef={loadingTextRef}
          scrollDownRef={scrollDownRef}
        />

        <div
          ref={polygonWrapperRef}
          className={`fixed bottom-16 right-16 size-11 ${
            isInteractive ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <button
            type='button'
            aria-label='Scroll to next section'
            disabled={!isInteractive}
            onClick={scrollToNextSection}
            className='relative size-full cursor-pointer bg-transparent disabled:cursor-default'
          >
            <PolygonSvg ref={polygonRef} />

            <div className='pointer-events-none absolute left-1/2 top-1/2 h-[220%] w-8 -translate-x-1/2 -translate-y-1/2 overflow-visible'>
              <div ref={arrowInnerRef} className='h-full'>
                <ScrollArrowSvg />
              </div>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
