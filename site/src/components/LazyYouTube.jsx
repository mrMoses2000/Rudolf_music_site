import { useState } from "react";

const LazyYouTube = ({
    videoId,
    title = "YouTube video",
    className,
    iframeClassName = "w-full h-full",
    thumbnailQuality = "hqdefault"
}) => {
    const [isLoaded, setIsLoaded] = useState(false);

    if (!videoId) return null;

    const thumbnailSrc = `https://i.ytimg.com/vi/${videoId}/${thumbnailQuality}.jpg`;
    const label = title ? `Смотреть видео: ${title}` : "Смотреть видео";

    return (
        <div className={className}>
            {isLoaded ? (
                <iframe
                    className={iframeClassName}
                    src={`https://www.youtube.com/embed/${videoId}?controls=1`}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                ></iframe>
            ) : (
                <button
                    type="button"
                    className="group relative w-full h-full"
                    onClick={() => setIsLoaded(true)}
                    aria-label={label}
                >
                    <img
                        src={thumbnailSrc}
                        alt={title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-paper/90 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-7 h-7 sm:w-9 sm:h-9 text-ink translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                </button>
            )}
        </div>
    );
};

export default LazyYouTube;
