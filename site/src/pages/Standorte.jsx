import { content } from "../data/content";
import Blocks from "../components/Blocks";

const Standorte = () => {
    const { standorte } = content.pages;
    const locations = standorte.locations ?? [];

    return (
        <div className="min-h-screen pt-32 px-6 md:px-12 pb-24">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col gap-3">
                    <h1 className="text-3xl md:text-4xl font-outfit font-black text-ink leading-tight">
                        {standorte.title}
                    </h1>
                </div>

                {locations.length ? (
                    <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {locations.map((location) => (
                            <div
                                key={location.name}
                                className="relative overflow-hidden rounded-3xl border border-ink/10 bg-white/70 p-6 shadow-[0_16px_40px_rgba(43,36,29,0.08)]"
                            >
                                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold/80 via-gold/40 to-transparent" />
                                <div className="flex flex-col gap-4">
                                    <h2 className="text-xl font-outfit font-black text-ink">
                                        {location.name}
                                    </h2>
                                    <div className="text-sm md:text-base text-ink-muted leading-relaxed">
                                        {location.address.map((line, lineIndex) => (
                                            <div key={`${location.name}-${lineIndex}`}>{line}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-10 space-y-12">
                        <Blocks blocks={standorte.blocks} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Standorte;
