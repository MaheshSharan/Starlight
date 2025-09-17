import { Router } from 'express';
import { contentController } from '@/controllers/content.controller.js';
import { validateContentQuery, validateContentId } from '@/validators/content.validator.js';

const router = Router();

/**
 * Content Discovery Routes
 * All routes include input validation and error handling
 */

// GET /api/content/trending - Get trending content with pagination
router.get('/trending', validateContentQuery, contentController.getTrending);

// GET /api/content/popular - Get popular content with type filtering
router.get('/popular', validateContentQuery, contentController.getPopular);

// GET /api/content/top-rated - Get top-rated content with type filtering
router.get('/top-rated', validateContentQuery, contentController.getTopRated);

// GET /api/content/genres - Get genres for a media type
router.get('/genres', contentController.getGenres);

/**
 * Content Details Routes
 * Routes for detailed content information and related content
 */

// GET /api/content/:type/:id - Get detailed content information
router.get('/:type/:id', validateContentId, contentController.getContentDetails);

// GET /api/content/:type/:id/similar - Get similar content
router.get('/:type/:id/similar', validateContentId, contentController.getSimilarContent);

// GET /api/content/:type/:id/recommendations - Get content recommendations
router.get('/:type/:id/recommendations', validateContentId, contentController.getRecommendations);

// GET /api/content/:type/:id/credits - Get content credits
router.get('/:type/:id/credits', validateContentId, contentController.getContentCredits);

/**
 * TV Show Season/Episode Routes
 * Routes for detailed season and episode information
 */

// GET /api/content/tv/:id/season/:seasonNumber - Get season details
router.get('/tv/:id/season/:seasonNumber', contentController.getSeasonDetails);

// GET /api/content/tv/:id/season/:seasonNumber/episode/:episodeNumber - Get episode details
router.get('/tv/:id/season/:seasonNumber/episode/:episodeNumber', contentController.getEpisodeDetails);

export default router;