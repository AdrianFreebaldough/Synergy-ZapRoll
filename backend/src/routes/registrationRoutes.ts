import { Router } from 'express';
import { registerEntry } from '../controllers/registrationController.js';

const router = Router();

// Endpoint: POST /api/register/:category
router.post('/:category', registerEntry);

export default router;
