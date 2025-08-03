import ChatLikeGenerator from "../features/content/ChatLikeGenerator";

export default function GeneratePage() {
  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <h2 className="text-3xl font-semibold mb-2 text-center">
        Generate Content & Thumbnails
      </h2>
      <ChatLikeGenerator />
    </div>
  );
}
