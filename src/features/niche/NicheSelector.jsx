import { useState, useEffect } from "react";
import NicheCard from "../../components/ui/NicheCard";
import SummaryApi from "../../api/SummaryApi";
import { ComponentLoader } from "../../components/ui/Loading";

const CATEGORY_ICONS = {
  Music: "🎵",
  Sports: "⚽",
  Entertainment: "🎬",
  News: "📰",
  Fashion: "👗",
  Gaming: "🎮",
  Tech: "💻",
  Food: "🍳",
  Travel: "✈️",
  Fitness: "💪",
  Business: "💼",
  Trending: "🔥",
  Movies: "🎭",
  Beauty: "💄",
  Asian: "🥢",
  Nepal: "🏔️",
  Nepalese: "🇳🇵",
  Songs: "🎤",
  Memes: "😂",
  Blogs: "📝",
  Shorts: "📱",
  Comedy: "🎪",
  Education: "📚",
  Lifestyle: "🌟",
  Art: "🎨",
  Automotive: "🚗",
  Youtube: "📺",
  Reddit: "🤖",
  Pinterest: "📌",
  Health: "🏥",
  Science: "🔬",
  Politics: "🏛️",
  DIY: "🔨",
  Pets: "🐕",
  Parenting: "👶",
  Cooking: "👨‍🍳",
  Photography: "📸",
  Design: "✨",
  default: "📱",
};

export default function NicheSelector({ selectedNiche, onSelect }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableCategories();
    // eslint-disable-next-line
  }, []);

  const fetchAvailableCategories = async () => {
    setLoading(true);
    // Helper to add timeout to a promise
    const withTimeout = (promise, ms) => {
      return Promise.race([
        promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), ms)
        ),
      ]);
    };
    try {
      const [youtubeResponse, redditResponse, pinterestResponse] =
        await Promise.allSettled([
          withTimeout(SummaryApi.getYoutubeTrending("trending"), 10000),
          withTimeout(SummaryApi.getRedditPosts("all"), 10000),
          withTimeout(SummaryApi.getPinterestPins("trending"), 10000),
        ]);
      const categoryCounts = {};
      const addCategory = (cat) => {
        if (!cat) return;
        const key = cat.trim();
        if (!key) return;
        categoryCounts[key] = (categoryCounts[key] || 0) + 1;
      };
      // YouTube
      if (
        youtubeResponse.status === "fulfilled" &&
        youtubeResponse.value?.data?.results
      ) {
        youtubeResponse.value.data.results.forEach((video) => {
          if (video.category) addCategory(video.category);
          if (video.hashtags) {
            if (Array.isArray(video.hashtags))
              video.hashtags.forEach(addCategory);
            else addCategory(video.hashtags);
          }
          Object.keys(CATEGORY_ICONS).forEach((cat) => {
            if (
              video.title &&
              video.title.toLowerCase().includes(cat.toLowerCase())
            )
              addCategory(cat);
          });
        });
      }
      // Reddit
      if (
        redditResponse.status === "fulfilled" &&
        redditResponse.value?.data?.results
      ) {
        redditResponse.value.data.results.forEach((post) => {
          if (post.subreddit) {
            const category =
              post.subreddit.charAt(0).toUpperCase() + post.subreddit.slice(1);
            addCategory(category);
          }
          if (post.hashtags) {
            if (Array.isArray(post.hashtags))
              post.hashtags.forEach(addCategory);
            else addCategory(post.hashtags);
          }
          Object.keys(CATEGORY_ICONS).forEach((cat) => {
            if (
              post.title &&
              post.title.toLowerCase().includes(cat.toLowerCase())
            )
              addCategory(cat);
          });
        });
      }
      // Pinterest
      if (
        pinterestResponse.status === "fulfilled" &&
        pinterestResponse.value?.data?.results
      ) {
        pinterestResponse.value.data.results.forEach((pin) => {
          if (pin.topic) addCategory(pin.topic);
          if (pin.hashtags) {
            if (Array.isArray(pin.hashtags)) pin.hashtags.forEach(addCategory);
            else addCategory(pin.hashtags);
          }
          Object.keys(CATEGORY_ICONS).forEach((cat) => {
            if (
              pin.title &&
              pin.title.toLowerCase().includes(cat.toLowerCase())
            )
              addCategory(cat);
          });
        });
      }
      // Only show categories that appear in at least 2 items
      const filteredCategories = Object.keys(categoryCounts).filter(
        (cat) => categoryCounts[cat] >= 2
      );
      const sortedCategories = filteredCategories.sort(
        (a, b) => categoryCounts[b] - categoryCounts[a]
      );
      if (sortedCategories.length > 0) {
        const categoryNiches = sortedCategories.map((category) => ({
          icon: CATEGORY_ICONS[category] || CATEGORY_ICONS.default,
          title: category,
          description: `${category} content and videos`,
        }));
        setCategories(categoryNiches);
      } else {
        setCategories([
          { icon: "🎵", title: "Music", description: "Songs, Artists, Albums" },
          {
            icon: "⚽",
            title: "Sports",
            description: "Games, Players, Highlights",
          },
          {
            icon: "🎬",
            title: "Entertainment",
            description: "Movies, Shows, Celebrities",
          },
          { icon: "📰", title: "News", description: "Latest News and Updates" },
          {
            icon: "👗",
            title: "Fashion",
            description: "Style, Trends, Outfits",
          },
          {
            icon: "🎮",
            title: "Gaming",
            description: "Games, Reviews, Gameplay",
          },
        ]);
      }
    } catch (error) {
      setCategories([
        { icon: "🎵", title: "Music", description: "Songs, Artists, Albums" },
        {
          icon: "⚽",
          title: "Sports",
          description: "Games, Players, Highlights",
        },
        {
          icon: "🎬",
          title: "Entertainment",
          description: "Movies, Shows, Celebrities",
        },
        { icon: "📰", title: "News", description: "Latest News and Updates" },
        { icon: "👗", title: "Fashion", description: "Style, Trends, Outfits" },
        {
          icon: "🎮",
          title: "Gaming",
          description: "Games, Reviews, Gameplay",
        },
      ]);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="text-center py-8">
          <ComponentLoader />
          <p className="text-sm text-muted-foreground mt-2">
            Loading categories...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {categories.map((niche) => (
          <NicheCard
            key={niche.title}
            {...niche}
            selected={selectedNiche === niche.title}
            onClick={() => onSelect(niche.title)}
          />
        ))}
      </div>
    </div>
  );
}
