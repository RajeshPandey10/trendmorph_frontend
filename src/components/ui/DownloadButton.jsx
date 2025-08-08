export default function DownloadButton({
  content,
  filename = "content.txt",
  className,
}) {
  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-primary to-ring text-primary-foreground hover:from-primary/90 hover:to-ring/90 text-xs font-medium transition-all duration-300 modern-shadow hover:modern-shadow-lg transform hover:scale-105 ${
        className || ""
      }`}
      onClick={handleDownload}
      title="Download content"
    >
      <span>💾</span>
      Download
    </button>
  );
}
