"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getScroller, isMobileViewport, setCornerNavColor } from "@/lib/scroll/cornerNav";

gsap.registerPlugin(ScrollTrigger);

type Person = {
  role: string;
  fullName: string;
  nickname: string;
  quote: string;
  image: string;
  imagePosition: string;
};

const GROOM: Person = {
  role: "Chú rể",
  fullName: "Phạm Tuấn Sơn",
  nickname: "Sơn",
  quote:
    "Mười năm không dài, nhưng đủ để biết bản thân muốn che chở cho một người đến hết đời.",
  image:
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=80",
  imagePosition: "object-[center_20%]",
};

const BRIDE: Person = {
  role: "Cô dâu",
  fullName: "Nguyễn Thị Thùy Linh",
  nickname: "Linh",
  quote:
    "Cảm ơn vì đã luôn là chỗ dựa bình yên và dịu dàng nhất sau mọi bão giông.",
  image:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
  imagePosition: "object-[center_18%]",
};

const LEFT_MASK_HIDDEN = "inset(0% 100% 0% 0%)";
const RIGHT_MASK_HIDDEN = "inset(0% 0% 0% 100%)";
const MASK_VISIBLE = "inset(0% 0% 0% 0%)";
const IVORY = "#e6dfd3";

function subscribeLayout(onStoreChange: () => void) {
  const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const widthMq = window.matchMedia("(max-width: 767px)");
  const onChange = () => onStoreChange();
  motionMq.addEventListener("change", onChange);
  widthMq.addEventListener("change", onChange);
  return () => {
    motionMq.removeEventListener("change", onChange);
    widthMq.removeEventListener("change", onChange);
  };
}

function PersonStripBlock({
  person,
  align = "start",
}: {
  person: Person;
  align?: "start" | "end";
}) {
  return (
    <div
      data-intro-copy
      className={`flex flex-col ${
        align === "end" ? "items-end text-right" : "items-start text-left"
      }`}
    >
      <p className="text-[9px] uppercase tracking-[0.28em] text-foreground/50 md:text-[10px] md:tracking-[0.32em]">
        {person.role}
      </p>
      <h3 className="mt-1.5 font-display text-[clamp(1.05rem,2.4vw,1.85rem)] leading-[1.1] text-foreground">
        {person.fullName}
      </h3>
      <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-primary md:text-xs">
        ({person.nickname})
      </p>
      <p className="mt-3 line-clamp-4 text-[11px] leading-relaxed font-light italic text-foreground/75 md:mt-4 md:line-clamp-5 md:text-[13px]">
        &ldquo;{person.quote}&rdquo;
      </p>
    </div>
  );
}

function MobileOverlayCopy({
  person,
  align = "start",
}: {
  person: Person;
  align?: "start" | "end";
}) {
  return (
    <div
      data-intro-mobile-copy
      className={`absolute inset-x-0 bottom-0 z-10 px-6 pb-[calc(1.75rem+var(--section-nav-height,0px))] pt-24 ${
        align === "end" ? "text-right" : "text-left"
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-black/20 to-transparent"
      />
      <div className="relative">
        <p
          className="text-[10px] uppercase tracking-[0.28em]"
          style={{ color: `${IVORY}99` }}
        >
          {person.role}
        </p>
        <h3
          className="mt-2 font-display text-[clamp(1.75rem,8vw,2.5rem)] leading-[1.05]"
          style={{ color: `${IVORY}e6` }}
        >
          {person.fullName}
        </h3>
        <p
          className="mt-1.5 text-[11px] uppercase tracking-[0.22em]"
          style={{ color: `${IVORY}a6` }}
        >
          ({person.nickname})
        </p>
        <p
          className="mt-4 max-w-[22rem] text-sm leading-relaxed font-light italic"
          style={{
            color: `${IVORY}c7`,
            marginLeft: align === "end" ? "auto" : undefined,
          }}
        >
          &ldquo;{person.quote}&rdquo;
        </p>
      </div>
    </div>
  );
}

/** Desktop / tablet — cinematic split + ivory shutter spine */
function IntroDesktop({
  sectionRef,
  reducedMotion = false,
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
  reducedMotion?: boolean;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const leftMaskRef = useRef<HTMLDivElement>(null);
  const rightMaskRef = useRef<HTMLDivElement>(null);
  const leftImageRef = useRef<HTMLDivElement>(null);
  const rightImageRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const leftMask = leftMaskRef.current;
    const rightMask = rightMaskRef.current;
    const leftImage = leftImageRef.current;
    const rightImage = rightImageRef.current;
    const strip = stripRef.current;

    if (
      !section ||
      !title ||
      !leftMask ||
      !rightMask ||
      !leftImage ||
      !rightImage ||
      !strip
    ) {
      return;
    }

    const leftKen = leftImage.querySelector<HTMLElement>("[data-intro-kenburns]");
    const rightKen = rightImage.querySelector<HTMLElement>("[data-intro-kenburns]");
    const copyBlocks = strip.querySelectorAll<HTMLElement>("[data-intro-copy]");

    if (!leftKen || !rightKen) {
      return;
    }

    if (reducedMotion) {
      gsap.set([leftMask, rightMask], { clipPath: MASK_VISIBLE });
      gsap.set(strip, { autoAlpha: 1 });
      gsap.set(copyBlocks, { autoAlpha: 1, y: 0 });
      return;
    }

    const scroller = getScroller();
    const tweens: gsap.core.Tween[] = [];
    const timelines: gsap.core.Timeline[] = [];

    gsap.set(title, { y: 18, autoAlpha: 0 });
    gsap.set(leftMask, { clipPath: LEFT_MASK_HIDDEN });
    gsap.set(rightMask, { clipPath: RIGHT_MASK_HIDDEN });
    gsap.set([leftKen, rightKen], { scale: 1 });
    gsap.set(strip, { autoAlpha: 1 });
    gsap.set(copyBlocks, { y: 30, autoAlpha: 0 });

    const entrance = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 68%",
        scroller,
        toggleActions: "play none none reverse",
        invalidateOnRefresh: true,
      },
    });
    timelines.push(entrance);

    entrance
      .to(title, { y: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out" }, 0)
      .to(
        leftMask,
        { clipPath: MASK_VISIBLE, duration: 1.35, ease: "power3.inOut" },
        0.15,
      )
      .to(
        rightMask,
        { clipPath: MASK_VISIBLE, duration: 1.35, ease: "power3.inOut" },
        0.15,
      )
      .to(
        copyBlocks,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.75,
          stagger: 0.12,
          ease: "power2.out",
        },
        1.15,
      );

    const kenBurns = gsap.timeline({
      paused: true,
      repeat: -1,
      yoyo: true,
      defaults: { ease: "sine.inOut" },
    });
    kenBurns
      .to(leftKen, { scale: 1.08, duration: 10 }, 0)
      .to(rightKen, { scale: 1.08, duration: 10 }, 0);
    timelines.push(kenBurns);

    entrance.eventCallback("onComplete", () => {
      kenBurns.play(0);
    });
    entrance.eventCallback("onReverseComplete", () => {
      kenBurns.pause(0);
      gsap.set([leftKen, rightKen], { scale: 1 });
    });

    tweens.push(
      gsap.fromTo(
        leftImage,
        { yPercent: -3 },
        {
          yPercent: 3,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
            scroller,
            invalidateOnRefresh: true,
          },
        },
      ),
    );
    tweens.push(
      gsap.fromTo(
        rightImage,
        { yPercent: 3 },
        {
          yPercent: -3,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
            scroller,
            invalidateOnRefresh: true,
          },
        },
      ),
    );

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("resize", refresh);

    return () => {
      window.removeEventListener("resize", refresh);
      timelines.forEach((tl) => tl.kill());
      tweens.forEach((tween) => tween.kill());
    };
  }, [reducedMotion]);

  return (
    <section
      id="section-2"
      ref={sectionRef}
      className="relative h-screen min-h-screen overflow-hidden bg-background text-foreground"
    >
      <div className="absolute inset-0 grid grid-cols-2">
        <div
          ref={leftMaskRef}
          className="relative h-full overflow-hidden bg-foreground/10"
        >
          <div
            ref={leftImageRef}
            data-intro-drift
            className="absolute inset-0 will-change-transform"
          >
            <div
              data-intro-kenburns
              className="absolute inset-[-10%] will-change-transform"
            >
              <Image
                src={GROOM.image}
                alt={GROOM.fullName}
                fill
                sizes="50vw"
                priority
                className={`object-cover ${GROOM.imagePosition} saturate-[0.78] brightness-[0.92]`}
              />
            </div>
          </div>
        </div>

        <div
          ref={rightMaskRef}
          className="relative h-full overflow-hidden bg-foreground/10"
        >
          <div
            ref={rightImageRef}
            data-intro-drift
            className="absolute inset-0 will-change-transform"
          >
            <div
              data-intro-kenburns
              className="absolute inset-[-10%] will-change-transform"
            >
              <Image
                src={BRIDE.image}
                alt={BRIDE.fullName}
                fill
                sizes="50vw"
                priority
                className={`object-cover ${BRIDE.imagePosition} saturate-[0.78] brightness-[0.92]`}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-linear-to-b from-black/50 via-transparent to-background/40"
      />

      <header className="absolute inset-x-0 top-0 z-20 px-5 pt-8 text-center md:px-10 md:pt-12">
        <p className="text-[10px] uppercase tracking-[0.28em] text-background/80 md:text-xs md:tracking-[0.32em]">
          Giới thiệu
        </p>
        <h2
          ref={titleRef}
          className="mt-2 font-display text-[clamp(1.25rem,3.4vw,2.35rem)] leading-tight text-background drop-shadow-[0_1px_18px_rgba(0,0,0,0.45)] md:mt-3"
        >
          Hai người, một hành trình
        </h2>
      </header>

      {/* Ivory shutter spine — stays put; copy slides in */}
      <div
        ref={stripRef}
        className="absolute top-1/2 left-1/2 z-10 flex h-[min(72dvh,640px)] w-[min(28vw,280px)] -translate-x-1/2 -translate-y-1/2 flex-col justify-between bg-background px-5 py-7 shadow-[0_0_48px_rgba(26,26,26,0.14)] lg:w-[min(24vw,300px)] lg:px-6 lg:py-8"
      >
        <PersonStripBlock person={GROOM} align="start" />

        <div className="flex items-center gap-3 py-3 md:py-4" aria-hidden>
          <span className="h-px flex-1 bg-foreground/15" />
          <span className="font-display text-2xl italic text-primary/80 md:text-3xl">
            &
          </span>
          <span className="h-px flex-1 bg-foreground/15" />
        </div>

        <PersonStripBlock person={BRIDE} align="end" />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[calc(var(--section-nav-height,0px)+1.5rem)] bg-linear-to-t from-background/35 to-transparent"
      />
    </section>
  );
}

/** Mobile — stacked full-bleed panels + ivory type overlay */
function IntroMobile({
  sectionRef,
  reducedMotion = false,
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
  reducedMotion?: boolean;
}) {
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion) {
      return;
    }

    const scroller = getScroller();
    const panels = Array.from(
      section.querySelectorAll<HTMLElement>("[data-intro-mobile-panel]"),
    );
    const timelines: gsap.core.Timeline[] = [];
    const tweens: gsap.core.Tween[] = [];

    panels.forEach((panel) => {
      const mask = panel.querySelector<HTMLElement>("[data-intro-mobile-mask]");
      const image = panel.querySelector<HTMLElement>("[data-intro-mobile-image]");
      const copy = panel.querySelector<HTMLElement>("[data-intro-mobile-copy]");
      const side = panel.dataset.side;

      if (!mask || !image || !copy) {
        return;
      }

      const hidden =
        side === "groom" ? LEFT_MASK_HIDDEN : RIGHT_MASK_HIDDEN;

      gsap.set(mask, { clipPath: hidden });
      gsap.set(image, { scale: 1 });
      gsap.set(copy, { y: 28, autoAlpha: 0 });

      const entrance = gsap.timeline({
        scrollTrigger: {
          trigger: panel,
          start: "top 75%",
          scroller,
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true,
        },
      });

      entrance
        .to(mask, {
          clipPath: MASK_VISIBLE,
          duration: 1.15,
          ease: "power3.inOut",
        })
        .to(
          copy,
          { y: 0, autoAlpha: 1, duration: 0.7, ease: "power2.out" },
          0.65,
        );

      const kenBurns = gsap.to(image, {
        scale: 1.08,
        duration: 10,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        paused: true,
      });

      entrance.eventCallback("onComplete", () => kenBurns.play(0));
      entrance.eventCallback("onReverseComplete", () => {
        kenBurns.pause(0);
        gsap.set(image, { scale: 1 });
      });

      timelines.push(entrance);
      tweens.push(kenBurns);
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("resize", refresh);

    return () => {
      window.removeEventListener("resize", refresh);
      timelines.forEach((tl) => tl.kill());
      tweens.forEach((tween) => tween.kill());
    };
  }, [reducedMotion]);

  return (
    <section
      id="section-2"
      ref={sectionRef}
      className="relative overflow-hidden bg-background text-foreground"
    >
      <header className="px-5 pt-10 pb-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.28em] text-foreground/60">
          Giới thiệu
        </p>
        <h2 className="mt-2 font-display text-[clamp(1.35rem,6vw,1.85rem)] leading-tight text-foreground">
          Hai người, một hành trình
        </h2>
      </header>

      {(
        [
          { person: GROOM, side: "groom" as const, align: "start" as const },
          { person: BRIDE, side: "bride" as const, align: "end" as const },
        ] as const
      ).map(({ person, side, align }) => (
        <div
          key={side}
          data-intro-mobile-panel
          data-side={side}
          className="relative h-[100dvh] min-h-[560px] w-full overflow-hidden"
        >
          <div
            data-intro-mobile-mask
            className="absolute inset-0 overflow-hidden"
          >
            <div
              data-intro-mobile-image
              className="absolute inset-[-8%] will-change-transform"
            >
              <Image
                src={person.image}
                alt={person.fullName}
                fill
                sizes="100vw"
                className={`object-cover ${person.imagePosition} saturate-[0.8] brightness-[0.9]`}
              />
            </div>
          </div>
          <MobileOverlayCopy person={person} align={align} />
        </div>
      ))}
    </section>
  );
}

function getLayoutMode(): "desktop" | "mobile" | "reduced-desktop" | "reduced-mobile" {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = isMobileViewport();
  if (reduced) {
    return mobile ? "reduced-mobile" : "reduced-desktop";
  }
  return mobile ? "mobile" : "desktop";
}

export function IntroductionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const layoutMode = useSyncExternalStore(
    subscribeLayout,
    getLayoutMode,
    (): "desktop" | "mobile" | "reduced-desktop" | "reduced-mobile" =>
      "desktop",
  );

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const scroller = getScroller();
    const chromeTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top 50%",
      end: "bottom 50%",
      scroller,
      invalidateOnRefresh: true,
      // Beige CornerLabels over cinematic photos
      onEnter: () => setCornerNavColor("hero"),
      onEnterBack: () => setCornerNavColor("hero"),
      onLeaveBack: () => setCornerNavColor("hero"),
    });

    return () => {
      chromeTrigger.kill();
    };
  }, [layoutMode]);

  if (layoutMode === "mobile") {
    return <IntroMobile sectionRef={sectionRef} />;
  }

  if (layoutMode === "reduced-mobile") {
    return <IntroMobile sectionRef={sectionRef} reducedMotion />;
  }

  if (layoutMode === "reduced-desktop") {
    return <IntroDesktop sectionRef={sectionRef} reducedMotion />;
  }

  return <IntroDesktop sectionRef={sectionRef} />;
}
