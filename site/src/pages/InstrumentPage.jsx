import { useParams, Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { content } from "../data/content";
import SmartImage from "../components/SmartImage";

const InstrumentPage = () => {
    const { name } = useParams();
    const normalizedName = name.toLowerCase();
    const resolvedKey = content.instruments[normalizedName]
        ? normalizedName
        : normalizedName === "gesangunterricht"
          ? "gesang"
          : normalizedName;
    const instrumentData = content.instruments[resolvedKey] || content.instruments["klavier"];
    const containerRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
    const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1.3]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    // Find category for breadcrumb ("Back to Strings")
    const category = content.categories.find((cat) =>
        cat.items.some((item) => {
            if (typeof item === 'string') return item.toLowerCase() === name.toLowerCase();
            return item.slug === name.toLowerCase();
        })
    );

    const descriptionContent = Array.isArray(instrumentData.lines)
        ? instrumentData.lines
        : typeof instrumentData.description === "string"
          ? instrumentData.description.split(/\n\s*\n/).map((line) => line.trim()).filter(Boolean)
          : [];

    return (
        <div ref={containerRef} className="min-h-screen">
            {/* Header Hero Area - Premium Reveal */}
            <section className="relative h-[70vh] flex items-end pb-20 px-6 md:px-12 border-b border-black/10 pt-32 overflow-hidden">
                <motion.div style={{ y, scale }} className="absolute inset-0 z-0">
                    <SmartImage
                        src={instrumentData.image || "/images/attachments-Image-IMG_11926eb1.jpg"}
                        alt={instrumentData.title}
                        className="block w-full h-full"
                        imgClassName="w-full h-full object-cover opacity-55 saturate-110"
                        loading="eager"
                        fetchPriority="high"
                        sizes="100vw"
                        useSrcSet
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/70 to-transparent"></div>
                </motion.div>

                <div className="relative z-10 w-full max-w-7xl mx-auto">
                    <motion.div
                        style={{ opacity }}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-8"
                    >
                        <Link to="/offer" className="group flex items-center gap-3 text-ink-muted font-black uppercase tracking-[0.4em] text-[10px] hover:text-gold transition-colors">
                            <span className="group-hover:-translate-x-2 transition-transform">←</span> {category?.title || "Angebot"}
                        </Link>

                        <h1 className="text-4xl sm:text-5xl md:text-[8rem] lg:text-[10rem] font-outfit font-black text-ink leading-[0.8] tracking-tighter uppercase break-words hyphens-auto">
                            {instrumentData.title}
                        </h1>

                        <Link
                            to={`/contact?subject=${encodeURIComponent(`Anmeldung für ${instrumentData.title}`)}`}
                            className="inline-flex items-center gap-4 bg-gold text-paper px-10 py-5 rounded-full font-black uppercase tracking-[0.2em] text-sm hover:bg-ink hover:text-white hover:scale-105 transition-all shadow-[0_20px_40px_rgba(199,154,85,0.4)]"
                        >
                            Jetzt Anmelden <span className="text-xl">→</span>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Content Area */}
            <div className="px-6 md:px-12 max-w-4xl mx-auto py-32">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="space-y-10 text-ink-muted text-lg md:text-xl leading-relaxed font-medium"
                >
                    {descriptionContent.map((line, i) => (
                        <motion.p
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.05 * i }}
                            className="whitespace-pre-line"
                        >
                            {line}
                        </motion.p>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default InstrumentPage;
