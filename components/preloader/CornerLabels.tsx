export function CornerLabels() {
  return (
    <div
      className="pointer-events-none absolute inset-0 uppercase tracking-[0.25em] text-sm"
      aria-label="Wedding details"
    >
      <div data-hero-corner-chrome className="absolute inset-0">
        <div className="absolute left-8 top-8 flex flex-col items-center gap-1 lg:left-16 lg:top-16">
          <span>S</span>
          <span>/</span>
          <span>L</span>
        </div>

        <div className="absolute right-8 top-8 flex flex-col items-center gap-1 lg:right-16 lg:top-16">
          <span>29</span>
          <span>/</span>
          <span>11</span>
        </div>

        <p className="absolute bottom-8 left-8 origin-bottom-left -rotate-90 text-xs font-bold lg:bottom-16 lg:left-16">
          Gia Lâm, Hà Nội
        </p>
      </div>
    </div>
  );
}
