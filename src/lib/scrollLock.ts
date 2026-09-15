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
