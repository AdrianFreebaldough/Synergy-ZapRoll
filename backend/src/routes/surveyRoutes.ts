import { Router } from 'express';
import { getSurveyById, submitSurveyResponse } from '../controllers/surveyController.js';

const router = Router();

router.get('/:surveyId', getSurveyById);
router.post('/:surveyId/responses', submitSurveyResponse);

export default router;
