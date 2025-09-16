import { Router } from 'express';
import contentRoutes from './content.routes.js';
import searchRoutes from './search.routes.js';

const router = Router();

// Mount content routes
router.use('/content', contentRoutes);

// Mount search routes
router.use('/search', searchRoutes);

export default router;