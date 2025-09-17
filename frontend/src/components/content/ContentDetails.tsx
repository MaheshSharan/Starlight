import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ContentDetails as ContentDetailsType, Episode } from '@/types/content.types';
import { contentService } from '@/services/content.service';
import { useSeasonDetails } from '@/hooks/useContent';
import Button from '@/components/ui/Button';
import SeasonSelector from './SeasonSelector';
import EpisodeGrid from './EpisodeGrid';
import { cn } from '@/utils/cn.utils';
import { createPlayerUrl } from '@/utils/slug.utils';
import SimilarContent from './SimilarContent';
import Skeleton from '@/components/ui/Skeleton';

interface ContentDetailsProps {
  content: ContentDetailsType;
  className?: string;
}

const ContentDetails: React.FC<ContentDetailsProps> = ({ content, className }) => {
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [showAllEpisodes, setShowAllEpisodes] = useState<boolean>(false);
  const navigate = useNavigate();
  
  // Fetch season details with episodes
  const { 
    data: seasonData, 
    isLoading: isLoadingSeason,
    error: seasonError 
  } = useSeasonDetails(
    content.id, 
    selectedSeason, 
    content.media_type === 'tv' && !!content.seasons?.length
  );
  
  // Get the title based on content type
  const title = contentService.getTitle(content);
  const releaseYear = contentService.getReleaseYear(content);
  const isTv = content.media_type === 'tv' || (!!(content as any).seasons && (content as any).number_of_episodes !== undefined);
  const isMovie = content.media_type === 'movie' || (!!(content as any).runtime && !(content as any).seasons);
  
  // Handle episode click
  const handleEpisodeClick = (episode: Episode) => {
    navigate(createPlayerUrl(content, episode.season_number, episode.episode_number));
  };
  
  // Format runtime for display
  const formatRuntime = (runtime?: number | number[]) => {
    if (Array.isArray(runtime)) {
      // For TV shows, runtime is an array of episode runtimes
      if (!runtime || runtime.length === 0) return null;
      const sum = runtime.reduce((acc, n) => (typeof n === 'number' ? acc + n : acc), 0);
      const avg = Math.round(sum / runtime.length);
      if (!Number.isFinite(avg) || avg <= 0) return null;
      return `${avg}m per episode`;
    }
    if (typeof runtime === 'number' && runtime > 0) {
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

  // Get selected season data
  const currentSeason = content.seasons?.find(season => season.season_number === selectedSeason);

  // Episodes display limit (first 10 then show more like the screenshot)
  const visibleEpisodes = useMemo(() => {
    const eps = seasonData?.episodes || [];
    if (showAllEpisodes) return eps;
    return eps.slice(0, 10);
  }, [seasonData?.episodes, showAllEpisodes]);

  return (
    <div className={cn('relative bg-black', className)}>
      {/* Hero Section with Full Height Backdrop - Netflix Style */}
      <div className="relative h-[60vh] sm:h-[70vh] lg:h-[80vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          {backdropUrl ? (
            <img
              src={backdropUrl}
              alt={`${title} backdrop`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
          )}
          {/* Enhanced gradient overlays for better readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/30" />
        </div>

        {/* Hero Content positioned at bottom like Netflix */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full p-4 md:p-6 lg:p-8 pb-8 md:pb-16">
            <div className="max-w-none">
              {/* Title */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4 leading-tight max-w-4xl">
                {title}
              </h1>

              {/* Meta Information */}
              <div className="flex items-center flex-wrap gap-4 text-white text-sm md:text-base mb-4 md:mb-6">
                {content.vote_average > 0 && (
                  <span className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold">{formatRating(content.vote_average)}</span>
                  </span>
                )}
                {releaseYear && <span className="text-gray-200">{releaseYear}</span>}
                {(content.runtime || content.episode_run_time) && (
                  <span className="text-gray-200">{formatRuntime(content.runtime || content.episode_run_time)}</span>
                )}
                <span className="px-2 py-1 bg-red-600 rounded text-xs font-bold uppercase">
                  {isTv ? 'Series' : 'Movie'}
                </span>
              </div>

              {/* Overview and right-side metadata in same row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 md:mb-8">
                {/* Left: Overview */}
                <div className="lg:col-span-2">
                  <p className="text-gray-100 leading-relaxed text-sm md:text-base line-clamp-3">
                    {content.overview || `No overview available for this ${isTv ? 'TV series' : 'movie'}.`}
                  </p>
                </div>
                
                {/* Right: Metadata */}
                <div className="text-sm text-gray-200 space-y-2">
                  {content.tagline && (
                    <div className="text-base text-white/90 italic mb-2">{content.tagline}</div>
                  )}
                  {content.credits?.cast?.length ? (
                    <div>
                      <span className="text-gray-400">Cast: </span>
                      {content.credits.cast.slice(0, 3).map((p, i) => (
                        <span key={p.id}>
                          {p.name}{i < Math.min(3, content.credits.cast.length) - 1 ? ', ' : ''}
                        </span>
                      ))}
                      {content.credits.cast.length > 3 && <span>, more</span>}
                    </div>
                  ) : null}
                  {content.genres?.length ? (
                    <div>
                      <span className="text-gray-400">Genres: </span>
                      {content.genres.slice(0, 4).map((g, i) => (
                        <span key={g.id}>
                          {g.name}{i < Math.min(4, content.genres.length) - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {/* This Show Is - light heuristic from genres */}
                  {isTv && content.genres?.length ? (
                    <div>
                      <span className="text-gray-400">This TV show is: </span>
                      {content.genres.slice(0, 3).map((g, i) => {
                        const map: Record<string, string> = {
                          Romance: 'Romantic',
                          Comedy: 'Witty',
                          Drama: 'Heartfelt',
                          Action: 'Exciting',
                          'Action & Adventure': 'Adventurous',
                          Mystery: 'Intriguing',
                          Fantasy: 'Imaginative',
                          Horror: 'Suspenseful',
                          Family: 'Family-friendly'
                        };
                        const adj = map[g.name] || g.name;
                        return (
                          <span key={`is-${g.id}`}>
                            {adj}{i < Math.min(3, content.genres.length) - 1 ? ', ' : ''}
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                {/* Play Button */}
                {isMovie ? (
                  <Link to={createPlayerUrl(content)}>
                    <Button
                      variant="primary"
                      size="lg"
                      className="bg-white text-black hover:bg-gray-200 px-6 py-3 rounded font-bold"
                    >
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                      Play
                    </Button>
                  </Link>
                ) : (
                  <Link to={createPlayerUrl(content, selectedSeason, 1)}>
                    <Button
                      variant="primary"
                      size="lg"
                      className="bg-white text-black hover:bg-gray-200 px-6 py-3 rounded font-bold"
                    >
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                      Play S{selectedSeason}E1
                    </Button>
                  </Link>
                )}
                
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-gray-600/80 hover:bg-gray-500 text-white px-4 py-3 rounded font-bold"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  My List
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-gray-600/80 hover:bg-gray-500 text-white px-3 py-3 rounded font-bold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.60L7 20m7-10V9a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content Information Section */}
      <div className="bg-black p-4 md:p-6 lg:p-8">
        <div className="max-w-none">
          {/* Tagline moved into the hero right panel for a cleaner layout */}

          {/* Remove genre badges - genres are now in the right panel */}

          {/* Removed earlier technical grid; moved to the About section at the end */}


          {/* TV Show Specific: Season Selector and Episode Info */}
          {isTv && (
            <div className="mb-6 md:mb-8">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-white">Episodes</h3>
                <div className="text-sm text-white/80">{title}</div>
              </div>
              
              {/* Enhanced Season Selector */}
              <div className="bg-gray-900/30 rounded-xl p-4 md:p-6">
                {content.seasons && content.seasons.length > 0 ? (
                  <>
                    {/* Enhanced Season Selector */}
                    <div className="mb-6">
                      <label className="block text-base font-semibold text-white mb-3">
                        Choose Season
                      </label>
                      <SeasonSelector
                        seasons={content.seasons.filter(season => season.season_number > 0)}
                        selectedSeason={selectedSeason}
                        onSeasonChange={setSelectedSeason}
                      />
                    </div>


                    {/* Episodes Grid */}
                    {seasonData?.episodes && (
                      <div className="mt-6">
                        <h4 className="text-lg font-bold text-white mb-4">Episodes</h4>
                        {isLoadingSeason ? (
                          <div className="grid grid-cols-1">
                            {Array.from({ length: 8 }).map((_, idx) => (
                              <div key={idx} className="group border-b border-white/10 py-3">
                                <div className="flex items-stretch gap-3">
                                  {/* Episode number skeleton */}
                                  <div className="w-8 flex items-center justify-center">
                                    <Skeleton variant="text" className="h-4 w-4" />
                                  </div>
                                  
                                  {/* Episode image skeleton */}
                                  <div className="w-28 h-16 sm:w-40 sm:h-24 flex-shrink-0">
                                    <Skeleton variant="rectangular" className="w-full h-full rounded" />
                                  </div>
                                  
                                  {/* Episode info skeleton */}
                                  <div className="flex-1 pr-4 flex flex-col justify-between min-h-16">
                                    <div>
                                      {/* Episode title skeleton */}
                                      <Skeleton variant="text" className="h-4 w-3/4 mb-2" />
                                      {/* Episode description skeleton */}
                                      <div className="space-y-1">
                                        <Skeleton variant="text" className="h-3 w-full" />
                                        <Skeleton variant="text" className="h-3 w-2/3" />
                                      </div>
                                    </div>
                                    
                                    {/* Episode metadata skeleton */}
                                    <div className="flex flex-wrap items-center gap-4 mt-2">
                                      <Skeleton variant="text" className="h-3 w-12" />
                                      <Skeleton variant="text" className="h-3 w-8" />
                                      <Skeleton variant="text" className="h-3 w-16" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : seasonError ? (
                          <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
                            <p className="text-red-400">Failed to load episodes for this season.</p>
                          </div>
                        ) : (
                          <>
                            <EpisodeGrid
                              episodes={visibleEpisodes}
                              onEpisodeClick={handleEpisodeClick}
                            />
                            {seasonData.episodes.length > 10 && (
                              <div className="flex justify-center mt-4">
                                <button
                                  type="button"
                                  aria-label={showAllEpisodes ? 'Show less episodes' : 'Show more episodes'}
                                  onClick={() => setShowAllEpisodes(!showAllEpisodes)}
                                  className="w-10 h-10 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-white transition-colors flex items-center justify-center"
                                >
                                  <svg
                                    className={`w-5 h-5 transition-transform ${showAllEpisodes ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Enhanced Series Stats Grid */}
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-white mb-1">{content.number_of_seasons || 0}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">Seasons</div>
                      </div>
                      <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-white mb-1">{content.number_of_episodes || 0}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">Episodes</div>
                      </div>
                      <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {content.first_air_date ? new Date(content.first_air_date).getFullYear() : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">First Aired</div>
                      </div>
                      <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {content.last_air_date ? new Date(content.last_air_date).getFullYear() : 
                           content.status === 'Returning Series' ? 'Ongoing' : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">Last Aired</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-800/30 rounded-lg p-6 text-center">
                    <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-400">Season information is not available for this series.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* More Like This (Similar/Recommendations) under Episodes */}
          {(() => {
            // Handle arrays directly from backend (already flattened)
            const similarData = content.similar || [];
            const recommendationsData = content.recommendations || [];
            
            console.log('ContentDetails: Similar content check:', {
              similarLength: similarData.length,
              recommendationsLength: recommendationsData.length,
              similar: similarData,
              recommendations: recommendationsData,
              similarSample: similarData[0],
              recommendationsSample: recommendationsData[0]
            });
            
            return (similarData.length > 0 || recommendationsData.length > 0);
          })() && (
            <div className="mt-10">
              <SimilarContent
                similar={content.similar || []}
                recommendations={content.recommendations || []}
              />
            </div>
          )}

          {/* About Section at the end */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-white mb-4">About {title}</h2>
            <div className="space-y-2 text-sm text-gray-200">
              {/* Director / Creators */}
              {isMovie ? (
                (() => {
                  const directors = content.credits?.crew?.filter(c => c.job === 'Director').slice(0, 3) || [];
                  return directors.length ? (
                    <div>
                      <span className="text-gray-400">Director: </span>
                      {directors.map((d, i) => (
                        <span key={`${d.id}-${i}`}>{d.name}{i < directors.length - 1 ? ', ' : ''}</span>
                      ))}
                    </div>
                  ) : null;
                })()
              ) : (
                (() => {
                  const creators = content.created_by?.slice(0, 3) || [];
                  return creators.length ? (
                    <div>
                      <span className="text-gray-400">Creators: </span>
                      {creators.map((d, i) => (
                        <span key={`${d.id}-${i}`}>{d.name}{i < creators.length - 1 ? ', ' : ''}</span>
                      ))}
                    </div>
                  ) : null;
                })()
              )}

              {/* Cast */}
              {content.credits?.cast?.length ? (
                <div>
                  <span className="text-gray-400">Cast: </span>
                  {content.credits.cast.slice(0, 6).map((p, i) => (
                    <span key={p.id}>
                      {p.name}{i < Math.min(6, content.credits.cast.length) - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              ) : null}

              {/* Genres */}
              {content.genres?.length ? (
                <div>
                  <span className="text-gray-400">Genres: </span>
                  {content.genres.map((g, i) => (
                    <span key={g.id}>
                      {g.name}{i < content.genres.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              ) : null}

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div>
                  <div className="text-gray-400">Release Date</div>
                  <div className="text-white font-medium">
                    {isMovie
                      ? (content.release_date ? new Date(content.release_date).toLocaleDateString() : 'N/A')
                      : (content.first_air_date ? new Date(content.first_air_date).toLocaleDateString() : 'N/A')}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Runtime</div>
                  <div className="text-white font-medium">{formatRuntime(content.runtime || content.episode_run_time) || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-gray-400">Language</div>
                  <div className="text-white font-medium">{content.original_language?.toUpperCase() || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-gray-400">Rating</div>
                  <div className="text-white font-medium">{formatRating(content.vote_average)}/10</div>
                </div>
                {isTv && (
                  <>
                    <div>
                      <div className="text-gray-400">Status</div>
                      <div className="text-white font-medium">{content.status || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Total Episodes</div>
                      <div className="text-white font-medium">{content.number_of_episodes || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Seasons</div>
                      <div className="text-white font-medium">{content.number_of_seasons || 'N/A'}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDetails;