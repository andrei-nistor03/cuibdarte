import { Model as WineGlassModel } from "../../models/red_wine_glass";
import type { MotionRefs, Placement } from "./motion";
import { useInstalledObject } from "./useInstalledObject";

type GlasswareProps = {
  placement: Placement;
  index: number;
  motion: MotionRefs;
};

/** The real wine glass model, catching the lamplight. */
export default function Glassware({ placement, index, motion }: GlasswareProps) {
  const ref = useInstalledObject(placement, index, motion);

  return (
    <group ref={ref}>
      <WineGlassModel scale={4.4} />
    </group>
  );
}
