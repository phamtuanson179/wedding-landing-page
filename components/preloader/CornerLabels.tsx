type CornerLabelsProps = {
  loadingRef?: React.RefObject<HTMLSpanElement | null>;
  scrollDownRef?: React.RefObject<HTMLSpanElement | null>;
};

export function CornerLabels({ loadingRef, scrollDownRef }: CornerLabelsProps) {
  return (
    <div
      className='pointer-events-none absolute inset-0 uppercase tracking-[0.25em] text-sm'
      aria-label='Wedding details'
    >
      <div className='absolute left-16 top-16 flex flex-col items-center gap-1'>
        <span>S</span>
        <span>/</span>
        <span>L</span>
      </div>

      <div className='absolute right-16 top-16 flex flex-col items-center gap-1'>
        <span>29</span>
        <span>/</span>
        <span>11</span>
      </div>

      <p className='absolute bottom-16 left-16 origin-bottom-left -rotate-90 font-bold text-xs'>
        Gia Lâm, Hà Nội
      </p>

      <div className='absolute bottom-16 right-16 h-[1em] overflow-hidden'>
        <span ref={loadingRef} className='block h-[1em] leading-none'>
          Loading...
        </span>
        <span ref={scrollDownRef} className='block h-[1em] leading-none'>
          Scroll down
        </span>
      </div>
    </div>
  );
}
