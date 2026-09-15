import { useEffect, useRef, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import cuibLogo from "../assets/logo.png";
import accent from "../assets/accent.png";
import { lockScroll } from "../lib/scrollLock";
import { useLanguage, type Language } from "../lib/languageContext";

const PHONE_DISPLAY = "0723 549 318";
const PHONE_HREF = "tel:+40723549318";

const LANGUAGES: Language[] = ["ro", "en"];

function LanguageSwitch({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useLanguage();
  return (
    <div
      role="group"
      aria-label={t.header.selectLanguage}
      className={`inline-flex shrink-0 overflow-hidden rounded-full border border-[#973028]/40 text-xs font-semibold tracking-widest ${className}`}
    >
      {LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`cursor-pointer px-3 py-1.5 uppercase transition-colors duration-300 ${
            lang === code
              ? "bg-[#973028] text-[#e6dbcb]"
              : "text-[#973028] hover:bg-[#973028]/10"
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}

type NavLinkProps = {
  href: string;
  label: string;
  onClick?: () => void;
};

function NavLink({ href, label, onClick }: NavLinkProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="section-subtitle relative text-2xl text-black transition-colors duration-300 hover:text-[#973028] lg:text-3xl after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-[#973028] after:transition-transform after:duration-500 after:ease-out hover:after:scale-x-100"
    >
      {label}
    </a>
  );
}

export default function Header() {
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const overlayItemsRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { label: t.nav.home, href: "#home" },
    { label: t.nav.events, href: "#events" },
    { label: t.nav.reservations, href: "#reservation" },
    { label: t.nav.memories, href: "#memories" },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    return lockScroll();
  }, [menuOpen]);

  useGSAP(
    () => {
      if (!overlayRef.current) return;
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (menuOpen) {
        gsap.set(overlayRef.current, { display: "flex" });
        if (reduced) {
          gsap.set(overlayRef.current, { autoAlpha: 1 });
          gsap.set(overlayItemsRef.current?.children ?? [], { autoAlpha: 1 });
          return;
        }
        gsap.fromTo(
          overlayRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.35, ease: "power2.out" },
        );
        gsap.fromTo(
          overlayItemsRef.current?.children ?? [],
          { y: 24, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.5,
            ease: "power3.out",
            stagger: 0.07,
            delay: 0.1,
          },
        );
      } else {
        gsap.to(overlayRef.current, {
          autoAlpha: 0,
          duration: reduced ? 0.01 : 0.25,
          ease: "power2.in",
          onComplete: () => gsap.set(overlayRef.current, { display: "none" }),
        });
      }
    },
    { dependencies: [menuOpen] },
  );

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header
        className={`fixed left-0 top-0 z-50 w-full transition-all duration-500 ease-out ${
          isScrolled
            ? "bg-[#e6dbcb]/85 shadow-[0_2px_16px_rgba(36,24,17,0.12)] backdrop-blur-md after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-[#973028]/25 after:content-['']"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div
            className={`relative flex items-center justify-between transition-all duration-500 ${isScrolled ? "py-2.5" : "py-4 lg:py-6"}`}
          >
            <a href="#home" className="group relative shrink-0">
              <img
                src={cuibLogo}
                alt="Cuib d'Arte"
                className={`h-16 w-auto transition-all duration-500 sm:h-18 md:h-20 ${isScrolled ? "lg:h-16" : "lg:h-22"}`}
              />
              <img
                src={accent}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute -right-4 -top-2 hidden h-6 w-6 -rotate-12 opacity-0 transition-opacity duration-500 group-hover:opacity-80 lg:block"
              />
            </a>

            <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-14 lg:flex xl:gap-20">
              {navLinks.map((link) => (
                <NavLink key={link.href} href={link.href} label={link.label} />
              ))}
            </nav>

            <div className="hidden shrink-0 items-center gap-3 lg:flex">
              <a
                href={PHONE_HREF}
                className="group inline-flex shrink-0 items-center gap-2.5 rounded-full border border-[#973028]/40 bg-[#e6dbcb]/90 px-5 py-2.5 text-sm font-medium tracking-wide text-[#973028] shadow-[0_2px_10px_rgba(36,24,17,0.15)] backdrop-blur-sm transition-all duration-300 hover:border-[#973028] hover:bg-[#973028] hover:text-[#e6dbcb]"
              >
                <Phone
                  size={16}
                  strokeWidth={2.25}
                  className="shrink-0 transition-transform duration-300 group-hover:-rotate-12"
                />
                {PHONE_DISPLAY}
              </a>
              <LanguageSwitch />
            </div>

            <div className="flex items-center gap-3 lg:hidden">
              <LanguageSwitch />
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label={t.header.openMenu}
                className="cursor-pointer text-black transition-transform duration-300 hover:scale-110"
              >
                <Menu size={28} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        ref={overlayRef}
        className="fixed inset-0 z-100 hidden flex-col bg-[#e6dbcb] lg:hidden"
        style={{ visibility: "hidden", opacity: 0 }}
      >
        <div className="grain-overlay grain-overlay--dark" />
        <div className="relative flex items-center justify-between px-6 pt-5">
          <img src={cuibLogo} alt="Cuib d'Arte" className="h-14 w-auto" />
          <button
            type="button"
            onClick={closeMenu}
            aria-label={t.header.closeMenu}
            className="cursor-pointer text-black transition-transform duration-300 hover:rotate-90"
          >
            <X size={30} strokeWidth={2} />
          </button>
        </div>

        <div
          ref={overlayItemsRef}
          className="relative flex flex-1 flex-col items-start justify-center gap-2 px-8"
        >
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="section-title flex items-baseline gap-4 py-3 text-4xl text-black transition-colors duration-300 hover:text-[#973028] sm:text-5xl"
            >
              <span className="section-subtitle text-lg text-[#973028]/60">
                0{i + 1}
              </span>
              {link.label}
            </a>
          ))}

          <a
            href={PHONE_HREF}
            onClick={closeMenu}
            className="mt-8 inline-flex items-center gap-3 rounded-full border border-[#973028]/40 px-6 py-3 text-lg font-medium tracking-wide text-[#973028] transition-colors duration-300 hover:bg-[#973028] hover:text-[#e6dbcb]"
          >
            <Phone size={18} strokeWidth={2.25} />
            {PHONE_DISPLAY}
          </a>

          <LanguageSwitch className="mt-6" />
        </div>

        <p className="relative pb-8 text-center text-xs tracking-[0.2em] text-black/40 uppercase">
          cuib d&apos;arte — Timișoara
        </p>
      </div>
    </>
  );
}
