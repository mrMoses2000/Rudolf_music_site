import { content } from "../data/content";
import Blocks from "../components/Blocks";
import SmartImage from "../components/SmartImage";

const Aktuelles = () => {
    const data = content.pages.aktuelles;

    return (
        <div className="min-h-screen">
            <section className="relative h-[45vh] sm:h-[55vh] md:h-[60vh] flex items-end pb-12 sm:pb-16 px-6 md:px-12 overflow-hidden border-b border-black/10 pt-32 mb-12 sm:mb-20">
                <div className="absolute inset-0 z-0">
                    <SmartImage
                        src={data.headerImage || "/images/Aktuelles.webp"}
                        alt="Aktuelles"
                        className="block w-full h-full"
                        imgClassName="w-full h-full object-cover opacity-90"
                        loading="eager"
                        fetchPriority="high"
                        sizes="100vw"
                        useSrcSet
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/40 to-transparent"></div>
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto">
                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-outfit font-black text-ink leading-none tracking-tighter uppercase drop-shadow-sm">
                        {data.title}
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
