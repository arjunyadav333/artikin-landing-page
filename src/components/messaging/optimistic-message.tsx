import React from 'react';
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptimisticAttachment {
  file_url: string;
  mime_type: string;
  file_size?: number;
  width?: number;
  height?: number;
  duration?: number;
}

interface OptimisticMessage {
  id: string;
  body?: string;
  attachments?: OptimisticAttachment[];
  status: 'sending' | 'failed';
  retry?: () => void;
}

interface OptimisticMessageProps {
  message: OptimisticMessage;
  user: {
    id: string;
    display_name?: string;
    avatar_url?: string;
  };
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const AttachmentPreview = ({ attachment }: { attachment: OptimisticAttachment }) => {
  const isImage = attachment.mime_type.startsWith('image/');
  const isVideo = attachment.mime_type.startsWith('video/');

  if (isImage) {
    return (
      <img
        src={attachment.file_url}
        alt="Attachment"
        className="max-w-xs max-h-48 rounded cursor-pointer object-cover"
      />
    );
  }

  if (isVideo) {
    return (
      <video
        src={attachment.file_url}
        controls
        className="max-w-xs max-h-48 rounded"
      />
    );
  }

  return (
    <div className="flex items-center space-x-3 p-3 bg-background/10 rounded-lg border">
      <div className="text-xs">
        <p className="font-medium">Document</p>
        <p className="opacity-70">
          {attachment.file_size ? formatFileSize(attachment.file_size) : 'File'}
        </p>
      </div>
    </div>
  );
};

export const OptimisticMessageComponent = ({ message }: OptimisticMessageProps) => {
  return (
    <div className="flex justify-end">
      <div className="flex space-x-2 max-w-[70%] flex-row-reverse space-x-reverse">
        <div className={cn(
          "rounded-lg px-3 py-2 relative",
          "bg-primary/70 text-primary-foreground"
        )}>
          {message.body && (
            <div className="whitespace-pre-wrap break-words">
              {message.body}
            </div>
          )}
          
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment, index) => (
                <AttachmentPreview key={index} attachment={attachment} />
              ))}
            </div>
          )}

          <div className="flex items-center justify-end mt-1 space-x-1">
            <span className="text-xs opacity-70">
              {new Date().toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })}
            </span>
            {message.status === 'sending' && (
              <div className="animate-spin">
                <Check className="h-3 w-3" />
              </div>
            )}
            {message.status === 'failed' && (
              <AlertCircle 
                className="h-3 w-3 text-destructive cursor-pointer" 
                onClick={message.retry}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};