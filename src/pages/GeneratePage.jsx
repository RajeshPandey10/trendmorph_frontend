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
      </div>

      {/* Clean Main Generator */}
      <div className="w-full max-w-6xl">
        <ChatLikeGenerator />
      </div>
    </div>
  );
}
