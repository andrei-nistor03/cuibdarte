import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh } from "three";
import type { MotionRefs, Placement } from "./motion";
import { useInstalledObject } from "./useInstalledObject";

type RibbonSpec = {
  length: number;
  width: number;
  curveAmp: number;
  curveFreq: number;
  color: string;
};

/**
 * Builds a long paper strip pre-bent into a gentle S-curve (the "wave-like
 * formations" hanging in the real interior), using the same vertex-displacement
 * trick as the Hero's floating papers so it can also flutter over time.
 */
function useRibbonGeometry(spec: RibbonSpec) {
  return useMemo(() => {
    const segments = 44;
    const geo = new THREE.PlaneGeometry(spec.width, spec.length, 2, segments);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const v = y / spec.length; // -0.5..0.5
      const curveX = Math.sin(v * Math.PI * spec.curveFreq) * spec.curveAmp;
      const curveZ =
        Math.cos(v * Math.PI * spec.curveFreq * 0.7) * spec.curveAmp * 0.55;
      pos.setX(i, pos.getX(i) + curveX);
      pos.setZ(i, curveZ);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();

    const base = new Float32Array(pos.array);
    return { geo, base };
  }, [spec]);
}

type RibbonProps = {
  placement: Placement;
  index: number;
  motion: MotionRefs;
  spec: RibbonSpec;
};

function Ribbon({ placement, index, motion, spec }: RibbonProps) {
  const ref = useInstalledObject(placement, index, motion);
  const meshRef = useRef<Mesh>(null);
  const { geo, base } = useRibbonGeometry(spec);

  useFrame(({ clock }) => {
    if (motion.reducedMotion) return;
    const position = geo.attributes.position;
    const t = clock.elapsedTime;

    for (let i = 0; i < position.count; i++) {
      const bx = base[i * 3];
      const by = base[i * 3 + 1];
      const bz = base[i * 3 + 2];
      const flutter = Math.sin(by * 2.2 + t * 1.1 + placement.seed) * 0.045;
      position.array[i * 3] = bx + flutter * 0.4;
      position.array[i * 3 + 2] = bz + flutter;
    }
    position.needsUpdate = true;
  });

  return (
    <group ref={ref}>
      <mesh ref={meshRef} geometry={geo}>
        <meshStandardMaterial
          color={spec.color}
          roughness={0.85}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

type PaperRibbonsProps = {
  placements: Placement[];
  baseIndex: number;
  motion: MotionRefs;
};

const SPECS: RibbonSpec[] = [
  { length: 3.6, width: 0.22, curveAmp: 0.55, curveFreq: 1.6, color: "#973028" },
  { length: 3.1, width: 0.18, curveAmp: 0.4, curveFreq: 1.3, color: "#f2e8d8" },
  { length: 2.6, width: 0.16, curveAmp: 0.35, curveFreq: 1.9, color: "#c9a54a" },
];

export default function PaperRibbons({
  placements,
  baseIndex,
  motion,
}: PaperRibbonsProps) {
  return (
    <>
      {placements.map((p, i) => (
        <Ribbon
          key={i}
          placement={p}
          index={baseIndex + i}
          motion={motion}
          spec={SPECS[i % SPECS.length]}
        />
      ))}
    </>
  );
}
