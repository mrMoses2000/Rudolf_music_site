const buildWebpSrcSet = (src, widths) => {
    if (!src || !Array.isArray(widths) || widths.length === 0) return undefined;
    const base = src.replace(/\.(png|jpe?g)$/i, "");
    return widths
        .map((width, index) => {
            const suffix = index === widths.length - 1 ? ".webp" : `-${width}.webp`;
            return `${base}${suffix} ${width}w`;
        })
        .join(", ");
};

const webpSrcSets = {
    "/images/Trompete.png": buildWebpSrcSet("/images/Trompete.png", [1280, 1920, 4800]),
    "/images/Stellenangebote.png": buildWebpSrcSet("/images/Stellenangebote.png", [1280, 1920, 4800]),
    "/images/Saxophon.png": buildWebpSrcSet("/images/Saxophon.png", [1280, 1920, 4800]),
    "/images/Musikkurse.png": buildWebpSrcSet("/images/Musikkurse.png", [1280, 1920, 4800]),
    "/images/Kunstunterricht.png": buildWebpSrcSet("/images/Kunstunterricht.png", [1280, 1920, 4800]),
    "/images/Keyboard.png": buildWebpSrcSet("/images/Keyboard.png", [1280, 1920, 4800]),
    "/images/JeKits.png": buildWebpSrcSet("/images/JeKits.png", [1280, 1920, 4800]),
    "/images/Horn.png": buildWebpSrcSet("/images/Horn.png", [1280, 1920, 4800]),
    "/images/Clarinet.png": buildWebpSrcSet("/images/Clarinet.png", [1280, 1920, 4800]),
    "/images/Cajon.png": buildWebpSrcSet("/images/Cajon.png", [1280, 1920, 4800]),
    "/images/Bratsche.png": buildWebpSrcSet("/images/Bratsche.png", [1280, 1920, 4800]),
    "/images/Akkordeon.png": buildWebpSrcSet("/images/Akkordeon.png", [1280, 1920, 4800]),
    "/images/attachments-Image-IMG_11926eb1.jpg": buildWebpSrcSet("/images/attachments-Image-IMG_11926eb1.jpg", [1280, 1920, 4032]),
    "/images/da36c84bafda7d37407bad3bf5a88da2_1560x1040_fit6eb1.jpg": buildWebpSrcSet("/images/da36c84bafda7d37407bad3bf5a88da2_1560x1040_fit6eb1.jpg", [1280, 1560]),
    "/images/51b6bc79bee489416ea4c75cdcae2bf3_1560x1040_fit6eb1.jpg": buildWebpSrcSet("/images/51b6bc79bee489416ea4c75cdcae2bf3_1560x1040_fit6eb1.jpg", [1280, 1560])
};

export const getWebpSrcSet = (src) => webpSrcSets[src];
    "/images/Aktuelles.png": buildWebpSrcSet("/images/Aktuelles.png", [1280, 1920, 3120]),
    "/images/Gebuehren.png": buildWebpSrcSet("/images/Gebuehren.png", [1280, 1920, 2640]),
