import { useParams, Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { content } from "../data/content";

const InstrumentPage = () => {
    const { name } = useParams();
    const instrumentData = content.instruments[name.toLowerCase()] || content.instruments["klavier"];
    const containerRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
    const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1.3]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    const category = content.categories.find(cat =>
        cat.items.some(item => item.toLowerCase().includes(name.toLowerCase()))
    );

    return (
        <div ref={containerRef} className="bg-[#050505] min-h-screen">
            {/* Header Hero Area - Premium Reveal */}
            <section className="relative h-[70vh] flex items-end pb-20 px-6 md:px-12 border-b border-white/5 pt-32 overflow-hidden">
                <motion.div style={{ y, scale }} className="absolute inset-0 z-0">
                    <img
                        src="/images/attachments-Image-IMG_11926eb1.jpg"
                        className="w-full h-full object-cover opacity-50 grayscale"
                        alt={instrumentData.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
                </motion.div>

                <div className="relative z-10 w-full max-w-7xl mx-auto">
                    <motion.div
                        style={{ opacity }}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-6"
                    >
                        <Link to="/offer" className="group flex items-center gap-3 text-gold font-black uppercase tracking-[0.4em] text-[10px] hover:text-white transition-colors">
                            <span className="group-hover:-translate-x-2 transition-transform">←</span> {category?.title || "Angebot"}
                        </Link>
                        <h1 className="text-4xl sm:text-5xl md:text-[13rem] font-outfit font-black text-white leading-[0.75] tracking-tighter uppercase break-words hyphens-auto">
                            {instrumentData.title}
                        </h1>
                    </motion.div>
                </div>
            </section>

            {/* Content Area */}
            <div className="px-6 md:px-12 max-w-7xl mx-auto py-32">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-32 items-start">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="lg:col-span-2 space-y-24"
                    >
                        <section className="space-y-12">
                            <div className="flex items-center gap-4">
                                <span className="h-[1px] w-12 bg-gold/50"></span>
                                <h2 className="text-xs font-black uppercase tracking-[0.5em] text-gold">Der Unterricht</h2>
                            </div>
                            <div className="text-2xl md:text-3xl text-[#B3B3B3] font-medium leading-relaxed space-y-12">
                                {instrumentData.description.map((para, i) => (
                                    <motion.p
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.1 * i }}
                                    >
                                        {para}
                                    </motion.p>
                                ))}
                            </div>
                        </section>

                        <motion.section
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="bg-[#121212] p-16 rounded-[3rem] border border-white/5 space-y-12 shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-gold relative z-10">Unterrichtsorte</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 font-black text-2xl text-white relative z-10 tracking-tight">
                                {instrumentData.locations.map((loc, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.1 * i }}
                                        className="flex items-center gap-6"
                                    >
                                        <div className="w-3 h-3 bg-gold rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
                                        <span className="opacity-80">{loc}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    </motion.div>

                    <div className="space-y-12 sticky top-40">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="bg-white text-black p-12 rounded-[2.5rem] space-y-10 shadow-3xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                            <div className="space-y-4 relative z-10">
                                <h4 className="text-4xl font-black tracking-tighter uppercase leading-[0.9]">Musik <br /> erleben.</h4>
                                <p className="font-bold opacity-60 text-lg">Deine erste Stunde ist völlig kostenlos.</p>
                            </div>
                            <Link
                                to="/contact"
                                state={{ instrument: instrumentData.title }}
                                className="block w-full bg-[#1DB954] text-white py-6 rounded-full font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.03] active:scale-95 transition-all shadow-2xl shadow-green-500/30 text-center relative z-10"
                            >
                                Probestunde buchen
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="bg-[#121212] p-10 rounded-[2.5rem] border border-white/5"
                        >
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#535353] mb-6">Empfehlungen</h4>
                            <div className="flex flex-wrap gap-3">
                                {category?.items.filter(i => i !== instrumentData.title).map(item => (
                                    <Link
                                        key={item}
                                        to={`/offer/${item.toLowerCase()}`}
                                        className="px-6 py-3 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gold hover:text-black transition-all border border-white/5"
                                    >
                                        {item}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstrumentPage;
