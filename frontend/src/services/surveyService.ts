import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/**
 * Fetches the active evaluation template (Smart Lookup).
 * Endpoint: GET /api/events/evaluation/template
 */
export const fetchEvaluationTemplate = async () => {
  const response = await axios.get(`${API_URL}/events/evaluation/template`);
  return response.data;
};

/**
 * Verifies student attendance for a specific event session.
 * Endpoint: POST /api/events/evaluation/verify
 */
export const verifyStudentAttendance = async (eventId: string, studentId: string, forcedSession?: string) => {
  const response = await axios.post(`${API_URL}/events/evaluation/verify`, {
    eventId, // Sent in body now
    student_id: studentId,
    forced_session: forcedSession
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
  session: string
) => {
  const response = await axios.post(`${API_URL}/events/evaluation/submit`, {
    eventId, // Sent in body now
    template_id: templateId,
    registration_id: registrationId,
    responses,
    session,
  });
  return response.data;
};
