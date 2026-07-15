"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getScroller, setCornerNavColor } from "@/lib/scroll/cornerNav";

gsap.registerPlugin(ScrollTrigger);

const WEDDING = {
  date: "2026.11.29 Sun",
  ceremony: {
    label: "Wedding Ceremony",
    sublabel: "Lễ cưới",
    time: "11:00",
    note: "Đón khách từ 10:30",
  },
  reception: {
    label: "Reception",
    sublabel: "Tiệc cưới",
    time: "11:30",
    note: "Khai tiệc & chụp ảnh lưu niệm",
  },
  venue: {
    name: "Trung tâm Tiệc cưới Gia Lâm",
    address: "Gia Lâm, Hà Nội",
    mapsQuery: "Gia Lâm, Hà Nội, Vietnam",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Gia+L%C3%A2m%2C+H%C3%A0+N%E1%BB%99i",
  },
} as const;

const CONTENT_INSET = "px-4 md:px-24 lg:px-32 xl:px-36";

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
        className="absolute inset-0 bg-black/72"
        onClick={handleClose}
      />

      <div
        ref={panelRef}
        className="relative z-10 flex h-[min(82vh,720px)] w-full max-w-4xl flex-col overflow-hidden border border-background/20 bg-[#111] shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-background/10 px-3 py-3 md:px-5 md:py-4">
          <p className="shrink-0 whitespace-nowrap text-[10px] uppercase tracking-[0.18em] text-background/70 md:text-sm md:tracking-[0.24em]">
            Bản đồ
          </p>
          <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
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
  label,
  sublabel,
  time,
  note,
  dataAttr,
  hoverable = true,
  variant = "time",
  valueRef,
}: {
  label: string;
  sublabel: string;
  time: string;
  note?: string;
  dataAttr: string;
  hoverable?: boolean;
  variant?: "time" | "date";
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

  const valueClassName =
    variant === "date"
      ? "font-display text-[clamp(1.45rem,4.2vw,3.5rem)] leading-none text-background"
      : "font-display text-[clamp(2rem,6.2vw,4.5rem)] leading-none text-background will-change-transform";

  return (
    <div
      ref={rowRef}
      data-wedding-row={dataAttr}
      className={`grid grid-cols-2 items-end gap-3 border-b border-background/10 py-4 md:gap-4 md:py-5 lg:py-8 ${
        hoverable ? "cursor-default" : "pointer-events-none"
      }`}
      onMouseEnter={hoverable ? handleEnter : undefined}
      onMouseLeave={hoverable ? handleLeave : undefined}
      onFocus={hoverable ? handleEnter : undefined}
      onBlur={hoverable ? handleLeave : undefined}
    >
      <div>
        <p className="font-display text-lg italic text-background/92 md:text-xl lg:text-3xl">
          {label}
        </p>
        <p className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-background/45 md:mt-1 md:text-xs">
          {sublabel}
        </p>
      </div>

      <div className="text-right">
        <p
          ref={valueRef}
          data-wedding-time
          className={valueClassName}
        >
          {time}
        </p>
        {note ? (
          <p className="mt-1.5 text-[10px] text-background/45 md:mt-2 md:text-xs">{note}</p>
        ) : null}
      </div>
    </div>
  );
}

export function WeddingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const dateValueRef = useRef<HTMLParagraphElement>(null);
  const ceremonyRef = useRef<HTMLDivElement>(null);
  const receptionRef = useRef<HTMLDivElement>(null);
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
    const dateValue = dateValueRef.current;
    const ceremony = ceremonyRef.current;
    const reception = receptionRef.current;
    const venue = venueRef.current;

    if (
      !section ||
      !dateValue ||
      !ceremony ||
      !reception ||
      !venue
    ) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const scroller = getScroller();

    gsap.set(dateValue, { x: 50, autoAlpha: 0, letterSpacing: "0.18em" });
    gsap.set([ceremony, reception, venue], { y: 28, autoAlpha: 0 });

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
      .to(dateValue, {
        x: 0,
        autoAlpha: 1,
        letterSpacing: "0.02em",
        duration: 0.9,
        ease: "power3.out",
      })
      .to(
        ceremony,
        { y: 0, autoAlpha: 1, duration: 0.75, ease: "power3.out" },
        "-=0.35",
      )
      .to(
        reception,
        { y: 0, autoAlpha: 1, duration: 0.75, ease: "power3.out" },
        "-=0.45",
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
        className="relative flex h-dvh min-h-dvh flex-col overflow-hidden bg-[#0a0a0a] text-background"
      >
        <div
          className={`mx-auto flex h-full w-full max-w-7xl flex-col justify-between pt-4 pb-[calc(1.25rem+var(--section-nav-height,0px))] md:pt-6 md:pb-[calc(1.75rem+var(--section-nav-height,0px))] lg:pt-8 lg:pb-[calc(2.5rem+var(--section-nav-height,0px))] ${CONTENT_INSET}`}
        >
          <div className="flex min-h-0 flex-1 flex-col justify-center">
            <ScheduleRow
              hoverable={false}
              variant="date"
              dataAttr="day"
              label="Day"
              sublabel="Ngày cưới"
              time={WEDDING.date}
              valueRef={dateValueRef}
            />

            <div ref={ceremonyRef}>
              <ScheduleRow
                hoverable
                dataAttr="ceremony"
                label={WEDDING.ceremony.label}
                sublabel={WEDDING.ceremony.sublabel}
                time={WEDDING.ceremony.time}
                note={WEDDING.ceremony.note}
              />
            </div>

            <div ref={receptionRef}>
              <ScheduleRow
                hoverable
                dataAttr="reception"
                label={WEDDING.reception.label}
                sublabel={WEDDING.reception.sublabel}
                time={WEDDING.reception.time}
                note={WEDDING.reception.note}
              />
            </div>
          </div>

          <div
            ref={venueRef}
            className="grid shrink-0 grid-cols-[minmax(0,1fr)_minmax(0,100px)] items-end gap-4 pt-4 md:gap-6 md:pt-5 lg:pt-8"
          >
            <div className="">
              <h3 className="font-display text-[clamp(1.25rem,3.2vw,2.5rem)] leading-tight text-background">
                {WEDDING.venue.name}
              </h3>
              <p className="mt-1.5 text-sm text-background/58 md:mt-2 md:text-base">
                {WEDDING.venue.address}
              </p>
              <div className="mt-3 flex flex-wrap gap-3 md:mt-5">
                <button
                  type="button"
                  onClick={() => setMapsOpen(true)}
                  className="cursor-pointer border border-background/45 px-4 py-2 text-xs uppercase tracking-[0.22em] text-background/88 transition-[color,border-color,background-color] duration-300 hover:border-background hover:bg-background/8 hover:text-background"
                >
                  Xem bản đồ
                </button>
                <a
                  href={WEDDING.venue.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center border border-transparent px-2 py-2 text-xs uppercase tracking-[0.18em] text-background/50 transition-colors hover:text-background/80"
                >
                  Google Maps
                </a>
              </div>
            </div>

            <div className="text-right">
              <p className="font-display text-lg italic text-background/92 md:text-xl lg:text-3xl">
                Place
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-background/45 md:text-xs">
                Địa điểm
              </p>
            </div>
          </div>
        </div>
      </section>

      <MapsModal
        open={mapsOpen}
        onClose={() => setMapsOpen(false)}
        mapsQuery={WEDDING.venue.mapsQuery}
        mapsUrl={WEDDING.venue.mapsUrl}
      />
    </>
  );
}
