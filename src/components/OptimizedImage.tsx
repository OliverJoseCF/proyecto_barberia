import { useState, useEffect } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  onLoad?: () => void;
}

/**
 * Componente de imagen optimizado con lazy loading y placeholder
 */
export const OptimizedImage = ({ 
  src, 
  alt, 
  className = "", 
  loading = "lazy",
  onLoad 
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Precargar imagen
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setIsLoaded(true);
      onLoad?.();
    };
    img.onerror = () => setHasError(true);
  }, [src, onLoad]);

  if (hasError) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <span className="text-muted-foreground">Error al cargar imagen</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      className={`transition-opacity duration-500 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      onLoad={() => {
        setIsLoaded(true);
        onLoad?.();
      }}
    />
  );
};

export default OptimizedImage;
