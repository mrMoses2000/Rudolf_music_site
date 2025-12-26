
import { motion } from "framer-motion";
import { content } from "../data/content";
import { FiDownload, FiCheck } from "react-icons/fi"; // Assuming react-icons is/will be installed, or replace with SVG

const Fees = () => {
    return (
        <div className="pt-12 px-6 md:px-12 max-w-5xl mx-auto mb-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1 className="text-4xl md:text-5xl font-outfit font-bold text-white mb-8">{content.fees.title}</h1>

                <div className="glass p-8 rounded-2xl mb-12">
                    <h3 className="text-xl font-bold text-gold mb-4">Wichtige Infos</h3>
                    <ul className="space-y-2 mb-6">
                        {content.fees.info.map((line, i) => (
                            <li key={i} className="flex gap-3 text-cloud/90">
                                <span className="text-gold mt-1">✓</span> {line}
                            </li>
                        ))}
                    </ul>
                    <div className="flex flex-wrap gap-4">
                        {content.fees.documents.map((doc, i) => (
                            <a key={i} href={doc.url} className="flex items-center gap-2 bg-white/5 hover:bg-gold hover:text-midnight px-4 py-2 rounded-lg transition-colors text-sm font-bold border border-white/10">
                                📄 {doc.name}
                            </a>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-white/10 shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-gold">
                                <th className="p-4 border-b border-white/10 font-bold w-2/3">{content.fees.tableHeader[0]}</th>
                                <th className="p-4 border-b border-white/10 font-bold text-right">{content.fees.tableHeader[1]}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-midnight/50">
                            {content.fees.table.map((row, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                                    <td className="p-4 text-cloud/90">{row.label}</td>
                                    <td className="p-4 text-right font-mono font-bold text-white">{row.price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 text-sm text-cloud/60 space-y-1">
                    {content.fees.notes.map((note, i) => (
                        <p key={i}>{note}</p>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default Fees;
