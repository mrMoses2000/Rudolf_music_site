import { lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig } from "framer-motion";
import ScrollToTop from "./components/ScrollToTop";
import Layout from "./components/Layout";
import Home from "./pages/Home";

const About = lazy(() => import("./pages/About"));
const Fees = lazy(() => import("./pages/Fees"));
const InstrumentPage = lazy(() => import("./pages/InstrumentPage"));
const Offer = lazy(() => import("./pages/Offer"));
const Contact = lazy(() => import("./pages/Contact"));
const Jobs = lazy(() => import("./pages/Jobs"));
const Aktuelles = lazy(() => import("./pages/Aktuelles"));
const JeKits = lazy(() => import("./pages/JeKits"));
const Kunst = lazy(() => import("./pages/Kunst"));
const Standorte = lazy(() => import("./pages/Standorte"));
const AGB = lazy(() => import("./pages/AGB"));
const Impressum = lazy(() => import("./pages/Impressum"));
const Datenschutz = lazy(() => import("./pages/Datenschutz"));
const Musikunterricht = lazy(() => import("./pages/Musikunterricht"));

const App = () => {
  const location = useLocation();

  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <AnimatePresence>
        <ScrollToTop />
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="start" element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="standorte" element={<Standorte />} />
            <Route path="offer" element={<Offer />} />
            <Route path="angebot" element={<Offer />} />
            <Route path="musikunterricht" element={<Musikunterricht />} />
            <Route path="offer/:name" element={<InstrumentPage />} />
            <Route path="fees" element={<Fees />} />
            <Route path="aktuelles" element={<Aktuelles />} />
            <Route path="jekits" element={<JeKits />} />
            <Route path="kunst" element={<Kunst />} />
            <Route path="contact" element={<Contact />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="agb" element={<AGB />} />
            <Route path="impressum" element={<Impressum />} />
            <Route path="datenschutz" element={<Datenschutz />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </MotionConfig>
  );
};

export default App;
