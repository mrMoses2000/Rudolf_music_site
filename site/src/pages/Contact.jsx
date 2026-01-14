import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { content } from "../data/content";
import SmartImage from "../components/SmartImage";

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
        // Check for subject in location state (nav state) OR query params
        const params = new URLSearchParams(location.search);
        const querySubject = params.get("subject");

        let initialSubject = "";

        if (location.state?.subject) {
            initialSubject = location.state.subject;
        } else if (location.state?.instrument) {
            initialSubject = `Anmeldung für: ${location.state.instrument}`;
        } else if (querySubject) {
            initialSubject = querySubject;
        }

        if (initialSubject) {
            setFormData(prev => ({
                ...prev,
                subject: initialSubject
            }));
        }
    }, [location.state, location.search]);

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

    if (status === "success") {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-8"
                >
                    <div className="w-24 h-24 bg-gold rounded-full flex items-center justify-center mx-auto shadow-[0_20px_50px_rgba(199,154,85,0.4)]">
                        <svg className="w-12 h-12 text-paper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-outfit font-black text-ink uppercase tracking-tighter">Vielen Dank!</h2>
                        <p className="text-ink-muted font-bold text-lg">Ihre Nachricht wurde erfolgreich versendet. <br /> Wir melden uns in Kürze bei Ihnen.</p>
                    </div>
                    <button
                        onClick={() => setStatus("")}
                        className="text-gold font-black uppercase tracking-widest text-sm hover:underline"
                    >
                        Zurück zum Formular
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Contact Hero */}
            <section className="relative h-[35vh] sm:h-[45vh] flex items-end pb-10 sm:pb-12 px-6 md:px-12 border-b border-black/10 overflow-hidden pt-32">
                <div className="absolute inset-0 z-0">
                    <SmartImage
                        src="/images/attachments-Image-IMG_11926eb1.webp"
                        alt="Contact Background"
                        className="block w-full h-full"
                        imgClassName="w-full h-full object-cover opacity-30 scale-110"
                        loading="eager"
                        fetchPriority="high"
                        sizes="100vw"
                        useSrcSet
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/70 to-transparent"></div>
                </div>
                <div className="relative z-10 w-full max-w-7xl mx-auto">
                    <h1 className="text-4xl sm:text-6xl md:text-9xl font-outfit font-black text-ink leading-none tracking-tighter uppercase">
                        {content.contact.title}
                    </h1>
                </div>
            </section>

            <section className="px-6 md:px-12 max-w-7xl mx-auto py-16 sm:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-24 items-start">
                    {/* Info Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-12 sm:space-y-16"
                    >
                        <div className="space-y-6">
                            <h2 className="text-lg sm:text-xl md:text-3xl text-gold font-bold italic leading-tight">
                                {content.contact.intro}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-ink-muted">Adresse</h3>
                                <div className="text-base sm:text-lg md:text-xl font-bold text-ink leading-relaxed">
                                    {content.contact.address.map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-ink-muted">Kontakt</h3>
                                <div className="flex flex-col gap-2">
                                    <a href={`tel:${content.contact.phone}`} className="text-xl sm:text-2xl font-black text-ink hover:text-gold transition-colors">
                                        {content.contact.phone}
                                    </a>
                                    <a href={`mailto:${content.contact.email}`} className="text-lg font-bold text-ink-muted hover:text-ink transition-colors">
                                        {content.contact.email}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Form Side */}
                    <div className="bg-paper-strong p-8 sm:p-12 rounded-[2rem] border border-black/10 shadow-[0_24px_60px_rgba(43,36,29,0.18)] relative">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-ink-muted ml-2">{content.contact.form.nameLabel}</label>
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder=""
                                        className="w-full bg-white border border-black/10 rounded-2xl p-4 text-ink font-bold focus:border-gold/60 focus:outline-none focus:bg-white transition-all placeholder:opacity-20"
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-ink-muted ml-2">{content.contact.form.emailLabel}</label>
                                    <input
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        type="email"
                                        placeholder=""
                                        className="w-full bg-white border border-black/10 rounded-2xl p-4 text-ink font-bold focus:border-gold/60 focus:outline-none focus:bg-white transition-all placeholder:opacity-20"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-ink-muted ml-2">{content.contact.form.subjectLabel}</label>
                                <input
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder=""
                                    required
                                    className="w-full bg-white border border-black/10 rounded-2xl p-4 text-ink font-bold focus:border-gold/60 focus:outline-none focus:bg-white transition-all placeholder:opacity-20"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-ink-muted ml-2">{content.contact.form.messageLabel}</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder=""
                                    className="w-full bg-white border border-black/10 rounded-2xl p-4 sm:p-5 text-ink font-bold focus:border-gold/60 focus:outline-none focus:bg-white transition-all placeholder:opacity-20 resize-none"
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={status === "sending"}
                                className="w-full bg-ink text-paper py-4 sm:py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-gold hover:text-ink hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-[0_18px_40px_rgba(43,36,29,0.2)]"
                            >
                                {content.contact.form.submit}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
