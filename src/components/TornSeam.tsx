type TornSeamProps = {
  /** Surface colour of the flap — usually the section it visually belongs to. */
  color: string;
  /** Alternates the jagged silhouette so consecutive seams don't repeat. */
  variant?: "a" | "b" | "c";
  /**
   * Rotates the flap 180° and centers it on the seam instead of sitting
   * entirely above it: the flat half blends up into the previous section,
   * the jagged half hangs down over the next one, so the tear actually
   * crosses the boundary instead of landing on same-coloured background.
   */
  flip?: boolean;
  /** Darker grain, for a light-into-dark seam. */
  dark?: boolean;
  /**
   * Darkens the flap with the same top-fade used at the bottom of Hero, so
   * the shadow reads as sitting on the torn shape itself rather than on the
   * flat section underneath it once the flap's negative margin covers that
   * area up.
   */
  fadeShadow?: boolean;
  className?: string;
};

/**
 * A torn-paper seam dropped *between* two sections in the DOM (never inside
 * either one's own `overflow-hidden` box, which would clip it). A negative
 * top margin pulls its flat-bottomed, jagged-topped flap up over the
 * previous section, so the two "rooms" read as one continuous surface
 * instead of a hard cut. `flip` rotates that same flap 180° so the jagged
 * edge hangs down into the next section instead.
 */
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
    // `filter` lives on this outer wrapper, never on the same element as
    // `clip-path` below. On some GPUs/browsers, an element carrying both at
    // once gets rasterized into an offscreen buffer for the filter pass that
    // samples a hair past the polygon's own edge — which reads back as a
    // thin white/transparent fringe tracing the jagged tear. Keeping the two
    // on separate elements avoids that shared-layer sampling entirely.
    //
    // Normally the flap sits flush against the section that follows (flat
    // bottom, `marginBottom: -2px` bleeding it 2px past that edge so
    // sub-pixel rounding between two separately-composited layers — this one
    // carries a filter — never leaves a hairline gap). Flipped, neither edge
    // is flush: the margin is split so half the flap's height overlaps each
    // side of the boundary, which is what puts the jagged (now bottom) half
    // over the *next* section instead of stacking harmlessly on the same-
    // coloured background behind it.
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
      {/* The clip-path shape's flat bottom edge is a straight line in CSS
          terms, but browsers still rasterize the whole polygon as one mask
          and anti-alias its boundary — on some mobile/tablet GPUs that
          leaves a hairline of the unclipped backdrop showing through right
          on this seam, even though the flap and the section below share the
          exact same colour. A plain, un-clipped rect has no polygon edge to
          anti-alias, so it reliably plugs that gap regardless of subpixel
          rounding — bleeding further than the -2px margin above needs to,
          on purpose, as a safety margin against devices where that alone
          isn't enough. */}
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
