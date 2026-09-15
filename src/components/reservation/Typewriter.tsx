import { Model as TypewriterModel } from "../../models/typewriter";
import type { MotionRefs, Placement } from "./motion";
import { useInstalledObject } from "./useInstalledObject";

type TypewriterProps = {
  placement: Placement;
  motion: MotionRefs;
};

/** The real scanned typewriter model, floating inside the installation. */
export default function Typewriter({ placement, motion }: TypewriterProps) {
  const ref = useInstalledObject(placement, 0, motion);

  return (
    <group ref={ref}>
      {/* The raw scan already faces +Z (toward the camera) once its up-axis
          fix is applied; the old extra 180° here turned it to face away. */}
      <TypewriterModel />
    </group>
  );
}
