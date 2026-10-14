"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getScroller, setCornerNavColor } from "@/lib/scroll/cornerNav";
import {
  getWeddingData,
  TIMELINE_ROWS,
  type TimelineRow,
  type WeddingRole,
} from "@/lib/constants/wedding-data";

gsap.registerPlugin(ScrollTrigger);

const CONTENT_INSET = "px-6 md:px-20 lg:px-28 xl:px-36";

function MapsModal({
  open,
  onClose,
  mapsQuery,
  mapsUrl,
}: {
  open: boolean;
  onClose: () => void;
  mapsQuery: string;
  mapsUrl: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) {
      return;
    }

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
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
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

  if (!open || typeof document === "undefined") {
    return null;
  }

  const embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapsQuery)}&hl=vi&z=15&output=embed`;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Bản đồ địa điểm cưới"
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
              Địa điểm cưới
            </p>
            <p className="truncate text-xs text-background/60">{mapsQuery}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer whitespace-nowrap border border-background/30 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-background/80 transition-colors hover:border-background hover:text-background md:px-3 md:text-xs md:tracking-[0.2em]"
            >
              Mở Maps
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
          title="Bản đồ địa điểm cưới"
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

function ScheduleRow({
  row,
  dataAttr,
  hoverable = true,
  isActive = false,
  valueRef,
}: {
  row: TimelineRow;
  dataAttr: string;
  hoverable?: boolean;
  isActive?: boolean;
  valueRef?: RefObject<HTMLParagraphElement | null>;
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  const handleEnter = () => {
    if (!hoverable) {
      return;
    }

    const timeEl = rowRef.current?.querySelector<HTMLElement>(
      "[data-wedding-time]",
    );
    if (!timeEl) {
      return;
    }

    gsap.to(timeEl, {
      x: 5,
      color: "#a63d52",
      duration: 0.45,
      ease: "power2.out",
      overwrite: true,
    });
  };

  const handleLeave = () => {
    if (!hoverable) {
      return;
    }

    const timeEl = rowRef.current?.querySelector<HTMLElement>(
      "[data-wedding-time]",
    );
    if (!timeEl) {
      return;
    }

    gsap.to(timeEl, {
      x: 0,
      color: "#e6dfd3",
      duration: 0.45,
      ease: "power2.out",
      overwrite: true,
    });
  };

  return (
    <div
      ref={rowRef}
      data-wedding-row={dataAttr}
      className={`grid grid-cols-[1fr_auto] items-end gap-3 border-b border-background/10 py-3.5 transition-opacity duration-300 sm:py-5 md:gap-6 md:py-6 lg:py-8 ${
        isActive ? "opacity-100" : "opacity-50 hover:opacity-85"
      } ${hoverable ? "cursor-default" : "pointer-events-none"}`}
      onMouseEnter={hoverable ? handleEnter : undefined}
      onMouseLeave={hoverable ? handleLeave : undefined}
      onFocus={hoverable ? handleEnter : undefined}
      onBlur={hoverable ? handleLeave : undefined}
    >
      {/* Cột trái: Tên lễ + Ngày tháng + Địa điểm */}
      <div className="min-w-0 pr-2">
        {/* Bản Desktop (md trở lên): Tên lễ và Ngày chung 1 dòng lớn */}
        <div className="hidden md:block">
          <p className="truncate font-display text-xl italic text-background/92 lg:text-3xl">
            {row.title} <span className="mx-1 text-background/40">·</span> {row.dateStr}
          </p>
          <p className="mt-1.5 text-[10px] uppercase tracking-[0.22em] text-background/45 md:text-xs">
            {row.subtitle}
          </p>
        </div>

        {/* Bản Mobile: Tách 3 tầng gọn gàng, không bị tràn hay chen lấn */}
        <div className="block md:hidden">
          <p className="font-display text-base italic leading-tight text-background/95 sm:text-lg">
            {row.title}
          </p>
          <p className="mt-0.5 text-xs font-normal text-[#d4b87a]">
            {row.dateStr}
          </p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-background/50">
            {row.subtitle}
          </p>
        </div>
      </div>

      {/* Cột phải: Số giờ to và subtext */}
      <div className="shrink-0 text-right">
        <p
          ref={valueRef}
          data-wedding-time
          className="font-display text-[clamp(1.75rem,5.5vw,4.5rem)] leading-none text-background will-change-transform"
        >
          {row.timeStr}
        </p>
        <p className="mt-1 text-[10px] text-background/45 md:mt-2 md:text-xs">
          {row.timeNote}
        </p>
      </div>
    </div>
  );
}

export function WeddingSection({ role = "his" }: { role?: WeddingRole }) {
  const weddingData = getWeddingData(role);
  const sectionRef = useRef<HTMLElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const venueRef = useRef<HTMLDivElement>(null);
  const [mapsOpen, setMapsOpen] = useState(false);

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
      onLeaveBack: () => setCornerNavColor("accent"),
    });

    return () => {
      chromeTrigger.kill();
    };
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const row1 = row1Ref.current;
    const row2 = row2Ref.current;
    const venue = venueRef.current;

    if (!section || !row1 || !row2 || !venue) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const scroller = getScroller();

    gsap.set([row1, row2, venue], { y: 28, autoAlpha: 0 });

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
      .to(row1, { y: 0, autoAlpha: 1, duration: 0.75, ease: "power3.out" })
      .to(
        row2,
        { y: 0, autoAlpha: 1, duration: 0.75, ease: "power3.out" },
        "-=0.4",
      )
      .to(
        venue,
        { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out" },
        "-=0.25",
      );

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("resize", refresh);

    return () => {
      window.removeEventListener("resize", refresh);
      timeline.scrollTrigger?.kill();
      timeline.kill();
    };
  }, []);

  return (
    <>
      <section
        id="section-5"
        ref={sectionRef}
        className="relative flex h-dvh min-h-dvh flex-col justify-center overflow-hidden bg-[#0a0a0a] text-background"
      >
        <div
          className={`mx-auto flex h-full w-full max-w-7xl flex-col justify-center pb-[var(--section-nav-height,0px)] ${CONTENT_INSET}`}
        >
          {/* Cụm nội dung gắn kết 3 khối: Lễ 1 + Lễ 2 + Địa điểm đặt tại trung tâm */}
          <div className="flex flex-col justify-center">
            {/* Dòng 1: Lễ Vu Quy (Nhà Gái) */}
            <div ref={row1Ref}>
              <ScheduleRow
                hoverable
                isActive={role === "hers"}
                dataAttr="vu-quy"
                row={TIMELINE_ROWS[0]}
              />
            </div>

            {/* Dòng 2: Lễ Thành Hôn (Nhà Trai) */}
            <div ref={row2Ref}>
              <ScheduleRow
                hoverable
                isActive={role === "his"}
                dataAttr="thanh-hon"
                row={TIMELINE_ROWS[1]}
              />
            </div>

            {/* Dòng 3: Khối Địa điểm & Bản đồ (liền mạch ngay dưới Lễ 2) */}
            <div
              ref={venueRef}
              className="grid shrink-0 grid-cols-[minmax(0,1fr)_minmax(0,100px)] items-end gap-4 pt-6 sm:pt-7 md:gap-6 md:pt-8 lg:pt-9"
            >
              <div>
                <h3 className="font-display text-[clamp(1.15rem,3vw,2.5rem)] leading-tight text-background">
                  {weddingData.venue.name}
                </h3>
                <p className="mt-1 text-xs text-background/58 sm:text-sm md:mt-1.5 md:text-base">
                  {weddingData.venue.address}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2.5 md:mt-4 md:gap-3">
                  <button
                    type="button"
                    onClick={() => setMapsOpen(true)}
                    className="cursor-pointer border border-background/45 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] text-background/88 transition-[color,border-color,background-color] duration-300 hover:border-background hover:bg-background/8 hover:text-background md:px-4 md:py-2 md:text-xs md:tracking-[0.22em]"
                  >
                    Xem bản đồ
                  </button>
                  <a
                    href={weddingData.venue.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center border border-transparent px-2 py-1.5 text-[10px] uppercase tracking-[0.16em] text-background/50 transition-colors hover:text-background/80 md:px-2 md:py-2 md:text-xs md:tracking-[0.18em]"
                  >
                    Google Maps
                  </a>
                </div>
              </div>

              <div className="text-right">
                <p className="font-display text-base italic text-background/92 sm:text-lg md:text-xl lg:text-3xl">
                  Place
                </p>
                <p className="mt-0.5 text-[9px] uppercase tracking-[0.2em] text-background/45 md:mt-1 md:text-xs md:tracking-[0.22em]">
                  Địa điểm
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MapsModal
        open={mapsOpen}
        onClose={() => setMapsOpen(false)}
        mapsQuery={weddingData.venue.mapsQuery}
        mapsUrl={weddingData.venue.mapsUrl}
      />
    </>
  );
}
