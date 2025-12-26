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
        <div className="min-h-screen bg-midnight text-white font-inter selection:bg-gold selection:text-midnight">
            <header className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-md py-4 px-6 md:px-12 flex justify-between items-center border-b border-white/5">
                <Link to="/" className="flex items-center gap-3 group relative z-50">
                    <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center font-outfit font-black text-midnight transition-transform group-hover:scale-110">
                        C
                    </div>
                    <span className="font-outfit text-xl font-black tracking-tighter uppercase">
                        {content.header.title.split(' ').map(word => word[0]).join('')}
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex gap-8 font-bold text-sm uppercase tracking-widest text-[#B3B3B3]">
                    <Link to="/" className="hover:text-white transition-colors">Start</Link>
                    <Link to="/about" className="hover:text-white transition-colors">Über uns</Link>
                    <Link to="/offer" className="hover:text-white transition-colors">Angebot</Link>
                    <Link to="/contact" className="hover:text-white transition-colors">Kontakt</Link>
                </nav>

                <div className="flex items-center gap-6">
                    <a href={`tel:${content.header.phone.replace(/\D/g, '')}`} className="text-[#B3B3B3] font-bold text-sm hover:text-white transition-colors hidden lg:block">
                        {content.header.phone}
                    </a>

                    {/* Anmelden Button - Fixed */}
                    <Link to="/contact" className="hidden sm:block bg-white text-black px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-lg shadow-white/5">
                        {content.header.cta}
                    </Link>

                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden relative z-50 w-10 h-10 flex flex-col justify-center items-end gap-1.5 group"
                    >
                        <motion.span
                            animate={isMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                            className="w-8 h-[2px] bg-white block origin-center"
                        />
                        <motion.span
                            animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                            className="w-6 h-[2px] bg-white block"
                        />
                        <motion.span
                            animate={isMenuOpen ? { rotate: -45, y: -6, width: 32 } : { rotate: 0, y: 0, width: 16 }}
                            className="w-4 h-[2px] bg-white block origin-center group-hover:w-8 transition-all"
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
                        className="fixed inset-0 z-40 bg-[#050505] pt-32 px-6 flex flex-col"
                    >
                        <nav className="flex flex-col gap-8 text-3xl font-black uppercase tracking-tighter">
                            <Link to="/" className="text-white hover:text-gold">Start</Link>
                            <Link to="/about" className="text-white hover:text-gold">Über uns</Link>
                            <Link to="/offer" className="text-white hover:text-gold">Angebot</Link>
                            <Link to="/contact" className="text-white hover:text-gold">Kontakt</Link>
                            <Link to="/contact" className="text-gold mt-4">Probestunde buchen →</Link>
                        </nav>

                        <div className="mt-auto pb-12 space-y-8">
                            <div className="space-y-2">
                                <p className="text-[#B3B3B3] text-xs font-black uppercase tracking-widest">Kontakt</p>
                                <a href={`tel:${content.header.phone.replace(/\D/g, '')}`} className="block text-xl font-bold text-white">
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

            <footer className="py-20 border-t border-white/5 bg-[#050505] px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="space-y-6">
                        <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center font-outfit font-black text-midnight">C</div>
                        <p className="text-[#B3B3B3] text-sm leading-relaxed max-w-xs italic">
                            {content.hero.psalm}
                        </p>
                    </div>
                    <div>
                        <h4 className="font-black uppercase tracking-widest text-xs mb-6 text-white">Navigation</h4>
                        <div className="flex flex-col gap-4 text-sm font-bold text-[#B3B3B3]">
                            <Link to="/" className="hover:text-white transition-colors">Start</Link>
                            <Link to="/about" className="hover:text-white transition-colors">Über uns</Link>
                            <Link to="/offer" className="hover:text-white transition-colors">Angebot</Link>
                            <Link to="/contact" className="hover:text-white transition-colors">Kontakt</Link>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-black uppercase tracking-widest text-xs mb-6 text-white">Rechtliches</h4>
                        <div className="flex flex-col gap-4 text-sm font-bold text-[#B3B3B3]">
                            {content.footer.links.map(link => (
                                <a key={link} href="#" className="hover:text-white transition-colors">{link}</a>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-xs text-[#535353] font-bold">
                    {content.footer.text}
                </div>
            </footer>
        </div>
    );
};

export default Layout;
