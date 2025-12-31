import { content } from "../data/content";
import { motion } from "framer-motion";

const Jobs = () => {
    // Ensure we access pages.jobs, falling back to safe defaults
    const data = content.pages?.jobs || {};
    const title = data.title || "Stellenangebote";
    const headerImage = data.headerImage || "/images/Stellenangebote.png";

    // Hardcoded fallback content if content.js structure is mismatched
    const intro = "Wir suchen Verstärkung für unser Team!";
    // Contact details from header or hardcoded if missing in jobs specific
    const email = "info@cms-bielefeld.de";
    const phone = content.header?.phone || "+49 (0) 521 3367416";

    return (
        <div className="min-h-screen pb-24 text-ink">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-end pb-16 px-6 md:px-12 overflow-hidden border-b border-black/10 pt-32">
                <div className="absolute inset-0 z-0">
                    <img
                        src={headerImage}
                        alt={title}
                        className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/40 to-transparent"></div>
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-outfit font-black text-ink leading-none tracking-tighter uppercase mb-6"
                    >
                        {title}
                    </motion.h1>
                </div>
            </section>

            {/* Content */}
            <div className="px-6 md:px-12 max-w-4xl mx-auto pt-24 mb-24">
                <div className="glass p-10 rounded-3xl border border-black/10 space-y-8 shadow-[0_20px_60px_rgba(199,154,85,0.1)]">
                    <p className="text-2xl text-gold font-bold italic">
                        "{intro}"
                    </p>

                    <div className="text-ink-muted text-lg leading-relaxed space-y-6">
                        <p>Aktuell haben wir keine offenen Stellen. Wir freuen uns jedoch immer über Initiativbewerbungen engagierter Lehrkräfte.</p>
                        <p>Senden Sie Ihre Unterlagen bitte per E-Mail an:</p>
                    </div>

                    <div className="pt-8 border-t border-black/10">
                        <h3 className="text-ink-muted uppercase tracking-widest text-sm font-black mb-6">Kontakt für Bewerbungen</h3>
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <a href={`mailto:${email}`} className="text-xl md:text-3xl text-ink font-bold hover:text-gold transition-colors">
                                {email}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Jobs;
