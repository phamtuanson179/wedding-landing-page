import { PreLoader } from "@/components/preloader/PreLoader";
import { ScrollProgress } from "@/components/ScrollProgress";
import { ScrollSmootherProvider } from "@/components/ScrollSmootherProvider";
import { HeroSection } from "@/components/HeroSection";
import { IntroductionSection } from "@/components/IntroductionSection";
import { LoveStorySection } from "@/components/LoveStorySection";
import { GallerySection } from "@/components/GallerySection";
import { WeddingSection } from "@/components/WeddingSection";
import { ThankYouSection } from "@/components/ThankYouSection";
import { SectionDivider } from "@/components/SectionDivider";

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
