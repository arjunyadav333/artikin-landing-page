import React from 'react';
import { cn } from '@/lib/utils';

interface LinkRendererProps {
  text: string;
  className?: string;
  linkClassName?: string;
}

export const LinkRenderer: React.FC<LinkRendererProps> = ({ 
  text, 
  className,
  linkClassName = "text-blue-500 underline hover:no-underline"
}) => {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+\.[^\s]+)/gi;
  
  const renderTextWithLinks = (inputText: string) => {
    const parts = inputText.split(urlRegex);
    
    return parts.map((part, index) => {
      // Create a fresh regex for testing to avoid state issues
      const testRegex = /(https?:\/\/[^\s]+|www\.[^\s]+\.[^\s]+)/i;
      if (testRegex.test(part)) {
        // Add protocol if missing
        const href = part.startsWith('http') ? part : `https://${part}`;
        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(linkClassName, "cursor-pointer")}
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  return (
    <div className={cn(className)}>
      {renderTextWithLinks(text)}
    </div>
  );
};