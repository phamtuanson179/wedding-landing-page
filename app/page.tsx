import { PreLoader } from "@/components/preloader/PreLoader";
import { ScrollProgress } from "@/components/ScrollProgress";
import { ScrollSmootherProvider } from "@/components/ScrollSmootherProvider";

export default function Home() {
  return (
    <>
      <ScrollProgress />

      <ScrollSmootherProvider>
        <main>
          <section
            id="main"
            className="flex min-h-screen items-center justify-center bg-background"
          >
            <p className="text-sm uppercase tracking-widest text-foreground/40">
              Main Section
            </p>
          </section>

          <section
            id="section-2"
            className="flex min-h-screen items-center justify-center bg-background"
          >
            <p className="text-sm uppercase tracking-widest text-foreground/40">
              Section 2
            </p>
          </section>
        </main>
      </ScrollSmootherProvider>

      <PreLoader />
    </>
  );
}
