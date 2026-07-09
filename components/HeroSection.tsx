"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import Image from "next/image";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=2200&q=80",
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2200&q=80",
  "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=2200&q=80",
];

const SLIDE_DURATION = 5;
const CROSSFADE_DURATION = 0.9;

const preloadedImages =
  typeof window !== "undefined"
    ? HERO_IMAGES.map((src) => {
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

export function HeroSection() {
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);

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
      id='main'
      className='relative flex min-h-screen items-center justify-center overflow-hidden bg-[#2a2520]'
    >
      <div className='absolute inset-0 overflow-hidden'>
        {HERO_IMAGES.map((src, index) => (
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
              className="hero-slide-media object-cover will-change-transform"
              draggable={false}
            />
          </div>
        ))}
      </div>

      <div
        className='pointer-events-none absolute inset-0 z-1 bg-black/55'
        aria-hidden='true'
      />

      <div className='relative z-10 flex w-full items-center justify-center px-6 md:px-12'>
        <h1 className='hero-title text-left font-display text-background'>
          <span className='mb-4 block text-[clamp(0.7rem,1.4vw,0.95rem)] font-normal uppercase tracking-[0.32em] text-background/75'>
            Thiệp cưới
          </span>
          <span className='block text-[clamp(3.4rem,11.5vw,10.5rem)] font-normal leading-[0.82] tracking-[-0.02em]'>
            Sơn
          </span>
          <span className='block text-[clamp(1.4rem,3.2vw,2.8rem)] font-normal italic leading-20 tracking-[0.02em] text-background/85'>
            &
          </span>
          <span className='block text-[clamp(3.4rem,11.5vw,10.5rem)] font-normal leading-[0.82] tracking-[-0.02em]'>
            Linh
          </span>
        </h1>
      </div>
    </section>
  );
}
