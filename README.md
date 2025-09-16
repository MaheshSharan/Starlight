# Starlight Streaming 

A modern, high-performance streaming platform built with React, Node.js, and TypeScript.
Starlight provides content discovery, streaming capabilities, and a responsive viewing experience without user authentication or tracking.

**Note:** This project has just been started from scratch and is under active development.

## Features

* Content discovery with trending and popular movies/TV shows
* Advanced search functionality with real-time suggestions
* Responsive design for desktop, tablet, and mobile
* Modern video player with quality selection and subtitles
* High-performance caching with Redis
* Privacy-focused (no user tracking or data collection)
* Docker-ready development environment

## Tech Stack

### Frontend

* React 18 with TypeScript
* Vite for build tooling and HMR
* TailwindCSS for styling
* Zustand for state management
* React Query for server state management
* React Router for navigation

### Backend

* Node.js with Express and TypeScript
* Prisma ORM for database operations
* Redis for caching
* PostgreSQL for persistent data
* Helmet.js for security headers

### Infrastructure

* Docker & Docker Compose for development
* ESLint & Prettier for code quality
* Vitest for testing

## Quick Start

### Prerequisites

* Docker and Docker Compose
* TMDB API key (get one at [TMDB](https://www.themoviedb.org/settings/api))
* Node.js 18+ and npm 9+ (optional, for local development without Docker)

### Docker Setup (Recommended)

1. **Clone the repository**

   ```bash
   git clone https://github.com/MaheshSharan/Starlight
   cd starlight
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

   Edit the `.env` files and add your TMDB API key.

3. **Start the application with Docker**

   ```bash
   docker-compose up
   ```

   This will automatically:
   * Build and start PostgreSQL database on port 5432
   * Build and start Redis cache on port 6379
   * Build and start Backend API on port 3001
   * Build and start Frontend app on port 3000
   * Handle all database migrations and setup

4. **Access the application**

   * Frontend: [http://localhost:3000](http://localhost:3000)
   * Backend API: [http://localhost:3001](http://localhost:3001)
   * Health Check: [http://localhost:3001/health](http://localhost:3001/health)

### Local Development Setup (Alternative)

If you prefer to run without Docker:

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start PostgreSQL and Redis locally** (or use Docker for just the databases)

   ```bash
   docker-compose up postgres redis
   ```

3. **Initialize the database**

   ```bash
   npm run dev:backend -- db:push
   ```

4. **Start development servers**

   ```bash
   npm run dev
   ```

5. **Database Studio** (optional)

   ```bash
   npm run dev:backend -- db:studio
   ```

   Access at [http://localhost:5555](http://localhost:5555)

## Development

### Available Scripts

#### Docker Commands

* `docker-compose up` - Start the entire application stack
* `docker-compose up -d` - Start in detached mode (background)
* `docker-compose down` - Stop and remove containers
* `docker-compose logs` - View logs from all services
* `docker-compose logs backend` - View backend logs only

#### Root Level

* `npm run dev` - Start both frontend and backend in development mode (local)
* `npm run build` - Build both frontend and backend for production
* `npm run test` - Run tests for both frontend and backend
* `npm run lint` - Lint both frontend and backend
* `npm run format` - Format code with Prettier

#### Frontend

* `npm run dev:frontend` - Start frontend development server
* `npm run build:frontend` - Build frontend for production
* `npm run test:frontend` - Run frontend tests

#### Backend

* `npm run dev:backend` - Start backend development server
* `npm run build:backend` - Build backend for production
* `npm run test:backend` - Run backend tests

## API Documentation

The backend provides a RESTful API with the following main endpoints:

* `GET /api/content/trending` - Get trending movies and TV shows
* `GET /api/content/popular` - Get popular content
* `GET /api/content/:type/:id` - Get detailed content information
* `GET /api/search` - Search for movies and TV shows

## Environment Variables

### Backend (.env)

```env
TMDB_API_KEY=your_tmdb_api_key_here
DATABASE_URL=postgresql://starlight:starlight_dev_password@localhost:5432/starlight
REDIS_URL=redis://localhost:6379
PORT=3001
NODE_ENV=development
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001/api
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
```

## Testing

Run tests for the entire project:

```bash
npm test
```

Run tests for specific workspace:

```bash
npm run test:frontend
npm run test:backend
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3000, 3001, 5432, and 6379 are available
2. **Docker permission issues**: On Linux, you may need to run Docker commands with `sudo`
3. **Database connection issues**: Wait a few seconds for PostgreSQL to fully start before the backend connects
4. **TMDB API errors**: Verify your API key is correctly set in the environment files

### Useful Commands

```bash
# View running containers
docker ps

# Restart a specific service
docker-compose restart backend

# Rebuild containers after code changes
docker-compose up --build

# Clean up Docker resources
docker-compose down -v
docker system prune
```

## Deployment

### Production Build

```bash
npm run build
```

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

* [TMDB](https://www.themoviedb.org/) for providing the movie and TV show data
* [React](https://reactjs.org/) and [Node.js](https://nodejs.org/) communities
* All the open-source libraries that make this project possible
