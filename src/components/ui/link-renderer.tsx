import React from 'react';
import { cn } from '@/lib/utils';

interface LinkRendererProps {
  text: string;
  className?: string;
}

export const LinkRenderer: React.FC<LinkRendererProps> = ({ text, className }) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  const renderTextWithLinks = (inputText: string) => {
    const parts = inputText.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:no-underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className={cn(className)}>
      {renderTextWithLinks(text)}
    </div>
  );
};