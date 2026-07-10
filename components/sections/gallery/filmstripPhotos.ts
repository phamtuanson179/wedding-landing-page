export type FilmstripAspect = "3/4" | "1/1" | "16/9" | "4/5" | "3/2";

export type FilmstripPhoto = {
  id: string;
  src: string;
  alt: string;
  aspect: FilmstripAspect;
};

export type GalleryRowConfig = {
  id: string;
  photos: FilmstripPhoto[];
  offsetClass: string;
  direction: "left" | "right";
  speed: number;
};

export const GALLERY_GAP = 40;
export const MOBILE_GALLERY_GAP = 16;
export const ROW_HEIGHT_RATIO = 0.22;
export const MOBILE_ROW_HEIGHT_RATIO = 0.21;

const ASPECT_WIDTH: Record<FilmstripAspect, number> = {
  "3/4": 3 / 4,
  "1/1": 1,
  "16/9": 16 / 9,
  "4/5": 4 / 5,
  "3/2": 3 / 2,
};

export function getLoopPhotos(photos: FilmstripPhoto[]) {
  return [
    ...photos,
    ...photos.map((photo) => ({ ...photo, id: `${photo.id}-loop` })),
  ];
}

function isMobileGalleryViewport() {
  return window.matchMedia("(max-width: 767px)").matches;
}

export function getRowHeight() {
  if (typeof window === "undefined") {
    return 200;
  }

  const ratio = isMobileGalleryViewport()
    ? MOBILE_ROW_HEIGHT_RATIO
    : ROW_HEIGHT_RATIO;

  return Math.round(window.innerHeight * ratio);
}

export function getGalleryGap() {
  if (typeof window === "undefined") {
    return GALLERY_GAP;
  }

  return isMobileGalleryViewport() ? MOBILE_GALLERY_GAP : GALLERY_GAP;
}

export function getPhotoSize(aspect: FilmstripAspect, rowHeight: number) {
  return {
    width: Math.round(rowHeight * ASPECT_WIDTH[aspect]),
    height: Math.round(rowHeight),
  };
}

export const GALLERY_ROWS: GalleryRowConfig[] = [
  {
    id: "row-1",
    direction: "left",
    speed: 1,
    offsetClass: "pl-4 md:pl-16",
    photos: [
      {
        id: "r1-01",
        src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
        alt: "Chi tiết hoa cưới",
        aspect: "16/9",
      },
      {
        id: "r1-02",
        src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
        alt: "Chú rể và cô dâu",
        aspect: "3/4",
      },
      {
        id: "r1-03",
        src: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1400&q=80",
        alt: "Phong cảnh hoàng hôn",
        aspect: "16/9",
      },
      {
        id: "r1-04",
        src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1100&q=80",
        alt: "Khoảnh khắc bình yên",
        aspect: "3/2",
      },
      {
        id: "r1-05",
        src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
        alt: "Nhẫn cưới",
        aspect: "1/1",
      },
    ],
  },
  {
    id: "row-2",
    direction: "right",
    speed: 0.82,
    offsetClass: "pl-8 md:pl-24",
    photos: [
      {
        id: "r2-01",
        src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1400&q=80",
        alt: "Hành trình",
        aspect: "16/9",
      },
      {
        id: "r2-02",
        src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=900&q=80",
        alt: "Chân dung cô dâu",
        aspect: "3/4",
      },
      {
        id: "r2-03",
        src: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80",
        alt: "Khoảnh khắc vui",
        aspect: "4/5",
      },
      {
        id: "r2-04",
        src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80",
        alt: "Hậu trường",
        aspect: "3/4",
      },
      {
        id: "r2-05",
        src: "https://images.unsplash.com/photo-1523438885200-635adc7e0df2?auto=format&fit=crop&w=1000&q=80",
        alt: "Cùng bạn bè",
        aspect: "1/1",
      },
    ],
  },
  {
    id: "row-3",
    direction: "left",
    speed: 0.9,
    offsetClass: "pl-12 md:pl-32",
    photos: [
      {
        id: "r3-01",
        src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
        alt: "Tiệc vui",
        aspect: "16/9",
      },
      {
        id: "r3-02",
        src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
        alt: "Nụ cười",
        aspect: "3/4",
      },
      {
        id: "r3-03",
        src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80",
        alt: "Khoảnh khắc đời thường",
        aspect: "4/5",
      },
      {
        id: "r3-04",
        src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=80",
        alt: "Ngày vui",
        aspect: "3/2",
      },
      {
        id: "r3-05",
        src: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
        alt: "Hoàng hôn bên nhau",
        aspect: "16/9",
      },
    ],
  },
];
