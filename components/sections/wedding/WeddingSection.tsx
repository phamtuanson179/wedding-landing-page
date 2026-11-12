"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getScroller, setCornerNavColor } from "@/lib/scroll/cornerNav";
import { MonogramLogoSvg, PolygonSvg } from "@/components/preloader";
import {
  VENUES,
  getWeddingData,
  type WeddingRole,
} from "@/lib/constants/wedding-data";

gsap.registerPlugin(ScrollTrigger);

interface MapTarget {
  title: string;
  query: string;
  embedQuery?: string;
  url: string;
}

const FAMILY_SHORT_ADDRESS: Record<string, string> = {
  "Nhà Trai": "Gia Lâm, Hà Nội",
  "Nhà Gái": "Thuận An, Hà Nội",
};

interface WeddingEventConfig {
  coupleOrder: readonly [string, string];
  banquet: {
    title: string;
    time: string;
    day: string;
    month: string;
    year: string;
    weekday: string;
    lunarDate: string;
    venueName: string;
    venueAddress: string;
    mapsQuery: string;
    mapsUrl: string;
  };
  ceremony: {
    inlineNote: string;
    inlineLocation: string;
    venueName: string;
    mapsQuery: string;
    embedQuery?: string;
    mapsUrl: string;
  };
}

const EVENT_CONFIGS: Record<WeddingRole, WeddingEventConfig> = {
  his: {
    coupleOrder: ["Tuấn Sơn", "Thùy Linh"],
    banquet: {
      title: "Tiệc mừng nhà trai",
      time: "10:45",
      day: "29",
      month: "11",
      year: "26",
      weekday: "Chủ Nhật",
      lunarDate: "Tức ngày 21.10 năm Bính Ngọ",
      venueName: "TT Văn Hóa - Thể Thao\nXã Dương Xá",
      venueAddress: "15/9 Ỷ Lan, Đường Đình, Gia Lâm",
      mapsQuery: "Trung Tâm Văn Hóa Thể Thao Xã Dương Xá, 15/9 Ỷ Lan, Gia Lâm, Hà Nội",
      mapsUrl: VENUES.his.mapsUrl,
    },
    ceremony: {
      inlineNote: "Lễ Thành Hôn cử hành lúc 10:00 tại",
      inlineLocation: "Tư gia Nhà Trai (Số 2 Ngõ 12 Ỷ Lan)",
      venueName: "Tư gia Nhà Trai",
      mapsQuery: "Số 2 Ngõ 12 Ỷ Lan, Đường Đình, Gia Lâm, Hà Nội",
      embedQuery: "21.0050581,105.966173",
      mapsUrl: "https://maps.app.goo.gl/bVXBGy7KzpYezYQb9",
    },
  },
  hers: {
    coupleOrder: ["Thùy Linh", "Tuấn Sơn"],
    banquet: {
      title: "Tiệc mừng nhà gái",
      time: "16:30",
      day: "28",
      month: "11",
      year: "26",
      weekday: "Thứ Bảy",
      lunarDate: "Tức ngày 20.10 năm Bính Ngọ",
      venueName: VENUES.hers.name,
      venueAddress: VENUES.hers.address,
      mapsQuery: VENUES.hers.mapsQuery,
      mapsUrl: VENUES.hers.mapsUrl,
    },
    ceremony: {
      inlineNote: "Lễ Vu Quy cử hành lúc 08:30 (29.11) tại",
      inlineLocation: "Tư gia Nhà Gái (Thôn Yên Mỹ)",
      venueName: "Tư gia Nhà Gái",
      mapsQuery: "Thôn Yên Mỹ, Thuận An, Hà Nội",
      embedQuery: "21.005138,105.999646",
      mapsUrl: "https://maps.app.goo.gl/St78aaaNaTojmPPA8",
    },
  },
};

function MapsModal({
  target,
  onClose,
}: {
  target: MapTarget | null;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLButtonElement>(null);

  const open = target !== null;

  useLayoutEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    gsap.set(backdrop, { autoAlpha: 0 });
    gsap.set(panel, { autoAlpha: 0, y: 24, scale: 0.98 });

    const tween = gsap.timeline();
    tween.to(backdrop, {
      autoAlpha: 1,
      duration: prefersReducedMotion ? 0.15 : 0.35,
      ease: "power2.out",
    });
    tween.to(
      panel,
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: prefersReducedMotion ? 0.2 : 0.5,
        ease: "power3.out",
      },
      "-=0.1",
    );

    return () => {
      tween.kill();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const handleClose = () => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) {
      onClose();
      return;
    }

    gsap
      .timeline({ onComplete: onClose })
      .to(panel, {
        autoAlpha: 0,
        y: 16,
        scale: 0.98,
        duration: 0.25,
        ease: "power2.in",
      })
      .to(
        backdrop,
        { autoAlpha: 0, duration: 0.2, ease: "power2.in" },
        "-=0.1",
      );
  };

  if (!open || !target || typeof document === "undefined") {
    return null;
  }

  const embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(target.embedQuery ?? target.query)}&hl=vi&z=16&output=embed`;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`Bản đồ ${target.title}`}
    >
      <button
        ref={backdropRef}
        type="button"
        aria-label="Đóng bản đồ"
        onClick={handleClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm cursor-pointer"
      />

      <div
        ref={panelRef}
        className="relative z-10 flex h-full max-h-[82vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-background/25 bg-[#141414] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-background/15 px-4 py-3 md:px-6 md:py-4">
          <div className="min-w-0 pr-4">
            <p className="truncate font-display text-sm text-background md:text-base">
              {target.title}
            </p>
            <p className="truncate text-xs text-background/60">{target.query}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={target.url}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer whitespace-nowrap border border-background/30 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-background/80 transition-colors hover:border-background hover:text-background md:px-3 md:text-xs md:tracking-[0.2em]"
            >
              Mở Google Maps
            </a>
            <button
              type="button"
              onClick={handleClose}
              className="cursor-pointer whitespace-nowrap border border-background/30 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-background/80 transition-colors hover:border-background hover:text-background md:px-3 md:text-xs md:tracking-[0.2em]"
            >
              Đóng
            </button>
          </div>
        </div>

        <iframe
          title={`Bản đồ ${target.title}`}
          src={embedSrc}
          className="h-full w-full border-0"
          loading="eager"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </div>,
    document.body,
  );
}

export function WeddingSection({ role = "his" }: { role?: WeddingRole }) {
  const config = EVENT_CONFIGS[role] ?? EVENT_CONFIGS.his;
  const sideData = getWeddingData(role);
  const families = [sideData.primaryFamily, sideData.secondaryFamily];

  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const inviteColRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const eventColRef = useRef<HTMLDivElement>(null);
  const sealPolygonRef = useRef<HTMLDivElement>(null);

  const [activeMap, setActiveMap] = useState<MapTarget | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const scroller = getScroller();
    const chromeTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top 50%",
      end: "bottom 50%",
      scroller,
      invalidateOnRefresh: true,
      onEnter: () => setCornerNavColor("accent"),
      onEnterBack: () => setCornerNavColor("accent"),
      onLeaveBack: () => setCornerNavColor("split-right-accent"),
    });

    return () => {
      chromeTrigger.kill();
    };
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const eyebrow = eyebrowRef.current;
    const inviteCol = inviteColRef.current;
    const divider = dividerRef.current;
    const eventCol = eventColRef.current;

    if (!section || !eyebrow || !inviteCol || !divider || !eventCol) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    const scroller = getScroller();
    const targets = [eyebrow, inviteCol, divider, eventCol];
    gsap.set(targets, { y: 24, autoAlpha: 0 });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 72%",
        scroller,
        toggleActions: "play none none reverse",
        invalidateOnRefresh: true,
      },
    });

    timeline
      .to(eyebrow, { y: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out" })
      .to(inviteCol, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out" }, "-=0.4")
      .to(divider, { y: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out" }, "-=0.55")
      .to(eventCol, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out" }, "-=0.5");

    const sealPolygon = sealPolygonRef.current;
    const sealSpin = sealPolygon
      ? gsap.to(sealPolygon, {
          rotation: 360,
          duration: 24,
          ease: "none",
          repeat: -1,
          transformOrigin: "center center",
        })
      : null;

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("resize", refresh);

    return () => {
      window.removeEventListener("resize", refresh);
      sealSpin?.kill();
      timeline.scrollTrigger?.kill();
      timeline.kill();
    };
  }, [role]);

  const openMap = (target: MapTarget) => setActiveMap(target);

  return (
    <>
      <section
        id="section-5"
        ref={sectionRef}
        className="relative overflow-x-clip bg-background text-[#2B3A2D] pt-16 pb-14 sm:pt-20 sm:pb-16 md:flex md:min-h-dvh md:flex-col md:justify-center md:pt-24 md:pb-[calc(var(--section-nav-height,0px)+5rem)]"
      >
        <div className="relative z-10 mx-auto w-full max-w-5xl px-5 sm:px-8 md:px-12">
          <div ref={eyebrowRef} className="mb-7 text-center md:mb-12">
            <h2 className="sr-only">Thiệp Mời &amp; Chương Trình Hôn Lễ</h2>
            <p className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.28em] text-primary">
              03 / TIMELINE &amp; LOCATION
            </p>
          </div>

          <div className="mx-auto grid max-w-md grid-cols-1 items-center gap-8 md:max-w-none md:grid-cols-[1fr_1px_1fr] md:gap-10 lg:gap-14">
            {/* ========================================================= */}
            {/* PHẦN 1: SONG THÂN, MONOGRAM OVAL & LỜI MỜI               */}
            {/* ========================================================= */}
            <div ref={inviteColRef} className="flex flex-col items-center text-center">
              {/* Khối Song Thân 2 cột đối xứng (đảo vế tự động theo /his & /hers) */}
              <div className="grid w-full grid-cols-2 gap-3 sm:gap-6">
                {families.map((family) => (
                  <div key={family.title} className="min-w-0">
                    <p className="font-sans text-[0.6875rem] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#2B3A2D]">
                      {family.title}
                    </p>
                    <div className="mt-1.5 space-y-0.5 font-display text-[0.75rem] sm:text-sm leading-[1.45] text-[#2B3A2D]/90">
                      <p>{family.father}</p>
                      <p>{family.mother}</p>
                      <p className="pt-0.5 font-sans text-[0.6875rem] sm:text-xs text-[#2B3A2D]/75">
                        {FAMILY_SHORT_ADDRESS[family.title] ?? family.address}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Logo monogram Sơn & Linh trong hình thập giác thương hiệu */}
              <div
                role="img"
                aria-label="Logo monogram Sơn và Linh"
                className="relative my-5 sm:my-6 size-20 sm:size-[5.5rem] select-none text-primary"
              >
                <div
                  ref={sealPolygonRef}
                  className="absolute inset-0 will-change-transform"
                  aria-hidden="true"
                >
                  <PolygonSvg />
                </div>
                <div className="absolute inset-[24%]" aria-hidden="true">
                  <MonogramLogoSvg
                    priority={false}
                    className="block h-full w-full object-contain"
                  />
                </div>
              </div>

              {/* Lời mời */}
              <div className="space-y-1">
                <p className="font-display italic text-sm sm:text-base leading-[1.5] text-[#2B3A2D]/85">
                  Trân trọng kính mời
                </p>
                <p className="font-display text-base sm:text-lg font-semibold uppercase tracking-[0.22em] leading-[1.4] text-[#2B3A2D]">
                  Quý khách
                </p>
                <p className="font-display italic text-sm sm:text-base leading-[1.5] text-[#2B3A2D]/85">
                  Đến dự bữa tiệc chung vui cùng
                </p>
              </div>

              {/* Tên cô dâu chú rể */}
              <div className="mt-5 sm:mt-6 flex flex-col items-center gap-1">
                <p className="font-display text-[clamp(1.375rem,1.05rem+1.5vw,1.875rem)] font-medium uppercase tracking-[0.15em] leading-[1.2] text-[#2B3A2D] text-balance">
                  {config.coupleOrder[0]}
                </p>
                <span className="my-0.5 font-display italic text-base sm:text-lg leading-none text-primary">
                  &amp;
                </span>
                <p className="font-display text-[clamp(1.375rem,1.05rem+1.5vw,1.875rem)] font-medium uppercase tracking-[0.15em] leading-[1.2] text-[#2B3A2D] text-balance">
                  {config.coupleOrder[1]}
                </p>
              </div>
            </div>

            {/* Đường phân cách (ngang trên mobile, dọc trên desktop) */}
            <div
              ref={dividerRef}
              aria-hidden="true"
              className="h-px w-full bg-[#2B3A2D]/20 md:h-full md:min-h-[24rem] md:w-px"
            />

            {/* ========================================================= */}
            {/* PHẦN 2: TIỆC MỪNG, CỤM NGÀY XẾP DỌC & ĐỊA ĐIỂM            */}
            {/* ========================================================= */}
            <div ref={eventColRef} className="flex flex-col items-center text-center">
              <p className="font-sans text-xs sm:text-[0.8125rem] font-semibold uppercase tracking-[0.28em] text-primary">
                {config.banquet.title}
              </p>

              {/* Vertical Date Block */}
              <div className="my-5 sm:my-6 grid w-full grid-cols-[1fr_auto_1fr] items-center">
                <div className="min-w-0 pr-4 sm:pr-6 text-right">
                  <span className="font-display text-base sm:text-lg font-medium tracking-[0.12em] text-[#2B3A2D] tabular-nums">
                    {config.banquet.time}
                  </span>
                </div>

                <div className="flex flex-col items-center border-x border-primary/80 px-5 sm:px-7 py-0.5 font-display text-[clamp(1.75rem,1.4rem+1.2vw,2.25rem)] font-medium leading-[1.1] text-[#2B3A2D] tabular-nums">
                  <span>{config.banquet.day}</span>
                  <span>{config.banquet.month}</span>
                  <span>{config.banquet.year}</span>
                </div>

                <div className="min-w-0 pl-4 sm:pl-6 text-left">
                  <span className="font-display text-sm sm:text-base font-medium uppercase tracking-[0.14em] text-[#2B3A2D]">
                    {config.banquet.weekday}
                  </span>
                </div>
              </div>

              {/* Ngày âm lịch */}
              <p className="font-display italic text-xs sm:text-sm leading-[1.5] text-[#2B3A2D]/80">
                ({config.banquet.lunarDate})
              </p>

              {/* Địa điểm tổ chức */}
              <div className="mt-5 sm:mt-6 max-w-md space-y-1.5">
                <h3 className="font-display text-[clamp(1.0625rem,0.95rem+0.5vw,1.25rem)] font-semibold uppercase tracking-[0.06em] leading-[1.35] text-[#2B3A2D] whitespace-pre-line text-balance">
                  {config.banquet.venueName}
                </h3>
                <p className="font-sans text-xs sm:text-sm leading-[1.5] text-[#2B3A2D]/80 text-pretty">
                  {config.banquet.venueAddress}
                </p>
              </div>

              {/* Text link chỉ đường gạch chân mảnh */}
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  onClick={() =>
                    openMap({
                      title: config.banquet.venueName,
                      query: config.banquet.mapsQuery,
                      url: config.banquet.mapsUrl,
                    })
                  }
                  className="cursor-pointer group inline-flex items-center justify-center px-3 py-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-primary transition-opacity hover:opacity-80"
                >
                  <span className="border-b border-primary/70 pb-1 transition-colors group-hover:border-primary">
                    Xem bản đồ chỉ đường ↗
                  </span>
                </button>
              </div>

              {/* Ghi chú Lễ Thành Hôn / Vu Quy tại Tư Gia */}
              <div className="mt-5 w-full max-w-md border-t border-[#2B3A2D]/15 pt-4">
                <p className="font-sans text-xs leading-[1.6] text-[#2B3A2D]/80 text-pretty">
                  * {config.ceremony.inlineNote}{" "}
                  <button
                    type="button"
                    onClick={() =>
                      openMap({
                        title: config.ceremony.venueName,
                        query: config.ceremony.mapsQuery,
                        embedQuery: config.ceremony.embedQuery,
                        url: config.ceremony.mapsUrl,
                      })
                    }
                    className="cursor-pointer inline font-medium text-primary underline decoration-primary/50 underline-offset-4 transition-colors hover:decoration-primary"
                  >
                    {config.ceremony.inlineLocation} ↗
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Maps Modal */}
      <MapsModal target={activeMap} onClose={() => setActiveMap(null)} />
    </>
  );
}
