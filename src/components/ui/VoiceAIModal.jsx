import { useState } from "react";
import { ExternalLink, Mic, Zap, MapPin, Star, X } from "lucide-react";
import { Button } from "./Button";

const VoiceAIModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleVisitProduct = () => {
    window.open(
      "https://voice-ai-content-generator-frontend.vercel.app/",
      "_blank"
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Voice AI Content Generator
              </h2>
              <p className="text-sm text-muted-foreground">
                Our premium content generation platform
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              <Star className="w-4 h-4" />
              Premium Product
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              Generate Professional Content in Seconds
            </h3>
            <p className="text-muted-foreground">
              Advanced AI-powered content generator specifically designed for
              Nepali businesses
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-accent/50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Lightning Fast</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Generate professional content in under 15 seconds using advanced
                AI
              </p>
            </div>

            <div className="p-4 bg-accent/50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Mic className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Voice Optimized</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Content optimized for voice search and local SEO
              </p>
            </div>

            <div className="p-4 bg-accent/50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Nepal Focused</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Specifically designed for Nepali businesses and market
              </p>
            </div>

            <div className="p-4 bg-accent/50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Premium Quality</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Professional-grade content powered by advanced AI models
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg text-center space-y-4">
            <h4 className="text-lg font-semibold">
              Ready to Generate Professional Content?
            </h4>
            <p className="text-sm text-muted-foreground">
              Join hundreds of Nepali businesses using our Voice AI Content
              Generator
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleVisitProduct} className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Try Voice AI Generator
              </Button>
              <Button variant="outline" onClick={onClose}>
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAIModal;
