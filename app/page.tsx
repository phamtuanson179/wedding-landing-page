import { PreLoader } from "@/components/preloader";
import {
  ScrollProgress,
  ScrollSmootherProvider,
  SectionDivider,
} from "@/components/layout";
import {
  GallerySection,
  HeroSection,
  IntroductionSection,
  LoveStorySection,
  ThankYouSection,
  WeddingSection,
} from "@/components/sections";

export default function Home() {
  return (
    <>
      <ScrollProgress />

      <ScrollSmootherProvider>
        <main>
          <HeroSection />

          <IntroductionSection />

          <SectionDivider variant="beige-editorial" />

          <LoveStorySection />

          <SectionDivider variant="beige-editorial" />

          <GallerySection />

          <WeddingSection />

          <ThankYouSection />
        </main>
      </ScrollSmootherProvider>

      <PreLoader />
    </>
  );
}
