export type FilmPhoto = {
  id: string;
  frameCode: string; // e.g. "01A", "02A"
  src: string;
  alt: string;
  caption?: string;
  aspect?: "2/3" | "3/2";
};

export const FILM_PHOTOS: FilmPhoto[] = Array.from({ length: 32 }, (_, i) => {
  const num = String(i + 1).padStart(2, "0");
  return {
    id: `film-${num}`,
    frameCode: `${num}A`,
    src: `/images/film/film-${num}.webp`,
    alt: `Ảnh film 35mm khung hình ${num}A`,
    caption: `Khung film ${num}A — Cuộn 35mm mộc mạc`,
    aspect: "2/3",
  };
});

