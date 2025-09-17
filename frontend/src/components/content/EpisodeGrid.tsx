import React from 'react';
import { Episode } from '@/types/content.types';
import { contentService } from '@/services/content.service';

interface EpisodeGridProps {
  episodes: Episode[];
  onEpisodeClick: (episode: Episode) => void;
  className?: string;
}

// SVG Icons
const PlayTriangleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M8 5v14l11-7z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export const EpisodeGrid: React.FC<EpisodeGridProps> = ({
  episodes,
  onEpisodeClick,
  className = ''
}) => {
  const formatRuntime = (minutes: number | null) => {
    if (!minutes) return 'Unknown';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getImageUrl = (path: string | null): string => {
    if (!path) return '/placeholder-episode.jpg';
    return contentService.getImageUrl(path, 'w300');
  };

  return (
    <div className={`grid grid-cols-1 ${className}`}>
      {episodes.map((episode, idx) => (
        <div
          key={episode.id}
          className="group cursor-pointer border-b border-white/10 hover:bg-white/5 transition-colors"
          onClick={() => onEpisodeClick(episode)}
        >
          <div className="flex items-stretch gap-3 py-3">
            {/* Index column */}
            <div className="w-8 flex items-center justify-center text-white/70 text-sm select-none">
              {episode.episode_number ?? idx + 1}
            </div>
            {/* Episode Image */}
            <div className="relative w-28 h-16 sm:w-40 sm:h-24 flex-shrink-0 bg-gray-800 rounded overflow-hidden">
              <img
                src={getImageUrl(episode.still_path)}
                alt={episode.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-episode.jpg';
                }}
              />

              {/* Hover Play button overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-white text-black font-semibold shadow-lg hover:bg-gray-200"
                >
                  <PlayTriangleIcon />
                  <span>Play</span>
                </button>
              </div>

              {/* Episode number badge */}
              {/* no numeric badge in minimalist list */}
            </div>

            {/* Episode Info */}
            <div className="flex-1 pr-4 flex flex-col justify-between min-h-16">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors duration-200">
                  {episode.name}
                </h3>
                <p className="text-xs sm:text-sm text-white/70 mb-1 line-clamp-1 sm:line-clamp-2">
                  {episode.overview || 'No description available.'}
                </p>
              </div>

              {/* Episode metadata */}
              <div className="flex flex-wrap items-center gap-4 text-[11px] sm:text-xs text-white/60">
                <div className="flex items-center gap-1">
                  <ClockIcon />
                  <span>{formatRuntime(episode.runtime) || '—'}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <StarIcon />
                  <span>{episode.vote_average.toFixed(1)}</span>
                </div>
                
                <span>{formatDate(episode.air_date)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EpisodeGrid;