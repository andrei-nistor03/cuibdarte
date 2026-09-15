import FloatingPapers3D from "./components/FloatingPapers3D";
import Loader from "./components/Loader";
import TornSeam from "./components/TornSeam";
import Booking from "./sections/Booking";
import Events from "./sections/Events";
import Footer from "./sections/Footer";
import Header from "./sections/Header";
import Hero from "./sections/Hero";
import Memories from "./sections/Memories";

const App = () => {
  return (
    <>
      <Loader />
      {/* A top-level sibling, not a child of Hero: it's `position: fixed`
          and driven purely by window scroll, so it doesn't need to live
          inside Hero — and doing so would trap it in Hero's own stacking
          context (`relative z-30`), which loses to the sections after it
          (the torn seam, the posts-section overlay) as a whole regardless
          of the z-index set on this layer itself. Living at the top level
          lets its z-index compare directly against every section. */}
      <FloatingPapers3D />
      <Header />
      <main>
        <div id="home">
          <Hero />
        </div>
        <TornSeam color="#e6dbcb" variant="a" />
        <Events />
        {/* Flipped, this flap's flat top sits inside Events' own bottom
            edge — which Events darkens with a ~6% vignette (see its radial-
            gradient overlay) rather than showing raw cream. Matching that
            mix here, instead of the flat "#e6dbcb" every other seam uses,
            is what makes the flap disappear into the section instead of
            reading as a lighter patch stamped on top of it. */}
        <TornSeam
          color="color-mix(in srgb, var(--cream) 94%, var(--ink) 6%)"
          variant="c"
          flip
        />
        <Booking />
        {/* Coloured like Memories' own paper rather than the flat cream
            every other non-flipped seam uses, so the flap reads as that
            paper tearing up out of the red room instead of a lighter patch
            stamped on it. No `fadeShadow` here — that darkened the flap's
            own bottom edge, which sits flush against Memories' top and read
            as a shadow bleeding down into the section. */}
        <TornSeam color="var(--paper)" variant="b" />
        <Memories />
      </main>
      {/* Nudged down slightly on mobile/tablet — at those widths the flap
          read as a touch detached from the section above it; a 10px
          translate closes that without disturbing the desktop canvas,
          which already sits flush. */}
      <TornSeam
        color="#241811"
        variant="b"
        dark
        className="translate-y-2.5 lg:translate-y-0"
      />
      <Footer />
    </>
  );
};
export default App;
