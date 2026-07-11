import { absoluteUrl, siteConfig } from "@/lib/seo/site";

/**
 * Schema.org JSON-LD for wedding invitation / event discovery.
 */
export function WeddingJsonLd() {
  const url = absoluteUrl("/");
  const { couple, wedding, name, description } = siteConfig;

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: `${name} — Thiệp cưới`,
        description,
        inLanguage: "vi-VN",
        publisher: {
          "@id": `${url}/#couple`,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${url}/#webpage`,
        url,
        name: siteConfig.title,
        description,
        isPartOf: { "@id": `${url}/#website` },
        inLanguage: "vi-VN",
        about: { "@id": `${url}/#event` },
      },
      {
        "@type": "WeddingEvent",
        "@id": `${url}/#event`,
        name: `Lễ cưới ${couple.groom.nickname} & ${couple.bride.nickname}`,
        description,
        url,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        startDate: wedding.dateISO,
        location: {
          "@type": "Place",
          name: wedding.locationName,
          address: {
            "@type": "PostalAddress",
            addressLocality: wedding.locationName,
            addressRegion: wedding.locationRegion,
            addressCountry: wedding.locationCountry,
          },
        },
        organizer: { "@id": `${url}/#couple` },
        image: [absoluteUrl("/opengraph-image")],
      },
      {
        "@type": "Organization",
        "@id": `${url}/#couple`,
        name,
        url,
        member: [
          {
            "@type": "Person",
            name: couple.groom.name,
            alternateName: couple.groom.nickname,
            jobTitle: couple.groom.role,
          },
          {
            "@type": "Person",
            name: couple.bride.name,
            alternateName: couple.bride.nickname,
            jobTitle: couple.bride.role,
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
