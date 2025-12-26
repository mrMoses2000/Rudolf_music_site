
import { motion } from "framer-motion";
import { content } from "../data/content";

const About = () => {
    return (
        <div className="bg-[#050505] min-h-screen">
            {/* About Hero */}
            <section className="relative h-[70vh] flex items-end pb-20 px-6 md:px-12 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/51b6bc79bee489416ea4c75cdcae2bf3_1560x1040_fit6eb1.jpg"
                        alt="About Background"
                        className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <h1 className="text-7xl md:text-[8rem] font-outfit font-black text-white leading-none tracking-tighter uppercase">
                            {content.about.title}
                        </h1>
                        <p className="text-xl md:text-3xl text-gold font-bold italic max-w-2xl leading-tight">
                            {content.about.intro}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* About Content */}
            <section className="px-6 md:px-12 max-w-7xl mx-auto py-32 grid grid-cols-1 lg:grid-cols-2 gap-24 font-bold text-[#B3B3B3] text-xl leading-relaxed">
                <div className="space-y-12">
                    <div className="space-y-8">
                        <h2 className="text-sm font-black uppercase tracking-[0.4em] text-white">Unsere Philosophie</h2>
                        {content.about.description.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                </div>

                <div className="space-y-16">
                    <div className="space-y-8">
                        <h2 className="text-sm font-black uppercase tracking-[0.4em] text-white">Geschichte</h2>
                        <div className="space-y-6">
                            {content.about.history.map((paragraph, index) => (
                                <p key={index} className="pl-6 border-l-2 border-gold/30">{paragraph}</p>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-sm font-black uppercase tracking-[0.4em] text-white">Unsere Mission</h2>
                        <div className="space-y-6">
                            {content.about.mission.map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Background */}
            <section className="py-40 bg-gold">
                <div className="max-w-5xl mx-auto px-6 text-center text-midnight">
                    <h2 className="text-5xl md:text-7xl font-outfit font-black uppercase tracking-tighter mb-12 leading-[0.9]">
                        Werde Teil unserer <br /> musikalischen Familie
                    </h2>
                    <Link to="/contact" className="bg-white text-black px-16 py-6 rounded-full font-black uppercase tracking-widest text-xl hover:scale-105 transition-all shadow-2xl active:scale-95 inline-block">
                        Kontakt Aufnehmen
                    </Link>
                </div>
            </section>
        </div>
    );
};


export default About;
