import { Router } from 'express';
import { validateToken } from '../controllers/tokenController.js';

const router = Router();

/**
 * GET /api/tokens/validate/:token
 * Validates the provided secure route token
 */
router.get('/validate/:token', validateToken);

export default router;
