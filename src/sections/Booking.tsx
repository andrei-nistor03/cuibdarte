import LazyMount from "../components/LazyMount";
import ReservationText from "../components/reservation/ReservationText";
import ReservationScene from "../components/reservation/ReservationScene";

export default function Booking() {
  return (
    <section
      id="reservation"
      className="relative scroll-mt-20 overflow-hidden bg-[#973028] pt-32 pb-14 md:min-h-190 md:py-0 lg:min-h-230"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(65% 60% at 68% 45%, rgba(255,176,102,0.16) 0%, rgba(255,176,102,0.05) 42%, transparent 70%), radial-gradient(90% 60% at 15% 100%, rgba(0,0,0,0.18) 0%, transparent 60%)",
        }}
      />
      <div className="grain-overlay" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-5 h-24 md:h-32 lg:h-40"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.35), transparent)",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-5 h-24 md:h-32 lg:h-40"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.72))",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-450 flex-col px-6 pb-16 md:min-h-190 md:flex-row md:items-center md:pt-24 md:pb-28 lg:min-h-230 lg:px-12 lg:pt-28 lg:pb-36">
        <div className="md:w-[40%]">
          <ReservationText />
        </div>
      </div>
      <div className="relative -top-20 h-120 w-full lg:h-340 md:absolute md:top-30 md:right-0 md:bottom-28 md:h-100 md:w-[64%] lg:-top-80 lg:bottom-36 lg:w-[60%]">
        <LazyMount rootMargin="150px" className="absolute inset-0">
          <ReservationScene />
        </LazyMount>
      </div>
    </section>
  );
}
