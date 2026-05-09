import { Router } from 'express';
import { submitAttendance } from '../controllers/attendanceController.js';

const router = Router();

// Endpoint: POST /api/attendance
router.post('/', submitAttendance);

export default router;
