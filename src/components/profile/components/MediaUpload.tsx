import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileUp, Image, X } from 'lucide-react';

interface MediaUploadProps {
  onFilesSelect: (files: File[]) => void;
  multiple?: boolean;
  selectedFiles?: File[];
  onRemoveFile?: (index: number) => void;
}

export function MediaUpload({ 
  onFilesSelect, 
  multiple = true, 
  selectedFiles = [],
  onRemoveFile 
}: MediaUploadProps) {
  console.log('MediaUpload rendering', { filesCount: selectedFiles.length, multiple });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      alert('Only image files are allowed (JPG, PNG, WebP)');
    }
    
    if (imageFiles.length > 0) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const validFiles = imageFiles.filter(file => {
        if (file.size > maxSize) {
          alert(`File ${file.name} is too large. Maximum size is 10MB`);
          return false;
        }
        return true;
      });
      
      if (validFiles.length > 0) {
        onFilesSelect(validFiles);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Media Attachments (optional)</Label>
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileUp className="h-6 w-6 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">
            Click to upload images
          </p>
          <p className="text-xs text-gray-400 mt-1">
            JPG, PNG, WebP up to 10MB each
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Preview selected files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Selected Images:</Label>
          <div className="grid grid-cols-3 gap-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div className="w-full h-20 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {onRemoveFile && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onRemoveFile(index)}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
                <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}