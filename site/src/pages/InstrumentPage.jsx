
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { content } from "../data/content";

const InstrumentPage = () => {
    const { name } = useParams();
    const instrumentData = content.instruments[name.toLowerCase()] || content.instruments["klavier"]; // Fallback for demo

    // Find which category this instrument belongs to for breadcrumbs or related links
    const category = content.categories.find(cat =>
        cat.items.some(item => item.toLowerCase().includes(name.toLowerCase()))
    );

    return (
        <div className="pt-12 px-6 md:px-12 max-w-7xl mx-auto mb-24">
            <div className="mb-8">
                <Link to="/offer" className="text-cloud/50 hover:text-gold transition-colors text-sm uppercase tracking-widest font-bold">
                    ← Zur Übersicht
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="text-gold font-bold tracking-widest uppercase mb-2 block">{category?.title || "Instrument"}</span>
                    <h1 className="text-5xl md:text-7xl font-outfit font-bold text-white mb-8">{instrumentData.title}</h1>

                    <div className="prose prose-invert prose-lg text-cloud/80 leading-relaxed mb-12">
                        {instrumentData.description.map((para, i) => (
                            <p key={i} className="mb-4">{para}</p>
                        ))}
                    </div>

                    <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-4">Unterrichtsorte</h3>
                        <ul className="space-y-3">
                            {instrumentData.locations.map((loc, i) => (
                                <li key={i} className="flex items-center gap-3 text-cloud/70">
                                    <div className="w-2 h-2 bg-gold rounded-full"></div>
                                    {loc}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-12">
                        <button className="bg-gold text-midnight px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-gold/20">
                            Jetzt Probestunde vereinbaren
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden glass"
                >
                    {/* Placeholder for dynamic instrument image - we will use a generic one or map specific ones later */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-midnight via-transparent to-transparent z-10"></div>
                    <img
                        src={`/music_school_hero_1766743329644.png`}
                        alt={instrumentData.title}
                        className="w-full h-full object-cover opacity-60 hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute bottom-0 left-0 p-8 z-20">
                        <div className="text-9xl font-bold text-white/5 leading-none absolute -bottom-4 -left-4 select-none">
                            {instrumentData.title.substring(0, 2)}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default InstrumentPage;
