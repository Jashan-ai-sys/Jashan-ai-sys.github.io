import { Contact } from "./components/contact";
import Footer from "./components/footer";
import { Hero } from "./components/hero";
import { Navbar } from "./components/navbar";
import { Process, Services } from "./components/services";
import { Works } from "./components/works";

// App
const App = () => (
  <>
    <a
      href="#work"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-40 label-box"
    >
      Skip to content
    </a>
    <div className="grain" aria-hidden />
    <Navbar />
    <main>
      <Hero />
      <Works />
      <Services />
      <Process />
      <Contact />
    </main>
    <Footer />
  </>
);

export default App;
