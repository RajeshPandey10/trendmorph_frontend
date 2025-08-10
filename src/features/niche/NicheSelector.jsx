import { useState, useEffect } from "react";
import NicheCard from "../../components/ui/NicheCard";
import { ComponentLoader } from "../../components/ui/Loading";
import fetchAvailableCategories from "./fetchAvailableCategories";

export default function NicheSelector({ selectedNiche, onSelect }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNicheLoading, setSelectedNicheLoading] = useState(null);

  useEffect(() => {
    fetchAvailableCategories(setLoading, setCategories);
  }, []);

  const handleNicheSelect = (nicheTitle) => {
    setSelectedNicheLoading(nicheTitle);
    onSelect(nicheTitle);

    // Clear loading state after a short delay
    setTimeout(() => {
      setSelectedNicheLoading(null);
    }, 800);
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
          <div key={niche.title} className="relative">
            <NicheCard
              {...niche}
              selected={selectedNiche === niche.title}
              onClick={() => handleNicheSelect(niche.title)}
            />
            {selectedNicheLoading === niche.title && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
