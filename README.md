# Starlight Streaming Platform

A modern, high-performance streaming platform built with React, Node.js, and TypeScript. Starlight provides content discovery, streaming capabilities, and a responsive viewing experience without user authentication or tracking.

## Features

- 🎬 Content discovery with trending and popular movies/TV shows
- 🔍 Advanced search functionality with real-time suggestions
- 📱 Responsive design for desktop, tablet, and mobile
- 🎥 Modern video player with quality selection and subtitles
- ⚡ High-performance caching with Redis
- 🔒 Privacy-focused (no user tracking or data collection)
- 🐳 Docker-ready development environment

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and HMR
- **TailwindCSS** for styling
- **Zustand** for state management
- **React Query** for server state management
- **React Router** for navigation

### Backend
- **Node.js** with Express and TypeScript
- **Prisma ORM** for database operations
- **Redis** for caching
- **PostgreSQL** for persistent data
- **Helmet.js** for security headers

### Infrastructure
- **Docker & Docker Compose** for development
- **ESLint & Prettier** for code quality
- **Vitest** for testing

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- TMDB API key (get one at [TMDB](https://www.themoviedb.org/settings/api))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd starlight-streaming-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
   
   Edit the `.env` files and add your TMDB API key.

4. **Start the development environment**
   ```bash
   npm run docker:up
   ```

   This will start:
   - PostgreSQL database on port 5432
   - Redis cache on port 6379
   - Backend API on port 3001
   - Frontend app on port 3000

5. **Initialize the database**
   ```bash
   npm run dev:backend -- db:push
   ```

6. **Open the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database Studio: http://localhost:5555 (run `npm run dev:backend -- db:studio`)

## Development

### Available Scripts

#### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend for production
- `npm run test` - Run tests for both frontend and backend
- `npm run lint` - Lint both frontend and backend
- `npm run format` - Format code with Prettier
- `npm run docker:up` - Start Docker development environment
- `npm run docker:down` - Stop Docker development environment

#### Frontend
- `npm run dev:frontend` - Start frontend development server
- `npm run build:frontend` - Build frontend for production
- `npm run test:frontend` - Run frontend tests

#### Backend
- `npm run dev:backend` - Start backend development server
- `npm run build:backend` - Build backend for production
- `npm run test:backend` - Run backend tests

### Project Structure

```
starlight-streaming-platform/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Route-based page components
│   │   ├── services/       # API services
│   │   ├── stores/         # Zustand state management
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Helper functions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # Data access layer
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API route definitions
│   │   ├── validators/     # Input validation
│   │   └── types/          # TypeScript type definitions
│   ├── prisma/             # Database schema and migrations
│   └── package.json
├── docker-compose.yml       # Docker development environment
└── package.json            # Root package.json for monorepo
```

## API Documentation

The backend provides a RESTful API with the following main endpoints:

- `GET /api/content/trending` - Get trending movies and TV shows
- `GET /api/content/popular` - Get popular content
- `GET /api/content/:type/:id` - Get detailed content information
- `GET /api/search` - Search for movies and TV shows

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

- [TMDB](https://www.themoviedb.org/) for providing the movie and TV show data
- [React](https://reactjs.org/) and [Node.js](https://nodejs.org/) communities
- All the open-source libraries that make this project possible