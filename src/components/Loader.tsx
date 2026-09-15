import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import cuibLogo from "../assets/logo.png";
import paperTexture from "../assets/papertextureback.jpg";
import { lockScroll } from "../lib/scrollLock";

/**
 * The front door of Cuib d'Arte. Two paper-textured panels stand shut over
 * the page; the wordmark fades up, gets underlined in red, then stamped —
 * and only once the ink has "landed" do the panels swing open like heavy
 * old doors, handing the page to the Hero underneath.
 *
 * Skips itself (after a brief fade) when `prefers-reduced-motion` is set.
 * It plays on every full page load (including refreshes) — nothing is
 * persisted to skip it on a later visit in the same tab.
 */
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

      // Scroll-lock and its release live in ONE place, with three
      // independent paths back to the same `finish()` — natural timeline
      // completion, the hard safety ceiling below, and this effect's own
      // cleanup — so the page can never be left permanently un-scrollable
      // no matter which path actually fires first. The lock itself goes
      // through the shared, reference-counted `lockScroll()` rather than
      // reading/writing `<html>`'s `overflow` directly — this component
      // isn't the page's only lock holder (the mobile nav drawer is
      // another), and two independent "snapshot then restore" locks on the
      // same property race the moment they're ever active back to back.
      const unlock = lockScroll();

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        unlock();
        setMounted(false);
        // Lets whatever sits underneath (the Hero title) wait to reveal
        // itself until the doors are actually out of the way, instead of
        // running its own entrance in parallel where it'd finish — unseen —
        // long before the panels ever slide open.
        window.dispatchEvent(new Event("cuib:loader-done"));
      };

      // A cold first paint (fonts, the Hero's own paper canvas, this
      // section's textures) can leave the main thread heavily contended,
      // which stretches a rAF-driven GSAP timeline's *wall-clock* time even
      // though its animation-time math is unaffected. Rather than trust
      // that the timeline always resolves promptly, a hard ceiling forces
      // the door open regardless — the intro should never be the reason a
      // slow device keeps someone waiting.
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
          // Kill this instance's own tween so a StrictMode phantom
          // mount/cleanup pass can never leave it running to race the real
          // instance's tween for who gets to call finish() first — only
          // release the lock here, never hide the component from a
          // teardown.
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

      // Guarantees the scroll lock specifically is never left behind by a
      // torn-down effect instance (a real unmount, or dev StrictMode's
      // harmless phantom mount/cleanup pass) — it deliberately does NOT
      // call finish() here, so a phantom cleanup can never hide it before
      // the real instance gets to animate. It DOES kill `tl`, though:
      // without that, a StrictMode phantom pass leaves
      // its timeline running orphaned alongside the real instance's own new
      // timeline, and whichever of the two finishes first wins the race to
      // unlock scroll and flip `mounted` — sometimes leaving the page
      // permanently un-scrollable if the loser's onComplete never gets a
      // chance to fire on a torn-down instance.
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

      {/* the crack of shadow where the two doors meet */}
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
