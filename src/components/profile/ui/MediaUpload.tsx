import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  X, 
  Image, 
  Video, 
  File, 
  Eye, 
  EyeOff,
  Link,
  Plus,
  Trash2
} from 'lucide-react';

interface MediaUploadProps {
  onClose: () => void;
  onUpload: (files: UploadedFile[]) => void;
}

interface UploadedFile {
  file: File;
  preview: string;
  type: 'image' | 'video' | 'document';
  title: string;
  caption: string;
  visibility: 'public' | 'private';
  external_link: string;
}

export function MediaUpload({ onClose, onUpload }: MediaUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isDocument = file.type === 'application/pdf';
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB limit
      
      return (isImage || isVideo || isDocument) && isValidSize;
    });

    const uploadedFiles: UploadedFile[] = validFiles.map(file => {
      const type = file.type.startsWith('image/') 
        ? 'image' 
        : file.type.startsWith('video/')
        ? 'video'
        : 'document';

      return {
        file,
        preview: type !== 'document' ? URL.createObjectURL(file) : '',
        type,
        title: file.name.replace(/\.[^/.]+$/, ''),
        caption: '',
        visibility: 'public',
        external_link: ''
      };
    });

    setFiles(prev => [...prev, ...uploadedFiles]);
  };

  const updateFile = (index: number, updates: Partial<UploadedFile>) => {
    setFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, ...updates } : file
    ));
  };

  const removeFile = (index: number) => {
    const file = files[index];
    if (file.preview) {
      URL.revokeObjectURL(file.preview);
    }
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (files.length > 0) {
      onUpload(files);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      default: return <File className="h-5 w-5" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Upload Media</h2>
          <Button onClick={onClose} variant="ghost" size="icon" className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-8rem)] overflow-y-auto">
          <div className="space-y-6">
            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Drop files here or click to upload
              </h3>
              <p className="text-gray-500 mb-4">
                Support: Images (JPG, PNG, WEBP), Videos (MP4, WEBM), Documents (PDF)
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Maximum file size: 50MB
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Files to Upload ({files.length})</h3>
                <div className="space-y-4">
                  {files.map((file, index) => (
                    <div key={index} className="border rounded-2xl p-4">
                      <div className="flex gap-4">
                        {/* Preview */}
                        <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                          {file.type === 'image' && file.preview && (
                            <img 
                              src={file.preview} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                          )}
                          {file.type === 'video' && file.preview && (
                            <video 
                              src={file.preview}
                              className="w-full h-full object-cover"
                            />
                          )}
                          {file.type === 'document' && (
                            <div className="w-full h-full flex items-center justify-center">
                              <File className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* File Details Form */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              {getFileIcon(file.type)}
                              <span>{file.file.name}</span>
                              <span>({(file.file.size / 1024 / 1024).toFixed(1)} MB)</span>
                            </div>
                            <Button
                              onClick={() => removeFile(index)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm font-medium">Title</Label>
                              <Input
                                value={file.title}
                                onChange={(e) => updateFile(index, { title: e.target.value })}
                                placeholder="Enter title"
                                className="rounded-xl mt-1"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium">External Link</Label>
                              <Input
                                value={file.external_link}
                                onChange={(e) => updateFile(index, { external_link: e.target.value })}
                                placeholder="https://example.com"
                                className="rounded-xl mt-1"
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Caption</Label>
                            <Textarea
                              value={file.caption}
                              onChange={(e) => updateFile(index, { caption: e.target.value })}
                              placeholder="Describe this media..."
                              className="rounded-xl mt-1 min-h-[60px]"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => updateFile(index, { 
                                  visibility: file.visibility === 'public' ? 'private' : 'public' 
                                })}
                                variant="outline"
                                size="sm"
                                className="rounded-xl"
                              >
                                {file.visibility === 'public' ? (
                                  <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Public
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Private
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <p className="text-sm text-gray-500">
            {files.length} file{files.length !== 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" className="rounded-2xl">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={files.length === 0}
              className="rounded-2xl"
            >
              Upload {files.length} File{files.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}