"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getScroller, setCornerNavColor } from "@/lib/scroll/cornerNav";
import { type WeddingRole } from "@/lib/constants/wedding-data";

gsap.registerPlugin(ScrollTrigger);

interface MapTarget {
  title: string;
  query: string;
  url: string;
}

interface WeddingEventConfig {
  subtitle: string;
  banquet: {
    badge: string;
    time: string;
    date: string;
    lunarDate: string;
    venueName: string;
    venueAddress: string;
    mapsQuery: string;
    mapsUrl: string;
  };
  ceremony: {
    badge: string;
    time: string;
    date: string;
    note: string;
    venueName: string;
    venueAddress: string;
    mobileNote: string;
    mobileLocation: string;
    mapsQuery: string;
    mapsUrl: string;
  };
}

const EVENT_CONFIGS: Record<WeddingRole, WeddingEventConfig> = {
  his: {
    subtitle: "TIỆC CƯỚI & LỄ THÀNH HÔN",
    banquet: {
      badge: "TIỆC MỪNG (DÙNG TIỆC CHUNG VUI)",
      time: "10:45",
      date: "Chủ Nhật, 29.11.2026",
      lunarDate: "Tức ngày 21.10 năm Bính Ngọ",
      venueName: "Trung Tâm Văn Hóa - Thể Thao Xã Dương Xá",
      venueAddress: "15/9 Ỷ Lan, Đường Đình, Gia Lâm, Hà Nội",
      mapsQuery: "Trung Tâm Văn Hóa Thể Thao Xã Dương Xá, 15/9 Ỷ Lan, Gia Lâm, Hà Nội",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Trung+T%C3%A2m+V%C4%83n+H%C3%B3a+Th%E1%BB%83+Thao+X%C3%A3+D%C6%B0%C6%A1ng+X%C3%A1%2C+Gia+L%C3%A2m%2C+H%C3%A0+N%E1%BB%99i",
    },
    ceremony: {
      badge: "LỄ THÀNH HÔN (TƯ GIA)",
      time: "10:00",
      date: "Chủ Nhật, 29.11.2026",
      note: "Hôn lễ truyền thống tại gia đình",
      venueName: "Tư gia Nhà Trai",
      venueAddress: "Số 2 Ngõ 12 Ỷ Lan, Đường Đình, Gia Lâm, Hà Nội",
      mobileNote: "Lễ Thành Hôn cử hành lúc 10:00 cùng ngày tại",
      mobileLocation: "Tư gia Nhà Trai (Số 2 Ngõ 12 Ỷ Lan)",
      mapsQuery: "Số 2 Ngõ 12 Ỷ Lan, Đường Đình, Gia Lâm, Hà Nội",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=S%E1%BB%91+2+Ng%C3%B5+12+%E1%BB%B6+Lan%2C+%C4%90%C6%B0%E1%BB%9Dng+%C4%90%C3%ACnh%2C+Gia+L%C3%A2m%2C+H%C3%A0+N%E1%BB%99i",
    },
  },
  hers: {
    subtitle: "TIỆC CƯỚI & LỄ VU QUY",
    banquet: {
      badge: "TIỆC CƯỚI (ĐÓN KHÁCH & DÙNG TIỆC)",
      time: "16:30",
      date: "Thứ Bảy, 28.11.2026",
      lunarDate: "Tức ngày 20.10 năm Bính Ngọ",
      venueName: "Nhà Văn Hóa Thôn Yên Mỹ",
      venueAddress: "Thôn Yên Mỹ, Xã Thuận An, Hà Nội",
      mapsQuery: "Nhà Văn Hóa Thôn Yên Mỹ, Thuận An, Hà Nội",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Nh%C3%A0+V%C4%83n+H%C3%B3a+Th%C3%B4n+Y%C3%AAn+M%E1%BB%B9%2C+Thu%E1%BA%ADn+An%2C+H%C3%A0+N%E1%BB%99i",
    },
    ceremony: {
      badge: "LỄ VU QUY (TƯ GIA)",
      time: "08:30",
      date: "Chủ Nhật, 29.11.2026",
      note: "Lễ rước dâu & chúc phúc gia đình",
      venueName: "Tư gia Nhà Gái",
      venueAddress: "Thôn Yên Mỹ, Xã Thuận An, Hà Nội",
      mobileNote: "Lễ Vu Quy cử hành lúc 08:30 (29.11) tại",
      mobileLocation: "Tư gia Nhà Gái (Thôn Yên Mỹ)",
      mapsQuery: "Thôn Yên Mỹ, Thuận An, Hà Nội",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Th%C3%B4n+Y%C3%AAn+M%E1%BB%B9%2C+Thu%E1%BA%ADn+An%2C+H%C3%A0+N%E1%BB%99i",
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

  const embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(target.query)}&hl=vi&z=15&output=embed`;

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

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const col1Ref = useRef<HTMLDivElement>(null);
  const col2Ref = useRef<HTMLDivElement>(null);

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
      onLeaveBack: () => setCornerNavColor("hero"),
    });

    return () => {
      chromeTrigger.kill();
    };
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const rule = ruleRef.current;
    const col1 = col1Ref.current;
    const col2 = col2Ref.current;

    if (!section || !header || !rule || !col1 || !col2) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    const scroller = getScroller();
    const targets = [header, rule, col1, col2];
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
      .to(header, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out" })
      .to(rule, { y: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out" }, "-=0.5")
      .to(col1, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out" }, "-=0.4")
      .to(col2, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out" }, "-=0.55");

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("resize", refresh);

    return () => {
      window.removeEventListener("resize", refresh);
      timeline.scrollTrigger?.kill();
      timeline.kill();
    };
  }, [role]);

  const openBanquetMap = () =>
    setActiveMap({
      title: config.banquet.venueName,
      query: config.banquet.mapsQuery,
      url: config.banquet.mapsUrl,
    });

  const openCeremonyMap = () =>
    setActiveMap({
      title: config.ceremony.venueName,
      query: config.ceremony.mapsQuery,
      url: config.ceremony.mapsUrl,
    });

  return (
    <>
      <section
        id="section-5"
        ref={sectionRef}
        className="relative overflow-hidden bg-background text-foreground pt-16 pb-12 sm:pt-20 sm:pb-16 md:flex md:min-h-dvh md:flex-col md:justify-center md:pt-32 md:pb-[calc(var(--section-nav-height,0px)+6rem)]"
      >
        <div className="relative z-10 w-full max-w-6xl xl:max-w-7xl mx-auto px-6 sm:px-10 md:px-14 lg:px-20 text-left">
          
          {/* ========================================================= */}
          {/* 1. EDITORIAL HEADER & TITLE                               */}
          {/* ========================================================= */}
          <div ref={headerRef} className="max-w-3xl">
            <span className="text-[10px] sm:text-[11px] font-sans uppercase tracking-[0.3em] text-primary font-medium block mb-2 sm:mb-2.5">
              03 / TIMELINE &amp; LOCATION
            </span>
            <h2 className="font-display italic text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground tracking-tight leading-tight">
              Chương Trình Hôn Lễ
            </h2>
            <span className="text-xs sm:text-sm font-sans uppercase tracking-[0.24em] text-[#2B3A2D]/80 font-medium mt-2 md:mt-3 block">
              {config.subtitle}
            </span>
          </div>

          {/* Horizontal Rule */}
          <div ref={ruleRef} className="h-px w-full bg-foreground/15 mt-5 mb-7 sm:mt-8 sm:mb-12 md:mt-10 md:mb-16 lg:mb-20" />

          {/* ========================================================= */}
          {/* 2. TWO-COLUMN EDITORIAL TYPOGRAPHIC SPREAD                */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-[1.18fr_0.82fr] gap-8 sm:gap-10 md:gap-12 lg:gap-16 xl:gap-20 items-start">
            
            {/* ------------------------------------------------------- */}
            {/* CỘT 1: TIỆC MỪNG CHÍNH (TÂM ĐIỂM CHO 90% KHÁCH MỜI)      */}
            {/* ------------------------------------------------------- */}
            <div ref={col1Ref} className="flex flex-col text-left">
              <span className="text-xs font-sans uppercase tracking-[0.24em] text-primary/90 font-semibold block mb-3 md:mb-4">
                {config.banquet.badge}
              </span>

              {/* Time & Date Display */}
              <div>
                <span className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground block leading-none">
                  {config.banquet.time}
                </span>
                
                <span className="font-display text-xl sm:text-2xl lg:text-3xl font-medium text-foreground tracking-wide mt-3 sm:mt-4 md:mt-5 block">
                  {config.banquet.date}
                </span>

                <span className="text-xs sm:text-sm font-sans text-[#2B3A2D]/80 italic mt-1.5 block">
                  ({config.banquet.lunarDate})
                </span>
              </div>

              {/* Venue Divider */}
              <div className="h-px w-14 bg-foreground/15 my-5 md:my-7 lg:my-8" />

              {/* Venue Info */}
              <div>
                <h3 className="font-display text-xl sm:text-[22px] lg:text-[26px] font-semibold text-foreground leading-snug text-balance">
                  {config.banquet.venueName}
                </h3>
                <p className="mt-2 md:mt-3 text-sm sm:text-base font-sans text-foreground/80 leading-relaxed max-w-lg">
                  {config.banquet.venueAddress}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-6 md:mt-8 lg:mt-10 flex items-center">
                <button
                  type="button"
                  onClick={openBanquetMap}
                  className="cursor-pointer group inline-flex items-center gap-2 border border-foreground/35 bg-foreground/[0.04] px-5 sm:px-6 py-2.5 sm:py-3 text-xs uppercase tracking-[0.2em] text-foreground transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white rounded-xs shadow-xs"
                >
                  <span className="font-medium">Xem bản đồ chỉ đường</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </button>
              </div>
            </div>

            {/* ------------------------------------------------------- */}
            {/* CỘT 2: LỄ TỔ CHỨC TẠI TƯ GIA (MOBILE: 1 GHI CHÚ GỌN)    */}
            {/* ------------------------------------------------------- */}
            <div
              ref={col2Ref}
              className="flex flex-col text-left border-t border-foreground/15 pt-5 md:border-t-0 md:pt-0 md:border-l md:pl-10 lg:pl-14 xl:pl-16"
            >
              {/* Mobile compact footnote */}
              <div className="md:hidden text-xs font-sans text-[#2B3A2D]/85 leading-relaxed">
                <p>
                  {config.ceremony.mobileNote}{" "}
                  <button
                    type="button"
                    onClick={openCeremonyMap}
                    className="cursor-pointer inline font-medium text-primary underline decoration-primary/45 underline-offset-4 hover:decoration-primary"
                  >
                    {config.ceremony.mobileLocation} ↗
                  </button>
                </p>
              </div>

              {/* Desktop full secondary column */}
              <div className="hidden md:flex md:flex-col">
                <span className="text-xs font-sans uppercase tracking-[0.24em] text-[#2B3A2D]/80 font-semibold block mb-4">
                  {config.ceremony.badge}
                </span>

                {/* Time & Date Display */}
                <div>
                  <span className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-foreground/85 block leading-none">
                    {config.ceremony.time}
                  </span>

                  <span className="font-display text-lg sm:text-xl lg:text-2xl font-medium text-foreground/80 tracking-wide mt-4 sm:mt-5 block">
                    {config.ceremony.date}
                  </span>

                  <span className="text-xs sm:text-sm font-sans text-[#2B3A2D]/80 italic mt-1.5 block">
                    {config.ceremony.note}
                  </span>
                </div>

                {/* Venue Divider */}
                <div className="h-px w-14 bg-foreground/15 my-7 sm:my-8" />

                {/* Venue Info */}
                <div>
                  <h3 className="font-display text-lg sm:text-xl lg:text-2xl font-medium text-foreground/90 leading-snug text-balance">
                    {config.ceremony.venueName}
                  </h3>
                  <p className="mt-2.5 sm:mt-3 text-sm sm:text-base font-sans text-foreground/75 leading-relaxed max-w-md">
                    {config.ceremony.venueAddress}
                  </p>
                </div>

                {/* Secondary Map Link */}
                <div className="mt-8 sm:mt-10 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={openCeremonyMap}
                    className="cursor-pointer group inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-primary font-medium py-1"
                  >
                    <span className="border-b border-primary/60 pb-0.5 transition-colors group-hover:border-primary">
                      [ Chỉ đường tư gia ↗ ]
                    </span>
                  </button>
                </div>
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
