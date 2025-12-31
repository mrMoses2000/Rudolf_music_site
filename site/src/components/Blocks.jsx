import { motion } from "framer-motion";

const TAG_CLASSES = {
    h1: "text-3xl md:text-4xl font-outfit font-black text-ink leading-tight",
    h2: "text-2xl md:text-3xl font-outfit font-bold text-ink leading-tight",
    h3: "text-xl md:text-2xl font-outfit font-bold text-ink leading-tight",
    h4: "text-lg md:text-xl font-outfit font-semibold text-ink/90 leading-relaxed",
    p: "text-base md:text-lg text-ink-muted leading-relaxed",
    li: "text-base md:text-lg text-ink-muted leading-relaxed"
};

const containerVariants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
};

const resolveLink = (raw) => {
    if (!raw) return null;
    if (raw.endsWith(".html")) {
        const map = {
            "Angebot.html": "/offer",
            "unsere-Standorte.html": "/standorte",
            "Start.html": "/",
        };
        return map[raw] || null;
    }
    return raw;
};

const renderTextWithLink = (text) => {
    const match = text.match(/^(.*)\\(([^)]+)\\)$/);
    if (!match) return text;
    const [, prefix, rawLink] = match;
    const href = resolveLink(rawLink.trim());
    if (!href) return text;
    if (href.startsWith("mailto:")) {
        const email = href.replace("mailto:", "");
        const trimmedPrefix = prefix.trim();
        if (!trimmedPrefix || trimmedPrefix === email) {
            return (
                <a
                    href={`mailto:${email}`}
                    className="underline underline-offset-4 text-ink hover:text-gold transition-colors"
                >
                    {trimmedPrefix || email}
                </a>
            );
        }
        return (
            <>
                {trimmedPrefix}{" "}
                <a
                    href={`mailto:${email}`}
                    className="underline underline-offset-4 text-ink hover:text-gold transition-colors"
                >
                    {email}
                </a>
            </>
        );
    }
    return (
        <>
            {prefix.trim()}{" "}
            <a href={href} className="underline underline-offset-4 text-ink hover:text-gold transition-colors">
                {rawLink.trim()}
            </a>
        </>
    );
};

const Blocks = ({ blocks = [], className = "" }) => {
    const elements = [];
    let index = 0;

    while (index < blocks.length) {
        const block = blocks[index];
        if (block.type === "li") {
            const items = [];
            while (index < blocks.length && blocks[index].type === "li") {
                items.push(blocks[index].text);
                index += 1;
            }
            elements.push(
                <motion.div key={`list-${index}`} variants={itemVariants}>
                    <ul className="list-disc pl-6 space-y-2 marker:text-gold/70">
                        {items.map((item, itemIndex) => (
                            <li key={`li-${index}-${itemIndex}`} className={TAG_CLASSES.li}>
                                {renderTextWithLink(item)}
                            </li>
                        ))}
                    </ul>
                </motion.div>
            );
            continue;
        }

        if (block.type === "ul" && block.items) {
            elements.push(
                <motion.div key={`ul-${index}`} variants={itemVariants}>
                    <ul className="list-disc pl-6 space-y-2 marker:text-gold/70">
                        {block.items.map((item, itemIndex) => (
                            <li key={`ul-${index}-${itemIndex}`} className={TAG_CLASSES.li}>
                                {renderTextWithLink(item)}
                            </li>
                        ))}
                    </ul>
                </motion.div>
            );
            index += 1;
            continue;
        }

        const Tag = TAG_CLASSES[block.type] ? block.type : "p";
        elements.push(
            <motion.div key={`block-${index}`} variants={itemVariants}>
                <Tag className={TAG_CLASSES[block.type] || TAG_CLASSES.p}>
                    {renderTextWithLink(block.text)}
                </Tag>
            </motion.div>
        );
        index += 1;
    }

    return (
        <motion.div
            className={`space-y-6 ${className}`}
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
        >
            {elements}
        </motion.div>
    );
};

export default Blocks;
