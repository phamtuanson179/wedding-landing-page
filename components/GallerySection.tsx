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
import { getScroller, setGalleryChromeVisible } from "./cornerNav";
import { whenPreloaderComplete } from "./preloaderState";
import {
  GALLERY_GAP,
  GALLERY_ROWS,
  getLandscapeStaggerOffset,
  getLoopPhotos,
  getPhotoSize,
  getRowHeight,
  PORTRAIT_ROW_HEIGHT_RATIO,
  type FilmstripPhoto,
} from "./gallery/filmstripPhotos";

gsap.registerPlugin(ScrollTrigger);

const SSR_PORTRAIT_ROW_HEIGHT = 240;
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
          sizes="(max-width: 768px) 55vw, 28vw"
          className="object-cover"
          draggable={false}
        />
      </div>
    </button>
  );
}

function GalleryFallback({
  sectionRef,
  portraitRowHeight,
  landscapeRowHeight,
  staggerOffset,
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
  portraitRowHeight: number;
  landscapeRowHeight: number;
  staggerOffset: number;
}) {
  const [row1, row2] = GALLERY_ROWS;

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
          Kỷ niệm
        </h2>
      </header>
      <div className="space-y-10 overflow-x-auto">
        <div className="flex" style={{ gap: GALLERY_GAP }}>
          {row1.photos.map((photo) => (
            <GalleryPhoto
              key={photo.id}
              photo={photo}
              rowHeight={portraitRowHeight}
              onSelect={() => {}}
            />
          ))}
        </div>
        <div className="flex" style={{ gap: GALLERY_GAP, paddingLeft: staggerOffset }}>
          {row2.photos.map((photo) => (
            <GalleryPhoto
              key={photo.id}
              photo={photo}
              rowHeight={landscapeRowHeight}
              onSelect={() => {}}
            />
          ))}
        </div>
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

  const [reducedMotion] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  const [portraitRowHeight, setPortraitRowHeight] = useState(SSR_PORTRAIT_ROW_HEIGHT);
  const [landscapeRowHeight, setLandscapeRowHeight] = useState(
    Math.round(SSR_PORTRAIT_ROW_HEIGHT * 0.26 / PORTRAIT_ROW_HEIGHT_RATIO),
  );
  const [staggerOffset, setStaggerOffset] = useState(130);
  const [isReady, setIsReady] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<FilmstripPhoto | null>(null);

  useLayoutEffect(() => {
    const updateLayout = () => {
      const portraitHeight = getRowHeight(PORTRAIT_ROW_HEIGHT_RATIO);
      const landscapeHeight = getRowHeight(GALLERY_ROWS[1].rowHeightRatio);
      setPortraitRowHeight(portraitHeight);
      setLandscapeRowHeight(landscapeHeight);
      setStaggerOffset(getLandscapeStaggerOffset(portraitHeight));
    };

    updateLayout();
    setIsReady(true);

    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
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

      if (reducedMotion) {
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

      const row1Items = Array.from(
        tracks[0].querySelectorAll<HTMLElement>("[data-gallery-photo-item]"),
      );
      const row2Items = Array.from(
        tracks[1].querySelectorAll<HTMLElement>("[data-gallery-photo-item]"),
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

      const topTrack = tracks[0];
      const bottomTrack = tracks[1];
      const bottomDistance = () => getTrackDistance(bottomTrack);

      gsap.set(bottomTrack, {
        x: () => -bottomDistance() * 0.18,
      });

      scrollTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getPinDistance()}`,
          pin,
          scrub: 1,
          scroller,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const velocity = self.getVelocity();
            const skewTop = gsap.utils.clamp(-4.5, 4.5, velocity * 0.008);
            const skewBottom = gsap.utils.clamp(-4.5, 4.5, -velocity * 0.008);

            gsap.to(row1Items, {
              skewX: skewTop,
              duration: 0.35,
              ease: "power2.out",
              overwrite: "auto",
            });
            gsap.to(row2Items, {
              skewX: skewBottom,
              duration: 0.35,
              ease: "power2.out",
              overwrite: "auto",
            });

            if (skewResetTimer) {
              window.clearTimeout(skewResetTimer);
            }

            skewResetTimer = window.setTimeout(() => {
              gsap.to([...row1Items, ...row2Items], {
                skewX: 0,
                duration: 0.65,
                ease: "elastic.out(1, 0.45)",
                overwrite: true,
              });
            }, 90);
          },
        },
      });

      scrollTimeline.to(
        topTrack,
        {
          x: () => -getTrackDistance(topTrack),
          ease: "none",
          duration: 1,
        },
        0,
      );
      scrollTimeline.to(
        bottomTrack,
        {
          x: () => bottomDistance() * GALLERY_ROWS[1].speed,
          ease: "none",
          duration: 1,
        },
        0,
      );

      ScrollTrigger.refresh();
    };

    const stopWaiting = whenPreloaderComplete(() => {
      void setup();
    });

    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelled = true;
      stopWaiting();
      window.removeEventListener("resize", handleResize);
      cleanup();
      setGalleryChromeVisible(true);
    };
  }, [reducedMotion, portraitRowHeight, landscapeRowHeight, staggerOffset, isReady]);

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

  if (reducedMotion) {
    return (
      <GalleryFallback
        sectionRef={sectionRef}
        portraitRowHeight={portraitRowHeight}
        landscapeRowHeight={landscapeRowHeight}
        staggerOffset={staggerOffset}
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
          className="relative flex h-screen min-h-screen flex-col overflow-hidden"
        >
          <header className="pointer-events-none absolute top-14 left-8 z-20 md:top-20 md:left-16">
            <p className="text-[10px] uppercase tracking-[0.32em] text-foreground/45">
              Gallery
            </p>
            <h2 className="mt-3 font-display text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.95] tracking-[0.06em]">
              Kỷ niệm
            </h2>
          </header>

          <div
            className="mt-auto flex flex-col justify-end pb-10 md:pb-14"
            style={{ gap: GALLERY_GAP }}
          >
            <div className="overflow-hidden">
              <div
                data-gallery-track
                className="flex w-max items-center will-change-transform pl-8 md:pl-16"
                style={{ gap: GALLERY_GAP, height: portraitRowHeight }}
              >
                {getLoopPhotos(GALLERY_ROWS[0].photos).map((photo) => (
                  <GalleryPhoto
                    key={photo.id}
                    photo={photo}
                    rowHeight={portraitRowHeight}
                    onSelect={openLightbox}
                  />
                ))}
              </div>
            </div>

            <div className="overflow-hidden">
              <div
                data-gallery-track
                className="flex w-max items-center will-change-transform"
                style={{
                  gap: GALLERY_GAP,
                  height: landscapeRowHeight,
                  paddingLeft: `calc(${staggerOffset}px + 2rem)`,
                }}
              >
                {getLoopPhotos(GALLERY_ROWS[1].photos).map((photo) => (
                  <GalleryPhoto
                    key={photo.id}
                    photo={photo}
                    rowHeight={landscapeRowHeight}
                    onSelect={openLightbox}
                  />
                ))}
              </div>
            </div>
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
