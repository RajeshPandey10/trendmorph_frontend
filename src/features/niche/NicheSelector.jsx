import { useState } from "react";
import NicheCard from "../../components/ui/NicheCard";

const NICHES = [
  { icon: "🎬", title: "Entertainment", description: "Movies, TV, Celebs" },
  { icon: "📰", title: "News", description: "Trending news & events" },
  { icon: "🎵", title: "Music", description: "Songs, Artists, Albums" },
  { icon: "👗", title: "Fashion", description: "Trends, Outfits, Style" },
  { icon: "😂", title: "Memes", description: "Funny, Viral, Relatable" },
  { icon: "💼", title: "Business", description: "Startups, Marketing, Brands" },
  { icon: "⚽", title: "Sports", description: "Games, Players, Highlights" },
  { icon: "💡", title: "Tech", description: "Gadgets, AI, Coding" },
  { icon: "🍳", title: "Food", description: "Cooking, Recipes, Reviews" },
  { icon: "✈️", title: "Travel", description: "Places, Tips, Adventures" },
  { icon: "🎨", title: "Art", description: "Design, Creativity, DIY" },
  { icon: "🎮", title: "Gaming", description: "Games, Streams, Reviews" },
  { icon: "💪", title: "Fitness", description: "Workouts, Health, Wellness" },
  { icon: "🏠", title: "Lifestyle", description: "Home, Decor, Daily Life" },
  {
    icon: "📚",
    title: "Education",
    description: "Learning, Tutorials, Skills",
  },
  { icon: "🚗", title: "Automotive", description: "Cars, Reviews, Tips" },
];

export default function NicheSelector({ selectedNiche, onSelect }) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Mobile: 2 columns, Tablet: 3 columns, Desktop: 4 columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {NICHES.map((niche) => (
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
