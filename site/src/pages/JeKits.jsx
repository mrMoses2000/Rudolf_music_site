import { content } from "../data/content";
import Blocks from "../components/Blocks";
import { motion } from "framer-motion";

const JeKits = () => {
    const data = content.pages.jekits;
    const images = data.images || [];
    const isSingleImage = images.length === 1;

    return (
        <div className="min-h-screen pb-24 text-ink">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-end pb-16 px-6 md:px-12 overflow-hidden border-b border-black/10 pt-32">
                <div className="absolute inset-0 z-0">
                    <img
                        src={data.headerImage}
                        alt={data.title}
                        className="w-full h-full object-cover opacity-90"
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
            <div className="px-6 md:px-12 max-w-5xl mx-auto pt-24 space-y-16">
                <Blocks blocks={data.blocks} />
            </div>

            {isSingleImage && (
                <section className="relative h-[50vh] mt-16 overflow-hidden border-t border-black/10">
                    <img
                        src={images[0].src}
                        alt={images[0].alt || "JeKits"}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/40 to-transparent"></div>
                </section>
            )}

            {!isSingleImage && images.length > 0 && (
                <div className="px-6 md:px-12 max-w-6xl mx-auto pt-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {images.map((image, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="rounded-3xl overflow-hidden border border-black/10 shadow-lg aspect-[4/3]"
                            >
                                <img
                                    src={image.src}
                                    alt={image.alt || "JeKits"}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default JeKits;
