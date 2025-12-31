import { getWebpSrcSet } from "../utils/imageVariants";

const getDerivedWebp = (src) => {
    if (!src) return undefined;
    if (!/\.(png|jpe?g)$/i.test(src)) return undefined;
    return src.replace(/\.(png|jpe?g)$/i, ".webp");
};

const SmartImage = ({
    src,
    alt = "",
    className,
    imgClassName,
    webpSrc,
    webpSrcSet,
    srcSet,
    sizes,
    loading,
    decoding = "async",
    fetchPriority,
    useSrcSet = false
}) => {
    const resolvedWebpSrcSet = webpSrcSet || (useSrcSet ? getWebpSrcSet(src) : undefined);
    const resolvedWebpSrc = webpSrc || getDerivedWebp(src);
    const webpSource = resolvedWebpSrcSet || resolvedWebpSrc;

    return (
        <picture className={className}>
            {webpSource && (
                <source
                    type="image/webp"
                    srcSet={webpSource}
                    sizes={resolvedWebpSrcSet ? sizes : undefined}
                />
            )}
            {srcSet && <source srcSet={srcSet} sizes={sizes} />}
            <img
                src={src}
                alt={alt}
                className={imgClassName}
                loading={loading}
                decoding={decoding}
                fetchPriority={fetchPriority}
            />
        </picture>
    );
};

export default SmartImage;
