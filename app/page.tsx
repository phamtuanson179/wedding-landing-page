import { PreLoader } from "@/components/preloader/PreLoader";
import { ScrollProgress } from "@/components/ScrollProgress";
import { ScrollSmootherProvider } from "@/components/ScrollSmootherProvider";
import { HeroSection } from "@/components/HeroSection";
import { IntroductionSection } from "@/components/IntroductionSection";
import { LoveStorySection } from "@/components/LoveStorySection";

export default function Home() {
  return (
    <>
      <ScrollProgress />

      <ScrollSmootherProvider>
        <main>
          <HeroSection />

          <IntroductionSection />

          <LoveStorySection />

          <section
            id="section-4"
            className="flex min-h-screen items-center justify-center bg-background"
          >
            <p className="text-sm uppercase tracking-widest text-foreground/40">
              Section 3
            </p>
          </section>
        </main>
      </ScrollSmootherProvider>

      <PreLoader />
    </>
  );
}
