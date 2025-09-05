import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileUploaded: (fileData: {
    file_url: string;
    mime_type: string;
    file_size?: number;
    width?: number;
    height?: number;
    duration?: number;
  }) => void;
  disabled?: boolean;
}

export const FileUpload = ({ onFileUploaded, disabled }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 50MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Determine bucket based on file type
      let bucket = 'chat-docs';
      if (file.type.startsWith('image/')) {
        bucket = 'chat-images';
      } else if (file.type.startsWith('video/')) {
        bucket = 'chat-videos';
      }

      const filePath = `${user.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onFileUploaded({
        file_url: publicUrl,
        mime_type: file.type,
        file_size: file.size
      });

      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully`
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect({ target: { files } } as any);
    }
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar"
      />
      
      {uploading ? (
        <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg min-w-[200px]">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span>Uploading...</span>
            </div>
            <div className="h-2 bg-background rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-pulse w-1/2"></div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUploading(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "relative",
            dragActive && "ring-2 ring-primary ring-opacity-50 rounded-lg"
          )}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={triggerFileSelect}
            disabled={disabled}
            className={cn(
              "hover:bg-muted transition-colors",
              dragActive && "bg-muted"
            )}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};