import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Content } from '../../types/content.types';
import ContentPoster from './ContentPoster';
import HoverOverlay from './HoverOverlay';
import { useHover } from '../../contexts/HoverContext';
import { cn } from '../../utils/cn.utils';

interface ContentCardProps {
  content: Content;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  onClick?: (content: Content) => void;
  hoverDelay?: number;
}

const ContentCard: React.FC<ContentCardProps> = ({
  content,
  className,
  size = 'md',
  showDetails = false,
  onClick,
  hoverDelay = 300
}) => {
  const { setActiveCard, isCardActive } = useHover();
  const cardId = `card-${content.id}-${content.media_type}`;
  
  // Simple hover state
  const [showOverlay, setShowOverlay] = useState(false);
  
  // Timeout refs
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if this card is the active one
  const isActive = isCardActive(cardId);
  const sizeConfig = {
    sm: {
      width: 150,
      height: 225, // 2:3 aspect ratio (150 * 1.5 = 225)
      titleClass: 'text-sm',
      detailsClass: 'text-xs'
    },
    md: {
      width: 200,
      height: 300, // 2:3 aspect ratio (200 * 1.5 = 300)
      titleClass: 'text-base',
      detailsClass: 'text-sm'
    },
    lg: {
      width: 250,
      height: 375, // 2:3 aspect ratio (250 * 1.5 = 375)
      titleClass: 'text-lg',
      detailsClass: 'text-base'
    }
  };

  const config = sizeConfig[size];
  const imageUrl = content.poster_path 
    ? `https://image.tmdb.org/t/p/w500${content.poster_path}`
    : '';

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.getFullYear().toString();
  };

  const formatRating = (rating: number) => {
    return Math.round(rating * 10) / 10;
  };

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Reset overlay when this card is no longer active
  useEffect(() => {
    if (!isActive) {
      setShowOverlay(false);
    }
  }, [isActive]);

  // Hover event handlers
  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    // Set this card as active (clears other cards)
    setActiveCard(cardId);
    
    // Show overlay after delay
    hoverTimeoutRef.current = setTimeout(() => {
      setShowOverlay(true);
    }, hoverDelay);
  }, [cardId, setActiveCard, hoverDelay]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Quick hide
    hideTimeoutRef.current = setTimeout(() => {
      setActiveCard(null);
      setShowOverlay(false);
    }, 100);
  }, [setActiveCard]);

  // Mobile tap handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    setActiveCard(cardId);
    setShowOverlay(true);

    // Hide overlay after 3 seconds on mobile
    setTimeout(() => {
      setActiveCard(null);
      setShowOverlay(false);
    }, 3000);
  }, [cardId, setActiveCard]);

  const handleClick = () => {
    if (onClick) {
      onClick(content);
    }
  };

  const CardContent = () => (
    <div
      className={cn(
        'group relative cursor-pointer transition-shadow duration-200 ease-out',
        className
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
    >
      {/* Poster Image Container */}
      <div className="relative">
        <ContentPoster
          src={imageUrl}
          alt={content.title || content.name || content.original_title || content.original_name || 'Content poster'}
          width={config.width}
          height={config.height}
          className="shadow-lg hover:shadow-xl transition-shadow duration-200 rounded-lg"
        />
        
        {/* Hover Overlay - Only show when showDetails is false */}
        {!showDetails && isActive && showOverlay && (
          <HoverOverlay
            content={content}
            visible={true}
            size={size}
          />
        )}
      </div>

      {/* Content Details - Only shown when showDetails is true */}
      {showDetails && (
        <div className="mt-3 space-y-1">
          <h3 className={cn(
            'font-semibold text-white line-clamp-2 group-hover:text-red-400 transition-colors',
            config.titleClass
          )}>
            {content.title || content.name || content.original_title || content.original_name}
          </h3>
          
          <div className={cn('text-gray-400 flex items-center space-x-2', config.detailsClass)}>
            {(content.release_date || content.first_air_date) && (
              <span>{formatDate(content.release_date || content.first_air_date || '')}</span>
            )}
            {(content.release_date || content.first_air_date) && content.vote_average > 0 && (
              <span>•</span>
            )}
            {content.vote_average > 0 && (
              <span className="flex items-center">
                <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {formatRating(content.vote_average)}
              </span>
            )}
          </div>

          {/* Media Type Badge - Only shown when showDetails is true */}
          <div className="inline-block bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold uppercase">
            {content.media_type === 'tv' ? 'TV' : 'Movie'}
          </div>

          {/* Overview (truncated) */}
          {content.overview && size !== 'sm' && (
            <p className={cn(
              'text-gray-500 line-clamp-2 mt-2',
              config.detailsClass
            )}>
              {content.overview}
            </p>
          )}
        </div>
      )}
    </div>
  );

  // If we have an onClick handler, don't wrap in Link
  if (onClick) {
    return <CardContent />;
  }

  // Otherwise, wrap in Link for navigation
  return (
    <Link to={`/content/${content.media_type}/${content.id}`}>
      <CardContent />
    </Link>
  );
};

export default ContentCard;