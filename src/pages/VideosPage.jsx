import TrendingVideos from "../features/videos/TrendingVideos";
import { useNicheStore } from "../store/nicheStore";
import { useNavigate } from "react-router-dom";

export default function VideosPage() {
  const { selectedNiche } = useNicheStore();
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center gap-8 w-full bg-wheat text-black min-h-screen">
      <button
        className="self-start mt-2 mb-2 text-primary font-semibold"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
      <h2 className="text-2xl font-semibold mb-2 text-center">
        Trending Videos in {selectedNiche}
      </h2>
      <div className="w-full max-w-6xl">
        <TrendingVideos niche={selectedNiche} />
      </div>
      {selectedNiche && (
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
