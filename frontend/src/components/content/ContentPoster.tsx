import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn.utils';

interface ContentPosterProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  lazy?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

const ContentPoster: React.FC<ContentPosterProps> = ({
  src,
  alt,
  className,
  width = 300,
  height = 450,
  lazy = true,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };



  const PlaceholderIcon = () => (
    <svg
      className="w-16 h-16 text-gray-600"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
        clipRule="evenodd"
      />
    </svg>
  );

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden rounded-lg bg-gray-800',
        className
      )}
      style={{ width, height }}
    >
      {/* Loading skeleton - Netflix style */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-800 overflow-hidden">
          {/* Netflix-style shimmer animation */}
          <div className="w-full h-full bg-gray-800 relative before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-gray-700/40 before:to-transparent" />
        </div>
      )}

      {/* Error placeholder */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-800 flex flex-col items-center justify-center text-gray-400">
          <PlaceholderIcon />
          <span className="text-xs mt-2 text-center px-2">Image not available</span>
        </div>
      )}

      {/* Actual image */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? 'lazy' : 'eager'}
        />
      )}

      {/* Gradient overlay for better text readability - removed hover effect to prevent flicker */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
    </div>
  );
};

export default ContentPoster;