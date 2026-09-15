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

type ColumnSpec = { count: number; rotated: boolean };

const COLUMNS: ColumnSpec[] = [
  { count: 5, rotated: false },
  { count: 3, rotated: true },
  { count: 3, rotated: true },
  { count: 5, rotated: false },
  { count: 3, rotated: true },
  { count: 3, rotated: true },
];

const BOOK_SPINE_MEASURED = 0.97;
const BOOK_FANNED_MEASURED = 1.46;

const WALL_SHRINK = 0.82;

const NON_MOBILE_WALL_SHRINK = 0.55;

const BOOK_SPINE = BOOK_SPINE_MEASURED * WALL_SHRINK;
const BOOK_FANNED = BOOK_FANNED_MEASURED * WALL_SHRINK;

const OUTER_GAP = BOOK_FANNED / 2 + BOOK_SPINE / 2 + 0.1 * WALL_SHRINK;
const PAIR_GAP = BOOK_SPINE + 0.03 * WALL_SHRINK;

const SPACING_Y_NORMAL = BOOK_SPINE + 0.03 * WALL_SHRINK;
const SPACING_Y_ROTATED = BOOK_FANNED + 0.1 * WALL_SHRINK;

const BOOK_SCALE = 0.55 * WALL_SHRINK;
const WALL_Z = -0.3;
const FACE_TILT = Math.PI / 2;
const ROTATED_STEP = Math.PI / 2;

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
    camera.lookAt(base.current.x + drift * -0.5, 0, -0.3);
  });

  return null;
}

type SceneContentProps = {
  motion: MotionRefs;
  cameraDistance: number;
};

function SceneContent({ motion, cameraDistance }: SceneContentProps) {
  const fogNear = Math.max(0.5, cameraDistance - 2.8);
  const fogFar = cameraDistance + 7.5;

  return (
    <>
      <fog attach="fog" args={["#e6dbcb", fogNear, fogFar]} />
      <SceneLighting />
      <PointerDriver pointerRef={motion.pointer} />
      <CameraRig motion={motion} />

      <group scale={motion.mobile ? 1 : NON_MOBILE_WALL_SHRINK}>
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

const CAMERA_FOV = 42;
const TARGET_HALF_WIDTH = 2.75;
const TARGET_HALF_HEIGHT = 2.1;
const MIN_DISTANCE = 4.6;
const MAX_DISTANCE = 11.5;

function getCameraSettings(aspect: number, mobile: boolean) {
  const vFovHalf = THREE.MathUtils.degToRad(CAMERA_FOV / 2);
  const hFovHalf = Math.atan(Math.tan(vFovHalf) * aspect);

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
      const section = containerRef.current?.closest("section") ?? null;
      if (!section) return;

      if (reducedMotion) {
        assemblyRef.current = 1;
        driftRef.current = 0;
        return;
      }

      assemblyRef.current = 0;

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
        <Suspense fallback={null}>
          <SceneContent motion={motion} cameraDistance={camera.position[2]} />
        </Suspense>
      </Canvas>
    </div>
  );
}
