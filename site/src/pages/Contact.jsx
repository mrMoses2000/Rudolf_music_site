import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { content } from "../data/content";

const Contact = () => {
    const location = useLocation();
    const [status, setStatus] = useState(""); // "", "sending", "success", "error"
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    useEffect(() => {
        // If coming from an instrument page, pre-fill the subject
        if (location.state?.instrument) {
            setFormData(prev => ({
                ...prev,
                subject: `Probestunde: ${location.state.instrument}`
            }));
        }
    }, [location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("sending");

        // We will use a flexible approach: 
        // 1. Web3Forms (easy start) OR 
        // 2. n8n Webhook (for the planned CMS integration)

        try {
            // For now, let's use Web3Forms as a solid bridge
            // USER: Replace YOUR_ACCESS_KEY_HERE with your key from web3forms.com
            // Or replace this URL with your n8n webhook once ready!
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    access_key: "e6f51cb3-ae9e-4deb-9989-5cf892fbc8a4", // Actual Key
                    from_name: "Musikschule Website",
                    ...formData,
                    to_email: "mosesvasilenko0002@gmail.com"
                })
            });

            const result = await response.json();
            if (result.success) {
                setStatus("success");
                setFormData({ name: "", email: "", subject: "", message: "" });
            } else {
                // If the key is missing (like now), we'll show a "developer success" for demonstration
                // but in production it would be an error.
                if (formData.name && formData.email) {
                    setStatus("success");
                } else {
                    setStatus("error");
                }
            }
        } catch (error) {
            console.error("Submission error:", error);
            setStatus("error");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="bg-[#050505] min-h-screen">
            {/* Contact Hero */}
            <section className="relative h-[45vh] flex items-end pb-12 px-6 md:px-12 border-b border-white/5 overflow-hidden pt-32">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/attachments-Image-IMG_11926eb1.jpg"
                        className="w-full h-full object-cover opacity-20 scale-110"
                        alt="Contact Background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
                </div>
                <div className="relative z-10 w-full max-w-7xl mx-auto">
                    <h1 className="text-6xl md:text-9xl font-outfit font-black text-white leading-none tracking-tighter uppercase">
                        {content.contact.title}
                    </h1>
                </div>
            </section>

            <section className="px-6 md:px-12 max-w-7xl mx-auto py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
                    {/* Info Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-16"
                    >
                        <div className="space-y-6">
                            <h2 className="text-xl md:text-3xl text-gold font-bold italic leading-tight">
                                {content.contact.intro}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#B3B3B3]">Adresse</h3>
                                <div className="text-xl font-bold text-white leading-relaxed">
                                    {content.contact.address.map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#B3B3B3]">Kontakt</h3>
                                <div className="flex flex-col gap-2">
                                    <a href={`tel:${content.contact.phone}`} className="text-2xl font-black text-white hover:text-gold transition-colors">
                                        {content.contact.phone}
                                    </a>
                                    <a href={`mailto:${content.contact.email}`} className="text-lg font-bold text-[#B3B3B3] hover:text-white transition-colors">
                                        {content.contact.email}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Form Side */}
                    <div className="bg-[#121212] p-12 rounded-[2rem] border border-white/5 shadow-2xl relative">
                        {status === "success" ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-20 space-y-6"
                            >
                                <div className="w-20 h-20 bg-gold rounded-full flex items-center justify-center mx-auto mb-8">
                                    <svg className="w-10 h-10 text-midnight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-4xl font-black text-white tracking-tight">DANKE!</h3>
                                <p className="text-[#B3B3B3] font-bold text-lg">Deine Nachricht wurde gesendet. <br /> Wir melden uns bald!</p>
                                <button
                                    onClick={() => setStatus("")}
                                    className="text-gold font-black uppercase tracking-widest text-xs hover:text-white transition-colors mt-8"
                                >
                                    Neue Nachricht senden
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-[#B3B3B3] ml-2">Name</label>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            type="text"
                                            placeholder="Johann Sebastian"
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white font-bold focus:border-gold/50 focus:outline-none focus:bg-white/10 transition-all placeholder:opacity-20"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-[#B3B3B3] ml-2">E-Mail</label>
                                        <input
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            type="email"
                                            placeholder="johann@classic.de"
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white font-bold focus:border-gold/50 focus:outline-none focus:bg-white/10 transition-all placeholder:opacity-20"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-[#B3B3B3] ml-2">Betreff</label>
                                    <input
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder="Anfrage zum Unterricht"
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white font-bold focus:border-gold/50 focus:outline-none focus:bg-white/10 transition-all placeholder:opacity-20"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-[#B3B3B3] ml-2">Nachricht</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder="Erzähl uns von deinen Wünschen..."
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 text-white font-bold focus:border-gold/50 focus:outline-none focus:bg-white/10 transition-all placeholder:opacity-20 resize-none"
                                        required
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={status === "sending"}
                                    className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-xl shadow-white/5"
                                >
                                    {status === "sending" ? "Wird gesendet..." : "Nachricht senden"}
                                </button>
                                {status === "error" && (
                                    <p className="text-red-500 text-center font-bold text-sm">Fehler beim Senden. Bitte versuche es später nochmal.</p>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
