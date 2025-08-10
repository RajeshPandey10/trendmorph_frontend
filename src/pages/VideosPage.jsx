import { useEffect } from "react";
import TrendingVideos from "../features/videos/TrendingVideos";
import { useNicheStore } from "../store/nicheStore";
import { useNavigate } from "react-router-dom";

export default function VideosPage() {
  const { selectedNiche, selectedPlatform } = useNicheStore();
  const navigate = useNavigate();

  // Handle mobile back button properly
  const handleBack = () => {
    // For mobile, always go back to home to ensure proper navigation
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      // On mobile, always navigate to home for consistent experience
      navigate("/", { replace: true });
    } else {
      // On desktop, use browser back or fallback to home
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate("/");
      }
    }
  };

  // Redirect to home if no niche is selected
  useEffect(() => {
    if (!selectedNiche) {
      navigate("/");
    }
  }, [selectedNiche, navigate]);

  if (!selectedNiche) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-transition">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Mobile-friendly Header Section */}
        <div className="mb-6">
          <button
            className="mb-4 sm:mb-6 flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors modern-button px-3 sm:px-4 py-2 rounded-lg glass-effect modern-shadow touch-target"
            onClick={handleBack}
            aria-label="Go back"
          >
            <span className="text-lg">←</span>
            <span className="hidden sm:inline">Back</span>
          </button>

       
        </div>

        {/* TrendingVideos component handles its own platform selector - no duplicates */}
        <TrendingVideos niche={selectedNiche} platform={selectedPlatform} />

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="glass-effect rounded-2xl p-6 sm:p-8 modern-shadow-lg max-w-2xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-ring bg-clip-text text-transparent">
              Ready to Create?
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Use these trending {selectedNiche.toLowerCase()} insights to
              generate your own engaging content and thumbnails
            </p>
            <button
              className="modern-button px-6 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-primary to-ring text-primary-foreground rounded-xl font-bold text-base sm:text-lg modern-shadow hover:modern-shadow-lg transform hover:scale-105 transition-all duration-300 float-element w-full sm:w-auto"
              onClick={() => navigate("/generate")}
            >
              🚀 Generate Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
