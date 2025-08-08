// TrendingVideos.jsx - shows top trending videos for a selected niche
import { useEffect, useState } from "react";
import VideoCard from "../../components/ui/VideoCard";
import { ComponentLoader } from "../../components/ui/Loading";
import SummaryApi from "../../api/SummaryApi";

export default function TrendingVideos({ niche }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendingVideos = async () => {
      if (!niche) return;

      setLoading(true);
      setError(null);
      try {
        const response = await SummaryApi.getNicheData(niche);
        // Ensure videos is always an array
        const videosData = response.data;
        if (Array.isArray(videosData)) {
          setVideos(videosData);
        } else if (videosData && Array.isArray(videosData.results)) {
          setVideos(videosData.results);
        } else if (videosData && Array.isArray(videosData.posts)) {
          setVideos(videosData.posts);
        } else {
          setVideos([]);
        }
      } catch (err) {
        setError("Failed to load trending videos");
        console.error("Failed to fetch trending videos:", err);
        // Fallback to dummy data on error
        setVideos([
          {
            id: 1,
            title: "Viral Dance Challenge",
            url: "https://youtu.be/xyz1",
            thumbnail: "https://i.ytimg.com/vi/xyz1/hqdefault.jpg",
            hashtags: ["#dance", "#challenge", "#viral"],
          },
          {
            id: 2,
            title: "AI Meme Generator",
            url: "https://youtu.be/xyz2",
            thumbnail: "https://i.ytimg.com/vi/xyz2/hqdefault.jpg",
            hashtags: ["#ai", "#memes", "#funny"],
          },
          {
            id: 3,
            title: "Fashion Week Highlights",
            url: "https://youtu.be/xyz3",
            thumbnail: "https://i.ytimg.com/vi/xyz3/hqdefault.jpg",
            hashtags: ["#fashion", "#trending", "#style"],
          },
          {
            id: 4,
            title: "Tech News Recap",
            url: "https://youtu.be/xyz4",
            thumbnail: "https://i.ytimg.com/vi/xyz4/hqdefault.jpg",
            hashtags: ["#tech", "#news", "#update"],
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingVideos();
  }, [niche]);

  if (!niche) return null;

  return (
    <div className="mt-8">
      <div className="text-center mb-8">
        <div className="glass-effect rounded-2xl p-6 modern-shadow-lg max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-ring bg-clip-text text-transparent mb-2">
            Top Trending Videos in {niche}
          </h3>
          <p className="text-muted-foreground text-sm">
            Discover what's trending and get inspired for your content
          </p>
        </div>
      </div>

      {loading && <ComponentLoader message="Loading trending videos..." />}

      {error && (
        <div className="mb-6 p-4 rounded-xl glass-effect border border-destructive/20 text-destructive dark:text-destructive text-sm modern-shadow">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            {error}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.isArray(videos) && videos.length > 0
          ? videos.map((video, index) => (
              <div
                key={video.id}
                className="float-element"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <VideoCard {...video} />
              </div>
            ))
          : !loading && (
              <div className="col-span-full text-center py-12">
                <div className="glass-effect rounded-2xl p-8 modern-shadow max-w-md mx-auto">
                  <div className="text-4xl mb-4">📹</div>
                  <h4 className="text-lg font-semibold mb-2 text-foreground dark:text-foreground">
                    No Videos Found
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    No trending videos found for {niche}. Try selecting a
                    different niche.
                  </p>
                </div>
              </div>
            )}
      </div>
    </div>
  );
}
