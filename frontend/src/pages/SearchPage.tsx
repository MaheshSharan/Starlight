import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SearchBar, SearchFilters, SearchResults } from '@/components/search';
import { useSearch } from '@/hooks/useSearch';
import { SearchFilters as SearchFiltersType, Content } from '@/types/content.types';
import { cn } from '@/utils/cn.utils';

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  
  // Get search state and actions from the hook
  const {
    query,
    filters,
    results,
    currentPage,
    totalPages,
    totalResults,
    isLoading,
    error,
    search,
    setQuery,

    clearFilters,
  } = useSearch();

  // Initialize search from URL parameters
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    const urlType = searchParams.get('type') as 'movie' | 'tv' | undefined;
    const urlGenre = searchParams.get('genre');
    const urlYear = searchParams.get('year');
    const urlRating = searchParams.get('rating');
    const urlSortBy = searchParams.get('sort_by') as any;
    const urlSortOrder = searchParams.get('sort_order') as 'asc' | 'desc' | undefined;
    // const urlPage = parseInt(searchParams.get('page') || '1', 10); // TODO: Implement pagination from URL

    // Build filters from URL
    const urlFilters: SearchFiltersType = {
      type: urlType,
      genre: urlGenre ? urlGenre.split(',').map(g => parseInt(g, 10)) : undefined,
      year: urlYear ? parseInt(urlYear, 10) : undefined,
      rating: urlRating ? parseFloat(urlRating) : undefined,
      sort_by: urlSortBy || 'popularity',
      sort_order: urlSortOrder || 'desc',
    };

    // Update search state if URL has changed
    if (urlQuery !== query || JSON.stringify(urlFilters) !== JSON.stringify(filters)) {
      setQuery(urlQuery);
      if (urlQuery) {
        search(urlQuery, urlFilters);
      }
    }
  }, [searchParams, query, filters, search, setQuery]);

  // Update URL when search state changes
  const updateURL = (newQuery: string, newFilters: SearchFiltersType, page: number = 1) => {
    const params = new URLSearchParams();
    
    if (newQuery) {
      params.set('q', newQuery);
    }
    
    if (newFilters.type) {
      params.set('type', newFilters.type);
    }
    
    if (newFilters.genre && newFilters.genre.length > 0) {
      params.set('genre', newFilters.genre.join(','));
    }
    
    if (newFilters.year) {
      params.set('year', newFilters.year.toString());
    }
    
    if (newFilters.rating) {
      params.set('rating', newFilters.rating.toString());
    }
    
    if (newFilters.sort_by && newFilters.sort_by !== 'popularity') {
      params.set('sort_by', newFilters.sort_by);
    }
    
    if (newFilters.sort_order && newFilters.sort_order !== 'desc') {
      params.set('sort_order', newFilters.sort_order);
    }
    
    if (page > 1) {
      params.set('page', page.toString());
    }

    setSearchParams(params);
  };

  // Handle search from search bar
  const handleSearch = (newQuery: string) => {
    const newFilters = { ...filters };
    updateURL(newQuery, newFilters, 1);
    search(newQuery, newFilters);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    updateURL(query, newFilters, 1);
    if (query) {
      search(query, newFilters);
    }
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    updateURL(query, filters, page);
    if (query) {
      search(query, filters);
    }
  };

  // Handle content click
  const handleContentClick = (content: Content) => {
    navigate(`/content/${content.media_type}/${content.id}`);
  };

  // Clear all filters
  const handleClearFilters = () => {
    clearFilters();
    const clearedFilters: SearchFiltersType = {
      sort_by: 'popularity',
      sort_order: 'desc',
    };
    updateURL(query, clearedFilters, 1);
    if (query) {
      search(query, clearedFilters);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Search</h1>
          
          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar
              value={query}
              onChange={setQuery}
              onSearch={handleSearch}
              placeholder="Search movies and TV shows..."
              showSuggestions={true}
              className="w-full"
            />
          </div>

          {/* Filter Toggle and Results Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  showFilters
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                )}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Filters</span>
                {showFilters && (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              {/* Active filters indicator */}
              {(filters.type || (filters.genre && filters.genre.length > 0) || filters.year || filters.rating) && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Filters active</span>
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Results count */}
            {query && !isLoading && !error && (
              <div className="text-sm text-gray-400">
                {totalResults > 0 ? (
                  <>
                    {totalResults.toLocaleString()} result{totalResults !== 1 ? 's' : ''} found
                  </>
                ) : (
                  'No results found'
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search Filters */}
        {showFilters && (
          <div className="mb-8">
            <SearchFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              showAdvanced={true}
            />
          </div>
        )}

        {/* Search Results */}
        <div className="mb-8">
          {query ? (
            <SearchResults
              results={results}
              loading={isLoading}
              error={error}
              query={query}
              currentPage={currentPage}
              totalPages={totalPages}
              totalResults={totalResults}
              onPageChange={handlePageChange}
              onContentClick={handleContentClick}
              showPagination={true}
            />
          ) : (
            /* Empty state - no search query */
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 text-gray-600">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Start Your Search</h2>
              <p className="text-gray-400 max-w-md mx-auto">
                Enter a movie or TV show title in the search bar above to discover amazing content.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchPage;