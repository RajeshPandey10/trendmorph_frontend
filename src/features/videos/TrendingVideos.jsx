// TrendingVideos.jsx - shows top trending videos for a selected niche with multi-platform support
import { useEffect, useState, useRef } from "react";
import VideoCard from "../../components/ui/VideoCard";
import { ComponentLoader } from "../../components/ui/Loading";
import SummaryApi from "../../api/SummaryApi";

// Category mapping for different platforms - comprehensive mapping for all categories
const CATEGORY_MAPPING = {
  // Core categories
  Music: { youtube: "music", reddit: "music", pinterest: "music" },
  Sports: { youtube: "sports", reddit: "sports", pinterest: "sports" },
  Entertainment: {
    youtube: "entertainment",
    reddit: "entertainment",
    pinterest: "entertainment",
  },
  News: { youtube: "news", reddit: "news", pinterest: "news" },
  Fashion: { youtube: "fashion", reddit: "fashion", pinterest: "fashion" },
  Gaming: { youtube: "gaming", reddit: "gaming", pinterest: "gaming" },
  Tech: { youtube: "tech", reddit: "technology", pinterest: "tech" },
  Food: { youtube: "food", reddit: "food", pinterest: "food" },
  Travel: { youtube: "travel", reddit: "travel", pinterest: "travel" },
  Fitness: { youtube: "fitness", reddit: "fitness", pinterest: "fitness" },
  Business: { youtube: "business", reddit: "business", pinterest: "business" },

  // Additional comprehensive categories
  Trending: { youtube: "trending", reddit: "popular", pinterest: "trending" },
  Movies: { youtube: "movies", reddit: "movies", pinterest: "movies" },
  Beauty: { youtube: "beauty", reddit: "beauty", pinterest: "beauty" },
  Asian: { youtube: "asian", reddit: "asian", pinterest: "asian" },
  Nepal: { youtube: "nepal", reddit: "nepal", pinterest: "nepal" },
  Nepalese: { youtube: "nepal", reddit: "nepal", pinterest: "nepal" },
  Songs: { youtube: "music", reddit: "music", pinterest: "music" },
  Memes: { youtube: "memes", reddit: "memes", pinterest: "memes" },
  Blogs: { youtube: "blogs", reddit: "blogs", pinterest: "blogs" },
  Shorts: { youtube: "shorts", reddit: "videos", pinterest: "videos" },
  Comedy: { youtube: "comedy", reddit: "funny", pinterest: "funny" },
  Education: {
    youtube: "education",
    reddit: "educational",
    pinterest: "education",
  },
  Lifestyle: {
    youtube: "lifestyle",
    reddit: "lifestyle",
    pinterest: "lifestyle",
  },
  Art: { youtube: "art", reddit: "art", pinterest: "art" },
  Automotive: { youtube: "cars", reddit: "cars", pinterest: "cars" },

  // Platform-specific
  Youtube: { youtube: "trending", reddit: "videos", pinterest: "videos" },
  Reddit: { youtube: "reddit", reddit: "popular", pinterest: "social" },
  Pinterest: { youtube: "pinterest", reddit: "design", pinterest: "trending" },

  // Additional content types
  Health: { youtube: "health", reddit: "health", pinterest: "health" },
  Science: { youtube: "science", reddit: "science", pinterest: "science" },
  Politics: { youtube: "politics", reddit: "politics", pinterest: "politics" },
  DIY: { youtube: "diy", reddit: "diy", pinterest: "diy" },
  Pets: { youtube: "pets", reddit: "aww", pinterest: "pets" },
  Parenting: {
    youtube: "parenting",
    reddit: "parenting",
    pinterest: "parenting",
  },
  Cooking: { youtube: "cooking", reddit: "cooking", pinterest: "recipes" },
  Photography: {
    youtube: "photography",
    reddit: "photography",
    pinterest: "photography",
  },
  Design: { youtube: "design", reddit: "design", pinterest: "design" },

  // Fallback mapping
  default: { youtube: "trending", reddit: "popular", pinterest: "trending" },
};

export default function TrendingVideos({ niche, platform = "all" }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentNiche, setCurrentNiche] = useState(niche);
  const [selectedPlatform, setSelectedPlatform] = useState(platform);
  const videosRef = useRef(null);
  const platformSelectorRef = useRef(null);

  useEffect(() => {
    // Add a small delay to prevent rapid API calls when switching niches quickly
    const timeoutId = setTimeout(() => {
      if (niche !== currentNiche) {
        setCurrentNiche(niche);
        fetchTrendingVideos();
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [niche, selectedPlatform]);

  // Initial load
  useEffect(() => {
    if (currentNiche) {
      fetchTrendingVideos();
    }
  }, [currentNiche, selectedPlatform]);

  // Handle platform selection with auto-scroll (improved for mobile)
  const handlePlatformChange = (newPlatform) => {
    setSelectedPlatform(newPlatform);

    // Auto-scroll to videos section after platform change with better mobile support
    setTimeout(() => {
      if (videosRef.current) {
        const isMobile = window.innerWidth < 768;
        videosRef.current.scrollIntoView({
          behavior: "smooth",
          block: isMobile ? "center" : "start", // Better mobile positioning
          inline: "nearest",
        });
      }
    }, 300); // Increased delay for better UX
  };

  // Remove duplicates based on URL and title
  const removeDuplicates = (videos) => {
    const seen = new Set();
    return videos.filter((video) => {
      // Create a unique identifier based on URL and title
      const identifier = `${video.url}-${video.title?.toLowerCase().trim()}`;
      if (seen.has(identifier)) {
        console.log(`🗑️ Removing duplicate: ${video.title}`);
        return false;
      }
      seen.add(identifier);
      return true;
    });
  };

  const fetchTrendingVideos = async () => {
    if (!currentNiche) return;

    setLoading(true);
    setError(null);
    setVideos([]); // Clear previous videos immediately for better UX

    try {
      console.log(
        `🎯 Fetching videos for niche: ${currentNiche}, platform: ${selectedPlatform}`
      );

      let allVideos = [];
      const categoryQueries = CATEGORY_MAPPING[currentNiche] || {
        youtube: currentNiche?.toLowerCase() || "trending",
        reddit: currentNiche?.toLowerCase() || "popular",
        pinterest: currentNiche?.toLowerCase() || "trending",
      };

      console.log(`📋 Category queries for ${currentNiche}:`, categoryQueries);

      if (selectedPlatform === "all") {
        // Fetch from all platforms with proper error handling
        const fetchPromises = [
          fetchFromPlatform("youtube", categoryQueries.youtube),
          fetchFromPlatform("reddit", categoryQueries.reddit),
          fetchFromPlatform("pinterest", categoryQueries.pinterest),
        ];

        const results = await Promise.allSettled(fetchPromises);

        results.forEach((result, index) => {
          const platformName = ["youtube", "reddit", "pinterest"][index];
          if (result.status === "fulfilled" && result.value) {
            console.log(
              `✅ ${platformName}: Found ${result.value.length} videos`
            );
            allVideos = [...allVideos, ...result.value];
          } else {
            console.warn(
              `❌ Failed to fetch from ${platformName}:`,
              result.reason
            );
          }
        });
      } else {
        // Fetch from selected platform only
        const query =
          categoryQueries[selectedPlatform] || currentNiche?.toLowerCase();
        console.log(
          `🔍 Fetching from ${selectedPlatform} with query: ${query}`
        );
        allVideos = await fetchFromPlatform(selectedPlatform, query);
      }

      console.log(`📊 Total videos fetched: ${allVideos.length}`);

      // Remove duplicates first
      const uniqueVideos = removeDuplicates(allVideos);
      console.log(
        `🗂️ After removing duplicates: ${uniqueVideos.length} videos`
      );

      // Enhanced filtering for better category relevance
      let filteredVideos = uniqueVideos;

      // Filter videos by selected niche/category for better relevance
      if (currentNiche && currentNiche.toLowerCase() !== "trending") {
        filteredVideos = uniqueVideos.filter((video) => {
          const searchTerms = [
            video.title?.toLowerCase() || "",
            video.category?.toLowerCase() || "",
            video.subreddit?.toLowerCase() || "",
            video.topic?.toLowerCase() || "",
            (video.hashtags || []).join(" ").toLowerCase(),
          ];

          const nicheKeywords = currentNiche.toLowerCase();
          const nicheWords = nicheKeywords.split(" ");

          // Check for exact matches and partial matches
          return searchTerms.some((term) => {
            return nicheWords.some(
              (nicheWord) =>
                term.includes(nicheWord) ||
                nicheWord.includes(term.split(" ")[0])
            );
          });
        });

        console.log(
          `🔍 Filtered videos for ${currentNiche}: ${filteredVideos.length} out of ${uniqueVideos.length}`
        );

        // If filtered results are too few, add some original results
        if (filteredVideos.length < 4) {
          const remaining = uniqueVideos.filter(
            (v) => !filteredVideos.includes(v)
          );
          filteredVideos = [
            ...filteredVideos,
            ...remaining.slice(0, Math.max(8 - filteredVideos.length, 4)),
          ];
          console.log(
            `📈 Added ${Math.max(
              8 - filteredVideos.length,
              4
            )} additional videos`
          );
        }
      }

      const shuffledVideos = filteredVideos
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
      console.log(`🌐 Making API call to ${platformId} with query: "${query}"`);
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

      // 🔥 DETAILED API RESPONSE LOGGING
      console.log(`📡 Full API Response from ${platformId}:`, {
        status: response?.status,
        statusText: response?.statusText,
        headers: response?.headers,
        data: response?.data,
        url: response?.config?.url,
        method: response?.config?.method,
        params: response?.config?.params,
      });

      console.log(`📊 Response data structure from ${platformId}:`, {
        dataType: typeof response?.data,
        isArray: Array.isArray(response?.data),
        dataKeys: response?.data ? Object.keys(response.data) : "No data",
        dataLength: response?.data?.length || "N/A",
        firstItem:
          response?.data?.[0] ||
          response?.data?.results?.[0] ||
          response?.data?.posts?.[0] ||
          response?.data?.videos?.[0] ||
          "No items",
      });

      const transformedVideos = transformVideos(
        response?.data || [],
        platformId
      );

      console.log(`✨ Transformed videos from ${platformId}:`, {
        count: transformedVideos.length,
        sampleVideo: transformedVideos[0] || "No videos",
        allVideos: transformedVideos,
      });

      return transformedVideos;
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
        id: `${platformId}-${item.id || item.url || index}`,
        title: item.title || item.description || "Untitled",
        url: item.url || item.video_url || "#",
        thumbnail: item.thumbnail || item.image_url || "/placeholder-image.jpg",
        hashtags: [],
        platform: platformId,
      };

      // Only add category if it exists and is meaningful
      if (
        item.category &&
        item.category.trim() !== "" &&
        item.category !== "General"
      ) {
        transformedItem.category = item.category;
      }

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
          <div
            className="flex flex-wrap justify-center gap-2 mt-4"
            ref={platformSelectorRef}
          >
            {[
              { id: "all", label: "All Platforms", icon: "🌐" },
              { id: "youtube", label: "YouTube", icon: "📺" },
              { id: "reddit", label: "Reddit", icon: "🤖" },
              { id: "pinterest", label: "Pinterest", icon: "📌" },
            ].map((platformOption) => (
              <button
                key={platformOption.id}
                onClick={() => handlePlatformChange(platformOption.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  selectedPlatform === platformOption.id
                    ? "bg-primary text-primary-foreground modern-shadow-lg"
                    : "glass-effect hover:glass-effect-hover text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="mr-1">{platformOption.icon}</span>
                {platformOption.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="mb-6">
          <ComponentLoader
            message={`Loading ${niche} videos from ${
              selectedPlatform === "all" ? "all platforms" : selectedPlatform
            }...`}
          />
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl glass-effect border border-destructive/20 text-destructive dark:text-destructive text-sm modern-shadow">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            {error}
          </div>
        </div>
      )}

      {!loading && videos.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="glass-effect rounded-xl p-8 modern-shadow">
            <p className="text-muted-foreground mb-4">
              No videos found for {niche}
            </p>
            <p className="text-sm text-muted-foreground">
              Try selecting a different category or platform
            </p>
          </div>
        </div>
      )}

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        ref={videosRef}
      >
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
                      : selectedPlatform}
                    . Try selecting a different platform or niche.
                  </p>
                </div>
              </div>
            )}
      </div>
    </div>
  );
}
