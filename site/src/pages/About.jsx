
import { motion } from "framer-motion";
import { content } from "../data/content";
import SmartImage from "../components/SmartImage";

const About = () => {
    const data = content.pages.about;

    return (
        <div className="min-h-screen">
            {/* About Hero */}
            <section className="relative h-[50vh] sm:h-[65vh] md:h-[70vh] flex items-end pb-12 sm:pb-20 px-6 md:px-12 overflow-hidden pt-32">
                <div className="absolute inset-0 z-0">
                    <SmartImage
                        src={data.headerImage || "/images/51b6bc79bee489416ea4c75cdcae2bf3_1560x1040_fit6eb1.webp"}
                        alt="About Background"
                        className="block w-full h-full"
                        imgClassName="w-full h-full object-cover opacity-65 saturate-110 transition-all duration-1000"
                        loading="eager"
                        fetchPriority="high"
                        sizes="100vw"
                        useSrcSet
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/60 to-transparent"></div>
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <h1 className="text-4xl sm:text-6xl md:text-[8rem] font-outfit font-black text-ink leading-none tracking-tighter uppercase">
                            {data.title}
                        </h1>

                    </motion.div>
                </div>
            </section>

            {/* About Content */}
            <section className="px-6 md:px-12 max-w-7xl mx-auto py-16 sm:py-24 md:py-32 grid grid-cols-1 font-bold text-ink-muted text-base sm:text-lg md:text-xl leading-relaxed cv-auto">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-12"
                >
                    {data.blocks.map((block, index) => {
                        if (block.type === "h1" && block.text?.trim() === data.title) return null;
                        if (block.type === "image" && block.src) {
                            return (
                                <figure key={index} className="space-y-3 max-w-5xl">
                                    <SmartImage
                                        src={block.src}
                                        alt={block.alt || data.title}
                                        className="block w-full overflow-hidden rounded-3xl border border-black/10 shadow-[0_24px_60px_rgba(43,36,29,0.14)]"
                                        imgClassName="w-full h-auto object-cover"
                                        loading="lazy"
                                        sizes="(min-width: 1024px) 960px, 100vw"
                                        useSrcSet
                                    />
                                    {block.caption && (
                                        <figcaption className="text-sm text-ink-muted text-center">
                                            {block.caption}
                                        </figcaption>
                                    )}
                                </figure>
                            );
                        }
                        if (block.type === "h1") {
                            return (
                                <h2 key={index} className="text-2xl md:text-3xl font-outfit font-black text-ink mt-16 first:mt-0">
                                    {block.text}
                                </h2>
                            );
                        }
                        if (block.type === "h2") {
                            return (
                                <h3 key={index} className="text-sm font-black uppercase tracking-[0.4em] text-ink mt-16 first:mt-0">
                                    {block.text}
                                </h3>
                            );
                        }
                        if (block.type === "h3") {
                            return (
                                <h4 key={index} className="text-2xl md:text-3xl text-gold font-bold italic leading-tight my-8">
                                    {block.text}
                                </h4>
                            );
                        }
                        return (
                            <p key={index} className="max-w-3xl whitespace-pre-line">
                                {block.text}
                            </p>
                        );
                    })}
                </motion.div>
            </section>

        </div>
    );
};


export default About;
