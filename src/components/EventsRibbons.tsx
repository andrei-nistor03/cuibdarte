import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";

import PaperRibbons from "./reservation/PaperRibbons";
import SceneLighting from "./reservation/SceneLighting";
import type { MotionRefs, Placement } from "./reservation/motion";

// Ambient decoration only — no scroll-triggered assembly, no pointer
// parallax. The ribbons are just always "installed" and gently adrift,
// echoing the CTA installation's own paper ribbons behind the envelopes.
// Kept well within the camera's frustum (fov 45 at z=6, so roughly ±2.5
// half-width/height at the look-at plane) rather than placed by feel.
const RIBBONS: Placement[] = [
  { pos: [-3.1, 0.9, -1.6], rot: [0, 0, 0.06], scale: 0.65, depth: 0.35, seed: 3 },
  { pos: [3.1, -0.6, -1.8], rot: [0, 0, -0.05], scale: 0.6, depth: 0.35, seed: 9 },
  { pos: [-2.2, -1.8, -1.9], rot: [0, 0, 0.04], scale: 0.5, depth: 0.3, seed: 15 },
  { pos: [2.4, 1.7, -1.4], rot: [0, 0, -0.04], scale: 0.55, depth: 0.35, seed: 21 },
];

export default function EventsRibbons() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const pointerRef = useRef({ x: 0, y: 0 });
  const assemblyRef = useRef(1);
  const driftRef = useRef(0);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const motion: MotionRefs = useMemo(
    () => ({
      pointer: pointerRef,
      assembly: assemblyRef,
      drift: driftRef,
      reducedMotion,
      mobile: false,
    }),
    [reducedMotion],
  );

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
    >
      <Suspense fallback={null}>
        <SceneLighting />
        <PaperRibbons placements={RIBBONS} baseIndex={0} motion={motion} />
      </Suspense>
    </Canvas>
  );
}
