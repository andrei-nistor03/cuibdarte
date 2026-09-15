import { useEffect, useRef, useState, type ReactNode } from "react";

type LazyMountProps = {
  children: ReactNode;
  /** How far outside the viewport to start mounting, so content is ready
   *  well before it scrolls into view instead of popping in. */
  rootMargin?: string;
  className?: string;
};

/**
 * Defers mounting expensive children — a second WebGL scene, in practice —
 * until the wrapper has scrolled near the viewport. Without this, every
 * section's 3D content would initialise at once on first paint, competing
 * with the Hero's own canvas (and the intro loader's animation) for the
 * GPU and main thread before the user has scrolled anywhere.
 */
export default function LazyMount({
  children,
  rootMargin = "200px",
  className,
}: LazyMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {visible ? children : null}
    </div>
  );
}
