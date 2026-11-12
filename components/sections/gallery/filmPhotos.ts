export type FilmPhoto = {
  id: string;
  frameCode: string; // e.g. "01A", "02A"
  src: string;
  alt: string;
  caption?: string;
  aspect?: "2/3" | "3/2";
};

const SELECTED_FILM_FRAMES = [
  3, 5, 6, 11, 12, 14, 19, 20, 21, 22, 25, 26, 28, 29, 31, 32,
] as const;

export const FILM_PHOTOS: FilmPhoto[] = SELECTED_FILM_FRAMES.map(
  (sourceNum, i) => {
    const fileNum = String(sourceNum).padStart(2, "0");
    const frameNum = String(i + 1).padStart(2, "0");
    return {
      id: `film-${fileNum}`,
      frameCode: `${frameNum}A`,
      src: `/images/film/film-${fileNum}.webp`,
      alt: `Ảnh film 35mm khung hình ${frameNum}A`,
      caption: `Khung film ${frameNum}A — Cuộn 35mm mộc mạc`,
      aspect: "2/3",
    };
  },
);

