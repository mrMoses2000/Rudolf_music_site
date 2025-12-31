import { content } from "../data/content";
import Blocks from "../components/Blocks";
import { motion } from "framer-motion";

const Musikkurse = () => {
    const data = content.pages.musikkurse;

    return (
        <div className="min-h-screen pb-24 text-ink">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-end pb-16 px-6 md:px-12 overflow-hidden border-b border-black/10 pt-32">
                <div className="absolute inset-0 z-0">
                    <img
                        src={data.headerImage}
                        alt={data.title}
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
                        {data.title}
                    </motion.h1>
                </div>
            </section>

            {/* Content */}
            <div className="px-6 md:px-12 max-w-5xl mx-auto pt-24 space-y-12">
                <Blocks blocks={data.blocks} />
            </div>
        </div>
    );
};

export default Musikkurse;
