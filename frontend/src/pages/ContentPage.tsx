import { useParams } from 'react-router-dom';

function ContentPage() {
  const { type, id } = useParams<{ type: string; id: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Content Details</h1>
        <p className="text-gray-400">
          {type} ID: {id}
        </p>
      </div>
      
      {/* Placeholder for content details */}
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-400">Content details will be displayed here</p>
      </div>
    </div>
  );
}

export default ContentPage;