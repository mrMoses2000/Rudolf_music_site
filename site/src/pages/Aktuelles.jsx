import Blocks from "../components/Blocks";
import { content } from "../data/content";

const Aktuelles = () => {
    return (
        <div className="min-h-screen pt-32 px-6 md:px-12 pb-24">
            <div className="max-w-5xl mx-auto">
                <Blocks blocks={content.pages.aktuelles.blocks} />
            </div>
        </div>
    );
};

export default Aktuelles;
