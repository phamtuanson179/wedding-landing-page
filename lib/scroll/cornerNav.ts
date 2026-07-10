import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { isPreloaderPolygonAnimating } from "@/lib/preloader/preloaderState";

export const SECTION_IDS = [
  "main",
  "section-2",
  "section-3",
  "section-4",
  "section-5",
  "section-6",
] as const;

export function isTouchDevice() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

export function isMobileViewport() {
  return window.matchMedia("(max-width: 767px)").matches;
}

export function shouldUseScrollSmoother() {
  if (typeof window === "undefined") {
    return false;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  return !prefersReducedMotion && !isTouchDevice() && !isMobileViewport();
}

export function shouldUsePinnedGallery() {
  if (typeof window === "undefined") {
    return false;
  }

  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function shouldUseGallerySkew() {
  return shouldUseScrollSmoother();
}

export function shouldUseHorizontalStoryScroll() {
  if (typeof window === "undefined") {
    return false;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }

  return !isTouchDevice();
}

export function getScroller() {
  const wrapper = document.getElementById("smooth-wrapper");
  if (!wrapper?.classList.contains("is-smooth")) {
    return undefined;
  }

  return "#smooth-wrapper";
}

export function getCornerNav() {
  return document.querySelector<HTMLElement>("[data-corner-nav]");
}

function getCornerChrome() {
  return document.querySelectorAll<HTMLElement>("[data-hero-corner-chrome]");
}

function getScrollProgressTrack() {
  return document.querySelector<HTMLElement>("[data-scroll-progress-track]");
}

function getScrollPolygon() {
  return document.querySelector<HTMLElement>("[data-scroll-polygon]");
}

function getStoryProgress() {
  return document.querySelector<HTMLElement>("[data-story-progress]");
}

function isPreloaderActive() {
  const loader = document.getElementById("loader");
  return loader?.getAttribute("aria-hidden") !== "true";
}

let isGalleryChromeHidden = false;
let isMobileCornerNavHidden = false;

function setPastHeroState(pastHero: boolean) {
  document.documentElement.toggleAttribute("data-past-hero", pastHero);
}

function showCornerChrome() {
  const targets = Array.from(getCornerChrome());
  if (targets.length === 0) {
    return;
  }

  gsap.to(targets, {
    autoAlpha: 1,
    visibility: "visible",
    duration: 0.35,
    ease: "power2.out",
    overwrite: true,
  });
}

export function setCornerNavColor(mode: "loading" | "hero" | "accent") {
  const cornerNav = getCornerNav();
  if (!cornerNav) {
    return;
  }

  const isBeige = mode === "loading" || mode === "hero";
  cornerNav.classList.toggle("text-background", isBeige);
  cornerNav.classList.toggle("text-primary", !isBeige);
}

export function setScrollProgressColor(theme: "accent" | "beige") {
  const bar = document.querySelector<HTMLElement>("[data-scroll-progress]");
  if (!bar) {
    return;
  }

  bar.classList.toggle("bg-primary", theme === "accent");
  bar.classList.toggle("bg-background", theme === "beige");
}

export function setFinaleChrome(active: boolean) {
  setCornerNavColor(active ? "hero" : "accent");
  setScrollProgressColor(active ? "beige" : "accent");
}

export function ensureDesktopCornerChromeVisible() {
  if (isMobileViewport() || isGalleryChromeHidden) {
    return;
  }

  const targets = getCornerChrome();
  gsap.set(targets, {
    autoAlpha: 1,
    visibility: "visible",
    clearProps: "opacity,visibility",
  });
}

export function ensureCornerChromeVisible() {
  if (
    isGalleryChromeHidden ||
    (isMobileViewport() && isMobileCornerNavHidden)
  ) {
    return;
  }

  const targets = getCornerChrome();
  if (targets.length === 0) {
    return;
  }

  gsap.set(targets, {
    autoAlpha: 1,
    visibility: "visible",
    clearProps: "opacity,visibility",
  });
}

export function setMobileCornerNavVisible(visible: boolean) {
  if (!isMobileViewport() || isPreloaderPolygonAnimating()) {
    return;
  }

  isMobileCornerNavHidden = !visible;
  setPastHeroState(!visible);

  const cornerNav = getCornerNav();
  const cornerChrome = Array.from(getCornerChrome());

  if (!visible) {
    if (cornerNav) {
      gsap.set(cornerNav, {
        autoAlpha: 0,
        visibility: "hidden",
        overwrite: true,
      });
    }

    gsap.set(cornerChrome, {
      autoAlpha: 0,
      visibility: "hidden",
      overwrite: true,
    });
    return;
  }

  if (cornerNav) {
    gsap.to(cornerNav, {
      autoAlpha: 1,
      visibility: "visible",
      duration: 0.35,
      ease: "power2.out",
      overwrite: true,
    });
  }

  if (!isGalleryChromeHidden) {
    gsap.to(cornerChrome, {
      autoAlpha: 1,
      visibility: "visible",
      duration: 0.35,
      ease: "power2.out",
      overwrite: true,
    });
  }
}

export function setGalleryChromeVisible(visible: boolean) {
  if (isPreloaderPolygonAnimating()) {
    return;
  }

  if (!visible && isPreloaderActive()) {
    return;
  }

  isGalleryChromeHidden = !visible;

  const cornerChrome = Array.from(getCornerChrome());
  const scrollTrack = getScrollProgressTrack();
  const scrollPolygon = getScrollPolygon();
  const storyProgress = getStoryProgress();

  if (!visible) {
    const targets = [
      ...cornerChrome,
      scrollTrack,
      scrollPolygon,
      storyProgress,
    ].filter(Boolean) as HTMLElement[];

    gsap.set(targets, {
      autoAlpha: 0,
      visibility: "hidden",
    });
    return;
  }

  if (isMobileViewport() && isMobileCornerNavHidden) {
    if (scrollTrack) {
      gsap.to(scrollTrack, {
        autoAlpha: 1,
        visibility: "visible",
        duration: 0.35,
        ease: "power2.out",
        overwrite: true,
      });
    }

    if (storyProgress) {
      gsap.set(storyProgress, {
        autoAlpha: 1,
        visibility: "visible",
      });
    }

    return;
  }

  showCornerChrome();

  if (scrollTrack) {
    gsap.to(scrollTrack, {
      autoAlpha: 1,
      visibility: "visible",
      duration: 0.35,
      ease: "power2.out",
      overwrite: true,
    });
  }

  if (scrollPolygon) {
    gsap.to(scrollPolygon, {
      autoAlpha: 1,
      visibility: "visible",
      duration: 0.35,
      ease: "power2.out",
      overwrite: true,
    });
  }

  if (storyProgress) {
    gsap.set(storyProgress, {
      autoAlpha: 1,
      visibility: "visible",
    });
  }
}

function getCurrentSectionIndex() {
  const threshold = window.innerHeight * 0.35;
  let current = 0;

  for (let index = 0; index < SECTION_IDS.length; index += 1) {
    const section = document.getElementById(SECTION_IDS[index]);
    if (!section) {
      continue;
    }

    if (section.getBoundingClientRect().top <= threshold) {
      current = index;
    }
  }

  return current;
}

export function scrollToNextSection() {
  const currentIndex = getCurrentSectionIndex();
  const nextIndex = Math.min(currentIndex + 1, SECTION_IDS.length - 1);
  const targetId = SECTION_IDS[nextIndex];
  const target = `#${targetId}`;
  const smoother = ScrollSmoother.get();

  if (smoother) {
    smoother.scrollTo(target, true, "top top");
    return;
  }

  document.getElementById(targetId)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}
