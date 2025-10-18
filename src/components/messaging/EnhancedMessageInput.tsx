import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Send, 
  Smile, 
  Image, 
  Video, 
  Paperclip, 
  X,
  Reply
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EnhancedMessage } from '@/hooks/useEnhancedMessaging';

interface EnhancedMessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (options?: { 
    replyTo?: string;
    attachments?: File[];
  }) => void;
  onTyping?: () => void;
  disabled?: boolean;
  replyingTo?: EnhancedMessage;
  onCancelReply?: () => void;
  placeholder?: string;
}

const EMOJI_SHORTCUTS = {
  ':)': '😊',
  ':D': '😃', 
  ':(': '😢',
  ':P': '😛',
  ':o': '😮',
  '<3': '❤️',
  '</3': '💔',
  ':thumbsup:': '👍',
  ':thumbsdown:': '👎',
  ':fire:': '🔥',
  ':star:': '⭐',
  ':100:': '💯'
};

const COMMON_EMOJIS = [
  '😊', '😂', '😍', '😘', '😊', '🥺', '😭', '😡', '😱', '🤔',
  '👍', '👎', '👏', '🙌', '👌', '✌️', '🤝', '🔥', '💯', '❤️',
  '💔', '💕', '💖', '💘', '⭐', '🌟', '✨', '🎉', '🎊', '🙏'
];

export const EnhancedMessageInput = React.forwardRef<HTMLInputElement, EnhancedMessageInputProps>(({
  value,
  onChange,
  onSend,
  onTyping,
  disabled = false,
  replyingTo,
  onCancelReply,
  placeholder = "Type a message..."
}, ref) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use forwarded ref or fallback to internal ref
  const actualInputRef = (ref as React.RefObject<HTMLInputElement>) || inputRef;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = useCallback(() => {
    console.log('🎯 EnhancedMessageInput handleSend triggered', {
      valueLength: value.length,
      valueTrimmed: value.trim(),
      attachmentsCount: attachments.length,
      disabled
    });
    
    if (disabled) {
      console.log('⚠️ Send blocked: input disabled');
      return;
    }
    
    // Always call onSend - let parent handle validation
    // The parent (handleSendMessage) has the actual draftText state
    console.log('✅ Calling onSend from EnhancedMessageInput');
    onSend({
      replyTo: replyingTo?.id,
      attachments: attachments.length > 0 ? attachments : undefined
    });
    
    setAttachments([]);
    onCancelReply?.();
    
    // Keep focus on input to prevent keyboard from closing
    setTimeout(() => {
      actualInputRef.current?.focus();
    }, 100);
  }, [value, attachments, disabled, onSend, replyingTo, onCancelReply, actualInputRef]);

  const handleEmojiSelect = (emoji: string) => {
    const input = actualInputRef.current;
    if (input) {
      const cursorPosition = input.selectionStart || 0;
      const newValue = value.slice(0, cursorPosition) + emoji + value.slice(cursorPosition);
      onChange(newValue);
      
      // Focus and set cursor position after emoji
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(cursorPosition + emoji.length, cursorPosition + emoji.length);
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB
      const isValidType = file.type.startsWith('image/') || 
                         file.type.startsWith('video/') ||
                         file.type === 'application/pdf';
      return isValidSize && isValidType;
    });
    
    setAttachments(prev => [...prev, ...validFiles]);
    e.target.value = ''; // Reset input
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (newValue: string) => {
    // Auto-replace emoji shortcuts
    let processedValue = newValue;
    Object.entries(EMOJI_SHORTCUTS).forEach(([shortcut, emoji]) => {
      if (processedValue.endsWith(shortcut + ' ')) {
        processedValue = processedValue.replace(shortcut + ' ', emoji + ' ');
      }
    });
    
    onChange(processedValue);
    onTyping?.();
  };

  const getAttachmentPreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  return (
    <div className="space-y-3">
      {/* Reply preview */}
      {replyingTo && (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
          <Reply className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              Replying to {replyingTo.sender?.display_name}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {replyingTo.content || replyingTo.body || 'Message'}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onCancelReply}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 px-3">
          {attachments.map((file, index) => {
            const preview = getAttachmentPreview(file);
            return (
              <div key={index} className="relative">
                <Badge variant="secondary" className="pr-1">
                  {preview ? (
                    <img 
                      src={preview} 
                      alt={file.name}
                      className="w-4 h-4 object-cover rounded mr-1"
                    />
                  ) : (
                    <Paperclip className="w-3 h-3 mr-1" />
                  )}
                  {file.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              </div>
            );
          })}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <div className="flex gap-1">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>

        {/* Text input */}
        <div className="flex-1 relative">
          <Input
            ref={actualInputRef}
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            className="pr-20 resize-none min-h-[40px] touch-manipulation"
            onKeyPress={handleKeyPress}
            disabled={disabled}
            inputMode="text"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          
          {/* Emoji and send buttons */}
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={disabled}
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3" align="end">
                <div className="grid grid-cols-10 gap-1">
                  {COMMON_EMOJIS.map(emoji => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-lg hover:scale-110 transition-transform"
                      onClick={() => handleEmojiSelect(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <Button
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleSend}
              disabled={disabled || (!value.trim() && attachments.length === 0)}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

EnhancedMessageInput.displayName = 'EnhancedMessageInput';