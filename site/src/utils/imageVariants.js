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
    "/images/Kunstunterricht.webp": buildWebpSrcSet("/images/Kunstunterricht.webp", [768, 1280, 1920, 2560]),
    "/images/Keyboard.webp": buildWebpSrcSet("/images/Keyboard.webp", [1280, 1920]),
    "/images/JeKits.webp": buildWebpSrcSet("/images/JeKits.webp", [768, 1280, 1920, 2560]),
    "/images/Horn.webp": buildWebpSrcSet("/images/Horn.webp", [1280, 1920, 2560]),
    "/images/Clarinet.webp": buildWebpSrcSet("/images/Clarinet.webp", [1280, 1920, 2560]),
    "/images/Cajon.webp": buildWebpSrcSet("/images/Cajon.webp", [1280, 1920]),
    "/images/Bratsche.webp": buildWebpSrcSet("/images/Bratsche.webp", [1280, 1920, 2560]),
    "/images/Akkordeon.webp": buildWebpSrcSet("/images/Akkordeon.webp", [1280, 1920, 2560]),
    "/images/streichinstrumente_1767156138943.webp": buildWebpSrcSet("/images/streichinstrumente_1767156138943.webp", [512, 768, 1024]),
    "/images/zupfinstrumente_1767156152934.webp": buildWebpSrcSet("/images/zupfinstrumente_1767156152934.webp", [512, 768, 1024]),
    "/images/holzblasinstrumente_1767156168170.webp": buildWebpSrcSet("/images/holzblasinstrumente_1767156168170.webp", [512, 768, 1024]),
    "/images/blechblasinstrumente_1767156191476.webp": buildWebpSrcSet("/images/blechblasinstrumente_1767156191476.webp", [512, 768, 1024]),
    "/images/tasteninstrumente_1767156206992.webp": buildWebpSrcSet("/images/tasteninstrumente_1767156206992.webp", [512, 768, 1024]),
    "/images/schlaginstrumente_1767156223197.webp": buildWebpSrcSet("/images/schlaginstrumente_1767156223197.webp", [512, 768, 1024]),
    "/images/gesang_1767156238520.webp": buildWebpSrcSet("/images/gesang_1767156238520.webp", [512, 768, 1024]),
    "/images/attachments-Image-IMG_11926eb1.webp": buildWebpSrcSet("/images/attachments-Image-IMG_11926eb1.webp", [768, 1280, 1920, 2560]),
    "/images/da36c84bafda7d37407bad3bf5a88da2_1560x1040_fit6eb1.webp": buildWebpSrcSet("/images/da36c84bafda7d37407bad3bf5a88da2_1560x1040_fit6eb1.webp", [768, 1280, 1560]),
    "/images/51b6bc79bee489416ea4c75cdcae2bf3_1560x1040_fit6eb1.webp": buildWebpSrcSet("/images/51b6bc79bee489416ea4c75cdcae2bf3_1560x1040_fit6eb1.webp", [768, 1280, 1560]),
    "/images/jekits_unique_1767157360834.webp": buildWebpSrcSet("/images/jekits_unique_1767157360834.webp", [512, 768, 1024]),
    "/images/offer_button_kunst_1767157402302.webp": buildWebpSrcSet("/images/offer_button_kunst_1767157402302.webp", [512, 768, 1024]),
    "/images/offer_button_jobs_1767157417216.webp": buildWebpSrcSet("/images/offer_button_jobs_1767157417216.webp", [512, 768, 1024]),
    "/images/42189ee51904f4cfac9dd78268430f01_fit.webp": buildWebpSrcSet("/images/42189ee51904f4cfac9dd78268430f01_fit.webp", [512, 768, 800]),
    "/images/4b091b29c8d513583704bf772ff526e2_fit.webp": buildWebpSrcSet("/images/4b091b29c8d513583704bf772ff526e2_fit.webp", [424]),
    "/images/a5ec80309870f8e02ecee1673f45dc32_fit.webp": buildWebpSrcSet("/images/a5ec80309870f8e02ecee1673f45dc32_fit.webp", [512, 574]),
    "/images/dcdade3ee948f10294535505b95fc5b7_fit.webp": buildWebpSrcSet("/images/dcdade3ee948f10294535505b95fc5b7_fit.webp", [512, 590]),
    "/images/6f8e937184f590ec3bae64094cf13f0d_fit.webp": buildWebpSrcSet("/images/6f8e937184f590ec3bae64094cf13f0d_fit.webp", [512, 714]),
    "/images/8456442b2aa8f5b22c877a3fb7612916_fit.webp": buildWebpSrcSet("/images/8456442b2aa8f5b22c877a3fb7612916_fit.webp", [512, 768, 800]),
    "/images/823d64ce71e48517301eab8d134ca26a_fit.webp": buildWebpSrcSet("/images/823d64ce71e48517301eab8d134ca26a_fit.webp", [512, 599]),
    "/images/Aktuelles.webp": buildWebpSrcSet("/images/Aktuelles.webp", [1280, 1920, 2560]),
    "/images/Gebuehren.webp": buildWebpSrcSet("/images/Gebuehren.webp", [1280, 1920, 2640])
};

const normalizeWebpKey = (src) => src?.replace(/\.(png|jpe?g)$/i, ".webp");

export const getWebpSrcSet = (src) => webpSrcSets[src] || webpSrcSets[normalizeWebpKey(src)];
