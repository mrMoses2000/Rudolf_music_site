import Blocks from "../components/Blocks";
import { content } from "../data/content";

const Kunst = () => {
    const gallery = content.pages.kunst.gallery || [];

    return (
        <div className="min-h-screen pt-32 px-6 md:px-12 pb-24">
            <div className="max-w-6xl mx-auto space-y-16">
                <Blocks blocks={content.pages.kunst.blocks} />

                {gallery.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {gallery.map((item) => (
                            <div key={item.title} className="rounded-3xl overflow-hidden border border-black/10 bg-white/80 shadow-[0_20px_50px_rgba(43,36,29,0.12)]">
                                <div className="aspect-[4/3] bg-white">
                                    <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-4 text-sm text-ink-muted font-bold">{item.title}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Kunst;
