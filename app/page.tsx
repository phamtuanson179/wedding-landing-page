import { PreLoader } from "@/components/preloader";
import {
  BackgroundMusic,
  ScrollProgress,
  ScrollSmootherProvider,
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
      <BackgroundMusic />

      <ScrollSmootherProvider>
        <main>
          <HeroSection />

          <IntroductionSection />

          <LoveStorySection />

          <GallerySection />

          <WeddingSection />

          <ThankYouSection />
        </main>
      </ScrollSmootherProvider>

      <PreLoader />
    </>
  );
}
