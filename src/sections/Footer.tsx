import { Phone } from "lucide-react";
import cuibLogo from "../assets/logo.png";
import accent from "../assets/accent.png";
import { useLanguage } from "../lib/languageContext";

const PHONE_DISPLAY = "0723 549 318";
const PHONE_HREF = "tel:+40723549318";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="relative overflow-hidden bg-[#241811] py-10 text-[#e6dbcb] md:py-12">
      <div className="grain-overlay grain-overlay--dark" />

      <div
        aria-hidden="true"
        className="ember-glow pointer-events-none absolute left-1/2 top-1/2 h-40 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl md:h-56 md:w-136"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,176,102,0.22), transparent 72%)",
        }}
      />

      <img
        src={accent}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 top-4 h-10 w-10 rotate-12 opacity-[0.08] md:h-14 md:w-14 lg:right-8"
      />
      <img
        src={accent}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -left-5 bottom-4 h-12 w-12 -rotate-6 opacity-[0.06] md:h-16 md:w-16"
      />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 text-center lg:px-12">
        <a href="#home" className="group inline-flex">
          <img
            src={cuibLogo}
            alt="Cuib d'Arte"
            className="h-14 w-auto opacity-95 transition-transform duration-500 group-hover:scale-105 sm:h-16 md:h-20"
            style={{
              filter: "drop-shadow(0 0 20px rgba(255,176,102,0.25))",
            }}
          />
        </a>

        <span className="h-px w-20 bg-[#973028]/50" />

        <a
          href={PHONE_HREF}
          className="group inline-flex items-center gap-2.5 text-base tracking-wide text-[#e6dbcb]/85 transition hover:text-[#e6dbcb]"
        >
          <Phone
            size={17}
            strokeWidth={2.25}
            className="shrink-0 transition-transform duration-300 group-hover:-rotate-12"
          />
          {PHONE_DISPLAY}
        </a>

        <p className="pt-2 text-xs tracking-[0.15em] text-[#e6dbcb]/35 uppercase">
          &copy; {new Date().getFullYear()} Cuib d&apos;Arte — Timișoara
        </p>

        <p className="text-[11px] tracking-wide text-[#e6dbcb]/30">
          {t.footer.credit}{" "}
          <a
            href="https://linkhaus.ro"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#e6dbcb]/50 underline decoration-[#e6dbcb]/20 underline-offset-2 transition hover:text-[#e6dbcb]/80"
          >
            LinkHaus
          </a>
        </p>
      </div>
    </footer>
  );
}
