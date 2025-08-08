import { useState, useEffect } from "react";
import TrendingVideos from "../features/videos/TrendingVideos";
import { useNicheStore } from "../store/nicheStore";
import { useNavigate } from "react-router-dom";
import SummaryApi from "../api/SummaryApi";

export default function VideosPage() {
  const { selectedNiche } = useNicheStore();
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailablePlatforms();
  }, []);

  const fetchAvailablePlatforms = async () => {
    setLoading(true);
    try {
      // Always show all platforms, but test which ones are working
      const platforms = [
        { id: "all", name: "All Platforms", icon: "🌐", color: "primary" },
        { id: "youtube", name: "YouTube", icon: "📹", color: "red" },
        { id: "reddit", name: "Reddit", icon: "🔴", color: "orange" },
        { id: "pinterest", name: "Pinterest", icon: "�", color: "red" },
      ];

      // Test API endpoints in background (non-blocking)
      Promise.allSettled([
        SummaryApi.getYoutubeTrending("trending"),
        SummaryApi.getRedditPosts("popular"),
        SummaryApi.getPinterestPins("trending"),
      ]).then((results) => {
        console.log("Platform availability:", {
          youtube: results[0].status === "fulfilled",
          reddit: results[1].status === "fulfilled",
          pinterest: results[2].status === "fulfilled",
        });
      });

      setAvailablePlatforms(platforms);
    } catch (error) {
      console.error("Failed to fetch platforms:", error);
      // Always show basic platforms even if there's an error
      setAvailablePlatforms([
        { id: "all", name: "All Platforms", icon: "🌐", color: "primary" },
        { id: "youtube", name: "YouTube", icon: "📹", color: "red" },
        { id: "reddit", name: "Reddit", icon: "🔴", color: "orange" },
        { id: "pinterest", name: "Pinterest", icon: "📌", color: "red" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen page-transition">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <button
            className="mb-6 flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors modern-button px-4 py-2 rounded-lg glass-effect modern-shadow"
            onClick={() => navigate(-1)}
          >
            <span>←</span>
            Back
          </button>

          <div className="glass-effect rounded-2xl p-8 modern-shadow-lg glow-border text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-primary/20 to-ring/20 modern-shadow">
                <span className="text-4xl">📹</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-ring bg-clip-text text-transparent mb-4">
              Trending Content
            </h1>

            {/* Platform Selector */}
            {loading ? (
              <div className="flex justify-center mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {availablePlatforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      selectedPlatform === platform.id
                        ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary modern-shadow"
                        : "bg-muted/20 text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <span className="mr-2">{platform.icon}</span>
                    {platform.name}
                  </button>
                ))}
              </div>
            )}

            {selectedNiche && (
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/20 to-primary/10 text-primary rounded-xl font-semibold modern-shadow">
                <span>🎯</span>
                {selectedNiche}
              </div>
            )}
            <p className="text-lg text-muted-foreground mt-4 leading-relaxed">
              Discover what's trending across platforms and get inspired for
              your next content
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="mb-12">
          <TrendingVideos
            niche={selectedNiche?.name || selectedNiche}
            platform={selectedPlatform}
          />
        </div>

        {/* Call to Action */}
        {selectedNiche && (
          <div className="text-center">
            <div className="glass-effect rounded-2xl p-8 modern-shadow-lg max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-ring bg-clip-text text-transparent">
                Ready to Create?
              </h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Use these trending insights to generate your own engaging
                content and thumbnails
              </p>
              <button
                className="modern-button px-10 py-4 bg-gradient-to-r from-primary to-ring text-primary-foreground rounded-xl font-bold text-lg modern-shadow hover:modern-shadow-lg transform hover:scale-105 transition-all duration-300 float-element"
                onClick={() => navigate("/generate")}
              >
                🚀 Generate Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
