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
    if (!lightbox) {
      setSelectedPhoto(null);
      return;
    }

    gsap.to(lightbox, {
      autoAlpha: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => setSelectedPhoto(null),
    });
  }, []);

  useLayoutEffect(() => {
    if (!selectedPhoto) {
      return;
    }

    const lightbox = lightboxRef.current;
    if (!lightbox) {
      return;
    }

    gsap.fromTo(
      lightbox,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.3, ease: "power2.out" },
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

  if (useSimpleGallery) {
    return (
      <GalleryFallback
        sectionRef={sectionRef}
        rowHeight={rowHeight}
        galleryGap={galleryGap}
        onSelect={openLightbox}
      />
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
          <header className="pointer-events-none absolute top-10 left-6 z-20 md:top-20 md:left-16">
            <p className="text-[9px] uppercase tracking-[0.28em] text-foreground/45 md:text-[10px] md:tracking-[0.32em]">
              Gallery
            </p>
            <h2 className="mt-2 font-display text-[clamp(1.75rem,5vw,4.5rem)] leading-[0.95] tracking-[0.06em] md:mt-3">
              Album cưới
            </h2>
          </header>

          <div
            className="mt-auto flex flex-col justify-end pb-6 md:pb-12"
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

      {typeof document !== "undefined" && selectedPhoto
        ? createPortal(
            <div
              ref={lightboxRef}
              className="fixed inset-0 z-[80] flex items-center justify-center bg-background/94 p-6 backdrop-blur-sm md:p-10"
              style={{ opacity: 0, visibility: "hidden" }}
              role="dialog"
              aria-modal="true"
              aria-label="Xem ảnh phóng to"
              onClick={closeLightbox}
            >
              <div
                className="relative max-h-[88vh] w-full max-w-4xl"
                onClick={(event) => event.stopPropagation()}
                onDoubleClick={closeLightbox}
              >
                <button
                  type="button"
                  aria-label="Đóng ảnh"
                  onClick={closeLightbox}
                  className="absolute -top-12 right-0 cursor-pointer text-[10px] uppercase tracking-[0.22em] text-foreground/70 transition-colors hover:text-foreground md:-top-14"
                >
                  Đóng
                </button>

                <div className="relative aspect-[4/5] w-full md:aspect-[3/2]">
                  <Image
                    src={selectedPhoto.src}
                    alt={selectedPhoto.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 896px"
                    className="object-contain"
                    priority
                  />
                </div>

                <p className="mt-4 text-center text-xs text-foreground/55">
                  Click ngoài hoặc double-click để đóng
                </p>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
