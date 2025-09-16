function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Starlight</h1>
        <p className="text-gray-400 text-lg mb-8">
          Discover trending movies and TV shows
        </p>
        
        {/* Placeholder for content sections */}
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-left">Trending Movies</h2>
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-400">Content will be loaded here</p>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-left">Popular TV Shows</h2>
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-400">Content will be loaded here</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default HomePage;