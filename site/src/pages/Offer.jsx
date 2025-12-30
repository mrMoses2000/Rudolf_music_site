import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { content } from "../data/content";
import Blocks from "../components/Blocks";

const Offer = () => {
    return (
        <div className="min-h-screen">
            {/* Offer Hero */}
            <section className="relative h-[40vh] flex items-end pb-16 px-6 md:px-12 overflow-hidden border-b border-black/10 pt-32">
                <div className="absolute inset-0 z-0 text-center">
                    <img
                        src="/images/da36c84bafda7d37407bad3bf5a88da2_1560x1040_fit6eb1.jpg"
                        alt="Offer Background"
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/50 to-transparent"></div>
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-9xl font-outfit font-black text-ink leading-none tracking-tighter uppercase"
                    >
                        {content.offer.title}
                    </motion.h1>
                </div>
            </section>

            <div className="px-6 md:px-12 max-w-7xl mx-auto py-24 mb-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="mb-16">
                        <Blocks blocks={content.offer.blocks} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {content.categories.map((cat, index) => (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="glass p-8 rounded-3xl border border-black/10 hover:border-gold/40 hover:bg-white/90 transition-all group"
                            >
                                <h3 className="text-2xl font-bold text-gold mb-6">{cat.title}</h3>
                                <ul className="space-y-3">
                                    {cat.items.map((item) => {
                                        const label = typeof item === "string" ? item : item.label;
                                        const slug = typeof item === "string" ? null : item.slug;
                                        return (
                                            <li key={label}>
                                                {slug ? (
                                                    <Link
                                                        to={`/offer/${slug}`}
                                                        className="block p-3 rounded-xl bg-white/80 hover:bg-gold/30 hover:text-ink transition-colors flex justify-between items-center group border border-black/10"
                                                    >
                                                        {label}
                                                        <span className="text-ink/30 group-hover:text-ink/60">→</span>
                                                    </Link>
                                                ) : (
                                                    <div className="block p-3 rounded-xl bg-white/70 text-ink-muted flex justify-between items-center border border-black/5">
                                                        {label}
                                                    </div>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-16 space-y-6">
                        <h2 className="text-2xl font-outfit font-bold text-ink">{content.offer.title}</h2>
                        <div className="flex flex-wrap gap-4">
                            {content.offer.extras.map((item) => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className="px-6 py-3 rounded-full bg-white/80 hover:bg-gold/30 hover:text-ink transition-colors font-bold text-sm uppercase tracking-widest border border-black/10"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Offer;
