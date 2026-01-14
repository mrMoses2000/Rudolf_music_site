import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef, useState, useMemo, useEffect } from "react";
import { content } from "../data/content";
import Blocks from "../components/Blocks";
import SmartImage from "../components/SmartImage";
import LazyYouTube from "../components/LazyYouTube";

const Home = () => {
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
    const scaleHero = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const reduceMotion = useReducedMotion();

    const psalmText = (content.hero?.psalm || "")
        .replace(/["“”„]/g, "")
        .replace(/\s*Psalm\s*103\s*$/i, "")
        .trim();
    const psalmQuote = psalmText ? `„${psalmText}“` : "";
    const [typedPsalm, setTypedPsalm] = useState(psalmQuote);
    const [isPsalmDone, setIsPsalmDone] = useState(true);

    const handleMouseMove = (e) => {
        const { clientX, clientY, currentTarget } = e;
        const { left, top } = currentTarget.getBoundingClientRect();
        setMousePos({ x: clientX - left, y: clientY - top });
    };

    useEffect(() => {
        if (!psalmQuote) {
            setTypedPsalm("");
            setIsPsalmDone(true);
            return;
        }
        if (reduceMotion) {
            setTypedPsalm(psalmQuote);
            setIsPsalmDone(true);
            return;
        }

        let index = 0;
        let timeoutId;

        setTypedPsalm("");
        setIsPsalmDone(false);

        const tick = () => {
            index += 1;
            setTypedPsalm(psalmQuote.slice(0, index));
            if (index < psalmQuote.length) {
                timeoutId = setTimeout(tick, 28);
            } else {
                setIsPsalmDone(true);
            }
        };

        timeoutId = setTimeout(tick, 220);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [psalmQuote, reduceMotion]);

    useEffect(() => {
        const urls = content.categories
            .slice(0, 8)
            .map((cat) => cat.image)
            .filter(Boolean)
            .map((src) => src.replace(/\.webp$/i, "-768.avif"));

        urls.forEach((href) => {
            if (document.querySelector(`link[rel="preload"][href="${href}"]`)) return;
            const link = document.createElement("link");
            link.rel = "preload";
            link.as = "image";
            link.type = "image/avif";
            link.href = href;
            document.head.appendChild(link);
        });
    }, []);

    const startBlocks = content.pages?.start?.blocks || [];
    const startMainBlocks = useMemo(() => {
        const heroTexts = new Set([content.hero.subtitle, content.hero.title].filter(Boolean));
        return startBlocks.filter((block) => !(block.type === "h1" && heroTexts.has(block.text)));
    }, [startBlocks, content.hero.subtitle, content.hero.title]);
    const offerIntro = content.offer?.blocks?.[0]?.text || content.offer?.title;
    const titleWords = content.hero.title.split(" ");
    const primaryWords = titleWords.slice(0, 3);
    const secondaryWords = titleWords.slice(3).join(" ");

    return (
        <div className="text-ink">
            {/* Hero Section - Premium Parallax */}
            <section
                ref={heroRef}
                className="relative min-h-[100svh] flex items-center pb-[clamp(2rem,5vh,3.5rem)] pt-[clamp(3rem,7vh,5.5rem)] px-6 md:px-12 overflow-hidden"
            >
                <motion.div style={{ y, scale: scaleHero }} className="absolute inset-0 z-0">
                    <SmartImage
                        src="/images/da36c84bafda7d37407bad3bf5a88da2_1560x1040_fit6eb1.webp"
                        alt="Musikschule Background"
                        className="block w-full h-full"
                        imgClassName="w-full h-full object-cover opacity-75"
                        loading="eager"
                        fetchPriority="high"
                        sizes="100vw"
                        useSrcSet
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/60 to-transparent"></div>
                </motion.div>

                <div className="relative z-10 w-full max-w-7xl mx-auto translate-y-4 sm:translate-y-6">
                    <motion.div
                        style={{ opacity: opacityHero }}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-[clamp(1.5rem,3vh,2.6rem)]"
                    >
                        {/* Psalm Quote - Elegant Design */}
                        <motion.blockquote
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="relative flex flex-col md:flex-row md:items-start gap-[clamp(0.75rem,2vh,1.5rem)] mb-2 sm:mb-4"
                        >
                            {/* Quote Text */}
                            <p className="font-libre text-base sm:text-lg md:text-xl text-ink italic leading-relaxed flex-1">
                                {typedPsalm}
                                {!reduceMotion && typedPsalm.length < psalmQuote.length && (
                                    <span className="typewriter-caret" aria-hidden="true">
                                        |
                                    </span>
                                )}
                            </p>

                            {/* Psalm 103 Badge - On the Right */}
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={isPsalmDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                                transition={{ duration: 0.6 }}
                                className="flex items-center gap-3 shrink-0"
                            >
                                <span className="w-12 h-1 bg-ink rounded-full"></span>
                                <span className="text-ink font-black uppercase tracking-[0.2em] text-xs sm:text-sm whitespace-nowrap">
                                    Psalm 103
                                </span>
                            </motion.div>
                        </motion.blockquote>

                        <div className="space-y-4">
                            {/* Main Title - First */}
                            <h1 className="text-[clamp(2.4rem,6.2vw,4.8rem)] font-cinzel font-black leading-[1.05] tracking-tighter uppercase max-w-5xl text-ink break-normal hyphens-none">
                                {primaryWords.map((word, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                                        className="inline-block mr-4"
                                    >
                                        {word}
                                    </motion.span>
                                ))}
                                {secondaryWords && (
                                    <>
                                        <br />
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.9, duration: 1 }}
                                            className="text-gold inline-block"
                                        >
                                            {secondaryWords}
                                        </motion.span>
                                    </>
                                )}
                            </h1>

                            {/* Welcome Text - Second */}
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1, duration: 0.8 }}
                                className="text-xs sm:text-sm md:text-base text-ink tracking-[0.12em] font-black uppercase"
                            >
                                {content.hero.subtitle}
                            </motion.p>
                        </div>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2, duration: 0.8 }}
                            className="flex flex-col sm:flex-row gap-5"
                        >
                            <Link to="/offer" className="group bg-ink text-paper px-7 py-3 sm:px-11 sm:py-4 rounded-full font-black text-sm sm:text-base uppercase tracking-widest hover:text-ink transition-all active:scale-95 shadow-[0_20px_50px_rgba(43,36,29,0.25)] relative overflow-hidden text-center w-full sm:w-auto">
                                <span className="relative z-10">{content.hero.offerBtn}</span>
                                <div className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </Link>
                            <Link to="/about" className="bg-transparent text-ink border-2 border-ink/20 px-7 py-3 sm:px-11 sm:py-4 rounded-full font-black text-sm sm:text-base uppercase tracking-widest hover:bg-ink hover:text-paper transition-all text-center w-full sm:w-auto">
                                {content.hero.aboutBtn}
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            <section className="py-24 px-6 md:px-12 bg-paper/60 cv-auto">
                <div className="max-w-5xl mx-auto space-y-12">
                    <Blocks blocks={startMainBlocks} />

                    {content.pages?.start?.videoEmbedId && (
                        <div className="space-y-4">
                            {content.pages?.start?.videoTitle && (
                                <p className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-ink-muted">
                                    {content.pages.start.videoTitle}
                                </p>
                            )}
                            <div className="aspect-video w-full rounded-3xl overflow-hidden border border-black/10 shadow-[0_24px_60px_rgba(43,36,29,0.18)]">
                                <LazyYouTube
                                    videoId={content.pages.start.videoEmbedId}
                                    title={content.pages?.start?.videoTitle || "YouTube video player"}
                                    className="w-full h-full"
                                />
                            </div>
                        </div>
                    )}

                </div>
            </section>

            {/* Categories Preview - Spotlight Grid */}
            <section className="py-24 sm:py-32 lg:py-40 px-6 md:px-12 relative z-20">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="flex flex-col sm:flex-row sm:justify-between sm:items-end items-start gap-6 sm:gap-0 mb-12 sm:mb-24"
                    >
                        <div className="space-y-4">
                            <h2 className="text-3xl sm:text-4xl md:text-6xl font-outfit font-black tracking-tighter text-ink leading-tight">{offerIntro}</h2>
                        </div>
                        <Link to="/offer" className="group text-xs sm:text-sm font-black uppercase tracking-widest text-ink-muted hover:text-ink transition-colors pb-2 border-b-2 border-transparent hover:border-gold">
                            {content.offer?.title} <span className="inline-block group-hover:translate-x-2 transition-transform">→</span>
                        </Link>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        {content.categories.slice(0, 8).map((cat, index) => (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                onMouseMove={handleMouseMove}
                                className="flex"
                            >
                                <Link
                                    to="/offer"
                                    className="spotify-card group relative p-0 overflow-hidden aspect-[4/5] flex flex-col justify-end rounded-[2rem] w-full"
                                >
                                    {/* Spotlight Background Effect */}
                                    <div
                                        className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                        style={{
                                            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(199, 154, 85, 0.18), transparent 45%)`
                                        }}
                                    />

                                    <SmartImage
                                        src={cat.image || "/images/da36c84bafda7d37407bad3bf5a88da2_1560x1040_fit6eb1.webp"}
                                        alt={cat.title}
                                        className="absolute inset-0"
                                        imgClassName="w-full h-full object-cover opacity-55 saturate-110 group-hover:opacity-70 group-hover:scale-105 transition-all duration-1000"
                                        loading="eager"
                                        decoding="async"
                                        fetchPriority="high"
                                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                                        useSrcSet
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-paper/95 via-paper/30 to-transparent opacity-100"></div>

                                    <div className="p-6 sm:p-8 md:p-10 relative z-20 transition-transform duration-500 group-hover:-translate-y-4 -ml-1">
                                        <h3 className="text-base sm:text-base lg:text-[0.95rem] xl:text-[1.05rem] font-black text-ink group-hover:text-gold transition-colors leading-snug mb-3 uppercase tracking-tight break-normal hyphens-none whitespace-normal">
                                            {cat.title}
                                        </h3>
                                    </div>

                                    <div className="absolute top-6 right-6 sm:top-8 sm:right-8 w-12 h-12 md:w-16 md:h-16 bg-gold rounded-full flex items-center justify-center opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 shadow-2xl shadow-gold/40 z-30">
                                        <svg className="w-6 h-6 md:w-8 md:h-8 text-ink translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
