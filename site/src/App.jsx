import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Fees from "./pages/Fees";
import InstrumentPage from "./pages/InstrumentPage";
import Offer from "./pages/Offer";
import Contact from "./pages/Contact";
import Jobs from "./pages/Jobs";
import Aktuelles from "./pages/Aktuelles";
import JeKits from "./pages/JeKits";
import Musikkurse from "./pages/Musikkurse";
import Kunst from "./pages/Kunst";
import Standorte from "./pages/Standorte";
import AGB from "./pages/AGB";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import Musikunterricht from "./pages/Musikunterricht";

const App = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
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
          <Route path="musikkurse" element={<Musikkurse />} />
          <Route path="kunst" element={<Kunst />} />
          <Route path="contact" element={<Contact />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="agb" element={<AGB />} />
          <Route path="impressum" element={<Impressum />} />
          <Route path="datenschutz" element={<Datenschutz />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

export default App;
