"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import {
  getScroller,
  isTouchDevice,
  setCornerNavColor,
  shouldUseHorizontalStoryScroll,
} from "@/lib/scroll/cornerNav";

type StoryScrollAxis = "x" | "y";

function subscribeStoryScrollAxis(onStoreChange: () => void) {
  const touchMq = window.matchMedia("(hover: none) and (pointer: coarse)");
  const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");

  const onChange = () => onStoreChange();
  touchMq.addEventListener("change", onChange);
  motionMq.addEventListener("change", onChange);
  window.addEventListener("resize", onChange);

  return () => {
    touchMq.removeEventListener("change", onChange);
    motionMq.removeEventListener("change", onChange);
    window.removeEventListener("resize", onChange);
  };
}

function getStoryScrollAxisSnapshot(): StoryScrollAxis {
  return shouldUseHorizontalStoryScroll() ? "x" : "y";
}

function useStoryScrollAxis() {
  return useSyncExternalStore(
    subscribeStoryScrollAxis,
    getStoryScrollAxisSnapshot,
    (): StoryScrollAxis => "x",
  );
}

gsap.registerPlugin(ScrollTrigger);

const STORY_PANELS = [
  {
    index: "01",
    label: "Quá trình",
    title: "Mười năm bên nhau",
    description:
      "Từ những ngày đầu là bạn bè, chúng mình lớn lên cùng nhau — chia sẻ mọi điều và chở che cho nhau.",
    date: "14.03",
    image:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=80",
    layout: "text-left" as const,
    imageAspect: "aspect-[4/5]",
    imageSizes: "(max-width: 768px) 88vw, 42vw",
  },
  {
    index: "02",
    label: "Cầu hôn",
    title: "Khoảnh khắc nói “đồng ý”",
    description:
      "Giữa những kỷ niệm quen thuộc, chúng mình chọn bước sang chương mới — nơi tình bạn và tình yêu cùng trở thành cam kết.",
    date: "22.08",
    image:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80",
    layout: "text-right" as const,
    imageAspect: "aspect-[3/4]",
    imageSizes: "(max-width: 768px) 88vw, 42vw",
  },
  {
    index: "03",
    label: "Cưới",
    title: "Về chung một nhà",
    description:
      "Hôm nay, chúng mình chính thức trở thành gia đình — vẫn là tri kỷ, vẫn là chỗ dựa, và là hành trình mới bắt đầu từ đây.",
    date: "29.11",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
    layout: "text-left-wide" as const,
    imageAspect: "aspect-[4/5] md:aspect-[3/4]",
    imageSizes: "(max-width: 768px) 92vw, 52vw",
  },
] as const;

type StoryPanel = (typeof STORY_PANELS)[number];

type PanelAnimationConfig = {
  maskHidden: string;
  parallaxX: [number, number];
  parallaxY: [number, number];
};

const PANEL_ANIMATIONS: Record<StoryPanel["index"], PanelAnimationConfig> = {
  "01": {
    maskHidden: "inset(0% 100% 0% 0%)",
    parallaxX: [-40, 40],
    parallaxY: [0, 0],
  },
  "02": {
    maskHidden: "inset(100% 0% 0% 0%)",
    parallaxX: [-28, 28],
    parallaxY: [18, -18],
  },
  "03": {
    maskHidden: "inset(0% 100% 0% 0%)",
    parallaxX: [-40, 40],
    parallaxY: [0, 0],
  },
};

const CONTENT_INSET =
  "px-6 pt-14 pb-24 md:px-24 md:pt-20 md:pb-28 lg:px-32";

const STORY_LABEL_CLASS = "text-[#d4b87a]";
const STORY_MUTED_CLASS = "text-background/55";
const STORY_BODY_CLASS = "text-background/88";
const STORY_BORDER_CLASS = "border-background/22";

function StoryHeader() {
  return (
    <header>
      <p className={`text-xs uppercase tracking-[0.32em] ${STORY_MUTED_CLASS}`}>
        Câu chuyện của chúng mình
      </p>
      <p
        className={`mt-3 inline-block border px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] transition-colors ${STORY_BORDER_CLASS} ${STORY_BODY_CLASS} hover:border-[#d4b87a]/55 hover:text-background`}
      >
        10 năm — từ bạn bè đến tri kỷ, và là một
      </p>
    </header>
  );
}

function PanelText({ panel }: { panel: StoryPanel }) {
  return (
    <div className="max-w-md">
      <p
        className={`story-text-line story-text-label text-xs uppercase tracking-[0.32em] ${STORY_LABEL_CLASS}`}
      >
        {panel.label}
      </p>
      <h3 className="story-text-line story-text-title mt-2 font-display text-[clamp(1.65rem,6.5vw,3.5rem)] leading-[1.05] text-background md:mt-4">
        {panel.title}
      </h3>
      <p
        className={`story-text-line story-text-desc mt-3 text-sm leading-relaxed font-light md:mt-5 md:text-lg ${STORY_BODY_CLASS}`}
      >
        {panel.description}
      </p>
      <p
        className={`story-text-line story-text-date mt-4 text-xs uppercase tracking-[0.28em] md:mt-6 ${STORY_MUTED_CLASS}`}
      >
        {panel.date}
      </p>
    </div>
  );
}

function PanelImage({ panel }: { panel: StoryPanel }) {
  return (
    <div
      className={`story-image-mask relative w-full max-w-[min(52vw,220px)] overflow-hidden md:max-w-[min(88vw,420px)] ${panel.imageAspect}`}
    >
      <div className="story-image-inner relative h-full w-full">
        <Image
          src={panel.image}
          alt=""
          fill
          sizes={panel.imageSizes}
          className="object-cover"
          priority={panel.index === "01"}
        />
      </div>
    </div>
  );
}

function PanelContent({
  panel,
  className = "",
}: {
  panel: StoryPanel;
  className?: string;
}) {
  const text = <PanelText panel={panel} />;
  const image = <PanelImage panel={panel} />;

  if (panel.layout === "text-right") {
    return (
      <div
        className={`flex h-full w-full flex-col items-start justify-start gap-4 md:flex-row md:items-center md:justify-center md:gap-16 lg:gap-20 ${className}`}
      >
        <div className="flex w-full shrink-0 items-center justify-center md:w-1/2">
          {image}
        </div>
        <div className="flex w-full items-center md:w-1/2">{text}</div>
      </div>
    );
  }

  if (panel.layout === "text-left-wide") {
    return (
      <div
        className={`flex h-full w-full flex-col items-start justify-start gap-4 md:flex-row md:items-center md:justify-center md:gap-14 lg:gap-16 ${className}`}
      >
        <div className="flex w-full items-center md:w-[40%]">{text}</div>
        <div className="flex w-full shrink-0 items-center justify-center md:w-[60%]">
          {image}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex h-full w-full flex-col items-start justify-start gap-4 md:flex-row md:items-center md:justify-center md:gap-16 lg:gap-20 ${className}`}
    >
      <div className="flex w-full items-center md:w-1/2">{text}</div>
      <div className="flex w-full shrink-0 items-center justify-center md:w-1/2">
        {image}
      </div>
    </div>
  );
}

function ProgressIndicator({
  progressRefs,
}: {
  progressRefs: React.RefObject<Array<HTMLSpanElement | null>>;
}) {
  return (
    <div
      data-story-progress
      className="pointer-events-none absolute inset-x-0 bottom-8 z-30 flex items-center justify-center gap-5 text-xs uppercase tracking-[0.28em] md:bottom-10"
    >
      {STORY_PANELS.map((panel, index) => (
        <span
          key={panel.index}
          ref={(el) => {
            progressRefs.current[index] = el;
          }}
          className={`${STORY_MUTED_CLASS} transition-[opacity,color] duration-300`}
        >
          {panel.index}
        </span>
      ))}
    </div>
  );
}

function setPanelAnimationState(
  panel: HTMLElement,
  panelIndex: string,
  revealed: boolean,
  animate: boolean,
) {
  const config = PANEL_ANIMATIONS[panelIndex as StoryPanel["index"]];
  const mask = panel.querySelector<HTMLElement>(".story-image-mask");
  const inner = panel.querySelector<HTMLElement>(".story-image-inner");
  const label = panel.querySelector<HTMLElement>(".story-text-label");
  const title = panel.querySelector<HTMLElement>(".story-text-title");
  const desc = panel.querySelector<HTMLElement>(".story-text-desc");
  const date = panel.querySelector<HTMLElement>(".story-text-date");
  const textLines = [label, title, desc, date].filter(Boolean) as HTMLElement[];

  if (!mask || !inner || !config) {
    return;
  }

  if (revealed) {
    gsap.to(mask, {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: animate ? 0.9 : 0,
      ease: "power2.out",
      overwrite: true,
    });
    gsap.to(inner, {
      scale: 1,
      x: 0,
      y: 0,
      duration: animate ? 0.9 : 0,
      ease: "power2.out",
      overwrite: true,
    });
    gsap.to(textLines, {
      y: 0,
      autoAlpha: 1,
      duration: animate ? 0.55 : 0,
      stagger: animate ? 0.1 : 0,
      ease: "power2.out",
      overwrite: true,
    });
    return;
  }

  gsap.set(mask, { clipPath: config.maskHidden });
  gsap.set(inner, { scale: 1.1, x: 0, y: 0 });
  gsap.set(textLines, { y: 30, autoAlpha: 0 });
}

function setupHorizontalPanelRevealAnimations(
  panel: HTMLElement,
  panelIndex: StoryPanel["index"],
  horizontalTween: gsap.core.Tween,
  scrollTriggers: ScrollTrigger[],
) {
  setupPinnedPanelRevealAnimations(
    panel,
    panelIndex,
    horizontalTween,
    scrollTriggers,
    "x",
  );
}

function setupVerticalPanelRevealAnimations(
  panel: HTMLElement,
  panelIndex: StoryPanel["index"],
  verticalTween: gsap.core.Tween,
  scrollTriggers: ScrollTrigger[],
) {
  setupPinnedPanelRevealAnimations(
    panel,
    panelIndex,
    verticalTween,
    scrollTriggers,
    "y",
  );
}

function setupPinnedPanelRevealAnimations(
  panel: HTMLElement,
  panelIndex: StoryPanel["index"],
  containerTween: gsap.core.Tween,
  scrollTriggers: ScrollTrigger[],
  axis: StoryScrollAxis,
) {
  const config = PANEL_ANIMATIONS[panelIndex];
  const mask = panel.querySelector<HTMLElement>(".story-image-mask");
  const inner = panel.querySelector<HTMLElement>(".story-image-inner");
  const label = panel.querySelector<HTMLElement>(".story-text-label");
  const title = panel.querySelector<HTMLElement>(".story-text-title");
  const desc = panel.querySelector<HTMLElement>(".story-text-desc");
  const date = panel.querySelector<HTMLElement>(".story-text-date");
  const isVertical = axis === "y";

  if (!mask || !inner) {
    return;
  }

  const imageReveal: ScrollTrigger.Vars = {
    trigger: panel,
    containerAnimation: containerTween,
    start: isVertical ? "top 85%" : "left 85%",
    end: isVertical ? "top 45%" : "left 45%",
    scrub: 0.6,
  };

  const maskTween = gsap.fromTo(
    mask,
    { clipPath: config.maskHidden },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      ease: "power2.out",
      scrollTrigger: imageReveal,
    },
  );
  if (maskTween.scrollTrigger) {
    scrollTriggers.push(maskTween.scrollTrigger);
  }

  const imageScaleTween = gsap.fromTo(
    inner,
    { scale: 1.1 },
    {
      scale: 1,
      ease: "power2.out",
      scrollTrigger: imageReveal,
    },
  );
  if (imageScaleTween.scrollTrigger) {
    scrollTriggers.push(imageScaleTween.scrollTrigger);
  }

  const parallaxTween = gsap.fromTo(
    inner,
    { x: config.parallaxX[0], y: config.parallaxY[0] },
    {
      x: config.parallaxX[1],
      y: config.parallaxY[1],
      ease: "none",
      scrollTrigger: {
        trigger: panel,
        containerAnimation: containerTween,
        start: isVertical ? "top bottom" : "left right",
        end: isVertical ? "bottom top" : "right left",
        scrub: true,
      },
    },
  );
  if (parallaxTween.scrollTrigger) {
    scrollTriggers.push(parallaxTween.scrollTrigger);
  }

  const revealText = (
    element: HTMLElement | null,
    start: string,
    end: string,
  ) => {
    if (!element) {
      return;
    }

    const tween = gsap.fromTo(
      element,
      { y: 28, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: panel,
          containerAnimation: containerTween,
          start,
          end,
          scrub: 0.55,
        },
      },
    );

    if (tween.scrollTrigger) {
      scrollTriggers.push(tween.scrollTrigger);
    }
  };

  if (panelIndex === "02") {
    if (isVertical) {
      revealText(label, "top 82%", "top 68%");
      revealText(title, "top 78%", "top 60%");
      revealText(desc, "top 74%", "top 54%");
      revealText(date, "top 70%", "top 50%");
    } else {
      revealText(label, "left 82%", "left 68%");
      revealText(title, "left 78%", "left 60%");
      revealText(desc, "left 74%", "left 54%");
      revealText(date, "left 70%", "left 50%");
    }
    return;
  }

  const textLines = [label, title, desc, date].filter(Boolean) as HTMLElement[];
  const textTween = gsap.fromTo(
    textLines,
    { y: 30, autoAlpha: 0 },
    {
      y: 0,
      autoAlpha: 1,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: panel,
        containerAnimation: containerTween,
        start: isVertical ? "top 80%" : "left 80%",
        end: isVertical ? "top 50%" : "left 50%",
        scrub: 0.55,
      },
    },
  );
  if (textTween.scrollTrigger) {
    scrollTriggers.push(textTween.scrollTrigger);
  }
}

function StoryReducedMotionLayout({
  sectionRef,
}: {
  sectionRef?: React.RefObject<HTMLElement | null>;
}) {
  const articleRefs = useRef<Array<HTMLElement | null>>([]);

  useLayoutEffect(() => {
    const articles = articleRefs.current.filter(Boolean) as HTMLElement[];

    articles.forEach((article, index) => {
      setPanelAnimationState(article, STORY_PANELS[index].index, true, false);
    });
  }, []);

  return (
    <section
      id="section-3"
      ref={sectionRef}
      className="overflow-x-hidden bg-primary text-background"
    >
      <div className={`${CONTENT_INSET} py-16 md:py-20`}>
        <StoryHeader />
      </div>
      {STORY_PANELS.map((panel, index) => (
        <article
          key={panel.index}
          ref={(element) => {
            articleRefs.current[index] = element;
          }}
          className={`${CONTENT_INSET} border-t ${STORY_BORDER_CLASS} py-14 md:py-24`}
        >
          <PanelContent panel={panel} />
        </article>
      ))}
    </section>
  );
}

function updateStoryProgress(
  progressItems: HTMLSpanElement[],
  panels: HTMLElement[],
  progress: number,
) {
  const activeIndex = Math.min(
    Math.round(progress * (panels.length - 1)),
    panels.length - 1,
  );

  progressItems.forEach((item, index) => {
    const isActive = index === activeIndex;
    gsap.to(item, {
      opacity: isActive ? 1 : 0.4,
      color: isActive ? "#d4b87a" : "rgba(230, 223, 211, 0.55)",
      duration: 0.25,
      overwrite: true,
    });
  });
}

function StoryHorizontalPinnedLayout({
  sectionRef,
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
}) {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const progressRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const track = trackRef.current;
    const panels = panelRefs.current.filter(Boolean) as HTMLDivElement[];
    const progressItems = progressRefs.current.filter(Boolean) as HTMLSpanElement[];

    if (!section || !pin || !track || panels.length === 0) {
      return;
    }

    const scroller = getScroller();
    const smoother = ScrollSmoother.get();

    panels.forEach((panel, index) =>
      setPanelAnimationState(panel, STORY_PANELS[index].index, false, false),
    );
    gsap.set(progressItems, { opacity: 0.4, color: "rgba(230, 223, 211, 0.55)" });
    gsap.set(progressItems[0], { opacity: 1, color: "#d4b87a" });

    const scrollTriggers: ScrollTrigger[] = [];

    const getScrollDistance = () =>
      Math.max(track.scrollWidth - window.innerWidth, 0);

    const horizontalTween = gsap.to(track, {
      x: () => -getScrollDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${getScrollDistance()}`,
        pin,
        scrub: 1,
        scroller,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        pinReparent: false,
        pinType: isTouchDevice() ? "fixed" : "transform",
        onUpdate: (self) => {
          updateStoryProgress(progressItems, panels, self.progress);
        },
      },
    });

    if (horizontalTween.scrollTrigger) {
      scrollTriggers.push(horizontalTween.scrollTrigger);
    }

    panels.forEach((panel, index) => {
      setupHorizontalPanelRevealAnimations(
        panel,
        STORY_PANELS[index].index,
        horizontalTween,
        scrollTriggers,
      );
    });

    const refresh = () => ScrollTrigger.refresh();

    if (smoother) {
      refresh();
    } else {
      requestAnimationFrame(refresh);
    }

    window.addEventListener("resize", refresh);

    return () => {
      window.removeEventListener("resize", refresh);
      horizontalTween.kill();
      scrollTriggers.forEach((trigger) => trigger.kill());
    };
  }, [sectionRef]);

  return (
    <section id="section-3" ref={sectionRef} className="relative overflow-x-hidden bg-primary">
      <div
        ref={pinRef}
        className="relative h-dvh w-full overflow-hidden bg-primary text-background"
      >
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 z-20 px-6 pt-14 md:px-24 md:pt-20 lg:px-32`}
        >
          <StoryHeader />
        </div>

        <div ref={trackRef} className="flex h-full w-full will-change-transform">
          {STORY_PANELS.map((panel, index) => (
            <div
              key={panel.index}
              ref={(el) => {
                panelRefs.current[index] = el;
              }}
              className="h-full w-full shrink-0 basis-full px-6 pb-24 pt-[8.75rem] md:px-24 md:pb-28 md:pt-40 lg:px-32"
            >
              <PanelContent panel={panel} />
            </div>
          ))}
        </div>

        <ProgressIndicator progressRefs={progressRefs} />
      </div>
    </section>
  );
}

function StoryVerticalPinnedLayout({
  sectionRef,
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
}) {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const progressRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const track = trackRef.current;
    const panels = panelRefs.current.filter(Boolean) as HTMLDivElement[];
    const progressItems = progressRefs.current.filter(Boolean) as HTMLSpanElement[];

    if (!section || !pin || !track || panels.length === 0) {
      return;
    }

    panels.forEach((panel, index) =>
      setPanelAnimationState(panel, STORY_PANELS[index].index, false, false),
    );
    gsap.set(progressItems, { opacity: 0.4, color: "rgba(230, 223, 211, 0.55)" });
    gsap.set(progressItems[0], { opacity: 1, color: "#d4b87a" });

    const scrollTriggers: ScrollTrigger[] = [];

    const getScrollDistance = () =>
      Math.max(track.scrollHeight - window.innerHeight, 0);

    const verticalTween = gsap.to(track, {
      y: () => -getScrollDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${getScrollDistance()}`,
        pin,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        pinReparent: false,
        pinType: isTouchDevice() ? "fixed" : "transform",
        onUpdate: (self) => {
          updateStoryProgress(progressItems, panels, self.progress);
        },
      },
    });

    if (verticalTween.scrollTrigger) {
      scrollTriggers.push(verticalTween.scrollTrigger);
    }

    panels.forEach((panel, index) => {
      setupVerticalPanelRevealAnimations(
        panel,
        STORY_PANELS[index].index,
        verticalTween,
        scrollTriggers,
      );
    });

    const refresh = () => ScrollTrigger.refresh();
    requestAnimationFrame(refresh);
    window.addEventListener("resize", refresh);

    return () => {
      window.removeEventListener("resize", refresh);
      verticalTween.kill();
      scrollTriggers.forEach((trigger) => trigger.kill());
    };
  }, [sectionRef]);

  return (
    <section id="section-3" ref={sectionRef} className="relative overflow-x-hidden bg-primary">
      <div
        ref={pinRef}
        className="relative h-dvh w-full overflow-hidden bg-primary text-background"
      >
        <div className={`pointer-events-none absolute inset-x-0 top-0 z-20 ${CONTENT_INSET}`}>
          <StoryHeader />
        </div>

        <div ref={trackRef} className="flex h-full w-full flex-col will-change-transform">
          {STORY_PANELS.map((panel, index) => (
            <div
              key={panel.index}
              ref={(el) => {
                panelRefs.current[index] = el;
              }}
              className={`h-dvh w-full shrink-0 ${CONTENT_INSET}`}
            >
              <PanelContent panel={panel} className="pt-28 md:pt-32" />
            </div>
          ))}
        </div>

        <ProgressIndicator progressRefs={progressRefs} />
      </div>
    </section>
  );
}

export function LoveStorySection() {
  const scrollAxis = useStoryScrollAxis();
  const reducedMotion = useSyncExternalStore(
    subscribeStoryScrollAxis,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );

  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const scroller = getScroller();
    const chromeTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top 55%",
      end: "bottom 45%",
      scroller,
      invalidateOnRefresh: true,
      onEnter: () => setCornerNavColor("hero"),
      onEnterBack: () => setCornerNavColor("hero"),
      onLeave: () => setCornerNavColor("accent"),
      onLeaveBack: () => setCornerNavColor("accent"),
    });

    return () => {
      chromeTrigger.kill();
    };
  }, []);

  if (reducedMotion) {
    return <StoryReducedMotionLayout sectionRef={sectionRef} />;
  }

  if (scrollAxis === "y") {
    return <StoryVerticalPinnedLayout sectionRef={sectionRef} />;
  }

  return <StoryHorizontalPinnedLayout sectionRef={sectionRef} />;
}
