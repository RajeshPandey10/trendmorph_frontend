import { useState } from "react";
import { ExternalLink, Mic, X, Sparkles } from "lucide-react";
import { Button } from "./Button";

const VoiceAIBanner = ({ onOpenModal }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleVisitProduct = () => {
    window.open(
      "https://voice-ai-content-generator-frontend.vercel.app/",
      "_blank"
    );
  };

  return (
    <div className="bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 border border-primary/30 rounded-lg p-3 sm:p-4 mb-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,119,198,0.1),transparent)] pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-primary/20 rounded-full flex-shrink-0">
            <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
              <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                Voice AI Content Generator
              </h3>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs w-fit">
                <Sparkles className="w-3 h-3" />
                Premium
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
              Generate professional content for Nepali businesses in seconds
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
          <Button
            onClick={onOpenModal}
            variant="secondary"
            size="sm"
            className="gap-2 text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Learn More</span>
            <span className="sm:hidden">Learn</span>
          </Button>
          <Button
            onClick={handleVisitProduct}
            size="sm"
            className="gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Try Now</span>
            <span className="sm:hidden">Try</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVisible(false)}
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full flex-shrink-0"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VoiceAIBanner;
