export type FilmstripAspect = "3/4" | "16/9";

export type FilmstripPhoto = {
  id: string;
  src: string;
  alt: string;
  aspect: FilmstripAspect;
};

export type GalleryRowConfig = {
  id: string;
  photos: FilmstripPhoto[];
  direction: "left" | "right";
  speed: number;
  rowHeightRatio: number;
};

export const GALLERY_GAP = 40;
export const PORTRAIT_ROW_HEIGHT_RATIO = 0.32;
export const LANDSCAPE_ROW_HEIGHT_RATIO = 0.26;
export const BOTTOM_ROW_SPEED = 0.88;

const ASPECT_WIDTH: Record<FilmstripAspect, number> = {
  "3/4": 3 / 4,
  "16/9": 16 / 9,
};

export function getLoopPhotos(photos: FilmstripPhoto[]) {
  return [
    ...photos,
    ...photos.map((photo) => ({ ...photo, id: `${photo.id}-loop` })),
  ];
}

export function getRowHeight(ratio: number) {
  if (typeof window === "undefined") {
    return 240;
  }

  return Math.round(window.innerHeight * ratio);
}

export function getPhotoSize(aspect: FilmstripAspect, rowHeight: number) {
  return {
    width: Math.round(rowHeight * ASPECT_WIDTH[aspect]),
    height: Math.round(rowHeight),
  };
}

export function getLandscapeStaggerOffset(portraitRowHeight: number) {
  const portraitWidth = portraitRowHeight * ASPECT_WIDTH["3/4"];
  return Math.round((portraitWidth + GALLERY_GAP) / 2);
}

export const GALLERY_ROW_PORTRAITS: FilmstripPhoto[] = [
  {
    id: "p01",
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
    alt: "Chú rể và cô dâu",
    aspect: "3/4",
  },
  {
    id: "p02",
    src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=900&q=80",
    alt: "Chân dung cô dâu",
    aspect: "3/4",
  },
  {
    id: "p03",
    src: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80",
    alt: "Khoảnh khắc vui",
    aspect: "3/4",
  },
  {
    id: "p04",
    src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80",
    alt: "Hậu trường",
    aspect: "3/4",
  },
  {
    id: "p05",
    src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
    alt: "Nụ cười",
    aspect: "3/4",
  },
  {
    id: "p06",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80",
    alt: "Khoảnh khắc đời thường",
    aspect: "3/4",
  },
];

export const GALLERY_ROW_LANDSCAPES: FilmstripPhoto[] = [
  {
    id: "l01",
    src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
    alt: "Chi tiết hoa cưới",
    aspect: "16/9",
  },
  {
    id: "l02",
    src: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1400&q=80",
    alt: "Phong cảnh hoàng hôn",
    aspect: "16/9",
  },
  {
    id: "l03",
    src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1400&q=80",
    alt: "Hành trình",
    aspect: "16/9",
  },
  {
    id: "l04",
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    alt: "Tiệc vui",
    aspect: "16/9",
  },
  {
    id: "l05",
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1100&q=80",
    alt: "Khoảnh khắc bình yên",
    aspect: "16/9",
  },
  {
    id: "l06",
    src: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
    alt: "Hoàng hôn bên nhau",
    aspect: "16/9",
  },
];

export const GALLERY_ROWS: GalleryRowConfig[] = [
  {
    id: "row-portraits",
    direction: "left",
    speed: 1,
    rowHeightRatio: PORTRAIT_ROW_HEIGHT_RATIO,
    photos: GALLERY_ROW_PORTRAITS,
  },
  {
    id: "row-landscapes",
    direction: "right",
    speed: BOTTOM_ROW_SPEED,
    rowHeightRatio: LANDSCAPE_ROW_HEIGHT_RATIO,
    photos: GALLERY_ROW_LANDSCAPES,
  },
];
