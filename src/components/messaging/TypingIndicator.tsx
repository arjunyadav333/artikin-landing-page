import { cn } from '@/lib/utils';

interface TypingUser {
  user_id: string;
  username?: string;
  display_name?: string;
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
  className?: string;
}

export const TypingIndicator = ({ typingUsers, className }: TypingIndicatorProps) => {
  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      const user = typingUsers[0];
      const name = user.display_name || user.username || 'Someone';
      return `${name} is typing...`;
    } else if (typingUsers.length === 2) {
      const names = typingUsers.map(u => u.display_name || u.username || 'Someone');
      return `${names.join(' and ')} are typing...`;
    } else {
      return `${typingUsers.length} people are typing...`;
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground",
      className
    )}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
      </div>
      <span>{getTypingText()}</span>
    </div>
  );
};