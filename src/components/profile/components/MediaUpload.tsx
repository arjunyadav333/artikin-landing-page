import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ImageIcon, X, Upload } from 'lucide-react';

interface MediaFile {
  id: string;
  file: File;
  preview: string;
}

interface MediaUploadProps {
  selectedFiles: MediaFile[];
  onFilesChange: (files: MediaFile[]) => void;
  maxFiles?: number;
  className?: string;
}

export function MediaUpload({ selectedFiles, onFilesChange, maxFiles = 5, className }: MediaUploadProps) {
  const handleFileSelect = useCallback((files: FileList) => {
    const newFiles: MediaFile[] = [];
    
    for (let i = 0; i < Math.min(files.length, maxFiles - selectedFiles.length); i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        newFiles.push({
          id: Date.now() + i + '',
          file,
          preview: URL.createObjectURL(file)
        });
      }
    }
    
    onFilesChange([...selectedFiles, ...newFiles]);
  }, [selectedFiles, onFilesChange, maxFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const removeFile = (id: string) => {
    onFilesChange(selectedFiles.filter(f => f.id !== id));
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Label>Media (optional)</Label>
      
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById('media-upload')?.click()}
      >
        <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">Drag & drop images here or click to select</p>
        <p className="text-xs text-gray-400 mt-1">Images only (JPG, PNG, WebP) • Max {maxFiles} files</p>
        
        <input
          id="media-upload"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        />
      </div>

      {/* Preview Grid */}
      {selectedFiles.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {selectedFiles.map((file) => (
            <div key={file.id} className="relative group">
              <img
                src={file.preview}
                alt="Preview"
                className="w-full h-16 object-cover rounded border"
              />
              <button
                onClick={() => removeFile(file.id)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}