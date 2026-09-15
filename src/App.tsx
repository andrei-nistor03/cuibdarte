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
      <FloatingPapers3D />
      <Header />
      <main>
        <div id="home">
          <Hero />
        </div>
        <TornSeam color="#e6dbcb" variant="a" />
        <Events />
        <TornSeam
          color="color-mix(in srgb, var(--cream) 94%, var(--ink) 6%)"
          variant="c"
          flip
        />
        <Booking />
        <TornSeam color="var(--paper)" variant="b" />
        <Memories />
      </main>
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
