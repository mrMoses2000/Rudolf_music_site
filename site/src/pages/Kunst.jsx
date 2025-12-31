import { useEffect, useState } from "react";
import { content } from "../data/content";
import Blocks from "../components/Blocks";
import SmartImage from "../components/SmartImage";
import { motion, AnimatePresence } from "framer-motion";

const Kunst = () => {
    const data = content.pages.kunst;
    const gallery = data.gallery || [];
    const [activeIndex, setActiveIndex] = useState(null);
    const activeItem = activeIndex !== null ? gallery[activeIndex] : null;

    useEffect(() => {
        if (activeIndex === null) return;
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setActiveIndex(null);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [activeIndex]);

    return (
        <div className="min-h-screen pb-24 text-ink">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-end pb-16 px-6 md:px-12 overflow-hidden border-b border-black/10 pt-32">
                <div className="absolute inset-0 z-0">
                    <SmartImage
                        src={data.headerImage}
                        alt={data.title}
                        className="block w-full h-full"
                        imgClassName="w-full h-full object-cover opacity-90"
                        loading="eager"
                        fetchPriority="high"
                        sizes="100vw"
                        useSrcSet
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/40 to-transparent"></div>
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-outfit font-black text-ink leading-none tracking-tighter uppercase mb-6"
                    >
                        {data.title}
                    </motion.h1>
                </div>
            </section>

            {/* Content */}
            <div className="px-6 md:px-12 max-w-6xl mx-auto pt-24 space-y-16">
                <Blocks blocks={data.blocks} />

                {gallery.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {gallery.map((item, i) => (
                            <motion.div
                                key={item.title || i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="rounded-3xl overflow-hidden border border-black/10 bg-white/80 shadow-[0_20px_50px_rgba(43,36,29,0.12)]"
                            >
                                <button
                                    type="button"
                                    onClick={() => setActiveIndex(i)}
                                    aria-label={`Bild ansehen${item.title ? `: ${item.title}` : ""}`}
                                    className="group w-full text-left cursor-zoom-in"
                                >
                                    <div className="aspect-[4/3] bg-white overflow-hidden">
                                        <SmartImage
                                            src={item.src}
                                            alt={item.title}
                                            className="block w-full h-full"
                                            imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </div>
                                    <div className="p-6 text-lg text-ink-muted font-bold">{item.title}</div>
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {activeItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 py-12"
                        onClick={() => setActiveIndex(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 20 }}
                            transition={{ duration: 0.3 }}
                            className="relative max-w-5xl w-full bg-paper rounded-[2rem] overflow-hidden shadow-2xl border border-white/20"
                            onClick={(event) => event.stopPropagation()}
                            role="dialog"
                            aria-modal="true"
                        >
                            <button
                                type="button"
                                onClick={() => setActiveIndex(null)}
                                className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/90 text-ink font-black text-xl shadow-lg hover:bg-gold transition-colors"
                                aria-label="Schließen"
                            >
                                &times;
                            </button>
                            <div className="relative w-full aspect-[4/3] bg-black">
                                <SmartImage
                                    src={activeItem.src}
                                    alt={activeItem.title}
                                    className="absolute inset-0"
                                    imgClassName="w-full h-full object-contain bg-black"
                                    loading="eager"
                                    decoding="async"
                                />
                            </div>
                            {activeItem.title && (
                                <div className="px-8 py-6 text-lg font-black text-ink">
                                    {activeItem.title}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Kunst;
