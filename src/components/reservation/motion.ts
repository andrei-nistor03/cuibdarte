import type { MutableRefObject } from "react";

export type MotionRefs = {
  pointer: MutableRefObject<{ x: number; y: number }>;
  assembly: MutableRefObject<number>;
  drift: MutableRefObject<number>;
  reducedMotion: boolean;
  mobile: boolean;
};

export type Placement = {
  pos: [number, number, number];
  rot: [number, number, number];
  scale: number;
  depth: number;
  seed: number;
};

export function scatterFrom(p: Placement, index: number): Placement {
  const side = index % 2 === 0 ? -1 : 1;
  return {
    pos: [
      p.pos[0] + side * (2.2 + index * 0.15),
      p.pos[1] + (index % 3 === 0 ? 1.3 : -1.0),
      p.pos[2] + 3.6 + index * 0.12,
    ],
    rot: [
      p.rot[0] + side * 3.2,
      p.rot[1] - side * 2.2,
      p.rot[2] + side * 5.0,
    ],
    scale: p.scale * 1.75,
    depth: p.depth,
    seed: p.seed,
  };
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpPlacement(
  from: Placement,
  to: Placement,
  t: number,
): { pos: [number, number, number]; rot: [number, number, number]; scale: number } {
  return {
    pos: [
      lerp(from.pos[0], to.pos[0], t),
      lerp(from.pos[1], to.pos[1], t),
      lerp(from.pos[2], to.pos[2], t),
    ],
    rot: [
      lerp(from.rot[0], to.rot[0], t),
      lerp(from.rot[1], to.rot[1], t),
      lerp(from.rot[2], to.rot[2], t),
    ],
    scale: lerp(from.scale, to.scale, t),
  };
}
