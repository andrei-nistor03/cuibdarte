import { Canvas, useFrame } from "@react-three/fiber";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import paperBack from "../assets/papertextureback.jpg";
import paperFront1 from "../assets/papertexturefront1.jpg";
import paperFront2 from "../assets/papertexturefront2.jpg";
import paperFront3 from "../assets/papertexturefront3.jpg";
import paperFront4 from "../assets/papertexturefront4.jpg";

type PaperData = {
  pos: [number, number, number];
  scale: [number, number, number];
  rot: [number, number, number];
  frontTexture: string;
};

type Transform = {
  px: number;
  py: number;
  pz: number;
  rx: number;
  ry: number;
  rz: number;
  sx: number;
  sy: number;
  sz: number;
};

type Phase = "intro" | "float" | "wind" | "returning";

const INTRO_BASE_DELAY = 0.25;
const INTRO_STAGGER = 0.18;
const INTRO_BASE_DURATION = 2.8;
const INTRO_DURATION_STAGGER = 0.12;
const WIND_TWEEN_DURATION = 0.25;
const SOFT_RETURN_DURATION = 1.4;
const TOP_THRESHOLD = 2;

const frontTextures = [paperFront1, paperFront2, paperFront3, paperFront4];

const papers: PaperData[] = [
  {
    pos: [-3.7, 1.4, -1.5],
    scale: [0.7, 0.95, 1],
    rot: [1.57, 0.0, 0.1],
    frontTexture: frontTextures[0],
  },
  {
    pos: [-2.1, -1.1, -0.5],
    scale: [0.5, 0.75, 1],
    rot: [1.2, 0.3, -0.6],
    frontTexture: frontTextures[1],
  },
  {
    pos: [-0.4, 1.7, -1.2],
    scale: [0.6, 0.85, 1],
    rot: [1.6, -0.2, 0.2],
    frontTexture: frontTextures[2],
  },
  {
    pos: [1.5, -0.8, -0.8],
    scale: [0.75, 1.0, 1],
    rot: [-1.4, 0.1, -0.4],
    frontTexture: frontTextures[3],
  },
  {
    pos: [3.4, 1.1, -1.6],
    scale: [0.55, 0.8, 1],
    rot: [1.6, -0.1, 0.3],
    frontTexture: frontTextures[0],
  },
  {
    pos: [2.7, -2.0, -0.3],
    scale: [0.42, 0.6, 1],
    rot: [-1.3, 0.2, 0.6],
    frontTexture: frontTextures[1],
  },
  {
    pos: [-4.4, -2.1, -1.8],
    scale: [0.45, 0.65, 1],
    rot: [-1.6, -0.3, -0.7],
    frontTexture: frontTextures[2],
  },
];

function getLaunchTransform(data: PaperData, index: number): Transform {
  return {
    px: data.pos[0] + (index % 2 === 0 ? -1.2 : 1.2),
    py: data.pos[1] + 9 + index * 0.35,
    pz: data.pos[2] - 1.5,
    rx: data.rot[0] + (index % 2 === 0 ? -3.5 : 3.5),
    ry: data.rot[1] + (index % 2 === 0 ? 2.4 : -2.4),
    rz: data.rot[2] + (index % 2 === 0 ? 4.5 : -4.5),
    sx: data.scale[0] * 0.85,
    sy: data.scale[1] * 0.85,
    sz: data.scale[2],
  };
}

function getRestTransform(data: PaperData): Transform {
  return {
    px: data.pos[0],
    py: data.pos[1],
    pz: data.pos[2],
    rx: data.rot[0],
    ry: data.rot[1],
    rz: data.rot[2],
    sx: data.scale[0],
    sy: data.scale[1],
    sz: data.scale[2],
  };
}

function getWindTransform(data: PaperData, index: number): Transform {
  const side = index % 2 === 0 ? -1 : 1;

  return {
    px: data.pos[0] + side * (2.5 + index * 0.2),
    py: data.pos[1] + (index % 3 === 0 ? 1.4 : -0.8),
    pz: 5.8 + index * 0.25,
    rx: data.rot[0] + side * 4.2,
    ry: data.rot[1] - side * 2.6,
    rz: data.rot[2] + side * 6.2,
    sx: data.scale[0] * 2.2,
    sy: data.scale[1] * 2.2,
    sz: data.scale[2],
  };
}

function lerpTransform(
  from: Transform,
  to: Transform,
  progress: number,
): Transform {
  return {
    px: THREE.MathUtils.lerp(from.px, to.px, progress),
    py: THREE.MathUtils.lerp(from.py, to.py, progress),
    pz: THREE.MathUtils.lerp(from.pz, to.pz, progress),
    rx: THREE.MathUtils.lerp(from.rx, to.rx, progress),
    ry: THREE.MathUtils.lerp(from.ry, to.ry, progress),
    rz: THREE.MathUtils.lerp(from.rz, to.rz, progress),
    sx: THREE.MathUtils.lerp(from.sx, to.sx, progress),
    sy: THREE.MathUtils.lerp(from.sy, to.sy, progress),
    sz: THREE.MathUtils.lerp(from.sz, to.sz, progress),
  };
}

function applyTransform(mesh: THREE.Group, transform: Transform) {
  mesh.position.set(transform.px, transform.py, transform.pz);
  mesh.rotation.set(transform.rx, transform.ry, transform.rz);
  mesh.scale.set(transform.sx, transform.sy, transform.sz);
}

function tweenTransform(
  proxy: Transform,
  target: Transform,
  vars: gsap.TweenVars,
) {
  return gsap.to(proxy, {
    px: target.px,
    py: target.py,
    pz: target.pz,
    rx: target.rx,
    ry: target.ry,
    rz: target.rz,
    sx: target.sx,
    sy: target.sy,
    sz: target.sz,
    ...vars,
  });
}

function getResponsivePaperData(): PaperData[] {
  if (typeof window === "undefined") return papers;

  const width = window.innerWidth;

  if (width >= 1024) return papers;

  const factor = width < 640 ? 1 : 0.72;
  const xFactor = width < 640 ? 0.5 : 0.62;
  const yFactor = width < 640 ? 1 : 0.82;
  const yOffset = width < 640 ? 1.2 : 1.3;

  return papers.map((paper) => ({
    ...paper,
    pos: [
      paper.pos[0] * xFactor,
      paper.pos[1] * yFactor + yOffset,
      paper.pos[2],
    ],
    scale: [paper.scale[0] * factor, paper.scale[1] * factor, paper.scale[2]],
  }));
}

function getCameraSettings() {
  if (typeof window === "undefined") {
    return { position: [0, 0, 6] as [number, number, number], fov: 45 };
  }

  const width = window.innerWidth;

  return {
    position: [0, 0, width < 640 ? 7.4 : width < 1024 ? 6.8 : 6] as [
      number,
      number,
      number,
    ],
    fov: width < 640 ? 52 : width < 1024 ? 48 : 45,
  };
}

function getScrollDistance() {
  const width = window.innerWidth;

  if (width < 640) return window.innerHeight * 0.5;
  if (width < 1024) return window.innerHeight * 0.3;
  return window.innerHeight * 0.85;
}

interface PaperProps {
  data: PaperData;
  index: number;
  scrollProgressRef: MutableRefObject<number>;
  softResetKey: number;
}

function Paper({ data, index, scrollProgressRef, softResetKey }: PaperProps) {
  const meshRef = useRef<THREE.Group>(null);
  const basePositionsRef = useRef<Float32Array | null>(null);
  const proxyRef = useRef<Transform>(getLaunchTransform(data, index));
  const tweenRef = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null);
  const phaseRef = useRef<Phase>("intro");
  const lastWindProgressRef = useRef(-1);
  const floatBlendRef = useRef(0);

  const geometry = useMemo(() => {
    const plane = new THREE.PlaneGeometry(1, 1.35, 18, 24);
    basePositionsRef.current = new Float32Array(
      plane.attributes.position.array,
    );
    return plane;
  }, []);

  const frontMap = useTexture(data.frontTexture);
  const backMap = useTexture(paperBack);

  useEffect(() => {
    frontMap.colorSpace = THREE.SRGBColorSpace;
    frontMap.anisotropy = 8;
    backMap.colorSpace = THREE.SRGBColorSpace;
    backMap.anisotropy = 8;
  }, [frontMap, backMap]);

  const killTween = useCallback(() => {
    tweenRef.current?.kill();
    tweenRef.current = null;
  }, []);

  const playIntroFromLaunch = useCallback(() => {
    const launch = getLaunchTransform(data, index);
    const rest = getRestTransform(data);

    killTween();
    phaseRef.current = "intro";
    lastWindProgressRef.current = -1;
    floatBlendRef.current = 0;
    Object.assign(proxyRef.current, launch);

    if (meshRef.current) {
      applyTransform(meshRef.current, launch);
    }

    tweenRef.current = tweenTransform(proxyRef.current, rest, {
      duration: INTRO_BASE_DURATION + index * INTRO_DURATION_STAGGER,
      delay: INTRO_BASE_DELAY + index * INTRO_STAGGER,
      ease: "power4.out",
      onComplete: () => {
        phaseRef.current = "float";
        floatBlendRef.current = 0;
        lastWindProgressRef.current = -1;
        tweenRef.current = null;
      },
    });
  }, [data, index, killTween]);

  const returnToRestFromCurrent = useCallback(() => {
    const rest = getRestTransform(data);

    killTween();
    phaseRef.current = "returning";
    lastWindProgressRef.current = -1;
    floatBlendRef.current = 0;

    tweenRef.current = tweenTransform(proxyRef.current, rest, {
      duration: SOFT_RETURN_DURATION,
      ease: "power3.out",
      overwrite: true,
      onComplete: () => {
        phaseRef.current = "float";
        floatBlendRef.current = 0;
        tweenRef.current = null;
      },
    });
  }, [data, killTween]);

  useEffect(() => {
    playIntroFromLaunch();

    return () => {
      killTween();
    };
  }, [playIntroFromLaunch, killTween]);

  useEffect(() => {
    if (softResetKey === 0) return;

    returnToRestFromCurrent();
  }, [softResetKey, returnToRestFromCurrent]);

  useFrame(({ clock }) => {
    if (!meshRef.current || !basePositionsRef.current) return;

    const mesh = meshRef.current;
    const elapsed = clock.elapsedTime;
    const windProgress = scrollProgressRef.current;

    if (windProgress > 0) {
      if (phaseRef.current !== "wind") {
        killTween();
        phaseRef.current = "wind";
        lastWindProgressRef.current = -1;
        floatBlendRef.current = 0;
      }

      if (Math.abs(windProgress - lastWindProgressRef.current) > 0.001) {
        const rest = getRestTransform(data);
        const wind = getWindTransform(data, index);
        const progress = THREE.MathUtils.smoothstep(windProgress, 0, 1);
        const target = lerpTransform(rest, wind, progress);

        lastWindProgressRef.current = windProgress;
        killTween();
        tweenRef.current = tweenTransform(proxyRef.current, target, {
          duration: WIND_TWEEN_DURATION,
          ease: "power2.out",
          overwrite: true,
        });
      }
    }

    if (phaseRef.current === "float") {
      floatBlendRef.current = Math.min(2.5, floatBlendRef.current + 0.008);

      const blend = floatBlendRef.current;
      const transform = proxyRef.current;
      const floatY = Math.sin(elapsed * 0.8 + index) * 0.08 * blend;
      const floatRX = Math.sin(elapsed * 0.7 + index) * 0.08 * blend;
      const floatRZ = Math.cos(elapsed * 0.6 + index) * 0.06 * blend;

      mesh.position.set(transform.px, transform.py + floatY, transform.pz);
      mesh.rotation.set(
        transform.rx + floatRX,
        transform.ry,
        transform.rz + floatRZ,
      );
      mesh.scale.set(transform.sx, transform.sy, transform.sz);
    } else {
      applyTransform(mesh, proxyRef.current);
    }

    const position = geometry.attributes.position;
    const base = basePositionsRef.current;

    for (let i = 0; i < position.count; i++) {
      const x = base[i * 3];
      const y = base[i * 3 + 1];
      const wave =
        Math.sin(x * 5 + elapsed * 2 + index) * 0.035 +
        Math.cos(y * 6 + elapsed * 1.5) * 0.025;

      position.array[i * 3] = x;
      position.array[i * 3 + 1] = y;
      position.array[i * 3 + 2] = wave;
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  const launch = getLaunchTransform(data, index);

  return (
    <group
      ref={meshRef}
      position={[launch.px, launch.py, launch.pz]}
      rotation={[launch.rx, launch.ry, launch.rz]}
      scale={[launch.sx, launch.sy, launch.sz]}
    >
      <mesh geometry={geometry}>
        <meshStandardMaterial
          map={frontMap}
          roughness={0.9}
          metalness={0}
          side={THREE.FrontSide}
        />
      </mesh>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          map={backMap}
          roughness={0.9}
          metalness={0}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

export default function FloatingPapers3D() {
  const scrollProgressRef = useRef(0);
  const hasLeftTopRef = useRef(false);
  const hasCompletedScrollAnimationRef = useRef(false);

  const [sceneKey, setSceneKey] = useState(0);
  const [softResetKey, setSoftResetKey] = useState(0);
  const [isHiddenAfterFinish, setIsHiddenAfterFinish] = useState(false);
  const [responsivePapers, setResponsivePapers] = useState<PaperData[]>(papers);
  const [cameraSettings, setCameraSettings] = useState(getCameraSettings);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setResponsivePapers(getResponsivePaperData());
      setCameraSettings(getCameraSettings());
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const atTop = scrollY <= TOP_THRESHOLD;

      if (atTop) {
        if (!hasLeftTopRef.current && !hasCompletedScrollAnimationRef.current)
          return;

        hasLeftTopRef.current = false;
        scrollProgressRef.current = 0;

        if (hasCompletedScrollAnimationRef.current) {
          hasCompletedScrollAnimationRef.current = false;
          setIsHiddenAfterFinish(false);
          setSceneKey((key) => key + 1);
        } else {
          setIsHiddenAfterFinish(false);
          setSoftResetKey((key) => key + 1);
        }

        return;
      }

      hasLeftTopRef.current = true;

      if (hasCompletedScrollAnimationRef.current) return;

      const progress = THREE.MathUtils.clamp(
        scrollY / getScrollDistance(),
        0,
        1,
      );
      scrollProgressRef.current = progress;

      if (progress >= 1) {
        hasCompletedScrollAnimationRef.current = true;
        scrollProgressRef.current = 1;
        setIsHiddenAfterFinish(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-45 h-screen w-screen ${isHiddenAfterFinish ? "hidden" : ""}`}
    >
      <Canvas camera={cameraSettings} gl={{ alpha: true }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} />

        {/* No fallback UI: the intro `Loader` is the site's one loading
            animation. A visible "Loading %" pill here would read as a
            second one, popping up after the door animation finishes if the
            (large) paper textures are still in flight — the papers just
            pop in once ready, masked by their own flight-in tween. */}
        <Suspense fallback={null}>
          <group key={sceneKey}>
            {responsivePapers.map((paper, index) => (
              <Paper
                key={index}
                data={paper}
                index={index}
                scrollProgressRef={scrollProgressRef}
                softResetKey={softResetKey}
              />
            ))}
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
}
