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

const App = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="offer" element={<Offer />} />
          <Route path="offer/:name" element={<InstrumentPage />} />
          <Route path="fees" element={<Fees />} />
          <Route path="contact" element={<Contact />} />
          <Route path="jobs" element={<Jobs />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

export default App;
