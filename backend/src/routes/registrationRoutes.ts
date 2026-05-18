import { Router } from 'express';
import { registerEntry, lookupRegistration } from '../controllers/registrationController.js';

const router = Router();

// Endpoint: GET /api/register/lookup
router.get('/lookup', lookupRegistration);

// Endpoint: POST /api/register/:category
router.post('/:category', registerEntry);

export default router;
