import Image from "next/image";

type MonogramLogoProps = {
  className?: string;
  priority?: boolean;
};

/** Sơn & Linh monogram — PNG asset with transparent background. */
export function MonogramLogoSvg({
  className,
  priority = true,
}: MonogramLogoProps) {
  return (
    <Image
      src="/logo-sl.png"
      alt=""
      width={1024}
      height={1024}
      priority={priority}
      draggable={false}
      className={className ?? "block h-full w-full object-contain"}
    />
  );
}
