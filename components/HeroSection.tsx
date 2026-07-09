"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import {
  HERO_ENTRANCE_COMPLETE,
  HERO_ENTRANCE_START,
  dispatchHeroEntranceComplete,
} from "./heroEntrance";
import {
  ensureDesktopCornerChromeVisible,
  getScroller,
  setCornerNavColor,
  setMobileCornerChromeVisible,
} from "./cornerNav";

gsap.registerPlugin(ScrollTrigger);

const HERO_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=2200&q=80",
    position: "object-[center_42%] md:object-center",
  },
  {
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2200&q=80",
    position: "object-[center_38%] md:object-center",
  },
  {
    src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=2200&q=80",
    position: "object-[center_40%] md:object-[center_45%]",
  },
] as const;

const SLIDE_DURATION = 5;
const CROSSFADE_DURATION = 0.9;

const preloadedImages =
  typeof window !== "undefined"
    ? HERO_IMAGES.map(({ src }) => {
        const image = new window.Image();
        image.src = src;
        return image;
      })
    : [];

function waitForImages() {
  return Promise.all(
    preloadedImages.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }

          image.onload = () => resolve();
          image.onerror = () => resolve();
        }),
    ),
  );
}

function restartKenBurns(media: HTMLElement) {
  media.classList.remove("is-active");
  void media.offsetHeight;
  media.classList.add("is-active");
}

function runHeroEntrance(
  elements: {
    eyebrow: HTMLElement;
    son: HTMLElement;
    amp: HTMLElement;
    linh: HTMLElement;
  },
  prefersReducedMotion: boolean,
) {
  const { eyebrow, son, amp, linh } = elements;

  if (prefersReducedMotion) {
    gsap.set([eyebrow, son, amp, linh], {
      autoAlpha: 1,
      x: 0,
      y: 0,
      letterSpacing: "0em",
    });
    dispatchHeroEntranceComplete();
    return;
  }

  gsap
    .timeline({
      onComplete: () => dispatchHeroEntranceComplete(),
    })
    .fromTo(
      eyebrow,
      { autoAlpha: 0, y: 20 },
      { autoAlpha: 1, y: 0, duration: 0.85, ease: "power2.out" },
      0,
    )
    .fromTo(
      son,
      { autoAlpha: 0, x: -48, letterSpacing: "0.14em" },
      {
        autoAlpha: 1,
        x: 0,
        letterSpacing: "-0.02em",
        duration: 1.1,
        ease: "power3.out",
      },
      0.3,
    )
    .fromTo(
      linh,
      { autoAlpha: 0, x: 48, letterSpacing: "0.14em" },
      {
        autoAlpha: 1,
        x: 0,
        letterSpacing: "-0.02em",
        duration: 1.1,
        ease: "power3.out",
      },
      0.3,
    )
    .fromTo(
      amp,
      { autoAlpha: 0, y: 12, scale: 0.92 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.75, ease: "power2.out" },
      0.55,
    );
}

export function HeroSection() {
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const sonRef = useRef<HTMLSpanElement>(null);
  const ampRef = useRef<HTMLSpanElement>(null);
  const linhRef = useRef<HTMLSpanElement>(null);
  const entranceStartedRef = useRef(false);

  useLayoutEffect(() => {
    const eyebrow = eyebrowRef.current;
    const son = sonRef.current;
    const amp = ampRef.current;
    const linh = linhRef.current;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (eyebrow && son && amp && linh) {
      if (prefersReducedMotion) {
        gsap.set([eyebrow, son, amp, linh], { autoAlpha: 1, x: 0, y: 0 });
      } else {
        gsap.set(eyebrow, { autoAlpha: 0, y: 20 });
        gsap.set(son, { autoAlpha: 0, x: -48, letterSpacing: "0.14em" });
        gsap.set(linh, { autoAlpha: 0, x: 48, letterSpacing: "0.14em" });
        gsap.set(amp, { autoAlpha: 0, y: 12, scale: 0.92 });
      }
    }

    const handleEntranceStart = () => {
      if (entranceStartedRef.current || !eyebrow || !son || !amp || !linh) {
        return;
      }

      entranceStartedRef.current = true;
      runHeroEntrance({ eyebrow, son, amp, linh }, prefersReducedMotion);
    };

    window.addEventListener(HERO_ENTRANCE_START, handleEntranceStart);

    return () => {
      window.removeEventListener(HERO_ENTRANCE_START, handleEntranceStart);
    };
  }, []);

  useLayoutEffect(() => {
    const hero = document.getElementById("main");
    if (!hero) {
      return;
    }

    const scroller = getScroller();
    const media = gsap.matchMedia();

    const heroTrigger = ScrollTrigger.create({
      trigger: hero,
      start: "bottom top",
      scroller,
      invalidateOnRefresh: true,
      onEnter: () => {
        setCornerNavColor("accent");
        setMobileCornerChromeVisible(false);
      },
      onLeaveBack: () => {
        setCornerNavColor("hero");
        setMobileCornerChromeVisible(true);
      },
    });

    media.add("(min-width: 768px)", () => {
      ensureDesktopCornerChromeVisible();

      const handleResize = () => ensureDesktopCornerChromeVisible();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    });

    return () => {
      heroTrigger.kill();
      media.revert();
      setCornerNavColor("hero");
      setMobileCornerChromeVisible(true);
    };
  }, []);

  useLayoutEffect(() => {
    const slides = slideRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!slides.length) {
      return;
    }

    const mediaElements = slides.map(
      (slide) => slide.querySelector<HTMLElement>("[data-slide-media]")!,
    );

    if (mediaElements.some((media) => !media)) {
      return;
    }

    let isCancelled = false;
    let activeIndex = 0;
    let nextTimer: gsap.core.Tween | null = null;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const initSlides = () => {
      gsap.set(slides, { opacity: 0, zIndex: 0 });
      mediaElements.forEach((media) => media.classList.remove("is-active"));
      gsap.set(slides[0], { opacity: 1, zIndex: 1 });
      restartKenBurns(mediaElements[0]);
    };

    initSlides();

    const scheduleNextCrossfade = () => {
      nextTimer?.kill();
      nextTimer = gsap.delayedCall(
        SLIDE_DURATION - CROSSFADE_DURATION,
        crossfadeToNext,
      );
    };

    const crossfadeToNext = () => {
      if (isCancelled) {
        return;
      }

      const nextIndex = (activeIndex + 1) % slides.length;
      const currentSlide = slides[activeIndex];
      const nextSlide = slides[nextIndex];
      const nextMedia = mediaElements[nextIndex];

      restartKenBurns(nextMedia);
      gsap.set(nextSlide, { opacity: 0, zIndex: 0 });
      gsap.set(currentSlide, { zIndex: 1 });

      gsap.to(nextSlide, {
        opacity: 1,
        duration: CROSSFADE_DURATION,
        ease: "power1.inOut",
      });

      gsap.to(currentSlide, {
        opacity: 0,
        duration: CROSSFADE_DURATION,
        ease: "power1.inOut",
        onComplete: () => {
          if (isCancelled) {
            return;
          }

          mediaElements[activeIndex].classList.remove("is-active");
          activeIndex = nextIndex;
          scheduleNextCrossfade();
        },
      });
    };

    waitForImages().then(() => {
      if (isCancelled) {
        return;
      }

      initSlides();

      if (!prefersReducedMotion) {
        scheduleNextCrossfade();
      }
    });

    return () => {
      isCancelled = true;
      nextTimer?.kill();
      gsap.killTweensOf(slides);
    };
  }, []);

  return (
    <section
      id="main"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#2a2520]"
    >
      <div className="absolute inset-0 overflow-hidden">
        {HERO_IMAGES.map(({ src, position }, index) => (
          <div
            key={src}
            ref={(el) => {
              slideRefs.current[index] = el;
            }}
            className="absolute inset-0 z-0 opacity-0"
            aria-hidden="true"
          >
            <Image
              data-slide-media
              src={src}
              alt=""
              fill
              sizes="100vw"
              priority={index === 0}
              className={`hero-slide-media object-cover will-change-transform ${position}`}
              draggable={false}
            />
          </div>
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-1 bg-black/55"
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full items-center justify-center px-6 md:px-12">
        <h1 className="hero-title text-left font-display text-background">
          <span
            ref={eyebrowRef}
            className="mb-5 block text-[clamp(0.7rem,1.4vw,0.95rem)] font-normal uppercase tracking-[0.32em] text-background/80"
          >
            Thiệp cưới
          </span>
          <span
            ref={sonRef}
            className="block text-[clamp(3.4rem,11.5vw,10.5rem)] font-normal leading-[0.88] tracking-[-0.02em]"
          >
            Sơn
          </span>
          <span
            ref={ampRef}
            className="hero-amp block translate-x-2 text-[clamp(0.95rem,2.2vw,1.85rem)] font-normal italic leading-[1.6] tracking-[0.06em] text-background/80 md:translate-x-4"
          >
            &
          </span>
          <span
            ref={linhRef}
            className="block text-[clamp(3.4rem,11.5vw,10.5rem)] font-normal leading-[0.88] tracking-[-0.02em]"
          >
            Linh
          </span>
        </h1>
      </div>
    </section>
  );
}
