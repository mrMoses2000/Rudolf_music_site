
import { motion } from "framer-motion";
import { content } from "../data/content";

const About = () => {
    return (
        <div className="pt-12 px-6 md:px-12 max-w-5xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1 className="text-4xl md:text-5xl font-outfit font-bold text-white mb-8">{content.about.title}</h1>

                <p className="text-xl text-gold font-medium mb-12 italic">
                    {content.about.intro}
                </p>

                <div className="space-y-8 text-cloud/80 leading-relaxed text-lg">
                    <section>
                        {content.about.description.map((paragraph, index) => (
                            <p key={index} className="mb-4">{paragraph}</p>
                        ))}
                    </section>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="h-px bg-white/10 my-8"
                    />

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Geschichte</h2>
                        {content.about.history.map((paragraph, index) => (
                            <p key={index} className="mb-4">{paragraph}</p>
                        ))}
                    </section>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="h-px bg-white/10 my-8"
                    />

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Unsere Mission</h2>
                        {content.about.mission.map((paragraph, index) => (
                            <p key={index} className="mb-4">{paragraph}</p>
                        ))}
                    </section>
                </div>
            </motion.div>
        </div>
    );
};

export default About;
