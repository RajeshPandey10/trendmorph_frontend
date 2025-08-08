import { useState } from "react";

export default function CopyButton({ text, className }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border/50 bg-background/80 hover:bg-accent text-foreground hover:text-accent-foreground text-xs font-medium transition-all duration-300 modern-shadow hover:modern-shadow-lg ${
        className || ""
      }`}
      onClick={async (e) => {
        e.preventDefault();
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      title="Copy to clipboard"
    >
      <span>{copied ? "✅" : "📋"}</span>
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
