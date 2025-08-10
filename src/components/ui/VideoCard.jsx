// VideoCard.jsx - Modern styled card for video preview with embedded player support
import { useState } from "react";

export default function VideoCard({
  thumbnail,
  title,
  url,
  hashtags = [],
  platform,
  views,
  channel,
  subreddit,
  upvotes,
  category,
}) {
  // Ensure hashtags is always an array
  const safeHashtags = Array.isArray(hashtags) ? hashtags : [];
  const [showFullTitle, setShowFullTitle] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showEmbeddedPlayer, setShowEmbeddedPlayer] = useState(false);

  // Truncate title if it's too long
  const truncatedTitle =
    title && title.length > 60 ? title.substring(0, 60) + "..." : title;
  const displayTitle = showFullTitle ? title : truncatedTitle;

  // Extract YouTube video ID for embedded player
  const getYouTubeVideoId = (url) => {
    if (!url || platform !== "YouTube") return null;

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const youtubeVideoId = getYouTubeVideoId(url);

  // Handle video preview toggle
  const handlePreview = (e) => {
    e.preventDefault();
    if (platform === "YouTube" && youtubeVideoId) {
      setShowEmbeddedPlayer(!showEmbeddedPlayer);
    } else {
      // Open external link for non-YouTube content
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="glass-effect rounded-xl modern-shadow overflow-hidden flex flex-col hover:modern-shadow-lg transition-all duration-300 modern-button h-[400px] w-full">
      {/* Video thumbnail or embedded player */}
      {showEmbeddedPlayer && youtubeVideoId ? (
        <div className="w-full h-40 relative">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0`}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <button
            onClick={() => setShowEmbeddedPlayer(false)}
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
            title="Close player"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          className="cursor-pointer block relative group"
          onClick={handlePreview}
        >
          {!imageError && thumbnail ? (
            <div className="relative">
              <img
                src={thumbnail}
                alt={title}
                className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                onError={() => setImageError(true)}
                loading="lazy"
              />
              {/* Play overlay for YouTube videos */}
              {platform === "YouTube" && youtubeVideoId && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-red-600 rounded-full p-3 transform scale-110 group-hover:scale-125 transition-transform">
                    <span className="text-white text-xl">▶️</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-40 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                📱 No Image
              </span>
            </div>
          )}
        </div>
      )}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="flex-1">
          {/* Platform and category badges */}
          <div className="mb-2 flex gap-2 flex-wrap">
            {platform && (
              <span className="inline-block bg-gradient-to-r from-blue-500/20 to-blue-500/10 text-blue-600 dark:text-blue-400 text-xs px-2 py-1 rounded-full font-medium">
                {platform}
              </span>
            )}
            {category && category !== "General" && category !== "" && (
              <span className="inline-block bg-gradient-to-r from-green-500/20 to-green-500/10 text-green-600 dark:text-green-400 text-xs px-2 py-1 rounded-full font-medium">
                {category}
              </span>
            )}
          </div>

          <div className="mb-2">
            <h4 className="font-semibold text-sm text-foreground dark:text-foreground leading-tight">
              {displayTitle}
            </h4>
            {title && title.length > 60 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowFullTitle(!showFullTitle);
                }}
                className="text-xs text-primary hover:text-primary/80 mt-1 transition-colors"
              >
                {showFullTitle ? "See Less" : "See More"}
              </button>
            )}
          </div>

          {/* Platform-specific metadata */}
          {platform === "YouTube" && (views || channel) && (
            <div className="text-xs text-muted-foreground mb-2">
              {channel && <span className="line-clamp-1">{channel}</span>}
              {views && channel && <span> • </span>}
              {views && <span>{views.toLocaleString()} views</span>}
            </div>
          )}

          {platform === "Reddit" && (subreddit || upvotes) && (
            <div className="text-xs text-muted-foreground mb-2">
              {subreddit && <span>r/{subreddit}</span>}
              {upvotes && subreddit && <span> • </span>}
              {upvotes && <span>{upvotes} upvotes</span>}
            </div>
          )}

          {safeHashtags && safeHashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {safeHashtags.slice(0, 2).map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="bg-gradient-to-r from-primary/20 to-primary/10 text-primary dark:text-primary text-xs px-2 py-1 rounded-full font-medium modern-shadow line-clamp-1"
                >
                  {tag}
                </span>
              ))}
              {safeHashtags.length > 2 && (
                <span className="text-xs text-muted-foreground px-2 py-1">
                  +{safeHashtags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Watch/Preview button fixed at bottom */}
        <div className="flex gap-2">
          <button
            onClick={handlePreview}
            className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80 transition-colors modern-button px-3 py-2 rounded-lg glass-effect modern-shadow hover:modern-shadow-lg"
          >
            {platform === "YouTube" && youtubeVideoId ? (
              <>
                <span>{showEmbeddedPlayer ? "🎬" : "▶️"}</span>
                {showEmbeddedPlayer ? "Playing" : "Preview"}
              </>
            ) : (
              <>
                <span>🔗</span>
                View
              </>
            )}
          </button>

          {/* External link button for YouTube videos */}
          {platform === "YouTube" && youtubeVideoId && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 text-sm font-semibold text-secondary-foreground hover:text-primary transition-colors modern-button px-3 py-2 rounded-lg glass-effect modern-shadow hover:modern-shadow-lg"
              title="Open in YouTube"
            >
              <span>📺</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
