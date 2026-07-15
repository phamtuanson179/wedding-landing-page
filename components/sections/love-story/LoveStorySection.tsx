"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  getScroller,
  isMobileViewport,
  isTouchDevice,
  setCornerNavColor,
} from "@/lib/scroll/cornerNav";

gsap.registerPlugin(ScrollTrigger);

type MediaLayout = "grid" | "overlap" | "film";

type StoryPanel = {
  index: string;
  label: string;
  title: string;
  description: string;
  date: string;
  mediaLayout: MediaLayout;
  images: readonly string[];
};

const STORY_PANELS: readonly StoryPanel[] = [
  {
    index: "01",
    label: "Quá trình",
    title: "Mười năm bên nhau",
    description:
      "Từ những ngày đầu là bạn bè, chúng mình lớn lên cùng nhau — chia sẻ mọi điều và chở che cho nhau.",
    date: "14.03",
    mediaLayout: "grid",
    images: [
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    index: "02",
    label: "Cầu hôn",
    title: "Khoảnh khắc nói đồng ý",
    description:
      "Giữa những kỷ niệm quen thuộc, chúng mình chọn bước sang chương mới — nơi tình bạn và tình yêu cùng trở thành cam kết.",
    date: "22.08",
    mediaLayout: "overlap",
    images: [
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    index: "03",
    label: "Cưới",
    title: "Về chung một nhà",
    description:
      "Hôm nay, chúng mình chính thức trở thành gia đình — vẫn là tri kỷ, vẫn là chỗ dựa, và là hành trình mới bắt đầu từ đây.",
    date: "29.11",
    mediaLayout: "film",
    images: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
    ],
  },
];

const STORY_LABEL_CLASS = "text-[#d4b87a]";
const STORY_MUTED_CLASS = "text-background/55";
const STORY_BODY_CLASS = "text-background/88";
const CARD_BORDER = "border border-[#e6dfd3]/55";
const INSET_BORDER = "border border-[#e6dfd3]/70";

function subscribeLayout(onStoreChange: () => void) {
  const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onChange = () => onStoreChange();
  motionMq.addEventListener("change", onChange);
  window.addEventListener("resize", onChange);
  return () => {
    motionMq.removeEventListener("change", onChange);
    window.removeEventListener("resize", onChange);
  };
}

function StoryImage({
  src,
  alt = "",
  sizes,
  priority = false,
  className = "object-cover",
}: {
  src: string;
  alt?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
    />
  );
}

/** Layout 1 — 2/3 hero + 1/3 stacked details */
function MediaGrid({
  images,
  compact,
  priority,
}: {
  images: readonly string[];
  compact?: boolean;
  priority?: boolean;
}) {
  const [hero, detailA, detailB] = images;
  const gap = "gap-0";

  return (
    <div className={`grid h-full min-h-0 grid-cols-3 ${gap}`}>
      <div className='relative col-span-2 min-h-0 overflow-hidden'>
        <StoryImage
          src={hero}
          sizes={compact ? "70vw" : "40vw"}
          priority={priority}
        />
      </div>
      <div className={`flex min-h-0 flex-col ${gap}`}>
        <div className='relative min-h-0 flex-1 overflow-hidden'>
          <StoryImage src={detailA ?? hero} sizes={compact ? "30vw" : "14vw"} />
        </div>
        <div className='relative min-h-0 flex-1 overflow-hidden'>
          <StoryImage src={detailB ?? hero} sizes={compact ? "30vw" : "14vw"} />
        </div>
      </div>
    </div>
  );
}

/** Layout 2 — wide base + overlapping portrait inset */
function MediaOverlap({
  images,
  compact,
  priority,
}: {
  images: readonly string[];
  compact?: boolean;
  priority?: boolean;
}) {
  const [base, inset] = images;

  return (
    <div className='relative h-full min-h-0 overflow-hidden'>
      <div className='absolute inset-0'>
        <StoryImage
          src={base}
          sizes={compact ? "88vw" : "42vw"}
          priority={priority}
        />
      </div>
      <div
        data-story-inset
        className={`absolute z-10 overflow-hidden bg-primary will-change-transform ${INSET_BORDER} ${
          compact
            ? "bottom-[8%] right-[6%] h-[48%] w-[38%]"
            : "bottom-[10%] right-[8%] h-[52%] w-[36%]"
        }`}
      >
        <StoryImage src={inset ?? base} sizes={compact ? "35vw" : "16vw"} />
      </div>
    </div>
  );
}

/** Layout 3 — mini film carousel (auto crossfade) */
function MediaFilm({
  images,
  compact,
  priority,
  autoplay = true,
}: {
  images: readonly string[];
  compact?: boolean;
  priority?: boolean;
  autoplay?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !autoplay || images.length <= 1) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) {
      return;
    }

    const slides = Array.from(
      root.querySelectorAll<HTMLElement>("[data-story-film-slide]"),
    );
    const dots = Array.from(
      root.querySelectorAll<HTMLElement>("[data-story-film-dot]"),
    );

    gsap.set(slides, { autoAlpha: 0, zIndex: 0 });
    gsap.set(slides[0], { autoAlpha: 1, zIndex: 1 });
    gsap.set(dots, { backgroundColor: "rgba(230, 223, 211, 0.35)" });
    if (dots[0]) {
      gsap.set(dots[0], { backgroundColor: "rgba(212, 184, 122, 0.95)" });
    }

    const fade = gsap.timeline({
      repeat: -1,
      defaults: { ease: "power2.inOut" },
    });

    slides.forEach((_, i) => {
      const next = (i + 1) % slides.length;
      fade
        .to({}, { duration: 2.4 })
        .to(slides[i], { autoAlpha: 0, duration: 0.85, zIndex: 0 }, ">")
        .to(slides[next], { autoAlpha: 1, duration: 0.85, zIndex: 1 }, "<")
        .add(() => {
          dots.forEach((dot, di) => {
            gsap.set(dot, {
              backgroundColor:
                di === next
                  ? "rgba(212, 184, 122, 0.95)"
                  : "rgba(230, 223, 211, 0.35)",
            });
          });
        }, "<");
    });

    return () => {
      fade.kill();
    };
  }, [autoplay, images.length]);

  return (
    <div ref={rootRef} className='relative h-full min-h-0 overflow-hidden'>
      {images.map((src, i) => (
        <div
          key={`${src}-${i}`}
          data-story-film-slide
          className={`absolute inset-0 ${i === 0 ? "opacity-100" : "opacity-0"}`}
        >
          <StoryImage
            src={src}
            sizes={compact ? "88vw" : "42vw"}
            priority={priority && i === 0}
          />
        </div>
      ))}
      <div
        className={`pointer-events-none absolute left-1/2 z-10 flex -translate-x-1/2 gap-1.5 ${
          compact ? "bottom-2" : "bottom-4"
        }`}
        aria-hidden
      >
        {images.map((_, i) => (
          <span
            key={i}
            data-story-film-dot
            className={`size-1 rounded-full ${
              i === 0 ? "bg-[#d4b87a]" : "bg-[#e6dfd3]/35"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function StoryMedia({
  panel,
  compact = false,
}: {
  panel: StoryPanel;
  compact?: boolean;
}) {
  const priority = panel.index === "01";

  switch (panel.mediaLayout) {
    case "grid":
      return (
        <MediaGrid
          images={panel.images}
          compact={compact}
          priority={priority}
        />
      );
    case "overlap":
      return (
        <MediaOverlap
          images={panel.images}
          compact={compact}
          priority={priority}
        />
      );
    case "film":
      return (
        <MediaFilm
          images={panel.images}
          compact={compact}
          priority={priority}
        />
      );
    default:
      return null;
  }
}

function StoryCardFace({
  panel,
  layout = "spread",
}: {
  panel: StoryPanel;
  /** spread = desktop double-page; stacked = mobile image-over-text */
  layout?: "spread" | "stacked";
}) {
  const text = (
    <div
      className={`flex min-h-0 flex-col justify-between ${
        layout === "stacked"
          ? "px-5 py-4"
          : "px-6 py-7 md:px-9 md:py-10 lg:px-12 lg:py-12"
      }`}
    >
      <div>
        <p
          className={`text-[10px] uppercase tracking-[0.32em] md:text-xs ${STORY_LABEL_CLASS}`}
        >
          {panel.index} — {panel.label}
        </p>
        <h3
          className={`mt-2 font-display leading-[1.05] text-background md:mt-5 ${
            layout === "stacked"
              ? "text-[clamp(1.35rem,6.2vw,1.85rem)]"
              : "text-[clamp(1.75rem,3.8vw,3.35rem)]"
          }`}
        >
          {panel.title}
        </h3>
        <p
          className={`mt-2 text-[13px] leading-relaxed font-light md:mt-5 md:text-base ${STORY_BODY_CLASS}`}
        >
          {panel.description}
        </p>
      </div>
      <p
        className={`mt-3 text-[10px] uppercase tracking-[0.28em] md:mt-0 md:text-xs ${STORY_MUTED_CLASS}`}
      >
        {panel.date}
      </p>
    </div>
  );

  const media = (
    <div
      className={`relative min-h-0 ${
        layout === "stacked"
          ? "aspect-[16/11] max-h-[34vh] w-full shrink-0 border-b border-[#e6dfd3]/25"
          : "border-t border-[#e6dfd3]/25 md:border-t-0 md:border-l md:border-[#e6dfd3]/25"
      }`}
    >
      <StoryMedia panel={panel} compact={layout === "stacked"} />
    </div>
  );

  if (layout === "stacked") {
    return (
      <div className='flex h-full min-h-0 flex-col'>
        {media}
        {text}
      </div>
    );
  }

  return (
    <div className='grid h-full min-h-0 grid-cols-2'>
      {text}
      {media}
    </div>
  );
}

function StorySectionHeader({
  progressRefs,
}: {
  progressRefs?: React.RefObject<Array<HTMLSpanElement | null>>;
}) {
  return (
    <header className='pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between px-5 pt-8 md:px-8 lg:px-36 lg:pt-16'>
      <div>
        <p
          className={`text-[10px] uppercase tracking-[0.32em] lg:text-xs ${STORY_MUTED_CLASS}`}
        >
          Câu chuyện của chúng mình
        </p>
        <p
          className={`mt-2 inline-block border border-background/22 px-2.5 py-1 text-[9px] uppercase tracking-[0.24em] md:px-3 md:py-1.5 md:text-[10px] md:tracking-[0.28em] ${STORY_BODY_CLASS}`}
        >
          10 năm — từ bạn bè đến tri kỷ
        </p>
      </div>

      <div className='flex items-center gap-4 text-[10px] uppercase tracking-[0.28em] md:gap-5 md:text-xs'>
        {STORY_PANELS.map((panel, index) => (
          <span
            key={panel.index}
            ref={(el) => {
              if (progressRefs) {
                progressRefs.current[index] = el;
              }
            }}
            className={STORY_MUTED_CLASS}
          >
            {panel.index}
          </span>
        ))}
      </div>
    </header>
  );
}

function StoryReducedMotionLayout({
  sectionRef,
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
}) {
  return (
    <section
      id='section-3'
      ref={sectionRef}
      className='overflow-x-hidden bg-primary text-background'
    >
      <div className='px-6 py-14 md:px-16 md:py-20'>
        <p
          className={`text-xs uppercase tracking-[0.32em] ${STORY_MUTED_CLASS}`}
        >
          Câu chuyện của chúng mình
        </p>
        <p className={`mt-3 text-sm ${STORY_BODY_CLASS}`}>
          10 năm — từ bạn bè đến tri kỷ
        </p>
      </div>

      <div className='mx-auto flex max-w-5xl flex-col gap-8 px-6 pb-20 md:px-10'>
        {STORY_PANELS.map((panel) => (
          <article
            key={panel.index}
            className={`overflow-hidden bg-primary ${CARD_BORDER}`}
          >
            <StoryCardFace panel={panel} layout='spread' />
          </article>
        ))}
      </div>
    </section>
  );
}

/**
 * Mobile: horizontal lookbook — swipe cards with scroll-snap.
 * Card = media on top, copy below, still bordered.
 */
function StoryMobileCardsLayout({
  sectionRef,
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const progressRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    const syncProgress = () => {
      const width = scroller.clientWidth || 1;
      const index = Math.round(scroller.scrollLeft / width);

      progressRefs.current.forEach((item, i) => {
        if (!item) {
          return;
        }
        const active = i === index;
        item.style.opacity = active ? "1" : "0.35";
        item.style.color = active ? "#d4b87a" : "rgba(230, 223, 211, 0.45)";
      });
    };

    progressRefs.current.forEach((item, i) => {
      if (!item) {
        return;
      }
      item.style.opacity = i === 0 ? "1" : "0.35";
      item.style.color = i === 0 ? "#d4b87a" : "rgba(230, 223, 211, 0.45)";
    });

    scroller.addEventListener("scroll", syncProgress, { passive: true });
    return () => scroller.removeEventListener("scroll", syncProgress);
  }, []);

  return (
    <section
      id='section-3'
      ref={sectionRef}
      className='relative overflow-hidden bg-primary text-background'
    >
      <div className='relative flex min-h-dvh flex-col pb-[var(--section-nav-height,0px)] pt-16'>
        <StorySectionHeader progressRefs={progressRefs} />

        <div
          ref={scrollerRef}
          className='flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        >
          {STORY_PANELS.map((panel) => (
            <article
              key={panel.index}
              className='box-border flex w-full shrink-0 snap-center snap-always items-center justify-center px-4 py-6'
            >
              <div
                className={`flex w-full max-w-md flex-col overflow-hidden bg-primary ${CARD_BORDER}`}
              >
                <StoryCardFace panel={panel} layout='stacked' />
              </div>
            </article>
          ))}
        </div>

        <p
          className={`pointer-events-none pb-4 text-center text-[9px] uppercase tracking-[0.28em] ${STORY_MUTED_CLASS}`}
        >
          Vuốt ngang để xem tiếp
        </p>
      </div>
    </section>
  );
}

/**
 * Desktop: stacked lookbook cards — pin + scrub flip like turning pages.
 */
function StoryStackedCardsLayout({
  sectionRef,
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
}) {
  const pinRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const progressRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
    const progressItems = progressRefs.current.filter(
      Boolean,
    ) as HTMLSpanElement[];

    if (!section || !pin || cards.length === 0) {
      return;
    }

    const scroller = getScroller();
    const count = cards.length;
    const extras: gsap.core.Tween[] = [];

    // Stack at rest: top card full; cards below recessed for depth
    cards.forEach((card, index) => {
      gsap.set(card, {
        zIndex: 30 - index,
        yPercent: 0,
        scale: index === 0 ? 1 : 0.95,
        opacity: index === 0 ? 1 : 0.8,
        transformOrigin: "50% 50%",
        force3D: true,
      });

      // Layout 2: inset drifts slower than scroll for cinematic depth
      const inset = card.querySelector<HTMLElement>("[data-story-inset]");
      if (inset) {
        const insetTween = gsap.fromTo(
          inset,
          { yPercent: 8 },
          {
            yPercent: -20,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${window.innerHeight * count}`,
              scrub: true,
              scroller,
              invalidateOnRefresh: true,
            },
          },
        );
        extras.push(insetTween);
      }
    });

    progressItems.forEach((item, index) => {
      gsap.set(item, {
        opacity: index === 0 ? 1 : 0.35,
        color: index === 0 ? "#d4b87a" : "rgba(230, 223, 211, 0.45)",
      });
    });

    const pinDistance = () => window.innerHeight * count;

    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${pinDistance()}`,
        pin,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        scroller,
        pinType: isTouchDevice() ? "fixed" : "transform",
      },
    });

    const step = 1 / (count - 1 || 1);

    for (let index = 0; index < count - 1; index += 1) {
      const at = index * step;
      const outgoing = cards[index];
      const incoming = cards[index + 1];

      timeline.to(
        outgoing,
        {
          yPercent: -120,
          opacity: 0,
          duration: step,
          ease: "power2.inOut",
        },
        at,
      );

      timeline.to(
        incoming,
        {
          scale: 1,
          opacity: 1,
          duration: step,
          ease: "power2.out",
        },
        at,
      );

      const nextBelow = cards[index + 2];
      if (nextBelow) {
        timeline.set(
          nextBelow,
          {
            scale: 0.95,
            opacity: 0.8,
          },
          at,
        );
      }

      if (progressItems[index] && progressItems[index + 1]) {
        timeline.to(
          progressItems[index],
          {
            opacity: 0.35,
            color: "rgba(230, 223, 211, 0.45)",
            duration: step * 0.35,
          },
          at + step * 0.4,
        );
        timeline.to(
          progressItems[index + 1],
          {
            opacity: 1,
            color: "#d4b87a",
            duration: step * 0.35,
          },
          at + step * 0.4,
        );
      }
    }

    const refresh = () => ScrollTrigger.refresh();
    requestAnimationFrame(refresh);
    window.addEventListener("resize", refresh);

    return () => {
      window.removeEventListener("resize", refresh);
      timeline.scrollTrigger?.kill();
      timeline.kill();
      extras.forEach((tween) => {
        tween.scrollTrigger?.kill();
        tween.kill();
      });
    };
  }, [sectionRef]);

  return (
    <section
      id='section-3'
      ref={sectionRef}
      className='relative overflow-hidden bg-primary text-background'
    >
      <div
        ref={pinRef}
        className='relative flex h-dvh w-full flex-col items-center justify-center pb-[var(--section-nav-height,0px)] pt-20 md:pt-24 lg:pt-28'
      >
        <StorySectionHeader progressRefs={progressRefs} />

        <div className='relative h-[min(56dvh,calc(100dvh-var(--section-nav-height,0px)-9rem),520px)] w-[min(70vw,1050px)]'>
          {STORY_PANELS.map((panel, index) => (
            <article
              key={panel.index}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              data-story-card
              className={`absolute inset-0 overflow-hidden bg-primary will-change-transform [grid-area:1/1] ${CARD_BORDER}`}
              style={{ zIndex: STORY_PANELS.length - index }}
            >
              <StoryCardFace panel={panel} layout='spread' />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LoveStorySection() {
  const layoutMode = useSyncExternalStore(
    subscribeLayout,
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return "reduced" as const;
      }
      if (isMobileViewport()) {
        return "mobile" as const;
      }
      return "desktop" as const;
    },
    (): "desktop" | "mobile" | "reduced" => "desktop",
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
      start: "top 50%",
      end: "bottom 50%",
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

  if (layoutMode === "reduced") {
    return <StoryReducedMotionLayout sectionRef={sectionRef} />;
  }

  if (layoutMode === "mobile") {
    return <StoryMobileCardsLayout sectionRef={sectionRef} />;
  }

  return <StoryStackedCardsLayout sectionRef={sectionRef} />;
}
