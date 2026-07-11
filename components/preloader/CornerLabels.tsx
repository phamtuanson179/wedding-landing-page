export function CornerLabels() {
  return (
    <div
      className="pointer-events-none absolute inset-0 uppercase tracking-[0.2em] text-[10px] md:text-sm md:tracking-[0.25em]"
      aria-label="Wedding details"
    >
      <div data-hero-corner-chrome className="absolute inset-0">
        <div className="absolute left-6 top-6 flex flex-col items-center gap-0.5 md:left-8 md:top-8 md:gap-1 lg:left-16 lg:top-16">
          <span>S</span>
          <span>/</span>
          <span>L</span>
        </div>

        <div className="absolute right-6 top-6 flex flex-col items-center gap-0.5 md:right-8 md:top-8 md:gap-1 lg:right-16 lg:top-16">
          <span>29</span>
          <span>/</span>
          <span>11</span>
        </div>

        <p className="absolute bottom-15 left-6 origin-bottom-left -rotate-90 font-light md:bottom-14 md:left-8 md:text-xs lg:bottom-22 lg:left-16">
          Gia Lâm, Hà Nội
        </p>

        <p
          data-scroll-explore-hint
          className="absolute bottom-15 left-10 text-[8px] uppercase tracking-[0.24em] opacity-0 md:bottom-14 md:left-[3.25rem] md:text-[10px] md:tracking-[0.28em] lg:bottom-22 lg:left-[4.75rem]"
          aria-hidden="true"
        >
          Scroll to explore
        </p>
      </div>
    </div>
  );
}
