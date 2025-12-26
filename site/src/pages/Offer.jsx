
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { content } from "../data/content";

const Offer = () => {
    return (
        <div className="pt-12 px-6 md:px-12 max-w-7xl mx-auto mb-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-4xl md:text-6xl font-outfit font-bold text-white mb-12 text-center">Unser Angebot</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {content.categories.map((cat, index) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="glass p-8 rounded-3xl border border-white/5 hover:border-gold/30 hover:bg-white/5 transition-all group"
                        >
                            <h3 className="text-2xl font-bold text-gold mb-6">{cat.title}</h3>
                            <ul className="space-y-3">
                                {cat.items.map(item => {
                                    // Clean up item name for URL (simple slugify)
                                    const slug = item.split(" ")[0].toLowerCase(); // Basic slug, for "Violine" etc.
                                    return (
                                        <li key={item}>
                                            <Link
                                                to={`/offer/${slug}`}
                                                className="block p-3 rounded-xl bg-midnight/50 hover:bg-gold hover:text-midnight transition-colors flex justify-between items-center group-inner"
                                            >
                                                {item}
                                                <span className="text-white/20 group-inner-hover:text-midnight/50">→</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default Offer;
