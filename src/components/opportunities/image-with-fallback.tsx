import { useState } from "react";
import { FileText, Building } from "lucide-react";

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackType?: "document" | "building";
  onError?: () => void;
}

export function ImageWithFallback({ 
  src, 
  alt, 
  className = "", 
  fallbackType = "document",
  onError 
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const FallbackIcon = fallbackType === "building" ? Building : FileText;

  if (!src || hasError) {
    return (
      <div className={`bg-muted flex items-center justify-center border border-border/20 ${className}`}>
        <FallbackIcon className="h-1/2 w-1/2 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover border border-border/20 ${className}`}
      onError={handleError}
    />
  );
}