import { Outlet, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { content } from "../data/content";

const Layout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    return (
        <div className="min-h-screen bg-paper text-ink font-inter selection:bg-gold selection:text-paper">
            <header className="fixed top-0 w-full z-50 bg-paper/80 backdrop-blur-md py-4 px-6 md:px-12 flex justify-between items-center border-b border-black/5">
                <Link to="/" className="flex items-center gap-3 group relative z-50">
                    <div className="w-10 h-10 bg-ink rounded-full flex items-center justify-center font-outfit font-black text-paper transition-transform group-hover:scale-110">
                        C
                    </div>
                    <span className="font-outfit text-xl font-black tracking-tighter uppercase text-ink">
                        {content.header.title.split(' ').map(word => word[0]).join('')}
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex gap-8 font-bold text-sm uppercase tracking-widest text-ink-muted">
                    <Link to="/" className="hover:text-ink transition-colors">Start</Link>
                    <Link to="/about" className="hover:text-ink transition-colors">Über uns</Link>
                    <Link to="/offer" className="hover:text-ink transition-colors">Angebot</Link>
                    <Link to="/aktuelles" className="hover:text-ink transition-colors">Aktuelles</Link>
                    <Link to="/fees" className="hover:text-ink transition-colors">Gebühren/Anmeldung</Link>
                    <Link to="/agb" className="hover:text-ink transition-colors">AGB</Link>
                    <Link to="/impressum" className="hover:text-ink transition-colors">Impressum</Link>
                </nav>

                <div className="flex items-center gap-4 md:gap-8">
                    <div className="hidden lg:flex flex-col items-end">
                        {/* Phone number removed as per user request
                        <span className="text-[10px] font-black uppercase tracking-widest text-gold opacity-80">Rufen Sie uns an</span>
                        <a href={`tel:${content.header.phone.replace(/\D/g, '')}`} className="text-ink font-bold text-sm hover:text-gold transition-colors">
                            {content.header.phone}
                        </a>
                        */}
                    </div>

                    {/* Anmelden Button - Fixed */}
                    <Link to="/contact" className="hidden sm:block bg-ink text-paper px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:bg-gold hover:text-ink hover:scale-105 transition-all active:scale-95 shadow-[0_18px_40px_rgba(43,36,29,0.2)]">
                        {content.header.cta}
                    </Link>

                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden relative z-50 w-10 h-10 flex flex-col justify-center items-end gap-1.5 group"
                    >
                        <motion.span
                            animate={isMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                            className="w-8 h-[2px] bg-ink block origin-center"
                        />
                        <motion.span
                            animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                            className="w-6 h-[2px] bg-ink block"
                        />
                        <motion.span
                            animate={isMenuOpen ? { rotate: -45, y: -6, width: 32 } : { rotate: 0, y: 0, width: 16 }}
                            className="w-4 h-[2px] bg-ink block origin-center group-hover:w-8 transition-all"
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
                        <nav className="flex flex-col gap-8 text-3xl font-black uppercase tracking-tighter text-ink">
                            <Link to="/" className="hover:text-gold">Start</Link>
                            <Link to="/about" className="hover:text-gold">Über uns</Link>
                            <Link to="/standorte" className="hover:text-gold">Standorte</Link>
                            <Link to="/offer" className="hover:text-gold">Angebot</Link>
                            <Link to="/jekits" className="hover:text-gold">JeKits</Link>
                            <Link to="/aktuelles" className="hover:text-gold">Aktuelles</Link>
                            <Link to="/fees" className="hover:text-gold">Anmeldung</Link>
                            <Link to="/contact" className="hover:text-gold">Kontakt</Link>
                            <Link to="/impressum" className="hover:text-gold text-sm opacity-50">Impressum</Link>
                            <Link to="/agb" className="hover:text-gold text-sm opacity-50">AGB</Link>
                        </nav>

                        <div className="mt-auto pb-12 space-y-8">
                            <div className="space-y-2">
                                <p className="text-ink-muted text-xs font-black uppercase tracking-widest">Kontakt</p>
                                <a href={`tel:${content.header.phone.replace(/\D/g, '')}`} className="block text-xl font-bold text-ink">
                                    {content.header.phone}
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="">
                <Outlet />
            </main>

            <footer className="py-20 border-t border-black/10 bg-[#F0E6D8] px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="w-12 h-12 bg-ink rounded-full flex items-center justify-center font-outfit font-black text-paper">C</div>
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
