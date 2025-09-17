import React from 'react';
import { Content } from '@/types/content.types';
import ContentGrid from '@/components/content/ContentGrid';
import { cn } from '@/utils/cn.utils';
import Button from '@/components/ui/Button';

interface SearchResultsProps {
  results: Content[];
  loading?: boolean;
  error?: string | null;
  query?: string;
  currentPage: number;
  totalPages: number;
  totalResults: number;
  onPageChange?: (page: number) => void;
  onContentClick?: (content: Content) => void;
  className?: string;
  showPagination?: boolean;
  emptyMessage?: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading = false,
  error = null,
  query,
  currentPage,
  totalPages,
  totalResults,
  onPageChange,
  onContentClick,
  className,
  showPagination = true,
  emptyMessage,
}) => {
  // Generate pagination range
  const getPaginationRange = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const rangeWithDots = [];

    // Calculate start and end of range
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);

    // Add first page and dots if needed
    if (start > 1) {
      rangeWithDots.push(1);
      if (start > 2) {
        rangeWithDots.push('...');
      }
    }

    // Add main range
    for (let i = start; i <= end; i++) {
      rangeWithDots.push(i);
    }

    // Add last page and dots if needed
    if (end < totalPages) {
      if (end < totalPages - 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const paginationRange = getPaginationRange();

  // Handle page change
  const handlePageChange = (page: number) => {
    if (onPageChange && page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
      // Scroll to top of results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Custom empty message based on context
  const getEmptyMessage = () => {
    if (emptyMessage) return emptyMessage;
    if (query) return `No results found for "${query}"`;
    return 'No content found';
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Results Header */}
      {!loading && !error && (
        <div className="flex items-center justify-between">
          <div className="text-gray-300">
            {query && totalResults > 0 && (
              <p className="text-sm">
                Showing <span className="font-semibold text-white">{totalResults.toLocaleString()}</span> results
                {query && (
                  <>
                    {' '}for <span className="font-semibold text-white">"{query}"</span>
                  </>
                )}
              </p>
            )}
            {totalResults === 0 && query && (
              <p className="text-sm">
                No results found for <span className="font-semibold text-white">"{query}"</span>
              </p>
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>
      )}

      {/* Search Results Grid */}
      {!loading && !error && (!results || results.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-24 h-24 mx-auto mb-6 text-gray-600">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No Results Found</h3>
          <p className="text-gray-400 max-w-md">{getEmptyMessage()}</p>
        </div>
      ) : (
        <ContentGrid
          content={results}
          loading={loading}
          error={error}
          cardSize="md"
          columns={{
            mobile: 2,
            tablet: 3,
            desktop: 4,
          }}
          showDetails={false}
          onContentClick={onContentClick}
          emptyMessage={getEmptyMessage()}
          loadingCount={12}
          className="min-h-[400px]"
        />
      )}

      {/* Pagination */}
      {showPagination && !loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-8">
          {/* Previous Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-2"
          >
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-1">
            {paginationRange.map((page, index) => {
              if (page === '...') {
                return (
                  <span key={`dots-${index}`} className="px-3 py-2 text-gray-400">
                    ...
                  </span>
                );
              }

              const pageNumber = page as number;
              const isCurrentPage = pageNumber === currentPage;

              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isCurrentPage
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  )}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-3 py-2"
          >
            Next
            <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      )}

      {/* Results Summary for Screen Readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {loading && 'Loading search results...'}
        {error && `Error loading results: ${error}`}
        {!loading && !error && results && results.length > 0 && (
          `Showing ${results.length} of ${totalResults} results${query ? ` for ${query}` : ''}`
        )}
        {!loading && !error && (!results || results.length === 0) && (
          `No results found${query ? ` for ${query}` : ''}`
        )}
      </div>
    </div>
  );
};

export default SearchResults;