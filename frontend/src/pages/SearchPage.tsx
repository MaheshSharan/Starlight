import { useSearchParams } from 'react-router-dom';

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        {query && (
          <p className="text-gray-400">
            Showing results for: <span className="text-white font-medium">"{query}"</span>
          </p>
        )}
      </div>
      
      {/* Placeholder for search results */}
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-400">Search functionality will be implemented here</p>
      </div>
    </div>
  );
}

export default SearchPage;