import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn.utils';
import { useDebounce } from '@/hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api.service';
import { Content } from '@/types/content.types';
import { contentService } from '@/services/content.service';
import { createContentUrl } from '@/utils/slug.utils';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  showSuggestions?: boolean;
  autoFocus?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

// Remove SearchSuggestion interface - we'll use Content objects directly

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search movies and TV shows...",
  className,
  onSearch,
  showSuggestions = true,
  autoFocus = false,
  value: controlledValue,
  onChange: controlledOnChange,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(controlledValue || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce the search query for suggestions
  const debouncedQuery = useDebounce(query, 300);

  // Fetch search suggestions
  const { data: suggestions = [], isLoading: loadingSuggestions } = useQuery({
    queryKey: ['search-suggestions', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim() || debouncedQuery.length < 2) return [];
      
      try {
        const response = await apiService.get<Content[]>(
          `/api/search/suggestions?q=${encodeURIComponent(debouncedQuery)}&limit=5`
        );
        return response;
      } catch (error) {
        // If suggestions fail, return empty array
        return [];
      }
    },
    enabled: showSuggestions && debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setSelectedIndex(-1);
    setShowDropdown(true);
    
    if (controlledOnChange) {
      controlledOnChange(newValue);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const searchQuery = query.trim();
    
    if (searchQuery) {
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        // Navigate to search page with query
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (content: Content) => {
    const suggestionText = content.title || content.name || '';
    setQuery(suggestionText);
    setShowDropdown(false);
    
    if (controlledOnChange) {
      controlledOnChange(suggestionText);
    }
    
    // Navigate directly to content page instead of search page
    const contentForUrl = {
      ...content,
      media_type: content.media_type || (content.title ? 'movie' : 'tv')
    };
    navigate(createContentUrl(contentForUrl));
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    const maxIndex = Math.min(suggestions.length, 5) - 1; // Account for "View all results" option
    const totalOptions = Math.min(suggestions.length, 5) + (suggestions.length > 0 ? 1 : 0); // +1 for "View all results"

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < totalOptions - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex <= maxIndex && suggestions[selectedIndex]) {
            // Click on a suggestion
            handleSuggestionClick(suggestions[selectedIndex]);
          } else if (selectedIndex === totalOptions - 1) {
            // Click on "View all results"
            setShowDropdown(false);
            if (onSearch) {
              onSearch(query);
            } else {
              navigate(`/search?q=${encodeURIComponent(query)}`);
            }
          }
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update local state when controlled value changes
  useEffect(() => {
    if (controlledValue !== undefined) {
      setQuery(controlledValue);
    }
  }, [controlledValue]);

  const shouldShowDropdown = showSuggestions && showDropdown && query.length >= 2 && suggestions.length > 0;

  return (
    <div className={cn('relative w-full max-w-2xl', className)}>
      <form onSubmit={handleSubmit} className="relative">
        {/* Search Input */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowDropdown(true)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={cn(
              'w-full px-4 py-3 pl-12 pr-12 text-white bg-gray-900/90 border border-gray-600',
              'rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500',
              'focus:border-red-500 transition-colors backdrop-blur-sm',
              shouldShowDropdown && 'rounded-b-none border-b-0'
            )}
          />
          
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setShowDropdown(false);
                if (controlledOnChange) {
                  controlledOnChange('');
                }
                inputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Submit Button (hidden, form submission handled by Enter key) */}
        <button type="submit" className="sr-only">
          Search
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {shouldShowDropdown && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute top-full left-0 right-0 z-50 bg-gray-900/95 border border-gray-600',
            'border-t-0 rounded-b-lg shadow-xl backdrop-blur-sm overflow-hidden'
          )}
        >
          {loadingSuggestions ? (
            <div className="px-4 py-3 text-gray-400 text-sm">
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                <span>Loading suggestions...</span>
              </div>
            </div>
          ) : (
            <ul className="py-1">
              {/* Show only first 5 suggestions */}
              {suggestions.slice(0, 5).map((content, index) => (
                <li key={`${content.id}-${content.media_type}-${index}`}>
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick(content)}
                    className={cn(
                      'w-full px-4 py-3 text-left text-white hover:bg-gray-700/50 transition-colors',
                      'flex items-center justify-between group',
                      selectedIndex === index && 'bg-gray-700/50'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Poster Image */}
                      <div className="w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-700">
                        {content.poster_path ? (
                          <img
                            src={contentService.getImageUrl(content.poster_path, 'w200')}
                            alt={content.title || content.name || 'Poster'}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* Content Info */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-medium text-white truncate">
                          {content.title || content.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {content.media_type === 'movie' ? 'Movie' : 'TV Show'}
                          {content.release_date && ` • ${new Date(content.release_date).getFullYear()}`}
                          {content.first_air_date && ` • ${new Date(content.first_air_date).getFullYear()}`}
                        </span>
                      </div>
                    </div>
                    {content.vote_average && (
                      <span className="text-xs text-gray-500">
                        ⭐ {content.vote_average.toFixed(1)}
                      </span>
                    )}
                  </button>
                </li>
              ))}
              
              {/* "View all results" option */}
              {suggestions.length > 0 && (
                <li className="border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDropdown(false);
                      if (onSearch) {
                        onSearch(query);
                      } else {
                        navigate(`/search?q=${encodeURIComponent(query)}`);
                      }
                    }}
                    className={cn(
                      "w-full px-4 py-3 text-left text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors flex items-center space-x-3",
                      selectedIndex === Math.min(suggestions.length, 5) && 'bg-gray-700/50 text-white'
                    )}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-sm">View all results for "{query}"</span>
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;