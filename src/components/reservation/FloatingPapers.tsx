import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Mesh } from "three";
import paperBack from "../../assets/papertextureback.jpg";
import paperFront1 from "../../assets/papertexturefront1.jpg";
import paperFront2 from "../../assets/papertexturefront2.jpg";
import paperFront3 from "../../assets/papertexturefront3.jpg";
import type { MotionRefs, Placement } from "./motion";
import { useInstalledObject } from "./useInstalledObject";

const frontTextures = [paperFront1, paperFront2, paperFront3];

type PaperFragmentProps = {
  placement: Placement;
  index: number;
  motion: MotionRefs;
  frontTexture: string;
  size: [number, number];
};

/** A single curled, printed paper fragment — same wave-vertex trick used in the Hero. */
function PaperFragment({
  placement,
  index,
  motion,
  frontTexture,
  size,
}: PaperFragmentProps) {
  const groupRef = useInstalledObject(placement, index, motion);
  const meshRef = useRef<Mesh>(null);
  const basePositions = useRef<Float32Array | null>(null);

  const geometry = useMemo(() => {
    const [w, h] = size;
    const plane = new THREE.PlaneGeometry(w, h, 9, 12);
    basePositions.current = new Float32Array(plane.attributes.position.array);
    return plane;
  }, [size]);

  const frontMap = useTexture(frontTexture);
  const backMap = useTexture(paperBack);

  useEffect(() => {
    frontMap.colorSpace = THREE.SRGBColorSpace;
    backMap.colorSpace = THREE.SRGBColorSpace;
  }, [frontMap, backMap]);

  useFrame(({ clock }) => {
    if (motion.reducedMotion || !basePositions.current) return;
    const position = geometry.attributes.position;
    const base = basePositions.current;
    const t = clock.elapsedTime;
    const curl = 0.03 + Math.min(1, motion.assembly.current) * 0.02;

    for (let i = 0; i < position.count; i++) {
      const x = base[i * 3];
      const y = base[i * 3 + 1];
      const wave =
        Math.sin(x * 4 + t * 1.3 + placement.seed) * curl +
        Math.cos(y * 5 + t * 1.0 + placement.seed) * curl * 0.7;
      position.array[i * 3 + 2] = wave;
    }
    position.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          map={frontMap}
          roughness={0.92}
          metalness={0}
          side={THREE.FrontSide}
        />
      </mesh>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          map={backMap}
          roughness={0.92}
          metalness={0}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

type FloatingPapersProps = {
  placements: Placement[];
  baseIndex: number;
  motion: MotionRefs;
};

export default function FloatingPapers({
  placements,
  baseIndex,
  motion,
}: FloatingPapersProps) {
  return (
    <>
      {placements.map((p, i) => (
        <PaperFragment
          key={i}
          placement={p}
          index={baseIndex + i}
          motion={motion}
          frontTexture={frontTextures[i % frontTextures.length]}
          size={i % 2 === 0 ? [0.62, 0.85] : [0.5, 0.68]}
        />
      ))}
    </>
  );
}
