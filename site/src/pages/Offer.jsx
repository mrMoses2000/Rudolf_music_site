import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { content } from "../data/content";
import SmartImage from "../components/SmartImage";
import Blocks from "../components/Blocks";

const Offer = () => {
    // State to toggle the instrument grid visibility if needed, or just scroll to it.
    // User requested: "Clicking on instruments opens this beautiful panel".
    // We can interpret this as a scroll to section or a toggle.
    // Let's make it a toggle for "Instrumente & Gesang".
    const [showInstruments, setShowInstruments] = useState(false);

    const toggleInstruments = () => {
        setShowInstruments(!showInstruments);
        // Optional: scroll to it
        if (!showInstruments) {
            setTimeout(() => {
                document.getElementById('instrument-grid')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    const offerBlocks = content.offer?.blocks || [];
    const offerIntro = content.offer?.intro || "";
    const filteredOfferBlocks = offerIntro
        ? offerBlocks.filter((block, index) => !(index === 0 && block.text === offerIntro))
        : offerBlocks;

    const offerMainButtons = [
        {
            label: "Instrumente & Gesang",
            image: "/images/streichinstrumente_1767156138943.webp", // Use one of the good ones
            action: toggleInstruments,
            isToggle: true
        },
        {
            label: "JeKits",
            to: "/jekits",
            image: "/images/jekits_unique_1767157360834.webp"
        },
        {
            label: "Kunstunterricht",
            to: "/kunst",
            image: "/images/offer_button_kunst_1767157402302.webp"
        },
        {
            label: "Stellenangebote",
            to: "/jobs",
            image: "/images/offer_button_jobs_1767157417216.webp"
        }
    ];

    return (
        <div className="min-h-screen bg-paper pb-32">
            {/* Offer Hero */}
            <section className="relative h-[40vh] sm:h-[50vh] flex items-end pb-12 sm:pb-16 px-6 md:px-12 overflow-hidden border-b border-black/10 pt-32">
                <div className="absolute inset-0 z-0 text-center">
                    <SmartImage
                        src="/images/da36c84bafda7d37407bad3bf5a88da2_1560x1040_fit6eb1.webp"
                        alt="Offer Background"
                        className="block w-full h-full"
                        imgClassName="w-full h-full object-cover opacity-30 saturate-0 scale-105"
                        loading="eager"
                        fetchPriority="high"
                        sizes="100vw"
                        useSrcSet
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/60 to-transparent"></div>
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <h1 className="text-4xl sm:text-6xl md:text-9xl font-outfit font-black text-ink leading-none tracking-tighter uppercase mb-6">
                            {content.offer.title}
                        </h1>
                        {offerIntro && (
                            <div className="max-w-2xl text-ink-muted text-base sm:text-lg md:text-xl font-medium leading-relaxed">
                                {offerIntro}
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>

            <div className="px-6 md:px-12 max-w-7xl mx-auto py-20 sm:py-24">
                {filteredOfferBlocks.length > 0 && (
                    <div className="max-w-4xl mx-auto mb-16">
                        <Blocks blocks={filteredOfferBlocks} />
                    </div>
                )}

                {/* Main Feature Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
                    {offerMainButtons.map((btn, i) => (
                        <motion.div
                            key={btn.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`group relative h-56 sm:h-64 md:h-80 rounded-3xl overflow-hidden cursor-pointer shadow-[0_20px_40px_rgba(43,36,29,0.08)] hover:shadow-[0_30px_60px_rgba(43,36,29,0.15)] transition-all ${btn.label === "Instrumente & Gesang" ? 'md:col-span-2 lg:col-span-1 bg-ink text-paper' : 'bg-white'}`}
                            onClick={btn.isToggle ? btn.action : undefined}
                        >
                            {btn.to ? (
                                <Link to={btn.to} className="block w-full h-full relative z-10 p-6 sm:p-8 flex flex-col justify-between">
                                    <div className="absolute inset-0 z-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500">
                                        {btn.image && (
                                            <SmartImage
                                                src={btn.image}
                                                alt={btn.label}
                                                className="absolute inset-0"
                                                imgClassName="w-full h-full object-cover opacity-100 group-hover:scale-110 transition-transform duration-700"
                                                loading="eager"
                                                decoding="async"
                                                fetchPriority={i === 0 ? "high" : "auto"}
                                                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                                                useSrcSet
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
                                    </div>
                                    <div className="relative z-10 mt-auto">
                                        <h3 className="text-2xl sm:text-3xl font-outfit font-black text-paper hover:text-gold transition-colors">{btn.label}</h3>
                                        <span className="text-sm font-bold uppercase tracking-widest text-paper/80 mt-2 block group-hover:translate-x-2 transition-transform">Entdecken →</span>
                                    </div>
                                </Link>
                            ) : (
                                <div className="w-full h-full relative z-10 p-6 sm:p-8 flex flex-col justify-between">
                                    <div className="absolute inset-0 z-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500">
                                        {btn.image && (
                                            <SmartImage
                                                src={btn.image}
                                                alt={btn.label}
                                                className="absolute inset-0"
                                                imgClassName="w-full h-full object-cover opacity-100 group-hover:scale-110 transition-transform duration-700"
                                                loading="eager"
                                                decoding="async"
                                                fetchPriority={i === 0 ? "high" : "auto"}
                                                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                                                useSrcSet
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
                                    </div>
                                    <div className="relative z-10 mt-auto">
                                        <h3 className="text-2xl sm:text-3xl font-outfit font-black text-paper">{btn.label}</h3>
                                        <span className={`text-sm font-bold uppercase tracking-widest text-paper/80 mt-2 block transition-transform ${showInstruments ? 'rotate-90 text-gold' : 'group-hover:translate-y-1'}`}>
                                            {showInstruments ? 'Schließen ×' : 'Anzeigen ↓'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Instrument Grid (Conditionally Shown or always shown but smoothed) */}
                <AnimatePresence>
                    {showInstruments && (
                        <motion.div
                            id="instrument-grid"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="mb-12 border-t border-black/10 pt-12">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-outfit font-black text-ink mb-8 sm:mb-12 text-center uppercase tracking-tight">Wählen Sie Ihr Instrument</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {content.categories.map((cat, index) => (
                                        <motion.div
                                            key={cat.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group bg-white p-6 rounded-3xl border border-black/5 hover:border-gold/30 hover:shadow-xl transition-all"
                                        >
                                            <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-paper-strong relative">
                                                {cat.image && (
                                                    <SmartImage
                                                        src={cat.image}
                                                        alt={cat.title}
                                                        className="block w-full h-full"
                                                        imgClassName="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                        loading={index < 4 ? "eager" : "lazy"}
                                                        decoding="async"
                                                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                                                        useSrcSet
                                                    />
                                                )}
                                            </div>
                                            <h3 className="text-xl font-black text-ink mb-4">{cat.title}</h3>
                                            <ul className="space-y-2">
                                                {cat.items.map((item) => {
                                                    const label = typeof item === "string" ? item : item.label;
                                                    const slug = typeof item === "string" ? null : item.slug;
                                                    return slug ? (
                                                        <li key={label}>
                                                            <Link to={`/offer/${slug}`} className="block text-sm font-bold text-ink-muted hover:text-gold hover:translate-x-1 transition-all">
                                                                {label}
                                                            </Link>
                                                        </li>
                                                    ) : (
                                                        <li key={label} className="text-sm font-bold text-ink-muted/50 cursor-default">
                                                            {label}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};

export default Offer;
