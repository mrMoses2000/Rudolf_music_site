import { Outlet, Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { content } from "../data/content";

const Layout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [headerHeight, setHeaderHeight] = useState(0);
    const headerRef = useRef(null);
    const location = useLocation();
    const reduceMotion = useReducedMotion();

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    useEffect(() => {
        const header = headerRef.current;
        if (!header) return;

        const update = () => {
            const height = header.getBoundingClientRect().height;
            setHeaderHeight(Math.round(height));
        };

        update();

        const observer = new ResizeObserver(update);
        observer.observe(header);
        window.addEventListener("resize", update);

        return () => {
            observer.disconnect();
            window.removeEventListener("resize", update);
        };
    }, []);

    return (
        <div className="min-h-screen bg-paper text-ink font-inter selection:bg-gold selection:text-paper">
            <header
                ref={headerRef}
                className="fixed top-0 w-full z-50 bg-paper/80 backdrop-blur-md py-3 px-6 md:px-12 flex justify-between items-center border-b border-black/5"
            >
                {/* Left: Logo + Text */}
                <Link to="/" className="flex items-center gap-2 group relative z-50">
                    <div className="hidden sm:flex flex-col h-14 justify-center gap-0.5 mr-2">
                        <span className="font-libre text-[11px] leading-none text-ink tracking-tight">Christliche</span>
                        <span className="font-libre text-[11px] leading-none text-ink tracking-tight">Musikschule</span>
                        <span className="font-libre text-[11px] leading-none text-ink tracking-tight">Bielefeld</span>
                    </div>
                    <img
                        src="/images/logo.svg"
                        alt="CMS Logo"
                        className="h-14 w-auto grayscale brightness-0 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-300"
                    />
                </Link>

                {/* Right: Nav + Button grouped */}
                <div className="flex items-center gap-4 lg:gap-6">
                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex gap-5 font-bold text-xs uppercase tracking-widest text-ink-muted">
                        <Link to="/" className="hover:text-ink transition-colors">Start</Link>
                        <Link to="/about" className="hover:text-ink transition-colors">Über uns</Link>
                        <Link to="/offer" className="hover:text-ink transition-colors">Angebot</Link>
                        <Link to="/aktuelles" className="hover:text-ink transition-colors">Aktuelles</Link>
                        <Link to="/fees" className="hover:text-ink transition-colors">Gebühren/Anmeldung</Link>
                        <Link to="/agb" className="hover:text-ink transition-colors">AGB</Link>
                        <Link to="/impressum" className="hover:text-ink transition-colors">Impressum</Link>
                    </nav>

                    {/* Kontakt Button */}
                    <Link to="/contact" className="hidden lg:block bg-ink text-paper px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-gold hover:text-ink hover:scale-105 transition-all active:scale-95 shadow-[0_12px_30px_rgba(43,36,29,0.15)]">
                        {content.header.cta}
                    </Link>

                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden relative z-50 w-10 h-10 flex flex-col justify-center items-end gap-1.5 group"
                    >
                        <motion.span
                            animate={isMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                            className="w-7 h-[2px] bg-ink block origin-center"
                        />
                        <motion.span
                            animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                            className="w-5 h-[2px] bg-ink block"
                        />
                        <motion.span
                            animate={isMenuOpen ? { rotate: -45, y: -6, width: 28 } : { rotate: 0, y: 0, width: 14 }}
                            className="w-3.5 h-[2px] bg-ink block origin-center group-hover:w-7 transition-all"
                        />
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-paper pt-32 px-6 flex flex-col"
                    >
                        <nav className="flex flex-col gap-6 sm:gap-8 text-2xl sm:text-3xl font-black uppercase tracking-tighter text-ink">
                            <Link to="/" className="hover:text-gold">Start</Link>
                            <Link to="/about" className="hover:text-gold">Über uns</Link>
                            <Link to="/offer" className="hover:text-gold">Angebot</Link>
                            <Link to="/aktuelles" className="hover:text-gold">Aktuelles</Link>
                            <Link to="/fees" className="hover:text-gold">Gebühren/Anmeldung</Link>
                            <Link to="/agb" className="hover:text-gold">AGB</Link>
                            <Link to="/impressum" className="hover:text-gold">Impressum</Link>
                        </nav>
                        
                        {/* Kontakt Button for Mobile Menu */}
                        <Link 
                            to="/contact" 
                            className="mt-12 bg-ink text-paper px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-gold hover:text-ink transition-all active:scale-95 shadow-[0_12px_30px_rgba(43,36,29,0.15)] text-center"
                        >
                            {content.header.cta}
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>

            <main style={{ paddingTop: headerHeight }}>
                <motion.div
                    key={location.pathname}
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                    transition={reduceMotion ? undefined : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                    <Suspense fallback={<div className="min-h-[40vh]" />}>
                        <Outlet />
                    </Suspense>
                </motion.div>
            </main>

            <footer className="py-20 border-t border-black/10 bg-[#F0E6D8] px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <img
                            src="/images/logo.svg"
                            alt="CMS Logo"
                            className="h-20 w-auto grayscale brightness-0 hover:grayscale-0 hover:brightness-100 transition-all duration-300"
                        />
                        <p className="text-ink-muted text-sm leading-relaxed max-w-xs italic">
                            {content.hero.psalm}
                        </p>
                    </div>
                    <div>
                        <div className="flex flex-col gap-4 text-sm font-bold text-ink-muted">
                            <Link to="/impressum" className="hover:text-ink transition-colors">Impressum</Link>
                            <Link to="/agb" className="hover:text-ink transition-colors">AGB</Link>
                            <Link to="/datenschutz" className="hover:text-ink transition-colors">Datenschutz</Link>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-black/10 text-xs text-ink-muted/80 font-bold">
                    {content.footer.text}
                </div>
            </footer>
        </div>
    );
};

export default Layout;
