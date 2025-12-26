
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { content } from "../data/content";

const InstrumentPage = () => {
    const { name } = useParams();
    const instrumentData = content.instruments[name.toLowerCase()] || content.instruments["klavier"];

    const category = content.categories.find(cat =>
        cat.items.some(item => item.toLowerCase().includes(name.toLowerCase()))
    );

    return (
        <div className="bg-[#050505] min-h-screen">
            {/* Header Hero Area */}
            <div className="relative h-[60vh] flex items-end pb-12 px-6 md:px-12 border-b border-white/5">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/attachments-Image-IMG_11926eb1.jpg"
                        className="w-full h-full object-cover opacity-40 grayscale hover:grayscale-0 transition-all duration-1000"
                        alt={instrumentData.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <Link to="/offer" className="text-gold font-black uppercase tracking-[0.3em] text-xs hover:text-white transition-colors">
                            ← {category?.title || "Angebot"}
                        </Link>
                        <h1 className="text-6xl md:text-9xl font-outfit font-black text-white leading-none tracking-tighter uppercase">
                            {instrumentData.title}
                        </h1>
                    </motion.div>
                </div>
            </div>

            {/* Content Area */}
            <div className="px-6 md:px-12 max-w-7xl mx-auto py-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-24 items-start">
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-sm font-black uppercase tracking-[0.4em] text-gold mb-8">Beschreibung</h2>
                            <div className="text-xl md:text-2xl text-[#B3B3B3] font-medium leading-relaxed space-y-8">
                                {instrumentData.description.map((para, i) => (
                                    <p key={i}>{para}</p>
                                ))}
                            </div>
                        </section>

                        <section className="bg-[#121212] p-12 rounded-3xl border border-white/5 space-y-8">
                            <h3 className="text-sm font-black uppercase tracking-[0.4em] text-gold">Unterrichtsorte</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-bold text-white">
                                {instrumentData.locations.map((loc, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="min-w-[8px] h-[8px] bg-gold rounded-full mt-2"></div>
                                        <span className="opacity-80">{loc}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-8 sticky top-32">
                        <div className="bg-white text-black p-10 rounded-3xl space-y-8 shadow-2xl shadow-gold/10">
                            <div className="space-y-4">
                                <h4 className="text-3xl font-black tracking-tighter uppercase leading-none">Bereit zu starten?</h4>
                                <p className="font-bold opacity-60">Beginne deine musikalische Reise noch heute.</p>
                            </div>
                            <button className="w-full bg-[#1DB954] text-white py-5 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl shadow-green-500/20">
                                Probestunde buchen
                            </button>
                            <p className="text-[10px] uppercase tracking-widest font-black text-center opacity-40">
                                Unverbindlich & Kostenlos
                            </p>
                        </div>

                        <div className="bg-[#121212] p-8 rounded-3xl border border-white/5">
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#B3B3B3] mb-4">Verwandte Fächer</h4>
                            <div className="flex flex-wrap gap-2">
                                {category?.items.filter(i => i !== instrumentData.title).map(item => (
                                    <Link key={item} to={`/offer/${item.toLowerCase()}`} className="px-4 py-2 bg-white/5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-gold hover:text-black transition-all">
                                        {item}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default InstrumentPage;
