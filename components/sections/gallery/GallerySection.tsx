"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getScroller, setCornerNavColor } from "@/lib/scroll/cornerNav";
import { ALBUM_PHOTOS, type AlbumPhoto } from "./albumPhotos";
import { FILM_PHOTOS, type FilmPhoto } from "./filmPhotos";

gsap.registerPlugin(ScrollTrigger);

type AnyGalleryItem = {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  badge?: string;
  aspect?: "2/3" | "3/4" | "3/2" | "1/1" | "16/9" | "4/5";
};

interface LightboxModalProps {
  items: AnyGalleryItem[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

function LightboxModal({
  items,
  currentIndex,
  onClose,
  onNavigate,
}: LightboxModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);

  const isOpen = currentIndex !== null;
  const currentItem = isOpen ? items[currentIndex] : null;
  const total = items.length;

  const next = useCallback(() => {
    if (currentIndex === null) return;
    onNavigate((currentIndex + 1) % total);
  }, [currentIndex, onNavigate, total]);

  const prev = useCallback(() => {
    if (currentIndex === null) return;
    onNavigate((currentIndex - 1 + total) % total);
  }, [currentIndex, onNavigate, total]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, next, prev]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) next();
      else prev();
    }
    touchStartXRef.current = null;
  };

  if (!isOpen || !currentItem || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-6 md:p-10"
      role="dialog"
      aria-modal="true"
      aria-label="Xem chi tiết ảnh"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Đóng ảnh"
        onClick={onClose}
        className="absolute inset-0 bg-black/92 backdrop-blur-md cursor-pointer transition-opacity"
      />

      {/* Main Container */}
      <div
        ref={panelRef}
        className="relative z-10 flex h-full max-h-[92vh] w-full max-w-6xl flex-col items-center justify-between"
      >
        {/* Top Bar */}
        <div className="flex w-full items-center justify-between px-2 py-2 text-white/80">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            {currentItem.badge && (
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#d4b87a] bg-[#d4b87a]/15 px-2 py-0.5 rounded-xs border border-[#d4b87a]/30">
                {currentItem.badge}
              </span>
            )}
            <span className="font-display italic text-xs sm:text-sm text-white/90 truncate">
              {currentItem.caption || currentItem.alt}
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0 font-sans">
            <span className="text-xs uppercase tracking-[0.2em] text-white/60 font-light">
              <strong className="font-semibold text-white">
                {String(currentIndex + 1).padStart(2, "0")}
              </strong>{" "}
              / {String(total).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="cursor-pointer text-sm uppercase tracking-[0.16em] text-white/70 hover:text-white p-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Image Frame */}
        <div
          className="relative flex flex-1 w-full items-center justify-center overflow-hidden my-2"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={currentItem.id}
            src={currentItem.src}
            alt={currentItem.alt}
            className="max-h-[80vh] max-w-full w-auto h-auto object-contain select-none rounded-xs shadow-2xl"
          />

          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={prev}
            aria-label="Ảnh trước"
            className="cursor-pointer absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/40 text-white/85 hover:bg-black/70 hover:text-white backdrop-blur-xs transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={next}
            aria-label="Ảnh tiếp theo"
            className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/40 text-white/85 hover:bg-black/70 hover:text-white backdrop-blur-xs transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Bottom hint */}
        <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-sans pb-1 hidden sm:block">
          Dùng phím mũi tên ← → hoặc vuốt để xem ảnh tiếp theo
        </p>
      </div>
    </div>,
    document.body,
  );
}

export function GallerySection({
  photos = ALBUM_PHOTOS,
  filmPhotos = FILM_PHOTOS,
}: {
  photos?: AlbumPhoto[];
  filmPhotos?: FilmPhoto[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const digitalRef = useRef<HTMLDivElement>(null);
  const filmSectionRef = useRef<HTMLDivElement>(null);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Sync corner nav chrome color
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const scroller = getScroller();
    const chromeTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top 30%",
      end: "bottom 30%",
      scroller,
      invalidateOnRefresh: true,
      onEnter: () => setCornerNavColor("accent"),
      onEnterBack: () => setCornerNavColor("accent"),
      onLeaveBack: () => setCornerNavColor("hero"),
    });

    const filmEl = filmSectionRef.current;
    let filmTrigger: ScrollTrigger | null = null;
    if (filmEl) {
      filmTrigger = ScrollTrigger.create({
        trigger: filmEl,
        start: "top 35%",
        end: "bottom 35%",
        scroller,
        invalidateOnRefresh: true,
        onEnter: () => setCornerNavColor("hero"),
        onEnterBack: () => setCornerNavColor("hero"),
        onLeaveBack: () => setCornerNavColor("accent"),
      });
    }

    return () => {
      chromeTrigger.kill();
      filmTrigger?.kill();
    };
  }, []);

  // 3 Lighting Milestones for Digital Editorial
  const ASPECT_CLASS_MAP: Record<string, string> = {
    "3/2": "aspect-[3/2]",
    "3/4": "aspect-[3/4]",
    "1/1": "aspect-square",
    "16/9": "aspect-video",
    "4/5": "aspect-[4/5]",
  };

  // Chapter 1: Bóng râm & Khởi đầu (12 in grid + 1 closing highlight = 13 photos)
  const m1Grid = photos.slice(0, 12);
  const m1Highlight = photos[12];

  // Chapter 2: Nắng lên & Tà voan bay (12 in grid + 1 closing highlight = 13 photos)
  const m2Grid = photos.slice(13, 25);
  const m2Highlight = photos[25];

  // Chapter 3: Nắng cuối chiều vàng / Hoàng hôn (12 in grid + 1 closing highlight = 13 photos)
  const m3Grid = photos.slice(26, 38);
  const m3Highlight = photos[38];

  const digitalPhotos = [
    ...m1Grid,
    ...(m1Highlight ? [m1Highlight] : []),
    ...m2Grid,
    ...(m2Highlight ? [m2Highlight] : []),
    ...m3Grid,
    ...(m3Highlight ? [m3Highlight] : []),
  ];

  // Prepare combined flat list for lightbox navigation (39 digital + 32 film = 71 items)
  const allItems: AnyGalleryItem[] = [
    ...digitalPhotos.map((p) => ({
      id: p.id,
      src: p.src,
      alt: p.alt,
      caption: p.caption,
      badge: "DIGITAL",
      aspect: p.aspect,
    })),
    ...filmPhotos.map((f) => ({
      id: f.id,
      src: f.src,
      alt: f.alt,
      caption: f.caption,
      badge: `35MM · ${f.frameCode}`,
      aspect: f.aspect ?? ("2/3" as const),
    })),
  ];

  const openLightbox = useCallback((globalIndex: number) => {
    setLightboxIndex(globalIndex);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const scrollToPart = (target: "digital" | "film") => {
    const el = target === "digital" ? digitalRef.current : filmSectionRef.current;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <section
        id="section-4"
        ref={sectionRef}
        className="relative w-full bg-background text-foreground"
      >
        {/* ========================================================================= */}
        {/* 1. EDITORIAL HEADER & FLAT TEXT SWITCHER                                  */}
        {/* ========================================================================= */}
        <header className="mx-auto max-w-3xl px-6 text-center pt-20 pb-12 sm:pt-28 sm:pb-16 md:pt-32 md:pb-20">
          <h2 className="font-display italic text-4xl sm:text-5xl md:text-6xl text-foreground tracking-tight">
            Album Cưới
          </h2>
          <div className="mx-auto mt-4 h-px w-10 bg-foreground/20" />

          {/* Clean Flat Editorial Text Switcher (NO pill rounded-full, NO filter count) */}
          <div className="mt-7 flex items-center justify-center gap-6 font-sans text-xs tracking-[0.24em] uppercase">
            <button
              type="button"
              onClick={() => scrollToPart("digital")}
              className="cursor-pointer group relative py-1 text-foreground transition-colors hover:text-primary font-medium"
            >
              <span className="border-b border-foreground pb-1 transition-colors group-hover:border-primary">
                Bản Kỹ Thuật Số
              </span>
            </button>
            <span className="text-foreground/25 font-light">/</span>
            <button
              type="button"
              onClick={() => scrollToPart("film")}
              className="cursor-pointer group relative py-1 text-foreground/50 transition-colors hover:text-foreground font-medium"
            >
              <span className="border-b border-transparent pb-1 transition-colors group-hover:border-foreground/50">
                Phim 35mm
              </span>
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* PART I: THE DIGITAL EDITORIAL (36 PHOTOS — 3 CHAPTERS × 12 PHOTOS)       */}
        {/* ========================================================================= */}
        <div ref={digitalRef} className="pb-16 sm:pb-24 md:pb-28">
          {/* ----------------------------------------------------------------------- */}
          {/* CHƯƠNG 1: BÓNG RÂM & KHỞI ĐẦU (12 ẢNH LƯỚI + 1 ẢNH HIGHLIGHT)           */}
          {/* ----------------------------------------------------------------------- */}
          <div className="w-full mb-16 sm:mb-20 md:mb-24">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 mb-4 sm:mb-6 flex items-center justify-between text-[11px] font-sans uppercase tracking-[0.24em] text-foreground/60">
              <span>01 · BÓNG RÂM &amp; KHỞI ĐẦU</span>
              <span className="font-display italic lowercase text-foreground/40 text-xs hidden sm:inline">
                the quiet morning
              </span>
            </div>

            {/* 12-photo 2/3 column grid */}
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3.5 md:gap-5">
                {m1Grid.map((photo, i) => (
                  <div
                    key={photo.id}
                    onClick={() => openLightbox(i)}
                    className="group relative w-full aspect-[3/4] cursor-pointer overflow-hidden rounded-xs bg-foreground/5 border border-foreground/10 shadow-[0_4px_16px_rgba(44,39,37,0.04)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/15" />
                  </div>
                ))}
              </div>
            </div>

            {/* Chapter 1: Closing Highlight Shot */}
            {m1Highlight && (
              <div className="mx-auto max-w-3xl md:max-w-4xl px-4 sm:px-6 mt-4 sm:mt-6">
                <div
                  onClick={() => openLightbox(12)}
                  className={`group relative w-full ${ASPECT_CLASS_MAP[m1Highlight.aspect ?? "3/4"] ?? "aspect-[3/4]"} cursor-pointer overflow-hidden rounded-xs bg-foreground/5 border border-foreground/10 shadow-[0_10px_30px_rgba(44,39,37,0.06)]`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m1Highlight.src}
                    alt={m1Highlight.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/15" />
                  <span className="absolute bottom-3 right-3 text-[9px] uppercase tracking-[0.16em] text-white/90 bg-black/50 px-2.5 py-1 rounded-xs backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    Phóng to ↗
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Interlude 01 */}
          <div className="my-16 sm:my-24 md:my-28 text-center px-6 max-w-xl mx-auto">
            <span className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-foreground/45 font-sans block mb-2.5 font-medium">
              INTERLUDE · 21°02&apos;N 105°50&apos;E
            </span>
            <blockquote className="font-display italic text-xl sm:text-2xl md:text-3xl text-foreground/85 leading-snug">
              “Dưới bóng cây xanh dịu mát, ta nhận ra khoảnh khắc đẹp nhất là khi có em kề bên.”
            </blockquote>
            <div className="mx-auto mt-6 h-px w-10 bg-foreground/20" />
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* CHƯƠNG 2: NẮNG LÊN & TÀ VOAN BAY (12 ẢNH LƯỚI + 1 ẢNH HIGHLIGHT)         */}
          {/* ----------------------------------------------------------------------- */}
          <div className="w-full mb-16 sm:mb-20 md:mb-24">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 mb-4 sm:mb-6 flex items-center justify-between text-[11px] font-sans uppercase tracking-[0.24em] text-foreground/60">
              <span>02 · NẮNG LÊN &amp; TÀ VOAN</span>
              <span className="font-display italic lowercase text-foreground/40 text-xs hidden sm:inline">
                under the veil
              </span>
            </div>

            {/* 12-photo 2/3 column grid */}
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3.5 md:gap-5">
                {m2Grid.map((photo, i) => (
                  <div
                    key={photo.id}
                    onClick={() => openLightbox(13 + i)}
                    className="group relative w-full aspect-[3/4] cursor-pointer overflow-hidden rounded-xs bg-foreground/5 border border-foreground/10 shadow-[0_4px_16px_rgba(44,39,37,0.04)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/15" />
                  </div>
                ))}
              </div>
            </div>

            {/* Chapter 2: Closing Highlight Shot */}
            {m2Highlight && (
              <div className="mx-auto max-w-3xl md:max-w-4xl px-4 sm:px-6 mt-4 sm:mt-6">
                <div
                  onClick={() => openLightbox(25)}
                  className={`group relative w-full ${ASPECT_CLASS_MAP[m2Highlight.aspect ?? "3/4"] ?? "aspect-[3/4]"} cursor-pointer overflow-hidden rounded-xs bg-foreground/5 border border-foreground/10 shadow-[0_10px_30px_rgba(44,39,37,0.06)]`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m2Highlight.src}
                    alt={m2Highlight.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/15" />
                  <span className="absolute bottom-3 right-3 text-[9px] uppercase tracking-[0.16em] text-white/90 bg-black/50 px-2.5 py-1 rounded-xs backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    Phóng to ↗
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Interlude 02 */}
          <div className="my-16 sm:my-24 md:my-28 text-center px-6 max-w-xl mx-auto">
            <span className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-foreground/45 font-sans block mb-2.5 font-medium">
              INTERLUDE · SUNLIT AFTERNOON
            </span>
            <blockquote className="font-display italic text-xl sm:text-2xl md:text-3xl text-foreground/85 leading-snug">
              “Nụ cười của em rạng rỡ như ánh nắng sớm, sưởi ấm mọi lối ta cùng qua.”
            </blockquote>
            <div className="mx-auto mt-6 h-px w-10 bg-foreground/20" />
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* CHƯƠNG 3: NẮNG CUỐI CHIỀU VÀNG (12 ẢNH LƯỚI + 1 ẢNH HIGHLIGHT)           */}
          {/* ----------------------------------------------------------------------- */}
          <div className="w-full">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 mb-4 sm:mb-6 flex items-center justify-between text-[11px] font-sans uppercase tracking-[0.24em] text-foreground/60">
              <span>03 · HOÀNG HÔN &amp; CHIỀU VÀNG</span>
              <span className="font-display italic lowercase text-foreground/40 text-xs hidden sm:inline">
                golden hour glow
              </span>
            </div>

            {/* 12-photo 2/3 column grid */}
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3.5 md:gap-5">
                {m3Grid.map((photo, i) => (
                  <div
                    key={photo.id}
                    onClick={() => openLightbox(26 + i)}
                    className="group relative w-full aspect-[3/4] cursor-pointer overflow-hidden rounded-xs bg-foreground/5 border border-foreground/10 shadow-[0_4px_16px_rgba(44,39,37,0.04)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/15" />
                  </div>
                ))}
              </div>
            </div>

            {/* Chapter 3: Closing Highlight Shot */}
            {m3Highlight && (
              <div className="mx-auto max-w-3xl md:max-w-4xl px-4 sm:px-6 mt-4 sm:mt-6">
                <div
                  onClick={() => openLightbox(38)}
                  className={`group relative w-full ${ASPECT_CLASS_MAP[m3Highlight.aspect ?? "3/4"] ?? "aspect-[3/4]"} cursor-pointer overflow-hidden rounded-xs bg-foreground/5 border border-foreground/10 shadow-[0_12px_36px_rgba(44,39,37,0.07)]`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m3Highlight.src}
                    alt={m3Highlight.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/15" />
                  <span className="absolute bottom-3 right-3 text-[9px] uppercase tracking-[0.16em] text-white/90 bg-black/50 px-2.5 py-1 rounded-xs backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    Phóng to ↗
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Interlude 03 */}
          <div className="mt-16 sm:mt-24 md:mt-28 mb-4 text-center px-6 max-w-xl mx-auto">
            <span className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-foreground/45 font-sans block mb-2.5 font-medium">
              INTERLUDE · GOLDEN HOUR
            </span>
            <blockquote className="font-display italic text-xl sm:text-2xl md:text-3xl text-foreground/85 leading-snug">
              “Khi hoàng hôn buông xuống, tình yêu không chỉ là lời hứa, mà là cả một hành trình.”
            </blockquote>
            <div className="mx-auto mt-6 h-px w-10 bg-foreground/20" />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PART II: THE 35MM FILM ARCHIVE (32 FILM PHOTOS) - VISUAL SHIFT            */}
        {/* ========================================================================= */}
        <div
          ref={filmSectionRef}
          className="relative w-full bg-[#18201A] text-[#E6DFD3] pt-20 pb-28 px-4 sm:px-6 md:px-12 border-t border-foreground/15"
        >
          {/* Visual Shift Header */}
          <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-14">
            <span className="text-[10px] sm:text-[11px] tracking-[0.28em] uppercase text-[#d4b87a] font-sans block mb-2 font-medium">
              35MM FILM ARCHIVE
            </span>
            <h3 className="font-display italic text-3xl sm:text-4xl text-white tracking-tight">
              Cuộn Phim 35mm
            </h3>
            <div className="mx-auto mt-3 h-px w-10 bg-[#d4b87a]/30" />
            <p className="mt-3 font-sans text-[11px] tracking-[0.2em] uppercase text-white/50">
              KODAK COLORPLUS 200 · CONTACT SHEET
            </p>
          </div>

          {/* 35mm Contact Sheet / Proof Sheet Grid (32 frames) */}
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4.5">
              {filmPhotos.map((film, index) => {
                const globalIdx = digitalPhotos.length + index;
                return (
                  <div
                    key={film.id}
                    onClick={() => openLightbox(globalIdx)}
                    className="group relative cursor-pointer overflow-hidden rounded-xs bg-[#111612] border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition-all duration-300 hover:border-[#d4b87a]/50 hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
                  >
                    {/* Film Frame Header: Negative Frame Number */}
                    <div className="flex items-center justify-between px-2 py-1 bg-black/60 border-b border-white/5 font-mono text-[8.5px] tracking-wider text-[#d4b87a]/85">
                      <span>KODAK 35</span>
                      <span>· {film.frameCode} ·</span>
                    </div>

                    {/* Film Photo Frame: exact 1082:1600 scan ratio + object-contain so scanner white borders never clip */}
                    <div className="relative w-full aspect-[1082/1600] overflow-hidden bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={film.src}
                        alt={film.alt}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/15" />
                    </div>

                    {/* Frame Footer bar */}
                    <div className="flex items-center justify-between px-2 py-0.5 bg-black/60 border-t border-white/5 font-mono text-[7.5px] uppercase tracking-widest text-white/35">
                      <span>35MM FILM</span>
                      <span className="group-hover:text-[#d4b87a] transition-colors">VIEW ↗</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Finale Footer */}
          <footer className="mt-20 sm:mt-24 text-center">
            <span className="text-[10px] tracking-[0.3em] uppercase text-white/40 font-mono block mb-1.5">
              TOTAL {allItems.length} FRAMES · FIN
            </span>
            <p className="font-display italic text-sm sm:text-base text-white/70">
              Sơn &amp; Linh — Hà Nội, 2026
            </p>
          </footer>
        </div>
      </section>

      {/* Lightbox Modal for High-Res Detail Viewing */}
      <LightboxModal
        items={allItems}
        currentIndex={lightboxIndex}
        onClose={closeLightbox}
        onNavigate={setLightboxIndex}
      />
    </>
  );
}
