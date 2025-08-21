/* eslint-disable @next/next/no-img-element */
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Upload, Eye, ExternalLink } from "lucide-react";

interface ImageItem {
  url: string;
  file?: File;
  isUploading?: boolean;
}

interface ImageFileUploadFieldProps {
  image: ImageItem;
  index: number;
  onFileChange?: (index: number, file: File) => void | Promise<void>;
  onRemove?: (index: number) => void;
  canRemove?: boolean;
  disabled?: boolean;
  viewOnly?: boolean;
  className?: string;
  label?: string;
}

export const ImageFileUploadField: React.FC<ImageFileUploadFieldProps> = ({
  image,
  index,
  onFileChange,
  onRemove,
  canRemove = true,
  disabled = false,
  viewOnly = false,
  className = "",
  label,
}) => {
  const isReadOnly = disabled || viewOnly;
  const showRemoveButton = canRemove && !isReadOnly && onRemove;
  const showUploadButton = !isReadOnly && onFileChange;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileChange) {
      try {
        await onFileChange(index, file);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
    e.target.value = "";
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(index);
    }
  };

  const handleImageClick = () => {
    if (image.url && viewOnly) {
      // Open image in new tab for better viewing
      window.open(image.url, "_blank");
    }
  };

  return (
    <div className={`flex gap-2 items-start ${className}`}>
      <div className="flex-1 space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            {label}
          </label>
        )}

        {/* Upload Button - Only in edit mode */}
        {showUploadButton && (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={image.isUploading}
                id={`file-upload-${index}`}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={image.isUploading}
                className="w-full justify-center dark:text-white/80"
                title="Upload image file"
              >
                <Upload className="w-4 h-4 mr-2" />
                {image.isUploading ? "Uploading..." : "Choose Image"}
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {image.isUploading && (
          <div className="flex items-center justify-center gap-2 p-4 border border-dashed border-blue-300 rounded-lg bg-blue-50 dark:bg-[#232336]">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-600 hover:text-blue-800 transition dark:text-blue-400">
              Uploading image...
            </span>
          </div>
        )}

        {/* Image Preview */}
        {image.url && !image.isUploading && (
          <div className="space-y-2">
            <div
              className={`relative flex items-center justify-center p-2 border rounded-lg ${
                isReadOnly
                  ? "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#232336]"
                  : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#232336]"
              }`}
            >
              <div className="relative inline-block">
                <img
                  src={image.url}
                  alt={`Preview ${index + 1}`}
                  className={`max-w-full max-h-48 w-auto h-auto object-contain rounded border shadow-sm transition-all dark:text-white/80 ${
                    viewOnly
                      ? "cursor-pointer hover:shadow-lg"
                      : "hover:shadow-md"
                  } dark:border-gray-700`}
                  onClick={handleImageClick}
                  style={{ display: "block" }}
                />

                {viewOnly && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all rounded border flex items-center justify-center opacity-0 hover:opacity-100 dark:border-gray-700">
                    <ExternalLink className="w-6 h-6 text-white drop-shadow-lg" />
                  </div>
                )}
              </div>
            </div>

            {/* View Only Actions */}
            {viewOnly && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleImageClick}
                  className="flex-1 justify-center dark:text-white/80"
                  title="Open image in new tab"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Size
                </Button>
              </div>
            )}
          </div>
        )}

        {/* No Image State */}
        {!image.url && !image.isUploading && (
          <div
            className={`flex items-center justify-center p-8 border-2 border-dashed rounded-lg ${
              isReadOnly
                ? "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#232336]"
                : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-[#232336]"
            }`}
          >
            <div className="text-center">
              {isReadOnly ? (
                <>
                  <Eye className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No image available
                  </p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No image selected
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Remove Button - Only in edit mode */}
      {showRemoveButton && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRemove}
          title="Remove image"
          className="mt-0 flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
