import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ContentDetails as ContentDetailsType } from '@/types/content.types';
import { contentService } from '@/services/content.service';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/cn.utils';
import { createPlayerUrl } from '@/utils/slug.utils';

interface ContentDetailsProps {
  content: ContentDetailsType;
  className?: string;
}

const ContentDetails: React.FC<ContentDetailsProps> = ({ content, className }) => {
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  
  // Get the title based on content type
  const title = contentService.getTitle(content);
  const releaseYear = contentService.getReleaseYear(content);
  
  // Format runtime for display
  const formatRuntime = (runtime?: number | number[]) => {
    if (Array.isArray(runtime)) {
      // For TV shows, runtime is an array of episode runtimes
      const avgRuntime = runtime.reduce((sum, time) => sum + time, 0) / runtime.length;
      return `${Math.round(avgRuntime)}m per episode`;
    }
    if (runtime) {
      const hours = Math.floor(runtime / 60);
      const minutes = runtime % 60;
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }
    return null;
  };

  // Format rating
  const formatRating = (rating: number) => {
    return Math.round(rating * 10) / 10;
  };

  // Get backdrop image URL
  const backdropUrl = content.backdrop_path 
    ? contentService.getImageUrl(content.backdrop_path, 'original')
    : null;

  // Get poster image URL
  const posterUrl = content.poster_path 
    ? contentService.getImageUrl(content.poster_path, 'w500')
    : null;

  // Get selected season data
  const currentSeason = content.seasons?.find(season => season.season_number === selectedSeason);

  return (
    <div className={cn('relative', className)}>
      {/* Backdrop Image */}
      {backdropUrl && (
        <div className="absolute inset-0 w-full h-[70vh] overflow-hidden">
          <img
            src={backdropUrl}
            alt={`${title} backdrop`}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-10 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Poster */}
            {posterUrl && (
              <div className="flex-shrink-0">
                <img
                  src={posterUrl}
                  alt={`${title} poster`}
                  className="w-64 h-96 object-cover rounded-lg shadow-2xl"
                />
              </div>
            )}

            {/* Content Info */}
            <div className="flex-1 text-white">
              {/* Title and Year */}
              <div className="mb-4">
                <h1 className="text-4xl lg:text-5xl font-bold mb-2">{title}</h1>
                {releaseYear && (
                  <p className="text-xl text-gray-300">{releaseYear}</p>
                )}
              </div>

              {/* Metadata Row */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                {/* Rating */}
                {content.vote_average > 0 && (
                  <div className="flex items-center bg-yellow-600 px-3 py-1 rounded-full">
                    <svg className="w-4 h-4 text-white mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold">{formatRating(content.vote_average)}</span>
                  </div>
                )}

                {/* Runtime */}
                {(content.runtime || content.episode_run_time) && (
                  <span className="bg-gray-700 px-3 py-1 rounded-full">
                    {formatRuntime(content.runtime || content.episode_run_time)}
                  </span>
                )}

                {/* Content Type */}
                <span className="bg-red-600 px-3 py-1 rounded-full font-semibold uppercase">
                  {content.media_type === 'tv' ? 'TV Series' : 'Movie'}
                </span>

                {/* Status */}
                {content.status && (
                  <span className="bg-blue-600 px-3 py-1 rounded-full">
                    {content.status}
                  </span>
                )}
              </div>

              {/* Genres */}
              {content.genres && content.genres.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {content.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tagline */}
              {content.tagline && (
                <p className="text-lg italic text-gray-300 mb-4">"{content.tagline}"</p>
              )}

              {/* Overview */}
              {content.overview && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Overview</h3>
                  <p className="text-gray-300 leading-relaxed max-w-4xl">
                    {content.overview}
                  </p>
                </div>
              )}

              {/* TV Show Specific: Season Selector and Episode Info */}
              {content.media_type === 'tv' && content.seasons && content.seasons.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">Seasons & Episodes</h3>
                  
                  {/* Season Selector */}
                  <div className="mb-4">
                    <label htmlFor="season-select" className="block text-sm font-medium mb-2">
                      Select Season:
                    </label>
                    <select
                      id="season-select"
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(Number(e.target.value))}
                      className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      {content.seasons
                        .filter(season => season.season_number > 0) // Filter out specials (season 0)
                        .map((season) => (
                          <option key={season.id} value={season.season_number}>
                            Season {season.season_number} ({season.episode_count} episodes)
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Current Season Info */}
                  {currentSeason && (
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        {currentSeason.poster_path && (
                          <img
                            src={contentService.getImageUrl(currentSeason.poster_path, 'w200')}
                            alt={`${currentSeason.name} poster`}
                            className="w-16 h-24 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold mb-1">{currentSeason.name}</h4>
                          <p className="text-sm text-gray-400 mb-2">
                            {currentSeason.episode_count} episodes
                            {currentSeason.air_date && (
                              <span> • Aired {new Date(currentSeason.air_date).getFullYear()}</span>
                            )}
                          </p>
                          {currentSeason.overview && (
                            <p className="text-sm text-gray-300 leading-relaxed">
                              {currentSeason.overview}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Series Info */}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {content.number_of_seasons && (
                      <div>
                        <span className="text-gray-400">Total Seasons:</span>
                        <p className="font-semibold">{content.number_of_seasons}</p>
                      </div>
                    )}
                    {content.number_of_episodes && (
                      <div>
                        <span className="text-gray-400">Total Episodes:</span>
                        <p className="font-semibold">{content.number_of_episodes}</p>
                      </div>
                    )}
                    {content.first_air_date && (
                      <div>
                        <span className="text-gray-400">First Aired:</span>
                        <p className="font-semibold">
                          {new Date(content.first_air_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {content.last_air_date && (
                      <div>
                        <span className="text-gray-400">Last Aired:</span>
                        <p className="font-semibold">
                          {new Date(content.last_air_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                {/* Play Button */}
                {content.media_type === 'movie' ? (
                  <Link to={createPlayerUrl(content)}>
                    <Button
                      variant="primary"
                      size="lg"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                      Play Movie
                    </Button>
                  </Link>
                ) : (
                  <Link to={createPlayerUrl(content, selectedSeason, 1)}>
                    <Button
                      variant="primary"
                      size="lg"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                      Play S{selectedSeason}E1
                    </Button>
                  </Link>
                )}
                
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gray-600 text-white hover:bg-gray-800"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  My List
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDetails;