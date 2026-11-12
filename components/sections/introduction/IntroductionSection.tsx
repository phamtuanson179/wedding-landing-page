"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  getScroller,
  isMobileViewport,
  setCornerNavColor,
  type CornerNavMode,
} from "@/lib/scroll/cornerNav";
import { scrollToSection } from "@/lib/scroll/sectionNav";
import { type WeddingRole } from "@/lib/constants/wedding-data";

gsap.registerPlugin(ScrollTrigger);

interface IntroProfile {
  id: "intro-groom" | "intro-bride";
  indexLabel: string;
  shortLabel: string;
  fullName: string;
  quote: string;
  portraitImage: string;
  portraitPosition: string;
  detailImage: string;
  detailAlt: string;
  detailPosition: string;
  paperSide: "left" | "right";
  cornerMode: Extract<CornerNavMode, "split-left-accent" | "split-right-accent">;
  leaveBackMode: Extract<CornerNavMode, "hero" | "split-left-accent">;
}

const INTRO_PROFILES: readonly IntroProfile[] = [
  {
    id: "intro-groom",
    indexLabel: "THE GROOM · 01",
    shortLabel: "01. Chú rể",
    fullName: "Phạm Tuấn Sơn",
    quote:
      "Mười năm không dài, nhưng đủ để muốn che chở cho một người đến trọn đời.",
    portraitImage: "/images/intro/groom.webp",
    portraitPosition: "object-[center_30%]",
    detailImage: "/images/intro/groom-detail.webp",
    detailAlt: "Chú rể Phạm Tuấn Sơn - góc nghiêng",
    detailPosition: "object-[center_20%]",
    paperSide: "left",
    cornerMode: "split-left-accent",
    leaveBackMode: "hero",
  },
  {
    id: "intro-bride",
    indexLabel: "THE BRIDE · 02",
    shortLabel: "02. Cô dâu",
    fullName: "Nguyễn Thị Thùy Linh",
    quote:
      "Cảm ơn vì đã luôn là chỗ dựa bình yên và dịu dàng nhất sau mọi bão giông.",
    portraitImage: "/images/intro/bride.webp",
    portraitPosition: "object-[center_34%]",
    detailImage: "/images/intro/bride-detail.webp",
    detailAlt: "Cô dâu Nguyễn Thị Thùy Linh - khăn voan và váy cưới",
    detailPosition: "object-center",
    paperSide: "right",
    cornerMode: "split-right-accent",
    leaveBackMode: "split-left-accent",
  },
];

const LEFT_MASK_HIDDEN = "inset(0% 100% 0% 0%)";
const RIGHT_MASK_HIDDEN = "inset(0% 0% 0% 100%)";
const MASK_VISIBLE = "inset(0% 0% 0% 0%)";

function subscribeEnvironment(onStoreChange: () => void) {
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

function getEnvironmentSnapshot(): string {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = isMobileViewport();
  return `${reduced ? "reduced" : "motion"}-${mobile ? "mobile" : "desktop"}`;
}

function IntroSpread({
  profile,
  ceremonyLabel,
  showCeremonyTopTag,
  showMobileDivider,
  reducedMotion,
  isMobile,
}: {
  profile: IntroProfile;
  ceremonyLabel: string;
  showCeremonyTopTag?: boolean;
  showMobileDivider?: boolean;
  reducedMotion: boolean;
  isMobile: boolean;
}) {
  const spreadRef = useRef<HTMLElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const driftRef = useRef<HTMLDivElement>(null);
  const kenRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const spread = spreadRef.current;
    const mask = maskRef.current;
    const drift = driftRef.current;
    const ken = kenRef.current;
    const paper = paperRef.current;

    if (!spread || !mask || !drift || !ken || !paper) {
      return;
    }

    const scroller = getScroller();

    const chromeTrigger = ScrollTrigger.create({
      trigger: spread,
      start: "top 50%",
      end: "bottom 50%",
      scroller,
      invalidateOnRefresh: true,
      onEnter: () =>
        setCornerNavColor(isMobile ? "accent" : profile.cornerMode),
      onEnterBack: () =>
        setCornerNavColor(isMobile ? "accent" : profile.cornerMode),
      onLeaveBack: () =>
        setCornerNavColor(
          profile.leaveBackMode === "hero"
            ? "hero"
            : isMobile
              ? "accent"
              : profile.leaveBackMode,
        ),
    });

    const detailFrame = paper.querySelector<HTMLElement>("[data-spread-detail]");
    const copyBlocks = paper.querySelectorAll<HTMLElement>("[data-spread-copy]");

    if (reducedMotion) {
      gsap.set(mask, { clipPath: MASK_VISIBLE });
      gsap.set(ken, { scale: 1 });
      gsap.set(drift, { yPercent: 0 });
      if (detailFrame) gsap.set(detailFrame, { autoAlpha: 1, y: 0 });
      gsap.set(copyBlocks, { autoAlpha: 1, y: 0 });

      return () => {
        chromeTrigger.kill();
      };
    }

    const hiddenMask =
      profile.paperSide === "left" ? RIGHT_MASK_HIDDEN : LEFT_MASK_HIDDEN;

    gsap.set(mask, { clipPath: isMobile ? MASK_VISIBLE : hiddenMask });
    gsap.set(ken, { scale: isMobile ? 1.03 : 1.05 });
    if (detailFrame) gsap.set(detailFrame, { y: 24, autoAlpha: 0 });
    gsap.set(copyBlocks, { y: 18, autoAlpha: 0 });

    const entrance = gsap.timeline({
      scrollTrigger: {
        trigger: spread,
        start: isMobile ? "top 80%" : "top 68%",
        scroller,
        toggleActions: "play none none reverse",
        invalidateOnRefresh: true,
      },
    });

    if (!isMobile) {
      entrance.to(
        mask,
        { clipPath: MASK_VISIBLE, duration: 1.15, ease: "power3.inOut" },
        0,
      );
    }

    entrance.to(
      ken,
      { scale: 1, duration: isMobile ? 0.9 : 1.35, ease: "power2.out" },
      0,
    );

    if (detailFrame && !isMobile) {
      entrance.to(
        detailFrame,
        { y: 0, autoAlpha: 1, duration: 0.85, ease: "power3.out" },
        0.35,
      );
    }

    entrance.to(
      copyBlocks,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.65,
        stagger: 0.08,
        ease: "power2.out",
      },
      isMobile ? 0.15 : 0.48,
    );

    let kenBurns: gsap.core.Timeline | null = null;
    let driftTween: gsap.core.Tween | null = null;

    if (!isMobile) {
      kenBurns = gsap.timeline({
        paused: true,
        repeat: -1,
        yoyo: true,
        defaults: { ease: "sine.inOut" },
      });
      kenBurns.to(ken, { scale: 1.05, duration: 12 }, 0);

      entrance.eventCallback("onComplete", () => {
        kenBurns?.play(0);
      });
      entrance.eventCallback("onReverseComplete", () => {
        kenBurns?.pause(0);
        gsap.set(ken, { scale: 1.05 });
      });

      driftTween = gsap.fromTo(
        drift,
        { yPercent: -3 },
        {
          yPercent: 3,
          ease: "none",
          scrollTrigger: {
            trigger: spread,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
            scroller,
            invalidateOnRefresh: true,
          },
        },
      );
    }

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("resize", refresh);

    return () => {
      window.removeEventListener("resize", refresh);
      chromeTrigger.kill();
      entrance.scrollTrigger?.kill();
      entrance.kill();
      kenBurns?.kill();
      driftTween?.scrollTrigger?.kill();
      driftTween?.kill();
    };
  }, [
    isMobile,
    profile.cornerMode,
    profile.leaveBackMode,
    profile.paperSide,
    reducedMotion,
  ]);

  const isPaperLeft = profile.paperSide === "left";

  return (
    <article
      id={profile.id}
      ref={spreadRef}
      className="relative grid grid-cols-1 bg-background md:h-screen md:min-h-[680px] md:grid-cols-2 md:overflow-hidden"
    >
      {showMobileDivider && (
        <div
          aria-hidden
          className="order-0 mx-6 mb-8 border-t border-[#2B3A2D]/12 sm:mx-8 md:hidden"
        />
      )}

      {/* Nửa Nền Giấy Mỹ Thuật #E6DFD3: Ảnh chi tiết nhỏ + Thông tin & Quote */}
      <div
        ref={paperRef}
        className={`relative order-2 flex flex-col items-center justify-center bg-background px-6 pt-7 pb-10 text-center md:h-full md:px-10 md:pt-14 md:pb-[calc(var(--section-nav-height,0px)+3.5rem)] lg:px-14 ${
          isPaperLeft ? "md:order-1" : "md:order-2"
        }`}
      >
        {showCeremonyTopTag && (
          <p className="hidden md:block md:absolute md:top-8 md:inset-x-0 font-sans text-[9.5px] font-medium uppercase tracking-[0.28em] text-[#2B3A2D]/50">
            {ceremonyLabel}
          </p>
        )}

        <div className="flex w-full max-w-[420px] flex-col items-center">
          {/* Ảnh phụ nhỏ khung biên tập (Desktop) */}
          <div
            data-spread-detail
            className="hidden md:block w-[min(100%,230px)] lg:w-[min(100%,255px)] overflow-hidden border border-[#2B3A2D]/12 bg-foreground/5 shadow-[0_14px_34px_rgba(43,58,45,0.08)]"
          >
            <div className="relative aspect-[3/4] max-h-[38vh] w-full overflow-hidden">
              <Image
                src={profile.detailImage}
                alt={profile.detailAlt}
                fill
                sizes="(min-width: 1024px) 255px, 230px"
                unoptimized
                className={`object-cover ${profile.detailPosition} saturate-[0.96]`}
              />
            </div>
          </div>

          <div className="md:mt-6 flex flex-col items-center">
            <p
              data-spread-copy
              className="font-sans text-[9.5px] sm:text-[10px] font-medium uppercase tracking-[0.28em] text-[#2B3A2D]/60"
            >
              {profile.indexLabel}
            </p>

            <h3
              data-spread-copy
              className="mt-2 font-display italic text-[clamp(1.5rem,1.1rem+1.2vw,1.95rem)] font-medium leading-[1.15] text-primary md:whitespace-nowrap"
            >
              {profile.fullName}
            </h3>

            <div
              data-spread-copy
              aria-hidden
              className="mx-auto my-3.5 h-px w-9 bg-primary/35"
            />

            <p
              data-spread-copy
              className="max-w-[34ch] text-[12.5px] sm:text-[13px] leading-relaxed font-normal italic text-[#2B3A2D]/85 text-balance"
            >
              &ldquo;{profile.quote}&rdquo;
            </p>

            {/* Nút lật qua lại giữa 01. Chú rể và 02. Cô dâu trên Desktop */}
            <nav
              data-spread-copy
              aria-label="Chuyển giữa chú rể và cô dâu"
              className="mt-6 hidden md:flex items-center justify-center gap-3 text-[9.5px] font-sans uppercase tracking-[0.22em]"
            >
              {INTRO_PROFILES.map((item, idx) => {
                const isCurrent = item.id === profile.id;
                return (
                  <span key={item.id} className="inline-flex items-center gap-3">
                    {idx > 0 && (
                      <span aria-hidden className="text-[#2B3A2D]/25">
                        /
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      aria-current={isCurrent ? "page" : undefined}
                      className={`cursor-pointer pb-0.5 transition-colors ${
                        isCurrent
                          ? "border-b border-primary font-semibold text-primary"
                          : "text-[#2B3A2D]/45 hover:text-primary"
                      }`}
                    >
                      {item.shortLabel}
                    </button>
                  </span>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile: Khung tranh giấy (Editorial Inset) / Desktop: Chân dung tràn viền Full-Bleed */}
      <div
        className={`relative order-1 bg-background px-6 sm:px-8 md:h-full md:px-0 ${
          isPaperLeft ? "md:order-2" : "md:order-1"
        }`}
      >
        <div
          ref={maskRef}
          className="relative aspect-[4/5] w-full overflow-hidden border border-[#2B3A2D]/10 bg-foreground/8 shadow-[0_14px_34px_rgba(43,58,45,0.08)] md:aspect-auto md:h-full md:border-0 md:shadow-none"
        >
          <div
            ref={driftRef}
            className="absolute inset-0 will-change-transform"
          >
            <div
              ref={kenRef}
              className="absolute inset-[-6%] will-change-transform"
            >
              <Image
                src={profile.portraitImage}
                alt={profile.fullName}
                fill
                sizes="(min-width: 768px) 50vw, calc(100vw - 3rem)"
                priority
                unoptimized
                className={`object-cover ${profile.portraitPosition} saturate-[0.96] brightness-[0.98]`}
              />
            </div>
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[1] bg-linear-to-b from-black/22 via-transparent to-black/28"
          />
        </div>
      </div>
    </article>
  );
}

export function IntroductionSection({ role = "his" }: { role?: WeddingRole }) {
  const env = useSyncExternalStore(
    subscribeEnvironment,
    getEnvironmentSnapshot,
    () => "motion-desktop",
  );

  const reducedMotion = env.startsWith("reduced");
  const isMobile = env.endsWith("mobile");

  const ceremonyLabel =
    role === "hers"
      ? "02 / LỄ VU QUY · 28.11.2026"
      : "02 / LỄ THÀNH HÔN · 29.11.2026";

  return (
    <section
      id="section-2"
      aria-label="Giới thiệu chú rể và cô dâu"
      className="relative bg-background text-foreground"
    >
      <div className="px-6 pt-9 pb-5 text-center md:hidden">
        <p className="font-sans text-[10px] font-medium uppercase tracking-[0.26em] text-primary">
          {ceremonyLabel}
        </p>
      </div>

      {INTRO_PROFILES.map((profile, index) => (
        <IntroSpread
          key={profile.id}
          profile={profile}
          ceremonyLabel={ceremonyLabel}
          showCeremonyTopTag={index === 0}
          showMobileDivider={index > 0}
          reducedMotion={reducedMotion}
          isMobile={isMobile}
        />
      ))}
    </section>
  );
}
