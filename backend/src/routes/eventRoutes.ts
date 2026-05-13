import { Router } from 'express';
import { getEvaluationTemplate, verifyAttendance, submitEvaluationResponse } from '../controllers/evaluationController.js';

const router = Router();

/**
 * Evaluation Routes (Smart Lookup)
 */
router.get('/evaluation/template', getEvaluationTemplate);
router.post('/evaluation/verify', verifyAttendance);
router.post('/evaluation/submit', submitEvaluationResponse);

/**
 * Legacy/Direct Routes (Keep for compatibility)
 */
router.get('/:eventId/evaluation-template', getEvaluationTemplate);
router.post('/:eventId/verify-attendance', verifyAttendance);
router.post('/:eventId/evaluation-response', submitEvaluationResponse);

export default router;
