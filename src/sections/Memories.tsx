import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Venue from "../assets/venue.webp";
import Drinks from "../assets/drinks.webp";
import People from "../assets/people.webp";
import Shots from "../assets/shots.webp";
import Band from "../assets/band.webp";
import Books from "../assets/books.webp";
import Inside from "../assets/inside.webp";
import Insta9 from "../assets/insta9.jpg";
import Insta10 from "../assets/insta10.jpg";
import Insta6 from "../assets/insta6.jpg";
import { lockScroll } from "../lib/scrollLock";
import { useLanguage, type Language } from "../lib/languageContext";
import { translations } from "../lib/translations";

gsap.registerPlugin(ScrollTrigger);

type Depth = "far" | "mid" | "near";

type PhotoKey = keyof (typeof translations)["ro"]["memories"]["photos"];

type PhotoMeta = {
  key: PhotoKey;
  src: string;
  depth: Depth;
  rotate: number;
  /** Reveal sequence on desktop (roughly top-to-bottom), independent of DOM
   * order — which instead sets the mobile story order below. */
  order: number;
  desktop: { x: number; y: number; w: number; z: number };
};

type MemoryPhoto = PhotoMeta & {
  /** Accessible, literal description — read by screen readers, never shown. */
  alt: string;
  /** The poetic line handwritten on the print when it opens in the lightbox. */
  caption: string;
};

// Hand-composed archive wall. Every print keeps the same 4:5 frame, so
// hierarchy never comes from an arbitrarily bigger card — only from
// placement, footprint and depth. Coordinates are percentages of the
// desktop canvas (`mosaicRef`); DOM order below is also the mobile stack's
// reading order.
// `top`/`width` are both percentages of the SAME box, but the box itself is
// much wider than tall (a full-bleed canvas, not a square) — so a photo's
// rendered height in "percent of container height" is roughly
// `width% * 1.25 * (containerWidthPx / containerHeightPx)`, not `width% *
// 1.25`. Every `y`/`w` pair below was sized against that real conversion
// (checked empirically against the rendered canvas, not assumed), so a
// tile's bottom edge lands where this table implies — ignore the aspect
// ratio's own 4:5 and this whole composition drifts a tile's height low.
// Alt text and captions are localized separately, in `translations.ts`
// (keyed by `key`), and merged in at render time by `usePhotos` below.
const photoMeta: PhotoMeta[] = [
  { key: "venue", src: Venue, depth: "near", rotate: -1.5, order: 1, desktop: { x: 4, y: 5, w: 23, z: 25 } },
  { key: "people", src: People, depth: "mid", rotate: 2, order: 0, desktop: { x: 32, y: 3, w: 16, z: 20 } },
  { key: "drinks", src: Drinks, depth: "near", rotate: 3, order: 5, desktop: { x: 19, y: 40, w: 11, z: 35 } },
  { key: "band", src: Band, depth: "mid", rotate: -2, order: 3, desktop: { x: 57, y: 10, w: 17, z: 20 } },
  { key: "shots", src: Shots, depth: "far", rotate: -2, order: 8, desktop: { x: 3, y: 56, w: 11, z: 12 } },
  { key: "books", src: Books, depth: "mid", rotate: -1, order: 7, desktop: { x: 63, y: 48, w: 12, z: 20 } },
  { key: "insta6", src: Insta6, depth: "mid", rotate: 3, order: 2, desktop: { x: 87, y: 6, w: 13, z: 22 } },
  { key: "inside", src: Inside, depth: "mid", rotate: -2, order: 6, desktop: { x: 83, y: 41, w: 10, z: 20 } },
  { key: "insta9", src: Insta9, depth: "far", rotate: 2, order: 4, desktop: { x: 51, y: 26, w: 11, z: 12 } },
  { key: "insta10", src: Insta10, depth: "far", rotate: 2, order: 9, desktop: { x: 34, y: 58, w: 11, z: 12 } },
];

function usePhotos(lang: Language): MemoryPhoto[] {
  const photoText = translations[lang].memories.photos;
  return photoMeta.map((p) => ({ ...p, ...photoText[p.key] }));
}

// Bespoke placement only takes effect at `lg`+ — everything below that
// reflows through normal flex/grid, not this canvas. A plain <style> tag
// (rather than one inline `left/top/width` per breakpoint) keeps the
// per-photo coordinates readable as one table instead of scattered
// className strings.
const DESKTOP_CSS = `@media (min-width: 1024px) {
${photoMeta
  .map(
    (p) =>
      `  .mem-tile-${p.key} { left: ${p.desktop.x}%; top: ${p.desktop.y}%; width: ${p.desktop.w}%; z-index: ${p.desktop.z}; }`,
  )
  .join("\n")}
}`;

// ─── A single print on the wall ────────────────────────────────────────────

type PhotoTileProps = {
  photo: MemoryPhoto;
  index: number;
  active: boolean;
  dimmed: boolean;
  outerRef: (el: HTMLDivElement | null) => void;
  parallaxRef: (el: HTMLDivElement | null) => void;
  onOpen: (index: number, rect: DOMRect) => void;
  onHoverStart: (index: number) => void;
  onHoverEnd: () => void;
};

function PhotoTile({
  photo,
  index,
  active,
  dimmed,
  outerRef,
  parallaxRef,
  onOpen,
  onHoverStart,
  onHoverEnd,
}: PhotoTileProps) {
  const { t } = useLanguage();
  const isRightAligned = index % 2 === 1;
  const overlapsPrev = index % 3 === 2;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) =>
      onOpen(index, e.currentTarget.getBoundingClientRect()),
    [index, onOpen],
  );
  const handleEnter = useCallback(() => onHoverStart(index), [index, onHoverStart]);

  // `md:` is a min-width query, so it's still in effect at `lg` — every one
  // of these needs an explicit `lg:mt-0` or the tablet stagger keeps
  // shifting the tile down after `lg:absolute` takes over and `top` (a
  // percentage of the canvas) becomes the only offset that should apply.
  // Every photo (venue included) follows the same brick stagger here — a
  // lone big first tile used to eat one slot of the 2-col grid and leave the
  // last photo without a partner; keeping all ten the same size fills every
  // row in pairs.
  const tabletFlow = index % 2 === 0 ? "md:mt-0" : "md:mt-16 lg:mt-0";

  return (
    <div
      ref={outerRef}
      style={{ willChange: "transform", zIndex: active ? 60 : undefined }}
      className={`mem-tile-${photo.key} relative w-[68%] max-w-72 sm:w-[56%] sm:max-w-80 md:w-full md:max-w-none lg:absolute lg:w-auto ${
        isRightAligned ? "self-end md:self-auto" : "self-start md:self-auto"
      } ${overlapsPrev ? "-mt-12 sm:-mt-14 lg:mt-0" : ""} ${tabletFlow}`}
    >
      <div ref={parallaxRef} style={{ willChange: "transform" }}>
        <button
          type="button"
          onClick={handleClick}
          onMouseEnter={handleEnter}
          onMouseLeave={onHoverEnd}
          onFocus={handleEnter}
          onBlur={onHoverEnd}
          aria-label={`${t.memories.viewPhotoPrefix}: ${photo.alt}`}
          className={`group relative block w-full cursor-pointer rounded-[2px] bg-[#fdf8ee] p-3 pb-9 transition-[transform,box-shadow,opacity,filter] duration-300 ease-out active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--red)] motion-reduce:transition-none sm:p-3.5 sm:pb-11 ${
            active
              ? "-translate-y-2.5 scale-[1.04] shadow-[0_36px_48px_-14px_rgba(36,24,17,0.6),0_10px_18px_rgba(36,24,17,0.35)] motion-reduce:translate-y-0 motion-reduce:scale-100"
              : "shadow-[0_20px_32px_-10px_rgba(36,24,17,0.5),0_6px_10px_rgba(36,24,17,0.3)]"
          } ${dimmed ? "opacity-90 saturate-[0.94]" : "opacity-100"}`}
        >
          <span className="block aspect-[4/5] w-full overflow-hidden ring-1 ring-black/10">
            <img
              src={photo.src}
              alt={photo.alt}
              loading="lazy"
              className="h-full w-full object-cover"
              style={{ filter: "sepia(6%) saturate(92%) contrast(103%)" }}
            />
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── The one line of type in the whole composition ─────────────────────────

function ArchiveLabel({ labelRef }: { labelRef: (el: HTMLDivElement | null) => void }) {
  const { t } = useLanguage();
  return (
    <div ref={labelRef} className="relative mt-10 px-6 text-center md:mt-12 lg:mt-8">
      <p className="section-hand -rotate-1 text-2xl leading-snug text-[var(--ink)]/90 sm:text-3xl lg:text-4xl">
        {t.memories.archiveLabel}
      </p>
    </div>
  );
}

// ─── Lightbox — the print physically lifts off the wall ────────────────────

type LightboxProps = {
  photos: MemoryPhoto[];
  index: number;
  originRect: DOMRect;
  onClose: () => void;
  onNavigate: (dir: 1 | -1) => void;
};

function Lightbox({ photos, index, originRect, onClose, onNavigate }: LightboxProps) {
  const { t } = useLanguage();
  const backdropRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  // Only the very first frame morphs out of its thumbnail's rect — once the
  // viewer starts paging with prev/next, later rects are stale (they belong
  // to whichever tile was clicked originally), so those transitions crossfade
  // instead of a positionally-wrong "morph".
  const hasMorphed = useRef(false);
  const photo = photos[index];

  useEffect(() => lockScroll(), []);

  useEffect(() => {
    closeRef.current?.focus();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.fromTo(
      backdropRef.current,
      { opacity: 0 },
      { opacity: 1, duration: reduced ? 0.15 : 0.3, ease: "power2.out" },
    );

    if (!frameRef.current) return;

    if (!hasMorphed.current && !reduced) {
      hasMorphed.current = true;
      const finalRect = frameRef.current.getBoundingClientRect();
      const scale = Math.min(1, Math.max(0.18, originRect.width / finalRect.width));
      gsap.fromTo(
        frameRef.current,
        {
          x: originRect.left + originRect.width / 2 - (finalRect.left + finalRect.width / 2),
          y: originRect.top + originRect.height / 2 - (finalRect.top + finalRect.height / 2),
          scale,
          opacity: 0.5,
        },
        { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.65, ease: "power3.out" },
      );
    } else {
      hasMorphed.current = true;
      // Blur bridges the two photos instead of letting the eye catch a hard
      // swap — see Emil Kowalski's "use blur to mask imperfect transitions".
      gsap.fromTo(
        frameRef.current,
        { opacity: 0, scale: 0.97, filter: "blur(6px)" },
        { opacity: 1, scale: 1, filter: "blur(0px)", duration: reduced ? 0.15 : 0.32, ease: "power2.out" },
      );
    }
  }, [index, originRect]);

  const close = useCallback(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      onClose();
      return;
    }
    // Exit is deliberately faster and simpler than the entrance — the
    // decision (open) deserves the choreography, the dismissal doesn't.
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(frameRef.current, { opacity: 0, scale: 0.94, duration: 0.22, ease: "power2.in" }, 0);
    tl.to(backdropRef.current, { opacity: 0, duration: 0.22, ease: "power2.in" }, 0.02);
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") onNavigate(1);
      if (e.key === "ArrowLeft") onNavigate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, onNavigate]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) close();
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 48) onNavigate(delta > 0 ? -1 : 1);
    touchStartX.current = null;
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label={t.memories.enlargedPhoto}
      className="fixed inset-0 z-100 flex items-center justify-center bg-[rgba(20,13,9,0.82)] p-6"
      style={{ backdropFilter: "blur(6px)" }}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={close}
        aria-label={t.memories.close}
        className="absolute right-5 top-5 z-20 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[var(--red)] text-[var(--cream)] shadow-xl transition duration-200 ease-out hover:scale-110 active:scale-95 md:right-8 md:top-8"
      >
        <X size={20} strokeWidth={2.5} />
      </button>

      <button
        type="button"
        onClick={() => onNavigate(-1)}
        aria-label={t.memories.previousPhoto}
        className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[var(--red)] text-[var(--cream)] shadow-xl transition duration-200 ease-out hover:scale-110 active:scale-95 md:left-8"
      >
        <ChevronLeft size={24} strokeWidth={2.5} />
      </button>
      <button
        type="button"
        onClick={() => onNavigate(1)}
        aria-label={t.memories.nextPhoto}
        className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[var(--red)] text-[var(--cream)] shadow-xl transition duration-200 ease-out hover:scale-110 active:scale-95 md:right-8"
      >
        <ChevronRight size={24} strokeWidth={2.5} />
      </button>

      <div
        ref={frameRef}
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[85vh] w-[min(78vw,420px)] flex-col items-center rounded-[2px] bg-[#fdf8ee] p-4 pb-16 shadow-2xl sm:p-5 sm:pb-20"
      >
        <span className="block aspect-[4/5] w-full overflow-hidden ring-1 ring-black/10">
          <img
            src={photo.src}
            alt={photo.alt}
            className="h-full w-full object-cover"
            style={{ filter: "sepia(6%) saturate(92%) contrast(103%)" }}
          />
        </span>
        {/* Written straight onto the print's own blank strip, like the back
            of a real polaroid — not a caption bolted underneath it. */}
        <p className="section-hand absolute bottom-4 left-0 right-0 -rotate-1 px-4 text-center text-xl text-[var(--ink)]/85 sm:bottom-5 sm:text-2xl">
          {photo.caption}
        </p>
      </div>
    </div>
  );
}

// ─── Section ────────────────────────────────────────────────────────────────

export default function Memories() {
  const { lang, t } = useLanguage();
  const photos = usePhotos(lang);
  const sectionRef = useRef<HTMLElement>(null);
  const mosaicRef = useRef<HTMLDivElement>(null);
  const outerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const parallaxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRef = useRef<HTMLDivElement | null>(null);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<{ index: number; rect: DOMRect } | null>(null);

  const handleHoverStart = useCallback((i: number) => setHoveredIndex(i), []);
  const handleHoverEnd = useCallback(() => setHoveredIndex(null), []);
  const handleOpen = useCallback(
    (index: number, rect: DOMRect) => setLightbox({ index, rect }),
    [],
  );
  const handleClose = useCallback(() => {
    setLightbox(null);
    setHoveredIndex(null);
  }, []);
  const handleNavigate = useCallback((dir: 1 | -1) => {
    setLightbox((cur) =>
      cur === null
        ? cur
        : { index: (cur.index + dir + photoMeta.length) % photoMeta.length, rect: cur.rect },
    );
  }, []);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const labelEl = labelRef.current;

      if (reduced) {
        photoMeta.forEach((p, i) => {
          const el = outerRefs.current[i];
          if (el) gsap.set(el, { rotation: p.rotate, opacity: 1 });
        });
        if (labelEl) gsap.set(labelEl, { opacity: 1 });
        return;
      }

      const mm = gsap.matchMedia();

      // ── Desktop: the full art-directed canvas ──────────────────────────
      mm.add("(min-width: 1024px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: mosaicRef.current,
            start: "top 82%",
            // One-shot: ten lazily-loaded photos can still be shifting
            // layout well after this fires, and a reverse-then-replay would
            // snap still-unplayed tiles back to hidden and strand them.
            toggleActions: "play none none none",
          },
        });

        photoMeta.forEach((p, i) => {
          const el = outerRefs.current[i];
          if (!el) return;
          const dist = p.depth === "near" ? 46 : p.depth === "mid" ? 32 : 20;
          const fromScale = p.depth === "near" ? 0.9 : 0.95;
          tl.fromTo(
            el,
            { y: dist, opacity: 0, scale: fromScale, rotation: p.rotate + (i % 2 === 0 ? 7 : -7) },
            { y: 0, opacity: 1, scale: 1, rotation: p.rotate, duration: 0.8, ease: "power3.out" },
            p.order * 0.09,
          );
        });
        if (labelEl) {
          tl.fromTo(
            labelEl,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
            photos.length * 0.09,
          );
        }

        const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        if (!canHover) return;

        const byDepth = (depth: Depth) =>
          photos
            .map((p, i) => (p.depth === depth ? parallaxRefs.current[i] : null))
            .filter((el): el is HTMLDivElement => el !== null);
        const farEls = byDepth("far");
        const midEls = byDepth("mid");
        const nearEls = byDepth("near");

        // Pronounced, spring-eased moves per layer — not one-to-one cursor
        // tracking — is what reads as real depth rather than a gimmick.
        let frame = 0;
        const handleMove = (e: MouseEvent) => {
          if (frame) return;
          frame = requestAnimationFrame(() => {
            frame = 0;
            const rect = mosaicRef.current?.getBoundingClientRect();
            if (!rect) return;
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            gsap.to(farEls, { x: px * 22, y: py * 16, duration: 1, ease: "power3", overwrite: true });
            gsap.to(midEls, { x: px * 40, y: py * 30, duration: 0.85, ease: "power3", overwrite: true });
            gsap.to(nearEls, { x: px * 62, y: py * 46, duration: 0.7, ease: "power3", overwrite: true });
          });
        };
        const handleLeave = () => {
          gsap.to([...farEls, ...midEls, ...nearEls], {
            x: 0,
            y: 0,
            duration: 1,
            ease: "power3",
            overwrite: true,
          });
        };

        const node = mosaicRef.current;
        node?.addEventListener("mousemove", handleMove);
        node?.addEventListener("mouseleave", handleLeave);

        return () => {
          node?.removeEventListener("mousemove", handleMove);
          node?.removeEventListener("mouseleave", handleLeave);
          if (frame) cancelAnimationFrame(frame);
        };
      });

      // ── Mobile & tablet: each print reveals on its own, as it reaches the
      // viewport — a single trigger on the whole (tall, stacked) column
      // would fire every photo's reveal together the moment the column's
      // top crosses the threshold, long before later photos have scrolled
      // into view.
      mm.add("(max-width: 1023px)", () => {
        photoMeta.forEach((p, i) => {
          const el = outerRefs.current[i];
          if (!el) return;
          gsap.fromTo(
            el,
            { y: 26, opacity: 0, rotation: p.rotate * 0.6 + (i % 2 === 0 ? 4 : -4) },
            {
              y: 0,
              opacity: 1,
              rotation: p.rotate * 0.6,
              duration: 0.55,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 90%",
                toggleActions: "play none none none",
              },
            },
          );
        });
        if (labelEl) {
          gsap.fromTo(
            labelEl,
            { opacity: 0, y: 14 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: "power3.out",
              scrollTrigger: {
                trigger: labelEl,
                start: "top 92%",
                toggleActions: "play none none none",
              },
            },
          );
        }
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="memories"
      ref={sectionRef}
      className="relative scroll-mt-20 overflow-hidden bg-[var(--paper)] pt-14 pb-28 md:pt-16 md:pb-40 lg:pt-10 lg:pb-56"
    >
      <style>{DESKTOP_CSS}</style>
      <div className="grain-overlay" />

      <h2 className="sr-only">{t.memories.srHeading}</h2>

      <div
        ref={mosaicRef}
        className="relative mx-auto flex max-w-xl flex-col gap-6 px-6 sm:max-w-2xl sm:gap-8 md:grid md:max-w-4xl md:grid-cols-2 md:items-start md:gap-x-6 md:gap-y-10 md:px-10 lg:block lg:h-[88vh] lg:max-w-none lg:gap-0 lg:px-0"
      >
        {photos.map((photo, index) => (
          <PhotoTile
            key={photo.key}
            photo={photo}
            index={index}
            active={hoveredIndex === index}
            dimmed={hoveredIndex !== null && hoveredIndex !== index}
            outerRef={(el) => {
              outerRefs.current[index] = el;
            }}
            parallaxRef={(el) => {
              parallaxRefs.current[index] = el;
            }}
            onOpen={handleOpen}
            onHoverStart={handleHoverStart}
            onHoverEnd={handleHoverEnd}
          />
        ))}
      </div>

      {/* Below the canvas, never inside it — a fixed spot in normal flow
          can't ever end up behind or straddling a photo the way a
          percentage-positioned one could at some aspect ratios. */}
      <ArchiveLabel
        labelRef={(el) => {
          labelRef.current = el;
        }}
      />

      {/* The wall quiets down before the dark room of the footer takes over. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[38] h-20 md:h-28 lg:h-36"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(36,24,17,0.35))" }}
      />

      {lightbox !== null && (
        <Lightbox
          photos={photos}
          index={lightbox.index}
          originRect={lightbox.rect}
          onClose={handleClose}
          onNavigate={handleNavigate}
        />
      )}
    </section>
  );
}
