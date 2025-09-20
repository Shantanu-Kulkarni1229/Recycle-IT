import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  description?: string;
  maxFiles?: number;
  maxFileSizeM?: number;
  onImagesChange: (images: File[]) => void;
  existingImages?: string[];
  required?: boolean;
  accept?: string;
}

interface ImagePreview {
  file: File;
  url: string;
  id: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  description,
  maxFiles = 5,
  maxFileSizeM = 5,
  onImagesChange,
  existingImages = [],
  required = false,
  accept = 'image/*'
}) => {
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const maxSizeBytes = maxFileSizeM * 1024 * 1024;
    
    if (file.size > maxSizeBytes) {
      return `File "${file.name}" is too large. Maximum size is ${maxFileSizeM}MB.`;
    }
    
    if (!file.type.startsWith('image/')) {
      return `File "${file.name}" is not an image.`;
    }
    
    return null;
  };

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const currentCount = images.length;
    
    if (currentCount + fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed. You can add ${maxFiles - currentCount} more.`);
      return;
    }

    const validFiles: File[] = [];
    let hasError = false;

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        setError(error);
        hasError = true;
        break;
      }
      validFiles.push(file);
    }

    if (!hasError && validFiles.length > 0) {
      setError('');
      const newImagePreviews: ImagePreview[] = validFiles.map(file => ({
        file,
        url: URL.createObjectURL(file),
        id: `${Date.now()}-${Math.random()}`
      }));

      const updatedImages = [...images, ...newImagePreviews];
      setImages(updatedImages);
      onImagesChange(updatedImages.map(img => img.file));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
      e.target.value = ''; // Reset input
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const removeImage = (id: string) => {
    const updatedImages = images.filter(img => img.id !== id);
    setImages(updatedImages);
    onImagesChange(updatedImages.map(img => img.file));
    setError('');
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${images.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={images.length < maxFiles ? openFileDialog : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          disabled={images.length >= maxFiles}
        />

        {images.length < maxFiles ? (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700">
                Drop images here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Maximum {maxFiles} images, up to {maxFileSizeM}MB each
              </p>
              <p className="text-xs text-gray-400">
                Supported formats: JPG, PNG, WebP
              </p>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-lg font-medium text-gray-500">
              Maximum images reached ({maxFiles})
            </p>
            <p className="text-sm text-gray-400">
              Remove an image to add more
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 flex items-center text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Images:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {existingImages.map((imageUrl, index) => (
              <div key={`existing-${index}`} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Existing ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg" />
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs bg-blue-600 text-white px-1 py-0.5 rounded">
                    Saved
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            New Images ({images.length}/{maxFiles}):
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.url}
                  alt="Preview"
                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(image.id);
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  type="button"
                  title="Remove image"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 rounded truncate">
                    {image.file.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress Info */}
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>
          {images.length + existingImages.length} of {maxFiles} images
        </span>
        <span>
          Max size: {maxFileSizeM}MB per image
        </span>
      </div>
    </div>
  );
};

export default ImageUpload;