import { Model as BookModel } from "../../models/book_animated_book__historical_book";
import type { MotionRefs, Placement } from "./motion";
import { useInstalledObject } from "./useInstalledObject";

type BookProps = {
  placement: Placement;
  index: number;
  motion: MotionRefs;
};

function Book({ placement, index, motion }: BookProps) {
  const ref = useInstalledObject(placement, index, motion);
  const speed = 0.7 + ((index * 0.618033988749895) % 1) * 0.7;

  return (
    <group ref={ref}>
      <BookModel scale={0.55} speed={speed} />
    </group>
  );
}

type FloatingBooksProps = {
  placements: Placement[];
  baseIndex: number;
  motion: MotionRefs;
};

export default function FloatingBooks({
  placements,
  baseIndex,
  motion,
}: FloatingBooksProps) {
  return (
    <>
      {placements.map((p, i) => (
        <Book key={i} placement={p} index={baseIndex + i} motion={motion} />
      ))}
    </>
  );
}
