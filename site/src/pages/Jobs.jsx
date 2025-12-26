
import { motion } from "framer-motion";
import { content } from "../data/content";

const Jobs = () => {
    return (
        <div className="pt-12 px-6 md:px-12 max-w-4xl mx-auto mb-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-4xl md:text-5xl font-outfit font-bold text-white mb-8 leading-tight">{content.jobs.title}</h1>

                <div className="glass p-10 rounded-3xl border border-white/5 space-y-8">
                    <p className="text-xl text-gold font-medium italic">
                        "{content.jobs.intro}"
                    </p>

                    <div className="text-cloud/90 text-lg leading-relaxed space-y-6">
                        {content.jobs.description.map((para, i) => (
                            <p key={i}>{para}</p>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-white/10">
                        <h3 className="text-cloud/60 uppercase tracking-widest text-sm font-bold mb-4">{content.jobs.cta}</h3>
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <a href={`mailto:${content.contact.email}`} className="text-xl md:text-2xl text-white font-bold hover:text-gold transition-colors flex items-center gap-3">
                                ✉️ {content.contact.email}
                            </a>
                            <span className="hidden md:inline text-white/20">|</span>
                            <a href={`tel:${content.contact.phone.replace(/\D/g, '')}`} className="text-xl md:text-2xl text-white font-bold hover:text-gold transition-colors flex items-center gap-3">
                                📞 {content.contact.phone}
                            </a>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Jobs;
