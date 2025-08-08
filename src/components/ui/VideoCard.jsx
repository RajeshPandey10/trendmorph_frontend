// VideoCard.jsx - Modern styled card for video preview with dark mode support
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
}) {
  // Ensure hashtags is always an array
  const safeHashtags = Array.isArray(hashtags) ? hashtags : [];

  return (
    <div className="glass-effect rounded-xl modern-shadow overflow-hidden flex flex-col hover:modern-shadow-lg transition-all duration-300 modern-button">
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-40 object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/320x180/6366f1/white?text=No+Image";
          }}
        />
      </a>
      <div className="p-4 flex-1 flex flex-col">
        {/* Platform badge */}
        {platform && (
          <div className="mb-2">
            <span className="inline-block bg-gradient-to-r from-blue-500/20 to-blue-500/10 text-blue-600 dark:text-blue-400 text-xs px-2 py-1 rounded-full font-medium">
              {platform}
            </span>
          </div>
        )}

        <h4 className="font-semibold text-lg mb-2 line-clamp-2 text-foreground dark:text-foreground">
          {title}
        </h4>

        {/* Platform-specific metadata */}
        {platform === "YouTube" && (views || channel) && (
          <div className="text-xs text-muted-foreground mb-2">
            {channel && <span>{channel}</span>}
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
          <div className="flex flex-wrap gap-2 mb-3">
            {safeHashtags.slice(0, 3).map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="bg-gradient-to-r from-primary/20 to-primary/10 text-primary dark:text-primary text-xs px-3 py-1 rounded-full font-medium modern-shadow"
              >
                {tag}
              </span>
            ))}
            {safeHashtags.length > 3 && (
              <span className="text-xs text-muted-foreground px-2 py-1">
                +{safeHashtags.length - 3} more
              </span>
            )}
          </div>
        )}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80 transition-colors modern-button px-3 py-2 rounded-lg glass-effect modern-shadow hover:modern-shadow-lg"
        >
          <span>▶️</span>
          Watch
        </a>
      </div>
    </div>
  );
}
