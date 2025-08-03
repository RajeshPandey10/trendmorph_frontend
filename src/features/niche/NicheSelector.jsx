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
];

export default function NicheSelector({ selectedNiche, onSelect }) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {NICHES.map((niche) => (
        <NicheCard
          key={niche.title}
          {...niche}
          selected={selectedNiche === niche.title}
          onClick={() => onSelect(niche.title)}
        />
      ))}
    </div>
  );
}
