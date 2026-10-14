"use client";

import { PreLoader } from "@/components/preloader";
import {
  BackgroundMusic,
  ScrollProgress,
  ScrollSmootherProvider,
  SectionNav,
} from "@/components/layout";
import {
  GallerySection,
  HeroSection,
  IntroductionSection,
  LoveStorySection,
  ThankYouSection,
  WeddingSection,
} from "@/components/sections";
import { type WeddingRole } from "@/lib/constants/wedding-data";

export function WeddingLandingPage({ role = "his" }: { role?: WeddingRole }) {
  return (
    <>
      <ScrollProgress />
      <BackgroundMusic />
      <SectionNav />

      <ScrollSmootherProvider>
        <main>
          <HeroSection />

          <IntroductionSection role={role} />

          <LoveStorySection />

          <GallerySection />

          <WeddingSection role={role} />

          <ThankYouSection role={role} />
        </main>
      </ScrollSmootherProvider>

      <PreLoader />
    </>
  );
}
