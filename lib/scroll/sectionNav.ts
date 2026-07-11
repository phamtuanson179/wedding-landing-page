import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  SECTION_IDS,
  isMobileViewport,
  isTouchDevice,
} from "@/lib/scroll/cornerNav";

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

export const SECTION_NAV_ITEMS = [
  { id: SECTION_IDS[0], index: "01", shortLabel: "HOME", label: "Trang chủ" },
  { id: SECTION_IDS[1], index: "02", shortLabel: "INTRO", label: "Giới thiệu" },
  { id: SECTION_IDS[2], index: "03", shortLabel: "STORY", label: "Câu chuyện" },
  { id: SECTION_IDS[3], index: "04", shortLabel: "ALBUM", label: "Album" },
  { id: SECTION_IDS[4], index: "05", shortLabel: "EVENT", label: "Lễ cưới" },
  { id: SECTION_IDS[5], index: "06", shortLabel: "GIFT", label: "Mừng cưới" },
] as const;

export type SectionNavItem = (typeof SECTION_NAV_ITEMS)[number];

/** Fixed editorial nav bar height (excludes iOS safe-area). */
export const SECTION_NAV_BAR_HEIGHT_PX = 42;

/** Dark burgundy sections — nav uses ivory chrome instead of charcoal. */
export function isSectionNavOnDark(sectionIndex: number) {
  const id = SECTION_IDS[sectionIndex];
  return id === "section-3" || id === "section-5" || id === "section-6";
}

/** Resolved px height of the fixed section nav (0 while hidden). */
export function getResolvedSectionNavHeightPx() {
  if (typeof window === "undefined") {
    return 0;
  }

  const nav = document.querySelector<HTMLElement>("[data-section-nav]");
  if (nav) {
    return Math.round(nav.getBoundingClientRect().height);
  }

  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--section-nav-height")
    .trim();
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

export function setSectionNavHeightCssVar(px: number) {
  document.documentElement.style.setProperty(
    "--section-nav-height",
    `${Math.max(0, Math.round(px))}px`,
  );
  window.dispatchEvent(new Event("sectionnav:height"));
}

export function getActiveSectionIndex(thresholdRatio = 0.5) {
  const threshold = window.innerHeight * thresholdRatio;
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

function getPageScrollY() {
  return (
    window.scrollY ||
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  );
}

function nativeScrollToElement(
  target: HTMLElement,
  behavior: ScrollBehavior,
) {
  const top = Math.max(
    0,
    target.getBoundingClientRect().top + getPageScrollY(),
  );

  const scrollingElement =
    (document.scrollingElement as HTMLElement | null) ??
    document.documentElement;

  try {
    window.scrollTo({ top, behavior });
  } catch {
    scrollingElement.scrollTop = top;
  }

  // iOS sometimes ignores the first smooth scrollTo — reinforce next frame.
  if (behavior === "smooth") {
    window.requestAnimationFrame(() => {
      const drift = Math.abs(getPageScrollY() - top);
      if (drift > 24) {
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  }
}

export function scrollToSection(sectionId: string) {
  const target = document.getElementById(sectionId);
  if (!target) {
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const smoother = ScrollSmoother.get();

  if (smoother) {
    smoother.scrollTo(`#${sectionId}`, !prefersReducedMotion, "top top");
    return;
  }

  // iOS / touch: GSAP ScrollTo + autoKill often no-ops or gets killed by
  // rubber-banding. Native scroll is the reliable path.
  if (isTouchDevice() || isMobileViewport() || prefersReducedMotion) {
    nativeScrollToElement(target, prefersReducedMotion ? "auto" : "smooth");
    return;
  }

  gsap.to(window, {
    duration: 1.2,
    ease: "power3.inOut",
    scrollTo: {
      y: target,
      autoKill: false,
      offsetY: 0,
    },
    overwrite: true,
  });
}

export function scrollToNextSection() {
  const nextIndex = Math.min(
    getActiveSectionIndex(0.5) + 1,
    SECTION_IDS.length - 1,
  );
  scrollToSection(SECTION_IDS[nextIndex]);
}
