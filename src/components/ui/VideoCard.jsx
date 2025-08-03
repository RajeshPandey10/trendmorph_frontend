// VideoCard.jsx - shadcn/ui styled card for video preview
export default function VideoCard({ thumbnail, title, url, hashtags = [] }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img src={thumbnail} alt={title} className="w-full h-40 object-cover" />
      </a>
      <div className="p-4 flex-1 flex flex-col">
        <h4 className="font-semibold text-lg mb-1 line-clamp-2">{title}</h4>
        {hashtags && hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {hashtags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium"
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
          className="mt-auto inline-block text-sm font-semibold text-primary hover:underline"
        >
          Watch
        </a>
      </div>
    </div>
  );
}
