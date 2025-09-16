import { Router } from 'express';
import { searchController } from '@/controllers/search.controller.js';
import { validateSearchQuery } from '@/validators/search.validator.js';

const router = Router();

/**
 * Search Routes
 * All routes include input validation and error handling
 */

// GET /api/search - Multi-search with query and filter support
router.get('/', validateSearchQuery, searchController.search);

// GET /api/search/movies - Movie-specific search
router.get('/movies', validateSearchQuery, searchController.searchMovies);

// GET /api/search/tv - TV show-specific search
router.get('/tv', validateSearchQuery, searchController.searchTVShows);

// GET /api/search/suggestions - Search suggestions/autocomplete
router.get('/suggestions', validateSearchQuery, searchController.getSearchSuggestions);

// GET /api/search/popular-queries - Popular search queries for analytics
router.get('/popular-queries', searchController.getPopularQueries);

export default router;