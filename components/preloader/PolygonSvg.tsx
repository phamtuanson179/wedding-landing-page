import { forwardRef } from "react";

const DECAGON_POINTS = Array.from({ length: 10 }, (_, i) => {
  const angle = (Math.PI * 2 * i) / 10 - Math.PI / 2;
  const x = 50 + 45 * Math.cos(angle);
  const y = 50 + 45 * Math.sin(angle);
  return `${x},${y}`;
}).join(" ");

export const PolygonSvg = forwardRef<SVGPolygonElement>(function PolygonSvg(
  _,
  ref,
) {
  return (
    <svg
      viewBox='0 0 100 100'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      shapeRendering='geometricPrecision'
      className='h-full w-full'
      aria-hidden='true'
    >
      <polygon
        points={DECAGON_POINTS}
        stroke='currentColor'
        strokeOpacity={0.25}
        strokeWidth='1.5'
        fill='none'
      />
      <polygon
        ref={ref}
        points={DECAGON_POINTS}
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
        fill='none'
      />
    </svg>
  );
});
