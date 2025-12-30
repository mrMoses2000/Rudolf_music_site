import Blocks from "../components/Blocks";
import { content } from "../data/content";

const Impressum = () => {
    return (
        <div className="min-h-screen pt-32 px-6 md:px-12 pb-24">
            <div className="max-w-5xl mx-auto space-y-12">
                <Blocks blocks={content.legal.impressum.blocks} />
            </div>
        </div>
    );
};

export default Impressum;
