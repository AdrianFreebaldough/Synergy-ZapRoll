import { Request, Response } from 'express';
import { supabase } from '../supabase/client.js';

/**
 * GET /api/events/:eventId/evaluation-template
 * 
 * Fetches the active evaluation template for a specific event.
 * This is the endpoint the QR code triggers when scanned.
 */
export const getEvaluationTemplate = async (req: Request, res: Response) => {
  const { eventId } = req.params;

  try {
    const { data: template, error } = await supabase
      .from('evaluation_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Template Fetch Error:', error);
      return res.status(500).json({ error: 'Failed to fetch evaluation template' });
    }

    if (!template) {
      return res.status(404).json({
        error: 'No Active Evaluation',
        message: 'No evaluation form is currently available for this event.'
      });
    }

    return res.json(template);

  } catch (error: any) {
    console.error('Evaluation Template Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * POST /api/events/:eventId/verify-attendance
 * 
 * Verifies that a student was present at the event session.
 * Body: { student_id }
 * 
 * Logic:
 * 1. Find the registration by external_id (student ID)
 * 2. Find their attendance record for this event
 * 3. Auto-detect AM/PM based on current time
 * 4. Check the corresponding session column
 */
export const verifyAttendance = async (req: Request, res: Response) => {
  const eventId = req.params.eventId || req.body.eventId;
  const { student_id, forced_session } = req.body;

  if (!eventId) {
    return res.status(400).json({ error: 'Missing Event ID' });
  }

  if (!student_id) {
    return res.status(400).json({
      error: 'Student ID Required',
      message: 'Please enter your Student ID to continue.'
    });
  }

  try {
    // 1. Find registration by external_id (student ID) for this event
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select('id, full_name, external_id, event_id')
      .eq('external_id', student_id)
      .eq('event_id', eventId)
      .maybeSingle();

    if (regError) {
      console.error('Registration Lookup Error:', regError);
      throw regError;
    }

    if (!registration) {
      return res.status(404).json({
        error: 'Not Registered',
        message: 'No registration was found for this Student ID. Please ensure you are registered for this event before submitting an evaluation.'
      });
    }

    // 2. Find attendance record
    const { data: attendance, error: attError } = await supabase
      .from('attendance')
      .select('*')
      .eq('participant_id', registration.id)
      .maybeSingle();

    if (attError) {
      console.error('Attendance Lookup Error:', attError);
      throw attError;
    }

    if (!attendance) {
      return res.status(403).json({
        error: 'No Attendance Record',
        message: 'We could not find an attendance record for your account. Only participants who were present at the event may submit an evaluation.'
      });
    }

    // 3. Detect session (Token overrides Time)
    let sessionLabel: string;
    let sessionField: string;

    if (forced_session === 'am' || forced_session === 'pm') {
      sessionLabel = forced_session.toUpperCase();
      sessionField = forced_session === 'am' ? 'am_scanned_at' : 'pm_scanned_at';
    } else {
      const currentHour = new Date().getHours();
      const isAfternoon = currentHour >= 12;
      sessionLabel = isAfternoon ? 'PM' : 'AM';
      sessionField = isAfternoon ? 'pm_scanned_at' : 'am_scanned_at';
    }

    // 4. Check if the student was scanned for the relevant session
    const wasPresent = !!attendance[sessionField];

    if (!wasPresent) {
      return res.status(403).json({
        error: `${sessionLabel} Session Attendance Not Found`,
        message: `We could not verify your attendance for the ${sessionLabel} session. Please ensure you were present before submitting an evaluation.`
      });
    }

    // 5. Verified! Return registration info
    return res.status(200).json({
      verified: true,
      registration_id: registration.id,
      full_name: registration.full_name,
      session: sessionLabel
    });

  } catch (error: any) {
    console.error('Verify Attendance Error:', error);
    return res.status(500).json({
      error: error.message || 'Verification failed',
      details: error.details || null
    });
  }
};

/**
 * POST /api/events/:eventId/evaluation-response
 * 
 * Submits a participant's evaluation responses.
 * Body: { template_id, registration_id, responses }
 */
export const submitEvaluationResponse = async (req: Request, res: Response) => {
  const eventId = req.params.eventId || req.body.eventId;
  const { template_id, registration_id, responses, session } = req.body;

  if (!eventId) {
    return res.status(400).json({ error: 'Missing Event ID' });
  }

  if (!template_id || !responses || !registration_id) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'template_id, registration_id, and responses are required.'
    });
  }

  try {
    // Detect column based on provided session (fallback to time)
    let sessionLabel = session?.toLowerCase();
    if (sessionLabel !== 'am' && sessionLabel !== 'pm') {
      sessionLabel = new Date().getHours() >= 12 ? 'pm' : 'am';
    }
    
    const submittedAtField = sessionLabel === 'pm' ? 'pm_eval_submitted_at' : 'am_eval_submitted_at';
    const responsesField = sessionLabel === 'pm' ? 'pm_eval_responses' : 'am_eval_responses';

    // Record or update the evaluation (Upsert logic like attendance)
    const { data: result, error } = await supabase
      .from('evaluation_responses')
      .upsert({
        template_id,
        registration_id,
        [submittedAtField]: new Date().toISOString(),
        [responsesField]: responses
      }, {
        onConflict: 'template_id,registration_id'
      })
      .select();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({
          error: 'Already Submitted',
          message: 'You have already submitted an evaluation for this event.'
        });
      }
      throw error;
    }

    return res.status(201).json({
      message: 'Evaluation submitted successfully',
      data: result[0]
    });

  } catch (error: any) {
    console.error('Submit Evaluation Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to submit evaluation',
      details: error.details || null,
      hint: error.hint || null,
      code: error.code || null
    });
  }
};
