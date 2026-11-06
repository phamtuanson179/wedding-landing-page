"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  getScroller,
  setCornerNavColor,
  setGalleryChromeVisible,
} from "@/lib/scroll/cornerNav";
import { ALBUM_PHOTOS, type AlbumPhoto } from "./albumPhotos";

gsap.registerPlugin(ScrollTrigger);

export function GallerySection({
  photos = ALBUM_PHOTOS,
}: {
  photos?: AlbumPhoto[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const thumbTrackRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStartXRef = useRef<number | null>(null);

  const totalPhotos = photos.length;
  const currentPhoto = photos[activeIndex] ?? photos[0];

  const goToPhoto = useCallback(
    (index: number) => {
      const nextIndex = (index + totalPhotos) % totalPhotos;
      setActiveIndex(nextIndex);
    },
    [totalPhotos],
  );

  const prevPhoto = useCallback(() => {
    goToPhoto(activeIndex - 1);
  }, [activeIndex, goToPhoto]);

  const nextPhoto = useCallback(() => {
    goToPhoto(activeIndex + 1);
  }, [activeIndex, goToPhoto]);

  // Sync active thumbnail scroll position into center of view
  useEffect(() => {
    const activeThumb = thumbRefs.current[activeIndex];
    if (activeThumb && thumbTrackRef.current) {
      activeThumb.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeIndex]);

  // Corner chrome sync: hide the 4-corner fixed chrome while in Album section
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const checkInitial = () => {
      const rect = section.getBoundingClientRect();
      if (
        rect.top <= window.innerHeight * 0.65 &&
        rect.bottom >= window.innerHeight * 0.35
      ) {
        setGalleryChromeVisible(false);
      }
    };
    checkInitial();

    const scroller = getScroller();
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top 65%",
      end: "bottom 35%",
      scroller,
      onEnter: () => {
        setCornerNavColor("hero");
        setGalleryChromeVisible(false);
      },
      onEnterBack: () => {
        setCornerNavColor("hero");
        setGalleryChromeVisible(false);
      },
      onLeave: () => {
        setGalleryChromeVisible(true);
      },
      onLeaveBack: () => {
        setCornerNavColor("hero");
        setGalleryChromeVisible(true);
      },
    });

    return () => {
      trigger.kill();
      setGalleryChromeVisible(true);
    };
  }, []);

  // Keyboard navigation (ArrowLeft & ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        prevPhoto();
      } else if (e.key === "ArrowRight") {
        nextPhoto();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevPhoto, nextPhoto]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartXRef.current;
    touchStartXRef.current = null;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        prevPhoto();
      } else {
        nextPhoto();
      }
    }
  };

  return (
    <section
      id="section-4"
      ref={sectionRef}
      className="relative flex min-h-screen h-dvh w-full flex-col justify-between overflow-hidden bg-background px-5 pt-4 pb-[calc(var(--section-nav-height,0px)+0.75rem)] text-foreground sm:px-8 sm:pt-5 md:px-12 md:pt-6 lg:px-16 lg:pt-6 select-none"
      aria-label="Album ảnh cưới"
    >
      {/* 1. Header & Counter */}
      <header className="flex shrink-0 items-baseline justify-between border-b border-foreground/10 pb-2 sm:pb-3 items-center">
        <div>
          <span className="mb-0.5 block font-sans text-[10px] uppercase tracking-[0.28em] text-foreground/50 md:text-[11px] md:tracking-[0.32em]">
            Gallery Archive
          </span>
          <h2 className="font-display text-2xl italic tracking-[0.02em] sm:text-3xl md:text-4xl lg:text-[2.65rem]">
            Album Cưới
          </h2>
        </div>

        {/* Counter & Navigation Controls */}
        <div className="flex items-center gap-3 md:gap-5">
          <div className="font-mono text-xs tracking-widest text-foreground/70 sm:text-sm">
            <span className="font-semibold text-[#7B1E28]">
              {String(activeIndex + 1).padStart(2, "0")}
            </span>{" "}
            / {String(totalPhotos).padStart(2, "0")}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevPhoto}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-foreground/15 text-foreground/75 transition-colors hover:border-foreground/35 hover:bg-foreground/5 hover:text-foreground active:scale-95 sm:h-8 sm:w-8"
              aria-label="Ảnh trước"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={nextPhoto}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-foreground/15 text-foreground/75 transition-colors hover:border-foreground/35 hover:bg-foreground/5 hover:text-foreground active:scale-95 sm:h-8 sm:w-8"
              aria-label="Ảnh tiếp theo"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Showcase Frame (Trung tâm) - Phóng to 58vh - 64vh */}
      <div
        className="relative my-1 flex min-h-0 flex-1 flex-col items-center justify-center sm:my-1.5 md:my-2"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Photo Container with fine-art mat board frame */}
        <div className="relative flex max-h-[58vh] sm:max-h-[62vh] md:max-h-[66vh] lg:max-h-[68vh] max-w-full items-center justify-center overflow-hidden rounded-xs border border-foreground/12 bg-white/70 p-1.5 shadow-[0_16px_50px_rgba(44,39,37,0.08)] sm:p-2 md:p-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={currentPhoto.id}
            src={currentPhoto.src}
            alt={currentPhoto.alt}
            className="gallery-showcase-img max-h-[54vh] sm:max-h-[58vh] md:max-h-[62vh] lg:max-h-[64vh] max-w-full w-auto h-auto object-contain"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* Caption */}
        {currentPhoto.caption && (
          <p
            key={`caption-${currentPhoto.id}`}
            className="mt-1.5 max-w-xl px-4 text-center font-display text-[11px] italic tracking-wide text-foreground/75 sm:mt-2 sm:text-xs md:text-[13px]"
          >
            {currentPhoto.caption}
          </p>
        )}
      </div>

      {/* 3. Bottom Thumbnail Carousel - Kích thước gọn gàng 56-60px */}
      <div className="w-full shrink-0 pt-0.5 pb-0.5">
        <div
          ref={thumbTrackRef}
          className="no-scrollbar flex items-center gap-2 overflow-x-auto py-1 sm:gap-2.5 md:gap-3"
        >
          {photos.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={item.id}
                ref={(el) => {
                  thumbRefs.current[index] = el;
                }}
                type="button"
                onClick={() => goToPhoto(index)}
                aria-label={`Xem ảnh ${index + 1}: ${item.alt}`}
                aria-current={isActive ? "true" : undefined}
                className={`group relative h-12 sm:h-13 md:h-[58px] aspect-[3/2] shrink-0 overflow-hidden rounded-xs transition-all duration-300 focus:outline-none ${
                  isActive
                    ? "opacity-100 ring-1.5 md:ring-2 ring-[#7B1E28] ring-offset-2 ring-offset-background scale-105 shadow-sm"
                    : "opacity-45 hover:opacity-85 hover:scale-102"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
