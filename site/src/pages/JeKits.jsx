import Blocks from "../components/Blocks";
import { content } from "../data/content";

const JeKits = () => {
    const images = content.pages.jekits.images || [];

    return (
        <div className="min-h-screen pt-32 px-6 md:px-12 pb-24">
            <div className="max-w-6xl mx-auto space-y-16">
                <Blocks blocks={content.pages.jekits.blocks} />

                {images.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {images.map((image) => (
                            <div key={image.src} className="rounded-3xl overflow-hidden border border-black/10 shadow-[0_20px_50px_rgba(43,36,29,0.12)]">
                                <img src={image.src} alt={image.alt} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JeKits;
