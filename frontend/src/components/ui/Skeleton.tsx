import React from 'react';
import { cn } from '../../utils/cn.utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'hero' | 'card' | 'button';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

interface SkeletonComponent extends React.FC<SkeletonProps> {
  Card: React.FC<SkeletonCardProps>;
  Avatar: React.FC<SkeletonAvatarProps>;
  Text: React.FC<SkeletonTextProps>;
  Hero: React.FC<HeroSkeletonProps>;
  ContentCard: React.FC<ContentCardSkeletonProps>;
}

const Skeleton: SkeletonComponent = ({
  className,
  variant = 'text',
  width,
  height,
  lines = 1,
  ...props
}) => {
  // Netflix-style shimmer animation
  const baseClasses = 'relative overflow-hidden bg-gray-800';
  const shimmerClasses = 'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-gray-700/40 before:to-transparent';
  
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full',
    hero: 'rounded-lg',
    card: 'rounded-lg',
    button: 'rounded-lg'
  };

  const getDefaultDimensions = () => {
    switch (variant) {
      case 'circular':
        return { width: '40px', height: '40px' };
      case 'rectangular':
        return { width: '100%', height: '200px' };
      case 'hero':
        return { width: '100%', height: '400px' };
      case 'card':
        return { width: '200px', height: '300px' };
      case 'button':
        return { width: '120px', height: '48px' };
      default:
        return { width: '100%', height: '1rem' };
    }
  };

  const defaultDimensions = getDefaultDimensions();
  const finalWidth = width || defaultDimensions.width;
  const finalHeight = height || defaultDimensions.height;

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-3" {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              shimmerClasses,
              variantClasses[variant],
              className
            )}
            style={{
              width: index === lines - 1 ? '75%' : finalWidth,
              height: finalHeight
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        shimmerClasses,
        variantClasses[variant],
        className
      )}
      style={{
        width: finalWidth,
        height: finalHeight
      }}
      {...props}
    />
  );
};

// Netflix-style Hero Skeleton Component
interface HeroSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const HeroSkeleton: React.FC<HeroSkeletonProps> = ({ className, ...props }) => (
  <div className={cn('relative h-screen w-full bg-black overflow-hidden', className)} {...props}>
    {/* Background skeleton - subtle gray pattern on black background */}
    <div className="absolute inset-0 bg-black">
      <div className="w-full h-full bg-gradient-to-br from-gray-900/20 to-gray-800/10" />
    </div>
    
    {/* Content skeleton with consistent gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent">
      <div className="flex items-center h-full px-4 md:px-8 lg:px-16">
        <div className="max-w-2xl space-y-6">
          {/* Title skeleton */}
          <div className="space-y-3">
            <Skeleton variant="text" className="h-12 w-3/4" />
            <Skeleton variant="text" className="h-12 w-1/2" />
          </div>
          
          {/* Metadata skeleton */}
          <div className="flex items-center space-x-4">
            <Skeleton variant="text" className="h-6 w-16" />
            <div className="w-1 h-1 bg-gray-600 rounded-full" />
            <Skeleton variant="text" className="h-6 w-20" />
            <div className="w-1 h-1 bg-gray-600 rounded-full" />
            <Skeleton variant="text" className="h-6 w-24" />
          </div>
          
          {/* Description skeleton */}
          <div className="space-y-3">
            <Skeleton variant="text" lines={4} className="h-4" />
          </div>
          
          {/* Buttons skeleton */}
          <div className="flex space-x-4 pt-2">
            <Skeleton variant="button" className="h-12 w-32" />
            <Skeleton variant="button" className="h-12 w-36" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Netflix-style Content Card Skeleton Component
interface ContentCardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

const ContentCardSkeleton: React.FC<ContentCardSkeletonProps> = ({ 
  className, 
  size = 'md',
  showDetails = false,
  ...props
}) => {
  const sizeConfig = {
    sm: {
      width: 150,
      height: 225,
      titleHeight: '1rem',
      metaHeight: '0.875rem'
    },
    md: {
      width: 200,
      height: 300,
      titleHeight: '1.125rem',
      metaHeight: '1rem'
    },
    lg: {
      width: 250,
      height: 375,
      titleHeight: '1.25rem',
      metaHeight: '1.125rem'
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={cn('group', className)} {...props}>
      {/* Poster skeleton */}
      <div className="relative">
        <Skeleton
          variant="card"
          width={config.width}
          height={config.height}
          className="shadow-lg"
        />
        
        {/* Badge skeletons positioned on poster */}
        <div className="absolute top-2 right-2">
          <Skeleton variant="text" className="h-6 w-12 rounded-full" />
        </div>
        <div className="absolute top-2 left-2">
          <Skeleton variant="text" className="h-6 w-16 rounded" />
        </div>
      </div>

      {/* Content details skeleton (only if showDetails is true) */}
      {showDetails && (
        <div className="mt-3 space-y-2">
          {/* Title skeleton */}
          <div className="space-y-1">
            <Skeleton variant="text" height={config.titleHeight} className="w-full" />
            <Skeleton variant="text" height={config.titleHeight} className="w-3/4" />
          </div>
          
          {/* Metadata skeleton */}
          <div className="flex items-center space-x-2">
            <Skeleton variant="text" height={config.metaHeight} className="w-12" />
            <div className="w-1 h-1 bg-gray-600 rounded-full" />
            <Skeleton variant="text" height={config.metaHeight} className="w-16" />
          </div>

          {/* Overview skeleton (only for medium and large sizes) */}
          {size !== 'sm' && (
            <div className="space-y-1 pt-1">
              <Skeleton variant="text" height={config.metaHeight} className="w-full" />
              <Skeleton variant="text" height={config.metaHeight} className="w-4/5" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Predefined skeleton components for common use cases
interface SkeletonCardProps {
  className?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ className }) => (
  <div className={cn('p-4 border border-gray-700 rounded-lg bg-gray-800', className)}>
    <Skeleton variant="rectangular" height="200px" className="mb-4" />
    <Skeleton variant="text" className="mb-2" />
    <Skeleton variant="text" width="60%" />
  </div>
);

interface SkeletonAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({ 
  className, 
  size = 'md' 
}) => {
  const sizeMap = {
    sm: '32px',
    md: '40px',
    lg: '56px'
  };

  return (
    <Skeleton
      variant="circular"
      width={sizeMap[size]}
      height={sizeMap[size]}
      className={className}
    />
  );
};

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

const SkeletonText: React.FC<SkeletonTextProps> = ({ 
  lines = 3, 
  className 
}) => (
  <Skeleton variant="text" lines={lines} className={className} />
);

// Export compound component
Skeleton.Card = SkeletonCard;
Skeleton.Avatar = SkeletonAvatar;
Skeleton.Text = SkeletonText;
Skeleton.Hero = HeroSkeleton;
Skeleton.ContentCard = ContentCardSkeleton;

export default Skeleton as SkeletonComponent;