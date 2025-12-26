
import { Outlet, Link } from "react-router-dom";
import { content } from "../data/content";

const Layout = () => {
    return (
        <div className="min-h-screen bg-midnight text-cloud font-inter">
            <header className="fixed top-0 w-full z-50 glass py-4 px-6 md:px-12 flex justify-between items-center text-white">
                <Link to="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center font-outfit font-bold text-midnight">
                        CMS
                    </div>
                    <span className="font-outfit text-xl font-bold tracking-tight hidden sm:block">
                        {content.header.title}
                    </span>
                </Link>

                <nav className="hidden md:flex gap-8 font-medium">
                    <Link to="/" className="hover:text-gold transition-colors">Start</Link>
                    <Link to="/about" className="hover:text-gold transition-colors">Über uns</Link>
                    <Link to="/offer" className="hover:text-gold transition-colors">Angebot</Link>
                    <Link to="/contact" className="hover:text-gold transition-colors">Kontakt</Link>
                </nav>

                <div className="flex items-center gap-6">
                    <a href={`tel:${content.header.phone.replace(/\D/g, '')}`} className="text-gold font-bold hover:text-white transition-colors hidden lg:block">
                        {content.header.phone}
                    </a>
                    <button className="bg-gold text-midnight px-6 py-2 rounded-full font-bold hover:bg-white hover:scale-105 transition-all">
                        {content.header.cta}
                    </button>
                </div>
            </header>

            <main className="pt-20">
                <Outlet />
            </main>

            <footer className="py-12 border-t border-white/5 opacity-50 px-6 mt-20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-sm">
                        {content.footer.text}
                    </div>
                    <div className="flex gap-8 text-sm lowercase tracking-widest">
                        {content.footer.links.map(link => (
                            <a key={link} href="#" className="hover:text-gold transition-colors">{link}</a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
