import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContentDetails as ContentDetailsType } from '@/types/content.types';
import { contentService } from '@/services/content.service';
import { ContentDetails, CastCrew, SimilarContent } from '@/components/content';
import Loading from '@/components/ui/Loading';
import Button from '@/components/ui/Button';
import { parseContentUrl, validateSlug, createContentUrl } from '@/utils/slug.utils';

function ContentPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  
  const [content, setContent] = useState<ContentDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContentDetails = async () => {
      if (!type || !id) {
        setError('Invalid content parameters');
        setLoading(false);
        return;
      }

      // Validate type parameter
      if (type !== 'movie' && type !== 'tv') {
        setError('Invalid content type. Must be "movie" or "tv".');
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

      const { id: contentId, slug } = parsedUrl;

      try {
        setLoading(true);
        setError(null);
        
        const contentDetails = await contentService.getDetails(type, contentId);
        
        // If we have a slug in the URL, validate it matches the content
        if (slug && !validateSlug(contentDetails, slug)) {
          // Redirect to the correct URL with the proper slug
          const correctUrl = createContentUrl(contentDetails);
          navigate(correctUrl, { replace: true });
          return;
        }
        
        // If we only have an ID (old format), redirect to the new format with slug
        if (!slug) {
          const correctUrl = createContentUrl(contentDetails);
          navigate(correctUrl, { replace: true });
          return;
        }
        
        setContent(contentDetails);
      } catch (err) {
        console.error('Error fetching content details:', err);
        
        if (err instanceof Error) {
          // Handle specific error types
          if (err.message.includes('404') || err.message.includes('not found')) {
            setError('Content not found. This movie or TV show may have been removed or the ID is incorrect.');
          } else if (err.message.includes('network') || err.message.includes('fetch')) {
            setError('Network error. Please check your connection and try again.');
          } else {
            setError('Failed to load content details. Please try again later.');
          }
        } else {
          setError('An unexpected error occurred. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContentDetails();
  }, [type, id, navigate]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loading size="lg" />
          <p className="text-white mt-4 text-lg">Loading content details...</p>
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
            <h1 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h1>
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

  // Content not found (shouldn't happen if API is working correctly)
  if (!content) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-white mb-2">Content Not Found</h1>
          <p className="text-gray-400 mb-6">
            The requested {type} with ID {id} could not be found.
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

  return (
    <div className="min-h-screen bg-black">
      {/* Main Content Details */}
      <ContentDetails content={content} />
      
      {/* Cast & Crew Section */}
      {content.credits && (content.credits.cast.length > 0 || content.credits.crew.length > 0) && (
        <div className="container mx-auto px-4 py-8">
          <CastCrew credits={content.credits} />
        </div>
      )}
      
      {/* Similar Content Section */}
      {(content.similar.length > 0 || content.recommendations.length > 0) && (
        <div className="container mx-auto px-4 pb-8">
          <SimilarContent 
            similar={content.similar} 
            recommendations={content.recommendations} 
          />
        </div>
      )}
      
      {/* Back to Top Button */}
      <div className="container mx-auto px-4 pb-8">
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="border-gray-600 text-white hover:bg-gray-800"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Back to Top
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ContentPage;