import { useRef, useState, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

import Accent from "../assets/accent.png";
import Underline from "../assets/underline.png";
import Envelope1 from "../assets/envelope1.png";
import Envelope2 from "../assets/envelope2.png";
import Insta1 from "../assets/insta1.jpg";
import Insta2 from "../assets/insta2.jpg";
import Insta3 from "../assets/insta3.jpg";
import Insta4 from "../assets/insta4.jpg";
import Insta5 from "../assets/insta5.jpg";
import Insta6 from "../assets/insta6.jpg";
import Insta7 from "../assets/insta7.jpg";
import Insta8 from "../assets/insta8.jpg";
import Insta9 from "../assets/insta9.jpg";
import Insta10 from "../assets/insta10.jpg";
import { useLanguage } from "../lib/languageContext";

const posts = [
  {
    image: Insta1,
    rotate: "-rotate-6",
    link: "https://www.instagram.com/p/DYxARw4MOqg/",
  },
  {
    image: Insta2,
    rotate: "rotate-3",
    link: "https://www.instagram.com/p/DYgqiedMW--/",
  },
  {
    image: Insta3,
    rotate: "-rotate-6",
    link: "https://www.instagram.com/p/DYRqp_asIWH/",
  },
  {
    image: Insta4,
    rotate: "rotate-6",
    link: "https://www.instagram.com/p/DYRn20FNMZ-/",
  },
  {
    image: Insta5,
    rotate: "-rotate-3",
    link: "https://www.instagram.com/p/DYE6BpiDb6N/?img_index=1",
  },
  {
    image: Insta6,
    rotate: "rotate-6",
    link: "https://www.instagram.com/p/DS94PHLDHiV/",
  },
  {
    image: Insta7,
    rotate: "-rotate-6",
    link: "https://www.instagram.com/p/DSPI0gCDOxZ/",
  },
  {
    image: Insta8,
    rotate: "rotate-3",
    link: "https://www.instagram.com/p/DL9hWVdoZuK/",
  },
  {
    image: Insta9,
    rotate: "-rotate-3",
    link: "https://www.instagram.com/p/DXmImvrDXsz/?img_index=1",
  },
  {
    image: Insta10,
    rotate: "rotate-6",
    link: "https://www.instagram.com/p/DWKNQopDC20/",
  },
];

function rotateClassToDeg(cls: string): number {
  const map: Record<string, number> = {
    "rotate-3": 3,
    "rotate-6": 6,
    "-rotate-3": -3,
    "-rotate-6": -6,
    "rotate-0": 0,
  };
  return map[cls] ?? 0;
}

type EnvelopePostProps = {
  image: string;
  rotateDeg: number;
  index: number;
  onOpen: (index: number, rect: DOMRect) => void;
};

function EnvelopePost({ image, rotateDeg, index, onOpen }: EnvelopePostProps) {
  const { t } = useLanguage();
  const wrapRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);

  const handleMouseEnter = useCallback(() => {
    if (!photoRef.current) return;
    gsap.to(photoRef.current, {
      y: -14,
      scale: 1.06,
      duration: 0.3,
      ease: "back.out(2.5)",
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!photoRef.current) return;
    gsap.to(photoRef.current, {
      y: 0,
      scale: 1,
      duration: 0.25,
      ease: "power3.out",
    });
  }, []);

  const handleClick = useCallback(() => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    onOpen(index, rect);
  }, [index, onOpen]);

  useEffect(() => {
    if (!wrapRef.current) return;
    gsap.set(wrapRef.current, { rotation: rotateDeg });
  }, [rotateDeg]);

  return (
    <div
      ref={wrapRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-envelope-index={index}
      className="relative mx-auto w-64 md:w-72 lg:w-80 aspect-[1.05/1] shrink-0 cursor-pointer"
      style={{ willChange: "transform" }}
    >
      <img
        src={Envelope1}
        alt=""
        className="absolute left-0 top-0 z-10 h-full w-full object-contain drop-shadow-xl"
      />
      <img
        ref={photoRef}
        src={image}
        alt={t.events.instagramPost}
        className="absolute left-1/2 top-[4%] z-20 h-[62%] w-[58%] -translate-x-1/2 object-cover shadow-md"
        style={{ willChange: "transform" }}
      />
      <img
        src={Envelope2}
        alt=""
        className="absolute left-0 top-0 z-30 h-full w-full object-contain drop-shadow-xl"
      />
    </div>
  );
}

type LightboxProps = {
  post: (typeof posts)[number];
  originRect: DOMRect;
  onClose: () => void;
};

function Lightbox({ post, originRect, onClose }: LightboxProps) {
  const { t } = useLanguage();
  const backdropRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const startX = originRect.left + originRect.width / 2 - vw / 2;
    const startY = originRect.top + originRect.height / 2 - vh / 2;

    tl.fromTo(
      backdropRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.35, ease: "power2.out" },
      0,
    );

    tl.fromTo(
      cardRef.current,
      { x: startX, y: startY, scale: 0.35, opacity: 0, rotation: 8 },
      {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 0.75,
        ease: "back.out(1.6)",
      },
      0.05,
    );

    tl.fromTo(
      photoRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "back.out(2)" },
      0.45,
    );

    tl.fromTo(
      btnRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" },
      0.7,
    );

    tl.fromTo(
      closeRef.current,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" },
      0.6,
    );
  }, [originRect]);

  const close = useCallback(() => {
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(
      btnRef.current,
      { y: 15, opacity: 0, duration: 0.2, ease: "power2.in" },
      0,
    );
    tl.to(
      photoRef.current,
      { y: 30, opacity: 0, duration: 0.2, ease: "power2.in" },
      0.05,
    );
    tl.to(
      cardRef.current,
      {
        scale: 0.4,
        y: 60,
        opacity: 0,
        rotation: -5,
        duration: 0.4,
        ease: "back.in(1.5)",
      },
      0.1,
    );
    tl.to(backdropRef.current, { opacity: 0, duration: 0.3 }, 0.15);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) close();
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-100 flex items-center justify-center"
      style={{
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(0,0,0,0.55)",
      }}
    >
      <div
        ref={cardRef}
        className="relative flex flex-col items-center gap-6"
        style={{ willChange: "transform" }}
      >
        <button
          ref={closeRef}
          onClick={close}
          className="cursor-pointer absolute -top-4 -right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#973028] text-[#e6dbcb] shadow-xl transition hover:scale-110"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        <img
          ref={photoRef}
          src={post.image}
          alt={t.events.instagramPost}
          className="w-72 md:w-96 lg:w-105 aspect-square object-cover shadow-2xl rounded-sm"
        />

        <a
          ref={btnRef as React.Ref<HTMLAnchorElement>}
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#973028] px-7 py-3 text-[#e6dbcb] font-semibold tracking-wide shadow-lg transition hover:scale-105 hover:bg-[#7a2420]"
          style={{ fontFamily: "inherit" }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          {t.events.seeOnInstagram}
        </a>
      </div>
    </div>
  );
}

export default function Events() {
  const { t } = useLanguage();
  const swiperRef = useRef<SwiperType | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastProgress = useRef<number>(0);
  const inertiaRafId = useRef<number | null>(null);

  const titleRef = useRef<HTMLDivElement>(null);
  const accentRefs = useRef<(HTMLImageElement | null)[]>([]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const underlineRef = useRef<HTMLImageElement>(null);
  const subheadingRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (!titleRef.current) return;

      if (reduced) {
        gsap.set(
          [
            ...accentRefs.current,
            headingRef.current,
            underlineRef.current,
            subheadingRef.current,
          ],
          { opacity: 1, clearProps: "transform,clipPath" },
        );
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      tl.fromTo(
        accentRefs.current,
        { opacity: 0, scale: 0.6 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)", stagger: 0.1 },
        0,
      );
      tl.fromTo(
        headingRef.current,
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
        0.1,
      );
      tl.fromTo(
        underlineRef.current,
        { clipPath: "inset(0 100% 0 0)", opacity: 1 },
        { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "power2.inOut" },
        0.45,
      );
      tl.fromTo(
        subheadingRef.current,
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" },
        0.85,
      );
    },
    { scope: titleRef },
  );

  const fitHeading = useCallback(() => {
    const heading = headingRef.current;
    const row = heading?.parentElement;
    const container = titleRef.current;
    if (!heading || !row || !container) return;

    heading.style.fontSize = "";
    const available = container.clientWidth - 32;
    const needed = row.scrollWidth;
    if (available > 0 && needed > available) {
      const base = parseFloat(window.getComputedStyle(heading).fontSize);
      heading.style.fontSize = `${(base * available) / needed}px`;
    }
  }, []);

  useEffect(() => {
    fitHeading();
    window.addEventListener("resize", fitHeading);
    document.fonts?.ready.then(fitHeading);
    return () => window.removeEventListener("resize", fitHeading);
  }, [fitHeading, t.events.title]);

  const [lightbox, setLightbox] = useState<{
    index: number;
    rect: DOMRect;
  } | null>(null);
  const isDragging = useRef(false);

  const applyInertiaTilt = useCallback((velocity: number) => {
    const tiltAmount = gsap.utils.clamp(-8, 8, velocity * 400);

    slideRefs.current.forEach((el, i) => {
      if (!el) return;
      const baseDeg = rotateClassToDeg(posts[i % posts.length].rotate);

      gsap.killTweensOf(el);
      gsap
        .timeline()
        .to(el, {
          rotation: baseDeg + tiltAmount,
          duration: 0.15,
          ease: "power2.out",
        })
        .to(el, {
          rotation: baseDeg,
          duration: 0.65,
          ease: "elastic.out(0.6, 0.4)",
        });
    });
  }, []);

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      const vel = swiper.progress - lastProgress.current;
      lastProgress.current = swiper.progress;
      if (!isDragging.current) applyInertiaTilt(vel);
    },
    [applyInertiaTilt],
  );

  const handleTouchStart = useCallback(() => {
    isDragging.current = true;
  }, []);
  const handleTouchEnd = useCallback((swiper: SwiperType) => {
    isDragging.current = false;
    lastProgress.current = swiper.progress;
  }, []);

  const pauseAutoplay = useCallback(() => {
    swiperRef.current?.autoplay.stop();
  }, []);

  const resumeAutoplay = useCallback(() => {
    swiperRef.current?.autoplay.start();
  }, []);

  const handleOpen = useCallback((index: number, rect: DOMRect) => {
    setLightbox({ index, rect });
    swiperRef.current?.autoplay.stop();
  }, []);

  const handleClose = useCallback(() => {
    setLightbox(null);
    swiperRef.current?.autoplay.start();
  }, []);

  useEffect(() => {
    return () => {
      if (inertiaRafId.current) cancelAnimationFrame(inertiaRafId.current);
    };
  }, []);

  return (
    <>
      <section
        id="events"
        className="relative scroll-mt-20 overflow-hidden bg-[#e6dbcb] pb-20 md:pb-24 lg:pb-44"
      >
        <div className="grain-overlay" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 70% at 50% 0%, transparent 55%, rgba(36,24,17,0.06) 100%)",
          }}
        />

        <div className="relative flex items-center justify-center pt-16 md:pt-20 lg:pt-24">
          <div
            ref={titleRef}
            className="relative flex flex-col items-center justify-center gap-2 lg:gap-5"
          >
            <div className="flex flex-row items-center justify-center gap-2 lg:gap-10">
              <img
                ref={(el) => {
                  accentRefs.current[0] = el;
                }}
                src={Accent}
                alt="Accent"
                className="rotate-180 h-5 w-5 md:h-10 md:w-10 lg:h-20 lg:w-20"
              />
              <h1
                ref={headingRef}
                className="section-title whitespace-nowrap text-3xl md:text-5xl lg:text-8xl"
              >
                {t.events.title}
              </h1>
              <img
                ref={(el) => {
                  accentRefs.current[1] = el;
                }}
                src={Accent}
                alt="Accent"
                className="h-5 w-5 md:h-10 md:w-10 lg:h-20 lg:w-20"
              />
            </div>
            <img
              ref={underlineRef}
              src={Underline}
              alt="underline"
              className="w-60 md:w-100 lg:w-200"
            />
            <h2
              ref={subheadingRef}
              className="section-subtitle text-black text-xl md:text-3xl lg:text-5xl"
            >
              {t.events.subtitle}
            </h2>
          </div>
        </div>

        <div className="relative mx-auto mt-14 max-w-7xl px-6 lg:mt-20 lg:px-12">
          <button className="cursor-pointer events-next absolute left-4 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#973028] text-[#e6dbcb] shadow-lg transition hover:scale-105 lg:left-2">
            <ChevronLeft size={34} strokeWidth={3} />
          </button>
          <button className="cursor-pointer events-prev absolute right-4 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#973028] text-[#e6dbcb] shadow-lg transition hover:scale-105 lg:right-2">
            <ChevronRight size={34} strokeWidth={3} />
          </button>

          <div
            className="relative overflow-hidden px-10 py-8 md:px-14 md:py-10 lg:px-16 lg:py-10"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
              maskImage:
                "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
            }}
          >
            <Swiper
              modules={[Navigation, Autoplay]}
              loop={posts.length > 4}
              speed={900}
              grabCursor={true}
              allowTouchMove={true}
              simulateTouch={true}
              autoplay={{ delay: 2200, disableOnInteraction: false }}
              navigation={{ prevEl: ".events-prev", nextEl: ".events-next" }}
              slidesPerView={1}
              spaceBetween={24}
              breakpoints={{
                768: { slidesPerView: 2, spaceBetween: 34 },
                1024: { slidesPerView: 4, spaceBetween: 42 },
              }}
              className="overflow-visible!"
              onSwiper={(s) => {
                swiperRef.current = s;
                lastProgress.current = s.progress;
              }}
              onSlideChange={handleSlideChange}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {posts.map((post, index) => (
                <SwiperSlide key={index}>
                  <div
                    onMouseEnter={pauseAutoplay}
                    onMouseLeave={resumeAutoplay}
                    className="flex items-center justify-center"
                  >
                    <div
                      ref={(el) => {
                        slideRefs.current[index] = el;
                      }}
                      style={{ willChange: "transform" }}
                    >
                      <EnvelopePost
                        image={post.image}
                        rotateDeg={rotateClassToDeg(post.rotate)}
                        index={index}
                        onOpen={handleOpen}
                      />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {lightbox !== null && (
        <Lightbox
          post={posts[lightbox.index]}
          originRect={lightbox.rect}
          onClose={handleClose}
        />
      )}
    </>
  );
}
