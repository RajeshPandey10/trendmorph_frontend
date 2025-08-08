// VideoCard.jsx - Modern styled card for video preview with dark mode support
export default function VideoCard({ thumbnail, title, url, hashtags = [] }) {
  return (
    <div className="glass-effect rounded-xl modern-shadow overflow-hidden flex flex-col hover:modern-shadow-lg transition-all duration-300 modern-button">
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-40 object-cover transition-transform duration-300 hover:scale-105"
        />
      </a>
      <div className="p-4 flex-1 flex flex-col">
        <h4 className="font-semibold text-lg mb-2 line-clamp-2 text-foreground dark:text-foreground">
          {title}
        </h4>
        {hashtags && hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {hashtags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="bg-gradient-to-r from-primary/20 to-primary/10 text-primary dark:text-primary text-xs px-3 py-1 rounded-full font-medium modern-shadow"
              >
                {tag}
              </span>
            ))}
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
