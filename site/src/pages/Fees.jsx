
import { motion } from "framer-motion";
import { content } from "../data/content";
import { FiDownload, FiCheck } from "react-icons/fi"; // Assuming react-icons is/will be installed, or replace with SVG

const Fees = () => {
    return (
        <div className="bg-[#050505] min-h-screen">
            {/* Fees Hero */}
            <section className="relative h-[50vh] flex items-end pb-16 px-6 md:px-12 overflow-hidden border-b border-white/5 pt-32">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/Jekitz-ts16957280966eb1.jpg"
                        alt="Fees Background"
                        className="w-full h-full object-cover opacity-40 grayscale"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <h1 className="text-6xl md:text-8xl font-outfit font-black text-white leading-none tracking-tighter uppercase">
                            {content.fees.title}
                        </h1>
                    </motion.div>
                </div>
            </section>

            <section className="px-6 md:px-12 max-w-7xl mx-auto py-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-24 font-bold">
                    <div className="lg:col-span-2 space-y-12">
                        <div className="overflow-x-auto rounded-3xl border border-white/10 shadow-2xl bg-[#121212]">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 text-gold uppercase tracking-widest text-xs">
                                        <th className="p-8 border-b border-white/10 font-black">{content.fees.tableHeader[0]}</th>
                                        <th className="p-8 border-b border-white/10 font-black text-right">{content.fees.tableHeader[1]}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {content.fees.table.map((row, i) => (
                                        <tr key={i} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group">
                                            <td className="p-8 text-[#B3B3B3] group-hover:text-white transition-colors">{row.label}</td>
                                            <td className="p-8 text-right font-black text-white text-2xl group-hover:text-gold transition-colors">{row.price}€</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="space-y-4 text-sm text-[#535353] font-black uppercase tracking-widest px-8">
                            {content.fees.notes.map((note, i) => (
                                <p key={i}>{note}</p>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-[#1DB954] text-white p-10 rounded-3xl space-y-8 shadow-2xl shadow-green-500/20">
                            <h3 className="text-3xl font-black uppercase tracking-tighter leading-none italic">Wichtige Information</h3>
                            <ul className="space-y-6">
                                {content.fees.info.map((line, i) => (
                                    <li key={i} className="flex gap-4 items-start">
                                        <div className="min-w-[24px] h-[24px] bg-white text-black rounded-full flex items-center justify-center text-xs">✓</div>
                                        <span className="font-bold leading-tight">{line}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-[#121212] p-10 rounded-3xl border border-white/5 space-y-8">
                            <h3 className="text-xs font-black uppercase tracking-widest text-[#B3B3B3]">Unterlagen</h3>
                            <div className="flex flex-col gap-4">
                                {content.fees.documents.map((doc, i) => (
                                    <a
                                        key={i}
                                        href={doc.url}
                                        className="flex items-center justify-between group bg-white/5 hover:bg-gold transition-all p-6 rounded-2xl border border-white/5"
                                    >
                                        <span className="font-bold text-white group-hover:text-black">{doc.name}</span>
                                        <span className="text-[#B3B3B3] group-hover:text-black italic px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest">PDF</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};


export default Fees;
