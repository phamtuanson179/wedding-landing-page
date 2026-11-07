export type FilmPhoto = {
  id: string;
  frameCode: string; // e.g. "01A", "02A"
  src: string;
  alt: string;
  caption?: string;
};

export const FILM_PHOTOS: FilmPhoto[] = Array.from({ length: 25 }, (_, i) => {
  const num = String(i + 1).padStart(2, "0");
  return {
    id: `film-${num}`,
    frameCode: `${num}A`,
    src: `/images/film/film-${num}.webp`,
    alt: `Ảnh film 35mm khung hình ${num}A`,
    caption: `Khung film ${num}A — Cuộn 35mm mộc mạc`,
  };
});

