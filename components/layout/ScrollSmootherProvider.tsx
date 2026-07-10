"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { shouldUseScrollSmoother } from "@/lib/scroll/cornerNav";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

type ScrollSmootherProviderProps = {
  children: React.ReactNode;
};

export function ScrollSmootherProvider({
  children,
}: ScrollSmootherProviderProps) {
  useLayoutEffect(() => {
    ScrollTrigger.config({
      ignoreMobileResize: true,
    });

    const wrapper = document.getElementById("smooth-wrapper");
    if (!wrapper || !shouldUseScrollSmoother()) {
      return;
    }

    wrapper.classList.add("is-smooth");

    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1,
      smoothTouch: 0.1,
      effects: true,
      onUpdate: (self) => {
        window.dispatchEvent(
          new CustomEvent("scrollsmoother:update", {
            detail: self.progress,
          }),
        );
      },
    });

    ScrollTrigger.refresh();

    return () => {
      smoother.kill();
      wrapper.classList.remove("is-smooth");
    };
  }, []);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  );
}
