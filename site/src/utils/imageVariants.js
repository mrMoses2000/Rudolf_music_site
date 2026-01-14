const buildWebpSrcSet = (src, widths) => {
    if (!src || !Array.isArray(widths) || widths.length === 0) return undefined;
    const base = src.replace(/\.(png|jpe?g|webp)$/i, "");
    return widths
        .map((width, index) => {
            const suffix = index === widths.length - 1 ? ".webp" : `-${width}.webp`;
            return `${base}${suffix} ${width}w`;
        })
        .join(", ");
};

const webpSrcSets = {
    "/images/Trompete.webp": buildWebpSrcSet("/images/Trompete.webp", [1280, 1920, 2560]),
    "/images/Stellenangebote.webp": buildWebpSrcSet("/images/Stellenangebote.webp", [1280, 1920, 2560]),
    "/images/Saxophon.webp": buildWebpSrcSet("/images/Saxophon.webp", [1280, 1920, 2560]),
    "/images/Kunstunterricht.webp": buildWebpSrcSet("/images/Kunstunterricht.webp", [1280, 1920, 2560]),
    "/images/Keyboard.webp": buildWebpSrcSet("/images/Keyboard.webp", [1280, 1920]),
    "/images/JeKits.webp": buildWebpSrcSet("/images/JeKits.webp", [1280, 1920, 2560]),
    "/images/Horn.webp": buildWebpSrcSet("/images/Horn.webp", [1280, 1920, 2560]),
    "/images/Clarinet.webp": buildWebpSrcSet("/images/Clarinet.webp", [1280, 1920, 2560]),
    "/images/Cajon.webp": buildWebpSrcSet("/images/Cajon.webp", [1280, 1920]),
    "/images/Bratsche.webp": buildWebpSrcSet("/images/Bratsche.webp", [1280, 1920, 2560]),
    "/images/Akkordeon.webp": buildWebpSrcSet("/images/Akkordeon.webp", [1280, 1920, 2560]),
    "/images/attachments-Image-IMG_11926eb1.webp": buildWebpSrcSet("/images/attachments-Image-IMG_11926eb1.webp", [1280, 1920, 2560]),
    "/images/da36c84bafda7d37407bad3bf5a88da2_1560x1040_fit6eb1.webp": buildWebpSrcSet("/images/da36c84bafda7d37407bad3bf5a88da2_1560x1040_fit6eb1.webp", [1280, 1560]),
    "/images/51b6bc79bee489416ea4c75cdcae2bf3_1560x1040_fit6eb1.webp": buildWebpSrcSet("/images/51b6bc79bee489416ea4c75cdcae2bf3_1560x1040_fit6eb1.webp", [1280, 1560]),
    "/images/Aktuelles.webp": buildWebpSrcSet("/images/Aktuelles.webp", [1280, 1920, 2560]),
    "/images/Gebuehren.webp": buildWebpSrcSet("/images/Gebuehren.webp", [1280, 1920, 2640])
};

const normalizeWebpKey = (src) => src?.replace(/\.(png|jpe?g)$/i, ".webp");

export const getWebpSrcSet = (src) => webpSrcSets[src] || webpSrcSets[normalizeWebpKey(src)];
