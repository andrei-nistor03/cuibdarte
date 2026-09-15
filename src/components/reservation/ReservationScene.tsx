import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

import FloatingBooks from "./FloatingBooks";
import SceneLighting from "./SceneLighting";
import type { MotionRefs, Placement } from "./motion";

gsap.registerPlugin(ScrollTrigger);

// ─── Composition ────────────────────────────────────────────────────────────
// A wall of books: six columns, each a vertical stack facing the camera
// head-on. Columns alternate between a tall stack of upright books and a
// pair of shorter stacks turned 90° in-plane (about the axis pointing at
// the viewer), reading like tall/short pilasters rather than a uniform grid.

type ColumnSpec = { count: number; rotated: boolean };

const COLUMNS: ColumnSpec[] = [
  { count: 5, rotated: false },
  { count: 3, rotated: true },
  { count: 3, rotated: true },
  { count: 5, rotated: false },
  { count: 3, rotated: true },
  { count: 3, rotated: true },
];

// Measured off the actual model (closed → mid-flip-open bounding box, at
// BOOK_SCALE below, before WALL_SHRINK): the page-turning animation only
// ever grows the book along ONE local axis (0.71 closed up to 1.46 fully
// fanned); the other in-plane axis — the spine — stays fixed at 0.97 for
// the whole clip. A normal-orientation book therefore only ever grows
// sideways (X), and a 90°-rotated one only ever grows vertically (Y).
const BOOK_SPINE_MEASURED = 0.97;
const BOOK_FANNED_MEASURED = 1.46;

// Scales the whole wall — book size *and* every gap below — down together
// so the installation reads as a smaller object in the section rather than
// a smaller gap between full-size books.
const WALL_SHRINK = 0.82;

// The camera's width-fit dollies in closer as the container gets wider
// relative to its height (a wider horizontal FOV needs less distance to
// frame the same target width) — which is exactly backwards for this wall,
// since tablet/desktop containers get *wider* than the phone's tall column
// while the wall itself stays a fixed size. Left alone, that closes the
// gap between camera and wall faster than the frame widens, so the two
// outer columns run past the edges. Scaling the wall itself down for
// non-mobile (mobile keeps WALL_SHRINK alone, unchanged) counteracts that
// without touching the shared camera-fit math mobile also relies on.
const NON_MOBILE_WALL_SHRINK = 0.55;

const BOOK_SPINE = BOOK_SPINE_MEASURED * WALL_SHRINK;
const BOOK_FANNED = BOOK_FANNED_MEASURED * WALL_SHRINK;

// The two rotated columns in each pair (2&3, 5&6) sit flush against one
// another (PAIR_GAP, spine-to-spine — neither side ever grows there), while
// a normal column and its neighboring pair keep enough room (OUTER_GAP) for
// the normal column's own pages to fan sideways without reaching it — so the
// wall reads as four groups (upright, paired-sideways, upright,
// paired-sideways) rather than six evenly spaced columns.
const OUTER_GAP = BOOK_FANNED / 2 + BOOK_SPINE / 2 + 0.1 * WALL_SHRINK;
const PAIR_GAP = BOOK_SPINE + 0.03 * WALL_SHRINK;

// Rows within a normal column stack along the spine axis, which never
// grows, so they can sit close. Rows within a rotated column stack along
// the axis the pages fan into, so that spacing has to clear the fully-open
// width or the top/bottom books overlap their neighbor mid-flip.
const SPACING_Y_NORMAL = BOOK_SPINE + 0.03 * WALL_SHRINK;
const SPACING_Y_ROTATED = BOOK_FANNED + 0.1 * WALL_SHRINK;

const BOOK_SCALE = 0.55 * WALL_SHRINK;
const WALL_Z = -0.3;
const FACE_TILT = Math.PI / 2;
const ROTATED_STEP = Math.PI / 2;

// Opposite corners of the wall's own (shrunk) footprint, for the two warm
// point lights below.
const CORNER_X = 2.55 * WALL_SHRINK;
const CORNER_Y = 1.55 * WALL_SHRINK;
const CORNER_Z = 1.2 * WALL_SHRINK;

function buildBookWall(): Placement[] {
  const gaps = [OUTER_GAP, PAIR_GAP, OUTER_GAP, OUTER_GAP, PAIR_GAP];
  const rawX: number[] = [0];
  gaps.forEach((gap) => rawX.push(rawX[rawX.length - 1] + gap));
  const center = (rawX[0] + rawX[rawX.length - 1]) / 2;

  const placements: Placement[] = [];

  COLUMNS.forEach((column, colIndex) => {
    const x = rawX[colIndex] - center;
    const spacingY = column.rotated ? SPACING_Y_ROTATED : SPACING_Y_NORMAL;

    for (let row = 0; row < column.count; row++) {
      const y = ((column.count - 1) / 2 - row) * spacingY;
      placements.push({
        pos: [x, y, WALL_Z],
        rot: [FACE_TILT, 0, column.rotated ? ROTATED_STEP : 0],
        scale: BOOK_SCALE,
        depth: 0.5,
        seed: 2 + (colIndex * 5 + row) * 0.6,
      });
    }
  });

  return placements;
}

const BOOKS: Placement[] = buildBookWall();

/** Smooths the raw R3F pointer signal into the shared motion ref, once per frame. */
function PointerDriver({ pointerRef }: { pointerRef: MotionRefs["pointer"] }) {
  useFrame(({ pointer }) => {
    pointerRef.current.x = THREE.MathUtils.lerp(
      pointerRef.current.x,
      pointer.x,
      0.06,
    );
    pointerRef.current.y = THREE.MathUtils.lerp(
      pointerRef.current.y,
      pointer.y,
      0.06,
    );
  });
  return null;
}

/** Very subtle camera parallax + scroll dolly, layered on top of the base framing. */
function CameraRig({ motion }: { motion: MotionRefs }) {
  const { camera } = useThree();
  const base = useRef(camera.position.clone());

  useEffect(() => {
    base.current.copy(camera.position);
  }, [camera]);

  useFrame(() => {
    if (motion.reducedMotion) return;
    const px = motion.pointer.current.x;
    const py = motion.pointer.current.y;
    const drift = motion.drift.current;

    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      base.current.x + px * 0.22,
      0.08,
    );
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      base.current.y + py * 0.14,
      0.08,
    );
    camera.position.z = THREE.MathUtils.lerp(
      camera.position.z,
      base.current.z + drift * 1.4,
      0.08,
    );
    // Target x tracks the camera's own base offset (0 on mobile, 0.35
    // otherwise — see getCameraSettings) rather than always aiming at world
    // x=0: aiming past a camera that's itself offset yaws the frustum off
    // straight-down -z, which skews *which* half of the frame has spare
    // room. Keeping the two in sync (before drift's own small swing) is
    // what makes the wall sit centered instead of crowding one edge.
    camera.lookAt(base.current.x + drift * -0.5, 0, -0.3);
  });

  return null;
}

type SceneContentProps = {
  motion: MotionRefs;
  cameraDistance: number;
};

function SceneContent({ motion, cameraDistance }: SceneContentProps) {
  // Fog range tracks the camera's actual dolly distance (which itself
  // adapts to the container's aspect ratio) so the wall of books always
  // stays legible and only its very edges melt into the page. Every book
  // sits at the same world depth (see WALL_Z), so this blend applies
  // uniformly across the whole wall rather than just its far edge — the
  // colour has to stay close to the books' own warm paper tones (not the
  // section's red background) or the whole wall visibly tints that colour.
  const fogNear = Math.max(0.5, cameraDistance - 2.8);
  const fogFar = cameraDistance + 7.5;

  return (
    <>
      <fog attach="fog" args={["#e6dbcb", fogNear, fogFar]} />
      <SceneLighting />
      <PointerDriver pointerRef={motion.pointer} />
      <CameraRig motion={motion} />

      {/* Everything that makes up the wall itself — the books and the
          corner lights that hug its footprint — sits in its own group so
          it can be scaled down as a unit for tablet/desktop (see
          NON_MOBILE_WALL_SHRINK above) without touching the camera fit or
          the mobile framing at all. */}
      <group scale={motion.mobile ? 1 : NON_MOBILE_WALL_SHRINK}>
        {/* warm corner pools of light — no fixtures, just the glow a lamp
            tucked into opposite corners of the wall would cast. (No visible
            bulb mesh at the source: against the wall of books it read as a
            stray pale dot rather than a light, so only the light itself
            remains.) Positions track WALL_SHRINK so the corners keep hugging
            the wall's own (now smaller) footprint instead of sitting
            proportionally further outside it. */}
        {(
          [
            [-CORNER_X, -CORNER_Y, CORNER_Z],
            [CORNER_X, CORNER_Y, CORNER_Z],
          ] as const
        ).map((pos, i) => (
          <pointLight
            key={i}
            position={pos}
            color="#ffb066"
            intensity={6}
            distance={9}
            decay={1.6}
          />
        ))}

        <FloatingBooks placements={BOOKS} baseIndex={0} motion={motion} />
      </group>
    </>
  );
}

// Fixed vertical FOV; the camera then dollies in/out along z so that a
// consistent horizontal slice of the composition (roughly matching where the
// objects are placed) fits the frame regardless of the container's actual
// aspect ratio — the canvas is a tall, narrow column on desktop, closer to
// square on mobile, and a fixed distance/FOV pair looks wildly different
// (or clips objects entirely) across that range.
const CAMERA_FOV = 42;
const TARGET_HALF_WIDTH = 2.75;
const TARGET_HALF_HEIGHT = 2.1;
const MIN_DISTANCE = 4.6;
const MAX_DISTANCE = 11.5;

function getCameraSettings(aspect: number, mobile: boolean) {
  const vFovHalf = THREE.MathUtils.degToRad(CAMERA_FOV / 2);
  const hFovHalf = Math.atan(Math.tan(vFovHalf) * aspect);

  // Fit both a target half-width and half-height and take whichever needs
  // more distance — a short, wide container (a lot of desktop breakpoints,
  // now that the section isn't forced to full viewport height) is width-
  // unconstrained but would otherwise crop the composition vertically if
  // only the horizontal fit were considered.
  const widthDistance = TARGET_HALF_WIDTH / Math.tan(hFovHalf);
  const heightDistance = TARGET_HALF_HEIGHT / Math.tan(vFovHalf);
  const distance = THREE.MathUtils.clamp(
    Math.max(widthDistance, heightDistance),
    MIN_DISTANCE,
    MAX_DISTANCE,
  );
  return {
    position: [mobile ? 0 : 0.35, 0.05, distance] as [number, number, number],
    fov: CAMERA_FOV,
  };
}

export default function ReservationScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  const pointerRef = useRef({ x: 0, y: 0 });
  const assemblyRef = useRef(0);
  const driftRef = useRef(0);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [camera, setCamera] = useState(() => getCameraSettings(0.85, false));

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(motionQuery.matches);
    update();
    motionQuery.addEventListener("change", update);
    return () => motionQuery.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateFromSize = (width: number, height: number) => {
      if (width === 0 || height === 0) return;
      setMobile(width < 768);
      setCamera(getCameraSettings(width / height, width < 768));
    };

    updateFromSize(el.clientWidth, el.clientHeight);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const box = entry.contentBoxSize?.[0];
      if (box) updateFromSize(box.inlineSize, box.blockSize);
      else updateFromSize(entry.contentRect.width, entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const motion: MotionRefs = useMemo(
    () => ({
      pointer: pointerRef,
      assembly: assemblyRef,
      drift: driftRef,
      reducedMotion,
      mobile,
    }),
    [reducedMotion, mobile],
  );

  useGSAP(
    () => {
      // Resolve the ancestor <section> via the DOM rather than the ref prop:
      // by the time this (child) layout effect runs, the section's own ref
      // attachment in the parent may not have committed yet, but the actual
      // DOM node is already there to find.
      const section = containerRef.current?.closest("section") ?? null;
      if (!section) return;

      if (reducedMotion) {
        assemblyRef.current = 1;
        driftRef.current = 0;
        return;
      }

      assemblyRef.current = 0;

      // A fixed pixel "+=" distance sized the animation independently of the
      // viewport, which meant on short pages the user hit the bottom of the
      // page long before the trigger's end was reached and only ever saw a
      // sliver of the assembly. Anchoring both ends to the section's own
      // position relative to the viewport instead — start while its top is
      // still far below the bottom of the screen (so the wall is well under
      // way by the time it actually arrives), end while it's still entering
      // rather than waiting for its centre to reach screen-centre — front-
      // loads the assembly into the early part of the section's scroll-
      // through instead of stretching it out. Scrub keeps a little inertia
      // so it doesn't snap frame-for-frame with the wheel.
      const assemblyTrigger = ScrollTrigger.create({
        trigger: section,
        start: "top 120%",
        end: "center 70%",
        scrub: 1,
        onUpdate: (self) => {
          assemblyRef.current = self.progress;
        },
      });

      const driftTrigger = ScrollTrigger.create({
        trigger: section,
        start: "top 250%",
        end: "top 55%",
        scrub: 1,
        onUpdate: (self) => {
          driftRef.current = (self.progress - 0.5) * 2;
        },
      });

      // Fonts and GLTF assets can still be loading when this trigger's
      // start/end pixel positions are first computed; once they settle the
      // section's real height may differ from that initial measurement, so
      // recalculate once everything has actually finished loading.
      document.fonts?.ready?.then(() => ScrollTrigger.refresh());
      window.addEventListener("load", () => ScrollTrigger.refresh());

      return () => {
        assemblyTrigger.kill();
        driftTrigger.kill();
      };
    },
    { scope: containerRef, dependencies: [reducedMotion] },
  );

  return (
    <div ref={containerRef} className="absolute inset-0">
      <Canvas
        camera={{ position: camera.position, fov: camera.fov }}
        dpr={[1, 1.6]}
        gl={{ alpha: true, antialias: true }}
      >
        {/* No fallback UI, matching the Hero's papers canvas — the intro
            `Loader` is the site's one loading animation, and this section
            mounts well after it, only once scrolled into view. */}
        <Suspense fallback={null}>
          <SceneContent motion={motion} cameraDistance={camera.position[2]} />
        </Suspense>
      </Canvas>
    </div>
  );
}
