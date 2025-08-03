import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

const ImageUpload = ({ onImageUpload, loading = false, disabled = false }) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Image size should be less than 10MB");
      return;
    }

    setSelectedImage(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    if (!disabled && !loading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = () => {
    if (selectedImage && onImageUpload) {
      onImageUpload(selectedImage);
    }
  };

  const handleRemove = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || loading}
      />

      {!selectedImage ? (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${
              dragOver
                ? "border-orange-500 bg-orange-50"
                : "border-gray-300 hover:border-orange-400 hover:bg-gray-50"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <div className="flex flex-col items-center space-y-2">
            <Upload
              className={`w-8 h-8 ${
                dragOver ? "text-orange-500" : "text-gray-400"
              }`}
            />
            <div className="text-sm text-gray-600">
              <span className="font-medium">Click to upload</span> or drag and
              drop
            </div>
            <div className="text-xs text-gray-500">
              PNG, JPG, GIF up to 10MB
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full max-w-md mx-auto rounded-lg shadow-sm"
              style={{ maxHeight: "300px", objectFit: "contain" }}
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              disabled={loading}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* File Info */}
          <div className="text-sm text-gray-600 text-center">
            <div className="font-medium">{selectedImage.name}</div>
            <div>{(selectedImage.size / 1024 / 1024).toFixed(2)} MB</div>
          </div>

          {/* Upload Button */}
          <div className="flex justify-center">
            <button
              onClick={handleUpload}
              disabled={loading || disabled}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Caption...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  <span>Generate Caption & Hashtags</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
