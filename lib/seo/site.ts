/**
 * Central site SEO / sharing config.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://sonlinh.wedding).
 */
export const siteConfig = {
  name: "Sơn & Linh",
  shortName: "S & L",
  title: "Thiệp cưới Sơn & Linh | 29.11.2026",
  titleTemplate: "%s | Sơn & Linh",
  description:
    "Trân trọng kính mời bạn đến dự lễ cưới của Phạm Tuấn Sơn & Nguyễn Thị Thùy Linh — ngày 29.11.2026 tại Gia Lâm, Hà Nội. Xem câu chuyện, album ảnh và thông tin buổi lễ.",
  /** Shorter blurb for chat previews (Messenger / Telegram / LinkedIn). */
  shareDescription:
    "Trân trọng kính mời bạn đến dự lễ cưới Sơn & Linh — 29.11.2026 · Gia Lâm, Hà Nội.",
  locale: "vi_VN",
  language: "vi",
  keywords: [
    "thiệp cưới",
    "wedding invitation",
    "Sơn Linh",
    "Phạm Tuấn Sơn",
    "Nguyễn Thị Thùy Linh",
    "lễ cưới",
    "Gia Lâm",
    "Hà Nội",
    "wedding website",
    "album cưới",
  ],
  authors: [
    { name: "Phạm Tuấn Sơn" },
    { name: "Nguyễn Thị Thùy Linh" },
  ],
  creator: "Sơn & Linh",
  wedding: {
    /** ISO date of the wedding ceremony */
    dateISO: "2026-11-29",
    displayDate: "29.11.2026",
    locationName: "Gia Lâm, Hà Nội",
    locationRegion: "Hà Nội",
    locationCountry: "VN",
  },
  couple: {
    groom: {
      name: "Phạm Tuấn Sơn",
      nickname: "Sơn",
      role: "Chú rể",
    },
    bride: {
      name: "Nguyễn Thị Thùy Linh",
      nickname: "Linh",
      role: "Cô dâu",
    },
  },
  /** In-page section anchors (single-page site). */
  sections: [
    { id: "main", path: "/#main", label: "Trang chủ" },
    { id: "section-2", path: "/#section-2", label: "Giới thiệu" },
    { id: "section-3", path: "/#section-3", label: "Câu chuyện" },
    { id: "section-4", path: "/#section-4", label: "Album" },
    { id: "section-5", path: "/#section-5", label: "Lễ cưới" },
    { id: "section-6", path: "/#section-6", label: "Mừng cưới" },
  ],
  themeColor: "#800020",
  backgroundColor: "#e6dfd3",
  /** Canonical social preview image (1200×630). */
  ogImage: {
    path: "/og-image.png",
    width: 1200,
    height: 630,
    type: "image/png",
    alt: "Sơn & Linh — Thiệp cưới 29.11.2026",
  },
} as const;

export function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

export function absoluteUrl(path = "/") {
  const base = getSiteUrl();
  if (!path || path === "/") {
    return base;
  }
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
