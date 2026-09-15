import type { PointLight } from "three";
import { Model as LampModel } from "../../models/1920s_table_lamps_type_a";
import type { MotionRefs, Placement } from "./motion";
import { useInstalledObject } from "./useInstalledObject";

const GLOW_COLOR = "#ffcf8f";

type VintageLampProps = {
  placement: Placement;
  motion: MotionRefs;
  lightRef: React.RefObject<PointLight | null>;
};

/** The real 1920s wooden table lamp, its glow lighting nearby objects. */
export default function VintageLamp({
  placement,
  motion,
  lightRef,
}: VintageLampProps) {
  const ref = useInstalledObject(placement, 1, motion);

  return (
    <group ref={ref}>
      <LampModel scale={0.6} />

      {/* the warm bulb glow the real fixture would cast */}
      <mesh position={[0, 0.18, 0]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial
          color={GLOW_COLOR}
          emissive={GLOW_COLOR}
          emissiveIntensity={1.8}
          roughness={0.4}
        />
      </mesh>

      <pointLight
        ref={lightRef}
        position={[0, 0.18, 0]}
        color="#ffb066"
        intensity={2.6}
        distance={4.2}
        decay={2}
      />
    </group>
  );
}
