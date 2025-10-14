// Phase 9: Optimized image component with blur placeholder and lazy loading
import React, { useState, useEffect } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  blurDataURL?: string;
  className?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  blurDataURL,
  className = '',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(blurDataURL || src);

  useEffect(() => {
    if (!blurDataURL) return;

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };
  }, [src, blurDataURL]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={currentSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`
          w-full h-full object-cover transition-all duration-300
          ${isLoaded ? 'blur-0' : blurDataURL ? 'blur-sm scale-105' : ''}
        `}
        onLoad={() => !blurDataURL && setIsLoaded(true)}
        {...props}
      />
    </div>
  );
};