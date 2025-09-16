import { useParams } from 'react-router-dom';

function PlayerPage() {
  const { type, id } = useParams<{ type: string; id: string }>();

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Video Player</h1>
          <p className="text-gray-400">
            Playing {type} ID: {id}
          </p>
        </div>
        
        {/* Placeholder for video player */}
        <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
          <p className="text-gray-400">Video player will be implemented here</p>
        </div>
      </div>
    </div>
  );
}

export default PlayerPage;