import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Blocks from "../components/Blocks";
import { content } from "../data/content";

const Jobs = () => {
    const data = content.pages?.jobs || {};
    const blocks = data.blocks || [];
    const titleBlockIndex = blocks.findIndex((block) => block.type === "h1");
    const title = titleBlockIndex >= 0 ? blocks[titleBlockIndex].text : data.title || "Stellenangebote";
    const headerImage = data.headerImage || "/images/Stellenangebote.png";
    const bodyBlocks = blocks.filter((_, index) => index !== titleBlockIndex);

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
                <div className="glass p-10 rounded-3xl border border-black/10 space-y-10 shadow-[0_20px_60px_rgba(199,154,85,0.1)]">
                    <Blocks blocks={bodyBlocks} />
                    <div className="pt-6 border-t border-black/10">
                        <Link
                            to="/contact"
                            state={{ subject: "Bewerbung: Stellenangebote" }}
                            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-ink text-paper font-black uppercase tracking-widest text-sm hover:bg-gold hover:text-ink transition-colors"
                        >
                            Jetzt Anmelden
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Jobs;
