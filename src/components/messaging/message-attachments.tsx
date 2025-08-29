import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Download, Play, Pause, Volume2 } from "lucide-react";
import { MessageAttachment } from "@/hooks/useMessaging";

interface MessageAttachmentsProps {
  attachments: MessageAttachment[];
}

export const MessageAttachments = ({ attachments }: MessageAttachmentsProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleAudioToggle = (url: string) => {
    if (playingAudio === url) {
      setPlayingAudio(null);
      // Stop audio
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach(audio => audio.pause());
    } else {
      setPlayingAudio(url);
    }
  };

  const renderAttachment = (attachment: MessageAttachment) => {
    const { mime_type, file_url, file_size, width, height } = attachment;

    if (mime_type.startsWith('image/')) {
      return (
        <div
          key={attachment.id}
          className="relative cursor-pointer group max-w-xs"
          onClick={() => setSelectedImage(file_url)}
        >
          <img
            src={file_url}
            alt="Image attachment"
            className="rounded-lg max-h-64 object-cover group-hover:opacity-90 transition-opacity"
            style={{ maxWidth: '100%' }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
        </div>
      );
    }

    if (mime_type.startsWith('video/')) {
      return (
        <video
          key={attachment.id}
          controls
          className="rounded-lg max-h-64 max-w-xs"
          preload="metadata"
        >
          <source src={file_url} type={mime_type} />
          Your browser does not support video playback.
        </video>
      );
    }

    if (mime_type.startsWith('audio/')) {
      const isPlaying = playingAudio === file_url;
      return (
        <div key={attachment.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg max-w-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAudioToggle(file_url)}
            className="h-10 w-10 p-0"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Voice message</p>
            <p className="text-xs text-muted-foreground">
              {file_size ? formatFileSize(file_size) : 'Audio'}
            </p>
          </div>
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          {isPlaying && (
            <audio
              src={file_url}
              autoPlay
              onEnded={() => setPlayingAudio(null)}
              className="hidden"
            />
          )}
        </div>
      );
    }

    // Document/file attachment
    return (
      <div key={attachment.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg max-w-xs">
        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">Document</p>
          <p className="text-xs text-muted-foreground">
            {file_size ? formatFileSize(file_size) : 'File'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(file_url, '_blank')}
          className="h-8 w-8 p-0"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col space-y-2">
        {attachments.map(renderAttachment)}
      </div>

      {/* Image preview dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex items-center justify-center p-6 pt-0">
              <img
                src={selectedImage}
                alt="Full size preview"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};