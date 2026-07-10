"use client";

import { useEffect, useRef } from "react";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { updateScrollProgressTheme } from "@/lib/scroll/cornerNav";

/**
 * Get the scroll progress using the ScrollSmoother instance
 * @returns The scroll progress as a number between 0 and 1
 */
function getScrollProgress() {
  const smoother = ScrollSmoother.get();
  if (smoother) {
    return smoother.progress;
  }

  const maxScroll =
    document.documentElement.scrollHeight - window.innerHeight;
  return maxScroll > 0 ? window.scrollY / maxScroll : 0;
}

export function ScrollProgress() {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const progress = progressRef.current;
    if (!progress) {
      return;
    }

    const updateProgress = () => {
      const ratio = getScrollProgress();
      progress.style.transform = `translateY(${(ratio - 1) * 100}%)`;
      updateScrollProgressTheme();
    };

    const onSmootherUpdate = (event: Event) => {
      const ratio = (event as CustomEvent<number>).detail;
      progress.style.transform = `translateY(${(ratio - 1) * 100}%)`;
      updateScrollProgressTheme();
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("scrollsmoother:update", onSmootherUpdate);
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("scrollsmoother:update", onSmootherUpdate);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <div
      data-scroll-progress-track
      className="pointer-events-none fixed top-0 left-0 z-45 h-full w-[5px] overflow-hidden"
      aria-hidden="true"
    >
      <div
        ref={progressRef}
        data-scroll-progress
        className="absolute inset-0 bg-primary transition-colors duration-500"
        style={{ transform: "translateY(-100%)" }}
      />
    </div>
  );
}
