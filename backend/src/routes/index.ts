import { Router } from 'express';
import contentRoutes from './content.routes.js';
import searchRoutes from './search.routes.js';
import debugRoutes from './debug.routes.js';

const router = Router();

// Mount content routes
router.use('/content', contentRoutes);

// Mount search routes
router.use('/search', searchRoutes);

// Mount debug routes (development only)
router.use('/debug', debugRoutes);

export default router;