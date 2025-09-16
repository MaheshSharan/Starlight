import React, { useState } from 'react';
import { Content } from '@/types/content.types';
import ContentCard from './ContentCard';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/cn.utils';

interface SimilarContentProps {
  similar: Content[];
  recommendations: Content[];
  className?: string;
}

const SimilarContent: React.FC<SimilarContentProps> = ({ 
  similar, 
  recommendations, 
  className 
}) => {
  const [activeTab, setActiveTab] = useState<'similar' | 'recommendations'>('similar');
  const [showAll, setShowAll] = useState(false);

  // Determine which content to show based on active tab
  const currentContent = activeTab === 'similar' ? similar : recommendations;
  
  // Limit display to first 12 items initially
  const displayContent = showAll ? currentContent : currentContent.slice(0, 12);

  // Don't render if no content available
  if (similar.length === 0 && recommendations.length === 0) {
    return null;
  }

  return (
    <div className={cn('bg-gray-900/50 rounded-lg p-6', className)}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">More Like This</h2>
        
        {/* Tab Navigation - Only show if both similar and recommendations exist */}
        {similar.length > 0 && recommendations.length > 0 && (
          <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 mb-6">
            <button
              onClick={() => {
                setActiveTab('similar');
                setShowAll(false); // Reset show all when switching tabs
              }}
              className={cn(
                'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                activeTab === 'similar'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              )}
            >
              Similar ({similar.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('recommendations');
                setShowAll(false); // Reset show all when switching tabs
              }}
              className={cn(
                'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                activeTab === 'recommendations'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              )}
            >
              Recommended ({recommendations.length})
            </button>
          </div>
        )}
      </div>

      {/* Content Grid */}
      {currentContent.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {displayContent.map((content) => (
              <ContentCard
                key={`${content.id}-${content.media_type}`}
                content={content}
                size="sm"
                className="hover:scale-105 transition-transform duration-200"
              />
            ))}
          </div>
          
          {/* Show More/Less Button */}
          {currentContent.length > 12 && (
            <div className="text-center mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                {showAll 
                  ? 'Show Less' 
                  : `Show All ${currentContent.length} Items`
                }
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">
            No {activeTab === 'similar' ? 'similar content' : 'recommendations'} available.
          </p>
        </div>
      )}

      {/* Alternative content suggestion if current tab is empty */}
      {currentContent.length === 0 && (
        <div className="text-center py-4">
          {activeTab === 'similar' && recommendations.length > 0 && (
            <Button
              variant="ghost"
              onClick={() => setActiveTab('recommendations')}
              className="text-red-400 hover:text-red-300"
            >
              View Recommendations Instead →
            </Button>
          )}
          {activeTab === 'recommendations' && similar.length > 0 && (
            <Button
              variant="ghost"
              onClick={() => setActiveTab('similar')}
              className="text-red-400 hover:text-red-300"
            >
              View Similar Content Instead →
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default SimilarContent;