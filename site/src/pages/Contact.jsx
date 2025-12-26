
import { motion } from "framer-motion";
import { content } from "../data/content";

const Contact = () => {
    return (
        <div className="pt-12 px-6 md:px-12 max-w-7xl mx-auto mb-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-12"
            >
                <div>
                    <h1 className="text-4xl md:text-5xl font-outfit font-bold text-white mb-8">{content.contact.title}</h1>
                    <p className="text-xl text-gold font-medium mb-12 italic">
                        {content.contact.intro}
                    </p>

                    <div className="space-y-8 glass p-8 rounded-2xl">
                        <div>
                            <h3 className="text-sm uppercase tracking-widest text-cloud/50 mb-2">Adresse</h3>
                            {content.contact.address.map((line, i) => (
                                <p key={i} className="text-lg text-white font-medium">{line}</p>
                            ))}
                        </div>
                        <div>
                            <h3 className="text-sm uppercase tracking-widest text-cloud/50 mb-2">Telefon</h3>
                            <a href={`tel:${content.contact.phone.replace(/\D/g, '')}`} className="text-2xl text-gold font-bold hover:text-white transition-colors">
                                {content.contact.phone}
                            </a>
                        </div>
                        <div>
                            <h3 className="text-sm uppercase tracking-widest text-cloud/50 mb-2">E-Mail</h3>
                            <a href={`mailto:${content.contact.email}`} className="text-lg text-white font-medium hover:text-gold transition-colors">
                                {content.contact.email}
                            </a>
                        </div>
                    </div>
                </div>

                <div className="glass p-8 rounded-2xl border border-white/10">
                    <form className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-cloud/70 mb-2">Ihr Name *</label>
                            <input type="text" className="w-full bg-midnight/50 border border-white/10 rounded-lg p-4 text-white focus:border-gold focus:outline-none focus:bg-white/5 transition-all" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-cloud/70 mb-2">Ihre E-Mail-Adresse *</label>
                            <input type="email" className="w-full bg-midnight/50 border border-white/10 rounded-lg p-4 text-white focus:border-gold focus:outline-none focus:bg-white/5 transition-all" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-cloud/70 mb-2">Betreff</label>
                            <input type="text" className="w-full bg-midnight/50 border border-white/10 rounded-lg p-4 text-white focus:border-gold focus:outline-none focus:bg-white/5 transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-cloud/70 mb-2">Nachricht *</label>
                            <textarea rows="4" className="w-full bg-midnight/50 border border-white/10 rounded-lg p-4 text-white focus:border-gold focus:outline-none focus:bg-white/5 transition-all" required></textarea>
                        </div>
                        <button type="submit" className="w-full bg-gold text-midnight font-bold py-4 rounded-lg hover:bg-white transition-colors shadow-lg shadow-gold/10">
                            Nachricht senden
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Contact;
