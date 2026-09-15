import { useRef } from "react";
import { MapPin, Phone } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "../../lib/languageContext";

gsap.registerPlugin(ScrollTrigger);

const PHONE_DISPLAY = "0723 549 318";
const PHONE_HREF = "tel:+40723549318";
const ADDRESS_DISPLAY = "Strada Mărășești 14, 300077 Timișoara";
const ADDRESS_HREF =
  "https://www.google.com/maps/search/?api=1&query=Strada+M%C4%83r%C4%83%C8%99e%C8%99ti+14%2C+300077+Timi%C8%99oara";

export default function ReservationText() {
  const { t } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (!rootRef.current || reduced) return;

      gsap.fromTo(
        rootRef.current.children,
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          stagger: 0.18,
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="flex flex-col gap-6 md:gap-8">
      <div className="border-l-4 border-white py-1 pl-6">
        <p className="section-title text-justify text-3xl leading-[1.15] text-white sm:text-4xl md:text-3xl lg:text-5xl">
          {t.reservation.headline}
        </p>
      </div>

      <a
        href={PHONE_HREF}
        className="group ml-6 inline-flex w-fit items-center gap-3 rounded-full border border-white/35 px-5 py-2.5 text-lg font-medium tracking-wide text-white transition hover:border-white hover:bg-white/10 sm:text-xl"
      >
        <Phone size={20} strokeWidth={2.25} className="shrink-0" />
        {PHONE_DISPLAY}
      </a>

      <a
        href={ADDRESS_HREF}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-6 inline-flex w-fit items-center gap-3 text-lg font-medium tracking-wide text-white/80 transition hover:text-white sm:text-xl"
      >
        <MapPin size={20} strokeWidth={2.25} className="shrink-0" />
        {ADDRESS_DISPLAY}
      </a>
    </div>
  );
}
