import { Request, Response } from 'express';
import { supabase } from '../supabase/client.js';

export const submitAttendance = async (req: Request, res: Response) => {
  const { studentId, name, category, token, session: sessionType } = req.body;

  try {
    // 1. Validate Token & Session
    let sessionData = null;

    // 1. Resolve Session (Flexible Lookup)
    let session = null;

    // Try token first
    const { data: sessionByToken } = await supabase
      .from('sessions')
      .select('*')
      .eq('qr_access_token', token)
      .maybeSingle();

    if (sessionByToken) {
      session = sessionByToken;
    } else {
      // Fallback: Smart session lookup
      const isAM = sessionType?.toUpperCase() === 'AM';
      const isEmployee = category === 'employee';
      
      let searchPattern = '%am%';
      if (isEmployee) {
        searchPattern = '%employee%';
      } else if (sessionType?.toUpperCase() === 'PM') {
        searchPattern = '%pm%';
      }
      
      const { data: sessionByMatch } = await supabase
        .from('sessions')
        .select('*')
        .ilike('session_type', searchPattern)
        .eq('is_open', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      session = sessionByMatch;
    }

    if (!session || !session.is_open) {
      return res.status(403).json({
        error: 'Session Not Active',
        message: `No active ${category?.toUpperCase()} session was found. Please ensure the session is toggled to "Open" in the database.`
      });
    }

    // 2. Resolve Participant/Registration
    // ... (rest of step 2 stays the same) ...
    let regQuery = supabase.from('registrations').select('*');
    if (category === 'student') {
      regQuery = regQuery.eq('external_id', studentId);
    } else {
      regQuery = regQuery.eq('full_name', name);
    }

    const { data: registration, error: regError } = await regQuery.maybeSingle();

    if (regError || !registration) {
      return res.status(404).json({
        error: 'Participant Not Registered',
        message: 'We could not find a registration matching these details.'
      });
    }

    // 3. Record Attendance (Robust Upsert Logic)
    const typeLower = (session.session_type || '').toLowerCase();
    // PRIORITIZE employee field first, then PM, then AM
    const sessionTypeField = typeLower.includes('employee') ? 'employee_scanned_at' : 
                             typeLower.includes('pm') ? 'pm_scanned_at' : 
                             'am_scanned_at';

    const now = new Date().toISOString();

    // Check for existing record to prevent duplicates in the SAME session
    const { data: existing } = await supabase
      .from('attendance')
      .select('*')
      .eq('participant_id', registration.id)
      .maybeSingle();

    if (existing && existing[sessionTypeField]) {
      return res.status(400).json({
        error: 'Already Attended',
        message: `Your attendance for the ${session.session_type} is already recorded.`
      });
    }

    // Upsert the record (Match by participant_id)
    const { error: upsertError } = await supabase
      .from('attendance')
      .upsert({
        id: existing?.id, // Use existing ID if we found one
        participant_id: registration.id,
        registration_id: registration.id,
        event_id: session.event_id || registration.event_id || existing?.event_id || null,
        [sessionTypeField]: now
      });

    if (upsertError) {
      console.error('Upsert Error:', upsertError);
      throw upsertError;
    }

    return res.status(201).json({
      message: 'Attendance recorded successfully',
      session: session.session_type,
      column: sessionTypeField
    });

  } catch (error: any) {
    console.error('Attendance Error:', error);
    // Move the specific error message to the 'error' field so it shows in the frontend UI
    const displayError = error.message || 'Internal Server Error';
    return res.status(500).json({
      error: `Server Error: ${displayError}`,
      message: displayError,
      details: error
    });
  }
};
