
import { motion } from "framer-motion";
import { content } from "../data/content";

const Jobs = () => {
    return (
        <div className="pt-12 px-6 md:px-12 max-w-4xl mx-auto mb-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-4xl md:text-5xl font-outfit font-bold text-ink mb-8 leading-tight">{content.jobs.title}</h1>

                <div className="glass p-10 rounded-3xl border border-black/10 space-y-8">
                    <p className="text-xl text-gold font-medium italic">
                        "{content.jobs.intro}"
                    </p>

                    <div className="text-ink-muted text-lg leading-relaxed space-y-6">
                        {content.jobs.description.map((para, i) => (
                            <p key={i}>{para}</p>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-black/10">
                        <h3 className="text-ink-muted uppercase tracking-widest text-sm font-bold mb-4">{content.jobs.cta}</h3>
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <a href={`mailto:${content.jobs.contactEmail}`} className="text-xl md:text-2xl text-ink font-bold hover:text-gold transition-colors">
                                {content.jobs.contactEmail}
                            </a>
                            <span className="hidden md:inline text-ink/20">|</span>
                            <a href={`tel:${content.jobs.contactPhone.replace(/\D/g, '')}`} className="text-xl md:text-2xl text-ink font-bold hover:text-gold transition-colors">
                                {content.jobs.contactPhone}
                            </a>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Jobs;
