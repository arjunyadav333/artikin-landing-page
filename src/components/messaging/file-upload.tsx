import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileUploaded: (file: { url: string; type: string; size: number; name: string }) => void;
  disabled?: boolean;
}

export const FileUpload = ({ onFileUploaded, disabled }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
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
      } else if (file.type.startsWith('audio/')) {
        bucket = 'chat-voice';
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
        url: publicUrl,
        type: file.type,
        size: file.size,
        name: file.name
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

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
      />
      
      {uploading ? (
        <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg">
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
        <Button
          variant="ghost"
          size="sm"
          onClick={triggerFileSelect}
          disabled={disabled}
          className="hover:bg-muted"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};