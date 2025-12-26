
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { content } from "../data/content";

const Home = () => {
    return (
        <>
            {/* Hero Section */}
            <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/music_school_hero_1766743329644.png"
                        alt="Musikschule"
                        className="w-full h-full object-cover opacity-40 scale-105 animate-pulse-slow"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-midnight/10 via-midnight/60 to-midnight"></div>
                </div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-gold font-outfit uppercase tracking-[0.3em] mb-4 text-sm md:text-base"
                    >
                        {content.hero.psalm}
                    </motion.h2>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-5xl md:text-7xl font-outfit font-bold mb-8 leading-tight"
                    >
                        Dein Weg zur <span className="text-gold">Musik</span> beginnt hier
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-lg md:text-xl text-cloud/80 mb-12 max-w-2xl mx-auto leading-relaxed"
                    >
                        {content.hero.subtitle}
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link to="/offer" className="bg-gold text-midnight px-10 py-4 rounded-full font-bold text-lg hover:bg-white transition-all shadow-xl shadow-gold/20">
                            {content.hero.offerBtn}
                        </Link>
                        <Link to="/about" className="glass px-10 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all border-white/20">
                            {content.hero.aboutBtn}
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Categories Preview */}
            <section className="py-24 px-6 md:px-12 bg-midnight">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-outfit font-bold mb-12 text-center">Unsere Fächer</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {content.categories.map((cat, index) => (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="glass p-8 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group"
                            >
                                <h3 className="text-xl font-bold text-gold mb-4 group-hover:translate-x-2 transition-transform">{cat.title}</h3>
                                <ul className="text-cloud/70 space-y-2">
                                    {cat.items.map(item => (
                                        <li key={item} className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-gold rounded-full"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home;
