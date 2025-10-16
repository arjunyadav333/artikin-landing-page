// Phase 9: Optimized image component with lazy loading
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
  const [currentSrc, setCurrentSrc] = useState(blurDataURL || src);

  useEffect(() => {
    if (!blurDataURL) return;

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
    };
  }, [src, blurDataURL]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`w-full h-full object-cover ${className}`}
      {...props}
    />
  );
};