import type { MutableRefObject } from "react";

/**
 * Shared motion state threaded through every object in the installation.
 *
 * - `pointer`   smoothed cursor position in normalized device coords (-1..1),
 *               updated once per frame in ReservationScene and read (not written)
 *               by every object so each can apply its own response speed.
 * - `assembly`  0 -> 1 scroll-triggered "the installation assembles itself"
 *               progress. 0 = objects are scattered off-scene, 1 = settled
 *               into their composed resting arrangement.
 * - `drift`     -1 -> 1 continuous progress as the section itself travels
 *               through the viewport, used for the slow camera/object dolly
 *               ("walking through a floating collage").
 * - `reducedMotion` true when the user prefers reduced motion — objects should
 *               skip continuous ambient motion and settle instantly.
 */
export type MotionRefs = {
  pointer: MutableRefObject<{ x: number; y: number }>;
  assembly: MutableRefObject<number>;
  drift: MutableRefObject<number>;
  reducedMotion: boolean;
  mobile: boolean;
};

/** A resting position/rotation/scale in scene space, per composed object. */
export type Placement = {
  pos: [number, number, number];
  rot: [number, number, number];
  scale: number;
  /** How strongly this object reacts to the pointer — closer objects react more. */
  depth: number;
  /** Per-object phase offset so ambient float/sway don't move in lockstep. */
  seed: number;
};

/**
 * Where an object starts before the scroll-in assembly animation settles it.
 *
 * Mirrors the Hero's papers scroll effect (`getWindTransform` in
 * FloatingPapers3D) but reversed: there, scrolling carries a paper from its
 * resting spot toward the camera, ballooning in scale as it nears the lens.
 * Here the book's *rest* pose is the wall placement it's given, so the start
 * point this function builds is the wind-style "close to the viewer and
 * oversized" pose instead, per-index offset/rotation/scale shaped the same
 * way — the assembly progress then carries it from there back to its wall
 * slot, i.e. toward the viewer -> settled, rather than settled -> toward the
 * viewer.
 */
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
