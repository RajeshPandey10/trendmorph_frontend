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
      <h3 className="text-xl font-semibold mb-4">
        Top Trending Videos in {niche}
      </h3>
      {loading && <ComponentLoader message="Loading trending videos..." />}
      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {Array.isArray(videos) && videos.length > 0
          ? videos.map((video) => <VideoCard key={video.id} {...video} />)
          : !loading && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No trending videos found for {niche}
              </div>
            )}
      </div>
    </div>
  );
}
