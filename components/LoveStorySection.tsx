"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

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
  "px-12 pt-14 pb-24 md:px-24 md:pt-20 md:pb-28 lg:px-32";

function getScroller() {
  return document.getElementById("smooth-wrapper") ? "#smooth-wrapper" : undefined;
}

function getCornerNav() {
  return document.querySelector<HTMLElement>("[data-corner-nav]");
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function hideMobileCornerChrome() {
  const targets = document.querySelectorAll<HTMLElement>(
    "[data-hero-corner-chrome]",
  );

  gsap.set(targets, {
    autoAlpha: 0,
    visibility: "hidden",
    overwrite: true,
  });
}

function setCornerNavStoryActive(active: boolean) {
  if (isMobileViewport()) {
    if (active) {
      hideMobileCornerChrome();
    }
    return;
  }

  const cornerNav = getCornerNav();
  if (!cornerNav) {
    return;
  }

  cornerNav.classList.toggle("text-primary", active);
  cornerNav.classList.toggle("text-background", !active);
}

function createCornerNavColorTrigger(section: HTMLElement) {
  const scroller = getScroller();

  return ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: "bottom top",
    scroller,
    invalidateOnRefresh: true,
    onEnter: () => setCornerNavStoryActive(true),
    onLeave: () => setCornerNavStoryActive(false),
    onEnterBack: () => setCornerNavStoryActive(true),
    onLeaveBack: () => setCornerNavStoryActive(false),
  });
}

function StoryHeader() {
  return (
    <header>
      <p className="text-xs uppercase tracking-[0.32em] text-foreground/68">
        Câu chuyện của chúng mình
      </p>
      <p className="mt-3 inline-block border border-foreground/28 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-foreground/82">
        10 năm — từ bạn bè đến tri kỷ, và là một
      </p>
    </header>
  );
}

function PanelText({ panel }: { panel: StoryPanel }) {
  return (
    <div className="max-w-md">
      <p className="story-text-line story-text-label text-xs uppercase tracking-[0.32em] text-primary">
        {panel.label}
      </p>
      <h3 className="story-text-line story-text-title mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] text-foreground">
        {panel.title}
      </h3>
      <p className="story-text-line story-text-desc mt-5 text-base leading-relaxed text-foreground/85 md:text-lg font-light">
        {panel.description}
      </p>
      <p className="story-text-line story-text-date mt-6 text-xs uppercase tracking-[0.28em] text-foreground/62">
        {panel.date}
      </p>
    </div>
  );
}

function PanelImage({ panel }: { panel: StoryPanel }) {
  return (
    <div
      className={`story-image-mask relative w-full max-w-[min(88vw,420px)] overflow-hidden ${panel.imageAspect}`}
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
        className={`flex h-full w-full flex-col items-center gap-10 md:flex-row md:gap-16 lg:gap-20 ${className}`}
      >
        <div className="flex w-full items-center justify-center md:w-1/2">
          {image}
        </div>
        <div className="flex w-full items-center md:w-1/2">{text}</div>
      </div>
    );
  }

  if (panel.layout === "text-left-wide") {
    return (
      <div
        className={`flex h-full w-full flex-col items-center gap-10 md:flex-row md:gap-14 lg:gap-16 ${className}`}
      >
        <div className="flex w-full items-center md:w-[40%]">{text}</div>
        <div className="flex w-full items-center justify-center md:w-[60%]">
          {image}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex h-full w-full flex-col items-center gap-10 md:flex-row md:gap-16 lg:gap-20 ${className}`}
    >
      <div className="flex w-full items-center md:w-1/2">{text}</div>
      <div className="flex w-full items-center justify-center md:w-1/2">
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
    <div className="pointer-events-none absolute inset-x-0 bottom-8 z-30 flex items-center justify-center gap-4 text-xs uppercase tracking-[0.28em] md:bottom-10">
      {STORY_PANELS.map((panel, index) => (
        <span
          key={panel.index}
          ref={(el) => {
            progressRefs.current[index] = el;
          }}
          className="text-foreground/48 transition-opacity duration-300"
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

function setupPanelRevealAnimations(
  panel: HTMLElement,
  panelIndex: StoryPanel["index"],
  horizontalTween: gsap.core.Tween,
  scrollTriggers: ScrollTrigger[],
) {
  const config = PANEL_ANIMATIONS[panelIndex];
  const mask = panel.querySelector<HTMLElement>(".story-image-mask");
  const inner = panel.querySelector<HTMLElement>(".story-image-inner");
  const label = panel.querySelector<HTMLElement>(".story-text-label");
  const title = panel.querySelector<HTMLElement>(".story-text-title");
  const desc = panel.querySelector<HTMLElement>(".story-text-desc");
  const date = panel.querySelector<HTMLElement>(".story-text-date");

  if (!mask || !inner) {
    return;
  }

  const imageReveal: ScrollTrigger.Vars = {
    trigger: panel,
    containerAnimation: horizontalTween,
    start: "left 85%",
    end: "left 45%",
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
        containerAnimation: horizontalTween,
        start: "left right",
        end: "right left",
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
          containerAnimation: horizontalTween,
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
    revealText(label, "left 82%", "left 68%");
    revealText(title, "left 78%", "left 60%");
    revealText(desc, "left 74%", "left 54%");
    revealText(date, "left 70%", "left 50%");
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
        containerAnimation: horizontalTween,
        start: "left 80%",
        end: "left 50%",
        scrub: 0.55,
      },
    },
  );
  if (textTween.scrollTrigger) {
    scrollTriggers.push(textTween.scrollTrigger);
  }
}

export function LoveStorySection() {
  const [reducedMotion] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  const sectionRef = useRef<HTMLElement>(null);
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

    if (!section) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || !pin || !track || panels.length === 0) {
      const cornerNavTrigger = createCornerNavColorTrigger(section);

      return () => {
        cornerNavTrigger.kill();
        setCornerNavStoryActive(false);
      };
    }

    const scroller = getScroller();
    const smoother = ScrollSmoother.get();

    panels.forEach((panel, index) =>
      setPanelAnimationState(panel, STORY_PANELS[index].index, false, false),
    );
    gsap.set(progressItems, { opacity: 0.35 });
    gsap.set(progressItems[0], { opacity: 1 });

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
        onEnter: () => setCornerNavStoryActive(true),
        onLeave: () => setCornerNavStoryActive(false),
        onEnterBack: () => setCornerNavStoryActive(true),
        onLeaveBack: () => setCornerNavStoryActive(false),
        onUpdate: (self) => {
          const activeIndex = Math.min(
            Math.round(self.progress * (panels.length - 1)),
            panels.length - 1,
          );

          progressItems.forEach((item, index) => {
            gsap.to(item, {
              opacity: index === activeIndex ? 1 : 0.35,
              duration: 0.25,
              overwrite: true,
            });
          });
        },
      },
    });

    if (horizontalTween.scrollTrigger) {
      scrollTriggers.push(horizontalTween.scrollTrigger);
    }

    panels.forEach((panel, index) => {
      setupPanelRevealAnimations(
        panel,
        STORY_PANELS[index].index,
        horizontalTween,
        scrollTriggers,
      );
    });

    const refresh = () => {
      ScrollTrigger.refresh();
    };

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
      setCornerNavStoryActive(false);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <section id="section-2" className="bg-background text-foreground">
        <div className={`${CONTENT_INSET} py-20`}>
          <StoryHeader />
        </div>
        {STORY_PANELS.map((panel) => (
          <article
            key={panel.index}
            className={`${CONTENT_INSET} border-t border-foreground/10 py-16 md:py-24`}
          >
            <PanelContent panel={panel} />
          </article>
        ))}
      </section>
    );
  }

  return (
    <section id="section-2" ref={sectionRef} className="relative bg-background">
      <div
        ref={pinRef}
        className="relative h-screen w-full overflow-hidden bg-background text-foreground"
      >
        <div className={`pointer-events-none absolute inset-x-0 top-0 z-20 ${CONTENT_INSET}`}>
          <StoryHeader />
        </div>

        <div ref={trackRef} className="flex h-full will-change-transform">
          {STORY_PANELS.map((panel, index) => (
            <div
              key={panel.index}
              ref={(el) => {
                panelRefs.current[index] = el;
              }}
              className={`h-full w-screen shrink-0 ${CONTENT_INSET}`}
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
