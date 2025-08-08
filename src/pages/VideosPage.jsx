import TrendingVideos from "../features/videos/TrendingVideos";
import { useNicheStore } from "../store/nicheStore";
import { useNavigate } from "react-router-dom";

export default function VideosPage() {
  const { selectedNiche } = useNicheStore();
  const navigate = useNavigate();

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
              Trending Videos
            </h1>
            {selectedNiche && (
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/20 to-primary/10 text-primary rounded-xl font-semibold modern-shadow">
                <span>🎯</span>
                {selectedNiche}
              </div>
            )}
            <p className="text-lg text-muted-foreground mt-4 leading-relaxed">
              Discover what's trending and get inspired for your next content
            </p>
          </div>
        </div>

        {/* Videos Grid */}
        <div className="mb-12">
          <TrendingVideos niche={selectedNiche} />
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
