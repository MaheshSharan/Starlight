import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContentStore } from '../stores/content.store';
import { useContent } from '../hooks/useContent';
import { Content } from '../types/content.types';
import { createContentUrl } from '../utils/slug.utils';
import { ContentGrid, HeroSection } from '../components/content';
import { Button } from '../components/ui';

function HomePage() {
  const navigate = useNavigate();
  const {
    trendingMovies,
    trendingTvShows,
    popularMovies,
    popularTvShows,
    topRatedMovies,
    isLoadingTrending,
    isLoadingPopular,
    trendingError,
    popularError,
  } = useContentStore();

  const { fetchTrending, fetchPopular, fetchTopRated } = useContent();

  useEffect(() => {
    // Fetch initial content on component mount
    const loadContent = async () => {
      try {
        // Load content in parallel but handle individual failures gracefully
        const promises = [
          fetchTopRated('movie', 1).catch(err => console.warn('Failed to load top-rated movies:', err)),
          fetchTrending('movie', 1).catch(err => console.warn('Failed to load trending movies:', err)),
          fetchTrending('tv', 1).catch(err => console.warn('Failed to load trending TV shows:', err)),
          fetchPopular('movie', 1).catch(err => console.warn('Failed to load popular movies:', err)),
          fetchPopular('tv', 1).catch(err => console.warn('Failed to load popular TV shows:', err)),
        ];
        
        await Promise.allSettled(promises);
      } catch (error) {
        console.error('Failed to load homepage content:', error);
      }
    };

    loadContent();
  }, [fetchTrending, fetchPopular, fetchTopRated]);

  const handleContentClick = (content: Content) => {
    navigate(createContentUrl(content));
  };

  const handleViewAll = (category: string, type: 'movie' | 'tv') => {
    navigate(`/browse/${category}/${type}`);
  };

  // Get hero content from top-rated movies (best quality for hero)
  const getHeroContent = () => {
    // Prefer top-rated movies with good backdrop images
    const topRatedWithBackdrop = topRatedMovies.filter(movie => 
      movie.backdrop_path && movie.vote_average >= 7.0
    );
    
    if (topRatedWithBackdrop.length > 0) {
      return topRatedWithBackdrop[0];
    }
    
    // Fallback to trending movies
    const trendingWithBackdrop = trendingMovies.filter(movie => 
      movie.backdrop_path
    );
    
    return trendingWithBackdrop.length > 0 ? trendingWithBackdrop[0] : 
           trendingMovies.length > 0 ? trendingMovies[0] : null;
  };

  const heroContent = getHeroContent();
  
  // Show loading if we're still loading trending content OR if we don't have any hero content yet
  const isHeroLoading = isLoadingTrending || (!heroContent && trendingMovies.length === 0 && topRatedMovies.length === 0);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section - Fixed height to prevent layout shift */}
      <div className="relative">
        <HeroSection 
          content={heroContent}
          loading={isHeroLoading}
          onPlayClick={heroContent ? () => handleContentClick(heroContent) : undefined}
          onInfoClick={heroContent ? () => handleContentClick(heroContent) : undefined}
        />
      </div>

      {/* Content Sections */}
      <div className="relative z-10 -mt-32 pb-20">
        <div className="px-4 md:px-8 lg:px-16 space-y-12">
          
          {/* Trending Movies */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Trending Movies</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewAll('trending', 'movie')}
                className="text-red-400 hover:text-red-300"
              >
                View All →
              </Button>
            </div>
            <ContentGrid.Row
              content={trendingMovies.slice(1, 9)} // Skip first item (used in hero)
              loading={isLoadingTrending}
              error={trendingError}
              cardSize="md"
              onContentClick={handleContentClick}
              loadingCount={8}
            />
          </section>

          {/* Popular Movies */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Popular Movies</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewAll('popular', 'movie')}
                className="text-red-400 hover:text-red-300"
              >
                View All →
              </Button>
            </div>
            <ContentGrid.Row
              content={popularMovies.slice(0, 8)}
              loading={isLoadingPopular}
              error={popularError}
              cardSize="md"
              onContentClick={handleContentClick}
              loadingCount={8}
            />
          </section>

          {/* Trending TV Shows */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Trending TV Shows</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewAll('trending', 'tv')}
                className="text-red-400 hover:text-red-300"
              >
                View All →
              </Button>
            </div>
            <ContentGrid.Row
              content={trendingTvShows.slice(0, 8)}
              loading={isLoadingTrending}
              error={trendingError}
              cardSize="md"
              onContentClick={handleContentClick}
              loadingCount={8}
            />
          </section>

          {/* Popular TV Shows */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Popular TV Shows</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewAll('popular', 'tv')}
                className="text-red-400 hover:text-red-300"
              >
                View All →
              </Button>
            </div>
            <ContentGrid.Row
              content={popularTvShows.slice(0, 8)}
              loading={isLoadingPopular}
              error={popularError}
              cardSize="md"
              onContentClick={handleContentClick}
              loadingCount={8}
            />
          </section>

        </div>
      </div>
    </div>
  );
}

export default HomePage;