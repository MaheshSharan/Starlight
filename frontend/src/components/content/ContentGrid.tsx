import React, { useRef, useState, useEffect } from 'react';
import { Content } from '../../types/content.types';
import ContentCard from './ContentCard';
import { HoverProvider } from '../../contexts/HoverContext';
import { Skeleton, NavigationArrow } from '../ui';
import { cn } from '../../utils/cn.utils';

interface ContentGridProps {
  content: Content[];
  loading?: boolean;
  error?: string | null;
  className?: string;
  cardSize?: 'sm' | 'md' | 'lg';
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  showDetails?: boolean;
  onContentClick?: (content: Content) => void;
  emptyMessage?: string;
  loadingCount?: number;
}

interface ContentGridComponent extends React.FC<ContentGridProps> {
  Row: React.FC<ContentRowProps>;
}

const ContentGrid: ContentGridComponent = ({
  content,
  loading = false,
  error = null,
  className,
  cardSize = 'md',
  columns = {
    mobile: 2,
    tablet: 4,
    desktop: 6
  },
  showDetails = false,
  onContentClick,
  emptyMessage = 'No content available',
  loadingCount = 12
}) => {
  const getGridClasses = () => {
    const { mobile = 2, tablet = 4, desktop = 6 } = columns;
    
    const mobileClass = `grid-cols-${mobile}`;
    const tabletClass = `md:grid-cols-${tablet}`;
    const desktopClass = `lg:grid-cols-${desktop}`;
    
    return `grid gap-4 sm:gap-6 ${mobileClass} ${tabletClass} ${desktopClass}`;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={cn(getGridClasses(), className)}>
        {Array.from({ length: loadingCount }).map((_, index) => (
          <Skeleton.ContentCard
            key={index}
            size={cardSize}
            showDetails={showDetails}
          />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 text-gray-600 mb-4">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Something went wrong</h3>
        <p className="text-gray-400 max-w-md">{error}</p>
      </div>
    );
  }

  // Empty state
  if (!content || content.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 text-gray-600 mb-4">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No content found</h3>
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  // Content grid
  return (
    <HoverProvider>
      <div className={cn(getGridClasses(), className)}>
        {content.map((item) => (
          <ContentCard
            key={`${item.media_type}-${item.id}`}
            content={item}
            size={cardSize}
            showDetails={showDetails}
            onClick={onContentClick}
          />
        ))}
      </div>
    </HoverProvider>
  );
};

// Horizontal scrolling variant for content rows
interface ContentRowProps extends Omit<ContentGridProps, 'columns'> {
  title?: string;
  showMore?: boolean;
  onShowMore?: () => void;
  scrollAmount?: number; // Number of cards to scroll per click
}

const ContentRow: React.FC<ContentRowProps> = ({
  content,
  loading = false,
  error = null,
  className,
  cardSize = 'md',
  showDetails = false,
  onContentClick,
  title,
  showMore = false,
  onShowMore,
  loadingCount = 8,
  scrollAmount = 4
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Calculate card width based on size
  const getCardWidth = () => {
    switch (cardSize) {
      case 'sm': return 150;
      case 'lg': return 250;
      default: return 200; // md
    }
  };

  // Update scroll button visibility
  const updateScrollButtons = () => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;

    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < maxScrollLeft - 1); // -1 for rounding errors
  };

  // Handle scroll events
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Initial check
    updateScrollButtons();

    // Add scroll listener
    container.addEventListener('scroll', updateScrollButtons);
    
    // Add resize listener to handle window resize
    const handleResize = () => {
      setTimeout(updateScrollButtons, 100);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', handleResize);
    };
  }, [content]);

  // Scroll functions
  const scrollLeft = () => {
    if (!scrollContainerRef.current) return;
    
    const cardWidth = getCardWidth();
    const scrollDistance = cardWidth * scrollAmount + (16 * scrollAmount); // 16px gap between cards
    
    scrollContainerRef.current.scrollBy({
      left: -scrollDistance,
      behavior: 'smooth'
    });
  };

  const scrollRight = () => {
    if (!scrollContainerRef.current) return;
    
    const cardWidth = getCardWidth();
    const scrollDistance = cardWidth * scrollAmount + (16 * scrollAmount); // 16px gap between cards
    
    scrollContainerRef.current.scrollBy({
      left: scrollDistance,
      behavior: 'smooth'
    });
  };

  // Loading skeleton for horizontal row
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {title && <Skeleton variant="text" className="h-6 w-48" />}
        <div className="relative">
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {Array.from({ length: loadingCount }).map((_, index) => (
              <div key={index} className="flex-shrink-0">
                <Skeleton.ContentCard
                  size={cardSize}
                  showDetails={showDetails}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn('space-y-4', className)}>
        {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
        <div className="flex items-center justify-center py-8 text-gray-400">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (!content || content.length === 0) {
    return null;
  }

  // Check if we have enough content to show navigation arrows
  const showNavigation = content.length > 3; // Show arrows if more than 3 items

  return (
    <div className={cn('space-y-4', className)}>
      {/* Section Header */}
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          {showMore && onShowMore && (
            <button
              onClick={onShowMore}
              className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
            >
              View All →
            </button>
          )}
        </div>
      )}

      {/* Horizontal Scrolling Content with Navigation */}
      <div className="relative group">
        {/* Navigation Arrows */}
        {showNavigation && (
          <>
            <NavigationArrow
              direction="left"
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            />
            <NavigationArrow
              direction="right"
              onClick={scrollRight}
              disabled={!canScrollRight}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            />
          </>
        )}

        {/* Content Container */}
        <HoverProvider>
          <div 
            ref={scrollContainerRef}
            className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
            style={{
              // Hide scrollbar on all browsers
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              // Add will-change to optimize scrolling performance
              willChange: 'scroll-position',
            }}
          >
            {content.map((item) => (
              <div key={`${item.media_type}-${item.id}`} className="flex-shrink-0">
                <ContentCard
                  content={item}
                  size={cardSize}
                  showDetails={showDetails}
                  onClick={onContentClick}
                />
              </div>
            ))}
          </div>
        </HoverProvider>
      </div>
    </div>
  );
};

// Export both components
ContentGrid.Row = ContentRow;

export default ContentGrid as ContentGridComponent;