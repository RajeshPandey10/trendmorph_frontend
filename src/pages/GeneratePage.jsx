import ChatLikeGenerator from "../features/content/ChatLikeGenerator";

export default function GeneratePage() {
  return (
    <div className="flex flex-col items-center gap-8 w-full page-transition min-h-screen">
      {/* Minimal Header - Much Less Distracting */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-ring bg-clip-text text-transparent">
          AI Content Generator
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
          Transform your ideas into engaging content with AI
        </p>

        {/* Voice AI Cross-promotion */}
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">
            Need business content for Nepal? Try our specialized tool:
          </p>
          <a
            href="https://voice-ai-content-generator-frontend.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1l3.09 6.26L22 9l-5 4.87L18.18 21 12 17.77 5.82 21 7 13.87 2 9l6.91-1.74L12 1z" />
            </svg>
            Voice AI Content Generator
          </a>
        </div>
      </div>

      {/* Clean Main Generator */}
      <div className="w-full max-w-6xl">
        <ChatLikeGenerator />
      </div>
    </div>
  );
}
