import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

/**
 * Fetches the active evaluation template for the given session.
 * Endpoint: GET /api/events/evaluation/template?session=am|pm
 * 
 * @param session 'am' | 'pm' — determines which template row to load
 */
export const fetchEvaluationTemplate = async (session?: string) => {
  const params = session ? `?session=${session}` : '';
  const response = await axios.get(`${API_URL}/events/evaluation/template${params}`);
  return response.data;
};

/**
 * Verifies student attendance for a specific event session.
 * Endpoint: POST /api/events/evaluation/verify
 */
export const verifyStudentAttendance = async (eventId: string, studentId: string, forcedSession?: string, role?: string) => {
  const response = await axios.post(`${API_URL}/events/evaluation/verify`, {
    eventId, // Sent in body now
    student_id: studentId,
    forced_session: forcedSession,
    role
  });
  return response.data;
};

/**
 * Submits evaluation responses for a specific event.
 * Endpoint: POST /api/events/evaluation/submit
 */
export const submitEvaluationResponse = async (
  eventId: string,
  templateId: string,
  registrationId: string,
  responses: Record<string, any>,
  session: string,
  role?: string
) => {
  const response = await axios.post(`${API_URL}/events/evaluation/submit`, {
    eventId, // Sent in body now
    template_id: templateId,
    registration_id: registrationId,
    responses,
    session,
    role,
  });
  return response.data;
};
