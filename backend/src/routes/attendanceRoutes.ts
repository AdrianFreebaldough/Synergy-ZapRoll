import { Router } from 'express';
import { submitAttendance, posterLogout } from '../controllers/attendanceController.js';

const router = Router();

// Endpoint: POST /api/attendance
router.post('/', submitAttendance);

// Endpoint: POST /api/attendance/poster-logout
router.post('/poster-logout', posterLogout);

export default router;
