import ChatLikeGenerator from "../features/content/ChatLikeGenerator";

export default function GeneratePage() {
  return (
    <div className="flex flex-col items-center gap-8 w-full page-transition">
      {/* Hero Section */}
      <div className="text-center space-y-4 mb-8">
        <div className="glass-effect rounded-2xl p-8 modern-shadow-lg glow-border max-w-2xl mx-auto">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-primary/20 to-ring/20 modern-shadow">
              <span className="text-4xl">🚀</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-ring bg-clip-text text-transparent mb-4">
            AI Content Generator
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Transform your ideas into engaging content and stunning thumbnails
            with the power of AI
          </p>
        </div>
      </div>

      {/* Main Generator */}
      <div className="w-full max-w-6xl">
        <ChatLikeGenerator />
      </div>
    </div>
  );
}
