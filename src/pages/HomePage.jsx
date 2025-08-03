import { useNicheStore } from "../store/nicheStore";
import NicheSelector from "../features/niche/NicheSelector";
import TrendingVideos from "../features/videos/TrendingVideos";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const { selectedNiche, setNiche } = useNicheStore();
  const navigate = useNavigate();
  // Detect mobile
  const isMobile = window.innerWidth < 768;
  const handleSelect = (niche) => {
    setNiche(niche);
    if (isMobile) navigate("/videos");
  };
  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <h2 className="text-3xl font-semibold mb-2 text-center">
        Select Your Niche
      </h2>
      <NicheSelector selectedNiche={selectedNiche} onSelect={handleSelect} />
      {!isMobile && (
        <div className="w-full max-w-6xl mt-8">
          <TrendingVideos niche={selectedNiche} />
        </div>
      )}
      {!isMobile && selectedNiche && (
        <button
          className="mt-8 px-8 py-3 rounded-lg bg-orange-500 text-white font-semibold text-lg shadow hover:bg-orange-600 transition"
          onClick={() => navigate("/generate")}
        >
          Generate Now
        </button>
      )}
    </div>
  );
}
