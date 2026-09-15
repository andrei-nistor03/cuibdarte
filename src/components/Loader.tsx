import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import cuibLogo from "../assets/logo.png";
import paperTexture from "../assets/papertextureback.jpg";
import { lockScroll } from "../lib/scrollLock";

export default function Loader() {
  const [mounted, setMounted] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const ruleRef = useRef<HTMLSpanElement>(null);
  const crackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!rootRef.current) return;

      const unlock = lockScroll();

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        unlock();
        setMounted(false);
        window.dispatchEvent(new Event("cuib:loader-done"));
      };

      const safety = window.setTimeout(finish, 3200);

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduced) {
        const fadeTween = gsap.to(rootRef.current, {
          opacity: 0,
          duration: 0.4,
          delay: 0.15,
          ease: "power1.out",
          onComplete: () => {
            window.clearTimeout(safety);
            finish();
          },
        });
        return () => {
          window.clearTimeout(safety);
          fadeTween.kill();
          if (!finished) unlock();
        };
      }

      gsap.set([leftRef.current, rightRef.current], { xPercent: 0 });
      gsap.set(logoRef.current, { autoAlpha: 0, y: 14, scale: 0.92 });
      gsap.set(ruleRef.current, { scaleX: 0 });

      const tl = gsap.timeline({
        delay: 0.15,
        onComplete: () => {
          window.clearTimeout(safety);
          finish();
        },
      });

      tl.to(logoRef.current, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "power3.out",
      })
        .to(
          ruleRef.current,
          { scaleX: 1, duration: 0.45, ease: "power2.inOut" },
          "-=0.2",
        )
        .to({}, { duration: 0.25 })
        .to(
          [logoRef.current, ruleRef.current, crackRef.current],
          { autoAlpha: 0, y: -10, duration: 0.3, ease: "power2.in" },
          "open",
        )
        .to(
          leftRef.current,
          {
            xPercent: -101,
            rotateY: -4,
            duration: 0.75,
            ease: "power4.inOut",
          },
          "open",
        )
        .to(
          rightRef.current,
          {
            xPercent: 101,
            rotateY: 4,
            duration: 0.75,
            ease: "power4.inOut",
          },
          "open",
        );

      return () => {
        window.clearTimeout(safety);
        tl.kill();
        if (!finished) unlock();
      };
    },
    { scope: rootRef, dependencies: [] },
  );

  if (!mounted) return null;

  const panelStyle: React.CSSProperties = {
    backgroundColor: "var(--cream)",
    backgroundImage: `url(${paperTexture})`,
    backgroundSize: "cover",
    backgroundBlendMode: "multiply",
    backgroundPosition: "center",
  };

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-999 overflow-hidden"
      style={{ perspective: "1600px" }}
      aria-hidden="true"
    >
      <div
        ref={leftRef}
        className="absolute inset-y-0 left-0 w-1/2 shadow-[8px_0_30px_rgba(0,0,0,0.25)]"
        style={{ ...panelStyle, transformOrigin: "left center" }}
      />
      <div
        ref={rightRef}
        className="absolute inset-y-0 right-0 w-1/2 shadow-[-8px_0_30px_rgba(0,0,0,0.25)]"
        style={{ ...panelStyle, transformOrigin: "right center" }}
      />

      <div
        ref={crackRef}
        className="pointer-events-none absolute inset-y-0 left-1/2 w-8 -translate-x-1/2 bg-linear-to-r from-black/15 via-black/0 to-black/15"
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6">
        <div className="relative">
          <img
            ref={logoRef}
            src={cuibLogo}
            alt="Cuib d'Arte"
            className="h-20 w-auto sm:h-24"
          />
        </div>
        <span
          ref={ruleRef}
          className="h-0.75 w-40 origin-center bg-[#973028] sm:w-48"
        />
      </div>
    </div>
  );
}
