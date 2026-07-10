type SectionDividerProps = {
  variant?:
    | "beige"
    | "beige-editorial"
    | "beige-to-primary"
    | "primary-to-beige"
    | "beige-to-dark"
    | "dark-to-primary";
};

const VARIANT_CLASS = {
  beige: "bg-background",
  "beige-editorial": "bg-background",
  "beige-to-primary":
    "bg-linear-to-b from-background via-[#b8848f] to-primary",
  "primary-to-beige":
    "bg-linear-to-b from-primary via-[#c9b5a8] to-background",
  "beige-to-dark": "bg-linear-to-b from-background via-background to-[#0a0a0a]",
  "dark-to-primary": "bg-linear-to-b from-[#0a0a0a] via-[#3a0012] to-primary",
} as const;

export function SectionDivider({
  variant = "dark-to-primary",
}: SectionDividerProps) {
  const lineClass =
    variant === "beige" || variant === "beige-editorial"
      ? "via-primary/35"
      : variant === "beige-to-primary"
        ? "via-background/45"
        : variant === "primary-to-beige"
          ? "via-background/40"
          : variant === "beige-to-dark"
          ? "via-primary/40"
          : "via-[#d4b87a]/55";

  return (
    <div
      aria-hidden
      className={`relative h-14 shrink-0 md:h-20 ${VARIANT_CLASS[variant]}`}
    >
      <div
        className={`absolute inset-x-8 top-1/2 h-px -translate-y-1/2 bg-linear-to-r from-transparent ${lineClass} to-transparent md:inset-x-16`}
      />

      {variant === "beige-editorial" ? (
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 font-display text-lg text-primary/30 md:text-xl">
          &
        </span>
      ) : null}
    </div>
  );
}
