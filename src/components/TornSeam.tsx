type TornSeamProps = {
  color: string;
  variant?: "a" | "b" | "c";
  flip?: boolean;
  dark?: boolean;
  fadeShadow?: boolean;
  className?: string;
};

const VARIANT_CLASS = {
  a: "edge-torn-top",
  b: "edge-torn-top-b",
  c: "edge-torn-top-c",
} as const;

export default function TornSeam({
  color,
  variant = "a",
  flip = false,
  dark = false,
  fadeShadow = false,
  className = "",
}: TornSeamProps) {
  return (
    <div
      aria-hidden="true"
      className={`relative z-40 h-14 md:h-20 lg:h-28 ${
        flip
          ? "-mt-7 -mb-7 md:-mt-10 md:-mb-10 lg:-mt-14 lg:-mb-14"
          : "-mt-14 md:-mt-20 lg:-mt-28"
      } ${className}`}
      style={flip ? undefined : { marginBottom: "-2px" }}
    >
      <div
        className={`relative h-full w-full ${VARIANT_CLASS[variant]} ${flip ? "rotate-180" : ""}`}
        style={{ backgroundColor: color }}
      >
        <div className={`grain-overlay ${dark ? "grain-overlay--dark" : ""}`} />
        {fadeShadow && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, transparent, rgba(0,0,0,0.45))",
            }}
          />
        )}
      </div>
      {!flip && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0"
          style={{ height: 8, transform: "translateY(6px)", backgroundColor: color }}
        />
      )}
    </div>
  );
}
