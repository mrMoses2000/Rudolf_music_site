
import { motion } from "framer-motion";
import { content } from "../data/content";
import SmartImage from "../components/SmartImage";

const Fees = () => {
    return (
        <div className="min-h-screen">
            {/* Fees Hero */}
            <section className="relative h-[40vh] sm:h-[50vh] flex items-end pb-12 sm:pb-16 px-6 md:px-12 overflow-hidden border-b border-black/10 pt-32">
                <div className="absolute inset-0 z-0">
                    <SmartImage
                        src={content.fees.headerImage || "/images/Gebuehren.webp"}
                        alt="Fees Background"
                        className="block w-full h-full"
                        imgClassName="w-full h-full object-cover opacity-50 saturate-110"
                        loading="eager"
                        fetchPriority="high"
                        sizes="100vw"
                        useSrcSet
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/70 to-transparent"></div>
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <h1 className="text-4xl sm:text-6xl md:text-8xl font-outfit font-black text-ink leading-none tracking-tighter uppercase">
                            {content.fees.title}
                        </h1>
                    </motion.div>
                </div>
            </section>

            <section className="px-6 md:px-12 max-w-7xl mx-auto py-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 sm:gap-16 lg:gap-24 font-bold">
                    <div className="lg:col-span-2 space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-2xl md:text-3xl font-outfit font-bold text-ink">{content.fees.tableTitle}</h2>
                            <div className="overflow-x-auto rounded-3xl border border-black/10 shadow-[0_24px_60px_rgba(43,36,29,0.18)] bg-paper-strong">
                                <div className="md:hidden bg-[#F0E6D8] text-ink uppercase tracking-widest text-[10px] font-black px-4 sm:px-6 py-3 border-b border-black/10 text-center whitespace-pre-line">
                                    {content.fees.tableHeader[1]}
                                </div>
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#F0E6D8] text-ink uppercase tracking-widest text-xs">
                                            <th className="p-4 sm:p-6 md:p-8 border-b border-black/10 font-black">{content.fees.tableHeader[0]}</th>
                                            <th className="hidden md:table-cell p-4 sm:p-6 md:p-8 border-b border-black/10 font-black text-right whitespace-pre-line">{content.fees.tableHeader[1]}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {content.fees.table.map((row, i) => (
                                            <tr
                                                key={i}
                                                onClick={() => i > 0 && (window.location.href = '/contact')}
                                                className={`${row.price ? 'cursor-pointer' : ''} hover:bg-gold/5 transition-colors border-b border-black/5 last:border-0 group`}
                                            >
                                                <td className="p-4 sm:p-6 md:p-8 text-ink-muted group-hover:text-ink transition-colors">
                                                    {row.label}
                                                    {row.price && <span className="block md:hidden text-gold text-sm font-black mt-2">{row.price}</span>}
                                                </td>
                                                <td className="p-4 sm:p-6 md:p-8 text-right font-black text-ink text-lg sm:text-xl md:text-2xl group-hover:text-gold transition-colors hidden md:table-cell">
                                                    {row.price}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="space-y-4 text-sm text-ink-muted/80 font-black uppercase tracking-widest px-2 sm:px-6 md:px-8">
                            {content.fees.notes.map((note, i) => (
                                <p key={i}>{note}</p>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-2xl md:text-3xl font-outfit font-bold text-ink">{content.fees.infoTitle}</h2>
                            <div className="space-y-4 text-ink-muted font-bold">
                                {content.fees.info.map((line, i) => (
                                    <p key={i} className="leading-relaxed">{line}</p>
                                ))}
                            </div>
                        </div>

                        <div className="bg-paper-strong p-8 sm:p-10 rounded-3xl border border-black/10 space-y-8 shadow-[0_20px_50px_rgba(43,36,29,0.12)]">
                            <h3 className="text-xs font-black uppercase tracking-widest text-ink-muted">{content.fees.documentsTitle}</h3>
                            <div className="flex flex-col gap-4">
                                {content.fees.documents.map((doc, i) => (
                                    <a
                                        key={i}
                                        href={doc.url}
                                        className="flex items-center justify-between group bg-white hover:bg-gold/30 transition-all p-4 sm:p-6 rounded-2xl border border-black/10"
                                    >
                                        <span className="font-bold text-ink group-hover:text-ink">{doc.name}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section >
        </div >
    );
};


export default Fees;
