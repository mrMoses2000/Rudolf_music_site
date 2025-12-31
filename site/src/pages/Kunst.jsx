import { content } from "../data/content";
import Blocks from "../components/Blocks";
import { motion } from "framer-motion";

const Kunst = () => {
    const data = content.pages.kunst;
    const gallery = data.gallery || [];

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
            <div className="px-6 md:px-12 max-w-6xl mx-auto pt-24 space-y-16">
                <Blocks blocks={data.blocks} />

                {gallery.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {gallery.map((item, i) => (
                            <motion.div
                                key={item.title || i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="rounded-3xl overflow-hidden border border-black/10 bg-white/80 shadow-[0_20px_50px_rgba(43,36,29,0.12)] group"
                            >
                                <div className="aspect-[4/3] bg-white overflow-hidden">
                                    <img src={item.src} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                </div>
                                <div className="p-6 text-lg text-ink-muted font-bold">{item.title}</div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Kunst;
