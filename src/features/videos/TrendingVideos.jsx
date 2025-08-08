// TrendingVideos.jsx - shows top trending videos for a selected niche with multi-platform support
import { useEffect, useState } from "react";
import VideoCard from "../../components/ui/VideoCard";
import { ComponentLoader } from "../../components/ui/Loading";
import SummaryApi from "../../api/SummaryApi";
import { FaYoutube, FaReddit } from "react-icons/fa";
import { SiPinterest } from "react-icons/si";

const PLATFORMS = [
  { id: "all", name: "All Platforms", icon: null, color: "text-primary" },
  { id: "youtube", name: "YouTube", icon: FaYoutube, color: "text-red-500" },
  { id: "reddit", name: "Reddit", icon: FaReddit, color: "text-orange-500" },
  {
    id: "pinterest",
    name: "Pinterest",
    icon: SiPinterest,
    color: "text-red-600",
  },
];

// Category mapping for different platforms
const CATEGORY_MAPPING = {
  Entertainment: {
    youtube: "entertainment",
    reddit: "entertainment",
    pinterest: "entertainment",
  },
  News: { youtube: "news", reddit: "news", pinterest: "news" },
  Music: { youtube: "music", reddit: "music", pinterest: "music" },
  Fashion: { youtube: "fashion", reddit: "fashion", pinterest: "fashion" },
  Memes: { youtube: "funny", reddit: "memes", pinterest: "humor" },
  Business: { youtube: "business", reddit: "business", pinterest: "business" },
  Sports: { youtube: "sports", reddit: "sports", pinterest: "sports" },
  Tech: { youtube: "technology", reddit: "technology", pinterest: "tech" },
  Food: { youtube: "cooking", reddit: "food", pinterest: "recipes" },
  Travel: { youtube: "travel", reddit: "travel", pinterest: "travel" },
  Art: { youtube: "art", reddit: "art", pinterest: "art" },
  Gaming: { youtube: "gaming", reddit: "gaming", pinterest: "gaming" },
  Fitness: { youtube: "fitness", reddit: "fitness", pinterest: "workout" },
  Lifestyle: {
    youtube: "lifestyle",
    reddit: "lifestyle",
    pinterest: "lifestyle",
  },
  Education: {
    youtube: "education",
    reddit: "education",
    pinterest: "learning",
  },
  Automotive: { youtube: "cars", reddit: "cars", pinterest: "automotive" },
};

export default function TrendingVideos({ niche, platform = "all" }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(platform);

  useEffect(() => {
    fetchTrendingVideos();
  }, [niche, selectedPlatform]);

  const fetchTrendingVideos = async () => {
    setLoading(true);
    setError(null);

    try {
      let allVideos = [];
      const categoryQueries = CATEGORY_MAPPING[niche] || {
        youtube: niche?.toLowerCase(),
        reddit: niche?.toLowerCase(),
        pinterest: niche?.toLowerCase(),
      };

      if (selectedPlatform === "all") {
        // Fetch from all platforms
        const fetchPromises = [
          fetchFromPlatform("youtube", categoryQueries.youtube),
          fetchFromPlatform("reddit", categoryQueries.reddit),
          fetchFromPlatform("pinterest", categoryQueries.pinterest),
        ];

        const results = await Promise.allSettled(fetchPromises);

        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            allVideos = [...allVideos, ...result.value];
          } else {
            console.warn(
              `Failed to fetch from ${
                ["youtube", "reddit", "pinterest"][index]
              }:`,
              result.reason
            );
          }
        });
      } else {
        // Fetch from selected platform only
        const query = categoryQueries[selectedPlatform] || niche?.toLowerCase();
        allVideos = await fetchFromPlatform(selectedPlatform, query);
      }

      // Shuffle and limit videos
      const shuffledVideos = allVideos
        .sort(() => Math.random() - 0.5)
        .slice(0, 16);
      setVideos(shuffledVideos);
    } catch (error) {
      console.error("Failed to fetch trending videos:", error);
      setError("Failed to load trending videos. Please try again.");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFromPlatform = async (platformId, query) => {
    try {
      let response;

      switch (platformId) {
        case "youtube":
          response = await SummaryApi.scrapeYouTube(query || "trending");
          break;
        case "reddit":
          response = await SummaryApi.scrapeReddit(query || "popular");
          break;
        case "pinterest":
          response = await SummaryApi.scrapePinterest(query || "viral");
          break;
        default:
          return [];
      }

      return transformVideos(response?.data || [], platformId);
    } catch (error) {
      console.error(`Error fetching from ${platformId}:`, error);
      return [];
    }
  };

  const transformVideos = (videosData, platformId) => {
    let videosList = [];

    if (Array.isArray(videosData)) {
      videosList = videosData;
    } else if (videosData && Array.isArray(videosData.results)) {
      videosList = videosData.results;
    } else if (videosData && Array.isArray(videosData.posts)) {
      videosList = videosData.posts;
    } else if (videosData && Array.isArray(videosData.videos)) {
      videosList = videosData.videos;
    } else if (videosData && Array.isArray(videosData.data)) {
      videosList = videosData.data;
    }

    return videosList.map((item, index) => {
      let transformedItem = {
        id: `${platformId}-${item.id || index}`,
        title: item.title || item.description || "Untitled",
        url: item.url || item.video_url || "#",
        thumbnail: item.thumbnail || item.image_url || "/placeholder-image.jpg",
        hashtags: [],
        platform: platformId,
      };

      // Handle hashtags field - ensure it's always an array
      if (item.hashtags) {
        if (Array.isArray(item.hashtags)) {
          transformedItem.hashtags = item.hashtags;
        } else if (typeof item.hashtags === "string") {
          transformedItem.hashtags = item.hashtags
            .split(/[,#\s]+/)
            .filter((tag) => tag.trim().length > 0)
            .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));
        }
      }

      // Platform-specific transformations
      switch (platformId) {
        case "youtube":
          transformedItem.platform = "YouTube";
          transformedItem.views = item.views;
          transformedItem.channel = item.channel;
          break;
        case "reddit":
          transformedItem.platform = "Reddit";
          transformedItem.subreddit = item.subreddit;
          transformedItem.upvotes = item.upvotes;
          if (
            !transformedItem.thumbnail ||
            transformedItem.thumbnail.includes("placeholder")
          ) {
            transformedItem.thumbnail =
              "https://via.placeholder.com/320x180/FF4500/white?text=Reddit";
          }
          break;
        case "pinterest":
          transformedItem.platform = "Pinterest";
          transformedItem.topic = item.topic;
          transformedItem.title =
            item.description || item.topic || transformedItem.title;
          break;
      }

      return transformedItem;
    });
  };

  if (!niche) return null;

  return (
    <div className="mt-8">
      <div className="text-center mb-8">
        <div className="glass-effect rounded-2xl p-6 modern-shadow-lg max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-ring bg-clip-text text-transparent mb-2">
            Top Trending Videos in {niche}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Discover what's trending and get inspired for your content
          </p>

          {/* Platform Selector */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {PLATFORMS.map((platformOption) => {
              const IconComponent = platformOption.icon;
              return (
                <button
                  key={platformOption.id}
                  onClick={() => setSelectedPlatform(platformOption.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    selectedPlatform === platformOption.id
                      ? "bg-primary text-primary-foreground modern-shadow"
                      : "bg-background/80 text-muted-foreground hover:bg-background border border-border hover:text-foreground"
                  }`}
                >
                  {IconComponent && (
                    <IconComponent
                      className={`w-4 h-4 ${platformOption.color}`}
                    />
                  )}
                  {platformOption.name}
                </button>
              );
            })}
          </div>
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
                    No trending videos found for {niche} on{" "}
                    {selectedPlatform === "all"
                      ? "any platform"
                      : PLATFORMS.find((p) => p.id === selectedPlatform)?.name}
                    . Try selecting a different platform or niche.
                  </p>
                </div>
              </div>
            )}
      </div>
    </div>
  );
}
