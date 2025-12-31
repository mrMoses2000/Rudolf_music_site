import { content } from "../data/content";
import Blocks from "../components/Blocks";
import SmartImage from "../components/SmartImage";
import { motion } from "framer-motion";

const Musikkurse = () => {
    const data = content.pages.musikkurse;
    const logos = data.logos || [];

    return (
        <div className="min-h-screen pb-24 text-ink">
            {/* Hero Section */}
            <section className="relative h-[45vh] sm:h-[55vh] md:h-[60vh] flex items-end pb-12 sm:pb-16 px-6 md:px-12 overflow-hidden border-b border-black/10 pt-32">
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
                        className="text-4xl sm:text-6xl md:text-8xl font-outfit font-black text-ink leading-none tracking-tighter uppercase mb-6"
                    >
                        {data.title}
                    </motion.h1>
                </div>
            </section>

            {/* Content */}
            <div className="px-6 md:px-12 max-w-5xl mx-auto pt-16 sm:pt-24 space-y-12">
                {logos.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        {logos.map((logo, index) => (
                            <div key={index} className="h-16 sm:h-20">
                                <SmartImage
                                    src={logo.src}
                                    alt={logo.alt || "Musikkurse Logo"}
                                    className="block h-full w-auto"
                                    imgClassName="h-full w-auto object-contain"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>
                        ))}
                    </div>
                )}
                <Blocks blocks={data.blocks} />

                {data.images && data.images.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                        {data.images.map((img, i) => {
                            const src = typeof img === "string" ? img : img.src;
                            const alt = typeof img === "string" ? `Musikkurse ${i + 1}` : (img.alt || `Musikkurse ${i + 1}`);
                            return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="rounded-3xl overflow-hidden border border-black/10 shadow-lg aspect-[4/3]"
                            >
                                <SmartImage
                                    src={src}
                                    alt={alt}
                                    className="block w-full h-full"
                                    imgClassName="w-full h-full object-cover"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Musikkurse;
