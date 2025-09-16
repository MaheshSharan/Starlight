import React from 'react';
import { Content } from '../../types/content.types';
import { Button, Skeleton } from '../ui';
import { cn } from '../../utils/cn.utils';

interface HeroSectionProps {
  content: Content | null;
  loading?: boolean;
  onPlayClick?: () => void;
  onInfoClick?: () => void;
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  content,
  loading = false,
  onPlayClick,
  onInfoClick,
  className
}) => {
  const getTitle = (content: Content) => {
    return content.title || content.name || content.original_title || content.original_name || 'Unknown Title';
  };

  const getReleaseYear = (content: Content) => {
    const date = content.release_date || content.first_air_date;
    return date ? new Date(date).getFullYear() : null;
  };

  const formatRating = (rating: number) => {
    return Math.round(rating * 10) / 10;
  };

  const truncateOverview = (text: string, maxLength: number = 300) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Loading skeleton or no content - always show skeleton to maintain consistent height
  if (loading || !content) {
    return <Skeleton.Hero className={className} />;
  }

  const backdropUrl = content.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${content.backdrop_path}`
    : '';

  return (
    <div className={cn('relative h-screen w-full overflow-hidden', className)}>
      {/* Background Image */}
      {backdropUrl && (
        <div className="absolute inset-0">
          <img
            src={backdropUrl}
            alt={getTitle(content)}
            className="w-full h-full object-cover"
            loading="eager"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex items-center h-full px-4 md:px-8 lg:px-16">
        <div className="max-w-2xl">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            {getTitle(content)}
          </h1>

          {/* Metadata */}
          <div className="flex items-center space-x-4 mb-6 text-white">
            {getReleaseYear(content) && (
              <span className="text-lg font-medium">
                {getReleaseYear(content)}
              </span>
            )}
            
            {content.vote_average > 0 && (
              <>
                <span className="text-gray-400">•</span>
                <div className="flex items-center space-x-1">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-lg font-medium">
                    {formatRating(content.vote_average)}
                  </span>
                </div>
              </>
            )}

            <span className="text-gray-400">•</span>
            <span className="bg-red-600 px-2 py-1 rounded text-sm font-semibold uppercase">
              {content.media_type === 'tv' ? 'TV Series' : 'Movie'}
            </span>
          </div>

          {/* Overview */}
          {content.overview && (
            <p className="text-white text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
              {truncateOverview(content.overview)}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <Button
              size="lg"
              onClick={onPlayClick}
              className="bg-white text-black hover:bg-gray-200 font-semibold px-8 py-3 text-lg"
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Play
            </Button>
            
            <Button
              variant="secondary"
              size="lg"
              onClick={onInfoClick}
              className="bg-gray-600/80 text-white hover:bg-gray-600 font-semibold px-8 py-3 text-lg backdrop-blur-sm"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              More Info
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;