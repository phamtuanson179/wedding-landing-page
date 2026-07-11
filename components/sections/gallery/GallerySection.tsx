"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { whenPreloaderComplete } from "@/lib/preloader/preloaderState";
import {
  getScroller,
  isMobileViewport,
  setGalleryChromeVisible,
  shouldUseGallerySkew,
  shouldUsePinnedGallery,
} from "@/lib/scroll/cornerNav";
import {
  FRAME_GAP,
  GALLERY_ROWS,
  ROW_GAP,
  getFrameGap,
  getFrameLabel,
  getRowGap,
  getLoopPhotos,
  getPhotoSize,
  getRowHeight,
  getSectionViewportHeight,
  type FilmstripPhoto,
  type GalleryRowConfig,
} from "./filmstripPhotos";

gsap.registerPlugin(ScrollTrigger);

const SSR_ROW_HEIGHT = 200;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function animateLightboxOpen(
  backdrop: HTMLElement,
  backdropImage: HTMLElement,
  panel: HTMLElement,
  reducedMotion: boolean,
) {
  if (reducedMotion) {
    gsap.set(backdrop, { autoAlpha: 1 });
    gsap.set(backdropImage, { scale: 1.05 });
    gsap.set(panel, { autoAlpha: 1, y: 0, scale: 1 });
    return null;
  }

  gsap.set(backdrop, { autoAlpha: 0 });
  gsap.set(backdropImage, { scale: 1.14 });
  gsap.set(panel, { autoAlpha: 0, y: 20, scale: 0.95 });

  return gsap
    .timeline()
    .to(backdrop, {
      autoAlpha: 1,
      duration: 0.6,
      ease: "power2.out",
    })
    .to(
      backdropImage,
      {
        scale: 1.05,
        duration: 0.95,
        ease: "power2.out",
      },
      0,
    )
    .to(
      panel,
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.78,
        ease: "power3.out",
      },
      "-=0.42",
    );
}

function animateLightboxClose(
  backdrop: HTMLElement,
  backdropImage: HTMLElement,
  panel: HTMLElement,
  reducedMotion: boolean,
  onComplete: () => void,
) {
  if (reducedMotion) {
    gsap.set([backdrop, panel], { autoAlpha: 0 });
    gsap.set(backdropImage, { scale: 1.05 });
    onComplete();
    return null;
  }

  return gsap
    .timeline({ onComplete })
    .to(panel, {
      autoAlpha: 0,
      y: 14,
      scale: 0.97,
      duration: 0.42,
      ease: "power2.inOut",
    })
    .to(
      backdropImage,
      {
        scale: 1.1,
        duration: 0.48,
        ease: "power2.inOut",
      },
      "-=0.18",
    )
    .to(
      backdrop,
      {
        autoAlpha: 0,
        duration: 0.5,
        ease: "power2.inOut",
      },
      "-=0.28",
    );
}

function resetPhotoHover(item: HTMLElement) {
  gsap.to(item, {
    scale: 1,
    duration: 0.5,
    ease: "power2.out",
    overwrite: true,
  });
}

function highlightPhoto(item: HTMLElement) {
  gsap.to(item, {
    scale: 1.05,
    duration: 0.5,
    ease: "power2.out",
    overwrite: true,
  });
}

function GalleryPhoto({
  photo,
  rowHeight,
  photoIndex,
  filmStock,
  onSelect,
}: {
  photo: FilmstripPhoto;
  rowHeight: number;
  photoIndex: number;
  filmStock: string;
  onSelect: (photo: FilmstripPhoto) => void;
}) {
  const itemRef = useRef<HTMLDivElement>(null);
  const { width } = getPhotoSize(photo.aspect, rowHeight);

  return (
    <div className="filmstrip-frame" style={{ width, height: rowHeight }}>
      <span className="filmstrip-frame__code filmstrip-frame__code--top">
        {getFrameLabel(photoIndex)}
      </span>

      <button
        type="button"
        aria-label={`Xem ảnh: ${photo.alt}`}
        className="filmstrip-frame__trigger"
        style={{ width, height: rowHeight }}
        onMouseEnter={() => {
          if (itemRef.current) {
            highlightPhoto(itemRef.current);
          }
        }}
        onMouseLeave={() => {
          if (itemRef.current) {
            resetPhotoHover(itemRef.current);
          }
        }}
        onFocus={() => {
          if (itemRef.current) {
            highlightPhoto(itemRef.current);
          }
        }}
        onBlur={() => {
          if (itemRef.current) {
            resetPhotoHover(itemRef.current);
          }
        }}
        onClick={() => onSelect(photo)}
      >
        <div
          ref={itemRef}
          data-gallery-photo-item
          className="filmstrip-frame__aperture"
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            loading="eager"
            sizes="(max-width: 768px) 38vw, 28vw"
            className="object-cover"
            draggable={false}
          />
        </div>
      </button>

      <span className="filmstrip-frame__code filmstrip-frame__code--bottom">
        {filmStock}
      </span>
    </div>
  );
}

function FilmstripRow({
  row,
  rowHeight,
  frameGap,
  onSelect,
  looped = true,
  withOffset = true,
}: {
  row: GalleryRowConfig;
  rowHeight: number;
  frameGap: number;
  onSelect: (photo: FilmstripPhoto) => void;
  looped?: boolean;
  withOffset?: boolean;
}) {
  const photos = looped ? getLoopPhotos(row.photos) : row.photos;

  return (
    <div className="filmstrip-row overflow-hidden" data-filmstrip-row>
      <div
        data-gallery-track
        className={`filmstrip-row__track ${withOffset ? row.offsetClass : ""}`}
        style={{ gap: frameGap, height: rowHeight }}
      >
        {photos.map((photo, index) => (
          <GalleryPhoto
            key={photo.id}
            photo={photo}
            rowHeight={rowHeight}
            photoIndex={index % row.photos.length}
            filmStock={row.filmStock}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

function GalleryFallback({
  sectionRef,
  stackRef,
  rowHeight,
  frameGap,
  rowGap,
  onSelect,
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
  stackRef: React.RefObject<HTMLDivElement | null>;
  rowHeight: number;
  frameGap: number;
  rowGap: number;
  onSelect: (photo: FilmstripPhoto) => void;
}) {
  return (
    <section
      id="section-4"
      ref={sectionRef}
      data-gallery-section
      className="relative flex h-dvh min-h-dvh flex-col overflow-hidden bg-background text-foreground pb-[var(--section-nav-height,0px)]"
      aria-label="Gallery ảnh cưới"
    >
      <header
        data-gallery-header
        className="w-full shrink-0 px-6 pt-10 md:px-16"
      >
        <p className="text-[10px] uppercase tracking-[0.32em] text-foreground/45">
          Gallery
        </p>
        <h2 className="mt-3 font-display text-4xl tracking-[0.08em] md:text-5xl">
          Album cưới
        </h2>
      </header>

      <div
        ref={stackRef}
        className="mt-1 flex min-h-0 flex-1 flex-col justify-end overflow-hidden pb-1 md:mt-4 md:pb-4"
        style={{ gap: rowGap }}
      >
        {GALLERY_ROWS.map((row) => (
          <FilmstripRow
            key={row.id}
            row={row}
            rowHeight={rowHeight}
            frameGap={frameGap}
            onSelect={onSelect}
            looped
            withOffset={false}
          />
        ))}
      </div>
    </section>
  );
}

function GalleryLightboxPortal({
  photo,
  lightboxRef,
  backdropImageRef,
  panelRef,
  onClose,
}: {
  photo: FilmstripPhoto;
  lightboxRef: React.RefObject<HTMLDivElement | null>;
  backdropImageRef: React.RefObject<HTMLDivElement | null>;
  panelRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      ref={lightboxRef}
      className="fixed inset-0 z-[80] overflow-hidden"
      style={{ opacity: 0, visibility: "hidden" }}
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh phóng to"
      onClick={onClose}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          ref={backdropImageRef}
          className="absolute inset-[-12%] origin-center will-change-transform"
        >
          <Image
            src={photo.src}
            alt=""
            fill
            sizes="100vw"
            className="object-cover blur-xl md:blur-2xl"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-black/45" />
      </div>

      <div className="relative flex h-full items-center justify-center p-5 md:p-10">
        <div
          ref={panelRef}
          className="relative w-full max-w-5xl will-change-transform"
          onClick={(event) => event.stopPropagation()}
          onDoubleClick={onClose}
        >
          <button
            type="button"
            aria-label="Đóng ảnh"
            onClick={onClose}
            className="absolute -top-11 right-0 z-10 cursor-pointer text-[10px] uppercase tracking-[0.22em] text-background/80 transition-colors hover:text-background md:-top-12"
          >
            Đóng
          </button>

          <div className="relative mx-auto h-[min(72vh,40rem)] w-full max-w-4xl overflow-hidden shadow-[0_28px_80px_rgba(0,0,0,0.38)] md:h-[min(80vh,44rem)]">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 768px) 100vw, 1024px"
              className="object-cover"
              priority
            />
          </div>

          <p className="mt-4 text-center text-[10px] uppercase tracking-[0.2em] text-background/60">
            Click ngoài hoặc double-click để đóng
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function syncGalleryChrome(active: boolean) {
  setGalleryChromeVisible(!active);
}

function getTrackDistance(track: HTMLElement) {
  return Math.max(track.scrollWidth - window.innerWidth, 0);
}

function waitForGalleryImages(section: HTMLElement) {
  const images = Array.from(section.querySelectorAll("img"));
  if (images.length === 0) {
    return Promise.resolve();
  }

  const imageWaits = images.map(
    (image) =>
      new Promise<void>((resolve) => {
        if (image.complete) {
          resolve();
          return;
        }

        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      }),
  );

  return Promise.race([
    Promise.all(imageWaits),
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, 400);
    }),
  ]);
}

export function GallerySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const lightboxBackdropImageRef = useRef<HTMLDivElement>(null);
  const lightboxPanelRef = useRef<HTMLDivElement>(null);
  const lightboxTweenRef = useRef<gsap.core.Timeline | null>(null);

  const [useSimpleGallery] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return !shouldUsePinnedGallery();
  });

  const [rowHeight, setRowHeight] = useState(SSR_ROW_HEIGHT);
  const [frameGap, setFrameGap] = useState(FRAME_GAP);
  const [rowGap, setRowGap] = useState(ROW_GAP);
  const [isReady, setIsReady] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<FilmstripPhoto | null>(null);

  useLayoutEffect(() => {
    const updateGalleryMetrics = () => {
      const nextFrameGap = getFrameGap();
      const nextRowGap = getRowGap();
      setFrameGap(nextFrameGap);
      setRowGap(nextRowGap);

      const stack = stackRef.current;
      const measured =
        stack && isMobileViewport() ? stack.clientHeight : undefined;
      setRowHeight(getRowHeight(measured));
    };

    updateGalleryMetrics();
    setIsReady(true);

    const raf = window.requestAnimationFrame(updateGalleryMetrics);
    const stack = stackRef.current;
    const resizeObserver =
      stack && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateGalleryMetrics)
        : null;
    resizeObserver?.observe(stack);

    window.addEventListener("resize", updateGalleryMetrics);
    window.addEventListener("sectionnav:height", updateGalleryMetrics);
    return () => {
      window.cancelAnimationFrame(raf);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateGalleryMetrics);
      window.removeEventListener("sectionnav:height", updateGalleryMetrics);
    };
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || !isReady) {
      return;
    }

    const scroller = getScroller();
    let chromeTrigger: ScrollTrigger | undefined;
    let scrollTimeline: gsap.core.Timeline | undefined;
    let skewResetTimer: number | undefined;
    let cancelled = false;
    const revealTriggers: ScrollTrigger[] = [];
    const marqueeTweens: gsap.core.Tween[] = [];

    const cleanup = () => {
      if (skewResetTimer) {
        window.clearTimeout(skewResetTimer);
      }

      chromeTrigger?.kill();
      scrollTimeline?.scrollTrigger?.kill();
      scrollTimeline?.kill();
      revealTriggers.forEach((trigger) => trigger.kill());
      revealTriggers.length = 0;
      marqueeTweens.forEach((tween) => tween.kill());
      marqueeTweens.length = 0;
      chromeTrigger = undefined;
      scrollTimeline = undefined;

      section
        .querySelectorAll<HTMLElement>(
          "[data-gallery-photo-item], [data-filmstrip-row], [data-gallery-header], [data-gallery-track]",
        )
        .forEach((item) => {
          gsap.set(item, {
            clearProps: "skewX,y,x,transform,opacity,visibility,clipPath",
          });
        });

      section
        .querySelectorAll<HTMLElement>("[data-gallery-photo-item] img")
        .forEach((img) => {
          gsap.set(img, { clearProps: "transform" });
        });
    };

    const setupMobileMarquee = async () => {
      const header = section.querySelector<HTMLElement>("[data-gallery-header]");
      const filmRows = Array.from(
        section.querySelectorAll<HTMLElement>("[data-filmstrip-row]"),
      );

      if (header && !prefersReducedMotion()) {
        gsap.set(header, { y: 22, autoAlpha: 0 });
        const headerTween = gsap.to(header, {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: header,
            start: "top 88%",
            toggleActions: "play none none reverse",
            scroller,
            invalidateOnRefresh: true,
          },
        });
        if (headerTween.scrollTrigger) {
          revealTriggers.push(headerTween.scrollTrigger);
        }
      }

      await waitForGalleryImages(section);
      if (cancelled) {
        return;
      }

      filmRows.forEach((rowEl, rowIndex) => {
        const row = GALLERY_ROWS[rowIndex];
        const track = rowEl.querySelector<HTMLElement>("[data-gallery-track]");
        if (!row || !track) {
          return;
        }

        if (!prefersReducedMotion()) {
          gsap.set(rowEl, { y: 16, autoAlpha: 0 });
          const rowReveal = gsap.to(rowEl, {
            y: 0,
            autoAlpha: 1,
            duration: 0.55,
            ease: "power2.out",
            scrollTrigger: {
              trigger: rowEl,
              start: "top 90%",
              toggleActions: "play none none reverse",
              scroller,
              invalidateOnRefresh: true,
            },
          });
          if (rowReveal.scrollTrigger) {
            revealTriggers.push(rowReveal.scrollTrigger);
          }
        }

        // Duplicated photos → half width is one seamless loop segment.
        const loopWidth = track.scrollWidth / 2;
        if (loopWidth <= 0) {
          return;
        }

        const pixelsPerSecond = 28 * row.speed;
        const duration = Math.max(loopWidth / pixelsPerSecond, 12);
        const movesLeft = row.direction === "left";

        gsap.set(track, {
          x: movesLeft ? 0 : -loopWidth,
          force3D: true,
        });

        if (prefersReducedMotion()) {
          return;
        }

        const marquee = gsap.to(track, {
          x: movesLeft ? -loopWidth : 0,
          duration,
          ease: "none",
          repeat: -1,
          force3D: true,
        });

        marqueeTweens.push(marquee);
      });

      const visibilityTrigger = ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scroller,
        invalidateOnRefresh: true,
        onEnter: () => marqueeTweens.forEach((tween) => tween.play()),
        onEnterBack: () => marqueeTweens.forEach((tween) => tween.play()),
        onLeave: () => marqueeTweens.forEach((tween) => tween.pause()),
        onLeaveBack: () => marqueeTweens.forEach((tween) => tween.pause()),
      });
      revealTriggers.push(visibilityTrigger);

      if (!visibilityTrigger.isActive) {
        marqueeTweens.forEach((tween) => tween.pause());
      }
    };

    const setup = async () => {
      if (cancelled) {
        return;
      }

      cleanup();

      if (useSimpleGallery) {
        chromeTrigger = ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scroller,
          invalidateOnRefresh: true,
          onToggle: (self) => syncGalleryChrome(self.isActive),
          onRefresh: (self) => syncGalleryChrome(self.isActive),
        });

        if (chromeTrigger.isActive) {
          syncGalleryChrome(true);
        }

        await setupMobileMarquee();
        ScrollTrigger.refresh();
        return;
      }

      await waitForGalleryImages(section);

      if (cancelled) {
        return;
      }

      const pin = pinRef.current;
      const tracks = Array.from(
        section.querySelectorAll<HTMLDivElement>("[data-gallery-track]"),
      );

      if (!pin || tracks.length !== GALLERY_ROWS.length) {
        return;
      }

      const rowItems = tracks.map((track) =>
        Array.from(
          track.querySelectorAll<HTMLElement>("[data-gallery-photo-item]"),
        ),
      );
      const filmRows = Array.from(
        section.querySelectorAll<HTMLElement>("[data-filmstrip-row]"),
      );

      const getPinDistance = () => {
        const distances = tracks.map(getTrackDistance);
        return Math.max(Math.max(...distances, 0), getSectionViewportHeight());
      };

      chromeTrigger = ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: () => `+=${getPinDistance() + getSectionViewportHeight()}`,
        scroller,
        invalidateOnRefresh: true,
        onToggle: (self) => syncGalleryChrome(self.isActive),
        onRefresh: (self) => syncGalleryChrome(self.isActive),
      });

      if (chromeTrigger.isActive) {
        syncGalleryChrome(true);
      }

      GALLERY_ROWS.forEach((row, index) => {
        const track = tracks[index];
        const distance = () => getTrackDistance(track);

        if (row.direction === "right") {
          gsap.set(track, { x: () => -distance() * 0.22 });
        } else {
          gsap.set(track, { x: 0 });
        }
      });

      scrollTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getPinDistance()}`,
          pin,
          scrub: isMobileViewport() ? 0.6 : 1,
          scroller,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const velocity = self.getVelocity();
            const jitterY = gsap.utils.clamp(-2, 2, velocity * 0.0025);

            gsap.to(filmRows, {
              y: jitterY,
              duration: 0.22,
              ease: "power2.out",
              overwrite: "auto",
            });

            if (shouldUseGallerySkew()) {
              const skewAmount = gsap.utils.clamp(-2.5, 2.5, velocity * 0.006);

              GALLERY_ROWS.forEach((row, index) => {
                const skew =
                  row.direction === "left" ? skewAmount : -skewAmount;

                gsap.to(rowItems[index], {
                  skewX: skew,
                  duration: 0.35,
                  ease: "power2.out",
                  overwrite: "auto",
                });
              });
            }

            if (skewResetTimer) {
              window.clearTimeout(skewResetTimer);
            }

            skewResetTimer = window.setTimeout(() => {
              gsap.to(rowItems.flat(), {
                skewX: 0,
                duration: 0.65,
                ease: "elastic.out(1, 0.45)",
                overwrite: true,
              });
              gsap.to(filmRows, {
                y: 0,
                duration: 0.55,
                ease: "elastic.out(1, 0.5)",
                overwrite: true,
              });
            }, 90);
          },
        },
      });

      GALLERY_ROWS.forEach((row, index) => {
        const track = tracks[index];
        const distance = () => getTrackDistance(track);

        if (row.direction === "left") {
          scrollTimeline?.to(
            track,
            { x: () => -distance(), ease: "none", duration: 1 },
            0,
          );
          return;
        }

        scrollTimeline?.to(
          track,
          {
            x: () => distance() * row.speed,
            ease: "none",
            duration: 1,
          },
          0,
        );
      });

      ScrollTrigger.refresh();
    };

    const stopWaiting = whenPreloaderComplete(() => {
      void setup();
    });

    const handleResize = () => {
      if (!useSimpleGallery) {
        ScrollTrigger.refresh();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelled = true;
      stopWaiting();
      window.removeEventListener("resize", handleResize);
      cleanup();
      setGalleryChromeVisible(true);
    };
  }, [useSimpleGallery, rowHeight, frameGap, rowGap, isReady]);

  const openLightbox = useCallback((photo: FilmstripPhoto) => {
    setSelectedPhoto(photo);
  }, []);

  const closeLightbox = useCallback(() => {
    const lightbox = lightboxRef.current;
    const backdropImage = lightboxBackdropImageRef.current;
    const panel = lightboxPanelRef.current;

    if (!lightbox || !backdropImage || !panel) {
      setSelectedPhoto(null);
      return;
    }

    lightboxTweenRef.current?.kill();
    lightboxTweenRef.current = animateLightboxClose(
      lightbox,
      backdropImage,
      panel,
      prefersReducedMotion(),
      () => setSelectedPhoto(null),
    );
  }, []);

  useLayoutEffect(() => {
    if (!selectedPhoto) {
      return;
    }

    const lightbox = lightboxRef.current;
    const backdropImage = lightboxBackdropImageRef.current;
    const panel = lightboxPanelRef.current;

    if (!lightbox || !backdropImage || !panel) {
      return;
    }

    lightboxTweenRef.current?.kill();
    lightboxTweenRef.current = animateLightboxOpen(
      lightbox,
      backdropImage,
      panel,
      prefersReducedMotion(),
    );
  }, [selectedPhoto]);

  useEffect(() => {
    if (!selectedPhoto) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto, closeLightbox]);

  const lightboxPortal = selectedPhoto ? (
    <GalleryLightboxPortal
      photo={selectedPhoto}
      lightboxRef={lightboxRef}
      backdropImageRef={lightboxBackdropImageRef}
      panelRef={lightboxPanelRef}
      onClose={closeLightbox}
    />
  ) : null;

  if (useSimpleGallery) {
    return (
      <>
        <GalleryFallback
          sectionRef={sectionRef}
          stackRef={stackRef}
          rowHeight={rowHeight}
          frameGap={frameGap}
          rowGap={rowGap}
          onSelect={openLightbox}
        />
        {lightboxPortal}
      </>
    );
  }

  return (
    <>
      <section
        id="section-4"
        ref={sectionRef}
        data-gallery-section
        className="relative bg-background text-foreground"
        aria-label="Gallery ảnh cưới"
      >
        <div
          ref={pinRef}
          className="relative flex h-dvh min-h-dvh flex-col overflow-hidden pb-[var(--section-nav-height,0px)]"
        >
          <header className="pointer-events-none relative z-20 w-full shrink-0 px-6 pt-10 md:absolute md:top-20 md:left-16 md:w-auto md:px-0 md:pt-0">
            <p className="text-[9px] uppercase tracking-[0.28em] text-foreground/45 md:text-[10px] md:tracking-[0.32em]">
              Gallery
            </p>
            <h2 className="mt-2 font-display text-[clamp(1.75rem,5vw,4.5rem)] leading-[0.95] tracking-[0.06em] md:mt-3">
              Album cưới
            </h2>
          </header>

          <div
            ref={stackRef}
            className="mt-auto flex min-h-0 flex-col justify-end pb-1 md:pb-8 max-md:mt-1 max-md:flex-1 max-md:justify-start max-md:overflow-hidden max-md:pt-0"
            style={{ gap: rowGap }}
          >
            {GALLERY_ROWS.map((row) => (
              <FilmstripRow
                key={row.id}
                row={row}
                rowHeight={rowHeight}
                frameGap={frameGap}
                onSelect={openLightbox}
              />
            ))}
          </div>
        </div>
      </section>

      {lightboxPortal}
    </>
  );
}
