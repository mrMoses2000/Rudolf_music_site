import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { content } from "../data/content";

const Home = () => {
    return (
        <div className="bg-[#050505]">
            {/* Hero Section - Spotify Style */}
            <section className="relative min-h-[95vh] flex items-end pb-32 px-6 md:px-12 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/da36c84bafda7d37407bad3bf5a88da2_1560x1040_fit6eb1.jpg"
                        alt="Musikschule Background"
                        className="w-full h-full object-cover opacity-60 scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-1 bg-gold rounded-full"></span>
                            <span className="text-gold font-black uppercase tracking-[0.4em] text-xs">
                                {content.hero.psalm.split(' ').slice(-2).join(' ')}
                            </span>
                        </div>
                        <h1 className="text-7xl md:text-[11rem] font-outfit font-black mb-6 leading-[0.85] tracking-tighter uppercase max-w-6xl text-white">
                            {content.hero.title.split(' ').slice(0, 3).join(' ')} <br />
                            <span className="text-gold">{content.hero.title.split(' ').slice(3).join(' ')}</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-[#B3B3B3] mb-12 max-w-2xl font-bold leading-relaxed">
                            {content.hero.subtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6">
                            <Link to="/offer" className="bg-white text-black px-14 py-5 rounded-full font-black text-lg uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-2xl shadow-white/5 text-center">
                                {content.hero.offerBtn}
                            </Link>
                            <Link to="/about" className="bg-[#121212]/50 backdrop-blur-md text-white border-2 border-white/20 px-14 py-5 rounded-full font-black text-lg uppercase tracking-widest hover:bg-white hover:text-black transition-all text-center">
                                {content.hero.aboutBtn}
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Categories Preview - Spotify Style Grid */}
            <section className="py-32 px-6 md:px-12 bg-[#050505]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-16">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-6xl font-outfit font-black tracking-tighter uppercase text-white">Unsere Fächer</h2>
                            <p className="text-[#B3B3B3] font-bold text-xl uppercase tracking-widest">Wähle dein Instrument</p>
                        </div>
                        <Link to="/offer" className="text-sm font-black uppercase tracking-widest text-[#B3B3B3] hover:text-white transition-colors pb-2 border-b-2 border-transparent hover:border-gold">
                            Alles ansehen
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {content.categories.slice(0, 8).map((cat, index) => (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="spotify-card group relative p-0 overflow-hidden aspect-[4/5] flex flex-col justify-end"
                            >
                                <img
                                    src={cat.image || "/images/da36c84bafda7d37407bad3bf5a88da2_1560x1040_fit6eb1.jpg"}
                                    className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700"
                                    alt={cat.title}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent opacity-80"></div>

                                <div className="p-8 relative z-10 transition-transform group-hover:-translate-y-2">
                                    <h3 className="text-3xl font-black text-white group-hover:text-gold transition-colors leading-tight mb-2 uppercase tracking-tighter">{cat.title}</h3>
                                    <p className="text-[#B3B3B3] text-sm font-bold uppercase tracking-widest">{cat.items.length} Fächer</p>
                                </div>

                                <div className="absolute top-6 right-6 w-14 h-14 bg-gold rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-xl shadow-gold/20">
                                    <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quote Section */}
            <section className="py-40 bg-[#121212]/20 relative overflow-hidden">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-5xl font-outfit font-black text-white leading-[1.1] md:px-12 italic opacity-90">
                        "{content.hero.psalm}"
                    </h2>
                    <div className="mt-12 flex items-center justify-center gap-4">
                        <div className="w-12 h-[2px] bg-gold/30"></div>
                        <p className="text-gold uppercase tracking-[0.5em] text-xs font-black">Psalm 103</p>
                        <div className="w-12 h-[2px] bg-gold/30"></div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
