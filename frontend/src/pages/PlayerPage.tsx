import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ContentDetails as ContentDetailsType } from '@/types/content.types';
import { contentService } from '@/services/content.service';
import Loading from '@/components/ui/Loading';
import Button from '@/components/ui/Button';
import { parseContentUrl, parseWatchParam, createContentUrl } from '@/utils/slug.utils';

function PlayerPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [content, setContent] = useState<ContentDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchInfo, setWatchInfo] = useState<{ season?: number; episode?: number }>({});

  useEffect(() => {
    const fetchContentAndParseWatch = async () => {
      console.log('PlayerPage params:', { type, id });
      
      if (!type || !id) {
        setError(`Invalid player parameters. Type: ${type}, ID: ${id}`);
        setLoading(false);
        return;
      }

      // Validate type parameter
      if (type !== 'movie' && type !== 'tv') {
        setError(`Invalid content type "${type}". Must be "movie" or "tv".`);
        setLoading(false);
        return;
      }

      // Parse the ID parameter (could be slug-id or just id)
      const parsedUrl = parseContentUrl(id);
      if (!parsedUrl) {
        setError('Invalid content ID format.');
        setLoading(false);
        return;
      }

      const { id: contentId } = parsedUrl;

      // Parse watch parameter for TV shows
      const watchParam = searchParams.get('watch');
      let season: number | undefined;
      let episode: number | undefined;

      if (type === 'tv' && watchParam) {
        const parsedWatch = parseWatchParam(watchParam);
        if (parsedWatch) {
          season = parsedWatch.season;
          episode = parsedWatch.episode;
        } else {
          setError('Invalid watch parameter format. Use format: s1e5 (season 1, episode 5)');
          setLoading(false);
          return;
        }
      }

      try {
        setLoading(true);
        setError(null);
        
        const contentDetails = await contentService.getDetails(type, contentId);
        setContent(contentDetails);
        setWatchInfo({ season, episode });

        // For TV shows, validate season/episode if provided
        if (type === 'tv' && season !== undefined && episode !== undefined) {
          const targetSeason = contentDetails.seasons?.find(s => s.season_number === season);
          if (!targetSeason) {
            setError(`Season ${season} not found for this TV show.`);
            setLoading(false);
            return;
          }
          if (episode > targetSeason.episode_count) {
            setError(`Episode ${episode} not found in season ${season}. This season has ${targetSeason.episode_count} episodes.`);
            setLoading(false);
            return;
          }
        }

      } catch (err) {
        console.error('Error fetching content for player:', err);
        
        if (err instanceof Error) {
          if (err.message.includes('404') || err.message.includes('not found')) {
            setError('Content not found. This movie or TV show may have been removed.');
          } else if (err.message.includes('network') || err.message.includes('fetch')) {
            setError('Network error. Please check your connection and try again.');
          } else {
            setError('Failed to load content for playback. Please try again later.');
          }
        } else {
          setError('An unexpected error occurred. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContentAndParseWatch();
  }, [type, id, searchParams]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loading size="lg" />
          <p className="text-white mt-4 text-lg">Loading player...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <svg 
              className="w-16 h-16 text-red-500 mx-auto mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
            <h1 className="text-2xl font-bold text-white mb-2">Playback Error</h1>
            <p className="text-gray-400 mb-6">{error}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700"
            >
              Try Again
            </Button>
            {content && (
              <Button
                variant="outline"
                onClick={() => navigate(createContentUrl(content))}
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                Back to Details
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-white mb-2">Content Not Found</h1>
          <p className="text-gray-400 mb-6">
            The requested content could not be loaded for playback.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/')}
            className="bg-red-600 hover:bg-red-700"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const title = contentService.getTitle(content);
  const isMovie = content.media_type === 'movie';
  const isTvShow = content.media_type === 'tv';

  return (
    <div className="min-h-screen bg-black">
      {/* Player Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate(createContentUrl(content))}
                className="text-white hover:bg-gray-800 p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white">{title}</h1>
                {isTvShow && watchInfo.season && watchInfo.episode && (
                  <p className="text-gray-400 text-sm">
                    Season {watchInfo.season}, Episode {watchInfo.episode}
                  </p>
                )}
                {isMovie && (
                  <p className="text-gray-400 text-sm">Movie</p>
                )}
              </div>
            </div>
            
            {/* Player Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                className="text-white hover:bg-gray-800"
                title="Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-gray-800"
                title="Fullscreen"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Container */}
      <div className="relative">
        <div className="bg-black aspect-video flex items-center justify-center">
          {/* Placeholder for actual video player */}
          <div className="text-center">
            <div className="mb-4">
              <svg className="w-24 h-24 text-gray-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg mb-2">Video Player</p>
            <p className="text-gray-500 text-sm">
              {isMovie && 'Movie playback will be implemented here'}
              {isTvShow && watchInfo.season && watchInfo.episode && 
                `S${watchInfo.season}E${watchInfo.episode} playback will be implemented here`
              }
              {isTvShow && (!watchInfo.season || !watchInfo.episode) && 
                'TV show playback will be implemented here'
              }
            </p>
          </div>
        </div>

        {/* Player Overlay Controls (for future implementation) */}
        <div className="absolute inset-0 pointer-events-none">
          {/* This will contain play/pause, progress bar, volume controls, etc. */}
        </div>
      </div>

      {/* Episode Navigation for TV Shows */}
      {isTvShow && content.seasons && watchInfo.season && (
        <div className="bg-gray-900 border-t border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <h3 className="font-semibold">Season {watchInfo.season}</h3>
                <p className="text-gray-400 text-sm">
                  Episode {watchInfo.episode} of {
                    content.seasons.find(s => s.season_number === watchInfo.season)?.episode_count || '?'
                  }
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!watchInfo.episode || watchInfo.episode <= 1}
                  className="border-gray-600 text-white hover:bg-gray-800"
                >
                  Previous Episode
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-white hover:bg-gray-800"
                >
                  Next Episode
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerPage;