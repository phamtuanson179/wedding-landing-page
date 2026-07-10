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
  GALLERY_GAP,
  GALLERY_ROWS,
  getGalleryGap,
  getLoopPhotos,
  getPhotoSize,
  getRowHeight,
  type FilmstripPhoto,
} from "./filmstripPhotos";

gsap.registerPlugin(ScrollTrigger);

const SSR_ROW_HEIGHT = 200;
const HOVER_SHADOW = "0 24px 48px -12px rgba(26, 18, 12, 0.14)";

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
    boxShadow: "0 0 0 rgba(0,0,0,0)",
    duration: 0.45,
    ease: "power2.out",
    overwrite: true,
  });
}

function highlightPhoto(item: HTMLElement) {
  gsap.to(item, {
    scale: 1.05,
    boxShadow: HOVER_SHADOW,
    duration: 0.45,
    ease: "power2.out",
    overwrite: true,
  });
}

function GalleryPhoto({
  photo,
  rowHeight,
  onSelect,
}: {
  photo: FilmstripPhoto;
  rowHeight: number;
  onSelect: (photo: FilmstripPhoto) => void;
}) {
  const itemRef = useRef<HTMLDivElement>(null);
  const { width, height } = getPhotoSize(photo.aspect, rowHeight);

  return (
    <button
      type="button"
      aria-label={`Xem ảnh: ${photo.alt}`}
      className="photo-item relative shrink-0 cursor-pointer border-0 bg-transparent p-0"
      style={{ width, height }}
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
        className="relative h-full w-full origin-center overflow-hidden rounded-sm bg-foreground/5 will-change-transform"
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
  );
}

function GalleryFallback({
  sectionRef,
  rowHeight,
  galleryGap,
  onSelect,
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
  rowHeight: number;
  galleryGap: number;
  onSelect: (photo: FilmstripPhoto) => void;
}) {
  return (
    <section
      id="section-4"
      ref={sectionRef}
      data-gallery-section
      className="bg-background px-6 py-16 text-foreground md:px-16"
    >
      <header className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.32em] text-foreground/45">
          Gallery
        </p>
        <h2 className="mt-3 font-display text-4xl tracking-[0.08em] md:text-5xl">
          Album cưới
        </h2>
      </header>
      <div className="space-y-10 overflow-x-auto">
        {GALLERY_ROWS.map((row) => (
          <div key={row.id} className="flex" style={{ gap: galleryGap }}>
            {row.photos.map((photo) => (
              <GalleryPhoto
                key={photo.id}
                photo={photo}
                rowHeight={rowHeight}
                onSelect={onSelect}
              />
            ))}
          </div>
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
  const [galleryGap, setGalleryGap] = useState(GALLERY_GAP);
  const [isReady, setIsReady] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<FilmstripPhoto | null>(null);

  useLayoutEffect(() => {
    const updateGalleryMetrics = () => {
      setRowHeight(getRowHeight());
      setGalleryGap(getGalleryGap());
    };

    updateGalleryMetrics();
    setIsReady(true);

    window.addEventListener("resize", updateGalleryMetrics);
    return () => window.removeEventListener("resize", updateGalleryMetrics);
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

    const cleanup = () => {
      if (skewResetTimer) {
        window.clearTimeout(skewResetTimer);
      }

      chromeTrigger?.kill();
      scrollTimeline?.scrollTrigger?.kill();
      scrollTimeline?.kill();
      chromeTrigger = undefined;
      scrollTimeline = undefined;

      section
        .querySelectorAll<HTMLElement>("[data-gallery-photo-item]")
        .forEach((item) => {
          gsap.set(item, { clearProps: "skewX,transform" });
        });
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

      const getPinDistance = () => {
        const distances = tracks.map(getTrackDistance);
        return Math.max(Math.max(...distances, 0), window.innerHeight);
      };

      chromeTrigger = ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: () => `+=${getPinDistance() + window.innerHeight}`,
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
            if (!shouldUseGallerySkew()) {
              return;
            }

            const velocity = self.getVelocity();
            const skewAmount = gsap.utils.clamp(-4.5, 4.5, velocity * 0.008);

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
  }, [useSimpleGallery, rowHeight, galleryGap, isReady]);

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
          rowHeight={rowHeight}
          galleryGap={galleryGap}
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
          className="relative flex h-dvh min-h-dvh flex-col overflow-hidden"
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
            className="mt-auto flex flex-col justify-end pb-6 md:pb-12 max-md:mt-0 max-md:flex-1 max-md:justify-end max-md:pb-12 max-md:pt-5"
            style={{ gap: galleryGap }}
          >
            {GALLERY_ROWS.map((row) => (
              <div key={row.id} className="overflow-hidden">
                <div
                  data-gallery-track
                  className={`flex w-max items-center will-change-transform ${row.offsetClass}`}
                  style={{ gap: galleryGap, height: rowHeight }}
                >
                  {getLoopPhotos(row.photos).map((photo) => (
                    <GalleryPhoto
                      key={photo.id}
                      photo={photo}
                      rowHeight={rowHeight}
                      onSelect={openLightbox}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {lightboxPortal}
    </>
  );
}
