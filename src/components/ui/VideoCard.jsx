// VideoCard.jsx - Modern styled card for video preview with consistent height and dark mode support
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

  // Truncate title if it's too long
  const truncatedTitle =
    title && title.length > 60 ? title.substring(0, 60) + "..." : title;
  const displayTitle = showFullTitle ? title : truncatedTitle;

  return (
    <div className="glass-effect rounded-xl modern-shadow overflow-hidden flex flex-col hover:modern-shadow-lg transition-all duration-300 modern-button h-[400px] w-full">
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        {!imageError && thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-40 object-cover transition-transform duration-300 hover:scale-105"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-40 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              📱 No Image
            </span>
          </div>
        )}
      </a>
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

        {/* Watch button fixed at bottom */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80 transition-colors modern-button px-3 py-2 rounded-lg glass-effect modern-shadow hover:modern-shadow-lg w-full"
        >
          <span>▶️</span>
          Watch
        </a>
      </div>
    </div>
  );
}
