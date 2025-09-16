import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchFilters as SearchFiltersType, Genre } from '@/types/content.types';
import { contentService } from '@/services/content.service';
import { cn } from '@/utils/cn.utils';
import Button from '@/components/ui/Button';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  className?: string;
  showAdvanced?: boolean;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  className,
  showAdvanced = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(showAdvanced);
  const [localFilters, setLocalFilters] = useState<SearchFiltersType>(filters);

  // Fetch genres for both movies and TV shows
  const { data: movieGenres = [] } = useQuery({
    queryKey: ['genres', 'movie'],
    queryFn: () => contentService.getGenres('movie'),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  const { data: tvGenres = [] } = useQuery({
    queryKey: ['genres', 'tv'],
    queryFn: () => contentService.getGenres('tv'),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Combine and deduplicate genres
  const allGenres = React.useMemo(() => {
    const genreMap = new Map<number, Genre>();
    
    [...movieGenres, ...tvGenres].forEach(genre => {
      genreMap.set(genre.id, genre);
    });
    
    return Array.from(genreMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [movieGenres, tvGenres]);

  // Generate year options (current year back to 1900)
  const yearOptions = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1900; year--) {
      years.push(year);
    }
    return years;
  }, []);

  // Rating options
  const ratingOptions = [
    { value: 9, label: '9+ Excellent' },
    { value: 8, label: '8+ Very Good' },
    { value: 7, label: '7+ Good' },
    { value: 6, label: '6+ Above Average' },
    { value: 5, label: '5+ Average' },
    { value: 4, label: '4+ Below Average' },
    { value: 3, label: '3+ Poor' },
  ];

  // Sort options
  const sortOptions = [
    { value: 'popularity', label: 'Popularity' },
    { value: 'release_date', label: 'Release Date' },
    { value: 'vote_average', label: 'Rating' },
  ];

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = <K extends keyof SearchFiltersType>(
    key: K,
    value: SearchFiltersType[K]
  ) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Handle genre toggle
  const handleGenreToggle = (genreId: number) => {
    const currentGenres = localFilters.genre || [];
    const newGenres = currentGenres.includes(genreId)
      ? currentGenres.filter(id => id !== genreId)
      : [...currentGenres, genreId];
    
    handleFilterChange('genre', newGenres.length > 0 ? newGenres : undefined);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters: SearchFiltersType = {
      sort_by: 'popularity',
      sort_order: 'desc',
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  // Check if any filters are active
  const hasActiveFilters = React.useMemo(() => {
    return !!(
      localFilters.type ||
      (localFilters.genre && localFilters.genre.length > 0) ||
      localFilters.year ||
      localFilters.rating ||
      (localFilters.sort_by && localFilters.sort_by !== 'popularity') ||
      (localFilters.sort_order && localFilters.sort_order !== 'desc')
    );
  }, [localFilters]);

  return (
    <div className={cn('bg-gray-800/50 rounded-lg border border-gray-700', className)}>
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-white">Filters</h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 text-xs bg-red-600 text-white rounded-full">
              Active
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-gray-400 hover:text-white"
            >
              Clear All
            </Button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
          >
            <svg
              className={cn('h-5 w-5 transition-transform', isExpanded && 'rotate-180')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Content Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Content Type
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => handleFilterChange('type', undefined)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  !localFilters.type
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                )}
              >
                All
              </button>
              <button
                onClick={() => handleFilterChange('type', 'movie')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  localFilters.type === 'movie'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                )}
              >
                Movies
              </button>
              <button
                onClick={() => handleFilterChange('type', 'tv')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  localFilters.type === 'tv'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                )}
              >
                TV Shows
              </button>
            </div>
          </div>

          {/* Genres Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Genres
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {allGenres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreToggle(genre.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                    localFilters.genre?.includes(genre.id)
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  )}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Release Year
            </label>
            <select
              value={localFilters.year || ''}
              onChange={(e) => handleFilterChange('year', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Any Year</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Minimum Rating
            </label>
            <select
              value={localFilters.rating || ''}
              onChange={(e) => handleFilterChange('rating', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Any Rating</option>
              {ratingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Sort By
              </label>
              <select
                value={localFilters.sort_by || 'popularity'}
                onChange={(e) => handleFilterChange('sort_by', e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Sort Order
              </label>
              <select
                value={localFilters.sort_order || 'desc'}
                onChange={(e) => handleFilterChange('sort_order', e.target.value as 'asc' | 'desc')}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;