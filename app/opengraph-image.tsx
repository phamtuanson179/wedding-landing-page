import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo/site";

export const alt = `${siteConfig.name} — Thiệp cưới ${siteConfig.wedding.displayDate}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#800020",
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(230,223,211,0.12), transparent 45%), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.25), transparent 50%)",
          color: "#e6dfd3",
          padding: "64px 72px",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            fontSize: 22,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            opacity: 0.75,
          }}
        >
          <span>Thiệp cưới</span>
          <span>{siteConfig.wedding.displayDate}</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 28,
              fontSize: 96,
              lineHeight: 1,
              letterSpacing: "0.04em",
            }}
          >
            <span>Sơn</span>
            <span
              style={{
                fontSize: 64,
                fontStyle: "italic",
                opacity: 0.85,
              }}
            >
              &
            </span>
            <span>Linh</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              letterSpacing: "0.12em",
              opacity: 0.88,
            }}
          >
            Hai người, một hành trình
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 22,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            opacity: 0.75,
          }}
        >
          <span>{siteConfig.couple.groom.name}</span>
          <span>{siteConfig.wedding.locationName}</span>
          <span>{siteConfig.couple.bride.name}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
