import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn.utils';
import { useDebounce } from '@/hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api.service';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  showSuggestions?: boolean;
  autoFocus?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

interface SearchSuggestion {
  query: string;
  count?: number;
}

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
        const response = await apiService.get<SearchSuggestion[]>(
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
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowDropdown(false);
    
    if (controlledOnChange) {
      controlledOnChange(suggestion);
    }
    
    if (onSearch) {
      onSearch(suggestion);
    } else {
      navigate(`/search?q=${encodeURIComponent(suggestion)}`);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex].query);
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
              'w-full px-4 py-3 pl-12 pr-12 text-white bg-gray-800/90 border border-gray-600',
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
            'absolute top-full left-0 right-0 z-50 bg-gray-800/95 border border-gray-600',
            'border-t-0 rounded-b-lg shadow-xl backdrop-blur-sm max-h-64 overflow-y-auto'
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
              {suggestions.map((suggestion, index) => (
                <li key={suggestion.query}>
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion.query)}
                    className={cn(
                      'w-full px-4 py-3 text-left text-white hover:bg-gray-700/50 transition-colors',
                      'flex items-center justify-between group',
                      selectedIndex === index && 'bg-gray-700/50'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="text-sm">{suggestion.query}</span>
                    </div>
                    {suggestion.count && (
                      <span className="text-xs text-gray-500">
                        {suggestion.count} results
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;