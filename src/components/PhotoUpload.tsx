import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { UploadedPhoto } from '@/types/order';

interface PhotoUploadProps {
  photos: UploadedPhoto[];
  onAddPhoto: (photo: UploadedPhoto) => void;
  onRemovePhoto: (id: string) => void;
  maxPhotos?: number;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  photos,
  onAddPhoto,
  onRemovePhoto,
  maxPhotos = 10,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList) => {
    const remainingSlots = maxPhotos - photos.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    for (const file of filesToProcess) {
      if (!file.type.startsWith('image/')) continue;

      setIsUploading(true);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const photo: UploadedPhoto = {
        id: Math.random().toString(36).substring(2, 15),
        file,
        preview: URL.createObjectURL(file),
        analyzed: false,
      };
      
      onAddPhoto(photo);
      setIsUploading(false);
    }
  }, [photos.length, maxPhotos, onAddPhoto]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300",
          isDragging 
            ? "border-primary bg-primary-light" 
            : "border-border bg-card hover:border-primary/50 hover:bg-accent/50",
          photos.length >= maxPhotos && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          className="hidden"
          disabled={photos.length >= maxPhotos}
        />

        <div className="flex flex-col items-center gap-4">
          {isUploading ? (
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
          )}
          
          <div>
            <p className="font-medium text-foreground">
              {isDragging ? 'Drop photos here' : 'Upload photos of your items'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Drag and drop or click to browse • {photos.length}/{maxPhotos} photos
            </p>
          </div>
        </div>
      </div>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div 
              key={photo.id}
              className="relative group aspect-square rounded-xl overflow-hidden bg-muted"
            >
              <img
                src={photo.preview}
                alt="Uploaded item"
                className="w-full h-full object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-200" />
              
              {/* Remove button */}
              <button
                onClick={() => onRemovePhoto(photo.id)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive/90"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Analyzed badge */}
              {photo.analyzed && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                  Analyzed
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
