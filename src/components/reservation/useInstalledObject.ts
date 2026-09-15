import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import {
  scatterFrom,
  lerpPlacement,
  type MotionRefs,
  type Placement,
} from "./motion";

/**
 * Drives one floating object's transform every frame: it blends from its
 * scattered "off-scene" start into its composed resting placement as the
 * section's scroll-in assembly progresses, then layers ambient float/sway,
 * pointer parallax (scaled by the object's own depth) and the slow
 * scroll-through drift on top — each object reads the same shared motion
 * refs but reacts at its own speed via `placement.depth` / `placement.seed`.
 */
export function useInstalledObject(
  placement: Placement,
  index: number,
  motion: MotionRefs,
) {
  const ref = useRef<Group>(null);
  const start = useMemo(() => scatterFrom(placement, index), [placement, index]);

  useFrame(({ clock }) => {
    const group = ref.current;
    if (!group) return;

    const assembly = motion.reducedMotion
      ? 1
      : THREE.MathUtils.clamp(motion.assembly.current, 0, 1);
    const base = lerpPlacement(start, placement, assembly);

    const t = clock.elapsedTime;
    const seed = placement.seed;
    const ambient = motion.reducedMotion ? 0 : Math.min(1, assembly * 1.4);

    const floatY = Math.sin(t * 0.55 + seed) * 0.12 * ambient;
    const floatX = Math.cos(t * 0.4 + seed * 1.3) * 0.05 * ambient;
    const swayRZ = Math.sin(t * 0.35 + seed * 2.1) * 0.05 * ambient;
    const swayRX = Math.cos(t * 0.5 + seed) * 0.04 * ambient;

    const driftZ = motion.reducedMotion
      ? 0
      : motion.drift.current * placement.depth * 0.9;
    const driftX = motion.reducedMotion
      ? 0
      : motion.drift.current * placement.depth * -0.25;

    const pointerX = motion.reducedMotion
      ? 0
      : motion.pointer.current.x * placement.depth * 0.35;
    const pointerY = motion.reducedMotion
      ? 0
      : motion.pointer.current.y * placement.depth * -0.22;

    group.position.set(
      base.pos[0] + floatX + pointerX + driftX,
      base.pos[1] + floatY + pointerY,
      base.pos[2] + driftZ,
    );
    // Order "ZYX" (rather than three.js's default "XYZ") applies the X
    // component first/innermost and the Z component last/outermost, so a
    // fixed X tilt (facing the camera) and a per-instance Z spin (rotating
    // in-plane, around the axis pointing at the viewer) compose the way
    // they visually should instead of interacting through gimbal order.
    group.rotation.set(
      base.rot[0] + swayRX,
      base.rot[1] + pointerX * 0.4,
      base.rot[2] + swayRZ,
      "ZYX",
    );
    group.scale.setScalar(base.scale);
  });

  return ref;
}
