import { useEffect } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import Envelope1 from "../../assets/envelope1.png";
import Envelope2 from "../../assets/envelope2trim.png";
import paperFront4 from "../../assets/papertexturefront4.jpg";
import type { MotionRefs, Placement } from "./motion";
import { useInstalledObject } from "./useInstalledObject";

type EnvelopeCardProps = {
  placement: Placement;
  index: number;
  motion: MotionRefs;
};

/**
 * The same three-layer envelope construction as the Events section (back,
 * letter, front pocket) — but floating free as a physical object that has
 * escaped that section, with a blank paper fragment standing in for a photo.
 */
function EnvelopeCard({ placement, index, motion }: EnvelopeCardProps) {
  const ref = useInstalledObject(placement, index, motion);
  const back = useTexture(Envelope1);
  const front = useTexture(Envelope2);
  const letter = useTexture(paperFront4);

  useEffect(() => {
    back.colorSpace = THREE.SRGBColorSpace;
    front.colorSpace = THREE.SRGBColorSpace;
    letter.colorSpace = THREE.SRGBColorSpace;
  }, [back, front, letter]);

  return (
    <group ref={ref}>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[1, 0.95]} />
        <meshStandardMaterial
          map={back}
          transparent
          roughness={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.16, -0.01]}>
        <planeGeometry args={[0.56, 0.5]} />
        <meshStandardMaterial map={letter} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[1, 0.95]} />
        <meshStandardMaterial
          map={front}
          transparent
          roughness={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

type EnvelopesProps = {
  placements: Placement[];
  baseIndex: number;
  motion: MotionRefs;
};

export default function Envelopes({
  placements,
  baseIndex,
  motion,
}: EnvelopesProps) {
  return (
    <>
      {placements.map((p, i) => (
        <EnvelopeCard key={i} placement={p} index={baseIndex + i} motion={motion} />
      ))}
    </>
  );
}
