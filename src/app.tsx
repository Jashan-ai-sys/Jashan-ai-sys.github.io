import { Contact } from "./components/contact";
import Footer from "./components/footer";
import { Hero } from "./components/hero";
import { Navbar } from "./components/navbar";
import { Optional } from "./components/optional";
import { Process, Services } from "./components/services";
import { Works } from "./components/works";
import { lazyOptional } from "./lib/lazy-optional";

const Mascot = lazyOptional(() => import("./components/mascot"));

// App
const App = () => (
  <>
    <a
      href="#work"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-40 label-box"
    >
      Skip to content
    </a>
    <div className="grain hidden md:block" aria-hidden />
    <Navbar />
    <main>
      <Hero />
      <Works />
      <Services />
      <Process />
      <Contact />
    </main>
    <Footer />
    <Optional>
      <Mascot />
    </Optional>
  </>
);

export default App;
