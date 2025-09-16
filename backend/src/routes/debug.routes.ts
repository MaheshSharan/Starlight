import { Router, Request, Response } from 'express';
import { config } from '@/config/index.js';
import axios from 'axios';

const router = Router();

/**
 * Debug endpoint to check environment variables
 * Only available in development mode
 */
router.get('/env', (req: Request, res: Response) => {
    if (config.nodeEnv !== 'development') {
        return res.status(404).json({ error: 'Not found' });
    }

    res.json({
        nodeEnv: config.nodeEnv,
        tmdbApiKey: config.tmdb.apiKey ? `${config.tmdb.apiKey.substring(0, 8)}...` : 'NOT SET',
        tmdbBaseUrl: config.tmdb.baseUrl,
        databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
        redisUrl: process.env.REDIS_URL ? 'SET' : 'NOT SET',
        port: config.port,
    });
});

/**
 * Test TMDB API connection
 */
router.get('/tmdb-test', async (req: Request, res: Response) => {
    if (config.nodeEnv !== 'development') {
        return res.status(404).json({ error: 'Not found' });
    }

    try {
        // Test with query parameter (like debug endpoint)
        const queryParamResponse = await axios.get(
            `${config.tmdb.baseUrl}/configuration?api_key=${config.tmdb.apiKey}`,
            { timeout: 5000 }
        );

        // Test with Bearer token (like TMDBService)
        const bearerTokenResponse = await axios.get(
            `${config.tmdb.baseUrl}/configuration`,
            { 
                timeout: 5000,
                headers: {
                    'Authorization': `Bearer ${config.tmdb.apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({
            success: true,
            message: 'TMDB API connection successful',
            queryParamMethod: {
                success: true,
                data: queryParamResponse.data
            },
            bearerTokenMethod: {
                success: true,
                data: bearerTokenResponse.data
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'TMDB API connection failed',
            error: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText
        });
    }
});

export default router;