export function SectionHeading({
  kicker,
  heading,
  subheading,
  align = "left",
  light = false,
}: {
  kicker?: string;
  heading: string;
  subheading?: string;
  align?: "left" | "center";
  light?: boolean;
}) {
  const alignClass = align === "center" ? "text-center items-center" : "text-left items-start";
  return (
    <div className={`flex flex-col gap-3 ${alignClass}`}>
      {kicker && (
        <span
          className={`font-hand text-2xl ${light ? "text-terracotta-300" : "text-terracotta-500"}`}
        >
          {kicker}
        </span>
      )}
      <h2
        className={`font-display text-3xl sm:text-4xl md:text-5xl leading-tight ${
          light ? "text-cream" : "text-ink"
        }`}
      >
        {heading}
      </h2>
      {subheading && (
        <p className={`max-w-2xl text-base sm:text-lg ${light ? "text-cream/80" : "text-ink-soft"}`}>
          {subheading}
        </p>
      )}
    </div>
  );
}
