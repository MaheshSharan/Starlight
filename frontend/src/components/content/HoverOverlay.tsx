import React from 'react';
import { Content } from '../../types/content.types';
import { cn } from '../../utils/cn.utils';

interface HoverOverlayProps {
  content: Content;
  visible: boolean;
  size: 'sm' | 'md' | 'lg';
  className?: string;
}

const HoverOverlay: React.FC<HoverOverlayProps> = ({
  content,
  visible,
  size,
  className
}) => {
  const sizeConfig = {
    sm: {
      titleClass: 'text-sm',
      detailsClass: 'text-xs',
      badgeClass: 'text-xs px-2 py-1',
      padding: 'p-3'
    },
    md: {
      titleClass: 'text-base',
      detailsClass: 'text-sm',
      badgeClass: 'text-xs px-2 py-1',
      padding: 'p-4'
    },
    lg: {
      titleClass: 'text-lg',
      detailsClass: 'text-base',
      badgeClass: 'text-sm px-3 py-1',
      padding: 'p-4'
    }
  };

  const config = sizeConfig[size];

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.getFullYear().toString();
  };

  const formatRating = (rating: number) => {
    return Math.round(rating * 10) / 10;
  };

  const getTitle = () => {
    return content.title || content.name || content.original_title || content.original_name || 'Unknown Title';
  };

  const getYear = () => {
    return formatDate(content.release_date || content.first_air_date || '');
  };

  const getMediaTypeBadge = () => {
    return content.media_type === 'tv' ? 'TV' : 'Movie';
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      className={cn(
        'absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent',
        'flex flex-col justify-end text-white',
        'transition-opacity duration-200 ease-in-out',
        'rounded-lg overflow-hidden',
        'opacity-100',
        config.padding,
        className
      )}
    >
      {/* Media Type Badge */}
      <div className="mb-2">
        <span className={cn(
          'inline-block bg-red-600 text-white rounded font-bold uppercase tracking-wide',
          config.badgeClass
        )}>
          {getMediaTypeBadge()}
        </span>
      </div>

      {/* Title */}
      <h3 className={cn(
        'font-bold text-white line-clamp-2 mb-2 drop-shadow-lg',
        config.titleClass
      )}>
        {getTitle()}
      </h3>

      {/* Year and Rating */}
      <div className={cn(
        'flex items-center space-x-3 text-gray-200 mb-3',
        config.detailsClass
      )}>
        {getYear() && (
          <span className="font-medium">{getYear()}</span>
        )}
        
        {getYear() && content.vote_average > 0 && (
          <span className="text-gray-400">•</span>
        )}
        
        {content.vote_average > 0 && (
          <div className="flex items-center bg-black/30 px-2 py-1 rounded">
            <svg 
              className="w-3 h-3 text-yellow-400 mr-1" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-semibold">{formatRating(content.vote_average)}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <button className="bg-gray-600/80 text-white p-2 rounded-full hover:bg-gray-500/80 transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        </button>
        <button className="bg-gray-600/80 text-white p-2 rounded-full hover:bg-gray-500/80 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button className="bg-gray-600/80 text-white p-2 rounded-full hover:bg-gray-500/80 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default HoverOverlay;