import { useChatStore } from "../../store/chatStore";

export default function ChatHistorySidebar({
  currentChatId,
  onSelect,
  onDelete,
}) {
  const { chats } = useChatStore();
  return (
    <aside className="w-64 bg-white border-r h-full flex flex-col overflow-y-auto">
      <div className="p-4 font-bold text-lg border-b">Chat History</div>
      <nav className="flex-1 flex flex-col gap-1 p-2">
        {chats.length === 0 && (
          <div className="text-xs text-gray-400 p-4">No chats yet</div>
        )}
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
              currentChatId === chat.id
                ? "bg-primary/10 text-primary"
                : "hover:bg-gray-100"
            }`}
            onClick={() => onSelect(chat.id)}
          >
            <span className="flex-1 truncate">
              {chat.title || `Chat ${chat.id.slice(-4)}`}
            </span>
            <button
              className="text-xs text-red-400 hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(chat.id);
              }}
            >
              🗑️
            </button>
          </div>
        ))}
      </nav>
    </aside>
  );
}
