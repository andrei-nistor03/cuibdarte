/**
 * A reference-counted lock on `<html>`'s `overflow`, shared by every part of
 * the app that needs to suspend page scroll (the intro `Loader`, the mobile
 * nav drawer, …). Each caller independently snapshotting and restoring
 * `document.documentElement.style.overflow` is a race the moment two such
 * locks can ever be active back to back: whichever one's cleanup runs last
 * "restores" the property to whatever it happened to read on ITS OWN mount —
 * which, if another lock was already active at that point, is the other
 * lock's "hidden", not the page's true original value. That's exactly how a
 * closed mobile-menu effect or a finished intro used to permanently re-lock
 * scroll after the real unlock had already happened.
 *
 * Counting locks instead means only the very first `lockScroll()` call ever
 * captures the original value, and only the call that brings the count back
 * to zero ever restores it — correct regardless of how many locks are held,
 * in what order they're taken, or how they interleave.
 */

let lockCount = 0;
let originalOverflow: string | null = null;

export function lockScroll(): () => void {
  const root = document.documentElement;

  if (lockCount === 0) {
    originalOverflow = root.style.overflow;
    root.style.overflow = "hidden";
  }
  lockCount++;

  let released = false;
  return () => {
    if (released) return;
    released = true;

    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      root.style.overflow = originalOverflow ?? "";
      originalOverflow = null;
    }
  };
}
