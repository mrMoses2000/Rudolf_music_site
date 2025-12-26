import { Outlet, Link } from "react-router-dom";
import { content } from "../data/content";

const Layout = () => {
    return (
        <div className="min-h-screen bg-midnight text-white font-inter selection:bg-gold selection:text-midnight">
            <header className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-md py-4 px-6 md:px-12 flex justify-between items-center border-b border-white/5">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center font-outfit font-black text-midnight transition-transform group-hover:scale-110">
                        C
                    </div>
                    <span className="font-outfit text-xl font-black tracking-tighter uppercase">
                        {content.header.title.split(' ').map(word => word[0]).join('')}
                    </span>
                </Link>

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
                    <button className="bg-white text-black px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-lg shadow-white/5">
                        {content.header.cta}
                    </button>
                </div>
            </header>

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
