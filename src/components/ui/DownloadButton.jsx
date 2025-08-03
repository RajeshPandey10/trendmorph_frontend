export default function DownloadButton({
  value,
  filename = "content.txt",
  className,
}) {
  const handleDownload = () => {
    const blob = new Blob([value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button
      className={`inline-flex items-center gap-1 px-2 py-1 rounded bg-primary text-white hover:bg-primary/90 text-xs font-medium ${
        className || ""
      }`}
      onClick={handleDownload}
      title="Download content"
    >
      Download
    </button>
  );
}
