import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { content } from "../data/content";

const Home = () => {
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
    const scaleHero = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        const { clientX, clientY, currentTarget } = e;
        const { left, top } = currentTarget.getBoundingClientRect();
        setMousePos({ x: clientX - left, y: clientY - top });
    };

    return (
        <div className="bg-[#050505]">
            {/* Hero Section - Premium Parallax */}
            <section ref={heroRef} className="relative min-h-[100vh] flex items-end pb-32 px-6 md:px-12 overflow-hidden">
                <motion.div style={{ y, scale: scaleHero }} className="absolute inset-0 z-0">
                    <img
                        src="/images/da36c84bafda7d37407bad3bf5a88da2_1560x1040_fit6eb1.jpg"
                        alt="Musikschule Background"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent"></div>
                </motion.div>

                <div className="relative z-10 w-full max-w-7xl mx-auto">
                    <motion.div
                        style={{ opacity: opacityHero }}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-8"
                    >
                        <div className="flex items-center gap-4">
                            <motion.span
                                initial={{ width: 0 }}
                                animate={{ width: 48 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="h-1 bg-gold rounded-full"
                            ></motion.span>
                            <span className="text-gold font-black uppercase tracking-[0.5em] text-[10px]">
                                {content.hero.psalm.split(' ').slice(-2).join(' ')}
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-[12rem] font-outfit font-black mb-6 leading-[0.8] tracking-tighter uppercase max-w-6xl text-white">
                            {content.hero.title.split(' ').slice(0, 3).map((word, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + i * 0.1, duration: 0.8 }}
                                    className="inline-block mr-4"
                                >
                                    {word}
                                </motion.span>
                            ))} <br />
                            <motion.span
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6, duration: 1 }}
                                className="text-gold inline-block"
                            >
                                {content.hero.title.split(' ').slice(3).join(' ')}
                            </motion.span>
                        </h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 1 }}
                            className="text-xl md:text-2xl text-[#B3B3B3] mb-12 max-w-2xl font-bold leading-relaxed"
                        >
                            {content.hero.subtitle}
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1, duration: 0.8 }}
                            className="flex flex-col sm:flex-row gap-6"
                        >
                            <Link to="/offer" className="group bg-white text-black px-14 py-5 rounded-full font-black text-lg uppercase tracking-widest hover:bg-gold transition-all active:scale-95 shadow-2xl relative overflow-hidden">
                                <span className="relative z-10">{content.hero.offerBtn}</span>
                                <div className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </Link>
                            <Link to="/about" className="bg-transparent text-white border-2 border-white/20 px-14 py-5 rounded-full font-black text-lg uppercase tracking-widest hover:bg-white hover:text-black transition-all text-center">
                                {content.hero.aboutBtn}
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Categories Preview - Spotlight Grid */}
            <section className="py-40 px-6 md:px-12 bg-[#050505] relative z-20">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="flex justify-between items-end mb-24"
                    >
                        <div className="space-y-4">
                            <h2 className="text-5xl md:text-8xl font-outfit font-black tracking-tighter uppercase text-white leading-none">Unsere Fächer</h2>
                            <p className="text-[#B3B3B3] font-bold text-xl uppercase tracking-[0.3em]">Wähle dein Instrument</p>
                        </div>
                        <Link to="/offer" className="group text-sm font-black uppercase tracking-widest text-[#B3B3B3] hover:text-white transition-colors pb-2 border-b-2 border-transparent hover:border-gold">
                            Alles ansehen <span className="inline-block group-hover:translate-x-2 transition-transform">→</span>
                        </Link>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {content.categories.slice(0, 8).map((cat, index) => (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                onMouseMove={handleMouseMove}
                                className="spotify-card group relative p-0 overflow-hidden aspect-[4/5] flex flex-col justify-end rounded-[2rem] bg-[#121212]"
                            >
                                {/* Spotlight Background Effect */}
                                <div
                                    className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                    style={{
                                        background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(245, 158, 11, 0.15), transparent 40%)`
                                    }}
                                />

                                <img
                                    src={cat.image || "/images/da36c84bafda7d37407bad3bf5a88da2_1560x1040_fit6eb1.jpg"}
                                    className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                                    alt={cat.title}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-90"></div>

                                <div className="p-10 relative z-20 transition-transform duration-500 group-hover:-translate-y-4">
                                    <h3 className="text-4xl font-black text-white group-hover:text-gold transition-colors leading-none mb-3 uppercase tracking-tighter break-words hyphens-auto">{cat.title}</h3>
                                    <p className="text-[#B3B3B3] text-xs font-black uppercase tracking-[0.3em]">{cat.items.length} Fächer</p>
                                </div>

                                <div className="absolute top-8 right-8 w-16 h-16 bg-gold rounded-full flex items-center justify-center opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 shadow-2xl shadow-gold/40 z-30">
                                    <svg className="w-8 h-8 text-black translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quote Section */}
            <section className="py-60 bg-[#121212]/20 relative overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5 }}
                    className="max-w-5xl mx-auto px-6 text-center"
                >
                    <h2 className="text-4xl md:text-7xl font-outfit font-black text-white leading-[1.1] md:px-12 italic opacity-90 tracking-tighter uppercase">
                        "{content.hero.psalm}"
                    </h2>
                    <div className="mt-16 flex items-center justify-center gap-6">
                        <div className="w-20 h-[1px] bg-gold/50"></div>
                        <p className="text-gold uppercase tracking-[0.8em] text-[10px] font-black">Psalm 103</p>
                        <div className="w-20 h-[1px] bg-gold/50"></div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default Home;
