"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getScroller, isMobileViewport, setCornerNavColor } from "@/lib/scroll/cornerNav";
import { type WeddingRole } from "@/lib/constants/wedding-data";

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

/** Desktop / tablet — cinematic split + ivory shutter spine */
function IntroDesktop({
  sectionRef,
  reducedMotion = false,
  role = "his",
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
  reducedMotion?: boolean;
  role?: WeddingRole;
}) {
  const leftMaskRef = useRef<HTMLDivElement>(null);
  const rightMaskRef = useRef<HTMLDivElement>(null);
  const leftImageRef = useRef<HTMLDivElement>(null);
  const rightImageRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const leftMask = leftMaskRef.current;
    const rightMask = rightMaskRef.current;
    const leftImage = leftImageRef.current;
    const rightImage = rightImageRef.current;
    const strip = stripRef.current;

    if (
      !section ||
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

    gsap.set(leftMask, { clipPath: LEFT_MASK_HIDDEN });
    gsap.set(rightMask, { clipPath: RIGHT_MASK_HIDDEN });
    gsap.set([leftKen, rightKen], { scale: 1 });
    gsap.set(strip, { autoAlpha: 1 });
    gsap.set(copyBlocks, { y: 22, autoAlpha: 0 });

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
      .to(
        leftMask,
        { clipPath: MASK_VISIBLE, duration: 1.25, ease: "power3.inOut" },
        0,
      )
      .to(
        rightMask,
        { clipPath: MASK_VISIBLE, duration: 1.25, ease: "power3.inOut" },
        0,
      )
      .to(
        copyBlocks,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.65,
          stagger: 0.1,
          ease: "power2.out",
        },
        0.55,
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

  const announcementTitle =
    role === "hers"
      ? "TRÂN TRỌNG BÁO TIN LỄ VU QUY"
      : "TRÂN TRỌNG BÁO TIN LỄ THÀNH HÔN";

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
        className="pointer-events-none absolute inset-0 z-[1] bg-linear-to-b from-black/25 via-transparent to-background/30"
      />

      {/* Ivory shutter spine — Thẻ màu be 3 tầng sang trọng & thanh thoát */}
      <div
        ref={stripRef}
        className="absolute top-1/2 left-1/2 z-10 w-[min(92vw,510px)] -translate-x-1/2 -translate-y-1/2 bg-background px-5 py-6 sm:px-6.5 sm:py-6 shadow-[0_16px_50px_rgba(0,0,0,0.35)] border border-[#1a1a1a]/10"
      >
        {/* TẦNG 1: Header thiệp — Font chữ in hoa nhỏ, tracking rộng */}
        <div data-intro-copy className="text-center">
          <p className="font-sans text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.22em] sm:tracking-[0.26em] text-primary">
            {announcementTitle}
          </p>
        </div>

        {/* TẦNG 2: Song thân — 2 Cột cân xứng (grid-cols-2) */}
        <div data-intro-copy className="mt-3.5 grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.15em] text-foreground/60">
              NHÀ TRAI
            </p>
            <div className="mt-1 font-display text-[13px] sm:text-[14px] leading-snug text-foreground/90 font-normal">
              <p>Ông Phạm Danh Tĩnh</p>
              <p className="mt-0.5">Bà Đặng Thị Uyên</p>
            </div>
          </div>
          <div>
            <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.15em] text-foreground/60">
              NHÀ GÁI
            </p>
            <div className="mt-1 font-display text-[13px] sm:text-[14px] leading-snug text-foreground/90 font-normal">
              <p>Ông Nguyễn Văn Kiên</p>
              <p className="mt-0.5">Bà Nguyễn Thị Thu Hà</p>
            </div>
          </div>
        </div>

        {/* DIVIDER: Đường phân cách mảnh với hoa văn tối giản ❦ — Khoảng thở cân đối */}
        <div
          data-intro-copy
          className="my-5 flex items-center justify-center gap-3"
          aria-hidden
        >
          <span className="h-px flex-1 bg-foreground/15" />
          <span className=" text-xl text-primary/75 select-none">❦</span>
          <span className="h-px flex-1 bg-foreground/15" />
        </div>

        {/* TẦNG 3: Cô dâu & Chú rể — 2 Cột ngang hàng side-by-side */}
        <div data-intro-copy className="grid grid-cols-2 gap-4 text-center">
          {/* Chú rể (cột trái - thẳng dưới cột Nhà Trai) */}
          <div className="flex flex-col items-center">
            <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.15em] text-foreground/45">
              CHÚ RỂ
            </p>
            <h3 className="mt-1 font-display italic text-[15px] sm:text-[16.5px] font-medium leading-tight text-primary whitespace-nowrap">
              {GROOM.fullName}
            </h3>
            <p className="mt-2.5 text-[10px] sm:text-[11px] leading-relaxed font-light italic text-[#78716c]">
              &ldquo;{GROOM.quote}&rdquo;
            </p>
          </div>

          {/* Cô dâu (cột phải - thẳng dưới cột Nhà Gái) */}
          <div className="flex flex-col items-center">
            <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.15em] text-foreground/45">
              CÔ DÂU
            </p>
            <h3 className="mt-1 font-display italic text-[15px] sm:text-[16.5px] font-medium leading-tight text-primary whitespace-nowrap">
              {BRIDE.fullName}
            </h3>
            <p className="mt-2.5 text-[10px] sm:text-[11px] leading-relaxed font-light italic text-[#78716c]">
              &ldquo;{BRIDE.quote}&rdquo;
            </p>
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[calc(var(--section-nav-height,0px)+1.5rem)] bg-linear-to-t from-background/35 to-transparent"
      />
    </section>
  );
}

function MobileRowCopy({
  person,
}: {
  person: Person;
  align?: "start" | "end";
}) {
  return (
    <div
      data-intro-mobile-copy
      className="px-1 text-center"
    >
      <p className="text-[9px] uppercase tracking-[0.15em] text-foreground/45 font-medium">
        {person.role}
      </p>
      <h3 className="mt-1 font-display italic text-[14px] sm:text-[15px] font-medium leading-snug text-primary">
        {person.fullName}
      </h3>
      <p className="mt-2 line-clamp-4 text-[10px] sm:text-[11px] leading-relaxed font-light italic text-[#78716c]">
        &ldquo;{person.quote}&rdquo;
      </p>
    </div>
  );
}

function MobilePortrait({
  person,
  side,
}: {
  person: Person;
  side: "groom" | "bride";
}) {
  return (
    <div
      data-intro-mobile-mask
      data-side={side}
      className="relative aspect-3/4 w-full overflow-hidden bg-foreground/8"
    >
      <div
        data-intro-mobile-image
        className="absolute inset-[-8%] will-change-transform"
      >
        <Image
          src={person.image}
          alt={person.fullName}
          fill
          sizes="48vw"
          className={`object-cover ${person.imagePosition} saturate-[0.8] brightness-[0.9]`}
        />
      </div>
    </div>
  );
}

/** Mobile — parallel rows: photos side-by-side, then text blocks under each */
function IntroMobile({
  sectionRef,
  reducedMotion = false,
  role = "his",
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
  reducedMotion?: boolean;
  role?: WeddingRole;
}) {
  const titleRef = useRef<HTMLDivElement>(null);
  const photosRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const ampersandRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const photos = photosRef.current;
    const copyRow = copyRef.current;
    const ampersand = ampersandRef.current;

    if (!section || !title || !photos || !copyRow || !ampersand) {
      return;
    }

    if (reducedMotion) {
      gsap.set(ampersand, { autoAlpha: 0.18 });
      return;
    }

    const scroller = getScroller();
    const timelines: gsap.core.Timeline[] = [];
    const tweens: gsap.core.Tween[] = [];

    const masks = Array.from(
      photos.querySelectorAll<HTMLElement>("[data-intro-mobile-mask]"),
    );
    const images = Array.from(
      photos.querySelectorAll<HTMLElement>("[data-intro-mobile-image]"),
    );
    const copies = Array.from(
      copyRow.querySelectorAll<HTMLElement>("[data-intro-mobile-copy]"),
    );

    if (masks.length < 2 || images.length < 2 || copies.length < 2) {
      return;
    }

    gsap.set(title, { y: 20, autoAlpha: 0 });
    gsap.set(ampersand, { autoAlpha: 0 });
    gsap.set(masks[0], { clipPath: LEFT_MASK_HIDDEN });
    gsap.set(masks[1], { clipPath: RIGHT_MASK_HIDDEN });
    gsap.set(images, { scale: 1.08 });
    gsap.set(copies, { y: 22, autoAlpha: 0 });

    const entrance = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 78%",
        scroller,
        toggleActions: "play none none reverse",
        invalidateOnRefresh: true,
      },
    });
    timelines.push(entrance);

    entrance
      .to(title, { y: 0, autoAlpha: 1, duration: 0.65, ease: "power3.out" }, 0)
      .to(
        ampersand,
        { autoAlpha: 0.18, duration: 1.2, ease: "power2.out" },
        0.15,
      )
      .to(
        masks[0],
        { clipPath: MASK_VISIBLE, duration: 1.05, ease: "power3.inOut" },
        0.2,
      )
      .to(
        masks[1],
        { clipPath: MASK_VISIBLE, duration: 1.05, ease: "power3.inOut" },
        0.32,
      )
      .to(
        images,
        { scale: 1, duration: 1.05, ease: "power3.out", stagger: 0.12 },
        0.2,
      )
      .to(
        copies,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.65,
          stagger: 0.1,
          ease: "power2.out",
        },
        0.85,
      );

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("resize", refresh);

    return () => {
      window.removeEventListener("resize", refresh);
      timelines.forEach((tl) => tl.kill());
      tweens.forEach((tween) => tween.kill());
    };
  }, [reducedMotion, sectionRef]);

  const announcementTitle =
    role === "hers"
      ? "TRÂN TRỌNG BÁO TIN LỄ VU QUY"
      : "TRÂN TRỌNG BÁO TIN LỄ THÀNH HÔN";

  return (
    <section
      id="section-2"
      ref={sectionRef}
      className="relative flex min-h-dvh flex-col justify-center overflow-hidden bg-background text-foreground px-5 py-8 pb-[calc(80px+env(safe-area-inset-bottom,20px))]"
    >
      <div className="relative mx-auto flex w-full max-w-sm flex-col justify-center gap-4">
        {/* Header: Announcement & Parents */}
        <header className="text-center">
          <p className="font-sans text-[9px] font-medium uppercase tracking-[0.22em] text-primary">
            {announcementTitle}
          </p>
          <div ref={titleRef} className="mt-2.5 grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.15em] text-foreground/60">
                NHÀ TRAI
              </p>
              <div className="mt-0.5 font-display text-[12px] leading-snug text-foreground/90 font-normal">
                <p>Ông Phạm Danh Tĩnh</p>
                <p className="mt-0.5">Bà Đặng Thị Uyên</p>
              </div>
            </div>
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.15em] text-foreground/60">
                NHÀ GÁI
              </p>
              <div className="mt-0.5 font-display text-[12px] leading-snug text-foreground/90 font-normal">
                <p>Ông Nguyễn Văn Kiên</p>
                <p className="mt-0.5">Bà Nguyễn Thị Thu Hà</p>
              </div>
            </div>
          </div>
        </header>

        <span
          ref={ampersandRef}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[70%] z-0 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[clamp(14rem,68vw,22rem)] italic leading-none text-primary opacity-0"
        >
          &
        </span>

        {/* Row 1 — portraits side by side */}
        <div ref={photosRef} className="relative z-10 grid grid-cols-2 gap-3">
          <MobilePortrait person={GROOM} side="groom" />
          <MobilePortrait person={BRIDE} side="bride" />
        </div>

        {/* Row 2 — copy under each portrait */}
        <div ref={copyRef} className="relative z-10 grid grid-cols-2 gap-3">
          <MobileRowCopy person={GROOM} />
          <MobileRowCopy person={BRIDE} />
        </div>
      </div>
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

export function IntroductionSection({ role = "his" }: { role?: WeddingRole }) {
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
    return <IntroMobile sectionRef={sectionRef} role={role} />;
  }

  if (layoutMode === "reduced-mobile") {
    return <IntroMobile sectionRef={sectionRef} reducedMotion role={role} />;
  }

  if (layoutMode === "reduced-desktop") {
    return <IntroDesktop sectionRef={sectionRef} reducedMotion role={role} />;
  }

  return <IntroDesktop sectionRef={sectionRef} role={role} />;
}
