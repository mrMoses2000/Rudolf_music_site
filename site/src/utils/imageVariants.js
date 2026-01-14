const buildSrcSet = (src, widths, ext) => {
    if (!src || !Array.isArray(widths) || widths.length === 0) return undefined;
    const base = src.replace(/\.(png|jpe?g|webp|avif)$/i, "");
    return widths
        .map((width, index) => {
            const suffix = index === widths.length - 1 ? `.${ext}` : `-${width}.${ext}`;
            return `${base}${suffix} ${width}w`;
        })
        .join(", ");
};

const imageWidths = {
    "/images/Trompete.webp": [768, 1280, 1920],
    "/images/Stellenangebote.webp": [768, 1280, 1920],
    "/images/Saxophon.webp": [768, 1280, 1920],
    "/images/Kunstunterricht.webp": [768, 1280, 1920],
    "/images/Keyboard.webp": [768, 1280, 1920],
    "/images/JeKits.webp": [768, 1280, 1920],
    "/images/Horn.webp": [768, 1280, 1920],
    "/images/Clarinet.webp": [768, 1280, 1920],
    "/images/Cajon.webp": [768, 1280, 1920],
    "/images/Bratsche.webp": [768, 1280, 1920],
    "/images/Akkordeon.webp": [768, 1280, 1920],
    "/images/streichinstrumente_1767156138943.webp": [512, 768, 1024],
    "/images/zupfinstrumente_1767156152934.webp": [512, 768, 1024],
    "/images/holzblasinstrumente_1767156168170.webp": [512, 768, 1024],
    "/images/blechblasinstrumente_1767156191476.webp": [512, 768, 1024],
    "/images/tasteninstrumente_1767156206992.webp": [512, 768, 1024],
    "/images/schlaginstrumente_1767156223197.webp": [512, 768, 1024],
    "/images/gesang_1767156238520.webp": [512, 768, 1024],
    "/images/attachments-Image-IMG_11926eb1.webp": [768, 1280, 1920],
    "/images/da36c84bafda7d37407bad3bf5a88da2_1560x1040_fit6eb1.webp": [768, 1280, 1560],
    "/images/51b6bc79bee489416ea4c75cdcae2bf3_1560x1040_fit6eb1.webp": [768, 1280, 1560],
    "/images/jekits_unique_1767157360834.webp": [512, 768, 1024],
    "/images/offer_button_kunst_1767157402302.webp": [512, 768, 1024],
    "/images/offer_button_jobs_1767157417216.webp": [512, 768, 1024],
    "/images/42189ee51904f4cfac9dd78268430f01_fit.webp": [512, 768, 800],
    "/images/4b091b29c8d513583704bf772ff526e2_fit.webp": [424],
    "/images/a5ec80309870f8e02ecee1673f45dc32_fit.webp": [512, 574],
    "/images/dcdade3ee948f10294535505b95fc5b7_fit.webp": [512, 590],
    "/images/6f8e937184f590ec3bae64094cf13f0d_fit.webp": [512, 714],
    "/images/8456442b2aa8f5b22c877a3fb7612916_fit.webp": [512, 768, 800],
    "/images/823d64ce71e48517301eab8d134ca26a_fit.webp": [512, 599],
    "/images/Aktuelles.webp": [768, 1280, 1920],
    "/images/Gebuehren.webp": [768, 1280, 1920],
    "/images/Jekitz-ts16957280966eb1.webp": [400, 600, 1200],
    "/images/header_blockfloete_1767158508450.webp": [512, 768, 1024],
    "/images/header_cello_1767158494629.webp": [512, 768, 1024],
    "/images/header_gesang_1767157543115.webp": [512, 768, 1024],
    "/images/header_gitarre_1767157500546.webp": [512, 768, 1024],
    "/images/header_klavier_1767157516215.webp": [512, 768, 1024],
    "/images/header_oboe_1767158542257.webp": [512, 768, 1024],
    "/images/header_querfloete_1767158524080.webp": [512, 768, 1024],
    "/images/header_schlagzeug_1767157529915.webp": [512, 768, 1024],
    "/images/header_violine_1767157486934.webp": [512, 768, 1024]
};

const buildVariants = (ext) =>
    Object.fromEntries(
        Object.entries(imageWidths).map(([src, widths]) => [src, buildSrcSet(src, widths, ext)])
    );

const webpSrcSets = buildVariants("webp");
const avifSrcSets = buildVariants("avif");

const normalizeKey = (src) => src?.replace(/\.(png|jpe?g|webp|avif)$/i, ".webp");

export const getWebpSrcSet = (src) => webpSrcSets[src] || webpSrcSets[normalizeKey(src)];
export const getAvifSrcSet = (src) => avifSrcSets[src] || avifSrcSets[normalizeKey(src)];
