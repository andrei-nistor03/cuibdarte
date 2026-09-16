import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

import HeroBG from "../assets/HeroBG.jpg";
import { useLanguage } from "../lib/languageContext";

gsap.registerPlugin(SplitText);

export default function Hero() {
  const { lang, t } = useLanguage();
  const textRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (!headingRef.current || !subRef.current) return;

      let split: SplitText | null = null;
      if (reduced) {
        gsap.set([headingRef.current, subRef.current], { opacity: 0 });
      } else {
        split = SplitText.create(headingRef.current, {
          type: "chars",
          charsClass: "hero-char",
        });
        gsap.set(split.chars, {
          y: 34,
          opacity: 0,
          rotate: () => gsap.utils.random(-8, 8),
        });
        gsap.set(subRef.current, { y: 18, opacity: 0 });
      }

      const play = () => {
        if (reduced) {
          gsap.to([headingRef.current, subRef.current], {
            opacity: 1,
            duration: 0.3,
            ease: "power1.out",
            stagger: 0.1,
          });
          return;
        }
        const tl = gsap.timeline();
        tl.to(split!.chars, {
          y: 0,
          opacity: 1,
          rotate: 0,
          duration: 0.7,
          ease: "back.out(1.5)",
          stagger: 0.025,
        }).to(
          subRef.current,
          { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
          "-=0.35",
        );
      };

      const onLoaderDone = () => {
        window.clearTimeout(fallback);
        play();
      };
      window.addEventListener("cuib:loader-done", onLoaderDone, {
        once: true,
      });
      const fallback = window.setTimeout(onLoaderDone, 3500);

      return () => {
        window.clearTimeout(fallback);
        window.removeEventListener("cuib:loader-done", onLoaderDone);
        split?.revert();
      };
    },
    { scope: textRef },
  );

  return (
    <section className="relative z-30 h-140 md:h-150 lg:h-screen overflow-hidden">
      <img
        src={HeroBG}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-left md:object-bottom-left"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-5 h-24 md:h-32 lg:h-40"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.72))",
        }}
      />
      <div className="relative z-10 h-full max-w-2xl lg:max-w-7xl mx-auto py-20">
        <div className="h-full flex flex-col items-center justify-start pt-12 md:flex-row md:items-center md:justify-between md:pt-0">
          <div
            key={lang}
            ref={textRef}
            className="max-w-200 text-center md:max-w-200 md:text-left"
          >
            <h1
              ref={headingRef}
              className="section-title text-[clamp(2.75rem,6vw+1.25rem,7rem)] text-[#973028]"
            >
              {t.hero.titleLine1}
              <br />
              {t.hero.titleLine2}
            </h1>
            <p
              ref={subRef}
              className="section-subtitle text-3xl w-90 text-black"
            >
              {t.hero.subtitle}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
