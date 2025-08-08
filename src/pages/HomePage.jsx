import { useNicheStore } from "../store/nicheStore";
import NicheSelector from "../features/niche/NicheSelector";
import TrendingVideos from "../features/videos/TrendingVideos";
import VoiceAIBanner from "../components/ui/VoiceAIBanner";
import VoiceAIModal from "../components/ui/VoiceAIModal";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { selectedNiche, setNiche } = useNicheStore();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [showVoiceAIModal, setShowVoiceAIModal] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSelect = (niche) => {
    setNiche(niche);
    if (isMobile) navigate("/videos");
  };

  return (
    <div className="min-h-screen page-transition">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Voice AI Product Banner */}
        <VoiceAIBanner onOpenModal={() => setShowVoiceAIModal(true)} />

        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="sm:backdrop-blur-sm sm:bg-transparent sm:border sm:border-primary/20 sm:rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-primary/10 to-ring/10 sm:backdrop-blur-sm">
                <span className="text-3xl sm:text-4xl">🎯</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-ring bg-clip-text text-transparent mb-4">
              Choose Your Niche
            </h1>
            <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">
              Select your content category to discover trending videos and
              generate amazing content
            </p>
          </div>
        </div>

        {/* Niche Selection */}
        <div className="mb-8 sm:mb-12">
          <NicheSelector
            selectedNiche={selectedNiche}
            onSelect={handleSelect}
          />
        </div>

        {/* Desktop: Show trending videos */}
        {!isMobile && selectedNiche && (
          <div className="mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-ring bg-clip-text text-transparent">
                Trending in {selectedNiche}
              </h2>
              <p className="text-muted-foreground">
                See what's popular and get inspired
              </p>
            </div>
            <TrendingVideos niche={selectedNiche} />
          </div>
        )}

        {/* Desktop: Generate button */}
        {!isMobile && selectedNiche && (
          <div className="text-center">
            <div className="glass-effect rounded-2xl p-8 modern-shadow-lg glow-border max-w-md mx-auto">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-primary/20 to-ring/20 modern-shadow">
                  <span className="text-3xl">🚀</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary to-ring bg-clip-text text-transparent">
                Ready to Create?
              </h3>
              <p className="text-muted-foreground dark:text-muted-foreground mb-6 text-sm leading-relaxed">
                Generate amazing content and thumbnails for {selectedNiche}
              </p>
              <button
                className="modern-button px-8 py-4 bg-gradient-to-r from-primary to-ring text-primary-foreground rounded-xl font-bold modern-shadow hover:modern-shadow-lg transform hover:scale-105 transition-all duration-300 w-full sm:w-auto float-element"
                onClick={() => navigate("/generate")}
              >
                ✨ Generate Now
              </button>
            </div>
          </div>
        )}

        {/* Mobile: Quick action hint */}
        {isMobile && selectedNiche && (
          <div className="text-center mt-6">
            <div className="p-4 max-w-sm mx-auto">
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                🎉{" "}
                <span className="font-semibold text-primary dark:text-primary">
                  {selectedNiche}
                </span>{" "}
                selected! Tap again to view trending videos.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Voice AI Modal */}
      <VoiceAIModal
        isOpen={showVoiceAIModal}
        onClose={() => setShowVoiceAIModal(false)}
      />
    </div>
  );
}
