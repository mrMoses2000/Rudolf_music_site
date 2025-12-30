import Blocks from "../components/Blocks";
import { content } from "../data/content";

const Aktuelles = () => {
    return (
        <div className="min-h-screen">
            <section className="relative h-[30vh] flex items-end pb-12 px-6 md:px-12 border-b border-black/10 pt-32 mb-20 bg-gold/5">
                <div className="relative z-10 w-full max-w-7xl mx-auto">
                    <h1 className="text-5xl md:text-8xl font-outfit font-black text-ink leading-none tracking-tighter uppercase">
                        Aktuelles
                    </h1>
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-6 pb-24">
                <Blocks blocks={content.pages.aktuelles.blocks || []} />
            </div>
        </div>
    );
};

export default Aktuelles;
