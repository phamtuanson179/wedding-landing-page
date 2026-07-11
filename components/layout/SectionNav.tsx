"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { whenPreloaderComplete } from "@/lib/preloader/preloaderState";
import {
  SECTION_NAV_ITEMS,
  SECTION_NAV_BAR_HEIGHT_PX,
  getActiveSectionIndex,
  isSectionNavOnDark,
  scrollToSection,
  setSectionNavHeightCssVar,
} from "@/lib/scroll/sectionNav";

gsap.registerPlugin(ScrollTrigger);

function subscribeActiveSection(onStoreChange: () => void) {
  const update = () => onStoreChange();

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  window.addEventListener("scrollsmoother:update", update);

  const stopWatchingPreloader = whenPreloaderComplete(update);

  return () => {
    window.removeEventListener("scroll", update);
    window.removeEventListener("resize", update);
    window.removeEventListener("scrollsmoother:update", update);
    stopWatchingPreloader();
  };
}

function getSafeAreaInsetBottomPx() {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:absolute;visibility:hidden;pointer-events:none;height:env(safe-area-inset-bottom,0px)";
  document.body.appendChild(probe);
  const value = probe.getBoundingClientRect().height;
  probe.remove();
  return value;
}

function syncSectionNavHeightVar(active: boolean, nav?: HTMLElement | null) {
  if (!active) {
    setSectionNavHeightCssVar(0);
    return;
  }

  if (nav) {
    setSectionNavHeightCssVar(nav.getBoundingClientRect().height);
    return;
  }

  const existing = document.querySelector<HTMLElement>("[data-section-nav]");
  if (existing) {
    setSectionNavHeightCssVar(existing.getBoundingClientRect().height);
    return;
  }

  setSectionNavHeightCssVar(
    SECTION_NAV_BAR_HEIGHT_PX + getSafeAreaInsetBottomPx(),
  );
}

export function SectionNav() {
  const navRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const sync = () => {
      setActiveIndex(getActiveSectionIndex(0.5));
    };

    const stopWatchingPreloader = whenPreloaderComplete(() => {
      setVisible(true);
      sync();
    });

    const unsubscribe = subscribeActiveSection(sync);
    sync();

    return () => {
      stopWatchingPreloader();
      unsubscribe();
    };
  }, []);

  useLayoutEffect(() => {
    if (!visible) {
      syncSectionNavHeightVar(false);
      setInteractive(false);
      return;
    }

    const nav = navRef.current;
    if (!nav) {
      return;
    }

    const items = Array.from(nav.querySelectorAll<HTMLElement>("li"));
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const syncHeight = () => {
      syncSectionNavHeightVar(true, nav);
      ScrollTrigger.refresh();
    };

    // Enable taps after paint — don't wait for entrance tween (iOS can stall).
    const enableTaps = window.setTimeout(() => setInteractive(true), 0);

    // Hide before first paint of this mount — prevents the flash.
    gsap.set(nav, { yPercent: 100, autoAlpha: 0 });
    gsap.set(items, { y: 8, autoAlpha: 0 });
    syncHeight();

    if (reducedMotion) {
      gsap.set(nav, { yPercent: 0, autoAlpha: 1 });
      gsap.set(items, { y: 0, autoAlpha: 1 });
      window.addEventListener("resize", syncHeight);
      return () => {
        window.clearTimeout(enableTaps);
        window.removeEventListener("resize", syncHeight);
        syncSectionNavHeightVar(false);
        setInteractive(false);
      };
    }

    const timeline = gsap.timeline({
      defaults: { ease: "power3.out" },
    });

    timeline
      .to(nav, {
        yPercent: 0,
        autoAlpha: 1,
        duration: 0.85,
      })
      .to(
        items,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.45,
          stagger: 0.04,
          ease: "power2.out",
        },
        "-=0.5",
      );

    window.addEventListener("resize", syncHeight);

    return () => {
      window.clearTimeout(enableTaps);
      timeline.kill();
      window.removeEventListener("resize", syncHeight);
      syncSectionNavHeightVar(false);
      setInteractive(false);
    };
  }, [visible]);

  if (!visible) {
    return null;
  }

  const onDark = isSectionNavOnDark(activeIndex);

  return (
    <nav
      ref={navRef}
      data-section-nav
      data-nav-theme={onDark ? "dark" : "light"}
      aria-label="Điều hướng các phần"
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-[55] flex flex-col border-t transition-[background-color,border-color,color] duration-300 ${
        onDark
          ? "border-background/35 bg-primary text-background"
          : "border-foreground/20 bg-background text-foreground"
      }`}
      style={{
        height: `calc(${SECTION_NAV_BAR_HEIGHT_PX}px + env(safe-area-inset-bottom, 0px))`,
      }}
    >
      <ul
        className={`mx-auto grid h-[42px] w-full shrink-0 grid-cols-6 ${
          interactive ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {SECTION_NAV_ITEMS.map((item, index) => {
          const isActive = index === activeIndex;

          return (
            <li key={item.id} className="min-w-0">
              <button
                type="button"
                aria-label={`Đến ${item.label}`}
                aria-current={isActive ? "true" : undefined}
                title={item.label}
                tabIndex={interactive ? 0 : -1}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection(item.id);
                  window.setTimeout(() => {
                    setActiveIndex(getActiveSectionIndex(0.5));
                  }, 120);
                }}
                className={`group relative flex h-full w-full flex-col items-center justify-center gap-0.5 px-1 transition-colors duration-300 md:flex-row md:gap-1.5 md:px-2 [-webkit-tap-highlight-color:transparent] ${
                  isActive
                    ? onDark
                      ? "text-background"
                      : "text-primary"
                    : onDark
                      ? "text-background/40 hover:text-background/70"
                      : "text-foreground/40 hover:text-foreground/70"
                }`}
              >
                <span className="font-display text-[13px] leading-none tracking-[0.04em] md:text-sm">
                  {item.index}
                </span>
                <span
                  aria-hidden="true"
                  className="hidden font-display text-[11px] leading-none opacity-50 md:inline"
                >
                  /
                </span>
                <span className="max-w-full truncate text-[8px] font-light uppercase leading-none tracking-[0.18em] md:text-[9px] md:tracking-[0.22em]">
                  {item.shortLabel}
                </span>

                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-x-3 bottom-1 h-px transition-[opacity,background-color,transform] duration-300 md:inset-x-4 ${
                    isActive
                      ? onDark
                        ? "bg-background opacity-100"
                        : "bg-primary opacity-100"
                      : "bg-current opacity-0"
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
